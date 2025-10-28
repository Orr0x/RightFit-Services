import { AuthService } from '../AuthService'
import { prisma } from '@rightfit/database'
import * as hashUtil from '../../utils/hash'
import * as jwtUtil from '../../utils/jwt'

// Mock dependencies
jest.mock('@rightfit/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenant: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('../../utils/hash')
jest.mock('../../utils/jwt')

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
    jest.clearAllMocks()
  })

  describe('register', () => {
    const registerInput = {
      email: 'test@example.com',
      password: 'Test123!@#',
      confirm_password: 'Test123!@#',
      full_name: 'Test User',
      company_name: 'Test Company',
    }

    it('should register a new user and tenant successfully', async () => {
      const mockUser = {
        id: 'user-123',
        tenant_id: 'tenant-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      }

      const mockTenant = {
        id: 'tenant-123',
        tenant_name: 'Test Company',
        subscription_status: 'TRIAL',
        trial_ends_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(hashUtil.hashPassword as jest.Mock).mockResolvedValue('hashed-password')
      ;(prisma.$transaction as jest.Mock).mockResolvedValue({
        user: mockUser,
        tenant: mockTenant,
      })
      ;(jwtUtil.generateAccessToken as jest.Mock).mockReturnValue('access-token')
      ;(jwtUtil.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token')

      const result = await authService.register(registerInput)

      expect(result).toHaveProperty('access_token', 'access-token')
      expect(result).toHaveProperty('refresh_token', 'refresh-token')
      expect(result.user).not.toHaveProperty('password_hash')
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(hashUtil.hashPassword).toHaveBeenCalledWith('Test123!@#')
    })

    it('should throw ConflictError if user already exists', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      })

      await expect(authService.register(registerInput)).rejects.toThrow(
        'Account already exists. Please log in.'
      )
    })
  })

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'Test123!@#',
    }

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        tenant_id: 'tenant-123',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        full_name: 'Test User',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        tenant: {
          id: 'tenant-123',
          tenant_name: 'Test Company',
          subscription_status: 'TRIAL',
          trial_ends_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(hashUtil.comparePassword as jest.Mock).mockResolvedValue(true)
      ;(jwtUtil.generateAccessToken as jest.Mock).mockReturnValue('access-token')
      ;(jwtUtil.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token')

      const result = await authService.login(loginInput)

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('tenant')
      expect(result).toHaveProperty('access_token', 'access-token')
      expect(result).toHaveProperty('refresh_token', 'refresh-token')
      expect(hashUtil.comparePassword).toHaveBeenCalledWith('Test123!@#', 'hashed-password')
    })

    it('should throw UnauthorizedError with invalid email', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password')
    })

    it('should throw UnauthorizedError with invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        deleted_at: null,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(hashUtil.comparePassword as jest.Mock).mockResolvedValue(false)

      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password')
    })

    it('should throw UnauthorizedError for deleted user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        deleted_at: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      await expect(authService.login(loginInput)).rejects.toThrow(
        'Invalid email or password'
      )
    })
  })
})
