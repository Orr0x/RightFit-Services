import { Router, Request, Response, NextFunction } from 'express';
import { CustomerPropertiesService } from '../services/CustomerPropertiesService';
import { PropertyHistoryService } from '../services/PropertyHistoryService';
import { authMiddleware } from '../middleware/auth';
import { requireServiceProvider } from '../middleware/requireServiceProvider';

const router: Router = Router();
const customerPropertiesService = new CustomerPropertiesService();
const propertyHistoryService = new PropertyHistoryService();

router.use(authMiddleware);

// GET /api/customer-properties
router.get('/', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;
    const customerId = req.query.customer_id as string | undefined;

    const result = await customerPropertiesService.list(serviceProviderId, page, limit, search, customerId);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-properties/:id
router.get('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;
    const property = await customerPropertiesService.getById(req.params.id, serviceProviderId);
    res.json({ data: property });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-properties/:id/history
router.get('/:id/history', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;
    const propertyId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 50;

    // Verify property belongs to service provider
    await customerPropertiesService.getById(propertyId, serviceProviderId);

    // Get property history
    const history = await propertyHistoryService.getPropertyHistory(propertyId, limit);
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-properties
router.post('/', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;
    const property = await customerPropertiesService.create(req.body, serviceProviderId);
    res.status(201).json({ data: property });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/customer-properties/:id
router.patch('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;
    const property = await customerPropertiesService.update(req.params.id, req.body, serviceProviderId);
    res.json({ data: property });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customer-properties/:id
router.delete('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;
    await customerPropertiesService.delete(req.params.id, serviceProviderId);
    res.json({ message: 'Customer property deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-properties/:id/checklist-templates
router.get('/:id/checklist-templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const propertyId = req.params.id;

    // Verify property belongs to tenant
    await customerPropertiesService.getById(propertyId, tenantId);

    // Get linked checklist templates
    const templates = await customerPropertiesService.getChecklistTemplates(propertyId);
    res.json({ data: templates });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-properties/:id/checklist-templates
router.post('/:id/checklist-templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const propertyId = req.params.id;
    const { checklist_template_id } = req.body;

    if (!checklist_template_id) {
      return res.status(400).json({ error: 'checklist_template_id is required' });
    }

    // Verify property belongs to tenant
    await customerPropertiesService.getById(propertyId, tenantId);

    // Link checklist template to property
    const link = await customerPropertiesService.linkChecklistTemplate(propertyId, checklist_template_id);
    res.status(201).json({ data: link });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customer-properties/:id/checklist-templates/:templateId
router.delete('/:id/checklist-templates/:templateId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const propertyId = req.params.id;
    const templateId = req.params.templateId;

    // Verify property belongs to tenant
    await customerPropertiesService.getById(propertyId, tenantId);

    // Unlink checklist template from property
    await customerPropertiesService.unlinkChecklistTemplate(propertyId, templateId);
    res.json({ message: 'Checklist template unlinked successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
