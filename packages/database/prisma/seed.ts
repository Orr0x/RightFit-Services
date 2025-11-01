import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding service provider data...');

  // Create Service Provider
  const serviceProvider = await prisma.serviceProvider.create({
    data: {
      business_name: 'RightFit Services',
      owner_name: 'Alex Robertson',
      email: 'alex@rightfit-services.co.uk',
      phone: '+44 1234 567890',
      address: 'Highland Business Park, Inverness, Scotland',
    },
  });

  console.log(`✅ Created service provider: ${serviceProvider.business_name}`);

  // Create Services
  const cleaningService = await prisma.service.create({
    data: {
      service_provider_id: serviceProvider.id,
      service_type: 'CLEANING',
      name: 'RightFit Cleaning Services',
      description: 'Professional cleaning and turnover services for short-term lets in rural Scotland',
      pricing_model: 'PER_JOB',
      default_rate: 45.0,
      is_active: true,
    },
  });

  const maintenanceService = await prisma.service.create({
    data: {
      service_provider_id: serviceProvider.id,
      service_type: 'MAINTENANCE',
      name: 'RightFit Maintenance Services',
      description: 'Property maintenance and repair services',
      pricing_model: 'HOURLY',
      default_rate: 45.0,
      is_active: true,
    },
  });

  console.log(`✅ Created services: Cleaning & Maintenance`);

  // Create Customer
  const customer = await prisma.customer.create({
    data: {
      service_provider_id: serviceProvider.id,
      business_name: 'Highland Haven Lodges',
      contact_name: 'Emma Henderson',
      email: 'emma@highlandhaven.co.uk',
      phone: '+44 1479 123456',
      address: 'Cairngorms National Park, Scotland',
      customer_type: 'PROPERTY_MANAGER',
      has_cleaning_contract: true,
      has_maintenance_contract: true,
      bundled_discount_percentage: 10.0,
      payment_terms: 'NET_14',
      payment_reliability_score: 95,
      satisfaction_score: 5,
      cross_sell_potential: 'HIGH',
    },
  });

  console.log(`✅ Created customer: ${customer.business_name}`);

  // Create Customer Properties
  const properties = await Promise.all([
    prisma.customerProperty.create({
      data: {
        customer_id: customer.id,
        property_name: 'Lodge 7',
        address: 'Cairngorms National Park',
        postcode: 'PH22 1QH',
        property_type: 'LODGE',
        bedrooms: 3,
        bathrooms: 2,
        access_instructions: 'Lockbox code: 1234. Spare key under doormat.',
        access_code: '1234',
        guest_portal_enabled: true,
        is_active: true,
      },
    }),
    prisma.customerProperty.create({
      data: {
        customer_id: customer.id,
        property_name: 'Loch View Cabin',
        address: 'Glen Affric, Highlands',
        postcode: 'IV4 7AD',
        property_type: 'CABIN',
        bedrooms: 2,
        bathrooms: 1,
        access_instructions: 'Key safe on left side of door. Code: 9876',
        access_code: '9876',
        guest_portal_enabled: true,
        is_active: true,
      },
    }),
  ]);

  console.log(`✅ Created ${properties.length} properties`);

  // Create Workers
  const sarah = await prisma.worker.create({
    data: {
      service_provider_id: serviceProvider.id,
      first_name: 'Sarah',
      last_name: 'Morrison',
      email: 'sarah@rightfit-services.co.uk',
      phone: '+44 7700 123456',
      worker_type: 'CLEANER',
      employment_type: 'PART_TIME',
      hourly_rate: 15.0,
      is_active: true,
      max_weekly_hours: 25,
      jobs_completed: 0,
    },
  });

  const mike = await prisma.worker.create({
    data: {
      service_provider_id: serviceProvider.id,
      first_name: 'Mike',
      last_name: 'Thompson',
      email: 'mike@rightfit-services.co.uk',
      phone: '+44 7700 234567',
      worker_type: 'MAINTENANCE',
      employment_type: 'FULL_TIME',
      hourly_rate: 18.0,
      is_active: true,
      max_weekly_hours: 40,
      jobs_completed: 0,
    },
  });

  console.log(`✅ Created workers: Sarah (Cleaner) & Mike (Maintenance)`);

  // Create External Contractor
  const contractor = await prisma.externalContractor.create({
    data: {
      service_provider_id: serviceProvider.id,
      company_name: 'Highland Heating Ltd',
      contact_name: 'John MacLeod',
      email: 'john@highlandheating.co.uk',
      phone: '+44 1463 987654',
      specialties: ['GAS_SAFE', 'BOILER_INSTALL', 'HVAC'],
      certifications: ['Gas Safe Register: 123456'],
      referral_fee_percentage: 10.0,
      preferred_contractor: true,
      emergency_callout_available: true,
      jobs_completed: 0,
    },
  });

  console.log(`✅ Created external contractor: ${contractor.company_name}`);

  // Create Checklist Template
  const checklistTemplate = await prisma.checklistTemplate.create({
    data: {
      service_provider_id: serviceProvider.id,
      customer_id: customer.id,
      template_name: 'Standard Lodge Turnover',
      property_type: 'LODGE',
      sections: {
        sections: [
          {
            section_name: 'Bedrooms',
            items: [
              { item: 'Strip beds and wash linens', required: true },
              { item: 'Make beds with fresh linens', required: true },
              { item: 'Vacuum floors', required: true },
              { item: 'Dust all surfaces', required: true },
              { item: 'Check wardrobes are empty', required: true },
            ],
          },
          {
            section_name: 'Kitchen',
            items: [
              { item: 'Empty dishwasher', required: true },
              { item: 'Wipe all countertops', required: true },
              { item: 'Clean oven and hob', required: true },
              { item: 'Restock dishwasher tablets (min 6)', required: true },
              { item: 'Check fridge is clean', required: true },
            ],
          },
          {
            section_name: 'Bathrooms',
            items: [
              { item: 'Clean toilet, sink, and shower', required: true },
              { item: 'Replace towels', required: true },
              { item: 'Restock toilet paper', required: true },
              { item: 'Restock toiletries', required: true },
            ],
          },
          {
            section_name: 'Living Areas',
            items: [
              { item: 'Vacuum all floors', required: true },
              { item: 'Dust surfaces and TV', required: true },
              { item: 'Empty bins', required: true },
              { item: 'Check for damage', required: true },
            ],
          },
        ],
      },
      estimated_duration_minutes: 120,
      is_active: true,
    },
  });

  console.log(`✅ Created checklist template: ${checklistTemplate.template_name}`);

  // Create sample Cleaning Jobs
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const cleaningJob1 = await prisma.cleaningJob.create({
    data: {
      service_id: cleaningService.id,
      property_id: properties[0].id,
      customer_id: customer.id,
      assigned_worker_id: sarah.id,
      scheduled_date: tomorrow,
      scheduled_start_time: '11:00',
      scheduled_end_time: '14:00',
      checklist_template_id: checklistTemplate.id,
      checklist_total_items: 18,
      status: 'SCHEDULED',
      pricing_type: 'PER_TURNOVER',
      quoted_price: 45.0,
      before_photos: [],
      after_photos: [],
      issue_photos: [],
    },
  });

  const cleaningJob2 = await prisma.cleaningJob.create({
    data: {
      service_id: cleaningService.id,
      property_id: properties[1].id,
      customer_id: customer.id,
      assigned_worker_id: sarah.id,
      scheduled_date: tomorrow,
      scheduled_start_time: '15:00',
      scheduled_end_time: '17:00',
      checklist_template_id: checklistTemplate.id,
      checklist_total_items: 18,
      status: 'SCHEDULED',
      pricing_type: 'PER_TURNOVER',
      quoted_price: 35.0,
      before_photos: [],
      after_photos: [],
      issue_photos: [],
    },
  });

  console.log(`✅ Created ${2} cleaning jobs for tomorrow`);

  // Create sample Maintenance Job
  const maintenanceJob = await prisma.maintenanceJob.create({
    data: {
      service_id: maintenanceService.id,
      property_id: properties[0].id,
      customer_id: customer.id,
      assigned_worker_id: mike.id,
      source: 'CUSTOMER_REQUEST',
      category: 'PLUMBING',
      priority: 'HIGH',
      title: 'Fix dripping tap in bathroom',
      description: 'Guest reported dripping tap in main bathroom. Needs attention before next booking.',
      status: 'SCHEDULED',
      scheduled_date: today,
      estimated_hours: 1.0,
      estimated_labor_cost: 45.0,
      estimated_parts_cost: 15.0,
      estimated_total: 60.0,
      issue_photos: [],
      work_in_progress_photos: [],
      completion_photos: [],
    },
  });

  console.log(`✅ Created ${1} maintenance job`);

  console.log('\n🎉 Seed data created successfully!\n');
  console.log('Summary:');
  console.log(`- Service Provider: ${serviceProvider.business_name}`);
  console.log(`- Services: 2 (Cleaning, Maintenance)`);
  console.log(`- Customers: 1 (${customer.business_name})`);
  console.log(`- Properties: ${properties.length}`);
  console.log(`- Workers: 2 (Sarah, Mike)`);
  console.log(`- External Contractors: 1`);
  console.log(`- Checklist Templates: 1`);
  console.log(`- Cleaning Jobs: 2`);
  console.log(`- Maintenance Jobs: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
