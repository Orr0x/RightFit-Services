import { PrismaClient } from '@rightfit/database'

const prisma = new PrismaClient()

async function updatePhotoUrls() {
  console.log('Starting photo URL update...')

  // Get all photos with localhost URLs
  const photos = await prisma.photo.findMany({
    where: {
      OR: [
        { s3_url: { contains: 'localhost' } },
        { thumbnail_url: { contains: 'localhost' } },
      ],
    },
  })

  console.log(`Found ${photos.length} photos to update`)

  const apiBaseUrl = process.env.API_BASE_URL || 'http://192.168.0.17:3001'

  for (const photo of photos) {
    const updates: any = {}

    if (photo.s3_url.includes('localhost')) {
      updates.s3_url = photo.s3_url.replace(
        /http:\/\/localhost:\d+/,
        apiBaseUrl
      )
    }

    if (photo.thumbnail_url?.includes('localhost')) {
      updates.thumbnail_url = photo.thumbnail_url.replace(
        /http:\/\/localhost:\d+/,
        apiBaseUrl
      )
    }

    if (Object.keys(updates).length > 0) {
      await prisma.photo.update({
        where: { id: photo.id },
        data: updates,
      })
      console.log(`Updated photo ${photo.id}`)
    }
  }

  console.log('Photo URL update complete!')
  await prisma.$disconnect()
}

updatePhotoUrls()
  .catch((error) => {
    console.error('Error updating photo URLs:', error)
    process.exit(1)
  })
