import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, Select, Spinner, Textarea, type SelectOption } from '@rightfit/ui-core';
import { useToast } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import { useAuth } from '../contexts/AuthContext'
import {
  cleaningQuotesAPI,
  customersAPI,
  customerPropertiesAPI,
  type CreateQuoteLineItemData,
} from '../lib/api'

interface LineItem extends CreateQuoteLineItemData {
  id: string
}

export default function EditQuote() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { isLoading, withLoading } = useLoading()

  // Form state
  const [customerId, setCustomerId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 },
  ])

  // Dropdowns
  const [customers, setCustomers] = useState<SelectOption[]>([])
  const [properties, setProperties] = useState<SelectOption[]>([])
  const [loadingQuote, setLoadingQuote] = useState(true)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingProperties, setLoadingProperties] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true)
        const result = await customersAPI.list()
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

  // Load quote data
  useEffect(() => {
    const loadQuote = async () => {
      if (!id) return

      try {
        setLoadingQuote(true)
        const quote = await cleaningQuotesAPI.get(id)

        // Pre-populate form fields
        setCustomerId(quote.customer_id || '')
        setPropertyId(quote.property_id || '')
        setServiceDescription(quote.service_description || '')
        setValidUntil(quote.valid_until?.split('T')[0] || '')
        setDiscountPercentage(quote.discount_percentage || 0)
        setNotes(quote.notes || '')

        // Convert line items from database format to form format
        if (quote.quote_line_items && quote.quote_line_items.length > 0) {
          const formLineItems = quote.quote_line_items.map((item, index) => ({
            id: String(index + 1),
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
          setLineItems(formLineItems)
        }
      } catch (err: any) {
        console.error('Failed to load quote:', err)
        toast.error('Failed to load quote')
        navigate('/quotes')
      } finally {
        setLoadingQuote(false)
      }
    }

    loadQuote()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Load properties when customer changes
  useEffect(() => {
    const loadProperties = async () => {
      if (!customerId) {
        setProperties([])
        return
      }

      try {
        setLoadingProperties(true)
        const result = await customerPropertiesAPI.list({ customer_id: customerId })
        const options = (result.data || []).map((property) => ({
          value: property.id,
          label: property.property_name,
        }))
        setProperties(options)
      } catch (err) {
        console.error('Failed to load properties:', err)
        toast.error('Failed to load properties')
      } finally {
        setLoadingProperties(false)
      }
    }

    loadProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  const calculateLineTotal = (item: LineItem) => {
    return item.quantity * item.unit_price
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  }

  const calculateDiscountAmount = () => {
    return calculateSubtotal() * (discountPercentage / 100)
  }

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscountAmount()) * 0.2 // 20% VAT
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount() + calculateTax()
  }

  const addLineItem = () => {
    const newId = (Math.max(...lineItems.map((item) => parseInt(item.id)), 0) + 1).toString()
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast.warning('Quote must have at least one line item')
      return
    }
    setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof CreateQuoteLineItemData, value: any) => {
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
    if (!serviceDescription.trim()) {
      newErrors.serviceDescription = 'Service description is required'
    }
    if (!validUntil) {
      newErrors.validUntil = 'Valid until date is required'
    }
    if (validUntil && validUntil < new Date().toISOString().split('T')[0]) {
      newErrors.validUntil = 'Valid until date must be in the future'
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
      newErrors.discountPercentage = 'Discount must be between 0 and 100'
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
        const subtotal = calculateSubtotal()
        const discountAmount = calculateDiscountAmount()

        const quoteData = {
          customer_id: String(customerId),
          property_id: propertyId ? String(propertyId) : undefined,
          service_description: String(serviceDescription),
          valid_until: String(validUntil),
          line_items: lineItems.map(({ id, ...item }) => ({
            description: String(item.description),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          })),
          subtotal: Number(subtotal),
          discount_percentage: Number(discountPercentage),
          discount_amount: Number(discountAmount),
          notes: notes || undefined,
        }

        console.log('Sending quote update data:', quoteData)
        const quote = await cleaningQuotesAPI.update(id!, quoteData)
        toast.success('Quote updated successfully')
        navigate(`/quotes/${quote.id}`)
      } catch (err: any) {
        console.error('Failed to update quote:', err)
        toast.error(err.response?.data?.error || 'Failed to update quote')
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  if (loadingQuote || loadingCustomers) {
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
          <h1 className="text-3xl font-bold">Edit Quote</h1>
          <p className="text-gray-600 mt-1">Update quote details</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/quotes/${id}`)}>
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
          <div className="space-y-6">
            {/* Customer & Property Selection */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select
                  label="Property (Optional)"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  options={properties}
                  placeholder={loadingProperties ? 'Loading properties...' : 'Select a property'}
                  disabled={!customerId || loadingProperties}
                />
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Service Details</h2>
              <div className="space-y-4">
                <Textarea
                  label="Service Description *"
                  value={serviceDescription}
                  onChange={(e) => {
                    setServiceDescription(e.target.value)
                    if (errors.serviceDescription) {
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.serviceDescription
                        return newErrors
                      })
                    }
                  }}
                  placeholder="Describe the cleaning service being quoted..."
                  rows={3}
                  error={errors.serviceDescription}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Valid Until *"
                    value={validUntil}
                    onChange={(e) => {
                      setValidUntil(e.target.value)
                      if (errors.validUntil) {
                        setErrors((prev) => {
                          const newErrors = { ...prev }
                          delete newErrors.validUntil
                          return newErrors
                        })
                      }
                    }}
                    error={errors.validUntil}
                    required
                  />
                  <Input
                    type="number"
                    label="Discount %"
                    value={discountPercentage}
                    onChange={(e) => {
                      setDiscountPercentage(Number(e.target.value))
                      if (errors.discountPercentage) {
                        setErrors((prev) => {
                          const newErrors = { ...prev }
                          delete newErrors.discountPercentage
                          return newErrors
                        })
                      }
                    }}
                    min="0"
                    max="100"
                    step="0.1"
                    error={errors.discountPercentage}
                  />
                </div>
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
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountPercentage}%):</span>
                    <span className="font-medium">-{formatCurrency(calculateDiscountAmount())}</span>
                  </div>
                )}
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
              {isLoading ? 'Updating Quote...' : 'Update Quote'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/quotes/${id}`)}
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
