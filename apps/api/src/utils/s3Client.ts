import { S3Client } from '@aws-sdk/client-s3'

// Check if AWS credentials are configured
export const isS3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
)

// Initialize S3 client only if credentials are provided
export const s3Client = isS3Configured
  ? new S3Client({
      region: process.env.AWS_REGION || 'eu-west-2', // London region
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'rightfit-photos-dev'
export const S3_BUCKET_URL = process.env.S3_BUCKET_URL || `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com`

// Local storage mode for development
export const USE_LOCAL_STORAGE = !isS3Configured
export const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads'
