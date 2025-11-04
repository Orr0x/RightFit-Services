import { PrismaClient } from '@rightfit/database'
import sharp from 'sharp'
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

export interface UploadWorkerPhotoResult {
  photo_url: string
  uploadSuccess: boolean
  error?: string
}

class WorkerPhotosService {
  /**
   * Upload a worker photo
   */
  async uploadPhoto(
    tenantId: string,
    workerId: string,
    file: Express.Multer.File
  ): Promise<UploadWorkerPhotoResult> {
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

      // Process image with sharp
      const imageBuffer = file.buffer

      // Generate unique filename
      const photoId = uuidv4()
      const extension = file.mimetype.split('/')[1] || 'jpg'
      const s3Key = `tenants/${tenantId}/workers/${workerId}/photo.${extension}`

      // Create optimized image (max 800x800, 85% quality for profile photos)
      const optimizedImage = await sharp(imageBuffer)
        .resize(800, 800, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toBuffer()

      let photoUrl: string

      if (USE_LOCAL_STORAGE) {
        // Save to local filesystem
        const localPhotoPath = path.join(LOCAL_STORAGE_PATH, s3Key)

        // Create directories if they don't exist
        fs.mkdirSync(path.dirname(localPhotoPath), { recursive: true })

        // Delete old photo if exists
        if (worker.photo_url) {
          const oldPath = worker.photo_url.replace(/^.*\/uploads\//, '')
          const oldFullPath = path.join(LOCAL_STORAGE_PATH, oldPath)
          if (fs.existsSync(oldFullPath)) {
            fs.unlinkSync(oldFullPath)
          }
        }

        // Write file
        fs.writeFileSync(localPhotoPath, optimizedImage)

        // Use localhost for development (matches frontend API calls)
        photoUrl = `http://localhost:${process.env.PORT || 3001}/uploads/${s3Key}`

        logger.info('Worker photo saved to local storage', { worker_id: workerId, s3_key: s3Key })
      } else {
        // TODO: Implement S3 upload when needed
        throw new Error('S3 upload not implemented for worker photos yet')
      }

      // Update worker record with photo URL
      await prisma.worker.update({
        where: { id: workerId },
        data: { photo_url: photoUrl },
      })

      logger.info('Worker photo uploaded successfully', {
        tenant_id: tenantId,
        worker_id: workerId,
        s3_key: s3Key,
      })

      return {
        photo_url: photoUrl,
        uploadSuccess: true,
      }
    } catch (error: any) {
      logger.error('Worker photo upload error', {
        error: error.message,
        tenant_id: tenantId,
        worker_id: workerId,
      })

      return {
        photo_url: '',
        uploadSuccess: false,
        error: error.message,
      }
    }
  }

  /**
   * Delete a worker photo
   */
  async deletePhoto(tenantId: string, workerId: string): Promise<void> {
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

    if (!worker.photo_url) {
      throw new Error('Worker has no photo to delete')
    }

    // Delete from storage
    try {
      if (USE_LOCAL_STORAGE) {
        // Delete from local filesystem
        const oldPath = worker.photo_url.replace(/^.*\/uploads\//, '')
        const oldFullPath = path.join(LOCAL_STORAGE_PATH, oldPath)
        if (fs.existsSync(oldFullPath)) {
          fs.unlinkSync(oldFullPath)
        }
      } else {
        // TODO: Implement S3 deletion when needed
        throw new Error('S3 deletion not implemented for worker photos yet')
      }
    } catch (error: any) {
      logger.error('Storage delete error', { error: error.message, photo_url: worker.photo_url })
      // Continue with database update even if storage delete fails
    }

    // Remove photo URL from worker record
    await prisma.worker.update({
      where: { id: workerId },
      data: { photo_url: null },
    })

    logger.info('Worker photo deleted', {
      tenant_id: tenantId,
      worker_id: workerId,
    })
  }
}

export default new WorkerPhotosService()
