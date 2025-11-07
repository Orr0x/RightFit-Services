// Load environment variables FIRST before any other imports
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import path from 'path'
import authRoutes from './routes/auth'
import propertiesRoutes from './routes/properties'
import workOrdersRoutes from './routes/work-orders'
import contractorsRoutes from './routes/contractors'
import photosRoutes from './routes/photos'
import certificatesRoutes from './routes/certificates'
import devicesRoutes from './routes/devices'
import notificationsRoutes from './routes/notifications'
import adminRoutes from './routes/admin'
import financialRoutes from './routes/financial'
import propertyTenantsRoutes from './routes/property-tenants'
import cleaningJobsRoutes from './routes/cleaning-jobs'
import maintenanceJobsRoutes from './routes/maintenance-jobs'
import workersRoutes from './routes/workers'
import quotesRoutes from './routes/quotes'
import invoicesRoutes from './routes/invoices'
import cleaningInvoicesRoutes from './routes/cleaning-invoices'
import cleaningQuotesRoutes from './routes/cleaning-quotes'
import externalContractorsRoutes from './routes/external-contractors'
import guestIssuesRoutes from './routes/guest-issues'
import propertySharesRoutes from './routes/property-shares'
import customersRoutes from './routes/customers'
import customerPropertiesRoutes from './routes/customer-properties'
import customerPortalRoutes from './routes/customer-portal'
import guestRoutes from './routes/guest'
import cleaningContractsRoutes from './routes/cleaning-contracts'
import propertyCalendarsRoutes from './routes/property-calendars'
import cleaningTimesheetsRoutes from './routes/cleaning-timesheets'
import servicesRoutes from './routes/services'
import checklistTemplatesRoutes from './routes/checklist-templates'
import globalActivityRoutes from './routes/global-activity'
import workerAvailabilityRoutes from './routes/worker-availability'
import workerIssuesRoutes from './routes/worker-issues'
import uploadsRoutes from './routes/uploads'
import { errorHandler } from './middleware/errorHandler'
import { generalApiRateLimiter } from './middleware/rateLimiter'
import logger from './utils/logger'
import cronService from './services/CronService'

const app = express()
const PORT = Number(process.env.PORT) || 3000


// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3001',
        'http://localhost:8081',
      ]

      // In development, allow all localhost origins
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
        return callback(null, true)
      }

      // Otherwise check against allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files (for local development without S3)
// Apply CORS to uploads route
const uploadsPath = path.resolve(__dirname, '../uploads')
const publicUploadsPath = path.resolve(__dirname, '../public/uploads')
app.use(
  '/uploads',
  cors({
    origin: true, // Allow all origins in development
    credentials: false,
  }),
  express.static(uploadsPath, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    },
  }),
  express.static(publicUploadsPath, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    },
  })
)

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  next()
})

// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertiesRoutes)
app.use('/api/work-orders', workOrdersRoutes)
app.use('/api/contractors', contractorsRoutes)
app.use('/api/photos', photosRoutes)
app.use('/api/certificates', certificatesRoutes)
app.use('/api/devices', devicesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/financial', financialRoutes)
app.use('/api/tenants', propertyTenantsRoutes)
// NEW: Service Provider Platform routes
app.use('/api/cleaning-jobs', cleaningJobsRoutes)
app.use('/api/maintenance-jobs', maintenanceJobsRoutes)
app.use('/api/workers', workersRoutes)
app.use('/api/quotes', quotesRoutes)
app.use('/api/invoices', invoicesRoutes)
app.use('/api/cleaning-invoices', cleaningInvoicesRoutes)
app.use('/api/cleaning-quotes', cleaningQuotesRoutes)
app.use('/api/external-contractors', externalContractorsRoutes)
app.use('/api/guest-issues', guestIssuesRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/customer-properties', customerPropertiesRoutes)
app.use('/api/customer-portal', customerPortalRoutes)
app.use('/api/guest', guestRoutes)
app.use('/api/cleaning-contracts', cleaningContractsRoutes)
app.use('/api/property-calendars', propertyCalendarsRoutes)
app.use('/api/cleaning-timesheets', cleaningTimesheetsRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/checklist-templates', checklistTemplatesRoutes)
app.use('/api/global-activity', globalActivityRoutes)
app.use('/api/worker-availability', workerAvailabilityRoutes)
app.use('/api/worker-issues', workerIssuesRoutes)
app.use('/api/uploads', uploadsRoutes)
// Property sharing routes
app.use('/api/property-shares', propertySharesRoutes)

// Apply general rate limiting to all other API routes
app.use('/api', generalApiRateLimiter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 API server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)

  // Initialize cron jobs for certificate expiry notifications
  cronService.init()
  logger.info('✅ Cron jobs initialized')
})

export default app
