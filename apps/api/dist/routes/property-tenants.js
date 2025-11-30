"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TenantService_1 = require("../services/TenantService");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Validation schemas
const createPropertyTenantSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(20).optional(),
    moveInDate: zod_1.z.string().datetime().or(zod_1.z.date()),
    leaseExpiryDate: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    rentAmount: zod_1.z.number().positive(),
    rentFrequency: zod_1.z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']),
    rentDueDay: zod_1.z.number().int().min(1).max(31).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
const updatePropertyTenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(20).optional(),
    moveInDate: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    leaseExpiryDate: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    rentAmount: zod_1.z.number().positive().optional(),
    rentFrequency: zod_1.z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
    rentDueDay: zod_1.z.number().int().min(1).max(31).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'NOTICE_GIVEN']).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
const recordRentPaymentSchema = zod_1.z.object({
    propertyTenantId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    paymentDate: zod_1.z.string().datetime().or(zod_1.z.date()),
    expectedDate: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    paymentMethod: zod_1.z.enum(['BANK_TRANSFER', 'CASH', 'CHEQUE', 'STANDING_ORDER', 'OTHER']).optional(),
    reference: zod_1.z.string().max(100).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
// GET /api/tenants - List property tenants
router.get('/', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const options = {
            propertyId: req.query.propertyId,
            status: req.query.status,
            page,
            limit,
        };
        const result = await TenantService_1.tenantService.listPropertyTenants(tenantId, options);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/tenants/alerts/expiring-leases - Get tenants with expiring leases
// Must be before /:id route to avoid matching
router.get('/alerts/expiring-leases', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const daysInAdvance = parseInt(req.query.days) || 60;
        const expiringLeases = await TenantService_1.tenantService.getExpiringLeases(tenantId, daysInAdvance);
        res.json({ data: expiringLeases });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/tenants/alerts/overdue-rent - Get tenants with overdue rent
router.get('/alerts/overdue-rent', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const overdueRent = await TenantService_1.tenantService.getOverdueRent(tenantId);
        res.json({ data: overdueRent });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/tenants/:id - Get single property tenant
router.get('/:id', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const propertyTenant = await TenantService_1.tenantService.getPropertyTenantById(req.params.id, tenantId);
        res.json({ data: propertyTenant });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/tenants - Create property tenant
router.post('/', async (req, res, next) => {
    try {
        const input = createPropertyTenantSchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        // Convert date strings to Date objects if needed
        const data = {
            ...input,
            moveInDate: typeof input.moveInDate === 'string' ? new Date(input.moveInDate) : input.moveInDate,
            leaseExpiryDate: input.leaseExpiryDate
                ? typeof input.leaseExpiryDate === 'string'
                    ? new Date(input.leaseExpiryDate)
                    : input.leaseExpiryDate
                : undefined,
        };
        const propertyTenant = await TenantService_1.tenantService.createPropertyTenant(data, tenantId);
        res.status(201).json({ data: propertyTenant });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/tenants/:id - Update property tenant
router.patch('/:id', async (req, res, next) => {
    try {
        const input = updatePropertyTenantSchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        // Convert date strings to Date objects if needed
        const { moveInDate, leaseExpiryDate, ...rest } = input;
        const data = {
            ...rest,
            ...(moveInDate && {
                moveInDate: typeof moveInDate === 'string' ? new Date(moveInDate) : moveInDate,
            }),
            ...(leaseExpiryDate && {
                leaseExpiryDate: typeof leaseExpiryDate === 'string' ? new Date(leaseExpiryDate) : leaseExpiryDate,
            }),
        };
        const propertyTenant = await TenantService_1.tenantService.updatePropertyTenant(req.params.id, data, tenantId);
        res.json({ data: propertyTenant });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/tenants/:id - Delete property tenant
router.delete('/:id', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        await TenantService_1.tenantService.deletePropertyTenant(req.params.id, tenantId);
        res.json({ message: 'Property tenant deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/tenants/:id/payments - Record rent payment
router.post('/:id/payments', async (req, res, next) => {
    try {
        const input = recordRentPaymentSchema.parse({
            ...req.body,
            propertyTenantId: req.params.id,
        });
        const tenantId = req.user.tenant_id;
        // Convert date strings to Date objects if needed
        const data = {
            ...input,
            paymentDate: typeof input.paymentDate === 'string' ? new Date(input.paymentDate) : input.paymentDate,
            expectedDate: input.expectedDate
                ? typeof input.expectedDate === 'string'
                    ? new Date(input.expectedDate)
                    : input.expectedDate
                : undefined,
        };
        const payment = await TenantService_1.tenantService.recordRentPayment(data, tenantId);
        res.status(201).json({ data: payment });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/tenants/:id/payments - Get rent payments
router.get('/:id/payments', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const result = await TenantService_1.tenantService.getRentPayments(req.params.id, tenantId, { page, limit });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=property-tenants.js.map