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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import {
  tenantsAPI,
  propertiesAPI,
  type PropertyTenant,
  type CreatePropertyTenantData,
  type Property,
  type RentPayment,
  type RecordRentPaymentData,
} from '../lib/api'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Tenants() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Data state
  const [tenants, setTenants] = useState<PropertyTenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([])
  const [expiringLeases, setExpiringLeases] = useState<any[]>([])
  const [overdueRent, setOverdueRent] = useState<any[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [editingTenant, setEditingTenant] = useState<PropertyTenant | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<PropertyTenant | null>(null)

  // Filter state
  const [filterProperty, setFilterProperty] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'' | 'ACTIVE' | 'INACTIVE' | 'NOTICE_GIVEN'>('')

  // Form state
  const [formData, setFormData] = useState<CreatePropertyTenantData>({
    propertyId: '',
    name: '',
    email: '',
    phone: '',
    moveInDate: new Date().toISOString().split('T')[0],
    leaseExpiryDate: '',
    rentAmount: 0,
    rentFrequency: 'MONTHLY',
    rentDueDay: 1,
    notes: '',
  })

  const [paymentFormData, setPaymentFormData] = useState<RecordRentPaymentData>({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    paymentMethod: 'BANK_TRANSFER',
    reference: '',
    notes: '',
  })

  useEffect(() => {
    loadProperties()
    loadTenants()
    loadAlerts()
  }, [])

  useEffect(() => {
    loadTenants()
  }, [filterProperty, filterStatus])

  const loadProperties = async () => {
    try {
      const data = await propertiesAPI.list()
      setProperties(data)
    } catch (err: any) {
      setError('Failed to load properties')
      console.error(err)
    }
  }

  const loadTenants = async () => {
    try {
      setIsLoading(true)
      const result = await tenantsAPI.list({
        propertyId: filterProperty || undefined,
        status: filterStatus || undefined,
      })
      setTenants(result.data)
      setError('')
    } catch (err: any) {
      setError('Failed to load tenants')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      const [expiring, overdue] = await Promise.all([
        tenantsAPI.getExpiringLeases(60),
        tenantsAPI.getOverdueRent(),
      ])
      setExpiringLeases(expiring)
      setOverdueRent(overdue)
    } catch (err: any) {
      console.error('Failed to load alerts:', err)
    }
  }

  const loadRentPayments = async (tenantId: string) => {
    try {
      const result = await tenantsAPI.getRentPayments(tenantId)
      setRentPayments(result.data)
    } catch (err: any) {
      console.error('Failed to load rent payments:', err)
    }
  }

  const handleOpenDialog = (tenant?: PropertyTenant) => {
    if (tenant) {
      setEditingTenant(tenant)
      setFormData({
        propertyId: tenant.property_id,
        name: tenant.name,
        email: tenant.email || '',
        phone: tenant.phone || '',
        moveInDate: new Date(tenant.move_in_date).toISOString().split('T')[0],
        leaseExpiryDate: tenant.lease_expiry_date ? new Date(tenant.lease_expiry_date).toISOString().split('T')[0] : '',
        rentAmount: tenant.rent_amount,
        rentFrequency: tenant.rent_frequency,
        rentDueDay: tenant.rent_due_day || 1,
        notes: tenant.notes || '',
      })
    } else {
      setEditingTenant(null)
      setFormData({
        propertyId: '',
        name: '',
        email: '',
        phone: '',
        moveInDate: new Date().toISOString().split('T')[0],
        leaseExpiryDate: '',
        rentAmount: 0,
        rentFrequency: 'MONTHLY',
        rentDueDay: 1,
        notes: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingTenant(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingTenant) {
        await tenantsAPI.update(editingTenant.id, formData)
      } else {
        await tenantsAPI.create(formData)
      }
      handleCloseDialog()
      loadTenants()
      loadAlerts()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save tenant')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) {
      return
    }

    try {
      await tenantsAPI.delete(id)
      loadTenants()
      loadAlerts()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tenant')
    }
  }

  const handleOpenPaymentDialog = (tenant: PropertyTenant) => {
    setSelectedTenant(tenant)
    setPaymentFormData({
      amount: tenant.rent_amount,
      paymentDate: new Date().toISOString().split('T')[0],
      expectedDate: '',
      paymentMethod: 'BANK_TRANSFER',
      reference: '',
      notes: '',
    })
    loadRentPayments(tenant.id)
    setOpenPaymentDialog(true)
  }

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false)
    setSelectedTenant(null)
    setRentPayments([])
  }

  const handleRecordPayment = async () => {
    if (!selectedTenant) return

    try {
      await tenantsAPI.recordPayment(selectedTenant.id, paymentFormData)
      loadRentPayments(selectedTenant.id)
      loadAlerts()
      setPaymentFormData({
        amount: selectedTenant.rent_amount,
        paymentDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        paymentMethod: 'BANK_TRANSFER',
        reference: '',
        notes: '',
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'NOTICE_GIVEN':
        return 'warning'
      case 'INACTIVE':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            RightFit Services - Tenant Management
          </Typography>
          <Button color="inherit" onClick={() => navigate('/properties')}>
            Properties
          </Button>
          <Button color="inherit" onClick={() => navigate('/work-orders')}>
            Work Orders
          </Button>
          <Button color="inherit" onClick={() => navigate('/financial')}>
            Financial
          </Button>
          <Button color="inherit" onClick={() => navigate('/contractors')}>
            Contractors
          </Button>
          <Button color="inherit" onClick={() => navigate('/certificates')}>
            Certificates
          </Button>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Alerts Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ActiveIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Active Tenants</Typography>
                </Box>
                <Typography variant="h4">
                  {tenants.filter((t) => t.status === 'ACTIVE').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: expiringLeases.length > 0 ? '#fff3e0' : undefined }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Expiring Leases</Typography>
                </Box>
                <Typography variant="h4">{expiringLeases.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Next 60 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: overdueRent.length > 0 ? '#ffebee' : undefined }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Overdue Rent</Typography>
                </Box>
                <Typography variant="h4">{overdueRent.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Requires attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="All Tenants" />
            <Tab label={`Expiring Leases (${expiringLeases.length})`} />
            <Tab label={`Overdue Rent (${overdueRent.length})`} />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          {/* Action Buttons & Filters */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={filterProperty}
                    onChange={(e) => setFilterProperty(e.target.value)}
                    label="Property"
                  >
                    <MenuItem value="">All Properties</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="NOTICE_GIVEN">Notice Given</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Add Tenant
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Tenants Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Rent</TableCell>
                    <TableCell>Lease Expiry</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : tenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No tenants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell>{tenant.property?.name}</TableCell>
                        <TableCell>
                          {tenant.email && <div>{tenant.email}</div>}
                          {tenant.phone && <div>{tenant.phone}</div>}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(tenant.rent_amount)}/{tenant.rent_frequency}
                        </TableCell>
                        <TableCell>
                          {tenant.lease_expiry_date
                            ? new Date(tenant.lease_expiry_date).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tenant.status}
                            color={getStatusColor(tenant.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPaymentDialog(tenant)}
                            title="Record Payment"
                          >
                            <PaymentIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(tenant)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(tenant.id)}
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
          </Paper>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Lease Expiry</TableCell>
                    <TableCell>Days Until Expiry</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiringLeases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No leases expiring in the next 60 days
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiringLeases.map((lease) => (
                      <TableRow key={lease.id}>
                        <TableCell>{lease.tenantName}</TableCell>
                        <TableCell>{lease.propertyName}</TableCell>
                        <TableCell>
                          {new Date(lease.leaseExpiryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${lease.daysUntilExpiry} days`}
                            color={lease.daysUntilExpiry <= 30 ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const tenant = tenants.find((t) => t.id === lease.id)
                              if (tenant) handleOpenDialog(tenant)
                            }}
                          >
                            Renew Lease
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Rent Amount</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell>Last Payment</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdueRent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No overdue rent payments
                      </TableCell>
                    </TableRow>
                  ) : (
                    overdueRent.map((rent) => (
                      <TableRow key={rent.id}>
                        <TableCell>{rent.tenantName}</TableCell>
                        <TableCell>{rent.propertyName}</TableCell>
                        <TableCell>{formatCurrency(rent.rentAmount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${rent.daysOverdue} days`}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {rent.lastPaymentDate
                            ? new Date(rent.lastPaymentDate).toLocaleDateString()
                            : 'No payments'}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              const tenant = tenants.find((t) => t.id === rent.id)
                              if (tenant) handleOpenPaymentDialog(tenant)
                            }}
                          >
                            Record Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tenant Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingTenant ? 'Edit Tenant' : 'Add Tenant'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  label="Property"
                  required
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Tenant Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Move-in Date"
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Lease Expiry Date"
                    type="date"
                    value={formData.leaseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, leaseExpiryDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Rent Amount"
                    type="number"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: parseFloat(e.target.value) })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={formData.rentFrequency}
                      onChange={(e) => setFormData({ ...formData, rentFrequency: e.target.value as any })}
                      label="Frequency"
                    >
                      <MenuItem value="WEEKLY">Weekly</MenuItem>
                      <MenuItem value="MONTHLY">Monthly</MenuItem>
                      <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Rent Due Day"
                    type="number"
                    value={formData.rentDueDay}
                    onChange={(e) => setFormData({ ...formData, rentDueDay: parseInt(e.target.value) })}
                    fullWidth
                    inputProps={{ min: 1, max: 31 }}
                    helperText="Day of month"
                  />
                </Grid>
              </Grid>

              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingTenant ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Record Rent Payment - {selectedTenant?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* Payment Form */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Amount"
                      type="number"
                      value={paymentFormData.amount}
                      onChange={(e) =>
                        setPaymentFormData({ ...paymentFormData, amount: parseFloat(e.target.value) })
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Payment Date"
                      type="date"
                      value={paymentFormData.paymentDate}
                      onChange={(e) =>
                        setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })
                      }
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentFormData.paymentMethod}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value as any })
                    }
                    label="Payment Method"
                  >
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="CHEQUE">Cheque</MenuItem>
                    <MenuItem value="STANDING_ORDER">Standing Order</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Reference"
                  value={paymentFormData.reference}
                  onChange={(e) =>
                    setPaymentFormData({ ...paymentFormData, reference: e.target.value })
                  }
                  fullWidth
                />

                <TextField
                  label="Notes"
                  value={paymentFormData.notes}
                  onChange={(e) =>
                    setPaymentFormData({ ...paymentFormData, notes: e.target.value })
                  }
                  fullWidth
                  multiline
                  rows={2}
                />

                <Button variant="contained" onClick={handleRecordPayment} fullWidth>
                  Record Payment
                </Button>
              </Box>

              {/* Payment History */}
              <Typography variant="h6" gutterBottom>
                Payment History
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rentPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No payment history
                        </TableCell>
                      </TableRow>
                    ) : (
                      rentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            {payment.payment_method?.replace(/_/g, ' ') || 'N/A'}
                          </TableCell>
                          <TableCell>{payment.reference || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
