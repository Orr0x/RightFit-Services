const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeUnassignHistory() {
  try {
    // Find all JOB_UNASSIGNED entries
    const unassignedEntries = await prisma.workerHistory.findMany({
      where: {
        change_type: 'JOB_UNASSIGNED',
      },
      orderBy: {
        changed_at: 'desc',
      },
    })

    console.log(`Found ${unassignedEntries.length} JOB_UNASSIGNED entries:`)
    unassignedEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ID: ${entry.id}, Worker: ${entry.worker_id}, Date: ${entry.changed_at}, Description: ${entry.description}`)
    })

    if (unassignedEntries.length === 0) {
      console.log('No unassignment entries found.')
      return
    }

    // Delete all JOB_UNASSIGNED entries
    const result = await prisma.workerHistory.deleteMany({
      where: {
        change_type: 'JOB_UNASSIGNED',
      },
    })

    console.log(`\n✅ Deleted ${result.count} JOB_UNASSIGNED entries from worker history`)
  } catch (error) {
    console.error('Error removing unassignment history:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeUnassignHistory()
