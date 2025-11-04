import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillWorkerHistory() {
  console.log('🚀 Starting worker history backfill...\n');

  try {
    // Get all workers
    const workers = await prisma.worker.findMany({
      orderBy: { created_at: 'asc' },
    });

    console.log(`📋 Found ${workers.length} workers\n`);

    for (const worker of workers) {
      const workerName = `${worker.first_name} ${worker.last_name}`;
      console.log(`\n👤 Processing worker: ${workerName} (${worker.id})`);

      // 1. Create WORKER_CREATED event
      await prisma.workerHistory.create({
        data: {
          worker_id: worker.id,
          changed_at: worker.created_at,
          change_type: 'WORKER_CREATED',
          description: `Worker "${workerName}" created`,
          metadata: {
            worker_name: workerName,
            worker_type: worker.worker_type,
            employment_type: worker.employment_type,
          },
        },
      });
      console.log('  ✅ Created WORKER_CREATED event');

      // 2. Get all cleaning jobs for this worker
      const cleaningJobs = await prisma.cleaningJob.findMany({
        where: { assigned_worker_id: worker.id },
        include: {
          property: true,
        },
        orderBy: { created_at: 'asc' },
      });

      console.log(`  🧹 Found ${cleaningJobs.length} cleaning jobs`);

      for (const job of cleaningJobs) {
        const propertyName = job.property?.property_name || 'Unknown Property';
        const scheduledDate = job.scheduled_date.toISOString().split('T')[0];

        // JOB_ASSIGNED (when job was created)
        await prisma.workerHistory.create({
          data: {
            worker_id: worker.id,
            changed_at: job.created_at,
            change_type: 'JOB_ASSIGNED',
            description: `Assigned to cleaning job at ${propertyName} (${scheduledDate})`,
            metadata: {
              job_id: job.id,
              job_type: 'CLEANING',
              property_name: propertyName,
              scheduled_date: scheduledDate,
            },
          },
        });

        // JOB_STARTED (if started)
        if (job.status === 'IN_PROGRESS' || job.status === 'COMPLETED') {
          await prisma.workerHistory.create({
            data: {
              worker_id: worker.id,
              changed_at: job.actual_start_time || job.updated_at,
              change_type: 'JOB_STARTED',
              description: `Started cleaning at ${propertyName}`,
              metadata: {
                job_id: job.id,
                job_type: 'CLEANING',
                property_name: propertyName,
              },
            },
          });
        }

        // JOB_COMPLETED (if completed)
        if (job.status === 'COMPLETED') {
          // Calculate duration if we have both times
          let duration: number | undefined;
          if (job.actual_start_time && job.actual_end_time) {
            const durationMs = job.actual_end_time.getTime() - job.actual_start_time.getTime();
            duration = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
          }

          await prisma.workerHistory.create({
            data: {
              worker_id: worker.id,
              changed_at: job.actual_end_time || job.updated_at,
              change_type: 'JOB_COMPLETED',
              description: `Completed cleaning at ${propertyName}${duration ? ` (${duration} hours)` : ''}`,
              metadata: {
                job_id: job.id,
                job_type: 'CLEANING',
                property_name: propertyName,
                duration_hours: duration,
              },
            },
          });
        }

        // JOB_CANCELLED (if cancelled)
        if (job.status === 'CANCELLED') {
          await prisma.workerHistory.create({
            data: {
              worker_id: worker.id,
              changed_at: job.updated_at,
              change_type: 'JOB_CANCELLED',
              description: `Cleaning job at ${propertyName} was cancelled`,
              metadata: {
                job_id: job.id,
                job_type: 'CLEANING',
                property_name: propertyName,
              },
            },
          });
        }
      }

      const cleaningEventsCount = cleaningJobs.length +
        cleaningJobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'COMPLETED').length +
        cleaningJobs.filter(j => j.status === 'COMPLETED').length +
        cleaningJobs.filter(j => j.status === 'CANCELLED').length;
      console.log(`  ✅ Created ${cleaningEventsCount} cleaning job history entries`);

      // 3. Get all maintenance jobs for this worker
      const maintenanceJobs = await prisma.maintenanceJob.findMany({
        where: { assigned_worker_id: worker.id },
        include: {
          property: true,
        },
        orderBy: { created_at: 'asc' },
      });

      console.log(`  🔧 Found ${maintenanceJobs.length} maintenance jobs`);

      for (const job of maintenanceJobs) {
        const propertyName = job.property?.property_name || 'Unknown Property';
        const scheduledDate = job.scheduled_date?.toISOString().split('T')[0];

        // JOB_ASSIGNED
        await prisma.workerHistory.create({
          data: {
            worker_id: worker.id,
            changed_at: job.created_at,
            change_type: 'JOB_ASSIGNED',
            description: `Assigned to maintenance job: ${job.title} at ${propertyName}${scheduledDate ? ` (${scheduledDate})` : ''}`,
            metadata: {
              job_id: job.id,
              job_type: 'MAINTENANCE',
              title: job.title,
              property_name: propertyName,
              scheduled_date: scheduledDate,
              priority: job.priority,
            },
          },
        });

        // JOB_STARTED (if in progress or completed)
        if (job.status === 'IN_PROGRESS' || job.status === 'COMPLETED') {
          await prisma.workerHistory.create({
            data: {
              worker_id: worker.id,
              changed_at: job.updated_at, // We don't have actual_start_time for maintenance
              change_type: 'JOB_STARTED',
              description: `Started maintenance: ${job.title} at ${propertyName}`,
              metadata: {
                job_id: job.id,
                job_type: 'MAINTENANCE',
                title: job.title,
                property_name: propertyName,
              },
            },
          });
        }

        // JOB_COMPLETED (if completed)
        if (job.status === 'COMPLETED') {
          // Calculate duration if we have both dates
          let duration: number | undefined;
          if (job.scheduled_date && job.completed_date) {
            const durationMs = job.completed_date.getTime() - job.scheduled_date.getTime();
            duration = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
          }

          await prisma.workerHistory.create({
            data: {
              worker_id: worker.id,
              changed_at: job.completed_date || job.updated_at,
              change_type: 'JOB_COMPLETED',
              description: `Completed maintenance: ${job.title} at ${propertyName}${duration ? ` (${duration} hours)` : ''}`,
              metadata: {
                job_id: job.id,
                job_type: 'MAINTENANCE',
                title: job.title,
                property_name: propertyName,
                duration_hours: duration,
              },
            },
          });
        }

        // JOB_CANCELLED (if cancelled)
        if (job.status === 'CANCELLED') {
          await prisma.workerHistory.create({
            data: {
              worker_id: worker.id,
              changed_at: job.updated_at,
              change_type: 'JOB_CANCELLED',
              description: `Maintenance job "${job.title}" at ${propertyName} was cancelled`,
              metadata: {
                job_id: job.id,
                job_type: 'MAINTENANCE',
                title: job.title,
                property_name: propertyName,
              },
            },
          });
        }
      }

      const maintenanceEventsCount = maintenanceJobs.length +
        maintenanceJobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'COMPLETED').length +
        maintenanceJobs.filter(j => j.status === 'COMPLETED').length +
        maintenanceJobs.filter(j => j.status === 'CANCELLED').length;
      console.log(`  ✅ Created ${maintenanceEventsCount} maintenance job history entries`);

      // 4. Get certificates for this worker and create CERTIFICATE_UPLOADED events
      const certificates = await prisma.workerCertificate.findMany({
        where: { worker_id: worker.id },
        orderBy: { uploaded_at: 'asc' },
      });

      console.log(`  📜 Found ${certificates.length} certificates`);

      for (const cert of certificates) {
        await prisma.workerHistory.create({
          data: {
            worker_id: worker.id,
            changed_at: cert.uploaded_at,
            change_type: 'CERTIFICATE_UPLOADED',
            description: `Certificate "${cert.name}" uploaded`,
            metadata: {
              certificate_id: cert.id,
              certificate_name: cert.name,
              expiry_date: cert.expiry_date?.toISOString(),
            },
          },
        });
      }

      if (certificates.length > 0) {
        console.log(`  ✅ Created ${certificates.length} certificate history entries`);
      }
    }

    console.log('\n\n✨ Backfill completed successfully!');

    // Show summary
    const totalHistoryEntries = await prisma.workerHistory.count();
    console.log(`\n📊 Total worker history entries: ${totalHistoryEntries}`);

    // Show breakdown by event type
    const eventTypeCounts = await prisma.workerHistory.groupBy({
      by: ['change_type'],
      _count: true,
    });

    console.log('\n📈 Events by type:');
    eventTypeCounts
      .sort((a, b) => b._count - a._count)
      .forEach(({ change_type, _count }) => {
        console.log(`  ${change_type}: ${_count}`);
      });

  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillWorkerHistory()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
