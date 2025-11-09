import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Clock, User, Home, Bed, Bath,
  Key, Wifi, Car, PawPrint, AlertCircle,
  Play, CheckCircle, Wrench, ChevronDown, ChevronUp
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import JobChecklist, { ChecklistItem } from '../../components/jobs/JobChecklist'
import StartJobModal from '../../components/jobs/StartJobModal'
import CompleteJobModal from '../../components/jobs/CompleteJobModal'
import CreateMaintenanceIssueModal from '../../components/jobs/CreateMaintenanceIssueModal'
import IssueDetailsModal from '../../components/jobs/IssueDetailsModal'
import JobNotesSection from '../../components/jobs/JobNotesSection'

interface PropertyDetails {
  id: string
  name: string
  address: string
  postcode: string | null
  property_type: string
  bedrooms: number | null
  bathrooms: number | null
  access_instructions: string | null
  access_code: string | null
  wifi_network: string | null
  wifi_password: string | null
  parking_instructions: string | null
  pets: string | null
  photo_urls: any | null
  utility_locations: any | null
  emergency_contacts: any | null
  cleaner_notes: string | null
  special_requirements: string | null
  latitude?: number | null
  longitude?: number | null
}

interface JobDetails {
  id: string
  property_id: string
  customer_id: string
  property: PropertyDetails
  scheduled_date: string
  scheduled_start_time: string | null
  scheduled_end_time: string | null
  status: string
  special_requirements: string | null
  quoted_price: number | null
  pricing_type: string | null
  worker_notes?: string | null
  job_note_photos?: string[]
  customer?: {
    contact_name: string | null
    organization_name: string | null
    email: string | null
    phone: string | null
  } | null
  assigned_worker?: {
    first_name: string
    last_name: string
    email: string
    phone: string
  } | null
  checklist: ChecklistItem[]
}

