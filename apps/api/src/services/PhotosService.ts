import { PrismaClient, Photo, PhotoLabel } from '@rightfit/database'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { s3Client, S3_BUCKET_NAME, S3_BUCKET_URL, USE_LOCAL_STORAGE, LOCAL_STORAGE_PATH } from '../utils/s3Client'
import logger from '../utils/logger'
import visionService from './VisionService'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Ensure local upload directory exists
if (USE_LOCAL_STORAGE) {
  const uploadsDir = path.resolve(LOCAL_STORAGE_PATH)
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  logger.info('Using local file storage for photos', { path: uploadsDir })
}

export interface CreatePhotoDTO {
  property_id?: string
  work_order_id?: string
  label?: PhotoLabel
  caption?: string
  gps_latitude?: number
  gps_longitude?: number
}

export interface PhotoQualityData {
  isBlurry: boolean
  blurScore: number
  brightness: number
  hasGoodQuality: boolean
  warnings: string[]
}

export interface PhotoUploadResult {
  photo: Photo
  uploadSuccess: boolean
  error?: string
  quality?: PhotoQualityData
}

class PhotosService {
  async uploadPhoto(
    tenantId: string,
    userId: string,
    file: Express.Multer.File,
    data: CreatePhotoDTO
  ): Promise<PhotoUploadResult> {
    try {
      // Verify property belongs to tenant if provided
      if (data.property_id) {
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
      }

      // Verify work order belongs to tenant if provided
      if (data.work_order_id) {
        const workOrder = await prisma.workOrder.findFirst({
          where: {
            id: data.work_order_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
        })

        if (!workOrder) {
          throw new Error('Work order not found')
        }
      }

      // Note: Photos can be uploaded without property_id or work_order_id
      // They will be linked to maintenance jobs via photo ID arrays when jobs are completed

      // Process image with sharp
      const imageBuffer = file.buffer
      const metadata = await sharp(imageBuffer).metadata()

      // Analyze photo quality with Google Vision API
      const qualityAnalysis = await visionService.analyzePhotoQuality(imageBuffer)

      logger.debug('Photo quality analysis', {
        tenant_id: tenantId,
        has_good_quality: qualityAnalysis.hasGoodQuality,
        is_blurry: qualityAnalysis.isBlurry,
        warnings_count: qualityAnalysis.warnings.length,
      })

      // Generate unique filenames
      const photoId = uuidv4()
      const extension = file.mimetype.split('/')[1] || 'jpg'
      const s3Key = `tenants/${tenantId}/photos/${photoId}.${extension}`
      const thumbnailS3Key = `tenants/${tenantId}/photos/thumbnails/${photoId}_thumb.${extension}`

      // Create optimized image (max 1920x1920, 85% quality)
      const optimizedImage = await sharp(imageBuffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer()

      // Create thumbnail (400x400)
      const thumbnail = await sharp(imageBuffer)
        .resize(400, 400, {
          fit: 'cover',
        })
        .jpeg({ quality: 80 })
        .toBuffer()

      let s3Url: string
      let thumbnailUrl: string

      if (USE_LOCAL_STORAGE) {
        // Save to local filesystem
        const localPhotoPath = path.join(LOCAL_STORAGE_PATH, s3Key)
        const localThumbnailPath = path.join(LOCAL_STORAGE_PATH, thumbnailS3Key)

        // Create directories if they don't exist
        fs.mkdirSync(path.dirname(localPhotoPath), { recursive: true })
        fs.mkdirSync(path.dirname(localThumbnailPath), { recursive: true })

        // Write files
        fs.writeFileSync(localPhotoPath, optimizedImage)
        fs.writeFileSync(localThumbnailPath, thumbnail)

        // Store only relative paths - clients will construct full URLs
        s3Url = `/uploads/${s3Key}`
        thumbnailUrl = `/uploads/${thumbnailS3Key}`

        logger.info('Photo saved to local storage', { s3_key: s3Key })
      } else {
        // Upload original (optimized) to S3
        const uploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: s3Key,
          Body: optimizedImage,
          ContentType: file.mimetype,
        }

        await s3Client!.send(new PutObjectCommand(uploadParams))

        // Upload thumbnail to S3
        const thumbnailParams = {
          Bucket: S3_BUCKET_NAME,
          Key: thumbnailS3Key,
          Body: thumbnail,
          ContentType: file.mimetype,
        }

        await s3Client!.send(new PutObjectCommand(thumbnailParams))

        // Use S3 URLs
        s3Url = `${S3_BUCKET_URL}/${s3Key}`
        thumbnailUrl = `${S3_BUCKET_URL}/${thumbnailS3Key}`

        logger.info('Photo uploaded to S3', { s3_key: s3Key })
      }

      // Create photo record in database
      const photo = await prisma.photo.create({
        data: {
          tenant_id: tenantId,
          uploaded_by_user_id: userId,
          property_id: data.property_id,
          work_order_id: data.work_order_id,
          s3_key: s3Key,
          s3_url: s3Url,
          thumbnail_url: thumbnailUrl,
          file_size: optimizedImage.length,
          mime_type: file.mimetype,
          width: metadata.width || 0,
          height: metadata.height || 0,
          label: data.label,
          caption: data.caption,
          gps_latitude: data.gps_latitude,
          gps_longitude: data.gps_longitude,
        },
      })

      logger.info('Photo uploaded successfully', {
        tenant_id: tenantId,
        photo_id: photo.id,
        s3_key: s3Key,
      })

      return {
        photo,
        uploadSuccess: true,
        quality: qualityAnalysis,
      }
    } catch (error: any) {
      logger.error('Photo upload error', {
        error: error.message,
        tenant_id: tenantId,
      })

      // Return error result instead of throwing
      return {
        photo: null as any,
        uploadSuccess: false,
        error: error.message,
      }
    }
  }

  async list(tenantId: string, filters: { property_id?: string; work_order_id?: string } = {}) {
    const where: any = {
      tenant_id: tenantId,
    }

    if (filters.property_id) {
      where.property_id = filters.property_id
    }

    if (filters.work_order_id) {
      where.work_order_id = filters.work_order_id
    }

    const photos = await prisma.photo.findMany({
      where,
      include: {
        uploaded_by: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        work_order: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return photos
  }

  async getById(tenantId: string, photoId: string): Promise<Photo | null> {
    return await prisma.photo.findFirst({
      where: {
        id: photoId,
        tenant_id: tenantId,
      },
      include: {
        uploaded_by: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        property: true,
        work_order: true,
      },
    })
  }

  async delete(tenantId: string, photoId: string): Promise<void> {
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        tenant_id: tenantId,
      },
    })

    if (!photo) {
      throw new Error('Photo not found')
    }

    // Delete from storage
    try {
      if (USE_LOCAL_STORAGE) {
        // Delete from local filesystem
        const localPhotoPath = path.join(LOCAL_STORAGE_PATH, photo.s3_key)
        const thumbnailKey = photo.s3_key.replace('/photos/', '/photos/thumbnails/').replace(/\.(\w+)$/, '_thumb.$1')
        const localThumbnailPath = path.join(LOCAL_STORAGE_PATH, thumbnailKey)

        if (fs.existsSync(localPhotoPath)) {
          fs.unlinkSync(localPhotoPath)
        }
        if (fs.existsSync(localThumbnailPath)) {
          fs.unlinkSync(localThumbnailPath)
        }
      } else {
        // Delete from S3
        await s3Client!.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: photo.s3_key,
          })
        )

        // Delete thumbnail
        const thumbnailKey = photo.s3_key.replace('/photos/', '/photos/thumbnails/').replace(/\.(\w+)$/, '_thumb.$1')
        await s3Client!.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: thumbnailKey,
          })
        )
      }
    } catch (error: any) {
      logger.error('Storage delete error', { error: error.message, s3_key: photo.s3_key })
      // Continue with database deletion even if storage delete fails
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    })

    logger.info('Photo deleted', {
      tenant_id: tenantId,
      photo_id: photoId,
    })
  }
}

export default new PhotosService()
