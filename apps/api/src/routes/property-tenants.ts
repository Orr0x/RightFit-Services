import { Router, Request, Response, NextFunction } from 'express'
import { tenantService } from '../services/TenantService'
import { authMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router: Router = Router()

// All routes require authentication
router.use(authMiddleware)

// Validation schemas
const createPropertyTenantSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  moveInDate: z.string().datetime().or(z.date()),
  leaseExpiryDate: z.string().datetime().or(z.date()).optional(),
  rentAmount: z.number().positive(),
  rentFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']),
  rentDueDay: z.number().int().min(1).max(31).optional(),
  notes: z.string().max(1000).optional(),
})

const updatePropertyTenantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  moveInDate: z.string().datetime().or(z.date()).optional(),
  leaseExpiryDate: z.string().datetime().or(z.date()).optional(),
  rentAmount: z.number().positive().optional(),
  rentFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
  rentDueDay: z.number().int().min(1).max(31).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'NOTICE_GIVEN']).optional(),
  notes: z.string().max(1000).optional(),
})

const recordRentPaymentSchema = z.object({
  propertyTenantId: z.string().uuid(),
  amount: z.number().positive(),
  paymentDate: z.string().datetime().or(z.date()),
  expectedDate: z.string().datetime().or(z.date()).optional(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'CHEQUE', 'STANDING_ORDER', 'OTHER']).optional(),
  reference: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

// GET /api/tenants - List property tenants
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)

    const options = {
      propertyId: req.query.propertyId as string | undefined,
      status: req.query.status as 'ACTIVE' | 'INACTIVE' | 'NOTICE_GIVEN' | undefined,
      page,
      limit,
    }

    const result = await tenantService.listPropertyTenants(tenantId, options)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

// GET /api/tenants/alerts/expiring-leases - Get tenants with expiring leases
// Must be before /:id route to avoid matching
router.get('/alerts/expiring-leases', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const daysInAdvance = parseInt(req.query.days as string) || 60

    const expiringLeases = await tenantService.getExpiringLeases(tenantId, daysInAdvance)
    res.json({ data: expiringLeases })
  } catch (error) {
    next(error)
  }
})

// GET /api/tenants/alerts/overdue-rent - Get tenants with overdue rent
router.get('/alerts/overdue-rent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const overdueRent = await tenantService.getOverdueRent(tenantId)
    res.json({ data: overdueRent })
  } catch (error) {
    next(error)
  }
})

// GET /api/tenants/:id - Get single property tenant
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const propertyTenant = await tenantService.getPropertyTenantById(req.params.id, tenantId)
    res.json({ data: propertyTenant })
  } catch (error) {
    next(error)
  }
})

// POST /api/tenants - Create property tenant
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createPropertyTenantSchema.parse(req.body)
    const tenantId = req.user!.tenant_id

    // Convert date strings to Date objects if needed
    const data = {
      ...input,
      moveInDate: typeof input.moveInDate === 'string' ? new Date(input.moveInDate) : input.moveInDate,
      leaseExpiryDate: input.leaseExpiryDate
        ? typeof input.leaseExpiryDate === 'string'
          ? new Date(input.leaseExpiryDate)
          : input.leaseExpiryDate
        : undefined,
    }

    const propertyTenant = await tenantService.createPropertyTenant(data, tenantId)
    res.status(201).json({ data: propertyTenant })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/tenants/:id - Update property tenant
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updatePropertyTenantSchema.parse(req.body)
    const tenantId = req.user!.tenant_id

    // Convert date strings to Date objects if needed
    const { moveInDate, leaseExpiryDate, ...rest } = input
    const data = {
      ...rest,
      ...(moveInDate && {
        moveInDate: typeof moveInDate === 'string' ? new Date(moveInDate) : moveInDate,
      }),
      ...(leaseExpiryDate && {
        leaseExpiryDate: typeof leaseExpiryDate === 'string' ? new Date(leaseExpiryDate) : leaseExpiryDate,
      }),
    }

    const propertyTenant = await tenantService.updatePropertyTenant(req.params.id, data, tenantId)
    res.json({ data: propertyTenant })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/tenants/:id - Delete property tenant
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    await tenantService.deletePropertyTenant(req.params.id, tenantId)
    res.json({ message: 'Property tenant deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// POST /api/tenants/:id/payments - Record rent payment
router.post('/:id/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = recordRentPaymentSchema.parse({
      ...req.body,
      propertyTenantId: req.params.id,
    })
    const tenantId = req.user!.tenant_id

    // Convert date strings to Date objects if needed
    const data = {
      ...input,
      paymentDate: typeof input.paymentDate === 'string' ? new Date(input.paymentDate) : input.paymentDate,
      expectedDate: input.expectedDate
        ? typeof input.expectedDate === 'string'
          ? new Date(input.expectedDate)
          : input.expectedDate
        : undefined,
    }

    const payment = await tenantService.recordRentPayment(data, tenantId)
    res.status(201).json({ data: payment })
  } catch (error) {
    next(error)
  }
})

// GET /api/tenants/:id/payments - Get rent payments
router.get('/:id/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)

    const result = await tenantService.getRentPayments(req.params.id, tenantId, { page, limit })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

export default router
