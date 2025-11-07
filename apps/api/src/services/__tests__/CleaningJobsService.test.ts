/**
 * CleaningJobsService Unit Tests
 *
 * Tests the CleaningJobsService business logic
 */

import { CleaningJobsService } from '../CleaningJobsService'
import { prismaMock } from '../../__mocks__/prisma'

describe('CleaningJobsService', () => {
  let service: CleaningJobsService

  beforeEach(() => {
    service = new CleaningJobsService()
  })

  describe('create', () => {
    it('should create a cleaning job with valid data', async () => {
      const mockJob = {
        id: '123',
        property_id: 'prop-123',
        customer_id: 'cust-123',
        service_id: 'svc-123',
        status: 'PENDING' as const,
        scheduled_date: new Date('2025-01-15'),
        scheduled_start_time: '09:00:00',
        scheduled_end_time: '11:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      }

      prismaMock.cleaningJob.create.mockResolvedValue(mockJob as any)

      const result = await service.create({
        property_id: 'prop-123',
        customer_id: 'cust-123',
        service_id: 'svc-123',
        scheduled_date: new Date('2025-01-15'),
        scheduled_start_time: '09:00:00',
        scheduled_end_time: '11:00:00',
      })

      expect(result).toEqual(mockJob)
      expect(prismaMock.cleaningJob.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          property_id: 'prop-123',
          customer_id: 'cust-123',
          service_id: 'svc-123',
        }),
      })
    })

    it('should throw ValidationError for missing required fields', async () => {
      await expect(service.create({} as any)).rejects.toThrow()
    })

    it('should set default status to PENDING', async () => {
      const mockJob = {
        id: '123',
        property_id: 'prop-123',
        customer_id: 'cust-123',
        service_id: 'svc-123',
        status: 'PENDING' as const,
        scheduled_date: new Date('2025-01-15'),
        scheduled_start_time: '09:00:00',
        scheduled_end_time: '11:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      }

      prismaMock.cleaningJob.create.mockResolvedValue(mockJob as any)

      const result = await service.create({
        property_id: 'prop-123',
        customer_id: 'cust-123',
        service_id: 'svc-123',
        scheduled_date: new Date('2025-01-15'),
        scheduled_start_time: '09:00:00',
        scheduled_end_time: '11:00:00',
      })

      expect(result.status).toBe('PENDING')
    })
  })

  describe('findById', () => {
    it('should return a cleaning job by ID', async () => {
      const mockJob = {
        id: '123',
        property_id: 'prop-123',
        customer_id: 'cust-123',
        service_id: 'svc-123',
        status: 'PENDING' as const,
      }

      prismaMock.cleaningJob.findUnique.mockResolvedValue(mockJob as any)

      const result = await service.findById('123')

      expect(result).toEqual(mockJob)
      expect(prismaMock.cleaningJob.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: expect.any(Object),
      })
    })

    it('should return null for non-existent ID', async () => {
      prismaMock.cleaningJob.findUnique.mockResolvedValue(null)

      const result = await service.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('list', () => {
    it('should return paginated results', async () => {
      const mockJobs = [
        { id: '1', status: 'PENDING' },
        { id: '2', status: 'COMPLETED' },
      ]

      prismaMock.cleaningJob.findMany.mockResolvedValue(mockJobs as any)
      prismaMock.cleaningJob.count.mockResolvedValue(2)

      const result = await service.list('sp-123', 1, 20, {})

      expect(result.data).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(20)
      expect(result.pagination.totalPages).toBe(1)
    })

    it('should filter by status', async () => {
      const mockJobs = [{ id: '1', status: 'PENDING' }]

      prismaMock.cleaningJob.findMany.mockResolvedValue(mockJobs as any)
      prismaMock.cleaningJob.count.mockResolvedValue(1)

      await service.list('sp-123', 1, 20, { status: 'PENDING' })

      expect(prismaMock.cleaningJob.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'PENDING',
        }),
        take: 20,
        skip: 0,
        orderBy: expect.any(Object),
        include: expect.any(Object),
      })
    })

    it('should filter by date range', async () => {
      prismaMock.cleaningJob.findMany.mockResolvedValue([])
      prismaMock.cleaningJob.count.mockResolvedValue(0)

      await service.list('sp-123', 1, 20, {
        from_date: new Date('2024-01-01'),
        to_date: new Date('2024-12-31'),
      })

      expect(prismaMock.cleaningJob.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          scheduled_date: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        }),
        take: 20,
        skip: 0,
        orderBy: expect.any(Object),
        include: expect.any(Object),
      })
    })

    it('should handle pagination correctly', async () => {
      prismaMock.cleaningJob.findMany.mockResolvedValue([])
      prismaMock.cleaningJob.count.mockResolvedValue(50)

      const result = await service.list('sp-123', 3, 10, {})

      expect(result.pagination.page).toBe(3)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBe(50)
      expect(result.pagination.totalPages).toBe(5)
      expect(prismaMock.cleaningJob.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        take: 10,
        skip: 20, // (page - 1) * limit = (3 - 1) * 10 = 20
        orderBy: expect.any(Object),
        include: expect.any(Object),
      })
    })
  })

  describe('update', () => {
    it('should update a cleaning job', async () => {
      const mockUpdatedJob = {
        id: '123',
        status: 'IN_PROGRESS' as const,
        property_id: 'prop-123',
        customer_id: 'cust-123',
        service_id: 'svc-123',
      }

      prismaMock.cleaningJob.update.mockResolvedValue(mockUpdatedJob as any)

      const result = await service.update('123', { status: 'IN_PROGRESS' })

      expect(result.status).toBe('IN_PROGRESS')
      expect(prismaMock.cleaningJob.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { status: 'IN_PROGRESS' },
        include: expect.any(Object),
      })
    })
  })

  describe('delete', () => {
    it('should delete a cleaning job', async () => {
      const mockDeletedJob = {
        id: '123',
        status: 'PENDING' as const,
      }

      prismaMock.cleaningJob.delete.mockResolvedValue(mockDeletedJob as any)

      await service.delete('123')

      expect(prismaMock.cleaningJob.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      })
    })
  })

  describe('assignWorker', () => {
    it('should assign a worker to a cleaning job', async () => {
      const mockJob = {
        id: '123',
        assigned_worker_id: 'worker-123',
        status: 'SCHEDULED' as const,
      }

      prismaMock.cleaningJob.update.mockResolvedValue(mockJob as any)

      const result = await service.assignWorker('123', 'worker-123')

      expect(result.assigned_worker_id).toBe('worker-123')
      expect(result.status).toBe('SCHEDULED')
      expect(prismaMock.cleaningJob.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          assigned_worker_id: 'worker-123',
          status: 'SCHEDULED',
        },
        include: expect.any(Object),
      })
    })
  })

  describe('markComplete', () => {
    it('should mark a job as completed', async () => {
      const mockJob = {
        id: '123',
        status: 'COMPLETED' as const,
        actual_end_time: '11:00:00',
      }

      prismaMock.cleaningJob.update.mockResolvedValue(mockJob as any)

      const result = await service.markComplete('123', {
        actual_end_time: '11:00:00',
        notes: 'Job completed successfully',
      })

      expect(result.status).toBe('COMPLETED')
      expect(prismaMock.cleaningJob.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          actual_end_time: '11:00:00',
        }),
        include: expect.any(Object),
      })
    })
  })
})
