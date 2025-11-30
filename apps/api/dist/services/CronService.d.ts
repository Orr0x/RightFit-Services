declare class CronService {
    private jobs;
    /**
     * Initialize all scheduled cron jobs
     */
    init(): void;
    /**
     * Stop all cron jobs
     */
    stop(): void;
    /**
     * Manually trigger certificate expiry check (for testing)
     */
    triggerCertificateExpiryCheck(): Promise<void>;
}
declare const _default: CronService;
export default _default;
//# sourceMappingURL=CronService.d.ts.map