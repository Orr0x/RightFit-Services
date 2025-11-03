import { useState, useEffect } from 'react'
import { Card, Spinner, EmptyState, useToast, Button } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import './GuestIssues.css'

interface GuestIssue {
  id: string
  property_id: string
  guest_name?: string
  guest_phone?: string
  guest_email?: string
  issue_type: string
  issue_description: string
  photos: string[]
  status: 'SUBMITTED' | 'TRIAGED' | 'WORK_ORDER_CREATED' | 'RESOLVED' | 'DISMISSED'
  assigned_to_next_cleaning: boolean
  guest_notified: boolean
  reported_at: string
  triaged_at?: string
  ai_severity?: string
  ai_category?: string
  ai_confidence?: number
  property?: {
    property_name: string
    address: string
    postcode: string
  }
}

export default function GuestIssues() {
  const [issues, setIssues] = useState<GuestIssue[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => {
    loadGuestIssues()
  }, [])

  const loadGuestIssues = () => {
    withLoading(async () => {
      try {
        const customerData = localStorage.getItem('customer')
        if (!customerData) {
          toast.error('Please log in to view issues')
          return
        }

        const customer = JSON.parse(customerData)

        // Fetch all guest issues for this customer's properties
        const response = await fetch(`/api/customer-portal/guest-issues?customer_id=${customer.id}`)

        if (!response.ok) throw new Error('Failed to load issues')

        const data = await response.json()
        setIssues(data.data)
      } catch (err: any) {
        toast.error('Failed to load guest issues')
        console.error('Load guest issues error:', err)
      }
    })
  }

  const handleSubmitIssue = async (issueId: string) => {
    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in')
        return
      }

      const customer = JSON.parse(customerData)

      const response = await fetch(`/api/customer-portal/guest-issues/${issueId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id }),
      })

      if (!response.ok) throw new Error('Failed to submit issue')

      toast.success('Issue submitted to maintenance team')
      loadGuestIssues() // Reload to show updated status
    } catch (err: any) {
      toast.error('Failed to submit issue')
      console.error('Submit issue error:', err)
    }
  }

  const handleDismissIssue = async (issueId: string) => {
    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in')
        return
      }

      const customer = JSON.parse(customerData)

      const response = await fetch(`/api/customer-portal/guest-issues/${issueId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id }),
      })

      if (!response.ok) throw new Error('Failed to dismiss issue')

      toast.success('Issue dismissed')
      loadGuestIssues() // Reload to show updated status
    } catch (err: any) {
      toast.error('Failed to dismiss issue')
      console.error('Dismiss issue error:', err)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'status-badge status-pending'
      case 'TRIAGED':
        return 'status-badge status-triaged'
      case 'WORK_ORDER_CREATED':
        return 'status-badge status-in-progress'
      case 'RESOLVED':
        return 'status-badge status-resolved'
      case 'DISMISSED':
        return 'status-badge status-dismissed'
      default:
        return 'status-badge'
    }
  }

  const getSeverityBadgeClass = (severity?: string) => {
    if (!severity) return 'severity-badge'

    switch (severity.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'severity-badge severity-high'
      case 'medium':
        return 'severity-badge severity-medium'
      case 'low':
        return 'severity-badge severity-low'
      default:
        return 'severity-badge'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="guest-issues-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest Issue Reports</h1>
          <p className="page-subtitle">Issues reported by guests at your properties</p>
        </div>
      </div>

      {issues.length === 0 ? (
        <EmptyState
          title="No guest issues"
          description="No issues have been reported by guests yet"
        />
      ) : (
        <div className="issues-list">
          {issues.map((issue) => (
            <Card key={issue.id} variant="elevated" className="issue-card">
              <div className="issue-header">
                <div>
                  <h3 className="issue-property-name">
                    {issue.property?.property_name || 'Unknown Property'}
                  </h3>
                  <p className="issue-property-address">
                    {issue.property?.address}
                  </p>
                </div>
                <div className="issue-badges">
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

              <div className="issue-content">
                <div className="issue-detail-row">
                  <strong>Type:</strong>
                  <span>{issue.issue_type}</span>
                </div>

                <div className="issue-detail-row">
                  <strong>Description:</strong>
                  <p className="issue-description">{issue.issue_description}</p>
                </div>

                {issue.guest_name && (
                  <div className="issue-detail-row">
                    <strong>Reported by:</strong>
                    <span>{issue.guest_name}</span>
                  </div>
                )}

                {(issue.guest_email || issue.guest_phone) && (
                  <div className="issue-detail-row">
                    <strong>Contact:</strong>
                    <span>
                      {issue.guest_email || issue.guest_phone}
                    </span>
                  </div>
                )}

                <div className="issue-detail-row">
                  <strong>Reported:</strong>
                  <span>{formatDate(issue.reported_at)}</span>
                </div>

                {issue.ai_category && (
                  <div className="issue-detail-row">
                    <strong>AI Category:</strong>
                    <span>{issue.ai_category}</span>
                  </div>
                )}
              </div>

              <div className="issue-actions">
                {issue.status === 'SUBMITTED' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmitIssue(issue.id)}
                    >
                      Submit to Maintenance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissIssue(issue.id)}
                    >
                      Dismiss
                    </Button>
                  </>
                )}
                {issue.status === 'WORK_ORDER_CREATED' && (
                  <span className="text-sm text-gray-600">Submitted to maintenance team</span>
                )}
                {issue.status === 'DISMISSED' && (
                  <span className="text-sm text-gray-500">Dismissed</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
