import { PropertiesService } from '../PropertiesService'
import { prisma } from '@rightfit/database'

// Mock dependencies
jest.mock('@rightfit/database', () => ({
  prisma: {
    property: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    workOrder: {
      count: jest.fn(),
    },
  },
}))

describe('PropertiesService', () => {
  let propertiesService: PropertiesService
  const mockTenantId = 'tenant-123'
  const mockUserId = 'user-123'

  beforeEach(() => {
    propertiesService = new PropertiesService()
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('should return paginated properties for a tenant', async () => {
      const mockProperties = [
        {
          id: 'prop-1',
          tenant_id: mockTenantId,
          name: 'Property 1',
          _count: { work_orders: 2 },
        },
        {
          id: 'prop-2',
          tenant_id: mockTenantId,
          name: 'Property 2',
          _count: { work_orders: 0 },
        },
      ]

      ;(prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties)
      ;(prisma.property.count as jest.Mock).mockResolvedValue(2)

      const result = await propertiesService.list(mockTenantId, 1, 20)

      expect(result).toEqual({
        data: mockProperties,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      })
      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenant_id: mockTenantId,
            deleted_at: null,
          },
          skip: 0,
          take: 20,
          orderBy: { created_at: 'desc' },
        })
      )
    })

    it('should handle pagination correctly', async () => {
      ;(prisma.property.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.property.count as jest.Mock).mockResolvedValue(50)

      const result = await propertiesService.list(mockTenantId, 2, 20)

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
      })
      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        })
      )
    })
  })

  describe('getById', () => {
    it('should return property by id for the tenant', async () => {
      const mockProperty = {
        id: 'prop-1',
        tenant_id: mockTenantId,
        name: 'Property 1',
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty)

      const result = await propertiesService.getById('prop-1', mockTenantId)

      expect(result).toEqual(mockProperty)
      expect(prisma.property.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'prop-1',
            tenant_id: mockTenantId,
            deleted_at: null,
          },
        })
      )
    })

    it('should throw NotFoundError if property does not exist', async () => {
      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(propertiesService.getById('prop-1', mockTenantId)).rejects.toThrow(
        'Property not found'
      )
    })
  })

  describe('create', () => {
    it('should create a new property', async () => {
      const createInput = {
        name: 'New Property',
        address_line1: '123 Main St',
        city: 'London',
        postcode: 'SW1A 1AA',
        property_type: 'HOUSE' as const,
        bedrooms: 3,
        bathrooms: 2,
      }

      const mockProperty = {
        id: 'prop-new',
        tenant_id: mockTenantId,
        owner_user_id: mockUserId,
        ...createInput,
        created_at: new Date(),
        updated_at: new Date(),
      }

      ;(prisma.property.create as jest.Mock).mockResolvedValue(mockProperty)

      const result = await propertiesService.create(createInput, mockTenantId, mockUserId)

      expect(result).toEqual(mockProperty)
      expect(prisma.property.create).toHaveBeenCalledWith({
        data: {
          ...createInput,
          tenant_id: mockTenantId,
          owner_user_id: mockUserId,
        },
      })
    })
  })

  describe('update', () => {
    it('should update an existing property', async () => {
      const updateInput = {
        bedrooms: 4,
        access_instructions: 'Key under mat',
      }

      const mockExistingProperty = {
        id: 'prop-1',
        tenant_id: mockTenantId,
      }

      const mockUpdatedProperty = {
        ...mockExistingProperty,
        ...updateInput,
        updated_at: new Date(),
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockExistingProperty)
      ;(prisma.property.update as jest.Mock).mockResolvedValue(mockUpdatedProperty)

      const result = await propertiesService.update('prop-1', updateInput, mockTenantId)

      expect(result).toEqual(mockUpdatedProperty)
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: updateInput,
      })
    })

    it('should throw NotFoundError if property does not exist', async () => {
      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(
        propertiesService.update('prop-1', { bedrooms: 4 }, mockTenantId)
      ).rejects.toThrow('Property not found')
    })
  })

  describe('delete', () => {
    it('should soft delete a property without active work orders', async () => {
      const mockProperty = {
        id: 'prop-1',
        tenant_id: mockTenantId,
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty)
      ;(prisma.workOrder.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.property.update as jest.Mock).mockResolvedValue({
        ...mockProperty,
        deleted_at: new Date(),
      })

      await propertiesService.delete('prop-1', mockTenantId)

      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { deleted_at: expect.any(Date) },
      })
    })

    it('should throw BadRequestError if property has active work orders', async () => {
      const mockProperty = {
        id: 'prop-1',
        tenant_id: mockTenantId,
      }

      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty)
      ;(prisma.workOrder.count as jest.Mock).mockResolvedValue(3)

      await expect(propertiesService.delete('prop-1', mockTenantId)).rejects.toThrow(
        'Cannot delete property with 3 active work order(s)'
      )
    })

    it('should throw NotFoundError if property does not exist', async () => {
      ;(prisma.property.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(propertiesService.delete('prop-1', mockTenantId)).rejects.toThrow(
        'Property not found'
      )
    })
  })
})
