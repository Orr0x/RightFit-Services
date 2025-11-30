"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}
function generateAccessToken(payload) {
    const options = {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h',
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
function generateRefreshToken(payload) {
    const options = {
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
    };
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, options);
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
}
//# sourceMappingURL=jwt.js.map