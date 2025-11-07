/**
 * Test Helpers
 *
 * Shared utility functions for testing
 */

import { Request, Response } from 'express'
import { faker } from '@faker-js/faker'

/**
 * Create a mock Express Request object
 */
export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides,
  }
}

/**
 * Create a mock Express Response object
 */
export function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  }
  return res
}

/**
 * Create a mock Next function for middleware testing
 */
export function createMockNext() {
  return jest.fn()
}

/**
 * Wait for a specified amount of time
 * Use sparingly - prefer waitFor from testing-library
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random date within range
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Generate random phone number
 */
export function randomPhoneNumber(): string {
  return faker.phone.number('###-###-####')
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return faker.internet.email().toLowerCase()
}

/**
 * Generate random UUID
 */
export function randomUUID(): string {
  return faker.string.uuid()
}

/**
 * Generate random ISO date string
 */
export function randomISODate(): string {
  return faker.date.future().toISOString()
}

/**
 * Mock file upload object
 */
export function createMockFile(overrides: any = {}) {
  return {
    fieldname: 'file',
    originalname: faker.system.fileName(),
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 1024 * 1024, // 1MB
    ...overrides,
  }
}

/**
 * Mock Multer file array
 */
export function createMockFiles(count: number = 1): any[] {
  return Array.from({ length: count }, () => createMockFile())
}

/**
 * Assert that object matches expected shape
 */
export function expectObjectToMatch(actual: any, expected: any) {
  Object.keys(expected).forEach((key) => {
    if (expected[key] !== undefined) {
      expect(actual).toHaveProperty(key)
      if (typeof expected[key] === 'object' && expected[key] !== null) {
        expectObjectToMatch(actual[key], expected[key])
      } else {
        expect(actual[key]).toEqual(expected[key])
      }
    }
  })
}

/**
 * Assert that object has all required keys
 */
export function expectObjectToHaveKeys(obj: any, keys: string[]) {
  keys.forEach((key) => {
    expect(obj).toHaveProperty(key)
  })
}

/**
 * Assert that array contains objects matching shape
 */
export function expectArrayToContainObjectsMatching(array: any[], expectedShape: any) {
  expect(array.length).toBeGreaterThan(0)
  array.forEach((item) => {
    expectObjectToMatch(item, expectedShape)
  })
}

/**
 * Assert that response has pagination structure
 */
export function expectPaginationStructure(response: any) {
  expect(response).toHaveProperty('data')
  expect(response).toHaveProperty('pagination')
  expect(response.pagination).toHaveProperty('page')
  expect(response.pagination).toHaveProperty('limit')
  expect(response.pagination).toHaveProperty('total')
  expect(response.pagination).toHaveProperty('totalPages')
  expect(Array.isArray(response.data)).toBe(true)
}

/**
 * Assert that error response has correct structure
 */
export function expectErrorResponse(response: any, expectedStatus?: number) {
  expect(response).toHaveProperty('error')
  expect(response.error).toHaveProperty('message')
  if (expectedStatus) {
    expect(response.error).toHaveProperty('status', expectedStatus)
  }
}

/**
 * Generate test JWT payload
 */
export function createTestJWTPayload(overrides: any = {}) {
  return {
    user_id: randomUUID(),
    tenant_id: randomUUID(),
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    ...overrides,
  }
}

/**
 * Suppress console output during tests
 * Useful for testing error cases that log to console
 */
export function suppressConsole() {
  const originalConsole = { ...console }

  beforeAll(() => {
    console.log = jest.fn()
    console.error = jest.fn()
    console.warn = jest.fn()
  })

  afterAll(() => {
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
  })
}

/**
 * Create a test context with common test utilities
 */
export function createTestContext() {
  return {
    mockRequest: createMockRequest,
    mockResponse: createMockResponse,
    mockNext: createMockNext,
    mockFile: createMockFile,
    mockFiles: createMockFiles,
    wait,
    randomDate,
    randomPhoneNumber,
    randomEmail,
    randomUUID,
    randomISODate,
  }
}

/**
 * Retry async function with exponential backoff
 * Useful for flaky tests or external dependencies
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await wait(delayMs * Math.pow(2, i)) // Exponential backoff
      }
    }
  }

  throw lastError
}

/**
 * Run function and measure execution time
 */
export async function measureExecutionTime<T>(fn: () => Promise<T>): Promise<{
  result: T
  duration: number
}> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start

  return { result, duration }
}

/**
 * Assert that function throws specific error
 */
export async function expectToThrowAsync(
  fn: () => Promise<any>,
  expectedError?: string | RegExp
) {
  try {
    await fn()
    fail('Expected function to throw, but it did not')
  } catch (error: any) {
    if (expectedError) {
      if (typeof expectedError === 'string') {
        expect(error.message).toContain(expectedError)
      } else {
        expect(error.message).toMatch(expectedError)
      }
    }
  }
}
