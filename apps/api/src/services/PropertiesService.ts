import { prisma } from '@rightfit/database'
import { CreatePropertyInput, UpdatePropertyInput } from '@rightfit/shared'
import { NotFoundError, ValidationError } from '../utils/errors'

export class PropertiesService {
  async list(tenantId: string, page: number = 1, limit: number = 20, search?: string, includeShared: boolean = true) {
    const skip = (page - 1) * limit

    // Build where clause for owned properties
    const ownedWhere = {
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

    // Fetch owned properties
    const [ownedProperties, ownedTotal] = await Promise.all([
      prisma.property.findMany({
        where: ownedWhere,
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
      prisma.property.count({ where: ownedWhere }),
    ])

    // Mark owned properties
    const ownedWithFlag = ownedProperties.map(p => ({
      ...p,
      is_shared: false,
      share_permissions: null,
    }))

    if (!includeShared) {
      return {
        data: ownedWithFlag,
        pagination: {
          page,
          limit,
          total: ownedTotal,
          totalPages: Math.ceil(ownedTotal / limit),
        },
      }
    }

    // Fetch shared properties
    const sharedWhere = {
      shared_with_tenant_id: tenantId,
      is_active: true,
      ...(search && {
        property: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { address_line1: { contains: search, mode: 'insensitive' as const } },
            { postcode: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      }),
    }

    const sharedPropertyShares = await prisma.propertyShare.findMany({
      where: sharedWhere,
      include: {
        property: {
          include: {
            _count: {
              select: {
                work_orders: true,
              },
            },
          },
        },
        owner_tenant: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
      },
      orderBy: {
        shared_at: 'desc',
      },
    })

    // Extract properties from shares and add share info
    const sharedWithFlag = sharedPropertyShares.map(share => ({
      ...share.property,
      is_shared: true,
      share_permissions: {
        can_view: share.can_view,
        can_edit: share.can_edit,
        can_view_financial: share.can_view_financial,
        can_view_certificates: share.can_view_certificates,
        can_create_jobs: share.can_create_jobs,
        can_view_tenants: share.can_view_tenants,
      },
      shared_by: share.owner_tenant,
    }))

    // Combine owned and shared properties
    const allProperties = [...ownedWithFlag, ...sharedWithFlag]
    const total = ownedTotal + sharedWithFlag.length

    return {
      data: allProperties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getById(id: string, tenantId: string) {
    // First, check if it's an owned property
    const ownedProperty = await prisma.property.findFirst({
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

    if (ownedProperty) {
      return {
        ...ownedProperty,
        is_shared: false,
        share_permissions: null,
      }
    }

    // If not owned, check if it's shared with this tenant
    const sharedProperty = await prisma.propertyShare.findFirst({
      where: {
        property_id: id,
        shared_with_tenant_id: tenantId,
        is_active: true,
      },
      include: {
        property: {
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
        },
        owner_tenant: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
      },
    })

    if (sharedProperty) {
      return {
        ...sharedProperty.property,
        is_shared: true,
        share_permissions: {
          can_view: sharedProperty.can_view,
          can_edit: sharedProperty.can_edit,
          can_view_financial: sharedProperty.can_view_financial,
          can_view_certificates: sharedProperty.can_view_certificates,
          can_create_jobs: sharedProperty.can_create_jobs,
          can_view_tenants: sharedProperty.can_view_tenants,
        },
        shared_by: sharedProperty.owner_tenant,
      }
    }

    throw new NotFoundError('Property not found')
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
