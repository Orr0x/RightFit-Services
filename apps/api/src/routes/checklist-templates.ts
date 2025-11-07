import { Router, Request, Response, NextFunction } from 'express';
import { ChecklistTemplatesService, CreateChecklistTemplateData, UpdateChecklistTemplateData } from '../services/ChecklistTemplatesService';
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

// POST /api/checklist-templates
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service_provider_id, customer_id, template_name, property_type, sections, estimated_duration_minutes, is_active } = req.body;

    if (!service_provider_id) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    if (!template_name || !property_type || !sections || !estimated_duration_minutes) {
      return res.status(400).json({ error: 'template_name, property_type, sections, and estimated_duration_minutes are required' });
    }

    const data: CreateChecklistTemplateData = {
      service_provider_id,
      customer_id,
      template_name,
      property_type,
      sections,
      estimated_duration_minutes: parseInt(estimated_duration_minutes, 10),
      is_active,
    };

    const template = await checklistTemplatesService.create(data);
    res.status(201).json({ data: template });
  } catch (error) {
    next(error);
  }
});

// PUT /api/checklist-templates/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { template_name, property_type, sections, estimated_duration_minutes, is_active, customer_id } = req.body;

    const data: UpdateChecklistTemplateData = {
      template_name,
      property_type,
      sections,
      estimated_duration_minutes: estimated_duration_minutes ? parseInt(estimated_duration_minutes, 10) : undefined,
      is_active,
      customer_id,
    };

    const template = await checklistTemplatesService.update(req.params.id, data, serviceProviderId);
    res.json({ data: template });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/checklist-templates/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id || req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    await checklistTemplatesService.delete(req.params.id, serviceProviderId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
