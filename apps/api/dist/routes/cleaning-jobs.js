"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CleaningJobsService_1 = require("../services/CleaningJobsService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const cleaningJobsService = new CleaningJobsService_1.CleaningJobsService();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/cleaning-jobs
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
            worker_id: req.query.worker_id,
            property_id: req.query.property_id,
            customer_id: req.query.customer_id,
            from_date: req.query.from_date ? new Date(req.query.from_date) : undefined,
            to_date: req.query.to_date ? new Date(req.query.to_date) : undefined,
        };
        const result = await cleaningJobsService.list(serviceProviderId, page, limit, filters);
        res.json({ data: result.data, pagination: result.pagination });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/cleaning-jobs/:id
router.get('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const job = await cleaningJobsService.getById(req.params.id, serviceProviderId);
        res.json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/cleaning-jobs
router.post('/', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const job = await cleaningJobsService.create(req.body, serviceProviderId);
        res.status(201).json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/cleaning-jobs/:id
router.put('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const job = await cleaningJobsService.update(req.params.id, req.body, serviceProviderId);
        res.json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/cleaning-jobs/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        await cleaningJobsService.delete(req.params.id, serviceProviderId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// Mobile worker endpoints
// GET /api/cleaning-jobs/worker/today
router.get('/worker/today', async (req, res, next) => {
    try {
        const workerId = req.query.worker_id;
        if (!workerId) {
            return res.status(400).json({ error: 'worker_id is required' });
        }
        const jobs = await cleaningJobsService.getTodaysJobs(workerId);
        res.json({ data: jobs });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/cleaning-jobs/:id/start
router.post('/:id/start', async (req, res, next) => {
    try {
        const workerId = req.body.worker_id;
        if (!workerId) {
            return res.status(400).json({ error: 'worker_id is required' });
        }
        const job = await cleaningJobsService.startJob(req.params.id, workerId);
        res.json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/cleaning-jobs/:id/complete
router.post('/:id/complete', async (req, res, next) => {
    try {
        const workerId = req.body.worker_id;
        if (!workerId) {
            return res.status(400).json({ error: 'worker_id is required' });
        }
        const job = await cleaningJobsService.completeJob(req.params.id, workerId, {
            completion_notes: req.body.completion_notes,
            actual_price: req.body.actual_price,
        });
        res.json({ data: job });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=cleaning-jobs.js.map