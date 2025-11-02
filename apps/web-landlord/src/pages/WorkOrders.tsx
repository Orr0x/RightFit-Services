import { useState, useEffect } from 'react'
import { Button, Input, Card, Modal, Spinner, EmptyState, useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { workOrdersAPI, propertiesAPI, contractorsAPI, photosAPI } from '../lib/api'
import './Properties.css'

interface WorkOrder { id: string; property_id: string; contractor_id?: string; title: string; description?: string; status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; priority: 'HIGH' | 'MEDIUM' | 'LOW'; category: string; due_date?: string; estimated_cost?: number; actual_cost?: number; property?: any; contractor?: any }

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const CATEGORIES = ['PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'EXTERIOR', 'INTERIOR', 'OTHER']

const statusColors: any = { OPEN: '#3b82f6', IN_PROGRESS: '#f59e0b', COMPLETED: '#22c55e', CANCELLED: '#ef4444' }
const priorityColors: any = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#3b82f6' }

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [contractors, setContractors] = useState<any[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false)
  const [editing, setEditing] = useState<WorkOrder | null>(null)
  const [statusChangeWO, setStatusChangeWO] = useState<WorkOrder | null>(null)
  const [photoWO, setPhotoWO] = useState<WorkOrder | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState({ property_id: '', contractor_id: '', title: '', description: '', priority: 'MEDIUM', category: 'OTHER', due_date: '', estimated_cost: 0 })
  const [statusNote, setStatusNote] = useState('')
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = () => {
    withLoading(async () => {
      try {
        const [wos, props, cons] = await Promise.all([workOrdersAPI.list(), propertiesAPI.list(), contractorsAPI.list()])
        setWorkOrders(wos)
        setProperties(props)
        setContractors(cons)
      } catch (err) {
        toast.error('Failed to load data')
      }
    })
  }

  const handleOpenDialog = (wo?: WorkOrder) => {
    if (wo) {
      setEditing(wo)
      setFormData({ property_id: wo.property_id, contractor_id: wo.contractor_id || '', title: wo.title, description: wo.description || '', priority: wo.priority, category: wo.category, due_date: wo.due_date ? new Date(wo.due_date).toISOString().slice(0, 16) : '', estimated_cost: wo.estimated_cost || 0 })
    } else {
      setEditing(null)
      setFormData({ property_id: '', contractor_id: '', title: '', description: '', priority: 'MEDIUM', category: 'OTHER', due_date: '', estimated_cost: 0 })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      const data: any = { ...formData }
      if (!data.contractor_id) delete data.contractor_id
      if (!data.description) delete data.description
      if (!data.due_date) delete data.due_date
      if (!data.estimated_cost || data.estimated_cost === 0) delete data.estimated_cost
      
      if (editing) {
        await workOrdersAPI.update(editing.id, data)
        toast.success('Work order updated')
      } else {
        await workOrdersAPI.create(data)
        toast.success('Work order created')
      }
      setOpenDialog(false)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete work order?')) return
    try {
      await workOrdersAPI.delete(id)
      toast.success('Work order deleted')
      loadData()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleOpenStatusDialog = (wo: WorkOrder) => {
    setStatusChangeWO(wo)
    setNewStatus(wo.status)
    setStatusNote('')
    setOpenStatusDialog(true)
  }

  const handleStatusChange = async () => {
    if (!statusChangeWO) return
    try {
      await workOrdersAPI.updateStatus(statusChangeWO.id, newStatus, statusNote)
      toast.success('Status updated')
      setOpenStatusDialog(false)
      loadData()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleOpenPhotoDialog = async (wo: WorkOrder) => {
    setPhotoWO(wo)
    setOpenPhotoDialog(true)
    setSelectedFile(null)
    try {
      const photosData = await photosAPI.list({ work_order_id: wo.id })
      setPhotos(photosData)
    } catch (err) {
      setPhotos([])
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile || !photoWO) return
    try {
      await photosAPI.upload(selectedFile, { work_order_id: photoWO.id, label: 'DURING' })
      toast.success('Photo uploaded')
      const photosData = await photosAPI.list({ work_order_id: photoWO.id })
      setPhotos(photosData)
      setSelectedFile(null)
    } catch (err) {
      toast.error('Failed to upload')
    }
  }

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  return (
    <div className="properties-page">
      <div className="page-header">
        <div><h1 className="page-title">Work Orders</h1><p className="page-subtitle">Manage maintenance and repairs</p></div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
            <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>Create Work Order</Button>
        </div>
      </div>

      {workOrders.length === 0 ? (
        <EmptyState title="No work orders" description="Create work orders to track maintenance" primaryAction={{ label: 'Create Work Order', onClick: () => handleOpenDialog() }} />
      ) : (
        <div className={`properties-${viewMode}`}>
          {workOrders.map((wo) => (
            <Card key={wo.id} variant="elevated" className="property-card">
              <div className="property-card-header">
                <div><h3 className="property-name">{wo.title}</h3><p className="property-address">{wo.property?.name || 'N/A'}</p></div>
                <span style={{background: statusColors[wo.status] + '20', color: statusColors[wo.status], padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'}} onClick={() => handleOpenStatusDialog(wo)}>{wo.status.replace('_', ' ')}</span>
              </div>
              <div className="property-details">
                <div className="property-detail-item"><span style={{background: priorityColors[wo.priority] + '20', color: priorityColors[wo.priority], padding: '2px 8px', borderRadius: '8px', fontSize: '12px'}}>{wo.priority}</span></div>
                <div className="property-detail-item"><span>{wo.category}</span></div>
                {wo.contractor && <div className="property-detail-item"><span>{wo.contractor.name}</span></div>}
                {wo.due_date && <div className="property-detail-item"><span>Due: {new Date(wo.due_date).toLocaleDateString()}</span></div>}
              </div>
              <div className="property-actions">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(wo)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleOpenPhotoDialog(wo)}>Photos</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(wo.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)} title={editing ? 'Edit Work Order' : 'Create Work Order'} size="lg">
        <div className="property-form">
          <Input label="Title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <div className="form-field"><label className="form-label">Property *</label><select className="form-select" value={formData.property_id} onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}><option value="">Select property</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-field"><label className="form-label">Contractor</label><select className="form-select" value={formData.contractor_id} onChange={(e) => setFormData({ ...formData, contractor_id: e.target.value })}><option value="">None</option>{contractors.map(c => <option key={c.id} value={c.id}>{c.name} - {c.trade}</option>)}</select></div>
          <div className="form-field"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field"><label className="form-label">Priority *</label><select className="form-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Category *</label><select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-row">
            <Input label="Due Date & Time" type="datetime-local" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
            <Input label="Estimated Cost" type="number" value={formData.estimated_cost.toString()} onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <Modal isOpen={openStatusDialog} onClose={() => setOpenStatusDialog(false)} title="Update Status">
        <div className="property-form">
          <div className="form-field"><label className="form-label">Status *</label><select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
          {(newStatus === 'COMPLETED' || newStatus === 'CANCELLED') && <div className="form-field"><label className="form-label">{newStatus === 'COMPLETED' ? 'Completion Note' : 'Cancellation Reason'}</label><textarea className="form-textarea" rows={3} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} /></div>}
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleStatusChange}>Update Status</Button>
        </div>
      </Modal>

      <Modal isOpen={openPhotoDialog} onClose={() => setOpenPhotoDialog(false)} title={`Photos for: ${photoWO?.title}`} size="lg">
        <div className="property-form">
          <div style={{padding: '16px', border: '2px dashed var(--color-border)', borderRadius: '8px', marginBottom: '24px'}}>
            <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '12px'}}>Upload Photo</h3>
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{marginBottom: '12px'}} />
            {selectedFile && <Button variant="primary" onClick={handlePhotoUpload}>Upload Photo</Button>}
          </div>
          <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '12px'}}>Photos ({photos.length})</h3>
          {photos.length === 0 ? <p style={{textAlign: 'center', color: 'var(--color-text-secondary)', padding: '24px'}}>No photos uploaded</p> : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px'}}>
              {photos.map((p) => <img key={p.id} src={p.thumbnail_url} alt={p.caption} style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer'}} onClick={() => window.open(p.s3_url, '_blank')} />)}
            </div>
          )}
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setOpenPhotoDialog(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}
