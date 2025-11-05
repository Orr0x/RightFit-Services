import { Router, Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/InvoiceService';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();
const invoiceService = new InvoiceService();

// Helper to get service provider ID from tenant
async function getServiceProviderId(tenantId: string): Promise<string> {
  const serviceProvider = await prisma.serviceProvider.findUnique({
    where: { tenant_id: tenantId },
    select: { id: true },
  });

  if (!serviceProvider) {
    throw new NotFoundError('Service provider not found for this tenant');
  }

  return serviceProvider.id;
}

// All routes require authentication
router.use(authMiddleware);

// GET /api/invoices
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

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
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const invoice = await invoiceService.getById(req.params.id, serviceProviderId);
    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// POST /api/invoices
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const {
      customer_id,
      cleaning_job_id,
      invoice_date,
      due_date,
      line_items,
      notes,
    } = req.body;

    if (!customer_id || !invoice_date || !due_date || !line_items || !Array.isArray(line_items)) {
      return res.status(400).json({
        error: 'customer_id, invoice_date, due_date, and line_items (array) are required',
      });
    }

    const invoice = await invoiceService.create(
      {
        customer_id,
        cleaning_job_id,
        invoice_date,
        due_date,
        line_items,
        notes,
      },
      serviceProviderId
    );

    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/invoices/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const {
      invoice_date,
      due_date,
      line_items,
      notes,
    } = req.body;

    const invoice = await invoiceService.update(
      req.params.id,
      {
        invoice_date,
        due_date,
        line_items,
        notes,
      },
      serviceProviderId
    );

    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    await invoiceService.delete(req.params.id, serviceProviderId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// PUT /api/invoices/:id/mark-paid
router.put('/:id/mark-paid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

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
