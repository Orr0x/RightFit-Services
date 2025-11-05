import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History as HistoryIcon, Clock, Calendar, DollarSign, MapPin, Filter } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'

interface HistoryJob {
  id: string
  property_name: string
  property_address: string
  scheduled_date: string
  scheduled_time_start: string
  scheduled_time_end: string
  status: string
  hours_worked: number | null
  amount_paid: number | null
  completion_notes: string | null
}

export default function WorkHistory() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<HistoryJob[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'week' | 'month' | 'year'>('month')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (worker) {
      fetchHistory()
    }
  }, [worker, filter])

  const fetchHistory = async () => {
    if (!worker) return

    setLoading(true)
    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      // Calculate date filter
      const now = new Date()
      let fromDate = ''

      switch (filter) {
        case 'week':
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          fromDate = format(weekAgo, 'yyyy-MM-dd')
          break
        case 'month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          fromDate = format(monthAgo, 'yyyy-MM-dd')
          break
        case 'year':
          const yearAgo = new Date(now)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          fromDate = format(yearAgo, 'yyyy-MM-dd')
          break
      }

      let url = `/api/cleaning-jobs?service_provider_id=${serviceProviderId}&assigned_worker_id=${worker.id}&status=COMPLETED`

      if (fromDate) {
        url += `&start_date=${fromDate}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setJobs(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.property_address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalHours = filteredJobs.reduce((sum, job) => sum + (job.hours_worked || 0), 0)
  const totalEarnings = filteredJobs.reduce((sum, job) => sum + (job.amount_paid || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HistoryIcon className="w-7 h-7" />
          Work History
        </h1>
        <p className="text-gray-600 mt-1">View your completed jobs and earnings</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Completed Jobs</p>
              <p className="text-3xl font-bold text-blue-900">{filteredJobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-green-900">{totalHours.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-purple-900">${totalEarnings.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {['all', 'week', 'month', 'year'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All Time' : `Past ${f.charAt(0).toUpperCase() + f.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by property name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading history...</p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Jobs</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'No jobs match your search criteria'
              : 'Your completed jobs will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs
            .sort((a, b) =>
              new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
            )
            .map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(parseISO(job.scheduled_date), 'EEEE, MMMM d, yyyy')}</span>
                      <span className="text-gray-400">•</span>
                      <Clock className="w-4 h-4" />
                      <span>
                        {job.scheduled_time_start} - {job.scheduled_time_end}
                      </span>
                    </div>

                    {/* Property */}
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{job.property_name}</h3>

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{job.property_address}</span>
                    </div>

                    {/* Notes */}
                    {job.completion_notes && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">{job.completion_notes}</p>
                      </div>
                    )}

                    {/* Hours and Earnings */}
                    <div className="flex items-center gap-4 text-sm">
                      {job.hours_worked !== null && (
                        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{job.hours_worked.toFixed(1)} hours</span>
                        </div>
                      )}
                      {job.amount_paid !== null && (
                        <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">${job.amount_paid.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-300">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
