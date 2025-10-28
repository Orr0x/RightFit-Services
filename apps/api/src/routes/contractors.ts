import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import contractorsService from '../services/ContractorsService'
import logger from '../utils/logger'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)

// Create contractor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, trade, company_name, phone, email, notes, sms_opt_out, user_id } = req.body
    const tenantId = req.user!.tenant_id

    if (!name || !trade || !phone) {
      return res.status(400).json({ error: 'name, trade, and phone are required' })
    }

    const contractor = await contractorsService.create(tenantId, {
      name,
      trade,
      company_name,
      phone,
      email,
      notes,
      sms_opt_out,
      user_id,
    })

    logger.info('Contractor created', {
      tenant_id: tenantId,
      contractor_id: contractor.id,
      user_id: req.user!.user_id,
    })

    res.status(201).json({ data: contractor })
  } catch (error: any) {
    logger.error('Create contractor error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

// List contractors with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const filters: any = {}

    if (req.query.trade) {
      filters.trade = req.query.trade as string
    }

    if (req.query.search) {
      filters.search = req.query.search as string
    }

    const result = await contractorsService.list(tenantId, filters, page, limit)
    res.json(result)
  } catch (error: any) {
    logger.error('List contractors error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch contractors' })
  }
})

// Get contractors by trade
router.get('/by-trade/:trade', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const trade = req.params.trade

    const contractors = await contractorsService.getByTrade(tenantId, trade)
    res.json({ data: contractors })
  } catch (error: any) {
    logger.error('Get contractors by trade error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch contractors' })
  }
})

// Get single contractor
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const contractorId = req.params.id

    const contractor = await contractorsService.getById(tenantId, contractorId)

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' })
    }

    res.json({ data: contractor })
  } catch (error: any) {
    logger.error('Get contractor error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch contractor' })
  }
})

// Update contractor
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const contractorId = req.params.id

    const updateData: any = {}

    const allowedFields = [
      'name',
      'trade',
      'company_name',
      'phone',
      'email',
      'notes',
      'sms_opt_out',
    ]

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    })

    const contractor = await contractorsService.update(tenantId, contractorId, updateData)

    logger.info('Contractor updated', {
      tenant_id: tenantId,
      contractor_id: contractorId,
      user_id: req.user!.user_id,
    })

    res.json({ data: contractor })
  } catch (error: any) {
    logger.error('Update contractor error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

// Delete contractor (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const contractorId = req.params.id

    await contractorsService.delete(tenantId, contractorId)

    logger.info('Contractor deleted', {
      tenant_id: tenantId,
      contractor_id: contractorId,
      user_id: req.user!.user_id,
    })

    res.status(204).send()
  } catch (error: any) {
    logger.error('Delete contractor error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

export default router
