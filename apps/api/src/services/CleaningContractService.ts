import { PrismaClient, ContractStatus, ContractType } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateContractDTO {
  customer_id: string
  service_provider_id: string
  contract_type: ContractType
  contract_start_date: Date
  contract_end_date?: Date
  monthly_fee: number
  billing_day: number // 1-31
  property_ids?: string[] // Properties to link to contract
  property_fees?: Record<string, number> // For PER_PROPERTY pricing
  notes?: string
}

export interface UpdateContractDTO {
  contract_type?: ContractType
  contract_end_date?: Date
  monthly_fee?: number
  billing_day?: number
  status?: ContractStatus
  notes?: string
}

export interface LinkPropertyDTO {
  property_id: string
  property_monthly_fee?: number // Required for PER_PROPERTY contracts
}

class CleaningContractService {
  /**
   * Create a new cleaning contract
   */
  async createContract(data: CreateContractDTO) {
    const { property_ids, property_fees, ...contractData } = data

    // Validate billing day
    if (data.billing_day < 1 || data.billing_day > 31) {
      throw new Error('Billing day must be between 1 and 31')
    }

    // Validate contract type vs pricing
    if (data.contract_type === 'PER_PROPERTY' && !property_fees) {
      throw new Error('PER_PROPERTY contracts require property_fees')
    }

    const contract = await prisma.cleaningContract.create({
      data: {
        ...contractData,
        contract_start_date: new Date(data.contract_start_date),
        contract_end_date: data.contract_end_date ? new Date(data.contract_end_date) : null,
      },
      include: {
        customer: true,
        property_contracts: {
          include: {
            property: true,
          },
        },
      },
    })

    // Link properties if provided
    if (property_ids && property_ids.length > 0) {
      for (const property_id of property_ids) {
        await this.linkProperty(contract.id, {
          property_id,
          property_monthly_fee:
            data.contract_type === 'PER_PROPERTY' ? property_fees?.[property_id] : undefined,
        })
      }
    }

    return this.getContractById(contract.id)
  }

  /**
   * Get contract by ID with all relations
   */
  async getContractById(contract_id: string) {
    const contract = await prisma.cleaningContract.findUnique({
      where: { id: contract_id },
      include: {
        customer: true,
        property_contracts: {
          where: { is_active: true },
          include: {
            property: true,
          },
        },
        cleaning_jobs: {
          take: 10,
          orderBy: { scheduled_date: 'desc' },
          include: {
            property: true,
            assigned_worker: true,
          },
        },
        invoices: {
          take: 12,
          orderBy: { billing_period_start: 'desc' },
        },
      },
    })

    if (!contract) {
      throw new Error('Contract not found')
    }

    return contract
  }

