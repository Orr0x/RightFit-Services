"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const QuotesService_1 = require("../services/QuotesService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const quotesService = new QuotesService_1.QuotesService();
router.use(auth_1.authMiddleware);
// GET /api/quotes
router.get('/', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const status = req.query.status;
        const quotes = await quotesService.list(serviceProviderId, status);
        res.json({ data: quotes });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/quotes/:id
router.get('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.query.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const quote = await quotesService.getById(req.params.id, serviceProviderId);
        res.json({ data: quote });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/quotes
router.post('/', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const quote = await quotesService.create(req.body, serviceProviderId);
        res.status(201).json({ data: quote });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/quotes/:id
router.put('/:id', async (req, res, next) => {
    try {
        const serviceProviderId = req.body.service_provider_id;
        if (!serviceProviderId) {
            return res.status(400).json({ error: 'service_provider_id is required' });
        }
        const quote = await quotesService.update(req.params.id, req.body, serviceProviderId);
        res.json({ data: quote });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/quotes/:id/approve
router.post('/:id/approve', async (req, res, next) => {
    try {
        const approvedBy = req.body.approved_by || 'Customer';
        const quote = await quotesService.approve(req.params.id, approvedBy);
        res.json({ data: quote });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/quotes/:id/decline
router.post('/:id/decline', async (req, res, next) => {
    try {
        const reason = req.body.reason || '';
        const quote = await quotesService.decline(req.params.id, reason);
        res.json({ data: quote });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=quotes.js.map