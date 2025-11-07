import { prisma } from '@rightfit/database';
import bcrypt from 'bcrypt';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

export interface CustomerDashboardData {
  customer: any;
  properties: any[];
  activeJobs: {
    cleaning: any[];
    maintenance: any[];
  };
  recentInvoices: any[];
  pendingQuotes: any[];
  statistics: {
    totalProperties: number;
    activeJobs: number;
    thisMonthSpending: number;
    pendingQuotes: number;
  };
}

export class CustomerPortalService {
  // Authentication
  async login(email: string, password: string) {
    const portalUser = await prisma.customerPortalUser.findUnique({
      where: { email },
      include: {
        customer: {
          include: {
            service_provider: true,
          },
        },
      },
    });

    if (!portalUser) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, portalUser.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.customerPortalUser.update({
      where: { id: portalUser.id },
      data: { last_login: new Date() },
    });

    return {
      user: {
        id: portalUser.id,
        email: portalUser.email,
        customer_id: portalUser.customer_id,
      },
      customer: portalUser.customer,
    };
  }

  async register(email: string, password: string, customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const portalUser = await prisma.customerPortalUser.create({
      data: {
        customer_id: customerId,
        email,
        password_hash: passwordHash,
      },
      include: {
        customer: true,
      },
    });

    return {
      user: {
        id: portalUser.id,
        email: portalUser.email,
        customer_id: portalUser.customer_id,
      },
      customer: portalUser.customer,
    };
  }

