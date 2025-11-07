/**
 * Query All Test Data - Users, Workers, Customers, Service Providers
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://rightfit_user:rightfit_dev_password@localhost:5433/rightfit_dev?schema=public'
    }
  }
})

async function main() {
  try {
    console.log('Querying all test data...\n')

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      orderBy: { tenant_name: 'asc' }
    })

    console.log('=== TENANTS ===')
    tenants.forEach(tenant => {
      console.log(`ID: ${tenant.id}`)
      console.log(`Name: ${tenant.tenant_name}`)
      console.log(`Subscription: ${tenant.subscription_status}`)
      console.log('---')
    })

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        tenant: true
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' }
      ]
    })

    console.log('\n=== USERS ===')
    users.forEach(user => {
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.full_name}`)
      console.log(`Role: ${user.role}`)
      console.log(`Tenant: ${user.tenant?.tenant_name || 'N/A'}`)
      console.log(`Deleted: ${user.deleted_at ? 'Yes' : 'No'}`)
      console.log('---')
    })

    // Get all service providers
    const serviceProviders = await prisma.serviceProvider.findMany({
      include: {
        tenant: true
      },
      orderBy: { business_name: 'asc' }
    })

    console.log('\n=== SERVICE PROVIDERS ===')
    serviceProviders.forEach(sp => {
      console.log(`Business: ${sp.business_name}`)
      console.log(`Owner: ${sp.owner_name}`)
      console.log(`Email: ${sp.email}`)
      console.log(`Type: ${sp.service_type}`)
      console.log(`Tenant: ${sp.tenant?.tenant_name || 'N/A'}`)
      console.log('---')
    })

    // Get all workers
    const workers = await prisma.worker.findMany({
      include: {
        service_provider: {
          include: {
            tenant: true
          }
        }
      },
      orderBy: { first_name: 'asc' }
    })

    console.log('\n=== WORKERS ===')
    workers.forEach(worker => {
      console.log(`Name: ${worker.first_name} ${worker.last_name}`)
      console.log(`Email: ${worker.email}`)
      console.log(`Phone: ${worker.phone || 'N/A'}`)
      console.log(`Type: ${worker.worker_type}`)
      console.log(`Service Provider: ${worker.service_provider?.business_name || 'N/A'}`)
      console.log(`Active: ${worker.is_active}`)
      console.log('---')
    })

    // Get all customers
    const customers = await prisma.customer.findMany({
      include: {
        service_provider: {
          include: {
            tenant: true
          }
        }
      },
      orderBy: { business_name: 'asc' }
    })

    console.log('\n=== CUSTOMERS ===')
    customers.forEach(customer => {
      console.log(`Business: ${customer.business_name}`)
      console.log(`Contact: ${customer.contact_name}`)
      console.log(`Email: ${customer.email}`)
      console.log(`Phone: ${customer.phone || 'N/A'}`)
      console.log(`Service Provider: ${customer.service_provider?.business_name || 'N/A'}`)
      console.log('---')
    })

    // Summary
    console.log('\n=== SUMMARY ===')
    console.log(`Total Tenants: ${tenants.length}`)
    console.log(`Total Users: ${users.length}`)
    console.log(`Total Service Providers: ${serviceProviders.length}`)
    console.log(`Total Workers: ${workers.length}`)
    console.log(`Total Customers: ${customers.length}`)

  } catch (error) {
    console.error('Error querying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
