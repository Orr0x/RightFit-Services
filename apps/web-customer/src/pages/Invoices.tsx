import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')

      if (!customer.id) {
        console.error('No customer ID found')
        return
      }

      // Import the API
      const { customerPortalAPI } = await import('../lib/api')
      const data = await customerPortalAPI.getInvoices(customer.id)

      setStats({
        current_month: data.statistics.currentMonth,
        last_month: data.statistics.lastMonth,
        ytd_total: data.statistics.ytdTotal,
      })

      // Map API invoices to UI format
      const mappedInvoices = data.invoices.map((invoice: any) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        date: invoice.invoice_date,
        service_type: invoice.maintenance_job?.service?.service_name || 'Maintenance Service',
        amount: Number(invoice.total),
        status: invoice.status,
      }))

      setInvoices(mappedInvoices)
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
                <TableRow
                  key={invoice.id}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(invoice.id)
                      }}
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
