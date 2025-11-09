import { useState, useEffect, useRef } from 'react'
import { X, AlertTriangle, Wrench, Camera, Upload, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES } from '@rightfit/shared'
import imageCompression from 'browser-image-compression'

interface CreateMaintenanceIssueModalProps {
  jobId: string
  propertyName: string
  propertyId: string
  customerId: string
  onClose: () => void
  onSuccess: () => void
}

const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'text-gray-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-blue-700' },
  { value: 'HIGH', label: 'High', color: 'text-orange-700' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-700' }
]

export default function CreateMaintenanceIssueModal({
  jobId,
  propertyName,
  propertyId,
  customerId,
  onClose,
  onSuccess
}: CreateMaintenanceIssueModalProps) {
  const { worker } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issuePhotos, setIssuePhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  })

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }

    try {
      const compressedBlob = await imageCompression(file, options)
      const fileName = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/)
        ? file.name
        : file.name + '.jpg'

      return new File([compressedBlob], fileName, {
        type: compressedBlob.type || file.type,
        lastModified: Date.now(),
      })
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
        const compressedFile = await compressImage(file)
        await uploadPhoto(compressedFile)
      }
    } catch (err) {
      console.error('Error uploading photos:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload photos')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const uploadPhoto = async (file: File) => {
    const token = localStorage.getItem('worker_token')

    const formData = new FormData()
    formData.append('photo', file)
    formData.append('category', 'ISSUE')

    const response = await fetch(`/api/worker-issue-photos/upload`, {
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
    setIssuePhotos(prev => [...prev, data.data.photo_url])
  }

  const handleDeletePhoto = (photoUrl: string) => {
    setIssuePhotos(prev => prev.filter(url => url !== photoUrl))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.title.trim()) {
      setError('Please provide a title for the maintenance issue.')
      return
    }

    if (!formData.description.trim()) {
      setError('Please provide a description of the maintenance issue.')
      return
    }

    if (!worker) {
      setError('Worker information not found.')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('worker_token')
      const workerId = localStorage.getItem('worker_id')

      if (!workerId) {
        setError('Worker ID not found. Please log in again.')
        setSubmitting(false)
        return
      }

      const response = await fetch('/api/worker-issues', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: propertyId,
          customer_id: customerId,
          worker_id: workerId,
          cleaning_job_id: jobId,
          issue_type: 'MAINTENANCE',
          title: formData.title,
          issue_description: formData.description,
          category: formData.category,
          priority: formData.priority,
          photos: issuePhotos
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create maintenance issue report')
      }

      const result = await response.json()
      console.log('Maintenance issue created successfully:', result)

      setSubmitting(false)
      onSuccess()
    } catch (err) {
      console.error('Error creating maintenance issue:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Report Maintenance Issue</h2>
              <p className="text-sm text-gray-600">{propertyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Leaking faucet in kitchen"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            >
              {MAINTENANCE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            >
              {PRIORITY_LEVELS.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the maintenance issue in detail..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Photos (Optional)
            </label>

            {/* Upload Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading || submitting}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || submitting}
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
              <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-blue-900">Uploading and compressing photos...</span>
                </div>
              </div>
            )}

            {/* Photos Preview */}
            {issuePhotos.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2">
                  {issuePhotos.length} photo{issuePhotos.length !== 1 ? 's' : ''} attached
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {issuePhotos.map((photoUrl, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={photoUrl}
                        alt={`Issue photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photoUrl)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        disabled={submitting}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {issuePhotos.length === 0 && (
              <p className="text-xs text-gray-500">
                Add photos to document the maintenance issue. This helps maintenance staff understand the problem.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  <span>Create Maintenance Issue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
