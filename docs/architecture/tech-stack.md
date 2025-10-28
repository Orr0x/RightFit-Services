# Technical Stack Deep Dive

**Last Updated:** 2025-10-28
**Status:** ✅ Updated for Stable Stack Migration (React 18.3.1 + Node 20 LTS)

> **IMPORTANT:** This document has been updated following ADR-005 to reflect the migration from React 19 + Node 24 to stable versions. See [MIGRATION_PLAN.md](../MIGRATION_PLAN.md) for details.

---

## Frontend - Mobile (React Native)

### Core Framework

**React Native 0.73+ with Expo 52+**

**Migration Note (2025-10-28):** Updated to React 18.3.1 (from 19.x) and Expo SDK 52 (from 54) for ecosystem compatibility and stability.

**Key Libraries:**
```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-native": "0.73.6",
    "expo": "~52.0.0",

    // UI Components
    "react-native-paper": "^5.11.0",
    "react-native-vector-icons": "^10.0.3",

    // Navigation
    "@ react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/bottom-tabs": "^6.5.11",

    // State Management
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",

    // Offline Database
    "@nozbe/watermelondb": "^0.27.1",
    "@nozbe/with-observables": "^1.6.0",

    // Network
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.17.0",

    // Camera & Photos
    "expo-camera": "~14.0.0",
    "expo-image-picker": "~14.7.0",
    "expo-image-manipulator": "~11.8.0",

    // Notifications
    "expo-notifications": "~0.27.0",
    "@react-native-firebase/messaging": "^19.0.0",

    // Location
    "expo-location": "~16.5.0",

    // Forms & Validation
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",

    // Utilities
    "date-fns": "^3.0.6",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/react": "18.3.12",
    "@types/react-native": "^0.73.0",
    "typescript": "^5.3.3",

    // Testing
    "@testing-library/react-native": "^12.4.2",
    "jest": "^29.7.0",
    "detox": "^20.14.8"
  }
}
```

### Offline-First Architecture

**WatermelonDB Configuration:**

```typescript
// apps/mobile/src/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'properties',
      columns: [
        { name: 'remote_id', type: 'string', isIndexed: true },
        { name: 'tenant_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'address_line1', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'postcode', type: 'string' },
        { name: 'property_type', type: 'string' },
        { name: 'bedrooms', type: 'number' },
        { name: 'bathrooms', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'synced_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'work_orders',
      columns: [
        { name: 'remote_id', type: 'string', isIndexed: true },
        { name: 'tenant_id', type: 'string', isIndexed: true },
        { name: 'property_id', type: 'string', isIndexed: true },
        { name: 'contractor_id', type: 'string', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'synced_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'action_type', type: 'string' },  // CREATE, UPDATE, DELETE
        { name: 'entity_type', type: 'string' },  // work_order, photo
        { name: 'entity_id', type: 'string' },
        { name: 'payload', type: 'string' },      // JSON string
        { name: 'status', type: 'string' },       // PENDING, SYNCING, SYNCED, FAILED
        { name: 'retry_count', type: 'number' },
        { name: 'created_at', type: 'number' },
      ]
    }),
  ]
})
```

**Sync Strategy:**

```typescript
// apps/mobile/src/services/SyncService.ts
export class SyncService {
  async syncOfflineChanges() {
    const queue = await database.get<SyncQueueItem>('sync_queue')
      .query(Q.where('status', 'PENDING'))
      .fetch()

    for (const item of queue) {
      try {
        await item.update(q => q.status = 'SYNCING')

        const result = await this.syncItem(item)

        if (result.success) {
          // Update local record with server ID
          await this.updateLocalRecord(item.entity_type, item.entity_id, result.server_id)
          await item.update(q => {
            q.status = 'SYNCED'
            q.synced_at = Date.now()
          })
        } else if (result.conflict) {
          // Server has newer data, apply server data locally
          await this.resolveConflict(item, result.server_data)
          await item.update(q => q.status = 'SYNCED')
        }
      } catch (error) {
        await item.update(q => {
          q.status = 'FAILED'
          q.retry_count += 1
          q.last_error = error.message
        })
      }
    }
  }

  async pullServerChanges(since: number) {
    const response = await api.get(`/sync/delta?since=${since}&entities=work_orders,properties`)

    await database.write(async () => {
      for (const workOrder of response.data.work_orders) {
        await this.upsertLocalRecord('work_orders', workOrder)
      }
      for (const property of response.data.properties) {
        await this.upsertLocalRecord('properties', property)
      }
      // Handle deletions
      for (const deletedId of response.data.deleted_ids.work_orders) {
        await this.deleteLocalRecord('work_orders', deletedId)
      }
    })
  }
}
```

