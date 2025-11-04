import express from 'express'
import { authenticate } from '../middleware/auth'
import CleaningJobTimesheetService from '../services/CleaningJobTimesheetService'
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
 * Add photos to timesheet
 */
router.post('/:id/photos', async (req, res) => {
  try {
    const { photo_type, photo_urls } = req.body

    if (!photo_type || !photo_urls || !Array.isArray(photo_urls)) {
      return res.status(400).json({
        error: 'Missing required fields: photo_type, photo_urls (array)',
      })
    }

    if (!['before', 'after', 'issue'].includes(photo_type)) {
      return res.status(400).json({
        error: 'Invalid photo_type. Must be: before, after, or issue',
      })
    }

    const timesheet = await CleaningJobTimesheetService.addPhotos(
      req.params.id,
      photo_type,
      photo_urls
    )

    res.json({ data: timesheet })
  } catch (error: any) {
    logger.error(`Error adding photos to timesheet ${req.params.id}:`, error)
    res.status(500).json({ error: error.message || 'Failed to add photos' })
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
