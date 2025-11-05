import { useState, useEffect } from 'react'
import { Button, Input, Card, Spinner, EmptyState, useToast, Select, type SelectOption } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { cleaningJobsAPI, type CleaningJob } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import './CleaningJobs.css'

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

type ViewMode = 'list' | 'grid'

export default function CleaningJobs() {
  const [jobs, setJobs] = useState<CleaningJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<CleaningJob[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
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
      case 'PENDING': return 'text-gray-600 bg-gray-100'
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100'
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-100'
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="cleaning-jobs-page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cleaning Jobs</h1>
        <Button onClick={() => navigate('/jobs/new')}>
          Create Job
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="jobs-stats">
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{jobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">All cleaning jobs</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Scheduled</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{jobs.filter(j => j.status === 'SCHEDULED').length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{jobs.filter(j => j.status === 'PENDING').length} pending assignment</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{jobs.filter(j => j.status === 'IN_PROGRESS').length}</p>
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
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{jobs.filter(j => j.status === 'COMPLETED').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">Successfully finished</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Select
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
            />
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
          <div className="flex items-end justify-end gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="List view"
            >
              <ViewListIcon />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Grid view"
            >
              <ViewModuleIcon />
            </button>
          </div>
        </div>
      </Card>

      {/* Jobs List/Grid */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title={searchQuery || statusFilter !== 'all' ? 'No jobs match your filters' : 'No cleaning jobs'}
          description="Schedule a new cleaning job to get started"
        />
      ) : viewMode === 'grid' ? (
        <div className="jobs-list-grid">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg flex-1">
                      {job.property?.property_name || 'Unknown Property'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  {job.maintenance_issues_found > 0 && (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-600">
                      {job.maintenance_issues_found} Issues
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-3 flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : '01/01/1970'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Time:</span>
                    <span>{job.scheduled_start_time && job.scheduled_end_time ? `${job.scheduled_start_time} - ${job.scheduled_end_time}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Worker:</span>
                    <span>
                      {job.assigned_worker
                        ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
                        : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span className="truncate ml-2">{job.customer?.business_name}</span>
                  </div>
                </div>

                {/* Progress */}
                {job.checklist_total_items > 0 && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(job.checklist_completed_items / job.checklist_total_items) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {job.checklist_completed_items} / {job.checklist_total_items} items
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      £{Number(job.quoted_price).toFixed(2)}
                    </div>
                    {job.actual_price && job.actual_price !== job.quoted_price && (
                      <div className="text-xs text-gray-500">
                        Actual: £{Number(job.actual_price).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {job.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/jobs/${job.id}/edit`)
                        }}
                      >
                        Schedule
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/jobs/${job.id}/edit`)
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="jobs-list-view">
          {filteredJobs.map((job) => (
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
                        {job.maintenance_issues_found} Issues
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="font-medium">Date</div>
                      <div>{job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : '01/01/1970'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Time</div>
                      <div>{job.scheduled_start_time && job.scheduled_end_time ? `${job.scheduled_start_time} - ${job.scheduled_end_time}` : '-'}</div>
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
                    £{Number(job.quoted_price).toFixed(2)}
                  </div>
                  {job.actual_price && job.actual_price !== job.quoted_price && (
                    <div className="text-sm text-gray-500">
                      Actual: £{Number(job.actual_price).toFixed(2)}
                    </div>
                  )}
                  <div className="mt-2 space-x-2">
                    {job.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/jobs/${job.id}/edit`)
                        }}
                      >
                        Schedule
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/jobs/${job.id}/edit`)
                      }}
                    >
                      Edit
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
