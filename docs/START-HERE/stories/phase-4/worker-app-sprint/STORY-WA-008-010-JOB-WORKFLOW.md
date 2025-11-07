# Story: Job Workflow - Start, Photos, and Complete

**Story IDs**: WA-008, WA-009, WA-010
**Epic**: Worker Web Application - Phase 3
**Total Points**: 16 points
**Duration**: 3 days

---

## Stories Overview

This document covers the complete job workflow:
1. WA-008: Start Job Modal (3 pts)
2. WA-009: Photo Upload Component (5 pts)
3. WA-010: Complete Job Modal (8 pts)

This is the **most critical workflow** in the Worker App. Workers must be able to:
- Start a job with one tap
- Upload before/after photos easily
- Complete the job with notes

---

## WA-008: Start Job Modal

### User Story
As a **worker**, I want to **start a job with confirmation** so that **my time is accurately tracked**.

### Acceptance Criteria
```gherkin
GIVEN I am viewing a job that hasn't been started
WHEN I click "Start Job"
THEN I should see a confirmation modal

GIVEN the modal is open
WHEN I click "Start Job Now"
THEN a timesheet should be created
AND the start time should be recorded
AND the job status should change to IN_PROGRESS
AND I should see a success message
AND the modal should close

GIVEN I try to start a job
BUT I already have a job in progress
THEN I should see an error: "Please complete your current job first"

GIVEN I cancel the modal
WHEN I click "Cancel"
THEN the modal should close
AND no timesheet should be created
```

### Technical Implementation

