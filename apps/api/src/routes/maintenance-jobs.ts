import { Router, Request, Response, NextFunction } from 'express';
import { MaintenanceJobsService } from '../services/MaintenanceJobsService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const maintenanceJobsService = new MaintenanceJobsService();

// All routes require authentication
router.use(authMiddleware);

// ============================================================================
// COLLECTION ROUTES (no :id parameter)
// ============================================================================

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

// POST /api/maintenance-jobs/from-cleaning-issue
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

// GET /api/maintenance-jobs/contractors/available
router.get('/contractors/available', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { date, start_time, end_time } = req.query;

    if (!date || !start_time || !end_time) {
      return res.status(400).json({
        error: 'date, start_time, and end_time are required',
      });
    }

    const contractors = await maintenanceJobsService.getAvailableContractors(
      new Date(date as string),
      start_time as string,
      end_time as string,
      serviceProviderId
    );

    res.json({ data: contractors });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// SPECIFIC ID ROUTES (must come BEFORE generic /:id routes)
// ============================================================================

// PUT /api/maintenance-jobs/:id/assign
router.put('/:id/assign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { worker_id, scheduled_date, scheduled_start_time, scheduled_end_time } = req.body;

    if (!worker_id || !scheduled_date || !scheduled_start_time || !scheduled_end_time) {
      return res.status(400).json({
        error: 'worker_id, scheduled_date, scheduled_start_time, and scheduled_end_time are required',
      });
    }

    const job = await maintenanceJobsService.assignInternalContractor(
      req.params.id,
      worker_id,
      new Date(scheduled_date),
      scheduled_start_time,
      scheduled_end_time,
      serviceProviderId
    );

    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// PUT /api/maintenance-jobs/:id/assign-external
router.put('/:id/assign-external', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { external_contractor_id, scheduled_date, scheduled_start_time, scheduled_end_time } = req.body;

    if (!external_contractor_id || !scheduled_date || !scheduled_start_time || !scheduled_end_time) {
      return res.status(400).json({
        error: 'external_contractor_id, scheduled_date, scheduled_start_time, and scheduled_end_time are required',
      });
    }

    const job = await maintenanceJobsService.assignExternalContractor(
      req.params.id,
      external_contractor_id,
      new Date(scheduled_date),
      scheduled_start_time,
      scheduled_end_time,
      serviceProviderId
    );

    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-jobs/:id/submit-quote
router.post('/:id/submit-quote', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { parts_cost, labor_cost, total, notes } = req.body;

    const result = await maintenanceJobsService.submitQuote(
      req.params.id,
      serviceProviderId,
      { parts_cost, labor_cost, total, notes }
    );

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-jobs/:id/decline
router.post('/:id/decline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const result = await maintenanceJobsService.declineJob(req.params.id, serviceProviderId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-jobs/:id/complete
router.post('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const {
      worker_id,
      work_performed,
      diagnosis,
      before_photo_ids,
      after_photo_ids,
      work_in_progress_photo_ids,
      actual_hours_worked,
      actual_parts_cost,
      generate_invoice,
    } = req.body;

    if (!work_performed) {
      return res.status(400).json({ error: 'work_performed is required' });
    }

    const result = await maintenanceJobsService.completeJob(
      req.params.id,
      serviceProviderId,
      {
        worker_id,
        work_performed,
        diagnosis,
        before_photo_ids,
        after_photo_ids,
        work_in_progress_photo_ids,
        actual_hours_worked: actual_hours_worked ? parseFloat(actual_hours_worked) : undefined,
        actual_parts_cost: actual_parts_cost ? parseFloat(actual_parts_cost) : undefined,
        generate_invoice,
      }
    );

    res.json({ data: result.job, invoice_id: result.invoice_id });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GENERIC ID ROUTES (must come AFTER specific /:id/* routes)
// ============================================================================

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

export default router;
