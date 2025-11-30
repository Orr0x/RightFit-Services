"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer for memory storage (we'll upload to S3 from memory)
const storage = multer_1.default.memoryStorage();
// File filter - only allow images
const imageFileFilter = (_req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Only image files are allowed'));
        return;
    }
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/);
    if (!fileExtension || !allowedExtensions.includes(fileExtension[0])) {
        cb(new Error('Invalid file extension. Allowed: jpg, jpeg, png, gif, webp'));
        return;
    }
    cb(null, true);
};
// File filter - allow PDFs and images (for certificates)
const documentFileFilter = (_req, file, cb) => {
    // Accept PDFs and images
    if (file.mimetype !== 'application/pdf' && !file.mimetype.startsWith('image/')) {
        cb(new Error('Only PDF or image files are allowed'));
        return;
    }
    // Check file extension
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/);
    if (!fileExtension || !allowedExtensions.includes(fileExtension[0])) {
        cb(new Error('Invalid file extension. Allowed: pdf, jpg, jpeg, png, gif, webp'));
        return;
    }
    cb(null, true);
};
// Create multer upload middleware for images (photos)
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});
// Create multer upload middleware for documents (certificates)
exports.uploadDocument = (0, multer_1.default)({
    storage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});
//# sourceMappingURL=upload.js.map