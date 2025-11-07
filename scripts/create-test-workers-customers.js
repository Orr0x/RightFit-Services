/**
 * Create Test Workers, Contractors, and Customers
 *
 * Links User accounts to Worker/Customer records for complete workflow testing
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
    console.log('Creating test Service Providers, Workers, and Customers...\n')

    // Get tenant IDs
    const cleaningTenant = await prisma.tenant.findUnique({ where: { id: 'tenant-cleaning-test' } })
    const maintenanceTenant = await prisma.tenant.findUnique({ where: { id: 'tenant-maintenance-test' } })
    const customerTenant = await prisma.tenant.findUnique({ where: { id: 'tenant-customer-test' } })

    if (!cleaningTenant || !maintenanceTenant || !customerTenant) {
      throw new Error('Test tenants not found. Run create-test-users.js first.')
    }

    // 1. Create Service Providers for test tenants
    console.log('=== Creating Service Providers ===')

    const cleaningSP = await prisma.serviceProvider.upsert({
      where: { id: 'sp-cleaning-test' },
      update: {},
      create: {
        id: 'sp-cleaning-test',
        tenant_id: cleaningTenant.id,
        business_name: 'CleanCo Services',
        owner_name: 'Sarah Johnson',
        email: 'admin@cleaningco.test',
        phone: '+44 7700 111222',
        address: '123 Clean Street, London, SW1A 1AA, United Kingdom'
      }
    })
    console.log('✓ Created Service Provider:', cleaningSP.business_name)

    const maintenanceSP = await prisma.serviceProvider.upsert({
      where: { id: 'sp-maintenance-test' },
      update: {},
      create: {
        id: 'sp-maintenance-test',
        tenant_id: maintenanceTenant.id,
        business_name: 'FixIt Maintenance',
        owner_name: 'Robert Davis',
        email: 'admin@maintenance.test',
        phone: '+44 7700 333444',
        address: '456 Repair Road, Manchester, M1 1AA, United Kingdom'
      }
    })
    console.log('✓ Created Service Provider:', maintenanceSP.business_name)

    // 2. Create Workers for CleanCo Services
    console.log('\n=== Creating Workers for CleanCo Services ===')

    // Get User IDs for linking
    const worker1User = await prisma.user.findUnique({ where: { email: 'worker1@cleaningco.test' } })
    const worker2User = await prisma.user.findUnique({ where: { email: 'worker2@cleaningco.test' } })

    const worker1 = await prisma.worker.upsert({
      where: { id: 'worker-maria-garcia' },
      update: {},
      create: {
        id: 'worker-maria-garcia',
        service_provider_id: cleaningSP.id,
        user_id: worker1User?.id,
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'worker1@cleaningco.test',
        phone: '+44 7700 555111',
        worker_type: 'CLEANER',
        employment_type: 'FULL_TIME',
        hourly_rate: 12.50,
        is_active: true,
        skills: ['Deep Cleaning', 'Window Cleaning', 'Carpet Cleaning'],
        experience_years: 3,
        bio: 'Experienced cleaner specializing in residential and commercial properties.'
      }
    })
    console.log('✓ Created Worker:', worker1.first_name, worker1.last_name)

    const worker2 = await prisma.worker.upsert({
      where: { id: 'worker-john-smith' },
      update: {},
      create: {
        id: 'worker-john-smith',
        service_provider_id: cleaningSP.id,
        user_id: worker2User?.id,
        first_name: 'John',
        last_name: 'Smith',
        email: 'worker2@cleaningco.test',
        phone: '+44 7700 555222',
        worker_type: 'CLEANER',
        employment_type: 'PART_TIME',
        hourly_rate: 11.50,
        is_active: true,
        skills: ['General Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'],
        experience_years: 1,
        bio: 'Reliable part-time cleaner with attention to detail.'
      }
    })
    console.log('✓ Created Worker:', worker2.first_name, worker2.last_name)

    // 3. Create Contractors for FixIt Maintenance
    console.log('\n=== Creating Contractors for FixIt Maintenance ===')

    // Note: Contractor table uses different structure than Worker
    const contractor1User = await prisma.user.findUnique({ where: { email: 'contractor1@maintenance.test' } })
    const contractor2User = await prisma.user.findUnique({ where: { email: 'contractor2@maintenance.test' } })

    const contractor1 = await prisma.contractor.upsert({
      where: { id: 'contractor-carlos-rodriguez' },
      update: {},
      create: {
        id: 'contractor-carlos-rodriguez',
        tenant_id: maintenanceTenant.id,
        user_id: contractor1User?.id,
        name: 'Carlos Rodriguez',
        trade: 'Plumbing',
        company_name: 'Rodriguez Plumbing & Electrical',
        email: 'contractor1@maintenance.test',
        phone: '+44 7700 666111',
        notes: 'Multi-skilled contractor with 10 years experience. Specialties: Plumbing, Electrical, General Repairs.'
      }
    })
    console.log('✓ Created Contractor:', contractor1.name)

    const contractor2 = await prisma.contractor.upsert({
      where: { id: 'contractor-lisa-anderson' },
      update: {},
      create: {
        id: 'contractor-lisa-anderson',
        tenant_id: maintenanceTenant.id,
        user_id: contractor2User?.id,
        name: 'Lisa Anderson',
        trade: 'HVAC',
        company_name: 'Anderson HVAC Services',
        email: 'contractor2@maintenance.test',
        phone: '+44 7700 666222',
        notes: 'Specialist in HVAC systems and appliance repairs. Also handles carpentry work.'
      }
    })
    console.log('✓ Created Contractor:', contractor2.name)

    // 4. Create Customers for testing customer workflows
    console.log('\n=== Creating Customers ===')

    // Customer for CleanCo Services
    const customer1 = await prisma.customer.upsert({
      where: { customer_number: 'CUST-TEST-001' },
      update: {},
      create: {
        customer_number: 'CUST-TEST-001',
        service_provider_id: cleaningSP.id,
        business_name: 'ABC Properties LLC',
        contact_name: 'David Williams',
        email: 'owner@business.test',
        phone: '+44 7700 777111',
        business_address_line1: '789 Business Park',
        business_city: 'London',
        business_postcode: 'E1 1AA',
        business_country: 'United Kingdom',
        customer_type: 'LANDLORD'
      }
    })
    console.log('✓ Created Customer:', customer1.business_name)

    // Customer for Maintenance Services
    const customer2 = await prisma.customer.upsert({
      where: { customer_number: 'CUST-TEST-002' },
      update: {},
      create: {
        customer_number: 'CUST-TEST-002',
        service_provider_id: maintenanceSP.id,
        business_name: 'ABC Properties LLC - Maintenance',
        contact_name: 'Jennifer Brown',
        email: 'manager@business.test',
        phone: '+44 7700 777222',
        business_address_line1: '789 Business Park',
        business_city: 'London',
        business_postcode: 'E1 1AA',
        business_country: 'United Kingdom',
        customer_type: 'PROPERTY_MANAGEMENT'
      }
    })
    console.log('✓ Created Customer:', customer2.business_name)

    console.log('\n=== SUMMARY ===')
    console.log('Service Providers Created: 2')
    console.log('  - CleanCo Services (sp-cleaning-test)')
    console.log('  - FixIt Maintenance (sp-maintenance-test)')
    console.log('\nWorkers Created: 2 (linked to User accounts)')
    console.log('  - Maria Garcia (worker1@cleaningco.test) → CLEANER, FULL_TIME')
    console.log('  - John Smith (worker2@cleaningco.test) → CLEANER, PART_TIME')
    console.log('\nContractors Created: 2 (linked to User accounts)')
    console.log('  - Carlos Rodriguez (contractor1@maintenance.test) → Plumbing')
    console.log('  - Lisa Anderson (contractor2@maintenance.test) → HVAC')
    console.log('\nCustomers Created: 2')
    console.log('  - ABC Properties LLC (LANDLORD) → CleanCo Services')
    console.log('  - ABC Properties LLC - Maintenance (PROPERTY_MANAGEMENT) → FixIt Maintenance')
    console.log('\n✅ All test data created successfully!')
    console.log('\nComplete workflow testing is now available:')
    console.log('  ✓ User accounts (authentication) → Worker/Contractor profiles (business data)')
    console.log('  ✓ Login as worker1@cleaningco.test → View/complete cleaning jobs')
    console.log('  ✓ Login as contractor1@maintenance.test → Handle maintenance work orders')
    console.log('  ✓ Customer records linked to Service Providers for job management')
    console.log('  ✓ Cross-tenant workflows (cleaning → maintenance escalation) ready to test')

  } catch (error) {
    console.error('Error creating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
