"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron = __importStar(require("node-cron"));
const NotificationService_1 = __importDefault(require("./NotificationService"));
const logger_1 = __importDefault(require("../utils/logger"));
class CronService {
    jobs = [];
    /**
     * Initialize all scheduled cron jobs
     */
    init() {
        // Run certificate expiry notifications daily at 9 AM UK time
        const certificateExpiryJob = cron.schedule('0 9 * * *', // Every day at 9:00 AM
        async () => {
            logger_1.default.info('Running certificate expiry notification job');
            try {
                await NotificationService_1.default.checkAndSendCertificateExpiryNotifications();
                logger_1.default.info('Certificate expiry notification job completed successfully');
            }
            catch (error) {
                logger_1.default.error('Certificate expiry notification job failed', {
                    error: error.message,
                });
            }
        }, {
            timezone: 'Europe/London', // UK timezone
        });
        this.jobs.push(certificateExpiryJob);
        logger_1.default.info('Cron jobs initialized', {
            jobs: [
                {
                    name: 'Certificate Expiry Notifications',
                    schedule: '9:00 AM daily (UK time)',
                },
            ],
        });
    }
    /**
     * Stop all cron jobs
     */
    stop() {
        this.jobs.forEach((job) => job.stop());
        logger_1.default.info('All cron jobs stopped');
    }
    /**
     * Manually trigger certificate expiry check (for testing)
     */
    async triggerCertificateExpiryCheck() {
        logger_1.default.info('Manually triggering certificate expiry check');
        await NotificationService_1.default.checkAndSendCertificateExpiryNotifications();
    }
}
exports.default = new CronService();
//# sourceMappingURL=CronService.js.map