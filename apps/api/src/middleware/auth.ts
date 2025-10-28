import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { UnauthorizedError } from '../utils/errors'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string
        tenant_id: string
        email: string
        role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
      }
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)

    req.user = {
      user_id: decoded.user_id,
      tenant_id: decoded.tenant_id,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'))
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyAccessToken(token)

      req.user = {
        user_id: decoded.user_id,
        tenant_id: decoded.tenant_id,
        email: decoded.email,
        role: decoded.role,
      }
    }

    next()
  } catch (error) {
    // If token is invalid, just continue without user
    next()
  }
}

// Export alias for backwards compatibility
export const authenticate = authMiddleware
