import { useState, useEffect } from 'react'
import { Button, Card, Spinner, EmptyState, useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { cleaningJobsAPI, type CleaningJob } from '../../lib/api'
import { GlobalActivityTimeline } from '../../components/GlobalActivityTimeline'
import { useNavigate } from 'react-router-dom'
import './CleaningDashboard.css'

// HARDCODED for demo - In production, get from auth context
const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

export default function CleaningDashboard() {
  const [todaysJobs, setTodaysJobs] = useState<CleaningJob[]>([])
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
  })
  const [weeklyStats, setWeeklyStats] = useState({
    jobsScheduled: 0,
    revenue: 0,
  })
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadTodaysJobs()
    loadWeeklyStats()
  }, [])

  const loadTodaysJobs = () => {
    withLoading(async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const result = await cleaningJobsAPI.list(SERVICE_PROVIDER_ID, {
          from_date: today,
          to_date: today,
        })

        setTodaysJobs(result.data)

        // Calculate stats
        setStats({
          total: result.data.length,
          scheduled: result.data.filter(j => j.status === 'SCHEDULED').length,
          in_progress: result.data.filter(j => j.status === 'IN_PROGRESS').length,
          completed: result.data.filter(j => j.status === 'COMPLETED').length,
        })
      } catch (err: any) {
        toast.error('Failed to load cleaning jobs')
        console.error('Load jobs error:', err)
      }
    })
  }

  const loadWeeklyStats = async () => {
    try {
      // Get start of week (Monday)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(now)
      monday.setDate(now.getDate() + diffToMonday)
      monday.setHours(0, 0, 0, 0)

      // Get end of week (Sunday)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)

      const result = await cleaningJobsAPI.list(SERVICE_PROVIDER_ID, {
        from_date: monday.toISOString().split('T')[0],
        to_date: sunday.toISOString().split('T')[0],
      })

      const weekJobs = result.data

      // Calculate revenue from completed jobs
      const revenue = weekJobs
        .filter(j => j.status === 'COMPLETED')
        .reduce((sum, j) => sum + (j.actual_price || j.quoted_price), 0)

      setWeeklyStats({
        jobsScheduled: weekJobs.length,
        revenue: revenue,
      })
    } catch (err) {
      console.error('Failed to load weekly stats:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100'
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-100'
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading && todaysJobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="cleaning-dashboard container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cleaning Services Dashboard</h1>
        <Button onClick={() => navigate('/jobs/new')}>
          Schedule Cleaning
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Jobs Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">All scheduled jobs for today</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Scheduled</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.scheduled}</p>
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
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{stats.in_progress}</p>
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
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">Finished today</p>
        </Card>
      </div>

      {/* Today's Jobs List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Today's Cleaning Schedule</h2>

        {todaysJobs.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              title="No cleaning jobs scheduled"
              description="Schedule a new cleaning job to get started"
            />
          </Card>
        ) : (
          <div className="jobs-grid">
            {todaysJobs.map((job) => (
              <Card
                key={job.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {job.property?.property_name || 'Unknown Property'}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      {job.maintenance_issues_found > 0 && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-600">
                          {job.maintenance_issues_found} Issues Found
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{job.property?.address}</div>
                      <div>
                        <strong>Time:</strong> {job.scheduled_start_time} - {job.scheduled_end_time}
                      </div>
                      <div>
                        <strong>Worker:</strong> {job.assigned_worker
                          ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
                          : 'Unassigned'}
                      </div>
                      <div>
                        <strong>Customer:</strong> {job.customer?.business_name} ({job.customer?.contact_name})
                      </div>
                      {job.checklist_total_items > 0 && (
                        <div>
                          <strong>Checklist:</strong> {job.checklist_completed_items} / {job.checklist_total_items} items completed
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      £{Number(job.quoted_price).toFixed(2)}
                    </div>
                    {job.actual_price && job.actual_price !== job.quoted_price && (
                      <div className="text-sm text-gray-500">
                        Actual: £{Number(job.actual_price).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold mb-4 text-purple-900 dark:text-purple-100">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/jobs')}>
              View All Jobs
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/workers')}>
              Manage Workers
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
          <h3 className="font-semibold mb-4 text-indigo-900 dark:text-indigo-100">This Week</h3>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="mb-2">
              <span className="font-medium">Jobs Scheduled:</span>{' '}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{weeklyStats.jobsScheduled}</span>
            </div>
            <div>
              <span className="font-medium">Revenue:</span>{' '}
              <span className="text-green-600 dark:text-green-400 font-semibold">£{weeklyStats.revenue.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <h3 className="font-semibold mb-4 text-orange-900 dark:text-orange-100">Alerts</h3>
          <div className="text-sm">
            {stats.scheduled > 0 && (
              <div className="text-blue-600 dark:text-blue-400 mb-1 font-medium">
                {stats.scheduled} jobs pending
              </div>
            )}
            {todaysJobs.filter(j => !j.assigned_worker_id).length > 0 && (
              <div className="text-orange-600 dark:text-orange-400 font-medium">
                {todaysJobs.filter(j => !j.assigned_worker_id).length} jobs unassigned
              </div>
            )}
            {stats.scheduled === 0 && todaysJobs.filter(j => !j.assigned_worker_id).length === 0 && (
              <div className="text-gray-600 dark:text-gray-400">No alerts</div>
            )}
          </div>
        </Card>
      </div>

      {/* Global Activity Feed */}
      <div className="mt-8">
        <GlobalActivityTimeline limit={50} />
      </div>
    </div>
  )
}
