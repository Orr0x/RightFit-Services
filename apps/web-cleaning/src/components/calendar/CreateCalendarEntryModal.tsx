import { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@rightfit/ui-core'
import { Input } from '@rightfit/ui-core'
import { Select } from '@rightfit/ui-core'
import { Textarea } from '@rightfit/ui-core'
import { useToast } from '../ui'
import { Spinner } from '@rightfit/ui-core'

interface CreateCalendarEntryModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface Property {
  id: string
  property_name: string
  address: string
  customer: {
    business_name: string
  }
}

export function CreateCalendarEntryModal({ onClose, onSuccess }: CreateCalendarEntryModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const toast = useToast()

  const [formData, setFormData] = useState({
    property_id: '',
    guest_checkout_date: '',
    guest_checkout_time: '11:00',
    next_guest_checkin_date: '',
    next_guest_checkin_time: '15:00',
    notes: '',
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true)
      const response = await api.get('/api/customer-properties')
      setProperties(response.data.data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties', 'Error')
    } finally {
      setLoadingProperties(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.property_id) {
      toast.error('Please select a property', 'Validation Error')
      return
    }

    if (!formData.guest_checkout_date || !formData.next_guest_checkin_date) {
      toast.error('Please enter both checkout and check-in dates', 'Validation Error')
      return
    }

    // Combine date and time
    const checkoutDateTime = new Date(`${formData.guest_checkout_date}T${formData.guest_checkout_time}:00`)
    const checkinDateTime = new Date(`${formData.next_guest_checkin_date}T${formData.next_guest_checkin_time}:00`)

    if (checkinDateTime <= checkoutDateTime) {
      toast.error('Check-in must be after checkout', 'Validation Error')
      return
    }

    try {
      setLoading(true)

      const payload = {
        property_id: formData.property_id,
        guest_checkout_datetime: checkoutDateTime.toISOString(),
        next_guest_checkin_datetime: checkinDateTime.toISOString(),
        notes: formData.notes || undefined,
      }

      await api.post('/api/property-calendars', payload)

      toast.success('Calendar entry created successfully', 'Success')
      onSuccess()
    } catch (error: any) {
      console.error('Error creating calendar entry:', error)
      toast.error(error.response?.data?.error || 'Failed to create calendar entry', 'Error')
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
            Add Calendar Entry
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
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property *
            </label>
            {loadingProperties ? (
              <div className="flex items-center justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <Select
                placeholder="Select a property..."
                options={properties.map((property) => ({
                  value: property.id,
                  label: `${property.property_name} - ${property.address}`,
                }))}
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                required
              />
            )}
          </div>

          {/* Guest Checkout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Guest Checkout *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={formData.guest_checkout_date}
                onChange={(e) => setFormData({ ...formData, guest_checkout_date: e.target.value })}
                required
              />
              <Input
                type="time"
                value={formData.guest_checkout_time}
                onChange={(e) => setFormData({ ...formData, guest_checkout_time: e.target.value })}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              When the current guest checks out
            </p>
          </div>

          {/* Next Guest Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Next Guest Check-in *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={formData.next_guest_checkin_date}
                onChange={(e) => setFormData({ ...formData, next_guest_checkin_date: e.target.value })}
                min={formData.guest_checkout_date}
                required
              />
              <Input
                type="time"
                value={formData.next_guest_checkin_time}
                onChange={(e) => setFormData({ ...formData, next_guest_checkin_time: e.target.value })}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              When the next guest checks in
            </p>
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
              placeholder="Special instructions, deep clean needed, etc..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="small" /> : 'Create Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
