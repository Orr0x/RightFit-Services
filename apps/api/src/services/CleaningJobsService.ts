import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface CreateCleaningJobInput {
  service_id: string;
  property_id: string;
  customer_id: string;
  assigned_worker_id?: string;
  scheduled_date: Date;
  scheduled_start_time: string;
  scheduled_end_time: string;
  checklist_template_id?: string;
  checklist_total_items?: number;
  pricing_type: string;
  quoted_price: number;
}

export interface UpdateCleaningJobInput {
  assigned_worker_id?: string;
  scheduled_date?: Date;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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

    // Build where clause
    const where: any = {
      service: {
        service_provider_id: serviceProviderId,
      },
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
    const job = await prisma.cleaningJob.findFirst({
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
        maintenance_jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Cleaning job not found');
    }

    return job;
  }

  async create(input: CreateCleaningJobInput, serviceProviderId: string) {
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

    const job = await prisma.cleaningJob.create({
      data: {
        service_id: input.service_id,
        property_id: input.property_id,
        customer_id: input.customer_id,
        assigned_worker_id: input.assigned_worker_id,
        scheduled_date: input.scheduled_date,
        scheduled_start_time: input.scheduled_start_time,
        scheduled_end_time: input.scheduled_end_time,
        checklist_template_id: input.checklist_template_id,
        checklist_total_items: input.checklist_total_items || 0,
        pricing_type: input.pricing_type,
        quoted_price: input.quoted_price,
        before_photos: [],
        after_photos: [],
        issue_photos: [],
      },
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
      },
    });

    return job;
  }

  async update(id: string, input: UpdateCleaningJobInput, serviceProviderId: string) {
    // Verify job belongs to this provider
    await this.getById(id, serviceProviderId);

    const job = await prisma.cleaningJob.update({
      where: { id },
      data: input,
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
      },
    });

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
    });

    if (!job) {
      throw new NotFoundError('Cleaning job not found or not assigned to you');
    }

    return await prisma.cleaningJob.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        actual_start_time: new Date(),
      },
    });
  }

  async completeJob(id: string, workerId: string, completionData: {
    completion_notes?: string;
    actual_price?: number;
  }) {
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id,
        assigned_worker_id: workerId,
      },
    });

    if (!job) {
      throw new NotFoundError('Cleaning job not found or not assigned to you');
    }

    return await prisma.cleaningJob.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actual_end_time: new Date(),
        ...completionData,
      },
    });
  }
}
