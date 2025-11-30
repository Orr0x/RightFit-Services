"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const database_1 = require("@rightfit/database");
const errors_1 = require("../utils/errors");
class PropertiesService {
    async list(tenantId, page = 1, limit = 20, search) {
        const skip = (page - 1) * limit;
        const where = {
            tenant_id: tenantId,
            deleted_at: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { address_line1: { contains: search, mode: 'insensitive' } },
                    { postcode: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [properties, total] = await Promise.all([
            database_1.prisma.property.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    _count: {
                        select: {
                            work_orders: true,
                        },
                    },
                },
            }),
            database_1.prisma.property.count({ where }),
        ]);
        return {
            data: properties,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getById(id, tenantId) {
        const property = await database_1.prisma.property.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        full_name: true,
                    },
                },
                _count: {
                    select: {
                        work_orders: {
                            where: {
                                deleted_at: null,
                            },
                        },
                        certificates: {
                            where: {
                                deleted_at: null,
                            },
                        },
                        photos: true,
                    },
                },
            },
        });
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        return property;
    }
    async create(input, tenantId, userId) {
        const property = await database_1.prisma.property.create({
            data: {
                ...input,
                tenant_id: tenantId,
                owner_user_id: userId,
            },
        });
        return property;
    }
    async update(id, input, tenantId) {
        // Verify property exists and belongs to tenant
        const existing = await database_1.prisma.property.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Property not found');
        }
        const property = await database_1.prisma.property.update({
            where: { id },
            data: input,
        });
        return property;
    }
    async delete(id, tenantId) {
        // Verify property exists and belongs to tenant
        const existing = await database_1.prisma.property.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Property not found');
        }
        // Check for active work orders
        const activeWorkOrdersCount = await database_1.prisma.workOrder.count({
            where: {
                property_id: id,
                status: { in: ['OPEN', 'IN_PROGRESS'] },
                deleted_at: null,
            },
        });
        if (activeWorkOrdersCount > 0) {
            throw new errors_1.ValidationError(`Cannot delete property with ${activeWorkOrdersCount} active work order(s). Please complete or cancel them first.`);
        }
        // Soft delete
        const property = await database_1.prisma.property.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
        return property;
    }
}
exports.PropertiesService = PropertiesService;
//# sourceMappingURL=PropertiesService.js.map