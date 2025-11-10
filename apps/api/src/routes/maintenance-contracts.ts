import express from 'express'
import { authenticate } from '../middleware/auth'
import MaintenanceContractService from '../services/MaintenanceContractService'
import logger from '../utils/logger'
import { prisma } from '@rightfit/database'
import { upload, deleteFile, getFilePath } from '../utils/storage'
import { generateContractNumber } from '../utils/idGenerator'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * POST /api/maintenance-contracts
 * Create a new maintenance contract
 */
router.post('/', async (req, res) => {
  try {
    const {
      customer_id,
      service_provider_id,
      contract_number,
      contract_type,
      contract_start_date,
      contract_end_date,
      monthly_fee,
      billing_day,
      property_ids,
      property_fees,
      notes,
      customer_address_line1,
      customer_address_line2,
      customer_city,
      customer_postcode,
      customer_country,
    } = req.body

    // Validation
    if (!customer_id || !service_provider_id || !contract_type || !contract_start_date || !monthly_fee || !billing_day) {
      return res.status(400).json({
        error: 'Missing required fields: customer_id, service_provider_id, contract_type, contract_start_date, monthly_fee, billing_day',
      })
    }

    // Validate service_provider_id belongs to user's tenant
    const serviceProvider = await prisma.serviceProvider.findFirst({
      where: {
        id: service_provider_id,
        tenant_id: req.user?.tenant_id,
      },
      select: { id: true },
    })

    if (!serviceProvider) {
      return res.status(404).json({
        error: 'Service provider not found for this tenant',
      })
    }

    // Auto-generate contract number if not provided
    const finalContractNumber = contract_number || await generateContractNumber(service_provider_id)

    const contract = await MaintenanceContractService.createContract({
      customer_id,
      service_provider_id: service_provider_id,
      contract_number: finalContractNumber,
      contract_type,
      contract_start_date: new Date(contract_start_date),
      contract_end_date: contract_end_date ? new Date(contract_end_date) : undefined,
      monthly_fee: parseFloat(monthly_fee),
      billing_day: parseInt(billing_day),
      property_ids,
      property_fees,
      notes,
      customer_address_line1,
      customer_address_line2,
      customer_city,
      customer_postcode,
      customer_country,
    })

    logger.info(`Created maintenance contract ${contract.id} for customer ${customer_id}`)

    res.status(201).json(contract)
  } catch (error: any) {
    logger.error('Error creating maintenance contract:', error)
    res.status(500).json({ error: error.message || 'Failed to create contract' })
  }
})

/**
 * GET /api/maintenance-contracts/:id
 * Get contract by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await MaintenanceContractService.getContractById(id)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error fetching contract ${req.params.id}:`, error)
    if (error.message === 'Contract not found') {
      return res.status(404).json({ error: 'Contract not found' })
    }
    res.status(500).json({ error: 'Failed to fetch contract' })
  }
})

/**
 * GET /api/maintenance-contracts
 * List contracts (by customer_id or service_provider_id)
 * Query params: customer_id OR service_provider_id, optional status
 */
router.get('/', async (req, res) => {
  try {
    const { customer_id, service_provider_id, status } = req.query

    if (!customer_id && !service_provider_id) {
      return res.status(400).json({
        error: 'Must provide either customer_id or service_provider_id',
      })
    }

    let contracts

    if (customer_id) {
      contracts = await MaintenanceContractService.listContractsByCustomer(
        customer_id as string,
        status as any
      )
    } else {
      // Validate service_provider_id belongs to user's tenant
      const serviceProvider = await prisma.serviceProvider.findFirst({
        where: {
          id: service_provider_id as string,
          tenant_id: req.user?.tenant_id,
        },
        select: { id: true },
      })

      if (!serviceProvider) {
        return res.status(404).json({
          error: 'Service provider not found for this tenant',
        })
      }

      contracts = await MaintenanceContractService.listContractsByProvider(
        service_provider_id as string,
        status as any
      )
    }

    res.json({ data: contracts })
  } catch (error: any) {
    logger.error('Error listing contracts:', error)
    res.status(500).json({ error: 'Failed to list contracts' })
  }
})

