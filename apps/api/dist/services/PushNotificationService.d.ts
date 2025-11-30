import { NotificationType } from '@rightfit/database';
interface PushNotificationPayload {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    notificationType: NotificationType;
    priority?: 'default' | 'normal' | 'high';
}
declare class PushNotificationService {
    private readonly EXPO_PUSH_URL;
    private readonly MAX_BATCH_SIZE;
    /**
     * Send push notification to a specific user
     */
    sendNotification(payload: PushNotificationPayload): Promise<void>;
    /**
     * Send push notifications to multiple users (batch)
     */
    sendBatchNotifications(notifications: PushNotificationPayload[]): Promise<void>;
    /**
     * Send messages to Expo Push Notification service
     */
    private sendToExpo;
    /**
     * Handle Expo API response and mark invalid tokens as inactive
     */
    private handleExpoResponse;
    /**
     * Get unread notification count for a user (for badge)
     */
    private getUnreadCount;
    /**
     * Register a new device
     */
    registerDevice(params: {
        userId: string;
        tenantId: string;
        pushToken: string;
        deviceId: string;
        platform: 'IOS' | 'ANDROID';
    }): Promise<void>;
    /**
     * Unregister a device (mark as inactive)
     */
    unregisterDevice(deviceId: string, userId: string): Promise<void>;
    /**
     * Helper: Split array into chunks
     */
    private chunkArray;
}
export { PushNotificationService };
declare const _default: PushNotificationService;
export default _default;
//# sourceMappingURL=PushNotificationService.d.ts.map