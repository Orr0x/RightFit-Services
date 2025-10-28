import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@mui/material'
import { Warning as WarningIcon, LightMode, BlurOff } from '@mui/icons-material'
import { PhotoQualityData } from '../lib/api'

interface PhotoQualityWarningProps {
  open: boolean
  onClose: () => void
  onProceed: () => void
  quality: PhotoQualityData | undefined
}

export default function PhotoQualityWarning({ open, onClose, onProceed, quality }: PhotoQualityWarningProps) {
  if (!quality || quality.hasGoodQuality) {
    return null
  }

  const getSuggestions = () => {
    const suggestions: Array<{ icon: JSX.Element; text: string }> = []

    if (quality.isBlurry) {
      suggestions.push({
        icon: <BlurOff />,
        text: 'Hold camera steady and ensure proper focus before taking photo',
      })
    }

    if (quality.brightness < 0.25) {
      suggestions.push({
        icon: <LightMode />,
        text: 'Increase lighting or use flash for better visibility',
      })
    } else if (quality.brightness > 0.85) {
      suggestions.push({
        icon: <LightMode />,
        text: 'Reduce lighting or adjust camera exposure to avoid overexposure',
      })
    }

    return suggestions
  }

  const suggestions = getSuggestions()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          Photo Quality Warning
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Photo Quality Issues Detected</AlertTitle>
          The uploaded photo may have quality issues that could affect visibility and documentation.
        </Alert>

        {quality.warnings && quality.warnings.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Issues Found:
            </Typography>
            <List dense>
              {quality.warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={warning} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {suggestions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Suggestions:
            </Typography>
            <List dense>
              {suggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>{suggestion.icon}</ListItemIcon>
                  <ListItemText primary={suggestion.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Quality Score: Blur {(quality.blurScore * 100).toFixed(0)}%, Brightness {(quality.brightness * 100).toFixed(0)}
          %
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Retake Photo
        </Button>
        <Button onClick={onProceed} variant="contained" color="warning">
          Use Anyway
        </Button>
      </DialogActions>
    </Dialog>
  )
}
