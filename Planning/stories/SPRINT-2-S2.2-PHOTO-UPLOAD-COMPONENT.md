# S2.2: Photo Upload Component

**Sprint**: Sprint 2 - Worker App Completion
**Story Points**: 3
**Priority**: HIGH
**Estimated Time**: 1 day
**Status**: ✅ COMPLETED (Pre-existing implementation)

---

## User Story

**As a** worker (cleaner)
**I want** to upload before/after photos when completing jobs
**So that** I can provide proof of work and document property condition

---

## Description

Create a reusable photo upload component that allows workers to:
- Capture photos using device camera (mobile)
- Upload photos from gallery (mobile/desktop)
- Compress photos before upload to save bandwidth and storage
- Upload to AWS S3 via API
- Display uploaded photos in a gallery view
- Label photos as "Before" or "After"

This component will be used in:
1. Job completion flow (S2.1)
2. Issue reporting flow (S2.3)
3. Future features (maintenance jobs, property inspections)

---

## Acceptance Criteria

### Functional Requirements

**Photo Capture**:
- [ ] Component renders "Add Photo" button
- [ ] On mobile: Opens camera when clicked
- [ ] On desktop: Opens file picker
- [ ] Supports multiple photo upload (up to 10 photos per job)
- [ ] Shows preview thumbnail immediately after capture
- [ ] Allows retake/delete before upload

**Photo Upload**:
- [ ] Compress photo to <2MB before upload (client-side)
- [ ] Maintain aspect ratio during compression
- [ ] Upload to S3 via `POST /api/photos/upload`
- [ ] Show upload progress (0-100%)
- [ ] Handle upload failures gracefully (retry option)
- [ ] Store S3 URL in database (link to CleaningJob)

**Gallery View**:
- [ ] Display uploaded photos in grid (2 columns on mobile, 4 on desktop)
- [ ] Each photo shows:
  - Thumbnail preview
  - Label ("Before" or "After")
  - Delete button (before job completion)
  - Upload status (uploading, uploaded, failed)
- [ ] Click photo to view full-size (lightbox modal)
- [ ] Swipe between photos in lightbox (mobile)

**Photo Labeling**:
- [ ] First photos default to "Before"
- [ ] Toggle to switch to "After"
- [ ] Visual distinction between Before/After (color badge)
- [ ] At least 1 before photo required for completion (optional enforcement)

**Error Handling**:
- [ ] If camera unavailable: "Camera not available. Please use file picker."
- [ ] If upload fails: "Upload failed. Check your connection and try again."
- [ ] If file too large: "Photo must be under 10MB. Try again."
- [ ] If S3 quota exceeded: "Storage limit reached. Contact support."

### Non-Functional Requirements

**Performance**:
- [ ] Photo compression completes in <2 seconds (client-side)
- [ ] Upload completes in <5 seconds on 4G network
- [ ] Multiple uploads happen in parallel (max 3 concurrent)
- [ ] Gallery renders smoothly with 20+ photos

**File Constraints**:
- [ ] Accept only image formats: JPEG, PNG, HEIC (iOS)
- [ ] Maximum file size: 10MB (before compression)
- [ ] Compressed size: <2MB
- [ ] Minimum resolution: 640x480 (to ensure quality)

**Mobile Optimization**:
- [ ] Works on iOS Safari (camera integration)
- [ ] Works on Android Chrome (camera integration)
- [ ] Handles offline gracefully (queue uploads when back online - optional)
- [ ] Low memory usage (release captured image data after compression)

**Accessibility**:
- [ ] Photo upload button keyboard accessible
- [ ] Alt text support for uploaded photos
- [ ] Screen reader announces upload status

---

## Technical Specification

### Component Structure

