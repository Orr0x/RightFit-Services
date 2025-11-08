import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spinner, Button } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { customerPortalAPI, type CustomerProperty } from '../lib/api'
import './Properties.css'

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<CustomerProperty | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    loadPropertyDetails()
  }, [id])

  const loadPropertyDetails = async () => {
    try {
      setIsLoading(true)
      const customerData = localStorage.getItem('customer')
      if (!customerData) {
        toast.error('Please log in to view property details')
        navigate('/login')
        return
      }

      const customer = JSON.parse(customerData)
      const result = await customerPortalAPI.getProperties(customer.id)

      // Find the specific property
      const foundProperty = result.data.find((p: CustomerProperty) => p.id === id)

      if (!foundProperty) {
        toast.error('Property not found')
        navigate('/properties')
        return
      }

      setProperty(foundProperty)
    } catch (err: any) {
      toast.error('Failed to load property details')
      console.error('Load property details error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyGuestLink = () => {
    if (!property) return

    const guestTabletUrl = `http://localhost:5177/?property=${property.id}`
    navigator.clipboard.writeText(guestTabletUrl).then(() => {
      toast.success(`Guest tablet link copied for ${property.property_name}!`)
    }).catch(() => {
      toast.error('Failed to copy link')
    })
  }

  if (isLoading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Property not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/properties')}>
          ← Back to Properties
        </Button>
      </div>

      <Card variant="elevated">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.property_name}</h1>
              <p className="text-gray-600 text-lg">{property.address}</p>
              <p className="text-gray-500">{property.postcode}</p>
            </div>
            <span className="property-type-badge text-lg px-4 py-2">
              {property.property_type}
            </span>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Property Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-gray-600">
                    <path d="M2 6l6-4 6 4v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span><strong>Bedrooms:</strong> {property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-gray-600">
                    <path d="M14 10h-1V6a1 1 0 0 0-1-1h-1V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1H4a1 1 0 0 0-1 1v4H2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span><strong>Bathrooms:</strong> {property.bathrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-gray-600">
                    <path d="M2 2h12v12H2z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span><strong>Property Type:</strong> {property.property_type}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Additional Details</h3>
              <div className="space-y-2">
                <p>
                  <strong>Created:</strong>{' '}
                  {new Date(property.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {property.updated_at && (
                  <p>
                    <strong>Last Updated:</strong>{' '}
                    {new Date(property.updated_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Access Instructions */}
          {property.access_instructions && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Access Instructions</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700">{property.access_instructions}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">Actions</h3>
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleCopyGuestLink}>
                📱 Copy Guest Tablet Link
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/properties`)}>
                View All Properties
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Maintenance History Section - Future Enhancement */}
      <Card variant="elevated" className="mt-6">
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-3">Maintenance History</h3>
          <p className="text-gray-500">Maintenance history for this property will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
