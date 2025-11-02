import { PrismaClient, ShareType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePropertyShareData {
  property_id: string;
  shared_with_tenant_id: string;
  share_type: ShareType;
  can_view?: boolean;
  can_edit?: boolean;
  can_view_financial?: boolean;
  can_view_certificates?: boolean;
  can_create_jobs?: boolean;
  can_view_tenants?: boolean;
  notes?: string;
}

export interface UpdatePropertyShareData {
  can_view?: boolean;
  can_edit?: boolean;
  can_view_financial?: boolean;
  can_view_certificates?: boolean;
  can_create_jobs?: boolean;
  can_view_tenants?: boolean;
  is_active?: boolean;
  notes?: string;
}

export class PropertySharesService {
  /**
   * List all property shares (both given and received) for a tenant
   */
  async list(tenantId: string, filters?: { type?: 'given' | 'received' | 'all' }) {
    const type = filters?.type || 'all';

    const where: any = {
      is_active: true,
    };

    if (type === 'given') {
      where.owner_tenant_id = tenantId;
    } else if (type === 'received') {
      where.shared_with_tenant_id = tenantId;
    } else {
      where.OR = [
        { owner_tenant_id: tenantId },
        { shared_with_tenant_id: tenantId },
      ];
    }

    const shares = await prisma.propertyShare.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address_line1: true,
            city: true,
            postcode: true,
            property_type: true,
          },
        },
        owner_tenant: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
      },
      orderBy: {
        shared_at: 'desc',
      },
    });

    return shares;
  }

  /**
   * Get a specific property share
   */
  async getById(id: string, tenantId: string) {
    const share = await prisma.propertyShare.findFirst({
      where: {
        id,
        OR: [
          { owner_tenant_id: tenantId },
          { shared_with_tenant_id: tenantId },
        ],
      },
      include: {
        property: true,
        owner_tenant: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
      },
    });

    if (!share) {
      throw new Error('Property share not found');
    }

    return share;
  }

  /**
   * Create a new property share
   */
  async create(data: CreatePropertyShareData, ownerTenantId: string) {
    // Verify the property belongs to the owner tenant
    const property = await prisma.property.findFirst({
      where: {
        id: data.property_id,
        tenant_id: ownerTenantId,
        deleted_at: null,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to share it');
    }

    // Check if share already exists
    const existingShare = await prisma.propertyShare.findUnique({
      where: {
        property_id_shared_with_tenant_id: {
          property_id: data.property_id,
          shared_with_tenant_id: data.shared_with_tenant_id,
        },
      },
    });

    if (existingShare && existingShare.is_active) {
      throw new Error('This property is already shared with this tenant');
    }

    // If exists but inactive, reactivate it
    if (existingShare && !existingShare.is_active) {
      return await prisma.propertyShare.update({
        where: { id: existingShare.id },
        data: {
          is_active: true,
          revoked_at: null,
          ...data,
        },
        include: {
          property: true,
          owner_tenant: {
            select: {
              id: true,
              tenant_name: true,
            },
          },
          recipient: {
            select: {
              id: true,
              tenant_name: true,
            },
          },
        },
      });
    }

    // Create new share
    const share = await prisma.propertyShare.create({
      data: {
        ...data,
        owner_tenant_id: ownerTenantId,
      },
      include: {
        property: true,
        owner_tenant: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
      },
    });

    return share;
  }

  /**
   * Update property share permissions
   */
  async update(id: string, data: UpdatePropertyShareData, tenantId: string) {
    // Verify the share belongs to this tenant (only owner can update)
    const share = await prisma.propertyShare.findFirst({
      where: {
        id,
        owner_tenant_id: tenantId,
      },
    });

    if (!share) {
      throw new Error('Property share not found or you do not have permission to update it');
    }

    const updated = await prisma.propertyShare.update({
      where: { id },
      data,
      include: {
        property: true,
        owner_tenant: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Revoke a property share (soft delete)
   */
  async revoke(id: string, tenantId: string) {
    // Verify the share belongs to this tenant (only owner can revoke)
    const share = await prisma.propertyShare.findFirst({
      where: {
        id,
        owner_tenant_id: tenantId,
      },
    });

    if (!share) {
      throw new Error('Property share not found or you do not have permission to revoke it');
    }

    await prisma.propertyShare.update({
      where: { id },
      data: {
        is_active: false,
        revoked_at: new Date(),
      },
    });
  }

  /**
   * Get all shares for a specific property
   */
  async getSharesForProperty(propertyId: string, tenantId: string) {
    // Verify the property belongs to this tenant
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to view it');
    }

    const shares = await prisma.propertyShare.findMany({
      where: {
        property_id: propertyId,
        is_active: true,
      },
      include: {
        recipient: {
          select: {
            id: true,
            tenant_name: true,
          },
        },
      },
      orderBy: {
        shared_at: 'desc',
      },
    });

    return shares;
  }

  /**
   * Check if a tenant has access to a property (either owns it or it's shared with them)
   */
  async checkAccess(propertyId: string, tenantId: string) {
    // Check if they own it
    const ownedProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (ownedProperty) {
      return {
        hasAccess: true,
        isOwner: true,
        permissions: {
          can_view: true,
          can_edit: true,
          can_view_financial: true,
          can_view_certificates: true,
          can_create_jobs: true,
          can_view_tenants: true,
        },
      };
    }

    // Check if it's shared with them
    const sharedProperty = await prisma.propertyShare.findFirst({
      where: {
        property_id: propertyId,
        shared_with_tenant_id: tenantId,
        is_active: true,
      },
    });

    if (sharedProperty) {
      return {
        hasAccess: true,
        isOwner: false,
        permissions: {
          can_view: sharedProperty.can_view,
          can_edit: sharedProperty.can_edit,
          can_view_financial: sharedProperty.can_view_financial,
          can_view_certificates: sharedProperty.can_view_certificates,
          can_create_jobs: sharedProperty.can_create_jobs,
          can_view_tenants: sharedProperty.can_view_tenants,
        },
      };
    }

    return {
      hasAccess: false,
      isOwner: false,
      permissions: null,
    };
  }
}
