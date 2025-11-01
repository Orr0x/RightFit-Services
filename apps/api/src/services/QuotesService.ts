import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export class QuotesService {
  async list(serviceProviderId: string, status?: string) {
    const quotes = await prisma.quote.findMany({
      where: {
        customer: {
          service_provider_id: serviceProviderId,
        },
        ...(status && { status: status as any }),
      },
      include: {
        customer: {
          select: {
            id: true,
            business_name: true,
            contact_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return quotes;
  }

  async getById(id: string, serviceProviderId: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      include: {
        customer: true,
        maintenance_jobs: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    return quote;
  }

  async create(data: any, _serviceProviderId: string) {
    // Generate quote number
    const count = await prisma.quote.count();
    const quoteNumber = `Q-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const quote = await prisma.quote.create({
      data: {
        ...data,
        quote_number: quoteNumber,
      },
      include: {
        customer: true,
      },
    });

    return quote;
  }

  async update(id: string, data: any, serviceProviderId: string) {
    await this.getById(id, serviceProviderId);

    const quote = await prisma.quote.update({
      where: { id },
      data,
      include: {
        customer: true,
      },
    });

    return quote;
  }

  async approve(id: string, approvedBy: string, _serviceProviderId?: string) {
    const quote = await prisma.quote.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved_at: new Date(),
        approved_by: approvedBy,
      },
    });

    return quote;
  }

  async decline(id: string, reason: string) {
    const quote = await prisma.quote.update({
      where: { id },
      data: {
        status: 'DECLINED',
        customer_response: reason,
      },
    });

    return quote;
  }
}
