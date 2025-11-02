import { useState, useEffect } from 'react'
import { Button, Input, Card, Modal, Spinner, EmptyState, useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { workersAPI, type Worker } from '../lib/api'
import '../pages/Properties.css'

const SERVICE_PROVIDER_ID = 'demo-provider-id'

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    worker_type: 'CLEANER' as 'CLEANER' | 'MAINTENANCE' | 'BOTH',
    employment_type: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR',
    hourly_rate: '',
    is_active: true,
    max_weekly_hours: '',
  })

  useEffect(() => { loadWorkers() }, [])

  const loadWorkers = () => {
    withLoading(async () => {
      try {
        const data = await workersAPI.list(SERVICE_PROVIDER_ID)
        setWorkers(data)
      } catch (err: any) {
        toast.error('Failed to load workers')
        console.error('Load workers error:', err)
      }
    })
  }

  const handleOpenDialog = (worker?: Worker) => {
    if (worker) {
      setEditingWorker(worker)
      setFormData({
        first_name: worker.first_name,
        last_name: worker.last_name,
        email: worker.email,
        phone: worker.phone,
        worker_type: worker.worker_type,
        employment_type: worker.employment_type,
        hourly_rate: worker.hourly_rate.toString(),
        is_active: worker.is_active,
        max_weekly_hours: worker.max_weekly_hours?.toString() || '',
      })
    } else {
      setEditingWorker(null)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        worker_type: 'CLEANER',
        employment_type: 'FULL_TIME',
        hourly_rate: '',
        is_active: true,
        max_weekly_hours: '',
      })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
        max_weekly_hours: formData.max_weekly_hours ? parseInt(formData.max_weekly_hours) : undefined,
        service_provider_id: SERVICE_PROVIDER_ID,
      }

      if (editingWorker) {
        await workersAPI.update(editingWorker.id, payload)
        toast.success('Worker updated')
      } else {
        await workersAPI.create(payload)
        toast.success('Worker created')
      }
      setOpenDialog(false)
      loadWorkers()
    } catch (err: any) {
      toast.error('Failed to save worker')
      console.error('Save worker error:', err)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete worker "${name}"?`)) return
    try {
      await workersAPI.delete(id, SERVICE_PROVIDER_ID)
      toast.success('Worker deleted')
      loadWorkers()
    } catch (err: any) {
      toast.error('Failed to delete worker')
      console.error('Delete worker error:', err)
    }
  }

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Workers</h1>
          <p className="page-subtitle">{workers.length} total workers</p>
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
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + Add Worker
          </Button>
        </div>
      </div>

      {workers.length === 0 ? (
        <EmptyState
          icon={<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 26a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM24 30c-10 0-14 5-14 5v3h28v-3s-4-5-14-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title="No workers yet"
          description="Add your first worker to get started"
          action={<Button variant="primary" onClick={() => handleOpenDialog()}>Add Worker</Button>}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'properties-grid' : 'properties-list'}>
          {workers.map((worker) => (
            <Card key={worker.id} className="property-card">
              <div className="property-card-content">
                <div className="property-info">
                  <h3 className="property-name">{worker.first_name} {worker.last_name}</h3>
                  <p className="property-address">{worker.email}</p>
                  <div className="property-details">
                    <span className="detail-item">{worker.worker_type}</span>
                    <span className="detail-item">{worker.employment_type.replace('_', ' ')}</span>
                    <span className="detail-item">£{worker.hourly_rate}/hr</span>
                  </div>
                  <div className="property-stats">
                    <div className="stat-item">
                      <span className="stat-value">{worker.jobs_completed}</span>
                      <span className="stat-label">Jobs</span>
                    </div>
                    {worker.average_rating && (
                      <div className="stat-item">
                        <span className="stat-value">⭐ {worker.average_rating}</span>
                        <span className="stat-label">Rating</span>
                      </div>
                    )}
                    <div className="stat-item">
                      <span className={`status-badge ${worker.is_active ? 'status-active' : 'status-inactive'}`}>
                        {worker.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="property-actions">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenDialog(worker)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(worker.id, `${worker.first_name} ${worker.last_name}`)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        title={editingWorker ? 'Edit Worker' : 'Add New Worker'}
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingWorker ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Worker Type</label>
            <select
              value={formData.worker_type}
              onChange={(e) => setFormData({ ...formData, worker_type: e.target.value as any })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
            >
              <option value="CLEANER">Cleaner</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Employment Type</label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACTOR">Contractor</option>
            </select>
          </div>
          <Input
            label="Hourly Rate (£)"
            type="number"
            step="0.01"
            value={formData.hourly_rate}
            onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
            required
          />
          <Input
            label="Max Weekly Hours (optional)"
            type="number"
            value={formData.max_weekly_hours}
            onChange={(e) => setFormData({ ...formData, max_weekly_hours: e.target.value })}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="is_active" style={{ fontSize: '14px', fontWeight: '500' }}>Active</label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
