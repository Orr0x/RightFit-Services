import { Router, Request, Response, NextFunction } from 'express';
import { ChecklistTemplatesService } from '../services/ChecklistTemplatesService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const checklistTemplatesService = new ChecklistTemplatesService();

router.use(authMiddleware);

// GET /api/checklist-templates
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const filters = {
      property_type: req.query.property_type as string | undefined,
      customer_id: req.query.customer_id as string | undefined,
      is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
    };

    const templates = await checklistTemplatesService.list(serviceProviderId, filters);
    res.json({ data: templates });
  } catch (error) {
    next(error);
  }
});

// GET /api/checklist-templates/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const template = await checklistTemplatesService.getById(req.params.id, serviceProviderId);
    res.json({ data: template });
  } catch (error) {
    next(error);
  }
});

export default router;
