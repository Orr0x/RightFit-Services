import { prisma } from '@rightfit/database'

/**
 * Migrates photo URLs from absolute URLs to relative paths
 * This fixes the issue where photos stored with network IPs (e.g., http://192.168.0.17:3001)
 * become inaccessible when accessed from different networks/hosts
 */
async function migratePhotoUrls() {
  console.log('Starting photo URL migration...\n')

  const absoluteUrlPattern = /^https?:\/\/[^\/]+(.+)$/
  let totalMigrated = 0

  try {
    // 1. Migrate worker_issue_reports.photos (JSON array field)
    console.log('1. Migrating worker_issue_reports.photos...')
    const issues = await prisma.workerIssueReport.findMany({
      where: {
        photos: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        photos: true,
        title: true
      }
    })

    console.log(`   Found ${issues.length} issue reports with photos`)

    for (const issue of issues) {
      const originalPhotos = issue.photos as string[]
      const updatedPhotos = originalPhotos.map((photo: string) => {
        if (photo.startsWith('http://') || photo.startsWith('https://')) {
          const match = photo.match(absoluteUrlPattern)
          return match ? match[1] : photo
        }
        return photo
      })

      // Only update if there were changes
      const hasChanges = originalPhotos.some((photo: string, idx: number) => photo !== updatedPhotos[idx])

      if (hasChanges) {
        await prisma.workerIssueReport.update({
          where: { id: issue.id },
          data: { photos: updatedPhotos }
        })
        console.log(`   ✓ Migrated issue "${issue.title}": ${originalPhotos.length} photos`)
        totalMigrated += originalPhotos.length
      }
    }

    console.log(`   Completed: ${totalMigrated} photos migrated in worker issue reports\n`)

    // 2. Migrate workers.photo_url
    console.log('2. Migrating workers.photo_url...')
    const workersResult = await prisma.$executeRaw`
      UPDATE workers
      SET photo_url = REGEXP_REPLACE(photo_url, '^https?://[^/]+', '')
      WHERE photo_url ~ '^https?://'
      RETURNING id
    `
    console.log(`   ✓ Migrated ${workersResult} worker photo URLs\n`)

    // 3. Migrate photos table (s3_url and thumbnail_url)
    console.log('3. Migrating photos.s3_url and photos.thumbnail_url...')
    const photosResult = await prisma.$executeRaw`
      UPDATE photos
      SET s3_url = REGEXP_REPLACE(s3_url, '^https?://[^/]+', ''),
          thumbnail_url = REGEXP_REPLACE(thumbnail_url, '^https?://[^/]+', '')
      WHERE s3_url ~ '^https?://' OR thumbnail_url ~ '^https?://'
      RETURNING id
    `
    console.log(`   ✓ Migrated ${photosResult} records in photos table\n`)

    console.log('✅ Migration completed successfully!')
    console.log(`\nSummary:`)
    console.log(`  - Worker issue reports: ${totalMigrated} photos`)
    console.log(`  - Worker profiles: ${workersResult} records`)
    console.log(`  - Photos table: ${photosResult} records`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migratePhotoUrls()
  .then(() => {
    console.log('\n✅ Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  })
