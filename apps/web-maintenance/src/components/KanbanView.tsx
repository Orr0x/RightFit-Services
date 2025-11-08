import { Card } from '@rightfit/ui-core'
import type { MaintenanceJob } from '../lib/api'

interface KanbanViewProps {
  jobs: MaintenanceJob[]
  onJobClick: (job: MaintenanceJob) => void
}

export function KanbanView({ jobs, onJobClick }: KanbanViewProps) {
  const columns = [
    {
      id: 'QUOTE_PENDING',
      title: 'Quote Pending',
      statuses: ['QUOTE_PENDING'],
      color: 'border-orange-500',
    },
    {
      id: 'QUOTE_SENT',
      title: 'Quote Sent',
      statuses: ['QUOTE_SENT'],
      color: 'border-blue-500',
    },
    {
      id: 'APPROVED',
      title: 'Approved',
      statuses: ['APPROVED'],
      color: 'border-green-500',
    },
    {
      id: 'SCHEDULED',
      title: 'Scheduled',
      statuses: ['SCHEDULED'],
      color: 'border-purple-500',
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      statuses: ['IN_PROGRESS'],
      color: 'border-yellow-500',
    },
    {
      id: 'COMPLETED',
      title: 'Completed',
      statuses: ['COMPLETED'],
      color: 'border-gray-500',
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'LOW': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getJobsForColumn = (statuses: string[]) => {
    return jobs.filter(job => statuses.includes(job.status))
  }

  return (
    <div className="kanban-view">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {columns.map(column => {
          const columnJobs = getJobsForColumn(column.statuses)

          return (
            <div key={column.id} className="kanban-column">
              {/* Column Header */}
              <div className={`border-t-4 ${column.color} bg-gray-50 rounded-t-lg p-3 mb-2`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                  <span className="bg-gray-600 text-white text-xs rounded-full px-2 py-1">
                    {columnJobs.length}
                  </span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 min-h-[200px]">
                {columnJobs.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No jobs
                  </div>
                ) : (
                  columnJobs.map(job => (
                    <Card
                      key={job.id}
                      className="p-3 cursor-pointer hover:shadow-lg transition-shadow border-l-4"
                      style={{
                        borderLeftColor:
                          job.priority === 'URGENT'
                            ? '#dc2626'
                            : job.priority === 'HIGH'
                            ? '#ea580c'
                            : job.priority === 'MEDIUM'
                            ? '#ca8a04'
                            : '#6b7280',
                      }}
                      onClick={() => onJobClick(job)}
                    >
                      {/* Priority Badge */}
                      <div className="mb-2">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(
                            job.priority
                          )}`}
                        >
                          {job.priority}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h4 className="font-semibold text-sm mb-2 text-gray-900 line-clamp-2">
                        {job.title}
                      </h4>

                      {/* Property */}
                      <div className="text-xs text-gray-600 mb-2">
                        📍 {job.property?.property_name}
                      </div>

                      {/* Category */}
                      <div className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 inline-block mb-2">
                        {job.category}
                      </div>

                      {/* Assigned Worker */}
                      {job.assigned_worker && (
                        <div className="text-xs text-gray-600 mb-2">
                          👤 {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                        </div>
                      )}

                      {/* Scheduled Date */}
                      {job.scheduled_date && (
                        <div className="text-xs text-purple-600 font-medium mb-2">
                          📅 {new Date(job.scheduled_date).toLocaleDateString()}
                          {job.scheduled_start_time && ` at ${job.scheduled_start_time}`}
                        </div>
                      )}

                      {/* Quote/Total */}
                      {job.estimated_total && (
                        <div className="text-sm font-bold text-blue-600 mt-2">
                          £{Number(job.estimated_total).toFixed(2)}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
