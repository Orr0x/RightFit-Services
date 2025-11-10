import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class MaintenanceInvoiceService {
  /**
   * Create invoice from a maintenance job
   */
  async createFromJob(
    maintenanceJobId: string,
    serviceProviderId: string,
    additionalData?: {
      invoice_date?: Date
      due_date?: Date
      notes?: string
    }
  ) {
    // Get the job with all details
    const job = await prisma.maintenanceJob.findFirst({
      where: {
        id: maintenanceJobId,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        customer: true,
        property: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Maintenance job not found');
    }

    if (job.status !== 'COMPLETED') {
      throw new ValidationError('Job must be completed to generate invoice');
    }

    // Check if invoice already exists for this job
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        maintenance_job_id: maintenanceJobId,
      },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Build line items from job details
    const lineItems: any[] = [];

    // Add labor line item
    if (job.actual_hours || job.estimated_hours) {
      const hours = Number(job.actual_hours || job.estimated_hours);
      const laborRate = 50; // Default rate, should come from worker/contractor
      lineItems.push({
        description: `Labor: ${job.title}`,
        quantity: hours,
        unit_price: laborRate,
        total: hours * laborRate,
      });
    }

    // Add parts line items
    if (job.parts_used && Array.isArray(job.parts_used) && job.parts_used.length > 0) {
      job.parts_used.forEach((part: any) => {
        lineItems.push({
          description: `Parts: ${part.name || part}`,
          quantity: part.quantity || 1,
          unit_price: part.cost || 0,
          total: (part.quantity || 1) * (part.cost || 0),
        });
      });
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxPercentage = 20; // 20% VAT
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;

    // Set dates
    const invoiceDate = additionalData?.invoice_date || new Date();
    const dueDate = additionalData?.due_date || (() => {
      const date = new Date(invoiceDate);
      const paymentTermsDays = this.getPaymentTermsDays(job.customer.payment_terms);
      date.setDate(date.getDate() + paymentTermsDays);
      return date;
    })();

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        customer_id: job.customer_id,
        maintenance_job_id: maintenanceJobId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        line_items: lineItems,
        subtotal,
        tax_percentage: taxPercentage,
        tax_amount: taxAmount,
        total,
        status: 'PENDING',
        notes: additionalData?.notes,
      },
      include: {
        customer: true,
        maintenance_job: true,
      },
    });

    return invoice;
  }

  /**
   * Create invoice manually (not from job)
   */
  async create(
    data: {
      customer_id: string
      maintenance_job_id?: string
      invoice_date: Date
      due_date: Date
      line_items: any[]
      subtotal: number
      tax_percentage?: number
      notes?: string
    },
    serviceProviderId: string
  ) {
    // Verify customer belongs to service provider
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customer_id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const taxPercentage = data.tax_percentage || 20;
    const taxAmount = (data.subtotal * taxPercentage) / 100;
    const total = data.subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        customer_id: data.customer_id,
        maintenance_job_id: data.maintenance_job_id,
        invoice_number: invoiceNumber,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        line_items: data.line_items,
        subtotal: data.subtotal,
        tax_percentage: taxPercentage,
        tax_amount: taxAmount,
        total,
        status: 'PENDING',
        notes: data.notes,
      },
      include: {
        customer: true,
        maintenance_job: true,
      },
    });

    return invoice;
  }

  /**
   * Generate unique invoice number
   */
  async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Get count of maintenance invoices this month
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0);

    const count = await prisma.invoice.count({
      where: {
        maintenance_job_id: { not: null },
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Format: MINV-YYYYMM-XXXX (M for Maintenance)
    const invoiceNumber = `MINV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    return invoiceNumber;
  }

  /**
   * Get invoice by ID
   */
  async getById(id: string, serviceProviderId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        customer: true,
        maintenance_job: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError('Maintenance invoice not found');
    }

    return invoice;
  }

  /**
   * List invoices with pagination and filters
   */
  async list(
    serviceProviderId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string
      customer_id?: string
      maintenance_job_id?: string
      from_date?: Date
      to_date?: Date
    }
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      maintenance_job_id: { not: null }, // Only maintenance invoices
      customer: {
        service_provider_id: serviceProviderId,
      },
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.customer_id) {
      where.customer_id = filters.customer_id;
    }
    if (filters?.maintenance_job_id) {
      where.maintenance_job_id = filters.maintenance_job_id;
    }
    if (filters?.from_date || filters?.to_date) {
      where.invoice_date = {};
      if (filters.from_date) {
        where.invoice_date.gte = filters.from_date;
      }
      if (filters.to_date) {
        where.invoice_date.lte = filters.to_date;
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { invoice_date: 'desc' },
        ],
        include: {
          customer: true,
          maintenance_job: {
            include: {
              property: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(
    id: string,
    serviceProviderId: string,
    paymentData: {
      payment_method: string
      payment_reference?: string
    }
  ) {
    await this.getById(id, serviceProviderId);

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paid_at: new Date(),
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
      },
      include: {
        customer: true,
        maintenance_job: true,
      },
    });

    return invoice;
  }

  /**
   * Update invoice
   */
  async update(
    id: string,
    serviceProviderId: string,
    data: {
      line_items?: any[]
      subtotal?: number
      tax_percentage?: number
      notes?: string
      status?: string
    }
  ) {
    await this.getById(id, serviceProviderId);

    // Recalculate totals if line items or subtotal changed
    let updateData: any = { ...data };

    if (data.line_items || data.subtotal !== undefined || data.tax_percentage !== undefined) {
      const invoice = await this.getById(id, serviceProviderId);

      // Calculate new subtotal from line items if provided
      let subtotal = data.subtotal;
      if (data.line_items) {
        subtotal = data.line_items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
        updateData.subtotal = subtotal;
      } else if (subtotal === undefined) {
        subtotal = Number(invoice.subtotal);
      }

      const taxPercentage = data.tax_percentage !== undefined ? data.tax_percentage : Number(invoice.tax_percentage);
      const taxAmount = (subtotal * taxPercentage) / 100;
      const total = subtotal + taxAmount;

      updateData = {
        ...updateData,
        tax_amount: taxAmount,
        total,
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        maintenance_job: true,
      },
    });

    return invoice;
  }

  /**
   * Delete invoice
   */
  async delete(id: string, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    await prisma.invoice.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Get payment terms as number of days
   */
  private getPaymentTermsDays(paymentTerms: string): number {
    switch (paymentTerms) {
      case 'NET_7':
        return 7;
      case 'NET_14':
        return 14;
      case 'NET_30':
        return 30;
      case 'NET_60':
        return 60;
      case 'DUE_ON_RECEIPT':
        return 0;
      default:
        return 14; // Default to NET_14
    }
  }

  /**
   * Get stats for a customer
   */
  async getCustomerStats(customerId: string, serviceProviderId: string) {
    const stats = await prisma.invoice.aggregate({
      where: {
        customer_id: customerId,
        maintenance_job_id: { not: null }, // Only maintenance invoices
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    const paidCount = await prisma.invoice.count({
      where: {
        customer_id: customerId,
        maintenance_job_id: { not: null },
        status: 'PAID',
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    const overduCount = await prisma.invoice.count({
      where: {
        customer_id: customerId,
        maintenance_job_id: { not: null },
        status: 'PENDING',
        due_date: {
          lt: new Date(),
        },
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    return {
      total_invoices: stats._count.id,
      total_amount: stats._sum.total || 0,
      paid_invoices: paidCount,
      overdue_invoices: overduCount,
    };
  }
}
