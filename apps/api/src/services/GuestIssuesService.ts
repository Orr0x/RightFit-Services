import { prisma } from '@rightfit/database';
import { NotFoundError } from '../utils/errors';

export class GuestIssuesService {
  async list(propertyId?: string) {
    const issues = await prisma.guestIssueReport.findMany({
      where: {
        ...(propertyId && { property_id: propertyId }),
      },
      include: {
        property: {
          select: {
            property_name: true,
            address: true,
          },
        },
      },
      orderBy: { reported_at: 'desc' },
    });

    return issues;
  }

  async getById(id: string) {
    const issue = await prisma.guestIssueReport.findUnique({
      where: { id },
      include: {
        property: true,
        maintenance_jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundError('Guest issue report not found');
    }

    return issue;
  }

  async create(data: {
    property_id: string;
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
    issue_type: string;
    issue_description: string;
    photos?: string[];
  }) {
    const issue = await prisma.guestIssueReport.create({
      data: {
        property_id: data.property_id,
        guest_name: data.guest_name,
        guest_phone: data.guest_phone,
        guest_email: data.guest_email,
        issue_type: data.issue_type,
        issue_description: data.issue_description,
        photos: data.photos || [],
      },
      include: {
        property: true,
      },
    });

    return issue;
  }

  async update(id: string, data: any) {
    const issue = await prisma.guestIssueReport.update({
      where: { id },
      data,
    });

    return issue;
  }

  async triage(id: string, triageData: {
    ai_severity?: string;
    ai_category?: string;
    ai_confidence?: number;
    ai_analysis_notes?: string;
    status: 'TRIAGED' | 'WORK_ORDER_CREATED' | 'RESOLVED' | 'DISMISSED';
  }) {
    const issue = await prisma.guestIssueReport.update({
      where: { id },
      data: {
        ...triageData,
        triaged_at: new Date(),
      },
    });

    return issue;
  }
}
