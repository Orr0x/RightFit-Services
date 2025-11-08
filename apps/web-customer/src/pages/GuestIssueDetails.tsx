import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spinner, Button } from '@rightfit/ui-core'
import { useToast } from '../components/ui'

interface GuestIssue {
  id: string
  property_id: string
  guest_name?: string
  guest_phone?: string
  guest_email?: string
  issue_type: string
  issue_description: string
  location?: string
  urgency?: string
  photos: string[]
  status: 'SUBMITTED' | 'TRIAGED' | 'WORK_ORDER_CREATED' | 'RESOLVED' | 'DISMISSED'
  assigned_to_next_cleaning: boolean
  guest_notified: boolean
  reported_at: string
  triaged_at?: string
  resolved_at?: string
  ai_severity?: string
  ai_category?: string
  ai_recommended_action?: string
  ai_confidence?: number
  property?: {
    property_name: string
    address: string
    postcode: string
  }
}

export default function GuestIssueDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [issue, setIssue] = useState<GuestIssue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    loadIssueDetails()
  }, [id])

  const loadIssueDetails = async () => {
    try {
      setIsLoading(true)
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in to view issue details')
        navigate('/login')
        return
      }

      const customer = JSON.parse(customerData)
      const response = await fetch(`/api/customer-portal/guest-issues?customer_id=${customer.id}`)

      if (!response.ok) throw new Error('Failed to load issues')

      const data = await response.json()
      const foundIssue = data.data.find((i: GuestIssue) => i.id === id)

      if (!foundIssue) {
        toast.error('Issue not found')
        navigate('/issues')
        return
      }

      setIssue(foundIssue)
    } catch (err: any) {
      toast.error('Failed to load issue details')
      console.error('Load issue details error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitIssue = async () => {
    if (!issue) return

    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in')
        return
      }

      const customer = JSON.parse(customerData)
      const response = await fetch(`/api/customer-portal/guest-issues/${issue.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id }),
      })

      if (!response.ok) throw new Error('Failed to submit issue')

      toast.success('Issue submitted to maintenance team')
      loadIssueDetails() // Reload to show updated status
    } catch (err: any) {
      toast.error('Failed to submit issue')
      console.error('Submit issue error:', err)
    }
  }

  const handleDismissIssue = async () => {
    if (!issue) return

    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in')
        return
      }

      const customer = JSON.parse(customerData)
      const response = await fetch(`/api/customer-portal/guest-issues/${issue.id}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id }),
      })

      if (!response.ok) throw new Error('Failed to dismiss issue')

      toast.success('Issue dismissed')
      navigate('/issues')
    } catch (err: any) {
      toast.error('Failed to dismiss issue')
      console.error('Dismiss issue error:', err)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800'
      case 'TRIAGED':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
      case 'WORK_ORDER_CREATED':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800'
      case 'RESOLVED':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'
      case 'DISMISSED':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
      default:
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
    }
  }

  const getSeverityBadgeClass = (severity?: string) => {
    if (!severity) return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'

    switch (severity.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
      case 'medium':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800'
      case 'low':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'
      default:
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Issue not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/issues')}>
          ← Back to Issues
        </Button>
      </div>

      <Card variant="elevated">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Guest Issue Report</h1>
              <p className="text-gray-600 text-lg">{issue.property?.property_name}</p>
              <p className="text-gray-500">{issue.property?.address}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className={getStatusBadgeClass(issue.status)}>
                {issue.status.replace(/_/g, ' ')}
              </span>
              {issue.ai_severity && (
                <span className={getSeverityBadgeClass(issue.ai_severity)}>
                  {issue.ai_severity}
                </span>
              )}
            </div>
          </div>

          {/* Issue Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Issue Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{issue.issue_type}</p>
                </div>
                {issue.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{issue.location}</p>
                  </div>
                )}
                {issue.urgency && (
                  <div>
                    <p className="text-sm text-gray-600">Urgency</p>
                    <p className="font-medium capitalize">{issue.urgency}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Reported</p>
                  <p className="font-medium">{formatDate(issue.reported_at)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Guest Information</h3>
              <div className="space-y-3">
                {issue.guest_name && (
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{issue.guest_name}</p>
                  </div>
                )}
                {issue.guest_email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{issue.guest_email}</p>
                  </div>
                )}
                {issue.guest_phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{issue.guest_phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Description</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700 whitespace-pre-wrap">{issue.issue_description}</p>
            </div>
          </div>

          {/* AI Analysis */}
          {(issue.ai_category || issue.ai_recommended_action) && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">AI Analysis</h3>
              <div className="bg-blue-50 p-4 rounded space-y-2">
                {issue.ai_category && (
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{issue.ai_category}</p>
                  </div>
                )}
                {issue.ai_recommended_action && (
                  <div>
                    <p className="text-sm text-gray-600">Recommended Action</p>
                    <p className="font-medium">{issue.ai_recommended_action}</p>
                  </div>
                )}
                {issue.ai_confidence && (
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="font-medium">{(issue.ai_confidence * 100).toFixed(0)}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos */}
          {issue.photos && issue.photos.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {issue.photos.map((photoUrl, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photoUrl}
                      alt={`Issue photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {issue.status === 'SUBMITTED' && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Actions</h3>
              <div className="flex gap-3">
                <Button variant="primary" onClick={handleSubmitIssue}>
                  Submit to Maintenance Team
                </Button>
                <Button variant="secondary" onClick={handleDismissIssue}>
                  Dismiss Issue
                </Button>
              </div>
            </div>
          )}

          {issue.status === 'WORK_ORDER_CREATED' && (
            <div className="border-t pt-6">
              <p className="text-gray-600">This issue has been submitted to the maintenance team and a work order has been created.</p>
            </div>
          )}

          {issue.status === 'RESOLVED' && (
            <div className="border-t pt-6">
              <p className="text-green-600 font-medium">✓ This issue has been resolved.</p>
              {issue.resolved_at && (
                <p className="text-sm text-gray-600 mt-1">Resolved on {formatDate(issue.resolved_at)}</p>
              )}
            </div>
          )}

          {issue.status === 'DISMISSED' && (
            <div className="border-t pt-6">
              <p className="text-gray-600">This issue has been dismissed.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
