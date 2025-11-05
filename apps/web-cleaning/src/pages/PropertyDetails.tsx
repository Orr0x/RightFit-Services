import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, useToast, Badge } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { customerPropertiesAPI, cleaningJobsAPI, type CustomerProperty, type CleaningJob } from '../lib/api'
import { PropertyHistoryTimeline } from '../components/PropertyHistoryTimeline'
import { PropertyGuestCalendar } from '../components/PropertyGuestCalendar'
import HomeIcon from '@mui/icons-material/Home'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyIcon from '@mui/icons-material/Key'
import BuildIcon from '@mui/icons-material/Build'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import WifiIcon from '@mui/icons-material/Wifi'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import PetsIcon from '@mui/icons-material/Pets'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import '../pages/ContractDetails.css'

interface PropertyPhoto {
  url: string
  caption?: string
  type?: 'exterior' | 'interior' | 'utility' | 'other'
}

interface UtilityLocation {
  stopTap?: string
  waterMeter?: string
  gasMeter?: string
  fuseBox?: string
  boiler?: string
  other?: Record<string, string>
}

interface EmergencyContact {
  name: string
  phone: string
  relation?: string
}

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<CustomerProperty | null>(null)
  const [recentJobs, setRecentJobs] = useState<CleaningJob[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => {
    if (id) {
      loadProperty()
      loadRecentJobs()
    }
  }, [id])

  const loadProperty = () => {
    if (!id) return

    withLoading(async () => {
      try {
        const data = await customerPropertiesAPI.get(id)
        setProperty(data)
      } catch (err: any) {
        toast.error('Failed to load property details')
        console.error('Load property error:', err)
      }
    })
  }

  const loadRecentJobs = async () => {
    if (!id) return

    try {
      const result = await cleaningJobsAPI.list('8aeb5932-907c-41b3-a2bc-05b27ed0dc87', {
        property_id: id,
        page: 1,
        limit: 5
      })
      setRecentJobs(result.data)
    } catch (err) {
      console.log('No recent jobs found')
    }
  }

  if (isLoading && !property) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
          <Button onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </Card>
      </div>
    )
  }

  const photos: PropertyPhoto[] = property.photo_urls ? (property.photo_urls as any) : []
  const utilityLocations: UtilityLocation = property.utility_locations ? (property.utility_locations as any) : {}
  const emergencyContacts: EmergencyContact[] = property.emergency_contacts ? (property.emergency_contacts as any) : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/properties')}>
            <ArrowBackIcon sx={{ fontSize: 20, mr: 1 }} />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{property.property_name}</h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <LocationOnIcon sx={{ fontSize: 18 }} />
              {property.address}, {property.postcode}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/properties/${id}/edit`)}>
          <EditIcon sx={{ fontSize: 18, mr: 1 }} />
          Edit
        </Button>
      </div>

      {/* Photos Gallery */}
      {photos.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Property Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={photo.url}
                  alt={photo.caption || `Property photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Basic Info */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🏠</span>
        Property Information
      </h2>
      <div className="customer-info-grid mb-6">
        {/* Property Type Card */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🏘️</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Property Type</p>
              <p className="text-lg font-extrabold text-blue-900 dark:text-blue-100">
                {property.property_type}
              </p>
            </div>
          </div>
        </Card>

        {/* Bedrooms Card */}
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🛏️</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">Bedrooms</p>
              <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-100">
                {property.bedrooms}
              </p>
            </div>
          </div>
        </Card>

        {/* Bathrooms Card */}
        <Card className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-cyan-200 dark:bg-cyan-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🚿</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide mb-1">Bathrooms</p>
              <p className="text-2xl font-extrabold text-cyan-900 dark:text-cyan-100">
                {property.bathrooms}
              </p>
            </div>
          </div>
        </Card>

        {/* Customer Card */}
        {property.customer && (
          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Customer</p>
                <p className="text-lg font-extrabold text-green-900 dark:text-green-100">
                  {property.customer.business_name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">{property.customer.contact_name}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Access Information */}
      {(property.access_instructions || property.access_code) && (
        <>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🔑</span>
            Access Information
          </h2>
          <div className="customer-info-grid mb-6">
            {property.access_instructions && (
              <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800 md:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📋</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Instructions</p>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {property.access_instructions}
                    </p>
                  </div>
                </div>
              </Card>
            )}
            {property.access_code && (
              <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-200 dark:bg-emerald-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🔐</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">Access Code</p>
                    <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 font-mono">
                      {property.access_code}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Utility Locations */}
      {(utilityLocations.stopTap || utilityLocations.waterMeter || utilityLocations.gasMeter || utilityLocations.fuseBox || utilityLocations.boiler) && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BuildIcon /> Utility Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {utilityLocations.stopTap && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Stop Tap</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">{utilityLocations.stopTap}</div>
              </div>
            )}
            {utilityLocations.waterMeter && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Water Meter</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">{utilityLocations.waterMeter}</div>
              </div>
            )}
            {utilityLocations.gasMeter && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                <div className="text-sm font-medium text-orange-900 dark:text-orange-100">Gas Meter</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">{utilityLocations.gasMeter}</div>
              </div>
            )}
            {utilityLocations.fuseBox && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Fuse Box</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">{utilityLocations.fuseBox}</div>
              </div>
            )}
            {utilityLocations.boiler && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                <div className="text-sm font-medium text-red-900 dark:text-red-100">Boiler</div>
                <div className="text-sm text-red-700 dark:text-red-300">{utilityLocations.boiler}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ContactPhoneIcon /> Emergency Contacts
          </h2>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
                <div className="font-semibold text-red-900 dark:text-red-100">{contact.name}</div>
                <div className="text-red-700 dark:text-red-300 font-mono">{contact.phone}</div>
                {contact.relation && (
                  <div className="text-sm text-red-600 dark:text-red-400">{contact.relation}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* WiFi Info */}
        {(property.wifi_ssid || property.wifi_password) && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <WifiIcon /> WiFi Information
            </h2>
            {property.wifi_ssid && (
              <div className="mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Network Name</div>
                <div className="font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">{property.wifi_ssid}</div>
              </div>
            )}
            {property.wifi_password && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Password</div>
                <div className="font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">{property.wifi_password}</div>
              </div>
            )}
          </Card>
        )}

        {/* Parking Info */}
        {property.parking_info && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LocalParkingIcon /> Parking Information
            </h2>
            <p className="text-gray-800 dark:text-gray-200">{property.parking_info}</p>
          </Card>
        )}
      </div>

      {/* Pet Info */}
      {property.pet_info && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PetsIcon /> Pet Information
          </h2>
          <p className="text-gray-800 dark:text-gray-200">{property.pet_info}</p>
        </Card>
      )}

      {/* Cleaner Notes */}
      {property.cleaner_notes && (
        <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">Notes for Cleaners</h2>
          <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{property.cleaner_notes}</p>
        </Card>
      )}

      {/* Special Requirements */}
      {property.special_requirements && (
        <Card className="p-6 mb-6 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">Special Requirements</h2>
          <p className="text-purple-800 dark:text-purple-200 whitespace-pre-wrap">{property.special_requirements}</p>
        </Card>
      )}

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🧹</span>
              Recent Cleaning Jobs
            </h2>
            <Button size="sm" variant="outline" onClick={() => navigate(`/jobs?property_id=${id}`)}>
              View All
            </Button>
          </div>
          <div className="customer-info-grid mb-6">
            {recentJobs.map((job) => {
              const isCompleted = job.status === 'COMPLETED'
              const isInProgress = job.status === 'IN_PROGRESS'
              const isScheduled = job.status === 'SCHEDULED'

              const gradient = isCompleted
                ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
                : isInProgress
                ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800'
                : isScheduled
                ? 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800'
                : 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700'

              const iconBg = isCompleted
                ? 'bg-green-200 dark:bg-green-800'
                : isInProgress
                ? 'bg-blue-200 dark:bg-blue-800'
                : isScheduled
                ? 'bg-amber-200 dark:bg-amber-800'
                : 'bg-gray-300 dark:bg-gray-700'

              const textColor = isCompleted
                ? 'text-green-900 dark:text-green-100'
                : isInProgress
                ? 'text-blue-900 dark:text-blue-100'
                : isScheduled
                ? 'text-amber-900 dark:text-amber-100'
                : 'text-gray-900 dark:text-gray-100'

              const labelColor = isCompleted
                ? 'text-green-700 dark:text-green-300'
                : isInProgress
                ? 'text-blue-700 dark:text-blue-300'
                : isScheduled
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-gray-700 dark:text-gray-300'

              const icon = isCompleted ? '✅' : isInProgress ? '🔄' : isScheduled ? '📅' : '📋'

              return (
                <Card
                  key={job.id}
                  className={`p-5 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br ${gradient}`}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xl">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${labelColor} uppercase tracking-wide mb-1`}>
                        {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className={`text-lg font-extrabold ${textColor} mb-2`}>
                        {job.status.replace('_', ' ')}
                      </p>
                      {job.assigned_worker && (
                        <p className={`text-sm font-medium ${labelColor}`}>
                          👤 {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Guest Turnover Calendar */}
      {id && <PropertyGuestCalendar propertyId={id} />}

      {/* Property History Timeline */}
      {id && <PropertyHistoryTimeline propertyId={id} />}
    </div>
  )
}
