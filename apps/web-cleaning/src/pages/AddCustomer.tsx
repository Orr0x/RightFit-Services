import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select, Spinner, useToast, Checkbox, type SelectOption } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { customersAPI, type CreateCustomerData } from '../lib/api'

const UK_PHONE_REGEX = /^(?:(?:\+44\s?|0)(?:\d\s?){9,10})$/

export default function AddCustomer() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoading, withLoading } = useLoading()

  // Form state
  const [formData, setFormData] = useState<CreateCustomerData>({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: '',
    country: '',
    customer_type: 'INDIVIDUAL',
    has_cleaning_contract: false,
    has_maintenance_contract: false,
    bundled_discount_percentage: 0,
    payment_terms: 'NET_14',
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const customerTypeOptions: SelectOption[] = [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'PROPERTY_MANAGER', label: 'Property Manager' },
    { value: 'VACATION_RENTAL', label: 'Vacation Rental Company' },
  ]

  const paymentTermsOptions: SelectOption[] = [
    { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
    { value: 'NET_7', label: 'Net 7 Days' },
    { value: 'NET_14', label: 'Net 14 Days' },
    { value: 'NET_30', label: 'Net 30 Days' },
    { value: 'NET_60', label: 'Net 60 Days' },
  ]

  const handleInputChange = (field: keyof CreateCustomerData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Contact name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!UK_PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid UK phone number'
    }

    // Address validation
    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = 'Address line 1 is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    await withLoading(async () => {
      try {
        const created = await customersAPI.create(formData)
        toast.success(`Customer "${created.business_name}" created successfully`)
        navigate(`/customers/${created.id}`)
      } catch (err: any) {
        console.error('Failed to create customer:', err)
        toast.error(err.response?.data?.error || 'Failed to create customer')
      }
    })
  }

  const handleCancel = () => {
    navigate('/customers')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="secondary" onClick={handleCancel}>
          ← Back to Customers
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Add Customer</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Business Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Business Name"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="e.g., Acme Properties Ltd"
                  error={errors.business_name}
                  required
                  disabled={isLoading}
                />
              </div>

              <Input
                label="Contact Person Name"
                value={formData.contact_name}
                onChange={(e) => handleInputChange('contact_name', e.target.value)}
                placeholder="e.g., John Smith"
                error={errors.contact_name}
                required
                disabled={isLoading}
              />

              <Select
                label="Customer Type"
                value={formData.customer_type}
                onChange={(value) => handleInputChange('customer_type', value as any)}
                options={customerTypeOptions}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="e.g., john@acmeproperties.com"
                error={errors.email}
                required
                disabled={isLoading}
              />

              <Input
                type="tel"
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g., 07123 456789"
                error={errors.phone}
                required
                disabled={isLoading}
              />

              <div className="md:col-span-2">
                <Input
                  label="Address Line 1"
                  value={formData.address_line1}
                  onChange={(e) => handleInputChange('address_line1', e.target.value)}
                  placeholder="e.g., 123 High Street"
                  error={errors.address_line1}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Address Line 2 (Optional)"
                  value={formData.address_line2}
                  onChange={(e) => handleInputChange('address_line2', e.target.value)}
                  placeholder="e.g., Building 5, Floor 2"
                  disabled={isLoading}
                />
              </div>

              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., London"
                error={errors.city}
                required
                disabled={isLoading}
              />

              <Input
                label="Postcode"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                placeholder="e.g., SW1A 1AA"
                error={errors.postcode}
                required
                disabled={isLoading}
              />

              <div className="md:col-span-2">
                <Input
                  label="Country (Optional)"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="e.g., United Kingdom"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Service Contracts */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Service Contracts</h2>
            <div className="space-y-4">
              <Checkbox
                label="Has Cleaning Contract"
                checked={formData.has_cleaning_contract || false}
                onChange={(e) => handleInputChange('has_cleaning_contract', e.target.checked)}
                disabled={isLoading}
              />

              <Checkbox
                label="Has Maintenance Contract"
                checked={formData.has_maintenance_contract || false}
                onChange={(e) => handleInputChange('has_maintenance_contract', e.target.checked)}
                disabled={isLoading}
              />

              {formData.has_cleaning_contract && formData.has_maintenance_contract && (
                <div className="mt-4">
                  <Input
                    type="number"
                    label="Bundled Discount Percentage"
                    value={formData.bundled_discount_percentage?.toString() || '0'}
                    onChange={(e) =>
                      handleInputChange('bundled_discount_percentage', parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 10"
                    min="0"
                    max="100"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Discount applied when customer has both cleaning and maintenance contracts
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Payment Terms */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Payment Terms"
                value={formData.payment_terms || 'NET_14'}
                onChange={(value) => handleInputChange('payment_terms', value as any)}
                options={paymentTermsOptions}
                disabled={isLoading}
              />
              <div className="flex items-end">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Defines when invoices are due for this customer
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Creating Customer...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
