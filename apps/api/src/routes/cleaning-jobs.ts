import { Router, Request, Response, NextFunction } from 'express';
import { CleaningJobsService } from '../services/CleaningJobsService';
import { CleaningJobHistoryService } from '../services/CleaningJobHistoryService';
import { authMiddleware } from '../middleware/auth';
import { requireServiceProvider } from '../middleware/requireServiceProvider';

const router: Router = Router();
const cleaningJobsService = new CleaningJobsService();
const historyService = new CleaningJobHistoryService();

// All routes require authentication
router.use(authMiddleware);

// GET /api/cleaning-jobs
router.get('/', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    // Handle scheduled_date as both from_date and to_date (for single day filtering)
    const scheduledDate = req.query.scheduled_date as string;
    const fromDateParam = req.query.from_date || req.query.start_date || scheduledDate;
    const toDateParam = req.query.to_date || req.query.end_date || scheduledDate;

    const filters = {
      status: req.query.status as string | string[] | undefined,
      worker_id: (req.query.worker_id || req.query.assigned_worker_id) as string,
      property_id: req.query.property_id as string,
      customer_id: req.query.customer_id as string,
      from_date: fromDateParam ? new Date(fromDateParam as string) : undefined,
      to_date: toDateParam ? new Date(toDateParam as string) : undefined,
    };

    console.log('Cleaning Jobs Filter - worker_id:', filters.worker_id);
    console.log('Cleaning Jobs Filter - query params:', {
      worker_id: req.query.worker_id,
      assigned_worker_id: req.query.assigned_worker_id
    });

    const result = await cleaningJobsService.list(serviceProviderId, page, limit, filters);

    console.log('Cleaning Jobs Result - total jobs:', result.data.length);
    console.log('Cleaning Jobs Result - first job worker:', result.data[0]?.assigned_worker_id);

    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-jobs/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;

    // Look up service provider from user's tenant
    const { prisma } = require('@rightfit/database');
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: tenantId },
      select: { id: true }
    });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found for this tenant' });
    }

    const job = await cleaningJobsService.getById(req.params.id, serviceProvider.id);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// GET /api/cleaning-jobs/:id/history
router.get('/:id/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;

    // Look up service provider from user's tenant
    const { prisma } = require('@rightfit/database');
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: tenantId },
      select: { id: true }
    });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found for this tenant' });
    }

    // Verify job belongs to this provider
    await cleaningJobsService.getById(req.params.id, serviceProvider.id);

    // Get history
    const history = await historyService.getJobHistory(req.params.id);
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-jobs
router.post('/', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    // Convert date strings to Date objects if provided
    const jobData = {
      ...req.body,
      ...(req.body.scheduled_date && { scheduled_date: new Date(req.body.scheduled_date) }),
    };

    const job = await cleaningJobsService.create(jobData, serviceProviderId);
    res.status(201).json({ data: job });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cleaning-jobs/:id
router.put('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    // Convert scheduled_date string to Date object if provided
    const updateData = {
      ...req.body,
      ...(req.body.scheduled_date && { scheduled_date: new Date(req.body.scheduled_date) }),
      ...(req.body.actual_start_time && { actual_start_time: new Date(req.body.actual_start_time) }),
      ...(req.body.actual_end_time && { actual_end_time: new Date(req.body.actual_end_time) }),
    };

    const job = await cleaningJobsService.update(req.params.id, updateData, serviceProviderId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cleaning-jobs/:id/checklist/:itemId - Update checklist item completion
router.put('/:id/checklist/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const { completed } = req.body;

    // Look up service provider from user's tenant
    const { prisma } = require('@rightfit/database');
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: tenantId },
      select: { id: true }
    });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found for this tenant' });
    }

    // Get the job and verify ownership
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id: req.params.id
      },
      include: {
        customer: {
          select: { service_provider_id: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.customer.service_provider_id !== serviceProvider.id) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    // Update the checklist item
    const checklistItems = job.checklist_items as any[] || [];
    const itemIndex = checklistItems.findIndex(item => item.id === req.params.itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    checklistItems[itemIndex].completed = completed;

    // Recalculate completed count
    const completedCount = checklistItems.filter(item => item.completed).length;

    // Update the job
    const updatedJob = await prisma.cleaningJob.update({
      where: { id: req.params.id },
      data: {
        checklist_items: checklistItems,
        checklist_completed_items: completedCount
      }
    });

    res.json({ data: updatedJob });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cleaning-jobs/:id
router.delete('/:id', requireServiceProvider, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.serviceProvider!.id;

    await cleaningJobsService.delete(req.params.id, serviceProviderId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Mobile worker endpoints

// GET /api/cleaning-jobs/worker/today
router.get('/worker/today', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.query.worker_id as string;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const jobs = await cleaningJobsService.getTodaysJobs(workerId);
    res.json({ data: jobs });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-jobs/:id/start
router.post('/:id/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.body.worker_id;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const job = await cleaningJobsService.startJob(req.params.id, workerId);
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-jobs/:id/complete
router.post('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workerId = req.body.worker_id;
    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const job = await cleaningJobsService.completeJob(req.params.id, workerId, {
      completion_notes: req.body.completion_notes,
      actual_price: req.body.actual_price,
      timesheet_id: req.body.timesheet_id,
      end_time: req.body.end_time ? new Date(req.body.end_time) : undefined,
      work_performed: req.body.work_performed,
    });
    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cleaning-jobs/:id/notes - Update job notes
router.patch('/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;

    // Look up service provider from user's tenant
    const { prisma } = require('@rightfit/database');
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: tenantId },
      select: { id: true }
    });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found for this tenant' });
    }

    const { notes } = req.body;

    // First verify the job belongs to this service provider
    const existingJob = await prisma.cleaningJob.findUnique({
      where: { id: req.params.id },
      select: {
        customer: {
          select: { service_provider_id: true }
        }
      }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (existingJob.customer.service_provider_id !== serviceProvider.id) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    // Now update the job
    const job = await prisma.cleaningJob.update({
      where: { id: req.params.id },
      data: {
        worker_notes: notes
      }
    });

    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});

// POST /api/cleaning-jobs/:id/photos - Upload job note photos
router.post('/:id/photos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const { upload } = require('../middleware/upload');
    const { PhotosService } = require('../services/PhotosService');
    const photosService = new PhotosService();

    // Look up service provider from user's tenant
    const { prisma } = require('@rightfit/database');
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: tenantId },
      select: { id: true }
    });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found for this tenant' });
    }

    // Verify job belongs to this provider
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id: req.params.id
      },
      include: {
        service: true,
        customer: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify ownership
    if (job.service) {
      if (job.service.service_provider_id !== serviceProvider.id) {
        return res.status(404).json({ error: 'Job not found' });
      }
    } else if (job.customer) {
      if (job.customer.service_provider_id !== serviceProvider.id) {
        return res.status(404).json({ error: 'Job not found' });
      }
    } else {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Use multer middleware to handle file upload
    upload.single('photo')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        const photoData = await photosService.uploadPhoto(
          req.file,
          {
            tenant_id: tenantId,
            uploaded_by_user_id: req.user!.id,
            label: req.body.label || 'JOB_NOTE'
          }
        );

        // Add the photo URL to the job_note_photos array
        const updatedJob = await prisma.cleaningJob.update({
          where: { id: req.params.id },
          data: {
            job_note_photos: {
              push: photoData.s3_url
            }
          }
        });

        res.json({ data: { ...photoData, photo_url: photoData.s3_url } });
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
