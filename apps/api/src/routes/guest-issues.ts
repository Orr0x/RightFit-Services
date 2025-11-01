import { Router, Request, Response, NextFunction } from 'express';
import { GuestIssuesService } from '../services/GuestIssuesService';

const router: Router = Router();
const guestIssuesService = new GuestIssuesService();

// No auth required for guest reporting
// GET /api/guest-issues
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.query.property_id as string;
    const issues = await guestIssuesService.list(propertyId);
    res.json({ data: issues });
  } catch (error) {
    next(error);
  }
});

// GET /api/guest-issues/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await guestIssuesService.getById(req.params.id);
    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

// POST /api/guest-issues
// Public endpoint for guests to report issues
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await guestIssuesService.create(req.body);
    res.status(201).json({
      data: issue,
      message: 'Thank you for reporting this issue. We will address it as soon as possible.',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/guest-issues/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await guestIssuesService.update(req.params.id, req.body);
    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

// POST /api/guest-issues/:id/triage
router.post('/:id/triage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await guestIssuesService.triage(req.params.id, req.body);
    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

export default router;
