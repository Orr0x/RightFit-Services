import { Clock, MapPin, ChevronRight, Play, CheckCircle } from 'lucide-react'
import { CleaningJob } from '../../types'

interface JobCardProps {
  job: CleaningJob
  onClick?: () => void
  showActions?: boolean
}

export default function JobCard({ job, onClick, showActions = false }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const canStartJob = job.status === 'SCHEDULED'
  const canCompleteJob = job.status === 'IN_PROGRESS'

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 transition-shadow ${
        onClick ? 'hover:shadow-md cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Time & Status */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">
                {job.scheduled_time_start} - {job.scheduled_time_end}
              </span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>

          {/* Property Name */}
          <h3 className="font-bold text-gray-900 mb-1">{job.property_name}</h3>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{job.property_address}</span>
          </div>

          {/* Customer */}
          {job.customer_name && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Customer:</span> {job.customer_name}
            </p>
          )}

          {/* Special Requirements */}
          {job.special_requirements && (
            <p className="text-sm text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
              ⚠️ {job.special_requirements}
            </p>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2 mt-3">
              {canStartJob && (
                <button className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  <Play className="w-4 h-4" />
                  Start Job
                </button>
              )}
              {canCompleteJob && (
                <button className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Complete Job
                </button>
              )}
            </div>
          )}
        </div>

        {onClick && <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />}
      </div>
    </div>
  )
}
