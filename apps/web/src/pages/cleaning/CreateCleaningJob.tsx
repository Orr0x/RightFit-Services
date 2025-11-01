import { useState } from 'react'
import { Button, Input, Card, Textarea, useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { cleaningJobsAPI, type CreateCleaningJobData } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const SERVICE_PROVIDER_ID = 'demo-provider-id'

export default function CreateCleaningJob() {
  const [formData, setFormData] = useState<CreateCleaningJobData>({
    service_id: '',
    property_id: '',
    customer_id: '',
    assigned_worker_id: '',
    scheduled_date: '',
    scheduled_start_time: '11:00',
    scheduled_end_time: '14:00',
    pricing_type: 'PER_TURNOVER',
    quoted_price: 45,
    service_provider_id: SERVICE_PROVIDER_ID,
  })

  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    withLoading(async () => {
      try {
        const job = await cleaningJobsAPI.create(formData)
        toast.success('Cleaning job scheduled successfully')
        navigate(`/cleaning/jobs/${job.id}`)
      } catch (err: any) {
        toast.error('Failed to create cleaning job')
        console.error('Create error:', err)
      }
    })
  }

  const handleChange = (field: keyof CreateCleaningJobData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/cleaning/jobs')}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Schedule Cleaning Job</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service & Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service ID *</label>
              <Input
                type="text"
                required
                value={formData.service_id}
                onChange={(e) => handleChange('service_id', e.target.value)}
                placeholder="Enter service ID"
              />
              <p className="text-xs text-gray-500 mt-1">From seed data or create service first</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Customer ID *</label>
              <Input
                type="text"
                required
                value={formData.customer_id}
                onChange={(e) => handleChange('customer_id', e.target.value)}
                placeholder="Enter customer ID"
              />
            </div>
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Property ID *</label>
            <Input
              type="text"
              required
              value={formData.property_id}
              onChange={(e) => handleChange('property_id', e.target.value)}
              placeholder="Enter property ID (from customer properties)"
            />
          </div>

          {/* Worker Assignment */}
          <div>
            <label className="block text-sm font-medium mb-1">Assigned Worker (Optional)</label>
            <Input
              type="text"
              value={formData.assigned_worker_id}
              onChange={(e) => handleChange('assigned_worker_id', e.target.value)}
              placeholder="Enter worker ID or leave blank"
            />
            <p className="text-xs text-gray-500 mt-1">Can assign later</p>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <Input
                type="date"
                required
                value={formData.scheduled_date}
                onChange={(e) => handleChange('scheduled_date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Time *</label>
              <Input
                type="time"
                required
                value={formData.scheduled_start_time}
                onChange={(e) => handleChange('scheduled_start_time', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time *</label>
              <Input
                type="time"
                required
                value={formData.scheduled_end_time}
                onChange={(e) => handleChange('scheduled_end_time', e.target.value)}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pricing Type *</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.pricing_type}
                onChange={(e) => handleChange('pricing_type', e.target.value)}
                required
              >
                <option value="PER_TURNOVER">Per Turnover</option>
                <option value="HOURLY">Hourly Rate</option>
                <option value="FIXED">Fixed Price</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quoted Price (£) *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.quoted_price}
                onChange={(e) => handleChange('quoted_price', parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Checklist (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Checklist Template ID</label>
              <Input
                type="text"
                value={formData.checklist_template_id || ''}
                onChange={(e) => handleChange('checklist_template_id', e.target.value)}
                placeholder="Optional checklist template"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Checklist Items</label>
              <Input
                type="number"
                min="0"
                value={formData.checklist_total_items || 0}
                onChange={(e) => handleChange('checklist_total_items', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-sm mb-2">Quick Setup Guide</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>1. Get service_id from seed data (check database or API)</li>
              <li>2. Get customer_id from customers table</li>
              <li>3. Get property_id from customer_properties for that customer</li>
              <li>4. Optional: Get worker_id from workers table to assign immediately</li>
              <li>5. Set date and time for the cleaning</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Scheduling...' : 'Schedule Job'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/cleaning/jobs')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Demo Data Helper */}
      <Card className="p-4 mt-4 bg-gray-50">
        <h3 className="font-semibold text-sm mb-2">Using Seed Data?</h3>
        <p className="text-sm text-gray-600">
          If you ran the database seed, you can use the IDs from there. Check the seed output
          or query the database directly to find service_id, customer_id, property_id, and worker_id.
        </p>
      </Card>
    </div>
  )
}
