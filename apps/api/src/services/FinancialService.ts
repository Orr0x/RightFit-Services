import { prisma } from '@rightfit/database'
import { NotFoundError, ValidationError } from '../utils/errors'

interface CreateTransactionInput {
  propertyId: string
  type: 'INCOME' | 'EXPENSE'
  category?: string
  amount: number
  date: Date
  description: string
  receiptUrl?: string
  notes?: string
}

interface UpdateTransactionInput {
  type?: 'INCOME' | 'EXPENSE'
  category?: string
  amount?: number
  date?: Date
  description?: string
  receiptUrl?: string
  notes?: string
}

interface PropertyFinancialSummary {
  propertyId: string
  propertyName: string
  totalIncome: number
  totalExpenses: number
  netIncome: number
  expensesByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  transactions: number
}

interface SetBudgetInput {
  propertyId: string
  monthlyBudget: number
  alertThreshold?: number
}

export class FinancialService {
  /**
   * Create a new financial transaction
   */
  async createTransaction(
    input: CreateTransactionInput,
    tenantId: string
  ) {
    // Verify property belongs to tenant
    const property = await prisma.property.findFirst({
      where: {
        id: input.propertyId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!property) {
      throw new NotFoundError('Property not found')
    }

    // Validate amount is positive
    if (input.amount <= 0) {
      throw new ValidationError('Amount must be positive')
    }

    const transaction = await prisma.financialTransaction.create({
      data: {
        tenant_id: tenantId,
        property_id: input.propertyId,
        type: input.type,
        category: input.category,
        amount: input.amount,
        date: input.date,
        description: input.description,
        receipt_url: input.receiptUrl,
        notes: input.notes,
      },
    })

    return transaction
  }

  /**
   * List transactions with filtering and pagination
   */
  async listTransactions(
    tenantId: string,
    options: {
      propertyId?: string
      type?: 'INCOME' | 'EXPENSE'
      category?: string
      startDate?: Date
      endDate?: Date
      page?: number
      limit?: number
    } = {}
  ) {
    const {
      propertyId,
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options

    const skip = (page - 1) * limit

    const where = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(propertyId && { property_id: propertyId }),
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    }

    const [transactions, total] = await Promise.all([
      prisma.financialTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.financialTransaction.count({ where }),
    ])

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get financial summary for a property
   */
  async getPropertySummary(
    propertyId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PropertyFinancialSummary> {
    // Verify property exists
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!property) {
      throw new NotFoundError('Property not found')
    }

    const where = {
      property_id: propertyId,
      tenant_id: tenantId,
      deleted_at: null,
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    }

    // Get all transactions
    const transactions = await prisma.financialTransaction.findMany({
      where,
      select: {
        type: true,
        category: true,
        amount: true,
      },
    })

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Group expenses by category
    const expensesByCategory: { [key: string]: number } = {}
    transactions
      .filter((t) => t.type === 'EXPENSE' && t.category)
      .forEach((t) => {
        const cat = t.category!
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(t.amount)
      })

    const expensesByCategoryArray = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    return {
      propertyId,
      propertyName: property.name,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      expensesByCategory: expensesByCategoryArray,
      transactions: transactions.length,
    }
  }

  /**
   * Update a transaction
   */
  async updateTransaction(
    id: string,
    input: UpdateTransactionInput,
    tenantId: string
  ) {
    // Verify transaction exists and belongs to tenant
    const existing = await prisma.financialTransaction.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!existing) {
      throw new NotFoundError('Transaction not found')
    }

    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError('Amount must be positive')
    }

    const updated = await prisma.financialTransaction.update({
      where: { id },
      data: input,
    })

    return updated
  }

  /**
   * Soft delete a transaction
   */
  async deleteTransaction(id: string, tenantId: string) {
    const existing = await prisma.financialTransaction.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!existing) {
      throw new NotFoundError('Transaction not found')
    }

    await prisma.financialTransaction.update({
      where: { id },
      data: { deleted_at: new Date() },
    })
  }

