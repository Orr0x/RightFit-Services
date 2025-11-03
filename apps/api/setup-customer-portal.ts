import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function setupCustomerPortal() {
  try {
    // Find first service provider (landlord)
    const serviceProvider = await prisma.serviceProvider.findFirst()
    if (!serviceProvider) {
      console.log('❌ No service provider found. Please create one first via the landlord app.')
      process.exit(1)
    }

    console.log(`✅ Found service provider: ${serviceProvider.business_name}`)

    // Find or create a customer
    let customer = await prisma.customer.findFirst({
      where: { service_provider_id: serviceProvider.id }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          service_provider_id: serviceProvider.id,
          business_name: 'Test Customer Business',
          contact_name: 'Test Customer',
          email: 'test@customer.com',
          phone: '+1234567890',
          customer_type: 'PROPERTY_MANAGER',
        }
      })
      console.log(`✅ Created test customer: ${customer.business_name}`)
    } else {
      console.log(`✅ Found customer: ${customer.business_name} (${customer.email})`)
    }

    // Check if portal user already exists
    const existingPortalUser = await prisma.customerPortalUser.findUnique({
      where: { customer_id: customer.id }
    })

    if (existingPortalUser) {
      console.log('⚠️  Customer portal user already exists')
      console.log(`   Email: ${existingPortalUser.email}`)
      console.log(`   Password: password123`)
      return
    }

    // Create customer portal user
    const hashedPassword = await bcrypt.hash('password123', 10)
    const portalUser = await prisma.customerPortalUser.create({
      data: {
        customer_id: customer.id,
        email: customer.email || 'test@customer.com',
        password_hash: hashedPassword,
      }
    })

    console.log('\n🎉 Customer portal user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email:    ${portalUser.email}`)
    console.log(`Password: password123`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nYou can now login to:')
    console.log(`- Customer Portal: http://localhost:5176`)
    console.log('\n')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupCustomerPortal()
