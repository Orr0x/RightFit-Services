import jwt from 'jsonwebtoken'
import { JWTPayload, RefreshTokenPayload } from '@rightfit/shared'

const JWT_SECRET = process.env.JWT_SECRET || ''
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ''

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables')
}

export function generateAccessToken(payload: {
  user_id: string
  tenant_id: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
}): string {
  const options = {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h',
  }
  return jwt.sign(payload, JWT_SECRET, options as any)
}

export function generateRefreshToken(payload: {
  user_id: string
  tenant_id: string
}): string {
  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
  }
  return jwt.sign(payload, JWT_REFRESH_SECRET, options as any)
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload
}
