import { useState, useEffect } from 'react'
import { Card, Spinner, EmptyState, useToast, Button } from '../ui'
import { useLoading } from '../../hooks/useLoading'

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
  reported_at: string
  property?: {
    property_name: string
    address: string
  }
}

interface GuestReportsTabProps {
  refreshKey: number
  onRefresh: () => void
}

export default function GuestReportsTab({ refreshKey, onRefresh }: GuestReportsTabProps) {
  const [issues, setIssues] = useState<GuestIssue[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => {
    loadIssues()
  }, [refreshKey])

  const loadIssues = () => {
    withLoading(async () => {
      try {
        const customerData = localStorage.getItem('customer')
        if (!customerData) return

        const customer = JSON.parse(customerData)
        const response = await fetch(`/api/customer-portal/guest-issues?customer_id=${customer.id}`)

        if (!response.ok) throw new Error('Failed to load guest issues')

        const data = await response.json()
        // Only show SUBMITTED issues (awaiting customer action)
        const pending = data.data.filter((issue: GuestIssue) => issue.status === 'SUBMITTED')
        setIssues(pending)
      } catch (err: any) {
        toast.error('Failed to load guest issues')
        console.error(err)
      }
    })
  }

  const handleSubmit = async (issueId: string) => {
    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) return

      const customer = JSON.parse(customerData)

      const response = await fetch(`/api/customer-portal/guest-issues/${issueId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id }),
      })

      if (!response.ok) throw new Error('Failed to submit issue')

      toast.success('Issue submitted to maintenance team')
      loadIssues()
      onRefresh()
    } catch (err: any) {
      toast.error('Failed to submit issue')
    }
  }

  const handleDismiss = async (issueId: string) => {
    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) return

      const customer = JSON.parse(customerData)

      const response = await fetch(`/api/customer-portal/guest-issues/${issueId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id }),
      })

      if (!response.ok) throw new Error('Failed to dismiss issue')

      toast.success('Issue dismissed')
      loadIssues()
      onRefresh()
    } catch (err: any) {
      toast.error('Failed to dismiss issue')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  }

  if (issues.length === 0) {
    return (
      <EmptyState
        title="No pending guest reports"
        description="Guest issues awaiting your review will appear here"
      />
    )
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <Card key={issue.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {issue.property?.property_name || 'Unknown Property'}
              </h3>
              <p className="text-sm text-gray-600">{issue.property?.address}</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
              SUBMITTED
            </span>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Type:</p>
            <p className="text-sm text-gray-600">{issue.issue_type}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
            <p className="text-sm text-gray-600">{issue.issue_description}</p>
          </div>

          {issue.guest_name && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Reported by:</p>
              <p className="text-sm text-gray-600">
                {issue.guest_name}
                {issue.guest_phone && ` • ${issue.guest_phone}`}
              </p>
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
                {issue.photos.slice(0, 3).map((photo, idx) => (
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

          <div className="flex gap-3">
            <Button
              onClick={() => handleSubmit(issue.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit to Maintenance
            </Button>
            <Button
              onClick={() => handleDismiss(issue.id)}
              variant="outline"
              className="flex-1"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
