import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import cronService from '../services/CronService'
import notificationService from '../services/NotificationService'

const router: Router = Router()

// Test endpoint for development - no auth required (REMOVE IN PRODUCTION!)
router.post('/test-notification', async (_req: Request, res: Response) => {
  try {
    await notificationService.checkAndSendCertificateExpiryNotifications()
    res.json({ message: 'Test notification check completed' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// All routes below require authentication
router.use(authenticate)

// Manually trigger certificate expiry check (for testing)
router.post('/trigger-certificate-check', async (_req: Request, res: Response) => {
  try {
    await cronService.triggerCertificateExpiryCheck()
    res.json({ message: 'Certificate expiry check triggered successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get certificate summary for dashboard
router.get('/certificate-summary', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const summary = await notificationService.getCertificateSummary(tenantId)
    res.json({ data: summary })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
