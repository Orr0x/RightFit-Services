import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge } from '@rightfit/ui-core'
import { useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { cleaningJobsAPI, maintenanceJobsAPI, type CleaningJob } from '../../lib/api'
import { useNavigate, useParams } from 'react-router-dom'

const SERVICE_PROVIDER_ID = 'demo-provider-id'

export default function CleaningJobDetails() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<CleaningJob | null>(null)
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
      case 'SCHEDULED': return 'primary'
      case 'IN_PROGRESS': return 'warning'
      case 'COMPLETED': return 'success'
      case 'CANCELLED': return 'error'
      default: return 'default'
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
          <Button onClick={() => navigate('/cleaning/jobs')}>
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
          <Button variant="secondary" onClick={() => navigate('/cleaning/jobs')}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">Cleaning Job Details</h1>
        </div>
        <Badge variant={getStatusColor(job.status)}>
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
            <div className="text-2xl font-bold text-blue-600">£{job.quoted_price.toFixed(2)}</div>
          </div>

          {job.actual_price && (
            <div>
              <div className="text-sm text-gray-600">Actual Price</div>
              <div className="text-2xl font-bold text-green-600">£{job.actual_price.toFixed(2)}</div>
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

        {job.maintenance_issues_found > 0 && (
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

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate(`/cleaning/jobs/${id}/edit`)}
          disabled={job.status === 'COMPLETED'}
        >
          Edit Job
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/cleaning/jobs')}
        >
          Back to List
        </Button>
      </div>
    </div>
  )
}
