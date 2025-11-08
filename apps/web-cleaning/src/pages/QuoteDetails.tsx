import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Badge, Spinner, Modal, Input, Textarea } from '@rightfit/ui-core';
import { useToast } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import { cleaningQuotesAPI, type CleaningQuote } from '../lib/api'
import { generateQuotePDF } from '../utils/pdfGenerator'

export default function QuoteDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoading, withLoading } = useLoading()

  const [quote, setQuote] = useState<CleaningQuote | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(true)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [declineReason, setDeclineReason] = useState('')

  useEffect(() => {
    if (id) {
      loadQuote()
    }
  }, [id])

  const loadQuote = async () => {
    try {
      setLoadingQuote(true)
      const data = await cleaningQuotesAPI.get(id!)
      setQuote(data)
    } catch (err: any) {
      console.error('Failed to load quote:', err)
      toast.error('Failed to load quote')
      navigate('/quotes')
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleApprove = async () => {
    await withLoading(async () => {
      try {
        await cleaningQuotesAPI.approve(id!)
        toast.success('Quote approved successfully')
        setShowApproveModal(false)
        loadQuote()
      } catch (err: any) {
        console.error('Failed to approve quote:', err)
        toast.error(err.response?.data?.error || 'Failed to approve quote')
      }
    })
  }

  const handleDecline = async () => {
    await withLoading(async () => {
      try {
        await cleaningQuotesAPI.decline(id!, declineReason)
        toast.success('Quote declined')
        setShowDeclineModal(false)
        loadQuote()
      } catch (err: any) {
        console.error('Failed to decline quote:', err)
        toast.error(err.response?.data?.error || 'Failed to decline quote')
      }
    })
  }

  const handleSend = async () => {
    await withLoading(async () => {
      try {
        await cleaningQuotesAPI.send(id!)
        toast.success('Quote sent to customer')
        loadQuote()
      } catch (err: any) {
        console.error('Failed to send quote:', err)
        toast.error(err.response?.data?.error || 'Failed to send quote')
      }
    })
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== quote?.quote_number) {
      toast.error('Quote number does not match')
      return
    }

    await withLoading(async () => {
      try {
        await cleaningQuotesAPI.delete(id!)
        toast.success('Quote deleted successfully')
        navigate('/quotes')
      } catch (err: any) {
        console.error('Failed to delete quote:', err)
        toast.error(err.response?.data?.error || 'Failed to delete quote')
      }
    })

    setShowDeleteModal(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      APPROVED: 'success',
      SENT: 'info',
      DRAFT: 'warning',
      DECLINED: 'danger',
      EXPIRED: 'danger',
    }
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const isExpired = quote && new Date(quote.valid_until) < new Date()

  if (loadingQuote) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading quote...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quote Not Found</h2>
            <p className="text-gray-600 mb-6">The quote you're looking for does not exist.</p>
            <Button onClick={() => navigate('/quotes')}>Go to Quotes</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={() => navigate('/quotes')}>
          ← Back to Quotes
        </Button>
        <div className="flex gap-3">
          {quote.status === 'DRAFT' && (
            <Button onClick={handleSend} disabled={isLoading}>
              Send to Customer
            </Button>
          )}
          {(quote.status === 'SENT' || quote.status === 'DRAFT') && !isExpired && (
            <>
              <Button variant="success" onClick={() => setShowApproveModal(true)} disabled={isLoading}>
                Approve
              </Button>
              <Button variant="danger" onClick={() => setShowDeclineModal(true)} disabled={isLoading}>
                Decline
              </Button>
            </>
          )}
          {(quote.status === 'DRAFT' || quote.status === 'SENT') && (
            <Button variant="secondary" onClick={() => navigate(`/quotes/${id}/edit`)}>
              Edit Quote
            </Button>
          )}
          <Button variant="secondary" onClick={() => generateQuotePDF(quote)}>
            Download PDF
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={isLoading}>
            Delete
          </Button>
        </div>
      </div>

      {/* Quote Header */}
      <Card className="p-8 mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{quote.quote_number}</h1>
            {getStatusBadge(quote.status)}
            {isExpired && quote.status !== 'APPROVED' && quote.status !== 'DECLINED' && (
              <Badge variant="danger" className="ml-2">EXPIRED</Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Quote Date</p>
            <p className="text-lg font-semibold">{formatDate(quote.quote_date)}</p>
            <p className="text-sm text-gray-600 mb-1 mt-3">Valid Until</p>
            <p className={`text-lg font-semibold ${isExpired ? 'text-red-600' : ''}`}>
              {formatDate(quote.valid_until)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">QUOTE FOR</h3>
            <p className="text-lg font-semibold">{quote.customer?.business_name}</p>
            <p className="text-gray-600">{quote.customer?.contact_name}</p>
            <p className="text-gray-600">{quote.customer?.email}</p>
          </div>
          <div>
            {quote.property && (
              <>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">PROPERTY</h3>
                <p className="text-lg font-semibold">{quote.property.property_name}</p>
                <p className="text-gray-600">{quote.property.address}</p>
              </>
            )}
          </div>
        </div>

        {/* Service Description */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">SERVICE DESCRIPTION</h3>
          <p className="text-gray-700">{quote.service_description}</p>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead className="border-b-2 border-gray-300">
              <tr>
                <th className="text-left py-3 text-sm font-semibold text-gray-600">DESCRIPTION</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600">QTY</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600">UNIT PRICE</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {quote.quote_line_items?.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-4">{item.description}</td>
                  <td className="text-right py-4">{item.quantity}</td>
                  <td className="text-right py-4">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right py-4 font-semibold">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.discount_percentage > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span>Discount ({quote.discount_percentage}%):</span>
                <span className="font-semibold">-{formatCurrency(quote.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax ({quote.tax_rate * 100}%):</span>
              <span className="font-semibold">{formatCurrency(quote.tax_amount)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 text-xl">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-blue-600">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {quote.status === 'APPROVED' && quote.approved_date && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-semibold">
              ✓ Quote approved on {formatDate(quote.approved_date)}
            </p>
          </div>
        )}

        {quote.status === 'DECLINED' && quote.declined_date && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-semibold mb-2">
              ✗ Quote declined on {formatDate(quote.declined_date)}
            </p>
            {quote.declined_reason && (
              <p className="text-red-700 text-sm">Reason: {quote.declined_reason}</p>
            )}
          </div>
        )}

        {isExpired && quote.status !== 'APPROVED' && quote.status !== 'DECLINED' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-semibold">⚠ This quote has expired</p>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </Card>

      {/* Quote Metadata */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quote Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 font-medium">{formatDate(quote.created_at)}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">{formatDate(quote.updated_at)}</span>
          </div>
          {quote.sent_date && (
            <div>
              <span className="text-gray-600">Sent to Customer:</span>
              <span className="ml-2 font-medium">{formatDate(quote.sent_date)}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Approve Modal */}
      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Quote">
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to approve this quote? This action will mark the quote as accepted by the customer.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowApproveModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} disabled={isLoading}>
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Approving...' : 'Approve Quote'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Decline Modal */}
      <Modal isOpen={showDeclineModal} onClose={() => setShowDeclineModal(false)} title="Decline Quote">
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for declining this quote (optional):
          </p>
          <Textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g., Customer chose another provider, budget constraints, etc."
            rows={4}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowDeclineModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDecline} disabled={isLoading}>
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Declining...' : 'Decline Quote'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Quote">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-semibold">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-sm text-red-700 mt-2">
              Deleting this quote will permanently remove it from your records.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2">
              To confirm deletion, please type the quote number: <strong>{quote.quote_number}</strong>
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type quote number to confirm"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading || deleteConfirmText !== quote.quote_number}
            >
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Deleting...' : 'Delete Quote'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
