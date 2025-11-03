import { Router, Request, Response, NextFunction } from 'express';
import { CustomerPortalService } from '../services/CustomerPortalService';

const router: Router = Router();
const customerPortalService = new CustomerPortalService();

// ============================================================================
// AUTHENTICATION (No auth required)
// ============================================================================

// POST /api/customer-portal/auth/login
router.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await customerPortalService.login(email, password);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-portal/auth/register
router.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, customerId } = req.body;

    if (!email || !password || !customerId) {
      return res.status(400).json({ error: 'Email, password, and customerId are required' });
    }

    const result = await customerPortalService.register(email, password, customerId);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// CUSTOMER PORTAL ENDPOINTS (Auth required - tenant context from customer_id)
// ============================================================================

// For customer portal, we'll use a simple middleware that extracts customer_id from query or body
// In production, you'd use JWT tokens with customer_id in the payload
const customerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const customerId = req.query.customer_id as string || req.body.customer_id;

  if (!customerId) {
    return res.status(401).json({ error: 'customer_id is required' });
  }

  // Store customer_id in request for use in route handlers
  (req as any).customerId = customerId;
  next();
};

// GET /api/customer-portal/dashboard?customer_id=xxx
router.get('/dashboard', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const dashboard = await customerPortalService.getDashboard(customerId);
    res.json({ data: dashboard });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-portal/properties/:id/history?customer_id=xxx
router.get('/properties/:id/history', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const propertyId = req.params.id;

    const history = await customerPortalService.getPropertyHistory(customerId, propertyId);
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customer-portal/quotes/:id/approve
router.put('/quotes/:id/approve', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const quoteId = req.params.id;

    const quote = await customerPortalService.approveQuote(customerId, quoteId);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customer-portal/quotes/:id/decline
router.put('/quotes/:id/decline', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const quoteId = req.params.id;
    const { reason } = req.body;

    const quote = await customerPortalService.declineQuote(customerId, quoteId, reason);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-portal/preferences?customer_id=xxx
router.get('/preferences', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const preferences = await customerPortalService.getPreferences(customerId);
    res.json({ data: preferences });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customer-portal/preferences
router.put('/preferences', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const preferences = await customerPortalService.updatePreferences(customerId, req.body);
    res.json({ data: preferences });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-portal/properties?customer_id=xxx
router.get('/properties', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const properties = await customerPortalService.getProperties(customerId);
    res.json({ data: properties });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-portal/guest-issues?customer_id=xxx
router.get('/guest-issues', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const issues = await customerPortalService.getGuestIssues(customerId);
    res.json({ data: issues });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-portal/guest-issues/:id/submit
router.post('/guest-issues/:id/submit', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const issueId = req.params.id;
    const result = await customerPortalService.submitGuestIssue(customerId, issueId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-portal/guest-issues/:id/dismiss
router.post('/guest-issues/:id/dismiss', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const issueId = req.params.id;
    const result = await customerPortalService.dismissGuestIssue(customerId, issueId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-portal/jobs/:jobId/rate
// Customer rates a completed maintenance job
router.post('/jobs/:jobId/rate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rating, customerId } = req.body;

    if (!customerId || !rating) {
      return res.status(400).json({ error: 'customerId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await customerPortalService.rateMaintenanceJob(req.params.jobId, customerId, rating);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-portal/notifications?customer_id=xxx
router.get('/notifications', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const notifications = await customerPortalService.getNotifications(customerId);
    res.json({ data: notifications });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customer-portal/notifications/:id/mark-read
router.put('/notifications/:id/mark-read', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const notificationId = req.params.id;
    const notification = await customerPortalService.markNotificationAsRead(customerId, notificationId);
    res.json({ data: notification });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-portal/maintenance-jobs/:id?customer_id=xxx
router.get('/maintenance-jobs/:id', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const jobId = req.params.id;
    const job = await customerPortalService.getMaintenanceJobDetails(customerId, jobId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-portal/maintenance-jobs/:id/comment
router.post('/maintenance-jobs/:id/comment', customerAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).customerId;
    const jobId = req.params.id;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const result = await customerPortalService.addJobComment(customerId, jobId, comment);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
