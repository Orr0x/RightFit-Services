import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Badge, Spinner, useToast, Modal, Input, Select, type SelectOption } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { cleaningInvoicesAPI, type CleaningInvoice } from '../lib/api'
import { generateInvoicePDF } from '../utils/pdfGenerator'

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoading, withLoading } = useLoading()

  const [invoice, setInvoice] = useState<CleaningInvoice | null>(null)
  const [loadingInvoice, setLoadingInvoice] = useState(true)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Mark as paid form
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')

  useEffect(() => {
    if (id) {
      loadInvoice()
    }
  }, [id])

  const loadInvoice = async () => {
    try {
      setLoadingInvoice(true)
      const data = await cleaningInvoicesAPI.get(id!)
      setInvoice(data)
    } catch (err: any) {
      console.error('Failed to load invoice:', err)
      toast.error('Failed to load invoice')
      navigate('/invoices')
    } finally {
      setLoadingInvoice(false)
    }
  }

  const handleMarkAsPaid = async () => {
    await withLoading(async () => {
      try {
        await cleaningInvoicesAPI.markAsPaid(id!, {
          paid_date: paidDate,
          payment_method: paymentMethod,
        })
        toast.success('Invoice marked as paid')
        setShowMarkPaidModal(false)
        loadInvoice()
      } catch (err: any) {
        console.error('Failed to mark invoice as paid:', err)
        toast.error(err.response?.data?.error || 'Failed to mark invoice as paid')
      }
    })
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== invoice?.invoice_number) {
      toast.error('Invoice number does not match')
      return
    }

    await withLoading(async () => {
      try {
        await cleaningInvoicesAPI.delete(id!)
        toast.success('Invoice deleted successfully')
        navigate('/invoices')
      } catch (err: any) {
        console.error('Failed to delete invoice:', err)
        toast.error(err.response?.data?.error || 'Failed to delete invoice')
      }
    })

    setShowDeleteModal(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      PAID: 'success',
      SENT: 'info',
      DRAFT: 'warning',
      OVERDUE: 'danger',
      CANCELLED: 'danger',
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

  const paymentMethodOptions: SelectOption[] = [
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CASH', label: 'Cash' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'CARD', label: 'Card Payment' },
    { value: 'OTHER', label: 'Other' },
  ]

  if (loadingInvoice) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading invoice...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 mb-6">The invoice you're looking for does not exist.</p>
            <Button onClick={() => navigate('/invoices')}>Go to Invoices</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
          ← Back to Invoices
        </Button>
        <div className="flex gap-3">
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <>
              <Button onClick={() => setShowMarkPaidModal(true)}>Mark as Paid</Button>
              <Button variant="secondary" onClick={() => navigate(`/invoices/${id}/edit`)}>
                Edit Invoice
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => generateInvoicePDF(invoice)}>
            Download PDF
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={isLoading}>
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice Header */}
      <Card className="p-8 mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{invoice.invoice_number}</h1>
            {getStatusBadge(invoice.status)}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Issue Date</p>
            <p className="text-lg font-semibold">{formatDate(invoice.issue_date)}</p>
            <p className="text-sm text-gray-600 mb-1 mt-3">Due Date</p>
            <p className="text-lg font-semibold">{formatDate(invoice.due_date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">BILLED TO</h3>
            <p className="text-lg font-semibold">{invoice.customer?.business_name}</p>
            <p className="text-gray-600">{invoice.customer?.contact_name}</p>
            <p className="text-gray-600">{invoice.customer?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">BILLING PERIOD</h3>
            <p className="text-gray-600">
              {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
            </p>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 mt-4">PAYMENT TERMS</h3>
            <p className="text-gray-600">{invoice.customer?.payment_terms?.replace(/_/g, ' ')}</p>
          </div>
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
              {invoice.invoice_line_items?.map((item) => (
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
              <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax ({invoice.tax_rate * 100}%):</span>
              <span className="font-semibold">{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 text-xl">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-blue-600">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {invoice.status === 'PAID' && invoice.paid_date && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-semibold">
              ✓ Paid on {formatDate(invoice.paid_date)}
              {invoice.payment_method && ` via ${invoice.payment_method.replace(/_/g, ' ')}`}
            </p>
          </div>
        )}

        {invoice.status === 'OVERDUE' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-semibold">⚠ Payment is overdue</p>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </Card>

      {/* Invoice Metadata */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 font-medium">{formatDate(invoice.created_at)}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">{formatDate(invoice.updated_at)}</span>
          </div>
          {invoice.sent_date && (
            <div>
              <span className="text-gray-600">Sent to Customer:</span>
              <span className="ml-2 font-medium">{formatDate(invoice.sent_date)}</span>
            </div>
          )}
          {invoice.contract_id && (
            <div>
              <span className="text-gray-600">Linked Contract:</span>
              <span className="ml-2 font-medium">{invoice.contract_id}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Mark as Paid Modal */}
      <Modal isOpen={showMarkPaidModal} onClose={() => setShowMarkPaidModal(false)} title="Mark Invoice as Paid">
        <div className="space-y-4">
          <Input
            type="date"
            label="Payment Date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            required
          />
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value)}
            options={paymentMethodOptions}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowMarkPaidModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid} disabled={isLoading}>
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Updating...' : 'Mark as Paid'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Invoice">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-semibold">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-sm text-red-700 mt-2">
              Deleting this invoice will permanently remove it from your records.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2">
              To confirm deletion, please type the invoice number: <strong>{invoice.invoice_number}</strong>
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type invoice number to confirm"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading || deleteConfirmText !== invoice.invoice_number}
            >
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Deleting...' : 'Delete Invoice'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
