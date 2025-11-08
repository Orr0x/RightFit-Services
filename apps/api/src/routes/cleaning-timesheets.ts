import express from 'express'
import { authenticate } from '../middleware/auth'
import { upload } from '../middleware/upload'
import CleaningJobTimesheetService from '../services/CleaningJobTimesheetService'
import photosService from '../services/PhotosService'
import logger from '../utils/logger'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * POST /api/cleaning-timesheets
 * Create a new timesheet (worker starts job)
 */
router.post('/', async (req, res) => {
  try {
    const {
      cleaning_job_id,
      worker_id,
      work_performed,
      checklist_items_completed,
      start_time,
      end_time,
      before_photos,
      after_photos,
      issue_photos,
      notes,
    } = req.body

    if (!cleaning_job_id || !worker_id || !start_time) {
      return res.status(400).json({
        error: 'Missing required fields: cleaning_job_id, worker_id, start_time',
      })
    }

    const timesheet = await CleaningJobTimesheetService.createTimesheet({
      cleaning_job_id,
      worker_id,
      work_performed,
      checklist_items_completed,
      start_time: new Date(start_time),
      end_time: end_time ? new Date(end_time) : undefined,
      before_photos: before_photos || [],
      after_photos: after_photos || [],
      issue_photos: issue_photos || [],
      notes,
    })

    res.status(201).json({ data: timesheet })
  } catch (error: any) {
    logger.error('Error creating timesheet:', error)
    res.status(500).json({ error: error.message || 'Failed to create timesheet' })
  }
})

/**
 * GET /api/cleaning-timesheets/:id
 * Get timesheet by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const timesheet = await CleaningJobTimesheetService.getTimesheetById(req.params.id)
    res.json({ data: timesheet })
  } catch (error: any) {
    logger.error(`Error fetching timesheet ${req.params.id}:`, error)
    if (error.message === 'Timesheet not found') {
      return res.status(404).json({ error: 'Timesheet not found' })
    }
    res.status(500).json({ error: 'Failed to fetch timesheet' })
  }
})

/**
 * GET /api/cleaning-timesheets/job/:jobId/active
 * Get active (incomplete) timesheet for a job and specific worker
 */
router.get('/job/:jobId/active', async (req, res) => {
  try {
    const { worker_id } = req.query

    if (!worker_id) {
      return res.status(400).json({ error: 'worker_id query parameter is required' })
    }

    const timesheets = await CleaningJobTimesheetService.getTimesheetsByJob(req.params.jobId)

    // Find active timesheet for this worker (no end_time)
    const activeTimesheet = timesheets.find(ts =>
      ts.worker_id === worker_id && ts.end_time === null
    )

    if (!activeTimesheet) {
      return res.status(404).json({ error: 'No active timesheet found for this job and worker' })
    }

    res.json({ data: activeTimesheet })
  } catch (error: any) {
    logger.error(`Error fetching active timesheet for job ${req.params.jobId}:`, error)
    res.status(500).json({ error: 'Failed to fetch active timesheet' })
  }
})

/**
 * GET /api/cleaning-timesheets/job/:jobId
 * Get all timesheets for a job
 */
router.get('/job/:jobId', async (req, res) => {
  try {
    const timesheets = await CleaningJobTimesheetService.getTimesheetsByJob(req.params.jobId)
    res.json({ data: timesheets })
  } catch (error: any) {
    logger.error(`Error fetching timesheets for job ${req.params.jobId}:`, error)
    res.status(500).json({ error: 'Failed to fetch timesheets' })
  }
})

/**
 * GET /api/cleaning-timesheets/worker/:workerId
 * Get timesheets for a worker
 */
