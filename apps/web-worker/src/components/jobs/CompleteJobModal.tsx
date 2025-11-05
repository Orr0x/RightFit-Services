import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import PhotoUpload, { JobPhoto } from './PhotoUpload'
import { ChecklistItem } from './JobChecklist'

interface CompleteJobModalProps {
  jobId: string
  propertyName: string
  checklist: ChecklistItem[]
  onClose: () => void
  onSuccess: () => void
}

export default function CompleteJobModal({
  jobId,
  propertyName,
  checklist,
  onClose,
  onSuccess
}: CompleteJobModalProps) {
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timesheetId, setTimesheetId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<JobPhoto[]>([])
  const [completionNotes, setCompletionNotes] = useState('')
  const [workPerformed, setWorkPerformed] = useState('')

  const completedChecklist = checklist.filter(item => item.completed).length
  const totalChecklist = checklist.length
  const isChecklistComplete = totalChecklist === 0 || completedChecklist === totalChecklist

  const beforePhotos = photos.filter(p => p.category === 'BEFORE').length
  const afterPhotos = photos.filter(p => p.category === 'AFTER').length

  useEffect(() => {
    // Fetch active timesheet for this job
    const fetchTimesheet = async () => {
      try {
        const token = localStorage.getItem('worker_token')
        const serviceProviderId = localStorage.getItem('service_provider_id')
        const workerId = localStorage.getItem('worker_id')

        const response = await fetch(
          `/api/cleaning-jobs/${jobId}/timesheets?service_provider_id=${serviceProviderId}&worker_id=${workerId}&status=ACTIVE`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.data && data.data.length > 0) {
            const activeTimesheet = data.data[0]
            setTimesheetId(activeTimesheet.id)

            // Fetch existing photos for this timesheet
            const photosResponse = await fetch(
              `/api/cleaning-jobs/${jobId}/timesheets/${activeTimesheet.id}/photos?service_provider_id=${serviceProviderId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            )

            if (photosResponse.ok) {
              const photosData = await photosResponse.json()
              setPhotos(photosData.data || [])
            }
          }
        }
      } catch (err) {
        console.error('Error fetching timesheet:', err)
      }
    }

    fetchTimesheet()
  }, [jobId])

  const handleCompleteJob = async () => {
    // Validation
    if (!isChecklistComplete) {
      setError('Please complete all checklist items before finishing the job.')
      return
    }

    if (afterPhotos === 0) {
      setError('Please upload at least one "After" photo to document your work.')
      return
    }

    if (!timesheetId) {
      setError('No active timesheet found. Please start the job first.')
      return
    }

    if (!workPerformed.trim()) {
      setError('Please describe the work you performed.')
      return
    }

    setCompleting(true)
    setError(null)

    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      // Complete the job
      const response = await fetch(`/api/cleaning-jobs/${jobId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_provider_id: serviceProviderId,
          timesheet_id: timesheetId,
          end_time: new Date().toISOString(),
          work_performed: workPerformed,
          completion_notes: completionNotes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete job')
      }

      // Success
      onSuccess()
    } catch (err) {
      console.error('Error completing job:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete job')
    } finally {
      setCompleting(false)
    }
  }

  const canComplete = isChecklistComplete && afterPhotos > 0 && workPerformed.trim() !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Complete Job</h2>
          </div>
          <button
            onClick={onClose}
            disabled={completing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Property Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{propertyName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Completed at: {format(new Date(), 'h:mm a')}</span>
            </div>
          </div>

          {/* Checklist Status */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Checklist</h4>
            <div className={`p-4 rounded-lg border ${
              isChecklistComplete
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                {isChecklistComplete ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      All checklist items completed ({completedChecklist}/{totalChecklist})
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">
                      {completedChecklist}/{totalChecklist} checklist items completed
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Photos */}
          {timesheetId && (
            <div className="mb-6">
              <PhotoUpload
                jobId={jobId}
                timesheetId={timesheetId}
                photos={photos}
                onPhotosChange={setPhotos}
              />
              {afterPhotos === 0 && (
                <p className="text-sm text-amber-700 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  At least one "After" photo is required
                </p>
              )}
            </div>
          )}

          {/* Work Performed */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Work Performed <span className="text-red-600">*</span>
            </label>
            <textarea
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              placeholder="Describe what you did during this job..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              disabled={completing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide a brief description of the cleaning work completed
            </p>
          </div>

          {/* Completion Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Any issues, concerns, or special notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={completing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Note any problems, damage, or items that need attention
            </p>
          </div>

          {/* Requirements Summary */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Requirements:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                {isChecklistComplete ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                Complete all checklist items
              </li>
              <li className="flex items-center gap-2">
                {afterPhotos > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                Upload at least one "After" photo ({afterPhotos} uploaded)
              </li>
              <li className="flex items-center gap-2">
                {workPerformed.trim() !== '' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                Describe work performed
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={completing}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCompleteJob}
            disabled={completing || !canComplete}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {completing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Complete Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
