import { PrismaClient, WorkerCertificate } from '@rightfit/database'
import { v4 as uuidv4 } from 'uuid'
import { USE_LOCAL_STORAGE, LOCAL_STORAGE_PATH } from '../utils/s3Client'
import logger from '../utils/logger'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Ensure local upload directory exists
if (USE_LOCAL_STORAGE) {
  const uploadsDir = path.resolve(LOCAL_STORAGE_PATH)
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
}

export interface CreateCertificateDTO {
  name: string
  expiry_date?: string // ISO date string
}

export interface UploadCertificateResult {
  certificate: WorkerCertificate
  uploadSuccess: boolean
  error?: string
}

class WorkerCertificatesService {
  /**
   * Upload a worker certificate
   */
  async uploadCertificate(
    tenantId: string,
    workerId: string,
    file: Express.Multer.File,
    data: CreateCertificateDTO
  ): Promise<UploadCertificateResult> {
    try {
      // Verify worker belongs to a service provider in this tenant
      const worker = await prisma.worker.findFirst({
        where: {
          id: workerId,
          service_provider: {
            tenant_id: tenantId,
          },
        },
      })

      if (!worker) {
        throw new Error('Worker not found or access denied')
      }

      // Generate unique filename
      const certificateId = uuidv4()
      const extension = file.mimetype.split('/')[1] || 'pdf'
      const s3Key = `tenants/${tenantId}/workers/${workerId}/certificates/${certificateId}.${extension}`

      let fileUrl: string

      if (USE_LOCAL_STORAGE) {
        // Save to local filesystem
        const localFilePath = path.join(LOCAL_STORAGE_PATH, s3Key)

        // Create directories if they don't exist
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true })

        // Write file
        fs.writeFileSync(localFilePath, file.buffer)

        // Use localhost for development (matches frontend API calls)
        fileUrl = `http://localhost:${process.env.PORT || 3001}/uploads/${s3Key}`

        logger.info('Worker certificate saved to local storage', {
          worker_id: workerId,
          s3_key: s3Key,
        })
      } else {
        // TODO: Implement S3 upload when needed
        throw new Error('S3 upload not implemented for worker certificates yet')
      }

      // Create certificate record in database
      const certificate = await prisma.workerCertificate.create({
        data: {
          worker_id: workerId,
          name: data.name,
          file_url: fileUrl,
          s3_key: s3Key,
          file_type: file.mimetype,
          file_size: file.size,
          expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
        },
      })

      logger.info('Worker certificate uploaded successfully', {
        tenant_id: tenantId,
        worker_id: workerId,
        certificate_id: certificate.id,
      })

      return {
        certificate,
        uploadSuccess: true,
      }
    } catch (error: any) {
      logger.error('Worker certificate upload error', {
        error: error.message,
        tenant_id: tenantId,
        worker_id: workerId,
      })

      return {
        certificate: null as any,
        uploadSuccess: false,
        error: error.message,
      }
    }
  }

  /**
   * List all certificates for a worker
   */
  async list(tenantId: string, workerId: string): Promise<WorkerCertificate[]> {
    // Verify worker belongs to this tenant
    const worker = await prisma.worker.findFirst({
      where: {
        id: workerId,
        service_provider: {
          tenant_id: tenantId,
        },
      },
    })

    if (!worker) {
      throw new Error('Worker not found or access denied')
    }

    const certificates = await prisma.workerCertificate.findMany({
      where: { worker_id: workerId },
      orderBy: { uploaded_at: 'desc' },
    })

    return certificates
  }

  /**
   * Get a single certificate
   */
  async getById(
    tenantId: string,
    workerId: string,
    certificateId: string
  ): Promise<WorkerCertificate | null> {
    // Verify worker belongs to this tenant
    const worker = await prisma.worker.findFirst({
      where: {
        id: workerId,
        service_provider: {
          tenant_id: tenantId,
        },
      },
    })

    if (!worker) {
      throw new Error('Worker not found or access denied')
    }

    return await prisma.workerCertificate.findFirst({
      where: {
        id: certificateId,
        worker_id: workerId,
      },
    })
  }

  /**
   * Update certificate (mainly for expiry date)
   */
  async update(
    tenantId: string,
    workerId: string,
    certificateId: string,
    data: { expiry_date?: string; name?: string }
  ): Promise<WorkerCertificate> {
    // Verify worker belongs to this tenant
    const worker = await prisma.worker.findFirst({
      where: {
        id: workerId,
        service_provider: {
          tenant_id: tenantId,
        },
      },
    })

    if (!worker) {
      throw new Error('Worker not found or access denied')
    }

    const updateData: any = {}
    if (data.name !== undefined) {
      updateData.name = data.name
    }
    if (data.expiry_date !== undefined) {
      updateData.expiry_date = data.expiry_date ? new Date(data.expiry_date) : null
    }

    const certificate = await prisma.workerCertificate.update({
      where: { id: certificateId },
      data: updateData,
    })

    logger.info('Worker certificate updated', {
      tenant_id: tenantId,
      worker_id: workerId,
      certificate_id: certificateId,
    })

    return certificate
  }

  /**
   * Delete a certificate
   */
  async delete(tenantId: string, workerId: string, certificateId: string): Promise<void> {
    // Verify worker belongs to this tenant
    const worker = await prisma.worker.findFirst({
      where: {
        id: workerId,
        service_provider: {
          tenant_id: tenantId,
        },
      },
    })

    if (!worker) {
      throw new Error('Worker not found or access denied')
    }

    const certificate = await prisma.workerCertificate.findFirst({
      where: {
        id: certificateId,
        worker_id: workerId,
      },
    })

    if (!certificate) {
      throw new Error('Certificate not found')
    }

    // Delete from storage
    try {
      if (USE_LOCAL_STORAGE) {
        // Delete from local filesystem
        const localFilePath = path.join(LOCAL_STORAGE_PATH, certificate.s3_key)
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath)
        }
      } else {
        // TODO: Implement S3 deletion when needed
        throw new Error('S3 deletion not implemented for worker certificates yet')
      }
    } catch (error: any) {
      logger.error('Storage delete error', { error: error.message, s3_key: certificate.s3_key })
      // Continue with database deletion even if storage delete fails
    }

    // Delete from database
    await prisma.workerCertificate.delete({
      where: { id: certificateId },
    })

    logger.info('Worker certificate deleted', {
      tenant_id: tenantId,
      worker_id: workerId,
      certificate_id: certificateId,
    })
  }
}

export default new WorkerCertificatesService()
