import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export class WorkersService {
  async list(
    serviceProviderId: string,
    filters?: {
      worker_type?: string;
      employment_type?: string;
      is_active?: boolean;
    }
  ) {
    const where: any = {
      service_provider_id: serviceProviderId,
    };

    if (filters?.is_active !== undefined) {
      where.is_active = filters.is_active;
    } else {
      where.is_active = true; // Default to active workers
    }

    if (filters?.worker_type) {
      // Support filtering for specific type or BOTH
      where.worker_type = { in: [filters.worker_type, 'BOTH'] };
    }

    if (filters?.employment_type) {
      where.employment_type = filters.employment_type;
    }

    const workers = await prisma.worker.findMany({
      where,
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
