import { PrismaClient, Certificate, CertificateType } from '@rightfit/database'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, S3_BUCKET_NAME, S3_BUCKET_URL, USE_LOCAL_STORAGE, LOCAL_STORAGE_PATH } from '../utils/s3Client'
import logger from '../utils/logger'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

export interface CreateCertificateDTO {
  property_id: string
  certificate_type: CertificateType
  issue_date: string
  expiry_date: string
  certificate_number?: string
  issuer_name?: string
  notes?: string
}

export interface UpdateCertificateDTO {
  certificate_type?: CertificateType
  issue_date?: string
  expiry_date?: string
  certificate_number?: string
  issuer_name?: string
  notes?: string
}

class CertificatesService {
  async create(
    tenantId: string,
    file: Express.Multer.File,
    data: CreateCertificateDTO
  ): Promise<Certificate> {
    // Verify property belongs to tenant
    const property = await prisma.property.findFirst({
      where: {
        id: data.property_id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    // Validate dates
    const issueDate = new Date(data.issue_date)
    const expiryDate = new Date(data.expiry_date)

    if (expiryDate <= issueDate) {
      throw new Error('Expiry date must be after issue date')
    }

    // Upload certificate document to S3 or local storage
    const fileExtension = file.mimetype === 'application/pdf' ? 'pdf' : file.originalname.split('.').pop()
    const s3Key = `tenants/${tenantId}/certificates/${property.id}/${data.certificate_type}_${Date.now()}.${fileExtension}`

    let documentUrl: string

    if (USE_LOCAL_STORAGE) {
      // Save to local filesystem
      const localFilePath = path.join(LOCAL_STORAGE_PATH, s3Key)
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true })
      fs.writeFileSync(localFilePath, file.buffer)

      const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`
      documentUrl = `${apiBaseUrl}/uploads/${s3Key}`

      logger.info('Certificate saved to local storage', { s3_key: s3Key })
    } else {
      // Upload to S3
      const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }

      await s3Client!.send(new PutObjectCommand(uploadParams))
      documentUrl = `${S3_BUCKET_URL}/${s3Key}`

      logger.info('Certificate uploaded to S3', { s3_key: s3Key })
    }

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        tenant_id: tenantId,
        property_id: data.property_id,
        certificate_type: data.certificate_type,
        issue_date: issueDate,
        expiry_date: expiryDate,
        document_url: documentUrl,
        certificate_number: data.certificate_number,
        issuer_name: data.issuer_name,
        notes: data.notes,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address_line1: true,
            city: true,
            postcode: true,
          },
        },
      },
    })

    logger.info('Certificate created', {
      tenant_id: tenantId,
      certificate_id: certificate.id,
      certificate_type: certificate.certificate_type,
    })

    return certificate
  }

  async list(tenantId: string, filters: { property_id?: string; certificate_type?: CertificateType } = {}) {
    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    }

    if (filters.property_id) {
      where.property_id = filters.property_id
    }

    if (filters.certificate_type) {
      where.certificate_type = filters.certificate_type
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address_line1: true,
            city: true,
            postcode: true,
          },
        },
      },
      orderBy: { expiry_date: 'asc' }, // Soonest to expire first
    })

    // Calculate days until expiry for each certificate
    const now = new Date()
    return certificates.map((cert) => ({
      ...cert,
      days_until_expiry: Math.ceil((cert.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      is_expired: cert.expiry_date < now,
    }))
  }

  async getById(tenantId: string, certificateId: string) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address_line1: true,
            city: true,
            postcode: true,
          },
        },
      },
    })

    if (!certificate) {
      throw new Error('Certificate not found')
    }

    // Calculate days until expiry
    const now = new Date()
    return {
      ...certificate,
      days_until_expiry: Math.ceil((certificate.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      is_expired: certificate.expiry_date < now,
    }
  }

  async update(tenantId: string, certificateId: string, data: UpdateCertificateDTO): Promise<Certificate> {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!certificate) {
      throw new Error('Certificate not found')
    }

    // Validate dates if both are provided
    if (data.issue_date && data.expiry_date) {
      const issueDate = new Date(data.issue_date)
      const expiryDate = new Date(data.expiry_date)

      if (expiryDate <= issueDate) {
        throw new Error('Expiry date must be after issue date')
      }
    }

    const updateData: any = {}

    if (data.certificate_type) updateData.certificate_type = data.certificate_type
    if (data.issue_date) updateData.issue_date = new Date(data.issue_date)
    if (data.expiry_date) updateData.expiry_date = new Date(data.expiry_date)
    if (data.certificate_number !== undefined) updateData.certificate_number = data.certificate_number
    if (data.issuer_name !== undefined) updateData.issuer_name = data.issuer_name
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address_line1: true,
            city: true,
            postcode: true,
          },
        },
      },
    })

    logger.info('Certificate updated', {
      tenant_id: tenantId,
      certificate_id: certificateId,
    })

    return updated
  }

  async delete(tenantId: string, certificateId: string): Promise<void> {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!certificate) {
      throw new Error('Certificate not found')
    }

    // Soft delete
    await prisma.certificate.update({
      where: { id: certificateId },
      data: { deleted_at: new Date() },
    })

    logger.info('Certificate deleted', {
      tenant_id: tenantId,
      certificate_id: certificateId,
    })
  }

  async getExpiringSoon(tenantId: string, daysAhead: number = 60) {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const certificates = await prisma.certificate.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        expiry_date: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address_line1: true,
            city: true,
            postcode: true,
          },
        },
      },
      orderBy: { expiry_date: 'asc' },
    })

    return certificates.map((cert) => ({
      ...cert,
      days_until_expiry: Math.ceil((cert.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }))
  }

  async getExpired(tenantId: string) {
    const now = new Date()

    const certificates = await prisma.certificate.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        expiry_date: {
          lt: now,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address_line1: true,
            city: true,
            postcode: true,
          },
        },
      },
      orderBy: { expiry_date: 'desc' },
    })

    return certificates.map((cert) => ({
      ...cert,
      days_since_expired: Math.ceil((now.getTime() - cert.expiry_date.getTime()) / (1000 * 60 * 60 * 24)),
    }))
  }
}

export { CertificatesService }  // Named export for testing
export default new CertificatesService()  // Default export for production
