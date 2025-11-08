import { Box, Container, Typography, Button } from '@mui/material'
import { Block, ExternalLink } from 'lucide-react'

export default function WorkerAccessDenied() {
  const handleRedirect = () => {
    // Redirect to worker app (assuming it runs on port 5175)
    window.location.href = 'http://localhost:5175'
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            padding: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#fee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <Block size={40} color="#dc2626" />
          </Box>

          <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
            This portal is for administrators and managers only.
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            As a worker, please use the <strong>Worker App</strong> to view your assigned jobs,
            complete checklists, upload photos, and manage your schedule.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleRedirect}
              startIcon={<ExternalLink size={20} />}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
              }}
            >
              Open Worker App
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleLogout}
              sx={{
                borderColor: '#d1d5db',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
                },
              }}
            >
              Logout
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 3 }}>
            Need help? Contact your manager or administrator.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
