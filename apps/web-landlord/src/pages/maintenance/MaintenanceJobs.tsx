import { useState, useEffect } from 'react'
import { Button, Input, Card, Spinner, EmptyState, Badge } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { maintenanceJobsAPI, type MaintenanceJob } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const SERVICE_PROVIDER_ID = 'demo-provider-id'

export default function MaintenanceJobs() {
  const [jobs, setJobs] = useState<MaintenanceJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<MaintenanceJob[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [jobs, searchQuery, statusFilter, priorityFilter])

  const loadJobs = () => {
    withLoading(async () => {
      try {
        const result = await maintenanceJobsAPI.list(SERVICE_PROVIDER_ID)
        setJobs(result.data)
      } catch (err: any) {
        toast.error('Failed to load maintenance jobs')
        console.error('Load jobs error:', err)
      }
    })
  }

  const applyFilters = () => {
    let filtered = jobs

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(job => job.priority === priorityFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.property?.property_name.toLowerCase().includes(query) ||
        job.customer?.business_name.toLowerCase().includes(query)
      )
    }

    setFilteredJobs(filtered)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'red'
      case 'HIGH': return 'orange'
      case 'MEDIUM': return 'yellow'
      case 'LOW': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUOTE_PENDING': return 'orange'
      case 'QUOTE_SENT': return 'blue'
      case 'APPROVED': return 'green'
      case 'SCHEDULED': return 'purple'
      case 'IN_PROGRESS': return 'yellow'
      case 'COMPLETED': return 'green'
      case 'CANCELLED': return 'red'
      default: return 'gray'
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
        <h1 className="text-3xl font-bold">Maintenance Jobs</h1>
        <Button onClick={() => navigate('/maintenance/jobs/new')}>
          Create New Job
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              type="text"
              placeholder="Search jobs..."
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
              <option value="QUOTE_PENDING">Quote Pending</option>
              <option value="QUOTE_SENT">Quote Sent</option>
              <option value="APPROVED">Approved</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setPriorityFilter('all')
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title={searchQuery || statusFilter !== 'all' ? 'No jobs match filters' : 'No maintenance jobs'}
          description="Create a new maintenance job to get started"
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/maintenance/jobs/${job.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <Badge color={getPriorityColor(job.priority)}>
                      {job.priority}
                    </Badge>
                    <Badge color={getStatusColor(job.status)}>
                      {job.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                    <div>
                      <div className="font-medium">Property</div>
                      <div>{job.property?.property_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">Category</div>
                      <div>{job.category}</div>
                    </div>
                    <div>
                      <div className="font-medium">Source</div>
                      <div>{job.source.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                      <div className="font-medium">Customer</div>
                      <div>{job.customer?.business_name}</div>
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
                  )}
                </div>

                <div className="text-right ml-4">
                  {job.estimated_total && (
                    <div className="text-xl font-bold text-blue-600">
                      £{job.estimated_total.toFixed(2)}
                    </div>
                  )}
                  {job.quote && (
                    <div className="text-sm text-gray-500 mt-1">
                      {job.quote.quote_number}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
