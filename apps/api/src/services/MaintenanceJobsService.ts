import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { InvoiceService } from './InvoiceService';
import { CleaningJobHistoryService } from './CleaningJobHistoryService';
import { PropertyHistoryService } from './PropertyHistoryService';
import { WorkerHistoryService } from './WorkerHistoryService';

export interface CreateMaintenanceJobInput {
  service_id: string;
  property_id: string;
  customer_id: string;
  assigned_worker_id?: string;
  assigned_contractor_id?: string;
  source: 'CUSTOMER_REQUEST' | 'CLEANER_REPORT' | 'GUEST_REPORT' | 'PREVENTIVE_MAINTENANCE' | 'EMERGENCY';
  source_cleaning_job_id?: string;
  source_guest_report_id?: string;
  category: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description?: string;
  requested_date?: Date;
  scheduled_date?: Date;
}

export interface UpdateMaintenanceJobInput {
  assigned_worker_id?: string;
  assigned_contractor_id?: string;
  priority?: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  title?: string;
  description?: string;
  scheduled_date?: Date;
  completed_date?: Date;
  status?: 'QUOTE_PENDING' | 'QUOTE_SENT' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  quote_id?: string;
  estimated_hours?: number;
  estimated_parts_cost?: number;
  estimated_labor_cost?: number;
  estimated_total?: number;
  actual_total?: number;
  issue_photos?: string[];
  work_in_progress_photos?: string[];
  completion_photos?: string[];
  completion_notes?: string;
  customer_satisfaction_rating?: number;
}

export class MaintenanceJobsService {
  private cleaningJobHistoryService: CleaningJobHistoryService;
  private propertyHistoryService: PropertyHistoryService;
  private workerHistoryService: WorkerHistoryService;

  constructor() {
    this.cleaningJobHistoryService = new CleaningJobHistoryService();
    this.propertyHistoryService = new PropertyHistoryService();
    this.workerHistoryService = new WorkerHistoryService();
  }

