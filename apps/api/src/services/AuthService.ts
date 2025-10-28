import { prisma } from '@rightfit/database'
import { RegisterInput, LoginInput, AuthResponse } from '@rightfit/shared'
import { hashPassword, comparePassword } from '../utils/hash'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { v4 as uuidv4 } from 'uuid'

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    })

    if (existingUser) {
      throw new ConflictError('Account already exists. Please log in.')
    }

    // Hash password
    const password_hash = await hashPassword(input.password)

    // Create tenant and user in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          tenant_name: input.company_name || input.full_name,
          subscription_status: 'TRIAL',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          email: input.email.toLowerCase(),
          password_hash,
          full_name: input.full_name,
          role: 'ADMIN',
        },
      })

      return { user, tenant }
    })

    // Generate tokens
    const access_token = generateAccessToken({
      user_id: result.user.id,
      tenant_id: result.user.tenant_id,
      email: result.user.email,
      role: result.user.role,
    })

    const refresh_token = generateRefreshToken({
      user_id: result.user.id,
      tenant_id: result.user.tenant_id,
    })

    // Return without password_hash
    const { password_hash: _, ...userWithoutPassword } = result.user

    return {
      user: userWithoutPassword as any,
      tenant: result.tenant as any,
      access_token,
      refresh_token,
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { tenant: true },
    })

    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Check if user is deleted
    if (user.deleted_at) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Verify password
    const isValid = await comparePassword(input.password, user.password_hash)
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Generate tokens
    const access_token = generateAccessToken({
      user_id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      role: user.role,
    })

    const refresh_token = generateRefreshToken({
      user_id: user.id,
      tenant_id: user.tenant_id,
    })

    // Return without password_hash
    const { password_hash: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword as any,
      tenant: user.tenant as any,
      access_token,
      refresh_token,
    }
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const { verifyRefreshToken } = await import('../utils/jwt')
      const payload = verifyRefreshToken(refreshToken)

      // Verify user still exists and is not deleted
      const user = await prisma.user.findUnique({
        where: { id: payload.user_id },
      })

      if (!user || user.deleted_at) {
        throw new UnauthorizedError('Invalid refresh token')
      }

      // Generate new access token
      const access_token = generateAccessToken({
        user_id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role,
      })

      return { access_token }
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token')
    }
  }

  async forgotPassword(email: string): Promise<void> {
    // Find user (but don't reveal if they exist for security)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || user.deleted_at) {
      // Don't reveal if user exists - return success anyway
      return
    }

    // Generate reset token
    const token = uuidv4()
    const expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token,
        expires_at,
      },
    })

    // TODO: Send email with reset link
    // For now, just log it (in production, integrate with SendGrid)
    console.log(`Password reset link: https://app.rightfitservices.com/reset-password?token=${token}`)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      throw new NotFoundError('Invalid or expired reset token')
    }

    // Check if token is expired or already used
    if (resetToken.expires_at < new Date() || resetToken.used_at) {
      throw new NotFoundError('Invalid or expired reset token')
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword)

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user_id },
        data: { password_hash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used_at: new Date() },
      }),
    ])
  }
}