  /**
   * List all contracts for a customer
   */
  async listContractsByCustomer(customer_id: string, status?: ContractStatus) {
    const contracts = await prisma.cleaningContract.findMany({
      where: {
        customer_id,
        ...(status && { status }),
      },
      include: {
        property_contracts: {
          where: { is_active: true },
          include: {
            property: true,
          },
        },
        _count: {
          select: {
            cleaning_jobs: true,
            invoices: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return contracts
  }

  /**
   * List all contracts for a service provider
   */
  async listContractsByProvider(service_provider_id: string, status?: ContractStatus) {
    const contracts = await prisma.cleaningContract.findMany({
      where: {
        service_provider_id,
        ...(status && { status }),
      },
      include: {
        customer: true,
        property_contracts: {
          where: { is_active: true },
          include: {
            property: true,
          },
        },
        _count: {
          select: {
            cleaning_jobs: true,
            invoices: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return contracts
  }

  /**
   * Update contract
   */
  async updateContract(contract_id: string, data: UpdateContractDTO) {
    // Validate billing day if provided
    if (data.billing_day && (data.billing_day < 1 || data.billing_day > 31)) {
      throw new Error('Billing day must be between 1 and 31')
    }

    const contract = await prisma.cleaningContract.update({
      where: { id: contract_id },
      data: {
        ...data,
        contract_end_date: data.contract_end_date ? new Date(data.contract_end_date) : undefined,
      },
      include: {
        customer: true,
        property_contracts: {
          where: { is_active: true },
          include: {
            property: true,
          },
        },
      },
    })

    return contract
  }

  /**
   * Pause contract (set status to PAUSED)
   */
  async pauseContract(contract_id: string) {
    return this.updateContract(contract_id, { status: 'PAUSED' })
  }

  /**
   * Resume contract (set status to ACTIVE)
   */
  async resumeContract(contract_id: string) {
    return this.updateContract(contract_id, { status: 'ACTIVE' })
  }

  /**
   * Cancel contract (set status to CANCELLED)
   */
  async cancelContract(contract_id: string) {
    return this.updateContract(contract_id, { status: 'CANCELLED' })
  }

  /**
   * Link property to contract
   */
  async linkProperty(contract_id: string, data: LinkPropertyDTO) {
    // Get contract to check type
    const contract = await prisma.cleaningContract.findUnique({
      where: { id: contract_id },
    })

    if (!contract) {
      throw new Error('Contract not found')
    }

    // Validate property fee for PER_PROPERTY contracts
    if (contract.contract_type === 'PER_PROPERTY' && !data.property_monthly_fee) {
      throw new Error('property_monthly_fee is required for PER_PROPERTY contracts')
    }

    // Check if property is already linked
    const existing = await prisma.contractProperty.findFirst({
      where: {
        contract_id,
        property_id: data.property_id,
        is_active: true,
      },
    })

    if (existing) {
      throw new Error('Property is already linked to this contract')
    }

    const contractProperty = await prisma.contractProperty.create({
      data: {
        contract_id,
        property_id: data.property_id,
        property_monthly_fee: data.property_monthly_fee,
      },
      include: {
        property: true,
      },
    })

    return contractProperty
  }

  /**
   * Unlink property from contract (soft delete - set is_active to false)
   */
  async unlinkProperty(contract_id: string, property_id: string) {
    const contractProperty = await prisma.contractProperty.findFirst({
      where: {
        contract_id,
        property_id,
        is_active: true,
      },
    })

    if (!contractProperty) {
      throw new Error('Property is not linked to this contract')
    }

    const updated = await prisma.contractProperty.update({
      where: { id: contractProperty.id },
      data: { is_active: false },
    })

    return updated
  }

  /**
   * Update property fee (for PER_PROPERTY contracts)
   */
  async updatePropertyFee(contract_id: string, property_id: string, new_fee: number) {
    const contract = await prisma.cleaningContract.findUnique({
      where: { id: contract_id },
    })

    if (!contract) {
      throw new Error('Contract not found')
    }

    if (contract.contract_type !== 'PER_PROPERTY') {
      throw new Error('Can only update property fees for PER_PROPERTY contracts')
    }

    const contractProperty = await prisma.contractProperty.findFirst({
      where: {
        contract_id,
        property_id,
        is_active: true,
      },
    })

    if (!contractProperty) {
      throw new Error('Property is not linked to this contract')
    }

    const updated = await prisma.contractProperty.update({
      where: { id: contractProperty.id },
      data: { property_monthly_fee: new_fee },
      include: {
        property: true,
      },
    })

    return updated
  }

  /**
   * Get all properties for a contract
   */
  async getContractProperties(contract_id: string) {
    const properties = await prisma.contractProperty.findMany({
      where: {
        contract_id,
        is_active: true,
      },
      include: {
        property: true,
      },
    })

    return properties
  }

  /**
   * Calculate total monthly fee for contract
   * For FLAT_MONTHLY: returns contract.monthly_fee
   * For PER_PROPERTY: sums all property_monthly_fees
   */
  async calculateMonthlyFee(contract_id: string): Promise<number> {
    const contract = await prisma.cleaningContract.findUnique({
      where: { id: contract_id },
      include: {
        property_contracts: {
          where: { is_active: true },
        },
      },
    })

    if (!contract) {
      throw new Error('Contract not found')
    }

    if (contract.contract_type === 'FLAT_MONTHLY') {
      return Number(contract.monthly_fee)
    }

    // PER_PROPERTY: sum all property fees
    const total = contract.property_contracts.reduce((sum, cp) => {
      return sum + Number(cp.property_monthly_fee || 0)
    }, 0)

    return total
  }

  /**
   * Get active contracts that need invoicing today
   * (billing_day matches today's day of month)
   */
  async getContractsDueForInvoicing(): Promise<any[]> {
    const today = new Date()
    const dayOfMonth = today.getDate()

    const contracts = await prisma.cleaningContract.findMany({
      where: {
        status: 'ACTIVE',
        billing_day: dayOfMonth,
      },
      include: {
        customer: true,
        property_contracts: {
          where: { is_active: true },
          include: {
            property: true,
          },
        },
      },
    })

    return contracts
  }
}

export default new CleaningContractService()
