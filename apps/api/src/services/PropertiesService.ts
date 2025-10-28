import { prisma } from '@rightfit/database'
import { CreatePropertyInput, UpdatePropertyInput } from '@rightfit/shared'
import { NotFoundError, ValidationError } from '../utils/errors'

export class PropertiesService {
  async list(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit

    const where = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { address_line1: { contains: search, mode: 'insensitive' as const } },
          { postcode: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              work_orders: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ])

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getById(id: string, tenantId: string) {
    const property = await prisma.property.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        _count: {
          select: {
            work_orders: {
              where: {
                deleted_at: null,
              },
            },
            certificates: {
              where: {
                deleted_at: null,
              },
            },
            photos: true,
          },
        },
      },
    })

    if (!property) {
      throw new NotFoundError('Property not found')
    }

    return property
  }

  async create(input: CreatePropertyInput, tenantId: string, userId: string) {
    const property = await prisma.property.create({
      data: {
        ...input,
        tenant_id: tenantId,
        owner_user_id: userId,
      },
    })

    return property
  }

  async update(id: string, input: UpdatePropertyInput, tenantId: string) {
    // Verify property exists and belongs to tenant
    const existing = await prisma.property.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!existing) {
      throw new NotFoundError('Property not found')
    }

    const property = await prisma.property.update({
      where: { id },
      data: input,
    })

    return property
  }

  async delete(id: string, tenantId: string) {
    // Verify property exists and belongs to tenant
    const existing = await prisma.property.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!existing) {
      throw new NotFoundError('Property not found')
    }

    // Check for active work orders
    const activeWorkOrdersCount = await prisma.workOrder.count({
      where: {
        property_id: id,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        deleted_at: null,
      },
    })

    if (activeWorkOrdersCount > 0) {
      throw new ValidationError(
        `Cannot delete property with ${activeWorkOrdersCount} active work order(s). Please complete or cancel them first.`
      )
    }

    // Soft delete
    const property = await prisma.property.update({
      where: { id },
      data: { deleted_at: new Date() },
    })

    return property
  }
}
