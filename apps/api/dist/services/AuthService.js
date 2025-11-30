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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("@rightfit/database");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const uuid_1 = require("uuid");
class AuthService {
    async register(input) {
        // Check if user already exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (existingUser) {
            throw new errors_1.ConflictError('Account already exists. Please log in.');
        }
        // Hash password
        const password_hash = await (0, hash_1.hashPassword)(input.password);
        // Create tenant and user in transaction
        const result = await database_1.prisma.$transaction(async (tx) => {
            // Create tenant
            const tenant = await tx.tenant.create({
                data: {
                    tenant_name: input.company_name || input.full_name,
                    subscription_status: 'TRIAL',
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                },
            });
            // Create user
            const user = await tx.user.create({
                data: {
                    tenant_id: tenant.id,
                    email: input.email.toLowerCase(),
                    password_hash,
                    full_name: input.full_name,
                    role: 'ADMIN',
                },
            });
            return { user, tenant };
        });
        // Generate tokens
        const access_token = (0, jwt_1.generateAccessToken)({
            user_id: result.user.id,
            tenant_id: result.user.tenant_id,
            email: result.user.email,
            role: result.user.role,
        });
        const refresh_token = (0, jwt_1.generateRefreshToken)({
            user_id: result.user.id,
            tenant_id: result.user.tenant_id,
        });
        // Return without password_hash
        const { password_hash: _, ...userWithoutPassword } = result.user;
        return {
            user: userWithoutPassword,
            tenant: result.tenant,
            access_token,
            refresh_token,
        };
    }
    async login(input) {
        // Find user
        const user = await database_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
            include: { tenant: true },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Check if user is deleted
        if (user.deleted_at) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Verify password
        const isValid = await (0, hash_1.comparePassword)(input.password, user.password_hash);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Generate tokens
        const access_token = (0, jwt_1.generateAccessToken)({
            user_id: user.id,
            tenant_id: user.tenant_id,
            email: user.email,
            role: user.role,
        });
        const refresh_token = (0, jwt_1.generateRefreshToken)({
            user_id: user.id,
            tenant_id: user.tenant_id,
        });
        // Return without password_hash
        const { password_hash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            tenant: user.tenant,
            access_token,
            refresh_token,
        };
    }
    async refresh(refreshToken) {
        try {
            const { verifyRefreshToken } = await Promise.resolve().then(() => __importStar(require('../utils/jwt')));
            const payload = verifyRefreshToken(refreshToken);
            // Verify user still exists and is not deleted
            const user = await database_1.prisma.user.findUnique({
                where: { id: payload.user_id },
            });
            if (!user || user.deleted_at) {
                throw new errors_1.UnauthorizedError('Invalid refresh token');
            }
            // Generate new access token
            const access_token = (0, jwt_1.generateAccessToken)({
                user_id: user.id,
                tenant_id: user.tenant_id,
                email: user.email,
                role: user.role,
            });
            return { access_token };
        }
        catch (error) {
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
    }
    async forgotPassword(email) {
        // Find user (but don't reveal if they exist for security)
        const user = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user || user.deleted_at) {
            // Don't reveal if user exists - return success anyway
            return;
        }
        // Generate reset token
        const token = (0, uuid_1.v4)();
        const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Store reset token
        await database_1.prisma.passwordResetToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at,
            },
        });
        // TODO: Send email with reset link
        // For now, just log it (in production, integrate with SendGrid)
        console.log(`Password reset link: https://app.rightfitservices.com/reset-password?token=${token}`);
    }
    async resetPassword(token, newPassword) {
        // Find reset token
        const resetToken = await database_1.prisma.passwordResetToken.findUnique({
            where: { token },
        });
        if (!resetToken) {
            throw new errors_1.NotFoundError('Invalid or expired reset token');
        }
        // Check if token is expired or already used
        if (resetToken.expires_at < new Date() || resetToken.used_at) {
            throw new errors_1.NotFoundError('Invalid or expired reset token');
        }
        // Hash new password
        const password_hash = await (0, hash_1.hashPassword)(newPassword);
        // Update password and mark token as used
        await database_1.prisma.$transaction([
            database_1.prisma.user.update({
                where: { id: resetToken.user_id },
                data: { password_hash },
            }),
            database_1.prisma.passwordResetToken.update({
                where: { token },
                data: { used_at: new Date() },
            }),
        ]);
    }
    async changePassword(userId, input) {
        // Find user
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.deleted_at) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Verify current password
        const isValid = await (0, hash_1.comparePassword)(input.current_password, user.password_hash);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Current password is incorrect');
        }
        // Hash new password
        const password_hash = await (0, hash_1.hashPassword)(input.new_password);
        // Update password
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password_hash },
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map