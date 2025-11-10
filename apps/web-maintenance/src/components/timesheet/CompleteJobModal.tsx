import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { api } from '../../lib/api'
import { Button } from '@rightfit/ui-core'
import { Textarea } from '@rightfit/ui-core'
import { useToast } from '../ui'
import { Spinner } from '@rightfit/ui-core'
import { Card } from '@rightfit/ui-core'

interface CompleteJobModalProps {
  job: {
    id: string
    property: {
      property_name: string
      address: string
    }
  }
  timesheetId: string
  onClose: () => void
  onSuccess: () => void
}

export function CompleteJobModal({ job, timesheetId, onClose, onSuccess }: CompleteJobModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    work_performed: '',
    notes: '',
    before_photos_count: 0,
    after_photos_count: 0,
    issue_photos_count: 0,
  })
  const toast = useToast()

  const handleComplete = async () => {
    if (!formData.work_performed.trim()) {
      toast.error('Please describe the work performed', 'Validation Error')
      return
    }

    try {
      setLoading(true)

      const payload = {
        end_time: new Date().toISOString(),
        work_performed: formData.work_performed,
        notes: formData.notes || undefined,
      }

      await api.post(`/api/cleaning-timesheets/${timesheetId}/complete`, payload)

      toast.success('Job completed successfully!', 'Success')
      onSuccess()
    } catch (error: any) {
      console.error('Error completing job:', error)
      toast.error(error.response?.data?.error || 'Failed to complete job', 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Complete Cleaning Job
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {job.property.property_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Property Info */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {job.property.address}
            </p>
          </Card>

          {/* Work Performed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Performed *
            </label>
            <Textarea
              value={formData.work_performed}
              onChange={(e) => setFormData({ ...formData, work_performed: e.target.value })}
              rows={4}
              placeholder="Describe the cleaning work completed..."
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              List all rooms/areas cleaned and tasks completed
            </p>
          </div>

          {/* Photo Upload Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Photos
            </label>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <PhotoCameraIcon
                  sx={{ fontSize: 32, mb: 1 }}
                  className="text-green-600 dark:text-green-400"
                />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Before Photos
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formData.before_photos_count}
                </p>
              </Card>

              <Card className="p-4 text-center">
                <PhotoCameraIcon
                  sx={{ fontSize: 32, mb: 1 }}
                  className="text-blue-600 dark:text-blue-400"
                />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">After Photos</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formData.after_photos_count}
                </p>
              </Card>

              <Card className="p-4 text-center">
                <PhotoCameraIcon
                  sx={{ fontSize: 32, mb: 1 }}
                  className="text-red-600 dark:text-red-400"
                />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Issue Photos
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formData.issue_photos_count}
                </p>
              </Card>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Note: Photo upload functionality can be integrated with mobile app or file upload
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any issues found, extra work done, or other notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? (
                <Spinner size="small" />
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: 18, mr: 1 }} />
                  Complete Job
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
