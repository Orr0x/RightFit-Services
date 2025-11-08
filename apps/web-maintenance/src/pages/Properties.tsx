import { useState, useEffect } from 'react'
import { Card, Spinner, EmptyState } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { customerPropertiesAPI, type CustomerProperty } from '../lib/api'
import './Properties.css'

export default function Properties() {
  const [customerProperties, setCustomerProperties] = useState<CustomerProperty[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadCustomerProperties()
  }, [])

  const loadCustomerProperties = () => {
    withLoading(async () => {
      try {
        const result = await customerPropertiesAPI.list()
        setCustomerProperties(result.data)
      } catch (err: any) {
        toast.error('Failed to load customer properties')
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
          <h1 className="page-title">Customer Properties</h1>
          <p className="page-subtitle">Properties assigned to you by your customers</p>
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
        </div>
      </div>
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
    </div>
  )
}