/**
 * PUT /api/maintenance-contracts/:id
 * Update contract
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { contract_type, contract_end_date, monthly_fee, billing_day, status, notes } = req.body

    const updateData: any = {}

    if (contract_type) updateData.contract_type = contract_type
    if (contract_end_date) updateData.contract_end_date = new Date(contract_end_date)
    if (monthly_fee) updateData.monthly_fee = parseFloat(monthly_fee)
    if (billing_day) updateData.billing_day = parseInt(billing_day)
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const contract = await MaintenanceContractService.updateContract(id, updateData)

    logger.info(`Updated maintenance contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error updating contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to update contract' })
  }
})

/**
 * PUT /api/maintenance-contracts/:id/pause
 * Pause contract
 */
router.put('/:id/pause', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await MaintenanceContractService.pauseContract(id)

    logger.info(`Paused maintenance contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error pausing contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to pause contract' })
  }
})

/**
 * PUT /api/maintenance-contracts/:id/resume
 * Resume contract
 */
router.put('/:id/resume', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await MaintenanceContractService.resumeContract(id)

    logger.info(`Resumed maintenance contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error resuming contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to resume contract' })
  }
})

/**
 * PUT /api/maintenance-contracts/:id/cancel
 * Cancel contract
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await MaintenanceContractService.cancelContract(id)

    logger.info(`Cancelled maintenance contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error cancelling contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to cancel contract' })
  }
})

/**
 * POST /api/maintenance-contracts/:id/properties
 * Link property to contract
 */