  async list(
    serviceProviderId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      priority?: string;
      worker_id?: string;
      contractor_id?: string;
      property_id?: string;
      customer_id?: string;
      from_date?: Date;
      to_date?: Date;
    }
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      service: {
        service_provider_id: serviceProviderId,
      },
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.worker_id) {
      where.assigned_worker_id = filters.worker_id;
    }
    if (filters?.contractor_id) {
      where.assigned_contractor_id = filters.contractor_id;
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
      prisma.maintenanceJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'asc' }, // URGENT first
          { scheduled_date: 'asc' },
        ],
        include: {
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
          assigned_contractor: {
            select: {
              id: true,
              company_name: true,
              contact_name: true,
              phone: true,
            },
          },
          quote: {
            select: {
              id: true,
              quote_number: true,
              total: true,
              status: true,
            },
          },
        },
      }),
      prisma.maintenanceJob.count({ where }),
    ]);

    return {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, serviceProviderId: string) {
    const job = await prisma.maintenanceJob.findFirst({
      where: {
        id,
        service: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        service: true,
        property: true,
        customer: true,
        assigned_worker: true,
        assigned_contractor: true,
        source_cleaning_job: {
          select: {
            id: true,
            scheduled_date: true,
            assigned_worker: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        source_guest_report: {
          select: {
            id: true,
            issue_type: true,
            issue_description: true,
            reported_at: true,
          },
        },
        quote: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Maintenance job not found');
    }

    return job;
  }

  async create(input: CreateMaintenanceJobInput, serviceProviderId: string) {
    // Verify service belongs to this provider
    const service = await prisma.service.findFirst({
      where: {
        id: input.service_id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!service) {
      throw new ValidationError('Invalid service ID');
    }

    const job = await prisma.maintenanceJob.create({
      data: {
        service_id: input.service_id,
        property_id: input.property_id,
        customer_id: input.customer_id,
        assigned_worker_id: input.assigned_worker_id,
        assigned_contractor_id: input.assigned_contractor_id,
        source: input.source,
        source_cleaning_job_id: input.source_cleaning_job_id,
        source_guest_report_id: input.source_guest_report_id,
        category: input.category,
        priority: input.priority,
        title: input.title,
        description: input.description,
        requested_date: input.requested_date,
        scheduled_date: input.scheduled_date,
        issue_photos: [],
        work_in_progress_photos: [],
        completion_photos: [],
      },
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
        assigned_contractor: true,
      },
    });

    // Record in property history
    await this.propertyHistoryService.recordMaintenanceJobCreated(
      job.property_id,
      job.id,
      job.title,
      job.priority
    ).catch((error) => {
      console.error('Failed to record maintenance job in property history:', error);
    });

    // Record worker assignment in worker history
    if (job.assigned_worker_id && job.assigned_worker) {
      await this.workerHistoryService.recordJobAssigned(
        job.assigned_worker_id,
        job.id,
        'MAINTENANCE',
        job.property?.property_name,
        job.scheduled_date?.toISOString().split('T')[0]
      ).catch((error) => {
        console.error('Failed to record job assignment in worker history:', error);
      });
    }

    return job;
  }

  async update(id: string, input: UpdateMaintenanceJobInput, serviceProviderId: string) {
    // Verify job belongs to this provider
    const existingJob = await this.getById(id, serviceProviderId);

    const job = await prisma.maintenanceJob.update({
      where: { id },
      data: input,
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
        assigned_contractor: true,
        quote: true,
      },
    });

    // Record in property history if status changed to COMPLETED
    if (input.status === 'COMPLETED' && existingJob.status !== 'COMPLETED') {
      await this.propertyHistoryService.recordMaintenanceJobCompleted(
        job.property_id,
        job.id,
        job.title
      ).catch((error) => {
        console.error('Failed to record maintenance job completion in property history:', error);
      });
    }

    // Track worker assignment changes
    const oldWorkerId = existingJob.assigned_worker_id;
    const newWorkerId = input.assigned_worker_id;

    if (newWorkerId !== undefined && oldWorkerId !== newWorkerId) {
      // Worker was unassigned (removed from job)
      if (oldWorkerId && !newWorkerId) {
        await this.workerHistoryService.recordJobUnassigned(
          oldWorkerId,
          job.id,
          'MAINTENANCE',
          job.property?.property_name
        ).catch((error) => {
          console.error('Failed to record job unassignment in worker history:', error);
        });
      }
      // Worker was reassigned to different worker
      else if (oldWorkerId && newWorkerId && oldWorkerId !== newWorkerId) {
        await this.workerHistoryService.recordJobReassigned(
          newWorkerId,
          job.id,
          'MAINTENANCE',
          job.property?.property_name,
          job.scheduled_date?.toISOString().split('T')[0]
        ).catch((error) => {
          console.error('Failed to record job reassignment in worker history:', error);
        });

        // Also record unassignment for old worker
        await this.workerHistoryService.recordJobUnassigned(
          oldWorkerId,
          job.id,
          'MAINTENANCE',
          job.property?.property_name
        ).catch((error) => {
          console.error('Failed to record job unassignment in worker history:', error);
        });
      }
      // Worker was newly assigned (wasn't assigned before)
      else if (!oldWorkerId && newWorkerId) {
        await this.workerHistoryService.recordJobAssigned(
          newWorkerId,
          job.id,
          'MAINTENANCE',
          job.property?.property_name,
          job.scheduled_date?.toISOString().split('T')[0]
        ).catch((error) => {
          console.error('Failed to record job assignment in worker history:', error);
        });
      }
    }

    // Track status changes for worker history
    const currentWorkerId = newWorkerId !== undefined ? newWorkerId : oldWorkerId;
    if (currentWorkerId && input.status && input.status !== existingJob.status) {
      // Job started
      if (input.status === 'IN_PROGRESS' && existingJob.status !== 'IN_PROGRESS') {
        await this.workerHistoryService.recordJobStarted(
          currentWorkerId,
          job.id,
          'MAINTENANCE',
          job.property?.property_name
        ).catch((error) => {
          console.error('Failed to record job start in worker history:', error);
        });
      }
      // Job completed
      else if (input.status === 'COMPLETED' && existingJob.status !== 'COMPLETED') {
        // Calculate duration if we have dates
        let duration: number | undefined;
        if (existingJob.scheduled_date && job.completed_date) {
          const durationMs = job.completed_date.getTime() - existingJob.scheduled_date.getTime();
          duration = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
        }

        await this.workerHistoryService.recordJobCompleted(
          currentWorkerId,
          job.id,
          'MAINTENANCE',
          job.property?.property_name,
          duration
        ).catch((error) => {
          console.error('Failed to record job completion in worker history:', error);
        });
      }
      // Job cancelled
      else if (input.status === 'CANCELLED' && existingJob.status !== 'CANCELLED') {
        await this.workerHistoryService.recordJobCancelled(
          currentWorkerId,
          job.id,
          'MAINTENANCE',
          job.property?.property_name
        ).catch((error) => {
          console.error('Failed to record job cancellation in worker history:', error);
        });
      }
    }

    return job;
  }

  async delete(id: string, serviceProviderId: string) {
    // Verify job belongs to this provider
    await this.getById(id, serviceProviderId);

    await prisma.maintenanceJob.delete({
      where: { id },
    });
  }

  async createFromCleaningIssue(
    cleaningJobId: string,
    issueData: {
      title: string;
      description: string;
      category: string;
      priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
      issue_photos?: string[];
    },
    serviceProviderId: string
  ) {
    // Get the cleaning job
    const cleaningJob = await prisma.cleaningJob.findFirst({
      where: {
        id: cleaningJobId,
        assigned_worker: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        assigned_worker: true,
      },
    });

    if (!cleaningJob) {
      throw new NotFoundError('Cleaning job not found or does not belong to this service provider');
    }

    // Get the maintenance service for this service provider
    const maintenanceService = await prisma.service.findFirst({
      where: {
        service_provider_id: serviceProviderId,
        service_type: 'MAINTENANCE',
      },
    });

    if (!maintenanceService) {
      throw new ValidationError('No maintenance service configured for this service provider');
    }

    // Create maintenance job
    const maintenanceJob = await prisma.maintenanceJob.create({
      data: {
        service_id: maintenanceService.id,
        property_id: cleaningJob.property_id,
        customer_id: cleaningJob.customer_id,
        source: 'CLEANER_REPORT',
        source_cleaning_job_id: cleaningJobId,
        category: issueData.category,
        priority: issueData.priority,
        title: issueData.title,
        description: issueData.description,
        issue_photos: issueData.issue_photos || [],
        work_in_progress_photos: [],
        completion_photos: [],
      },
      include: {
        property: true,
        customer: true,
      },
    });

    // Update cleaning job
    await prisma.cleaningJob.update({
      where: { id: cleaningJobId },
      data: {
        maintenance_issues_found: {
          increment: 1,
        },
      },
    });

    // Record in cleaning job history
    await this.cleaningJobHistoryService.recordMaintenanceIssueCreated(
      cleaningJobId,
      maintenanceJob.id,
      issueData.title,
      issueData.priority
    ).catch((error) => {
      console.error('Failed to record maintenance issue in cleaning job history:', error);
    });

    // Record in property history
    await this.propertyHistoryService.recordMaintenanceJobCreated(
      maintenanceJob.property_id,
      maintenanceJob.id,
      maintenanceJob.title,
      maintenanceJob.priority
    ).catch((error) => {
      console.error('Failed to record maintenance job in property history:', error);
    });

    return maintenanceJob;
  }

  async submitQuote(
    jobId: string,
    serviceProviderId: string,
    quoteData: {
      parts_cost: number;
      labor_cost: number;
      total: number;
      notes?: string;
    }
  ) {
    // Verify job belongs to this provider and is in QUOTE_PENDING status
    const job = await this.getById(jobId, serviceProviderId);

    if (job.status !== 'QUOTE_PENDING') {
      throw new ValidationError('Job is not in QUOTE_PENDING status');
    }

    // Create quote with line items
    const lineItems = [];
    if (quoteData.parts_cost > 0) {
      lineItems.push({
        description: 'Parts',
        quantity: 1,
        unit_price: quoteData.parts_cost,
        total: quoteData.parts_cost,
      });
    }
    if (quoteData.labor_cost > 0) {
      lineItems.push({
        description: 'Labor',
        quantity: 1,
        unit_price: quoteData.labor_cost,
        total: quoteData.labor_cost,
      });
    }

    // Set valid until date to 30 days from now
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);

    const quote = await prisma.quote.create({
      data: {
        customer_id: job.customer_id,
        quote_number: `Q-${Date.now()}`, // Simple quote number generation
        quote_date: new Date(),
        valid_until_date: validUntilDate,
        line_items: lineItems,
        subtotal: quoteData.parts_cost + quoteData.labor_cost,
        total: quoteData.total,
        status: 'SENT',
      },
    });

    // Update maintenance job
    const updatedJob = await prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        quote_id: quote.id,
        estimated_parts_cost: quoteData.parts_cost,
        estimated_labor_cost: quoteData.labor_cost,
        estimated_total: quoteData.total,
        status: 'QUOTE_SENT',
      },
      include: {
        property: true,
        customer: true,
        quote: true,
      },
    });

    // Notify customer about quote
    await this.createCustomerNotification(
      updatedJob.customer_id,
      updatedJob.id,
      'Quote Ready for Review',
      `A quote for your maintenance job at ${updatedJob.property.property_name} is ready for review. Total: £${Number(quoteData.total).toFixed(2)}`,
      'QUOTE_READY',
      {
        property_name: updatedJob.property.property_name,
        quote_id: quote.id,
        quote_number: quote.quote_number,
        quote_total: quoteData.total,
      }
    );

    return { job: updatedJob, quote };
  }

  async declineJob(jobId: string, serviceProviderId: string) {
    // Verify job belongs to this provider
    const job = await this.getById(jobId, serviceProviderId);

    if (job.status !== 'QUOTE_PENDING') {
      throw new ValidationError('Can only decline jobs in QUOTE_PENDING status');
    }

    // Update job status to CANCELLED
    const updatedJob = await prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        completion_notes: 'Declined by service provider',
      },
      include: {
        property: true,
        customer: true,
      },
    });

    return updatedJob;
  }

  async assignInternalContractor(
    jobId: string,
    workerId: string,
    scheduledDate: Date,
    scheduledStartTime: string,
    scheduledEndTime: string,
    serviceProviderId: string
  ) {
    // 1. Verify job exists and belongs to this provider
    const job = await this.getById(jobId, serviceProviderId);

    // Must have approved quote before assignment
    if (job.status !== 'APPROVED' && job.status !== 'QUOTE_SENT') {
      throw new ValidationError('Job must have approved quote before assignment');
    }

    // 2. Verify internal worker exists
    const worker = await prisma.worker.findFirst({
      where: {
        id: workerId,
        service_provider_id: serviceProviderId,
        is_active: true,
        worker_type: { in: ['MAINTENANCE', 'BOTH'] },
      },
    });

    if (!worker) {
      throw new ValidationError('Worker not found or not authorized');
    }

    // 3. Check for conflicts
    const conflicts = await this.checkContractorAvailability(
      workerId,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime
    );

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c =>
        `${c.scheduled_start_time}-${c.scheduled_end_time} at ${c.property?.property_name}`
      ).join(', ');
      throw new ValidationError(`Contractor has ${conflicts.length} conflicting job(s): ${conflictDetails}`);
    }

    // 4. Assign contractor
    const updatedJob = await prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        assigned_worker_id: workerId,
        scheduled_date: scheduledDate,
        scheduled_start_time: scheduledStartTime,
        scheduled_end_time: scheduledEndTime,
        status: 'SCHEDULED',
        updated_at: new Date(),
      },
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
        quote: true,
      },
    });

    // 5. Notify customer
    await this.createCustomerNotification(
      updatedJob.customer_id,
      updatedJob.id,
      'Maintenance Job Scheduled',
      `Your maintenance job for ${updatedJob.property.property_name} has been scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledStartTime}.`,
      'MAINTENANCE_JOB_SCHEDULED',
      {
        property_name: updatedJob.property.property_name,
        scheduled_date: scheduledDate.toISOString(),
        scheduled_start_time: scheduledStartTime,
        scheduled_end_time: scheduledEndTime,
        worker_name: updatedJob.assigned_worker ? `${updatedJob.assigned_worker.first_name} ${updatedJob.assigned_worker.last_name}` : 'Worker',
      }
    );

    // 6. Record in worker history
    await this.workerHistoryService.recordJobAssigned(
      workerId,
      jobId,
      'MAINTENANCE',
      updatedJob.property?.property_name,
      scheduledDate.toISOString().split('T')[0]
    ).catch((error) => {
      console.error('Failed to record job assignment in worker history:', error);
    });

    return updatedJob;
  }

  async assignExternalContractor(
    jobId: string,
    contractorId: string,
    scheduledDate: Date,
    scheduledStartTime: string,
    scheduledEndTime: string,
    serviceProviderId: string
  ) {
    const job = await this.getById(jobId, serviceProviderId);

    if (job.status !== 'APPROVED' && job.status !== 'QUOTE_SENT') {
      throw new ValidationError('Job must have approved quote before assignment');
    }

    const contractor = await prisma.externalContractor.findFirst({
      where: {
        id: contractorId,
        service_provider_id: serviceProviderId,
      },
    });

    if (!contractor) {
      throw new ValidationError('External contractor not found');
    }

    // Note: We don't check conflicts for external contractors
    // They manage their own schedules

    const updatedJob = await prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        assigned_contractor_id: contractorId,
        scheduled_date: scheduledDate,
        scheduled_start_time: scheduledStartTime,
        scheduled_end_time: scheduledEndTime,
        status: 'SCHEDULED',
        updated_at: new Date(),
      },
      include: {
        property: true,
        customer: true,
        assigned_contractor: true,
        quote: true,
      },
    });

    // Notify customer
    await this.createCustomerNotification(
      updatedJob.customer_id,
      updatedJob.id,
      'Maintenance Job Scheduled',
      `Your maintenance job for ${updatedJob.property.property_name} has been scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledStartTime}.`,
      'MAINTENANCE_JOB_SCHEDULED',
      {
        property_name: updatedJob.property.property_name,
        scheduled_date: scheduledDate.toISOString(),
        scheduled_start_time: scheduledStartTime,
        scheduled_end_time: scheduledEndTime,
        contractor_name: updatedJob.assigned_contractor ? updatedJob.assigned_contractor.company_name : 'Contractor',
      }
    );

    return updatedJob;
  }

  async checkContractorAvailability(
    workerId: string,
    date: Date,
    startTime: string,
    endTime: string
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const overlappingJobs = await prisma.maintenanceJob.findMany({
      where: {
        assigned_worker_id: workerId,
        scheduled_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
      include: {
        property: true,
      },
    });

    // Check for time slot overlaps
    return overlappingJobs.filter(job => {
      if (!job.scheduled_start_time || !job.scheduled_end_time) {
        return false;
      }
      return this.timeSlotsOverlap(
        startTime,
        endTime,
        job.scheduled_start_time,
        job.scheduled_end_time
      );
    });
  }

  private timeSlotsOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  async getAvailableContractors(
    date: Date,
    startTime: string,
    endTime: string,
    serviceProviderId: string
  ) {
    // Get all internal contractors
    const internalContractors = await prisma.worker.findMany({
      where: {
        service_provider_id: serviceProviderId,
        is_active: true,
        worker_type: { in: ['MAINTENANCE', 'BOTH'] },
        employment_type: 'CONTRACTOR',
      },
    });

    // Check availability for each
    const internalWithAvailability = await Promise.all(
      internalContractors.map(async (contractor) => {
        const conflicts = await this.checkContractorAvailability(
          contractor.id,
          date,
          startTime,
          endTime
        );
        return {
          ...contractor,
          isAvailable: conflicts.length === 0,
          conflicts,
        };
      })
    );

    // Get external contractors (no availability check)
    const externalContractors = await prisma.externalContractor.findMany({
      where: {
        service_provider_id: serviceProviderId,
      },
    });

    return {
      internal: internalWithAvailability,
      external: externalContractors,
    };
  }

  async completeJob(
    jobId: string,
    serviceProviderId: string,
    completionData: {
      worker_id?: string
      work_performed: string
      diagnosis?: string
      before_photo_ids?: string[]
      after_photo_ids?: string[]
      work_in_progress_photo_ids?: string[]
      actual_hours_worked?: number
      actual_parts_cost?: number
      generate_invoice?: boolean
    }
  ) {
    // Verify job exists and belongs to this provider
    const job = await this.getById(jobId, serviceProviderId);

    if (job.status !== 'IN_PROGRESS' && job.status !== 'SCHEDULED') {
      throw new ValidationError('Job must be IN_PROGRESS or SCHEDULED to complete');
    }

    // Calculate actual total if provided
    let actualTotal: number | undefined
    if (completionData.actual_hours_worked || completionData.actual_parts_cost) {
      const laborCost = completionData.actual_hours_worked
        ? Number(job.estimated_labor_cost || 0) / Number(job.estimated_hours || 1) * completionData.actual_hours_worked
        : Number(job.estimated_labor_cost || 0)
      const partsCost = completionData.actual_parts_cost || Number(job.estimated_parts_cost || 0)
      actualTotal = laborCost + partsCost
    }

    // Update job as completed
    const updatedJob = await prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completed_date: new Date(),
        completion_notes: completionData.work_performed,
        work_in_progress_photos: completionData.work_in_progress_photo_ids || [],
        completion_photos: completionData.after_photo_ids || [],
        actual_total: actualTotal,
        updated_at: new Date(),
      },
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
        quote: true,
      },
    });

    // Generate invoice if requested
    let invoiceId: string | undefined
    if (completionData.generate_invoice) {
      const invoiceService = new InvoiceService();
      const invoice = await invoiceService.generateFromMaintenanceJob(jobId, serviceProviderId);
      invoiceId = invoice.id;
    }

    // Notify customer about job completion
    await this.createCustomerNotification(
      updatedJob.customer_id,
      updatedJob.id,
      'Maintenance Job Completed',
      `Your maintenance job for ${updatedJob.property.property_name} has been completed. ${invoiceId ? 'An invoice has been generated and is ready for your review.' : ''}`,
      'MAINTENANCE_JOB_COMPLETED',
      {
        property_name: updatedJob.property.property_name,
        completed_date: updatedJob.completed_date?.toISOString(),
        invoice_generated: !!invoiceId,
        invoice_id: invoiceId,
      }
    );

    // Record in worker history if worker was assigned
    if (updatedJob.assigned_worker_id) {
      // Calculate duration if we have scheduled and completed dates
      let duration: number | undefined;
      if (job.scheduled_date && updatedJob.completed_date) {
        const durationMs = updatedJob.completed_date.getTime() - job.scheduled_date.getTime();
        duration = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
      } else if (completionData.actual_hours_worked) {
        duration = completionData.actual_hours_worked;
      }

      await this.workerHistoryService.recordJobCompleted(
        updatedJob.assigned_worker_id,
        jobId,
        'MAINTENANCE',
        updatedJob.property?.property_name,
        duration
      ).catch((error) => {
        console.error('Failed to record job completion in worker history:', error);
      });
    }

    return {
      job: updatedJob,
      invoice_id: invoiceId,
    };
  }

  /**
   * Create a notification for the customer when a maintenance job is scheduled
   */
  private async createCustomerNotification(
    customerId: string,
    jobId: string,
    title: string,
    body: string,
    notificationType: 'MAINTENANCE_JOB_SCHEDULED' | 'MAINTENANCE_JOB_COMPLETED' | 'QUOTE_READY',
    additionalData?: any
  ) {
    try {
      // Find the customer portal user for this customer
      const portalUser = await prisma.customerPortalUser.findUnique({
        where: { customer_id: customerId },
      });

      if (!portalUser) {
        // Customer doesn't have a portal account yet, skip notification
        console.log(`Customer ${customerId} has no portal account, skipping notification`);
        return;
      }

      // Create the notification
      await prisma.customerNotification.create({
        data: {
          customer_portal_user_id: portalUser.id,
          notification_type: notificationType,
          title,
          body,
          data: {
            job_id: jobId,
            ...additionalData,
          },
        },
      });

      console.log(`Created ${notificationType} notification for customer ${customerId}`);
    } catch (error) {
      // Don't fail the main operation if notification fails
      console.error('Failed to create customer notification:', error);
    }
  }
}
