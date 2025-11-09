import { useState } from 'react'
import { Camera, FileText, X, Image as ImageIcon } from 'lucide-react'
import { getPhotoUrl } from '../../config/api'

interface JobNotesSectionProps {
  jobId: string
  initialNotes?: string
  initialPhotos?: string[]
  isCompleted?: boolean
  onUpdate?: () => void
}

export default function JobNotesSection({
  jobId,
  initialNotes = '',
  initialPhotos = [],
  isCompleted = false,
  onUpdate
}: JobNotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialPhotoCount] = useState(initialPhotos.length)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('photo', file)
        formData.append('label', 'JOB_NOTE')

        const response = await fetch(`/api/cleaning-jobs/${jobId}/photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to upload photo')
        }

        const data = await response.json()
        // Use s3_url which contains the relative path
        uploadedUrls.push(data.data.s3_url || data.data.photo_url)
      }

      setPhotos([...photos, ...uploadedUrls])
      setHasChanges(true)
      if (onUpdate) onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async (photoUrl: string, index: number) => {
    // If job is completed, only allow removing photos added after completion
    if (isCompleted && index < initialPhotoCount) {
      setError('Cannot remove photos from completed jobs. You can only add new photos.')
      return
    }

    try {
      setPhotos(photos.filter((_, i) => i !== index))
      setHasChanges(true)
      if (onUpdate) onUpdate()
    } catch (err) {
      setError('Failed to remove photo')
    }
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const token = localStorage.getItem('worker_token')

      const response = await fetch(`/api/cleaning-jobs/${jobId}/notes`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: notes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save notes')
      }

      setHasChanges(false)
      if (onUpdate) onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Job Notes & Photos</h2>
          {isCompleted && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Add-only mode
            </span>
          )}
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes {isCompleted && <span className="text-xs text-gray-500">(can add more)</span>}
        </label>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={isCompleted
            ? "Add additional notes or observations..."
            : "Add notes about this job, pre-existing conditions, special instructions..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          {isCompleted
            ? "You can continue adding notes even after job completion"
            : "Document any observations, pre-existing issues, or important details"}
        </p>
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Photos ({photos.length}) {isCompleted && <span className="text-xs text-gray-500">(can add more)</span>}
          </label>
          <label className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
            <Camera className="w-4 h-4" />
            Add Photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => {
              const canDelete = !isCompleted || index >= initialPhotoCount
              return (
                <div key={index} className="relative group">
                  <img
                    src={getPhotoUrl(photo)}
                    alt={`Job photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  {canDelete && (
                    <button
                      onClick={() => handleRemovePhoto(photo, index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {isCompleted && index < initialPhotoCount && (
                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                      Original
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No photos added yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Upload photos to document the job
            </p>
          </div>
        )}

        {uploading && (
          <p className="text-sm text-blue-600 mt-2">Uploading photos...</p>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
