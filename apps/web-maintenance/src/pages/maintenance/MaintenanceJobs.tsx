import { useState, useEffect } from 'react'
import { Button, Input, Card, Spinner, EmptyState, Badge } from '@rightfit/ui-core'
import { useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { maintenanceJobsAPI, type MaintenanceJob } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

type TabType = 'new-issues' | 'submitted-quotes' | 'accepted-quotes' | 'all'

export default function MaintenanceJobs() {
  const [jobs, setJobs] = useState<MaintenanceJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<MaintenanceJob[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('new-issues')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const { isLoading, withLoading} = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [jobs, searchQuery, activeTab, priorityFilter])

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

    // Filter by tab
    if (activeTab === 'new-issues') {
      filtered = filtered.filter(job => job.status === 'QUOTE_PENDING')
    } else if (activeTab === 'submitted-quotes') {
      filtered = filtered.filter(job => job.status === 'QUOTE_SENT')
    } else if (activeTab === 'accepted-quotes') {
      filtered = filtered.filter(job =>
        ['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(job.status)
      )
    }
    // 'all' tab shows everything

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

  const getTabCounts = () => {
    return {
      newIssues: jobs.filter(j => j.status === 'QUOTE_PENDING').length,
      submittedQuotes: jobs.filter(j => j.status === 'QUOTE_SENT').length,
      acceptedQuotes: jobs.filter(j =>
        ['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(j.status)
      ).length,
      all: jobs.length,
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error'
      case 'HIGH': return 'warning'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUOTE_PENDING': return 'warning'
      case 'QUOTE_SENT': return 'primary'
      case 'APPROVED': return 'success'
      case 'SCHEDULED': return 'primary'
      case 'IN_PROGRESS': return 'warning'
      case 'COMPLETED': return 'success'
      case 'CANCELLED': return 'error'
      default: return 'default'
    }
  }

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const counts = getTabCounts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Maintenance Jobs</h1>
        <Button onClick={() => navigate('/jobs/new')}>
          Create New Job
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('new-issues')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new-issues'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              New Issues
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-orange-100 text-orange-800">
                {counts.newIssues}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('submitted-quotes')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submitted-quotes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submitted Quotes
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-800">
                {counts.submittedQuotes}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('accepted-quotes')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accepted-quotes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Accepted Quotes
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-green-100 text-green-800">
                {counts.acceptedQuotes}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Jobs
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-800">
                {counts.all}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title={searchQuery || priorityFilter !== 'all' ? 'No jobs match filters' : 'No maintenance jobs'}
          description="Create a new maintenance job to get started"
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <Badge variant={getPriorityColor(job.priority)}>
                      {job.priority}
                    </Badge>
                    <Badge variant={getStatusColor(job.status)}>
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
                      £{Number(job.estimated_total).toFixed(2)}
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
