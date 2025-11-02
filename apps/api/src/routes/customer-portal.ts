import { Router, Request, Response, NextFunction } from 'express';
import { CustomerPortalService } from '../services/CustomerPortalService';
import { authMiddleware } from '../middleware/auth';

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

export default router;
