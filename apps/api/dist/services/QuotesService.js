"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesService = void 0;
const database_1 = require("@rightfit/database");
const errors_1 = require("../utils/errors");
class QuotesService {
    async list(serviceProviderId, status) {
        const quotes = await database_1.prisma.quote.findMany({
            where: {
                customer: {
                    service_provider_id: serviceProviderId,
                },
                ...(status && { status: status }),
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        business_name: true,
                        contact_name: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return quotes;
    }
    async getById(id, serviceProviderId) {
        const quote = await database_1.prisma.quote.findFirst({
            where: {
                id,
                customer: {
                    service_provider_id: serviceProviderId,
                },
            },
            include: {
                customer: true,
                maintenance_jobs: {
                    include: {
                        property: true,
                    },
                },
            },
        });
        if (!quote) {
            throw new errors_1.NotFoundError('Quote not found');
        }
        return quote;
    }
    async create(data, _serviceProviderId) {
        // Generate quote number
        const count = await database_1.prisma.quote.count();
        const quoteNumber = `Q-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const quote = await database_1.prisma.quote.create({
            data: {
                ...data,
                quote_number: quoteNumber,
            },
            include: {
                customer: true,
            },
        });
        return quote;
    }
    async update(id, data, serviceProviderId) {
        await this.getById(id, serviceProviderId);
        const quote = await database_1.prisma.quote.update({
            where: { id },
            data,
            include: {
                customer: true,
            },
        });
        return quote;
    }
    async approve(id, approvedBy, _serviceProviderId) {
        const quote = await database_1.prisma.quote.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approved_at: new Date(),
                approved_by: approvedBy,
            },
        });
        return quote;
    }
    async decline(id, reason) {
        const quote = await database_1.prisma.quote.update({
            where: { id },
            data: {
                status: 'DECLINED',
                customer_response: reason,
            },
        });
        return quote;
    }
}
exports.QuotesService = QuotesService;
//# sourceMappingURL=QuotesService.js.map