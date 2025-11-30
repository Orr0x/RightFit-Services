"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const CronService_1 = __importDefault(require("../services/CronService"));
const NotificationService_1 = __importDefault(require("../services/NotificationService"));
const router = (0, express_1.Router)();
// Test endpoint for development - no auth required (REMOVE IN PRODUCTION!)
router.post('/test-notification', async (_req, res) => {
    try {
        await NotificationService_1.default.checkAndSendCertificateExpiryNotifications();
        res.json({ message: 'Test notification check completed' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// All routes below require authentication
router.use(auth_1.authenticate);
// Manually trigger certificate expiry check (for testing)
router.post('/trigger-certificate-check', async (_req, res) => {
    try {
        await CronService_1.default.triggerCertificateExpiryCheck();
        res.json({ message: 'Certificate expiry check triggered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get certificate summary for dashboard
router.get('/certificate-summary', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const summary = await NotificationService_1.default.getCertificateSummary(tenantId);
        res.json({ data: summary });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map