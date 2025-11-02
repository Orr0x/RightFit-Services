import { Router, Request, Response, NextFunction } from 'express'
import { PropertySharesService } from '../services/PropertySharesService'
import { authMiddleware } from '../middleware/auth'

const router: Router = Router()
const propertySharesService = new PropertySharesService()

// All routes require authentication
router.use(authMiddleware)

// GET /api/property-shares
// List all property shares for current tenant (given, received, or all)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const type = req.query.type as 'given' | 'received' | 'all' | undefined

    const shares = await propertySharesService.list(tenantId, { type })
    res.json({ data: shares })
  } catch (error) {
    next(error)
  }
})

// GET /api/property-shares/:id
// Get a specific property share
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const share = await propertySharesService.getById(req.params.id, tenantId)
    res.json({ data: share })
  } catch (error) {
    next(error)
  }
})

// POST /api/property-shares
// Create a new property share
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const share = await propertySharesService.create(req.body, tenantId)
    res.status(201).json({ data: share })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/property-shares/:id
// Update property share permissions
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const share = await propertySharesService.update(req.params.id, req.body, tenantId)
    res.json({ data: share })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/property-shares/:id
// Revoke a property share (soft delete)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    await propertySharesService.revoke(req.params.id, tenantId)
    res.json({ message: 'Property share revoked successfully' })
  } catch (error) {
    next(error)
  }
})

// GET /api/properties/:propertyId/shares
// Get all shares for a specific property
router.get('/properties/:propertyId/shares', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const shares = await propertySharesService.getSharesForProperty(req.params.propertyId, tenantId)
    res.json({ data: shares })
  } catch (error) {
    next(error)
  }
})

// GET /api/properties/:propertyId/check-access
// Check if current tenant has access to a property
router.get('/properties/:propertyId/check-access', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const access = await propertySharesService.checkAccess(req.params.propertyId, tenantId)
    res.json({ data: access })
  } catch (error) {
    next(error)
  }
})

export default router
