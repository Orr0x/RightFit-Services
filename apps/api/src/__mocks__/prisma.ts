/**
 * Prisma Mock for Unit Testing
 *
 * Mocked Prisma client to avoid database calls in unit tests
 */

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

// Reset mock before each test
beforeEach(() => {
  mockReset(prismaMock)
})

// Export as default for easy importing
export default prismaMock
