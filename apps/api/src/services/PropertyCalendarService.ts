import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateCalendarEntryDTO {
  property_id: string
  guest_checkout_datetime: Date
  next_guest_checkin_datetime: Date
  notes?: string
}

export interface UpdateCalendarEntryDTO {
  guest_checkout_datetime?: Date
  next_guest_checkin_datetime?: Date
  cleaning_job_id?: string
  notes?: string
}

class PropertyCalendarService {
  /**
   * Create a new property calendar entry
   * Automatically calculates clean_window_start and clean_window_end
   */
  async createCalendarEntry(data: CreateCalendarEntryDTO) {
    const checkoutDate = new Date(data.guest_checkout_datetime)
    const checkinDate = new Date(data.next_guest_checkin_datetime)

    // Validate dates
    if (checkinDate <= checkoutDate) {
      throw new Error('Check-in date must be after checkout date')
    }

    // Calculate cleaning window
    // clean_window_start: immediately after checkout
    const clean_window_start = checkoutDate

    // clean_window_end: 2 hours before next check-in (to ensure clean is done in time)
    const clean_window_end = new Date(checkinDate)
    clean_window_end.setHours(clean_window_end.getHours() - 2)

    const calendarEntry = await prisma.propertyCalendar.create({
      data: {
        property_id: data.property_id,
        guest_checkout_datetime: checkoutDate,
        next_guest_checkin_datetime: checkinDate,
        clean_window_start,
        clean_window_end,
        notes: data.notes,
      },
      include: {
        property: true,
      },
    })

    return calendarEntry
  }

  /**
   * Get calendar entry by ID
   */
  async getCalendarEntryById(id: string) {
    const entry = await prisma.propertyCalendar.findUnique({
      where: { id },
      include: {
        property: true,
      },
    })

    if (!entry) {
      throw new Error('Calendar entry not found')
    }

    return entry
  }

  /**
   * Get all calendar entries for a property
   */
  async getCalendarEntriesByProperty(property_id: string, includeCompleted = false) {
    const now = new Date()

    const entries = await prisma.propertyCalendar.findMany({
      where: {
        property_id,
        ...(includeCompleted
          ? {}
          : {
              // Only show future entries (checkout hasn't happened yet)
              guest_checkout_datetime: {
                gte: now,
              },
            }),
      },
      include: {
        property: true,
      },
      orderBy: {
        guest_checkout_datetime: 'asc',
      },
    })

    return entries
  }

  /**
   * Get upcoming calendar entries across all properties
   * (entries where checkout is coming up soon)
   */
  async getUpcomingCalendarEntries(days_ahead = 7) {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days_ahead)

    const entries = await prisma.propertyCalendar.findMany({
      where: {
        guest_checkout_datetime: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        property: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        guest_checkout_datetime: 'asc',
      },
    })

