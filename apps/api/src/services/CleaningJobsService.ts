import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CleaningJobHistoryService } from './CleaningJobHistoryService';
import { PropertyHistoryService } from './PropertyHistoryService';
import { WorkerHistoryService } from './WorkerHistoryService';
import CleaningJobTimesheetService from './CleaningJobTimesheetService';

export interface CreateCleaningJobInput {
  service_id: string;
  property_id: string;
  customer_id: string;
  contract_id?: string;
  assigned_worker_id?: string;
  scheduled_date?: Date;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  checklist_template_id?: string;
  checklist_total_items?: number;
  pricing_type: string;
  quoted_price: number;
  status?: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateCleaningJobInput {
  assigned_worker_id?: string;
  scheduled_date?: Date;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  status?: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  actual_start_time?: Date;
  actual_end_time?: Date;
  checklist_items?: any;
  checklist_completed_items?: number;
  completion_notes?: string;
  actual_price?: number;
  before_photos?: string[];
  after_photos?: string[];
  issue_photos?: string[];
  maintenance_issues_found?: number;
  maintenance_quotes_generated?: number;
}

export class CleaningJobsService {
  private historyService: CleaningJobHistoryService;
  private propertyHistoryService: PropertyHistoryService;
  private workerHistoryService: WorkerHistoryService;

  constructor() {
    this.historyService = new CleaningJobHistoryService();
    this.propertyHistoryService = new PropertyHistoryService();
    this.workerHistoryService = new WorkerHistoryService();
  }

