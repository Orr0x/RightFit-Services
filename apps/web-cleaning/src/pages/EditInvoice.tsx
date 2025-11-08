import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, Spinner, Textarea } from '@rightfit/ui-core';
import { useToast } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import { cleaningInvoicesAPI, api, type CreateInvoiceLineItemData } from '../lib/api'

interface LineItem extends CreateInvoiceLineItemData {
  id: string
}

export default function EditInvoice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoading, withLoading } = useLoading()

  // Form state
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 },
  ])

  // Loading state
  const [loadingInvoice, setLoadingInvoice] = useState(true)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load invoice data
  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return

      try {
        setLoadingInvoice(true)
        const invoice = await cleaningInvoicesAPI.get(id)

        // Pre-populate form fields
        setIssueDate(invoice.issue_date?.split('T')[0] || new Date().toISOString().split('T')[0])
        setDueDate(invoice.due_date?.split('T')[0] || '')
        setNotes(invoice.notes || '')

        // Convert line items from database format to form format
        if (invoice.invoice_line_items && invoice.invoice_line_items.length > 0) {
          const formLineItems = invoice.invoice_line_items.map((item, index) => ({
            id: String(index + 1),
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
          setLineItems(formLineItems)
        }
      } catch (err: any) {
        console.error('Failed to load invoice:', err)
        toast.error('Failed to load invoice')
        navigate('/invoices')
      } finally {
        setLoadingInvoice(false)
      }
    }

    loadInvoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const calculateLineTotal = (item: LineItem) => {
    return item.quantity * item.unit_price
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.2 // 20% VAT
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const addLineItem = () => {
    const newId = (Math.max(...lineItems.map((item) => parseInt(item.id)), 0) + 1).toString()
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast.warning('Invoice must have at least one line item')
      return
    }
    setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof CreateInvoiceLineItemData, value: any) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) || 0 } : item
      )
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!issueDate) {
      newErrors.issueDate = 'Issue date is required'
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    // Validate line items
    lineItems.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`lineItem_${index}_description`] = 'Description is required'
      }
      if (item.quantity <= 0) {
        newErrors[`lineItem_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      if (item.unit_price < 0) {
        newErrors[`lineItem_${index}_unit_price`] = 'Unit price cannot be negative'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    await withLoading(async () => {
      try {
        const invoiceData = {
          invoice_date: String(issueDate),
          due_date: String(dueDate),
          line_items: lineItems.map(({ id, ...item }) => ({
            description: String(item.description),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          })),
          notes: notes || undefined,
        }

        console.log('Sending invoice update data:', invoiceData)
        const response = await api.patch(`/api/invoices/${id}`, invoiceData)
        const invoice = response.data.data
        toast.success('Invoice updated successfully')
        navigate(`/invoices/${invoice.id}`)
      } catch (err: any) {
        console.error('Failed to update invoice:', err)
        toast.error(err.response?.data?.error || 'Failed to update invoice')
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  if (loadingInvoice) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading invoice...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
          <p className="text-gray-600 mt-1">Update invoice details</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/invoices/${id}`)}>
          Cancel
        </Button>
      </div>

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          {/* Dates */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Invoice Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Issue Date *"
                  value={issueDate}
                  onChange={(e) => {
                    setIssueDate(e.target.value)
                    if (errors.issueDate) {
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.issueDate
                        return newErrors
                      })
                    }
                  }}
                  error={errors.issueDate}
                  required
                />
                <Input
                  type="date"
                  label="Due Date *"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value)
                    if (errors.dueDate) {
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.dueDate
                        return newErrors
                      })
                    }
                  }}
                  error={errors.dueDate}
                  required
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Line Items</h2>
                <Button type="button" variant="secondary" onClick={addLineItem}>
                  + Add Line Item
                </Button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <Card key={item.id} className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <Input
                          label={`Description ${index + 1} *`}
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="e.g., Deep cleaning service"
                          error={errors[`lineItem_${index}_description`]}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          label="Quantity *"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                          min="1"
                          step="1"
                          error={errors[`lineItem_${index}_quantity`]}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          label="Unit Price *"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                          error={errors[`lineItem_${index}_unit_price`]}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Line Total</label>
                        <div className="text-lg font-semibold text-gray-900 mt-2">
                          {formatCurrency(calculateLineTotal(item))}
                        </div>
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (20%):</span>
                  <span className="font-medium">{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <div>
              <Textarea
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or terms..."
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Updating Invoice...' : 'Update Invoice'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/invoices/${id}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
