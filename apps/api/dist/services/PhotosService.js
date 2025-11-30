"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@rightfit/database");
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const s3Client_1 = require("../utils/s3Client");
const logger_1 = __importDefault(require("../utils/logger"));
const VisionService_1 = __importDefault(require("./VisionService"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new database_1.PrismaClient();
// Ensure local upload directory exists
if (s3Client_1.USE_LOCAL_STORAGE) {
    const uploadsDir = path.resolve(s3Client_1.LOCAL_STORAGE_PATH);
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    logger_1.default.info('Using local file storage for photos', { path: uploadsDir });
}
class PhotosService {
    async uploadPhoto(tenantId, userId, file, data) {
        try {
            // Validate that at least one entity is provided
            if (!data.property_id && !data.work_order_id) {
                throw new Error('Either property_id or work_order_id must be provided');
            }
            // Verify property belongs to tenant if provided
            if (data.property_id) {
                const property = await prisma.property.findFirst({
                    where: {
                        id: data.property_id,
                        tenant_id: tenantId,
                        deleted_at: null,
                    },
                });
                if (!property) {
                    throw new Error('Property not found');
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
                });
                if (!workOrder) {
                    throw new Error('Work order not found');
                }
            }
            // Process image with sharp
            const imageBuffer = file.buffer;
            const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
            // Analyze photo quality with Google Vision API
            const qualityAnalysis = await VisionService_1.default.analyzePhotoQuality(imageBuffer);
            logger_1.default.debug('Photo quality analysis', {
                tenant_id: tenantId,
                has_good_quality: qualityAnalysis.hasGoodQuality,
                is_blurry: qualityAnalysis.isBlurry,
                warnings_count: qualityAnalysis.warnings.length,
            });
            // Generate unique filenames
            const photoId = (0, uuid_1.v4)();
            const extension = file.mimetype.split('/')[1] || 'jpg';
            const s3Key = `tenants/${tenantId}/photos/${photoId}.${extension}`;
            const thumbnailS3Key = `tenants/${tenantId}/photos/thumbnails/${photoId}_thumb.${extension}`;
            // Create optimized image (max 1920x1920, 85% quality)
            const optimizedImage = await (0, sharp_1.default)(imageBuffer)
                .resize(1920, 1920, {
                fit: 'inside',
                withoutEnlargement: true,
            })
                .jpeg({ quality: 85 })
                .toBuffer();
            // Create thumbnail (400x400)
            const thumbnail = await (0, sharp_1.default)(imageBuffer)
                .resize(400, 400, {
                fit: 'cover',
            })
                .jpeg({ quality: 80 })
                .toBuffer();
            let s3Url;
            let thumbnailUrl;
            if (s3Client_1.USE_LOCAL_STORAGE) {
                // Save to local filesystem
                const localPhotoPath = path.join(s3Client_1.LOCAL_STORAGE_PATH, s3Key);
                const localThumbnailPath = path.join(s3Client_1.LOCAL_STORAGE_PATH, thumbnailS3Key);
                // Create directories if they don't exist
                fs.mkdirSync(path.dirname(localPhotoPath), { recursive: true });
                fs.mkdirSync(path.dirname(localThumbnailPath), { recursive: true });
                // Write files
                fs.writeFileSync(localPhotoPath, optimizedImage);
                fs.writeFileSync(localThumbnailPath, thumbnail);
                // Use absolute URLs pointing to API server for local storage
                const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
                s3Url = `${apiBaseUrl}/uploads/${s3Key}`;
                thumbnailUrl = `${apiBaseUrl}/uploads/${thumbnailS3Key}`;
                logger_1.default.info('Photo saved to local storage', { s3_key: s3Key });
            }
            else {
                // Upload original (optimized) to S3
                const uploadParams = {
                    Bucket: s3Client_1.S3_BUCKET_NAME,
                    Key: s3Key,
                    Body: optimizedImage,
                    ContentType: file.mimetype,
                };
                await s3Client_1.s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
                // Upload thumbnail to S3
                const thumbnailParams = {
                    Bucket: s3Client_1.S3_BUCKET_NAME,
                    Key: thumbnailS3Key,
                    Body: thumbnail,
                    ContentType: file.mimetype,
                };
                await s3Client_1.s3Client.send(new client_s3_1.PutObjectCommand(thumbnailParams));
                // Use S3 URLs
                s3Url = `${s3Client_1.S3_BUCKET_URL}/${s3Key}`;
                thumbnailUrl = `${s3Client_1.S3_BUCKET_URL}/${thumbnailS3Key}`;
                logger_1.default.info('Photo uploaded to S3', { s3_key: s3Key });
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
            });
            logger_1.default.info('Photo uploaded successfully', {
                tenant_id: tenantId,
                photo_id: photo.id,
                s3_key: s3Key,
            });
            return {
                photo,
                uploadSuccess: true,
                quality: qualityAnalysis,
            };
        }
        catch (error) {
            logger_1.default.error('Photo upload error', {
                error: error.message,
                tenant_id: tenantId,
            });
            // Return error result instead of throwing
            return {
                photo: null,
                uploadSuccess: false,
                error: error.message,
            };
        }
    }
    async list(tenantId, filters = {}) {
        const where = {
            tenant_id: tenantId,
        };
        if (filters.property_id) {
            where.property_id = filters.property_id;
        }
        if (filters.work_order_id) {
            where.work_order_id = filters.work_order_id;
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
        });
        return photos;
    }
    async getById(tenantId, photoId) {
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
        });
    }
    async delete(tenantId, photoId) {
        const photo = await prisma.photo.findFirst({
            where: {
                id: photoId,
                tenant_id: tenantId,
            },
        });
        if (!photo) {
            throw new Error('Photo not found');
        }
        // Delete from storage
        try {
            if (s3Client_1.USE_LOCAL_STORAGE) {
                // Delete from local filesystem
                const localPhotoPath = path.join(s3Client_1.LOCAL_STORAGE_PATH, photo.s3_key);
                const thumbnailKey = photo.s3_key.replace('/photos/', '/photos/thumbnails/').replace(/\.(\w+)$/, '_thumb.$1');
                const localThumbnailPath = path.join(s3Client_1.LOCAL_STORAGE_PATH, thumbnailKey);
                if (fs.existsSync(localPhotoPath)) {
                    fs.unlinkSync(localPhotoPath);
                }
                if (fs.existsSync(localThumbnailPath)) {
                    fs.unlinkSync(localThumbnailPath);
                }
            }
            else {
                // Delete from S3
                await s3Client_1.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: s3Client_1.S3_BUCKET_NAME,
                    Key: photo.s3_key,
                }));
                // Delete thumbnail
                const thumbnailKey = photo.s3_key.replace('/photos/', '/photos/thumbnails/').replace(/\.(\w+)$/, '_thumb.$1');
                await s3Client_1.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: s3Client_1.S3_BUCKET_NAME,
                    Key: thumbnailKey,
                }));
            }
        }
        catch (error) {
            logger_1.default.error('Storage delete error', { error: error.message, s3_key: photo.s3_key });
            // Continue with database deletion even if storage delete fails
        }
        // Delete from database
        await prisma.photo.delete({
            where: { id: photoId },
        });
        logger_1.default.info('Photo deleted', {
            tenant_id: tenantId,
            photo_id: photoId,
        });
    }
}
exports.default = new PhotosService();
//# sourceMappingURL=PhotosService.js.map