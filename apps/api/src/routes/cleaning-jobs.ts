import { Router, Request, Response, NextFunction } from 'express';
import { CleaningJobsService } from '../services/CleaningJobsService';
import { CleaningJobHistoryService } from '../services/CleaningJobHistoryService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const cleaningJobsService = new CleaningJobsService();
const historyService = new CleaningJobHistoryService();

// All routes require authentication
router.use(authMiddleware);

// GET /api/cleaning-jobs
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
      worker_id: req.query.worker_id as string,
      property_id: req.query.property_id as string,
      customer_id: req.query.customer_id as string,
      from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
      to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
    };

    const result = await cleaningJobsService.list(serviceProviderId, page, limit, filters);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-jobs/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const job = await cleaningJobsService.getById(req.params.id, serviceProviderId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-jobs/:id/history
router.get('/:id/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    // Verify job belongs to this provider
    await cleaningJobsService.getById(req.params.id, serviceProviderId);

    // Get history
    const history = await historyService.getJobHistory(req.params.id);
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-jobs
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    // Convert scheduled_date string to Date object
    const jobData = {
      ...req.body,
      scheduled_date: new Date(req.body.scheduled_date),
    };

    const job = await cleaningJobsService.create(jobData, serviceProviderId);
    res.status(201).json({ data: job });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cleaning-jobs/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    // Convert scheduled_date string to Date object if provided
    const updateData = {
      ...req.body,
      ...(req.body.scheduled_date && { scheduled_date: new Date(req.body.scheduled_date) }),
      ...(req.body.actual_start_time && { actual_start_time: new Date(req.body.actual_start_time) }),
      ...(req.body.actual_end_time && { actual_end_time: new Date(req.body.actual_end_time) }),
    };

    const job = await cleaningJobsService.update(req.params.id, updateData, serviceProviderId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cleaning-jobs/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    await cleaningJobsService.delete(req.params.id, serviceProviderId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Mobile worker endpoints

// GET /api/cleaning-jobs/worker/today
router.get('/worker/today', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.query.worker_id as string;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const jobs = await cleaningJobsService.getTodaysJobs(workerId);
    res.json({ data: jobs });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-jobs/:id/start
router.post('/:id/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.body.worker_id;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const job = await cleaningJobsService.startJob(req.params.id, workerId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-jobs/:id/complete
router.post('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.body.worker_id;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const job = await cleaningJobsService.completeJob(req.params.id, workerId, {
      completion_notes: req.body.completion_notes,
      actual_price: req.body.actual_price,
    });
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

export default router;
