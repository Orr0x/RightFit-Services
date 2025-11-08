import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Button, Card, Input, Select, Spinner, Radio, Textarea } from '@rightfit/ui-core';
import { useToast } from '../components/ui';

interface Customer {
  id: string
  business_name: string
  contact_name: string
  email: string
}

export default function CreateContract() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  const [formData, setFormData] = useState({
    customer_id: '',
    contract_type: 'FLAT_MONTHLY' as 'FLAT_MONTHLY' | 'PER_PROPERTY',
    contract_start_date: new Date().toISOString().split('T')[0],
    contract_end_date: '',
    monthly_fee: '',
    billing_day: '1',
    notes: '',
    customer_address_line1: '',
    customer_address_line2: '',
    customer_city: '',
    customer_postcode: '',
    customer_country: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const response = await api.get('/api/customers')
      setCustomers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
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

    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer'
    }

    if (!formData.monthly_fee || Number(formData.monthly_fee) <= 0) {
      newErrors.monthly_fee = 'Please enter a valid monthly fee'
    }

    const billingDay = Number(formData.billing_day)
    if (billingDay < 1 || billingDay > 31) {
      newErrors.billing_day = 'Billing day must be between 1 and 31'
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

    if (!user) {
      toast.error('User not authenticated')
      return
    }

    try {
      setLoading(true)

      const payload = {
        customer_id: formData.customer_id,
        service_provider_id: user.service_provider_id,
        contract_type: formData.contract_type,
        contract_start_date: formData.contract_start_date,
        contract_end_date: formData.contract_end_date || undefined,
        monthly_fee: Number(formData.monthly_fee),
        billing_day: Number(formData.billing_day),
        notes: formData.notes || undefined,
        customer_address_line1: formData.customer_address_line1 || undefined,
        customer_address_line2: formData.customer_address_line2 || undefined,
        customer_city: formData.customer_city || undefined,
        customer_postcode: formData.customer_postcode || undefined,
        customer_country: formData.customer_country || undefined,
      }

      const response = await api.post('/api/cleaning-contracts', payload)

      toast.success('Contract created successfully')

      // Navigate to the contract details page
      if (response.data.id) {
        navigate(`/contracts/${response.data.id}`)
      } else {
        navigate('/contracts')
      }
    } catch (error: any) {
      console.error('Error creating contract:', error)
      toast.error(error.response?.data?.error || 'Failed to create contract')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/contracts')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="secondary" onClick={handleCancel}>
          <ArrowBackIcon sx={{ fontSize: 20, mr: 1 }} />
          Back to Contracts
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Create Cleaning Contract</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Customer Selection */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer *
                </label>
                {loadingCustomers ? (
                  <div className="flex items-center justify-center py-4">
                    <Spinner />
                  </div>
                ) : (
                  <Select
                    placeholder="Select a customer..."
                    options={customers.map((customer) => ({
                      value: customer.id,
                      label: `${customer.business_name} - ${customer.contact_name}`,
                    }))}
                    value={formData.customer_id}
                    onChange={(e) => handleInputChange('customer_id', e.target.value)}
                    required
                  />
                )}
                {errors.customer_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                )}
              </div>

              {/* Contract Number - Auto-generated */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="font-semibold">Contract Number:</span> Will be auto-generated (e.g., CT-2025-0001)
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Address */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Address (Optional)</h2>
            <div className="space-y-3">
              <Input
                type="text"
                label="Address Line 1"
                value={formData.customer_address_line1}
                onChange={(e) => handleInputChange('customer_address_line1', e.target.value)}
                placeholder="e.g., 123 High Street"
                disabled={loading}
              />
              <Input
                type="text"
                label="Address Line 2"
                value={formData.customer_address_line2}
                onChange={(e) => handleInputChange('customer_address_line2', e.target.value)}
                placeholder="e.g., Building 5, Floor 2"
                disabled={loading}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  label="City"
                  value={formData.customer_city}
                  onChange={(e) => handleInputChange('customer_city', e.target.value)}
                  placeholder="e.g., London"
                  disabled={loading}
                />
                <Input
                  type="text"
                  label="Postcode"
                  value={formData.customer_postcode}
                  onChange={(e) => handleInputChange('customer_postcode', e.target.value)}
                  placeholder="e.g., SW1A 1AA"
                  disabled={loading}
                />
              </div>
              <Input
                type="text"
                label="Country"
                value={formData.customer_country}
                onChange={(e) => handleInputChange('customer_country', e.target.value)}
                placeholder="e.g., United Kingdom"
                disabled={loading}
              />
            </div>
          </div>

          {/* Section 3: Contract Type */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Contract Type</h2>
            <div className="space-y-2">
              <Radio
                name="contract_type"
                value="FLAT_MONTHLY"
                checked={formData.contract_type === 'FLAT_MONTHLY'}
                onChange={() => handleInputChange('contract_type', 'FLAT_MONTHLY')}
                label="Flat Monthly Fee"
                description="Single monthly fee for all properties"
              />
              <Radio
                name="contract_type"
                value="PER_PROPERTY"
                checked={formData.contract_type === 'PER_PROPERTY'}
                onChange={() => handleInputChange('contract_type', 'PER_PROPERTY')}
                label="Per Property Pricing"
                description="Individual fees per property (configure after creation)"
              />
            </div>
          </div>

          {/* Section 4: Dates */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Contract Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  label="Start Date *"
                  value={formData.contract_start_date}
                  onChange={(e) => handleInputChange('contract_start_date', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Input
                  type="date"
                  label="End Date (Optional)"
                  value={formData.contract_end_date}
                  onChange={(e) => handleInputChange('contract_end_date', e.target.value)}
                  min={formData.contract_start_date}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Pricing */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Pricing & Billing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  label={formData.contract_type === 'FLAT_MONTHLY' ? 'Monthly Fee *' : 'Base Monthly Fee *'}
                  value={formData.monthly_fee}
                  onChange={(e) => handleInputChange('monthly_fee', e.target.value)}
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
                {formData.contract_type === 'PER_PROPERTY' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Individual property fees can be set after adding properties
                  </p>
                )}
                {errors.monthly_fee && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthly_fee}</p>
                )}
              </div>

              <div>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  label="Billing Day *"
                  value={formData.billing_day}
                  onChange={(e) => handleInputChange('billing_day', e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Day of month (1-31)</p>
                {errors.billing_day && (
                  <p className="mt-1 text-sm text-red-600">{errors.billing_day}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Notes */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Add any additional details about this contract..."
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner size="sm" />}
              {loading ? 'Creating Contract...' : 'Create Contract'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
