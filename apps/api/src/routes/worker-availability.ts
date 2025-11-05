import { Router, Request, Response, NextFunction } from 'express';
import { WorkerAvailabilityService } from '../services/WorkerAvailabilityService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const availabilityService = new WorkerAvailabilityService();

router.use(authMiddleware);

// GET /api/worker-availability - List availability for a worker
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.query.worker_id as string;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const filters: any = {};

    if (req.query.status) {
      filters.status = req.query.status as 'BLOCKED' | 'AVAILABLE';
    }

    if (req.query.from_date) {
      filters.from_date = new Date(req.query.from_date as string);
    }

    if (req.query.to_date) {
      filters.to_date = new Date(req.query.to_date as string);
    }

    const availability = await availabilityService.list(workerId, filters);
    res.json({ data: availability });
  } catch (error) {
    next(error);
  }
});

// GET /api/worker-availability/blocked-dates - Get blocked dates for date range
router.get('/blocked-dates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.query.worker_id as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    if (!workerId || !startDate || !endDate) {
      return res.status(400).json({ error: 'worker_id, start_date, and end_date are required' });
    }

    const blockedDates = await availabilityService.getBlockedDates(
      workerId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({ data: blockedDates });
  } catch (error) {
    next(error);
  }
});

// GET /api/worker-availability/check - Check if worker is available on a date
router.get('/check', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.query.worker_id as string;
    const date = req.query.date as string;

    if (!workerId || !date) {
      return res.status(400).json({ error: 'worker_id and date are required' });
    }

    const isAvailable = await availabilityService.isWorkerAvailable(workerId, new Date(date));
    res.json({ data: { is_available: isAvailable } });
  } catch (error) {
    next(error);
  }
});

// GET /api/worker-availability/:id - Get single availability record
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.query.worker_id as string;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const availability = await availabilityService.getById(req.params.id, workerId);
    res.json({ data: availability });
  } catch (error) {
    next(error);
  }
});

// POST /api/worker-availability - Create new availability record
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { worker_id, start_date, end_date, reason, status } = req.body;

    if (!worker_id || !start_date || !end_date || !status) {
      return res.status(400).json({
        error: 'worker_id, start_date, end_date, and status are required',
      });
    }

    const availability = await availabilityService.create({
      worker_id,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      reason,
      status,
    });

    res.status(201).json({ data: availability });
  } catch (error) {
    next(error);
  }
});

// PUT /api/worker-availability/:id - Update availability record
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.body.worker_id as string;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const updateData: any = {};
    if (req.body.start_date) updateData.start_date = new Date(req.body.start_date);
    if (req.body.end_date) updateData.end_date = new Date(req.body.end_date);
    if (req.body.reason !== undefined) updateData.reason = req.body.reason;
    if (req.body.status) updateData.status = req.body.status;

    const availability = await availabilityService.update(req.params.id, workerId, updateData);
    res.json({ data: availability });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/worker-availability/:id - Delete availability record
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.query.worker_id as string;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    await availabilityService.delete(req.params.id, workerId);
    res.json({ message: 'Availability record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
