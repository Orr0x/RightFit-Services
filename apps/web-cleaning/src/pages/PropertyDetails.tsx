import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, useToast, Badge, Tabs, TabPanel, Select } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import {
  customerPropertiesAPI,
  cleaningJobsAPI,
  checklistTemplatesAPI,
  cleaningContractsAPI,
  maintenanceJobsAPI,
  type CustomerProperty,
  type CleaningJob,
  type ChecklistTemplate,
  type CleaningContract,
  type MaintenanceJob
} from '../lib/api'
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
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import '../pages/ContractDetails.css'
import '../pages/PropertyDetails.css'

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
  const [activeTab, setActiveTab] = useState('details')

  // Tab data state
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([])
  const [contracts, setContracts] = useState<CleaningContract[]>([])
  const [maintenanceJobs, setMaintenanceJobs] = useState<MaintenanceJob[]>([])
  const [loadingTabData, setLoadingTabData] = useState(false)

  // Add template state
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [allTemplates, setAllTemplates] = useState<ChecklistTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [addingTemplate, setAddingTemplate] = useState(false)
  const [linkedTemplateIds, setLinkedTemplateIds] = useState<string[]>([])

  const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

  useEffect(() => {
    if (id) {
      loadProperty()
      loadRecentJobs()
    }
  }, [id])

  // Load tab data when tab changes
  useEffect(() => {
    if (id && property && activeTab !== 'details' && activeTab !== 'cleaning') {
      loadTabData()
    }
  }, [id, activeTab, property])

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

  const loadTabData = async () => {
    if (!id || !property) return

    try {
      setLoadingTabData(true)

      if (activeTab === 'checklists') {
        // Load linked checklist templates from database
        const linkedChecklists = await customerPropertiesAPI.getChecklistTemplates(id)
        setChecklists(linkedChecklists || [])
        setLinkedTemplateIds(linkedChecklists.map(c => c.id))
      }

      if (activeTab === 'contracts') {
        // Load contracts that include this property
        if (property.customer?.id) {
          const contractsData = await cleaningContractsAPI.list({
            customer_id: property.customer.id,
          })
          // Filter to only show contracts that include this specific property
          const filteredContracts = contractsData.filter(contract =>
            contract.property_contracts?.some(pc => pc.property_id === id)
          )
          setContracts(filteredContracts || [])
        }
      }

      if (activeTab === 'maintenance') {
        // Load maintenance jobs for this property
        const maintenanceData = await maintenanceJobsAPI.list(SERVICE_PROVIDER_ID, {
          property_id: id,
        })
        setMaintenanceJobs(maintenanceData.data || [])
      }
    } catch (error) {
      console.error('Failed to load tab data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoadingTabData(false)
    }
  }

  const loadAllTemplates = async () => {
    try {
      const templatesData = await checklistTemplatesAPI.list(SERVICE_PROVIDER_ID)
      setAllTemplates(templatesData || [])
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    }
  }

  const handleShowAddTemplate = () => {
    setShowAddTemplate(true)
    loadAllTemplates()
  }

  const handleAddTemplate = async () => {
    if (!selectedTemplateId || !id) {
      toast.error('Please select a template')
      return
    }

    try {
      setAddingTemplate(true)

      // Link template to property via API
      await customerPropertiesAPI.linkChecklistTemplate(id, selectedTemplateId)

      // Update local state
      const newChecklist = allTemplates.find(t => t.id === selectedTemplateId)
      if (newChecklist) {
        setChecklists([...checklists, newChecklist])
        setLinkedTemplateIds([...linkedTemplateIds, selectedTemplateId])
        toast.success('Template linked to property')
      }

      setShowAddTemplate(false)
      setSelectedTemplateId('')
    } catch (error: any) {
      console.error('Failed to add template:', error)
      const errorMessage = error.response?.data?.error || 'Failed to add template'
      toast.error(errorMessage)
    } finally {
      setAddingTemplate(false)
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

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel tabId="details" label="Details" activeTab={activeTab}>
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

      {/* Guest Turnover Calendar */}
      {id && <PropertyGuestCalendar propertyId={id} />}

      {/* Property History Timeline */}
      {id && <PropertyHistoryTimeline propertyId={id} />}
        </TabPanel>

        <TabPanel tabId="checklists" label="Checklists" activeTab={activeTab}>
          {loadingTabData ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="text-gray-600 mt-3">Loading checklists...</p>
            </Card>
          ) : checklists.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  Checklist Templates ({checklists.length})
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleShowAddTemplate}>
                    <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Add Template
                  </Button>
                  <Button size="sm" onClick={() => navigate('/checklist-templates')}>
                    Create New
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/checklist-templates')}>
                    View All Templates
                  </Button>
                </div>
              </div>

              {/* Add Template Form */}
              {showAddTemplate && (
                <Card className="p-4 mb-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">➕</span>
                    Add Template to Property
                  </h3>
                  <div className="space-y-3">
                    <Select
                      placeholder="Select a template..."
                      options={allTemplates
                        .filter(t => !checklists.find(c => c.id === t.id))
                        .map((template) => ({
                          value: template.id,
                          label: `${template.template_name} - ${template.property_type} (${template.estimated_duration_minutes} min)`,
                        }))}
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <Button onClick={handleAddTemplate} disabled={addingTemplate || !selectedTemplateId}>
                        {addingTemplate ? <Spinner size="sm" /> : 'Save Template'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setShowAddTemplate(false)
                        setSelectedTemplateId('')
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              <div className="checklists-grid">
                {checklists.map((checklist) => (
                  <Card
                    key={checklist.id}
                    className="checklist-card"
                    onClick={() => navigate('/checklist-templates')}
                  >
                    <div className="checklist-card-header">
                      <div>
                        <h3 className="checklist-title">{checklist.template_name}</h3>
                        <p className="checklist-subtitle">{checklist.property_type}</p>
                      </div>
                      {checklist.is_active && (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>

                    <div className="checklist-details">
                      <div className="checklist-detail-item">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{checklist.estimated_duration_minutes} min</span>
                      </div>
                    </div>

                    <div className="checklist-footer">
                      <span className="text-sm text-gray-600">Click to view template</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (confirm(`Remove "${checklist.template_name}" from this property?`)) {
                            try {
                              if (id) {
                                await customerPropertiesAPI.unlinkChecklistTemplate(id, checklist.id)
                                setChecklists(checklists.filter(c => c.id !== checklist.id))
                                setLinkedTemplateIds(linkedTemplateIds.filter(tid => tid !== checklist.id))
                                toast.success('Template removed from property')
                              }
                            } catch (error: any) {
                              console.error('Failed to remove template:', error)
                              const errorMessage = error.response?.data?.error || 'Failed to remove template'
                              toast.error(errorMessage)
                            }
                          }
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Checklists</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No checklist templates available for {property?.property_type} properties
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleShowAddTemplate}>
                    <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Add Template
                  </Button>
                  <Button onClick={() => navigate('/checklist-templates')}>
                    Create New Template
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/checklist-templates')}>
                    View All Templates
                  </Button>
                </div>
              </Card>

              {/* Add Template Form */}
              {showAddTemplate && (
                <Card className="p-4 mt-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">➕</span>
                    Add Template to Property
                  </h3>
                  <div className="space-y-3">
                    <Select
                      placeholder="Select a template..."
                      options={allTemplates.map((template) => ({
                        value: template.id,
                        label: `${template.template_name} - ${template.property_type} (${template.estimated_duration_minutes} min)`,
                      }))}
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <Button onClick={handleAddTemplate} disabled={addingTemplate || !selectedTemplateId}>
                        {addingTemplate ? <Spinner size="sm" /> : 'Save Template'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setShowAddTemplate(false)
                        setSelectedTemplateId('')
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </TabPanel>

        <TabPanel tabId="contracts" label="Contracts" activeTab={activeTab}>
          {loadingTabData ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="text-gray-600 mt-3">Loading contracts...</p>
            </Card>
          ) : contracts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Linked Contracts ({contracts.length})
                </h2>
                <Button size="sm" variant="outline" onClick={() => navigate('/contracts')}>
                  View All Contracts
                </Button>
              </div>
              <div className="contracts-grid">
                {contracts.map((contract) => (
                  <Card
                    key={contract.id}
                    className="contract-card"
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    <div className="contract-card-header">
                      <div>
                        <h3 className="contract-title">{contract.customer?.business_name}</h3>
                        <p className="contract-subtitle">
                          {contract.contract_type === 'FLAT_MONTHLY' ? 'Flat Monthly' : 'Per Property'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          contract.status === 'ACTIVE' ? 'success' :
                          contract.status === 'PAUSED' ? 'warning' :
                          'default'
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>

                    <div className="contract-details">
                      <div className="contract-detail-item">
                        <span className="text-gray-600">Contract Type:</span>
                        <span className="font-medium">
                          {contract.contract_type === 'FLAT_MONTHLY' ? 'Flat Monthly' : 'Per Property'}
                        </span>
                      </div>
                    </div>

                    <div className="contract-footer">
                      <div className="contract-total">
                        <span className="text-gray-600">Monthly Fee:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          £{Number(contract.monthly_fee).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Contracts</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This property is not currently linked to any cleaning contracts
              </p>
              <Button onClick={() => navigate('/contracts')}>
                View All Contracts
              </Button>
            </Card>
          )}
        </TabPanel>

        <TabPanel tabId="maintenance" label="Maintenance" activeTab={activeTab}>
          {loadingTabData ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="text-gray-600 mt-3">Loading maintenance jobs...</p>
            </Card>
          ) : maintenanceJobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🔧</span>
                  Maintenance Jobs ({maintenanceJobs.length})
                </h2>
              </div>
              <div className="maintenance-grid">
                {maintenanceJobs.map((job) => {
                  const badgeVariant =
                    job.status === 'COMPLETED' ? 'success' :
                    job.status === 'IN_PROGRESS' ? 'primary' :
                    job.priority === 'URGENT' ? 'danger' :
                    'warning'

                  return (
                    <Card
                      key={job.id}
                      className="maintenance-card"
                    >
                      <div className="maintenance-card-header">
                        <div>
                          <h3 className="maintenance-title">{job.title}</h3>
                          <p className="maintenance-subtitle">
                            {job.priority} • {job.status.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge variant={badgeVariant}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="maintenance-details">
                        <div className="maintenance-detail-item">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{job.category}</span>
                        </div>
                        <div className="maintenance-detail-item">
                          <span className="text-gray-600">Priority:</span>
                          <span className="font-medium">{job.priority}</span>
                        </div>
                        {job.scheduled_date && (
                          <div className="maintenance-detail-item">
                            <span className="text-gray-600">Scheduled:</span>
                            <span className="font-medium">
                              {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="maintenance-footer">
                        <span className="text-sm text-gray-600">
                          {job.status === 'COMPLETED' ? 'Completed' :
                           job.status === 'IN_PROGRESS' ? 'In Progress' :
                           'Pending'}
                        </span>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Maintenance Jobs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No maintenance jobs found for this property
              </p>
            </Card>
          )}
        </TabPanel>

        <TabPanel tabId="cleaning" label="Cleaning Jobs" activeTab={activeTab}>
          {recentJobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🧹</span>
                  Cleaning Jobs ({recentJobs.length})
                </h2>
                <Button size="sm" variant="outline" onClick={() => navigate(`/jobs?property_id=${id}`)}>
                  View All
                </Button>
              </div>
              <div className="customer-info-grid">
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
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Cleaning Jobs</h3>
              <p className="text-gray-600">No cleaning jobs found for this property</p>
            </Card>
          )}
        </TabPanel>
      </Tabs>
    </div>
  )
}
