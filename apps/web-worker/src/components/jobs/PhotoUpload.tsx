import { useState, useRef } from 'react'
import { Camera, Upload, X, Trash2, AlertCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export interface JobPhoto {
  id: string
  photo_url: string
  category: 'BEFORE' | 'AFTER' | 'ISSUE'
  uploaded_at: string
}

interface PhotoUploadProps {
  jobId: string
  timesheetId: string
  photos: JobPhoto[]
  onPhotosChange: (photos: JobPhoto[]) => void
}

export default function PhotoUpload({
  jobId,
  timesheetId,
  photos,
  onPhotosChange
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'BEFORE' | 'AFTER' | 'ISSUE'>('AFTER')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }

    try {
      const compressedBlob = await imageCompression(file, options)

      // Ensure the file has the correct name and extension
      const fileName = file.name.toLowerCase().endsWith('.jpg') ||
                      file.name.toLowerCase().endsWith('.jpeg') ||
                      file.name.toLowerCase().endsWith('.png') ||
                      file.name.toLowerCase().endsWith('.webp') ||
                      file.name.toLowerCase().endsWith('.gif')
        ? file.name
        : file.name + '.jpg'

      // Create a new File object with the proper name
      const compressedFile = new File([compressedBlob], fileName, {
        type: compressedBlob.type || file.type,
        lastModified: Date.now(),
      })

      return compressedFile
    } catch (error) {
      console.error('Error compressing image:', error)
      return file
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        // Compress the image
        const compressedFile = await compressImage(file)

        // Upload to server
        await uploadPhoto(compressedFile, selectedCategory)
      }
    } catch (err) {
      console.error('Error uploading photos:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload photos')
    } finally {
      setUploading(false)
      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const uploadPhoto = async (file: File, category: 'BEFORE' | 'AFTER' | 'ISSUE') => {
    const token = localStorage.getItem('worker_token')
    const serviceProviderId = localStorage.getItem('service_provider_id')

    if (!token || !serviceProviderId) {
      throw new Error('Authentication required')
    }

    const formData = new FormData()
    formData.append('photo', file)
    formData.append('category', category)

    const response = await fetch(`/api/cleaning-timesheets/${timesheetId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload photo')
    }

    const data = await response.json()
    onPhotosChange([...photos, data.data])
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      const response = await fetch(
        `/api/cleaning-timesheets/${timesheetId}/photos/${photoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      onPhotosChange(photos.filter(p => p.id !== photoId))
    } catch (err) {
      console.error('Error deleting photo:', err)
      alert('Failed to delete photo')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BEFORE': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'AFTER': return 'bg-green-100 text-green-800 border-green-300'
      case 'ISSUE': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const photosByCategory = {
    BEFORE: photos.filter(p => p.category === 'BEFORE'),
    AFTER: photos.filter(p => p.category === 'AFTER'),
    ISSUE: photos.filter(p => p.category === 'ISSUE'),
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        Job Photos
      </h3>

      {/* Category Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedCategory('BEFORE')}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              selectedCategory === 'BEFORE'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setSelectedCategory('AFTER')}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              selectedCategory === 'AFTER'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            After
          </button>
          <button
            onClick={() => setSelectedCategory('ISSUE')}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              selectedCategory === 'ISSUE'
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Issue
          </button>
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-5 h-5" />
          Take Photo
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5" />
          Upload Photo
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      {/* Uploading Indicator */}
      {uploading && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-900">Uploading and compressing photos...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Photos Display */}
      {photos.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No photos uploaded yet</p>
          <p className="text-gray-400 text-xs mt-1">Take or upload photos to document your work</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Before Photos */}
          {photosByCategory.BEFORE.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 border border-blue-300">
                  BEFORE
                </span>
                <span className="text-gray-500">({photosByCategory.BEFORE.length})</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photosByCategory.BEFORE.map(photo => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={handleDeletePhoto}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* After Photos */}
          {photosByCategory.AFTER.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800 border border-green-300">
                  AFTER
                </span>
                <span className="text-gray-500">({photosByCategory.AFTER.length})</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photosByCategory.AFTER.map(photo => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={handleDeletePhoto}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Issue Photos */}
          {photosByCategory.ISSUE.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800 border border-red-300">
                  ISSUE
                </span>
                <span className="text-gray-500">({photosByCategory.ISSUE.length})</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photosByCategory.ISSUE.map(photo => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={handleDeletePhoto}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface PhotoCardProps {
  photo: JobPhoto
  onDelete: (photoId: string) => void
  getCategoryColor: (category: string) => string
}

function PhotoCard({ photo, onDelete, getCategoryColor }: PhotoCardProps) {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
        <img
          src={photo.photo_url}
          alt={`${photo.category} photo`}
          className="w-full h-full object-cover"
        />
      </div>
      <button
        onClick={() => onDelete(photo.id)}
        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
        title="Delete photo"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
