import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export interface GuestSessionCreate {
  property_id: string;
  device_id?: string;
}

export interface GuestQuestionCreate {
  session_id: string;
  question: string;
}

export interface GuestIssueCreate {
  session_id: string;
  category: string;
  description: string;
  photos?: string[];
}

export class GuestAIService {
  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  async createSession(data: GuestSessionCreate) {
    const property = await prisma.customerProperty.findUnique({
      where: { id: data.property_id },
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    const session = await prisma.guestSession.create({
      data: {
        property_id: data.property_id,
        device_id: data.device_id,
      },
    });

    return session;
  }

  async endSession(sessionId: string) {
    const session = await prisma.guestSession.update({
      where: { id: sessionId },
      data: {
        session_end: new Date(),
      },
    });

    return session;
  }

  async getSession(sessionId: string) {
    const session = await prisma.guestSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { created_at: 'desc' },
          take: 20,
        },
        issues: {
          orderBy: { created_at: 'desc' },
        },
        property: {
          include: {
            knowledge_base: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    return session;
  }

  // ============================================================================
  // AI Q&A (SIMPLIFIED - MOCK RESPONSES)
  // ============================================================================

  async askQuestion(data: GuestQuestionCreate) {
    const session = await prisma.guestSession.findUnique({
      where: { id: data.session_id },
      include: {
        property: {
          include: {
            knowledge_base: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Increment interactions counter
    await prisma.guestSession.update({
      where: { id: data.session_id },
      data: {
        interactions_count: { increment: 1 },
      },
    });

    // MOCK AI RESPONSE - In production, this would call OpenAI/Claude
    const answer = this.generateMockAnswer(data.question, session.property.knowledge_base);

    const question = await prisma.guestQuestion.create({
      data: {
        session_id: data.session_id,
        question: data.question,
        answer: answer.text,
        answered_by: 'AI',
        confidence: answer.confidence,
      },
    });

    return question;
  }

  private generateMockAnswer(question: string, knowledgeBase: any[]) {
    const q = question.toLowerCase();

    // Simple keyword matching
    if (q.includes('wifi') || q.includes('password') || q.includes('internet')) {
      return {
        text: `The WiFi network is "GuestNetwork" and the password is "Welcome2024!". The router is located in the living room closet. If you have any issues connecting, try restarting your device.`,
        confidence: 0.95,
      };
    }

    if (q.includes('checkout') || q.includes('check out') || q.includes('leaving')) {
      return {
        text: `Check-out time is 10:00 AM. Please ensure all lights are off, thermostat is set to 68°F, and doors are locked. Leave the keys in the lockbox using code 1234#. Thank you for staying with us!`,
        confidence: 0.92,
      };
    }

    if (q.includes('hot tub') || q.includes('hottub') || q.includes('spa')) {
      return {
        text: `To use the hot tub:\n1. Remove the cover\n2. Press the power button (glows blue)\n3. Set temperature to 102°F\n4. Wait 15-20 minutes\n\nPress "Jets 1" for main jets, "Jets 2" for massage jets. Maximum session: 15 minutes. Please replace cover when done!`,
        confidence: 0.88,
      };
    }

    if (q.includes('restaurant') || q.includes('food') || q.includes('eat') || q.includes('bbq')) {
      return {
        text: `Great local restaurants nearby:\n\n🥩 Bennett's Pit Bar-B-Que (5 min drive) - Famous ribs and pulled pork\n🍝 Mama's Italian Kitchen (10 min) - Authentic pasta and pizza\n🍳 Mountain View Cafe (7 min) - Best breakfast in town\n\nWould you like directions to any of these?`,
        confidence: 0.85,
      };
    }

    if (q.includes('thermostat') || q.includes('heat') || q.includes('ac') || q.includes('temperature')) {
      return {
        text: `The thermostat is a Nest Learning model located in the hallway. To adjust:\n1. Tap the display to wake it\n2. Turn the outer ring to change temperature\n3. Press to confirm\n\nRecommended: 72°F for comfort, 68°F for energy savings. The system automatically adjusts overnight.`,
        confidence: 0.90,
      };
    }

    // Generic fallback
    return {
      text: `I'm not sure about that specific question, but I'm here to help! You can ask me about:\n• WiFi and internet\n• Check-in/check-out times\n• How to use appliances (hot tub, fireplace, TV)\n• Local recommendations (restaurants, attractions)\n• House rules and amenities\n\nYou can also report any issues using the "Report an Issue" button, or contact the property manager directly at (555) 123-4567 for urgent matters.`,
      confidence: 0.60,
    };
  }

  // ============================================================================
  // ISSUE REPORTING & AI TRIAGE
  // ============================================================================

  async reportIssue(data: GuestIssueCreate) {
    const session = await prisma.guestSession.findUnique({
      where: { id: data.session_id },
      include: {
        property: {
          include: {
            customer: {
              include: {
                service_provider: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // MOCK AI TRIAGE - In production, this would use computer vision + ML
    const triage = this.triageIssue(data.category, data.description);

    // Create the issue
    const issue = await prisma.guestIssue.create({
      data: {
        session_id: data.session_id,
        category: data.category,
        description: data.description,
        severity: triage.severity,
        ai_confidence: triage.confidence,
        photos: data.photos ? JSON.stringify(data.photos) : null,
        recommended_action: triage.recommended_action,
      },
    });

    // Create AI assessment
    await prisma.aIAssessment.create({
      data: {
        issue_id: issue.id,
        diagnosis: triage.diagnosis,
        confidence: triage.confidence,
        severity: triage.severity,
        estimated_cost: triage.estimated_cost,
        estimated_time: triage.estimated_time,
      },
    });

    return {
      issue,
      triage,
    };
  }

  private triageIssue(category: string, description: string) {
    const desc = description.toLowerCase();

    // Plumbing issues
    if (category === 'plumbing' || desc.includes('leak') || desc.includes('water')) {
      if (desc.includes('flood') || desc.includes('burst')) {
        return {
          severity: 'critical',
          confidence: 0.95,
          diagnosis: 'Major water leak detected. Immediate action required to prevent water damage.',
          recommended_action: 'send_tech',
          estimated_cost: 250,
          estimated_time: 30,
        };
      }

      if (desc.includes('toilet') || desc.includes('flush')) {
        return {
          severity: 'medium',
          confidence: 0.88,
          diagnosis: 'Toilet malfunction. Likely a broken flush handle or flapper issue.',
          recommended_action: 'diy',
          estimated_cost: 45,
          estimated_time: 15,
        };
      }

      return {
        severity: 'medium',
        confidence: 0.75,
        diagnosis: 'Plumbing issue detected. Requires professional assessment.',
        recommended_action: 'send_tech',
        estimated_cost: 150,
        estimated_time: 45,
      };
    }

    // HVAC issues
    if (category === 'hvac' || desc.includes('heat') || desc.includes('cold') || desc.includes('ac')) {
      if (desc.includes('not working') || desc.includes('broken')) {
        return {
          severity: 'high',
          confidence: 0.82,
          diagnosis: 'HVAC system not functioning. Could be thermostat or unit malfunction.',
          recommended_action: 'send_tech',
          estimated_cost: 200,
          estimated_time: 60,
        };
      }

      return {
        severity: 'low',
        confidence: 0.70,
        diagnosis: 'HVAC adjustment needed. May be resolved with thermostat settings.',
        recommended_action: 'diy',
        estimated_cost: 0,
        estimated_time: 5,
      };
    }

    // Electrical issues
    if (category === 'electrical' || desc.includes('light') || desc.includes('power') || desc.includes('outlet')) {
      if (desc.includes('spark') || desc.includes('smoke')) {
        return {
          severity: 'critical',
          confidence: 0.98,
          diagnosis: 'ELECTRICAL HAZARD - Sparks or smoke detected. Immediate safety concern.',
          recommended_action: 'send_tech',
          estimated_cost: 300,
          estimated_time: 20,
        };
      }

      return {
        severity: 'medium',
        confidence: 0.80,
        diagnosis: 'Electrical issue detected. Requires professional electrician.',
        recommended_action: 'send_tech',
        estimated_cost: 125,
        estimated_time: 30,
      };
    }

    // Cleaning issues
    if (category === 'cleaning' || desc.includes('dirty') || desc.includes('stain')) {
      return {
        severity: 'low',
        confidence: 0.85,
        diagnosis: 'Cleaning issue. Will be addressed before next guest check-in.',
        recommended_action: 'notify_manager',
        estimated_cost: 50,
        estimated_time: 30,
      };
    }

    // Default fallback
    return {
      severity: 'medium',
      confidence: 0.65,
      diagnosis: 'Issue reported. Property manager will be notified for assessment.',
      recommended_action: 'notify_manager',
      estimated_cost: 100,
      estimated_time: 60,
    };
  }

  async getDIYGuide(issueType: string) {
    const guide = await prisma.dIYGuide.findFirst({
      where: {
        issue_type: {
          contains: issueType,
          mode: 'insensitive',
        },
      },
    });

    if (!guide) {
      // Return a generic guide
      return {
        id: 'generic',
        issue_type: issueType,
        title: 'General Troubleshooting',
        steps: [
          { step: 1, instruction: 'Identify the problem area' },
          { step: 2, instruction: 'Check if the issue is still occurring' },
          { step: 3, instruction: 'If issue persists, request professional help' },
        ],
        video_url: null,
        difficulty: 'easy',
        estimated_time: 5,
        success_rate: 0.5,
      };
    }

    return guide;
  }

  async recordDIYAttempt(issueId: string, guideId: string, successful: boolean, timeSpent?: number) {
    const attempt = await prisma.dIYAttempt.create({
      data: {
        issue_id: issueId,
        guide_id: guideId,
        successful,
        time_spent: timeSpent,
        escalated: !successful,
      },
    });

    // Update guide success rate
    const allAttempts = await prisma.dIYAttempt.findMany({
      where: { guide_id: guideId },
    });

    const successCount = allAttempts.filter(a => a.successful).length;
    const successRate = successCount / allAttempts.length;

    await prisma.dIYGuide.update({
      where: { id: guideId },
      data: { success_rate: successRate },
    });

    return attempt;
  }

  // ============================================================================
  // KNOWLEDGE BASE
  // ============================================================================

  async getPropertyKnowledge(propertyId: string, category?: string) {
    const where: any = { property_id: propertyId };
    if (category) {
      where.category = category;
    }

    const knowledge = await prisma.propertyKnowledgeBase.findMany({
      where,
      orderBy: { view_count: 'desc' },
    });

    return knowledge;
  }

  async incrementKnowledgeView(knowledgeId: string) {
    await prisma.propertyKnowledgeBase.update({
      where: { id: knowledgeId },
      data: {
        view_count: { increment: 1 },
      },
    });
  }

  async getLocalRecommendations(category?: string) {
    const where: any = {};
    if (category) {
      where.category = category;
    }

    const recommendations = await prisma.localRecommendation.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
    });

    return recommendations;
  }
}
