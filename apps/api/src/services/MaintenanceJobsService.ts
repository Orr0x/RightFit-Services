import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';

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

    return job;
  }

  async update(id: string, input: UpdateMaintenanceJobInput, serviceProviderId: string) {
    // Verify job belongs to this provider
    await this.getById(id, serviceProviderId);

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
        service: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        service: {
          include: {
            service_provider: {
              include: {
                services: {
                  where: {
                    service_type: 'MAINTENANCE',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cleaningJob) {
      throw new NotFoundError('Cleaning job not found');
    }

    const maintenanceService = cleaningJob.service.service_provider.services[0];
    if (!maintenanceService) {
      throw new ValidationError('No maintenance service configured');
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

    return maintenanceJob;
  }
}
