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
  LinearProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import {
  financialAPI,
  propertiesAPI,
  type FinancialTransaction,
  type CreateTransactionData,
  type Property,
  type PropertyFinancialSummary,
  type BudgetStatus,
} from '../lib/api'

export default function Financial() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Data state
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [summary, setSummary] = useState<PropertyFinancialSummary | null>(null)
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null)

  // Filter state
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [filterType, setFilterType] = useState<'INCOME' | 'EXPENSE' | ''>('')
  const [filterCategory, setFilterCategory] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState<CreateTransactionData>({
    propertyId: '',
    type: 'EXPENSE',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    receiptUrl: '',
    notes: '',
  })

  const [budgetFormData, setBudgetFormData] = useState({
    monthlyBudget: 0,
    alertThreshold: 0.8,
  })

  const expenseCategories = [
    'MAINTENANCE',
    'REPAIRS',
    'UTILITIES',
    'INSURANCE',
    'PROPERTY_TAX',
    'MANAGEMENT_FEES',
    'MORTGAGE',
    'LEGAL_FEES',
    'CLEANING',
    'GARDENING',
    'SAFETY_CERTIFICATES',
    'OTHER',
  ]

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      loadTransactions()
      loadSummary()
      loadBudgetStatus()
    }
  }, [selectedProperty, filterType, filterCategory])

  const loadProperties = async () => {
    try {
      const data = await propertiesAPI.list()
      setProperties(data)
      if (data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0].id)
      }
    } catch (err: any) {
      setError('Failed to load properties')
      console.error(err)
    }
  }

  const loadTransactions = async () => {
    if (!selectedProperty) return

    try {
      setIsLoading(true)
      const result = await financialAPI.listTransactions({
        propertyId: selectedProperty,
        type: filterType || undefined,
        category: filterCategory || undefined,
      })
      setTransactions(result.data)
      setError('')
    } catch (err: any) {
      setError('Failed to load transactions')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSummary = async () => {
    if (!selectedProperty) return

    try {
      const data = await financialAPI.getPropertySummary(selectedProperty)
      setSummary(data)
    } catch (err: any) {
      console.error('Failed to load summary:', err)
    }
  }

  const loadBudgetStatus = async () => {
    if (!selectedProperty) return

    try {
      const data = await financialAPI.getBudgetStatus(selectedProperty)
      setBudgetStatus(data)
    } catch (err: any) {
      console.error('Failed to load budget status:', err)
    }
  }

  const handleOpenDialog = (transaction?: FinancialTransaction) => {
    if (transaction) {
      setEditingTransaction(transaction)
      setFormData({
        propertyId: transaction.property_id,
        type: transaction.type,
        category: transaction.category || '',
        amount: transaction.amount,
        date: new Date(transaction.date).toISOString().split('T')[0],
        description: transaction.description,
        receiptUrl: transaction.receipt_url || '',
        notes: transaction.notes || '',
      })
    } else {
      setEditingTransaction(null)
      setFormData({
        propertyId: selectedProperty,
        type: 'EXPENSE',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        receiptUrl: '',
        notes: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingTransaction(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingTransaction) {
        await financialAPI.updateTransaction(editingTransaction.id, formData)
      } else {
        await financialAPI.createTransaction(formData)
      }
      handleCloseDialog()
      loadTransactions()
      loadSummary()
      loadBudgetStatus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      await financialAPI.deleteTransaction(id)
      loadTransactions()
      loadSummary()
      loadBudgetStatus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete transaction')
    }
  }

  const handleSetBudget = async () => {
    if (!selectedProperty) return

    try {
      await financialAPI.setBudget({
        propertyId: selectedProperty,
        monthlyBudget: budgetFormData.monthlyBudget,
        alertThreshold: budgetFormData.alertThreshold,
      })
      setOpenBudgetDialog(false)
      loadBudgetStatus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set budget')
    }
  }

  const handleExportCSV = async () => {
    try {
      const blob = await financialAPI.exportCSV({
        propertyId: selectedProperty || undefined,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (err: any) {
      setError('Failed to export CSV')
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

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            RightFit Services - Financial Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/properties')}>
            Properties
          </Button>
          <Button color="inherit" onClick={() => navigate('/work-orders')}>
            Work Orders
          </Button>
          <Button color="inherit" onClick={() => navigate('/tenants')}>
            Tenants
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

        {/* Property Selector */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Property</InputLabel>
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              label="Select Property"
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedProperty && (
          <>
            {/* Financial Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <IncomeIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">Total Income</Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary ? formatCurrency(summary.totalIncome) : '£0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ExpenseIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">Total Expenses</Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary ? formatCurrency(summary.totalExpenses) : '£0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MoneyIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Net Income</Typography>
                    </Box>
                    <Typography variant="h4" color={summary && summary.netIncome >= 0 ? 'success.main' : 'error.main'}>
                      {summary ? formatCurrency(summary.netIncome) : '£0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Transactions
                    </Typography>
                    <Typography variant="h4">
                      {summary?.transactions || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Budget Status Alert */}
            {budgetStatus && (budgetStatus.alerts.isOverBudget || budgetStatus.alerts.isNearThreshold) && (
              <Alert
                severity={budgetStatus.alerts.isOverBudget ? 'error' : 'warning'}
                icon={<WarningIcon />}
                sx={{ mb: 3 }}
              >
                <Typography variant="subtitle1">
                  {budgetStatus.alerts.message}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Spent: {formatCurrency(budgetStatus.currentMonth.totalSpent)} of{' '}
                    {formatCurrency(budgetStatus.budget.monthlyBudget)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budgetStatus.currentMonth.percentageUsed, 100)}
                    color={budgetStatus.alerts.isOverBudget ? 'error' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Transaction
              </Button>
              <Button
                variant="outlined"
                onClick={() => setOpenBudgetDialog(true)}
              >
                Set Budget
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      label="Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="INCOME">Income</MenuItem>
                      <MenuItem value="EXPENSE">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="">All</MenuItem>
                      {expenseCategories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Transactions Table */}
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.type}
                              color={transaction.type === 'INCOME' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {transaction.category?.replace(/_/g, ' ') || '-'}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell align="right">
                            <Typography
                              color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(transaction)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(transaction.id)}
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
          </>
        )}

        {/* Transaction Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                </Select>
              </FormControl>

              {formData.type === 'EXPENSE' && (
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  >
                    {expenseCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                fullWidth
                required
              />

              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                required
              />

              <TextField
                label="Receipt URL"
                value={formData.receiptUrl}
                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                fullWidth
              />

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
              {editingTransaction ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Budget Dialog */}
        <Dialog open={openBudgetDialog} onClose={() => setOpenBudgetDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Set Monthly Budget</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Monthly Budget"
                type="number"
                value={budgetFormData.monthlyBudget}
                onChange={(e) =>
                  setBudgetFormData({ ...budgetFormData, monthlyBudget: parseFloat(e.target.value) })
                }
                fullWidth
                required
              />

              <TextField
                label="Alert Threshold (0-1)"
                type="number"
                value={budgetFormData.alertThreshold}
                onChange={(e) =>
                  setBudgetFormData({ ...budgetFormData, alertThreshold: parseFloat(e.target.value) })
                }
                fullWidth
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                helperText="0.8 = alert when 80% of budget is spent"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBudgetDialog(false)}>Cancel</Button>
            <Button onClick={handleSetBudget} variant="contained">
              Set Budget
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