---

## Frontend - Web (React)

### Core Framework

**React 18.3.1 with Vite**

**Migration Note (2025-10-28):** Updated to React 18.3.1 (from 19.x) and MUI 5.x (from 7.x) for ecosystem compatibility and stability.

**Key Libraries:**
```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",

    // UI Components
    "@mui/material": "5.16.9",
    "@mui/icons-material": "5.16.9",
    "@emotion/react": "11.13.5",
    "@emotion/styled": "11.13.5",

    // Routing
    "react-router-dom": "^6.21.1",

    // State Management
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",

    // Network
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.17.0",

    // Forms
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",

    // Data Visualization
    "recharts": "^2.10.3",

    // Calendar
    "react-big-calendar": "^1.10.0",
    "date-fns": "^3.0.6",

    // Styling
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.5",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "typescript": "^5.3.3",

    // Testing
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "vitest": "^1.1.0",
    "playwright": "^1.40.1"
  }
}
```

**Vite Configuration:**

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-data': ['@tanstack/react-query', '@reduxjs/toolkit'],
        }
      }
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## Backend - Node.js + Express

### Core Framework

**Node.js 20 LTS + Express 4.x**

**Migration Note (2025-10-28):** Updated to Node.js 20 LTS (from Node 24) for stability. Node 20 is supported until April 2026.

**Key Libraries:**
```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",

    // Database
    "@prisma/client": "^5.7.1",

    // Authentication
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",

    // Validation
    "zod": "^3.22.4",
    "express-validator": "^7.0.1",

    // File Upload
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "@aws-sdk/client-s3": "^3.478.0",
    "@aws-sdk/s3-request-presigner": "^3.478.0",

    // External APIs
    "stripe": "^14.10.0",
    "twilio": "^4.20.0",
    "@sendgrid/mail": "^8.1.0",
    "@google-cloud/vision": "^4.1.0",

    // Utilities
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "date-fns": "^3.0.6",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "prisma": "^5.7.1",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",

    // Testing
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

### Express App Structure

```typescript
// apps/api/src/index.ts
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { tenantMiddleware } from './middleware/tenant'
import { requestLogger } from './middleware/logger'
import routes from './routes'

const app = express()

// Security & Performance Middleware
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(requestLogger)

// Health Check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes (all require auth)
app.use('/api/v1', authMiddleware, tenantMiddleware, routes)

// Error Handling
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`)
})
```

### Prisma ORM Setup

```typescript
// packages/database/prisma/client.ts
import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma Client
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prisma = global.prisma
}

// Middleware: Auto-inject tenant_id filter (multi-tenancy enforcement)
prisma.$use(async (params, next) => {
  const tenantId = params.args.__tenant_id  // Injected by tenant middleware

  if (tenantId && params.model) {
    // Only filter models that have tenant_id column
    const modelsWithTenantId = ['Property', 'WorkOrder', 'Contractor', 'Certificate', 'Photo']

    if (modelsWithTenantId.includes(params.model)) {
      if (params.action === 'findMany' || params.action === 'findFirst') {
        params.args.where = { ...params.args.where, tenant_id: tenantId, deleted_at: null }
      } else if (params.action === 'update' || params.action === 'delete') {
        params.args.where = { ...params.args.where, tenant_id: tenantId }
      }
    }
  }

  return next(params)
})

export { prisma}
```

---

## AWS Infrastructure

### S3 Photo Upload

```typescript
// apps/api/src/services/PhotoService.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

export class PhotoService {
  async uploadPhoto(file: Express.Multer.File, tenantId: string): Promise<PhotoUploadResult> {
    const photoId = uuidv4()

    // Optimize image (compress, strip EXIF for privacy)
    const optimized = await sharp(file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .rotate() // Auto-rotate based on EXIF
      .toBuffer()

    // Generate thumbnail
    const thumbnail = await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Upload to S3
    const s3Key = `tenants/${tenantId}/photos/${photoId}.jpg`
    const thumbnailKey = `tenants/${tenantId}/photos/${photoId}_thumb.jpg`

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_PHOTOS!,
      Key: s3Key,
      Body: optimized,
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=31536000', // 1 year
    }))

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_PHOTOS!,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=31536000',
    }))

    // CloudFront URLs
    const s3Url = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`
    const thumbnailUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${thumbnailKey}`

    return { photoId, s3Key, s3Url, thumbnailUrl }
  }
}
```

---

