import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@rightfit/database';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/external-contractors
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const contractors = await prisma.externalContractor.findMany({
      where: {
        service_provider_id: serviceProviderId,
      },
      orderBy: {
        company_name: 'asc',
      },
    });

    res.json({ data: contractors });
  } catch (error) {
    next(error);
  }
});

// POST /api/external-contractors
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { company_name, contact_name, email, phone, specialties, referral_fee_percentage, preferred_contractor } = req.body;

    if (!company_name || !email) {
      return res.status(400).json({ error: 'company_name and email are required' });
    }

    const contractor = await prisma.externalContractor.create({
      data: {
        company_name,
        contact_name: contact_name || '',
        email,
        phone: phone || '',
        specialties: specialties || [],
        referral_fee_percentage: referral_fee_percentage ? parseFloat(referral_fee_percentage) : 0,
        preferred_contractor: preferred_contractor || false,
        service_provider_id: serviceProviderId,
      },
    });

    res.status(201).json({ data: contractor });
  } catch (error) {
    next(error);
  }
});

// PUT /api/external-contractors/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const { id } = req.params;
    const { company_name, contact_name, email, phone, specialties, referral_fee_percentage, preferred_contractor } = req.body;

    // Verify contractor belongs to this service provider
    const existing = await prisma.externalContractor.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'External contractor not found' });
    }

    const contractor = await prisma.externalContractor.update({
      where: { id },
      data: {
        company_name,
        contact_name,
        email,
        phone,
        specialties,
        referral_fee_percentage: referral_fee_percentage ? parseFloat(referral_fee_percentage) : undefined,
        preferred_contractor,
      },
    });

    res.json({ data: contractor });
  } catch (error) {
    next(error);
  }
});

export default router;
