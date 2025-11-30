"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FinancialService_1 = require("../services/FinancialService");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Validation schemas
const expenseCategoryEnum = zod_1.z.enum([
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
]);
const createTransactionSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['INCOME', 'EXPENSE']),
    category: expenseCategoryEnum.optional(),
    amount: zod_1.z.number().positive(),
    date: zod_1.z.string().datetime().or(zod_1.z.date()),
    description: zod_1.z.string().min(1).max(500),
    receiptUrl: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
const updateTransactionSchema = zod_1.z.object({
    type: zod_1.z.enum(['INCOME', 'EXPENSE']).optional(),
    category: expenseCategoryEnum.optional(),
    amount: zod_1.z.number().positive().optional(),
    date: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    description: zod_1.z.string().min(1).max(500).optional(),
    receiptUrl: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
const setBudgetSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid(),
    monthlyBudget: zod_1.z.number().positive(),
    alertThreshold: zod_1.z.number().min(0).max(1).optional(),
});
// GET /api/financial/transactions - List transactions
router.get('/transactions', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const options = {
            propertyId: req.query.propertyId,
            type: req.query.type,
            category: req.query.category,
            startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
            page,
            limit,
        };
        const result = await FinancialService_1.financialService.listTransactions(tenantId, options);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/financial/transactions - Create transaction
router.post('/transactions', async (req, res, next) => {
    try {
        const input = createTransactionSchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        // Convert date string to Date if needed
        const data = {
            ...input,
            date: typeof input.date === 'string' ? new Date(input.date) : input.date,
        };
        const transaction = await FinancialService_1.financialService.createTransaction(data, tenantId);
        res.status(201).json({ data: transaction });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/financial/transactions/:id - Update transaction
router.patch('/transactions/:id', async (req, res, next) => {
    try {
        const input = updateTransactionSchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        // Convert date string to Date if needed
        const { date, ...rest } = input;
        const data = {
            ...rest,
            ...(date && {
                date: typeof date === 'string' ? new Date(date) : date,
            }),
        };
        const transaction = await FinancialService_1.financialService.updateTransaction(req.params.id, data, tenantId);
        res.json({ data: transaction });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/financial/transactions/:id - Delete transaction
router.delete('/transactions/:id', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        await FinancialService_1.financialService.deleteTransaction(req.params.id, tenantId);
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/financial/reports/property/:propertyId - Get property financial summary
router.get('/reports/property/:propertyId', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const { propertyId } = req.params;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        const summary = await FinancialService_1.financialService.getPropertySummary(propertyId, tenantId, startDate, endDate);
        res.json({ data: summary });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/financial/budgets - Set or update budget
router.post('/budgets', async (req, res, next) => {
    try {
        const input = setBudgetSchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        const budget = await FinancialService_1.financialService.setBudget(input, tenantId);
        res.json({ data: budget });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/financial/budgets/:propertyId - Get budget status
router.get('/budgets/:propertyId', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const { propertyId } = req.params;
        const status = await FinancialService_1.financialService.getBudgetStatus(propertyId, tenantId);
        res.json({ data: status });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/financial/export - Export transactions as CSV
router.get('/export', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const options = {
            propertyId: req.query.propertyId,
            startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        };
        const csv = await FinancialService_1.financialService.exportTransactionsCSV(tenantId, options);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send(csv);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=financial.js.map