  /**
   * Set or update budget for a property
   */
  async setBudget(input: SetBudgetInput, tenantId: string) {
    // Verify property exists
    const property = await prisma.property.findFirst({
      where: {
        id: input.propertyId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    })

    if (!property) {
      throw new NotFoundError('Property not found')
    }

    if (input.monthlyBudget <= 0) {
      throw new ValidationError('Monthly budget must be positive')
    }

    if (input.alertThreshold !== undefined) {
      if (input.alertThreshold <= 0 || input.alertThreshold > 1) {
        throw new ValidationError('Alert threshold must be between 0 and 1')
      }
    }

    // Upsert budget
    const budget = await prisma.propertyBudget.upsert({
      where: {
        property_id: input.propertyId,
      },
      create: {
        tenant_id: tenantId,
        property_id: input.propertyId,
        monthly_budget: input.monthlyBudget,
        alert_threshold: input.alertThreshold || 0.8,
      },
      update: {
        monthly_budget: input.monthlyBudget,
        ...(input.alertThreshold !== undefined && {
          alert_threshold: input.alertThreshold,
        }),
      },
    })

    return budget
  }

  /**
   * Get budget status for a property
   */
  async getBudgetStatus(propertyId: string, tenantId: string) {
    const budget = await prisma.propertyBudget.findFirst({
      where: {
        property_id: propertyId,
        tenant_id: tenantId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!budget) {
      return null
    }

    // Get current month's expenses
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const expenses = await prisma.financialTransaction.findMany({
      where: {
        property_id: propertyId,
        tenant_id: tenantId,
        type: 'EXPENSE',
        deleted_at: null,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        amount: true,
      },
    })

    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const monthlyBudget = Number(budget.monthly_budget)
    const alertThreshold = Number(budget.alert_threshold)
    const percentageUsed = (totalSpent / monthlyBudget) * 100
    const isOverBudget = totalSpent > monthlyBudget
    const isNearThreshold = percentageUsed >= alertThreshold * 100

    return {
      budget: {
        id: budget.id,
        propertyId: budget.property_id,
        propertyName: budget.property.name,
        monthlyBudget,
        alertThreshold,
      },
      currentMonth: {
        startDate: startOfMonth,
        endDate: endOfMonth,
        totalSpent,
        remaining: monthlyBudget - totalSpent,
        percentageUsed,
      },
      alerts: {
        isOverBudget,
        isNearThreshold: isNearThreshold && !isOverBudget,
        message: isOverBudget
          ? `Over budget by £${(totalSpent - monthlyBudget).toFixed(2)}`
          : isNearThreshold
          ? `${percentageUsed.toFixed(0)}% of budget used`
          : null,
      },
    }
  }

  /**
   * Generate CSV export of transactions
   */
  async exportTransactionsCSV(
    tenantId: string,
    options: {
      propertyId?: string
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<string> {
    const where = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(options.propertyId && { property_id: options.propertyId }),
      ...(options.startDate || options.endDate
        ? {
            date: {
              ...(options.startDate && { gte: options.startDate }),
              ...(options.endDate && { lte: options.endDate }),
            },
          }
        : {}),
    }

    const transactions = await prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
    })

    // CSV header
    const header = [
      'Date',
      'Property',
      'Type',
      'Category',
      'Description',
      'Amount',
      'Receipt URL',
      'Notes',
    ].join(',')

    // CSV rows
    const rows = transactions.map((t) => {
      const date = t.date.toISOString().split('T')[0]
      const property = t.property.name.replace(/,/g, ';') // Escape commas
      const description = t.description.replace(/,/g, ';')
      const notes = (t.notes || '').replace(/,/g, ';')
      const amount = Number(t.amount).toFixed(2)

      return [
        date,
        property,
        t.type,
        t.category || '',
        description,
        amount,
        t.receipt_url || '',
        notes,
      ].join(',')
    })

    return [header, ...rows].join('\n')
  }

  /**
   * Get properties that are over budget (for cron job alerts)
   */
  async getPropertiesOverBudget(tenantId: string) {
    const budgets = await prisma.propertyBudget.findMany({
      where: {
        tenant_id: tenantId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            owner_user_id: true,
          },
        },
      },
    })

    const results = []

    for (const budget of budgets) {
      const status = await this.getBudgetStatus(budget.property_id, tenantId)
      if (status?.alerts.isOverBudget || status?.alerts.isNearThreshold) {
        results.push({
          propertyId: budget.property_id,
          propertyName: budget.property.name,
          ownerUserId: budget.property.owner_user_id,
          ...status.alerts,
        })
      }
    }

    return results
  }
}

export const financialService = new FinancialService()
