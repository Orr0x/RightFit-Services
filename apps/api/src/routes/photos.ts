import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { upload } from '../middleware/upload'
import photosService from '../services/PhotosService'
import logger from '../utils/logger'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)

// Upload photo
router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const userId = req.user!.user_id

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { property_id, work_order_id, label, caption, gps_latitude, gps_longitude } = req.body

    const result = await photosService.uploadPhoto(tenantId, userId, req.file, {
      property_id,
      work_order_id,
      label,
      caption,
      gps_latitude: gps_latitude ? parseFloat(gps_latitude) : undefined,
      gps_longitude: gps_longitude ? parseFloat(gps_longitude) : undefined,
    })

    if (!result.uploadSuccess) {
      return res.status(500).json({ error: result.error || 'Failed to upload photo' })
    }

    logger.info('Photo uploaded', {
      tenant_id: tenantId,
      photo_id: result.photo.id,
      user_id: userId,
    })

    res.status(201).json({ data: result.photo })
  } catch (error: any) {
    logger.error('Upload photo error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

// List photos with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id

    const filters: any = {}
    if (req.query.property_id) {
      filters.property_id = req.query.property_id as string
    }
    if (req.query.work_order_id) {
      filters.work_order_id = req.query.work_order_id as string
    }

    const photos = await photosService.list(tenantId, filters)
    res.json({ data: photos })
  } catch (error: any) {
    logger.error('List photos error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch photos' })
  }
})

// Get single photo
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const photoId = req.params.id

    const photo = await photosService.getById(tenantId, photoId)

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' })
    }

    res.json({ data: photo })
  } catch (error: any) {
    logger.error('Get photo error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch photo' })
  }
})

// Delete photo
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const photoId = req.params.id

    await photosService.delete(tenantId, photoId)

    logger.info('Photo deleted', {
      tenant_id: tenantId,
      photo_id: photoId,
      user_id: req.user!.user_id,
    })

    res.status(204).send()
  } catch (error: any) {
    logger.error('Delete photo error', { error: error.message })
    res.status(400).json({ error: error.message })
  }
})

export default router
