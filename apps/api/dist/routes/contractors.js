"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ContractorsService_1 = __importDefault(require("../services/ContractorsService"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Create contractor
router.post('/', async (req, res) => {
    try {
        const { name, trade, company_name, phone, email, notes, sms_opt_out, user_id } = req.body;
        const tenantId = req.user.tenant_id;
        if (!name || !trade || !phone) {
            return res.status(400).json({ error: 'name, trade, and phone are required' });
        }
        const contractor = await ContractorsService_1.default.create(tenantId, {
            name,
            trade,
            company_name,
            phone,
            email,
            notes,
            sms_opt_out,
            user_id,
        });
        logger_1.default.info('Contractor created', {
            tenant_id: tenantId,
            contractor_id: contractor.id,
            user_id: req.user.user_id,
        });
        res.status(201).json({ data: contractor });
    }
    catch (error) {
        logger_1.default.error('Create contractor error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
// List contractors with filters
router.get('/', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filters = {};
        if (req.query.trade) {
            filters.trade = req.query.trade;
        }
        if (req.query.search) {
            filters.search = req.query.search;
        }
        const result = await ContractorsService_1.default.list(tenantId, filters, page, limit);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('List contractors error', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch contractors' });
    }
});
// Get contractors by trade
router.get('/by-trade/:trade', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const trade = req.params.trade;
        const contractors = await ContractorsService_1.default.getByTrade(tenantId, trade);
        res.json({ data: contractors });
    }
    catch (error) {
        logger_1.default.error('Get contractors by trade error', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch contractors' });
    }
});
// Get single contractor
router.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const contractorId = req.params.id;
        const contractor = await ContractorsService_1.default.getById(tenantId, contractorId);
        if (!contractor) {
            return res.status(404).json({ error: 'Contractor not found' });
        }
        res.json({ data: contractor });
    }
    catch (error) {
        logger_1.default.error('Get contractor error', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch contractor' });
    }
});
// Update contractor
router.patch('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const contractorId = req.params.id;
        const updateData = {};
        const allowedFields = [
            'name',
            'trade',
            'company_name',
            'phone',
            'email',
            'notes',
            'sms_opt_out',
        ];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        const contractor = await ContractorsService_1.default.update(tenantId, contractorId, updateData);
        logger_1.default.info('Contractor updated', {
            tenant_id: tenantId,
            contractor_id: contractorId,
            user_id: req.user.user_id,
        });
        res.json({ data: contractor });
    }
    catch (error) {
        logger_1.default.error('Update contractor error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
// Delete contractor (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const contractorId = req.params.id;
        await ContractorsService_1.default.delete(tenantId, contractorId);
        logger_1.default.info('Contractor deleted', {
            tenant_id: tenantId,
            contractor_id: contractorId,
            user_id: req.user.user_id,
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error('Delete contractor error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=contractors.js.map