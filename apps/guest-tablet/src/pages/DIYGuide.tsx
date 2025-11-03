import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Alert,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface DIYGuideItem {
  id: string
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_time: string
  tools_needed: string[]
  steps: {
    step_number: number
    instruction: string
    warning?: string
  }[]
  safety_notes?: string
}

const PLACEHOLDER_GUIDES: DIYGuideItem[] = [
  {
    id: '1',
    title: 'Reset a Tripped Circuit Breaker',
    category: 'Electrical',
    difficulty: 'easy',
    estimated_time: '5 minutes',
    tools_needed: ['None'],
    safety_notes: 'Do not touch with wet hands. If breaker trips repeatedly, contact property manager.',
    steps: [
      {
        step_number: 1,
        instruction: 'Locate the electrical panel (usually in hallway, garage, or utility room)',
      },
      {
        step_number: 2,
        instruction: 'Look for a breaker switch that is in the middle position or OFF',
      },
      {
        step_number: 3,
        instruction: 'Push the breaker switch firmly to the OFF position first',
      },
      {
        step_number: 4,
        instruction: 'Then push it back to the ON position',
        warning: 'If the breaker trips again immediately, stop and contact the property manager',
      },
    ],
  },
  {
    id: '2',
    title: 'Unclog a Sink Drain',
    category: 'Plumbing',
    difficulty: 'easy',
    estimated_time: '15 minutes',
    tools_needed: ['Plunger', 'Bucket'],
    steps: [
      {
        step_number: 1,
        instruction: 'Remove any visible debris from the drain opening',
      },
      {
        step_number: 2,
        instruction: 'Fill the sink with 2-3 inches of water',
      },
      {
        step_number: 3,
        instruction: 'Place the plunger over the drain, ensuring a good seal',
      },
      {
        step_number: 4,
        instruction: 'Push down and pull up rapidly 10-15 times',
      },
      {
        step_number: 5,
        instruction: 'Check if water drains. Repeat if necessary',
        warning: 'Do not use chemical drain cleaners without permission. If clog persists, contact property manager.',
      },
    ],
  },
  {
    id: '3',
    title: 'Replace Air Filter',
    category: 'HVAC',
    difficulty: 'easy',
    estimated_time: '10 minutes',
    tools_needed: ['Replacement filter (check size)'],
    steps: [
      {
        step_number: 1,
        instruction: 'Turn off the HVAC system',
      },
      {
        step_number: 2,
        instruction: 'Locate the air filter (usually behind a vent grill or in the HVAC unit)',
      },
      {
        step_number: 3,
        instruction: 'Note the arrow direction on the old filter before removing',
      },
      {
        step_number: 4,
        instruction: 'Remove the old filter and dispose of it',
      },
      {
        step_number: 5,
        instruction: 'Insert the new filter with the arrow pointing in the same direction as the old one',
      },
      {
        step_number: 6,
        instruction: 'Turn the HVAC system back on',
      },
    ],
  },
  {
    id: '4',
    title: 'Stop a Running Toilet',
    category: 'Plumbing',
    difficulty: 'easy',
    estimated_time: '5 minutes',
    tools_needed: ['None'],
    steps: [
      {
        step_number: 1,
        instruction: 'Remove the toilet tank lid and set it aside carefully',
      },
      {
        step_number: 2,
        instruction: 'Check if the flapper (rubber seal at bottom) is properly seated',
      },
      {
        step_number: 3,
        instruction: 'Adjust the float ball or float cup so water stops at the fill line',
      },
      {
        step_number: 4,
        instruction: 'If the chain is tangled, straighten it out',
        warning: 'If the toilet continues running, contact the property manager.',
      },
    ],
  },
]

