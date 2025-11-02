import { Router, Request, Response, NextFunction } from 'express';
import { GuestAIService } from '../services/GuestAIService';

const router: Router = Router();
const guestAIService = new GuestAIService();

// ============================================================================
// GUEST SESSION MANAGEMENT (No auth required - anonymous access)
// ============================================================================

// POST /api/guest/sessions
router.post('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { property_id, device_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ error: 'property_id is required' });
    }

    const session = await guestAIService.createSession({ property_id, device_id });
    res.status(201).json({ data: session });
  } catch (error) {
    next(error);
  }
});

// POST /api/guest/sessions/:id/end
router.post('/sessions/:id/end', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.id;
    const session = await guestAIService.endSession(sessionId);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
});

// GET /api/guest/sessions/:id
router.get('/sessions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.id;
    const session = await guestAIService.getSession(sessionId);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AI Q&A
// ============================================================================

// POST /api/guest/questions
router.post('/questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_id, question } = req.body;

    if (!session_id || !question) {
      return res.status(400).json({ error: 'session_id and question are required' });
    }

    const result = await guestAIService.askQuestion({ session_id, question });
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ISSUE REPORTING & AI TRIAGE
// ============================================================================

// POST /api/guest/issues
router.post('/issues', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_id, category, description, photos } = req.body;

    if (!session_id || !category || !description) {
      return res.status(400).json({ error: 'session_id, category, and description are required' });
    }

    const result = await guestAIService.reportIssue({
      session_id,
      category,
      description,
      photos,
    });
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DIY GUIDES
// ============================================================================

// GET /api/guest/diy-guides/:issueType
router.get('/diy-guides/:issueType', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issueType = req.params.issueType;
    const guide = await guestAIService.getDIYGuide(issueType);
    res.json({ data: guide });
  } catch (error) {
    next(error);
  }
});

// POST /api/guest/diy-attempts
router.post('/diy-attempts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { issue_id, guide_id, successful, time_spent } = req.body;

    if (!issue_id || !guide_id || successful === undefined) {
      return res.status(400).json({ error: 'issue_id, guide_id, and successful are required' });
    }

    const attempt = await guestAIService.recordDIYAttempt(issue_id, guide_id, successful, time_spent);
    res.status(201).json({ data: attempt });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// KNOWLEDGE BASE & RECOMMENDATIONS
// ============================================================================

// GET /api/guest/knowledge/:propertyId?category=xxx
router.get('/knowledge/:propertyId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.params.propertyId;
    const category = req.query.category as string | undefined;

    const knowledge = await guestAIService.getPropertyKnowledge(propertyId, category);
    res.json({ data: knowledge });
  } catch (error) {
    next(error);
  }
});

// POST /api/guest/knowledge/:knowledgeId/view
router.post('/knowledge/:knowledgeId/view', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const knowledgeId = req.params.knowledgeId;
    await guestAIService.incrementKnowledgeView(knowledgeId);
    res.json({ message: 'View recorded' });
  } catch (error) {
    next(error);
  }
});

// GET /api/guest/recommendations?category=xxx
router.get('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const recommendations = await guestAIService.getLocalRecommendations(category);
    res.json({ data: recommendations });
  } catch (error) {
    next(error);
  }
});

export default router;
