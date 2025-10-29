import { Router, Request, Response } from 'express'
import { PrismaClient } from '@rightfit/database'
import { authenticate } from '../middleware/auth'
import logger from '../utils/logger'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    const { limit = '50', offset = '0', unread_only = 'false' } = req.query

    const where: any = {
      user_id: userId,
    }

    // Filter for unread only if requested
    if (unread_only === 'true') {
      where.read_at = null
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        sent_at: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    })

    const total = await prisma.notification.count({ where })
    const unread = await prisma.notification.count({
      where: { user_id: userId, read_at: null },
    })

    return res.status(200).json({
      notifications,
      pagination: {
        total,
        unread,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch notifications', {
      error: error.message,
      user_id: (req as any).user?.id,
    })
    return res.status(500).json({
      error: 'Failed to fetch notifications',
    })
  }
})

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
      })
    }

    if (notification.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
      })
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id },
      data: {
        read_at: new Date(),
      },
    })

    return res.status(200).json(updated)
  } catch (error: any) {
    logger.error('Failed to mark notification as read', {
      error: error.message,
      notification_id: req.params.id,
    })
    return res.status(500).json({
      error: 'Failed to mark notification as read',
    })
  }
})

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.post('/mark-all-read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id

    const result = await prisma.notification.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    })

    return res.status(200).json({
      message: 'All notifications marked as read',
      count: result.count,
    })
  } catch (error: any) {
    logger.error('Failed to mark all notifications as read', {
      error: error.message,
      user_id: (req as any).user?.id,
    })
    return res.status(500).json({
      error: 'Failed to mark all notifications as read',
    })
  }
})

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
      })
    }

    if (notification.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
      })
    }

    await prisma.notification.delete({
      where: { id },
    })

    return res.status(200).json({
      message: 'Notification deleted successfully',
    })
  } catch (error: any) {
    logger.error('Failed to delete notification', {
      error: error.message,
      notification_id: req.params.id,
    })
    return res.status(500).json({
      error: 'Failed to delete notification',
    })
  }
})

export default router
