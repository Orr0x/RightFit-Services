import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import workOrdersService from '../services/WorkOrdersService'
import { WorkOrderStatus, WorkOrderPriority, WorkOrderCategory } from '@rightfit/database'
import logger from '../utils/logger'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)

// Create work order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { property_id, contractor_id, title, description, priority, category, due_date, estimated_cost } = req.body
    const tenantId = req.user!.tenant_id
    const userId = req.user!.user_id

    if (!property_id || !title) {
      return res.status(400).json({ error: 'property_id and title are required' })
    }

    const workOrder = await workOrdersService.create(tenantId, userId, {
      property_id,
      contractor_id,
      title,
      description,
      priority,
      category,
      due_date: due_date ? new Date(due_date) : undefined,
      estimated_cost: estimated_cost ? parseFloat(estimated_cost) : undefined,
    })

    logger.info('Work order created', {
      tenant_id: tenantId,
      work_order_id: workOrder.id,
      user_id: userId,
    })

    res.status(201).json({ data: workOrder })
  } catch (error: any) {
    logger.error('Create work order error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

// List work orders with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const filters: any = {}

    if (req.query.property_id) {
      filters.property_id = req.query.property_id as string
    }

    if (req.query.contractor_id) {
      filters.contractor_id = req.query.contractor_id as string
    }

    if (req.query.status) {
      filters.status = req.query.status as WorkOrderStatus
    }

    if (req.query.priority) {
      filters.priority = req.query.priority as WorkOrderPriority
    }

    if (req.query.category) {
      filters.category = req.query.category as WorkOrderCategory
    }

    const result = await workOrdersService.list(tenantId, filters, page, limit)
    res.json(result)
  } catch (error: any) {
    logger.error('List work orders error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch work orders' })
  }
})

// Get single work order
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const workOrderId = req.params.id

    const workOrder = await workOrdersService.getById(tenantId, workOrderId)

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' })
    }

    res.json({ data: workOrder })
  } catch (error: any) {
    logger.error('Get work order error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch work order' })
  }
})

// Update work order
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const workOrderId = req.params.id

    const updateData: any = {}

    const allowedFields = [
      'contractor_id',
      'title',
      'description',
      'status',
      'priority',
      'category',
      'due_date',
      'estimated_cost',
      'actual_cost',
      'completion_note',
      'cancellation_reason',
    ]

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'due_date') {
          updateData[field] = new Date(req.body[field])
        } else if (field === 'estimated_cost' || field === 'actual_cost') {
          updateData[field] = parseFloat(req.body[field])
        } else {
          updateData[field] = req.body[field]
        }
      }
    })

    const workOrder = await workOrdersService.update(tenantId, workOrderId, updateData)

    logger.info('Work order updated', {
      tenant_id: tenantId,
      work_order_id: workOrderId,
      user_id: req.user!.user_id,
    })

    res.json({ data: workOrder })
  } catch (error: any) {
    logger.error('Update work order error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

// Delete work order (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const workOrderId = req.params.id

    await workOrdersService.delete(tenantId, workOrderId)

    logger.info('Work order deleted', {
      tenant_id: tenantId,
      work_order_id: workOrderId,
      user_id: req.user!.user_id,
    })

    res.status(204).send()
  } catch (error: any) {
    logger.error('Delete work order error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

// Assign contractor to work order
router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const workOrderId = req.params.id
    const { contractor_id } = req.body

    if (!contractor_id) {
      return res.status(400).json({ error: 'contractor_id is required' })
    }

    const workOrder = await workOrdersService.assignContractor(tenantId, workOrderId, contractor_id)

    logger.info('Contractor assigned to work order', {
      tenant_id: tenantId,
      work_order_id: workOrderId,
      contractor_id,
      user_id: req.user!.user_id,
    })

    res.json({ data: workOrder })
  } catch (error: any) {
    logger.error('Assign contractor error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

// Update work order status
router.post('/:id/status', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const workOrderId = req.params.id
    const { status, note } = req.body

    if (!status) {
      return res.status(400).json({ error: 'status is required' })
    }

    const validStatuses = Object.values(WorkOrderStatus)
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const workOrder = await workOrdersService.updateStatus(tenantId, workOrderId, status, note)

    logger.info('Work order status updated', {
      tenant_id: tenantId,
      work_order_id: workOrderId,
      status,
      user_id: req.user!.user_id,
    })

    res.json({ data: workOrder })
  } catch (error: any) {
    logger.error('Update status error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

export default router
