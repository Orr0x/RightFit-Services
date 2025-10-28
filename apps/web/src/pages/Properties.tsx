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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { propertiesAPI } from '../lib/api'

interface Property {
  id: string
  name: string
  address_line1: string
  address_line2?: string
  city: string
  postcode: string
  property_type: 'HOUSE' | 'FLAT' | 'COTTAGE' | 'COMMERCIAL'
  bedrooms: number
  bathrooms: number
  access_instructions?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

interface CreatePropertyData {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  postcode: string
  property_type: 'HOUSE' | 'FLAT' | 'COTTAGE' | 'COMMERCIAL'
  bedrooms: number
  bathrooms: number
  access_instructions?: string
}

export default function Properties() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState<CreatePropertyData>({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: '',
    property_type: 'HOUSE',
    bedrooms: 0,
    bathrooms: 0,
    access_instructions: '',
  })

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      setIsLoading(true)
      const data = await propertiesAPI.list()
      setProperties(data)
      setError('')
    } catch (err: any) {
      setError('Failed to load properties')
      console.error('Load properties error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property)
      setFormData({
        name: property.name,
        address_line1: property.address_line1,
        address_line2: property.address_line2 || '',
        city: property.city,
        postcode: property.postcode,
        property_type: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        access_instructions: property.access_instructions || '',
      })
    } else {
      setEditingProperty(null)
      setFormData({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postcode: '',
        property_type: 'HOUSE',
        bedrooms: 0,
        bathrooms: 0,
        access_instructions: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProperty(null)
    setFormData({
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      postcode: '',
      property_type: 'HOUSE',
      bedrooms: 0,
      bathrooms: 0,
      access_instructions: '',
    })
  }

  const handleSubmit = async () => {
    try {
      if (editingProperty) {
        await propertiesAPI.update(editingProperty.id, formData)
      } else {
        await propertiesAPI.create(formData)
      }
      handleCloseDialog()
      loadProperties()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save property')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return
    }

    try {
      await propertiesAPI.delete(id)
      loadProperties()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete property')
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
            RightFit Services - Properties
          </Typography>
          {user && (
            <>
              <Button color="inherit" onClick={() => navigate('/work-orders')}>
                Work Orders
              </Button>
              <Button color="inherit" onClick={() => navigate('/contractors')}>
                Contractors
              </Button>
              <Button color="inherit" onClick={() => navigate('/certificates')}>
                Certificates
              </Button>
              <Chip
                label={user.tenant_name}
                color="secondary"
                sx={{ mr: 2 }}
              />
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
          <Typography variant="h4">Properties</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Property
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Postcode</TableCell>
                <TableCell>Beds/Baths</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No properties found. Click "Add Property" to create your first property.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>{property.name}</TableCell>
                    <TableCell>{property.property_type}</TableCell>
                    <TableCell>{property.address_line1}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>{property.postcode}</TableCell>
                    <TableCell>{property.bedrooms}/{property.bathrooms}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(property)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(property.id)}
                      >
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Property Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Property Type"
            fullWidth
            required
            select
            value={formData.property_type}
            onChange={(e) => setFormData({ ...formData, property_type: e.target.value as any })}
            SelectProps={{ native: true }}
          >
            <option value="HOUSE">House</option>
            <option value="FLAT">Flat</option>
            <option value="COTTAGE">Cottage</option>
            <option value="COMMERCIAL">Commercial</option>
          </TextField>
          <TextField
            margin="dense"
            label="Address Line 1"
            fullWidth
            required
            value={formData.address_line1}
            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Address Line 2 (Optional)"
            fullWidth
            value={formData.address_line2}
            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
          />
          <Box display="flex" gap={2}>
            <TextField
              margin="dense"
              label="City"
              fullWidth
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Postcode"
              fullWidth
              required
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              helperText="UK format (e.g. SW1A 1AA)"
            />
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              margin="dense"
              label="Bedrooms"
              type="number"
              fullWidth
              required
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
            />
            <TextField
              margin="dense"
              label="Bathrooms"
              type="number"
              fullWidth
              required
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
            />
          </Box>
          <TextField
            margin="dense"
            label="Access Instructions (Optional)"
            fullWidth
            multiline
            rows={3}
            value={formData.access_instructions}
            onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
            helperText="Gate codes, parking info, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProperty ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
