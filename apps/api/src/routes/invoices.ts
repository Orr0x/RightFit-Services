import { Router, Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/InvoiceService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const invoiceService = new InvoiceService();

// All routes require authentication
router.use(authMiddleware);

// GET /api/invoices
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
      customer_id: req.query.customer_id as string,
      from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
      to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
    };

    const result = await invoiceService.list(serviceProviderId, page, limit, filters);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const invoice = await invoiceService.getById(req.params.id, serviceProviderId);
    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// PUT /api/invoices/:id/mark-paid
router.put('/:id/mark-paid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { payment_method, payment_reference } = req.body;

    if (!payment_method) {
      return res.status(400).json({ error: 'payment_method is required' });
    }

    const invoice = await invoiceService.markAsPaid(
      req.params.id,
      serviceProviderId,
      { payment_method, payment_reference }
    );

    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

export default router;
