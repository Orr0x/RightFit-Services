const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeUnassignFromJobHistory() {
  try {
    // Find all WORKER_UNASSIGNED entries in job history
    const unassignedEntries = await prisma.cleaningJobHistory.findMany({
      where: {
        change_type: 'WORKER_UNASSIGNED',
      },
      orderBy: {
        changed_at: 'desc',
      },
    })

    console.log(`Found ${unassignedEntries.length} WORKER_UNASSIGNED entries in job history:`)
    unassignedEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ID: ${entry.id}, Job: ${entry.cleaning_job_id}, Date: ${entry.changed_at}, Description: ${entry.description}`)
    })

    if (unassignedEntries.length === 0) {
      console.log('No worker unassignment entries found in job history.')
      return
    }

    // Delete all WORKER_UNASSIGNED entries
    const result = await prisma.cleaningJobHistory.deleteMany({
      where: {
        change_type: 'WORKER_UNASSIGNED',
      },
    })

    console.log(`\n✅ Deleted ${result.count} WORKER_UNASSIGNED entries from job history`)
  } catch (error) {
    console.error('Error removing unassignment from job history:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeUnassignFromJobHistory()
