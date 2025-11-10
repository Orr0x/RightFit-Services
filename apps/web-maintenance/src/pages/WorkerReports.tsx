import { useState, useEffect } from 'react'
import { Card, Spinner, EmptyState, Button } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { User, Calendar, Wrench } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

interface WorkerIssue {
  id: string
  property_id: string
  customer_id: string
  worker_id: string
  cleaning_job_id?: string
  issue_type: string
  title: string
  issue_description: string
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  photos: string[]
  status: string
  reported_at: string
  property?: {
    property_name: string
    address: string
  }
  worker?: {
    first_name: string
    last_name: string
    phone: string
  }
  cleaning_job?: {
    id: string
    scheduled_date: string
  }
}

export default function WorkerReports() {
  const [issues, setIssues] = useState<WorkerIssue[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const { user } = useAuth()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = () => {
    withLoading(async () => {
      try {
        if (!user?.service_provider_id) {
          toast.error('Service provider ID not found')
          return
        }

        const response = await api.get(`/api/worker-issues`, {
          params: { service_provider_id: user.service_provider_id }
        })

        // Only show SUBMITTED or CUSTOMER_REVIEWING issues
        const pending = response.data.data.filter((issue: WorkerIssue) =>
          issue.status === 'SUBMITTED' || issue.status === 'CUSTOMER_REVIEWING'
        )
        setIssues(pending)
      } catch (err: any) {
        toast.error('Failed to load worker issues')
        console.error(err)
      }
    })
  }

  const handleApprove = async (issueId: string, customerId: string) => {
    try {
      await api.post(`/api/worker-issues/${issueId}/approve`, {
        customer_id: customerId
      })

      toast.success('Issue approved. Maintenance job created.')
      loadIssues()
    } catch (err: any) {
      toast.error('Failed to approve issue')
      console.error(err)
    }
  }

  const handleReject = async (issueId: string, customerId: string) => {
    try {
      await api.post(`/api/worker-issues/${issueId}/reject`, {
        customer_id: customerId,
        rejection_reason: rejectionReason || undefined
      })

      toast.success('Issue rejected')
      setRejectingId(null)
      setRejectionReason('')
      loadIssues()
    } catch (err: any) {
      toast.error('Failed to reject issue')
      console.error(err)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="worker-reports-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Worker Reports</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve maintenance issues reported by your workers
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {issues.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            title="No pending worker reports"
            description="Maintenance issues reported by workers will appear here for approval"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                  <p className="text-sm text-gray-600">
                    {issue.property?.property_name} • {issue.property?.address}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(issue.priority)}`}>
                  {issue.priority}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Category:</p>
                <p className="text-sm text-gray-600">{issue.category.replace(/_/g, ' ')}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                <p className="text-sm text-gray-600">{issue.issue_description}</p>
              </div>

              {issue.worker && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>
                    Reported by {issue.worker.first_name} {issue.worker.last_name}
                    {issue.worker.phone && ` • ${issue.worker.phone}`}
                  </span>
                </div>
              )}

              {issue.cleaning_job && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    During cleaning on {new Date(issue.cleaning_job.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Reported: {new Date(issue.reported_at).toLocaleString()}
                </p>
              </div>

              {issue.photos && issue.photos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Photos ({issue.photos.length}):</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {issue.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Issue photo ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {rejectingId === issue.id ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReject(issue.id, issue.customer_id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setRejectingId(null)
                        setRejectionReason('')
                      }}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(issue.id, issue.customer_id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve & Create Maintenance Job
                  </Button>
                  <Button
                    onClick={() => setRejectingId(issue.id)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
