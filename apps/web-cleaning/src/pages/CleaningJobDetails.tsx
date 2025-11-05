import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, Badge, useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { cleaningJobsAPI, type CleaningJob } from '../lib/api'
import './ContractDetails.css'

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
          {/* Job Information Section */}
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Job Information
          </h2>

          <div className="customer-info-grid">
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
                      {job.property.address_line1}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {job.property.city}, {job.property.postcode}
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

          {/* Schedule Section */}
          <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
            <span className="text-2xl">📅</span>
            Schedule
          </h2>

          <div className="customer-info-grid">
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

          {/* Pricing Section */}
          <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
            <span className="text-2xl">💰</span>
            Pricing
          </h2>

          <div className="customer-info-grid">
            {/* Pricing Type Card */}
            <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-200 dark:bg-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Pricing Type</p>
                  <p className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100">
                    {job.pricing_type}
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

          {/* Access Instructions (if available) */}
          {job.property?.access_instructions && (
            <>
              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
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
            </>
          )}

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
            <>
              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <span className="text-2xl">📝</span>
                Completion Notes
              </h2>
              <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {job.completion_notes}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Maintenance Issues Section */}
          <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
            <span className="text-2xl">🔧</span>
            Maintenance Issues
          </h2>

          {job.maintenance_issues_found > 0 ? (
            <div className="customer-info-grid">
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
                      {job.maintenance_quotes_generated}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🔗</span>
                    </div>
                    <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                      View related maintenance jobs
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/maintenance-jobs?cleaning_job_id=${id}`)}
                    variant="secondary"
                    size="sm"
                  >
                    View Jobs
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-semibold mb-3">No maintenance issues reported yet.</p>
              <Button
                onClick={() => setShowIssueModal(true)}
                variant="warning"
                size="sm"
              >
                Report Issue
              </Button>
            </Card>
          )}

          {/* Timesheet Section */}
          <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
            <span className="text-2xl">⏱️</span>
            Timesheet
          </h2>

          <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">No timesheet entries yet</p>
          </Card>
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
