const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestProperties() {
  try {
    // Find the cleaning tenant
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

    // Find the customer
    const customer = await prisma.customer.findFirst({
      where: {
        service_provider_id: tenant.service_provider.id,
      },
    })

    if (!customer) {
      console.error('Could not find customer')
      return
    }

    console.log(`Found customer: ${customer.business_name}`)

    // First, create some checklist templates
    console.log('\nCreating checklist templates...')

    const officeCleaning = await prisma.checklistTemplate.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        template_name: 'Standard Office Cleaning',
        property_type: 'COMMERCIAL',
        estimated_duration_minutes: 60,
        is_active: true,
        sections: [
          {
            title: 'General Cleaning',
            items: [
              { label: 'Empty all waste bins and replace liners', completed: false },
              { label: 'Vacuum all carpeted areas', completed: false },
              { label: 'Mop hard floor surfaces', completed: false },
              { label: 'Dust all surfaces, desks, and shelves', completed: false },
            ],
          },
          {
            title: 'Kitchen & Bathrooms',
            items: [
              { label: 'Clean and sanitize kitchen area', completed: false },
              { label: 'Clean and disinfect all toilets', completed: false },
              { label: 'Clean and disinfect all sinks', completed: false },
              { label: 'Restock toilet paper and hand soap', completed: false },
            ],
          },
          {
            title: 'Final Touches',
            items: [
              { label: 'Wipe down and sanitize door handles', completed: false },
              { label: 'Clean glass surfaces and mirrors', completed: false },
            ],
          },
        ],
      },
    })
    console.log(`✓ Created: ${officeCleaning.template_name}`)

    const residentialCleaning = await prisma.checklistTemplate.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        template_name: 'Residential Deep Clean',
        property_type: 'RESIDENTIAL',
        estimated_duration_minutes: 120,
        is_active: true,
        sections: [
          {
            title: 'Bedrooms',
            items: [
              { label: 'Strip and make all beds with fresh linens', completed: false },
              { label: 'Dust all surfaces, furniture, and fixtures', completed: false },
              { label: 'Vacuum including under furniture', completed: false },
            ],
          },
          {
            title: 'Kitchen',
            items: [
              { label: 'Clean counters and appliances', completed: false },
              { label: 'Clean and sanitize sink', completed: false },
              { label: 'Mop kitchen floor', completed: false },
            ],
          },
          {
            title: 'Bathrooms',
            items: [
              { label: 'Clean and disinfect toilet', completed: false },
              { label: 'Clean shower/tub and tiles', completed: false },
              { label: 'Clean and polish mirrors', completed: false },
            ],
          },
          {
            title: 'Common Areas',
            items: [
              { label: 'Vacuum all carpeted rooms', completed: false },
              { label: 'Mop all hard floors', completed: false },
              { label: 'Dust all surfaces', completed: false },
              { label: 'Clean windows and glass surfaces', completed: false },
              { label: 'Empty all trash and replace bags', completed: false },
            ],
          },
        ],
      },
    })
    console.log(`✓ Created: ${residentialCleaning.template_name}`)

    const restaurantCleaning = await prisma.checklistTemplate.create({
      data: {
        service_provider_id: tenant.service_provider.id,
        template_name: 'Restaurant & Bar Cleaning',
        property_type: 'COMMERCIAL',
        estimated_duration_minutes: 90,
        is_active: true,
        sections: [
          {
            title: 'Kitchen',
            items: [
              { label: 'Clean and sanitize all food prep surfaces', completed: false },
              { label: 'Deep clean kitchen equipment', completed: false },
              { label: 'Clean and degrease stovetops and ovens', completed: false },
              { label: 'Sanitize all cutting boards and utensils', completed: false },
              { label: 'Clean grease traps (if scheduled)', completed: false },
            ],
          },
          {
            title: 'Bar Area',
            items: [
              { label: 'Clean bar counter and surfaces', completed: false },
              { label: 'Wash all glassware', completed: false },
              { label: 'Wipe down bottle shelves', completed: false },
            ],
          },
          {
            title: 'Dining Area',
            items: [
              { label: 'Wipe down tables, chairs, and booths', completed: false },
              { label: 'Vacuum or mop dining area floors', completed: false },
              { label: 'Clean windows and glass surfaces', completed: false },
            ],
          },
          {
            title: 'Restrooms & Final',
            items: [
              { label: 'Clean and sanitize restrooms', completed: false },
              { label: 'Restock bathroom supplies', completed: false },
              { label: 'Empty all trash and recycling', completed: false },
              { label: 'Mop all floors', completed: false },
            ],
          },
        ],
      },
    })
    console.log(`✓ Created: ${restaurantCleaning.template_name}`)

    // Create test properties
    const properties = [
      {
        customer_id: customer.id,
        property_name: 'Downtown Office Building',
        address: '123 Main Street, Suite 500, Manchester',
        postcode: 'M1 1AA',
        property_type: 'COMMERCIAL',
        access_instructions: 'Use main entrance. Security code: 1234. Keys in lockbox.',
        is_active: true,
      },
      {
        customer_id: customer.id,
        property_name: 'Riverside Retail Unit',
        address: '45 Canal Street, Manchester',
        postcode: 'M4 2BN',
        property_type: 'COMMERCIAL',
        access_instructions: 'Side entrance door. Key holder: Manager Jenny (07700 900123)',
        is_active: true,
      },
      {
        customer_id: customer.id,
        property_name: 'Luxury Apartment 12A',
        address: '88 Deansgate, Apartment 12A, Manchester',
        postcode: 'M3 2ER',
        property_type: 'RESIDENTIAL',
        access_instructions: 'Concierge will provide access. Call ahead: 0161 123 4567. Apartment is on 12th floor.',
        is_active: true,
      },
      {
        customer_id: customer.id,
        property_name: 'City Centre Medical Clinic',
        address: '67 Oxford Road, Manchester',
        postcode: 'M1 6FQ',
        property_type: 'COMMERCIAL',
        access_instructions: 'Staff entrance on Oxford Road. Digital code changes monthly - check with practice manager.',
        is_active: true,
      },
      {
        customer_id: customer.id,
        property_name: 'Suburban Family Home',
        address: '24 Willow Lane, Altrincham',
        postcode: 'WA14 5JQ',
        property_type: 'RESIDENTIAL',
        access_instructions: 'Key safe at front door. Code: 8765. Disable alarm within 30 seconds (code same as key safe).',
        is_active: true,
      },
      {
        customer_id: customer.id,
        property_name: 'Northern Quarter Bar & Restaurant',
        address: '12 Thomas Street, Manchester',
        postcode: 'M4 1EU',
        property_type: 'COMMERCIAL',
        access_instructions: 'Back kitchen entrance. Manager must be present for deep cleans. Contact: Dave 07800 123456',
        is_active: true,
      },
    ]

    console.log('\nCreating properties...')
    for (const propertyData of properties) {
      const property = await prisma.customerProperty.create({
        data: propertyData,
      })
      console.log(`✓ Created: ${property.property_name} (${property.id})`)
    }

    console.log('\n✅ Successfully created all test properties!')
    console.log(`Total properties created: ${properties.length}`)
  } catch (error) {
    console.error('Error creating test properties:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestProperties()
