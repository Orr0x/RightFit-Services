declare class NotificationService {
    /**
     * Check for expiring certificates and send notifications
     * Sends alerts at 60, 30, and 7 days before expiry
     */
    checkAndSendCertificateExpiryNotifications(): Promise<void>;
    /**
     * Check for certificates that have already expired
     */
    private checkExpiredCertificates;
    /**
     * Send push notification for certificate expiry
     */
    private sendPushNotification;
    /**
     * Send email notification using SendGrid
     */
    private sendEmailNotification;
    /**
     * Send SMS notification (uses existing SmsService)
     * Commented out for now - can be enabled when needed
     */
    /**
     * Send urgent notification for expired certificates
     */
    private sendUrgentExpiredNotification;
    /**
     * Format certificate type for display
     */
    private formatCertificateType;
    /**
     * Get dashboard summary of certificate status
     */
    getCertificateSummary(tenantId: string): Promise<{
        total: number;
        expiring_soon: number;
        expired: number;
        up_to_date: number;
    }>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=NotificationService.d.ts.map