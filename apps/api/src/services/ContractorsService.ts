import { PrismaClient, Contractor } from '@rightfit/database'

const prisma = new PrismaClient()

export interface CreateContractorDTO {
  name: string
  trade: string
  company_name?: string
  phone: string
  email?: string
  notes?: string
  sms_opt_out?: boolean
  user_id?: string
}

export interface UpdateContractorDTO {
  name?: string
  trade?: string
  company_name?: string
  phone?: string
  email?: string
  notes?: string
  sms_opt_out?: boolean
}

export interface ContractorFilters {
  trade?: string
  search?: string
}

class ContractorsService {
  async create(tenantId: string, data: CreateContractorDTO): Promise<Contractor> {
    // If user_id provided, verify it belongs to tenant
    if (data.user_id) {
      const user = await prisma.user.findFirst({
        where: {
          id: data.user_id,
          tenant_id: tenantId,
          role: 'CONTRACTOR',
          deleted_at: null,
        },
      })

      if (!user) {
        throw new Error('User not found or not a contractor')
      }
    }

    return await prisma.contractor.create({
      data: {
        tenant_id: tenantId,
        name: data.name,
        trade: data.trade,
        company_name: data.company_name,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
        sms_opt_out: data.sms_opt_out || false,
        user_id: data.user_id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    })
  }

  async list(
    tenantId: string,
    filters: ContractorFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    }

    if (filters.trade) {
      where.trade = {
        contains: filters.trade,
        mode: 'insensitive',
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { company_name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [contractors, total] = await Promise.all([
      prisma.contractor.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
          work_orders: {
            where: {
              deleted_at: null,
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.contractor.count({ where }),
    ])

    return {
      data: contractors,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }
  }

  async getById(tenantId: string, contractorId: string): Promise<Contractor | null> {
    return await prisma.contractor.findFirst({
      where: {
        id: contractorId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        work_orders: {
          where: {
            deleted_at: null,
          },
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address_line1: true,
                city: true,
                postcode: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    })
  }

  async update(
    tenantId: string,
    contractorId: string,
    data: UpdateContractorDTO
  ): Promise<Contractor> {
    const contractor = await prisma.contractor.findFirst({
      where: {
        id: contractorId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!contractor) {
      throw new Error('Contractor not found')
    }

    return await prisma.contractor.update({
      where: { id: contractorId },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    })
  }

  async delete(tenantId: string, contractorId: string): Promise<void> {
    const contractor = await prisma.contractor.findFirst({
      where: {
        id: contractorId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!contractor) {
      throw new Error('Contractor not found')
    }

    // Check if contractor has active work orders
    const activeWorkOrders = await prisma.workOrder.count({
      where: {
        contractor_id: contractorId,
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
        deleted_at: null,
      },
    })

    if (activeWorkOrders > 0) {
      throw new Error('Cannot delete contractor with active work orders')
    }

    await prisma.contractor.update({
      where: { id: contractorId },
      data: { deleted_at: new Date() },
    })
  }

  async getByTrade(tenantId: string, trade: string): Promise<Contractor[]> {
    return await prisma.contractor.findMany({
      where: {
        tenant_id: tenantId,
        trade: {
          contains: trade,
          mode: 'insensitive',
        },
        deleted_at: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }
}

export default new ContractorsService()
