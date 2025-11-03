import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography, Card, CardContent, Grid } from '@mui/material'
import {
  QuestionAnswer as QuestionIcon,
  Report as ReportIcon,
  MenuBook as GuideIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

export default function GuestWelcome() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [propertyName, setPropertyName] = useState('Guest Property')
  const [propertyId, setPropertyId] = useState<string | null>(null)

  useEffect(() => {
    // Get property_id from URL query parameter
    const propertyIdFromUrl = searchParams.get('property')

    if (propertyIdFromUrl) {
      // Store it in sessionStorage for use across the app
      sessionStorage.setItem('guest_property_id', propertyIdFromUrl)
      setPropertyId(propertyIdFromUrl)

      // TODO: Fetch property details from API to get the property name
      // For now, just use a placeholder
      setPropertyName('Your Property')
    } else {
      // Check if we already have it stored
      const storedPropertyId = sessionStorage.getItem('guest_property_id')
      if (storedPropertyId) {
        setPropertyId(storedPropertyId)
        setPropertyName('Your Property')
      }
    }
  }, [searchParams])

  const FeatureCard = ({
    title,
    description,
    icon: Icon,
    color,
    onClick
  }: {
    title: string
    description: string
    icon: typeof QuestionIcon
    color: string
    onClick?: () => void
  }) => (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {},
        transition: 'box-shadow 0.3s'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Icon sx={{ color, fontSize: 40 }} />
        </Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography color="textSecondary" variant="body2">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 4,
          p: 5,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          Welcome to {propertyName}
        </Typography>
        {!propertyId && (
          <Typography variant="body2" align="center" sx={{ mb: 2, color: 'warning.main' }}>
            ⚠️ No property configured. Please access via the customer portal link.
          </Typography>
        )}
        <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 5 }}>
          How can we help you today?
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FeatureCard
              title="Ask a Question"
              description="Get instant answers about WiFi, checkout, amenities, and more"
              icon={QuestionIcon}
              color="#2196f3"
              onClick={() => navigate('/chat')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FeatureCard
              title="Report an Issue"
              description="Let us know about any problems so we can help quickly"
              icon={ReportIcon}
              color="#f44336"
              onClick={() => navigate('/report-issue')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FeatureCard
              title="DIY Guides"
              description="Step-by-step instructions for common fixes"
              icon={GuideIcon}
              color="#4caf50"
              onClick={() => navigate('/diy-guides')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FeatureCard
              title="Property Info"
              description="View local recommendations and property details"
              icon={InfoIcon}
              color="#ff9800"
              onClick={() => navigate('/info')}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Need immediate assistance? Contact us at +44 1479 123456
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
