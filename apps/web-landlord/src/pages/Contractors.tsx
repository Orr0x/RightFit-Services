import { useState, useEffect } from 'react'
import { Button, Input, Card, Modal, Spinner, EmptyState, Checkbox } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { contractorsAPI } from '../lib/api'
import './Properties.css'

interface Contractor {
  id: string
  name: string
  trade: string
  company_name?: string
  phone: string
  email?: string
  notes?: string
  sms_opt_out: boolean
}

export default function Contractors() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState({
    name: '', trade: '', company_name: '', phone: '', email: '', notes: '', sms_opt_out: false
  })

  useEffect(() => { loadContractors() }, [])

  const loadContractors = () => {
    withLoading(async () => {
      try {
        const data = await contractorsAPI.list()
        setContractors(data)
      } catch (err: any) {
        toast.error('Failed to load contractors')
      }
    })
  }

  const handleOpenDialog = (contractor?: Contractor) => {
    if (contractor) {
      setEditingContractor(contractor)
      setFormData({ name: contractor.name, trade: contractor.trade, company_name: contractor.company_name || '', phone: contractor.phone, email: contractor.email || '', notes: contractor.notes || '', sms_opt_out: contractor.sms_opt_out })
    } else {
      setEditingContractor(null)
      setFormData({ name: '', trade: '', company_name: '', phone: '', email: '', notes: '', sms_opt_out: false })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingContractor) {
        await contractorsAPI.update(editingContractor.id, formData)
        toast.success('Contractor updated')
      } else {
        await contractorsAPI.create(formData)
        toast.success('Contractor created')
      }
      setOpenDialog(false)
      loadContractors()
    } catch (err: any) {
      toast.error('Failed to save contractor')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete contractor "${name}"?`)) return
    try {
      await contractorsAPI.delete(id)
      toast.success('Contractor deleted')
      loadContractors()
    } catch (err: any) {
      toast.error('Failed to delete contractor')
    }
  }

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  return (
    <div className="properties-page">
      <div className="page-header">
        <div><h1 className="page-title">Contractors</h1><p className="page-subtitle">Manage your contractors</p></div>
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
          <Button variant="primary" onClick={() => handleOpenDialog()}>Add Contractor</Button>
        </div>
      </div>

      {contractors.length === 0 ? (
        <EmptyState title="No contractors yet" description="Add contractors to assign to work orders" primaryAction={{ label: 'Add Contractor', onClick: () => handleOpenDialog() }} />
      ) : (
        <div className={`properties-${viewMode}`}>
          {contractors.map((c) => (
            <Card key={c.id} variant="elevated" className="property-card">
              <div className="property-card-header">
                <div><h3 className="property-name">{c.name}</h3><p className="property-address">{c.trade}</p></div>
                {c.company_name && <span className="property-type-badge">{c.company_name}</span>}
              </div>
              <div className="property-details">
                <div className="property-detail-item"><span>{c.phone}</span></div>
                {c.email && <div className="property-detail-item"><span>{c.email}</span></div>}
              </div>
              <div className="property-actions">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(c)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id, c.name)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)} title={editingContractor ? 'Edit Contractor' : 'Add Contractor'} size="lg">
        <div className="property-form">
          <Input label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Trade" required value={formData.trade} onChange={(e) => setFormData({ ...formData, trade: e.target.value })} />
          <Input label="Company Name" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
          <Input label="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <div className="form-field"><label className="form-label">Notes</label><textarea className="form-textarea" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
          <Checkbox label="Opt out of SMS notifications" checked={formData.sms_opt_out} onChange={(e) => setFormData({ ...formData, sms_opt_out: e.target.checked })} />
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editingContractor ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  )
}
