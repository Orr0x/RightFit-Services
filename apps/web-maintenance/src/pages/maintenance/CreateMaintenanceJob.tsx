import { useState } from 'react'
import { Button, Input, Card, Textarea, useToast } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { maintenanceJobsAPI, type CreateMaintenanceJobData } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES, MAINTENANCE_SOURCES } from '@rightfit/shared'

const SERVICE_PROVIDER_ID = 'demo-provider-id'

export default function CreateMaintenanceJob() {
  const [formData, setFormData] = useState<CreateMaintenanceJobData>({
    service_id: '',
    property_id: '',
    customer_id: '',
    source: 'CUSTOMER_REQUEST',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    title: '',
    description: '',
    service_provider_id: SERVICE_PROVIDER_ID,
  })

  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    withLoading(async () => {
      try {
        const job = await maintenanceJobsAPI.create(formData)
        toast.success('Maintenance job created successfully')
        navigate(`/maintenance/jobs/${job.id}`)
      } catch (err: any) {
        toast.error('Failed to create maintenance job')
        console.error('Create error:', err)
      }
    })
  }

  const handleChange = (field: keyof CreateMaintenanceJobData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" onClick={() => navigate('/maintenance/jobs')}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Create Maintenance Job</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service ID *</label>
              <Input
                type="text"
                required
                value={formData.service_id}
                onChange={(e) => handleChange('service_id', e.target.value)}
                placeholder="Maintenance service ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Customer ID *</label>
              <Input
                type="text"
                required
                value={formData.customer_id}
                onChange={(e) => handleChange('customer_id', e.target.value)}
                placeholder="Customer ID"
              />
            </div>
          </div>

          {/* Property */}
          <div>
            <label className="block text-sm font-medium mb-1">Property ID *</label>
            <Input
              type="text"
              required
              value={formData.property_id}
              onChange={(e) => handleChange('property_id', e.target.value)}
              placeholder="Property ID"
            />
          </div>

          {/* Job Details */}
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <Input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Fix broken shower head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the maintenance issue..."
            />
          </div>

          {/* Category, Priority, Source */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
              >
                {MAINTENANCE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority *</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as any)}
                required
              >
                {MAINTENANCE_PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Source *</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value as any)}
                required
              >
                {MAINTENANCE_SOURCES.map(source => (
                  <option key={source} value={source}>
                    {source.replace(/_/g, ' ').split(' ').map(word =>
                      word.charAt(0) + word.slice(1).toLowerCase()
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assign to Worker (Optional)</label>
              <Input
                type="text"
                value={formData.assigned_worker_id || ''}
                onChange={(e) => handleChange('assigned_worker_id', e.target.value)}
                placeholder="Worker ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assign to Contractor (Optional)</label>
              <Input
                type="text"
                value={formData.assigned_contractor_id || ''}
                onChange={(e) => handleChange('assigned_contractor_id', e.target.value)}
                placeholder="Contractor ID"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Requested Date</label>
              <Input
                type="date"
                value={formData.requested_date || ''}
                onChange={(e) => handleChange('requested_date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Scheduled Date</label>
              <Input
                type="date"
                value={formData.scheduled_date || ''}
                onChange={(e) => handleChange('scheduled_date', e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Job'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/maintenance/jobs')}
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
