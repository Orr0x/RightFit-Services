import { prisma, CustomerType, PaymentTerms } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export interface CreateCustomerData {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address?: string;
  customer_type: CustomerType;
  has_cleaning_contract?: boolean;
  has_maintenance_contract?: boolean;
  bundled_discount_percentage?: number;
  payment_terms?: PaymentTerms;
}

export interface UpdateCustomerData {
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  customer_type?: CustomerType;
  has_cleaning_contract?: boolean;
  has_maintenance_contract?: boolean;
  bundled_discount_percentage?: number;
  payment_terms?: PaymentTerms;
  payment_reliability_score?: number;
  satisfaction_score?: number;
  cross_sell_potential?: string;
}

export class CustomersService {
  /**
   * Get service provider ID from tenant ID
   */
  private async getServiceProviderId(tenantId: string): Promise<string> {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: tenantId },
      select: { id: true },
    });

    if (!serviceProvider) {
      throw new NotFoundError('Service provider not found for this tenant');
    }

    return serviceProvider.id;
  }

  /**
   * List all customers for a service provider
   */
  async list(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
    const serviceProviderId = await this.getServiceProviderId(tenantId);
    const skip = (page - 1) * limit;

    const where = {
      service_provider_id: serviceProviderId,
      ...(search && {
        OR: [
          { business_name: { contains: search, mode: 'insensitive' as const } },
          { contact_name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { business_name: 'asc' },
        include: {
          _count: {
            select: {
              customer_properties: true,
              cleaning_jobs: true,
              maintenance_jobs: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific customer
   */
  async getById(id: string, tenantId: string) {
    const serviceProviderId = await this.getServiceProviderId(tenantId);

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
      include: {
        customer_properties: {
          where: {
            is_active: true,
          },
          orderBy: { property_name: 'asc' },
        },
        _count: {
          select: {
            cleaning_jobs: true,
            maintenance_jobs: true,
            quotes: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerData, tenantId: string) {
    const serviceProviderId = await this.getServiceProviderId(tenantId);

    const customer = await prisma.customer.create({
      data: {
        ...data,
        service_provider_id: serviceProviderId,
      },
    });

    return customer;
  }

  /**
   * Update a customer
   */
  async update(id: string, data: UpdateCustomerData, tenantId: string) {
    const serviceProviderId = await this.getServiceProviderId(tenantId);

    // Verify customer exists and belongs to this service provider
    const existing = await prisma.customer.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    return customer;
  }

  /**
   * Delete a customer (soft delete by setting properties to inactive)
   */
  async delete(id: string, tenantId: string) {
    const serviceProviderId = await this.getServiceProviderId(tenantId);

    // Verify customer exists and belongs to this service provider
    const existing = await prisma.customer.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    // Set all customer properties to inactive
    await prisma.customerProperty.updateMany({
      where: { customer_id: id },
      data: { is_active: false },
    });

    // Delete the customer
    await prisma.customer.delete({
      where: { id },
    });
  }
}
