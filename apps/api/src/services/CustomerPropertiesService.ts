import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export interface CreateCustomerPropertyData {
  customer_id: string;
  property_name: string;
  address: string;
  postcode: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  access_instructions?: string;
  access_code?: string;
  cleaning_checklist_template_id?: string;
  guest_portal_enabled?: boolean;
}

export interface UpdateCustomerPropertyData {
  property_name?: string;
  address?: string;
  postcode?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  access_instructions?: string;
  access_code?: string;
  cleaning_checklist_template_id?: string;
  guest_portal_enabled?: boolean;
  is_active?: boolean;
}

export class CustomerPropertiesService {
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
   * List all customer properties for a service provider
   */
  async list(serviceProviderId: string, page: number = 1, limit: number = 20, search?: string, customerId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {
      customer: {
        service_provider_id: serviceProviderId,
      },
      is_active: true,
      ...(search && {
        OR: [
          { property_name: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
          { postcode: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    if (customerId) {
      where.customer_id = customerId;
    }

    const [properties, total] = await Promise.all([
      prisma.customerProperty.findMany({
        where,
        skip,
        take: limit,
        orderBy: { property_name: 'asc' },
        include: {
          customer: {
            select: {
              id: true,
              business_name: true,
              contact_name: true,
              customer_type: true,
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
      }),
      prisma.customerProperty.count({ where }),
    ]);

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific customer property
   */
  async getById(id: string, serviceProviderId: string) {

    const property = await prisma.customerProperty.findFirst({
      where: {
        id,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            business_name: true,
            contact_name: true,
            email: true,
            phone: true,
            customer_type: true,
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
    });

    if (!property) {
      throw new NotFoundError('Customer property not found');
    }

    return property;
  }

  /**
   * Create a new customer property
   */
  async create(data: CreateCustomerPropertyData, serviceProviderId: string) {

    // Verify customer belongs to this service provider
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customer_id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found or does not belong to your service provider');
    }

    const property = await prisma.customerProperty.create({
      data,
      include: {
        customer: {
          select: {
            id: true,
            business_name: true,
            contact_name: true,
          },
        },
      },
    });

    return property;
  }

  /**
   * Update a customer property
   */
  async update(id: string, data: UpdateCustomerPropertyData, serviceProviderId: string) {

    // Verify property exists and belongs to this service provider
    const existing = await prisma.customerProperty.findFirst({
      where: {
        id,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Customer property not found');
    }

    const property = await prisma.customerProperty.update({
      where: { id },
      data,
      include: {
        customer: {
          select: {
            id: true,
            business_name: true,
            contact_name: true,
          },
        },
      },
    });

    return property;
  }

  /**
   * Delete a customer property (soft delete)
   */
  async delete(id: string, serviceProviderId: string) {

    // Verify property exists and belongs to this service provider
    const existing = await prisma.customerProperty.findFirst({
      where: {
        id,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Customer property not found');
    }

    // Soft delete by setting is_active to false
    await prisma.customerProperty.update({
      where: { id },
      data: { is_active: false },
    });
  }

  /**
   * Get checklist templates linked to a property
   */
  async getChecklistTemplates(propertyId: string) {
    const links = await prisma.propertyChecklistTemplate.findMany({
      where: {
        property_id: propertyId,
      },
      include: {
        checklist_template: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return links.map(link => link.checklist_template);
  }

  /**
   * Link a checklist template to a property
   */
  async linkChecklistTemplate(propertyId: string, checklistTemplateId: string) {
    // Check if link already exists
    const existing = await prisma.propertyChecklistTemplate.findUnique({
      where: {
        property_id_checklist_template_id: {
          property_id: propertyId,
          checklist_template_id: checklistTemplateId,
        },
      },
    });

    if (existing) {
      throw new Error('This checklist template is already linked to the property');
    }

    const link = await prisma.propertyChecklistTemplate.create({
      data: {
        property_id: propertyId,
        checklist_template_id: checklistTemplateId,
      },
      include: {
        checklist_template: true,
      },
    });

    return link;
  }

  /**
   * Unlink a checklist template from a property
   */
  async unlinkChecklistTemplate(propertyId: string, checklistTemplateId: string) {
    const deleted = await prisma.propertyChecklistTemplate.deleteMany({
      where: {
        property_id: propertyId,
        checklist_template_id: checklistTemplateId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundError('Checklist template link not found');
    }
  }
}