  async list(
    serviceProviderId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      worker_id?: string;
      property_id?: string;
      customer_id?: string;
      from_date?: Date;
      to_date?: Date;
    }
  ) {
    const skip = (page - 1) * limit;

    // Build where clause - include jobs with no service OR jobs with service belonging to this provider
    const where: any = {
      OR: [
        { service_id: null },
        {
          service: {
            service_provider_id: serviceProviderId,
          },
        },
      ],
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.worker_id) {
      where.assigned_worker_id = filters.worker_id;
    }
    if (filters?.property_id) {
      where.property_id = filters.property_id;
    }
    if (filters?.customer_id) {
      where.customer_id = filters.customer_id;
    }
    if (filters?.from_date || filters?.to_date) {
      where.scheduled_date = {};
      if (filters.from_date) {
        where.scheduled_date.gte = filters.from_date;
      }
      if (filters.to_date) {
        where.scheduled_date.lte = filters.to_date;
      }
    }

    const [jobs, total] = await Promise.all([
      prisma.cleaningJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduled_date: 'desc' },
        include: {
          service: true,
          property: {
            select: {
              id: true,
              property_name: true,
              address: true,
              postcode: true,
            },
          },
          customer: {
            select: {
              id: true,
              business_name: true,
              contact_name: true,
            },
          },
          assigned_worker: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              phone: true,
            },
          },
        },
      }),
      prisma.cleaningJob.count({ where }),
    ]);

    // Filter out jobs that have a service belonging to a different provider
    const filteredJobs = jobs.filter(job =>
      !job.service || job.service.service_provider_id === serviceProviderId
    );

    return {
      data: filteredJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit),
      },
    };
  }

  async getById(id: string, serviceProviderId: string) {
    const job = await prisma.cleaningJob.findUnique({
      where: { id },
      include: {
        service: true,
        property: true,
        customer: true,
        assigned_worker: true,
        maintenance_jobs: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            priority: true,
            estimated_total: true,
            scheduled_date: true,
            quote: {
              select: {
                id: true,
                total: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Cleaning job not found');
    }

    // Verify ownership: job must either have no service, or have a service that belongs to this provider
    if (job.service && job.service.service_provider_id !== serviceProviderId) {
      throw new NotFoundError('Cleaning job not found or does not belong to this service provider');
    }

    return job;
  }

  async create(input: CreateCleaningJobInput, serviceProviderId: string) {
    // Verify service belongs to this provider (only if service_id provided)
    if (input.service_id) {
      const service = await prisma.service.findFirst({
        where: {
          id: input.service_id,
          service_provider_id: serviceProviderId,
        },
      });

      if (!service) {
        throw new ValidationError('Invalid service ID');
      }
    }

    // Convert empty strings to undefined for optional foreign key fields
    const cleanedData: any = {
      service_id: input.service_id || undefined,
      property_id: input.property_id,
      customer_id: input.customer_id,
      contract_id: input.contract_id || undefined,
      assigned_worker_id: input.assigned_worker_id || undefined,
      checklist_template_id: input.checklist_template_id || undefined,
      checklist_total_items: input.checklist_total_items || 0,
      pricing_type: input.pricing_type,
      quoted_price: input.quoted_price,
      status: input.status || 'PENDING',
      before_photos: [],
      after_photos: [],
      issue_photos: [],
    };

    // Only include scheduling fields if they're provided
    if (input.scheduled_date) {
      cleanedData.scheduled_date = input.scheduled_date;
    }
    if (input.scheduled_start_time) {
      cleanedData.scheduled_start_time = input.scheduled_start_time;
    }
    if (input.scheduled_end_time) {
      cleanedData.scheduled_end_time = input.scheduled_end_time;
    }

    const job = await prisma.cleaningJob.create({
      data: cleanedData,
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
        contract: true,
      },
    });

    // Record job creation in history
    await this.historyService.recordJobCreation(job.id);

    // Only record property/worker history if job is scheduled
    if (job.scheduled_date) {
      // Record in property history
      const workerName = job.assigned_worker
        ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
        : undefined;

      await this.propertyHistoryService.recordCleaningJobScheduled(
        job.property_id,
        job.id,
        job.scheduled_date.toISOString().split('T')[0],
        workerName
      ).catch((error) => {
        console.error('Failed to record cleaning job in property history:', error);
      });

      // Record worker assignment in worker history
      if (job.assigned_worker_id && job.assigned_worker) {
        await this.workerHistoryService.recordJobAssigned(
          job.assigned_worker_id,
          job.id,
          'CLEANING',
          job.property?.property_name,
          job.scheduled_date.toISOString().split('T')[0]
        ).catch((error) => {
          console.error('Failed to record job assignment in worker history:', error);
        });
      }
    }

    return job;
  }

  async update(id: string, input: UpdateCleaningJobInput, serviceProviderId: string, userId?: string) {
    // Verify job belongs to this provider
    await this.getById(id, serviceProviderId);

    // Get the old job data before updating (for history tracking)
    const oldJob = await prisma.cleaningJob.findUnique({
      where: { id },
    });

    if (!oldJob) {
      throw new NotFoundError('Job not found');
    }

    // Verify service belongs to this provider (only if service_id is being updated)
    if (input.service_id) {
      const service = await prisma.service.findFirst({
        where: {
          id: input.service_id,
          service_provider_id: serviceProviderId,
        },
      });

      if (!service) {
        throw new ValidationError('Invalid service ID');
      }
    }

    // Extract only the fields that exist on CleaningJob model and clean optional FKs
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { service_provider_id, ...validData } = input;

    // Convert empty strings to null for optional foreign key fields
    const cleanedData = {
      ...validData,
      service_id: validData.service_id === '' ? null : validData.service_id,
      assigned_worker_id: validData.assigned_worker_id === '' ? null : validData.assigned_worker_id,
      contract_id: validData.contract_id === '' ? null : validData.contract_id,
      checklist_template_id: validData.checklist_template_id === '' ? null : validData.checklist_template_id,
    };

    const job = await prisma.cleaningJob.update({
      where: { id },
      data: cleanedData,
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
      },
    });

    // Record changes in history (async, don't wait)
    this.historyService.recordJobUpdate(id, oldJob, cleanedData, userId).catch((error) => {
      console.error('Failed to record job history:', error);
    });

    // Track worker assignment changes
    const oldWorkerId = oldJob.assigned_worker_id;
    const newWorkerId = cleanedData.assigned_worker_id;

    if (oldWorkerId !== newWorkerId) {
      // Worker was unassigned (removed from job)
      if (oldWorkerId && !newWorkerId) {
        await this.workerHistoryService.recordJobUnassigned(
          oldWorkerId,
          job.id,
          'CLEANING',
          job.property?.property_name
        ).catch((error) => {
          console.error('Failed to record job unassignment in worker history:', error);
        });
      }
      // Worker was reassigned to different worker
      else if (oldWorkerId && newWorkerId && oldWorkerId !== newWorkerId) {
        if (job.scheduled_date) {
          await this.workerHistoryService.recordJobReassigned(
            newWorkerId,
            job.id,
            'CLEANING',
            job.property?.property_name,
            job.scheduled_date.toISOString().split('T')[0]
          ).catch((error) => {
            console.error('Failed to record job reassignment in worker history:', error);
          });
        }

        // Also record unassignment for old worker
        await this.workerHistoryService.recordJobUnassigned(
          oldWorkerId,
          job.id,
          'CLEANING',
          job.property?.property_name
        ).catch((error) => {
          console.error('Failed to record job unassignment in worker history:', error);
        });
      }
      // Worker was newly assigned (wasn't assigned before)
      else if (!oldWorkerId && newWorkerId) {
        if (job.scheduled_date) {
          await this.workerHistoryService.recordJobAssigned(
            newWorkerId,
            job.id,
            'CLEANING',
            job.property?.property_name,
            job.scheduled_date.toISOString().split('T')[0]
          ).catch((error) => {
            console.error('Failed to record job assignment in worker history:', error);
          });
        }
      }
    }

    // Track status change to CANCELLED
    if (oldJob.status !== 'CANCELLED' && cleanedData.status === 'CANCELLED' && oldWorkerId) {
      await this.workerHistoryService.recordJobCancelled(
        oldWorkerId,
        job.id,
        'CLEANING',
        job.property?.property_name
      ).catch((error) => {
        console.error('Failed to record job cancellation in worker history:', error);
      });
    }

    return job;
  }

  async delete(id: string, serviceProviderId: string) {
    // Verify job belongs to this provider
    await this.getById(id, serviceProviderId);

    await prisma.cleaningJob.delete({
      where: { id },
    });
  }

  async getTodaysJobs(workerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const jobs = await prisma.cleaningJob.findMany({
      where: {
        assigned_worker_id: workerId,
        scheduled_date: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
      orderBy: { scheduled_start_time: 'asc' },
      include: {
        property: true,
        customer: {
          select: {
            business_name: true,
            contact_name: true,
            phone: true,
          },
        },
      },
    });

    return jobs;
  }

  async startJob(id: string, workerId: string) {
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id,
        assigned_worker_id: workerId,
      },
      include: {
        assigned_worker: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Cleaning job not found or not assigned to you');
    }

    const startTime = new Date();

    const updatedJob = await prisma.cleaningJob.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        actual_start_time: startTime,
      },
    });

    // Create timesheet for this job
    await CleaningJobTimesheetService.createTimesheet({
      cleaning_job_id: id,
      worker_id: workerId,
      start_time: startTime,
      before_photos: [],
      after_photos: [],
      issue_photos: [],
    }).catch((error) => {
      console.error('Failed to create timesheet:', error);
    });

    // Record in property history
    const workerName = job.assigned_worker
      ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
      : 'Unknown Worker';

    await this.propertyHistoryService.recordCleaningJobStarted(
      job.property_id,
      job.id,
      workerName
    ).catch((error) => {
      console.error('Failed to record cleaning job start in property history:', error);
    });

    // Record in worker history
    await this.workerHistoryService.recordJobStarted(
      workerId,
      job.id,
      'CLEANING',
      job.property?.property_name
    ).catch((error) => {
      console.error('Failed to record job start in worker history:', error);
    });

    return updatedJob;
  }

  async completeJob(id: string, workerId: string, completionData: {
    completion_notes?: string;
    actual_price?: number;
    timesheet_id?: string;
    end_time?: Date;
    work_performed?: string;
  }) {
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id,
        assigned_worker_id: workerId,
      },
      include: {
        assigned_worker: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Cleaning job not found or not assigned to you');
    }

    const updatedJob = await prisma.cleaningJob.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actual_end_time: new Date(),
        completion_notes: completionData.completion_notes,
        actual_price: completionData.actual_price,
      },
    });

    // Complete the timesheet if provided
    if (completionData.timesheet_id && completionData.end_time) {
      await CleaningJobTimesheetService.completeTimesheet(
        completionData.timesheet_id,
        {
          end_time: completionData.end_time,
          work_performed: completionData.work_performed,
          notes: completionData.completion_notes,
        }
      ).catch((error) => {
        console.error('Failed to complete timesheet:', error);
      });
    }

    // Record in job change history
    const workerName = job.assigned_worker
      ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
      : 'Unknown Worker';

    await this.historyService.recordChange({
      cleaning_job_id: id,
      changed_by_user_id: workerId,
      change_type: 'STATUS_CHANGED',
      field_name: 'status',
      old_value: job.status,
      new_value: 'COMPLETED',
      description: `Job completed by ${workerName}`,
    }).catch((error) => {
      console.error('Failed to record job completion in history:', error);
    });

    // Record in property history
    await this.propertyHistoryService.recordCleaningJobCompleted(
      job.property_id,
      job.id,
      workerName
    ).catch((error) => {
      console.error('Failed to record cleaning job completion in property history:', error);
    });

    // Record in worker history
    // Calculate duration if we have both start and end times
    let duration: number | undefined;
    if (job.actual_start_time && updatedJob.actual_end_time) {
      const durationMs = updatedJob.actual_end_time.getTime() - job.actual_start_time.getTime();
      duration = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10; // hours with 1 decimal
    }

    await this.workerHistoryService.recordJobCompleted(
      workerId,
      job.id,
      'CLEANING',
      job.property?.property_name,
      duration
    ).catch((error) => {
      console.error('Failed to record job completion in worker history:', error);
    });

    return updatedJob;
  }
}
