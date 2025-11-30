"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PropertiesService_1 = require("../services/PropertiesService");
const shared_1 = require("@rightfit/shared");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const propertiesService = new PropertiesService_1.PropertiesService();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/properties
router.get('/', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const search = req.query.search;
        const result = await propertiesService.list(tenantId, page, limit, search);
        res.json({ data: result.data, pagination: result.pagination });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/properties/:id
router.get('/:id', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const property = await propertiesService.getById(req.params.id, tenantId);
        res.json({ data: property });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/properties
router.post('/', async (req, res, next) => {
    try {
        const input = shared_1.createPropertySchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        const userId = req.user.user_id;
        const property = await propertiesService.create(input, tenantId, userId);
        res.status(201).json({ data: property });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/properties/:id
router.patch('/:id', async (req, res, next) => {
    try {
        const input = shared_1.updatePropertySchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        const property = await propertiesService.update(req.params.id, input, tenantId);
        res.json({ data: property });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/properties/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        await propertiesService.delete(req.params.id, tenantId);
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=properties.js.map