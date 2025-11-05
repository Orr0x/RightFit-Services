import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class CleaningInvoiceService {
  /**
   * Generate a cleaning invoice from a contract for a billing period
   */
  async generateFromContract(
    contractId: string,
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    serviceProviderId: string
  ) {
    // Get the contract with all details
    const contract = await prisma.cleaningContract.findFirst({
      where: {
        id: contractId,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        customer: true,
        contract_properties: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundError('Cleaning contract not found');
    }

    if (contract.status !== 'ACTIVE') {
      throw new ValidationError('Contract must be active to generate invoice');
    }

    // Check if invoice already exists for this period
    const existingInvoice = await prisma.cleaningInvoice.findFirst({
      where: {
        contract_id: contractId,
        billing_period_start: billingPeriodStart,
        billing_period_end: billingPeriodEnd,
      },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Count cleaning jobs completed in this period
    const totalCleansCompleted = await prisma.cleaningJob.count({
      where: {
        contract_id: contractId,
        status: 'COMPLETED',
        completed_at: {
          gte: billingPeriodStart,
          lte: billingPeriodEnd,
        },
      },
    });

    // Calculate invoice totals
    const contractMonthlyFee = Number(contract.contract_value || 0);
    const additionalCharges = 0; // Could be calculated from extra services
    const subtotal = contractMonthlyFee + additionalCharges;

    // Calculate tax (20% VAT)
    const taxPercentage = 20;
    const taxAmount = (subtotal * taxPercentage) / 100;
    const totalAmount = subtotal + taxAmount;

    // Set due date based on contract payment terms
    const dueDate = new Date(billingPeriodEnd);
    const paymentTermsDays = this.getPaymentTermsDays(contract.customer.payment_terms);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);

    // Create invoice
    const invoice = await prisma.cleaningInvoice.create({
      data: {
        contract_id: contractId,
        customer_id: contract.customer_id,
        invoice_number: invoiceNumber,
        billing_period_start: billingPeriodStart,
        billing_period_end: billingPeriodEnd,
        total_cleans_completed: totalCleansCompleted,
        contract_monthly_fee: contractMonthlyFee,
        additional_charges: additionalCharges,
        subtotal,
        tax_percentage: taxPercentage,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'PENDING',
        due_date: dueDate,
      },
      include: {
        contract: true,
        customer: true,
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

    // Get count of cleaning invoices this month
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0);

    const count = await prisma.cleaningInvoice.count({
      where: {
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Format: CINV-YYYYMM-XXXX (C for Cleaning)
    const invoiceNumber = `CINV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    return invoiceNumber;
  }

  /**
   * Get invoice by ID
   */
  async getById(id: string, serviceProviderId: string) {
    const invoice = await prisma.cleaningInvoice.findFirst({
      where: {
        id,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        contract: {
          include: {
            contract_properties: {
              include: {
                property: true,
              },
            },
          },
        },
        customer: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError('Cleaning invoice not found');
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
      contract_id?: string
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
    if (filters?.contract_id) {
      where.contract_id = filters.contract_id;
    }
    if (filters?.from_date || filters?.to_date) {
      where.billing_period_start = {};
      if (filters.from_date) {
        where.billing_period_start.gte = filters.from_date;
      }
      if (filters.to_date) {
        where.billing_period_start.lte = filters.to_date;
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.cleaningInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { billing_period_start: 'desc' },
        ],
        include: {
          contract: true,
          customer: true,
        },
      }),
      prisma.cleaningInvoice.count({ where }),
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

    const invoice = await prisma.cleaningInvoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paid_at: new Date(),
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
      },
      include: {
        contract: true,
        customer: true,
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
      additional_charges?: number
      notes?: string
      status?: string
    }
  ) {
    await this.getById(id, serviceProviderId);

    // Recalculate totals if additional_charges changed
    let updateData: any = { ...data };

    if (data.additional_charges !== undefined) {
      const invoice = await this.getById(id, serviceProviderId);
      const contractMonthlyFee = Number(invoice.contract_monthly_fee);
      const additionalCharges = Number(data.additional_charges);
      const subtotal = contractMonthlyFee + additionalCharges;
      const taxPercentage = Number(invoice.tax_percentage);
      const taxAmount = (subtotal * taxPercentage) / 100;
      const totalAmount = subtotal + taxAmount;

      updateData = {
        ...updateData,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      };
    }

    const invoice = await prisma.cleaningInvoice.update({
      where: { id },
      data: updateData,
      include: {
        contract: true,
        customer: true,
      },
    });

    return invoice;
  }

  /**
   * Delete invoice
   */
  async delete(id: string, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    await prisma.cleaningInvoice.delete({
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
    const stats = await prisma.cleaningInvoice.aggregate({
      where: {
        customer_id: customerId,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      _sum: {
        total_amount: true,
      },
      _count: {
        id: true,
      },
    });

    const paidCount = await prisma.cleaningInvoice.count({
      where: {
        customer_id: customerId,
        status: 'PAID',
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    const overduCount = await prisma.cleaningInvoice.count({
      where: {
        customer_id: customerId,
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
      total_amount: stats._sum.total_amount || 0,
      paid_invoices: paidCount,
      overdue_invoices: overduCount,
    };
  }
}
