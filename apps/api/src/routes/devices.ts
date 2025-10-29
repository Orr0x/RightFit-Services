import { Router, Request, Response } from 'express'
import pushNotificationService from '../services/PushNotificationService'
import { authenticate } from '../middleware/auth'
import logger from '../utils/logger'

const router = Router()

/**
 * POST /api/devices/register
 * Register a device for push notifications
 */
router.post('/register', authenticate, async (req: Request, res: Response) => {
  try {
    const { push_token, device_id, platform } = req.body
    const userId = (req as any).user?.id
    const tenantId = (req as any).user?.tenant_id

    // Validate required fields
    if (!push_token || !device_id || !platform) {
      return res.status(400).json({
        error: 'Missing required fields: push_token, device_id, platform',
      })
    }

    // Validate platform
    if (platform !== 'IOS' && platform !== 'ANDROID') {
      return res.status(400).json({
        error: 'Invalid platform. Must be IOS or ANDROID',
      })
    }

    // Register device
    await pushNotificationService.registerDevice({
      userId,
      tenantId,
      pushToken: push_token,
      deviceId: device_id,
      platform,
    })

    return res.status(200).json({
      message: 'Device registered successfully',
      device_id,
    })
  } catch (error: any) {
    logger.error('Failed to register device', {
      error: error.message,
      user_id: (req as any).user?.id,
    })
    return res.status(500).json({
      error: 'Failed to register device',
    })
  }
})

/**
 * POST /api/devices/unregister
 * Unregister a device (mark as inactive)
 */
router.post('/unregister', authenticate, async (req: Request, res: Response) => {
  try {
    const { device_id } = req.body
    const userId = (req as any).user?.id

    if (!device_id) {
      return res.status(400).json({
        error: 'Missing required field: device_id',
      })
    }

    await pushNotificationService.unregisterDevice(device_id, userId)

    return res.status(200).json({
      message: 'Device unregistered successfully',
    })
  } catch (error: any) {
    logger.error('Failed to unregister device', {
      error: error.message,
      user_id: (req as any).user?.id,
    })
    return res.status(500).json({
      error: 'Failed to unregister device',
    })
  }
})

export default router
