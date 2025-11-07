/**
 * Test Database Setup
 *
 * Configuration and utilities for managing test database
 */

import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Test database URL - use a separate database for testing
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/rightfit_test'

// Singleton Prisma client for tests
let prismaInstance: PrismaClient | null = null

/**
 * Get Prisma client instance
 * Uses singleton pattern to avoid multiple connections
 */
export function getPrismaTestClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
      log: process.env.DEBUG_TESTS === 'true' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  return prismaInstance
}

/**
 * Setup test database
 * Run migrations and prepare for testing
 */
export async function setupTestDatabase() {
  console.log('Setting up test database...')

  try {
    // Run migrations on test database
    const { stdout, stderr } = await execAsync(
      `DATABASE_URL="${TEST_DATABASE_URL}" npx prisma migrate deploy`,
      { cwd: process.cwd() + '/packages/database' }
    )

    if (stderr && !stderr.includes('warning')) {
      console.error('Migration stderr:', stderr)
    }

    console.log('Test database setup complete')
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
}

/**
 * Seed test database with minimal required data
 */
export async function seedTestDatabase() {
  const prisma = getPrismaTestClient()

  try {
    // Create a default test tenant if needed
    const existingTenant = await prisma.tenant.findFirst({
      where: { slug: 'test-tenant' },
    })

    if (!existingTenant) {
      await prisma.tenant.create({
        data: {
          name: 'Test Tenant',
          slug: 'test-tenant',
          plan: 'PROFESSIONAL',
          max_users: 100,
          is_active: true,
        },
      })
    }

    console.log('Test database seeded')
  } catch (error) {
    console.error('Failed to seed test database:', error)
    throw error
  }
}

/**
 * Clean test database
 * Truncate all tables except migrations
 */
export async function cleanTestDatabase() {
  const prisma = getPrismaTestClient()

  try {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ')

    if (tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
    }

    console.log('Test database cleaned')
  } catch (error) {
    console.error('Failed to clean test database:', error)
    throw error
  }
}

/**
 * Reset test database
 * Drop and recreate all tables, then run migrations
 */
export async function resetTestDatabase() {
  console.log('Resetting test database...')

  try {
    const { stdout, stderr } = await execAsync(
      `DATABASE_URL="${TEST_DATABASE_URL}" npx prisma migrate reset --force --skip-seed`,
      { cwd: process.cwd() + '/packages/database' }
    )

    if (stderr && !stderr.includes('warning')) {
      console.error('Reset stderr:', stderr)
    }

    console.log('Test database reset complete')
  } catch (error) {
    console.error('Failed to reset test database:', error)
    throw error
  }
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDatabase() {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
    prismaInstance = null
  }
}

/**
 * Check if test database is available
 */
export async function isTestDatabaseAvailable(): Promise<boolean> {
  const prisma = getPrismaTestClient()

  try {
    await prisma.$connect()
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('Test database is not available:', error)
    return false
  }
}

/**
 * Global setup for all tests
 * Call this in Jest globalSetup or beforeAll
 */
export async function globalTestSetup() {
  // Check if database is available
  const isAvailable = await isTestDatabaseAvailable()
  if (!isAvailable) {
    console.error(
      'Test database is not available. Please ensure PostgreSQL is running and test database exists.'
    )
    console.error(`Test database URL: ${TEST_DATABASE_URL}`)
    process.exit(1)
  }

  // Setup database
  await setupTestDatabase()
  await seedTestDatabase()
}

/**
 * Global teardown for all tests
 * Call this in Jest globalTeardown or afterAll
 */
export async function globalTestTeardown() {
  await disconnectTestDatabase()
}
