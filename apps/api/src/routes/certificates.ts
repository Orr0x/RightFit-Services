import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { uploadDocument } from '../middleware/upload'
import certificatesService from '../services/CertificatesService'
import { CertificateType } from '@rightfit/database'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)

// Create certificate (upload document)
router.post('/', uploadDocument.single('document'), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id

    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' })
    }

    // Validate file type (PDF only for certificates)
    if (req.file.mimetype !== 'application/pdf' && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only PDF or image files are allowed' })
    }

    const { property_id, certificate_type, issue_date, expiry_date, certificate_number, issuer_name, notes } =
      req.body

    if (!property_id || !certificate_type || !issue_date || !expiry_date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate certificate_type
    if (!Object.values(CertificateType).includes(certificate_type)) {
      return res.status(400).json({ error: 'Invalid certificate type' })
    }

    const certificate = await certificatesService.create(tenantId, req.file, {
      property_id,
      certificate_type,
      issue_date,
      expiry_date,
      certificate_number,
      issuer_name,
      notes,
    })

    res.status(201).json({ data: certificate })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// List certificates (with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const { property_id, certificate_type } = req.query

    const filters: any = {}
    if (property_id) filters.property_id = property_id as string
    if (certificate_type) filters.certificate_type = certificate_type as CertificateType

    const certificates = await certificatesService.list(tenantId, filters)

    res.json({ data: certificates })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get expiring soon certificates
router.get('/expiring-soon', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const daysAhead = req.query.days_ahead ? parseInt(req.query.days_ahead as string) : 60

    const certificates = await certificatesService.getExpiringSoon(tenantId, daysAhead)

    res.json({ data: certificates })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get expired certificates
router.get('/expired', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const certificates = await certificatesService.getExpired(tenantId)

    res.json({ data: certificates })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get certificate by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const { id } = req.params

    const certificate = await certificatesService.getById(tenantId, id)

    res.json({ data: certificate })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

// Update certificate
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const { id } = req.params

    const certificate = await certificatesService.update(tenantId, id, req.body)

    res.json({ data: certificate })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Delete certificate (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id
    const { id } = req.params

    await certificatesService.delete(tenantId, id)

    res.status(204).send()
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

export default router
