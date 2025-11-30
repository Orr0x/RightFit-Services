"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const WorkOrdersService_1 = __importDefault(require("../services/WorkOrdersService"));
const database_1 = require("@rightfit/database");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Create work order
router.post('/', async (req, res) => {
    try {
        const { property_id, contractor_id, title, description, priority, category, due_date, estimated_cost } = req.body;
        const tenantId = req.user.tenant_id;
        const userId = req.user.user_id;
        if (!property_id || !title) {
            return res.status(400).json({ error: 'property_id and title are required' });
        }
        const workOrder = await WorkOrdersService_1.default.create(tenantId, userId, {
            property_id,
            contractor_id,
            title,
            description,
            priority,
            category,
            due_date: due_date ? new Date(due_date) : undefined,
            estimated_cost: estimated_cost ? parseFloat(estimated_cost) : undefined,
        });
        logger_1.default.info('Work order created', {
            tenant_id: tenantId,
            work_order_id: workOrder.id,
            user_id: userId,
        });
        res.status(201).json({ data: workOrder });
    }
    catch (error) {
        logger_1.default.error('Create work order error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
// List work orders with filters
router.get('/', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filters = {};
        if (req.query.property_id) {
            filters.property_id = req.query.property_id;
        }
        if (req.query.contractor_id) {
            filters.contractor_id = req.query.contractor_id;
        }
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.priority) {
            filters.priority = req.query.priority;
        }
        if (req.query.category) {
            filters.category = req.query.category;
        }
        const result = await WorkOrdersService_1.default.list(tenantId, filters, page, limit);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('List work orders error', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch work orders' });
    }
});
// Get single work order
router.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const workOrderId = req.params.id;
        const workOrder = await WorkOrdersService_1.default.getById(tenantId, workOrderId);
        if (!workOrder) {
            return res.status(404).json({ error: 'Work order not found' });
        }
        res.json({ data: workOrder });
    }
    catch (error) {
        logger_1.default.error('Get work order error', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch work order' });
    }
});
// Update work order
router.patch('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const workOrderId = req.params.id;
        const updateData = {};
        const allowedFields = [
            'contractor_id',
            'title',
            'description',
            'status',
            'priority',
            'category',
            'due_date',
            'estimated_cost',
            'actual_cost',
            'completion_note',
            'cancellation_reason',
        ];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                if (field === 'due_date') {
                    updateData[field] = new Date(req.body[field]);
                }
                else if (field === 'estimated_cost' || field === 'actual_cost') {
                    updateData[field] = parseFloat(req.body[field]);
                }
                else {
                    updateData[field] = req.body[field];
                }
            }
        });
        const workOrder = await WorkOrdersService_1.default.update(tenantId, workOrderId, updateData);
        logger_1.default.info('Work order updated', {
            tenant_id: tenantId,
            work_order_id: workOrderId,
            user_id: req.user.user_id,
        });
        res.json({ data: workOrder });
    }
    catch (error) {
        logger_1.default.error('Update work order error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
// Delete work order (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const workOrderId = req.params.id;
        await WorkOrdersService_1.default.delete(tenantId, workOrderId);
        logger_1.default.info('Work order deleted', {
            tenant_id: tenantId,
            work_order_id: workOrderId,
            user_id: req.user.user_id,
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error('Delete work order error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
// Assign contractor to work order
router.post('/:id/assign', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const workOrderId = req.params.id;
        const { contractor_id } = req.body;
        if (!contractor_id) {
            return res.status(400).json({ error: 'contractor_id is required' });
        }
        const workOrder = await WorkOrdersService_1.default.assignContractor(tenantId, workOrderId, contractor_id);
        logger_1.default.info('Contractor assigned to work order', {
            tenant_id: tenantId,
            work_order_id: workOrderId,
            contractor_id,
            user_id: req.user.user_id,
        });
        res.json({ data: workOrder });
    }
    catch (error) {
        logger_1.default.error('Assign contractor error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
// Update work order status
router.post('/:id/status', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const workOrderId = req.params.id;
        const { status, note } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'status is required' });
        }
        const validStatuses = Object.values(database_1.WorkOrderStatus);
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const workOrder = await WorkOrdersService_1.default.updateStatus(tenantId, workOrderId, status, note);
        logger_1.default.info('Work order status updated', {
            tenant_id: tenantId,
            work_order_id: workOrderId,
            status,
            user_id: req.user.user_id,
        });
        res.json({ data: workOrder });
    }
    catch (error) {
        logger_1.default.error('Update status error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=work-orders.js.map