interface WorkerReportedIssue {
  id: string
  title: string
  issue_description: string
  category: string
  priority: string
  status: string
  reported_at: string
  customer_approved_at?: string | null
  customer_rejected_at?: string | null
  rejection_reason?: string | null
  photos?: string[]
  created_maintenance_job?: {
    id: string
    title: string
    status: string
  } | null
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { worker } = useAuth()
  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStartModal, setShowStartModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showMaintenanceIssueModal, setShowMaintenanceIssueModal] = useState(false)
  const [scheduleExpanded, setScheduleExpanded] = useState(false)
  const [propertyExpanded, setPropertyExpanded] = useState(false)
  const [accessExpanded, setAccessExpanded] = useState(false)
  const [customerExpanded, setCustomerExpanded] = useState(false)
  const [issuesExpanded, setIssuesExpanded] = useState(false)
  const [checklistExpanded, setChecklistExpanded] = useState(false)
  const [reportedIssues, setReportedIssues] = useState<WorkerReportedIssue[]>([])
  const [loadingReportedIssues, setLoadingReportedIssues] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<WorkerReportedIssue | null>(null)

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!worker) return

      try {
        setLoading(true)
        const token = localStorage.getItem('worker_token')
        const response = await fetch(
          `/api/cleaning-jobs/${id}?service_provider_id=${worker.service_provider_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch job details')
        }

        const data = await response.json()
        setJob(data.data)

        // Fetch worker-reported issues for this property
        if (data.data?.property_id && token) {
          fetchReportedIssues(data.data.property_id, token)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [id, worker])

  const fetchReportedIssues = async (propertyId: string, token: string) => {
    try {
      setLoadingReportedIssues(true)
      const response = await fetch(
        `/api/worker-issues?property_id=${propertyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setReportedIssues(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching worker-reported issues:', err)
    } finally {
      setLoadingReportedIssues(false)
    }
  }


  const refetchJob = async () => {
    if (!worker) return

    try {
      const token = localStorage.getItem('worker_token')
      const response = await fetch(
        `/api/cleaning-jobs/${id}?service_provider_id=${worker.service_provider_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setJob(data.data)

        // Also refresh worker-reported issues
        if (data.data?.property_id && token) {
          fetchReportedIssues(data.data.property_id, token)
        }
      }
    } catch (err) {
      console.error('Error refetching job:', err)
    }
  }

  const handleStartJob = () => {
    setShowStartModal(true)
  }

  const handleStartJobSuccess = () => {
    setShowStartModal(false)
    refetchJob()
  }

  const handleCompleteJob = () => {
    setShowCompleteModal(true)
  }

  const handleCompleteJobSuccess = () => {
    setShowCompleteModal(false)
    refetchJob()
  }

  const handleReportMaintenanceIssue = () => {
    setShowMaintenanceIssueModal(true)
  }

  const handleMaintenanceIssueSuccess = () => {
    setShowMaintenanceIssueModal(false)
    refetchJob() // Refresh job data to show updated maintenance_issues_found count
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getIssueStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300'
      case 'CUSTOMER_REVIEWING': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SUBMITTED': return 'bg-amber-100 text-amber-800 border-amber-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const canStartJob = job.status === 'SCHEDULED'
  const canCompleteJob = job.status === 'IN_PROGRESS'

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.property.name}</h1>
            <p className="text-gray-600 mt-1">{formatDate(job.scheduled_date)}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Special Requirements Alert */}
      {job.special_requirements && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Special Requirements</h3>
              <p className="text-amber-800">{job.special_requirements}</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <button
          onClick={() => setScheduleExpanded(!scheduleExpanded)}
          className="w-full flex items-center justify-between gap-2 mb-3"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-900" />
            <h2 className="font-semibold text-gray-900">Schedule</h2>
          </div>
          {scheduleExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {scheduleExpanded && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">{formatDate(job.scheduled_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium text-gray-900">
                {job.scheduled_start_time && job.scheduled_end_time
                  ? `${job.scheduled_start_time} - ${job.scheduled_end_time}`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned to:</span>
              <span className="font-medium text-gray-900">
                {job.assigned_worker ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}` : 'Not assigned'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Property Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <button
          onClick={() => setPropertyExpanded(!propertyExpanded)}
          className="w-full flex items-center justify-between gap-2 mb-3"
        >
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-gray-900" />
            <h2 className="font-semibold text-gray-900">Property Information</h2>
          </div>
          {propertyExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {propertyExpanded && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-gray-700">{job.property.address}</span>
                {job.property.postcode && (
                  <span className="text-gray-600 text-sm ml-2">{job.property.postcode}</span>
                )}
              </div>
            </div>

            {/* Navigation Button */}
            {job.property.latitude && job.property.longitude && (
              <button
                onClick={() => navigate(`/navigation/${job.property_id}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Navigation2 className="w-5 h-5" />
                Navigate Here
              </button>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 capitalize">{job.property.property_type}</span>
              </div>
              {job.property.bedrooms !== null && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{job.property.bedrooms} Bed</span>
                </div>
              )}
              {job.property.bathrooms !== null && (
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{job.property.bathrooms} Bath</span>
                </div>
              )}
            </div>

            {job.property.cleaner_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h3 className="font-semibold text-blue-900 text-sm mb-1">Cleaner Notes</h3>
                <p className="text-blue-800 text-sm whitespace-pre-wrap">{job.property.cleaner_notes}</p>
              </div>
            )}

            {job.property.special_requirements && (
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <h3 className="font-semibold text-purple-900 text-sm mb-1">Special Requirements</h3>
                <p className="text-purple-800 text-sm whitespace-pre-wrap">{job.property.special_requirements}</p>
              </div>
            )}

            {job.property.utility_locations && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Utility Locations</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  {Object.entries(job.property.utility_locations).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.property.emergency_contacts && Array.isArray(job.property.emergency_contacts) && job.property.emergency_contacts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h3 className="font-semibold text-red-900 text-sm mb-2">Emergency Contacts</h3>
                <div className="space-y-2">
                  {job.property.emergency_contacts.map((contact: any, index: number) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-red-900">{contact.name} {contact.relation && `(${contact.relation})`}</p>
                      <a href={`tel:${contact.phone}`} className="text-red-700 hover:text-red-800">{contact.phone}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.property.photo_urls && Array.isArray(job.property.photo_urls) && job.property.photo_urls.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Property Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {job.property.photo_urls.map((photo: any, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      {photo.caption && (
                        <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Access Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <button
          onClick={() => setAccessExpanded(!accessExpanded)}
          className="w-full flex items-center justify-between gap-2 mb-3"
        >
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-900" />
            <h2 className="font-semibold text-gray-900">Access Information</h2>
          </div>
          {accessExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {accessExpanded && (
          <div className="space-y-3 text-sm">
          {job.property.access_instructions && (
            <div>
              <span className="text-gray-600 font-medium">Instructions:</span>
              <p className="text-gray-700 mt-1">{job.property.access_instructions}</p>
            </div>
          )}
          {job.property.access_code && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <span className="text-gray-600 font-medium">Access Code:</span>
              <p className="text-lg font-mono font-bold text-gray-900 mt-1">{job.property.access_code}</p>
            </div>
          )}
          {job.property.wifi_network && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 font-medium">WiFi</span>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-gray-500">Network:</span>
                  <p className="font-medium text-gray-900">{job.property.wifi_network}</p>
                </div>
                {job.property.wifi_password && (
                  <div>
                    <span className="text-xs text-gray-500">Password:</span>
                    <p className="font-mono text-gray-900">{job.property.wifi_password}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {job.property.parking_instructions && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Parking:</span>
              </div>
              <p className="text-gray-700">{job.property.parking_instructions}</p>
            </div>
          )}
          {job.property.pets && (
            <div className="bg-amber-50 p-3 rounded border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <PawPrint className="w-4 h-4 text-amber-600" />
                <span className="text-amber-900 font-medium">Pets:</span>
              </div>
              <p className="text-amber-800">{job.property.pets}</p>
            </div>
          )}
          {!job.property.access_instructions &&
           !job.property.access_code &&
           !job.property.wifi_network &&
           !job.property.parking_instructions &&
           !job.property.pets && (
            <p className="text-gray-500 italic">No access information provided</p>
          )}
          </div>
        )}
      </div>

      {/* Customer Information */}
      {job.customer && (job.customer.contact_name || job.customer.organization_name || job.customer.phone || job.customer.email) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <button
            onClick={() => setCustomerExpanded(!customerExpanded)}
            className="w-full flex items-center justify-between gap-2 mb-3"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-900" />
              <h2 className="font-semibold text-gray-900">Customer Information</h2>
            </div>
            {customerExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {customerExpanded && (
            <div className="space-y-2 text-sm">
            {(job.customer.organization_name || job.customer.contact_name) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">
                  {job.customer.organization_name || job.customer.contact_name}
                </span>
              </div>
            )}
            {job.customer.phone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <a
                  href={`tel:${job.customer.phone}`}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  {job.customer.phone}
                </a>
              </div>
            )}
            {job.customer.email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <a
                  href={`mailto:${job.customer.email}`}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  {job.customer.email}
                </a>
              </div>
            )}
            </div>
          )}
        </div>
      )}

      {/* Property Maintenance Issues */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <button
          onClick={() => setIssuesExpanded(!issuesExpanded)}
          className="w-full flex items-center justify-between gap-2 mb-3"
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-gray-900" />
            <h2 className="font-semibold text-gray-900">Property Maintenance Issues</h2>
            {reportedIssues.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {reportedIssues.length}
              </span>
            )}
          </div>
          {issuesExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {issuesExpanded && (
          <>
            {loadingReportedIssues ? (
              <div className="flex items-center justify-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="ml-2 text-gray-600">Loading reported issues...</p>
              </div>
            ) : reportedIssues.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No maintenance issues reported for this property</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{issue.title}</h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getIssueStatusColor(issue.status)}`}>
                          {issue.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">{issue.issue_description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{issue.category.replace(/_/g, ' ')}</span>
                      <span>
                        Reported: {new Date(issue.reported_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {issue.status === 'APPROVED' && issue.customer_approved_at && (
                      <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        Approved: {new Date(issue.customer_approved_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    {issue.status === 'REJECTED' && issue.rejection_reason && (
                      <div className="mt-2 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                        Rejected: {issue.rejection_reason}
                      </div>
                    )}
                    {issue.created_maintenance_job && (
                      <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        Maintenance Job Created: {issue.created_maintenance_job.title} ({issue.created_maintenance_job.status.replace(/_/g, ' ')})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Job Checklist */}
      {job.checklist && job.checklist.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <button
            onClick={() => setChecklistExpanded(!checklistExpanded)}
            className="w-full flex items-center justify-between gap-2 mb-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-900" />
              <h2 className="font-semibold text-gray-900">Job Checklist</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {job.checklist.filter(item => item.completed).length}/{job.checklist.length}
              </span>
            </div>
            {checklistExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {checklistExpanded && (
            <JobChecklist
              jobId={job.id}
              items={job.checklist}
              readOnly={job.status === 'COMPLETED'}
              onUpdate={(updatedItems) => {
                setJob(prevJob => prevJob ? { ...prevJob, checklist: updatedItems } : null)
              }}
            />
          )}
        </div>
      )}

      {/* Job Notes & Photos */}
      <JobNotesSection
        jobId={job.id}
        initialNotes={job.worker_notes || ''}
        initialPhotos={job.job_note_photos || []}
        isCompleted={job.status === 'COMPLETED'}
        onUpdate={refetchJob}
      />

      {/* Report Maintenance Issue Button */}
      <div className="mb-4">
        <button
          onClick={handleReportMaintenanceIssue}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Wrench className="w-5 h-5" />
          Report Maintenance Issue
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Found a maintenance issue? Report it here.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 bg-white border-t border-gray-200 py-4 md:relative md:border-0 md:bg-transparent md:p-0 md:mt-6">
        <div className="max-w-4xl mx-auto flex gap-3">
          {canStartJob && (
            <button
              onClick={handleStartJob}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Play className="w-5 h-5" />
              Start Job
            </button>
          )}
          {canCompleteJob && (
            <button
              onClick={handleCompleteJob}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Job
            </button>
          )}
          {!canStartJob && !canCompleteJob && job.status === 'COMPLETED' && (
            <div className="flex-1 text-center text-gray-500 py-3">
              This job has been completed
            </div>
          )}
        </div>
      </div>

      {/* Start Job Modal */}
      {showStartModal && job && (
        <StartJobModal
          jobId={job.id}
          propertyName={job.property.name}
          workerNotes={job.worker_notes || undefined}
          photos={job.job_note_photos || []}
          onClose={() => setShowStartModal(false)}
          onSuccess={handleStartJobSuccess}
        />
      )}

      {/* Complete Job Modal */}
      {showCompleteModal && job && (
        <CompleteJobModal
          jobId={job.id}
          propertyName={job.property.name}
          checklist={job.checklist || []}
          onClose={() => setShowCompleteModal(false)}
          onSuccess={handleCompleteJobSuccess}
        />
      )}

      {/* Create Maintenance Issue Modal */}
      {showMaintenanceIssueModal && job && (
        <CreateMaintenanceIssueModal
          jobId={job.id}
          propertyName={job.property.name}
          propertyId={job.property_id}
          customerId={job.customer_id}
          onClose={() => setShowMaintenanceIssueModal(false)}
          onSuccess={handleMaintenanceIssueSuccess}
        />
      )}

      {/* Issue Details Modal */}
      {selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={() => {
            setSelectedIssue(null)
            refetchJob()
          }}
        />
      )}
    </div>
  )
}
