import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select, Spinner, Textarea, type SelectOption } from '@rightfit/ui-core';
import { useToast } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import { useAuth } from '../contexts/AuthContext'
import { api, customersAPI, type CreateInvoiceLineItemData } from '../lib/api'

interface LineItem extends CreateInvoiceLineItemData {
  id: string
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { isLoading, withLoading } = useLoading()

  // Form state
  const [customerId, setCustomerId] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [billingPeriodStart, setBillingPeriodStart] = useState('')
  const [billingPeriodEnd, setBillingPeriodEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 },
  ])

  // Customers for dropdown
  const [customers, setCustomers] = useState<SelectOption[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true)
        const result = await customersAPI.list({ service_provider_id: user?.id })
        const options = result.data.map((customer) => ({
          value: customer.id,
          label: customer.business_name,
        }))
        setCustomers(options)
      } catch (err) {
        console.error('Failed to load customers:', err)
        toast.error('Failed to load customers')
      } finally {
        setLoadingCustomers(false)
      }
    }

    if (user?.id) {
      loadCustomers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

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

    if (!customerId) {
      newErrors.customerId = 'Customer is required'
    }
    if (!issueDate) {
      newErrors.issueDate = 'Issue date is required'
    }
    if (!billingPeriodStart) {
      newErrors.billingPeriodStart = 'Billing period start is required'
    }
    if (!billingPeriodEnd) {
      newErrors.billingPeriodEnd = 'Billing period end is required'
    }
    if (billingPeriodStart && billingPeriodEnd && billingPeriodStart > billingPeriodEnd) {
      newErrors.billingPeriodEnd = 'End date must be after start date'
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

    if (!user?.id) {
      toast.error('User not found')
      return
    }

    await withLoading(async () => {
      try {
        // Calculate due date (14 days after billing period end)
        const dueDate = new Date(billingPeriodEnd)
        dueDate.setDate(dueDate.getDate() + 14)

        const invoiceData = {
          customer_id: String(customerId),
          invoice_date: String(issueDate),
          due_date: dueDate.toISOString().split('T')[0],
          line_items: lineItems.map(({ id, ...item }) => ({
            description: String(item.description),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          })),
          notes: notes
            ? `Billing Period: ${billingPeriodStart} to ${billingPeriodEnd}\n\n${notes}`
            : `Billing Period: ${billingPeriodStart} to ${billingPeriodEnd}`,
        }

        console.log('Sending invoice data:', invoiceData)
        // Use generic invoices API endpoint
        const response = await api.post('/api/invoices', invoiceData)
        const invoice = response.data.data
        toast.success('Invoice created successfully')
        navigate(`/invoices/${invoice.id}`)
      } catch (err: any) {
        console.error('Failed to create invoice:', err)
        toast.error(err.response?.data?.error || 'Failed to create invoice')
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  if (loadingCustomers) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-gray-600 mt-1">Create a new invoice for a customer</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
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
          {/* Customer Selection */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
              <Select
                label="Customer *"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value)
                  if (errors.customerId) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.customerId
                      return newErrors
                    })
                  }
                }}
                options={customers}
                placeholder="Select a customer"
                error={errors.customerId}
                required
              />
            </div>

            {/* Dates */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Invoice Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  label="Billing Period Start *"
                  value={billingPeriodStart}
                  onChange={(e) => {
                    setBillingPeriodStart(e.target.value)
                    if (errors.billingPeriodStart) {
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.billingPeriodStart
                        return newErrors
                      })
                    }
                  }}
                  error={errors.billingPeriodStart}
                  required
                />
                <Input
                  type="date"
                  label="Billing Period End *"
                  value={billingPeriodEnd}
                  onChange={(e) => {
                    setBillingPeriodEnd(e.target.value)
                    if (errors.billingPeriodEnd) {
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.billingPeriodEnd
                        return newErrors
                      })
                    }
                  }}
                  error={errors.billingPeriodEnd}
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
              {isLoading ? 'Creating Invoice...' : 'Create Invoice'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/invoices')} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
