import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma Client
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  // @ts-ignore
  prisma = global.prisma
}

// Middleware: Auto-filter by tenant_id and deleted_at for multi-tenancy
// Note: This is applied at the service layer for better control
// See API middleware for tenant_id injection

export { prisma }
export * from '@prisma/client'
