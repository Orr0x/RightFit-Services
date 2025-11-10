import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { api } from '../../lib/api'
import { Button } from '@rightfit/ui-core'
import { Textarea } from '@rightfit/ui-core'
import { useToast } from '../ui'
import { Spinner } from '@rightfit/ui-core'

interface StartJobModalProps {
  job: {
    id: string
    property: {
      property_name: string
      address: string
    }
    assigned_worker_id: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function StartJobModal({ job, onClose, onSuccess }: StartJobModalProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const toast = useToast()

  const handleStart = async () => {
    try {
      setLoading(true)

      const payload = {
        cleaning_job_id: job.id,
        worker_id: job.assigned_worker_id,
        start_time: new Date().toISOString(),
        notes: notes || undefined,
      }

      await api.post('/api/cleaning-timesheets', payload)

      toast.success('Job started! Timesheet created.', 'Success')
      onSuccess()
    } catch (error: any) {
      console.error('Error starting job:', error)
      toast.error(error.response?.data?.error || 'Failed to start job', 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Start Cleaning Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {job.property.property_name}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">{job.property.address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any initial observations or notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleStart} disabled={loading}>
              {loading ? (
                <Spinner size="small" />
              ) : (
                <>
                  <PlayArrowIcon sx={{ fontSize: 18, mr: 1 }} />
                  Start Job
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
