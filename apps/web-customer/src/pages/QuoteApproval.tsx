import { useState, useEffect } from 'react'
import { Card, Button, Badge, Spinner, EmptyState, useToast, Modal } from '../components/ui'
import { useLoading } from '../hooks/useLoading'

interface Quote {
  id: string
  quote_number: string
  quote_date: string
  valid_until_date: string
  line_items: any[]
  subtotal: number
  total: number
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'DECLINED'
  customer_response?: string
  approved_at?: string
  maintenance_jobs?: Array<{
    id: string
    title: string
    category: string
    property?: {
      property_name: string
      address: string
    }
  }>
}

export default function QuoteApproval() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [allQuotes, setAllQuotes] = useState<Quote[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => {
    loadQuotes()
  }, [])

  useEffect(() => {
    // Filter quotes based on status
    if (statusFilter === 'ALL') {
      setQuotes(allQuotes)
    } else {
      setQuotes(allQuotes.filter(q => q.status === statusFilter))
    }
  }, [statusFilter, allQuotes])

  const loadQuotes = () => {
    withLoading(async () => {
      try {
        const customerData = localStorage.getItem('customer')
        if (!customerData) {
          toast.error('Please log in to view quotes')
          return
        }

        const customer = JSON.parse(customerData)
        const response = await fetch(`/api/customer-portal/dashboard?customer_id=${customer.id}`)

        if (!response.ok) throw new Error('Failed to load quotes')

        const data = await response.json()

        // Get all quotes from maintenance jobs
        const maintenanceJobs = data.data.activeJobs.maintenance || []
        const quotesFromJobs: Quote[] = []

        // Extract quotes from maintenance jobs
        maintenanceJobs.forEach((job: any) => {
          if (job.quote) {
            quotesFromJobs.push({
              ...job.quote,
              maintenance_jobs: [{
                id: job.id,
                title: job.title,
                category: job.category,
                property: job.property
              }]
            })
          }
        })

        // Combine with pending quotes and remove duplicates
        const pendingQuotes = data.data.pendingQuotes || []
        const allQuotesMap = new Map()

        pendingQuotes.forEach((q: Quote) => allQuotesMap.set(q.id, q))
        quotesFromJobs.forEach((q: Quote) => allQuotesMap.set(q.id, q))

        const combinedQuotes = Array.from(allQuotesMap.values())
          .sort((a, b) => new Date(b.quote_date).getTime() - new Date(a.quote_date).getTime())

        setAllQuotes(combinedQuotes)
        setQuotes(combinedQuotes)
      } catch (err: any) {
        toast.error('Failed to load quotes')
        console.error('Load quotes error:', err)
      }
    })
  }

  const handleApprove = async (quoteId: string) => {
    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in')
        return
      }

      const customer = JSON.parse(customerData)
      const response = await fetch(`/api/customer-portal/quotes/${quoteId}/approve?customer_id=${customer.id}`, {
        method: 'PUT',
      })

      if (!response.ok) throw new Error('Failed to approve quote')

      toast.success('Quote approved successfully! The maintenance team will schedule the work.')
      loadQuotes() // Reload to show updated status
    } catch (err: any) {
      toast.error('Failed to approve quote')
      console.error('Approve quote error:', err)
    }
  }

  const handleDecline = async () => {
    if (!selectedQuote) return

    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining')
      return
    }

    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in')
        return
      }

      const customer = JSON.parse(customerData)
      const response = await fetch(`/api/customer-portal/quotes/${selectedQuote.id}/decline?customer_id=${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      })

      if (!response.ok) throw new Error('Failed to decline quote')

      toast.success('Quote declined. The maintenance team has been notified.')
      setShowDeclineModal(false)
      setDeclineReason('')
      setSelectedQuote(null)
      loadQuotes() // Reload to show updated status
    } catch (err: any) {
      toast.error('Failed to decline quote')
      console.error('Decline quote error:', err)
    }
  }

  const openDeclineModal = (quote: Quote) => {
    setSelectedQuote(quote)
    setShowDeclineModal(true)
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'APPROVED': return 'success'
      case 'DECLINED': return 'error'
      case 'SENT': return 'warning'
      default: return 'info'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return `£${Number(amount).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <p className="text-gray-600 mt-2">Review and manage quotes for maintenance work at your properties</p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('ALL')}
        >
          All Quotes ({allQuotes.length})
        </Button>
        <Button
          variant={statusFilter === 'SENT' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('SENT')}
        >
          Pending Approval ({allQuotes.filter(q => q.status === 'SENT').length})
        </Button>
        <Button
          variant={statusFilter === 'APPROVED' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('APPROVED')}
        >
          Approved ({allQuotes.filter(q => q.status === 'APPROVED').length})
        </Button>
        <Button
          variant={statusFilter === 'DECLINED' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('DECLINED')}
        >
          Declined ({allQuotes.filter(q => q.status === 'DECLINED').length})
        </Button>
        <Button
          variant={statusFilter === 'DRAFT' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('DRAFT')}
        >
          Draft ({allQuotes.filter(q => q.status === 'DRAFT').length})
        </Button>
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          title={statusFilter === 'ALL' ? 'No quotes' : `No ${statusFilter.toLowerCase()} quotes`}
          description={statusFilter === 'ALL' ? "You don't have any quotes yet" : `You don't have any ${statusFilter.toLowerCase()} quotes`}
        />
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} variant="elevated">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Quote #{quote.quote_number}</h3>
                  <p className="text-sm text-gray-600">
                    Issued: {formatDate(quote.quote_date)} | Valid until: {formatDate(quote.valid_until_date)}
                  </p>
                </div>
                <Badge variant={getStatusColor(quote.status)}>
                  {quote.status}
                </Badge>
              </div>

              {/* Associated Jobs */}
              {quote.maintenance_jobs && quote.maintenance_jobs.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Work Orders:</h4>
                  {quote.maintenance_jobs.map((job) => (
                    <div key={job.id} className="bg-gray-50 p-3 rounded mb-2">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-600">Category: {job.category}</p>
                      {job.property && (
                        <p className="text-sm text-gray-600">
                          Property: {job.property.property_name} - {job.property.address}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Line Items */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Quote Breakdown:</h4>
                <div className="bg-gray-50 p-4 rounded">
                  {Array.isArray(quote.line_items) && quote.line_items.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Quantity</th>
                          <th className="text-right py-2">Unit Price</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.line_items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{item.description}</td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                            <td className="text-right py-2">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-600">No line items available</p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-end space-y-2">
                  <div className="w-64">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(quote.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {quote.status === 'SENT' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(quote.id)}
                    className="flex-1"
                  >
                    Approve Quote
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => openDeclineModal(quote)}
                    className="flex-1"
                  >
                    Decline Quote
                  </Button>
                </div>
              )}

              {quote.status === 'APPROVED' && quote.approved_at && (
                <div className="text-sm text-green-600 pt-4 border-t">
                  Approved on {formatDate(quote.approved_at)}
                </div>
              )}

              {quote.status === 'DECLINED' && quote.customer_response && (
                <div className="text-sm text-red-600 pt-4 border-t">
                  Declined. Reason: {quote.customer_response}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedQuote && (
        <Modal
          isOpen={showDeclineModal}
          onClose={() => {
            setShowDeclineModal(false)
            setDeclineReason('')
            setSelectedQuote(null)
          }}
          title="Decline Quote"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for declining Quote #{selectedQuote.quote_number}:
            </p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Price too high, found alternative provider, no longer needed..."
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeclineModal(false)
                  setDeclineReason('')
                  setSelectedQuote(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDecline}
                disabled={!declineReason.trim()}
                className="flex-1"
              >
                Decline Quote
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
