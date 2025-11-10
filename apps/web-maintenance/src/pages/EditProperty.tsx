import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, Select, Textarea, Spinner, Modal, type SelectOption } from '@rightfit/ui-core';
import { useToast } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import { useRequiredServiceProvider } from '../hooks/useServiceProvider'
import { customerPropertiesAPI, customersAPI, type CreateCustomerPropertyData, type Customer, type CustomerProperty } from '../lib/api'

interface UtilityLocations {
  stopTap?: string
  waterMeter?: string
  gasMeter?: string
  fuseBox?: string
  boiler?: string
}

interface EmergencyContact {
  name: string
  phone: string
  relation?: string
}

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i

export default function EditProperty() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoading, withLoading } = useLoading()
  const SERVICE_PROVIDER_ID = useRequiredServiceProvider()

  // Property loading state
  const [property, setProperty] = useState<CustomerProperty | null>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Form state
  const [formData, setFormData] = useState<CreateCustomerPropertyData>({
    customer_id: '',
    property_name: '',
    address: '',
    postcode: '',
    property_type: '',
    bedrooms: 0,
    bathrooms: 0,
    access_instructions: '',
    access_code: '',
    wifi_ssid: '',
    wifi_password: '',
    parking_info: '',
    pet_info: '',
    cleaner_notes: '',
    special_requirements: '',
    utility_locations: {},
    emergency_contacts: [],
    photo_urls: [],
  })

  // Utility locations state
  const [utilityLocations, setUtilityLocations] = useState<UtilityLocations>({
    stopTap: '',
    waterMeter: '',
    gasMeter: '',
    fuseBox: '',
    boiler: '',
  })

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', relation: '' }
  ])

  // Customers for dropdown
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load property data
  useEffect(() => {
    if (id) {
      loadProperty()
    }
  }, [id])

  // Load customers
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadProperty = async () => {
    try {
      setLoadingProperty(true)
      const propertyData = await customerPropertiesAPI.get(id!, SERVICE_PROVIDER_ID)
      setProperty(propertyData)

      // Parse utility locations from JSON
      const utilityLocs = propertyData.utility_locations as any
      if (utilityLocs && typeof utilityLocs === 'object') {
        setUtilityLocations({
          stopTap: utilityLocs.stopTap || '',
          waterMeter: utilityLocs.waterMeter || '',
          gasMeter: utilityLocs.gasMeter || '',
          fuseBox: utilityLocs.fuseBox || '',
          boiler: utilityLocs.boiler || '',
        })
      }

      // Parse emergency contacts from JSON
      const emergencyContactsData = propertyData.emergency_contacts as any
      if (Array.isArray(emergencyContactsData) && emergencyContactsData.length > 0) {
        setEmergencyContacts(emergencyContactsData)
      }

      // Set form data
      setFormData({
        customer_id: propertyData.customer_id,
        property_name: propertyData.property_name,
        address: propertyData.address,
        postcode: propertyData.postcode,
        property_type: propertyData.property_type || '',
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        access_instructions: propertyData.access_instructions || '',
        access_code: propertyData.access_code || '',
        wifi_ssid: propertyData.wifi_ssid || '',
        wifi_password: propertyData.wifi_password || '',
        parking_info: propertyData.parking_info || '',
        pet_info: propertyData.pet_info || '',
        cleaner_notes: propertyData.cleaner_notes || '',
        special_requirements: propertyData.special_requirements || '',
        utility_locations: propertyData.utility_locations,
        emergency_contacts: propertyData.emergency_contacts,
        photo_urls: propertyData.photo_urls,
      })
    } catch (err: any) {
      console.error('Failed to load property:', err)
      toast.error('Failed to load property')
      navigate('/properties')
    } finally {
      setLoadingProperty(false)
    }
  }

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const result = await customersAPI.list()
      setCustomers(result.data || [])
    } catch (err: any) {
      console.error('Failed to load customers:', err)
      toast.error('Failed to load customers')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const customerOptions: SelectOption[] = customers.map((customer) => ({
    value: customer.id,
    label: customer.business_name,
  }))

  const propertyTypeOptions: SelectOption[] = [
    { value: 'House', label: 'House' },
    { value: 'Flat', label: 'Flat' },
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Studio', label: 'Studio' },
    { value: 'Cottage', label: 'Cottage' },
    { value: 'Bungalow', label: 'Bungalow' },
    { value: 'Townhouse', label: 'Townhouse' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Other', label: 'Other' },
  ]

  const handleInputChange = (field: keyof CreateCustomerPropertyData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleUtilityChange = (field: keyof UtilityLocations, value: string) => {
    setUtilityLocations((prev) => ({ ...prev, [field]: value }))
  }

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    setEmergencyContacts((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [...prev, { name: '', phone: '', relation: '' }])
  }

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.property_name.trim()) {
      newErrors.property_name = 'Property name is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required'
    } else if (!UK_POSTCODE_REGEX.test(formData.postcode.trim())) {
      newErrors.postcode = 'Please enter a valid UK postcode (e.g., SW1A 1AA)'
    }
    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    await withLoading(async () => {
      try {
        // Filter out empty utility locations
        const filteredUtilityLocations = Object.entries(utilityLocations).reduce((acc, [key, value]) => {
          if (value && value.trim()) {
            acc[key] = value.trim()
          }
          return acc
        }, {} as any)

        // Filter out empty emergency contacts
        const filteredEmergencyContacts = emergencyContacts.filter(
          (contact) => contact.name.trim() || contact.phone.trim()
        )

        const propertyData: Partial<CreateCustomerPropertyData> = {
          ...formData,
          postcode: formData.postcode.trim().toUpperCase(),
          utility_locations: Object.keys(filteredUtilityLocations).length > 0 ? filteredUtilityLocations : undefined,
          emergency_contacts: filteredEmergencyContacts.length > 0 ? filteredEmergencyContacts : undefined,
        }

        const updated = await customerPropertiesAPI.update(id!, propertyData)
        toast.success(`Property "${updated.property_name}" updated successfully`)
        navigate(`/properties/${updated.id}`)
      } catch (err: any) {
        console.error('Failed to update property:', err)
        toast.error(err.response?.data?.error || 'Failed to update property')
      }
    })
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== property?.property_name) {
      toast.error('Property name does not match')
      return
    }

    await withLoading(async () => {
      try {
        await customerPropertiesAPI.delete(id!)
        toast.success('Property deleted successfully')
        navigate('/properties')
      } catch (err: any) {
        console.error('Failed to delete property:', err)
        toast.error(err.response?.data?.error || 'Failed to delete property')
      }
    })

    setShowDeleteModal(false)
  }

  const handleCancel = () => {
    navigate(`/properties/${id}`)
  }

  if (loadingProperty) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading property...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">The property you're looking for does not exist.</p>
            <Button onClick={() => navigate('/properties')}>Go to Properties</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={handleCancel}>
          ← Back to Property Details
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={isLoading}>
          Delete Property
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Property</h1>
          <p className="text-gray-600 mt-1">{property.property_name}</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(property.updated_at).toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Property Name"
                  value={formData.property_name}
                  onChange={(e) => handleInputChange('property_name', e.target.value)}
                  placeholder="e.g., Ocean View Cottage"
                  error={errors.property_name}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="e.g., 123 High Street, London"
                  error={errors.address}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Input
                  label="Postcode"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  placeholder="e.g., SW1A 1AA"
                  error={errors.postcode}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Select
                  label="Customer"
                  value={formData.customer_id}
                  onChange={(value) => handleInputChange('customer_id', value)}
                  options={customerOptions}
                  placeholder="Select customer..."
                  error={errors.customer_id}
                  required
                  disabled={isLoading || loadingCustomers}
                />
                {loadingCustomers && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Spinner size="sm" />
                    <span>Loading customers...</span>
                  </div>
                )}
              </div>

              <div>
                <Select
                  label="Property Type"
                  value={formData.property_type}
                  onChange={(value) => handleInputChange('property_type', value)}
                  options={propertyTypeOptions}
                  placeholder="Select type..."
                  disabled={isLoading}
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="Bedrooms"
                  value={formData.bedrooms?.toString() || '0'}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                  min="0"
                  max="20"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="Bathrooms"
                  value={formData.bathrooms?.toString() || '0'}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                  min="0"
                  max="10"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Access & Instructions */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Access Information</h2>
            <div className="space-y-4">
              <Textarea
                label="Access Instructions"
                value={formData.access_instructions}
                onChange={(e) => handleInputChange('access_instructions', e.target.value)}
                placeholder="How to enter the property, where to find keys, parking instructions, etc."
                rows={4}
                disabled={isLoading}
              />

              <Input
                label="Access Code / Key Location"
                value={formData.access_code}
                onChange={(e) => handleInputChange('access_code', e.target.value)}
                placeholder="e.g., Lockbox code: 1234, or Key under mat"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Section 3: Utility Locations */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Utility Locations</h2>
            <p className="text-sm text-gray-600 mb-4">
              Help cleaners locate important utilities in case of emergencies
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stop Tap Location"
                value={utilityLocations.stopTap}
                onChange={(e) => handleUtilityChange('stopTap', e.target.value)}
                placeholder="e.g., Under kitchen sink"
                disabled={isLoading}
              />

              <Input
                label="Water Meter Location"
                value={utilityLocations.waterMeter}
                onChange={(e) => handleUtilityChange('waterMeter', e.target.value)}
                placeholder="e.g., Front garden, left side"
                disabled={isLoading}
              />

              <Input
                label="Gas Meter Location"
                value={utilityLocations.gasMeter}
                onChange={(e) => handleUtilityChange('gasMeter', e.target.value)}
                placeholder="e.g., Outside front door"
                disabled={isLoading}
              />

              <Input
                label="Fuse Box Location"
                value={utilityLocations.fuseBox}
                onChange={(e) => handleUtilityChange('fuseBox', e.target.value)}
                placeholder="e.g., Hallway cupboard"
                disabled={isLoading}
              />

              <Input
                label="Boiler Location"
                value={utilityLocations.boiler}
                onChange={(e) => handleUtilityChange('boiler', e.target.value)}
                placeholder="e.g., Airing cupboard upstairs"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Section 4: Emergency Contacts */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Emergency Contacts</h2>
                <p className="text-sm text-gray-600 mt-1">
                  People to contact in case of emergencies
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={addEmergencyContact}
                disabled={isLoading}
              >
                + Add Contact
              </Button>
            </div>

            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <Input
                    label="Name"
                    value={contact.name}
                    onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                    placeholder="Contact name"
                    disabled={isLoading}
                  />

                  <Input
                    label="Phone"
                    value={contact.phone}
                    onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                    placeholder="Phone number"
                    disabled={isLoading}
                  />

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        label="Relation"
                        value={contact.relation || ''}
                        onChange={(e) => handleEmergencyContactChange(index, 'relation', e.target.value)}
                        placeholder="e.g., Owner, Manager"
                        disabled={isLoading}
                      />
                    </div>
                    {emergencyContacts.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => removeEmergencyContact(index)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Additional Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="WiFi SSID"
                  value={formData.wifi_ssid}
                  onChange={(e) => handleInputChange('wifi_ssid', e.target.value)}
                  placeholder="Network name"
                  disabled={isLoading}
                />

                <Input
                  type="password"
                  label="WiFi Password"
                  value={formData.wifi_password}
                  onChange={(e) => handleInputChange('wifi_password', e.target.value)}
                  placeholder="Network password"
                  disabled={isLoading}
                />
              </div>

              <Textarea
                label="Parking Information"
                value={formData.parking_info}
                onChange={(e) => handleInputChange('parking_info', e.target.value)}
                placeholder="Where to park, any restrictions, permits needed, etc."
                rows={3}
                disabled={isLoading}
              />

              <Textarea
                label="Pet Information"
                value={formData.pet_info}
                onChange={(e) => handleInputChange('pet_info', e.target.value)}
                placeholder="Pets on property, breeds, temperament, special handling instructions"
                rows={3}
                disabled={isLoading}
              />

              <Textarea
                label="Cleaner Notes"
                value={formData.cleaner_notes}
                onChange={(e) => handleInputChange('cleaner_notes', e.target.value)}
                placeholder="Important notes for cleaning staff"
                rows={3}
                disabled={isLoading}
              />

              <Textarea
                label="Special Requirements"
                value={formData.special_requirements}
                onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                placeholder="Any special requirements, allergies, preferences, etc."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Section 6: Photo Upload (Placeholder) */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold mb-4">Property Photos</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                📸 Photo upload functionality coming soon. You can add photos after updating the property.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Updating Property...' : 'Update Property'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Property"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-semibold">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-sm text-red-700 mt-2">
              Deleting this property will remove all associated data including cleaning history,
              guest turnover entries, and calendar events.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2">
              To confirm deletion, please type the property name:{' '}
              <strong>{property?.property_name}</strong>
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type property name to confirm"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading || deleteConfirmText !== property?.property_name}
            >
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Deleting...' : 'Delete Property'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
