import { prisma } from '@rightfit/database';

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
}
