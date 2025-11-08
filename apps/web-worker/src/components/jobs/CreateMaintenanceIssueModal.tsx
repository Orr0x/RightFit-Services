import { useState, useEffect } from 'react'
import { X, AlertTriangle, Wrench } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES } from '@rightfit/shared'

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
  const [error, setError] = useState<string | null>(null)
  const [issuePhotos, setIssuePhotos] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  })

  useEffect(() => {
    // Fetch ISSUE photos from the job's timesheet
    const fetchIssuePhotos = async () => {
      try {
        const token = localStorage.getItem('worker_token')
        const workerId = localStorage.getItem('worker_id')

        if (!workerId) {
          console.error('No worker ID found in localStorage')
          return
        }

        // Get active timesheet using the dedicated endpoint
        const timesheetResponse = await fetch(
          `/api/cleaning-timesheets/job/${jobId}/active?worker_id=${workerId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (timesheetResponse.ok) {
          const timesheetData = await timesheetResponse.json()
          const activeTimesheet = timesheetData.data

          // Get photos for this timesheet
          const photosResponse = await fetch(
            `/api/cleaning-timesheets/${activeTimesheet.id}/photos`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          )

          if (photosResponse.ok) {
            const photosData = await photosResponse.json()
            const issuePhotoUrls = photosData.data
              .filter((photo: any) => photo.category === 'ISSUE')
              .map((photo: any) => photo.photo_url)
            setIssuePhotos(issuePhotoUrls)
          }
        } else if (timesheetResponse.status === 404) {
          console.warn('No active timesheet found. Job may not have been started yet.')
        }
      } catch (err) {
        console.error('Error fetching issue photos:', err)
      }
    }

    fetchIssuePhotos()
  }, [jobId])

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

      onSuccess()
    } catch (err) {
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

          {/* Issue Photos Preview */}
          {issuePhotos.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attached Photos ({issuePhotos.length})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {issuePhotos.map((photoUrl, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={photoUrl}
                      alt={`Issue photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These photos will be attached to the maintenance issue.
              </p>
            </div>
          )}

          {issuePhotos.length === 0 && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                No issue photos found. You can still submit this report, but it's recommended to take photos
                to document the maintenance issue during your job.
              </p>
            </div>
          )}

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
