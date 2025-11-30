"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAINTENANCE_SOURCES = exports.MAINTENANCE_PRIORITIES = exports.MAINTENANCE_CATEGORIES = exports.SUBSCRIPTION_STATUSES = exports.USER_ROLES = exports.PROPERTY_STATUSES = exports.PROPERTY_TYPES = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.RATE_LIMIT_REGISTER_WINDOW_MS = exports.RATE_LIMIT_REGISTER_MAX = exports.RATE_LIMIT_LOGIN_WINDOW_MS = exports.RATE_LIMIT_LOGIN_MAX = exports.BCRYPT_SALT_ROUNDS = exports.JWT_REFRESH_EXPIRY = exports.JWT_ACCESS_EXPIRY = void 0;
// JWT constants
exports.JWT_ACCESS_EXPIRY = '1h';
exports.JWT_REFRESH_EXPIRY = '30d';
// Password hashing
exports.BCRYPT_SALT_ROUNDS = 10;
// Rate limiting
exports.RATE_LIMIT_LOGIN_MAX = 5;
exports.RATE_LIMIT_LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
exports.RATE_LIMIT_REGISTER_MAX = 3;
exports.RATE_LIMIT_REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
// Pagination
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
// Property types
exports.PROPERTY_TYPES = ['HOUSE', 'FLAT', 'COTTAGE', 'COMMERCIAL'];
exports.PROPERTY_STATUSES = ['ACTIVE', 'INACTIVE'];
// User roles
exports.USER_ROLES = ['ADMIN', 'MEMBER', 'CONTRACTOR'];
// Subscription statuses
exports.SUBSCRIPTION_STATUSES = ['TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED'];
// Maintenance job categories
exports.MAINTENANCE_CATEGORIES = [
    'PLUMBING',
    'ELECTRICAL',
    'HVAC',
    'APPLIANCE',
    'CARPENTRY',
    'PAINTING',
    'FLOORING',
    'ROOFING',
    'WINDOWS_DOORS',
    'PEST_CONTROL',
    'LANDSCAPING',
    'OTHER'
];
// Maintenance job priorities
exports.MAINTENANCE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
// Maintenance job sources
exports.MAINTENANCE_SOURCES = [
    'CUSTOMER_REQUEST',
    'CLEANER_REPORT',
    'GUEST_REPORT',
    'PREVENTIVE_MAINTENANCE',
    'EMERGENCY'
];
//# sourceMappingURL=index.js.map