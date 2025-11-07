import { useState, useEffect } from 'react'
import { Button, Card, Spinner, useToast, Badge, Tabs, TabPanel } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import {
  cleaningJobsAPI,
  cleaningContractsAPI,
  maintenanceJobsAPI,
  checklistTemplatesAPI,
  workersAPI,
  type CleaningJob,
  type CleaningContract,
  type MaintenanceJob,
  type ChecklistTemplate,
  type Worker
} from '../../lib/api'
import { useNavigate, useParams } from 'react-router-dom'
import { StartJobModal } from '../../components/timesheet/StartJobModal'
import { CompleteJobModal } from '../../components/timesheet/CompleteJobModal'
import { JobHistoryTimeline } from '../../components/JobHistoryTimeline'
import { api } from '../../lib/api'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import '../ContractDetails.css'
import '../PropertyDetails.css'
import '../Quotes.css'

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

interface Timesheet {
  id: string
  worker_id: string
  start_time: string
  end_time: string | null
  total_hours: number | null
  work_performed: string | null
  notes: string | null
  before_photos: string[]
  after_photos: string[]
  issue_photos: string[]
  worker: {
    id: string
    first_name: string
    last_name: string
  }
}

export default function CleaningJobDetails() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<CleaningJob | null>(null)
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [showStartJobModal, setShowStartJobModal] = useState(false)
  const [showCompleteJobModal, setShowCompleteJobModal] = useState(false)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueTitle, setIssueTitle] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [issueCategory, setIssueCategory] = useState('PLUMBING')
  const [issuePriority, setIssuePriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM')

  // Tab state
  const [activeTab, setActiveTab] = useState('details')
  const [contracts, setContracts] = useState<CleaningContract[]>([])
  const [maintenanceJobs, setMaintenanceJobs] = useState<MaintenanceJob[]>([])
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loadingTabData, setLoadingTabData] = useState(false)

  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      loadJob()
      loadTimesheets()
    }
  }, [id])

  // Load tab data when tab changes
  useEffect(() => {
    if (id && job && activeTab !== 'details') {
      loadTabData()
    }
  }, [id, activeTab, job])

  const loadJob = () => {
    if (!id) return

    withLoading(async () => {
      try {
        const data = await cleaningJobsAPI.get(id, SERVICE_PROVIDER_ID)
        setJob(data)
      } catch (err: any) {
        toast.error('Failed to load job details')
        console.error('Load error:', err)
      }
    })
  }

  const loadTimesheets = async () => {
    if (!id) return

    try {
      const response = await api.get(`/api/cleaning-timesheets/job/${id}`)
      setTimesheets(response.data.data || [])
    } catch (err: any) {
      // It's okay if there are no timesheets yet
      console.log('No timesheets found for job')
    }
  }

  const loadTabData = async () => {
    if (!id || !job) return

    try {
      setLoadingTabData(true)

      if (activeTab === 'contracts') {
        // Load contracts for this customer
        if (job.customer?.id) {
          const contractsData = await cleaningContractsAPI.list({
            customer_id: job.customer.id,
          })
          setContracts(contractsData.data || [])
        }
      }

      if (activeTab === 'maintenance') {
        // Load maintenance jobs that were created FROM this cleaning job
        const maintenanceData = await maintenanceJobsAPI.list(SERVICE_PROVIDER_ID, {
          property_id: job.property?.id,
        })
        // Filter to only show maintenance jobs created from this cleaning job
        const filteredJobs = (maintenanceData.data || []).filter(
          (mJob) => mJob.source_cleaning_job_id === id
        )
        setMaintenanceJobs(filteredJobs)
      }

      if (activeTab === 'checklists') {
        // Load the checklist template used for this job
        if (job.checklist_template_id) {
          const checklistData = await checklistTemplatesAPI.get(job.checklist_template_id, SERVICE_PROVIDER_ID)
          setChecklists(checklistData ? [checklistData] : [])
        } else {
          setChecklists([])
        }
      }

      if (activeTab === 'workers') {
        // Load the worker assigned to this job
        if (job.assigned_worker_id) {
          const workerData = await workersAPI.get(job.assigned_worker_id, SERVICE_PROVIDER_ID)
          setWorkers(workerData ? [workerData] : [])
        } else {
          setWorkers([])
        }
      }
    } catch (error: any) {
      console.error('Failed to load tab data:', error)
    } finally {
      setLoadingTabData(false)
    }
  }

  const handleStartJobSuccess = () => {
    setShowStartJobModal(false)
    loadJob()
    loadTimesheets()
  }

  const handleCompleteJobSuccess = () => {
    setShowCompleteJobModal(false)
    loadJob()
    loadTimesheets()
  }

  const handleCreateMaintenanceIssue = async () => {
    if (!id || !issueTitle) {
      toast.error('Please provide issue title')
      return
    }

    withLoading(async () => {
      try {
        await maintenanceJobsAPI.createFromCleaningIssue(id, {
          title: issueTitle,
          description: issueDescription,
          category: issueCategory,
          priority: issuePriority,
          service_provider_id: SERVICE_PROVIDER_ID,
        })

        toast.success('Maintenance issue created successfully')
        setShowIssueForm(false)
        setIssueTitle('')
        setIssueDescription('')
        loadJob() // Reload to update issue count
        loadTabData() // Reload maintenance jobs
      } catch (err: any) {
        toast.error('Failed to create maintenance issue')
        console.error('Create issue error:', err)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'blue'
      case 'IN_PROGRESS': return 'yellow'
      case 'COMPLETED': return 'green'
      case 'CANCELLED': return 'red'
      default: return 'gray'
    }
  }

  if (isLoading && !job) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
          <Button onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/jobs')}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cleaning Job #{job.id?.slice(0, 8)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {job.property?.property_name || 'N/A'}
          </p>
        </div>
        <Badge color={getStatusColor(job.status)}>
          {job.status.replace('_', ' ')}
        </Badge>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {job.status === 'SCHEDULED' && job.assigned_worker && timesheets.length === 0 && (
            <Button
              onClick={() => setShowStartJobModal(true)}
              variant="primary"
              size="sm"
            >
              <PlayCircleIcon sx={{ fontSize: 18 }} />
              Start Job
            </Button>
          )}
          {job.status === 'IN_PROGRESS' && timesheets.length > 0 && !timesheets[0].end_time && (
            <Button
              onClick={() => setShowCompleteJobModal(true)}
              variant="success"
              size="sm"
            >
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              Complete Job
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        {/* Details Tab */}
        <TabPanel tabId="details" label="Details" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Schedule Section */}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">📅</span>
                Schedule Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Scheduled Date Card */}
                <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📆</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-lg font-extrabold text-purple-900 dark:text-purple-100">
                        {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Time Card */}
                <Card className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan-200 dark:bg-cyan-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">⏰</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide mb-1">Time</p>
                      <p className="text-lg font-extrabold text-cyan-900 dark:text-cyan-100">
                        {job.scheduled_start_time} - {job.scheduled_end_time}
                      </p>
                      {job.actual_start_time && job.actual_end_time && (
                        <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
                          Actual: {new Date(job.actual_start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(job.actual_end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Assigned Worker Card */}
                {job.assigned_worker ? (
                  <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">👷</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Assigned Worker</p>
                        <p className="text-lg font-extrabold text-amber-900 dark:text-amber-100">
                          {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                        </p>
                        {job.assigned_worker.phone && (
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            📱 {job.assigned_worker.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">👷</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Assigned Worker</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Unassigned
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">💰</span>
                Pricing Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pricing Type Card */}
                <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-200 dark:bg-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📊</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Pricing Type</p>
                      <p className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100">
                        {job.pricing_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quoted Price Card */}
                <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-200 dark:bg-emerald-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💵</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">Quoted Price</p>
                      <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
                        £{Number(job.quoted_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Actual Price Card (if available) */}
                {job.actual_price && (
                  <Card className="p-5 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-800">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-200 dark:bg-teal-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">💸</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide mb-1">Actual Price</p>
                        <p className="text-2xl font-extrabold text-teal-900 dark:text-teal-100">
                          £{Number(job.actual_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Access Instructions */}
            {job.property?.access_instructions && (
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔑</span>
                  Access Instructions
                </h2>
                <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        {job.property.access_instructions}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Timesheet Section */}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">⏱️</span>
                Timesheet
              </h2>

              {timesheets.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No timesheet entries yet</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {timesheets.map((timesheet) => (
                    <Card key={timesheet.id} className="p-4 bg-gray-50 dark:bg-gray-900">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Worker</div>
                          <div className="font-semibold">
                            {timesheet.worker.first_name} {timesheet.worker.last_name}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                          <div className="font-semibold">
                            {timesheet.total_hours
                              ? `${Number(timesheet.total_hours).toFixed(2)} hours`
                              : 'In progress...'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Started</div>
                          <div className="font-semibold">
                            {new Date(timesheet.start_time).toLocaleString('en-GB', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </div>
                        </div>

                        {timesheet.end_time && (
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                            <div className="font-semibold">
                              {new Date(timesheet.end_time).toLocaleString('en-GB', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {timesheet.work_performed && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Work Performed</div>
                          <p className="text-sm">{timesheet.work_performed}</p>
                        </div>
                      )}

                      {timesheet.notes && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</div>
                          <p className="text-sm">{timesheet.notes}</p>
                        </div>
                      )}

                      {/* Photo Summary */}
                      <div className="flex gap-4 text-sm">
                        {timesheet.before_photos.length > 0 && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Before: </span>
                            <span className="font-medium">{timesheet.before_photos.length} photo(s)</span>
                          </div>
                        )}
                        {timesheet.after_photos.length > 0 && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">After: </span>
                            <span className="font-medium">{timesheet.after_photos.length} photo(s)</span>
                          </div>
                        )}
                        {timesheet.issue_photos.length > 0 && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Issues: </span>
                            <span className="font-medium">{timesheet.issue_photos.length} photo(s)</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Change History */}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">📜</span>
                Change History
              </h2>
              <JobHistoryTimeline jobId={job.id} />
            </div>
          </div>
        </TabPanel>

        {/* Customer Tab */}
        <TabPanel tabId="customer" label="Customer" activeTab={activeTab}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Customer Information
              </h2>
              <Button size="sm" onClick={() => navigate('/customers/new')}>
                <AddIcon sx={{ fontSize: 18 }} />
                New Customer
              </Button>
            </div>

            {job.customer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/customers/${job.customer?.id}`)}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🏢</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Business Name</p>
                      <p className="text-lg font-extrabold text-green-900 dark:text-green-100">
                        {job.customer.business_name}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">Contact Name</p>
                      <p className="text-lg font-extrabold text-purple-900 dark:text-purple-100">
                        {job.customer.contact_name}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Customer</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No customer assigned to this job
                </p>
                <Button onClick={() => navigate('/customers/new')}>
                  <AddIcon sx={{ fontSize: 18 }} />
                  Create New Customer
                </Button>
              </Card>
            )}
          </div>
        </TabPanel>

        {/* Property Tab */}
        <TabPanel tabId="property" label="Property" activeTab={activeTab}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                Property Information
              </h2>
              <Button size="sm" onClick={() => navigate('/properties/new')}>
                <AddIcon sx={{ fontSize: 18 }} />
                New Property
              </Button>
            </div>

            {job.property ? (
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/properties/${job.property?.id}`)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏠</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Property</p>
                    <p className="text-lg font-extrabold text-blue-900 dark:text-blue-100">
                      {job.property.property_name}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {job.property.address}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {job.property.postcode}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Property</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No property assigned to this job
                </p>
                <Button onClick={() => navigate('/properties/new')}>
                  <AddIcon sx={{ fontSize: 18 }} />
                  Create New Property
                </Button>
              </Card>
            )}
          </div>
        </TabPanel>

        {/* Contracts Tab */}
        <TabPanel tabId="contracts" label="Contracts" activeTab={activeTab}>
          {loadingTabData ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="text-gray-600 mt-3">Loading contracts...</p>
            </Card>
          ) : contracts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Related Contracts ({contracts.length})
                </h2>
                <Button size="sm" onClick={() => navigate('/contracts/new')}>
                  <AddIcon sx={{ fontSize: 18 }} />
                  New Contract
                </Button>
              </div>
              <div className="quotes-grid">
                {contracts.map((contract) => (
                  <Card
                    key={contract.id}
                    className="quote-card"
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{contract.customer?.business_name}</h3>
                        <p className="quote-customer">
                          {contract.contract_type === 'FLAT_MONTHLY' ? 'Flat Monthly' : 'Per Property'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          contract.status === 'ACTIVE' ? 'success' :
                          contract.status === 'PAUSED' ? 'warning' :
                          'default'
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>

                    <div className="quote-details">
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Contract Type:</span>
                        <span className="font-medium">
                          {contract.contract_type === 'FLAT_MONTHLY' ? 'Flat Monthly' : 'Per Property'}
                        </span>
                      </div>
                    </div>

                    <div className="quote-footer">
                      <div className="quote-total">
                        <span className="text-gray-600">Monthly Fee:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          £{Number(contract.monthly_fee).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Contracts</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No contracts found for this customer
              </p>
              <Button onClick={() => navigate('/contracts/new')}>
                <AddIcon sx={{ fontSize: 18 }} />
                Create New Contract
              </Button>
            </Card>
          )}
        </TabPanel>

        {/* Maintenance Tab */}
        <TabPanel tabId="maintenance" label="Maintenance" activeTab={activeTab}>
          {loadingTabData ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="text-gray-600 mt-3">Loading maintenance jobs...</p>
            </Card>
          ) : maintenanceJobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🔧</span>
                  Maintenance Jobs ({maintenanceJobs.length})
                </h2>
                <Button size="sm" variant="warning" onClick={() => setShowIssueForm(!showIssueForm)}>
                  <AddIcon sx={{ fontSize: 18 }} />
                  {showIssueForm ? 'Cancel' : 'Report Issue'}
                </Button>
              </div>

              {/* Issue Form */}
              {showIssueForm && (
                <Card className="p-4 bg-gray-50 mb-4">
                  <h3 className="font-semibold mb-3">Report Maintenance Issue</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Issue Title *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        value={issueTitle}
                        onChange={(e) => setIssueTitle(e.target.value)}
                        placeholder="e.g., Broken shower head"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        className="w-full px-3 py-2 border rounded-md"
                        rows={3}
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        placeholder="Describe the issue..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={issueCategory}
                          onChange={(e) => setIssueCategory(e.target.value)}
                        >
                          <option value="PLUMBING">Plumbing</option>
                          <option value="ELECTRICAL">Electrical</option>
                          <option value="HVAC">HVAC</option>
                          <option value="APPLIANCE">Appliance</option>
                          <option value="STRUCTURAL">Structural</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={issuePriority}
                          onChange={(e) => setIssuePriority(e.target.value as any)}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateMaintenanceIssue}
                      disabled={isLoading || !issueTitle}
                      className="w-full"
                    >
                      Create Maintenance Job
                    </Button>
                  </div>
                </Card>
              )}

              <div className="quotes-grid">
                {maintenanceJobs.map((maintenanceJob) => {
                  const badgeVariant =
                    maintenanceJob.status === 'COMPLETED' ? 'success' :
                    maintenanceJob.status === 'IN_PROGRESS' ? 'primary' :
                    maintenanceJob.priority === 'URGENT' ? 'danger' :
                    'warning'

                  return (
                    <Card
                      key={maintenanceJob.id}
                      className="quote-card"
                    >
                      <div className="quote-card-header">
                        <div>
                          <h3 className="quote-number">{maintenanceJob.title}</h3>
                          <p className="quote-customer">
                            {maintenanceJob.priority} • {maintenanceJob.status.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge variant={badgeVariant}>
                          {maintenanceJob.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="quote-details">
                        <div className="quote-detail-item">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{maintenanceJob.category}</span>
                        </div>
                        <div className="quote-detail-item">
                          <span className="text-gray-600">Priority:</span>
                          <span className="font-medium">{maintenanceJob.priority}</span>
                        </div>
                        {maintenanceJob.scheduled_date && (
                          <div className="quote-detail-item">
                            <span className="text-gray-600">Scheduled:</span>
                            <span className="font-medium">
                              {new Date(maintenanceJob.scheduled_date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="quote-footer">
                        <span className="text-sm text-gray-600">
                          {maintenanceJob.status === 'COMPLETED' ? 'Completed' :
                           maintenanceJob.status === 'IN_PROGRESS' ? 'In Progress' :
                           'Pending'}
                        </span>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Maintenance Issues</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No maintenance issues have been reported for this property yet
              </p>
              <Button onClick={() => setShowIssueForm(!showIssueForm)} variant="warning">
                <AddIcon sx={{ fontSize: 18 }} />
                {showIssueForm ? 'Cancel' : 'Report Issue'}
              </Button>
            </Card>
          )}
        </TabPanel>

        {/* Checklists Tab */}
        <TabPanel tabId="checklists" label="Checklists" activeTab={activeTab}>
          {loadingTabData ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="text-gray-600 mt-3">Loading checklists...</p>
            </Card>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  Cleaning Checklist
                </h2>
                <Button size="sm" onClick={() => navigate('/checklist-templates')}>
                  <AddIcon sx={{ fontSize: 18 }} />
                  Manage Templates
                </Button>
              </div>

              {job.checklist_total_items > 0 ? (
                <Card className="p-6 mb-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Progress</h3>
                      <span className="text-sm text-gray-500">
                        {job.checklist_completed_items} / {job.checklist_total_items} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: `${(job.checklist_completed_items / job.checklist_total_items) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Checklist details available in job data</p>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Checklist</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No checklist has been assigned to this job
                  </p>
                  <Button onClick={() => navigate('/checklist-templates')}>
                    <AddIcon sx={{ fontSize: 18 }} />
                    View Templates
                  </Button>
                </Card>
              )}
            </div>
          )}
        </TabPanel>

        {/* Workers Tab */}
        <TabPanel tabId="workers" label="Workers" activeTab={activeTab}>
          {loadingTabData ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="text-gray-600 mt-3">Loading workers...</p>
            </Card>
          ) : workers.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">👷</span>
                  Workers ({workers.length})
                </h2>
                <Button size="sm" onClick={() => navigate('/workers')}>
                  <AddIcon sx={{ fontSize: 18 }} />
                  New Worker
                </Button>
              </div>
              <div className="quotes-grid">
                {workers.map((worker) => (
                  <Card
                    key={worker.id}
                    className="quote-card"
                    onClick={() => navigate(`/workers/${worker.id}`)}
                  >
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{worker.first_name} {worker.last_name}</h3>
                        <p className="quote-customer">{worker.email}</p>
                      </div>
                      <Badge variant={worker.is_active ? 'success' : 'default'}>
                        {worker.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="quote-details">
                      {worker.phone && (
                        <div className="quote-detail-item">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{worker.phone}</span>
                        </div>
                      )}
                      {worker.hourly_rate && (
                        <div className="quote-detail-item">
                          <span className="text-gray-600">Hourly Rate:</span>
                          <span className="font-medium">£{Number(worker.hourly_rate).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Workers</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No workers found
              </p>
              <Button onClick={() => navigate('/workers')}>
                <AddIcon sx={{ fontSize: 18 }} />
                Add Worker
              </Button>
            </Card>
          )}
        </TabPanel>
      </Tabs>

      {/* Modals */}
      {showStartJobModal && job.assigned_worker && (
        <StartJobModal
          job={{
            id: job.id,
            assigned_worker_id: job.assigned_worker.id,
            property: {
              property_name: job.property?.property_name || 'Unknown',
              address: job.property?.address || '',
            },
          }}
          onClose={() => setShowStartJobModal(false)}
          onSuccess={handleStartJobSuccess}
        />
      )}

      {showCompleteJobModal && timesheets.length > 0 && (
        <CompleteJobModal
          job={{
            id: job.id,
            property: {
              property_name: job.property?.property_name || 'Unknown',
              address: job.property?.address || '',
            },
          }}
          timesheetId={timesheets[0].id}
          onClose={() => setShowCompleteJobModal(false)}
          onSuccess={handleCompleteJobSuccess}
        />
      )}
    </div>
  )
}
