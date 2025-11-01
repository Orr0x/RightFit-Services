import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export class WorkersService {
  async list(serviceProviderId: string) {
    const workers = await prisma.worker.findMany({
      where: {
        service_provider_id: serviceProviderId,
        is_active: true,
      },
      orderBy: { first_name: 'asc' },
    });

    return workers;
  }

  async getById(id: string, serviceProviderId: string) {
    const worker = await prisma.worker.findFirst({
      where: {
        id,
        service_provider_id: serviceProviderId,
      },
      include: {
        _count: {
          select: {
            cleaning_jobs: true,
            maintenance_jobs: true,
          },
        },
      },
    });

    if (!worker) {
      throw new NotFoundError('Worker not found');
    }

    return worker;
  }

  async create(data: any, serviceProviderId: string) {
    const worker = await prisma.worker.create({
      data: {
        ...data,
        service_provider_id: serviceProviderId,
      },
    });

    return worker;
  }

  async update(id: string, data: any, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    const worker = await prisma.worker.update({
      where: { id },
      data,
    });

    return worker;
  }
}
