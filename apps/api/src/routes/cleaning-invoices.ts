import { Router, Request, Response, NextFunction } from 'express';
import { CleaningInvoiceService } from '../services/CleaningInvoiceService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const cleaningInvoiceService = new CleaningInvoiceService();

// All routes require authentication
router.use(authMiddleware);

// GET /api/cleaning-invoices
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
      contract_id: req.query.contract_id as string,
      from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
      to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
    };

    const result = await cleaningInvoiceService.list(serviceProviderId, page, limit, filters);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-invoices/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const invoice = await cleaningInvoiceService.getById(req.params.id, serviceProviderId);
    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-invoices/generate
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { contract_id, billing_period_start, billing_period_end } = req.body;

    if (!contract_id || !billing_period_start || !billing_period_end) {
      return res.status(400).json({
        error: 'contract_id, billing_period_start, and billing_period_end are required',
      });
    }

    const invoice = await cleaningInvoiceService.generateFromContract(
      contract_id,
      new Date(billing_period_start),
      new Date(billing_period_end),
      serviceProviderId
    );

    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cleaning-invoices/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { additional_charges, notes, status } = req.body;

    const invoice = await cleaningInvoiceService.update(
      req.params.id,
      serviceProviderId,
      { additional_charges, notes, status }
    );

    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cleaning-invoices/:id/mark-paid
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

    const invoice = await cleaningInvoiceService.markAsPaid(
      req.params.id,
      serviceProviderId,
      { payment_method, payment_reference }
    );

    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cleaning-invoices/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    await cleaningInvoiceService.delete(req.params.id, serviceProviderId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-invoices/customer/:customerId/stats
router.get('/customer/:customerId/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const stats = await cleaningInvoiceService.getCustomerStats(
      req.params.customerId,
      serviceProviderId
    );

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
