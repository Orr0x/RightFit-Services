import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillPropertyHistory() {
  console.log('🚀 Starting property history backfill...\n');

  try {
    // Get all customer properties
    const properties = await prisma.customerProperty.findMany({
      orderBy: { created_at: 'asc' },
    });

    console.log(`📋 Found ${properties.length} customer properties\n`);

    for (const property of properties) {
      console.log(`\n🏠 Processing property: ${property.property_name} (${property.id})`);

      // 1. Create PROPERTY_CREATED event
      await prisma.propertyHistory.create({
        data: {
          property_id: property.id,
          changed_at: property.created_at,
          change_type: 'PROPERTY_CREATED',
          description: `Property "${property.property_name}" created`,
          metadata: {
            address: property.address,
            postcode: property.postcode,
          },
        },
      });
      console.log('  ✅ Created PROPERTY_CREATED event');

      // 2. Get all cleaning jobs for this property
      const cleaningJobs = await prisma.cleaningJob.findMany({
        where: { property_id: property.id },
        include: {
          assigned_worker: true,
        },
        orderBy: { created_at: 'asc' },
      });

      console.log(`  🧹 Found ${cleaningJobs.length} cleaning jobs`);

      for (const job of cleaningJobs) {
        const workerName = job.assigned_worker
          ? `${job.assigned_worker.first_name} ${job.assigned_worker.last_name}`
          : 'Unassigned';

        // CLEANING_JOB_SCHEDULED (when job was created)
        await prisma.propertyHistory.create({
          data: {
            property_id: property.id,
            changed_at: job.created_at,
            change_type: 'CLEANING_JOB_SCHEDULED',
            description: `Cleaning scheduled for ${job.scheduled_date.toISOString().split('T')[0]} with ${workerName}`,
            metadata: {
              cleaning_job_id: job.id,
              scheduled_date: job.scheduled_date.toISOString(),
              worker_name: workerName,
            },
          },
        });

        // CLEANING_JOB_STARTED (if started)
        if (job.status === 'IN_PROGRESS' || job.status === 'COMPLETED') {
          await prisma.propertyHistory.create({
            data: {
              property_id: property.id,
              changed_at: job.actual_start_time || job.updated_at,
              change_type: 'CLEANING_JOB_STARTED',
              description: `Cleaning started by ${workerName}`,
              metadata: {
                cleaning_job_id: job.id,
                worker_name: workerName,
              },
            },
          });
        }

        // CLEANING_JOB_COMPLETED (if completed)
        if (job.status === 'COMPLETED') {
          await prisma.propertyHistory.create({
            data: {
              property_id: property.id,
              changed_at: job.actual_end_time || job.updated_at,
              change_type: 'CLEANING_JOB_COMPLETED',
              description: `Cleaning completed by ${workerName}`,
              metadata: {
                cleaning_job_id: job.id,
                worker_name: workerName,
              },
            },
          });
        }
      }

      console.log(`  ✅ Created ${cleaningJobs.length * (cleaningJobs.filter(j => j.status === 'COMPLETED').length > 0 ? 3 : cleaningJobs.filter(j => j.status === 'IN_PROGRESS').length > 0 ? 2 : 1)} cleaning job history entries`);

      // 3. Get all maintenance jobs for this property
      const maintenanceJobs = await prisma.maintenanceJob.findMany({
        where: { property_id: property.id },
        orderBy: { created_at: 'asc' },
      });

      console.log(`  🔧 Found ${maintenanceJobs.length} maintenance jobs`);

      for (const job of maintenanceJobs) {
        // MAINTENANCE_JOB_CREATED
        await prisma.propertyHistory.create({
          data: {
            property_id: property.id,
            changed_at: job.created_at,
            change_type: 'MAINTENANCE_JOB_CREATED',
            description: `Maintenance job created: ${job.title} (${job.priority} priority)`,
            metadata: {
              maintenance_job_id: job.id,
              title: job.title,
              priority: job.priority,
            },
          },
        });

        // MAINTENANCE_JOB_COMPLETED (if completed)
        if (job.status === 'COMPLETED') {
          await prisma.propertyHistory.create({
            data: {
              property_id: property.id,
              changed_at: job.updated_at,
              change_type: 'MAINTENANCE_JOB_COMPLETED',
              description: `Maintenance completed: ${job.title}`,
              metadata: {
                maintenance_job_id: job.id,
                title: job.title,
              },
            },
          });
        }
      }

      console.log(`  ✅ Created ${maintenanceJobs.length + maintenanceJobs.filter(j => j.status === 'COMPLETED').length} maintenance job history entries`);
    }

    console.log('\n\n✨ Backfill completed successfully!');

    // Show summary
    const totalHistoryEntries = await prisma.propertyHistory.count();
    console.log(`\n📊 Total property history entries: ${totalHistoryEntries}`);

  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillPropertyHistory()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
