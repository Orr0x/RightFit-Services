import { useState, useEffect } from 'react'
import { Button, Input, Card, Modal, Spinner, EmptyState } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { tenantsAPI, propertiesAPI, type PropertyTenant } from '../lib/api'
import './Properties.css'

export default function Tenants() {
  const [tenants, setTenants] = useState<PropertyTenant[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState<PropertyTenant | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState({ propertyId: '', name: '', email: '', phone: '', moveInDate: '', rentAmount: 0, rentFrequency: 'MONTHLY' as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' })

  useEffect(() => { loadData() }, [])

  const loadData = () => {
    withLoading(async () => {
      try {
        const [tenantsData, propsData] = await Promise.all([tenantsAPI.list(), propertiesAPI.list()])
        setTenants(tenantsData.data)
        setProperties(propsData)
      } catch (err) {
        toast.error('Failed to load tenants')
      }
    })
  }

  const handleOpenDialog = (tenant?: PropertyTenant) => {
    if (tenant) {
      setEditing(tenant)
      setFormData({ propertyId: tenant.property_id, name: tenant.name, email: tenant.email || '', phone: tenant.phone || '', moveInDate: tenant.move_in_date.split('T')[0], rentAmount: tenant.rent_amount, rentFrequency: tenant.rent_frequency })
    } else {
      setEditing(null)
      setFormData({ propertyId: '', name: '', email: '', phone: '', moveInDate: '', rentAmount: 0, rentFrequency: 'MONTHLY' })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) {
        await tenantsAPI.update(editing.id, formData)
        toast.success('Tenant updated')
      } else {
        await tenantsAPI.create(formData)
        toast.success('Tenant created')
      }
      setOpenDialog(false)
      loadData()
    } catch (err) {
      toast.error('Failed to save tenant')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tenant "${name}"?`)) return
    try {
      await tenantsAPI.delete(id)
      toast.success('Tenant deleted')
      loadData()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const activeTenants = tenants.filter(t => t.status === 'ACTIVE')
  const pastTenants = tenants.filter(t => t.status !== 'ACTIVE')
  const displayTenants = activeTab === 'active' ? activeTenants : pastTenants

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  return (
    <div className="properties-page">
      <div className="page-header">
        <div><h1 className="page-title">Tenants</h1><p className="page-subtitle">Manage your tenants</p></div>
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
          <Button variant="primary" onClick={() => handleOpenDialog()}>Add Tenant</Button>
        </div>
      </div>

      <div style={{display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid var(--color-border)'}}>
        <button onClick={() => setActiveTab('active')} style={{padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'active' ? '2px solid var(--color-primary)' : 'none', color: activeTab === 'active' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === 'active' ? 600 : 400, cursor: 'pointer', marginBottom: '-2px'}}>Active ({activeTenants.length})</button>
        <button onClick={() => setActiveTab('past')} style={{padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'past' ? '2px solid var(--color-primary)' : 'none', color: activeTab === 'past' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === 'past' ? 600 : 400, cursor: 'pointer', marginBottom: '-2px'}}>Past ({pastTenants.length})</button>
      </div>

      {displayTenants.length === 0 ? (
        <EmptyState title={`No ${activeTab} tenants`} description="Add tenants to track occupancy" primaryAction={{ label: 'Add Tenant', onClick: () => handleOpenDialog() }} />
      ) : (
        <div className={`properties-${viewMode}`}>
          {displayTenants.map((t) => (
            <Card key={t.id} variant="elevated" className="property-card">
              <div className="property-card-header">
                <div><h3 className="property-name">{t.name}</h3><p className="property-address">{t.property?.name || 'Property'}</p></div>
                {t.status === 'ACTIVE' ? <span className="property-type-badge" style={{background: '#dcfce7', color: '#15803d'}}>ACTIVE</span> : <span className="property-type-badge">PAST</span>}
              </div>
              <div className="property-details">
                {t.email && <div className="property-detail-item"><span>{t.email}</span></div>}
                {t.phone && <div className="property-detail-item"><span>{t.phone}</span></div>}
                <div className="property-detail-item"><span>£{t.rent_amount}/{t.rent_frequency.toLowerCase()}</span></div>
                <div className="property-detail-item"><span>Moved in: {new Date(t.move_in_date).toLocaleDateString()}</span></div>
              </div>
              <div className="property-actions">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(t)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id, t.name)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)} title={editing ? 'Edit Tenant' : 'Add Tenant'} size="lg">
        <div className="property-form">
          <div className="form-field"><label className="form-label">Property *</label><select className="form-select" value={formData.propertyId} onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}><option value="">Select property</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <Input label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <div className="form-row">
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <Input label="Move-in Date" type="date" required value={formData.moveInDate} onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })} />
          <div className="form-row">
            <Input label="Rent Amount" type="number" required value={formData.rentAmount.toString()} onChange={(e) => setFormData({ ...formData, rentAmount: parseFloat(e.target.value) || 0 })} />
            <div className="form-field"><label className="form-label">Frequency *</label><select className="form-select" value={formData.rentFrequency} onChange={(e) => setFormData({ ...formData, rentFrequency: e.target.value as any })}><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="QUARTERLY">Quarterly</option></select></div>
          </div>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  )
}
