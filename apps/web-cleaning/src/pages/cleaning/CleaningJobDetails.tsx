import { useState, useEffect } from 'react'
import { Button, Card, Spinner, useToast, Badge } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { cleaningJobsAPI, maintenanceJobsAPI, type CleaningJob } from '../../lib/api'
import { useNavigate, useParams } from 'react-router-dom'
import { StartJobModal } from '../../components/timesheet/StartJobModal'
import { CompleteJobModal } from '../../components/timesheet/CompleteJobModal'
import { JobHistoryTimeline } from '../../components/JobHistoryTimeline'
import { api } from '../../lib/api'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import '../ContractDetails.css'

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

  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      loadJob()
      loadTimesheets()
    }
  }, [id])

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/jobs')}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">Cleaning Job Details</h1>
        </div>
        <Badge color={getStatusColor(job.status)}>
          {job.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Property & Customer Info */}
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        Job Information
      </h2>

      <div className="customer-info-grid mb-6">
        {/* Property Card */}
        {job.property && (
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 md:col-span-2">
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
        )}

        {/* Customer Card */}
        {job.customer && (
          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Customer</p>
                <p className="text-lg font-extrabold text-green-900 dark:text-green-100">
                  {job.customer.business_name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Contact: {job.customer.contact_name}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Schedule & Worker */}
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <span className="text-2xl">📅</span>
        Schedule
      </h2>

      <div className="customer-info-grid mb-6">
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
          <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800 md:col-span-2">
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
          <Card className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700 md:col-span-2">
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

      {/* Checklist Progress */}
      {job.checklist_total_items > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Checklist Progress</h2>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{job.checklist_completed_items} of {job.checklist_total_items} items completed</span>
              <span>{Math.round((job.checklist_completed_items / job.checklist_total_items) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{
                  width: `${(job.checklist_completed_items / job.checklist_total_items) * 100}%`
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Pricing */}
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <span className="text-2xl">💰</span>
        Pricing
      </h2>

      <div className="customer-info-grid mb-6">
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

      {/* Maintenance Issues (Cross-Sell) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          Maintenance Issues
        </h2>
        <Button
          onClick={() => setShowIssueForm(!showIssueForm)}
          variant="warning"
          size="sm"
        >
          {showIssueForm ? 'Cancel' : 'Report Issue'}
        </Button>
      </div>

      {job.maintenance_issues_found > 0 || (job.maintenance_jobs && job.maintenance_jobs.length > 0) ? (
        <div className="mb-6">
          {/* Display linked maintenance jobs if any */}
          {job.maintenance_jobs && job.maintenance_jobs.length > 0 && (
            <div className="space-y-3 mb-4">
              {job.maintenance_jobs.map((maintenanceJob: any) => (
                <Card key={maintenanceJob.id} className="p-4 bg-orange-50 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open(`http://localhost:5174/maintenance/jobs/${maintenanceJob.id}`, '_blank')}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-orange-900">{maintenanceJob.title}</h4>
                        <Badge variant={
                          maintenanceJob.status === 'QUOTE_PENDING' ? 'warning' :
                          maintenanceJob.status === 'SCHEDULED' ? 'info' :
                          maintenanceJob.status === 'IN_PROGRESS' ? 'info' :
                          maintenanceJob.status === 'COMPLETED' ? 'success' : 'default'
                        }>
                          {maintenanceJob.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={
                          maintenanceJob.priority === 'URGENT' ? 'error' :
                          maintenanceJob.priority === 'HIGH' ? 'warning' : 'default'
                        }>
                          {maintenanceJob.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{maintenanceJob.description || 'No description'}</p>
                      <div className="text-xs text-gray-500">
                        Category: {maintenanceJob.category} • Created from cleaning job
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`http://localhost:5174/maintenance/jobs/${maintenanceJob.id}`, '_blank')
                      }}
                    >
                      View in Maintenance Portal
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Summary cards */}
          <div className="customer-info-grid mb-4">
            <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-200 dark:bg-orange-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">Issues Found</p>
                  <p className="text-2xl font-extrabold text-orange-900 dark:text-orange-100">
                    {job.maintenance_issues_found}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📄</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Quotes Generated</p>
                  <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
                    {job.maintenance_quotes_generated || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Button onClick={() => setShowIssueForm(!showIssueForm)} size="sm">
            {showIssueForm ? 'Cancel' : 'Report Another Issue'}
          </Button>
        </div>
      ) : (
        <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold mb-3">No maintenance issues reported yet.</p>
          <Button
            onClick={() => setShowIssueForm(true)}
            variant="warning"
            size="sm"
          >
            Report Issue
          </Button>
        </Card>
      )}

      {/* Issue Form */}
      {showIssueForm && (
        <Card className="p-4 bg-gray-50 mb-6">
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

      {/* Completion Notes */}
      {job.completion_notes && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Completion Notes</h2>
          <p className="text-gray-700">{job.completion_notes}</p>
        </Card>
      )}

      {/* Timesheet Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Timesheet</h2>

        {timesheets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No timesheet entries yet</p>
            {job.status === 'SCHEDULED' && job.assigned_worker && (
              <Button onClick={() => setShowStartJobModal(true)}>
                <PlayCircleIcon sx={{ fontSize: 18, mr: 1 }} />
                Start Job
              </Button>
            )}
          </div>
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

                {/* Complete Job Button */}
                {!timesheet.end_time && job.status === 'IN_PROGRESS' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => setShowCompleteJobModal(true)}
                      size="sm"
                    >
                      <CheckCircleIcon sx={{ fontSize: 18, mr: 1 }} />
                      Complete Job
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Change History */}
      <div className="mb-6">
        <JobHistoryTimeline jobId={job.id} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {job.status === 'SCHEDULED' && job.assigned_worker && timesheets.length === 0 && (
          <Button onClick={() => setShowStartJobModal(true)}>
            <PlayCircleIcon sx={{ fontSize: 18, mr: 1 }} />
            Start Job
          </Button>
        )}

        {job.status === 'IN_PROGRESS' && timesheets.length > 0 && !timesheets[0].end_time && (
          <Button onClick={() => setShowCompleteJobModal(true)}>
            <CheckCircleIcon sx={{ fontSize: 18, mr: 1 }} />
            Complete Job
          </Button>
        )}

        <Button
          onClick={() => navigate(`/jobs/${id}/edit`)}
          disabled={job.status === 'COMPLETED'}
          variant="secondary"
        >
          Edit Job
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/jobs')}
        >
          Back to List
        </Button>
      </div>

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
