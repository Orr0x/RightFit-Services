import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { useRequiredServiceProvider } from '../hooks/useServiceProvider'
import { cleaningJobsAPI, workerAvailabilityAPI, type CleaningJob, type WorkerAvailability } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import { QuickEditJobModal } from '../components/calendar/QuickEditJobModal'
import './PropertyCalendar.css'
import './ContractDetails.css'

export default function PropertyCalendar() {
  const SERVICE_PROVIDER_ID = useRequiredServiceProvider()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [jobs, setJobs] = useState<CleaningJob[]>([])
  const [loading, setLoading] = useState(true)
  const [draggingJobId, setDraggingJobId] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<CleaningJob | null>(null)
  const [workerAvailability, setWorkerAvailability] = useState<Map<string, WorkerAvailability[]>>(new Map())
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
  }, [currentDate])

  const loadJobs = async () => {
    try {
      setLoading(true)
      // Load all jobs to show past, present, and future
      const result = await cleaningJobsAPI.list(SERVICE_PROVIDER_ID)
      setJobs(result.data)

      // Load worker availability for all assigned workers
      await loadWorkerAvailability(result.data)
    } catch (error: any) {
      console.error('Error loading jobs:', error)
      toast.error('Failed to load cleaning jobs')
    } finally {
      setLoading(false)
    }
  }

  const loadWorkerAvailability = async (jobsList: CleaningJob[]) => {
    try {
      // Get unique worker IDs from jobs
      const workerIds = new Set(
        jobsList
          .filter(job => job.assigned_worker_id)
          .map(job => job.assigned_worker_id!)
      )

      // Fetch availability for each worker (covering current month +/- 2 months)
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0)

      const availabilityMap = new Map<string, WorkerAvailability[]>()

      await Promise.all(
        Array.from(workerIds).map(async (workerId) => {
          try {
            const availability = await workerAvailabilityAPI.list(workerId, {
              status: 'BLOCKED',
              from_date: startDate.toISOString().split('T')[0],
              to_date: endDate.toISOString().split('T')[0],
            })
            availabilityMap.set(workerId, availability)
          } catch (error) {
            console.error(`Error loading availability for worker ${workerId}:`, error)
            // Continue with empty availability for this worker
            availabilityMap.set(workerId, [])
          }
        })
      )

      setWorkerAvailability(availabilityMap)
    } catch (error) {
      console.error('Error loading worker availability:', error)
      // Non-critical error, continue without availability data
    }
  }

  const isWorkerBlocked = (workerId: string, dateStr: string): boolean => {
    const availability = workerAvailability.get(workerId)
    if (!availability || availability.length === 0) return false

    const checkDate = new Date(dateStr)
    checkDate.setHours(0, 0, 0, 0)

    return availability.some(avail => {
      const start = new Date(avail.start_date)
      const end = new Date(avail.end_date)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return checkDate >= start && checkDate <= end
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date).toISOString().split('T')[0]
      return jobDate === dateStr
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          backgroundColor: '#dbeafe',
          color: '#1d4ed8',
          borderColor: '#93c5fd'
        }
      case 'IN_PROGRESS':
        return {
          backgroundColor: '#fef3c7',
          color: '#b45309',
          borderColor: '#fcd34d'
        }
      case 'COMPLETED':
        return {
          backgroundColor: '#d1fae5',
          color: '#065f46',
          borderColor: '#6ee7b7'
        }
      case 'CANCELLED':
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderColor: '#fca5a5'
        }
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          borderColor: '#d1d5db'
        }
    }
  }

  // Helper function to parse time string (HH:MM) to minutes since midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Check if two time ranges overlap
  const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const start1Min = parseTimeToMinutes(start1)
    const end1Min = parseTimeToMinutes(end1)
    const start2Min = parseTimeToMinutes(start2)
    const end2Min = parseTimeToMinutes(end2)

    return start1Min < end2Min && end1Min > start2Min
  }

  // Validate if job can be moved to new date
  const validateJobReschedule = (job: CleaningJob, newDateStr: string): { valid: boolean; message?: string } => {
    // Don't allow rescheduling completed or cancelled jobs
    if (job.status === 'COMPLETED') {
      return { valid: false, message: 'Cannot reschedule completed jobs' }
    }
    if (job.status === 'CANCELLED') {
      return { valid: false, message: 'Cannot reschedule cancelled jobs' }
    }

    // Don't allow moving jobs to the past (except same day)
    const newDate = new Date(newDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    newDate.setHours(0, 0, 0, 0)

    if (newDate < today) {
      return { valid: false, message: 'Cannot schedule jobs in the past' }
    }

    // Check for worker conflicts if worker is assigned
    if (job.assigned_worker_id) {
      // Check if worker is blocked on the target date
      if (isWorkerBlocked(job.assigned_worker_id, newDateStr)) {
        const workerName = `${job.assigned_worker?.first_name} ${job.assigned_worker?.last_name}`
        return {
          valid: false,
          message: `${workerName} is marked as unavailable on this date`
        }
      }

      // Get all jobs for this worker on the new date
      const workerJobsOnDate = jobs.filter(j =>
        j.id !== job.id && // Exclude the job being moved
        j.assigned_worker_id === job.assigned_worker_id &&
        new Date(j.scheduled_date).toISOString().split('T')[0] === newDateStr &&
        j.status !== 'CANCELLED' // Ignore cancelled jobs
      )

      // Check for time conflicts
      for (const existingJob of workerJobsOnDate) {
        if (timesOverlap(
          job.scheduled_start_time,
          job.scheduled_end_time,
          existingJob.scheduled_start_time,
          existingJob.scheduled_end_time
        )) {
          const workerName = `${job.assigned_worker?.first_name} ${job.assigned_worker?.last_name}`
          return {
            valid: false,
            message: `${workerName} is already scheduled from ${existingJob.scheduled_start_time} to ${existingJob.scheduled_end_time} on this date`
          }
        }
      }
    }

    return { valid: true }
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, job: CleaningJob, dateStr: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('jobId', job.id)
    e.dataTransfer.setData('oldDate', dateStr)
    setDraggingJobId(job.id)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingJobId(null)
    setDragOverDate(null)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(dateStr)
  }

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverDate(null)
  }

  // Handle drop
  const handleDrop = async (e: React.DragEvent, newDate: Date) => {
    e.preventDefault()
    const jobId = e.dataTransfer.getData('jobId')
    const oldDate = e.dataTransfer.getData('oldDate')

    setDragOverDate(null)
    setDraggingJobId(null)

    const newDateStr = newDate.toISOString().split('T')[0]

    // If dropped on same date, do nothing
    if (oldDate === newDateStr) {
      return
    }

    // Find the job
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      toast.error('Job not found')
      return
    }

    // Validate the move
    const validation = validateJobReschedule(job, newDateStr)
    if (!validation.valid) {
      toast.error(validation.message || 'Cannot reschedule this job')
      return
    }

    try {
      toast.info('Rescheduling job...')

      // Update via API
      await cleaningJobsAPI.update(jobId, {
        scheduled_date: newDateStr,
        service_provider_id: SERVICE_PROVIDER_ID,
      })

      // Refresh jobs to show updated state
      await loadJobs()

      const formattedDate = newDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      toast.success(`Job rescheduled to ${formattedDate}`)
    } catch (error: any) {
      console.error('Error rescheduling job:', error)
      toast.error(error.response?.data?.error || 'Failed to reschedule job')
    }
  }

  // Handle quick edit
  const handleQuickEdit = (e: React.MouseEvent | React.Touch, job: CleaningJob) => {
    e.stopPropagation() // Prevent navigation to job details
    setEditingJob(job)
  }

  // Handle right-click
  const handleContextMenu = (e: React.MouseEvent, job: CleaningJob) => {
    e.preventDefault() // Prevent default browser context menu
    e.stopPropagation()
    handleQuickEdit(e, job)
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDate = new Date(year, month, -startingDayOfWeek + i + 1)
      const dayJobs = getJobsForDate(prevMonthDate)
      const isLastColumn = (i % 7) === 6
      const dateStr = prevMonthDate.toISOString().split('T')[0]
      const isDropTarget = dragOverDate === dateStr

      days.push(
        <div
          key={`empty-${i}`}
          className="p-2"
          onDragOver={(e) => handleDragOver(e, dateStr)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, prevMonthDate)}
          style={{
            minHeight: '120px',
            backgroundColor: isDropTarget ? '#e0f2fe' : '#f9fafb',
            borderRight: isLastColumn ? 'none' : '1px solid #d1d5db',
            borderBottom: '1px solid #d1d5db',
            transition: 'background-color 0.2s'
          }}
        >
          <div className="text-sm font-medium mb-1" style={{ color: '#9ca3af' }}>
            {prevMonthDate.getDate()}
          </div>
          {dayJobs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {dayJobs.map(job => {
                const colors = getStatusColor(job.status)
                const isDragging = draggingJobId === job.id
                const canDrag = job.status === 'SCHEDULED' || job.status === 'IN_PROGRESS'

                return (
                  <div
                    key={job.id}
                    draggable={canDrag}
                    onDragStart={(e) => canDrag && handleDragStart(e, job, dateStr)}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleContextMenu(e, job)}
                    className="text-xs p-1 rounded"
                    onClick={(e) => {
                      if (!isDragging) {
                        navigate(`/jobs/${job.id}`)
                      }
                    }}
                    style={{
                      ...colors,
                      border: `1px solid ${colors.borderColor}`,
                      transition: 'opacity 0.2s, transform 0.2s',
                      fontWeight: '500',
                      cursor: canDrag ? 'grab' : 'pointer',
                      opacity: isDragging ? 0.4 : 1,
                      transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => !isDragging && (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => !isDragging && (e.currentTarget.style.opacity = '1')}
                  >
                    <div className="truncate">
                      {job.scheduled_start_time} - {job.property?.property_name}
                    </div>
                    {/* Quick edit button */}
                    <button
                      onClick={(e) => handleQuickEdit(e, job)}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: `1px solid ${colors.borderColor}`,
                        borderRadius: '3px',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        opacity: 0.7,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.7'
                      }}
                      title="Quick edit"
                    >
                      <EditIcon style={{ fontSize: '12px', color: colors.color }} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayJobs = getJobsForDate(date)
      const isTodayDate = isToday(date)
      const cellIndex = startingDayOfWeek + day - 1
      const isLastColumn = (cellIndex % 7) === 6
      const dateStr = date.toISOString().split('T')[0]
      const isDropTarget = dragOverDate === dateStr

      days.push(
        <div
          key={day}
          className="p-2"
          onDragOver={(e) => handleDragOver(e, dateStr)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, date)}
          style={{
            minHeight: '120px',
            backgroundColor: isDropTarget ? '#e0f2fe' : (isTodayDate ? '#eff6ff' : '#ffffff'),
            borderRight: isLastColumn ? 'none' : '1px solid #d1d5db',
            borderBottom: '1px solid #d1d5db',
            transition: 'background-color 0.2s'
          }}
        >
          <div
            className="text-sm font-medium mb-1"
            style={{
              color: isTodayDate ? '#2563eb' : '#111827',
              fontWeight: isTodayDate ? '700' : '500'
            }}
          >
            {day}
            {isTodayDate && <span className="ml-1 text-xs">(Today)</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {dayJobs.map(job => {
              const colors = getStatusColor(job.status)
              const isDragging = draggingJobId === job.id
              const canDrag = job.status === 'SCHEDULED' || job.status === 'IN_PROGRESS'

              return (
                <div
                  key={job.id}
                  draggable={canDrag}
                  onDragStart={(e) => canDrag && handleDragStart(e, job, dateStr)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, job)}
                  className="text-xs p-1 rounded"
                  onClick={(e) => {
                    if (!isDragging) {
                      navigate(`/jobs/${job.id}`)
                    }
                  }}
                  title={`${job.property?.property_name} - ${job.customer?.business_name}\n${job.scheduled_start_time} - ${job.scheduled_end_time}\nWorker: ${job.assigned_worker ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}` : 'Unassigned'}\n${canDrag ? 'Drag to reschedule' : 'Cannot reschedule ' + job.status.toLowerCase() + ' jobs'}\nRight-click or click edit icon for quick edit`}
                  style={{
                    ...colors,
                    border: `1px solid ${colors.borderColor}`,
                    transition: 'opacity 0.2s, transform 0.2s',
                    fontWeight: '500',
                    cursor: canDrag ? 'grab' : 'pointer',
                    opacity: isDragging ? 0.4 : 1,
                    transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => !isDragging && (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => !isDragging && (e.currentTarget.style.opacity = '1')}
                >
                  <div className="truncate">
                    {job.scheduled_start_time} - {job.property?.property_name}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.75 }} className="truncate">
                    {job.assigned_worker
                      ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
                      : 'Unassigned'}
                  </div>
                  {/* Quick edit button */}
                  <button
                    onClick={(e) => handleQuickEdit(e, job)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: '3px',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.7'
                    }}
                    title="Quick edit"
                  >
                    <EditIcon style={{ fontSize: '12px', color: colors.color }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Add empty cells for days after the last day of the month
    const totalCells = days.length
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(year, month + 1, i)
      const dayJobs = getJobsForDate(nextMonthDate)
      const cellIndex = totalCells + i - 1
      const isLastColumn = (cellIndex % 7) === 6
      const dateStr = nextMonthDate.toISOString().split('T')[0]
      const isDropTarget = dragOverDate === dateStr

      days.push(
        <div
          key={`next-${i}`}
          className="p-2"
          onDragOver={(e) => handleDragOver(e, dateStr)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, nextMonthDate)}
          style={{
            minHeight: '120px',
            backgroundColor: isDropTarget ? '#e0f2fe' : '#f9fafb',
            borderRight: isLastColumn ? 'none' : '1px solid #d1d5db',
            borderBottom: '1px solid #d1d5db',
            transition: 'background-color 0.2s'
          }}
        >
          <div className="text-sm font-medium mb-1" style={{ color: '#9ca3af' }}>
            {i}
          </div>
          {dayJobs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {dayJobs.map(job => {
                const colors = getStatusColor(job.status)
                const isDragging = draggingJobId === job.id
                const canDrag = job.status === 'SCHEDULED' || job.status === 'IN_PROGRESS'

                return (
                  <div
                    key={job.id}
                    draggable={canDrag}
                    onDragStart={(e) => canDrag && handleDragStart(e, job, dateStr)}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleContextMenu(e, job)}
                    className="text-xs p-1 rounded"
                    onClick={(e) => {
                      if (!isDragging) {
                        navigate(`/jobs/${job.id}`)
                      }
                    }}
                    style={{
                      ...colors,
                      border: `1px solid ${colors.borderColor}`,
                      transition: 'opacity 0.2s, transform 0.2s',
                      fontWeight: '500',
                      cursor: canDrag ? 'grab' : 'pointer',
                      opacity: isDragging ? 0.4 : 1,
                      transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => !isDragging && (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => !isDragging && (e.currentTarget.style.opacity = '1')}
                  >
                    <div className="truncate">
                      {job.scheduled_start_time} - {job.property?.property_name}
                    </div>
                    {/* Quick edit button */}
                    <button
                      onClick={(e) => handleQuickEdit(e, job)}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: `1px solid ${colors.borderColor}`,
                        borderRadius: '3px',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        opacity: 0.7,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.7'
                      }}
                      title="Quick edit"
                    >
                      <EditIcon style={{ fontSize: '12px', color: colors.color }} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const { year, month } = getDaysInMonth(currentDate)

  // Get jobs for current month being viewed
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const monthJobs = jobs.filter(job => {
    const jobDate = new Date(job.scheduled_date)
    return jobDate >= monthStart && jobDate <= monthEnd
  })

  // Get unique workers and properties for the month
  const uniqueWorkerIds = new Set(
    monthJobs
      .filter(job => job.assigned_worker)
      .map(job => job.assigned_worker!.id)
  )
  const uniqueWorkers = Array.from(uniqueWorkerIds).map(workerId => {
    const job = monthJobs.find(j => j.assigned_worker?.id === workerId)
    return job?.assigned_worker!
  }).filter(Boolean)

  const uniqueProperties = new Set(
    monthJobs
      .filter(job => job.property)
      .map(job => job.property!.property_name)
  )

  return (
    <div className="property-calendar-page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {monthNames[month]} {year}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={goToPreviousMonth}>
            ← Previous
          </Button>
          <Button variant="secondary" onClick={goToToday}>
            Today
          </Button>
          <Button variant="secondary" onClick={goToNextMonth}>
            Next →
          </Button>
          <Button onClick={() => navigate('/jobs/new')}>
            + Schedule Job
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="calendar-stats">
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{monthJobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">This month</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Scheduled</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{monthJobs.filter(j => j.status === 'SCHEDULED').length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Awaiting start</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{monthJobs.filter(j => j.status === 'IN_PROGRESS').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Currently active</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{monthJobs.filter(j => j.status === 'COMPLETED').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">Successfully finished</p>
        </Card>
      </div>

      {/* Status Legend */}
      <Card className="p-4 mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div className="text-sm font-medium text-gray-700">Status Legend:</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#dbeafe',
                border: '2px solid #93c5fd',
                borderRadius: '4px'
              }}
            ></div>
            <span className="text-sm">Scheduled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fef3c7',
                border: '2px solid #fcd34d',
                borderRadius: '4px'
              }}
            ></div>
            <span className="text-sm">In Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#d1fae5',
                border: '2px solid #6ee7b7',
                borderRadius: '4px'
              }}
            ></div>
            <span className="text-sm">Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fee2e2',
                border: '2px solid #fca5a5',
                borderRadius: '4px'
              }}
            ></div>
            <span className="text-sm">Cancelled</span>
          </div>
          <div className="text-sm text-gray-600 ml-auto">💡 Drag & drop to reschedule jobs</div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ border: '2px solid #d1d5db' }}>
        {/* Day headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '2px solid #d1d5db'
          }}
          className="bg-gray-100"
        >
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
            (day, idx) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-semibold text-gray-700"
                style={{
                  borderRight: idx < 6 ? '1px solid #d1d5db' : 'none'
                }}
              >
                {day}
              </div>
            )
          )}
        </div>

        {/* Calendar days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {renderCalendar()}
        </div>
      </div>

      {/* Properties Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          Properties This Month
        </h2>
        <div className="customer-info-grid">
          {Array.from(uniqueProperties).map((propertyName) => {
            const propertyJobs = monthJobs.filter(job => job.property?.property_name === propertyName)
            const property = propertyJobs[0]?.property
            const completedCount = propertyJobs.filter(j => j.status === 'COMPLETED').length

            return (
              <Card
                key={propertyName}
                className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => property?.id && navigate(`/properties/${property.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏠</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100">{propertyName}</h3>
                    {property?.address && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{property.address}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Jobs this month</span>
                    <span className="text-lg font-extrabold text-blue-900 dark:text-blue-100">{propertyJobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Completed</span>
                    <span className="text-lg font-extrabold text-green-700 dark:text-green-300">
                      {completedCount}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        {uniqueProperties.size === 0 && (
          <Card className="p-8">
            <p className="text-center text-gray-500">No properties with scheduled jobs this month</p>
          </Card>
        )}
      </div>

      {/* Workers Section */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">👷</span>
          Workers This Month
        </h2>
        <div className="customer-info-grid">
          {uniqueWorkers.map((worker) => {
            const workerJobs = monthJobs.filter(
              job => job.assigned_worker?.id === worker.id
            )
            const completedCount = workerJobs.filter(j => j.status === 'COMPLETED').length
            const inProgressCount = workerJobs.filter(j => j.status === 'IN_PROGRESS').length

            return (
              <Card
                key={worker.id}
                className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/workers/${worker.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-900 dark:text-purple-100">
                      {worker.first_name} {worker.last_name}
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">{worker.email}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Jobs assigned</span>
                    <span className="text-lg font-extrabold text-purple-900 dark:text-purple-100">{workerJobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Completed</span>
                    <span className="text-lg font-extrabold text-green-700 dark:text-green-300">
                      {completedCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">In Progress</span>
                    <span className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                      {inProgressCount}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        {uniqueWorkers.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-gray-500">No workers assigned to jobs this month</p>
          </Card>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingJob && (
        <QuickEditJobModal
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={loadJobs}
        />
      )}
    </div>
  )
}
