/**
 * Authentication Middleware Unit Tests
 */

import { authMiddleware } from '../auth'
import { createMockRequest, createMockResponse, createMockNext } from '../../../../tests/setup/test-helpers'
import jwt from 'jsonwebtoken'

// Mock jsonwebtoken
jest.mock('jsonwebtoken')
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('authMiddleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should authenticate valid token', () => {
    const mockPayload = {
      user_id: 'user-123',
      tenant_id: 'tenant-123',
      role: 'ADMIN',
    }

    mockJwt.verify.mockReturnValue(mockPayload as any)

    const req = createMockRequest({
      headers: {
        authorization: 'Bearer valid-token',
      },
    })
    const res = createMockResponse()
    const next = createMockNext()

    authMiddleware(req as any, res as any, next)

    expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', JWT_SECRET)
    expect(req.user).toEqual(mockPayload)
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should reject missing authorization header', () => {
    const req = createMockRequest({
      headers: {},
    })
    const res = createMockResponse()
    const next = createMockNext()

    authMiddleware(req as any, res as any, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: expect.stringContaining('No token'),
      }),
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should reject invalid token format', () => {
    const req = createMockRequest({
      headers: {
        authorization: 'InvalidFormat',
      },
    })
    const res = createMockResponse()
    const next = createMockNext()

    authMiddleware(req as any, res as any, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: expect.stringContaining('Invalid token format'),
      }),
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should reject expired token', () => {
    mockJwt.verify.mockImplementation(() => {
      const error: any = new Error('jwt expired')
      error.name = 'TokenExpiredError'
      throw error
    })

    const req = createMockRequest({
      headers: {
        authorization: 'Bearer expired-token',
      },
    })
    const res = createMockResponse()
    const next = createMockNext()

    authMiddleware(req as any, res as any, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: expect.stringContaining('Token expired'),
      }),
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should reject malformed token', () => {
    mockJwt.verify.mockImplementation(() => {
      const error: any = new Error('jwt malformed')
      error.name = 'JsonWebTokenError'
      throw error
    })

    const req = createMockRequest({
      headers: {
        authorization: 'Bearer malformed-token',
      },
    })
    const res = createMockResponse()
    const next = createMockNext()

    authMiddleware(req as any, res as any, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: expect.stringContaining('Invalid token'),
      }),
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should attach user data to request', () => {
    const mockPayload = {
      user_id: 'user-456',
      tenant_id: 'tenant-456',
      role: 'WORKER',
    }

    mockJwt.verify.mockReturnValue(mockPayload as any)

    const req = createMockRequest({
      headers: {
        authorization: 'Bearer valid-token',
      },
    })
    const res = createMockResponse()
    const next = createMockNext()

    authMiddleware(req as any, res as any, next)

    expect(req.user).toEqual(mockPayload)
    expect((req.user as any).user_id).toBe('user-456')
    expect((req.user as any).tenant_id).toBe('tenant-456')
    expect((req.user as any).role).toBe('WORKER')
  })
})
