# Story 004: Photo Management with AI Quality Checks

**Epic:** Media & AI Features
**Priority:** HIGH
**Sprint:** Sprint 2 (Basic Upload), Sprint 5 (AI Integration)
**Story Points:** 13
**Status:** To Do

---

## User Story

**As a** landlord
**I want to** capture and upload photos for work orders with automatic quality checks
**So that** I have clear visual evidence of maintenance issues without uploading blurry or dark photos

---

## Acceptance Criteria

### AC-4.1: Photo Capture (Mobile)
- **When** user taps "Add Photo" on work order form
- **Then** show ActionSheet: "Take Photo" | "Choose from Gallery" | "Cancel"
- **And** use expo-camera for camera OR expo-image-picker for gallery
- **And** compress image to max 1920x1080px, JPEG quality 0.85, ≤1MB file size
- **And** display photo thumbnail in photo grid
- **And** allow up to 10 photos per work order

### AC-4.2: Photo Upload (Online)
- **When** user submits work order with photos
- **Then** for each photo:
  - Submit to `POST /api/photos/upload` (multipart/form-data)
  - API uploads to S3: `rightfit-photos-{env}/{tenant_id}/{uuid}.jpg`
  - API stores metadata in database
- **And** display ProgressBar during upload
- **And** return uploaded_url, file metadata
- **On** failure, show error with retry option

### AC-4.3: AI Quality Checks (Google Vision API)
- **Given** photo uploaded to S3
- **When** API receives upload
- **Then** trigger async job:
  1. Send S3 URL to Google Vision API (IMAGE_PROPERTIES feature)
  2. Calculate scores:
     - brightness_score: 0-100 (40-80 = good, <20 or >90 = bad)
     - overall_quality_score: brightness * 0.6 + blur * 0.4
  3. Update photo record with scores and ai_checked_at
- **If** overall_quality_score < 50:
  - Send push notification: "Photo may be too dark/blurry. Tap to retake."
- **And** display quality indicator:
  - 80-100: Green "High quality" badge
  - 50-79: Orange "Acceptable quality" badge
  - 0-49: Red "Poor quality - retake" badge

### AC-4.4: Photo Gallery Display
- **Given** work order has photos
- **Then** display horizontal ScrollView with 100x100px thumbnails (borderRadius: 8)
- **And** show photo count badge: "[N] photos"
- **When** user taps thumbnail
- **Then** open full-screen viewer (react-native-image-viewing):
  - Swipe left/right to navigate
  - Pinch-to-zoom enabled
  - Quality score badge overlay (top-right)
  - Actions: Delete | Share

### AC-4.5: Photo Deletion
- **Given** user viewing photo
- **When** user taps "Delete Photo" button
- **Then** show confirmation: "Delete this photo? This cannot be undone."
- **On** confirm:
  - Submit to `DELETE /api/photos/:id`
  - API soft-deletes (set deleted_at, keep in S3 for audit)
  - Remove from UI immediately
  - Display SnackBar: "Photo deleted"

---

## Edge Cases

- **User uploads very dark photo (brightness < 20)**
  - Expected: AI detects, sends push notification with retake suggestion

- **User uploads 10 photos while offline**
  - Expected: All 10 queue for sync, upload sequentially with progress indicator

- **Photo upload fails due to S3 outage**
  - Expected: Retry up to 3 times with exponential backoff, then show error

- **Google Vision API timeout**
  - Expected: Photo saved with ai_quality_score=NULL, no notification sent

- **Device storage full**
  - Expected: Show error: "Unable to save photo. Free up device storage."

---

## Technical Implementation Notes

### API Endpoint
```javascript
POST /api/photos/upload
Content-Type: multipart/form-data

// Request
{
  file: <binary>,
  work_order_id: 'uuid'
}

// Response (201 Created)
{
  id: 'uuid',
  tenant_id: 'uuid',
  work_order_id: 'uuid',
  uploaded_url: 'https://cdn.rightfitservices.com/photos/tenant-uuid/photo-uuid.jpg',
  file_size_bytes: 524288,
  width_px: 1920,
  height_px: 1080,
  ai_quality_score: null, // Computed async
  ai_brightness_score: null,
  ai_checked_at: null,
  created_at: '2025-10-27T14:35:00Z'
}
```

