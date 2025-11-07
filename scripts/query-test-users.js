/**
 * Query and Display Test Users
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
    console.log('Querying database...\n')

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
      console.log(`Tenant: ${user.tenant?.tenant_name || 'N/A'} (${user.tenant_id})`)
      console.log(`Deleted: ${user.deleted_at ? 'Yes' : 'No'}`)
      console.log('---')
    })

    console.log(`\nTotal Tenants: ${tenants.length}`)
    console.log(`Total Users: ${users.length}`)

  } catch (error) {
    console.error('Error querying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
