# Photo Upload & Display Fix Plan

## Current Problem
- Worker issue photos timeout with `ERR_CONNECTION_TIMED_OUT`
- Photos stored with absolute URLs: `http://192.168.0.17:3001/uploads/...`
- These URLs are inaccessible from worker app running on different network

## Working Pattern (from web-cleaning/WorkerDetails.tsx)

### Frontend Implementation
```typescript
// API Config
const API_BASE_URL = 'http://localhost:3001'

// Photo Upload
const uploadPhoto = async (workerId: string, file: File) => {
  const formData = new FormData()
  formData.append('photo', file)

  const response = await api.post<{ data: { photo_url: string } }>(
    `/api/workers/${workerId}/photo`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return response.data.data
}

// Photo Display
<img src={photoPreview} /> // Uses photo_url directly from API
```

### Key Success Factors
1. **Centralized API_BASE_URL** - All apps use same localhost:3001
2. **Relative paths from API** - Photos stored as `/uploads/tenants/...`
3. **Client constructs full URL** - `${API_BASE_URL}${photo_path}`

## Root Cause Analysis

### Issue 1: Existing Photos Have Absolute URLs
Database contains: `http://192.168.0.17:3001/uploads/tenants/tenant-cleaning-test/photos/xxx.jpeg`

**Solution**: Need migration to convert absolute URLs to relative paths

### Issue 2: Photo Service Was Using Network IP
PhotosService.ts line 141 was using `API_BASE_URL` from env (set to 192.168.0.17:3001)

**Status**: ✅ FIXED - Now stores relative paths `/uploads/...`

### Issue 3: Worker App Not Constructing Full URLs Properly
**Status**: ✅ FIXED - Added `getPhotoUrl()` helper function

## Complete Fix Plan

### Phase 1: Database Migration (CRITICAL)
**File**: `/scripts/migrate-photo-urls.ts`

```typescript
import { prisma } from '@rightfit/database'

async function migratePhotoUrls() {
  // Convert absolute URLs to relative paths
  const absoluteUrlPattern = /^https?:\/\/[^\/]+(.+)$/

  // 1. Migrate worker_issue_reports.photos (JSON array)
  const issues = await prisma.workerIssueReport.findMany({
    where: { photos: { not: { equals: [] } } }
  })

  for (const issue of issues) {
    const updatedPhotos = issue.photos.map(photo => {
      if (photo.startsWith('http')) {
        const match = photo.match(absoluteUrlPattern)
        return match ? match[1] : photo
      }
      return photo
    })

    await prisma.workerIssueReport.update({
      where: { id: issue.id },
      data: { photos: updatedPhotos }
    })
  }

  // 2. Migrate workers.photo_url
  await prisma.$executeRaw`
    UPDATE workers
    SET photo_url = REGEXP_REPLACE(photo_url, '^https?://[^/]+', '')
    WHERE photo_url ~ '^https?://'
  `

  // 3. Migrate photos.photo_url and s3_url
  await prisma.$executeRaw`
    UPDATE photos
    SET photo_url = REGEXP_REPLACE(photo_url, '^https?://[^/]+', ''),
        s3_url = REGEXP_REPLACE(s3_url, '^https?://[^/]+', '')
    WHERE photo_url ~ '^https?://' OR s3_url ~ '^https?://'
  `
}
```

**Run**: `npm run db:migrate-photos`

### Phase 2: Standardize API Configuration

**File**: All web apps need consistent API config

#### web-worker/src/config/api.ts
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export function getPhotoUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`
}
```

#### web-cleaning/src/lib/api.ts
```typescript
export const API_BASE_URL = 'http://localhost:3001'
export const getPhotoUrl = (path: string) => path?.startsWith('http') ? path : `${API_BASE_URL}${path}`
```

#### web-maintenance/src/lib/api.ts
```typescript
export const API_BASE_URL = 'http://localhost:3001'
export const getPhotoUrl = (path: string) => path?.startsWith('http') ? path : `${API_BASE_URL}${path}`
```

