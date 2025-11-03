import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Comment as CommentIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

interface MaintenanceJob {
  id: string
  title: string
  description?: string
  category: string
  priority: string
  status: string
  source: string
  requested_date?: string
  scheduled_date?: string
  scheduled_start_time?: string
  scheduled_end_time?: string
  completed_date?: string
  estimated_total?: number
  actual_total?: number
  estimated_hours?: number
  customer_satisfaction_rating?: number
  completion_notes?: string
  property?: {
    name: string
    property_name: string
    address_line1: string
    city: string
    postcode: string
    access_instructions?: string
  }
  assigned_worker?: {
    first_name: string
    last_name: string
    phone: string
  }
  assigned_contractor?: {
    company_name: string
    contact_name: string
    phone: string
  }
  quote?: {
    id: string
    quote_number: string
    total: number
    status: string
    quote_date: string
    valid_until_date: string
  }
  issue_photos?: string[]
  work_in_progress_photos?: string[]
  completion_photos?: string[]
}

export default function MaintenanceJobDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<MaintenanceJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) {
      fetchJobDetails()
    }
  }, [id])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const customerId = customer.id || 'demo-customer-id'

      const response = await fetch(`/api/customer-portal/maintenance-jobs/${id}?customer_id=${customerId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }

      const data = await response.json()
      setJob(data.data)
    } catch (error) {
      console.error('Failed to load job details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!comment.trim() || !id) return

    try {
      setSubmittingComment(true)
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const customerId = customer.id || 'demo-customer-id'

      const response = await fetch(`/api/customer-portal/maintenance-jobs/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          comment: comment.trim()
        }),
      })

      if (response.ok) {
        setComment('')
        fetchJobDetails() // Reload to show new comment
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'QUOTE_PENDING': return 'warning'
      case 'QUOTE_SENT': return 'info'
      case 'APPROVED': return 'success'
      case 'SCHEDULED': return 'primary'
      case 'IN_PROGRESS': return 'warning'
      case 'COMPLETED': return 'success'
      case 'CANCELLED': return 'error'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'URGENT': return 'error'
      case 'HIGH': return 'warning'
      case 'MEDIUM': return 'info'
      case 'LOW': return 'default'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!job) {
    return (
      <Box>
        <Alert severity="error">Job not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 1 }}>
            Back to Dashboard
          </Button>
          <Typography variant="h4" gutterBottom>
            {job.title}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Chip label={job.priority} color={getPriorityColor(job.priority)} />
          <Chip label={job.status.replace(/_/g, ' ')} color={getStatusColor(job.status)} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Job Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Job Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Category</Typography>
                <Typography variant="body1">{job.category}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Source</Typography>
                <Typography variant="body1">{job.source.replace(/_/g, ' ')}</Typography>
              </Grid>
              {job.requested_date && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Requested Date</Typography>
                  <Typography variant="body1">{new Date(job.requested_date).toLocaleDateString()}</Typography>
                </Grid>
              )}
              {job.scheduled_date && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Scheduled Date</Typography>
                  <Typography variant="body1">
                    {new Date(job.scheduled_date).toLocaleDateString()}
                    {job.scheduled_start_time && ` at ${job.scheduled_start_time}`}
                  </Typography>
                </Grid>
              )}
              {job.completed_date && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Completed Date</Typography>
                  <Typography variant="body1">{new Date(job.completed_date).toLocaleDateString()}</Typography>
                </Grid>
              )}
            </Grid>

            {job.description && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Description</Typography>
                <Typography variant="body1">{job.description}</Typography>
              </Box>
            )}
          </Paper>

          {/* Property Information */}
          {job.property && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <HomeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Property</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" fontWeight="medium">{job.property.name || job.property.property_name}</Typography>
              <Typography variant="body2" color="text.secondary">{job.property.address_line1}</Typography>
              <Typography variant="body2" color="text.secondary">{job.property.city}, {job.property.postcode}</Typography>
              {job.property.access_instructions && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Access Instructions</Typography>
                  <Alert severity="info" icon={<InfoIcon />}>
                    {job.property.access_instructions}
                  </Alert>
                </Box>
              )}
            </Paper>
          )}

          {/* Photos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Photos</Typography>
            <Divider sx={{ mb: 2 }} />

            {job.issue_photos && job.issue_photos.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>Issue Photos</Typography>
                <ImageList cols={3} gap={8}>
                  {job.issue_photos.map((photo, idx) => (
                    <ImageListItem key={idx}>
                      <Box
                        sx={{
                          aspectRatio: '1',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Photo {idx + 1}
                        </Typography>
                      </Box>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {job.work_in_progress_photos && job.work_in_progress_photos.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>Work in Progress</Typography>
                <ImageList cols={3} gap={8}>
                  {job.work_in_progress_photos.map((photo, idx) => (
                    <ImageListItem key={idx}>
                      <Box
                        sx={{
                          aspectRatio: '1',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Photo {idx + 1}
                        </Typography>
                      </Box>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {job.completion_photos && job.completion_photos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Completion Photos</Typography>
                <ImageList cols={3} gap={8}>
                  {job.completion_photos.map((photo, idx) => (
                    <ImageListItem key={idx}>
                      <Box
                        sx={{
                          aspectRatio: '1',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Photo {idx + 1}
                        </Typography>
                      </Box>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {!job.issue_photos?.length && !job.work_in_progress_photos?.length && !job.completion_photos?.length && (
              <Typography color="text.secondary">No photos available yet</Typography>
            )}
          </Paper>

          {/* Completion Notes & Rating */}
          {(job.completion_notes || job.customer_satisfaction_rating) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Completion Details</Typography>
              <Divider sx={{ mb: 2 }} />
              {job.completion_notes && (
                <Typography variant="body1" paragraph>{job.completion_notes}</Typography>
              )}
              {job.customer_satisfaction_rating && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Your Rating</Typography>
                  <Typography variant="h6" color="warning.main">
                    {'⭐'.repeat(job.customer_satisfaction_rating)} ({job.customer_satisfaction_rating}/5)
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Customer Comments */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <CommentIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Add Comment or Question</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add any comments, questions, or additional information about this job..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submittingComment}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleSubmitComment}
              disabled={!comment.trim() || submittingComment}
            >
              {submittingComment ? 'Submitting...' : 'Submit Comment'}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Quote Information */}
          {job.quote && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <MoneyIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Quote</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">Quote Number</Typography>
                <Typography variant="body1" gutterBottom>{job.quote.quote_number}</Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Total Amount</Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  £{Number(job.quote.total).toFixed(2)}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Status</Typography>
                <Chip
                  label={job.quote.status}
                  color={job.quote.status === 'APPROVED' ? 'success' : 'warning'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Quote Date</Typography>
                <Typography variant="body2">{new Date(job.quote.quote_date).toLocaleDateString()}</Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Valid Until</Typography>
                <Typography variant="body2">{new Date(job.quote.valid_until_date).toLocaleDateString()}</Typography>
              </CardContent>
            </Card>
          )}

          {/* Cost Summary */}
          {(job.estimated_total || job.actual_total) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cost Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                {job.estimated_total && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Estimated Total</Typography>
                    <Typography variant="h6" color="primary">
                      £{Number(job.estimated_total).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                {job.actual_total && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Actual Total</Typography>
                    <Typography variant="h6" color="success.main">
                      £{Number(job.actual_total).toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assigned Worker */}
          {(job.assigned_worker || job.assigned_contractor) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Assigned To</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {job.assigned_worker ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Worker</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {job.assigned_worker.first_name} {job.assigned_worker.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{job.assigned_worker.phone}</Typography>
                  </Box>
                ) : job.assigned_contractor ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Contractor</Typography>
                    <Typography variant="body1" fontWeight="medium">{job.assigned_contractor.company_name}</Typography>
                    <Typography variant="body2">{job.assigned_contractor.contact_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{job.assigned_contractor.phone}</Typography>
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Scheduled Date */}
          {job.scheduled_date && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Schedule</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(job.scheduled_date).toLocaleDateString()}
                </Typography>
                {job.scheduled_start_time && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Time</Typography>
                    <Typography variant="body1">
                      {job.scheduled_start_time}
                      {job.scheduled_end_time && ` - ${job.scheduled_end_time}`}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
