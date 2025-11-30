"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const database_1 = require("@rightfit/database");
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new database_1.PrismaClient();
class PushNotificationService {
    EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
    MAX_BATCH_SIZE = 100; // Expo recommends max 100 notifications per request
    /**
     * Send push notification to a specific user
     */
    async sendNotification(payload) {
        try {
            const { userId, title, body, data, notificationType, priority = 'default' } = payload;
            // Get all active devices for this user
            const devices = await prisma.device.findMany({
                where: {
                    user_id: userId,
                    is_active: true,
                },
            });
            if (devices.length === 0) {
                logger_1.default.info('No active devices found for user', { user_id: userId });
                return;
            }
            // Get current unread notification count for badge
            const unreadCount = await this.getUnreadCount(userId);
            // Prepare Expo push messages
            const messages = devices.map((device) => ({
                to: device.push_token,
                sound: 'default',
                title,
                body,
                data: {
                    ...data,
                    notification_type: notificationType,
                },
                badge: unreadCount + 1,
                priority,
                channelId: 'default', // Android notification channel
            }));
            // Send to Expo Push Notification service
            await this.sendToExpo(messages);
            // Save notification to database (for in-app inbox)
            await prisma.notification.create({
                data: {
                    user_id: userId,
                    tenant_id: data?.tenant_id || '', // tenant_id should be in data
                    notification_type: notificationType,
                    title,
                    body,
                    data: data || {},
                },
            });
            logger_1.default.info('Push notification sent successfully', {
                user_id: userId,
                device_count: devices.length,
                type: notificationType,
            });
        }
        catch (error) {
            logger_1.default.error('Failed to send push notification', {
                error: error.message,
                user_id: payload.userId,
            });
            throw error;
        }
    }
    /**
     * Send push notifications to multiple users (batch)
     */
    async sendBatchNotifications(notifications) {
        try {
            for (const notification of notifications) {
                await this.sendNotification(notification);
            }
        }
        catch (error) {
            logger_1.default.error('Failed to send batch notifications', {
                error: error.message,
                count: notifications.length,
            });
        }
    }
    /**
     * Send messages to Expo Push Notification service
     */
    async sendToExpo(messages) {
        try {
            // Split into batches if needed
            const batches = this.chunkArray(messages, this.MAX_BATCH_SIZE);
            for (const batch of batches) {
                const response = await axios_1.default.post(this.EXPO_PUSH_URL, batch, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Accept-Encoding': 'gzip, deflate',
                    },
                });
                // Handle response and mark devices as inactive if needed
                if (response.data?.data) {
                    this.handleExpoResponse(response.data.data, batch);
                }
            }
        }
        catch (error) {
            logger_1.default.error('Failed to send to Expo', {
                error: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }
    /**
     * Handle Expo API response and mark invalid tokens as inactive
     */
    async handleExpoResponse(responses, messages) {
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const message = messages[i];
            if (response.status === 'error') {
                logger_1.default.warn('Push notification failed', {
                    push_token: message.to,
                    error: response.message,
                    details: response.details,
                });
                // Mark device as inactive if token is invalid
                if (response.details?.error === 'DeviceNotRegistered' ||
                    response.message === 'ExpoPushToken is not valid') {
                    await prisma.device.updateMany({
                        where: {
                            push_token: message.to,
                        },
                        data: {
                            is_active: false,
                        },
                    });
                    logger_1.default.info('Marked device as inactive', { push_token: message.to });
                }
            }
        }
    }
    /**
     * Get unread notification count for a user (for badge)
     */
    async getUnreadCount(userId) {
        return await prisma.notification.count({
            where: {
                user_id: userId,
                read_at: null,
            },
        });
    }
    /**
     * Register a new device
     */
    async registerDevice(params) {
        try {
            const { userId, tenantId, pushToken, deviceId, platform } = params;
            // Upsert device (update if exists, create if not)
            await prisma.device.upsert({
                where: {
                    device_id_user_id: {
                        device_id: deviceId,
                        user_id: userId,
                    },
                },
                update: {
                    push_token: pushToken,
                    platform,
                    is_active: true,
                },
                create: {
                    user_id: userId,
                    tenant_id: tenantId,
                    push_token: pushToken,
                    device_id: deviceId,
                    platform,
                    is_active: true,
                },
            });
            logger_1.default.info('Device registered successfully', {
                user_id: userId,
                device_id: deviceId,
                platform,
            });
        }
        catch (error) {
            logger_1.default.error('Failed to register device', {
                error: error.message,
                user_id: params.userId,
            });
            throw error;
        }
    }
    /**
     * Unregister a device (mark as inactive)
     */
    async unregisterDevice(deviceId, userId) {
        try {
            await prisma.device.updateMany({
                where: {
                    device_id: deviceId,
                    user_id: userId,
                },
                data: {
                    is_active: false,
                },
            });
            logger_1.default.info('Device unregistered', { device_id: deviceId, user_id: userId });
        }
        catch (error) {
            logger_1.default.error('Failed to unregister device', {
                error: error.message,
                device_id: deviceId,
            });
            throw error;
        }
    }
    /**
     * Helper: Split array into chunks
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
exports.PushNotificationService = PushNotificationService;
exports.default = new PushNotificationService(); // Default export for production
//# sourceMappingURL=PushNotificationService.js.map