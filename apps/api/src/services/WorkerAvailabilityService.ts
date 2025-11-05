import { prisma } from '@rightfit/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class WorkerAvailabilityService {
  async list(workerId: string, filters?: {
    status?: 'BLOCKED' | 'AVAILABLE';
    from_date?: Date;
    to_date?: Date;
  }) {
    const where: any = {
      worker_id: workerId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.from_date || filters?.to_date) {
      where.OR = [];

      if (filters.from_date && filters.to_date) {
        // Find availability records that overlap with the date range
        where.OR.push({
          AND: [
            { start_date: { lte: filters.to_date } },
            { end_date: { gte: filters.from_date } },
          ],
        });
      } else if (filters.from_date) {
        where.end_date = { gte: filters.from_date };
      } else if (filters.to_date) {
        where.start_date = { lte: filters.to_date };
      }
    }

    const availability = await prisma.workerAvailability.findMany({
      where,
      orderBy: { start_date: 'asc' },
    });

    return availability;
  }

  async getById(id: string, workerId: string) {
    const availability = await prisma.workerAvailability.findFirst({
      where: {
        id,
        worker_id: workerId,
      },
    });

    if (!availability) {
      throw new NotFoundError('Availability record not found');
    }

    return availability;
  }

  async create(data: {
    worker_id: string;
    start_date: Date;
    end_date: Date;
    reason?: string;
    status: 'BLOCKED' | 'AVAILABLE';
  }) {
    // Validation
    if (data.start_date >= data.end_date) {
      throw new ValidationError('End date must be after start date');
    }

    // Check for overlapping availability records
    const overlapping = await prisma.workerAvailability.findFirst({
      where: {
        worker_id: data.worker_id,
        status: data.status,
        OR: [
          {
            AND: [
              { start_date: { lte: data.end_date } },
              { end_date: { gte: data.start_date } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new ValidationError('Availability record overlaps with existing record');
    }

    const availability = await prisma.workerAvailability.create({
      data: {
        worker_id: data.worker_id,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason || null,
        status: data.status,
      },
    });

    return availability;
  }

  async update(
    id: string,
    workerId: string,
    data: {
      start_date?: Date;
      end_date?: Date;
      reason?: string;
      status?: 'BLOCKED' | 'AVAILABLE';
    }
  ) {
    // Verify exists
    await this.getById(id, workerId);

    // If updating dates, validate
    if (data.start_date || data.end_date) {
      const existing = await this.getById(id, workerId);
      const newStartDate = data.start_date || existing.start_date;
      const newEndDate = data.end_date || existing.end_date;

      if (newStartDate >= newEndDate) {
        throw new ValidationError('End date must be after start date');
      }

      // Check for overlapping (excluding current record)
      const overlapping = await prisma.workerAvailability.findFirst({
        where: {
          worker_id: workerId,
          id: { not: id },
          status: data.status || existing.status,
          OR: [
            {
              AND: [
                { start_date: { lte: newEndDate } },
                { end_date: { gte: newStartDate } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        throw new ValidationError('Availability record overlaps with existing record');
      }
    }

    const availability = await prisma.workerAvailability.update({
      where: { id },
      data,
    });

    return availability;
  }

  async delete(id: string, workerId: string) {
    // Verify exists
    await this.getById(id, workerId);

    await prisma.workerAvailability.delete({
      where: { id },
    });
  }

  async isWorkerAvailable(workerId: string, date: Date): Promise<boolean> {
    // Check if there's a BLOCKED status for this date
    const blocked = await prisma.workerAvailability.findFirst({
      where: {
        worker_id: workerId,
        status: 'BLOCKED',
        start_date: { lte: date },
        end_date: { gte: date },
      },
    });

    return !blocked;
  }

  async getBlockedDates(workerId: string, startDate: Date, endDate: Date): Promise<Date[]> {
    const blockedRecords = await prisma.workerAvailability.findMany({
      where: {
        worker_id: workerId,
        status: 'BLOCKED',
        OR: [
          {
            AND: [
              { start_date: { lte: endDate } },
              { end_date: { gte: startDate } },
            ],
          },
        ],
      },
    });

    // Generate array of all blocked dates
    const blockedDates: Date[] = [];
    for (const record of blockedRecords) {
      const current = new Date(record.start_date);
      const end = new Date(record.end_date);

      while (current <= end) {
        if (current >= startDate && current <= endDate) {
          blockedDates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return blockedDates;
  }
}
