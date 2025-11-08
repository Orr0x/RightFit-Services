import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spinner, Button, Badge } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { Download as DownloadIcon } from '@mui/icons-material'

interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  line_items: InvoiceLineItem[]
  subtotal: number
  tax_percentage: number
  tax_amount: number
  total: number
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  payment_method?: string
  payment_reference?: string
  paid_at?: string
  notes?: string
  maintenance_job?: {
    id: string
    title: string
    property: {
      property_name: string
      address: string
    }
    service: {
      service_name: string
    }
  }
}

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    loadInvoiceDetails()
  }, [id])

  const loadInvoiceDetails = async () => {
    try {
      setIsLoading(true)
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in to view invoice details')
        navigate('/login')
        return
      }

      const customer = JSON.parse(customerData)
      const { customerPortalAPI } = await import('../lib/api')
      const data = await customerPortalAPI.getInvoices(customer.id)

      // Find the specific invoice
      const foundInvoice = data.invoices.find((inv: any) => inv.id === id)

      if (!foundInvoice) {
        toast.error('Invoice not found')
        navigate('/invoices')
        return
      }

      setInvoice(foundInvoice)
    } catch (err: any) {
      toast.error('Failed to load invoice details')
      console.error('Load invoice details error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    toast.success('Download feature coming soon')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `£${Number(amount).toFixed(2)}`
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'PAID': return 'success'
      case 'OVERDUE': return 'error'
      default: return 'warning'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/invoices')}>
          ← Back to Invoices
        </Button>
      </div>

      <Card variant="elevated">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoice</h1>
              <p className="text-xl text-gray-700">{invoice.invoice_number}</p>
            </div>
            <Badge variant={getStatusColor(invoice.status)} className="text-lg px-4 py-2">
              {invoice.status}
            </Badge>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-semibold">{formatDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-semibold">{formatDate(invoice.due_date)}</p>
            </div>
          </div>

          {/* Service Information */}
          {invoice.maintenance_job && (
            <div className="mb-8 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Service Details</h3>
              <p className="text-sm"><strong>Service:</strong> {invoice.maintenance_job.service?.service_name || 'Maintenance Service'}</p>
              <p className="text-sm"><strong>Property:</strong> {invoice.maintenance_job.property?.property_name}</p>
              <p className="text-sm"><strong>Address:</strong> {invoice.maintenance_job.property?.address}</p>
              {invoice.maintenance_job.title && (
                <p className="text-sm"><strong>Job:</strong> {invoice.maintenance_job.title}</p>
              )}
            </div>
          )}

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Invoice Items</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3">Description</th>
                  <th className="text-right py-3">Qty</th>
                  <th className="text-right py-3">Unit Price</th>
                  <th className="text-right py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  invoice.line_items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right py-3 font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-3 text-center text-gray-500">No line items available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">VAT ({invoice.tax_percentage}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-300 text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {invoice.status === 'PAID' && invoice.paid_at && (
            <div className="mt-6 p-4 bg-green-50 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Payment Information</h3>
              <p className="text-sm text-green-700">
                <strong>Paid on:</strong> {formatDate(invoice.paid_at)}
              </p>
              {invoice.payment_method && (
                <p className="text-sm text-green-700">
                  <strong>Method:</strong> {invoice.payment_method}
                </p>
              )}
              {invoice.payment_reference && (
                <p className="text-sm text-green-700">
                  <strong>Reference:</strong> {invoice.payment_reference}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button variant="primary" onClick={handleDownload} className="flex-1">
              <DownloadIcon className="mr-2" />
              Download PDF
            </Button>
            <Button variant="secondary" onClick={() => navigate('/invoices')} className="flex-1">
              View All Invoices
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
