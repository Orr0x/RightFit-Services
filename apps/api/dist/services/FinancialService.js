"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialService = exports.FinancialService = void 0;
const database_1 = require("@rightfit/database");
const errors_1 = require("../utils/errors");
class FinancialService {
    /**
     * Create a new financial transaction
     */
    async createTransaction(input, tenantId) {
        // Verify property belongs to tenant
        const property = await database_1.prisma.property.findFirst({
            where: {
                id: input.propertyId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        // Validate amount is positive
        if (input.amount <= 0) {
            throw new errors_1.ValidationError('Amount must be positive');
        }
        const transaction = await database_1.prisma.financialTransaction.create({
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
        });
        return transaction;
    }
    /**
     * List transactions with filtering and pagination
     */
    async listTransactions(tenantId, options = {}) {
        const { propertyId, type, category, startDate, endDate, page = 1, limit = 50, } = options;
        const skip = (page - 1) * limit;
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
        };
        const [transactions, total] = await Promise.all([
            database_1.prisma.financialTransaction.findMany({
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
            database_1.prisma.financialTransaction.count({ where }),
        ]);
        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get financial summary for a property
     */
    async getPropertySummary(propertyId, tenantId, startDate, endDate) {
        // Verify property exists
        const property = await database_1.prisma.property.findFirst({
            where: {
                id: propertyId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
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
        };
        // Get all transactions
        const transactions = await database_1.prisma.financialTransaction.findMany({
            where,
            select: {
                type: true,
                category: true,
                amount: true,
            },
        });
        // Calculate totals
        const totalIncome = transactions
            .filter((t) => t.type === 'INCOME')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        // Group expenses by category
        const expensesByCategory = {};
        transactions
            .filter((t) => t.type === 'EXPENSE' && t.category)
            .forEach((t) => {
            const cat = t.category;
            expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(t.amount);
        });
        const expensesByCategoryArray = Object.entries(expensesByCategory)
            .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }))
            .sort((a, b) => b.amount - a.amount);
        return {
            propertyId,
            propertyName: property.name,
            totalIncome,
            totalExpenses,
            netIncome: totalIncome - totalExpenses,
            expensesByCategory: expensesByCategoryArray,
            transactions: transactions.length,
        };
    }
    /**
     * Update a transaction
     */
    async updateTransaction(id, input, tenantId) {
        // Verify transaction exists and belongs to tenant
        const existing = await database_1.prisma.financialTransaction.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Transaction not found');
        }
        if (input.amount !== undefined && input.amount <= 0) {
            throw new errors_1.ValidationError('Amount must be positive');
        }
        const updated = await database_1.prisma.financialTransaction.update({
            where: { id },
            data: input,
        });
        return updated;
    }
    /**
     * Soft delete a transaction
     */
    async deleteTransaction(id, tenantId) {
        const existing = await database_1.prisma.financialTransaction.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Transaction not found');
        }
        await database_1.prisma.financialTransaction.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
    /**
     * Set or update budget for a property
     */
    async setBudget(input, tenantId) {
        // Verify property exists
        const property = await database_1.prisma.property.findFirst({
            where: {
                id: input.propertyId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        if (input.monthlyBudget <= 0) {
            throw new errors_1.ValidationError('Monthly budget must be positive');
        }
        if (input.alertThreshold !== undefined) {
            if (input.alertThreshold <= 0 || input.alertThreshold > 1) {
                throw new errors_1.ValidationError('Alert threshold must be between 0 and 1');
            }
        }
        // Upsert budget
        const budget = await database_1.prisma.propertyBudget.upsert({
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
        });
        return budget;
    }
    /**
     * Get budget status for a property
     */
    async getBudgetStatus(propertyId, tenantId) {
        const budget = await database_1.prisma.propertyBudget.findFirst({
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
        });
        if (!budget) {
            return null;
        }
        // Get current month's expenses
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const expenses = await database_1.prisma.financialTransaction.findMany({
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
        });
        const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const monthlyBudget = Number(budget.monthly_budget);
        const alertThreshold = Number(budget.alert_threshold);
        const percentageUsed = (totalSpent / monthlyBudget) * 100;
        const isOverBudget = totalSpent > monthlyBudget;
        const isNearThreshold = percentageUsed >= alertThreshold * 100;
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
        };
    }
    /**
     * Generate CSV export of transactions
     */
    async exportTransactionsCSV(tenantId, options = {}) {
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
        };
        const transactions = await database_1.prisma.financialTransaction.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                property: {
                    select: {
                        name: true,
                    },
                },
            },
        });
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
        ].join(',');
        // CSV rows
        const rows = transactions.map((t) => {
            const date = t.date.toISOString().split('T')[0];
            const property = t.property.name.replace(/,/g, ';'); // Escape commas
            const description = t.description.replace(/,/g, ';');
            const notes = (t.notes || '').replace(/,/g, ';');
            const amount = Number(t.amount).toFixed(2);
            return [
                date,
                property,
                t.type,
                t.category || '',
                description,
                amount,
                t.receipt_url || '',
                notes,
            ].join(',');
        });
        return [header, ...rows].join('\n');
    }
    /**
     * Get properties that are over budget (for cron job alerts)
     */
    async getPropertiesOverBudget(tenantId) {
        const budgets = await database_1.prisma.propertyBudget.findMany({
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
        });
        const results = [];
        for (const budget of budgets) {
            const status = await this.getBudgetStatus(budget.property_id, tenantId);
            if (status?.alerts.isOverBudget || status?.alerts.isNearThreshold) {
                results.push({
                    propertyId: budget.property_id,
                    propertyName: budget.property.name,
                    ownerUserId: budget.property.owner_user_id,
                    ...status.alerts,
                });
            }
        }
        return results;
    }
}
exports.FinancialService = FinancialService;
exports.financialService = new FinancialService();
//# sourceMappingURL=FinancialService.js.map