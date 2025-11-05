import { Router, Request, Response, NextFunction } from 'express';
import { CleaningQuoteService } from '../services/CleaningQuoteService';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();
const cleaningQuoteService = new CleaningQuoteService();

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

router.use(authMiddleware);

// GET /api/cleaning-quotes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const filters = {
      status: req.query.status as string,
      customer_id: req.query.customer_id as string,
      property_id: req.query.property_id as string,
    };

    const result = await cleaningQuoteService.list(serviceProviderId, page, limit, filters);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-quotes/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const quote = await cleaningQuoteService.getById(req.params.id, serviceProviderId);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-quotes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const {
      customer_id,
      property_id,
      cleaning_job_id,
      quote_date,
      valid_until_date,
      line_items,
      subtotal,
      discount_percentage,
      discount_amount,
      notes,
    } = req.body;

    if (!customer_id || !quote_date || !valid_until_date || !line_items || subtotal === undefined) {
      return res.status(400).json({
        error: 'customer_id, quote_date, valid_until_date, line_items, and subtotal are required',
      });
    }

    const quote = await cleaningQuoteService.create(
      {
        customer_id,
        property_id,
        cleaning_job_id,
        quote_date: new Date(quote_date),
        valid_until_date: new Date(valid_until_date),
        line_items,
        subtotal,
        discount_percentage,
        discount_amount,
        notes,
      },
      serviceProviderId
    );

    res.status(201).json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cleaning-quotes/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const {
      line_items,
      subtotal,
      discount_percentage,
      discount_amount,
      notes,
      status,
    } = req.body;

    const quote = await cleaningQuoteService.update(
      req.params.id,
      {
        line_items,
        subtotal,
        discount_percentage,
        discount_amount,
        notes,
        status,
      },
      serviceProviderId
    );

    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-quotes/:id/approve
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const quote = await cleaningQuoteService.approve(req.params.id, serviceProviderId);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-quotes/:id/decline
router.post('/:id/decline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const reason = req.body.reason || 'Declined by customer';

    const quote = await cleaningQuoteService.decline(req.params.id, reason, serviceProviderId);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-quotes/:id/send
router.post('/:id/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const quote = await cleaningQuoteService.send(req.params.id, serviceProviderId);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cleaning-quotes/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    await cleaningQuoteService.delete(req.params.id, serviceProviderId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-quotes/customer/:customerId/stats
router.get('/customer/:customerId/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const serviceProviderId = await getServiceProviderId(tenantId);

    const stats = await cleaningQuoteService.getCustomerStats(
      req.params.customerId,
      serviceProviderId
    );

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
