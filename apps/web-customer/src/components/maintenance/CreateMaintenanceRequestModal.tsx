import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button, useToast } from '../ui'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES } from '@rightfit/shared'

interface Property {
  id: string
  property_name: string
  address: string
}

interface CreateMaintenanceRequestModalProps {
  onClose: () => void
  onSuccess: () => void
}

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', description: 'Can be addressed in regular schedule' },
  { value: 'MEDIUM', label: 'Medium', description: 'Should be addressed soon' },
  { value: 'HIGH', label: 'High', description: 'Needs prompt attention' },
  { value: 'URGENT', label: 'Urgent', description: 'Requires immediate action' },
]

export default function CreateMaintenanceRequestModal({ onClose, onSuccess }: CreateMaintenanceRequestModalProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const [formData, setFormData] = useState({
    property_id: '',
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    requested_date: '',
  })

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        setError('Please log in')
        return
      }

      const customer = JSON.parse(customerData)

      const response = await fetch(`/api/customer-portal/dashboard?customer_id=${customer.id}`)
      if (!response.ok) throw new Error('Failed to load properties')

      const data = await response.json()
      setProperties(data.data.properties || [])
    } catch (err) {
      setError('Failed to load properties')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.property_id) {
      setError('Please select a property')
      return
    }

    if (!formData.title.trim()) {
      setError('Please provide a title')
      return
    }

    if (!formData.description.trim()) {
      setError('Please provide a description')
      return
    }

    try {
      setSubmitting(true)
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        setError('Please log in')
        return
      }

      const customer = JSON.parse(customerData)

      const response = await fetch(`/api/customer-portal/maintenance-requests?customer_id=${customer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: formData.property_id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          requested_date: formData.requested_date || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create maintenance request')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Maintenance Request</h2>
            <p className="text-sm text-gray-600">Submit a maintenance request for your property</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Property Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property *
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading properties...</div>
            ) : (
              <select
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
                required
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.property_name} - {property.address}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Leaking faucet in kitchen"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            >
              {MAINTENANCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.priority === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="mt-1"
                    disabled={submitting}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the maintenance issue in detail..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
              required
            />
          </div>

          {/* Requested Date (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date (Optional)
            </label>
            <input
              type="date"
              value={formData.requested_date}
              onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              When would you like this addressed? (Optional)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={submitting}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || loading}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                'Create Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
