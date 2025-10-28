import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { workOrdersAPI, propertiesAPI, contractorsAPI, photosAPI } from '../lib/api'

interface WorkOrder {
  id: string
  property_id: string
  contractor_id?: string
  title: string
  description?: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: 'PLUMBING' | 'ELECTRICAL' | 'HEATING' | 'APPLIANCES' | 'EXTERIOR' | 'INTERIOR' | 'OTHER'
  due_date?: string
  estimated_cost?: number
  actual_cost?: number
  completion_note?: string
  cancellation_reason?: string
  created_at: string
  property?: any
  contractor?: any
}

interface CreateWorkOrderData {
  property_id: string
  contractor_id?: string
  title: string
  description?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: 'PLUMBING' | 'ELECTRICAL' | 'HEATING' | 'APPLIANCES' | 'EXTERIOR' | 'INTERIOR' | 'OTHER'
  due_date?: string
  estimated_cost?: number
}

export default function WorkOrders() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [contractors, setContractors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null)
  const [statusChangeWorkOrder, setStatusChangeWorkOrder] = useState<WorkOrder | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [statusNote, setStatusNote] = useState('')
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false)
  const [photoWorkOrder, setPhotoWorkOrder] = useState<WorkOrder | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState<CreateWorkOrderData>({
    property_id: '',
    contractor_id: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'OTHER',
    due_date: '',
    estimated_cost: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [workOrdersData, propertiesData, contractorsData] = await Promise.all([
        workOrdersAPI.list(),
        propertiesAPI.list(),
        contractorsAPI.list(),
      ])
      setWorkOrders(workOrdersData)
      setProperties(propertiesData)
      setContractors(contractorsData)
      setError('')
    } catch (err: any) {
      setError('Failed to load data')
      console.error('Load data error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (workOrder?: WorkOrder) => {
    if (workOrder) {
      setEditingWorkOrder(workOrder)
      // Format datetime for datetime-local input (yyyy-MM-ddTHH:mm)
      let formattedDueDate = ''
      if (workOrder.due_date) {
        const date = new Date(workOrder.due_date)
        formattedDueDate = date.toISOString().slice(0, 16) // Get yyyy-MM-ddTHH:mm
      }
      setFormData({
        property_id: workOrder.property_id,
        contractor_id: workOrder.contractor_id || '',
        title: workOrder.title,
        description: workOrder.description || '',
        priority: workOrder.priority,
        category: workOrder.category,
        due_date: formattedDueDate,
        estimated_cost: workOrder.estimated_cost || 0,
      })
    } else {
      setEditingWorkOrder(null)
      setFormData({
        property_id: '',
        contractor_id: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'OTHER',
        due_date: '',
        estimated_cost: 0,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingWorkOrder(null)
  }

  const handleSubmit = async () => {
    try {
      // Clean up form data - remove empty strings
      const cleanedData: any = { ...formData }
      if (!cleanedData.contractor_id) {
        delete cleanedData.contractor_id
      }
      if (!cleanedData.description) {
        delete cleanedData.description
      }
      if (!cleanedData.due_date) {
        delete cleanedData.due_date
      }
      if (!cleanedData.estimated_cost || cleanedData.estimated_cost === 0) {
        delete cleanedData.estimated_cost
      }

      if (editingWorkOrder) {
        await workOrdersAPI.update(editingWorkOrder.id, cleanedData)
      } else {
        await workOrdersAPI.create(cleanedData)
      }
      handleCloseDialog()
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save work order')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work order?')) {
      return
    }

    try {
      await workOrdersAPI.delete(id)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete work order')
    }
  }

  const handleOpenStatusDialog = (workOrder: WorkOrder) => {
    setStatusChangeWorkOrder(workOrder)
    setNewStatus(workOrder.status)
    setStatusNote('')
    setOpenStatusDialog(true)
  }

  const handleStatusChange = async () => {
    if (!statusChangeWorkOrder) return

    try {
      await workOrdersAPI.updateStatus(statusChangeWorkOrder.id, newStatus, statusNote)
      setOpenStatusDialog(false)
      setStatusChangeWorkOrder(null)
      setStatusNote('')
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status')
    }
  }

  const handleOpenPhotoDialog = async (workOrder: WorkOrder) => {
    setPhotoWorkOrder(workOrder)
    setOpenPhotoDialog(true)
    setSelectedFile(null)
    setPhotoCaption('')

    // Load photos for this work order
    try {
      const photosData = await photosAPI.list({ work_order_id: workOrder.id })
      setPhotos(photosData)
    } catch (err: any) {
      console.error('Failed to load photos:', err)
      setPhotos([])
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile || !photoWorkOrder) return

    try {
      setUploadingPhoto(true)
      await photosAPI.upload(selectedFile, {
        work_order_id: photoWorkOrder.id,
        caption: photoCaption,
        label: 'DURING',
      })

      // Reload photos
      const photosData = await photosAPI.list({ work_order_id: photoWorkOrder.id })
      setPhotos(photosData)
      setSelectedFile(null)
      setPhotoCaption('')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      await photosAPI.delete(photoId)
      const photosData = await photosAPI.list({ work_order_id: photoWorkOrder!.id })
      setPhotos(photosData)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete photo')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'primary'
      case 'IN_PROGRESS':
        return 'warning'
      case 'COMPLETED':
        return 'success'
      case 'CANCELLED':
        return 'error'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error'
      case 'MEDIUM':
        return 'warning'
      case 'LOW':
        return 'info'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RightFit Services - Work Orders
          </Typography>
          {user && (
            <>
              <Button color="inherit" onClick={() => navigate('/properties')}>
                Properties
              </Button>
              <Button color="inherit" onClick={() => navigate('/contractors')}>
                Contractors
              </Button>
              <Chip label={user.tenant_name} color="secondary" sx={{ mr: 2 }} />
              <Chip
                label={user.role}
                variant="outlined"
                sx={{ mr: 2, color: 'white', borderColor: 'white' }}
              />
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.email}
              </Typography>
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Work Orders</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Work Order
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Contractor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No work orders found. Click "Create Work Order" to create your first work order.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                workOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell>{workOrder.title}</TableCell>
                    <TableCell>{workOrder.property?.name || 'N/A'}</TableCell>
                    <TableCell>{workOrder.contractor?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Chip
                        label={workOrder.status}
                        color={getStatusColor(workOrder.status) as any}
                        size="small"
                        onClick={() => handleOpenStatusDialog(workOrder)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workOrder.priority}
                        color={getPriorityColor(workOrder.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{workOrder.category}</TableCell>
                    <TableCell>
                      {workOrder.due_date
                        ? new Date(workOrder.due_date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog(workOrder)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleOpenPhotoDialog(workOrder)}>
                        <PhotoCameraIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(workOrder.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorkOrder ? 'Edit Work Order' : 'Create New Work Order'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Property</InputLabel>
            <Select
              value={formData.property_id}
              label="Property"
              onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Contractor (Optional)</InputLabel>
            <Select
              value={formData.contractor_id}
              label="Contractor (Optional)"
              onChange={(e) => setFormData({ ...formData, contractor_id: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {contractors.map((contractor) => (
                <MenuItem key={contractor.id} value={contractor.id}>
                  {contractor.name} - {contractor.trade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              <MenuItem value="PLUMBING">Plumbing</MenuItem>
              <MenuItem value="ELECTRICAL">Electrical</MenuItem>
              <MenuItem value="HEATING">Heating</MenuItem>
              <MenuItem value="APPLIANCES">Appliances</MenuItem>
              <MenuItem value="EXTERIOR">Exterior</MenuItem>
              <MenuItem value="INTERIOR">Interior</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date & Time"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Estimated Cost"
            type="number"
            fullWidth
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingWorkOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Work Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          {(newStatus === 'COMPLETED' || newStatus === 'CANCELLED') && (
            <TextField
              margin="dense"
              label={newStatus === 'COMPLETED' ? 'Completion Note' : 'Cancellation Reason'}
              fullWidth
              multiline
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={openPhotoDialog} onClose={() => setOpenPhotoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Photos for: {photoWorkOrder?.title}
        </DialogTitle>
        <DialogContent>
          {/* Upload Section */}
          <Box sx={{ mb: 3, p: 2, border: '2px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload New Photo
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload-file"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="photo-upload-file">
              <Button variant="contained" component="span" startIcon={<PhotoCameraIcon />}>
                Select Photo
              </Button>
            </label>
            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Selected: {selectedFile.name}
                </Typography>
                <TextField
                  fullWidth
                  label="Caption (Optional)"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  sx={{ mt: 1, mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  startIcon={uploadingPhoto ? <CircularProgress size={20} /> : <ImageIcon />}
                >
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </Box>
            )}
          </Box>

          {/* Photos Gallery */}
          <Typography variant="h6" gutterBottom>
            Photos ({photos.length})
          </Typography>
          {photos.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No photos uploaded yet. Upload your first photo above.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
              {photos.map((photo) => (
                <Paper key={photo.id} sx={{ p: 1 }}>
                  <Box
                    component="img"
                    src={photo.thumbnail_url}
                    alt={photo.caption || 'Work order photo'}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => window.open(photo.s3_url, '_blank')}
                  />
                  {photo.caption && (
                    <Typography variant="caption" display="block" gutterBottom>
                      {photo.caption}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block">
                    Uploaded: {new Date(photo.created_at).toLocaleDateString()}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeletePhoto(photo.id)}
                    sx={{ mt: 1 }}
                  >
                    Delete
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPhotoDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
