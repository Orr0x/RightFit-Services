"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePropertySchema = exports.createPropertySchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').max(255),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirm_password: zod_1.z.string(),
    full_name: zod_1.z.string().min(1, 'Full name is required').max(100),
    company_name: zod_1.z.string().max(100).optional(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().uuid(),
    new_password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirm_password: zod_1.z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
});
exports.changePasswordSchema = zod_1.z.object({
    current_password: zod_1.z.string().min(1, 'Current password is required'),
    new_password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirm_password: zod_1.z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
});
// Property schemas
exports.createPropertySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Property name is required').max(100),
    address_line1: zod_1.z.string().min(1, 'Address is required').max(255),
    address_line2: zod_1.z.string().max(255).optional(),
    city: zod_1.z.string().min(1, 'City is required').max(100),
    postcode: zod_1.z
        .string()
        .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, 'Invalid UK postcode format')
        .transform((val) => val.toUpperCase()),
    property_type: zod_1.z.enum(['HOUSE', 'FLAT', 'COTTAGE', 'COMMERCIAL']),
    bedrooms: zod_1.z.number().int().min(0).max(50),
    bathrooms: zod_1.z.number().int().min(0).max(20),
    access_instructions: zod_1.z.string().max(1000).optional(),
});
exports.updatePropertySchema = exports.createPropertySchema.partial();
//# sourceMappingURL=index.js.map