import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, Badge } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { maintenanceJobsAPI, type MaintenanceJob, api } from '../lib/api'
import ContractorSchedulingModal from '../components/ContractorSchedulingModal'
import MaintenanceJobCompletionModal from '../components/MaintenanceJobCompletionModal'

// HARDCODED for demo
const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

export default function MaintenanceJobDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<MaintenanceJob | null>(null)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showSchedulingModal, setShowSchedulingModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [quoteData, setQuoteData] = useState({
    parts_cost: '',
    labor_cost: '',
    notes: '',
  })
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => {
    if (id) {
      loadJob()
    }
  }, [id])

  const loadJob = () => {
    if (!id) return

    withLoading(async () => {
      try {
        const data = await maintenanceJobsAPI.get(id, SERVICE_PROVIDER_ID)
        setJob(data)
      } catch (err: any) {
        toast.error('Failed to load maintenance job')
        console.error('Load job error:', err)
      }
    })
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return

    try {
      await maintenanceJobsAPI.update(id, {
        status: newStatus,
        service_provider_id: SERVICE_PROVIDER_ID,
      })
      toast.success(`Job status updated`)
      loadJob()
    } catch (err: any) {
      toast.error('Failed to update job status')
      console.error('Update status error:', err)
    }
  }

  const handleSubmitQuote = async () => {
    if (!id || !job) return

    const partsCost = parseFloat(quoteData.parts_cost) || 0
    const laborCost = parseFloat(quoteData.labor_cost) || 0
    const total = partsCost + laborCost

    if (total <= 0) {
      toast.error('Please enter parts cost and/or labor cost')
      return
    }

    try {
      // Create quote and update job status to QUOTE_SENT
      await api.post(`/api/maintenance-jobs/${id}/submit-quote`, {
        service_provider_id: SERVICE_PROVIDER_ID,
        parts_cost: partsCost,
        labor_cost: laborCost,
        total: total,
        notes: quoteData.notes || undefined,
      })

      toast.success('Quote submitted to customer')
      setShowQuoteForm(false)
      setQuoteData({ parts_cost: '', labor_cost: '', notes: '' })
      loadJob()
    } catch (err: any) {
      toast.error('Failed to submit quote')
      console.error('Submit quote error:', err)
    }
  }

  const handleDeclineJob = async () => {
    if (!id) return

    if (!confirm('Are you sure you want to decline this job? This cannot be undone.')) {
      return
    }

    try {
      await api.post(`/api/maintenance-jobs/${id}/decline`, {
        service_provider_id: SERVICE_PROVIDER_ID,
      })

      toast.success('Job declined')
      navigate('/jobs')
    } catch (err: any) {
      toast.error('Failed to decline job')
      console.error('Decline job error:', err)
    }
  }

  if (isLoading || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const priorityColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'error',
    CRITICAL: 'error',
  }

  const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    QUOTE_PENDING: 'warning',
    QUOTE_SENT: 'primary',
    APPROVED: 'success',
    SCHEDULED: 'primary',
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
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
        </div>
        <div className="flex gap-2">
          <Badge variant={priorityColors[job.priority] || 'default'}>
            {job.priority} PRIORITY
          </Badge>
          <Badge variant={statusColors[job.status] || 'default'}>
            {job.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Info Card */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Job Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{job.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Source</dt>
                <dd className="mt-1 text-sm text-gray-900">{job.source}</dd>
              </div>
              {job.requested_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Requested Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(job.requested_date).toLocaleDateString()}</dd>
                </div>
              )}
              {job.scheduled_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(job.scheduled_date).toLocaleDateString()}</dd>
                </div>
              )}
              {job.completed_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(job.completed_date).toLocaleDateString()}</dd>
                </div>
              )}
              {job.estimated_hours && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estimated Hours</dt>
                  <dd className="mt-1 text-sm text-gray-900">{Number(job.estimated_hours)} hours</dd>
                </div>
              )}
            </dl>

            {job.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Description</dt>
                <dd className="text-sm text-gray-900">{job.description}</dd>
              </div>
            )}
          </Card>

          {/* Estimate Card */}
          {(job.estimated_parts_cost || job.estimated_labor_cost || job.estimated_total) && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Cost Estimate</h2>
              <dl className="space-y-2">
                {job.estimated_parts_cost && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Parts Cost</dt>
                    <dd className="text-sm font-medium">£{Number(job.estimated_parts_cost).toFixed(2)}</dd>
                  </div>
                )}
                {job.estimated_labor_cost && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Labor Cost</dt>
                    <dd className="text-sm font-medium">£{Number(job.estimated_labor_cost).toFixed(2)}</dd>
                  </div>
                )}
                {job.estimated_total && (
                  <>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-semibold text-gray-900">Estimated Total</dt>
                        <dd className="text-sm font-bold text-gray-900">£{Number(job.estimated_total).toFixed(2)}</dd>
                      </div>
                    </div>
                  </>
                )}
                {job.actual_total && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <dt className="text-sm font-semibold text-green-900">Actual Total</dt>
                      <dd className="text-sm font-bold text-green-900">£{Number(job.actual_total).toFixed(2)}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {/* Property Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Property</h2>
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
          </Card>

          {/* Photos */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="space-y-4">
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
              {job.work_in_progress_photos && job.work_in_progress_photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Work in Progress</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {job.work_in_progress_photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                        Photo {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {job.completion_photos && job.completion_photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Completion Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {job.completion_photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                        Photo {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!job.issue_photos?.length && !job.work_in_progress_photos?.length && !job.completion_photos?.length) && (
                <p className="text-sm text-gray-500">No photos uploaded yet</p>
              )}
            </div>
          </Card>

          {/* AI Assessment */}
          {(job.ai_severity_score || job.ai_category_confidence) && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">AI Assessment</h2>
              <dl className="grid grid-cols-2 gap-4">
                {job.ai_severity_score && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Severity Score</dt>
                    <dd className="mt-1 text-sm text-gray-900">{job.ai_severity_score}/10</dd>
                  </div>
                )}
                {job.ai_category_confidence && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category Confidence</dt>
                    <dd className="mt-1 text-sm text-gray-900">{(Number(job.ai_category_confidence) * 100).toFixed(0)}%</dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {/* Completion Notes */}
          {job.completion_notes && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Completion Notes</h2>
              <p className="text-sm text-gray-700">{job.completion_notes}</p>
              {job.customer_satisfaction_rating && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Customer Rating</p>
                  <p className="text-lg font-bold text-yellow-600">{job.customer_satisfaction_rating}/5 ⭐</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
                {job.status === 'QUOTE_PENDING' && !showQuoteForm && (
                  <>
                    <Button
                      onClick={() => setShowQuoteForm(true)}
                      className="w-full"
                      variant="primary"
                    >
                      Submit Quote
                    </Button>
                    <Button
                      onClick={handleDeclineJob}
                      className="w-full"
                      variant="danger"
                    >
                      Decline Job
                    </Button>
                  </>
                )}
                {job.status === 'QUOTE_PENDING' && showQuoteForm && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parts Cost (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={quoteData.parts_cost}
                        onChange={(e) => setQuoteData({...quoteData, parts_cost: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Labor Cost (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={quoteData.labor_cost}
                        onChange={(e) => setQuoteData({...quoteData, labor_cost: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total: £{(parseFloat(quoteData.parts_cost || '0') + parseFloat(quoteData.labor_cost || '0')).toFixed(2)}
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        value={quoteData.notes}
                        onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Additional notes for the customer..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitQuote}
                        className="flex-1"
                        variant="primary"
                      >
                        Submit Quote
                      </Button>
                      <Button
                        onClick={() => {
                          setShowQuoteForm(false)
                          setQuoteData({ parts_cost: '', labor_cost: '', notes: '' })
                        }}
                        className="flex-1"
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {job.status === 'APPROVED' && !job.assigned_worker_id && !job.assigned_contractor_id && (
                  <Button
                    onClick={() => setShowSchedulingModal(true)}
                    className="w-full"
                    variant="primary"
                  >
                    Schedule & Assign Worker
                  </Button>
                )}
                {job.status === 'SCHEDULED' && (job.assigned_worker_id || job.assigned_contractor_id) && (
                  <>
                    <Button
                      onClick={() => setShowSchedulingModal(true)}
                      className="w-full mb-2"
                      variant="secondary"
                    >
                      Reassign Worker
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('IN_PROGRESS')}
                      className="w-full"
                      variant="primary"
                    >
                      Start Job
                    </Button>
                  </>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <Button
                    onClick={() => setShowCompletionModal(true)}
                    className="w-full"
                    variant="success"
                  >
                    Complete Job
                  </Button>
                )}
                {job.status !== 'CANCELLED' && job.status !== 'COMPLETED' && (
                  <Button
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    className="w-full"
                    variant="danger"
                  >
                    Cancel Job
                  </Button>
                )}
              </div>
          </Card>

          {/* Customer Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Customer</h2>
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
          </Card>

          {/* Worker/Contractor Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Assigned To</h2>
            {job.assigned_worker ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Internal Worker</p>
                <p className="font-medium">
                  {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                </p>
                <p className="text-sm text-gray-600">{job.assigned_worker.phone}</p>
              </div>
            ) : job.assigned_contractor ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">External Contractor</p>
                <p className="font-medium">{job.assigned_contractor.company_name}</p>
                <p className="text-sm text-gray-600">{job.assigned_contractor.contact_name}</p>
                <p className="text-sm text-gray-600">{job.assigned_contractor.phone}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-2">No one assigned</p>
                <Button
                  onClick={() => setShowSchedulingModal(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Assign Worker
                </Button>
              </div>
            )}
          </Card>

          {/* Quote Info */}
          {job.quote && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Quote</h2>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Quote #:</span> {job.quote.quote_number}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Total:</span> £{Number(job.quote.total).toFixed(2)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={job.quote.status === 'APPROVED' ? 'success' : 'warning'}>
                    {job.quote.status}
                  </Badge>
                </p>
                <Button
                  onClick={() => navigate(`/quotes/${job.quote_id}`)}
                  variant="secondary"
                  className="w-full mt-2"
                >
                  View Quote
                </Button>
              </div>
            </Card>
          )}

          {/* Source Info */}
          {(job.source_cleaning_job_id || job.source_guest_report_id) && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Source</h2>
              {job.source_cleaning_job_id && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Found during cleaning job</p>
                  <Button
                    onClick={() => navigate(`/cleaning-jobs/${job.source_cleaning_job_id}`)}
                    variant="secondary"
                    className="w-full"
                  >
                    View Cleaning Job
                  </Button>
                </div>
              )}
              {job.source_guest_report_id && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Reported by guest</p>
                  <Button
                    onClick={() => navigate(`/guest-reports/${job.source_guest_report_id}`)}
                    variant="secondary"
                    className="w-full"
                  >
                    View Guest Report
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Contractor Scheduling Modal */}
      {showSchedulingModal && id && (
        <ContractorSchedulingModal
          jobId={id}
          currentSchedule={{
            date: job.scheduled_date ? new Date(job.scheduled_date) : undefined,
            startTime: job.scheduled_start_time || undefined,
            endTime: job.scheduled_end_time || undefined,
          }}
          onScheduled={() => {
            setShowSchedulingModal(false)
            loadJob()
          }}
          onCancel={() => setShowSchedulingModal(false)}
        />
      )}

      {/* Job Completion Modal */}
      {showCompletionModal && job && (
        <MaintenanceJobCompletionModal
          job={job}
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onComplete={() => {
            setShowCompletionModal(false)
            loadJob()
          }}
        />
      )}
    </div>
  )
}
