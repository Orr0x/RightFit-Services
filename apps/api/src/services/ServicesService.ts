import { prisma } from '@rightfit/database';

export class ServicesService {
  async list(serviceProviderId: string, filters: {
    service_type?: string;
    is_active?: boolean;
  } = {}) {
    const where: any = {
      service_provider_id: serviceProviderId,
    };

    if (filters.service_type) {
      where.service_type = filters.service_type;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return services;
  }

  async getById(id: string, serviceProviderId: string) {
    const service = await prisma.service.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    return service;
  }
}
