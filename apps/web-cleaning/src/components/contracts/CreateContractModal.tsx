import { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { useToast } from '../ui/Toast'
import { Spinner } from '../ui/Spinner'
import { Radio } from '../ui/Radio'

interface CreateContractModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface Customer {
  id: string
  business_name: string
  contact_name: string
  email: string
}

export function CreateContractModal({ onClose, onSuccess }: CreateContractModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const toast = useToast()

  const [formData, setFormData] = useState({
    customer_id: '',
    contract_type: 'FLAT_MONTHLY' as 'FLAT_MONTHLY' | 'PER_PROPERTY',
    contract_start_date: new Date().toISOString().split('T')[0],
    contract_end_date: '',
    monthly_fee: '',
    billing_day: '1',
    notes: '',
  })

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
      toast.error('Failed to load customers', 'Error')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_id) {
      toast.error('Please select a customer', 'Validation Error')
      return
    }

    if (!formData.monthly_fee || Number(formData.monthly_fee) <= 0) {
      toast.error('Please enter a valid monthly fee', 'Validation Error')
      return
    }

    const billingDay = Number(formData.billing_day)
    if (billingDay < 1 || billingDay > 31) {
      toast.error('Billing day must be between 1 and 31', 'Validation Error')
      return
    }

    if (!user) {
      toast.error('User not authenticated', 'Error')
      return
    }

    try {
      setLoading(true)

      const payload = {
        customer_id: formData.customer_id,
        service_provider_id: user.tenant_id,
        contract_type: formData.contract_type,
        contract_start_date: formData.contract_start_date,
        contract_end_date: formData.contract_end_date || undefined,
        monthly_fee: Number(formData.monthly_fee),
        billing_day: billingDay,
        notes: formData.notes || undefined,
      }

      await api.post('/api/cleaning-contracts', payload)

      toast.success('Contract created successfully', 'Success')

      onSuccess()
    } catch (error: any) {
      console.error('Error creating contract:', error)
      toast.error(error.response?.data?.error || 'Failed to create contract', 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Cleaning Contract
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Selection */}
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
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              />
            )}
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contract Type *
            </label>
            <div className="space-y-2">
              <Radio
                name="contract_type"
                value="FLAT_MONTHLY"
                checked={formData.contract_type === 'FLAT_MONTHLY'}
                onChange={() => setFormData({ ...formData, contract_type: 'FLAT_MONTHLY' })}
                label="Flat Monthly Fee"
                description="Single monthly fee for all properties"
              />
              <Radio
                name="contract_type"
                value="PER_PROPERTY"
                checked={formData.contract_type === 'PER_PROPERTY'}
                onChange={() => setFormData({ ...formData, contract_type: 'PER_PROPERTY' })}
                label="Per Property Pricing"
                description="Individual fees per property (configure after creation)"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.contract_start_date}
                onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.contract_end_date}
                onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                min={formData.contract_start_date}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.contract_type === 'FLAT_MONTHLY' ? 'Monthly Fee' : 'Base Monthly Fee'} *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthly_fee}
                onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                placeholder="0.00"
                required
              />
              {formData.contract_type === 'PER_PROPERTY' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Individual property fees can be set after adding properties
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Billing Day *
              </label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.billing_day}
                onChange={(e) => setFormData({ ...formData, billing_day: e.target.value })}
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Day of month (1-31)</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional contract details..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="small" /> : 'Create Contract'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
