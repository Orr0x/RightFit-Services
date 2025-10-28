import { PrismaClient } from '@rightfit/database'

const prisma = new PrismaClient()

async function main() {
  // Delete all photos
  const result = await prisma.photo.deleteMany({})
  console.log(`Deleted ${result.count} photos`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