export default function DIYGuide() {
  const navigate = useNavigate()
  const [guides, setGuides] = useState<DIYGuideItem[]>([])
  const [selectedGuide, setSelectedGuide] = useState<DIYGuideItem | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      const propertyId = sessionStorage.getItem('guest_property_id') || 'demo-property'
      const response = await fetch(`/api/guest/diy-guides?property_id=${propertyId}`)

      if (response.ok) {
        const data = await response.json()
        setGuides(data.data || PLACEHOLDER_GUIDES)
      } else {
        // Use placeholder guides if API fails
        setGuides(PLACEHOLDER_GUIDES)
      }
    } catch (error) {
      console.error('Failed to load DIY guides:', error)
      setGuides(PLACEHOLDER_GUIDES)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4caf50'
      case 'medium':
        return '#ff9800'
      case 'hard':
        return '#f44336'
      default:
        return '#9e9e9e'
    }
  }

  // Guide list view
  if (!selectedGuide) {
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
            DIY Guides
          </Typography>
        </Box>

        {/* Guides List */}
        <Paper
          sx={{
            flex: 1,
            borderRadius: 3,
            overflow: 'auto',
            maxWidth: 1000,
            width: '100%',
            mx: 'auto',
            p: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Simple fixes you can do yourself
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              These guides are for simple maintenance tasks. For complex issues or if you're
              unsure, please contact the property manager.
            </Typography>
          </Alert>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading guides...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {guides.map((guide) => (
                <Grid item xs={12} sm={6} key={guide.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => setSelectedGuide(guide)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                        <Box flex={1}>
                          <Typography variant="h6" gutterBottom>
                            {guide.title}
                          </Typography>
                          <Chip
                            label={guide.category}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip
                            label={guide.difficulty}
                            size="small"
                            sx={{
                              backgroundColor: getDifficultyColor(guide.difficulty),
                              color: 'white',
                              mb: 1,
                            }}
                          />
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            <BuildIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                            {guide.estimated_time}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    )
  }

  // Guide detail view with steps
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
          onClick={() => {
            setSelectedGuide(null)
            setActiveStep(0)
          }}
          sx={{ color: 'white', mr: 2 }}
          size="large"
        >
          <BackIcon fontSize="large" />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {selectedGuide.title}
        </Typography>
      </Box>

      {/* Guide Content */}
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
        {/* Guide Info */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" gap={1} mb={2}>
            <Chip label={selectedGuide.category} />
            <Chip
              label={selectedGuide.difficulty}
              sx={{
                backgroundColor: getDifficultyColor(selectedGuide.difficulty),
                color: 'white',
              }}
            />
            <Chip
              label={selectedGuide.estimated_time}
              icon={<BuildIcon />}
            />
          </Box>

          {selectedGuide.safety_notes && (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Safety First:
              </Typography>
              <Typography variant="body2">{selectedGuide.safety_notes}</Typography>
            </Alert>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Tools Needed:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {selectedGuide.tools_needed.map((tool, index) => (
              <Chip key={index} label={tool} variant="outlined" />
            ))}
          </Box>
        </Box>

        {/* Step-by-step Instructions */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Instructions:
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {selectedGuide.steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>Step {step.step_number}</StepLabel>
              <StepContent>
                <Typography variant="body1" paragraph>
                  {step.instruction}
                </Typography>
                {step.warning && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {step.warning}
                  </Alert>
                )}
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(index + 1)}
                    sx={{ mr: 1 }}
                  >
                    {index === selectedGuide.steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  {index > 0 && (
                    <Button onClick={() => setActiveStep(index - 1)}>Back</Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === selectedGuide.steps.length && (
          <Paper square elevation={0} sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <CheckIcon sx={{ color: '#4caf50', fontSize: 40, mr: 2 }} />
              <Typography variant="h6">Guide Complete!</Typography>
            </Box>
            <Typography paragraph>
              Great job completing these steps. If the issue persists or you need additional
              assistance, please contact the property manager.
            </Typography>
            <Button
              onClick={() => setActiveStep(0)}
              sx={{ mr: 1 }}
            >
              Start Over
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedGuide(null)
                setActiveStep(0)
              }}
              startIcon={<HomeIcon />}
            >
              Back to Guides
            </Button>
          </Paper>
        )}
      </Paper>
    </Box>
  )
}
