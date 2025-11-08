import { useState, useEffect } from 'react'
import { Button, Input, Card, Modal, Spinner, EmptyState } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { certificatesAPI, propertiesAPI } from '../lib/api'
import './Properties.css'

interface Certificate { id: string; property_id: string; certificate_type: string; issue_date: string; expiry_date: string; certificate_number?: string; issuer?: string; notes?: string; property?: any }

const CERT_TYPES = ['GAS_SAFETY', 'ELECTRICAL', 'EPC', 'FIRE_SAFETY', 'LEGIONELLA', 'PAT_TESTING', 'OTHER']

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState({ property_id: '', certificate_type: 'GAS_SAFETY', issue_date: '', expiry_date: '', certificate_number: '', issuer: '', notes: '' })

  useEffect(() => { loadData() }, [])

  const loadData = () => {
    withLoading(async () => {
      try {
        const [certs, props] = await Promise.all([certificatesAPI.list(), propertiesAPI.list()])
        setCertificates(certs)
        setProperties(props)
      } catch (err) {
        toast.error('Failed to load certificates')
      }
    })
  }

  const handleOpenDialog = (cert?: Certificate) => {
    if (cert) {
      setEditing(cert)
      setFormData({ property_id: cert.property_id, certificate_type: cert.certificate_type, issue_date: cert.issue_date.split('T')[0], expiry_date: cert.expiry_date.split('T')[0], certificate_number: cert.certificate_number || '', issuer: cert.issuer || '', notes: cert.notes || '' })
    } else {
      setEditing(null)
      setFormData({ property_id: '', certificate_type: 'GAS_SAFETY', issue_date: '', expiry_date: '', certificate_number: '', issuer: '', notes: '' })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) {
        await certificatesAPI.update(editing.id, formData)
        toast.success('Certificate updated')
      } else {
        const file = new File([], 'dummy.pdf')
        await certificatesAPI.upload(file, formData)
        toast.success('Certificate created')
      }
      setOpenDialog(false)
      loadData()
    } catch (err: any) {
      toast.error('Failed to save certificate')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete certificate?')) return
    try {
      await certificatesAPI.delete(id)
      toast.success('Certificate deleted')
      loadData()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const isExpiringSoon = (date: string) => {
    const days = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return days < 30 && days > 0
  }

  const isExpired = (date: string) => new Date(date) < new Date()

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  return (
    <div className="properties-page">
      <div className="page-header">
        <div><h1 className="page-title">Certificates</h1><p className="page-subtitle">Track property certificates and expiry dates</p></div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
            <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>Add Certificate</Button>
        </div>
      </div>

      {certificates.length === 0 ? (
        <EmptyState title="No certificates" description="Add certificates to track compliance" primaryAction={{ label: 'Add Certificate', onClick: () => handleOpenDialog() }} />
      ) : (
        <div className={`properties-${viewMode}`}>
          {certificates.map((c) => (
            <Card key={c.id} variant="elevated" className="property-card">
              <div className="property-card-header">
                <div><h3 className="property-name">{c.certificate_type.replace('_', ' ')}</h3><p className="property-address">{c.property?.name || 'Unknown Property'}</p></div>
                {isExpired(c.expiry_date) ? <span style={{background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '12px', fontSize: '12px'}}>EXPIRED</span> : isExpiringSoon(c.expiry_date) ? <span style={{background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '12px', fontSize: '12px'}}>EXPIRING SOON</span> : <span className="property-type-badge">VALID</span>}
              </div>
              <div className="property-details">
                <div className="property-detail-item"><span>Expires: {new Date(c.expiry_date).toLocaleDateString()}</span></div>
                {c.issuer && <div className="property-detail-item"><span>Issuer: {c.issuer}</span></div>}
              </div>
              <div className="property-actions">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(c)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)} title={editing ? 'Edit Certificate' : 'Add Certificate'} size="lg">
        <div className="property-form">
          <div className="form-field"><label className="form-label">Property *</label><select className="form-select" value={formData.property_id} onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}><option value="">Select property</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-field"><label className="form-label">Type *</label><select className="form-select" value={formData.certificate_type} onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}>{CERT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
          <div className="form-row">
            <Input label="Issue Date" type="date" required value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} />
            <Input label="Expiry Date" type="date" required value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
          </div>
          <Input label="Certificate Number" value={formData.certificate_number} onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })} />
          <Input label="Issuer" value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} />
          <div className="form-field"><label className="form-label">Notes</label><textarea className="form-textarea" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  )
}