### Database Model
```prisma
model Photo {
  id                String    @id @default(uuid())
  tenant_id         String
  work_order_id     String
  uploaded_url      String    @db.VarChar(500)
  file_size_bytes   Int
  width_px          Int?
  height_px         Int?
  ai_quality_score  Decimal?  @db.Decimal(5, 2)
  ai_brightness_score Decimal? @db.Decimal(5, 2)
  ai_blur_score     Decimal?  @db.Decimal(5, 2)
  ai_checked_at     DateTime?
  created_at        DateTime  @default(now())
  deleted_at        DateTime?

  work_order        WorkOrder @relation(fields: [work_order_id], references: [id])
}
```

### Google Vision API Integration
```javascript
// apps/api/src/services/photoQualityService.js
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient()

async function analyzePhoto(imageUrl) {
  const [result] = await client.imageProperties(imageUrl)
  const properties = result.imagePropertiesAnnotation

  // Calculate brightness score (0-100)
  const dominantColor = properties.dominantColors.colors[0]
  const avgLuminance = (dominantColor.color.red + dominantColor.color.green + dominantColor.color.blue) / 3
  const brightnessScore = (avgLuminance / 255) * 100

  // For MVP, blur score is placeholder (add laplacian variance later)
  const blurScore = 70 // Default acceptable

  const qualityScore = (brightnessScore * 0.6) + (blurScore * 0.4)

  return {
    brightness_score: brightnessScore,
    blur_score: blurScore,
    overall_quality_score: qualityScore
  }
}
```

### Image Compression (Mobile)
```typescript
// apps/mobile/src/utils/imageCompression.ts
import * as ImageManipulator from 'expo-image-manipulator'

export async function compressImage(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920, height: 1080 } }], // Max dimensions
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
  )

  // Check file size
  const fileInfo = await FileSystem.getInfoAsync(result.uri)
  if (fileInfo.size > 1024 * 1024) { // > 1MB
    // Compress more aggressively
    return await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1280, height: 720 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    )
  }

  return result
}
```

### S3 Upload Configuration
```javascript
// apps/api/src/services/s3Service.js
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

async function uploadPhoto(file, tenantId) {
  const key = `${tenantId}/${uuidv4()}.jpg`

  await s3.putObject({
    Bucket: process.env.S3_BUCKET_PHOTOS,
    Key: key,
    Body: file.buffer,
    ContentType: 'image/jpeg',
    ACL: 'private', // Serve via CloudFront signed URLs
    Metadata: {
      tenant_id: tenantId
    }
  }).promise()

  return {
    uploaded_url: `https://cdn.rightfitservices.com/photos/${key}`,
    file_size_bytes: file.size
  }
}
```

---

## Testing Checklist

### Sprint 2: Basic Photo Upload
- [ ] Take photo with camera → Photo captured and compressed
- [ ] Choose photo from gallery → Photo selected
- [ ] Upload photo online → Appears in S3 bucket
- [ ] Upload progress indicator displays
- [ ] Photo thumbnail displays in work order
- [ ] Full-screen photo viewer works (swipe, zoom)
- [ ] Delete photo → Soft-deleted from database
- [ ] Upload 10 photos → All upload successfully
- [ ] Upload while offline → Photos queued for sync

### Sprint 5: AI Quality Checks
- [ ] Upload dark photo (brightness < 20) → Push notification sent
- [ ] Upload bright photo (brightness > 90) → Push notification sent
- [ ] Upload normal photo (brightness 40-80) → No notification
- [ ] Quality badge displays correctly (green/orange/red)
- [ ] Quality score shown in photo detail (e.g., 78/100)
- [ ] Google Vision API timeout → Photo saved without score
- [ ] AI check runs asynchronously (doesn't block upload)
- [ ] Retake photo after quality alert → New photo has better score

---

## Dependencies

- **Blocked By:** Work Order Management (Story 002)
- **Requires:**
  - `expo-camera`
  - `expo-image-picker`
  - `expo-image-manipulator`
  - `react-native-image-viewing`
  - `@google-cloud/vision`
  - AWS S3 bucket configured

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Photo upload API endpoint working
- [ ] S3 integration complete
- [ ] Image compression working (<1MB)
- [ ] Google Vision API integration complete
- [ ] Quality scoring algorithm implemented
- [ ] Push notifications for poor quality photos
- [ ] Full-screen photo viewer implemented
- [ ] Photo deletion (soft delete)
- [ ] Unit tests for compression and scoring
- [ ] Integration tests for upload flow
- [ ] Manual testing checklist completed
- [ ] Code reviewed and merged
- [ ] Deployed to dev environment
