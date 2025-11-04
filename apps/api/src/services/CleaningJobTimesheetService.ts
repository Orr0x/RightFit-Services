import { prisma } from '@rightfit/database'
import { Decimal } from '@prisma/client/runtime/library'
import logger from '../utils/logger'
import { NotFoundError, ValidationError } from '../utils/errors'

interface CreateTimesheetData {
  cleaning_job_id: string
  worker_id: string
  work_performed?: string
  checklist_items_completed?: any
  start_time: Date
  end_time?: Date
  before_photos?: string[]
  after_photos?: string[]
  issue_photos?: string[]
  notes?: string
}

interface UpdateTimesheetData {
  work_performed?: string
  checklist_items_completed?: any
  end_time?: Date
  before_photos?: string[]
  after_photos?: string[]
  issue_photos?: string[]
  notes?: string
}

class CleaningJobTimesheetService {
  /**
   * Create a new timesheet entry (when worker starts job)
   */
  async createTimesheet(data: CreateTimesheetData) {
    const { cleaning_job_id, worker_id, start_time, ...rest } = data

    // Verify job exists and is assigned to this worker
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id: cleaning_job_id,
        assigned_worker_id: worker_id,
      },
    })

    if (!job) {
      throw new NotFoundError('Job not found or not assigned to this worker')
    }

    // Calculate total hours if end_time provided
    let total_hours = null
    if (data.end_time) {
      const diff = data.end_time.getTime() - start_time.getTime()
      const hours = diff / (1000 * 60 * 60)
      total_hours = new Decimal(hours)
    }

    const timesheet = await prisma.cleaningJobTimesheet.create({
      data: {
        cleaning_job_id,
        worker_id,
        start_time,
        total_hours,
        before_photos: data.before_photos || [],
        after_photos: data.after_photos || [],
        issue_photos: data.issue_photos || [],
        ...rest,
      },
      include: {
        worker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        cleaning_job: {
          select: {
            id: true,
            status: true,
            property: {
              select: {
                property_name: true,
                address: true,
              },
            },
          },
        },
      },
    })

    // Update job status to IN_PROGRESS if this is the first timesheet
    if (job.status === 'SCHEDULED') {
      await prisma.cleaningJob.update({
        where: { id: cleaning_job_id },
        data: {
          status: 'IN_PROGRESS',
          actual_start_time: start_time,
        },
      })
    }

    logger.info(`Created timesheet ${timesheet.id} for job ${cleaning_job_id}`)
    return timesheet
  }

  /**
   * Get timesheet by ID
   */
  async getTimesheetById(id: string) {
    const timesheet = await prisma.cleaningJobTimesheet.findUnique({
      where: { id },
      include: {
        worker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        cleaning_job: {
          include: {
            property: true,
            customer: true,
          },
        },
      },
    })

    if (!timesheet) {
      throw new NotFoundError('Timesheet not found')
    }

    return timesheet
  }

  /**
   * Get all timesheets for a job
   */
  async getTimesheetsByJob(jobId: string) {
    const timesheets = await prisma.cleaningJobTimesheet.findMany({
      where: { cleaning_job_id: jobId },
      include: {
        worker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { start_time: 'desc' },
    })

    return timesheets
  }

  /**
   * Get timesheets for a worker
   */
  async getTimesheetsByWorker(
    workerId: string,
    options?: {
      from_date?: Date
      to_date?: Date
      limit?: number
    }
  ) {
    const where: any = { worker_id: workerId }

    if (options?.from_date || options?.to_date) {
      where.start_time = {}
      if (options.from_date) {
        where.start_time.gte = options.from_date
      }
      if (options.to_date) {
        where.start_time.lte = options.to_date
      }
    }

    const timesheets = await prisma.cleaningJobTimesheet.findMany({
      where,
      take: options?.limit || 50,
      include: {
        cleaning_job: {
          include: {
            property: {
              select: {
                property_name: true,
                address: true,
              },
            },
            customer: {
              select: {
                business_name: true,
              },
            },
          },
        },
      },
      orderBy: { start_time: 'desc' },
    })

    return timesheets
  }

  /**
   * Update timesheet
   */
  async updateTimesheet(id: string, data: UpdateTimesheetData, workerId?: string) {
    const existing = await this.getTimesheetById(id)

    // If workerId provided, verify ownership
    if (workerId && existing.worker_id !== workerId) {
      throw new ValidationError('Cannot update another worker\'s timesheet')
    }

    // Calculate total hours if end_time provided
    let total_hours = existing.total_hours
    if (data.end_time) {
      const diff = data.end_time.getTime() - existing.start_time.getTime()
      const hours = diff / (1000 * 60 * 60)
      total_hours = new Decimal(hours)
    }

    const timesheet = await prisma.cleaningJobTimesheet.update({
      where: { id },
      data: {
        ...data,
        total_hours,
      },
      include: {
        worker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        cleaning_job: true,
      },
    })

    // If end_time is set and job is not completed, mark as completed
    if (data.end_time && existing.cleaning_job.status !== 'COMPLETED') {
      await prisma.cleaningJob.update({
        where: { id: existing.cleaning_job_id },
        data: {
          status: 'COMPLETED',
          actual_end_time: data.end_time,
        },
      })
    }

    logger.info(`Updated timesheet ${id}`)
    return timesheet
  }

  /**
   * Add photos to timesheet
   */
  async addPhotos(
    timesheetId: string,
    photoType: 'before' | 'after' | 'issue',
    photoUrls: string[]
  ) {
    const timesheet = await this.getTimesheetById(timesheetId)

    const photoField = `${photoType}_photos`
    const currentPhotos = (timesheet as any)[photoField] as string[]

    const updated = await prisma.cleaningJobTimesheet.update({
      where: { id: timesheetId },
      data: {
        [photoField]: [...currentPhotos, ...photoUrls],
      },
    })

    logger.info(`Added ${photoUrls.length} ${photoType} photos to timesheet ${timesheetId}`)
    return updated
  }

  /**
   * Complete timesheet (set end time and finalize)
   */
  async completeTimesheet(
    timesheetId: string,
    data: {
      end_time: Date
      work_performed?: string
      checklist_items_completed?: any
      notes?: string
    }
  ) {
    const timesheet = await this.getTimesheetById(timesheetId)

    if (timesheet.end_time) {
      throw new ValidationError('Timesheet already completed')
    }

    return await this.updateTimesheet(timesheetId, data)
  }

  /**
   * Get timesheet statistics for a worker
   */
  async getWorkerStats(workerId: string, startDate: Date, endDate: Date) {
    const timesheets = await prisma.cleaningJobTimesheet.findMany({
      where: {
        worker_id: workerId,
        start_time: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalHours = timesheets.reduce((sum, t) => {
      return sum + (t.total_hours ? Number(t.total_hours) : 0)
    }, 0)

    const completedJobs = timesheets.filter((t) => t.end_time).length

    return {
      total_timesheets: timesheets.length,
      total_hours: totalHours,
      completed_jobs: completedJobs,
      average_hours_per_job: completedJobs > 0 ? totalHours / completedJobs : 0,
    }
  }

  /**
   * Delete timesheet
   */
  async deleteTimesheet(id: string) {
    await this.getTimesheetById(id) // Verify exists

    await prisma.cleaningJobTimesheet.delete({
      where: { id },
    })

    logger.info(`Deleted timesheet ${id}`)
  }
}

export default new CleaningJobTimesheetService()
