import request from 'supertest'
import express, { Express } from 'express'
import jwt from 'jsonwebtoken'

// Mock the certificates service
const mockCertificatesService = {
  create: jest.fn(),
  list: jest.fn(),
  getExpiringSoon: jest.fn(),
  getExpired: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}

jest.mock('../../services/CertificatesService', () => ({
  __esModule: true,
  default: mockCertificatesService
}))

// Mock authenticate middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      user_id: 'user-123',
      tenant_id: 'tenant-123',
      email: 'test@example.com',
      role: 'ADMIN'
    }
    next()
  }
}))

// Mock multer upload middleware
jest.mock('../../middleware/upload', () => ({
  uploadDocument: {
    single: () => (req: any, _res: any, next: any) => {
      req.file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf'
      }
      next()
    }
  }
}))

// Import router after mocks
import certificatesRouter from '../certificates'

describe('Certificates API Integration Tests', () => {
  let app: Express
  let authToken: string
  const tenantId = 'tenant-123'
  const userId = 'user-123'

  beforeAll(() => {
    // Create auth token
    authToken = jwt.sign(
      { userId, tenantId },
      process.env.JWT_SECRET || 'test-secret'
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup express app
    app = express()
    app.use(express.json())
    app.use('/api/certificates', certificatesRouter)
  })

  describe('POST /api/certificates', () => {
    const mockCertificate = {
      id: 'cert-123',
      tenant_id: tenantId,
      property_id: 'property-123',
      certificate_type: 'GAS_SAFETY',
      issue_date: new Date('2025-01-01'),
      expiry_date: new Date('2026-01-01'),
      document_url: 'https://example.com/cert.pdf',
      created_at: new Date()
    }

    it.skip('should create a new certificate successfully', async () => {
      mockCertificatesService.create.mockResolvedValue(mockCertificate)

      const response = await request(app)
        .post('/api/certificates')
        .set('Authorization', `Bearer ${authToken}`)
        .field('property_id', 'property-123')
        .field('certificate_type', 'GAS_SAFETY')
        .field('issue_date', '2025-01-01')
        .field('expiry_date', '2026-01-01')
        .attach('document', Buffer.from('test'), 'test.pdf')

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('id')
      expect(mockCertificatesService.create).toHaveBeenCalled()
    })

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/certificates')
        .set('Authorization', `Bearer ${authToken}`)
        .field('property_id', 'property-123')
        .attach('document', Buffer.from('test'), 'test.pdf')

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Missing required fields')
    })
  })

  describe('GET /api/certificates', () => {
    it('should list all certificates for tenant', async () => {
      const mockCertificates = [
        {
          id: 'cert-1',
          tenant_id: tenantId,
          certificate_type: 'GAS_SAFETY',
          expiry_date: new Date('2026-01-01')
        },
        {
          id: 'cert-2',
          tenant_id: tenantId,
          certificate_type: 'ELECTRICAL_SAFETY',
          expiry_date: new Date('2026-06-01')
        }
      ]

      mockCertificatesService.list.mockResolvedValue(mockCertificates)

      const response = await request(app)
        .get('/api/certificates')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(mockCertificatesService.list).toHaveBeenCalledWith(tenantId, {})
    })

    it('should filter by property_id', async () => {
      mockCertificatesService.list.mockResolvedValue([])

      const response = await request(app)
        .get('/api/certificates?property_id=property-123')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(mockCertificatesService.list).toHaveBeenCalledWith(
        tenantId,
        { property_id: 'property-123' }
      )
    })
  })

  describe('GET /api/certificates/expiring-soon', () => {
    it('should get expiring soon certificates', async () => {
      const mockCertificates = [
        {
          id: 'cert-1',
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ]

      mockCertificatesService.getExpiringSoon.mockResolvedValue(mockCertificates)

      const response = await request(app)
        .get('/api/certificates/expiring-soon')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(mockCertificatesService.getExpiringSoon).toHaveBeenCalledWith(tenantId, 60)
    })

    it('should accept custom days_ahead parameter', async () => {
      mockCertificatesService.getExpiringSoon.mockResolvedValue([])

      await request(app)
        .get('/api/certificates/expiring-soon?days_ahead=30')
        .set('Authorization', `Bearer ${authToken}`)

      expect(mockCertificatesService.getExpiringSoon).toHaveBeenCalledWith(tenantId, 30)
    })
  })

  describe('GET /api/certificates/expired', () => {
    it('should get expired certificates', async () => {
      const mockCertificates = [
        {
          id: 'cert-1',
          expiry_date: new Date('2024-01-01')
        }
      ]

      mockCertificatesService.getExpired.mockResolvedValue(mockCertificates)

      const response = await request(app)
        .get('/api/certificates/expired')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(mockCertificatesService.getExpired).toHaveBeenCalledWith(tenantId)
    })
  })

  describe('GET /api/certificates/:id', () => {
    it('should get certificate by id', async () => {
      const mockCertificate = {
        id: 'cert-123',
        tenant_id: tenantId,
        certificate_type: 'GAS_SAFETY'
      }

      mockCertificatesService.getById.mockResolvedValue(mockCertificate)

      const response = await request(app)
        .get('/api/certificates/cert-123')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe('cert-123')
    })

    it('should return null for non-existent certificate', async () => {
      mockCertificatesService.getById.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/certificates/non-existent')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeNull()
    })
  })

  describe('PATCH /api/certificates/:id', () => {
    it('should update certificate successfully', async () => {
      const updatedCert = {
        id: 'cert-123',
        notes: 'Updated notes'
      }

      mockCertificatesService.update.mockResolvedValue(updatedCert)

      const response = await request(app)
        .patch('/api/certificates/cert-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Updated notes' })

      expect(response.status).toBe(200)
      expect(response.body.data.notes).toBe('Updated notes')
    })
  })

  describe('DELETE /api/certificates/:id', () => {
    it('should delete certificate successfully', async () => {
      mockCertificatesService.delete.mockResolvedValue(undefined)

      const response = await request(app)
        .delete('/api/certificates/cert-123')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(204)
      expect(mockCertificatesService.delete).toHaveBeenCalledWith(tenantId, 'cert-123')
    })
  })
})
