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
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Job Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Property</h3>
            <div className="text-sm space-y-1">
              <div className="font-medium text-lg">{job.property?.property_name}</div>
              <div className="text-gray-600">{job.property?.address}</div>
              <div className="text-gray-600">{job.property?.postcode}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Customer</h3>
            <div className="text-sm space-y-1">
              <div className="font-medium text-lg">{job.customer?.business_name}</div>
              <div className="text-gray-600">Contact: {job.customer?.contact_name}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule & Worker */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Date</div>
            <div className="font-semibold">
              {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Time</div>
            <div className="font-semibold">
              {job.scheduled_start_time} - {job.scheduled_end_time}
            </div>
            {job.actual_start_time && job.actual_end_time && (
              <div className="text-sm text-gray-500 mt-1">
                Actual: {new Date(job.actual_start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(job.actual_end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600">Assigned Worker</div>
            <div className="font-semibold">
              {job.assigned_worker
                ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
                : 'Unassigned'}
            </div>
            {job.assigned_worker?.phone && (
              <div className="text-sm text-gray-500">{job.assigned_worker.phone}</div>
            )}
          </div>
        </div>
      </Card>

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
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Pricing Type</div>
            <div className="font-semibold">{job.pricing_type.replace('_', ' ')}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Quoted Price</div>
            <div className="text-2xl font-bold text-blue-600">£{Number(job.quoted_price).toFixed(2)}</div>
          </div>

          {job.actual_price && (
            <div>
              <div className="text-sm text-gray-600">Actual Price</div>
              <div className="text-2xl font-bold text-green-600">£{Number(job.actual_price).toFixed(2)}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Maintenance Issues (Cross-Sell) */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Maintenance Issues</h2>
          <Button
            size="sm"
            onClick={() => setShowIssueForm(!showIssueForm)}
          >
            {showIssueForm ? 'Cancel' : 'Report Issue'}
          </Button>
        </div>

        {/* Linked Maintenance Jobs */}
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

        {job.maintenance_issues_found > 0 && (!job.maintenance_jobs || job.maintenance_jobs.length === 0) && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
            <div className="font-semibold text-orange-800">
              {job.maintenance_issues_found} issue(s) reported from this cleaning job
            </div>
            {job.maintenance_quotes_generated > 0 && (
              <div className="text-sm text-orange-600 mt-1">
                {job.maintenance_quotes_generated} quote(s) generated
              </div>
            )}
          </div>
        )}

        {showIssueForm && (
          <Card className="p-4 bg-gray-50">
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

        {!showIssueForm && job.maintenance_issues_found === 0 && (
          <p className="text-sm text-gray-500">No maintenance issues reported yet.</p>
        )}
      </Card>

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
          onClick={() => navigate(`/cleaning/jobs/${id}/edit`)}
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
