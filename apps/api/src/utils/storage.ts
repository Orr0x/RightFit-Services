import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'contract-files')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-contractId-originalname
    const contractId = req.params.id
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const nameWithoutExt = path.basename(file.originalname, ext)
    const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const filename = `${timestamp}-${contractId}-${sanitizedName}${ext}`
    cb(null, filename)
  },
})

// File filter - allow images and documents
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}. Allowed types: images (jpg, png, gif, webp) and documents (pdf, doc, docx, xls, xlsx, txt)`))
  }
}

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
})

// Helper function to delete a file
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(UPLOADS_DIR, path.basename(filePath))
    fs.unlink(fullPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File doesn't exist, consider it deleted
          resolve()
        } else {
          reject(err)
        }
      } else {
        resolve()
      }
    })
  })
}

// Helper function to get file path
export const getFilePath = (filename: string): string => {
  return path.join(UPLOADS_DIR, filename)
}

export { UPLOADS_DIR }
