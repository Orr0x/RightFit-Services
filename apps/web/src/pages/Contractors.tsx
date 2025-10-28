import { useState, useEffect } from 'react'
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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { contractorsAPI } from '../lib/api'

interface Contractor {
  id: string
  name: string
  trade: string
  company_name?: string
  phone: string
  email?: string
  notes?: string
  sms_opt_out: boolean
  created_at: string
  work_orders?: any[]
}

interface CreateContractorData {
  name: string
  trade: string
  company_name?: string
  phone: string
  email?: string
  notes?: string
  sms_opt_out: boolean
}

export default function Contractors() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [formData, setFormData] = useState<CreateContractorData>({
    name: '',
    trade: '',
    company_name: '',
    phone: '',
    email: '',
    notes: '',
    sms_opt_out: false,
  })

  useEffect(() => {
    loadContractors()
  }, [])

  const loadContractors = async () => {
    try {
      setIsLoading(true)
      const data = await contractorsAPI.list()
      setContractors(data)
      setError('')
    } catch (err: any) {
      setError('Failed to load contractors')
      console.error('Load contractors error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (contractor?: Contractor) => {
    if (contractor) {
      setEditingContractor(contractor)
      setFormData({
        name: contractor.name,
        trade: contractor.trade,
        company_name: contractor.company_name || '',
        phone: contractor.phone,
        email: contractor.email || '',
        notes: contractor.notes || '',
        sms_opt_out: contractor.sms_opt_out,
      })
    } else {
      setEditingContractor(null)
      setFormData({
        name: '',
        trade: '',
        company_name: '',
        phone: '',
        email: '',
        notes: '',
        sms_opt_out: false,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingContractor(null)
  }

  const handleSubmit = async () => {
    try {
      // Clean up form data - remove empty strings for optional fields
      const cleanedData: any = { ...formData }
      if (!cleanedData.company_name) {
        delete cleanedData.company_name
      }
      if (!cleanedData.email) {
        delete cleanedData.email
      }
      if (!cleanedData.notes) {
        delete cleanedData.notes
      }

      if (editingContractor) {
        await contractorsAPI.update(editingContractor.id, cleanedData)
      } else {
        await contractorsAPI.create(cleanedData)
      }
      handleCloseDialog()
      loadContractors()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save contractor')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contractor?')) {
      return
    }

    try {
      await contractorsAPI.delete(id)
      loadContractors()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete contractor')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
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
            RightFit Services - Contractors
          </Typography>
          {user && (
            <>
              <Button color="inherit" onClick={() => navigate('/properties')}>
                Properties
              </Button>
              <Button color="inherit" onClick={() => navigate('/work-orders')}>
                Work Orders
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
          <Typography variant="h4">Contractors</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Contractor
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Trade</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Active Jobs</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contractors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No contractors found. Click "Add Contractor" to create your first contractor.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contractors.map((contractor) => (
                  <TableRow key={contractor.id}>
                    <TableCell>{contractor.name}</TableCell>
                    <TableCell>
                      <Chip label={contractor.trade} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{contractor.company_name || '-'}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                        {contractor.phone}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {contractor.email ? (
                        <Box display="flex" alignItems="center">
                          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                          {contractor.email}
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {contractor.work_orders?.filter((wo: any) => wo.status === 'OPEN' || wo.status === 'IN_PROGRESS').length || 0}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog(contractor)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(contractor.id)}>
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
          {editingContractor ? 'Edit Contractor' : 'Add New Contractor'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Trade"
            fullWidth
            required
            value={formData.trade}
            onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
            helperText="e.g., Plumber, Electrician, Carpenter"
          />
          <TextField
            margin="dense"
            label="Company Name (Optional)"
            fullWidth
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email (Optional)"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            helperText="Any additional information about this contractor"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sms_opt_out}
                onChange={(e) => setFormData({ ...formData, sms_opt_out: e.target.checked })}
              />
            }
            label="SMS Opt-out"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingContractor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
