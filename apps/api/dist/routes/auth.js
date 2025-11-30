"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthService_1 = require("../services/AuthService");
const shared_1 = require("@rightfit/shared");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authService = new AuthService_1.AuthService();
// POST /api/auth/register
router.post('/register', rateLimiter_1.registerRateLimiter, async (req, res, next) => {
    try {
        const input = shared_1.registerSchema.parse(req.body);
        const result = await authService.register(input);
        res.status(201).json({ data: result });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/login
router.post('/login', rateLimiter_1.loginRateLimiter, async (req, res, next) => {
    try {
        const input = shared_1.loginSchema.parse(req.body);
        const result = await authService.login(input);
        res.json({ data: result });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const result = await authService.refresh(refresh_token);
        res.json({ data: result });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/forgot-password
router.post('/forgot-password', rateLimiter_1.passwordResetRateLimiter, async (req, res, next) => {
    try {
        const input = shared_1.forgotPasswordSchema.parse(req.body);
        await authService.forgotPassword(input.email);
        res.json({ message: 'Password reset link sent to your email' });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
    try {
        const input = shared_1.resetPasswordSchema.parse(req.body);
        await authService.resetPassword(input.token, input.new_password);
        res.json({ message: 'Password reset successfully. Please log in.' });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/change-password
router.post('/change-password', auth_1.authenticate, async (req, res, next) => {
    try {
        const input = shared_1.changePasswordSchema.parse(req.body);
        await authService.changePassword(req.user.user_id, input);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map