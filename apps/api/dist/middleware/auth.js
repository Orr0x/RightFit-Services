"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
function authMiddleware(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            user_id: decoded.user_id,
            tenant_id: decoded.tenant_id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        next(new errors_1.UnauthorizedError('Invalid or expired token'));
    }
}
function optionalAuthMiddleware(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            req.user = {
                user_id: decoded.user_id,
                tenant_id: decoded.tenant_id,
                email: decoded.email,
                role: decoded.role,
            };
        }
        next();
    }
    catch (error) {
        // If token is invalid, just continue without user
        next();
    }
}
// Export alias for backwards compatibility
exports.authenticate = authMiddleware;
//# sourceMappingURL=auth.js.map