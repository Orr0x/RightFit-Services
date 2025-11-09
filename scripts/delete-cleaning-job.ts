import { PrismaClient } from '@rightfit/database'

const prisma = new PrismaClient()

async function deleteCleaningJob() {
  try {
    const jobIdPattern = 'b144f548' // The problematic job ID

    console.log(`Looking for jobs with ID containing: ${jobIdPattern}`)

    // List all jobs to find the correct ID
    const jobs = await prisma.cleaningJob.findMany({
      select: {
        id: true,
        scheduled_date: true,
        checklist_template_id: true,
      },
      take: 20
    })

    console.log(`Found ${jobs.length} jobs total:`)
    jobs.forEach(job => {
      console.log(`- ${job.id} (${job.scheduled_date})`)
    })

    // Find jobs with matching pattern
    const matchingJob = jobs.find(job => job.id.includes(jobIdPattern))

    if (!matchingJob) {
      console.log('\nNo job found matching the pattern')
      return
    }

    console.log(`\nFound matching job: ${matchingJob.id}`)

    // Delete the job
    await prisma.cleaningJob.delete({
      where: { id: matchingJob.id }
    })

    console.log('✅ Job deleted successfully')
  } catch (error) {
    console.error('Error deleting job:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteCleaningJob()
