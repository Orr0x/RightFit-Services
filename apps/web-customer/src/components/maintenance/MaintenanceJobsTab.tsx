import { useState, useEffect } from 'react'
import { Card, Spinner, EmptyState } from '@rightfit/ui-core'
import { useToast } from '../ui'
import { useLoading } from '../../hooks/useLoading'
import { MapPin, User, DollarSign } from 'lucide-react'

interface MaintenanceJob {
  id: string
  property_id: string
  title: string
  description?: string
  category: string
  priority: string
  source: string
  status: string
  estimated_total?: number
  created_at: string
  scheduled_date?: string
  property?: {
    property_name: string
    address: string
  }
  assigned_worker?: {
    first_name: string
    last_name: string
  }
  assigned_contractor?: {
    company_name: string
    contact_name: string
  }
  quote?: {
    id: string
    total_amount: number
    status: string
  }
}

interface MaintenanceJobsTabProps {
  refreshKey: number
  onRefresh: () => void
}

export default function MaintenanceJobsTab({ refreshKey, onRefresh }: MaintenanceJobsTabProps) {
  const [jobs, setJobs] = useState<MaintenanceJob[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => {
    loadJobs()
  }, [refreshKey])

  const loadJobs = () => {
    withLoading(async () => {
      try {
        const customerData = localStorage.getItem('customer')
        if (!customerData) return

        const customer = JSON.parse(customerData)
        const response = await fetch(`/api/customer-portal/maintenance-jobs?customer_id=${customer.id}`)

        if (!response.ok) throw new Error('Failed to load maintenance jobs')

        const data = await response.json()
        setJobs(data.data)
      } catch (err: any) {
        toast.error('Failed to load maintenance jobs')
        console.error(err)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUOTE_PENDING': return 'bg-amber-100 text-amber-800'
      case 'QUOTE_SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'QUOTE_APPROVED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-purple-100 text-purple-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'CUSTOMER_REQUEST': return 'Customer Request'
      case 'CLEANER_REPORT': return 'Worker Report'
      case 'GUEST_REPORT': return 'Guest Report'
      case 'PREVENTIVE_MAINTENANCE': return 'Preventive'
      case 'EMERGENCY': return 'Emergency'
      default: return source
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600'
      case 'HIGH': return 'text-orange-600'
      case 'MEDIUM': return 'text-blue-600'
      case 'LOW': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No maintenance jobs"
        description="Maintenance jobs from all sources will appear here"
      />
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {job.property?.property_name} • {job.property?.address}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(job.status)}`}>
                {job.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="text-sm font-medium text-gray-900">{job.category.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Priority</p>
              <p className={`text-sm font-medium ${getPriorityColor(job.priority)}`}>
                {job.priority}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Source</p>
              <p className="text-sm font-medium text-gray-900">{getSourceLabel(job.source)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {job.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">{job.description}</p>
            </div>
          )}

          {job.assigned_worker && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>
                Assigned to: {job.assigned_worker.first_name} {job.assigned_worker.last_name}
              </span>
            </div>
          )}

          {job.assigned_contractor && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>
                Contractor: {job.assigned_contractor.company_name}
                {job.assigned_contractor.contact_name && ` (${job.assigned_contractor.contact_name})`}
              </span>
            </div>
          )}

          {job.quote && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>
                Quote: ${Number(job.quote.total).toFixed(2)} ({job.quote.status})
              </span>
            </div>
          )}

          {job.scheduled_date && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
