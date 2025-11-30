"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MaintenanceJobsService_1 = require("../services/MaintenanceJobsService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const maintenanceJobsService = new MaintenanceJobsService_1.MaintenanceJobsService();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/maintenance-jobs
router.get('/', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            worker_id: req.query.worker_id,
            contractor_id: req.query.contractor_id,
            property_id: req.query.property_id,
            customer_id: req.query.customer_id,
            from_date: req.query.from_date ? new Date(req.query.from_date) : undefined,
            to_date: req.query.to_date ? new Date(req.query.to_date) : undefined,
        };
        const result = await maintenanceJobsService.list(serviceProviderId, page, limit, filters);
        res.json({ data: result.data, pagination: result.pagination });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/maintenance-jobs/:id
router.get('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const job = await maintenanceJobsService.getById(req.params.id, serviceProviderId);
        res.json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/maintenance-jobs
router.post('/', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const job = await maintenanceJobsService.create(req.body, serviceProviderId);
        res.status(201).json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/maintenance-jobs/:id
router.put('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const job = await maintenanceJobsService.update(req.params.id, req.body, serviceProviderId);
        res.json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/maintenance-jobs/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        await maintenanceJobsService.delete(req.params.id, serviceProviderId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// POST /api/maintenance-jobs/from-cleaning-issue
// Create maintenance job from cleaning job issue
router.post('/from-cleaning-issue', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const { cleaning_job_id, ...issueData } = req.body;
        const job = await maintenanceJobsService.createFromCleaningIssue(cleaning_job_id, issueData, serviceProviderId);
        res.status(201).json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=maintenance-jobs.js.map