import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, AlertCircle, ChevronRight, Filter, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Job {
  id: string
  property_id: string
  property_name: string
  property_address: string
  scheduled_date: string
  scheduled_start_time: string | null
  scheduled_end_time: string | null
  status: string
  special_requirements: string | null
}

export default function MyJobs() {
  const navigate = useNavigate()
  const { worker } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming')

  useEffect(() => {
    fetchJobs()
  }, [worker, filter])

  const fetchJobs = async () => {
    if (!worker) return

    try {
      setLoading(true)
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      if (!token || !serviceProviderId) {
        setError('Authentication required')
        return
      }

      let url = `/api/cleaning-jobs?service_provider_id=${serviceProviderId}&assigned_worker_id=${worker.id}`

      // Add status filter
      if (filter === 'upcoming') {
        url += '&status=SCHEDULED&status=IN_PROGRESS'
      } else if (filter === 'completed') {
        url += '&status=COMPLETED'
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      setJobs(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const groupJobsByDate = (jobs: Job[]) => {
    const grouped: { [key: string]: Job[] } = {}
    jobs.forEach(job => {
      const date = job.scheduled_date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(job)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  const groupedJobs = groupJobsByDate(jobs)
  const sortedDates = Object.keys(groupedJobs).sort()

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          </div>
          <p className="text-sm text-gray-600 ml-14">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                filter === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                filter === 'completed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No jobs found
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'upcoming' && 'You have no upcoming jobs scheduled'}
              {filter === 'completed' && 'You have no completed jobs'}
              {filter === 'all' && 'You have no jobs assigned to you'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-bold text-gray-900">
                    {formatDate(date)}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({groupedJobs[date].length} {groupedJobs[date].length === 1 ? 'job' : 'jobs'})
                  </span>
                </div>

                {/* Jobs for this date */}
                <div className="space-y-3">
                  {groupedJobs[date].map((job) => (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Time and Status */}
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">
                              {job.scheduled_start_time && job.scheduled_end_time
                                ? `${job.scheduled_start_time} - ${job.scheduled_end_time}`
                                : 'Time TBD'}
                            </span>
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

                          {/* Special Requirements */}
                          {job.special_requirements && (
                            <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 text-sm text-amber-700">
                              ⚠️ {job.special_requirements}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
