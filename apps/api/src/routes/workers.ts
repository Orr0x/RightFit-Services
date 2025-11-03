import { Router, Request, Response, NextFunction } from 'express';
import { WorkersService } from '../services/WorkersService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const workersService = new WorkersService();

router.use(authMiddleware);

// GET /api/workers
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const filters = {
      worker_type: req.query.worker_type as string | undefined,
      employment_type: req.query.employment_type as string | undefined,
      is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
    };

    const workers = await workersService.list(serviceProviderId, filters);
    res.json({ data: workers });
  } catch (error) {
    next(error);
  }
});

// GET /api/workers/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const worker = await workersService.getById(req.params.id, serviceProviderId);
    res.json({ data: worker });
  } catch (error) {
    next(error);
  }
});

// POST /api/workers
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const worker = await workersService.create(req.body, serviceProviderId);
    res.status(201).json({ data: worker });
  } catch (error) {
    next(error);
  }
});

// PUT /api/workers/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const worker = await workersService.update(req.params.id, req.body, serviceProviderId);
    res.json({ data: worker });
  } catch (error) {
    next(error);
  }
});

export default router;
