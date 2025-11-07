import { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useRequiredServiceProvider } from '../../hooks/useServiceProvider'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { useToast } from '../ui/Toast'
import { Spinner } from '../ui/Spinner'
import { Card } from '../ui/Card'

interface CreateJobFromCalendarModalProps {
  calendarEntry: {
    id: string
    property_id: string
    guest_checkout_datetime: string
    next_guest_checkin_datetime: string
    property: {
      id: string
      property_name: string
      address: string
      customer: {
        id: string
        business_name: string
      }
    }
  }
  onClose: () => void
  onSuccess: () => void
}

interface Worker {
  id: string
  first_name: string
  last_name: string
  worker_type: string
}

interface Service {
  id: string
  name: string
  default_rate: number
}

interface Contract {
  id: string
  contract_type: string
  monthly_fee: number
}

export function CreateJobFromCalendarModal({
  calendarEntry,
  onClose,
  onSuccess,
}: CreateJobFromCalendarModalProps) {
  const SERVICE_PROVIDER_ID = useRequiredServiceProvider()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [contract, setContract] = useState<Contract | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const toast = useToast()

  // Calculate default schedule based on calendar entry
  const checkoutDate = new Date(calendarEntry.guest_checkout_datetime)
  const checkinDate = new Date(calendarEntry.next_guest_checkin_datetime)

  // Default to scheduling clean right after checkout
  const defaultDate = checkoutDate.toISOString().split('T')[0]
  const defaultStartTime = checkoutDate.toTimeString().slice(0, 5)

  // Calculate suggested end time (2-4 hours after start, before checkin)
  const suggestedDuration = 3 // hours
  const suggestedEndDate = new Date(checkoutDate.getTime() + suggestedDuration * 60 * 60 * 1000)
  const defaultEndTime = suggestedEndDate.toTimeString().slice(0, 5)

  const [formData, setFormData] = useState({
    service_id: '',
    assigned_worker_id: '',
    scheduled_date: defaultDate,
    scheduled_start_time: defaultStartTime,
    scheduled_end_time: defaultEndTime,
    pricing_type: 'CONTRACT',
    quoted_price: '0',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoadingData(true)

      // Fetch workers and contract in parallel
      const [workersRes, contractsRes] = await Promise.all([
        api.get('/api/workers', { params: { service_provider_id: SERVICE_PROVIDER_ID } }),
        api.get('/api/cleaning-contracts', {
          params: { customer_id: calendarEntry.property.customer.id, status: 'ACTIVE' },
        }),
      ])

      const workersData = workersRes.data.data || []
      const cleaningWorkers = workersData.filter(
        (w: Worker) => w.worker_type === 'CLEANER' || w.worker_type === 'BOTH'
      )
      setWorkers(cleaningWorkers)

      // Note: Services endpoint not implemented yet, using empty array
      setServices([])

      // Find contract for this property
      const contractsData = contractsRes.data.data || []
      const propertyContract = contractsData.find((c: any) =>
        c.property_contracts?.some((pc: any) => pc.property_id === calendarEntry.property_id && pc.is_active)
      )

      if (propertyContract) {
        setContract(propertyContract)
        setFormData((prev) => ({
          ...prev,
          pricing_type: 'CONTRACT',
          quoted_price: '0', // Included in contract
        }))
      } else {
        // No contract, need to quote price
        setFormData((prev) => ({
          ...prev,
          pricing_type: 'ONE_OFF',
          quoted_price: '50.00', // Default cleaning price
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load required data', 'Error')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.assigned_worker_id) {
      toast.error('Please assign a worker', 'Validation Error')
      return
    }

    try {
      setLoading(true)

      // Create cleaning job
      const jobPayload = {
        service_provider_id: SERVICE_PROVIDER_ID,
        service_id: formData.service_id || undefined, // Optional since services not implemented yet
        property_id: calendarEntry.property_id,
        customer_id: calendarEntry.property.customer.id,
        contract_id: contract?.id || undefined,
        assigned_worker_id: formData.assigned_worker_id,
        scheduled_date: formData.scheduled_date,
        scheduled_start_time: formData.scheduled_start_time,
        scheduled_end_time: formData.scheduled_end_time,
        pricing_type: formData.pricing_type,
        quoted_price: parseFloat(formData.quoted_price),
      }

      const jobResponse = await api.post('/api/cleaning-jobs', jobPayload)
      const jobId = jobResponse.data.data.id

      // Link job to calendar entry
      await api.put(`/api/property-calendars/${calendarEntry.id}/link-job`, {
        cleaning_job_id: jobId,
      })

      onSuccess()
    } catch (error: any) {
      console.error('Error creating job:', error)
      toast.error(error.response?.data?.error || 'Failed to create cleaning job', 'Error')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Schedule Cleaning Job
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {calendarEntry.property.property_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="large" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Calendar Info Card */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Guest Checkout</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    {formatDateTime(calendarEntry.guest_checkout_datetime)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Next Guest Check-in</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    {formatDateTime(calendarEntry.next_guest_checkin_datetime)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Contract Info */}
            {contract && (
              <Card className="p-4 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ This property is on an active cleaning contract
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {contract.contract_type === 'FLAT_MONTHLY'
                    ? 'Flat monthly fee contract'
                    : 'Per-property pricing contract'}
                  {' - '}No additional charge for this clean
                </p>
              </Card>
            )}

            {/* Service - Hidden until services endpoint is implemented */}
            {services.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service *
                </label>
                <Select
                  placeholder="Select service..."
                  options={services.map((service) => ({
                    value: service.id,
                    label: `${service.name} - £${service.default_rate}`,
                  }))}
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  required
                />
              </div>
            )}

            {/* Worker Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign Worker *
              </label>
              <Select
                placeholder="Select worker..."
                options={workers.map((worker) => ({
                  value: worker.id,
                  label: `${worker.first_name} ${worker.last_name}`,
                }))}
                value={formData.assigned_worker_id}
                onChange={(e) => setFormData({ ...formData, assigned_worker_id: e.target.value })}
                required
              />
              {workers.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                  No workers available. Please add workers first.
                </p>
              )}
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scheduled Date & Time *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  min={checkoutDate.toISOString().split('T')[0]}
                  max={checkinDate.toISOString().split('T')[0]}
                  required
                />
                <Input
                  type="time"
                  value={formData.scheduled_start_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_start_time: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  value={formData.scheduled_end_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_end_time: e.target.value })}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be between checkout and next check-in
              </p>
            </div>

            {/* Pricing (only if no contract) */}
            {!contract && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quoted_price}
                  onChange={(e) => setFormData({ ...formData, quoted_price: e.target.value })}
                  placeholder="0.00"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  One-off job price (no active contract for this property)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || workers.length === 0}>
                {loading ? <Spinner size="small" /> : 'Schedule Job'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
