import multer from 'multer'
import { Request } from 'express'

// Configure multer for memory storage (we'll upload to S3 from memory)
const storage = multer.memoryStorage()

// File filter - only allow images
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'))
    return
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/)

  if (!fileExtension || !allowedExtensions.includes(fileExtension[0])) {
    cb(new Error('Invalid file extension. Allowed: jpg, jpeg, png, gif, webp'))
    return
  }

  cb(null, true)
}

// File filter - allow PDFs and images (for certificates)
const documentFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept PDFs and images
  if (file.mimetype !== 'application/pdf' && !file.mimetype.startsWith('image/')) {
    cb(new Error('Only PDF or image files are allowed'))
    return
  }

  // Check file extension
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']
  const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/)

  if (!fileExtension || !allowedExtensions.includes(fileExtension[0])) {
    cb(new Error('Invalid file extension. Allowed: pdf, jpg, jpeg, png, gif, webp'))
    return
  }

  cb(null, true)
}

// Create multer upload middleware for images (photos)
export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
})

// Create multer upload middleware for documents (certificates)
export const uploadDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
})
