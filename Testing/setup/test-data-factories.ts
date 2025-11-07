/**
 * Test Data Factories
 *
 * Factory functions to create test data using Faker.js
 * Following the Factory Pattern for consistent test data generation
 */

import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ensure JWT secrets are set
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret'

/**
 * Create a test tenant
 */
export async function createTestTenant(overrides: any = {}) {
  return prisma.tenant.create({
    data: {
      name: faker.company.name(),
      slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
      plan: 'PROFESSIONAL',
      max_users: 50,
      is_active: true,
      ...overrides,
    },
  })
}

/**
 * Create a test user with authentication token
 */
export async function createTestUser(overrides: any = {}) {
  const tenant = overrides.tenant || (await createTestTenant())
  const password = overrides.password || 'password123'

  const user = await prisma.user.create({
    data: {
      email: faker.internet.email().toLowerCase(),
      password_hash: await bcrypt.hash(password, 10),
      full_name: faker.person.fullName(),
      role: 'ADMIN',
      tenant_id: tenant.id,
      phone: faker.phone.number(),
      is_active: true,
      ...overrides,
      tenant: undefined, // Remove tenant from data
    },
  })

  // Generate JWT token
  const token = jwt.sign(
    {
      user_id: user.id,
      tenant_id: user.tenant_id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )

  const refreshToken = jwt.sign(
    {
      user_id: user.id,
      tenant_id: user.tenant_id,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  )

  return { user, token, refreshToken, password }
}

/**
 * Create a test service provider
 */
export async function createTestServiceProvider(tenantId: string, overrides: any = {}) {
  return prisma.serviceProvider.create({
    data: {
      tenant_id: tenantId,
      business_name: faker.company.name(),
      owner_name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip_code: faker.location.zipCode(),
      service_type: 'CLEANING',
      is_active: true,
      ...overrides,
    },
  })
}

/**
 * Create a test customer
 */
export async function createTestCustomer(serviceProviderId: string, overrides: any = {}) {
  return prisma.customer.create({
    data: {
      service_provider_id: serviceProviderId,
      full_name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip_code: faker.location.zipCode(),
      customer_type: 'BUSINESS',
      is_active: true,
      ...overrides,
    },
  })
}

/**
 * Create a test property
 */
export async function createTestProperty(customerId: string, overrides: any = {}) {
  return prisma.customerProperty.create({
    data: {
      customer_id: customerId,
      property_name: faker.company.name() + ' ' + faker.location.buildingNumber(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip_code: faker.location.zipCode(),
      property_type: 'APARTMENT',
      bedrooms: faker.number.int({ min: 1, max: 5 }),
      bathrooms: faker.number.int({ min: 1, max: 3 }),
      square_footage: faker.number.int({ min: 500, max: 3000 }),
      is_active: true,
      ...overrides,
    },
  })
}

/**
 * Create a test worker
 */
export async function createTestWorker(serviceProviderId: string, overrides: any = {}) {
  return prisma.worker.create({
    data: {
      service_provider_id: serviceProviderId,
      full_name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      worker_type: 'CLEANING',
      hourly_rate: parseFloat(faker.commerce.price({ min: 15, max: 50 })),
      is_active: true,
      ...overrides,
    },
  })
}

/**
 * Create a test cleaning job
 */
export async function createTestCleaningJob(
  propertyId: string,
  customerId: string,
  serviceId: string,
  overrides: any = {}
) {
  return prisma.cleaningJob.create({
    data: {
      property_id: propertyId,
      customer_id: customerId,
      service_id: serviceId,
      status: 'PENDING',
      scheduled_date: faker.date.future(),
      scheduled_start_time: '09:00:00',
      scheduled_end_time: '11:00:00',
      ...overrides,
    },
  })
}

/**
 * Create a test cleaning service
 */
export async function createTestCleaningService(serviceProviderId: string, overrides: any = {}) {
  return prisma.cleaningService.create({
    data: {
      service_provider_id: serviceProviderId,
      service_name: 'Standard Cleaning',
      service_type: 'STANDARD',
      base_price: parseFloat(faker.commerce.price({ min: 50, max: 200 })),
      price_per_bedroom: parseFloat(faker.commerce.price({ min: 10, max: 30 })),
      price_per_bathroom: parseFloat(faker.commerce.price({ min: 5, max: 15 })),
      duration_minutes: 120,
      is_active: true,
      ...overrides,
    },
  })
}

/**
 * Create a test maintenance job
 */
export async function createTestMaintenanceJob(
  propertyId: string,
  customerId: string,
  overrides: any = {}
) {
  return prisma.maintenanceJob.create({
    data: {
      property_id: propertyId,
      customer_id: customerId,
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      category: 'PLUMBING',
      priority: 'MEDIUM',
      status: 'PENDING',
      ...overrides,
    },
  })
}

/**
 * Create a test checklist template
 */
export async function createTestChecklistTemplate(
  serviceProviderId: string,
  overrides: any = {}
) {
  const template = await prisma.checklistTemplate.create({
    data: {
      service_provider_id: serviceProviderId,
      template_name: faker.lorem.words(2),
      category: 'CLEANING',
      is_active: true,
      ...overrides,
    },
  })

  // Create checklist items
  await prisma.checklistItem.createMany({
    data: [
      {
        template_id: template.id,
        item_text: 'Clean kitchen counters',
        order_index: 1,
        is_required: true,
      },
      {
        template_id: template.id,
        item_text: 'Vacuum all rooms',
        order_index: 2,
        is_required: true,
      },
      {
        template_id: template.id,
        item_text: 'Clean bathrooms',
        order_index: 3,
        is_required: true,
      },
    ],
  })

  return template
}

/**
 * Create a test cleaning contract
 */
export async function createTestCleaningContract(
  customerId: string,
  serviceProviderId: string,
  overrides: any = {}
) {
  return prisma.cleaningContract.create({
    data: {
      customer_id: customerId,
      service_provider_id: serviceProviderId,
      contract_name: faker.lorem.words(3),
      start_date: faker.date.past(),
      end_date: faker.date.future(),
      billing_frequency: 'MONTHLY',
      base_price: parseFloat(faker.commerce.price({ min: 500, max: 2000 })),
      status: 'ACTIVE',
      ...overrides,
    },
  })
}

/**
 * Clean up all test data
 * Use this in afterEach or afterAll hooks
 */
export async function cleanupTestData() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ')

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
  } catch (error) {
    console.log('Error cleaning up test data:', error)
  }
}

/**
 * Disconnect Prisma client
 * Use this in afterAll hooks
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
}
