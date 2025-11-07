import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Input, Spinner, useToast, Tabs, TabPanel, Badge, Modal } from '../components/ui'
import { workersAPI, cleaningJobsAPI, workerAvailabilityAPI, type Worker, type CleaningJob, type WorkerCertificate, type WorkerAvailability } from '../lib/api'
import { WorkerHistoryTimeline } from '../components/WorkerHistoryTimeline'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import UploadIcon from '@mui/icons-material/Upload'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import WorkIcon from '@mui/icons-material/Work'
import BadgeIcon from '@mui/icons-material/Badge'
import PersonIcon from '@mui/icons-material/Person'
import HistoryIcon from '@mui/icons-material/History'
import '../pages/ContractDetails.css'
import './Quotes.css'

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

export default function WorkerDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [jobs, setJobs] = useState<CleaningJob[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Form state
  const [formData, setFormData] = useState({
    // Basic info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    // Address
    address_street: '',
    address_city: '',
    address_postcode: '',
    address_country: '',
    // Employment
    worker_type: 'CLEANER' as 'CLEANER' | 'MAINTENANCE' | 'BOTH',
    employment_type: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR',
    hourly_rate: '',
    max_weekly_hours: '',
    employment_start_date: '',
    is_active: true,
    // Legal/Compliance
    date_of_birth: '',
    ni_number: '',
    driving_licence_number: '',
    driving_licence_expiry: '',
    // Professional
    bio: '',
    skills: [] as string[],
    experience_years: '',
    // Emergency contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  })

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Certificates state
  const [certificates, setCertificates] = useState<WorkerCertificate[]>([])

  // Availability state
  const [availability, setAvailability] = useState<WorkerAvailability[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (id) {
      loadWorkerData()
    }
  }, [id])

  useEffect(() => {
    if (id && activeTab === 'availability') {
      loadAvailability()
    }
  }, [id, activeTab, currentMonth])

  const loadWorkerData = async () => {
    try {
      setLoading(true)

      // Load worker details
      const workerData = await workersAPI.get(id!, SERVICE_PROVIDER_ID)
      setWorker(workerData)

      setFormData({
        // Basic info
        first_name: workerData.first_name,
        last_name: workerData.last_name,
        email: workerData.email,
        phone: workerData.phone,
        // Address
        address_street: workerData.address_street || '',
        address_city: workerData.address_city || '',
        address_postcode: workerData.address_postcode || '',
        address_country: workerData.address_country || '',
        // Employment
        worker_type: workerData.worker_type,
        employment_type: workerData.employment_type,
        hourly_rate: workerData.hourly_rate.toString(),
        max_weekly_hours: workerData.max_weekly_hours?.toString() || '',
        employment_start_date: workerData.employment_start_date ? new Date(workerData.employment_start_date).toISOString().split('T')[0] : '',
        is_active: workerData.is_active,
        // Legal/Compliance
        date_of_birth: workerData.date_of_birth ? new Date(workerData.date_of_birth).toISOString().split('T')[0] : '',
        ni_number: workerData.ni_number || '',
        driving_licence_number: workerData.driving_licence_number || '',
        driving_licence_expiry: workerData.driving_licence_expiry ? new Date(workerData.driving_licence_expiry).toISOString().split('T')[0] : '',
        // Professional
        bio: workerData.bio || '',
        skills: workerData.skills || [],
        experience_years: workerData.experience_years?.toString() || '',
        // Emergency contact
        emergency_contact_name: workerData.emergency_contact_name || '',
        emergency_contact_phone: workerData.emergency_contact_phone || '',
        emergency_contact_relation: workerData.emergency_contact_relation || '',
      })

      // Load existing photo if available
      if (workerData.photo_url) {
        setPhotoPreview(workerData.photo_url)
      }

      // Load worker's jobs
      const jobsData = await cleaningJobsAPI.list(SERVICE_PROVIDER_ID, {
        assigned_worker_id: id,
      })
      setJobs(jobsData.data || [])

      // Load certificates
      try {
        const certificatesData = await workersAPI.listCertificates(id!)
        setCertificates(certificatesData)
      } catch (error) {
        console.error('Error loading certificates:', error)
        // Non-critical error, don't block the page load
      }
    } catch (error: any) {
      console.error('Error loading worker:', error)
      toast.error('Failed to load worker details')
      navigate('/workers')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailability = async () => {
    if (!id) return

    setAvailabilityLoading(true)
    try {
      // Get blocked dates for current month ± 1 month for better view
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)

      const availabilityData = await workerAvailabilityAPI.list(id, {
        status: 'BLOCKED',
        from_date: startDate.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0],
      })
      setAvailability(availabilityData)
    } catch (error) {
      console.error('Error loading availability:', error)
      // Don't show error toast for availability, it's not critical
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true)

      const payload = {
        // Basic info
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        // Address
        address_street: formData.address_street || null,
        address_city: formData.address_city || null,
        address_postcode: formData.address_postcode || null,
        address_country: formData.address_country || null,
        // Employment
        worker_type: formData.worker_type,
        employment_type: formData.employment_type,
        hourly_rate: parseFloat(formData.hourly_rate),
        max_weekly_hours: formData.max_weekly_hours ? parseInt(formData.max_weekly_hours) : null,
        employment_start_date: formData.employment_start_date || null,
        is_active: formData.is_active,
        // Legal/Compliance
        date_of_birth: formData.date_of_birth || null,
        ni_number: formData.ni_number || null,
        driving_licence_number: formData.driving_licence_number || null,
        driving_licence_expiry: formData.driving_licence_expiry || null,
        // Professional
        bio: formData.bio || null,
        skills: formData.skills,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        // Emergency contact
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
        service_provider_id: SERVICE_PROVIDER_ID,
      }

      await workersAPI.update(id!, payload)
      toast.success('Worker information updated')
      await loadWorkerData()
    } catch (error: any) {
      console.error('Error updating worker:', error)
      toast.error('Failed to update worker')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim()
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmedSkill] })
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToRemove) })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePhoto = async () => {
    if (!photoFile || !id) return

    try {
      setSaving(true)
      const result = await workersAPI.uploadPhoto(id, photoFile)

      // Update the photo preview with the server URL
      setPhotoPreview(result.photo_url)
      setPhotoFile(null)

      // Refresh worker data to get updated photo_url
      await loadWorkerData()

      toast.success('Photo uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      toast.error(error.response?.data?.error || 'Failed to upload photo')
    } finally {
      setSaving(false)
    }
  }

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && id) {
      try {
        setSaving(true)

        // Upload certificate to server
        const uploadedCert = await workersAPI.uploadCertificate(id, file, {
          name: file.name,
        })

        // Add to local state
        setCertificates([...certificates, uploadedCert])
        toast.success(`Certificate "${uploadedCert.name}" uploaded successfully`)
      } catch (error: any) {
        console.error('Error uploading certificate:', error)
        toast.error(error.response?.data?.error || 'Failed to upload certificate')
      } finally {
        setSaving(false)
      }

      // Reset the input
      e.target.value = ''
    }
  }

  const handleViewCertificate = (cert: WorkerCertificate) => {
    // Open the certificate file in a new window
    window.open(cert.file_url, '_blank')
  }

  const handleDeleteCertificate = async (certId: string) => {
    if (!id) return

    if (confirm('Are you sure you want to delete this certificate?')) {
      try {
        setSaving(true)
        await workersAPI.deleteCertificate(id, certId)

        // Remove from local state
        setCertificates(certificates.filter(c => c.id !== certId))
        toast.success('Certificate deleted successfully')
      } catch (error: any) {
        console.error('Error deleting certificate:', error)
        toast.error(error.response?.data?.error || 'Failed to delete certificate')
      } finally {
        setSaving(false)
      }
    }
  }

  const isDateBlocked = (date: Date): boolean => {
    return availability.some(avail => {
      const start = new Date(avail.start_date)
      const end = new Date(avail.end_date)
      // Set time to midnight for accurate date comparison
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  const tileClassName = ({ date }: { date: Date }) => {
    if (isDateBlocked(date)) {
      return 'blocked-date'
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!worker) {
    return null
  }

  const upcomingJobs = jobs.filter(job =>
    new Date(job.scheduled_date) >= new Date() &&
    job.status !== 'COMPLETED' &&
    job.status !== 'CANCELLED'
  )

  const completedJobs = jobs.filter(job => job.status === 'COMPLETED')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <PersonIcon sx={{ fontSize: 20 }} /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarMonthIcon sx={{ fontSize: 20 }} /> },
    { id: 'certificates', label: 'Certificates', icon: <BadgeIcon sx={{ fontSize: 20 }} /> },
    { id: 'availability', label: 'Availability', icon: <WorkIcon sx={{ fontSize: 20 }} /> },
    { id: 'history', label: 'History', icon: <HistoryIcon sx={{ fontSize: 20 }} /> },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/workers')} className="mb-4">
          ← Back to Workers
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Photo Section */}
            <div className="flex-shrink-0">
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  backgroundColor: '#f3f4f6',
                  border: '2px dashed #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Worker"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="text-center">
                    <UploadIcon sx={{ fontSize: 32, color: '#9ca3af' }} />
                    <p className="text-xs text-gray-500 mt-1">Add Photo</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
              {photoFile && (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleSavePhoto}
                  disabled={saving}
                >
                  Save Photo
                </Button>
              )}
            </div>

            {/* Worker Info */}
            <div>
              <h1 className="text-3xl font-bold">
                {worker.first_name} {worker.last_name}
              </h1>
              <p className="text-gray-600 mt-1">{worker.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge color={worker.is_active ? 'green' : 'gray'}>
                  {worker.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge color="blue">{worker.worker_type.replace('_', ' ')}</Badge>
                <Badge color="purple">{worker.employment_type.replace('_', ' ')}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="customer-info-grid mt-6">
          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💷</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Hourly Rate</p>
                <p className="text-lg font-extrabold text-green-900 dark:text-green-100">
                  £{worker.hourly_rate}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Jobs Completed</p>
                <p className="text-lg font-extrabold text-blue-900 dark:text-blue-100">
                  {worker.jobs_completed}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">Upcoming Jobs</p>
                <p className="text-lg font-extrabold text-purple-900 dark:text-purple-100">
                  {upcomingJobs.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⭐</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Rating</p>
                <p className="text-lg font-extrabold text-amber-900 dark:text-amber-100">
                  {worker.average_rating ? `${worker.average_rating}` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-6">
        <TabPanel tabId="overview" activeTab={activeTab}>
          {/* Overview Tab */}
          <div className="max-w-7xl mx-auto">
            {/* Basic Information */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <h2 className="text-xl font-bold">Basic Information</h2>
              </div>
              <Button variant="primary" onClick={() => setEditModalOpen(true)}>
                Edit Information
              </Button>
            </div>

            <div className="quotes-stats mb-8">
              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Name</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {worker?.first_name} {worker?.last_name}
                  </div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Email</div>
                  <div className="text-sm text-gray-900 truncate">{worker?.email}</div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Phone</div>
                  <div className="text-sm text-gray-900">{worker?.phone}</div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Worker Type</div>
                  <div className="text-sm text-gray-900">
                    {worker?.worker_type === 'CLEANER' ? 'Cleaner' :
                     worker?.worker_type === 'MAINTENANCE' ? 'Maintenance' : 'Both'}
                  </div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Employment Type</div>
                  <div className="text-sm text-gray-900">
                    {worker?.employment_type === 'FULL_TIME' ? 'Full Time' :
                     worker?.employment_type === 'PART_TIME' ? 'Part Time' : 'Contractor'}
                  </div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Hourly Rate</div>
                  <div className="text-lg font-semibold text-green-600">
                    £{Number(worker?.hourly_rate || 0).toFixed(2)}
                  </div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Max Weekly Hours</div>
                  <div className="text-sm text-gray-900">
                    {worker?.max_weekly_hours || 'Not set'}
                  </div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-label mb-2">Status</div>
                  <div>
                    {worker?.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              {worker?.address_street && (
                <Card className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-label mb-2">Address</div>
                    <div className="text-sm text-gray-900">
                      {worker.address_street}<br />
                      {worker.address_city} {worker.address_postcode}
                    </div>
                  </div>
                </Card>
              )}

              {worker?.experience_years && (
                <Card className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-label mb-2">Experience</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {worker.experience_years} {worker.experience_years === 1 ? 'year' : 'years'}
                    </div>
                  </div>
                </Card>
              )}

              {worker?.employment_start_date && (
                <Card className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-label mb-2">Employment Start</div>
                    <div className="text-sm text-gray-900">
                      {new Date(worker.employment_start_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </Card>
              )}

              {worker?.skills && worker.skills.length > 0 && (
                <Card className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-label mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {worker.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {worker.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          +{worker.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {worker?.bio && (
                <Card className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-label mb-2">Bio</div>
                    <div className="text-sm text-gray-900 line-clamp-3">
                      {worker.bio}
                    </div>
                  </div>
                </Card>
              )}

              {worker?.emergency_contact_name && (
                <Card className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-label mb-2">Emergency Contact</div>
                    <div className="text-sm text-gray-900">
                      {worker.emergency_contact_name}<br />
                      {worker.emergency_contact_phone}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Performance Summary */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-bold">Performance Summary</h2>
            </div>

            <div className="quotes-stats">
              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-value text-green-600">{completedJobs.length}</div>
                  <div className="stat-label">Completed Jobs</div>
                  <div className="text-sm text-green-600 mt-2">Successfully finished</div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-value text-blue-600">{upcomingJobs.length}</div>
                  <div className="stat-label">Upcoming Jobs</div>
                  <div className="text-sm text-blue-600 mt-2">Scheduled ahead</div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-value text-amber-600">
                    {worker?.average_rating ? `${worker.average_rating}` : 'N/A'}
                  </div>
                  <div className="stat-label">Average Rating</div>
                  <div className="text-sm text-amber-600 mt-2">Out of 5 stars</div>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-value text-gray-600">
                    {new Date(worker?.created_at || '').toLocaleDateString('en-GB', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="stat-label">Member Since</div>
                  <div className="text-sm text-gray-600 mt-2">Joined date</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Edit Modal */}
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Edit Worker Information"
            size="lg"
          >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address</h3>
                <Input
                  label="Street Address"
                  value={formData.address_street}
                  onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.address_city}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  />
                  <Input
                    label="Postcode"
                    value={formData.address_postcode}
                    onChange={(e) => setFormData({ ...formData, address_postcode: e.target.value })}
                  />
                </div>
                <Input
                  label="Country"
                  value={formData.address_country}
                  onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
                />
              </div>

              {/* Employment Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Employment Details</h3>
                <div className="input-wrapper input-wrapper-full-width">
                  <label className="input-label">Worker Type</label>
                  <select
                    value={formData.worker_type}
                    onChange={(e) => setFormData({ ...formData, worker_type: e.target.value as any })}
                    className="input input-md input-default"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="CLEANER">Cleaner</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                <div className="input-wrapper input-wrapper-full-width">
                  <label className="input-label">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                    className="input input-md input-default"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Hourly Rate (£)"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    required
                  />
                  <Input
                    label="Max Weekly Hours"
                    type="number"
                    value={formData.max_weekly_hours}
                    onChange={(e) => setFormData({ ...formData, max_weekly_hours: e.target.value })}
                  />
                </div>
                <Input
                  label="Employment Start Date"
                  type="date"
                  value={formData.employment_start_date}
                  onChange={(e) => setFormData({ ...formData, employment_start_date: e.target.value })}
                />
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active Worker</label>
                </div>
              </div>

              {/* Legal & Compliance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Legal & Compliance</h3>
                <Input
                  label="National Insurance Number"
                  value={formData.ni_number}
                  onChange={(e) => setFormData({ ...formData, ni_number: e.target.value })}
                  placeholder="QQ 12 34 56 A"
                />
                <Input
                  label="Driving Licence Number"
                  value={formData.driving_licence_number}
                  onChange={(e) => setFormData({ ...formData, driving_licence_number: e.target.value })}
                />
                <Input
                  label="Driving Licence Expiry"
                  type="date"
                  value={formData.driving_licence_expiry}
                  onChange={(e) => setFormData({ ...formData, driving_licence_expiry: e.target.value })}
                />
              </div>

              {/* Professional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                <Input
                  label="Years of Experience"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  min="0"
                />
                <div className="input-wrapper input-wrapper-full-width">
                  <label className="input-label">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="input input-md input-default resize-none"
                    placeholder="Brief professional biography..."
                  />
                </div>
                <div className="input-wrapper input-wrapper-full-width">
                  <label className="input-label">Skills</label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSkill(skillInput)
                          setSkillInput('')
                        }
                      }}
                      placeholder="Type a skill and press Enter"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        handleAddSkill(skillInput)
                        setSkillInput('')
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-blue-900 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Emergency Contact</h3>
                <Input
                  label="Contact Name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                />
                <Input
                  label="Contact Phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                />
                <Input
                  label="Relationship"
                  value={formData.emergency_contact_relation}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  await handleSaveBasicInfo()
                  setEditModalOpen(false)
                }}
                disabled={saving}
              >
                {saving ? <Spinner size="sm" /> : 'Save Changes'}
              </Button>
            </div>
          </Modal>
        </TabPanel>

        <TabPanel tabId="schedule" activeTab={activeTab}>
          {/* Schedule Tab */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-bold">Upcoming Jobs ({upcomingJobs.length})</h2>
            </div>

            {upcomingJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <CalendarMonthIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                <p className="text-gray-500 mt-4">No upcoming jobs scheduled</p>
              </Card>
            ) : (
              <div className="quotes-grid mb-8">
                {upcomingJobs.map(job => (
                  <Card
                    key={job.id}
                    className="quote-card"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{job.property?.property_name}</h3>
                        <p className="quote-customer">{job.property?.address}</p>
                      </div>
                      <Badge color={job.status === 'SCHEDULED' ? 'blue' : 'yellow'}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="quote-details">
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {job.scheduled_start_time} - {job.scheduled_end_time}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {completedJobs.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-6 mt-8">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-xl font-bold">Recent Completed Jobs ({completedJobs.slice(0, 5).length})</h3>
                </div>
                <div className="quotes-grid">
                  {completedJobs.slice(0, 5).map(job => (
                    <Card
                      key={job.id}
                      className="quote-card"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div className="quote-card-header">
                        <div>
                          <h3 className="quote-number">{job.property?.property_name}</h3>
                          <p className="quote-customer">{job.property?.address}</p>
                        </div>
                        <Badge color="green">Completed</Badge>
                      </div>

                      <div className="quote-details">
                        <div className="quote-detail-item">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">
                            {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabPanel>

        <TabPanel tabId="certificates" activeTab={activeTab}>
          {/* Certificates Tab */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Certificates & Documents</h2>
              <Button>
                <label className="cursor-pointer">
                  <UploadIcon sx={{ fontSize: 18, marginRight: 1 }} />
                  Upload Certificate
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCertificateUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </Button>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <BadgeIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                <p className="text-gray-500 mt-4">No certificates uploaded yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Upload certifications, licenses, or training documents
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Uploaded: {new Date(cert.uploaded_at).toLocaleDateString('en-GB')}
                        </p>
                        {cert.expiry_date && (
                          <p className="text-sm text-gray-600">
                            Expires: {new Date(cert.expiry_date).toLocaleDateString('en-GB')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleViewCertificate(cert)} fullWidth>
                        View
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteCertificate(cert.id)} fullWidth>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel tabId="availability" activeTab={activeTab}>
          {/* Availability Tab */}
          <div className="max-w-5xl mx-auto">
            {/* Stats Dashboard */}
            {!availabilityLoading && (() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)

              const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
              const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

              // Calculate total blocked days this month
              const blockedThisMonth = availability.filter(item => {
                const start = new Date(item.start_date)
                const end = new Date(item.end_date)
                return (start <= currentMonthEnd && end >= currentMonthStart)
              }).reduce((total, item) => {
                const start = new Date(item.start_date)
                const end = new Date(item.end_date)
                const rangeStart = start < currentMonthStart ? currentMonthStart : start
                const rangeEnd = end > currentMonthEnd ? currentMonthEnd : end
                const days = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
                return total + days
              }, 0)

              // Calculate upcoming blocked days (from today forward)
              const upcomingBlocked = availability.filter(item => {
                const end = new Date(item.end_date)
                return end >= today
              }).reduce((total, item) => {
                const start = new Date(item.start_date)
                const end = new Date(item.end_date)
                const rangeStart = start < today ? today : start
                const days = Math.ceil((end.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
                return total + days
              }, 0)

              // Check if currently unavailable
              const currentlyUnavailable = availability.some(item => {
                const start = new Date(item.start_date)
                const end = new Date(item.end_date)
                start.setHours(0, 0, 0, 0)
                end.setHours(23, 59, 59, 999)
                return start <= today && end >= today
              })

              // Find next blocked period
              const nextBlocked = availability
                .filter(item => new Date(item.start_date) > today)
                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0]

              const daysUntilNext = nextBlocked
                ? Math.ceil((new Date(nextBlocked.start_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <div className="quotes-stats mb-6">
                  <Card className="stat-card">
                    <div className="stat-card-content">
                      <div className="stat-value">{blockedThisMonth}</div>
                      <div className="stat-label">Blocked This Month</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </Card>

                  <Card className="stat-card">
                    <div className="stat-card-content">
                      <div className="stat-value text-blue-600">{upcomingBlocked}</div>
                      <div className="stat-label">Upcoming Blocked Days</div>
                      <div className="text-sm text-blue-600 mt-2">From today onwards</div>
                    </div>
                  </Card>

                  <Card className="stat-card">
                    <div className="stat-card-content">
                      <div className={`stat-value ${currentlyUnavailable ? 'text-red-600' : 'text-green-600'}`}>
                        {currentlyUnavailable ? 'Unavailable' : 'Available'}
                      </div>
                      <div className="stat-label">Current Status</div>
                      <div className={`text-sm mt-2 ${currentlyUnavailable ? 'text-red-600' : 'text-green-600'}`}>
                        {currentlyUnavailable ? 'Blocked today' : 'Ready to work'}
                      </div>
                    </div>
                  </Card>

                  <Card className="stat-card">
                    <div className="stat-card-content">
                      <div className="stat-value text-orange-600">
                        {nextBlocked ? daysUntilNext : '—'}
                      </div>
                      <div className="stat-label">Next Block In</div>
                      <div className="text-sm text-orange-600 mt-2">
                        {nextBlocked ? `${daysUntilNext === 1 ? 'day' : 'days'}` : 'No upcoming blocks'}
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })()}

            {/* Calendar and Availability Grid */}
            {availabilityLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : (
              <>
                <div className="quotes-stats mb-6">
                  {/* Calendar Card */}
                  <Card className="stat-card">
                    <Calendar
                      value={currentMonth}
                      onChange={(value) => {
                        if (value instanceof Date) {
                          setCurrentMonth(value)
                        }
                      }}
                      tileClassName={tileClassName}
                      className="border-0 w-full"
                    />
                  </Card>

                  {/* First Blocked Date or Empty State */}
                  {availability.length === 0 ? (
                    <Card className="stat-card">
                      <div className="stat-card-content text-center py-8">
                        <CalendarMonthIcon sx={{ fontSize: 40, color: '#9ca3af' }} />
                        <h3 className="text-sm font-semibold text-gray-700 mt-2">No blocked dates</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Worker has no unavailable periods set
                        </p>
                      </div>
                    </Card>
                  ) : (
                    (() => {
                      const sortedAvailability = [...availability].sort(
                        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                      )
                      const firstItem = sortedAvailability[0]
                      const start = new Date(firstItem.start_date)
                      const end = new Date(firstItem.end_date)

                      return (
                        <Card className="stat-card">
                          <div className="stat-card-content">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">🚫</span>
                              <div className="stat-label">Blocked Dates ({availability.length})</div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">📅</span>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">Unavailable Period</h4>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' - '}
                              {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            {firstItem.reason && (
                              <p className="text-xs text-gray-600 mt-2">
                                <span className="font-medium">Reason:</span> {firstItem.reason}
                              </p>
                            )}
                          </div>
                        </Card>
                      )
                    })()
                  )}

                  {/* Quick Actions Card */}
                  <Card className="stat-card">
                    <div className="stat-card-content">
                      <div className="stat-label mb-3">Quick Actions</div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {/* TODO: Add block period handler */}}
                        fullWidth
                      >
                        + Block Period
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Remaining Blocked Dates */}
                {availability.length > 1 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">📋</span>
                      <h3 className="text-xl font-bold text-gray-900">
                        Additional Blocked Periods ({availability.length - 1})
                      </h3>
                    </div>
                    <div className="quotes-grid">
                      {[...availability]
                        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                        .slice(1)
                        .map(item => {
                          const start = new Date(item.start_date)
                          const end = new Date(item.end_date)
                          return (
                            <Card
                              key={item.id}
                              className="quote-card"
                            >
                              <div className="quote-card-header">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">📅</span>
                                  <div>
                                    <h3 className="quote-number">Unavailable Period</h3>
                                    <p className="quote-customer">
                                      {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      {' - '}
                                      {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {item.reason && (
                                <div className="quote-details">
                                  <div className="quote-detail-item">
                                    <span className="text-gray-600">Reason:</span>
                                    <span className="font-medium">{item.reason}</span>
                                  </div>
                                </div>
                              )}
                            </Card>
                          )
                        })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </TabPanel>

        <TabPanel tabId="history" activeTab={activeTab}>
          {/* History Tab */}
          {id && <WorkerHistoryTimeline workerId={id} />}
        </TabPanel>
      </div>
    </div>
  )
}
