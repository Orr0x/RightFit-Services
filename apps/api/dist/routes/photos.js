"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const PhotosService_1 = __importDefault(require("../services/PhotosService"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Upload photo
router.post('/', upload_1.upload.single('photo'), async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const userId = req.user.user_id;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { property_id, work_order_id, label, caption, gps_latitude, gps_longitude } = req.body;
        const result = await PhotosService_1.default.uploadPhoto(tenantId, userId, req.file, {
            property_id,
            work_order_id,
            label,
            caption,
            gps_latitude: gps_latitude ? parseFloat(gps_latitude) : undefined,
            gps_longitude: gps_longitude ? parseFloat(gps_longitude) : undefined,
        });
        if (!result.uploadSuccess) {
            return res.status(500).json({ error: result.error || 'Failed to upload photo' });
        }
        logger_1.default.info('Photo uploaded', {
            tenant_id: tenantId,
            photo_id: result.photo.id,
            user_id: userId,
        });
        res.status(201).json({ data: result.photo });
    }
    catch (error) {
        logger_1.default.error('Upload photo error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
// List photos with filters
router.get('/', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const filters = {};
        if (req.query.property_id) {
            filters.property_id = req.query.property_id;
        }
        if (req.query.work_order_id) {
            filters.work_order_id = req.query.work_order_id;
        }
        const photos = await PhotosService_1.default.list(tenantId, filters);
        res.json({ data: photos });
    }
    catch (error) {
        logger_1.default.error('List photos error', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});
// Get single photo
router.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const photoId = req.params.id;
        const photo = await PhotosService_1.default.getById(tenantId, photoId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        res.json({ data: photo });
    }
    catch (error) {
        logger_1.default.error('Get photo error', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});
// Delete photo
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const photoId = req.params.id;
        await PhotosService_1.default.delete(tenantId, photoId);
        logger_1.default.info('Photo deleted', {
            tenant_id: tenantId,
            photo_id: photoId,
            user_id: req.user.user_id,
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error('Delete photo error', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=photos.js.map