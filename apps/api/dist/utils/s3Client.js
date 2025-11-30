"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_STORAGE_PATH = exports.USE_LOCAL_STORAGE = exports.S3_BUCKET_URL = exports.S3_BUCKET_NAME = exports.s3Client = exports.isS3Configured = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
// Check if AWS credentials are configured
exports.isS3Configured = !!(process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY);
// Initialize S3 client only if credentials are provided
exports.s3Client = exports.isS3Configured
    ? new client_s3_1.S3Client({
        region: process.env.AWS_REGION || 'eu-west-2', // London region
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })
    : null;
exports.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'rightfit-photos-dev';
exports.S3_BUCKET_URL = process.env.S3_BUCKET_URL || `https://${exports.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com`;
// Local storage mode for development
exports.USE_LOCAL_STORAGE = !exports.isS3Configured;
exports.LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads';
//# sourceMappingURL=s3Client.js.map