import { useState } from 'react'
import { X, Camera, Trash2, Upload } from 'lucide-react'
import { getPhotoUrl } from '../../config/api'

interface WorkerReportedIssue {
  id: string
  title: string
  issue_description: string
  category: string
  priority: string
  status: string
  reported_at: string
  customer_approved_at?: string | null
  customer_rejected_at?: string | null
  rejection_reason?: string | null
  photos?: string[]
  created_maintenance_job?: {
    id: string
    title: string
    status: string
  } | null
}

interface IssueDetailsModalProps {
  issue: WorkerReportedIssue
  onClose: () => void
  onUpdate: () => void
}

export default function IssueDetailsModal({ issue, onClose, onUpdate }: IssueDetailsModalProps) {
  const [uploading, setUploading] = useState(false)
  const [newPhotos, setNewPhotos] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const allPhotos = [...(issue.photos || []), ...newPhotos]

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      setError(null)

      // In a real implementation, you would upload to a cloud storage service
      // For now, we'll just create temporary URLs
      const photoPromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(file)
        })
      })

      const uploadedPhotos = await Promise.all(photoPromises)
      setNewPhotos([...newPhotos, ...uploadedPhotos])
    } catch (err) {
      setError('Failed to upload photos')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSavePhotos = async () => {
    if (newPhotos.length === 0) {
      onClose()
      return
    }

    try {
      setUploading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')
      const response = await fetch(`/api/worker-issues/${issue.id}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photos: newPhotos
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add photos')
      }

      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUploading(false)
    }
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300'
      case 'CUSTOMER_REVIEWING': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SUBMITTED': return 'bg-amber-100 text-amber-800 border-amber-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const canAddPhotos = issue.status === 'SUBMITTED' || issue.status === 'CUSTOMER_REVIEWING'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Issue Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded border ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded border ${getStatusColor(issue.status)}`}>
                {issue.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Category</p>
            <p className="text-gray-900 capitalize">{issue.category.replace(/_/g, ' ')}</p>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
            <p className="text-gray-900 whitespace-pre-wrap">{issue.issue_description}</p>
          </div>

          {/* Reported Date */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Reported</p>
            <p className="text-gray-900">
              {new Date(issue.reported_at).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Approval/Rejection Info */}
          {issue.status === 'APPROVED' && issue.customer_approved_at && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-900">Approved</p>
              <p className="text-sm text-green-800">
                {new Date(issue.customer_approved_at).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          {issue.status === 'REJECTED' && issue.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900 mb-1">Rejected</p>
              <p className="text-sm text-red-800">{issue.rejection_reason}</p>
              {issue.customer_rejected_at && (
                <p className="text-xs text-red-700 mt-1">
                  {new Date(issue.customer_rejected_at).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          )}

          {/* Maintenance Job Info */}
          {issue.created_maintenance_job && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">Maintenance Job Created</p>
              <p className="text-sm text-blue-800">{issue.created_maintenance_job.title}</p>
              <p className="text-xs text-blue-700 mt-1 capitalize">
                Status: {issue.created_maintenance_job.status.replace(/_/g, ' ')}
              </p>
            </div>
          )}

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Photos ({allPhotos.length})</p>
              {canAddPhotos && (
                <label className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
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
              )}
            </div>

            {allPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {allPhotos.map((photo, index) => {
                  const isNew = index >= (issue.photos?.length || 0)
                  // Use getPhotoUrl for existing photos, but not for new data URLs
                  const photoUrl = isNew ? photo : getPhotoUrl(photo)
                  return (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`Issue photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                      />
                      {isNew && (
                        <button
                          onClick={() => removeNewPhoto(index - (issue.photos?.length || 0))}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {isNew && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                          New
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No photos attached</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {canAddPhotos && newPhotos.length > 0 && (
            <button
              onClick={handleSavePhotos}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Save Photos ({newPhotos.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
