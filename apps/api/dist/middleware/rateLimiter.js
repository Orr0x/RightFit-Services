"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalApiRateLimiter = exports.passwordResetRateLimiter = exports.registerRateLimiter = exports.loginRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.registerRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
    message: 'Too many registration attempts. Please try again after 1 hour.',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.passwordResetRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
    message: 'Too many password reset requests. Please try again after 1 hour.',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.generalApiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map