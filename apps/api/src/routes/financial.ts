import { Router, Request, Response, NextFunction } from 'express'
import { financialService } from '../services/FinancialService'
import { authMiddleware } from '../middleware/auth'
import { ExpenseCategory } from '@rightfit/database'
import { z } from 'zod'

const router: Router = Router()

// All routes require authentication
router.use(authMiddleware)

// Validation schemas
const expenseCategoryEnum = z.enum([
  'MAINTENANCE',
  'REPAIRS',
  'UTILITIES',
  'INSURANCE',
  'PROPERTY_TAX',
  'MANAGEMENT_FEES',
  'MORTGAGE',
  'LEGAL_FEES',
  'CLEANING',
  'GARDENING',
  'SAFETY_CERTIFICATES',
  'OTHER',
])

const createTransactionSchema = z.object({
  propertyId: z.string().uuid(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: expenseCategoryEnum.optional(),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  description: z.string().min(1).max(500),
  receiptUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
})

const updateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: expenseCategoryEnum.optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  description: z.string().min(1).max(500).optional(),
  receiptUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
})

const setBudgetSchema = z.object({
  propertyId: z.string().uuid(),
  monthlyBudget: z.number().positive(),
  alertThreshold: z.number().min(0).max(1).optional(),
})

// GET /api/financial/transactions - List transactions
router.get('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)

    const options = {
      propertyId: req.query.propertyId as string | undefined,
      type: req.query.type as 'INCOME' | 'EXPENSE' | undefined,
      category: req.query.category as ExpenseCategory | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page,
      limit,
    }

    const result = await financialService.listTransactions(tenantId, options)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

// POST /api/financial/transactions - Create transaction
router.post('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createTransactionSchema.parse(req.body)
    const tenantId = req.user!.tenant_id

    // Convert date string to Date if needed
    const data = {
      ...input,
      date: typeof input.date === 'string' ? new Date(input.date) : input.date,
    }

    const transaction = await financialService.createTransaction(data, tenantId)
    res.status(201).json({ data: transaction })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/financial/transactions/:id - Update transaction
router.patch('/transactions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateTransactionSchema.parse(req.body)
    const tenantId = req.user!.tenant_id

    // Convert date string to Date if needed
    const { date, ...rest } = input
    const data = {
      ...rest,
      ...(date && {
        date: typeof date === 'string' ? new Date(date) : date,
      }),
    }

    const transaction = await financialService.updateTransaction(req.params.id, data, tenantId)
    res.json({ data: transaction })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/financial/transactions/:id - Delete transaction
router.delete('/transactions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    await financialService.deleteTransaction(req.params.id, tenantId)
    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// GET /api/financial/reports/property/:propertyId - Get property financial summary
router.get('/reports/property/:propertyId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const { propertyId } = req.params

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

    const summary = await financialService.getPropertySummary(propertyId, tenantId, startDate, endDate)
    res.json({ data: summary })
  } catch (error) {
    next(error)
  }
})

// POST /api/financial/budgets - Set or update budget
router.post('/budgets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = setBudgetSchema.parse(req.body)
    const tenantId = req.user!.tenant_id

    const budget = await financialService.setBudget(input, tenantId)
    res.json({ data: budget })
  } catch (error) {
    next(error)
  }
})

// GET /api/financial/budgets/:propertyId - Get budget status
router.get('/budgets/:propertyId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id
    const { propertyId } = req.params

    const status = await financialService.getBudgetStatus(propertyId, tenantId)
    res.json({ data: status })
  } catch (error) {
    next(error)
  }
})

// GET /api/financial/export - Export transactions as CSV
router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id

    const options = {
      propertyId: req.query.propertyId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    }

    const csv = await financialService.exportTransactionsCSV(tenantId, options)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv')
    res.send(csv)
  } catch (error) {
    next(error)
  }
})

export default router