router.post('/:id/properties', async (req, res) => {
  try {
    const { id } = req.params
    const { property_id, property_monthly_fee } = req.body

    if (!property_id) {
      return res.status(400).json({ error: 'property_id is required' })
    }

    const contractProperty = await MaintenanceContractService.linkProperty(id, {
      property_id,
      property_monthly_fee: property_monthly_fee ? parseFloat(property_monthly_fee) : undefined,
    })

    logger.info(`Linked property ${property_id} to contract ${id}`)

    res.status(201).json(contractProperty)
  } catch (error: any) {
    logger.error(`Error linking property to contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to link property' })
  }
})

/**
 * DELETE /api/maintenance-contracts/:id/properties/:property_id
 * Unlink property from contract
 */
router.delete('/:id/properties/:property_id', async (req, res) => {
  try {
    const { id, property_id } = req.params

    await MaintenanceContractService.unlinkProperty(id, property_id)

    logger.info(`Unlinked property ${property_id} from contract ${id}`)

    res.json({ success: true, message: 'Property unlinked from contract' })
  } catch (error: any) {
    logger.error(`Error unlinking property from contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to unlink property' })
  }
})

/**
 * PUT /api/maintenance-contracts/:id/properties/:property_id/fee
 * Update property fee (for PER_PROPERTY contracts)
 */
router.put('/:id/properties/:property_id/fee', async (req, res) => {
  try {
    const { id, property_id } = req.params
    const { property_monthly_fee } = req.body

    if (!property_monthly_fee) {
      return res.status(400).json({ error: 'property_monthly_fee is required' })
    }

    const contractProperty = await MaintenanceContractService.updatePropertyFee(
      id,
      property_id,
      parseFloat(property_monthly_fee)
    )

    logger.info(`Updated fee for property ${property_id} in contract ${id}`)

    res.json(contractProperty)
  } catch (error: any) {
    logger.error(`Error updating property fee in contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to update property fee' })
  }
})

/**
 * GET /api/maintenance-contracts/:id/properties
 * Get all properties for a contract
 */
router.get('/:id/properties', async (req, res) => {
  try {
    const { id } = req.params

    const properties = await MaintenanceContractService.getContractProperties(id)

    res.json(properties)
  } catch (error: any) {
    logger.error(`Error fetching properties for contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to fetch contract properties' })
  }
})

/**
 * GET /api/maintenance-contracts/:id/monthly-fee
 * Calculate total monthly fee for contract
 */
router.get('/:id/monthly-fee', async (req, res) => {
  try {
    const { id } = req.params

    const totalFee = await MaintenanceContractService.calculateMonthlyFee(id)

    res.json({ data: { contract_id: id, monthly_fee: totalFee } })
  } catch (error: any) {
    logger.error(`Error calculating monthly fee for contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to calculate monthly fee' })
  }
})

/**
 * POST /api/maintenance-contracts/:id/upload
 * Upload a file for a contract
 */
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params
    const file = req.file
    const { description } = req.body

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Verify contract exists
    const contract = await prisma.maintenanceContract.findUnique({
      where: { id },
    })

    if (!contract) {
      // Delete uploaded file if contract doesn't exist
      await deleteFile(file.filename)
      return res.status(404).json({ error: 'Contract not found' })
    }

    // Save file metadata to database
    const contractFile = await prisma.maintenanceContractFile.create({
      data: {
        contract_id: id,
        file_name: file.originalname,
        file_path: file.filename,
        file_type: file.mimetype,
        file_size: file.size,
        description: description || null,
        uploaded_by: (req as any).user?.id || null,
      },
    })

    logger.info(`File ${file.originalname} uploaded for contract ${id}`)

    res.status(201).json({
      data: contractFile,
    })
  } catch (error: any) {
    logger.error(`Error uploading file for contract ${req.params.id}:`, error)

    // Clean up file if database save failed
    if (req.file) {
      await deleteFile(req.file.filename).catch((err) => {
        logger.error('Error deleting file after failed upload:', err)
      })
    }

    res.status(500).json({ error: error.message || 'Failed to upload file' })
  }
})

/**
 * GET /api/maintenance-contracts/:id/files
 * Get all files for a contract
 */
router.get('/:id/files', async (req, res) => {
  try {
    const { id } = req.params

    const files = await prisma.maintenanceContractFile.findMany({
      where: { contract_id: id },
      orderBy: { created_at: 'desc' },
    })

    res.json({ data: files })
  } catch (error: any) {
    logger.error(`Error fetching files for contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to fetch files' })
  }
})

/**
 * GET /api/maintenance-contracts/:id/files/:fileId/download
 * Download a specific file
 */
router.get('/:id/files/:fileId/download', async (req, res) => {
  try {
    const { id, fileId } = req.params

    const file = await prisma.maintenanceContractFile.findFirst({
      where: {
        id: fileId,
        contract_id: id,
      },
    })

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    const filePath = getFilePath(file.file_path)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`File not found on disk: ${filePath}`)
      return res.status(404).json({ error: 'File not found on server' })
    }

    // Set headers for download
    res.setHeader('Content-Type', file.file_type)
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`)
    res.setHeader('Content-Length', file.file_size.toString())

    // Stream file to response
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error: any) {
    logger.error(`Error downloading file ${req.params.fileId}:`, error)
    res.status(500).json({ error: 'Failed to download file' })
  }
})

/**
 * DELETE /api/maintenance-contracts/:id/files/:fileId
 * Delete a specific file
 */
router.delete('/:id/files/:fileId', async (req, res) => {
  try {
    const { id, fileId } = req.params

    const file = await prisma.maintenanceContractFile.findFirst({
      where: {
        id: fileId,
        contract_id: id,
      },
    })

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Delete file from disk
    await deleteFile(file.file_path)

    // Delete from database
    await prisma.maintenanceContractFile.delete({
      where: { id: fileId },
    })

    logger.info(`Deleted file ${file.file_name} from contract ${id}`)

    res.json({ message: 'File deleted successfully' })
  } catch (error: any) {
    logger.error(`Error deleting file ${req.params.fileId}:`, error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

export default router
