import { useState, useRef } from 'react'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'
import { useToast } from './ui/Toast'
import { api } from '../lib/api'

interface PhotoUploadProps {
  propertyId: string
  onUploadComplete: (photoId: string) => void
  maxPhotos?: number
  label?: string
  className?: string
}

interface UploadedPhoto {
  id: string
  url: string
  file_name: string
}

export default function PhotoUpload({
  propertyId,
  onUploadComplete,
  maxPhotos = 10,
  label = 'Upload Photos',
  className = '',
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    if (uploadedPhotos.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    const file = files[0]

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('property_id', propertyId)

      const response = await api.post('/api/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const photo = response.data.data
      setUploadedPhotos([...uploadedPhotos, photo])
      onUploadComplete(photo.id)
      toast.success('Photo uploaded successfully')
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error('Failed to upload photo')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = (photoId: string) => {
    setUploadedPhotos(uploadedPhotos.filter(p => p.id !== photoId))
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors cursor-pointer
          ${dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploadedPhotos.length >= maxPhotos ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isUploading || uploadedPhotos.length >= maxPhotos}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PNG, JPG, GIF up to 10MB ({uploadedPhotos.length}/{maxPhotos})
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Photos Grid */}
      {uploadedPhotos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {uploadedPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden group"
            >
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.file_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-500">
                  {photo.file_name}
                </div>
              )}

              <button
                onClick={() => handleRemovePhoto(photo.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