```typescript
// apps/web-worker/src/components/PhotoUpload.tsx
import React, { useState, useRef } from 'react';
import { Button, Spinner } from '@rightfit/ui-core';
import { compressImage, uploadPhoto } from '../lib/photo-utils';
import { PhotoGallery } from './PhotoGallery';

interface Photo {
  id: string;
  url?: string;
  file?: File;
  label: 'before' | 'after';
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  progress: number;
}

interface PhotoUploadProps {
  jobId: string;
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
  requireBefore?: boolean;
}

export function PhotoUpload({
  jobId,
  onPhotosChange,
  maxPhotos = 10,
  requireBefore = true
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check photo limit
    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    // Create pending photo entries
    const newPhotos: Photo[] = files.map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      file,
      label: photos.length === 0 ? 'before' : 'after', // First photos are "before"
      status: 'pending',
      progress: 0,
    }));

    setPhotos([...photos, ...newPhotos]);

    // Upload photos
    for (const photo of newPhotos) {
      uploadPhotoToS3(photo);
    }
  };

  const uploadPhotoToS3 = async (photo: Photo) => {
    if (!photo.file) return;

    try {
      // Update status to uploading
      updatePhotoStatus(photo.id, { status: 'uploading', progress: 0 });

      // Compress image
      const compressedBlob = await compressImage(photo.file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        maxSizeKB: 2000,
      });

      // Upload to S3 via API
      const formData = new FormData();
      formData.append('photo', compressedBlob, photo.file.name);
      formData.append('job_id', jobId);
      formData.append('label', photo.label);

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update photo with S3 URL
      updatePhotoStatus(photo.id, {
        status: 'uploaded',
        progress: 100,
        url: data.url,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      updatePhotoStatus(photo.id, {
        status: 'failed',
        progress: 0,
      });
    }
  };

  const updatePhotoStatus = (photoId: string, updates: Partial<Photo>) => {
    setPhotos((prev) => {
      const updated = prev.map((p) =>
        p.id === photoId ? { ...p, ...updates } : p
      );
      onPhotosChange(updated);
      return updated;
    });
  };

  const handleDelete = (photoId: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      onPhotosChange(updated);
      return updated;
    });
  };

  const handleToggleLabel = (photoId: string) => {
    setPhotos((prev) => {
      const updated = prev.map((p) =>
        p.id === photoId
          ? { ...p, label: p.label === 'before' ? 'after' : 'before' }
          : p
      );
      onPhotosChange(updated);
      return updated;
    });
  };

  const canAddMore = photos.length < maxPhotos;
  const hasBeforePhoto = photos.some((p) => p.label === 'before' && p.status === 'uploaded');

  return (
    <div className="photo-upload">
      {/* Upload Button */}
      {canAddMore && (
        <div className="upload-button-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic"
            capture="environment"
            multiple
            onChange={handleCapture}
            style={{ display: 'none' }}
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            icon="📷"
          >
            Add Photo ({photos.length}/{maxPhotos})
          </Button>
        </div>
      )}

      {/* Validation Message */}
      {requireBefore && !hasBeforePhoto && photos.length > 0 && (
        <p className="validation-message">
          Please upload at least one "Before" photo
        </p>
      )}

      {/* Photo Gallery */}
      <PhotoGallery
        photos={photos}
        onDelete={handleDelete}
        onToggleLabel={handleToggleLabel}
      />
    </div>
  );
}
```

### Photo Compression Utility

```typescript
// apps/web-worker/src/lib/photo-utils.ts

interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxSizeKB: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        if (width > options.maxWidth || height > options.maxHeight) {
          const ratio = Math.min(
            options.maxWidth / width,
            options.maxHeight / height
          );
          width *= ratio;
          height *= ratio;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            // Check size
            const sizeKB = blob.size / 1024;
            if (sizeKB <= options.maxSizeKB) {
              resolve(blob);
            } else {
              // Try again with lower quality
              const newQuality = Math.max(0.5, options.quality - 0.1);
              compressImage(file, { ...options, quality: newQuality })
                .then(resolve)
                .catch(reject);
            }
          },
          'image/jpeg',
          options.quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
```

### API Endpoint

```typescript
// apps/api/src/routes/photos.ts
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/upload', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    const { job_id, label } = req.body;

    // Additional compression with Sharp (backend optimization)
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate S3 key
    const timestamp = Date.now();
    const filename = `jobs/${job_id}/${label}-${timestamp}.jpg`;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME || 'rightfit-production-photos',
      Key: filename,
      Body: compressedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read' as const,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate public URL
    const url = `https://${uploadParams.Bucket}.s3.amazonaws.com/${filename}`;

    // Save to database
    const photo = await prisma.photo.create({
      data: {
        url,
        filename,
        label,
        cleaning_job_id: job_id,
        uploaded_by_user_id: req.user.id,
      },
    });

    res.json({ id: photo.id, url });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});
```

### Database Schema

```prisma
// packages/database/prisma/schema.prisma

model Photo {
  id                 String        @id @default(uuid())
  url                String        // S3 URL
  filename           String        // S3 key
  label              String?       // "before" | "after" | custom
  cleaning_job_id    String?
  maintenance_job_id String?
  issue_report_id    String?
  uploaded_by_user_id String
  created_at         DateTime      @default(now())

  cleaning_job       CleaningJob?      @relation(fields: [cleaning_job_id], references: [id], onDelete: Cascade)
  maintenance_job    MaintenanceJob?   @relation(fields: [maintenance_job_id], references: [id], onDelete: Cascade)
  uploaded_by        User              @relation(fields: [uploaded_by_user_id], references: [id])

  @@index([cleaning_job_id])
  @@index([maintenance_job_id])
  @@index([uploaded_by_user_id])
}
```

---

## Implementation Steps

### Step 1: Setup S3 Bucket (30 minutes)

```bash
# Create S3 bucket via AWS Console or CLI
aws s3 mb s3://rightfit-production-photos

