import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import {
  Download as DownloadIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material'

interface Invoice {
  id: string
  invoice_number: string
  date: string
  service_type: string
  amount: number
  status: 'PAID' | 'PENDING' | 'OVERDUE'
}

interface MonthlyStats {
  current_month: number
  last_month: number
  ytd_total: number
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<MonthlyStats>({
    current_month: 0,
    last_month: 0,
    ytd_total: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      // const response = await fetch(`/api/customer-portal/invoices?customer_id=${customer.id}`)
      // const data = await response.json()

      // Mock data
      setStats({
        current_month: 1250.00,
        last_month: 980.50,
        ytd_total: 14567.89,
      })

      setInvoices([
        {
          id: '1',
          invoice_number: 'INV-2025-001',
          date: new Date().toISOString(),
          service_type: 'Cleaning Service',
          amount: 450.00,
          status: 'PAID',
        },
        {
          id: '2',
          invoice_number: 'INV-2025-002',
          date: new Date(Date.now() - 86400000 * 7).toISOString(),
          service_type: 'Plumbing Repair',
          amount: 150.00,
          status: 'PENDING',
        },
        {
          id: '3',
          invoice_number: 'INV-2024-098',
          date: new Date(Date.now() - 86400000 * 14).toISOString(),
          service_type: 'HVAC Maintenance',
          amount: 650.50,
          status: 'PAID',
        },
      ])
    } catch (err) {
      console.error('Failed to load invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (invoiceId: string) => {
    // TODO: Implement PDF download
    console.log('Downloading invoice:', invoiceId)
    alert(`Downloading invoice ${invoiceId}... (Feature coming soon)`)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading invoices...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoices & Payments
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        View your payment history and download invoices
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Current Month
              </Typography>
              <Typography variant="h4">
                £{stats.current_month.toFixed(2)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                  +27% vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Last Month
              </Typography>
              <Typography variant="h4">
                £{stats.last_month.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Year to Date
              </Typography>
              <Typography variant="h4">
                £{stats.ytd_total.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">No invoices found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.service_type}</TableCell>
                  <TableCell>£{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={
                        invoice.status === 'PAID' ? 'success' :
                        invoice.status === 'OVERDUE' ? 'error' :
                        'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(invoice.id)}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
