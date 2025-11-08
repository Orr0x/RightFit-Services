import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { Calendar, Clock, CheckCircle, Briefcase, MapPin, ChevronRight } from 'lucide-react'
import { CleaningJob } from '../../types'

export default function WorkerDashboard() {
  const { worker } = useAuth()
  const [stats, setStats] = useState({
    jobsToday: 0,
    hoursThisWeek: 0,
    completedThisMonth: 0,
  })
  const [todaysJobs, setTodaysJobs] = useState<CleaningJob[]>([])
  const [todaysMaintenanceJobs, setTodaysMaintenanceJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isCleaningWorker = worker?.worker_type === 'CLEANER' || worker?.worker_type === 'GENERAL'
  const isMaintenanceWorker = worker?.worker_type === 'MAINTENANCE' || worker?.worker_type === 'GENERAL'

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      if (!token || !serviceProviderId) return

      // Fetch worker stats
      const statsResponse = await fetch(`/api/workers/${worker?.id}/stats?service_provider_id=${serviceProviderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          jobsToday: statsData.data?.upcomingJobs || 0,
          hoursThisWeek: statsData.data?.hoursThisWeek || 0,
          completedThisMonth: statsData.data?.completedThisMonth || 0,
        })
      }

      // Fetch today's jobs
      const today = format(new Date(), 'yyyy-MM-dd')

      // Fetch cleaning jobs if worker is a cleaner
      if (isCleaningWorker) {
        const jobsResponse = await fetch(
          `/api/cleaning-jobs?service_provider_id=${serviceProviderId}&assigned_worker_id=${worker?.id}&scheduled_date=${today}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          setTodaysJobs(jobsData.data || [])
        }
      }

      // Fetch maintenance jobs if worker is a maintenance worker
      if (isMaintenanceWorker) {
        const maintenanceResponse = await fetch(
          `/api/maintenance-jobs?service_provider_id=${serviceProviderId}&assigned_worker_id=${worker?.id}&scheduled_date=${today}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )

        if (maintenanceResponse.ok) {
          const maintenanceData = await maintenanceResponse.json()
          setTodaysMaintenanceJobs(maintenanceData.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Greeting Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {getGreeting()}, {worker?.first_name}!
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Jobs Today */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Jobs Today</p>
              <p className="text-4xl font-bold text-blue-900">{stats.jobsToday}</p>
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Hours This Week */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Hours This Week</p>
              <p className="text-4xl font-bold text-green-900">{stats.hoursThisWeek.toFixed(1)}</p>
            </div>
            <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Completed This Month */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Completed</p>
              <p className="text-4xl font-bold text-purple-900">{stats.completedThisMonth}</p>
            </div>
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Cleaning Jobs Section */}
      {isCleaningWorker && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {worker?.worker_type === 'GENERAL' ? "Today's Cleaning Jobs" : "Today's Jobs"}
            </h2>
            {todaysJobs.length > 0 && (
              <span className="text-sm text-gray-500">
                {todaysJobs.length} {todaysJobs.length === 1 ? 'job' : 'jobs'}
              </span>
            )}
          </div>

          {todaysJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No cleaning jobs scheduled today</p>
              <p className="text-sm text-gray-500">
                {isMaintenanceWorker ? 'Check maintenance jobs below' : 'Enjoy your day off!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/jobs/${job.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Time */}
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {job.scheduled_time_start || 'TBD'} - {job.scheduled_time_end || 'TBD'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Property */}
                      <h3 className="font-bold text-gray-900 mb-1">{job.property_name}</h3>

                      {/* Address */}
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{job.property_address}</span>
                      </div>

                      {/* Special Requirements */}
                      {job.special_requirements && (
                        <p className="text-sm text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
                          ⚠️ {job.special_requirements}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Maintenance Jobs Section */}
      {isMaintenanceWorker && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {worker?.worker_type === 'GENERAL' ? "Today's Maintenance Jobs" : "Today's Jobs"}
            </h2>
            {todaysMaintenanceJobs.length > 0 && (
              <span className="text-sm text-gray-500">
                {todaysMaintenanceJobs.length} {todaysMaintenanceJobs.length === 1 ? 'job' : 'jobs'}
              </span>
            )}
          </div>

          {todaysMaintenanceJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No maintenance jobs scheduled today</p>
              <p className="text-sm text-gray-500">
                {isCleaningWorker ? 'Check cleaning jobs above' : 'Enjoy your day off!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysMaintenanceJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-orange-50"
                  onClick={() => window.location.href = `/maintenance-jobs/${job.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {job.scheduled_time_start || 'TBD'} - {job.scheduled_time_end || 'TBD'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border bg-orange-100 text-orange-800 border-orange-300`}>
                          {job.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-1">{job.title || 'Maintenance Job'}</h3>

                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{job.property_address || job.property_name}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions (Optional) */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => window.location.href = '/schedule'}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
        >
          <Calendar className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900">My Schedule</p>
          <p className="text-sm text-gray-600">View all jobs</p>
        </button>

        <button
          onClick={() => window.location.href = '/availability'}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
        >
          <Clock className="w-6 h-6 text-purple-600 mb-2" />
          <p className="font-semibold text-gray-900">Availability</p>
          <p className="text-sm text-gray-600">Block dates</p>
        </button>
      </div>
    </div>
  )
}