#### StartJobModal Component
```typescript
// apps/web-worker/src/components/jobs/StartJobModal.tsx
import { useState } from 'react'
import { Modal, Button, Spinner } from '../ui'
import { timesheetAPI } from '../../lib/api'
import { useToast } from '../ui/Toast'
import type { CleaningJob } from '../../types'

interface StartJobModalProps {
  job: CleaningJob
  workerId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StartJobModal({
  job,
  workerId,
  isOpen,
  onClose,
  onSuccess
}: StartJobModalProps) {
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleStartJob = async () => {
    setLoading(true)

    try {
      await timesheetAPI.startJob(job.id, workerId)

      toast.success('Job started successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to start job:', error)
      toast.error(error.message || 'Failed to start job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Job"
      size="sm"
    >
      <div className="space-y-4">
        {/* Job Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="font-semibold text-lg mb-2">
            {job.property?.property_name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {job.property?.address}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Time: {job.scheduled_start_time} - {job.scheduled_end_time}
          </p>
        </div>

        {/* Confirmation Message */}
        <p className="text-center text-lg">
          Ready to begin this job?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartJob}
            disabled={loading}
            fullWidth
          >
            {loading ? <Spinner size="sm" /> : 'Start Job Now'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

#### Timesheet API
```typescript
// apps/web-worker/src/lib/api.ts (Timesheet section)
export const timesheetAPI = {
  startJob: async (jobId: string, workerId: string) => {
    const response = await fetch(`${API_BASE_URL}/cleaning-timesheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        cleaning_job_id: jobId,
        worker_id: workerId,
        start_time: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to start job')
    }

    return await response.json()
  }
}
```

### Backend API (Existing)
```
POST /api/cleaning-timesheets

Request Body:
{
  cleaning_job_id: string
  worker_id: string
  start_time: string (ISO datetime)
}

Response:
{
  id: string
  cleaning_job_id: string
  worker_id: string
  start_time: string
  end_time: null
  total_hours: null
  work_performed: null
  notes: null
  created_at: string
  updated_at: string
}
```

### Files to Create
- apps/web-worker/src/components/jobs/StartJobModal.tsx

### Testing
- Test modal opens correctly
- Test job start success
- Test job start failure (network error)
- Test cannot start if job already in progress
- Test cancel closes modal without starting
- Test loading state displays correctly

---

## WA-009: Photo Upload Component

### User Story
As a **worker**, I want to **upload before/after photos** so that **I can document my work**.

### Acceptance Criteria
```gherkin
GIVEN I am completing a job
WHEN I open the photo upload section
THEN I should see three categories: Before, After, Issue

WHEN I click "Upload Photo" (mobile)
THEN I should be able to take a photo with the camera

WHEN I click "Upload Photo" (desktop)
THEN I should be able to select a file from my device

WHEN I select a photo
THEN it should be compressed to < 1MB
AND I should see a preview

WHEN I have multiple photos
THEN I should see all thumbnails in a grid

WHEN I click the delete icon on a photo
THEN that photo should be removed

GIVEN the photo is uploading
WHEN I view the progress
THEN I should see a progress bar

GIVEN the upload fails
WHEN the error occurs
THEN I should see a retry button

GIVEN I have poor network connection
WHEN I upload photos
THEN they should be queued
AND uploaded automatically when connection improves
```

### Technical Implementation

#### PhotoUpload Component
```typescript
// apps/web-worker/src/components/jobs/PhotoUpload.tsx
import { useState, useRef } from 'react'
import { Button, Spinner } from '../ui'
import { compressImage } from '../../lib/imageCompression'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import DeleteIcon from '@mui/icons-material/Delete'
import type { PhotoCategory } from '../../types'

interface Photo {
  id: string
  file: File
  preview: string
  category: PhotoCategory
  uploaded: boolean
  uploading: boolean
  progress: number
  error?: string
}

interface PhotoUploadProps {
  category: PhotoCategory
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  maxPhotos?: number
}

export function PhotoUpload({
  category,
  photos,
  onPhotosChange,
  maxPhotos = 10
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Check max photos
    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed per category`)
      return
    }

    // Process each file
    for (const file of files) {
      // Compress image
      const compressedFile = await compressImage(file)

      // Create preview
      const preview = URL.createObjectURL(compressedFile)

      // Add to photos list
      const newPhoto: Photo = {
        id: `${Date.now()}-${Math.random()}`,
        file: compressedFile,
        preview,
        category,
        uploaded: false,
        uploading: false,
        progress: 0
      }

      onPhotosChange([...photos, newPhoto])
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId)
    onPhotosChange(updatedPhotos)

    // Revoke object URL to prevent memory leak
    const photo = photos.find(p => p.id === photoId)
    if (photo) {
      URL.revokeObjectURL(photo.preview)
    }
  }

  const getCategoryLabel = () => {
    switch (category) {
      case 'before':
        return 'Before Photos'
      case 'after':
        return 'After Photos'
      case 'issue':
        return 'Issue Photos'
      default:
        return 'Photos'
    }
  }

  const getCategoryColor = () => {
    switch (category) {
      case 'before':
        return 'blue'
      case 'after':
        return 'green'
      case 'issue':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const color = getCategoryColor()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-medium">{getCategoryLabel()}</label>
        {category === 'after' && (
          <span className="text-sm text-gray-500">
            (Minimum 2 required)
          </span>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          >
            <img
              src={photo.preview}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />

            {/* Upload Progress */}
            {photo.uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Spinner size="sm" />
                  <p className="text-xs mt-1">{photo.progress}%</p>
                </div>
              </div>
            )}

            {/* Upload Success */}
            {photo.uploaded && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}

            {/* Upload Error */}
            {photo.error && (
              <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                <p className="text-white text-xs p-2 text-center">
                  {photo.error}
                </p>
              </div>
            )}

            {/* Delete Button */}
            {!photo.uploading && !photo.uploaded && (
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <DeleteIcon sx={{ fontSize: 16, color: 'white' }} />
              </button>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {photos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-lg border-2 border-dashed border-${color}-300 bg-${color}-50 dark:bg-${color}-900/10 flex flex-col items-center justify-center hover:bg-${color}-100 dark:hover:bg-${color}-900/20 transition-colors`}
          >
            <CameraAltIcon sx={{ fontSize: 32 }} className={`text-${color}-500`} />
            <span className={`text-xs mt-1 text-${color}-600`}>Add Photo</span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"  // Use back camera on mobile
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Count */}
      <p className="text-sm text-gray-500">
        {photos.length} / {maxPhotos} photos
      </p>
    </div>
  )
}
```

#### Image Compression Utility
```typescript
// apps/web-worker/src/lib/imageCompression.ts
import imageCompression from 'browser-image-compression'

export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/jpeg',  // Convert all to JPEG
    initialQuality: 0.8
  }

  try {
    const compressedFile = await imageCompression(file, options)

    // Log compression result
    console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    console.log(`Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)

    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    // Return original if compression fails
    return file
  }
}
```

### Files to Create
- apps/web-worker/src/components/jobs/PhotoUpload.tsx
- apps/web-worker/src/lib/imageCompression.ts
- apps/web-worker/src/hooks/usePhotoUpload.ts

### Testing
- Test photo selection (file picker)
- Test photo capture (camera on mobile)
- Test photo compression (verify < 1MB)
- Test photo preview
- Test photo deletion
- Test max photos limit
- Test multiple photo upload
- Test upload progress indicator
- Test upload error handling
- Test retry mechanism

---

## WA-010: Complete Job Modal

### User Story
As a **worker**, I want to **complete a job with photos and notes** so that **my work is properly documented and recorded**.

### Acceptance Criteria
```gherkin
GIVEN I click "Complete Job"
WHEN the modal opens
THEN the system should validate the checklist is 100% complete

GIVEN the checklist is not 100% complete
WHEN I try to complete the job
THEN I should see an error: "Please complete all checklist items first"
AND the modal should not open

GIVEN the checklist is 100% complete
WHEN I open the complete job modal
THEN I should see:
  - Work Performed field (required)
  - Before Photos section (optional)
  - After Photos section (required, min 2)
  - Notes field (optional)
  - Complete Job button

GIVEN I fill in the required fields
AND I upload at least 2 after photos
WHEN I click "Complete Job"
THEN the photos should upload with progress
AND the timesheet should be completed
AND the job status should change to COMPLETED
AND I should see a success message
AND I should be redirected to the dashboard

GIVEN the upload fails
WHEN an error occurs
THEN I should see an error message
AND I should be able to retry

GIVEN I have a slow connection
WHEN I upload photos
THEN I should see upload progress for each photo
AND I should be able to cancel if needed
```

### Technical Implementation

#### CompleteJobModal Component
```typescript
// apps/web-worker/src/components/jobs/CompleteJobModal.tsx
import { useState } from 'react'
import { Modal, Button, Spinner } from '../ui'
import { PhotoUpload } from './PhotoUpload'
import { timesheetAPI } from '../../lib/api'
import { useToast } from '../ui/Toast'
import type { CleaningJob } from '../../types'

interface CompleteJobModalProps {
  job: CleaningJob
  timesheetId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Photo {
  id: string
  file: File
  preview: string
  category: 'before' | 'after' | 'issue'
  uploaded: boolean
  uploading: boolean
  progress: number
  error?: string
}

export function CompleteJobModal({
  job,
  timesheetId,
  isOpen,
  onClose,
  onSuccess
}: CompleteJobModalProps) {
  const [workPerformed, setWorkPerformed] = useState('')
  const [notes, setNotes] = useState('')
  const [beforePhotos, setBeforePhotos] = useState<Photo[]>([])
  const [afterPhotos, setAfterPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)

  const toast = useToast()

  // Validation
  const isValid = () => {
    if (!workPerformed.trim() || workPerformed.length < 10) {
      toast.error('Please describe the work performed (min 10 characters)')
      return false
    }

    if (afterPhotos.length < 2) {
      toast.error('Please upload at least 2 after photos')
      return false
    }

    return true
  }

  // Upload single photo
  const uploadPhoto = async (photo: Photo): Promise<boolean> => {
    try {
      // Update photo to uploading state
      updatePhotoProgress(photo.id, 0, true)

      const formData = new FormData()
      formData.append('photo', photo.file)
      formData.append('category', photo.category)

      const response = await fetch(
        `http://localhost:3001/api/cleaning-timesheets/${timesheetId}/photos`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Mark as uploaded
      markPhotoUploaded(photo.id)
      return true
    } catch (error) {
      markPhotoError(photo.id, 'Upload failed')
      return false
    }
  }

  // Upload all photos
  const uploadAllPhotos = async (): Promise<boolean> => {
    const allPhotos = [...beforePhotos, ...afterPhotos]

    for (const photo of allPhotos) {
      const success = await uploadPhoto(photo)
      if (!success) {
        return false  // Stop on first failure
      }
    }

    return true
  }

  // Handle completion
  const handleCompleteJob = async () => {
    if (!isValid()) {
      return
    }

    setLoading(true)

    try {
      // Step 1: Upload all photos
      toast.info('Uploading photos...')
      const photosUploaded = await uploadAllPhotos()

      if (!photosUploaded) {
        toast.error('Failed to upload some photos. Please try again.')
        setLoading(false)
        return
      }

      // Step 2: Complete timesheet
      toast.info('Completing job...')
      await timesheetAPI.completeJob(timesheetId, {
        work_performed: workPerformed,
        notes: notes || undefined
      })

      // Step 3: Success!
      toast.success('Job completed successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to complete job:', error)
      toast.error(error.message || 'Failed to complete job')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for photo state
  const updatePhotoProgress = (photoId: string, progress: number, uploading: boolean) => {
    const updatePhotos = (photos: Photo[]) =>
      photos.map(p =>
        p.id === photoId
          ? { ...p, progress, uploading, error: undefined }
          : p
      )

    setBeforePhotos(updatePhotos)
    setAfterPhotos(updatePhotos)
  }

  const markPhotoUploaded = (photoId: string) => {
    const updatePhotos = (photos: Photo[]) =>
      photos.map(p =>
        p.id === photoId
          ? { ...p, uploaded: true, uploading: false, progress: 100 }
          : p
      )

    setBeforePhotos(updatePhotos)
    setAfterPhotos(updatePhotos)
  }

  const markPhotoError = (photoId: string, error: string) => {
    const updatePhotos = (photos: Photo[]) =>
      photos.map(p =>
        p.id === photoId
          ? { ...p, uploading: false, error }
          : p
      )

    setBeforePhotos(updatePhotos)
    setAfterPhotos(updatePhotos)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Job"
      size="lg"
    >
      <div className="space-y-6">
        {/* Work Performed */}
        <div>
          <label className="block font-medium mb-2">
            Work Performed *
          </label>
          <textarea
            value={workPerformed}
            onChange={(e) => setWorkPerformed(e.target.value)}
            placeholder="Describe the work you completed..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Minimum 10 characters
          </p>
        </div>

        {/* Before Photos */}
        <PhotoUpload
          category="before"
          photos={beforePhotos}
          onPhotosChange={setBeforePhotos}
          maxPhotos={10}
        />

        {/* After Photos */}
        <PhotoUpload
          category="after"
          photos={afterPhotos}
          onPhotosChange={setAfterPhotos}
          maxPhotos={10}
        />

        {/* Notes */}
        <div>
          <label className="block font-medium mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or observations..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteJob}
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Completing...</span>
              </>
            ) : (
              'Complete Job'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

### Backend API (Existing)
```
POST /api/cleaning-timesheets/:id/photos
Content-Type: multipart/form-data

Form Data:
  photo: File
  category: 'before' | 'after' | 'issue'

POST /api/cleaning-timesheets/:id/complete
Content-Type: application/json

Body:
{
  work_performed: string
  notes?: string
}
```

### Files to Create
- apps/web-worker/src/components/jobs/CompleteJobModal.tsx

### Testing
- Test modal opens only if checklist 100%
- Test work performed validation (min 10 chars)
- Test photo upload requirement (min 2 after photos)
- Test photo upload process
- Test photo upload progress
- Test photo upload failure
- Test photo upload retry
- Test completion success
- Test completion failure
- Test redirect after success
- Test cancel closes modal

---

## Integration Testing

### Complete Job Workflow (End-to-End)
1. Worker logs in
2. Views dashboard
3. Clicks on a job
4. Clicks "Start Job"
5. Confirms job start
6. Views checklist
7. Completes all checklist items
8. Clicks "Complete Job"
9. Fills in work performed
10. Uploads 2+ after photos
11. Adds optional notes
12. Clicks "Complete Job"
13. Photos upload with progress
14. Job completes successfully
15. Redirects to dashboard
16. Job shows as "Completed"

### Error Scenarios to Test
- Network error during photo upload
- Photo upload fails halfway
- Timesheet completion fails after photos uploaded
- User loses connection during upload
- User cancels during upload
- Photo file too large
- Invalid photo format

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
**Ready for Implementation**: YES
