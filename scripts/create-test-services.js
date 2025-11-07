const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestServices() {
  try {
    // Find the cleaning tenant's service provider
    const tenant = await prisma.tenant.findFirst({
      where: {
        tenant_name: 'CleanCo Services (Test)',
      },
      include: {
        service_provider: true,
      },
    })

    if (!tenant || !tenant.service_provider) {
      console.error('Could not find cleaning tenant or service provider')
      return
    }

    console.log(`Found tenant: ${tenant.tenant_name}`)
    console.log(`Service Provider ID: ${tenant.service_provider.id}`)

    // Check if services already exist
    const existingServices = await prisma.service.findMany({
      where: {
        service_provider_id: tenant.service_provider.id,
      },
    })

    if (existingServices.length > 0) {
      console.log(`\n⚠️  Services already exist for this service provider (${existingServices.length} found)`)
      console.log('Existing services:')
      existingServices.forEach(s => console.log(`  - ${s.name} (${s.service_type})`))

      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })

      const answer = await new Promise((resolve) => {
        readline.question('\nDo you want to create additional services anyway? (y/n): ', resolve)
      })
      readline.close()

      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted.')
        return
      }
    }

    // Create cleaning services
    console.log('\n📋 Creating cleaning services...')

    const standardCleaning = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'CLEANING',
        name: 'Standard Cleaning',
        description: 'Regular cleaning service for residential and commercial properties',
        pricing_model: 'PER_JOB',
        default_rate: 45.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${standardCleaning.name} - £${standardCleaning.default_rate} per job`)

    const deepCleaning = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'CLEANING',
        name: 'Deep Cleaning',
        description: 'Comprehensive deep cleaning service for thorough sanitization',
        pricing_model: 'PER_JOB',
        default_rate: 85.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${deepCleaning.name} - £${deepCleaning.default_rate} per job`)

    const officeCleaning = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'CLEANING',
        name: 'Commercial Office Cleaning',
        description: 'Professional office cleaning for businesses',
        pricing_model: 'HOURLY',
        default_rate: 25.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${officeCleaning.name} - £${officeCleaning.default_rate} per hour`)

    const turnoverCleaning = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'CLEANING',
        name: 'Property Turnover Cleaning',
        description: 'Cleaning service for property turnovers between guests',
        pricing_model: 'PER_JOB',
        default_rate: 55.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${turnoverCleaning.name} - £${turnoverCleaning.default_rate} per job`)

    const endOfTenancyCleaning = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'CLEANING',
        name: 'End of Tenancy Cleaning',
        description: 'Thorough cleaning service for end of tenancy requirements',
        pricing_model: 'CUSTOM',
        default_rate: 150.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${endOfTenancyCleaning.name} - £${endOfTenancyCleaning.default_rate} (custom pricing)`)

    const carpetCleaning = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'CLEANING',
        name: 'Carpet & Upholstery Cleaning',
        description: 'Specialist carpet and upholstery deep cleaning',
        pricing_model: 'PER_JOB',
        default_rate: 65.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${carpetCleaning.name} - £${carpetCleaning.default_rate} per job`)

    // Create maintenance services
    console.log('\n🔧 Creating maintenance services...')

    const generalMaintenance = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'MAINTENANCE',
        name: 'General Property Maintenance',
        description: 'General repairs and maintenance work',
        pricing_model: 'HOURLY',
        default_rate: 35.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${generalMaintenance.name} - £${generalMaintenance.default_rate} per hour`)

    const plumbing = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'MAINTENANCE',
        name: 'Plumbing Services',
        description: 'Plumbing repairs and installations',
        pricing_model: 'HOURLY',
        default_rate: 45.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${plumbing.name} - £${plumbing.default_rate} per hour`)

    const electrical = await prisma.service.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        service_type: 'MAINTENANCE',
        name: 'Electrical Services',
        description: 'Electrical repairs and installations',
        pricing_model: 'HOURLY',
        default_rate: 50.00,
        is_active: true,
      },
    })
    console.log(`✓ Created: ${electrical.name} - £${electrical.default_rate} per hour`)

    console.log('\n✅ Successfully created all test services!')
    console.log(`Total services created: 9`)
    console.log('\nService breakdown:')
    console.log(`  - Cleaning services: 6`)
    console.log(`  - Maintenance services: 3`)
  } catch (error) {
    console.error('Error creating test services:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestServices()
