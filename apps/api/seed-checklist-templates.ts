import { PrismaClient } from '@rightfit/database'

const prisma = new PrismaClient()

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

const templates = [
  {
    template_name: 'Standard House Cleaning',
    property_type: 'House',
    estimated_duration_minutes: 180,
    sections: [
      {
        title: 'Kitchen',
        items: [
          'Wipe down all countertops and backsplash',
          'Clean sink and taps',
          'Clean exterior of all appliances',
          'Clean microwave inside and out',
          'Clean oven and hob',
          'Empty bins and replace liners',
          'Sweep and mop floor',
          'Wipe cabinet doors and handles',
        ],
      },
      {
        title: 'Living Room',
        items: [
          'Dust all surfaces including TV, shelves, and furniture',
          'Vacuum carpets and rugs',
          'Vacuum/clean sofas and cushions',
          'Clean mirrors and glass surfaces',
          'Empty bins',
          'Tidy and organize items',
        ],
      },
      {
        title: 'Bedrooms',
        items: [
          'Change bed linens',
          'Dust all surfaces and furniture',
          'Vacuum carpets',
          'Clean mirrors',
          'Empty bins',
          'Organize items on surfaces',
        ],
      },
      {
        title: 'Bathrooms',
        items: [
          'Clean and disinfect toilet, sink, and bathtub/shower',
          'Clean mirrors',
          'Wipe down all surfaces',
          'Replace towels',
          'Empty bins and replace liners',
          'Sweep and mop floor',
          'Replenish toiletries if needed',
        ],
      },
      {
        title: 'Hallways & Stairs',
        items: [
          'Vacuum carpets or mop hard floors',
          'Dust banisters and railings',
          'Wipe down light switches',
          'Remove cobwebs',
        ],
      },
    ],
  },
  {
    template_name: 'Apartment/Flat Turnover',
    property_type: 'Apartment',
    estimated_duration_minutes: 120,
    sections: [
      {
        title: 'Kitchen',
        items: [
          'Clean all countertops and sink',
          'Clean exterior and interior of fridge',
          'Clean microwave inside and out',
          'Clean oven, hob, and extractor',
          'Wipe cabinet fronts',
          'Empty and clean bins',
          'Sweep and mop floor',
        ],
      },
      {
        title: 'Living/Dining Area',
        items: [
          'Dust all surfaces',
          'Vacuum carpets or mop floors',
          'Clean windows and glass',
          'Wipe dining table and chairs',
          'Clean TV screen',
          'Empty bins',
        ],
      },
      {
        title: 'Bedroom',
        items: [
          'Change and launder bed linens',
          'Dust all surfaces',
          'Vacuum floor',
          'Clean wardrobes inside',
          'Wipe mirrors',
          'Empty bins',
        ],
      },
      {
        title: 'Bathroom',
        items: [
          'Scrub and disinfect toilet, sink, shower/bath',
          'Clean mirrors and glass',
          'Wipe all surfaces',
          'Replace towels and bath mat',
          'Replenish toiletries',
          'Mop floor',
          'Empty bins',
        ],
      },
      {
        title: 'Entrance & Hallway',
        items: [
          'Vacuum or mop floor',
          'Wipe door handles and light switches',
          'Check for mail or packages',
        ],
      },
    ],
  },
  {
    template_name: 'Office Deep Clean',
    property_type: 'Office',
    estimated_duration_minutes: 150,
    sections: [
      {
        title: 'Reception & Waiting Area',
        items: [
          'Vacuum carpets and mats',
          'Dust reception desk and furniture',
          'Clean glass doors and windows',
          'Wipe down chairs and tables',
          'Empty bins',
          'Organize magazines and materials',
        ],
      },
      {
        title: 'Office Spaces',
        items: [
          'Vacuum carpets',
          'Dust desks, monitors, and equipment',
          'Wipe keyboards and phones with disinfectant',
          'Empty desk bins',
          'Clean windows',
          'Wipe light switches and door handles',
        ],
      },
      {
        title: 'Kitchen/Break Room',
        items: [
          'Clean countertops and sink',
          'Clean microwave and fridge exterior',
          'Wipe tables and chairs',
          'Empty bins and recycling',
          'Mop floor',
          'Restock supplies if needed',
        ],
      },
      {
        title: 'Bathrooms',
        items: [
          'Clean and disinfect toilets, sinks, and urinals',
          'Clean mirrors',
          'Refill soap, paper towels, and toilet paper',
          'Empty bins',
          'Mop floor',
          'Check all fixtures working',
        ],
      },
      {
        title: 'Common Areas',
        items: [
          'Vacuum corridors',
          'Dust surfaces',
          'Empty all bins',
          'Spot clean walls and doors',
          'Clean elevator buttons if applicable',
        ],
      },
    ],
  },
  {
    template_name: 'Standard Lodge Turnover',
    property_type: 'Lodge',
    estimated_duration_minutes: 120,
    sections: [
      {
        title: 'Kitchen',
        items: [
          'Clean countertops and backsplash',
          'Clean sink and taps',
          'Clean all appliances (inside and out)',
          'Check and organize utensils and dishes',
          'Empty bins',
          'Sweep and mop floor',
          'Check supplies (tea, coffee, sugar)',
        ],
      },
      {
        title: 'Living Area',
        items: [
          'Dust all surfaces',
          'Vacuum sofas and cushions',
          'Vacuum/mop floors',
          'Clean windows',
          'Check TV and remote controls',
          'Empty bins',
          'Check fireplace if present',
        ],
      },
      {
        title: 'Bedrooms',
        items: [
          'Strip and remake beds with fresh linens',
          'Check mattress protectors',
          'Dust all surfaces',
          'Vacuum floors',
          'Clean mirrors',
          'Check wardrobes and drawers',
          'Empty bins',
        ],
      },
      {
        title: 'Bathrooms',
        items: [
          'Clean and disinfect all fixtures',
          'Replace towels and bath mats',
          'Replenish toiletries',
          'Clean mirrors and glass',
          'Empty bins',
          'Mop floor',
          'Check water pressure and drainage',
        ],
      },
      {
        title: 'Outdoor Areas',
        items: [
          'Sweep entrance and patio',
          'Clean outdoor furniture if applicable',
          'Check hot tub if present',
          'Empty outdoor bins',
        ],
      },
    ],
  },
  {
    template_name: 'Cottage Turnover Clean',
    property_type: 'Cottage',
    estimated_duration_minutes: 150,
    sections: [
      {
        title: 'Kitchen/Dining',
        items: [
          'Clean all work surfaces',
          'Clean range cooker/AGA',
          'Clean Belfast sink',
          'Clean all appliances',
          'Polish wooden table',
          'Sweep and mop flagstone/tile floor',
          'Check crockery and glassware',
          'Empty bins',
        ],
      },
      {
        title: 'Living Room',
        items: [
          'Dust exposed beams',
          'Clean fireplace and hearth',
          'Vacuum carpets and rugs',
          'Dust all furniture',
          'Clean windows and window sills',
          'Check cushions and throws',
          'Empty bins',
        ],
      },
      {
        title: 'Bedrooms',
        items: [
          'Change bed linens',
          'Dust all furniture including wardrobes',
          'Vacuum floors',
          'Clean mirrors',
          'Check condition of quilts/duvets',
          'Empty bins',
          'Check for dampness',
        ],
      },
      {
        title: 'Bathrooms',
        items: [
          'Clean bath, shower, sink, and toilet',
          'Clean traditional taps and fixtures',
          'Replace towels',
          'Replenish toiletries',
          'Clean mirrors',
          'Mop floor',
          'Empty bins',
        ],
      },
      {
        title: 'Entrance & Garden',
        items: [
          'Sweep entrance porch',
          'Clean boot rack',
          'Sweep garden path',
          'Tidy outdoor furniture',
          'Check shed if applicable',
        ],
      },
    ],
  },
  {
    template_name: 'Studio Apartment Quick Clean',
    property_type: 'Studio',
    estimated_duration_minutes: 90,
    sections: [
      {
        title: 'Main Living Space',
        items: [
          'Make bed with fresh linens',
          'Dust all surfaces',
          'Vacuum floor',
          'Clean windows',
          'Tidy and organize',
          'Empty bins',
        ],
      },
      {
        title: 'Kitchenette',
        items: [
          'Clean countertops and sink',
          'Clean hob and mini oven',
          'Clean microwave',
          'Wipe small fridge exterior',
          'Empty bins',
          'Sweep/mop floor area',
        ],
      },
      {
        title: 'Bathroom',
        items: [
          'Clean shower, sink, and toilet',
          'Replace towels',
          'Clean mirror',
          'Replenish toiletries',
          'Empty bin',
          'Mop floor',
        ],
      },
      {
        title: 'Final Touches',
        items: [
          'Check heating/AC controls',
          'Ensure windows close properly',
          'Check all lights working',
          'Leave welcome note if required',
        ],
      },
    ],
  },
  {
    template_name: 'Holiday Home Deep Clean',
    property_type: 'Holiday Home',
    estimated_duration_minutes: 200,
    sections: [
      {
        title: 'Kitchen',
        items: [
          'Deep clean all appliances including dishwasher filter',
          'Clean inside all cupboards',
          'Degrease oven and hob thoroughly',
          'Clean fridge and freezer',
          'Clean microwave',
          'Wipe all surfaces',
          'Mop floor paying attention to corners',
          'Empty and clean bins',
          'Check all utensils and dishes clean',
        ],
      },
      {
        title: 'Living Areas',
        items: [
          'Dust ceiling fans and light fixtures',
          'Vacuum sofas and under cushions',
          'Vacuum all floors and carpets',
          'Clean all windows inside and out',
          'Dust all surfaces, shelves, and ornaments',
          'Clean TV screens and remotes',
          'Empty all bins',
          'Check all games and books tidy',
        ],
      },
      {
        title: 'Bedrooms',
        items: [
          'Strip all beds and check mattress protectors',
          'Make beds with fresh linens',
          'Dust all furniture including tops of wardrobes',
          'Vacuum floors thoroughly',
          'Clean windows and mirrors',
          'Check inside wardrobes and drawers',
          'Empty bins',
          'Organize any books or magazines',
        ],
      },
      {
        title: 'Bathrooms',
        items: [
          'Deep clean and descale all fixtures',
          'Clean grout and tiles',
          'Replace all towels and bath mats',
          'Replenish all toiletries',
          'Clean mirrors and glass',
          'Mop floor and clean behind toilet',
          'Empty bins',
          'Check drainage working properly',
        ],
      },
      {
        title: 'Outdoor Spaces',
        items: [
          'Sweep all patios and decking',
          'Clean outdoor furniture',
          'Empty outdoor bins',
          'Clean BBQ if present',
          'Check hot tub water chemistry if present',
          'Sweep garden paths',
          'Tidy any garden toys or equipment',
        ],
      },
      {
        title: 'Final Checks',
        items: [
          'Test all lights and replace bulbs if needed',
          'Check heating/cooling systems',
          'Ensure all windows and doors lock properly',
          'Check smoke alarms',
          'Leave property guide and emergency numbers',
          'Set welcome temperature',
        ],
      },
    ],
  },
  {
    template_name: 'Serviced Apartment Weekly',
    property_type: 'Serviced Apartment',
    estimated_duration_minutes: 100,
    sections: [
      {
        title: 'Kitchen',
        items: [
          'Clean all surfaces',
          'Clean hob and oven',
          'Clean microwave',
          'Clean sink',
          'Wipe appliances',
          'Empty bins',
          'Mop floor',
          'Restock consumables (bin bags, dishwasher tablets)',
        ],
      },
      {
        title: 'Living Area',
        items: [
          'Dust all surfaces',
          'Vacuum sofa',
          'Vacuum floor',
          'Clean coffee table',
          'Empty bins',
          'Tidy magazines and remotes',
        ],
      },
      {
        title: 'Bedroom',
        items: [
          'Change bed linens (weekly)',
          'Dust surfaces',
          'Vacuum floor',
          'Clean mirrors',
          'Empty bins',
          'Replenish wardrobe hangers',
        ],
      },
      {
        title: 'Bathroom',
        items: [
          'Clean all fixtures',
          'Replace towels (weekly)',
          'Replenish toiletries',
          'Clean mirror',
          'Empty bin',
          'Mop floor',
        ],
      },
      {
        title: 'General',
        items: [
          'Check and report any maintenance issues',
          'Ensure Wi-Fi working',
          'Check heating/cooling',
          'Water plants if present',
        ],
      },
    ],
  },
]

async function seedChecklistTemplates() {
  console.log('🌱 Seeding checklist templates...')

  try {
    // Clear existing templates for this service provider
    await prisma.checklistTemplate.deleteMany({
      where: {
        service_provider_id: SERVICE_PROVIDER_ID,
      },
    })
    console.log('✓ Cleared existing templates')

    // Create new templates
    for (const template of templates) {
      await prisma.checklistTemplate.create({
        data: {
          service_provider_id: SERVICE_PROVIDER_ID,
          template_name: template.template_name,
          property_type: template.property_type,
          estimated_duration_minutes: template.estimated_duration_minutes,
          sections: template.sections,
          is_active: true,
        },
      })
      console.log(`✓ Created template: ${template.template_name}`)
    }

    console.log(`\n✅ Successfully seeded ${templates.length} checklist templates!`)
  } catch (error) {
    console.error('❌ Error seeding templates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedChecklistTemplates()
