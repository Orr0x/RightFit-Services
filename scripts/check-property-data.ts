import { prisma } from '@rightfit/database'

async function checkPropertyData() {
  // Find the cleaning service provider for admin@cleaningco.test
  const user = await prisma.user.findUnique({
    where: { email: 'admin@cleaningco.test' },
    select: {
      id: true,
      tenant_id: true,
      email: true
    }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  console.log('User:', user.email, 'Tenant ID:', user.tenant_id)

  const serviceProvider = await prisma.serviceProvider.findUnique({
    where: { tenant_id: user.tenant_id },
    select: { id: true, business_name: true }
  })

  if (!serviceProvider) {
    console.log('Service provider not found')
    return
  }

  console.log('Service Provider:', serviceProvider.business_name)

  // Get all customers for this provider
  const customers = await prisma.customer.findMany({
    where: { service_provider_id: serviceProvider.id },
    select: {
      id: true,
      contact_name: true,
      business_name: true
    }
  })

  console.log('\nCustomers:', customers.length)

  // Get all properties
  for (const customer of customers) {
    console.log('\n--- Customer:', customer.contact_name || customer.business_name)
    const properties = await prisma.customerProperty.findMany({
      where: { customer_id: customer.id },
      select: {
        id: true,
        property_name: true,
        address: true,
        bedrooms: true,
        bathrooms: true,
        access_instructions: true,
        access_code: true,
        cleaner_notes: true,
        wifi_ssid: true,
        wifi_password: true,
        parking_info: true,
        pet_info: true,
        special_requirements: true,
        photo_urls: true,
        utility_locations: true,
        emergency_contacts: true
      }
    })

    console.log('Properties:', properties.length)
    for (const prop of properties) {
      console.log('\nProperty ID:', prop.id)
      console.log('Name:', prop.property_name)
      console.log('Address:', prop.address)
      console.log('Bedrooms:', prop.bedrooms)
      console.log('Bathrooms:', prop.bathrooms)
      console.log('Access Instructions:', prop.access_instructions || 'NOT SET')
      console.log('Access Code:', prop.access_code || 'NOT SET')
      console.log('Cleaner Notes:', prop.cleaner_notes || 'NOT SET')
      console.log('WiFi SSID:', prop.wifi_ssid || 'NOT SET')
      console.log('WiFi Password:', prop.wifi_password || 'NOT SET')
      console.log('Parking Info:', prop.parking_info || 'NOT SET')
      console.log('Pet Info:', prop.pet_info || 'NOT SET')
      console.log('Special Requirements:', prop.special_requirements || 'NOT SET')
      console.log('Photo URLs:', prop.photo_urls || 'NOT SET')
      console.log('Utility Locations:', prop.utility_locations || 'NOT SET')
      console.log('Emergency Contacts:', prop.emergency_contacts || 'NOT SET')
    }
  }

  await prisma.$disconnect()
}

checkPropertyData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
