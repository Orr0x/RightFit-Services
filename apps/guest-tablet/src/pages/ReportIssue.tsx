import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  CheckCircle as CheckIcon,
  Plumbing as PlumbingIcon,
  Bolt as ElectricalIcon,
  AcUnit as HVACIcon,
  Home as ApplianceIcon,
  BugReport as PestIcon,
  Category as OtherIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface IssueData {
  category: string
  description: string
  location: string
  urgency: 'low' | 'medium' | 'high' | ''
  contact_name: string
  contact_info: string
}

const ISSUE_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing', icon: PlumbingIcon, color: '#2196f3' },
  { value: 'electrical', label: 'Electrical', icon: ElectricalIcon, color: '#ff9800' },
  { value: 'hvac', label: 'Heating/Cooling', icon: HVACIcon, color: '#00bcd4' },
  { value: 'appliance', label: 'Appliance', icon: ApplianceIcon, color: '#4caf50' },
  { value: 'pest', label: 'Pest Control', icon: PestIcon, color: '#f44336' },
  { value: 'other', label: 'Other', icon: OtherIcon, color: '#9c27b0' },
]

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low Priority', description: 'Can wait a few days', color: '#4caf50' },
  { value: 'medium', label: 'Medium Priority', description: 'Should be addressed soon', color: '#ff9800' },
  { value: 'high', label: 'High Priority', description: 'Urgent - needs immediate attention', color: '#f44336' },
]

export default function ReportIssue() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [issueData, setIssueData] = useState<IssueData>({
    category: '',
    description: '',
    location: '',
    urgency: '',
    contact_name: '',
    contact_info: '',
  })

  const steps = ['Select Category', 'Describe Issue', 'Contact Info']

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    try {
      const propertyId = sessionStorage.getItem('guest_property_id') || 'demo-property'

      // Map frontend fields to backend schema
      const payload = {
        property_id: propertyId,
        issue_type: issueData.category,
        issue_description: `${issueData.description}${issueData.location ? `\n\nLocation: ${issueData.location}` : ''}${issueData.urgency ? `\nUrgency: ${issueData.urgency}` : ''}`,
        guest_name: issueData.contact_name,
        // Try to determine if contact_info is email or phone
        ...(issueData.contact_info && {
          [issueData.contact_info.includes('@') ? 'guest_email' : 'guest_phone']: issueData.contact_info
        })
      }

      const response = await fetch('/api/guest-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to submit issue')

      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit issue:', error)
      alert('Failed to submit issue. Please try again or contact the property manager directly.')
    }
  }

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return issueData.category !== ''
      case 1:
        return issueData.description.trim() !== '' && issueData.urgency !== ''
      case 2:
        return issueData.contact_name.trim() !== ''
      default:
        return false
    }
  }

  // Success screen
  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          sx={{
            maxWidth: 600,
            width: '100%',
            p: 5,
            borderRadius: 4,
            textAlign: 'center',
          }}
        >
          <CheckIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Issue Reported Successfully!
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Thank you for reporting this issue. The property manager has been notified and will
            address it as soon as possible.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setSubmitted(false)
                setActiveStep(0)
                setIssueData({
                  category: '',
                  description: '',
                  location: '',
                  urgency: '',
                  contact_name: '',
                  contact_info: '',
                })
              }}
              sx={{ minWidth: 150 }}
            >
              Report Another Issue
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{
                minWidth: 150,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          color: 'white',
        }}
      >
        <IconButton
          onClick={() => navigate('/')}
          sx={{ color: 'white', mr: 2 }}
          size="large"
        >
          <BackIcon fontSize="large" />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Report an Issue
        </Typography>
      </Box>

      {/* Form Container */}
      <Paper
        sx={{
          flex: 1,
          borderRadius: 3,
          overflow: 'auto',
          maxWidth: 900,
          width: '100%',
          mx: 'auto',
          p: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Category Selection */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              What type of issue are you reporting?
            </Typography>
            <Grid container spacing={2}>
              {ISSUE_CATEGORIES.map((category) => (
                <Grid item xs={6} sm={4} key={category.value}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: issueData.category === category.value ? 3 : 0,
                      borderColor: category.color,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() =>
                      setIssueData((prev) => ({ ...prev, category: category.value }))
                    }
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <category.icon
                        sx={{ fontSize: 64, color: category.color, mb: 1 }}
                      />
                      <Typography variant="h6">{category.label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Step 2: Description & Urgency */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Describe the issue
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              placeholder="Please provide details about the issue..."
              value={issueData.description}
              onChange={(e) =>
                setIssueData((prev) => ({ ...prev, description: e.target.value }))
              }
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Location (optional)"
              placeholder="e.g., Kitchen sink, Master bedroom, etc."
              value={issueData.location}
              onChange={(e) =>
                setIssueData((prev) => ({ ...prev, location: e.target.value }))
              }
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              How urgent is this issue?
            </Typography>

            <Grid container spacing={2}>
              {URGENCY_LEVELS.map((level) => (
                <Grid item xs={12} key={level.value}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: issueData.urgency === level.value ? 3 : 1,
                      borderColor:
                        issueData.urgency === level.value ? level.color : '#e0e0e0',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                      },
                    }}
                    onClick={() =>
                      setIssueData((prev) => ({
                        ...prev,
                        urgency: level.value as 'low' | 'medium' | 'high',
                      }))
                    }
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: level.color,
                          mr: 2,
                        }}
                      />
                      <Box>
                        <Typography variant="h6">{level.label}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {level.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Step 3: Contact Info */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
              How can we reach you?
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4 }}>
              We'll use this information to update you on the issue status
            </Typography>

            <TextField
              fullWidth
              required
              label="Your Name"
              placeholder="Enter your name"
              value={issueData.contact_name}
              onChange={(e) =>
                setIssueData((prev) => ({ ...prev, contact_name: e.target.value }))
              }
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Phone or Email (optional)"
              placeholder="Phone number or email address"
              value={issueData.contact_info}
              onChange={(e) =>
                setIssueData((prev) => ({ ...prev, contact_info: e.target.value }))
              }
              sx={{ mb: 3 }}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Review your report:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • <strong>Issue:</strong>{' '}
                {ISSUE_CATEGORIES.find((c) => c.value === issueData.category)?.label}
              </Typography>
              <Typography variant="body2">
                • <strong>Urgency:</strong>{' '}
                {URGENCY_LEVELS.find((u) => u.value === issueData.urgency)?.label}
              </Typography>
              {issueData.location && (
                <Typography variant="body2">
                  • <strong>Location:</strong> {issueData.location}
                </Typography>
              )}
            </Alert>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button
            size="large"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<BackIcon />}
            sx={{ minWidth: 120 }}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              size="large"
              variant="contained"
              onClick={handleSubmit}
              disabled={!canProceed()}
              endIcon={<CheckIcon />}
              sx={{
                minWidth: 150,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Submit Issue
            </Button>
          ) : (
            <Button
              size="large"
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed()}
              endIcon={<ForwardIcon />}
              sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
