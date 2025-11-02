import { useState, useEffect } from 'react'
import { Button, Card, Spinner, EmptyState, useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { cleaningJobsAPI, type CleaningJob } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

// HARDCODED for demo - In production, get from auth context
const SERVICE_PROVIDER_ID = 'demo-provider-id'

export default function CleaningDashboard() {
  const [todaysJobs, setTodaysJobs] = useState<CleaningJob[]>([])
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
  })
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadTodaysJobs()
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cleaning Services Dashboard</h1>
        <Button onClick={() => navigate('/cleaning/jobs/new')}>
          Schedule Cleaning
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Jobs Today</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Scheduled</div>
          <div className="text-3xl font-bold mt-2 text-blue-600">{stats.scheduled}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-3xl font-bold mt-2 text-yellow-600">{stats.in_progress}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</div>
        </Card>
      </div>

      {/* Today's Jobs List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Cleaning Schedule</h2>

        {todaysJobs.length === 0 ? (
          <EmptyState
            title="No cleaning jobs scheduled"
            description="Schedule a new cleaning job to get started"
          />
        ) : (
          <div className="space-y-4">
            {todaysJobs.map((job) => (
              <Card
                key={job.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/cleaning/jobs/${job.id}`)}
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
                      £{job.quoted_price.toFixed(2)}
                    </div>
                    {job.actual_price && job.actual_price !== job.quoted_price && (
                      <div className="text-sm text-gray-500">
                        Actual: £{job.actual_price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/cleaning/jobs')}>
              View All Jobs
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/workers')}>
              Manage Workers
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">This Week</h3>
          <div className="text-sm text-gray-600">
            <div>Jobs Scheduled: Loading...</div>
            <div>Revenue: £0.00</div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Alerts</h3>
          <div className="text-sm">
            {stats.scheduled > 0 && (
              <div className="text-blue-600 mb-1">
                {stats.scheduled} jobs pending
              </div>
            )}
            {todaysJobs.filter(j => !j.assigned_worker_id).length > 0 && (
              <div className="text-orange-600">
                {todaysJobs.filter(j => !j.assigned_worker_id).length} jobs unassigned
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
