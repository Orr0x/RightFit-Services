import { useState, useEffect } from 'react'
import { Button, Input, Card, Modal, Spinner, EmptyState, Textarea, useToast, Tabs, TabPanel, type Tab } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { propertiesAPI, customerPropertiesAPI, type Property, type CreatePropertyData, type CustomerProperty } from '../lib/api'
import './Properties.css'

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'House' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'COTTAGE', label: 'Cottage' },
  { value: 'COMMERCIAL', label: 'Commercial' },
]

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [customerProperties, setCustomerProperties] = useState<CustomerProperty[]>([])
  const [activeTab, setActiveTab] = useState('our-properties')
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState<CreatePropertyData>({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: '',
    property_type: 'HOUSE',
    bedrooms: 0,
    bathrooms: 0,
    access_instructions: '',
  })

  useEffect(() => {
    loadProperties()
    loadCustomerProperties()
  }, [])

  const loadProperties = () => {
    withLoading(async () => {
      try {
        const data = await propertiesAPI.list()
        setProperties(data)
      } catch (err: any) {
        toast.error('Failed to load properties')
        console.error('Load properties error:', err)
      }
    })
  }

  const loadCustomerProperties = async () => {
    try {
      const result = await customerPropertiesAPI.list()
      setCustomerProperties(result.data)
    } catch (err: any) {
      toast.error('Failed to load customer properties')
      console.error('Load customer properties error:', err)
    }
  }

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property)
      setFormData({
        name: property.name,
        address_line1: property.address_line1,
        address_line2: property.address_line2 || '',
        city: property.city,
        postcode: property.postcode,
        property_type: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        access_instructions: property.access_instructions || '',
      })
    } else {
      setEditingProperty(null)
      setFormData({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postcode: '',
        property_type: 'HOUSE',
        bedrooms: 0,
        bathrooms: 0,
        access_instructions: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProperty(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingProperty) {
        await propertiesAPI.update(editingProperty.id, formData)
        toast.success('Property updated successfully')
      } else {
        await propertiesAPI.create(formData)
        toast.success('Property created successfully')
      }
      handleCloseDialog()
      loadProperties()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save property')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      await propertiesAPI.delete(id)
      toast.success('Property deleted successfully')
      loadProperties()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete property')
    }
  }

  const tabs: Tab[] = [
    {
      id: 'our-properties',
      label: 'Our Properties',
      count: properties.length,
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 7l7-5 7 5v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      ),
    },
    {
      id: 'customer-properties',
      label: 'Customer Properties',
      count: customerProperties.length,
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M14 15a3 3 0 0 0-6 0m6 0a3 3 0 0 1-6 0m6 0h2m-8 0H4m7-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      ),
    },
    {
      id: 'shared-properties',
      label: 'Shared Properties',
      count: 0,
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M13 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM13 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6.5 8.5l5 2M6.5 9.5l5-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="properties-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">Manage your property portfolio</p>
        </div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {activeTab === 'our-properties' && (
            <Button
              variant="primary"
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
              onClick={() => handleOpenDialog()}
            >
              Add Property
            </Button>
          )}
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="our-properties" onChange={setActiveTab} />

      <TabPanel tabId="our-properties" activeTab={activeTab}>
        {properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Get started by adding your first property to your portfolio"
          primaryAction={{
            label: 'Add Property',
            onClick: () => handleOpenDialog(),
            icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ),
          }}
        />
      ) : (
        <div className={`properties-${viewMode}`}>
          {properties.map((property) => (
            <Card key={property.id} variant="elevated" className="property-card">
              <div className="property-card-header">
                <div>
                  <h3 className="property-name">{property.name}</h3>
                  <p className="property-address">{property.address_line1}, {property.city}</p>
                </div>
                <span className="property-type-badge">{property.property_type}</span>
              </div>

              <div className="property-details">
                <div className="property-detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 6l6-4 6 4v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className="property-detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 10h-1V6a1 1 0 0 0-1-1h-1V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1H4a1 1 0 0 0-1 1v4H2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>{property.bathrooms} bath</span>
                </div>
                <div className="property-detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14l-4-4h2.5V2h3v8H12l-4 4z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>{property.postcode}</span>
                </div>
              </div>

              <div className="property-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M11.5 2L14 4.5l-8.5 8.5H3v-2.5L11.5 2z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  }
                  onClick={() => handleOpenDialog(property)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4h12M5.5 4V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M13 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  }
                  onClick={() => handleDelete(property.id, property.name)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      </TabPanel>

      <TabPanel tabId="customer-properties" activeTab={activeTab}>
        {customerProperties.length === 0 ? (
          <EmptyState
            title="No customer properties yet"
            description="Customer properties will appear here once your customers add them"
          />
        ) : (
          <div className={`properties-${viewMode}`}>
            {customerProperties.map((property) => (
              <Card key={property.id} variant="elevated" className="property-card">
                <div className="property-card-header">
                  <div>
                    <h3 className="property-name">{property.property_name}</h3>
                    <p className="property-address">{property.address}</p>
                    {property.customer && (
                      <p className="property-customer">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', marginRight: '4px' }}>
                          <path d="M12 13a3 3 0 0 0-6 0m6 0a3 3 0 0 1-6 0m6 0h1.5m-7.5 0H4.5m5-9a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                        {property.customer.business_name}
                      </p>
                    )}
                  </div>
                  <span className="property-type-badge">{property.property_type}</span>
                </div>

                <div className="property-details">
                  <div className="property-detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 6l6-4 6 4v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span>{property.bedrooms} bed</span>
                  </div>
                  <div className="property-detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 10h-1V6a1 1 0 0 0-1-1h-1V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1H4a1 1 0 0 0-1 1v4H2" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span>{property.bathrooms} bath</span>
                  </div>
                  <div className="property-detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 14l-4-4h2.5V2h3v8H12l-4 4z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span>{property.postcode}</span>
                  </div>
                </div>

                {property._count && (
                  <div className="property-stats">
                    <div className="property-stat">
                      <span className="property-stat-value">{property._count.cleaning_jobs}</span>
                      <span className="property-stat-label">Cleaning Jobs</span>
                    </div>
                    <div className="property-stat">
                      <span className="property-stat-value">{property._count.maintenance_jobs}</span>
                      <span className="property-stat-label">Maintenance Jobs</span>
                    </div>
                    {property._count.guest_issue_reports > 0 && (
                      <div className="property-stat">
                        <span className="property-stat-value">{property._count.guest_issue_reports}</span>
                        <span className="property-stat-label">Guest Reports</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </TabPanel>

      <TabPanel tabId="shared-properties" activeTab={activeTab}>
        <EmptyState
          title="No shared properties yet"
          description="Properties shared with you by other users will appear here"
        />
      </TabPanel>

      <Modal
        isOpen={openDialog}
        onClose={handleCloseDialog}
        title={editingProperty ? 'Edit Property' : 'Add New Property'}
        size="lg"
      >
        <div className="property-form">
          <Input
            label="Property Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 123 Main Street Apartment"
            helperText="A descriptive name to identify this property"
          />

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Property Type <span className="required">*</span></label>
              <select
                className="form-select"
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value as any })}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Address Line 1"
            required
            value={formData.address_line1}
            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
            placeholder="Street address"
          />

          <Input
            label="Address Line 2"
            value={formData.address_line2}
            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
            placeholder="Apartment, suite, etc. (optional)"
          />

          <div className="form-row">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
            />
            <Input
              label="Postcode"
              required
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              placeholder="SW1A 1AA"
              helperText="UK postcode format (e.g., SW1A 1AA)"
            />
          </div>

          <div className="form-row">
            <Input
              label="Bedrooms"
              type="number"
              required
              value={formData.bedrooms.toString()}
              onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Bathrooms"
              type="number"
              required
              value={formData.bathrooms.toString()}
              onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
            />
          </div>

          <Textarea
            label="Access Instructions"
            rows={3}
            value={formData.access_instructions}
            onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
            placeholder="Gate codes, parking info, etc."
            helperText="Include gate codes, parking info, or special entry instructions"
            maxLength={500}
            showCount
          />
        </div>

        <div className="modal-actions">
          <Button variant="ghost" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingProperty ? 'Update Property' : 'Create Property'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
