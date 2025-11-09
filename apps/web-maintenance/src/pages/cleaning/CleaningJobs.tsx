import { useState, useEffect } from 'react'
import { Button, Input, Card, Spinner, EmptyState } from '@rightfit/ui-core'
import { useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { cleaningJobsAPI, type CleaningJob } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function CleaningJobs() {
  const { user } = useAuth()
  const SERVICE_PROVIDER_ID = user?.service_provider_id
  const [jobs, setJobs] = useState<CleaningJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<CleaningJob[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [jobs, searchQuery, statusFilter])

  const loadJobs = () => {
    withLoading(async () => {
      try {
        const result = await cleaningJobsAPI.list(SERVICE_PROVIDER_ID)
        setJobs(result.data)
      } catch (err: any) {
        toast.error('Failed to load cleaning jobs')
        console.error('Load jobs error:', err)
      }
    })
  }

  const applyFilters = () => {
    let filtered = jobs

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(job =>
        job.property?.property_name.toLowerCase().includes(query) ||
        job.property?.address.toLowerCase().includes(query) ||
        job.customer?.business_name.toLowerCase().includes(query) ||
        job.assigned_worker?.first_name.toLowerCase().includes(query) ||
        job.assigned_worker?.last_name.toLowerCase().includes(query)
      )
    }

    setFilteredJobs(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cleaning job?')) return

    withLoading(async () => {
      try {
        await cleaningJobsAPI.delete(id, SERVICE_PROVIDER_ID)
        toast.success('Cleaning job deleted')
        loadJobs()
      } catch (err: any) {
        toast.error('Failed to delete job')
        console.error('Delete error:', err)
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

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cleaning Jobs</h1>
        <Button onClick={() => navigate('/cleaning/jobs/new')}>
          Schedule New Job
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              type="text"
              placeholder="Search by property, customer, or worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Jobs</div>
          <div className="text-2xl font-bold">{jobs.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Scheduled</div>
          <div className="text-2xl font-bold text-blue-600">
            {jobs.filter(j => j.status === 'SCHEDULED').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">
            {jobs.filter(j => j.status === 'IN_PROGRESS').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.status === 'COMPLETED').length}
          </div>
        </Card>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title={searchQuery || statusFilter !== 'all' ? 'No jobs match your filters' : 'No cleaning jobs'}
          description="Schedule a new cleaning job to get started"
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
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
                        {job.maintenance_issues_found} Issues
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="font-medium">Date</div>
                      <div>{new Date(job.scheduled_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Time</div>
                      <div>{job.scheduled_start_time} - {job.scheduled_end_time}</div>
                    </div>
                    <div>
                      <div className="font-medium">Worker</div>
                      <div>
                        {job.assigned_worker
                          ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
                          : 'Unassigned'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Customer</div>
                      <div>{job.customer?.business_name}</div>
                    </div>
                  </div>

                  {job.checklist_total_items > 0 && (
                    <div className="mt-2 text-sm">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(job.checklist_completed_items / job.checklist_total_items) * 100}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {job.checklist_completed_items} / {job.checklist_total_items} checklist items completed
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-green-600">
                    £{job.quoted_price.toFixed(2)}
                  </div>
                  {job.actual_price && job.actual_price !== job.quoted_price && (
                    <div className="text-sm text-gray-500">
                      Actual: £{job.actual_price.toFixed(2)}
                    </div>
                  )}
                  <div className="mt-2 space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/cleaning/jobs/${job.id}/edit`)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(job.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
