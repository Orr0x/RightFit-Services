import { useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material'
import {
  Home as HomeIcon,
  Work as WorkIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface DashboardStats {
  totalProperties: number
  activeJobs: number
  pendingQuotes: number
  monthlySpending: number
}

interface Quote {
  id: string
  quote_number: string
  total: number
  status: string
  quote_date: string
  valid_until_date: string
  maintenance_jobs?: any[]
  line_items?: any[]
}

interface Job {
  id: string
  title: string
  status: string
  scheduled_date?: string
  scheduled_start_time?: string
  property?: any
  assigned_worker?: any
  estimated_total?: number
  actual_total?: number
  category?: string
  priority?: string
}

interface Notification {
  id: string
  title: string
  body: string
  sent_at: string
  read_at: string | null
  notification_type: string
}

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeJobs: 0,
    pendingQuotes: 0,
    monthlySpending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [pendingQuotes, setPendingQuotes] = useState<Quote[]>([])
  const [scheduledJobs, setScheduledJobs] = useState<Job[]>([])
  const [inProgressJobs, setInProgressJobs] = useState<Job[]>([])
  const [completedJobs, setCompletedJobs] = useState<Job[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetchDashboardData()
    fetchNotifications()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const customerId = customer.id || 'demo-customer-id'

      const response = await fetch(`/api/customer-portal/dashboard?customer_id=${customerId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()

      setStats({
        totalProperties: data.data.statistics?.totalProperties || 0,
        activeJobs: data.data.statistics?.activeJobs || 0,
        pendingQuotes: data.data.statistics?.pendingQuotes || 0,
        monthlySpending: data.data.statistics?.thisMonthSpending || 0,
      })

      setPendingQuotes(data.data.pendingQuotes || [])

      const maintenanceJobs = data.data.activeJobs?.maintenance || []
      setScheduledJobs(maintenanceJobs.filter((j: Job) => j.status === 'SCHEDULED' || j.status === 'APPROVED'))
      setInProgressJobs(maintenanceJobs.filter((j: Job) => j.status === 'IN_PROGRESS'))
      setCompletedJobs(maintenanceJobs.filter((j: Job) => j.status === 'COMPLETED'))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const customerId = customer.id || 'demo-customer-id'

      const response = await fetch(`/api/customer-portal/notifications?customer_id=${customerId}`)

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleApproveQuote = async (quoteId: string) => {
    try {
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const customerId = customer.id || 'demo-customer-id'

      const response = await fetch(`/api/customer-portal/quotes/${quoteId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId }),
      })

      if (response.ok) {
        fetchDashboardData()
        setActiveTab(1) // Switch to Scheduled tab
      }
    } catch (error) {
      console.error('Failed to approve quote:', error)
    }
  }

  const handleDeclineQuote = async (quoteId: string) => {
    try {
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const customerId = customer.id || 'demo-customer-id'

      const response = await fetch(`/api/customer-portal/quotes/${quoteId}/decline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, reason: 'Declined by customer' }),
      })

      if (response.ok) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Failed to decline quote:', error)
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string
    value: string | number
    icon: typeof HomeIcon
    color: string
  }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color, fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Customer Portal Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome to your RightFit Services customer portal
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Properties"
            value={stats.totalProperties}
            icon={HomeIcon}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={WorkIcon}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Quotes"
            value={stats.pendingQuotes}
            icon={ReceiptIcon}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Spending"
            value={`£${stats.monthlySpending.toFixed(2)}`}
            icon={TrendingUpIcon}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Notifications Section */}
      {notifications.filter(n => !n.read_at).length > 0 && (
        <Alert severity="info" icon={<NotificationsIcon />} sx={{ mb: 3 }}>
          <AlertTitle>Notifications</AlertTitle>
          {notifications.filter(n => !n.read_at).slice(0, 3).map(notification => (
            <Typography key={notification.id} variant="body2" sx={{ mb: 1 }}>
              • {notification.title}: {notification.body}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Tabbed Content */}
      <Paper sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={`Pending Quotes (${pendingQuotes.length})`} />
          <Tab label={`Scheduled (${scheduledJobs.length})`} />
          <Tab label={`In Progress (${inProgressJobs.length})`} />
          <Tab label={`Completed (${completedJobs.length})`} />
          <Tab label="Invoices" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Pending Quotes */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Pending Quote Approvals
              </Typography>
              {pendingQuotes.length === 0 ? (
                <Typography color="textSecondary">No quotes pending your approval.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {pendingQuotes.map(quote => (
                    <Grid item xs={12} key={quote.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box flex={1}>
                              <Typography variant="h6">{quote.quote_number}</Typography>
                              <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                                Quote Date: {new Date(quote.quote_date).toLocaleDateString()}
                              </Typography>
                              <Typography color="textSecondary" variant="body2" sx={{ mb: 2 }}>
                                Valid Until: {new Date(quote.valid_until_date).toLocaleDateString()}
                              </Typography>
                              <Typography variant="h5" color="primary">
                                Total: £{Number(quote.total).toFixed(2)}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={1} flexDirection="column">
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleApproveQuote(quote.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleDeclineQuote(quote.id)}
                              >
                                Decline
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 1: Scheduled Jobs */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Scheduled Maintenance Jobs
              </Typography>
              {scheduledJobs.length === 0 ? (
                <Typography color="textSecondary">No jobs currently scheduled.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {scheduledJobs.map(job => (
                    <Grid item xs={12} key={job.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <CardContent>
                          <Typography variant="h6">{job.title}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            Property: {job.property?.property_name}
                          </Typography>
                          {job.scheduled_date && (
                            <Typography color="textSecondary" variant="body2">
                              Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
                              {job.scheduled_start_time && ` at ${job.scheduled_start_time}`}
                            </Typography>
                          )}
                          {job.assigned_worker && (
                            <Typography color="textSecondary" variant="body2">
                              Assigned to: {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                            </Typography>
                          )}
                          <Chip label={job.status} color="info" size="small" sx={{ mt: 1 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 2: In Progress Jobs */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Jobs In Progress
              </Typography>
              {inProgressJobs.length === 0 ? (
                <Typography color="textSecondary">No jobs currently in progress.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {inProgressJobs.map(job => (
                    <Grid item xs={12} key={job.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <CardContent>
                          <Typography variant="h6">{job.title}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            Property: {job.property?.property_name}
                          </Typography>
                          {job.assigned_worker && (
                            <Typography color="textSecondary" variant="body2">
                              Worker: {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                            </Typography>
                          )}
                          <Chip label="In Progress" color="warning" size="small" sx={{ mt: 1 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 3: Completed Jobs */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Completed Maintenance Jobs
              </Typography>
              {completedJobs.length === 0 ? (
                <Typography color="textSecondary">No completed jobs yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {completedJobs.map(job => (
                    <Grid item xs={12} key={job.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box flex={1}>
                              <Typography variant="h6">{job.title}</Typography>
                              <Typography color="textSecondary" variant="body2">
                                Property: {job.property?.property_name}
                              </Typography>
                              {job.category && (
                                <Typography color="textSecondary" variant="body2">
                                  Category: {job.category}
                                </Typography>
                              )}
                              {job.assigned_worker && (
                                <Typography color="textSecondary" variant="body2">
                                  Worker: {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                                </Typography>
                              )}
                              {(job.estimated_total || job.actual_total) && (
                                <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                                  Total: £{Number(job.actual_total || job.estimated_total).toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                            <Chip label="Completed" color="success" size="small" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 4: Invoices */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Invoices & Completed Jobs
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                View all your invoices and payment history.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ReceiptIcon />}
                onClick={() => navigate('/invoices')}
              >
                View All Invoices
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
