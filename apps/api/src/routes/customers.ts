import { Router, Request, Response, NextFunction } from 'express';
import { CustomersService } from '../services/CustomersService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const customersService = new CustomersService();

router.use(authMiddleware);

// GET /api/customers
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;

    const result = await customersService.list(tenantId, page, limit, search);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const customer = await customersService.getById(req.params.id, tenantId);
    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const customer = await customersService.create(req.body, tenantId);
    res.status(201).json({ data: customer });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/customers/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const customer = await customersService.update(req.params.id, req.body, tenantId);
    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    await customersService.delete(req.params.id, tenantId);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
