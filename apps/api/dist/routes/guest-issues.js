"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GuestIssuesService_1 = require("../services/GuestIssuesService");
const router = (0, express_1.Router)();
const guestIssuesService = new GuestIssuesService_1.GuestIssuesService();
// No auth required for guest reporting
// GET /api/guest-issues
router.get('/', async (req, res, next) => {
    try {
        const propertyId = req.query.property_id;
        const issues = await guestIssuesService.list(propertyId);
        res.json({ data: issues });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/guest-issues/:id
router.get('/:id', async (req, res, next) => {
    try {
        const issue = await guestIssuesService.getById(req.params.id);
        res.json({ data: issue });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/guest-issues
// Public endpoint for guests to report issues
router.post('/', async (req, res, next) => {
    try {
        const issue = await guestIssuesService.create(req.body);
        res.status(201).json({
            data: issue,
            message: 'Thank you for reporting this issue. We will address it as soon as possible.',
        });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/guest-issues/:id
router.put('/:id', async (req, res, next) => {
    try {
        const issue = await guestIssuesService.update(req.params.id, req.body);
        res.json({ data: issue });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/guest-issues/:id/triage
router.post('/:id/triage', async (req, res, next) => {
    try {
        const issue = await guestIssuesService.triage(req.params.id, req.body);
        res.json({ data: issue });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=guest-issues.js.map