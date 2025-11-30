"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("@rightfit/database");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
const prisma = new database_1.PrismaClient();
/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { limit = '50', offset = '0', unread_only = 'false' } = req.query;
        const where = {
            user_id: userId,
        };
        // Filter for unread only if requested
        if (unread_only === 'true') {
            where.read_at = null;
        }
        const notifications = await prisma.notification.findMany({
            where,
            orderBy: {
                sent_at: 'desc',
            },
            take: parseInt(limit),
            skip: parseInt(offset),
        });
        const total = await prisma.notification.count({ where });
        const unread = await prisma.notification.count({
            where: { user_id: userId, read_at: null },
        });
        return res.status(200).json({
            notifications,
            pagination: {
                total,
                unread,
                limit: parseInt(limit),
                offset: parseInt(offset),
            },
        });
    }
    catch (error) {
        logger_1.default.error('Failed to fetch notifications', {
            error: error.message,
            user_id: req.user?.id,
        });
        return res.status(500).json({
            error: 'Failed to fetch notifications',
        });
    }
});
/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Verify notification belongs to user
        const notification = await prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            return res.status(404).json({
                error: 'Notification not found',
            });
        }
        if (notification.user_id !== userId) {
            return res.status(403).json({
                error: 'Access denied',
            });
        }
        // Mark as read
        const updated = await prisma.notification.update({
            where: { id },
            data: {
                read_at: new Date(),
            },
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        logger_1.default.error('Failed to mark notification as read', {
            error: error.message,
            notification_id: req.params.id,
        });
        return res.status(500).json({
            error: 'Failed to mark notification as read',
        });
    }
});
/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.post('/mark-all-read', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const result = await prisma.notification.updateMany({
            where: {
                user_id: userId,
                read_at: null,
            },
            data: {
                read_at: new Date(),
            },
        });
        return res.status(200).json({
            message: 'All notifications marked as read',
            count: result.count,
        });
    }
    catch (error) {
        logger_1.default.error('Failed to mark all notifications as read', {
            error: error.message,
            user_id: req.user?.id,
        });
        return res.status(500).json({
            error: 'Failed to mark all notifications as read',
        });
    }
});
/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Verify notification belongs to user
        const notification = await prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            return res.status(404).json({
                error: 'Notification not found',
            });
        }
        if (notification.user_id !== userId) {
            return res.status(403).json({
                error: 'Access denied',
            });
        }
        await prisma.notification.delete({
            where: { id },
        });
        return res.status(200).json({
            message: 'Notification deleted successfully',
        });
    }
    catch (error) {
        logger_1.default.error('Failed to delete notification', {
            error: error.message,
            notification_id: req.params.id,
        });
        return res.status(500).json({
            error: 'Failed to delete notification',
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map