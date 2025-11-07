import { prisma } from '@rightfit/database';

export interface CreateChecklistTemplateData {
  service_provider_id: string;
  customer_id?: string;
  template_name: string;
  property_type: string;
  sections: any; // JSON data
  estimated_duration_minutes: number;
  is_active?: boolean;
}

export interface UpdateChecklistTemplateData {
  template_name?: string;
  property_type?: string;
  sections?: any; // JSON data
  estimated_duration_minutes?: number;
  is_active?: boolean;
  customer_id?: string;
}

export class ChecklistTemplatesService {
  async list(serviceProviderId: string, filters: {
    property_type?: string;
    customer_id?: string;
    is_active?: boolean;
  } = {}) {
    const where: any = {
      service_provider_id: serviceProviderId,
    };

    if (filters.property_type) {
      where.property_type = filters.property_type;
    }

    if (filters.customer_id) {
      where.customer_id = filters.customer_id;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const templates = await prisma.checklistTemplate.findMany({
      where,
      orderBy: {
        template_name: 'asc',
      },
    });

    return templates;
  }

  async getById(id: string, serviceProviderId: string) {
    const template = await prisma.checklistTemplate.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!template) {
      throw new Error('Checklist template not found');
    }

    return template;
  }

  async create(data: CreateChecklistTemplateData) {
    // If customer_id is provided, verify it belongs to the service provider
    if (data.customer_id) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: data.customer_id,
          service_provider_id: data.service_provider_id,
        },
      });

      if (!customer) {
        throw new Error('Customer not found or does not belong to your service provider');
      }
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        service_provider_id: data.service_provider_id,
        customer_id: data.customer_id,
        template_name: data.template_name,
        property_type: data.property_type,
        sections: data.sections,
        estimated_duration_minutes: data.estimated_duration_minutes,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });

    return template;
  }

  async update(id: string, data: UpdateChecklistTemplateData, serviceProviderId: string) {
    // Verify template exists and belongs to this service provider
    const existing = await prisma.checklistTemplate.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!existing) {
      throw new Error('Checklist template not found');
    }

    // If updating customer_id, verify it belongs to the service provider
    if (data.customer_id !== undefined) {
      if (data.customer_id !== null) {
        const customer = await prisma.customer.findFirst({
          where: {
            id: data.customer_id,
            service_provider_id: serviceProviderId,
          },
        });

        if (!customer) {
          throw new Error('Customer not found or does not belong to your service provider');
        }
      }
    }

    const template = await prisma.checklistTemplate.update({
      where: { id },
      data: {
        template_name: data.template_name,
        property_type: data.property_type,
        sections: data.sections,
        estimated_duration_minutes: data.estimated_duration_minutes,
        is_active: data.is_active,
        customer_id: data.customer_id,
      },
    });

    return template;
  }

  async delete(id: string, serviceProviderId: string) {
    // Verify template exists and belongs to this service provider
    const existing = await prisma.checklistTemplate.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!existing) {
      throw new Error('Checklist template not found');
    }

    // Soft delete by setting is_active to false
    await prisma.checklistTemplate.update({
      where: { id },
      data: { is_active: false },
    });
  }
}
