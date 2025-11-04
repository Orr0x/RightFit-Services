import { Router, Request, Response, NextFunction } from 'express';
import { GlobalActivityService } from '../services/GlobalActivityService';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const globalActivityService = new GlobalActivityService();

router.use(authMiddleware);

// GET /api/global-activity - Get combined activity feed
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const limit = parseInt(req.query.limit as string) || 50;
    const activityType = req.query.activity_type as 'PROPERTY' | 'JOB' | 'WORKER' | undefined;
    const propertyId = req.query.property_id as string | undefined;
    const workerId = req.query.worker_id as string | undefined;
    const fromDate = req.query.from_date ? new Date(req.query.from_date as string) : undefined;
    const toDate = req.query.to_date ? new Date(req.query.to_date as string) : undefined;

    let activity;
    if (activityType || propertyId || workerId || fromDate || toDate) {
      // Use filtered query
      activity = await globalActivityService.getGlobalActivityFiltered(tenantId, {
        activity_type: activityType,
        property_id: propertyId,
        worker_id: workerId,
        from_date: fromDate,
        to_date: toDate,
        limit,
      });
    } else {
      // Use basic query
      activity = await globalActivityService.getGlobalActivity(tenantId, limit);
    }

    res.json({ data: activity });
  } catch (error) {
    next(error);
  }
});

// GET /api/global-activity/stats - Get activity statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const days = parseInt(req.query.days as string) || 7;

    const stats = await globalActivityService.getActivityStats(tenantId, days);
    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
