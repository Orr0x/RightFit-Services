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
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      include: {
        property: true,
        assigned_worker: true,
      },
      orderBy: { scheduled_date: 'asc' },
      take: 10,
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
        COALESCE(SUM(cj.price), 0) as cleaning_total,
        COALESCE(SUM(mj.actual_total), 0) as maintenance_total
      FROM customers c
      LEFT JOIN cleaning_jobs cj ON c.id = cj.customer_id
        AND cj.status = 'COMPLETED'
        AND cj.completed_at >= ${thisMonthStart}
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
}
