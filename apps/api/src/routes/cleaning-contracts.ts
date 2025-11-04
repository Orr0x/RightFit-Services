import express from 'express'
import { authenticate } from '../middleware/auth'
import CleaningContractService from '../services/CleaningContractService'
import logger from '../utils/logger'
import { prisma } from '@rightfit/database'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * POST /api/cleaning-contracts
 * Create a new cleaning contract
 */
router.post('/', async (req, res) => {
  try {
    const {
      customer_id,
      service_provider_id,
      contract_type,
      contract_start_date,
      contract_end_date,
      monthly_fee,
      billing_day,
      property_ids,
      property_fees,
      notes,
    } = req.body

    // Validation
    if (!customer_id || !service_provider_id || !contract_type || !contract_start_date || !monthly_fee || !billing_day) {
      return res.status(400).json({
        error: 'Missing required fields: customer_id, service_provider_id, contract_type, contract_start_date, monthly_fee, billing_day',
      })
    }

    // Look up the ServiceProvider by tenant_id to get the actual service_provider_id
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: service_provider_id },
      select: { id: true },
    })

    if (!serviceProvider) {
      return res.status(404).json({
        error: 'Service provider not found',
      })
    }

    const contract = await CleaningContractService.createContract({
      customer_id,
      service_provider_id: serviceProvider.id,
      contract_type,
      contract_start_date: new Date(contract_start_date),
      contract_end_date: contract_end_date ? new Date(contract_end_date) : undefined,
      monthly_fee: parseFloat(monthly_fee),
      billing_day: parseInt(billing_day),
      property_ids,
      property_fees,
      notes,
    })

    logger.info(`Created cleaning contract ${contract.id} for customer ${customer_id}`)

    res.status(201).json(contract)
  } catch (error: any) {
    logger.error('Error creating cleaning contract:', error)
    res.status(500).json({ error: error.message || 'Failed to create contract' })
  }
})

/**
 * GET /api/cleaning-contracts/:id
 * Get contract by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await CleaningContractService.getContractById(id)

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
 * GET /api/cleaning-contracts
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
      contracts = await CleaningContractService.listContractsByCustomer(
        customer_id as string,
        status as any
      )
    } else {
      // Look up the ServiceProvider by tenant_id to get the actual service_provider_id
      const serviceProvider = await prisma.serviceProvider.findUnique({
        where: { tenant_id: service_provider_id as string },
        select: { id: true },
      })

      if (!serviceProvider) {
        return res.status(404).json({
          error: 'Service provider not found',
        })
      }

      contracts = await CleaningContractService.listContractsByProvider(
        serviceProvider.id,
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
 * PUT /api/cleaning-contracts/:id
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

    const contract = await CleaningContractService.updateContract(id, updateData)

    logger.info(`Updated cleaning contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error updating contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to update contract' })
  }
})

/**
 * PUT /api/cleaning-contracts/:id/pause
 * Pause contract
 */
router.put('/:id/pause', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await CleaningContractService.pauseContract(id)

    logger.info(`Paused cleaning contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error pausing contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to pause contract' })
  }
})

/**
 * PUT /api/cleaning-contracts/:id/resume
 * Resume contract
 */
router.put('/:id/resume', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await CleaningContractService.resumeContract(id)

    logger.info(`Resumed cleaning contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error resuming contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to resume contract' })
  }
})

/**
 * PUT /api/cleaning-contracts/:id/cancel
 * Cancel contract
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params

    const contract = await CleaningContractService.cancelContract(id)

    logger.info(`Cancelled cleaning contract ${id}`)

    res.json(contract)
  } catch (error: any) {
    logger.error(`Error cancelling contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to cancel contract' })
  }
})

/**
 * POST /api/cleaning-contracts/:id/properties
 * Link property to contract
 */
router.post('/:id/properties', async (req, res) => {
  try {
    const { id } = req.params
    const { property_id, property_monthly_fee } = req.body

    if (!property_id) {
      return res.status(400).json({ error: 'property_id is required' })
    }

    const contractProperty = await CleaningContractService.linkProperty(id, {
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
 * DELETE /api/cleaning-contracts/:id/properties/:property_id
 * Unlink property from contract
 */
router.delete('/:id/properties/:property_id', async (req, res) => {
  try {
    const { id, property_id } = req.params

    await CleaningContractService.unlinkProperty(id, property_id)

    logger.info(`Unlinked property ${property_id} from contract ${id}`)

    res.json({ success: true, message: 'Property unlinked from contract' })
  } catch (error: any) {
    logger.error(`Error unlinking property from contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to unlink property' })
  }
})

/**
 * PUT /api/cleaning-contracts/:id/properties/:property_id/fee
 * Update property fee (for PER_PROPERTY contracts)
 */
router.put('/:id/properties/:property_id/fee', async (req, res) => {
  try {
    const { id, property_id } = req.params
    const { property_monthly_fee } = req.body

    if (!property_monthly_fee) {
      return res.status(400).json({ error: 'property_monthly_fee is required' })
    }

    const contractProperty = await CleaningContractService.updatePropertyFee(
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
 * GET /api/cleaning-contracts/:id/properties
 * Get all properties for a contract
 */
router.get('/:id/properties', async (req, res) => {
  try {
    const { id } = req.params

    const properties = await CleaningContractService.getContractProperties(id)

    res.json(properties)
  } catch (error: any) {
    logger.error(`Error fetching properties for contract ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to fetch contract properties' })
  }
})

/**
 * GET /api/cleaning-contracts/:id/monthly-fee
 * Calculate total monthly fee for contract
 */
router.get('/:id/monthly-fee', async (req, res) => {
  try {
    const { id } = req.params

    const totalFee = await CleaningContractService.calculateMonthlyFee(id)

    res.json({ data: { contract_id: id, monthly_fee: totalFee } })
  } catch (error: any) {
    logger.error(`Error calculating monthly fee for contract ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to calculate monthly fee' })
  }
})

export default router
