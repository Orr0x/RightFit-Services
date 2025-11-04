import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Input, Spinner, useToast, Tabs, TabPanel, Badge } from '../components/ui'
import { workersAPI, cleaningJobsAPI, type Worker, type CleaningJob, type WorkerCertificate } from '../lib/api'
import { WorkerHistoryTimeline } from '../components/WorkerHistoryTimeline'
import UploadIcon from '@mui/icons-material/Upload'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import WorkIcon from '@mui/icons-material/Work'
import BadgeIcon from '@mui/icons-material/Badge'
import PersonIcon from '@mui/icons-material/Person'
import HistoryIcon from '@mui/icons-material/History'

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
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    worker_type: 'CLEANER' as 'CLEANER' | 'MAINTENANCE' | 'BOTH',
    employment_type: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR',
    hourly_rate: '',
    is_active: true,
    max_weekly_hours: '',
  })

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Certificates state
  const [certificates, setCertificates] = useState<WorkerCertificate[]>([])

  // Availability state
  const [availability, setAvailability] = useState<{
    [date: string]: boolean
  }>({})

  useEffect(() => {
    if (id) {
      loadWorkerData()
    }
  }, [id])

  const loadWorkerData = async () => {
    try {
      setLoading(true)

      // Load worker details
      const workerData = await workersAPI.get(id!, SERVICE_PROVIDER_ID)
      setWorker(workerData)

      setFormData({
        first_name: workerData.first_name,
        last_name: workerData.last_name,
        email: workerData.email,
        phone: workerData.phone,
        worker_type: workerData.worker_type,
        employment_type: workerData.employment_type,
        hourly_rate: workerData.hourly_rate.toString(),
        is_active: workerData.is_active,
        max_weekly_hours: workerData.max_weekly_hours?.toString() || '',
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

      // TODO: Load availability from API when endpoint is available
    } catch (error: any) {
      console.error('Error loading worker:', error)
      toast.error('Failed to load worker details')
      navigate('/workers')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true)

      const payload = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
        max_weekly_hours: formData.max_weekly_hours ? parseInt(formData.max_weekly_hours) : undefined,
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

  const handleToggleAvailability = (date: string) => {
    setAvailability(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
    // TODO: Save to API when endpoint is available
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Hourly Rate</div>
            <div className="text-2xl font-bold">£{worker.hourly_rate}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Jobs Completed</div>
            <div className="text-2xl font-bold">{worker.jobs_completed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Upcoming Jobs</div>
            <div className="text-2xl font-bold">{upcomingJobs.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Rating</div>
            <div className="text-2xl font-bold">
              {worker.average_rating ? `⭐ ${worker.average_rating}` : 'N/A'}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Worker Type</label>
                  <select
                    value={formData.worker_type}
                    onChange={(e) => setFormData({ ...formData, worker_type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="CLEANER">Cleaner</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                  </select>
                </div>
                <Input
                  label="Hourly Rate (£)"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                />
                <Input
                  label="Max Weekly Hours (optional)"
                  type="number"
                  value={formData.max_weekly_hours}
                  onChange={(e) => setFormData({ ...formData, max_weekly_hours: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                </div>
                <Button onClick={handleSaveBasicInfo} disabled={saving} fullWidth>
                  {saving ? <Spinner size="sm" /> : 'Save Changes'}
                </Button>
              </div>
            </Card>

            {/* Performance */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Completed Jobs</span>
                  <span className="text-lg font-bold text-green-700">{completedJobs.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Upcoming Jobs</span>
                  <span className="text-lg font-bold text-blue-700">{upcomingJobs.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Average Rating</span>
                  <span className="text-lg font-bold text-purple-700">
                    {worker.average_rating ? `${worker.average_rating}/5` : 'No ratings yet'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(worker.created_at).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel tabId="schedule" activeTab={activeTab}>
          {/* Schedule Tab */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Work Schedule</h2>

            {upcomingJobs.length === 0 ? (
              <div className="text-center py-12">
                <CalendarMonthIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                <p className="text-gray-500 mt-4">No upcoming jobs scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingJobs.map(job => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{job.property?.property_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{job.property?.address}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            📅 {new Date(job.scheduled_date).toLocaleDateString('en-GB')}
                          </span>
                          <span className="text-gray-600">
                            🕐 {job.scheduled_start_time} - {job.scheduled_end_time}
                          </span>
                        </div>
                      </div>
                      <Badge color={job.status === 'SCHEDULED' ? 'blue' : 'yellow'}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedJobs.length > 0 && (
              <>
                <h3 className="text-lg font-bold mt-8 mb-4">Recent Completed Jobs</h3>
                <div className="space-y-3">
                  {completedJobs.slice(0, 5).map(job => (
                    <div
                      key={job.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{job.property?.property_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{job.property?.address}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-gray-600">
                              📅 {new Date(job.scheduled_date).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        </div>
                        <Badge color="green">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
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
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Availability Calendar</h2>
            <p className="text-gray-600 mb-6">
              Mark dates when this worker is available for jobs
            </p>

            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <CalendarMonthIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
              <p className="text-gray-500 mt-4">Availability calendar coming soon</p>
              <p className="text-sm text-gray-400 mt-2">
                This feature will allow you to set worker availability and time-off
              </p>
            </div>
          </Card>
        </TabPanel>

        <TabPanel tabId="history" activeTab={activeTab}>
          {/* History Tab */}
          {id && <WorkerHistoryTimeline workerId={id} />}
        </TabPanel>
      </div>
    </div>
  )
}
