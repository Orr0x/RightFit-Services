import { Router, Request, Response, NextFunction } from 'express';
import { QuotesService } from '../services/QuotesService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const quotesService = new QuotesService();

router.use(authMiddleware);

// GET /api/quotes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const status = req.query.status as string;
    const quotes = await quotesService.list(serviceProviderId, status);
    res.json({ data: quotes });
  } catch (error) {
    next(error);
  }
});

// GET /api/quotes/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const quote = await quotesService.getById(req.params.id, serviceProviderId);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// POST /api/quotes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const quote = await quotesService.create(req.body, serviceProviderId);
    res.status(201).json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// PUT /api/quotes/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const quote = await quotesService.update(req.params.id, req.body, serviceProviderId);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// POST /api/quotes/:id/approve
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const approvedBy = req.body.approved_by || 'Customer';
    const quote = await quotesService.approve(req.params.id, approvedBy);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// POST /api/quotes/:id/decline
router.post('/:id/decline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reason = req.body.reason || '';
    const quote = await quotesService.decline(req.params.id, reason);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

export default router;
