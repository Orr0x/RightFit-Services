// Mock dependencies BEFORE imports
const mockPrisma = {
  workOrder: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  property: {
    findFirst: jest.fn(),
  },
  contractor: {
    findFirst: jest.fn(),
  },
}

jest.mock('../SmsService')
jest.mock('@rightfit/database', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  prisma: mockPrisma,
  WorkOrderStatus: {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  WorkOrderPriority: {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
  },
  WorkOrderCategory: {
    PLUMBING: 'PLUMBING',
    ELECTRICAL: 'ELECTRICAL',
    HEATING: 'HEATING',
    APPLIANCES: 'APPLIANCES',
    EXTERIOR: 'EXTERIOR',
    INTERIOR: 'INTERIOR',
    OTHER: 'OTHER',
  },
}))

import workOrdersService from '../WorkOrdersService'

// Get the mocked prisma from the mock
const prisma = mockPrisma

describe('WorkOrdersService', () => {
  const mockTenantId = 'tenant-123'
  const mockUserId = 'user-123'
  const mockPropertyId = 'property-123'
  const mockContractorId = 'contractor-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createInput = {
      property_id: mockPropertyId,
      title: 'Fix leaking tap',
      description: 'Kitchen tap is leaking',
      priority: 'MEDIUM' as const,
      category: 'PLUMBING' as const,
    }

    it('should create a new work order successfully', async () => {
      const mockProperty = {
        id: mockPropertyId,
        tenant_id: mockTenantId,
        name: 'Test Property',
        deleted_at: null,
      }

      const mockWorkOrder = {
        id: 'wo-123',
        tenant_id: mockTenantId,
        created_by_user_id: mockUserId,
        ...createInput,
        status: 'OPEN',
        contractor_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        property: mockProperty,
        contractor: null,
        created_by: {
          id: mockUserId,
          email: 'user@example.com',
          full_name: 'Test User',
        },
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty)
      ;(prisma.workOrder.create as jest.Mock).mockResolvedValue(mockWorkOrder)

      const result = await workOrdersService.create(mockTenantId, mockUserId, createInput)

      expect(result).toEqual(mockWorkOrder)
      expect(prisma.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPropertyId,
          tenant_id: mockTenantId,
          deleted_at: null,
        },
      })
      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenant_id: mockTenantId,
            property_id: mockPropertyId,
            created_by_user_id: mockUserId,
            title: createInput.title,
          }),
        })
      )
    })

    it('should throw error if property does not belong to tenant', async () => {
      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(
        workOrdersService.create(mockTenantId, mockUserId, createInput)
      ).rejects.toThrow('Property not found')

      expect(prisma.workOrder.create).not.toHaveBeenCalled()
    })

    it('should verify contractor belongs to tenant when provided', async () => {
      const inputWithContractor = {
        ...createInput,
        contractor_id: mockContractorId,
      }

      const mockProperty = {
        id: mockPropertyId,
        tenant_id: mockTenantId,
        deleted_at: null,
      }

      const mockContractor = {
        id: mockContractorId,
        tenant_id: mockTenantId,
        name: 'Test Contractor',
        deleted_at: null,
      }

      const mockWorkOrder = {
        id: 'wo-123',
        tenant_id: mockTenantId,
        created_by_user_id: mockUserId,
        ...inputWithContractor,
        status: 'OPEN',
        contractor: mockContractor,
        property: mockProperty,
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty)
      ;(prisma.contractor.findFirst as jest.Mock).mockResolvedValue(mockContractor)
      ;(prisma.workOrder.create as jest.Mock).mockResolvedValue(mockWorkOrder)

      const result = await workOrdersService.create(mockTenantId, mockUserId, inputWithContractor)

      expect(result.contractor_id).toBe(mockContractorId)
      expect(prisma.contractor.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockContractorId,
          tenant_id: mockTenantId,
          deleted_at: null,
        },
      })
    })

    it('should throw error if contractor does not belong to tenant', async () => {
      const inputWithContractor = {
        ...createInput,
        contractor_id: mockContractorId,
      }

      const mockProperty = {
        id: mockPropertyId,
        tenant_id: mockTenantId,
        deleted_at: null,
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty)
      ;(prisma.contractor.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(
        workOrdersService.create(mockTenantId, mockUserId, inputWithContractor)
      ).rejects.toThrow('Contractor not found')

      expect(prisma.workOrder.create).not.toHaveBeenCalled()
    })

    it('should set default priority and category if not provided', async () => {
      const minimalInput = {
        property_id: mockPropertyId,
        title: 'Fix door',
      }

      const mockProperty = {
        id: mockPropertyId,
        tenant_id: mockTenantId,
        deleted_at: null,
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty)
      ;(prisma.workOrder.create as jest.Mock).mockResolvedValue({
        id: 'wo-123',
        tenant_id: mockTenantId,
        ...minimalInput,
        priority: 'MEDIUM',
        category: 'OTHER',
      })

      await workOrdersService.create(mockTenantId, mockUserId, minimalInput)

      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: 'MEDIUM',
            category: 'OTHER',
          }),
        })
      )
    })
  })

  describe('list', () => {
    it('should return paginated work orders for a tenant', async () => {
      const mockWorkOrders = [
        {
          id: 'wo-1',
          tenant_id: mockTenantId,
          title: 'Work Order 1',
          status: 'OPEN',
          property: { id: 'prop-1', name: 'Property 1' },
          contractor: null,
        },
        {
          id: 'wo-2',
          tenant_id: mockTenantId,
          title: 'Work Order 2',
          status: 'IN_PROGRESS',
          property: { id: 'prop-2', name: 'Property 2' },
          contractor: { id: 'contr-1', name: 'Contractor 1' },
        },
      ]

      ;(prisma.workOrder.findMany as jest.Mock).mockResolvedValue(mockWorkOrders)
      ;(prisma.workOrder.count as jest.Mock).mockResolvedValue(2)

      const result = await workOrdersService.list(mockTenantId, {}, 1, 20)

      expect(result).toEqual({
        data: mockWorkOrders,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          total_pages: 1,
        },
      })
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenant_id: mockTenantId,
            deleted_at: null,
          },
          skip: 0,
          take: 20,
          orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
        })
      )
    })

    it('should filter by property_id', async () => {
      ;(prisma.workOrder.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.workOrder.count as jest.Mock).mockResolvedValue(0)

      await workOrdersService.list(mockTenantId, { property_id: mockPropertyId }, 1, 20)

      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            property_id: mockPropertyId,
          }),
        })
      )
    })

    it('should filter by contractor_id', async () => {
      ;(prisma.workOrder.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.workOrder.count as jest.Mock).mockResolvedValue(0)

      await workOrdersService.list(mockTenantId, { contractor_id: mockContractorId }, 1, 20)

      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            contractor_id: mockContractorId,
          }),
        })
      )
    })

    it('should filter by status', async () => {
      ;(prisma.workOrder.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.workOrder.count as jest.Mock).mockResolvedValue(0)

      await workOrdersService.list(mockTenantId, { status: 'OPEN' }, 1, 20)

      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OPEN',
          }),
        })
      )
    })

    it('should handle pagination correctly', async () => {
      ;(prisma.workOrder.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.workOrder.count as jest.Mock).mockResolvedValue(45)

      const result = await workOrdersService.list(mockTenantId, {}, 2, 20)

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 45,
        total_pages: 3,
      })
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        })
      )
    })
  })

  describe('getById', () => {
    it('should return work order by id for the tenant', async () => {
      const mockWorkOrder = {
        id: 'wo-1',
        tenant_id: mockTenantId,
        title: 'Test Work Order',
        status: 'OPEN',
        property: { id: 'prop-1', name: 'Property 1' },
        contractor: null,
      }

      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(mockWorkOrder)

      const result = await workOrdersService.getById(mockTenantId, 'wo-1')

      expect(result).toEqual(mockWorkOrder)
      expect(prisma.workOrder.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'wo-1',
            tenant_id: mockTenantId,
            deleted_at: null,
          },
        })
      )
    })

    it('should return null if work order does not exist', async () => {
      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await workOrdersService.getById(mockTenantId, 'wo-999')

      expect(result).toBeNull()
    })

    it('should enforce tenant isolation', async () => {
      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(null)

      await workOrdersService.getById('different-tenant', 'wo-1')

      expect(prisma.workOrder.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenant_id: 'different-tenant',
          }),
        })
      )
    })
  })

  describe('update', () => {
    it('should update an existing work order', async () => {
      const updateInput = {
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'HIGH' as const,
      }

      const mockExistingWorkOrder = {
        id: 'wo-1',
        tenant_id: mockTenantId,
        title: 'Old Title',
      }

      const mockUpdatedWorkOrder = {
        ...mockExistingWorkOrder,
        ...updateInput,
        updated_at: new Date(),
      }

      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(mockExistingWorkOrder)
      ;(prisma.workOrder.update as jest.Mock).mockResolvedValue(mockUpdatedWorkOrder)

      const result = await workOrdersService.update(mockTenantId, 'wo-1', updateInput)

      expect(result).toEqual(mockUpdatedWorkOrder)
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: updateInput,
        include: expect.any(Object),
      })
    })

    it('should throw error if work order does not exist', async () => {
      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(
        workOrdersService.update(mockTenantId, 'wo-999', { title: 'New Title' })
      ).rejects.toThrow('Work order not found')

      expect(prisma.workOrder.update).not.toHaveBeenCalled()
    })

    it('should enforce tenant isolation on update', async () => {
      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(
        workOrdersService.update('different-tenant', 'wo-1', { title: 'New Title' })
      ).rejects.toThrow('Work order not found')
    })
  })

  describe('assignContractor', () => {
    it('should assign a contractor to a work order', async () => {
      const mockWorkOrder = {
        id: 'wo-1',
        tenant_id: mockTenantId,
        contractor_id: null,
      }

      const mockContractor = {
        id: mockContractorId,
        tenant_id: mockTenantId,
        name: 'Test Contractor',
        phone: '+44 7700 900000',
        sms_opt_out: false,
        deleted_at: null,
      }

      const mockUpdatedWorkOrder = {
        ...mockWorkOrder,
        contractor_id: mockContractorId,
        contractor: mockContractor,
        property: {
          name: 'Test Property',
          address_line1: '123 Main St',
        },
      }

      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(mockWorkOrder)
      ;(prisma.contractor.findFirst as jest.Mock).mockResolvedValue(mockContractor)
      ;(prisma.workOrder.update as jest.Mock).mockResolvedValue(mockUpdatedWorkOrder)

      const result = await workOrdersService.assignContractor(mockTenantId, 'wo-1', mockContractorId)

      expect(result).toEqual(mockUpdatedWorkOrder)
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: { contractor_id: mockContractorId },
        include: expect.any(Object),
      })
    })

    it('should throw error if contractor does not belong to tenant', async () => {
      const mockWorkOrder = {
        id: 'wo-1',
        tenant_id: mockTenantId,
      }

      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(mockWorkOrder)
      ;(prisma.contractor.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(
        workOrdersService.assignContractor(mockTenantId, 'wo-1', mockContractorId)
      ).rejects.toThrow('Contractor not found')

      expect(prisma.workOrder.update).not.toHaveBeenCalled()
    })
  })

  describe('updateStatus', () => {
    it('should update work order status to IN_PROGRESS', async () => {
      const mockWorkOrder = {
        id: 'wo-1',
        tenant_id: mockTenantId,
        status: 'OPEN',
      }

      const mockUpdatedWorkOrder = {
        ...mockWorkOrder,
        status: 'IN_PROGRESS',
        started_at: expect.any(Date),
      }

      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(mockWorkOrder)
      ;(prisma.workOrder.update as jest.Mock).mockResolvedValue(mockUpdatedWorkOrder)

      const result = await workOrdersService.updateStatus(mockTenantId, 'wo-1', 'IN_PROGRESS')

      expect(result).toEqual(mockUpdatedWorkOrder)
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: expect.objectContaining({
          status: 'IN_PROGRESS',
          started_at: expect.any(Date),
        }),
        include: expect.any(Object),
      })
    })

    it('should update work order status to COMPLETED with note', async () => {
      const mockWorkOrder = {
        id: 'wo-1',
        tenant_id: mockTenantId,
        status: 'IN_PROGRESS',
      }

      const mockUpdatedWorkOrder = {
        ...mockWorkOrder,
        status: 'COMPLETED',
        completed_at: expect.any(Date),
        completion_note: 'Fixed successfully',
      }

      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(mockWorkOrder)
      ;(prisma.workOrder.update as jest.Mock).mockResolvedValue(mockUpdatedWorkOrder)

      const result = await workOrdersService.updateStatus(
        mockTenantId,
        'wo-1',
        'COMPLETED',
        'Fixed successfully'
      )

      expect(result).toEqual(mockUpdatedWorkOrder)
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          completed_at: expect.any(Date),
          completion_note: 'Fixed successfully',
        }),
        include: expect.any(Object),
      })
    })

    it('should update work order status to CANCELLED with reason', async () => {
      const mockWorkOrder = {
        id: 'wo-1',
        tenant_id: mockTenantId,
        status: 'OPEN',
      }

      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(mockWorkOrder)
      ;(prisma.workOrder.update as jest.Mock).mockResolvedValue({
        ...mockWorkOrder,
        status: 'CANCELLED',
        cancellation_reason: 'Not needed anymore',
      })

      await workOrdersService.updateStatus(
        mockTenantId,
        'wo-1',
        'CANCELLED',
        'Not needed anymore'
      )

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          cancellation_reason: 'Not needed anymore',
        }),
        include: expect.any(Object),
      })
    })

    it('should throw error if work order does not exist', async () => {
      ;(prisma.workOrder.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(
        workOrdersService.updateStatus(mockTenantId, 'wo-999', 'COMPLETED')
      ).rejects.toThrow('Work order not found')

      expect(prisma.workOrder.update).not.toHaveBeenCalled()
    })
  })
})