### Phase 3: Update All Photo Displays

**Locations to Update:**

1. ✅ **web-worker/src/pages/issues/MyReportedIssues.tsx**
   - Line 266: `src={getPhotoUrl(photo)}`

2. ✅ **web-worker/src/components/jobs/IssueDetailsModal.tsx**
   - Line 253: `src={isNew ? photo : getPhotoUrl(photo)}`

3. **web-cleaning/src/pages/WorkerDetails.tsx**
   - Line 407: `src={getPhotoUrl(photoPreview)}`

4. **web-cleaning/src/components/WorkerReports.tsx** (if exists)
   - Update any photo displays

5. **web-maintenance/** - Search for all `<img` tags displaying photos

### Phase 4: Environment Variables

**Create .env files for each app:**

```bash
# apps/web-worker/.env
VITE_API_BASE_URL=http://localhost:3001

# apps/web-cleaning/.env
VITE_API_BASE_URL=http://localhost:3001

# apps/web-maintenance/.env
VITE_API_BASE_URL=http://localhost:3001

# apps/api/.env
# Remove or comment out API_BASE_URL - not needed anymore
# API_BASE_URL=http://192.168.0.17:3001
```

## Implementation Checklist

- [x] Phase 1.1: Update PhotosService to store relative paths
- [x] Phase 1.2: Create getPhotoUrl helper for web-worker
- [x] Phase 2: Update MyReportedIssues component
- [x] Phase 3: Update IssueDetailsModal component
- [x] **Phase 4: Create and run database migration script**
  - ✅ Migrated 6 worker issue report photos
  - ✅ Migrated 2 worker photo URLs
  - ✅ Migrated 24 photos table records (s3_url and thumbnail_url)
- [ ] Phase 5: Update web-cleaning photo displays
- [ ] Phase 6: Update web-maintenance photo displays
- [ ] Phase 7: Add .env files with VITE_API_BASE_URL
- [ ] Phase 8: Test photo upload and display in all apps
- [ ] Phase 9: Remove API_BASE_URL from API .env

## Testing Plan

### Test 1: Existing Photos Load
1. Open worker app My Reports page
2. Verify existing photos display (after migration)
3. Check Network tab - should see `http://localhost:3001/uploads/...`

### Test 2: New Photo Upload
1. Upload new photo via worker-issue-photos endpoint
2. Verify saved as relative path `/uploads/...` in database
3. Verify displays correctly in UI

### Test 3: Cross-App Consistency
1. Upload worker photo in web-cleaning
2. Verify displays in web-cleaning, web-worker, web-maintenance
3. All should use same `http://localhost:3001` base URL

## Files Reference

### API Backend
- `/apps/api/src/services/PhotosService.ts` - Photo upload logic (FIXED)
- `/apps/api/src/routes/worker-issues.ts` - Worker issue endpoints
- `/apps/api/src/routes/worker-issue-photos.ts` - Photo upload endpoint
- `/apps/api/src/middleware/upload.ts` - Multer config
- `/apps/api/src/index.ts` - Static file serving config (line 92-100)

### Worker App
- `/apps/web-worker/src/config/api.ts` - API config (CREATED)
- `/apps/web-worker/src/pages/issues/MyReportedIssues.tsx` - (UPDATED)
- `/apps/web-worker/src/components/jobs/IssueDetailsModal.tsx` - (UPDATED)

### Cleaning App
- `/apps/web-cleaning/src/lib/api.ts` - API functions
- `/apps/web-cleaning/src/pages/WorkerDetails.tsx` - Working example

## Next Immediate Steps

1. **CREATE MIGRATION SCRIPT** (`/scripts/migrate-photo-urls.ts`)
2. **RUN MIGRATION** to fix existing database URLs
3. **TEST** that My Reports page now shows photos without timeouts
4. **APPLY PATTERN** to other apps (web-cleaning, web-maintenance)
