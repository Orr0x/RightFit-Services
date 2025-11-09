import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock,
  Wrench, MapPin, User, Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getPhotoUrl } from '../../config/api'

interface WorkerIssueReport {
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
  status: 'SUBMITTED' | 'CUSTOMER_REVIEWING' | 'APPROVED' | 'REJECTED'
  reported_at: string
  customer_approved_at?: string
  customer_rejected_at?: string
  rejection_reason?: string
  property?: {
    property_name: string
    address: string
  }
  cleaning_job?: {
    id: string
    scheduled_date: string
  }
  created_maintenance_job?: {
    id: string
    title: string
    status: string
  }
}

export default function MyReportedIssues() {
  const navigate = useNavigate()
  const { worker } = useAuth()
  const [issues, setIssues] = useState<WorkerIssueReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyIssues()
  }, [worker])

  const fetchMyIssues = async () => {
    if (!worker) return

    try {
      setLoading(true)
      const token = localStorage.getItem('worker_token')
      const workerId = localStorage.getItem('worker_id')

      if (!workerId) {
        setError('Worker ID not found')
        return
      }

      const response = await fetch(
        `/api/worker-issues?worker_id=${workerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch reported issues')
      }

      const data = await response.json()
      setIssues(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          icon: Clock,
          label: 'Awaiting Review',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          iconColor: 'text-amber-600'
        }
      case 'CUSTOMER_REVIEWING':
        return {
          icon: Clock,
          label: 'Under Review',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600'
        }
      case 'APPROVED':
        return {
          icon: CheckCircle,
          label: 'Approved',
          color: 'text-green-700 bg-green-50 border-green-200',
          iconColor: 'text-green-600'
        }
      case 'REJECTED':
        return {
          icon: XCircle,
          label: 'Rejected',
          color: 'text-red-700 bg-red-50 border-red-200',
          iconColor: 'text-red-600'
        }
      default:
        return {
          icon: Clock,
          label: status,
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          iconColor: 'text-gray-600'
        }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your reported issues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Reported Issues</h1>
                <p className="text-sm text-gray-600">
                  {issues.length} {issues.length === 1 ? 'issue' : 'issues'} reported
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {issues.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Issues Reported Yet
            </h2>
            <p className="text-gray-600 mb-6">
              When you report maintenance issues during your cleaning jobs, they'll appear here.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => {
              const statusInfo = getStatusInfo(issue.status)
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {issue.title}
                        </h3>
                        {issue.property && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{issue.property.property_name}</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-3">
                      {issue.issue_description}
                    </p>

                    {/* Category and Date */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="capitalize">{issue.category.replace(/_/g, ' ')}</span>
                      <span>Reported: {formatDate(issue.reported_at)}</span>
                    </div>

                    {/* Photos */}
                    {issue.photos && issue.photos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">
                          {issue.photos.length} photo{issue.photos.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex gap-2 overflow-x-auto">
                          {issue.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={getPhotoUrl(photo)}
                              alt={`Issue photo ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.color}`}>
                      <StatusIcon className={`w-5 h-5 ${statusInfo.iconColor}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{statusInfo.label}</p>
                        {issue.status === 'APPROVED' && issue.customer_approved_at && (
                          <p className="text-xs opacity-75">
                            Approved on {formatDate(issue.customer_approved_at)}
                          </p>
                        )}
                        {issue.status === 'REJECTED' && issue.customer_rejected_at && (
                          <p className="text-xs opacity-75">
                            Rejected on {formatDate(issue.customer_rejected_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {issue.status === 'REJECTED' && issue.rejection_reason && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-800">{issue.rejection_reason}</p>
                      </div>
                    )}

                    {/* Maintenance Job Info */}
                    {issue.status === 'APPROVED' && issue.created_maintenance_job && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-green-900">
                              Maintenance Job Created
                            </p>
                            <p className="text-sm text-green-800">
                              {issue.created_maintenance_job.title}
                            </p>
                            <p className="text-xs text-green-700 capitalize">
                              Status: {issue.created_maintenance_job.status.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
