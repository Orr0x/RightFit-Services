import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, Badge, useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { cleaningJobsAPI, type CleaningJob } from '../lib/api'

// HARDCODED for demo
const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

// Maintenance issue form interface
interface MaintenanceIssueForm {
  title: string
  description: string
  category: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export default function CleaningJobDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<CleaningJob | null>(null)
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [issueForm, setIssueForm] = useState<MaintenanceIssueForm>({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'MEDIUM',
  })

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
        toast.error('Failed to load cleaning job')
        console.error('Load job error:', err)
      }
    })
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return

    try {
      await cleaningJobsAPI.update(id, {
        status: newStatus,
        service_provider_id: SERVICE_PROVIDER_ID,
      })
      toast.success(`Job marked as ${newStatus}`)
      loadJob()
    } catch (err: any) {
      toast.error('Failed to update job status')
      console.error('Update status error:', err)
    }
  }

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    try {
      const response = await fetch('/api/maintenance-jobs/from-cleaning-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleaning_job_id: id,
          service_provider_id: SERVICE_PROVIDER_ID,
          ...issueForm,
        }),
      })

      if (!response.ok) throw new Error('Failed to create maintenance job')

      toast.success('Maintenance issue reported successfully')
      setShowIssueModal(false)
      setIssueForm({
        title: '',
        description: '',
        category: 'plumbing',
        priority: 'MEDIUM',
      })
      loadJob() // Reload to show updated maintenance issues count
    } catch (err: any) {
      toast.error('Failed to report maintenance issue')
      console.error('Report issue error:', err)
    }
  }

  if (isLoading || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    SCHEDULED: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Cleaning Job Details</h1>
        </div>
        <Badge variant={statusColors[job.status] || 'info'}>
          {job.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Info Card */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Job Information</h2>
            </Card.Header>
            <Card.Content>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(job.scheduled_date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {job.scheduled_start_time} - {job.scheduled_end_time}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pricing Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.pricing_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quoted Price</dt>
                  <dd className="mt-1 text-sm text-gray-900">£{Number(job.quoted_price).toFixed(2)}</dd>
                </div>
                {job.actual_price && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Actual Price</dt>
                    <dd className="mt-1 text-sm text-gray-900">£{Number(job.actual_price).toFixed(2)}</dd>
                  </div>
                )}
                {job.actual_start_time && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Actual Start</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(job.actual_start_time).toLocaleTimeString()}</dd>
                  </div>
                )}
                {job.actual_end_time && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Actual End</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(job.actual_end_time).toLocaleTimeString()}</dd>
                  </div>
                )}
              </dl>
            </Card.Content>
          </Card>

          {/* Property Info */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Property</h2>
            </Card.Header>
            <Card.Content>
              {job.property ? (
                <div>
                  <h3 className="font-medium text-lg">{job.property.name}</h3>
                  <p className="text-sm text-gray-600">{job.property.address_line1}</p>
                  <p className="text-sm text-gray-600">{job.property.city}, {job.property.postcode}</p>
                  {job.property.access_instructions && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Access Instructions:</p>
                      <p className="text-sm text-gray-600 mt-1">{job.property.access_instructions}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No property information available</p>
              )}
            </Card.Content>
          </Card>

          {/* Checklist */}
          {job.checklist_items && (
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Checklist</h2>
                  <span className="text-sm text-gray-500">
                    {job.checklist_completed_items} / {job.checklist_total_items} completed
                  </span>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(job.checklist_completed_items / job.checklist_total_items) * 100}%`,
                    }}
                  />
                </div>
                {/* Checklist items would be rendered here if available in JSON format */}
                <p className="text-sm text-gray-500">Checklist details available in job data</p>
              </Card.Content>
            </Card>
          )}

          {/* Photos */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Photos</h2>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {job.before_photos && job.before_photos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Before Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {job.before_photos.map((photo, idx) => (
                        <div key={idx} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                          Photo {idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {job.after_photos && job.after_photos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">After Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {job.after_photos.map((photo, idx) => (
                        <div key={idx} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                          Photo {idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {job.issue_photos && job.issue_photos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Issue Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {job.issue_photos.map((photo, idx) => (
                        <div key={idx} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                          Photo {idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!job.before_photos?.length && !job.after_photos?.length && !job.issue_photos?.length) && (
                  <p className="text-sm text-gray-500">No photos uploaded yet</p>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Completion Notes */}
          {job.completion_notes && (
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold">Completion Notes</h2>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-gray-700">{job.completion_notes}</p>
              </Card.Content>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Actions</h2>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {job.status === 'SCHEDULED' && (
                  <Button
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    className="w-full"
                    variant="primary"
                  >
                    Start Job
                  </Button>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <Button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    className="w-full"
                    variant="success"
                  >
                    Complete Job
                  </Button>
                )}
                <Button
                  onClick={() => setShowIssueModal(true)}
                  className="w-full"
                  variant="warning"
                >
                  Report Maintenance Issue
                </Button>
                {job.status !== 'CANCELLED' && (
                  <Button
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    className="w-full"
                    variant="danger"
                  >
                    Cancel Job
                  </Button>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Customer Info */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Customer</h2>
            </Card.Header>
            <Card.Content>
              {job.customer ? (
                <div>
                  <p className="font-medium">{job.customer.business_name}</p>
                  <p className="text-sm text-gray-600">{job.customer.contact_name}</p>
                  <p className="text-sm text-gray-600">{job.customer.email}</p>
                  <p className="text-sm text-gray-600">{job.customer.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500">No customer information</p>
              )}
            </Card.Content>
          </Card>

          {/* Worker Info */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Assigned Worker</h2>
            </Card.Header>
            <Card.Content>
              {job.assigned_worker ? (
                <div>
                  <p className="font-medium">
                    {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{job.assigned_worker.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500">No worker assigned</p>
              )}
            </Card.Content>
          </Card>

          {/* Maintenance Issues */}
          {job.maintenance_issues_found > 0 && (
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold">Maintenance Issues</h2>
              </Card.Header>
              <Card.Content>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    {job.maintenance_issues_found} issue(s) found during cleaning
                  </p>
                  <p className="text-sm text-gray-700">
                    {job.maintenance_quotes_generated} quote(s) generated
                  </p>
                  <Button
                    onClick={() => navigate(`/maintenance-jobs?cleaning_job_id=${id}`)}
                    variant="secondary"
                    className="w-full mt-2"
                  >
                    View Maintenance Jobs
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>

      {/* Report Maintenance Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Report Maintenance Issue</h2>
            <form onSubmit={handleReportIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={issueForm.category}
                  onChange={(e) => setIssueForm({ ...issueForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="appliance">Appliance</option>
                  <option value="structural">Structural</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={issueForm.priority}
                  onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" className="flex-1">
                  Report Issue
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowIssueModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
