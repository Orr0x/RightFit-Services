import { useState } from 'react'
import { Card } from './ui'
import type { MaintenanceJob } from '../lib/api'

interface CalendarViewProps {
  jobs: MaintenanceJob[]
  onJobClick: (job: MaintenanceJob) => void
}

export function CalendarView({ jobs, onJobClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getJobsForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0]

    return jobs.filter(job => {
      if (!job.scheduled_date) return false
      const jobDateStr = new Date(job.scheduled_date).toISOString().split('T')[0]
      return jobDateStr === dateStr
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="calendar-view">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Names */}
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 py-2 text-sm"
          >
            {day}
          </div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-[120px]" />
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const dayJobs = getJobsForDate(day)
          const isTodayDate = isToday(day)

          return (
            <Card
              key={day}
              className={`min-h-[120px] p-2 ${
                isTodayDate ? 'border-2 border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm font-semibold ${
                    isTodayDate ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>
                {dayJobs.length > 0 && (
                  <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">
                    {dayJobs.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayJobs.slice(0, 3).map(job => (
                  <div
                    key={job.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onJobClick(job)
                    }}
                    className={`text-xs p-1.5 rounded cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(
                      job.priority
                    )}`}
                    style={{ backgroundColor: 'white' }}
                  >
                    <div className="font-semibold truncate text-gray-800">
                      {job.scheduled_start_time} - {job.title}
                    </div>
                    <div className="text-gray-600 truncate">
                      {job.property?.property_name}
                    </div>
                  </div>
                ))}
                {dayJobs.length > 3 && (
                  <div className="text-xs text-blue-600 font-medium pl-1.5">
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm">
        <span className="font-semibold">Priority:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Low</span>
        </div>
      </div>
    </div>
  )
}