  // Dashboard Data
  async getDashboard(customerId: string): Promise<CustomerDashboardData> {
    // DEMO MODE: Return mock data for demo customer
    if (customerId === 'demo-customer-id') {
      return {
        customer: {
          id: 'demo-customer-id',
          business_name: 'Demo Customer',
          contact_name: 'Demo User',
          email: 'demo@example.com',
          phone: '555-0100',
        },
        properties: [],
        activeJobs: {
          cleaning: [],
          maintenance: [],
        },
        recentInvoices: [],
        pendingQuotes: [],
        statistics: {
          totalProperties: 0,
          activeJobs: 0,
          thisMonthSpending: 0,
          pendingQuotes: 0,
        },
      };
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        service_provider: true,
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const properties = await prisma.customerProperty.findMany({
      where: { customer_id: customerId, is_active: true },
      include: {
        _count: {
          select: {
            cleaning_jobs: true,
            maintenance_jobs: true,
          },
        },
      },
    });

    const activeCleaningJobs = await prisma.cleaningJob.findMany({
      where: {
        customer_id: customerId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      include: {
        property: true,
        assigned_worker: true,
      },
      orderBy: { scheduled_date: 'asc' },
      take: 10,
    });

    const activeMaintenanceJobs = await prisma.maintenanceJob.findMany({
      where: {
        customer_id: customerId,
        status: { in: ['QUOTE_PENDING', 'QUOTE_SENT', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] },
      },
      include: {
        property: true,
        assigned_worker: true,
        quote: true,
      },
      orderBy: { scheduled_date: 'desc' },
      take: 50,
    });

    const pendingQuotes = await prisma.quote.findMany({
      where: {
        customer_id: customerId,
        status: 'SENT',
      },
      include: {
        maintenance_jobs: true,
      },
      orderBy: { quote_date: 'desc' },
      take: 5,
    });

    // Statistics
    const totalProperties = properties.length;
    const activeJobs = activeCleaningJobs.length + activeMaintenanceJobs.length;

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    // Calculate this month's spending (completed jobs)
    const completedJobsThisMonth = await prisma.$queryRaw<any[]>`
      SELECT
        COALESCE(SUM(cj.actual_price), 0) as cleaning_total,
        COALESCE(SUM(mj.actual_total), 0) as maintenance_total
      FROM customers c
      LEFT JOIN cleaning_jobs cj ON c.id = cj.customer_id
        AND cj.status = 'COMPLETED'
        AND cj.actual_end_time >= ${thisMonthStart}
      LEFT JOIN maintenance_jobs mj ON c.id = mj.customer_id
        AND mj.status = 'COMPLETED'
        AND mj.completed_date >= ${thisMonthStart}
      WHERE c.id = ${customerId}
    `;

    const thisMonthSpending =
      (Number(completedJobsThisMonth[0]?.cleaning_total) || 0) +
      (Number(completedJobsThisMonth[0]?.maintenance_total) || 0);

    return {
      customer,
      properties,
      activeJobs: {
        cleaning: activeCleaningJobs,
        maintenance: activeMaintenanceJobs,
      },
      recentInvoices: [], // TODO: Implement invoicing
      pendingQuotes,
      statistics: {
        totalProperties,
        activeJobs,
        thisMonthSpending,
        pendingQuotes: pendingQuotes.length,
      },
    };
  }

  // Property Service History
  async getPropertyHistory(customerId: string, propertyId: string) {
    const property = await prisma.customerProperty.findFirst({
      where: {
        id: propertyId,
        customer_id: customerId,
      },
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    const cleaningJobs = await prisma.cleaningJob.findMany({
      where: { property_id: propertyId },
      include: {
        assigned_worker: true,
      },
      orderBy: { scheduled_date: 'desc' },
    });

    const maintenanceJobs = await prisma.maintenanceJob.findMany({
      where: { property_id: propertyId },
      include: {
        assigned_worker: true,
        quote: true,
      },
      orderBy: { scheduled_date: 'desc' },
    });

    return {
      property,
      cleaning_jobs: cleaningJobs,
      maintenance_jobs: maintenanceJobs,
    };
  }

  // Quote Approval
  async approveQuote(customerId: string, quoteId: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        customer_id: customerId,
      },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    if (quote.status !== 'SENT') {
      throw new Error('Quote cannot be approved in current status');
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'APPROVED',
        approved_at: new Date(),
      },
      include: {
        maintenance_jobs: true,
      },
    });

    // Update associated maintenance jobs to APPROVED
    if (updatedQuote.maintenance_jobs && updatedQuote.maintenance_jobs.length > 0) {
      await prisma.maintenanceJob.updateMany({
        where: {
          quote_id: quoteId,
        },
        data: {
          status: 'APPROVED',
        },
      });
    }

    return updatedQuote;
  }

  async declineQuote(customerId: string, quoteId: string, reason?: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        customer_id: customerId,
      },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'DECLINED',
        customer_response: reason,
      },
    });

    // Update associated maintenance jobs to CANCELLED
    await prisma.maintenanceJob.updateMany({
      where: {
        quote_id: quoteId,
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return updatedQuote;
  }

  // Preferences
  async getPreferences(customerId: string) {
    let preferences = await prisma.customerPreferences.findUnique({
      where: { customer_id: customerId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.customerPreferences.create({
        data: {
          customer_id: customerId,
        },
      });
    }

    return preferences;
  }

  async updatePreferences(customerId: string, data: any) {
    const preferences = await prisma.customerPreferences.upsert({
      where: { customer_id: customerId },
      update: data,
      create: {
        customer_id: customerId,
        ...data,
      },
    });

    return preferences;
  }

  // Properties
  async getProperties(customerId: string) {
    const properties = await prisma.customerProperty.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            business_name: true,
            contact_name: true,
          },
        },
        _count: {
          select: {
            cleaning_jobs: true,
            maintenance_jobs: true,
            guest_issue_reports: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return properties;
  }

  // Guest Issues
  async getGuestIssues(customerId: string) {
    // Get all properties for this customer
    const properties = await prisma.customerProperty.findMany({
      where: { customer_id: customerId },
      select: { id: true },
    });

    const propertyIds = properties.map((p) => p.id);

    // Get all guest issues for these properties
    const issues = await prisma.guestIssueReport.findMany({
      where: {
        property_id: { in: propertyIds },
      },
      include: {
        property: {
          select: {
            property_name: true,
            address: true,
            postcode: true,
          },
        },
      },
      orderBy: {
        reported_at: 'desc',
      },
    });

    return issues;
  }

  async submitGuestIssue(customerId: string, issueId: string) {
    // Verify the issue belongs to this customer's property
    const issue = await prisma.guestIssueReport.findUnique({
      where: { id: issueId },
      include: { property: true },
    });

    if (!issue) {
      throw new NotFoundError('Guest issue not found');
    }

    if (issue.property.customer_id !== customerId) {
      throw new UnauthorizedError('You do not have permission to submit this issue');
    }

    // Get the property's service provider
    const property = await prisma.customerProperty.findUnique({
      where: { id: issue.property_id },
      include: { customer: true },
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Find the maintenance service for this service provider
    const maintenanceService = await prisma.service.findFirst({
      where: {
        service_provider_id: property.customer.service_provider_id,
        service_type: 'MAINTENANCE',
        is_active: true,
      },
    });

    if (!maintenanceService) {
      throw new NotFoundError('No active maintenance service found for this property');
    }

    // Create a maintenance job from the guest issue
    const maintenanceJob = await prisma.maintenanceJob.create({
      data: {
        service_id: maintenanceService.id,
        property_id: issue.property_id,
        customer_id: customerId,
        source: 'GUEST_REPORT',
        source_guest_report_id: issueId,
        category: issue.issue_type,
        priority: issue.ai_severity?.toUpperCase() === 'HIGH' || issue.ai_severity?.toUpperCase() === 'URGENT' ? 'URGENT' : 'MEDIUM',
        title: `Guest Report: ${issue.issue_type}`,
        description: issue.issue_description,
        status: 'QUOTE_PENDING',
        issue_photos: issue.photos || [],
      },
    });

    // Update guest issue status
    const updatedIssue = await prisma.guestIssueReport.update({
      where: { id: issueId },
      data: { status: 'WORK_ORDER_CREATED' },
    });

    return { issue: updatedIssue, maintenanceJob };
  }

  async dismissGuestIssue(customerId: string, issueId: string) {
    // Verify the issue belongs to this customer's property
    const issue = await prisma.guestIssueReport.findUnique({
      where: { id: issueId },
      include: { property: true },
    });

    if (!issue) {
      throw new NotFoundError('Guest issue not found');
    }

    if (issue.property.customer_id !== customerId) {
      throw new UnauthorizedError('You do not have permission to dismiss this issue');
    }

    // Update guest issue status
    const updatedIssue = await prisma.guestIssueReport.update({
      where: { id: issueId },
      data: { status: 'DISMISSED' },
    });

    return updatedIssue;
  }

  async getWorkerIssues(customerId: string) {
    // Get all properties for this customer
    const properties = await prisma.customerProperty.findMany({
      where: { customer_id: customerId },
      select: { id: true },
    });

    const propertyIds = properties.map((p) => p.id);

    // Get all worker issues for these properties
    const issues = await prisma.workerIssueReport.findMany({
      where: {
        property_id: { in: propertyIds },
      },
      include: {
        property: {
          select: {
            property_name: true,
            address: true,
            postcode: true,
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
      },
      orderBy: {
        reported_at: 'desc',
      },
    });

    return issues;
  }

  async approveWorkerIssue(customerId: string, issueId: string) {
    // Verify the issue belongs to this customer's property
    const issue = await prisma.workerIssueReport.findUnique({
      where: { id: issueId },
      include: { property: true },
    });

    if (!issue) {
      throw new NotFoundError('Worker issue not found');
    }

    if (issue.property.customer_id !== customerId) {
      throw new UnauthorizedError('You do not have permission to approve this issue');
    }

    // Use WorkerIssuesService to approve and create maintenance job
    const workerIssuesService = new (await import('./WorkerIssuesService')).WorkerIssuesService();
    const approvedIssue = await workerIssuesService.approve(issueId, customerId);

    return approvedIssue;
  }

  async rejectWorkerIssue(customerId: string, issueId: string, rejectionReason?: string) {
    // Verify the issue belongs to this customer's property
    const issue = await prisma.workerIssueReport.findUnique({
      where: { id: issueId },
      include: { property: true },
    });

    if (!issue) {
      throw new NotFoundError('Worker issue not found');
    }

    if (issue.property.customer_id !== customerId) {
      throw new UnauthorizedError('You do not have permission to reject this issue');
    }

    // Use WorkerIssuesService to reject
    const workerIssuesService = new (await import('./WorkerIssuesService')).WorkerIssuesService();
    const rejectedIssue = await workerIssuesService.reject(issueId, customerId, rejectionReason);

    return rejectedIssue;
  }

  async createMaintenanceRequest(customerId: string, data: {
    property_id: string;
    title: string;
    description: string;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    requested_date?: Date;
  }) {
    // Verify property belongs to this customer
    const property = await prisma.customerProperty.findFirst({
      where: {
        id: data.property_id,
        customer_id: customerId,
      },
    });

    if (!property) {
      throw new NotFoundError('Property not found or does not belong to this customer');
    }

    // Get the customer's service provider and maintenance service
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Find the maintenance service for the customer's service provider
    const maintenanceService = await prisma.service.findFirst({
      where: {
        service_provider_id: customer.service_provider_id,
        service_type: 'MAINTENANCE',
      },
    });

    if (!maintenanceService) {
      throw new ValidationError('No maintenance service configured for your service provider');
    }

    // Create maintenance job with CUSTOMER_REQUEST source
    const maintenanceJob = await prisma.maintenanceJob.create({
      data: {
        service_id: maintenanceService.id,
        property_id: data.property_id,
        customer_id: customerId,
        source: 'CUSTOMER_REQUEST',
        category: data.category,
        priority: data.priority,
        title: data.title,
        description: data.description,
        requested_date: data.requested_date,
        issue_photos: [],
        work_in_progress_photos: [],
        completion_photos: [],
        status: 'QUOTE_PENDING',
      },
      include: {
        property: true,
      },
    });

    return maintenanceJob;
  }

  async getMaintenanceJobs(customerId: string) {
    // Get all maintenance jobs for this customer
    const jobs = await prisma.maintenanceJob.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        property: {
          select: {
            property_name: true,
            address: true,
            postcode: true,
          },
        },
        assigned_worker: {
          select: {
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        assigned_contractor: {
          select: {
            company_name: true,
            contact_name: true,
            phone: true,
          },
        },
        quote: {
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: [
        { created_at: 'desc' },
      ],
    });

    return jobs;
  }

  async rateMaintenanceJob(jobId: string, customerId: string, rating: number) {
    // Verify job exists and belongs to this customer
    const job = await prisma.maintenanceJob.findFirst({
      where: {
        id: jobId,
        customer_id: customerId,
      },
    });

    if (!job) {
      throw new NotFoundError('Maintenance job not found');
    }

    if (job.status !== 'COMPLETED') {
      throw new Error('Can only rate completed jobs');
    }

    // Update job rating
    const updatedJob = await prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        customer_satisfaction_rating: rating,
        updated_at: new Date(),
      },
      include: {
        property: true,
        assigned_worker: true,
        assigned_contractor: true,
      },
    });

    return updatedJob;
  }

  // Notifications
  async getNotifications(customerId: string) {
    // Get the portal user for this customer
    const portalUser = await prisma.customerPortalUser.findUnique({
      where: { customer_id: customerId },
    });

    if (!portalUser) {
      return [];
    }

    // Get all notifications for this portal user
    const notifications = await prisma.customerNotification.findMany({
      where: {
        customer_portal_user_id: portalUser.id,
      },
      orderBy: {
        sent_at: 'desc',
      },
      take: 50, // Limit to latest 50 notifications
    });

    return notifications;
  }

  async markNotificationAsRead(customerId: string, notificationId: string) {
    // Get the portal user for this customer
    const portalUser = await prisma.customerPortalUser.findUnique({
      where: { customer_id: customerId },
    });

    if (!portalUser) {
      throw new NotFoundError('Customer portal user not found');
    }

    // Verify notification belongs to this portal user
    const notification = await prisma.customerNotification.findFirst({
      where: {
        id: notificationId,
        customer_portal_user_id: portalUser.id,
      },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Mark as read
    const updatedNotification = await prisma.customerNotification.update({
      where: { id: notificationId },
      data: { read_at: new Date() },
    });

    return updatedNotification;
  }

  // Get maintenance job details for customer
  async getMaintenanceJobDetails(customerId: string, jobId: string) {
    // Verify customer owns this job
    const job = await prisma.maintenanceJob.findFirst({
      where: {
        id: jobId,
        customer_id: customerId,
      },
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
        assigned_contractor: true,
        quote: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Maintenance job not found');
    }

    return job;
  }

  // Add customer comment to maintenance job
  async addJobComment(customerId: string, jobId: string, comment: string) {
    // Verify customer owns this job
    const job = await prisma.maintenanceJob.findFirst({
      where: {
        id: jobId,
        customer_id: customerId,
      },
    });

    if (!job) {
      throw new NotFoundError('Maintenance job not found');
    }

    // For now, we'll append the comment to the description field
    // In a production system, you'd want a separate comments/activity table
    const commentTimestamp = new Date().toLocaleString();
    const customerComment = `\n\n--- Customer Comment (${commentTimestamp}) ---\n${comment}`;

    await prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        description: job.description
          ? `${job.description}${customerComment}`
          : `Customer Job${customerComment}`,
      },
    });

    // Create a notification for the service provider
    // TODO: Implement notification system for service providers

    return { success: true, message: 'Comment added successfully' };
  }

  // Get all invoices for a customer
  async getInvoices(customerId: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        maintenance_job: {
          include: {
            property: true,
            service: true,
          },
        },
      },
      orderBy: {
        invoice_date: 'desc',
      },
    });

    // Calculate statistics
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const currentMonthTotal = invoices
      .filter(inv => new Date(inv.invoice_date) >= currentMonthStart)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const lastMonthTotal = invoices
      .filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate >= lastMonthStart && invDate <= lastMonthEnd;
      })
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const ytdTotal = invoices
      .filter(inv => new Date(inv.invoice_date) >= yearStart)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    return {
      invoices,
      statistics: {
        currentMonth: currentMonthTotal,
        lastMonth: lastMonthTotal,
        ytdTotal,
      },
    };
  }
}
