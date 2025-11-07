import { Router, Request, Response, NextFunction } from 'express';
import { WorkerIssuesService } from '../services/WorkerIssuesService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const workerIssuesService = new WorkerIssuesService();

router.use(authMiddleware);

// GET /api/worker-issues - List worker issue reports
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      customerId: req.query.customer_id as string,
      propertyId: req.query.property_id as string,
      workerId: req.query.worker_id as string,
      status: req.query.status as string,
    };

    const issues = await workerIssuesService.list(filters);
    res.json({ data: issues });
  } catch (error) {
    next(error);
  }
});

// GET /api/worker-issues/:id - Get single issue report
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await workerIssuesService.getById(req.params.id);
    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

// POST /api/worker-issues - Create new worker issue report
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      property_id,
      customer_id,
      worker_id,
      cleaning_job_id,
      issue_type,
      title,
      issue_description,
      category,
      priority,
      photos,
    } = req.body;

    if (!property_id || !customer_id || !worker_id || !title || !issue_description) {
      return res.status(400).json({
        error: 'property_id, customer_id, worker_id, title, and issue_description are required',
      });
    }

    const issue = await workerIssuesService.create({
      property_id,
      customer_id,
      worker_id,
      cleaning_job_id,
      issue_type: issue_type || 'MAINTENANCE',
      title,
      issue_description,
      category: category || 'OTHER',
      priority: priority || 'MEDIUM',
      photos: photos || [],
    });

    res.status(201).json({
      data: issue,
      message: 'Issue report created successfully. Awaiting customer review.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/worker-issues/:id/approve - Customer approves issue and creates maintenance job
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const issue = await workerIssuesService.approve(req.params.id, customer_id);

    res.json({
      data: issue,
      message: 'Issue approved. Maintenance job created.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/worker-issues/:id/reject - Customer rejects issue
router.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id, rejection_reason } = req.body;

    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const issue = await workerIssuesService.reject(req.params.id, customer_id, rejection_reason);

    res.json({
      data: issue,
      message: 'Issue rejected.',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/worker-issues/:id/status - Update issue status
router.put('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const issue = await workerIssuesService.updateStatus(req.params.id, status);
    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

export default router;
