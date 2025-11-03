import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Grid,
} from '@mui/material'
import { Save as SaveIcon } from '@mui/icons-material'

interface Preferences {
  auto_pay_enabled: boolean
  notification_email: boolean
  notification_sms: boolean
  calendar_sync_enabled: boolean
  quote_auto_approve_limit: number | null
}

export default function Settings() {
  const [preferences, setPreferences] = useState<Preferences>({
    auto_pay_enabled: false,
    notification_email: true,
    notification_sms: false,
    calendar_sync_enabled: false,
    quote_auto_approve_limit: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const response = await fetch(`/api/customer-portal/preferences?customer_id=${customer.id}`)

      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setPreferences(data.data)
        }
      }
    } catch (err) {
      console.error('Failed to load preferences:', err)
      // Use defaults if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const customer = JSON.parse(localStorage.getItem('customer') || '{}')
      const response = await fetch(`/api/customer-portal/preferences?customer_id=${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) throw new Error('Failed to save preferences')

      setSuccess('Preferences saved successfully!')
    } catch (err) {
      setError('Failed to save preferences')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof Preferences) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleLimitChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setPreferences(prev => ({
      ...prev,
      quote_auto_approve_limit: numValue,
    }))
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading settings...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings & Preferences
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage your account preferences and notification settings
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.auto_pay_enabled}
              onChange={() => handleToggle('auto_pay_enabled')}
            />
          }
          label="Enable auto-pay for approved invoices"
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: -1 }}>
          Automatically pay invoices when they are issued
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        <Box sx={{ ml: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.notification_email}
                onChange={() => handleToggle('notification_email')}
              />
            }
            label="Email notifications"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: -1, mb: 2 }}>
            Receive updates about services and invoices via email
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={preferences.notification_sms}
                onChange={() => handleToggle('notification_sms')}
              />
            }
            label="SMS notifications"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: -1 }}>
            Receive urgent alerts via text message
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Service Management
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.calendar_sync_enabled}
              onChange={() => handleToggle('calendar_sync_enabled')}
            />
          }
          label="Calendar sync"
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: -1, mb: 3 }}>
          Sync service appointments to your calendar
        </Typography>

        <Grid container spacing={2} sx={{ ml: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Auto-approve quote limit (£)"
              value={preferences.quote_auto_approve_limit || ''}
              onChange={(e) => handleLimitChange(e.target.value)}
              helperText="Quotes under this amount will be automatically approved"
              inputProps={{ min: 0, step: 50 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