    return entries
  }

  /**
   * Get calendar entries that need cleaning scheduled
   * (entries without a cleaning_job_id and within the cleaning window)
   */
  async getEntriesNeedingCleaning() {
    const now = new Date()

    const entries = await prisma.propertyCalendar.findMany({
      where: {
        cleaning_job_id: null,
        clean_window_start: {
          lte: now, // cleaning window has started
        },
        clean_window_end: {
          gte: now, // cleaning window hasn't ended
        },
      },
      include: {
        property: {
          include: {
            customer: true,
            contract_properties: {
              include: {
                contract: true,
              },
            },
          },
        },
      },
      orderBy: {
        clean_window_end: 'asc', // prioritize entries with earliest deadline
      },
    })

    return entries
  }

  /**
   * Update calendar entry
   */
  async updateCalendarEntry(id: string, data: UpdateCalendarEntryDTO) {
    const updates: any = {}

    if (data.guest_checkout_datetime || data.next_guest_checkin_datetime) {
      // If either date is updated, recalculate cleaning window
      const existing = await this.getCalendarEntryById(id)

      const checkoutDate = data.guest_checkout_datetime
        ? new Date(data.guest_checkout_datetime)
        : existing.guest_checkout_datetime
      const checkinDate = data.next_guest_checkin_datetime
        ? new Date(data.next_guest_checkin_datetime)
        : existing.next_guest_checkin_datetime

      // Validate
      if (checkinDate <= checkoutDate) {
        throw new Error('Check-in date must be after checkout date')
      }

      // Recalculate cleaning window
      const clean_window_start = checkoutDate
      const clean_window_end = new Date(checkinDate)
      clean_window_end.setHours(clean_window_end.getHours() - 2)

      updates.guest_checkout_datetime = checkoutDate
      updates.next_guest_checkin_datetime = checkinDate
      updates.clean_window_start = clean_window_start
      updates.clean_window_end = clean_window_end
    }

    if (data.cleaning_job_id !== undefined) {
      updates.cleaning_job_id = data.cleaning_job_id
    }

    if (data.notes !== undefined) {
      updates.notes = data.notes
    }

    const updated = await prisma.propertyCalendar.update({
      where: { id },
      data: updates,
      include: {
        property: true,
      },
    })

    return updated
  }

  /**
   * Link a cleaning job to a calendar entry
   */
  async linkCleaningJob(calendar_entry_id: string, cleaning_job_id: string) {
    return this.updateCalendarEntry(calendar_entry_id, { cleaning_job_id })
  }

  /**
   * Delete calendar entry
   */
  async deleteCalendarEntry(id: string) {
    await prisma.propertyCalendar.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Get calendar entries by date range
   */
  async getCalendarEntriesByDateRange(start_date: Date, end_date: Date, property_id?: string) {
    const entries = await prisma.propertyCalendar.findMany({
      where: {
        ...(property_id && { property_id }),
        guest_checkout_datetime: {
          gte: start_date,
          lte: end_date,
        },
      },
      include: {
        property: true,
      },
      orderBy: {
        guest_checkout_datetime: 'asc',
      },
    })

    return entries
  }

  /**
   * Calculate if there's enough time for cleaning
   * Returns true if there's at least min_hours between checkout and checkin
   */
  async hasEnoughCleaningTime(calendar_entry_id: string, min_hours = 2): Promise<boolean> {
    const entry = await this.getCalendarEntryById(calendar_entry_id)

    const checkoutTime = entry.guest_checkout_datetime.getTime()
    const checkinTime = entry.next_guest_checkin_datetime.getTime()

    const hoursDifference = (checkinTime - checkoutTime) / (1000 * 60 * 60)

    return hoursDifference >= min_hours
  }

  /**
   * Get calendar stats for a property
   * (total entries, completed cleans, pending cleans, etc.)
   */
  async getPropertyCalendarStats(property_id: string) {
    const now = new Date()

    const [total, upcoming, past, needsCleaning, hasJob] = await Promise.all([
      // Total entries
      prisma.propertyCalendar.count({
        where: { property_id },
      }),

      // Upcoming entries (checkout in future)
      prisma.propertyCalendar.count({
        where: {
          property_id,
          guest_checkout_datetime: { gte: now },
        },
      }),

      // Past entries (checkout in past)
      prisma.propertyCalendar.count({
        where: {
          property_id,
          guest_checkout_datetime: { lt: now },
        },
      }),

      // Entries needing cleaning job
      prisma.propertyCalendar.count({
        where: {
          property_id,
          cleaning_job_id: null,
          clean_window_start: { lte: now },
          clean_window_end: { gte: now },
        },
      }),

      // Entries with cleaning job assigned
      prisma.propertyCalendar.count({
        where: {
          property_id,
          cleaning_job_id: { not: null },
        },
      }),
    ])

    return {
      total,
      upcoming,
      past,
      needs_cleaning: needsCleaning,
      has_cleaning_job: hasJob,
    }
  }
}

export default new PropertyCalendarService()
