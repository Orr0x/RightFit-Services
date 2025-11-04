import { Router, Request, Response, NextFunction } from 'express';
import { ServicesService } from '../services/ServicesService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const servicesService = new ServicesService();

router.use(authMiddleware);

// GET /api/services
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const filters = {
      service_type: req.query.service_type as string | undefined,
      is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
    };

    const services = await servicesService.list(serviceProviderId, filters);
    res.json({ data: services });
  } catch (error) {
    next(error);
  }
});

// GET /api/services/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const service = await servicesService.getById(req.params.id, serviceProviderId);
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

export default router;
