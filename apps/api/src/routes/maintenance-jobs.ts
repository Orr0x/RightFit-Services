import { Router, Request, Response, NextFunction } from 'express';
import { MaintenanceJobsService } from '../services/MaintenanceJobsService';
import { authMiddleware } from '../middleware/auth';
import { requireServiceProvider } from '../middleware/requireServiceProvider';

const router: Router = Router();
const maintenanceJobsService = new MaintenanceJobsService();

// All routes require authentication
router.use(authMiddleware);

// ============================================================================
// COLLECTION ROUTES (no :id parameter)
// ============================================================================

// GET /api/maintenance-jobs
router.get('/', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

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
router.post('/', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    const job = await maintenanceJobsService.create(req.body, serviceProviderId);
    res.status(201).json({ data: job });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-jobs/from-cleaning-issue
router.post('/from-cleaning-issue', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

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
router.get('/contractors/available', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

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
router.put('/:id/assign', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

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
router.put('/:id/assign-external', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

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
router.post('/:id/submit-quote', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

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
router.post('/:id/decline', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    const result = await maintenanceJobsService.declineJob(req.params.id, serviceProviderId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-jobs/:id/complete
router.post('/:id/complete', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

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
router.get('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    const job = await maintenanceJobsService.getById(req.params.id, serviceProviderId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// PUT /api/maintenance-jobs/:id
router.put('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    // Extract service_provider_id from body before passing to service
    const { service_provider_id, ...updateData } = req.body;

    const job = await maintenanceJobsService.update(req.params.id, updateData, serviceProviderId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/maintenance-jobs/:id
router.delete('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    await maintenanceJobsService.delete(req.params.id, serviceProviderId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
