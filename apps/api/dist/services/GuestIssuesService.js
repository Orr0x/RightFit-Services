"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestIssuesService = void 0;
const database_1 = require("@rightfit/database");
const errors_1 = require("../utils/errors");
class GuestIssuesService {
    async list(propertyId) {
        const issues = await database_1.prisma.guestIssueReport.findMany({
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
    async getById(id) {
        const issue = await database_1.prisma.guestIssueReport.findUnique({
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
            throw new errors_1.NotFoundError('Guest issue report not found');
        }
        return issue;
    }
    async create(data) {
        const issue = await database_1.prisma.guestIssueReport.create({
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
    async update(id, data) {
        const issue = await database_1.prisma.guestIssueReport.update({
            where: { id },
            data,
        });
        return issue;
    }
    async triage(id, triageData) {
        const issue = await database_1.prisma.guestIssueReport.update({
            where: { id },
            data: {
                ...triageData,
                triaged_at: new Date(),
            },
        });
        return issue;
    }
}
exports.GuestIssuesService = GuestIssuesService;
//# sourceMappingURL=GuestIssuesService.js.map