router.get('/worker/:workerId', async (req, res) => {
  try {
    const { from_date, to_date, limit } = req.query

    const timesheets = await CleaningJobTimesheetService.getTimesheetsByWorker(
      req.params.workerId,
      {
        from_date: from_date ? new Date(from_date as string) : undefined,
        to_date: to_date ? new Date(to_date as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      }
    )

    res.json({ data: timesheets })
  } catch (error: any) {
    logger.error(`Error fetching timesheets for worker ${req.params.workerId}:`, error)
    res.status(500).json({ error: 'Failed to fetch timesheets' })
  }
})

/**
 * PUT /api/cleaning-timesheets/:id
 * Update timesheet
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      work_performed,
      checklist_items_completed,
      end_time,
      before_photos,
      after_photos,
      issue_photos,
      notes,
      worker_id,
    } = req.body

    const updateData: any = {}
    if (work_performed !== undefined) updateData.work_performed = work_performed
    if (checklist_items_completed !== undefined)
      updateData.checklist_items_completed = checklist_items_completed
    if (end_time) updateData.end_time = new Date(end_time)
    if (before_photos) updateData.before_photos = before_photos
    if (after_photos) updateData.after_photos = after_photos
    if (issue_photos) updateData.issue_photos = issue_photos
    if (notes !== undefined) updateData.notes = notes

    const timesheet = await CleaningJobTimesheetService.updateTimesheet(
      req.params.id,
      updateData,
      worker_id
    )

    res.json({ data: timesheet })
  } catch (error: any) {
    logger.error(`Error updating timesheet ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to update timesheet' })
  }
})

/**
 * POST /api/cleaning-timesheets/:id/photos
 * Upload and add photo to timesheet
 */
router.post('/:id/photos', upload.single('photo'), async (req, res) => {
  try {
    const tenantId = req.user!.tenant_id
    const userId = req.user!.user_id
    const timesheetId = req.params.id

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { category } = req.body

    if (!category || !['BEFORE', 'AFTER', 'ISSUE'].includes(category)) {
      return res.status(400).json({
        error: 'Invalid category. Must be: BEFORE, AFTER, or ISSUE',
      })
    }

    // Upload the photo file
    const uploadResult = await photosService.uploadPhoto(tenantId, userId, req.file, {
      caption: `${category} photo for timesheet ${timesheetId}`,
    })

    if (!uploadResult.uploadSuccess) {
      return res.status(500).json({ error: uploadResult.error || 'Failed to upload photo' })
    }

    // Add the photo URL to the timesheet
    const photo_type = category.toLowerCase() as 'before' | 'after' | 'issue'
    const photoUrl = uploadResult.photo.s3_url || uploadResult.photo.photo_url

    const timesheet = await CleaningJobTimesheetService.addPhotos(
      timesheetId,
      photo_type,
      [photoUrl]
    )

    logger.info(`Photo uploaded to timesheet ${timesheetId}`, {
      tenant_id: tenantId,
      photo_id: uploadResult.photo.id,
      category,
    })

    res.status(201).json({
      data: {
        id: uploadResult.photo.id,
        photo_url: photoUrl,
        category,
        uploaded_at: uploadResult.photo.uploaded_at
      }
    })
  } catch (error: any) {
    logger.error(`Error adding photo to timesheet ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to add photo' })
  }
})

/**
 * GET /api/cleaning-timesheets/:id/photos
 * Get all photos for a timesheet
 */
router.get('/:id/photos', async (req, res) => {
  try {
    const timesheetId = req.params.id

    // Get the timesheet to access photo arrays
    const timesheet = await CleaningJobTimesheetService.getTimesheetById(timesheetId)

    // Combine all photos with their categories
    const photos = [
      ...(timesheet.before_photos || []).map((url: string, index: number) => ({
        id: `before-${index}`,
        photo_url: url,
        category: 'BEFORE',
        uploaded_at: timesheet.created_at
      })),
      ...(timesheet.after_photos || []).map((url: string, index: number) => ({
        id: `after-${index}`,
        photo_url: url,
        category: 'AFTER',
        uploaded_at: timesheet.updated_at || timesheet.created_at
      })),
      ...(timesheet.issue_photos || []).map((url: string, index: number) => ({
        id: `issue-${index}`,
        photo_url: url,
        category: 'ISSUE',
        uploaded_at: timesheet.updated_at || timesheet.created_at
      })),
    ]

    res.json({ data: photos })
  } catch (error: any) {
    logger.error(`Error fetching photos for timesheet ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to fetch photos' })
  }
})

/**
 * DELETE /api/cleaning-timesheets/:timesheetId/photos/:photoId
 * Delete a photo from timesheet
 */
router.delete('/:timesheetId/photos/:photoId', async (req, res) => {
  try {
    const { timesheetId, photoId } = req.params

    // Parse category and index from photoId (format: "category-index")
    const [category, indexStr] = photoId.split('-')
    const index = parseInt(indexStr)

    if (!['before', 'after', 'issue'].includes(category) || isNaN(index)) {
      return res.status(400).json({ error: 'Invalid photo ID format' })
    }

    const timesheet = await CleaningJobTimesheetService.getTimesheetById(timesheetId)
    const photoArrayKey = `${category}_photos` as 'before_photos' | 'after_photos' | 'issue_photos'
    const photoArray = (timesheet[photoArrayKey] || []) as string[]

    if (index < 0 || index >= photoArray.length) {
      return res.status(404).json({ error: 'Photo not found' })
    }

    // Remove the photo from the array
    photoArray.splice(index, 1)

    // Update the timesheet
    await CleaningJobTimesheetService.updateTimesheet(
      timesheetId,
      { [photoArrayKey]: photoArray },
      timesheet.worker_id
    )

    logger.info(`Photo deleted from timesheet ${timesheetId}`, {
      photo_id: photoId,
      category,
    })

    res.json({ success: true, message: 'Photo deleted' })
  } catch (error: any) {
    logger.error(`Error deleting photo from timesheet ${req.params.timesheetId}:`, error)
    res.status(500).json({ error: 'Failed to delete photo' })
  }
})

/**
 * POST /api/cleaning-timesheets/:id/complete
 * Complete timesheet (set end time)
 */
router.post('/:id/complete', async (req, res) => {
  try {
    const { end_time, work_performed, checklist_items_completed, notes } = req.body

    if (!end_time) {
      return res.status(400).json({
        error: 'Missing required field: end_time',
      })
    }

    const timesheet = await CleaningJobTimesheetService.completeTimesheet(req.params.id, {
      end_time: new Date(end_time),
      work_performed,
      checklist_items_completed,
      notes,
    })

    res.json({ data: timesheet })
  } catch (error: any) {
    logger.error(`Error completing timesheet ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to complete timesheet' })
  }
})

/**
 * GET /api/cleaning-timesheets/worker/:workerId/stats
 * Get worker timesheet statistics
 */
router.get('/worker/:workerId/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Missing required query parameters: start_date, end_date',
      })
    }

    const stats = await CleaningJobTimesheetService.getWorkerStats(
      req.params.workerId,
      new Date(start_date as string),
      new Date(end_date as string)
    )

    res.json({ data: stats })
  } catch (error: any) {
    logger.error(`Error fetching worker stats for ${req.params.workerId}:`, error)
    res.status(500).json({ error: 'Failed to fetch worker stats' })
  }
})

/**
 * DELETE /api/cleaning-timesheets/:id
 * Delete timesheet
 */
router.delete('/:id', async (req, res) => {
  try {
    await CleaningJobTimesheetService.deleteTimesheet(req.params.id)
    res.json({ success: true, message: 'Timesheet deleted' })
  } catch (error: any) {
    logger.error(`Error deleting timesheet ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to delete timesheet' })
  }
})

export default router
