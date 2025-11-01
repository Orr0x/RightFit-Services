import { useState, useEffect } from 'react'
import { Button, Card, Spinner, EmptyState, useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { maintenanceJobsAPI, type MaintenanceJob } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

// HARDCODED for demo - In production, get from auth context
const SERVICE_PROVIDER_ID = 'demo-provider-id'

export default function MaintenanceDashboard() {
  const [activeJobs, setActiveJobs] = useState<MaintenanceJob[]>([])
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    pending_quotes: 0,
    in_progress: 0,
  })
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadActiveJobs()
  }, [])

  const loadActiveJobs = () => {
    withLoading(async () => {
      try {
        const result = await maintenanceJobsAPI.list(SERVICE_PROVIDER_ID, {
          status: undefined, // Get all active jobs
        })

        // Filter out completed/cancelled
        const active = result.data.filter(j =>
          !['COMPLETED', 'CANCELLED'].includes(j.status)
        )
        setActiveJobs(active)

        // Calculate stats
        setStats({
          total: active.length,
          urgent: active.filter(j => j.priority === 'URGENT').length,
          pending_quotes: active.filter(j => j.status === 'QUOTE_PENDING').length,
          in_progress: active.filter(j => j.status === 'IN_PROGRESS').length,
        })
      } catch (err: any) {
        toast.error('Failed to load maintenance jobs')
        console.error('Load jobs error:', err)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUOTE_PENDING': return 'text-orange-600 bg-orange-100'
      case 'QUOTE_SENT': return 'text-blue-600 bg-blue-100'
      case 'APPROVED': return 'text-green-600 bg-green-100'
      case 'SCHEDULED': return 'text-purple-600 bg-purple-100'
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-100'
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'LOW': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'CLEANER_REPORT': return '🧹 Cleaner Report'
      case 'GUEST_REPORT': return '🏠 Guest Report'
      case 'CUSTOMER_REQUEST': return '📞 Customer Request'
      case 'EMERGENCY': return '🚨 Emergency'
      case 'PREVENTIVE_MAINTENANCE': return '🔧 Preventive'
      default: return source
    }
  }

  if (isLoading && activeJobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Maintenance Services Dashboard</h1>
        <Button onClick={() => navigate('/maintenance/jobs/new')}>
          Create Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Active Jobs</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </Card>
        <Card className="p-4 border-red-200">
          <div className="text-sm text-gray-600">Urgent Priority</div>
          <div className="text-3xl font-bold mt-2 text-red-600">{stats.urgent}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending Quotes</div>
          <div className="text-3xl font-bold mt-2 text-orange-600">{stats.pending_quotes}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-3xl font-bold mt-2 text-yellow-600">{stats.in_progress}</div>
        </Card>
      </div>

      {/* Active Jobs List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Active Maintenance Jobs</h2>

        {activeJobs.length === 0 ? (
          <EmptyState
            title="No active maintenance jobs"
            description="All jobs are completed or create a new one"
          />
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <Card
                key={job.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/maintenance/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <strong>Property:</strong> {job.property?.property_name} - {job.property?.address}
                      </div>
                      <div>
                        <strong>Category:</strong> {job.category}
                      </div>
                      <div>
                        <strong>Source:</strong> {getSourceBadge(job.source)}
                      </div>
                      {job.assigned_worker && (
                        <div>
                          <strong>Assigned to:</strong> {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                        </div>
                      )}
                      {job.scheduled_date && (
                        <div>
                          <strong>Scheduled:</strong> {new Date(job.scheduled_date).toLocaleDateString()}
                        </div>
                      )}
                      {job.quote && (
                        <div>
                          <strong>Quote:</strong> {job.quote.quote_number} - £{job.quote.total.toFixed(2)} ({job.quote.status})
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <div className="mt-2 text-sm text-gray-700 italic">
                        {job.description.length > 100
                          ? `${job.description.substring(0, 100)}...`
                          : job.description}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {job.estimated_total && (
                      <div className="text-xl font-bold text-blue-600">
                        £{job.estimated_total.toFixed(2)}
                      </div>
                    )}
                    {job.actual_total && (
                      <div className="text-sm text-green-600 font-semibold">
                        Actual: £{job.actual_total.toFixed(2)}
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
            <Button variant="outline" className="w-full" onClick={() => navigate('/maintenance/jobs')}>
              View All Jobs
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/quotes')}>
              Manage Quotes
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Cross-Sell Opportunities</h3>
          <div className="text-sm text-gray-600">
            <div>From Cleaning: {activeJobs.filter(j => j.source === 'CLEANER_REPORT').length}</div>
            <div>From Guests: {activeJobs.filter(j => j.source === 'GUEST_REPORT').length}</div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Revenue</h3>
          <div className="text-sm text-gray-600">
            <div>Estimated: £{activeJobs.reduce((sum, j) => sum + (j.estimated_total || 0), 0).toFixed(2)}</div>
            <div>Actual: £{activeJobs.reduce((sum, j) => sum + (j.actual_total || 0), 0).toFixed(2)}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
