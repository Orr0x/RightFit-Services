"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables FIRST before any other imports
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const auth_1 = __importDefault(require("./routes/auth"));
const properties_1 = __importDefault(require("./routes/properties"));
const work_orders_1 = __importDefault(require("./routes/work-orders"));
const contractors_1 = __importDefault(require("./routes/contractors"));
const photos_1 = __importDefault(require("./routes/photos"));
const certificates_1 = __importDefault(require("./routes/certificates"));
const devices_1 = __importDefault(require("./routes/devices"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const admin_1 = __importDefault(require("./routes/admin"));
const financial_1 = __importDefault(require("./routes/financial"));
const property_tenants_1 = __importDefault(require("./routes/property-tenants"));
const cleaning_jobs_1 = __importDefault(require("./routes/cleaning-jobs"));
const maintenance_jobs_1 = __importDefault(require("./routes/maintenance-jobs"));
const workers_1 = __importDefault(require("./routes/workers"));
const quotes_1 = __importDefault(require("./routes/quotes"));
const guest_issues_1 = __importDefault(require("./routes/guest-issues"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = __importDefault(require("./utils/logger"));
const CronService_1 = __importDefault(require("./services/CronService"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3001',
            'http://localhost:8081',
        ];
        // In development, allow all localhost origins
        if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        // Otherwise check against allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// Body parsing middleware
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files (for local development without S3)
// Apply CORS to uploads route
app.use('/uploads', (0, cors_1.default)({
    origin: true, // Allow all origins in development
    credentials: false,
}), express_1.default.static('./uploads', {
    setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
}));
// Request logging middleware
app.use((req, _res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});
// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/work-orders', work_orders_1.default);
app.use('/api/contractors', contractors_1.default);
app.use('/api/photos', photos_1.default);
app.use('/api/certificates', certificates_1.default);
app.use('/api/devices', devices_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/financial', financial_1.default);
app.use('/api/tenants', property_tenants_1.default);
// NEW: Service Provider Platform routes
app.use('/api/cleaning-jobs', cleaning_jobs_1.default);
app.use('/api/maintenance-jobs', maintenance_jobs_1.default);
app.use('/api/workers', workers_1.default);
app.use('/api/quotes', quotes_1.default);
app.use('/api/guest-issues', guest_issues_1.default);
// Apply general rate limiting to all other API routes
app.use('/api', rateLimiter_1.generalApiRateLimiter);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(PORT, () => {
    logger_1.default.info(`🚀 API server running on port ${PORT}`);
    logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    // Initialize cron jobs for certificate expiry notifications
    CronService_1.default.init();
    logger_1.default.info('✅ Cron jobs initialized');
});
exports.default = app;
//# sourceMappingURL=index.js.map