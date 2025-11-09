import { useState, useEffect } from 'react'
import { Button, Card, Spinner, EmptyState, Badge, Modal, Input } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import '../pages/Properties.css'

interface InternalContractor {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  worker_type: 'MAINTENANCE' | 'BOTH'
  hourly_rate: number
  average_rating?: number
  jobs_completed?: number
  is_active: boolean
}

interface ExternalContractor {
  id: string
  company_name: string
  contact_name?: string
  email: string
  phone?: string
  specialties?: string[]
  referral_fee_percentage?: number
  average_rating?: number
  preferred_contractor?: boolean
  jobs_completed?: number
  is_active: boolean
}

export default function Contractors() {
  const { user } = useAuth()
  const [internalContractors, setInternalContractors] = useState<InternalContractor[]>([])
  const [externalContractors, setExternalContractors] = useState<ExternalContractor[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  const SERVICE_PROVIDER_ID = user?.service_provider_id
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal')
  const [showAddExternalModal, setShowAddExternalModal] = useState(false)
  const [externalFormData, setExternalFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    specialties: '',
    referral_fee_percentage: '',
    preferred_contractor: false,
  })

  useEffect(() => {
    loadContractors()
  }, [])

  const loadContractors = () => {
    withLoading(async () => {
      try {
        // Load internal contractors (workers with CONTRACTOR employment type)
        const internalResponse = await api.get('/api/workers', {
          params: {
            service_provider_id: SERVICE_PROVIDER_ID,
            worker_type: 'MAINTENANCE',
            employment_type: 'CONTRACTOR',
            is_active: true,
          },
        })
        setInternalContractors(internalResponse.data.data || [])

        // Load external contractors
        const externalResponse = await api.get('/api/external-contractors', {
          params: {
            service_provider_id: SERVICE_PROVIDER_ID,
          },
        })
        setExternalContractors(externalResponse.data.data || [])
      } catch (err: any) {
        toast.error('Failed to load contractors')
        console.error('Load contractors error:', err)
      }
    })
  }

  const handleAddExternal = async () => {
    try {
      const payload = {
        ...externalFormData,
        referral_fee_percentage: externalFormData.referral_fee_percentage ? parseFloat(externalFormData.referral_fee_percentage) : undefined,
        specialties: externalFormData.specialties ? externalFormData.specialties.split(',').map(s => s.trim()) : [],
        service_provider_id: SERVICE_PROVIDER_ID,
        is_active: true,
      }

      await api.post('/api/external-contractors', payload)
      toast.success('External contractor added')
      setShowAddExternalModal(false)
      setExternalFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        specialties: '',
        referral_fee_percentage: '',
        preferred_contractor: false,
      })
      loadContractors()
    } catch (err: any) {
      toast.error('Failed to add contractor')
      console.error('Add contractor error:', err)
    }
  }

  const handleTogglePreferred = async (contractorId: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/external-contractors/${contractorId}`, {
        preferred_contractor: !currentStatus,
        service_provider_id: SERVICE_PROVIDER_ID,
      })
      toast.success(currentStatus ? 'Removed from preferred' : 'Added to preferred')
      loadContractors()
    } catch (err: any) {
      toast.error('Failed to update contractor')
      console.error('Update contractor error:', err)
    }
  }

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  const totalContractors = internalContractors.length + externalContractors.length

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Contractors</h1>
          <p className="page-subtitle">{totalContractors} total contractors</p>
        </div>
        <div className="page-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="2" width="7" height="7" rx="1" />
                <rect x="11" y="2" width="7" height="7" rx="1" />
                <rect x="2" y="11" width="7" height="7" rx="1" />
                <rect x="11" y="11" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="3" width="16" height="2" rx="1" />
                <rect x="2" y="9" width="16" height="2" rx="1" />
                <rect x="2" y="15" width="16" height="2" rx="1" />
              </svg>
            </button>
          </div>
          {activeTab === 'external' && (
            <Button variant="primary" onClick={() => setShowAddExternalModal(true)}>
              + Add External Contractor
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('internal')}
            style={{
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'internal' ? '#2563eb' : '#6b7280',
              borderBottom: activeTab === 'internal' ? '2px solid #2563eb' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Internal Contractors ({internalContractors.length})
          </button>
          <button
            onClick={() => setActiveTab('external')}
            style={{
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'external' ? '#2563eb' : '#6b7280',
              borderBottom: activeTab === 'external' ? '2px solid #2563eb' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            External Contractors ({externalContractors.length})
          </button>
        </div>
      </div>

      {/* Internal Contractors Tab */}
      {activeTab === 'internal' && (
        <>
          {internalContractors.length === 0 ? (
            <EmptyState
              icon={<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 26a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM24 30c-10 0-14 5-14 5v3h28v-3s-4-5-14-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              title="No internal contractors yet"
              description="Add maintenance contractors in the Workers page with employment type 'Contractor'"
              action={<Button variant="primary" onClick={() => window.location.href = '/workers'}>Go to Workers</Button>}
            />
          ) : (
            <div className={viewMode === 'grid' ? 'properties-grid' : 'properties-list'}>
              {internalContractors.map((contractor) => (
                <Card key={contractor.id} className="property-card">
                  <div className="property-card-content">
                    <div className="property-info">
                      <h3 className="property-name">
                        {contractor.first_name} {contractor.last_name}
                      </h3>
                      <p className="property-address">{contractor.email}</p>
                      <div className="property-details">
                        <span className="detail-item">{contractor.phone}</span>
                        <span className="detail-item">£{contractor.hourly_rate}/hr</span>
                        <span className="detail-item">{contractor.worker_type}</span>
                      </div>
                      <div className="property-stats">
                        <div className="stat-item">
                          <span className="stat-value">{contractor.jobs_completed || 0}</span>
                          <span className="stat-label">Jobs</span>
                        </div>
                        {contractor.average_rating && (
                          <div className="stat-item">
                            <span className="stat-value">⭐ {contractor.average_rating.toFixed(1)}</span>
                            <span className="stat-label">Rating</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* External Contractors Tab */}
      {activeTab === 'external' && (
        <>
          {externalContractors.length === 0 ? (
            <EmptyState
              icon={<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M8 16h32M8 24h32M8 32h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
              title="No external contractors yet"
              description="Add external contractors to expand your workforce"
              action={
                <Button variant="primary" onClick={() => setShowAddExternalModal(true)}>
                  Add External Contractor
                </Button>
              }
            />
          ) : (
            <div className={viewMode === 'grid' ? 'properties-grid' : 'properties-list'}>
              {externalContractors.map((contractor) => (
                <Card key={contractor.id} className="property-card">
                  <div className="property-card-content">
                    <div className="property-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 className="property-name">{contractor.company_name}</h3>
                        {contractor.preferred_contractor && (
                          <Badge variant="success">⭐ Preferred</Badge>
                        )}
                      </div>
                      {contractor.contact_name && (
                        <p className="property-address">Contact: {contractor.contact_name}</p>
                      )}
                      <div className="property-details">
                        <span className="detail-item">{contractor.email}</span>
                        {contractor.phone && <span className="detail-item">{contractor.phone}</span>}
                        {contractor.referral_fee_percentage && <span className="detail-item">{contractor.referral_fee_percentage}% referral fee</span>}
                      </div>
                      {contractor.specialties && contractor.specialties.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {contractor.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="default">{specialty}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="property-stats">
                        <div className="stat-item">
                          <span className="stat-value">{contractor.jobs_completed || 0}</span>
                          <span className="stat-label">Jobs</span>
                        </div>
                        {contractor.average_rating && (
                          <div className="stat-item">
                            <span className="stat-value">⭐ {contractor.average_rating.toFixed(1)}</span>
                            <span className="stat-label">Rating</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="property-actions">
                      <Button
                        variant={contractor.preferred_contractor ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleTogglePreferred(contractor.id, contractor.preferred_contractor || false)}
                      >
                        {contractor.preferred_contractor ? '⭐ Preferred' : 'Mark Preferred'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add External Contractor Modal */}
      <Modal
        isOpen={showAddExternalModal}
        onClose={() => setShowAddExternalModal(false)}
        title="Add External Contractor"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowAddExternalModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddExternal}>Add Contractor</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Company Name"
            value={externalFormData.company_name}
            onChange={(e) => setExternalFormData({ ...externalFormData, company_name: e.target.value })}
            required
          />
          <Input
            label="Contact Name"
            value={externalFormData.contact_name}
            onChange={(e) => setExternalFormData({ ...externalFormData, contact_name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={externalFormData.email}
            onChange={(e) => setExternalFormData({ ...externalFormData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={externalFormData.phone}
            onChange={(e) => setExternalFormData({ ...externalFormData, phone: e.target.value })}
          />
          <Input
            label="Specialties (comma-separated)"
            value={externalFormData.specialties}
            onChange={(e) => setExternalFormData({ ...externalFormData, specialties: e.target.value })}
            placeholder="Plumbing, Electrical, HVAC"
          />
          <Input
            label="Referral Fee (%)"
            type="number"
            step="0.01"
            value={externalFormData.referral_fee_percentage}
            onChange={(e) => setExternalFormData({ ...externalFormData, referral_fee_percentage: e.target.value })}
            placeholder="15"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="preferred"
              checked={externalFormData.preferred_contractor}
              onChange={(e) => setExternalFormData({ ...externalFormData, preferred_contractor: e.target.checked })}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="preferred" style={{ fontSize: '14px', fontWeight: '500' }}>Preferred Contractor</label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
