"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WorkersService_1 = require("../services/WorkersService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const workersService = new WorkersService_1.WorkersService();
router.use(auth_1.authMiddleware);
// GET /api/workers
router.get('/', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const workers = await workersService.list(serviceProviderId);
        res.json({ data: workers });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/workers/:id
router.get('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const worker = await workersService.getById(req.params.id, serviceProviderId);
        res.json({ data: worker });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/workers
router.post('/', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const worker = await workersService.create(req.body, serviceProviderId);
        res.status(201).json({ data: worker });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/workers/:id
router.put('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const worker = await workersService.update(req.params.id, req.body, serviceProviderId);
        res.json({ data: worker });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=workers.js.map