/**
 * Cleaning Jobs API Integration Tests
 *
 * Tests the complete request/response cycle with real database
 */

import request from 'supertest'
import { app } from '../../index'
import {
  createTestUser,
  createTestServiceProvider,
  createTestCustomer,
  createTestProperty,
  createTestCleaningService,
  cleanupTestData,
  disconnectPrisma,
} from '../../../../tests/setup/test-data-factories'
import { getPrismaTestClient } from '../../../../tests/setup/test-database'

const prisma = getPrismaTestClient()

describe('Cleaning Jobs API Integration', () => {
  let authToken: string
  let serviceProviderId: string
  let customerId: string
  let propertyId: string
  let serviceId: string
  let tenantId: string

  beforeAll(async () => {
    // Wait for database to be ready
    await prisma.$connect()
  })

  beforeEach(async () => {
    // Create test data
    const { user, token } = await createTestUser()
    authToken = token
    tenantId = user.tenant_id

    const serviceProvider = await createTestServiceProvider(tenantId)
    serviceProviderId = serviceProvider.id

    const customer = await createTestCustomer(serviceProviderId)
    customerId = customer.id

    const property = await createTestProperty(customerId)
    propertyId = property.id

    const service = await createTestCleaningService(serviceProviderId)
    serviceId = service.id
  })

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData()
  })

  afterAll(async () => {
    await disconnectPrisma()
  })

  describe('POST /api/cleaning-jobs', () => {
    it('should create a cleaning job with valid data', async () => {
      const jobData = {
        property_id: propertyId,
        customer_id: customerId,
        service_id: serviceId,
        scheduled_date: '2025-01-15',
        scheduled_start_time: '09:00:00',
        scheduled_end_time: '11:00:00',
      }

      const response = await request(app)
        .post('/api/cleaning-jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData)
        .expect(201)

      expect(response.body.data).toMatchObject({
        property_id: propertyId,
        customer_id: customerId,
        service_id: serviceId,
        status: 'PENDING',
      })
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('created_at')

      // Verify in database
      const job = await prisma.cleaningJob.findUnique({
        where: { id: response.body.data.id },
      })
      expect(job).toBeDefined()
      expect(job?.status).toBe('PENDING')
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/cleaning-jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body.error).toBeDefined()
      expect(response.body.error.message).toContain('required')
    })

    it('should return 401 without authentication', async () => {
      const jobData = {
        property_id: propertyId,
        customer_id: customerId,
        service_id: serviceId,
        scheduled_date: '2025-01-15',
      }

      await request(app)
        .post('/api/cleaning-jobs')
        .send(jobData)
        .expect(401)
    })

    it('should enforce tenant isolation', async () => {
      // Create another tenant's data
      const { user: otherUser, token: otherToken } = await createTestUser()
      const otherServiceProvider = await createTestServiceProvider(otherUser.tenant_id)
      const otherCustomer = await createTestCustomer(otherServiceProvider.id)
      const otherProperty = await createTestProperty(otherCustomer.id)

      const jobData = {
        property_id: otherProperty.id, // Different tenant's property
        customer_id: customerId,
        service_id: serviceId,
        scheduled_date: '2025-01-15',
      }

      // Should fail because property belongs to different tenant
      await request(app)
        .post('/api/cleaning-jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData)
        .expect(403)
    })
  })

  describe('GET /api/cleaning-jobs', () => {
    beforeEach(async () => {
      // Create test jobs
      await prisma.cleaningJob.createMany({
        data: [
          {
            property_id: propertyId,
            customer_id: customerId,
            service_id: serviceId,
            status: 'PENDING',
            scheduled_date: new Date('2025-01-15'),
            scheduled_start_time: '09:00:00',
            scheduled_end_time: '11:00:00',
          },
          {
            property_id: propertyId,
            customer_id: customerId,
            service_id: serviceId,
            status: 'COMPLETED',
            scheduled_date: new Date('2025-01-16'),
            scheduled_start_time: '09:00:00',
            scheduled_end_time: '11:00:00',
          },
          {
            property_id: propertyId,
            customer_id: customerId,
            service_id: serviceId,
            status: 'IN_PROGRESS',
            scheduled_date: new Date('2025-01-17'),
            scheduled_start_time: '09:00:00',
            scheduled_end_time: '11:00:00',
          },
        ],
      })
    })

    it('should return paginated list of jobs', async () => {
      const response = await request(app)
        .get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.pagination).toMatchObject({
        page: 1,
        total: expect.any(Number),
        totalPages: expect.any(Number),
        limit: expect.any(Number),
      })
    })

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}&status=PENDING`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach((job: any) => {
        expect(job.status).toBe('PENDING')
      })
    })

    it('should filter by date range', async () => {
      const response = await request(app)
        .get(
          `/api/cleaning-jobs?service_provider_id=${serviceProviderId}&from_date=2025-01-15&to_date=2025-01-16`
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    })

    it('should support pagination', async () => {
      const response1 = await request(app)
        .get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}&page=1&limit=2`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response1.body.data.length).toBeLessThanOrEqual(2)
      expect(response1.body.pagination.page).toBe(1)
      expect(response1.body.pagination.limit).toBe(2)

      const response2 = await request(app)
        .get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}&page=2&limit=2`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response2.body.pagination.page).toBe(2)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}`)
        .expect(401)
    })
  })

  describe('GET /api/cleaning-jobs/:id', () => {
    let jobId: string

    beforeEach(async () => {
      const job = await prisma.cleaningJob.create({
        data: {
          property_id: propertyId,
          customer_id: customerId,
          service_id: serviceId,
          status: 'PENDING',
          scheduled_date: new Date('2025-01-15'),
          scheduled_start_time: '09:00:00',
          scheduled_end_time: '11:00:00',
        },
      })
      jobId = job.id
    })

    it('should return a single job by ID', async () => {
      const response = await request(app)
        .get(`/api/cleaning-jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toMatchObject({
        id: jobId,
        property_id: propertyId,
        customer_id: customerId,
        service_id: serviceId,
        status: 'PENDING',
      })
    })

    it('should return 404 for non-existent job', async () => {
      await request(app)
        .get('/api/cleaning-jobs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('PUT /api/cleaning-jobs/:id', () => {
    let jobId: string

    beforeEach(async () => {
      const job = await prisma.cleaningJob.create({
        data: {
          property_id: propertyId,
          customer_id: customerId,
          service_id: serviceId,
          status: 'PENDING',
          scheduled_date: new Date('2025-01-15'),
          scheduled_start_time: '09:00:00',
          scheduled_end_time: '11:00:00',
        },
      })
      jobId = job.id
    })

    it('should update a cleaning job', async () => {
      const response = await request(app)
        .put(`/api/cleaning-jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS',
          actual_start_time: '09:15:00',
        })
        .expect(200)

      expect(response.body.data.status).toBe('IN_PROGRESS')
      expect(response.body.data.actual_start_time).toBe('09:15:00')

      // Verify in database
      const job = await prisma.cleaningJob.findUnique({
        where: { id: jobId },
      })
      expect(job?.status).toBe('IN_PROGRESS')
    })

    it('should return 404 for non-existent job', async () => {
      await request(app)
        .put('/api/cleaning-jobs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(404)
    })
  })

  describe('DELETE /api/cleaning-jobs/:id', () => {
    let jobId: string

    beforeEach(async () => {
      const job = await prisma.cleaningJob.create({
        data: {
          property_id: propertyId,
          customer_id: customerId,
          service_id: serviceId,
          status: 'PENDING',
          scheduled_date: new Date('2025-01-15'),
          scheduled_start_time: '09:00:00',
          scheduled_end_time: '11:00:00',
        },
      })
      jobId = job.id
    })

    it('should delete a cleaning job', async () => {
      await request(app)
        .delete(`/api/cleaning-jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify deleted in database
      const job = await prisma.cleaningJob.findUnique({
        where: { id: jobId },
      })
      expect(job).toBeNull()
    })

    it('should return 404 for non-existent job', async () => {
      await request(app)
        .delete('/api/cleaning-jobs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})
