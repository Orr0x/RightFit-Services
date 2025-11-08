import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Spinner, EmptyState, Button } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { customerPortalAPI, type CustomerProperty } from '../lib/api'
import './Properties.css'

export default function Properties() {
  const [customerProperties, setCustomerProperties] = useState<CustomerProperty[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()

  const handleCopyGuestLink = (propertyId: string, propertyName: string) => {
    // Guest tablet runs on port 5177
    const guestTabletUrl = `http://localhost:5177/?property=${propertyId}`

    navigator.clipboard.writeText(guestTabletUrl).then(() => {
      toast.success(`Guest tablet link copied for ${propertyName}!`)
    }).catch(() => {
      toast.error('Failed to copy link')
    })
  }

  useEffect(() => {
    loadCustomerProperties()
  }, [])

  const loadCustomerProperties = () => {
    withLoading(async () => {
      try {
        // Get customer_id from localStorage (set by AuthContext on login)
        const customerData = localStorage.getItem('customer')
        if (!customerData) {
          toast.error('Please log in to view your properties')
          return
        }

        const customer = JSON.parse(customerData)
        const result = await customerPortalAPI.getProperties(customer.id)
        setCustomerProperties(result.data)
      } catch (err: any) {
        toast.error('Failed to load properties')
        console.error('Load customer properties error:', err)
      }
    })
  }


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
          <h1 className="page-title">My Properties</h1>
          <p className="page-subtitle">Properties you're associated with</p>
        </div>
      </div>

      {customerProperties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="You don't have any properties assigned to you yet"
        />
      ) : (
        <div className="properties-grid">
          {customerProperties.map((customerProp) => (
            <Card
              key={customerProp.id}
              variant="elevated"
              className="property-card"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = ''
              }}
              onClick={() => navigate(`/properties/${customerProp.id}`)}
            >
              <div className="property-card-header">
                <div>
                  <h3 className="property-name">{customerProp.property_name}</h3>
                  <p className="property-address">{customerProp.address}</p>
                </div>
                <span className="property-type-badge">{customerProp.property_type}</span>
              </div>

              <div className="property-details">
                <div className="property-detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 6l6-4 6 4v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>{customerProp.bedrooms} bed</span>
                </div>
                <div className="property-detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 10h-1V6a1 1 0 0 0-1-1h-1V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1H4a1 1 0 0 0-1 1v4H2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>{customerProp.bathrooms} bath</span>
                </div>
                <div className="property-detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14l-4-4h2.5V2h3v8H12l-4 4z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>{customerProp.postcode}</span>
                </div>
              </div>

              <div className="property-info">
                <p className="text-sm text-gray-600">
                  Created: {new Date(customerProp.created_at).toLocaleDateString()}
                </p>
                {customerProp.access_instructions && (
                  <p className="text-sm text-gray-500 mt-2">{customerProp.access_instructions}</p>
                )}
              </div>

              <div className="property-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent card click
                    handleCopyGuestLink(customerProp.id, customerProp.property_name)
                  }}
                  style={{ width: '100%' }}
                >
                  📱 Copy Guest Tablet Link
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
