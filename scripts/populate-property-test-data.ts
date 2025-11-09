import { prisma } from '@rightfit/database'

async function populatePropertyData() {
  // Find the Luxury Apartment 12A property
  const property = await prisma.customerProperty.findFirst({
    where: {
      property_name: 'Luxury Apartment 12A'
    }
  })

  if (!property) {
    console.log('Property not found')
    return
  }

  console.log('Found property:', property.property_name)
  console.log('Property ID:', property.id)

  // Update with comprehensive test data
  const updated = await prisma.customerProperty.update({
    where: { id: property.id },
    data: {
      bedrooms: 2,
      bathrooms: 2,
      access_code: '5789#',
      cleaner_notes: `IMPORTANT INFORMATION FOR CLEANERS:

**General Instructions:**
- This is a high-end luxury apartment. Please use extreme care with all fixtures and fittings.
- Owner is very particular about cleanliness standards.
- All windows must be streak-free.
- Hardwood floors throughout - use appropriate wood floor cleaner only, NO all-purpose cleaners.

**Pre-existing Conditions:**
- Small chip on bathroom mirror (top right corner) - DO NOT report as damage
- Slight water stain on ceiling in guest bedroom (known issue, already reported)
- Dishwasher door handle is loose (owner aware)

**Special Requirements:**
- Master bedroom has white silk bedding - handle with care
- Vintage Persian rug in living room - vacuum on low setting only, NO steam cleaning
- Kitchen granite counters - use pH-neutral cleaner only
- Balcony plants need watering if dry (owner's request)

**Products to Use:**
- Wood floors: Method Wood Floor Cleaner (under kitchen sink)
- Bathrooms: Ecover Bathroom Cleaner (cabinet under main bathroom sink)
- Glass/mirrors: Windex (spray bottle in cleaning caddy)

**Products to AVOID:**
- NO bleach anywhere
- NO abrasive cleaners on granite or marble
- NO steam mop on hardwood floors

**Waste Disposal:**
- Recycling bins are in utility closet by entrance
- Glass, plastic, paper all separate
- Building has strict recycling policy

**Time Estimate:**
- Deep clean: 4-5 hours
- Regular clean: 2.5-3 hours`,
      wifi_ssid: 'DeansgateLuxury_12A',
      wifi_password: 'Luxury!2024@12A',
      parking_info: `Parking available in building's underground garage, Level -2.

Enter through Deansgate entrance. Gate code: 2468#
Cleaning staff parking: Bays 45-50 (clearly marked with "Service" signs)
Must display visitor parking permit in windscreen (available from concierge)

Alternative: Street parking on side streets (2 hour limit) or NCP car park on Quay Street (5 min walk)`,
      pet_info: 'NO PETS - Owner has severe allergies. Building is pet-free.',
      special_requirements: `**CRITICAL:**
- Owner is allergic to strong fragrances - use ONLY unscented/mild products
- Security alarm MUST be set when leaving (code same as door access: 5789#)
- Owner receives notifications if alarm not set
- Always close balcony door when finished - building management requirement

**Preferred Standards:**
- Towels folded in thirds and stacked in linen closet
- Toilet paper end folded into triangle
- Remote controls lined up on coffee table
- Throw pillows arranged: 2 large in back, 2 small in front on sofa

**Do Not Touch:**
- Home office desk - owner works from home sometimes
- Wine fridge in dining room - temperature controlled
- Artwork on walls - very valuable, just dust frames gently

**Additional Services (if requested):**
- Fridge cleaning: Remove all items first, wipe down shelves
- Oven cleaning: Self-clean mode OK to use
- Balcony cleaning: Sweep + mop, wipe down glass panels`,
      photo_urls: [
        {
          url: '/uploads/properties/luxury-apt-12a/living-room.jpg',
          caption: 'Living room with Persian rug',
          type: 'interior'
        },
        {
          url: '/uploads/properties/luxury-apt-12a/kitchen.jpg',
          caption: 'Kitchen with granite countertops',
          type: 'interior'
        },
        {
          url: '/uploads/properties/luxury-apt-12a/master-bedroom.jpg',
          caption: 'Master bedroom',
          type: 'interior'
        },
        {
          url: '/uploads/properties/luxury-apt-12a/bathroom.jpg',
          caption: 'Main bathroom (note: mirror chip top right)',
          type: 'interior'
        }
      ],
      utility_locations: {
        waterShutoff: 'Under kitchen sink, blue valve on left pipe',
        electricalPanel: 'Utility closet by entrance, behind coats',
        gasMeter: 'Not applicable - building has central system',
        waterHeater: 'Central building system - contact building management',
        hvacControls: 'Nest thermostat in hallway - leave at 20°C',
        wifiRouter: 'Hallway closet, top shelf',
        stopTap: 'Under kitchen sink',
        fuseBox: 'Utility closet by entrance, behind coats',
        boiler: 'N/A - central heating',
        waterMeter: 'Building basement - contact management'
      },
      emergency_contacts: [
        {
          name: 'Owner - Michael Chen',
          phone: '07700 123456',
          relation: 'Property Owner',
          notes: 'Primary contact for any issues or questions'
        },
        {
          name: 'Building Concierge',
          phone: '0161 123 4567',
          relation: 'Building Management',
          notes: '24/7 desk service, can provide access if needed'
        },
        {
          name: 'Emergency Building Manager',
          phone: '07800 987654',
          relation: 'Building Emergency',
          notes: 'For urgent building issues (leaks, electrical, etc.)'
        }
      ]
    }
  })

  console.log('\n✅ Property updated successfully!')
  console.log('\nUpdated fields:')
  console.log('- Bedrooms:', updated.bedrooms)
  console.log('- Bathrooms:', updated.bathrooms)
  console.log('- Access Code:', updated.access_code)
  console.log('- Cleaner Notes:', updated.cleaner_notes ? `${updated.cleaner_notes.substring(0, 100)}...` : 'NOT SET')
  console.log('- WiFi SSID:', updated.wifi_ssid)
  console.log('- WiFi Password:', updated.wifi_password)
  console.log('- Parking Info:', updated.parking_info ? `${updated.parking_info.substring(0, 50)}...` : 'NOT SET')
  console.log('- Pet Info:', updated.pet_info)
  console.log('- Special Requirements:', updated.special_requirements ? `${updated.special_requirements.substring(0, 50)}...` : 'NOT SET')
  console.log('- Photo URLs:', updated.photo_urls ? `${JSON.stringify(updated.photo_urls).length} chars` : 'NOT SET')
  console.log('- Utility Locations:', updated.utility_locations ? Object.keys(updated.utility_locations as any).length + ' items' : 'NOT SET')
  console.log('- Emergency Contacts:', updated.emergency_contacts ? (updated.emergency_contacts as any[]).length + ' contacts' : 'NOT SET')

  await prisma.$disconnect()
}

populatePropertyData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
