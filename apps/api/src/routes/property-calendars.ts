import express from 'express'
import { authenticate } from '../middleware/auth'
import PropertyCalendarService from '../services/PropertyCalendarService'
import { z } from 'zod'

const router = express.Router()

// Validation schemas
const createCalendarEntrySchema = z.object({
  property_id: z.string().uuid(),
  guest_checkout_datetime: z.string().datetime(),
  next_guest_checkin_datetime: z.string().datetime(),
  notes: z.string().optional(),
})

const updateCalendarEntrySchema = z.object({
  guest_checkout_datetime: z.string().datetime().optional(),
  next_guest_checkin_datetime: z.string().datetime().optional(),
  cleaning_job_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

const linkJobSchema = z.object({
  cleaning_job_id: z.string().uuid(),
})

/**
 * @route   POST /api/property-calendars
 * @desc    Create a new property calendar entry
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const validated = createCalendarEntrySchema.parse(req.body)

    const entry = await PropertyCalendarService.createCalendarEntry({
      property_id: validated.property_id,
      guest_checkout_datetime: new Date(validated.guest_checkout_datetime),
      next_guest_checkin_datetime: new Date(validated.next_guest_checkin_datetime),
      notes: validated.notes,
    })

    res.status(201).json({
      success: true,
      data: entry,
    })
  } catch (error: any) {
    console.error('Create calendar entry error:', error)
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create calendar entry',
    })
  }
})

/**
 * @route   GET /api/property-calendars/:id
 * @desc    Get calendar entry by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const entry = await PropertyCalendarService.getCalendarEntryById(req.params.id)

    res.json({
      success: true,
      data: entry,
    })
  } catch (error: any) {
    console.error('Get calendar entry error:', error)
    res.status(404).json({
      success: false,
      error: error.message || 'Calendar entry not found',
    })
  }
})

/**
 * @route   GET /api/property-calendars
 * @desc    List calendar entries with filters
 * @access  Private
 * @query   property_id, include_completed, days_ahead, start_date, end_date
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { property_id, include_completed, days_ahead, start_date, end_date } = req.query

    let entries

    if (start_date && end_date) {
      // Date range query
      entries = await PropertyCalendarService.getCalendarEntriesByDateRange(
        new Date(start_date as string),
        new Date(end_date as string),
        property_id as string | undefined
      )
    } else if (property_id) {
      // Property-specific query
      entries = await PropertyCalendarService.getCalendarEntriesByProperty(
        property_id as string,
        include_completed === 'true'
      )
    } else if (days_ahead) {
      // Upcoming entries
      entries = await PropertyCalendarService.getUpcomingCalendarEntries(
        parseInt(days_ahead as string, 10)
      )
    } else {
      // Default: upcoming entries for next 7 days
      entries = await PropertyCalendarService.getUpcomingCalendarEntries(7)
    }

    res.json({
      success: true,
      data: entries,
    })
  } catch (error: any) {
    console.error('List calendar entries error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list calendar entries',
    })
  }
})

/**
 * @route   GET /api/property-calendars/needs-cleaning
 * @desc    Get calendar entries that need cleaning scheduled
 * @access  Private
 */
router.get('/needs-cleaning', authenticate, async (_req, res) => {
  try {
    const entries = await PropertyCalendarService.getEntriesNeedingCleaning()

    res.json({
      success: true,
      data: entries,
    })
  } catch (error: any) {
    console.error('Get entries needing cleaning error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get entries needing cleaning',
    })
  }
})

/**
 * @route   GET /api/property-calendars/property/:property_id/stats
 * @desc    Get calendar statistics for a property
 * @access  Private
 */
router.get('/property/:property_id/stats', authenticate, async (req, res) => {
  try {
    const stats = await PropertyCalendarService.getPropertyCalendarStats(req.params.property_id)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    console.error('Get property calendar stats error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get calendar stats',
    })
  }
})

/**
 * @route   PUT /api/property-calendars/:id
 * @desc    Update calendar entry
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const validated = updateCalendarEntrySchema.parse(req.body)

    const updateData: any = {}

    if (validated.guest_checkout_datetime) {
      updateData.guest_checkout_datetime = new Date(validated.guest_checkout_datetime)
    }
    if (validated.next_guest_checkin_datetime) {
      updateData.next_guest_checkin_datetime = new Date(validated.next_guest_checkin_datetime)
    }
    if (validated.cleaning_job_id !== undefined) {
      updateData.cleaning_job_id = validated.cleaning_job_id
    }
    if (validated.notes !== undefined) {
      updateData.notes = validated.notes
    }

    const updated = await PropertyCalendarService.updateCalendarEntry(req.params.id, updateData)

    res.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Update calendar entry error:', error)
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update calendar entry',
    })
  }
})

/**
 * @route   PUT /api/property-calendars/:id/link-job
 * @desc    Link a cleaning job to a calendar entry
 * @access  Private
 */
router.put('/:id/link-job', authenticate, async (req, res) => {
  try {
    const validated = linkJobSchema.parse(req.body)

    const updated = await PropertyCalendarService.linkCleaningJob(
      req.params.id,
      validated.cleaning_job_id
    )

    res.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Link cleaning job error:', error)
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to link cleaning job',
    })
  }
})

/**
 * @route   DELETE /api/property-calendars/:id
 * @desc    Delete calendar entry
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    await PropertyCalendarService.deleteCalendarEntry(id)

    res.json({
      success: true,
      message: 'Calendar entry deleted',
    })
  } catch (error: any) {
    console.error('Delete calendar entry error:', error)
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to delete calendar entry',
    })
  }
})

export default router
