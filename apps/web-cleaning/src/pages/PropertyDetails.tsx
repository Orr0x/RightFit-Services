import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, useToast, Badge } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { customerPropertiesAPI, cleaningJobsAPI, type CustomerProperty, type CleaningJob } from '../lib/api'
import { PropertyHistoryTimeline } from '../components/PropertyHistoryTimeline'
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
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HomeIcon /> Property Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Property Type</div>
            <div className="font-semibold">{property.property_type}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
            <div className="font-semibold">{property.bedrooms}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
            <div className="font-semibold">{property.bathrooms}</div>
          </div>
        </div>

        {property.customer && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Customer</div>
            <div className="font-semibold">{property.customer.business_name}</div>
            <div className="text-sm text-gray-500">{property.customer.contact_name}</div>
          </div>
        )}
      </Card>

      {/* Access Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <KeyIcon /> Access Information
        </h2>
        {property.access_instructions && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Instructions</div>
            <p className="text-gray-800 dark:text-gray-200">{property.access_instructions}</p>
          </div>
        )}
        {property.access_code && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Access Code</div>
            <div className="font-mono font-semibold text-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded inline-block">
              {property.access_code}
            </div>
          </div>
        )}
        {!property.access_instructions && !property.access_code && (
          <p className="text-gray-500 italic">No access information provided</p>
        )}
      </Card>

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
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Cleaning Jobs</h2>
            <Button size="sm" variant="outline" onClick={() => navigate(`/jobs?property_id=${id}`)}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div>
                  <div className="font-medium">
                    {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {job.assigned_worker?.first_name} {job.assigned_worker?.last_name}
                  </div>
                </div>
                <Badge
                  color={
                    job.status === 'COMPLETED' ? 'green' :
                    job.status === 'IN_PROGRESS' ? 'blue' :
                    job.status === 'SCHEDULED' ? 'yellow' : 'gray'
                  }
                >
                  {job.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Property History Timeline */}
      {id && <PropertyHistoryTimeline propertyId={id} />}
    </div>
  )
}
