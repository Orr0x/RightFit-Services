"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PushNotificationService_1 = __importDefault(require("../services/PushNotificationService"));
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
/**
 * POST /api/devices/register
 * Register a device for push notifications
 */
router.post('/register', auth_1.authenticate, async (req, res) => {
    try {
        const { push_token, device_id, platform } = req.body;
        const userId = req.user?.id;
        const tenantId = req.user?.tenant_id;
        // Validate required fields
        if (!push_token || !device_id || !platform) {
            return res.status(400).json({
                error: 'Missing required fields: push_token, device_id, platform',
            });
        }
        // Validate platform
        if (platform !== 'IOS' && platform !== 'ANDROID') {
            return res.status(400).json({
                error: 'Invalid platform. Must be IOS or ANDROID',
            });
        }
        // Register device
        await PushNotificationService_1.default.registerDevice({
            userId,
            tenantId,
            pushToken: push_token,
            deviceId: device_id,
            platform,
        });
        return res.status(200).json({
            message: 'Device registered successfully',
            device_id,
        });
    }
    catch (error) {
        logger_1.default.error('Failed to register device', {
            error: error.message,
            user_id: req.user?.id,
        });
        return res.status(500).json({
            error: 'Failed to register device',
        });
    }
});
/**
 * POST /api/devices/unregister
 * Unregister a device (mark as inactive)
 */
router.post('/unregister', auth_1.authenticate, async (req, res) => {
    try {
        const { device_id } = req.body;
        const userId = req.user?.id;
        if (!device_id) {
            return res.status(400).json({
                error: 'Missing required field: device_id',
            });
        }
        await PushNotificationService_1.default.unregisterDevice(device_id, userId);
        return res.status(200).json({
            message: 'Device unregistered successfully',
        });
    }
    catch (error) {
        logger_1.default.error('Failed to unregister device', {
            error: error.message,
            user_id: req.user?.id,
        });
        return res.status(500).json({
            error: 'Failed to unregister device',
        });
    }
});
exports.default = router;
//# sourceMappingURL=devices.js.map