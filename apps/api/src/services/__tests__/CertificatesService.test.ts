// Mock Prisma Client
const mockCertificate = {
  create: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}

const mockProperty = {
  findFirst: jest.fn(),
  findUnique: jest.fn()
}

jest.mock('@rightfit/database', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      certificate: mockCertificate,
      property: mockProperty
    })),
    CertificateType: {
      GAS_SAFETY: 'GAS_SAFETY',
      ELECTRICAL_SAFETY: 'ELECTRICAL_SAFETY',
      ENERGY_PERFORMANCE: 'ENERGY_PERFORMANCE',
      FIRE_SAFETY: 'FIRE_SAFETY',
      LANDLORD_INSURANCE: 'LANDLORD_INSURANCE'
    }
  }
})

// Mock S3 client
jest.mock('../../utils/s3Client', () => ({
  s3Client: null,
  S3_BUCKET_NAME: 'test-bucket',
  S3_BUCKET_URL: 'https://test-bucket.s3.amazonaws.com',
  USE_LOCAL_STORAGE: true,
  LOCAL_STORAGE_PATH: 'I:\\RightFit-Services\\apps\\api\\uploads'
}))

// Mock fs
jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn()
}))

// Import service after mocks
import { CertificatesService } from '../CertificatesService'

describe('CertificatesService', () => {
  let certificatesService: CertificatesService
  const tenantId = 'tenant-123'

  beforeEach(() => {
    jest.clearAllMocks()
    certificatesService = new CertificatesService()
  })

  describe('create', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'certificate.pdf',
      mimetype: 'application/pdf'
    } as Express.Multer.File

    const certificateData = {
      property_id: 'property-123',
      certificate_type: 'GAS_SAFETY' as const,
      issue_date: '2025-01-01',
      expiry_date: '2026-01-01',
      certificate_number: 'GAS-12345',
      issuer_name: 'UK Gas Safe',
      notes: 'Annual inspection'
    }

    beforeEach(() => {
      mockProperty.findFirst.mockResolvedValue({
        id: 'property-123',
        tenant_id: tenantId,
        name: 'Test Property'
      })

      mockCertificate.create.mockResolvedValue({
        id: 'cert-123',
        tenant_id: tenantId,
        property_id: certificateData.property_id,
        certificate_type: certificateData.certificate_type,
        issue_date: new Date(certificateData.issue_date),
        expiry_date: new Date(certificateData.expiry_date),
        document_url: 'http://localhost:3001/uploads/test.pdf',
        certificate_number: certificateData.certificate_number,
        issuer_name: certificateData.issuer_name,
        notes: certificateData.notes,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      })
    })

    it('should create a certificate successfully', async () => {
      const result = await certificatesService.create(tenantId, mockFile, certificateData)

      expect(mockProperty.findFirst).toHaveBeenCalledWith({
        where: {
          id: certificateData.property_id,
          tenant_id: tenantId,
          deleted_at: null
        }
      })

      expect(mockCertificate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenant_id: tenantId,
          property_id: certificateData.property_id,
          certificate_type: certificateData.certificate_type
        }),
        include: expect.anything()
      })

      expect(result).toHaveProperty('id')
      expect(result.tenant_id).toBe(tenantId)
    })

    it('should throw error if property not found', async () => {
      mockProperty.findFirst.mockResolvedValue(null)

      await expect(
        certificatesService.create(tenantId, mockFile, certificateData)
      ).rejects.toThrow('Property not found')
    })

    it('should throw error if expiry date is before issue date', async () => {
      const invalidData = {
        ...certificateData,
        issue_date: '2026-01-01',
        expiry_date: '2025-01-01'
      }

      await expect(
        certificatesService.create(tenantId, mockFile, invalidData)
      ).rejects.toThrow('Expiry date must be after issue date')
    })
  })

  describe('list', () => {
    it('should get all certificates for a tenant', async () => {
      const mockCerts = [
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

      mockCertificate.findMany.mockResolvedValue(mockCerts)

      const result = await certificatesService.list(tenantId, {})

      expect(mockCertificate.findMany).toHaveBeenCalledWith({
        where: {
          tenant_id: tenantId,
          deleted_at: null
        },
        include: expect.anything(),
        orderBy: expect.anything()
      })

      expect(result).toHaveLength(2)
    })

    it('should filter by property_id', async () => {
      mockCertificate.findMany.mockResolvedValue([])

      await certificatesService.list(tenantId, { property_id: 'property-123' })

      expect(mockCertificate.findMany).toHaveBeenCalledWith({
        where: {
          tenant_id: tenantId,
          property_id: 'property-123',
          deleted_at: null
        },
        include: expect.anything(),
        orderBy: expect.anything()
      })
    })

    it('should filter by certificate_type', async () => {
      mockCertificate.findMany.mockResolvedValue([])

      await certificatesService.list(tenantId, { certificate_type: 'GAS_SAFETY' })

      expect(mockCertificate.findMany).toHaveBeenCalledWith({
        where: {
          tenant_id: tenantId,
          certificate_type: 'GAS_SAFETY',
          deleted_at: null
        },
        include: expect.anything(),
        orderBy: expect.anything()
      })
    })
  })

  describe('getById', () => {
    it('should get certificate by id', async () => {
      const mockCert = {
        id: 'cert-123',
        tenant_id: tenantId,
        certificate_type: 'GAS_SAFETY'
      }

      mockCertificate.findFirst.mockResolvedValue(mockCert)

      const result = await certificatesService.getById(tenantId, 'cert-123')

      expect(mockCertificate.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'cert-123',
          tenant_id: tenantId,
          deleted_at: null
        },
        include: expect.anything()
      })

      expect(result).toEqual(mockCert)
    })

    it('should return null if certificate not found', async () => {
      mockCertificate.findFirst.mockResolvedValue(null)

      const result = await certificatesService.getById(tenantId, 'non-existent')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update certificate successfully', async () => {
      mockCertificate.findFirst.mockResolvedValue({
        id: 'cert-123',
        tenant_id: tenantId
      })

      mockCertificate.update.mockResolvedValue({
        id: 'cert-123',
        tenant_id: tenantId,
        notes: 'Updated notes'
      })

      const result = await certificatesService.update(tenantId, 'cert-123', {
        notes: 'Updated notes'
      })

      expect(mockCertificate.update).toHaveBeenCalledWith({
        where: { id: 'cert-123' },
        data: expect.objectContaining({
          notes: 'Updated notes'
        }),
        include: expect.anything()
      })

      expect(result.notes).toBe('Updated notes')
    })

    it('should throw error if certificate not found', async () => {
      mockCertificate.findFirst.mockResolvedValue(null)

      await expect(
        certificatesService.update(tenantId, 'non-existent', { notes: 'test' })
      ).rejects.toThrow('Certificate not found')
    })
  })

  describe('delete', () => {
    it('should soft delete certificate successfully', async () => {
      mockCertificate.findFirst.mockResolvedValue({
        id: 'cert-123',
        tenant_id: tenantId
      })

      mockCertificate.update.mockResolvedValue({
        id: 'cert-123',
        deleted_at: new Date()
      })

      await certificatesService.delete(tenantId, 'cert-123')

      expect(mockCertificate.update).toHaveBeenCalledWith({
        where: { id: 'cert-123' },
        data: {
          deleted_at: expect.any(Date)
        }
      })
    })

    it('should throw error if certificate not found', async () => {
      mockCertificate.findFirst.mockResolvedValue(null)

      await expect(
        certificatesService.delete(tenantId, 'non-existent')
      ).rejects.toThrow('Certificate not found')
    })
  })
})
