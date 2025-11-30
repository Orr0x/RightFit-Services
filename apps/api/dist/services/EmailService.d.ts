declare class EmailService {
    private resend;
    private isConfigured;
    constructor();
    /**
     * Send certificate expiry email notification
     */
    sendCertificateExpiryEmail(params: {
        to: string;
        ownerName: string;
        certificateType: string;
        propertyName: string;
        expiryDate: Date;
        daysUntilExpiry: number;
    }): Promise<void>;
    /**
     * Send welcome email to new user
     */
    sendWelcomeEmail(params: {
        to: string;
        name: string;
    }): Promise<void>;
}
export { EmailService };
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=EmailService.d.ts.map