import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button } from '@rightfit/ui-core'
import { useToast } from './ui'
import PhotoUpload from './PhotoUpload'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface MaintenanceJob {
  id: string
  title: string
  property_id: string
  property?: {
    property_name: string
  }
  quote?: {
    total: number
    line_items: Array<{
      description: string
      quantity: number
      total: number
    }>
  }
  assigned_worker_id?: string
  diagnosis?: string
}

interface MaintenanceJobCompletionModalProps {
  job: MaintenanceJob
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function MaintenanceJobCompletionModal({
  job,
  isOpen,
  onClose,
  onComplete,
}: MaintenanceJobCompletionModalProps) {
  const { user } = useAuth()
  const SERVICE_PROVIDER_ID = user?.service_provider_id
  const toast = useToast()
  const navigate = useNavigate()

  const [workPerformed, setWorkPerformed] = useState('')
  const [diagnosis, setDiagnosis] = useState(job.diagnosis || '')
  const [beforePhotoIds, setBeforePhotoIds] = useState<string[]>([])
  const [afterPhotoIds, setAfterPhotoIds] = useState<string[]>([])
  const [inProgressPhotoIds, setInProgressPhotoIds] = useState<string[]>([])
  const [actualHoursWorked, setActualHoursWorked] = useState(0)
  const [actualPartsCost, setActualPartsCost] = useState(
    job.quote?.line_items.find(item => item.description.toLowerCase().includes('parts'))?.total || 0
  )
  const [generateInvoice, setGenerateInvoice] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const quotedHours = job.quote?.line_items.find(item =>
    item.description.toLowerCase().includes('labor')
  )?.quantity || 0

  const quotedPartsCost = job.quote?.line_items.find(item =>
    item.description.toLowerCase().includes('parts')
  )?.total || 0

  const handleSubmit = async () => {
    if (!workPerformed.trim()) {
      toast.error('Please describe the work performed')
      return
    }

    if (afterPhotoIds.length === 0) {
      toast.error('Please upload at least one completion photo')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post(`/api/maintenance-jobs/${job.id}/complete`, {
        service_provider_id: SERVICE_PROVIDER_ID,
        worker_id: job.assigned_worker_id,
        work_performed: workPerformed,
        diagnosis,
        before_photo_ids: beforePhotoIds,
        after_photo_ids: afterPhotoIds,
        work_in_progress_photo_ids: inProgressPhotoIds,
        actual_hours_worked: actualHoursWorked,
        actual_parts_cost: actualPartsCost,
        generate_invoice: generateInvoice,
      })

      if (generateInvoice && response.data.invoice_id) {
        toast.success('Job completed and invoice generated!')
      } else {
        toast.success('Job marked as complete!')
      }

      onComplete()
      onClose()
    } catch (err: any) {
      console.error('Complete job error:', err)
      toast.error(err.response?.data?.error || 'Failed to complete job')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Maintenance Job"
      size="xl"
    >
      <div className="space-y-6">
        {/* Job Summary */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {job.property?.property_name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{job.title}</div>
          {job.quote && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Quote Total: £{Number(job.quote.total).toFixed(2)}
            </div>
          )}
        </div>

        {/* Work Performed */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Work Performed *
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={4}
            value={workPerformed}
            onChange={(e) => setWorkPerformed(e.target.value)}
            placeholder="Describe the work completed..."
            required
          />
        </div>

        {/* Diagnosis/Notes */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Diagnosis / Technical Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Any technical findings or recommendations..."
          />
        </div>

        {/* Photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Before Photos
            </label>
            <PhotoUpload
              workOrderId={job.id}
              onUploadComplete={(photoId) => {
                setBeforePhotoIds([...beforePhotoIds, photoId])
              }}
              maxPhotos={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Work in Progress
            </label>
            <PhotoUpload
              workOrderId={job.id}
              onUploadComplete={(photoId) => {
                setInProgressPhotoIds([...inProgressPhotoIds, photoId])
              }}
              maxPhotos={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              After Photos *
            </label>
            <PhotoUpload
              workOrderId={job.id}
              onUploadComplete={(photoId) => {
                setAfterPhotoIds([...afterPhotoIds, photoId])
              }}
              maxPhotos={5}
            />
          </div>
        </div>

        {/* Actual Costs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Actual Hours Worked
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={actualHoursWorked}
              onChange={(e) => setActualHoursWorked(parseFloat(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Quoted: {quotedHours} hours
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Actual Parts Cost (£)
            </label>
            <div className="flex gap-2 items-center">
              <span className="text-gray-500 dark:text-gray-400">£</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={actualPartsCost}
                onChange={(e) => setActualPartsCost(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Quoted: £{Number(quotedPartsCost).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Generate Invoice */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={generateInvoice}
              onChange={(e) => setGenerateInvoice(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generate invoice automatically
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !workPerformed.trim() || afterPhotoIds.length === 0}
            loading={isSubmitting}
            fullWidth
            variant="primary"
          >
            Complete Job
          </Button>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
