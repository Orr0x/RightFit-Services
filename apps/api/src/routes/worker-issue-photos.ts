import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import photosService from '../services/PhotosService';
import logger from '../utils/logger';

const router: Router = Router();

router.use(authMiddleware);

// POST /api/worker-issue-photos/upload - Upload a photo for a maintenance issue
router.post('/upload', upload.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const tenantId = req.user!.tenant_id;
    const userId = req.user!.user_id;
    const { category } = req.body;

    // Upload the photo file
    const uploadResult = await photosService.uploadPhoto(tenantId, userId, req.file, {
      caption: `${category || 'ISSUE'} photo for worker issue report`,
    });

    if (!uploadResult.uploadSuccess) {
      return res.status(500).json({ error: uploadResult.error || 'Failed to upload photo' });
    }

    const photoUrl = uploadResult.photo.s3_url || uploadResult.photo.photo_url;

    logger.info('Worker issue photo uploaded', {
      tenant_id: tenantId,
      photo_id: uploadResult.photo.id,
      category: category || 'ISSUE',
    });

    res.status(201).json({
      data: {
        photo_url: photoUrl,
        uploaded_at: uploadResult.photo.uploaded_at,
      },
      message: 'Photo uploaded successfully',
    });
  } catch (error: any) {
    logger.error('Error uploading worker issue photo:', error);
    res.status(500).json({ error: error.message || 'Failed to upload photo' });
  }
});

export default router;
