import { Router, Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/AuthService'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@rightfit/shared'
import {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rateLimiter'

const router: Router = Router()
const authService = new AuthService()

// POST /api/auth/register
router.post('/register', registerRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = registerSchema.parse(req.body)
    const result = await authService.register(input)
    res.status(201).json({ data: result })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/login
router.post('/login', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body)
    const result = await authService.login(input)
    res.json({ data: result })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const result = await authService.refresh(refresh_token)
    res.json({ data: result })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', passwordResetRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = forgotPasswordSchema.parse(req.body)
    await authService.forgotPassword(input.email)
    res.json({ message: 'Password reset link sent to your email' })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = resetPasswordSchema.parse(req.body)
    await authService.resetPassword(input.token, input.new_password)
    res.json({ message: 'Password reset successfully. Please log in.' })
  } catch (error) {
    next(error)
  }
})

export default router
