import { Router, Request, Response, NextFunction } from 'express'
import { PropertiesService } from '../services/PropertiesService'
import { createPropertySchema, updatePropertySchema } from '@rightfit/shared'
import { authMiddleware } from '../middleware/auth'

const router: Router = Router()
const propertiesService = new PropertiesService()

// All routes require authentication
router.use(authMiddleware)

// GET /api/properties
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const search = req.query.search as string | undefined

    const result = await propertiesService.list(tenantId, page, limit, search)
    res.json({ data: result.data, pagination: result.pagination })
  } catch (error) {
    next(error)
  }
})

// GET /api/properties/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const property = await propertiesService.getById(req.params.id, tenantId)
    res.json({ data: property })
  } catch (error) {
    next(error)
  }
})

// POST /api/properties
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createPropertySchema.parse(req.body)
    const tenantId = req.user!.tenant_id
    const userId = req.user!.user_id

    const property = await propertiesService.create(input, tenantId, userId)
    res.status(201).json({ data: property })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/properties/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updatePropertySchema.parse(req.body)
    const tenantId = req.user!.tenant_id

    const property = await propertiesService.update(req.params.id, input, tenantId)
    res.json({ data: property })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/properties/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    await propertiesService.delete(req.params.id, tenantId)
    res.json({ message: 'Property deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
