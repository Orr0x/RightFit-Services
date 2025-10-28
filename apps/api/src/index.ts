// Load environment variables FIRST before any other imports
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import authRoutes from './routes/auth'
import propertiesRoutes from './routes/properties'
import workOrdersRoutes from './routes/work-orders'
import contractorsRoutes from './routes/contractors'
import photosRoutes from './routes/photos'
import certificatesRoutes from './routes/certificates'
import adminRoutes from './routes/admin'
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
app.use(
  '/uploads',
  cors({
    origin: true, // Allow all origins in development
    credentials: false,
  }),
  express.static('./uploads', {
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
app.use('/api/admin', adminRoutes)

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
