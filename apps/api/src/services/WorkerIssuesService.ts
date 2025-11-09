import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class WorkerIssuesService {

  async list(filters?: {
    customerId?: string;
    propertyId?: string;
    workerId?: string;
    serviceProviderId?: string;
    status?: string;
  }) {
    const issues = await prisma.workerIssueReport.findMany({
      where: {
        ...(filters?.customerId && { customer_id: filters.customerId }),
        ...(filters?.propertyId && { property_id: filters.propertyId }),
        ...(filters?.workerId && { worker_id: filters.workerId }),
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.serviceProviderId && {
          worker: {
            service_provider_id: filters.serviceProviderId,
          },
        }),
      },
      include: {
        property: {
          select: {
            property_name: true,
            address: true,
          },
        },
        worker: {
          select: {
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        cleaning_job: {
          select: {
            id: true,
            scheduled_date: true,
          },
        },
        created_maintenance_job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { reported_at: 'desc' },
    });

    return issues;
  }

  async getById(id: string) {
    const issue = await prisma.workerIssueReport.findUnique({
      where: { id },
      include: {
        property: true,
        customer: {
          select: {
            id: true,
            organization_name: true,
            contact_name: true,
            email: true,
            phone: true,
          },
        },
        worker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
        cleaning_job: {
          select: {
            id: true,
            scheduled_date: true,
            scheduled_start_time: true,
            scheduled_end_time: true,
          },
        },
        created_maintenance_job: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundError('Worker issue report not found');
    }

    return issue;
  }

  async create(data: {
    property_id: string;
    customer_id: string;
    worker_id: string;
    cleaning_job_id?: string;
    issue_type: string;
    title: string;
    issue_description: string;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    photos?: string[];
  }) {
    // Validate required fields
    if (!data.title || !data.issue_description) {
      throw new ValidationError('Title and description are required');
    }

    const issue = await prisma.workerIssueReport.create({
      data: {
        property_id: data.property_id,
        customer_id: data.customer_id,
        worker_id: data.worker_id,
        cleaning_job_id: data.cleaning_job_id,
        issue_type: data.issue_type,
        title: data.title,
        issue_description: data.issue_description,
        category: data.category,
        priority: data.priority,
        photos: data.photos || [],
        status: 'SUBMITTED',
      },
      include: {
        property: true,
        worker: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return issue;
  }

  async approve(id: string, approvedByCustomerId: string) {
    // Get the issue
    const issue = await this.getById(id);

    // Validate issue status
    if (issue.status !== 'SUBMITTED' && issue.status !== 'CUSTOMER_REVIEWING') {
      throw new ValidationError('Issue cannot be approved in its current state');
    }

    // Validate customer owns this issue
    if (issue.customer_id !== approvedByCustomerId) {
      throw new ValidationError('You do not have permission to approve this issue');
    }

    // Get service provider ID from the worker
    const worker = await prisma.worker.findUnique({
      where: { id: issue.worker_id },
      select: { service_provider_id: true },
    });

    if (!worker) {
      throw new NotFoundError('Worker not found');
    }

    // Get the maintenance service for this service provider
    const maintenanceService = await prisma.service.findFirst({
      where: {
        service_provider_id: worker.service_provider_id,
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
        property_id: issue.property_id,
        customer_id: issue.customer_id,
        source: 'CLEANER_REPORT',
        source_cleaning_job_id: issue.cleaning_job_id,
        category: issue.category,
        priority: issue.priority,
        title: issue.title,
        description: issue.issue_description,
        issue_photos: issue.photos,
        work_in_progress_photos: [],
        completion_photos: [],
        status: 'QUOTE_PENDING',
      },
      include: {
        property: true,
        customer: true,
      },
    });

    // Update issue status
    const updatedIssue = await prisma.workerIssueReport.update({
      where: { id },
      data: {
        status: 'APPROVED',
        customer_approved_at: new Date(),
        created_maintenance_job_id: maintenanceJob.id,
      },
      include: {
        created_maintenance_job: true,
      },
    });

    return updatedIssue;
  }

  async reject(id: string, rejectedByCustomerId: string, rejectionReason?: string) {
    // Get the issue
    const issue = await this.getById(id);

    // Validate issue status
    if (issue.status !== 'SUBMITTED' && issue.status !== 'CUSTOMER_REVIEWING') {
      throw new ValidationError('Issue cannot be rejected in its current state');
    }

    // Validate customer owns this issue
    if (issue.customer_id !== rejectedByCustomerId) {
      throw new ValidationError('You do not have permission to reject this issue');
    }

    // Update issue status
    const updatedIssue = await prisma.workerIssueReport.update({
      where: { id },
      data: {
        status: 'REJECTED',
        customer_rejected_at: new Date(),
        rejection_reason: rejectionReason,
      },
    });

    return updatedIssue;
  }

  async updateStatus(id: string, status: string) {
    const issue = await prisma.workerIssueReport.update({
      where: { id },
      data: { status: status as any },
    });

    return issue;
  }

  async addPhotos(id: string, newPhotos: string[]) {
    // Get the existing issue
    const issue = await this.getById(id);

    // Only allow adding photos to SUBMITTED or CUSTOMER_REVIEWING issues
    if (issue.status !== 'SUBMITTED' && issue.status !== 'CUSTOMER_REVIEWING') {
      throw new ValidationError('Cannot add photos to issues that have been approved or rejected');
    }

    // Combine existing photos with new photos
    const updatedPhotos = [...(issue.photos || []), ...newPhotos];

    // Update the issue with the new photos
    const updatedIssue = await prisma.workerIssueReport.update({
      where: { id },
      data: {
        photos: updatedPhotos,
      },
      include: {
        property: {
          select: {
            property_name: true,
            address: true,
          },
        },
        worker: {
          select: {
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        cleaning_job: {
          select: {
            id: true,
            scheduled_date: true,
          },
        },
        created_maintenance_job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return updatedIssue;
  }
}
