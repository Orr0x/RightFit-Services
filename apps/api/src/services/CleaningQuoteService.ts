import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export class CleaningQuoteService {
  /**
   * List quotes with filters
   */
  async list(
    serviceProviderId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string
      customer_id?: string
      property_id?: string
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
    if (filters?.property_id) {
      where.property_id = filters.property_id;
    }

    const [quotes, total] = await Promise.all([
      prisma.cleaningQuote.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { quote_date: 'desc' },
        ],
        include: {
          customer: {
            select: {
              id: true,
              business_name: true,
              contact_name: true,
              email: true,
              phone: true,
            },
          },
          property: {
            select: {
              id: true,
              property_name: true,
              address: true,
              postcode: true,
            },
          },
        },
      }),
      prisma.cleaningQuote.count({ where }),
    ]);

    return {
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get quote by ID
   */
  async getById(id: string, serviceProviderId: string) {
    const quote = await prisma.cleaningQuote.findFirst({
      where: {
        id,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        customer: true,
        property: true,
      },
    });

    if (!quote) {
      throw new NotFoundError('Cleaning quote not found');
    }

    return quote;
  }

  /**
   * Create a new quote
   */
  async create(
    data: {
      customer_id: string
      property_id?: string
      cleaning_job_id?: string
      quote_date: Date
      valid_until_date: Date
      line_items: any[]
      subtotal: number
      discount_percentage?: number
      discount_amount?: number
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

    // Generate quote number
    const quoteNumber = await this.generateQuoteNumber();

    // Calculate total
    const discountPercentage = data.discount_percentage || 0;
    const discountAmount = data.discount_amount || (data.subtotal * discountPercentage) / 100;
    const total = data.subtotal - discountAmount;

    const quote = await prisma.cleaningQuote.create({
      data: {
        customer_id: data.customer_id,
        property_id: data.property_id,
        cleaning_job_id: data.cleaning_job_id,
        quote_number: quoteNumber,
        quote_date: data.quote_date,
        valid_until_date: data.valid_until_date,
        line_items: data.line_items,
        subtotal: data.subtotal,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        total,
        status: 'DRAFT',
        notes: data.notes,
      },
      include: {
        customer: true,
        property: true,
      },
    });

    return quote;
  }

  /**
   * Update quote
   */
  async update(
    id: string,
    data: {
      line_items?: any[]
      subtotal?: number
      discount_percentage?: number
      discount_amount?: number
      notes?: string
      status?: string
    },
    serviceProviderId: string
  ) {
    await this.getById(id, serviceProviderId);

    // Recalculate total if subtotal or discount changed
    let updateData: any = { ...data };

    if (data.subtotal !== undefined || data.discount_percentage !== undefined || data.discount_amount !== undefined) {
      const quote = await this.getById(id, serviceProviderId);
      const subtotal = data.subtotal !== undefined ? data.subtotal : Number(quote.subtotal);
      const discountPercentage = data.discount_percentage !== undefined ? data.discount_percentage : Number(quote.discount_percentage);
      const discountAmount = data.discount_amount !== undefined ? data.discount_amount : (subtotal * discountPercentage) / 100;
      const total = subtotal - discountAmount;

      updateData = {
        ...updateData,
        discount_amount: discountAmount,
        total,
      };
    }

    const quote = await prisma.cleaningQuote.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        property: true,
      },
    });

    return quote;
  }

  /**
   * Approve quote
   */
  async approve(id: string, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    const quote = await prisma.cleaningQuote.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved_at: new Date(),
        customer_response: 'Approved',
      },
      include: {
        customer: true,
        property: true,
      },
    });

    return quote;
  }

  /**
   * Decline quote
   */
  async decline(id: string, reason: string, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    const quote = await prisma.cleaningQuote.update({
      where: { id },
      data: {
        status: 'DECLINED',
        customer_response: reason,
      },
      include: {
        customer: true,
        property: true,
      },
    });

    return quote;
  }

  /**
   * Send quote to customer (mark as SENT)
   */
  async send(id: string, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    const quote = await prisma.cleaningQuote.update({
      where: { id },
      data: {
        status: 'SENT',
      },
      include: {
        customer: true,
        property: true,
      },
    });

    return quote;
  }

  /**
   * Delete quote
   */
  async delete(id: string, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    await prisma.cleaningQuote.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Generate unique quote number
   */
  async generateQuoteNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Get count of cleaning quotes this month
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0);

    const count = await prisma.cleaningQuote.count({
      where: {
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Format: CQ-YYYYMM-XXXX (CQ for Cleaning Quote)
    const quoteNumber = `CQ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    return quoteNumber;
  }

  /**
   * Get customer quote stats
   */
  async getCustomerStats(customerId: string, serviceProviderId: string) {
    const stats = await prisma.cleaningQuote.aggregate({
      where: {
        customer_id: customerId,
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

    const approvedCount = await prisma.cleaningQuote.count({
      where: {
        customer_id: customerId,
        status: 'APPROVED',
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    const pendingCount = await prisma.cleaningQuote.count({
      where: {
        customer_id: customerId,
        status: 'SENT',
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    const declinedCount = await prisma.cleaningQuote.count({
      where: {
        customer_id: customerId,
        status: 'DECLINED',
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    return {
      total_quotes: stats._count.id,
      total_value: stats._sum.total || 0,
      approved_quotes: approvedCount,
      pending_quotes: pendingCount,
      declined_quotes: declinedCount,
    };
  }
}
