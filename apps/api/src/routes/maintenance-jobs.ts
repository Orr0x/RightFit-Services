import { Router, Request, Response, NextFunction } from 'express';
import { MaintenanceJobsService } from '../services/MaintenanceJobsService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const maintenanceJobsService = new MaintenanceJobsService();

// All routes require authentication
router.use(authMiddleware);

// GET /api/maintenance-jobs
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      worker_id: req.query.worker_id as string,
      contractor_id: req.query.contractor_id as string,
      property_id: req.query.property_id as string,
      customer_id: req.query.customer_id as string,
      from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
      to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
    };

    const result = await maintenanceJobsService.list(serviceProviderId, page, limit, filters);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/maintenance-jobs/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const job = await maintenanceJobsService.getById(req.params.id, serviceProviderId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-jobs
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const job = await maintenanceJobsService.create(req.body, serviceProviderId);
    res.status(201).json({ data: job });
  } catch (error) {
    next(error);
  }
});

// PUT /api/maintenance-jobs/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const job = await maintenanceJobsService.update(req.params.id, req.body, serviceProviderId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/maintenance-jobs/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    await maintenanceJobsService.delete(req.params.id, serviceProviderId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-jobs/from-cleaning-issue
// Create maintenance job from cleaning job issue
router.post('/from-cleaning-issue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { cleaning_job_id, ...issueData } = req.body;
    const job = await maintenanceJobsService.createFromCleaningIssue(
      cleaning_job_id,
      issueData,
      serviceProviderId
    );
    res.status(201).json({ data: job });
  } catch (error) {
    next(error);
  }
});

export default router;
