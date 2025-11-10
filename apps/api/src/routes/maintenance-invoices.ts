import { Router, Request, Response, NextFunction } from 'express';
import { MaintenanceInvoiceService } from '../services/MaintenanceInvoiceService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const maintenanceInvoiceService = new MaintenanceInvoiceService();

// Helper function to get service provider ID from tenant
async function getServiceProviderId(tenantId: string): Promise<string> {
  return tenantId; // In multi-tenant setup, tenant_id IS the service_provider_id
}

// All routes require authentication
router.use(authMiddleware);

// GET /api/maintenance-invoices
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const filters = {
      status: req.query.status as string,
      customer_id: req.query.customer_id as string,
      maintenance_job_id: req.query.maintenance_job_id as string,
      from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
      to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
    };

    const result = await maintenanceInvoiceService.list(serviceProviderId, page, limit, filters);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/maintenance-invoices/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const invoice = await maintenanceInvoiceService.getById(req.params.id, serviceProviderId);
    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-invoices/from-job
router.post('/from-job', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const { maintenance_job_id, invoice_date, due_date, notes } = req.body;

    if (!maintenance_job_id) {
      return res.status(400).json({ error: 'maintenance_job_id is required' });
    }

    const invoice = await maintenanceInvoiceService.createFromJob(
      maintenance_job_id,
      serviceProviderId,
      {
        invoice_date: invoice_date ? new Date(invoice_date) : undefined,
        due_date: due_date ? new Date(due_date) : undefined,
        notes,
      }
    );

    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance-invoices
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const {
      customer_id,
      maintenance_job_id,
      invoice_date,
      due_date,
      line_items,
      subtotal,
      tax_percentage,
      notes,
    } = req.body;

    if (!customer_id || !invoice_date || !due_date || !line_items || subtotal === undefined) {
      return res.status(400).json({
        error: 'customer_id, invoice_date, due_date, line_items, and subtotal are required',
      });
    }

    const invoice = await maintenanceInvoiceService.create(
      {
        customer_id,
        maintenance_job_id,
        invoice_date: new Date(invoice_date),
        due_date: new Date(due_date),
        line_items,
        subtotal,
        tax_percentage,
        notes,
      },
      serviceProviderId
    );

    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/maintenance-invoices/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const { line_items, subtotal, tax_percentage, notes, status } = req.body;

    const invoice = await maintenanceInvoiceService.update(
      req.params.id,
      serviceProviderId,
      { line_items, subtotal, tax_percentage, notes, status }
    );

    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// PUT /api/maintenance-invoices/:id/mark-paid
router.put('/:id/mark-paid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const { payment_method, payment_reference } = req.body;

    if (!payment_method) {
      return res.status(400).json({ error: 'payment_method is required' });
    }

    const invoice = await maintenanceInvoiceService.markAsPaid(
      req.params.id,
      serviceProviderId,
      { payment_method, payment_reference }
    );

    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/maintenance-invoices/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    await maintenanceInvoiceService.delete(req.params.id, serviceProviderId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/maintenance-invoices/customer/:customerId/stats
router.get('/customer/:customerId/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const stats = await maintenanceInvoiceService.getCustomerStats(
      req.params.customerId,
      serviceProviderId
    );

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
