import { Router, Request, Response, NextFunction } from 'express';
import { WorkersService } from '../services/WorkersService';
import { WorkerHistoryService } from '../services/WorkerHistoryService';
import { authMiddleware } from '../middleware/auth';
import { upload, uploadDocument } from '../middleware/upload';
import workerPhotosService from '../services/WorkerPhotosService';
import workerCertificatesService from '../services/WorkerCertificatesService';

const router: Router = Router();
const workersService = new WorkersService();
const workerHistoryService = new WorkerHistoryService();

router.use(authMiddleware);

// GET /api/workers
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const filters = {
      worker_type: req.query.worker_type as string | undefined,
      employment_type: req.query.employment_type as string | undefined,
      is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
    };

    const workers = await workersService.list(serviceProviderId, filters);
    res.json({ data: workers });
  } catch (error) {
    next(error);
  }
});

// GET /api/workers/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const worker = await workersService.getById(req.params.id, serviceProviderId);
    res.json({ data: worker });
  } catch (error) {
    next(error);
  }
});

// GET /api/workers/:id/history
router.get('/:id/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const workerId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const changeType = req.query.change_type as string | undefined;
    const fromDate = req.query.from_date as string | undefined;
    const toDate = req.query.to_date as string | undefined;

    // Verify worker exists and belongs to service provider
    await workersService.getById(workerId, serviceProviderId);

    // Get worker history with optional filters
    let history;
    if (changeType) {
      history = await workerHistoryService.getWorkerHistoryByType(workerId, changeType as any);
    } else if (fromDate && toDate) {
      history = await workerHistoryService.getWorkerHistoryDateRange(
        workerId,
        new Date(fromDate),
        new Date(toDate)
      );
    } else {
      history = await workerHistoryService.getWorkerHistory(workerId, limit);
    }

    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

// GET /api/workers/:id/history/stats
router.get('/:id/history/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const workerId = req.params.id;

    // Verify worker exists and belongs to service provider
    await workersService.getById(workerId, serviceProviderId);

    // Get worker stats
    const [totalJobs, averageRating, completionRate] = await Promise.all([
      workerHistoryService.getWorkerJobCount(workerId),
      workerHistoryService.getWorkerAverageRating(workerId),
      workerHistoryService.getWorkerCompletionRate(workerId),
    ]);

    res.json({
      data: {
        total_jobs: totalJobs,
        average_rating: averageRating,
        completion_rate: completionRate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/workers
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const worker = await workersService.create(req.body, serviceProviderId);
    res.status(201).json({ data: worker });
  } catch (error) {
    next(error);
  }
});

// PUT /api/workers/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'service_provider_id is required' });
    }

    const worker = await workersService.update(req.params.id, req.body, serviceProviderId);
    res.json({ data: worker });
  } catch (error) {
    next(error);
  }
});

// POST /api/workers/:id/photo - Upload worker photo
router.post('/:id/photo', upload.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const tenantId = req.user?.tenant_id as string;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await workerPhotosService.uploadPhoto(tenantId, req.params.id, req.file);

    if (!result.uploadSuccess) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ data: { photo_url: result.photo_url } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workers/:id/photo - Delete worker photo
router.delete('/:id/photo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenant_id as string;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await workerPhotosService.deletePhoto(tenantId, req.params.id);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/workers/:id/certificates - Upload worker certificate
router.post('/:id/certificates', uploadDocument.single('certificate'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Certificate file is required' });
    }

    const tenantId = req.user?.tenant_id as string;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = {
      name: req.body.name || req.file.originalname,
      expiry_date: req.body.expiry_date,
    };

    const result = await workerCertificatesService.uploadCertificate(tenantId, req.params.id, req.file, data);

    if (!result.uploadSuccess) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ data: result.certificate });
  } catch (error) {
    next(error);
  }
});

// GET /api/workers/:id/certificates - List worker certificates
router.get('/:id/certificates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenant_id as string;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const certificates = await workerCertificatesService.list(tenantId, req.params.id);
    res.json({ data: certificates });
  } catch (error) {
    next(error);
  }
});

// GET /api/workers/:id/certificates/:certificateId - Get single certificate
router.get('/:id/certificates/:certificateId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenant_id as string;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const certificate = await workerCertificatesService.getById(tenantId, req.params.id, req.params.certificateId);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ data: certificate });
  } catch (error) {
    next(error);
  }
});

// PUT /api/workers/:id/certificates/:certificateId - Update certificate
router.put('/:id/certificates/:certificateId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenant_id as string;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = {
      name: req.body.name,
      expiry_date: req.body.expiry_date,
    };

    const certificate = await workerCertificatesService.update(tenantId, req.params.id, req.params.certificateId, data);
    res.json({ data: certificate });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workers/:id/certificates/:certificateId - Delete certificate
router.delete('/:id/certificates/:certificateId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenant_id as string;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await workerCertificatesService.delete(tenantId, req.params.id, req.params.certificateId);
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