# Set bucket policy (public read for photos)
aws s3api put-bucket-policy --bucket rightfit-production-photos --policy file://bucket-policy.json

# Configure CORS
aws s3api put-bucket-cors --bucket rightfit-production-photos --cors-configuration file://cors.json
```

**bucket-policy.json**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::rightfit-production-photos/*"
    }
  ]
}
```

**cors.json**:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Step 2: Install Dependencies (15 minutes)

```bash
# Backend
cd apps/api
pnpm add @aws-sdk/client-s3 multer sharp
pnpm add -D @types/multer

# Frontend
cd apps/web-worker
pnpm add browser-image-compression
```

### Step 3: Create PhotoUpload Component (3 hours)

1. Create `PhotoUpload.tsx` component
2. Implement camera capture (mobile)
3. Implement file picker (desktop)
4. Add compression logic
5. Integrate upload API
6. Create PhotoGallery sub-component
7. Add styling with CSS

### Step 4: Implement API Endpoint (1.5 hours)

1. Add `/api/photos/upload` route
2. Setup multer middleware
3. Integrate S3 upload
4. Add Sharp compression
5. Save photo metadata to database
6. Return S3 URL

### Step 5: Database Migration (15 minutes)

```bash
cd packages/database
npx prisma migrate dev --name add_photo_model
npx prisma generate
```

### Step 6: Testing (2 hours)

**Test on iOS Safari**:
- Camera opens correctly
- Photo compresses to <2MB
- Upload completes successfully
- Gallery displays photo

**Test on Android Chrome**:
- Same as iOS

**Test on Desktop**:
- File picker opens
- Multiple file upload works

**Test Error Cases**:
- No internet (upload queued - optional)
- S3 failure (retry works)
- Large file (compression works)

---

## Definition of Done

- [ ] PhotoUpload component created and styled
- [ ] Camera integration works on iOS/Android
- [ ] File picker works on desktop
- [ ] Photos compress to <2MB client-side
- [ ] S3 upload successful via API
- [ ] Photo gallery displays uploaded photos
- [ ] Before/After labeling works
- [ ] Delete functionality works (before job completion)
- [ ] Error handling implemented
- [ ] Tested on 2+ mobile devices
- [ ] S3 bucket configured correctly
- [ ] Database migration applied
- [ ] All acceptance criteria met
- [ ] Code reviewed
- [ ] Committed to Git with message: "feat(web-worker): implement photo upload with S3 integration"

---

## Testing Instructions

### Manual Test Steps

**Test 1: Photo Upload Happy Path (Mobile)**
1. Login as worker on mobile device (iOS)
2. Navigate to job details
3. Click "Complete Job"
4. In completion modal, click "Add Photo"
5. Camera opens
6. Take photo
7. Photo appears in gallery with "Before" label
8. Click "Add Photo" again
9. Take second photo
10. Photo appears with "After" label
11. Upload progress shows 0-100%
12. Both photos show "Uploaded" status

**Expected**: ✅ Photos uploaded successfully

**Test 2: Photo Compression**
1. Take high-res photo (5MB+)
2. Upload via component
3. Check network tab for upload size
4. Verify uploaded file <2MB

**Expected**: ✅ Compression reduces file size

**Test 3: Gallery Interaction**
1. Upload 5 photos
2. Click photo thumbnail
3. Lightbox opens with full-size photo
4. Swipe to next photo (mobile)
5. Close lightbox
6. Toggle label from "Before" to "After"
7. Label updates in gallery

**Expected**: ✅ All interactions work

---

## Dependencies

**Depends On**:
- Sprint 1 (component library)
- AWS S3 account and credentials
- Sharp library (backend image processing)

**Blocks**:
- S2.1 (Job Completion Modal) - Needs photos for complete workflow
- S2.3 (Issue Reporting) - Reuses PhotoUpload component

---

## Notes

- S3 bucket must be created before development starts
- Consider environment-specific buckets (dev, staging, prod)
- Photo compression on client saves bandwidth and reduces S3 costs
- Backend compression with Sharp provides additional optimization
- HEIC format support important for iOS (converts to JPEG)
- Gallery view should be lightweight (thumbnails, lazy load full-size)
- Consider adding photo orientation correction (EXIF data)

---

## Resources

- [AWS S3 SDK Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Multer Middleware](https://github.com/expressjs/multer)
- [HTML5 Camera API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

---

**Created**: November 8, 2025
**Last Updated**: November 8, 2025
**Assigned To**: Full-stack Developer
**Sprint**: Sprint 2 - Worker App Completion
