/**
 * Create Comprehensive Test Users
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://rightfit_user:rightfit_dev_password@localhost:5433/rightfit_dev?schema=public'
    }
  }
})

const TEST_PASSWORD = 'TestPassword123!'

async function main() {
  try {
    console.log('Creating comprehensive test users...\n')

    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10)

    // Create test tenants
    const cleaningTenant = await prisma.tenant.upsert({
      where: { id: 'tenant-cleaning-test' },
      update: {},
      create: {
        id: 'tenant-cleaning-test',
        tenant_name: 'CleanCo Services (Test)',
        subscription_status: 'ACTIVE'
      }
    })
    console.log('✓ Created cleaning tenant:', cleaningTenant.tenant_name)

    const maintenanceTenant = await prisma.tenant.upsert({
      where: { id: 'tenant-maintenance-test' },
      update: {},
      create: {
        id: 'tenant-maintenance-test',
        tenant_name: 'FixIt Maintenance (Test)',
        subscription_status: 'ACTIVE'
      }
    })
    console.log('✓ Created maintenance tenant:', maintenanceTenant.tenant_name)

    const customerTenant = await prisma.tenant.upsert({
      where: { id: 'tenant-customer-test' },
      update: {},
      create: {
        id: 'tenant-customer-test',
        tenant_name: 'ABC Properties LLC (Test)',
        subscription_status: 'ACTIVE'
      }
    })
    console.log('✓ Created customer tenant:', customerTenant.tenant_name)

    // Create test users
    const testUsers = [
      // Cleaning Service Provider Users
      {
        email: 'admin@cleaningco.test',
        full_name: 'Sarah Johnson',
        role: 'ADMIN',
        tenant_id: cleaningTenant.id
      },
      {
        email: 'manager@cleaningco.test',
        full_name: 'Mike Thompson',
        role: 'ADMIN',
        tenant_id: cleaningTenant.id
      },
      {
        email: 'worker1@cleaningco.test',
        full_name: 'Maria Garcia',
        role: 'MEMBER',
        tenant_id: cleaningTenant.id
      },
      {
        email: 'worker2@cleaningco.test',
        full_name: 'John Smith',
        role: 'MEMBER',
        tenant_id: cleaningTenant.id
      },

      // Maintenance Service Provider Users
      {
        email: 'admin@maintenance.test',
        full_name: 'Robert Davis',
        role: 'ADMIN',
        tenant_id: maintenanceTenant.id
      },
      {
        email: 'contractor1@maintenance.test',
        full_name: 'Carlos Rodriguez',
        role: 'MEMBER',
        tenant_id: maintenanceTenant.id
      },
      {
        email: 'contractor2@maintenance.test',
        full_name: 'Lisa Anderson',
        role: 'MEMBER',
        tenant_id: maintenanceTenant.id
      },

      // Customer/Property Owner Users
      {
        email: 'owner@business.test',
        full_name: 'David Williams',
        role: 'ADMIN',
        tenant_id: customerTenant.id
      },
      {
        email: 'manager@business.test',
        full_name: 'Jennifer Brown',
        role: 'ADMIN',
        tenant_id: customerTenant.id
      },
      {
        email: 'assistant@business.test',
        full_name: 'Emily Chen',
        role: 'MEMBER',
        tenant_id: customerTenant.id
      }
    ]

    for (const userData of testUsers) {
      try {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: {
            ...userData,
            password_hash: passwordHash
          }
        })
        console.log(`✓ Created user: ${user.email} (${user.role})`)
      } catch (error) {
        console.log(`! User ${userData.email} already exists or error:`, error.message)
      }
    }

    console.log('\n=== TEST USERS CREATED SUCCESSFULLY ===')
    console.log(`Password for all test users: ${TEST_PASSWORD}`)
    console.log('\nTotal Tenants: 3')
    console.log('Total Test Users: 10')

  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
