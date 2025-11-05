import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, ArrowLeft } from 'lucide-react'
import Calendar from 'react-calendar'
import { format, startOfMonth, endOfMonth, isSameDay, parseISO, isWithinInterval } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import { CleaningJob } from '../../types'
import 'react-calendar/dist/Calendar.css'

type ViewType = 'week' | 'month'

interface WorkerAvailability {
  id: string
  worker_id: string
  start_date: string
  end_date: string
  reason: string | null
  status: 'BLOCKED' | 'AVAILABLE'
}

export default function MySchedule() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('month')
  const [jobs, setJobs] = useState<CleaningJob[]>([])
  const [availability, setAvailability] = useState<WorkerAvailability[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (worker) {
      fetchJobs()
      fetchAvailability()
    }
  }, [worker, selectedDate, view])

  const fetchJobs = async () => {
    if (!worker) return

    setLoading(true)
    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      // Calculate date range based on view
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)

      const url = `/api/cleaning-jobs?service_provider_id=${serviceProviderId}&assigned_worker_id=${worker.id}&start_date=${format(start, 'yyyy-MM-dd')}&end_date=${format(end, 'yyyy-MM-dd')}`

      console.log('🔍 Fetching jobs for worker:', worker.id)
      console.log('🔗 API URL:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Jobs fetched:', data.data?.length, 'jobs')
        if (data.data?.length > 0) {
          console.log('📋 Sample job worker IDs:', data.data.slice(0, 3).map((j: any) => j.assigned_worker_id))
        }
        setJobs(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    if (!worker) return

    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      const response = await fetch(
        `/api/worker-availability?worker_id=${worker.id}&service_provider_id=${serviceProviderId}&status=BLOCKED`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAvailability(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    }
  }

  const isDateBlocked = (date: Date) => {
    return availability.some(block => {
      const start = parseISO(block.start_date)
      const end = parseISO(block.end_date)
      return isWithinInterval(date, { start, end })
    })
  }

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job =>
      isSameDay(parseISO(job.scheduled_date), date)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dayJobs = getJobsForDate(date)
    if (dayJobs.length === 0) return null

    return (
      <div className="flex flex-col items-center gap-0.5 mt-1">
        <div className="flex gap-0.5">
          {dayJobs.slice(0, 3).map((job, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full ${
                job.status === 'COMPLETED'
                  ? 'bg-green-600'
                  : job.status === 'IN_PROGRESS'
                  ? 'bg-blue-600'
                  : 'bg-amber-600'
              }`}
            />
          ))}
        </div>
        {dayJobs.length > 3 && (
          <span className="text-[10px] text-gray-600">+{dayJobs.length - 3}</span>
        )}
      </div>
    )
  }

  const selectedDateJobs = getJobsForDate(selectedDate)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7" />
            My Schedule
          </h1>
          <p className="text-gray-600 mt-1">
            {format(selectedDate, 'MMMM yyyy')}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              view === 'week'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              view === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar or Week View */}
          <div className="lg:col-span-2">
            {view === 'month' ? (
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <Calendar
                  value={selectedDate}
                  onChange={(value) => {
                    if (value instanceof Date) {
                      setSelectedDate(value)
                    }
                  }}
                  tileContent={tileContent}
                  tileClassName={({ date, view }) => {
                    if (view === 'month' && isDateBlocked(date)) {
                      return 'blocked-date'
                    }
                    return ''
                  }}
                  className="custom-calendar border-0 w-full"
                  showNeighboringMonth={false}
                />

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Legend:</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                      <span className="text-gray-600">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-gray-600">In Progress</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span className="text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                      <span className="text-gray-600">Blocked Date</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <WeekView
                jobs={jobs}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                getStatusColor={getStatusColor}
                navigate={navigate}
                isDateBlocked={isDateBlocked}
              />
            )}
          </div>

          {/* Jobs for Selected Date */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 sticky top-4">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-1">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedDateJobs.length === 0
                    ? 'No jobs scheduled'
                    : `${selectedDateJobs.length} ${selectedDateJobs.length === 1 ? 'job' : 'jobs'}`}
                </p>
              </div>

              {selectedDateJobs.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No jobs on this date</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {selectedDateJobs
                    .sort((a, b) => {
                      // Handle null/undefined scheduled_time_start
                      if (!a.scheduled_time_start) return 1;
                      if (!b.scheduled_time_start) return -1;
                      return a.scheduled_time_start.localeCompare(b.scheduled_time_start);
                    })
                    .map(job => (
                      <div
                        key={job.id}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {/* Time */}
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {job.scheduled_time_start || 'TBD'} - {job.scheduled_time_end || 'TBD'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Property */}
                        <h4 className="font-bold text-gray-900 text-sm mb-1">
                          {job.property_name}
                        </h4>

                        {/* Address */}
                        <div className="flex items-start gap-1.5 text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{job.property_address}</span>
                        </div>

                        {/* Special Requirements */}
                        {job.special_requirements && (
                          <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded line-clamp-2">
                            ⚠️ {job.special_requirements}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate)
            newDate.setMonth(newDate.getMonth() - 1)
            setSelectedDate(newDate)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Month
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate)
            newDate.setMonth(newDate.getMonth() + 1)
            setSelectedDate(newDate)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Next Month
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Week View Component
interface WeekViewProps {
  jobs: CleaningJob[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  getStatusColor: (status: string) => string
  navigate: any
  isDateBlocked: (date: Date) => boolean
}

function WeekView({ jobs, selectedDate, onDateSelect, getStatusColor, navigate, isDateBlocked }: WeekViewProps) {
  // Get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Get all days in the current week
  const getWeekDays = () => {
    const weekStart = getWeekStart(selectedDate)
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays()

  // Get jobs for a specific date
  const getJobsForDate = (date: Date) => {
    return jobs.filter(job =>
      isSameDay(parseISO(job.scheduled_date), date)
    ).sort((a, b) => {
      if (!a.scheduled_time_start) return 1
      if (!b.scheduled_time_start) return -1
      return a.scheduled_time_start.localeCompare(b.scheduled_time_start)
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {weekDays.map((day, idx) => {
        const dayJobs = getJobsForDate(day)
        const isToday = isSameDay(day, new Date())
        const isSelected = isSameDay(day, selectedDate)
        const blocked = isDateBlocked(day)

        return (
          <div
            key={idx}
            className={`border-b border-gray-200 last:border-b-0 ${
              isSelected ? 'bg-blue-50' : ''
            } ${blocked ? 'bg-red-50' : ''}`}
          >
            {/* Day Header */}
            <div
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                isToday ? 'bg-blue-100' : ''
              } ${blocked ? 'bg-red-100' : ''}`}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-lg ${isToday ? 'text-blue-600' : blocked ? 'text-red-700' : 'text-gray-900'}`}>
                      {format(day, 'EEEE')}
                    </p>
                    {blocked && (
                      <span className="text-xs font-semibold text-red-700 bg-red-200 px-2 py-0.5 rounded">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {format(day, 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Jobs for this day */}
            {dayJobs.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {dayJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {job.scheduled_time_start || 'TBD'} - {job.scheduled_time_end || 'TBD'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      {job.property_name}
                    </h4>
                    <div className="flex items-start gap-1.5 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{job.property_address}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
