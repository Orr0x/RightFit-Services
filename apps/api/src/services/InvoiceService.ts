import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class InvoiceService {
  /**
   * Create a standalone invoice with line items
   */
  async create(
    data: {
      customer_id: string
      cleaning_job_id?: string
      invoice_date: string
      due_date: string
      line_items: Array<{
        description: string
        quantity: number
        unit_price: number
      }>
      notes?: string
    },
    serviceProviderId: string
  ) {
    // Verify customer belongs to this service provider
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

    // Calculate line item totals and subtotal
    const invoiceLineItems = data.line_items.map((item) => {
      const total = Number(item.quantity) * Number(item.unit_price);
      return {
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total,
      };
    });

    const subtotal = invoiceLineItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate tax (20% VAT)
    const taxPercentage = 20;
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        customer_id: data.customer_id,
        cleaning_job_id: data.cleaning_job_id || undefined,
        invoice_number: invoiceNumber,
        invoice_date: new Date(data.invoice_date),
        due_date: new Date(data.due_date),
        line_items: invoiceLineItems,
        subtotal,
        tax_percentage: taxPercentage,
        tax_amount: taxAmount,
        total,
        status: 'PENDING',
        notes: data.notes || undefined,
      },
      include: {
        customer: true,
      },
    });

    return invoice;
  }

  async generateFromMaintenanceJob(
    maintenanceJobId: string,
    serviceProviderId: string
  ) {
    // Get the maintenance job with quote
    const job = await prisma.maintenanceJob.findFirst({
      where: {
        id: maintenanceJobId,
        service: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        quote: true,
        customer: true,
        property: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Maintenance job not found');
    }

    if (job.status !== 'COMPLETED') {
      throw new ValidationError('Job must be completed before generating invoice');
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: {
        maintenance_job_id: maintenanceJobId,
      },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate invoice totals
    const lineItems = job.quote?.line_items || [];

    // Use actual costs if provided, otherwise use quote
    let subtotal = 0;
    const invoiceLineItems: any[] = [];

    if (job.actual_total) {
      // If actual total is provided, calculate based on actual costs
      subtotal = Number(job.actual_total);

      // Create line items from actual work
      if (job.estimated_labor_cost) {
        invoiceLineItems.push({
          description: 'Labor',
          quantity: 1,
          unit_price: Number(job.actual_total) * 0.6, // Approximate labor portion
          total: Number(job.actual_total) * 0.6,
        });
      }
      if (job.estimated_parts_cost) {
        invoiceLineItems.push({
          description: 'Parts',
          quantity: 1,
          unit_price: Number(job.actual_total) * 0.4, // Approximate parts portion
          total: Number(job.actual_total) * 0.4,
        });
      }
    } else {
      // Use quote line items
      const quoteLineItems = Array.isArray(lineItems) ? lineItems : [];
      for (const item of quoteLineItems) {
        const typedItem = item as any;
        subtotal += Number(typedItem?.total || 0);
        invoiceLineItems.push({
          description: typedItem?.description || 'Item',
          quantity: typedItem?.quantity || 1,
          unit_price: typedItem?.unit_price || 0,
          total: typedItem?.total || 0,
        });
      }
    }

    // Calculate tax (20% VAT)
    const taxPercentage = 20;
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;

    // Set due date (14 days from now)
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        customer_id: job.customer_id,
        maintenance_job_id: maintenanceJobId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        line_items: invoiceLineItems,
        subtotal,
        tax_percentage: taxPercentage,
        tax_amount: taxAmount,
        total,
        status: 'PENDING',
        notes: job.completion_notes || undefined,
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

    return invoice;
  }

  async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();

    // Get count of invoices this year
    const startOfYear = new Date(year, 0, 1);
    const count = await prisma.invoice.count({
      where: {
        invoice_date: {
          gte: startOfYear,
        },
      },
    });

    // Format: INV-YYYY-XXXXX
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;
    return invoiceNumber;
  }

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
            service: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return invoice;
  }

  async list(
    serviceProviderId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string
      customer_id?: string
      from_date?: Date
      to_date?: Date
    }
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
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

  async markAsPaid(
    id: string,
    serviceProviderId: string,
    paymentData: {
      payment_method: string
      payment_reference?: string
    }
  ) {
    // Verify invoice exists and belongs to this provider
    await this.getById(id, serviceProviderId);

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
        paid_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        customer: true,
        maintenance_job: true,
      },
    });

    return invoice;
  }

  async update(
    id: string,
    data: {
      invoice_date?: string
      due_date?: string
      line_items?: Array<{
        description: string
        quantity: number
        unit_price: number
      }>
      notes?: string
    },
    serviceProviderId: string
  ) {
    // Verify invoice exists and belongs to this provider
    const existingInvoice = await this.getById(id, serviceProviderId);

    // Don't allow editing paid invoices
    if (existingInvoice.status === 'PAID') {
      throw new ValidationError('Cannot edit a paid invoice');
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.invoice_date) {
      updateData.invoice_date = new Date(data.invoice_date);
    }
    if (data.due_date) {
      updateData.due_date = new Date(data.due_date);
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes || undefined;
    }

    // If line items are being updated, recalculate totals
    if (data.line_items) {
      const invoiceLineItems = data.line_items.map((item) => {
        const total = Number(item.quantity) * Number(item.unit_price);
        return {
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total,
        };
      });

      const subtotal = invoiceLineItems.reduce((sum, item) => sum + item.total, 0);

      // Calculate tax (20% VAT)
      const taxPercentage = 20;
      const taxAmount = (subtotal * taxPercentage) / 100;
      const total = subtotal + taxAmount;

      updateData.line_items = invoiceLineItems;
      updateData.subtotal = subtotal;
      updateData.tax_percentage = taxPercentage;
      updateData.tax_amount = taxAmount;
      updateData.total = total;
    }

    // Update invoice
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

  async delete(id: string, serviceProviderId: string) {
    // Verify invoice exists and belongs to this provider
    const existingInvoice = await this.getById(id, serviceProviderId);

    // Don't allow deleting paid invoices
    if (existingInvoice.status === 'PAID') {
      throw new ValidationError('Cannot delete a paid invoice');
    }

    // Delete invoice
    await prisma.invoice.delete({
      where: { id },
    });
  }
}
