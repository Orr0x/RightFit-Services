import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  AppBar,
  Toolbar,
  Container,
} from '@mui/material'
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { certificatesAPI, propertiesAPI, type Property } from '../lib/api'

interface Certificate {
  id: string
  property_id: string
  certificate_type: string
  issue_date: string
  expiry_date: string
  document_url: string
  certificate_number?: string
  issuer_name?: string
  notes?: string
  days_until_expiry: number
  is_expired: boolean
  property: {
    id: string
    name: string
    address_line1: string
    city: string
    postcode: string
  }
}

const CERTIFICATE_TYPES = [
  { value: 'GAS_SAFETY', label: 'Gas Safety Certificate' },
  { value: 'ELECTRICAL', label: 'Electrical Safety (EICR)' },
  { value: 'EPC', label: 'Energy Performance Certificate' },
  { value: 'STL_LICENSE', label: 'Short-Term Let License' },
  { value: 'OTHER', label: 'Other' },
]

export default function Certificates() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [propertyId, setPropertyId] = useState('')
  const [certificateType, setCertificateType] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [issuerName, setIssuerName] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [certsData, propsData] = await Promise.all([
        certificatesAPI.list(),
        propertiesAPI.list(),
      ])
      setCertificates(certsData)
      setProperties(propsData)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !propertyId || !certificateType || !issueDate || !expiryDate) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setUploading(true)
      setError('')

      await certificatesAPI.upload(selectedFile, {
        property_id: propertyId,
        certificate_type: certificateType,
        issue_date: issueDate,
        expiry_date: expiryDate,
        certificate_number: certificateNumber || undefined,
        issuer_name: issuerName || undefined,
        notes: notes || undefined,
      })

      // Reload certificates
      await loadData()

      // Reset form
      setOpenDialog(false)
      setSelectedFile(null)
      setPropertyId('')
      setCertificateType('')
      setIssueDate('')
      setExpiryDate('')
      setCertificateNumber('')
      setIssuerName('')
      setNotes('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload certificate')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return

    try {
      await certificatesAPI.delete(id)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete certificate')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusChip = (cert: Certificate) => {
    if (cert.is_expired) {
      return (
        <Chip
          icon={<ErrorIcon />}
          label={`Expired ${Math.abs(cert.days_until_expiry)} days ago`}
          color="error"
          size="small"
        />
      )
    } else if (cert.days_until_expiry <= 30) {
      return (
        <Chip
          icon={<WarningIcon />}
          label={`Expires in ${cert.days_until_expiry} days`}
          color="error"
          size="small"
        />
      )
    } else if (cert.days_until_expiry <= 60) {
      return (
        <Chip
          icon={<WarningIcon />}
          label={`Expires in ${cert.days_until_expiry} days`}
          color="warning"
          size="small"
        />
      )
    } else {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label={`Valid (${cert.days_until_expiry} days)`}
          color="success"
          size="small"
        />
      )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getCertTypeName = (type: string) => {
    return CERTIFICATE_TYPES.find((t) => t.value === type)?.label || type
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading certificates...</Typography>
      </Box>
    )
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RightFit Services - Certificates
          </Typography>
          {user && (
            <>
              <Button color="inherit" onClick={() => navigate('/properties')}>
                Properties
              </Button>
              <Button color="inherit" onClick={() => navigate('/work-orders')}>
                Work Orders
              </Button>
              <Button color="inherit" onClick={() => navigate('/contractors')}>
                Contractors
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Compliance Certificates</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Upload Certificate
          </Button>
        </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Expiring Soon Alert */}
      {certificates.filter((c) => !c.is_expired && c.days_until_expiry <= 60).length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {certificates.filter((c) => !c.is_expired && c.days_until_expiry <= 60).length} certificate(s)
          expiring in the next 60 days
        </Alert>
      )}

      {/* Expired Alert */}
      {certificates.filter((c) => c.is_expired).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {certificates.filter((c) => c.is_expired).length} certificate(s) have expired
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Certificate Type</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issuer</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No certificates found. Upload your first certificate to get started.
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {cert.property.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cert.property.address_line1}, {cert.property.city}
                    </Typography>
                  </TableCell>
                  <TableCell>{getCertTypeName(cert.certificate_type)}</TableCell>
                  <TableCell>{formatDate(cert.issue_date)}</TableCell>
                  <TableCell>{formatDate(cert.expiry_date)}</TableCell>
                  <TableCell>{getStatusChip(cert)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{cert.issuer_name || '-'}</Typography>
                    {cert.certificate_number && (
                      <Typography variant="caption" color="text.secondary">
                        #{cert.certificate_number}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => window.open(cert.document_url, '_blank')}
                      title="View Document"
                    >
                      <DescriptionIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(cert.id)}
                      title="Delete"
                      color="error"
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

      {/* Upload Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Certificate</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Property *"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              fullWidth
            >
              {properties.map((prop) => (
                <MenuItem key={prop.id} value={prop.id}>
                  {prop.name} - {prop.address_line1}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Certificate Type *"
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value)}
              fullWidth
            >
              {CERTIFICATE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Issue Date *"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              type="date"
              label="Expiry Date *"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Certificate Number"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              fullWidth
            />

            <TextField
              label="Issuer Name"
              value={issuerName}
              onChange={(e) => setIssuerName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />

            <Button variant="outlined" component="label" fullWidth>
              {selectedFile ? selectedFile.name : 'Choose File (PDF or Image) *'}
              <input type="file" hidden accept="application/pdf,.pdf,image/*" onChange={handleFileChange} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || !selectedFile || !propertyId || !certificateType || !issueDate || !expiryDate}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </>
  )
}
