import { Router, Request, Response, NextFunction } from 'express';
import { CustomerPropertiesService } from '../services/CustomerPropertiesService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const customerPropertiesService = new CustomerPropertiesService();

router.use(authMiddleware);

// GET /api/customer-properties
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;
    const customerId = req.query.customer_id as string | undefined;

    const result = await customerPropertiesService.list(tenantId, page, limit, search, customerId);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-properties/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const property = await customerPropertiesService.getById(req.params.id, tenantId);
    res.json({ data: property });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-properties
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const property = await customerPropertiesService.create(req.body, tenantId);
    res.status(201).json({ data: property });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/customer-properties/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const property = await customerPropertiesService.update(req.params.id, req.body, tenantId);
    res.json({ data: property });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customer-properties/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    await customerPropertiesService.delete(req.params.id, tenantId);
    res.json({ message: 'Customer property deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
