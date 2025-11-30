"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const CertificatesService_1 = __importDefault(require("../services/CertificatesService"));
const database_1 = require("@rightfit/database");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Create certificate (upload document)
router.post('/', upload_1.uploadDocument.single('document'), async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }
        // Validate file type (PDF only for certificates)
        if (req.file.mimetype !== 'application/pdf' && !req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'Only PDF or image files are allowed' });
        }
        const { property_id, certificate_type, issue_date, expiry_date, certificate_number, issuer_name, notes } = req.body;
        if (!property_id || !certificate_type || !issue_date || !expiry_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Validate certificate_type
        if (!Object.values(database_1.CertificateType).includes(certificate_type)) {
            return res.status(400).json({ error: 'Invalid certificate type' });
        }
        const certificate = await CertificatesService_1.default.create(tenantId, req.file, {
            property_id,
            certificate_type,
            issue_date,
            expiry_date,
            certificate_number,
            issuer_name,
            notes,
        });
        res.status(201).json({ data: certificate });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// List certificates (with optional filters)
router.get('/', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const { property_id, certificate_type } = req.query;
        const filters = {};
        if (property_id)
            filters.property_id = property_id;
        if (certificate_type)
            filters.certificate_type = certificate_type;
        const certificates = await CertificatesService_1.default.list(tenantId, filters);
        res.json({ data: certificates });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get expiring soon certificates
router.get('/expiring-soon', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const daysAhead = req.query.days_ahead ? parseInt(req.query.days_ahead) : 60;
        const certificates = await CertificatesService_1.default.getExpiringSoon(tenantId, daysAhead);
        res.json({ data: certificates });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get expired certificates
router.get('/expired', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const certificates = await CertificatesService_1.default.getExpired(tenantId);
        res.json({ data: certificates });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get certificate by ID
router.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const { id } = req.params;
        const certificate = await CertificatesService_1.default.getById(tenantId, id);
        res.json({ data: certificate });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
// Update certificate
router.patch('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const { id } = req.params;
        const certificate = await CertificatesService_1.default.update(tenantId, id, req.body);
        res.json({ data: certificate });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete certificate (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const { id } = req.params;
        await CertificatesService_1.default.delete(tenantId, id);
        res.status(204).send();
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=certificates.js.map