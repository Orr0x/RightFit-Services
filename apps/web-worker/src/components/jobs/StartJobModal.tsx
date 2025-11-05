import { useState } from 'react'
import { X, Play, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface StartJobModalProps {
  jobId: string
  propertyName: string
  onClose: () => void
  onSuccess: () => void
}

export default function StartJobModal({
  jobId,
  propertyName,
  onClose,
  onSuccess
}: StartJobModalProps) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartJob = async () => {
    setStarting(true)
    setError(null)

    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')
      const workerId = localStorage.getItem('worker_id')

      if (!token || !serviceProviderId || !workerId) {
        throw new Error('Authentication required')
      }

      // Create timesheet and update job status
      const response = await fetch(`/api/cleaning-jobs/${jobId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_provider_id: serviceProviderId,
          worker_id: workerId,
          start_time: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start job')
      }

      // Success - notify parent and close
      onSuccess()
    } catch (err) {
      console.error('Error starting job:', err)
      setError(err instanceof Error ? err.message : 'Failed to start job')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Start Job</h2>
          </div>
          <button
            onClick={onClose}
            disabled={starting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              You're about to start working on:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{propertyName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Start time: {format(new Date(), 'h:mm a')}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your time will be tracked from now</li>
                  <li>Complete all checklist items</li>
                  <li>Take before/after photos</li>
                  <li>Don't forget to complete the job when done</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={starting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStartJob}
            disabled={starting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {starting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
