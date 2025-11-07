import { useState, useEffect } from 'react'
import { Modal, Button, Select, useToast } from '../ui'
import { cleaningJobsAPI, workersAPI, workerAvailabilityAPI, type CleaningJob, type Worker, type WorkerAvailability } from '../../lib/api'
import { useRequiredServiceProvider } from '../../hooks/useServiceProvider'

interface QuickEditJobModalProps {
  job: CleaningJob
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      times.push({
        value: timeValue,
        label: timeValue
      })
    }
  }
  return times
}

export function QuickEditJobModal({ job, isOpen, onClose, onSuccess }: QuickEditJobModalProps) {
  const SERVICE_PROVIDER_ID = useRequiredServiceProvider()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingWorkers, setLoadingWorkers] = useState(true)
  const toast = useToast()

  const [startTime, setStartTime] = useState(job.scheduled_start_time)
  const [endTime, setEndTime] = useState(job.scheduled_end_time)
  const [workerId, setWorkerId] = useState(job.assigned_worker_id || '')
  const [status, setStatus] = useState(job.status)

  const [allJobs, setAllJobs] = useState<CleaningJob[]>([])
  const [workerAvailability, setWorkerAvailability] = useState<Map<string, WorkerAvailability[]>>(new Map())

  const timeOptions = generateTimeOptions()

  const statusOptions = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  useEffect(() => {
    if (isOpen) {
      fetchWorkers()
      fetchJobsAndAvailability()
      // Reset form when modal opens
      setStartTime(job.scheduled_start_time)
      setEndTime(job.scheduled_end_time)
      setWorkerId(job.assigned_worker_id || '')
      setStatus(job.status)
    }
  }, [isOpen, job])

  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true)
      const workersList = await workersAPI.list(SERVICE_PROVIDER_ID)
      // Only show active cleaners
      const activeWorkers = workersList.filter(w =>
        w.is_active && (w.worker_type === 'CLEANER' || w.worker_type === 'BOTH')
      )
      setWorkers(activeWorkers)
    } catch (error: any) {
      console.error('Error loading workers:', error)
      toast.error('Failed to load workers')
    } finally {
      setLoadingWorkers(false)
    }
  }

  const fetchJobsAndAvailability = async () => {
    try {
      // Fetch all jobs for the job date
      const jobsResult = await cleaningJobsAPI.list(SERVICE_PROVIDER_ID)
      setAllJobs(jobsResult.data)

      // Fetch worker availability for all workers
      const workersList = await workersAPI.list(SERVICE_PROVIDER_ID)
      const activeWorkerIds = workersList
        .filter(w => w.is_active && (w.worker_type === 'CLEANER' || w.worker_type === 'BOTH'))
        .map(w => w.id)

      const availabilityMap = new Map<string, WorkerAvailability[]>()

      await Promise.all(
        activeWorkerIds.map(async (workerId) => {
          try {
            const jobDate = new Date(job.scheduled_date)
            const startDate = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate())
            const endDate = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate())

            const availability = await workerAvailabilityAPI.list(workerId, {
              status: 'BLOCKED',
              from_date: startDate.toISOString().split('T')[0],
              to_date: endDate.toISOString().split('T')[0],
            })
            availabilityMap.set(workerId, availability)
          } catch (error) {
            console.error(`Error loading availability for worker ${workerId}:`, error)
            availabilityMap.set(workerId, [])
          }
        })
      )

      setWorkerAvailability(availabilityMap)
    } catch (error) {
      console.error('Error loading jobs and availability:', error)
    }
  }

  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const start1Min = parseTimeToMinutes(start1)
    const end1Min = parseTimeToMinutes(end1)
    const start2Min = parseTimeToMinutes(start2)
    const end2Min = parseTimeToMinutes(end2)

    return start1Min < end2Min && end1Min > start2Min
  }

  const isWorkerBlocked = (workerId: string): boolean => {
    const availability = workerAvailability.get(workerId)
    if (!availability || availability.length === 0) return false

    const jobDate = new Date(job.scheduled_date)
    jobDate.setHours(0, 0, 0, 0)

    return availability.some(avail => {
      const start = new Date(avail.start_date)
      const end = new Date(avail.end_date)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return jobDate >= start && jobDate <= end
    })
  }

  const isWorkerAvailable = (workerId: string): boolean => {
    // Skip check if this is the currently assigned worker
    if (workerId === job.assigned_worker_id) {
      return true
    }

    // Check if worker is blocked on this date
    if (isWorkerBlocked(workerId)) {
      return false
    }

    // Check for schedule conflicts
    const jobDateStr = new Date(job.scheduled_date).toISOString().split('T')[0]
    const workerJobsOnDate = allJobs.filter(j =>
      j.id !== job.id && // Exclude current job
      j.assigned_worker_id === workerId &&
      new Date(j.scheduled_date).toISOString().split('T')[0] === jobDateStr &&
      j.status !== 'CANCELLED' // Ignore cancelled jobs
    )

    // Check for time conflicts
    for (const existingJob of workerJobsOnDate) {
      if (timesOverlap(
        startTime,
        endTime,
        existingJob.scheduled_start_time,
        existingJob.scheduled_end_time
      )) {
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    // Validation
    if (startTime >= endTime) {
      toast.error('End time must be after start time')
      return
    }

    try {
      setLoading(true)

      await cleaningJobsAPI.update(job.id, {
        scheduled_start_time: startTime,
        scheduled_end_time: endTime,
        assigned_worker_id: workerId || null,
        status: status as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
        service_provider_id: SERVICE_PROVIDER_ID,
      })

      toast.success('Job updated successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating job:', error)
      toast.error(error.response?.data?.error || 'Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  const availableWorkers = workers.filter(w => isWorkerAvailable(w.id))

  const workerOptions = [
    { value: '', label: 'Unassigned' },
    ...availableWorkers.map(w => ({
      value: w.id,
      label: `${w.first_name} ${w.last_name}`
    }))
  ]

  const unavailableCount = workers.length - availableWorkers.length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Edit Job"
      size="sm"
      footer={
        <div className="modal-footer-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || loadingWorkers}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Job Info */}
        <div style={{
          padding: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {job.property?.property_name}
          </div>
          <div style={{ color: '#6b7280' }}>
            {new Date(job.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <Select
            label="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            options={timeOptions}
            required
            fullWidth
          />
        </div>

        <div>
          <Select
            label="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            options={timeOptions}
            required
            fullWidth
          />
        </div>

        {/* Worker Selection */}
        <div>
          <Select
            label="Assigned Worker"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            options={workerOptions}
            disabled={loadingWorkers}
            fullWidth
            helperText={
              loadingWorkers
                ? 'Loading workers...'
                : unavailableCount > 0
                ? `${unavailableCount} worker${unavailableCount > 1 ? 's' : ''} unavailable (blocked or already scheduled)`
                : undefined
            }
          />
        </div>

        {/* Status Selection */}
        <div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            required
            fullWidth
          />
        </div>

        {/* Duration Info */}
        <div style={{
          padding: '12px',
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#1e40af'
        }}>
          <strong>Duration:</strong> {calculateDuration(startTime, endTime)}
        </div>
      </div>
    </Modal>
  )
}

// Helper to calculate duration
function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  const diffMinutes = endMinutes - startMinutes

  if (diffMinutes <= 0) return 'Invalid'

  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}
