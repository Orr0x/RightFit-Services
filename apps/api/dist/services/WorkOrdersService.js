"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@rightfit/database");
const SmsService_1 = __importDefault(require("./SmsService"));
const prisma = new database_1.PrismaClient();
class WorkOrdersService {
    async create(tenantId, userId, data) {
        // Verify property belongs to tenant
        const property = await prisma.property.findFirst({
            where: {
                id: data.property_id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!property) {
            throw new Error('Property not found');
        }
        // Verify contractor belongs to tenant if provided
        if (data.contractor_id) {
            const contractor = await prisma.contractor.findFirst({
                where: {
                    id: data.contractor_id,
                    tenant_id: tenantId,
                    deleted_at: null,
                },
            });
            if (!contractor) {
                throw new Error('Contractor not found');
            }
        }
        return await prisma.workOrder.create({
            data: {
                tenant_id: tenantId,
                property_id: data.property_id,
                contractor_id: data.contractor_id,
                created_by_user_id: userId,
                title: data.title,
                description: data.description,
                priority: data.priority || database_1.WorkOrderPriority.MEDIUM,
                category: data.category || database_1.WorkOrderCategory.OTHER,
                due_date: data.due_date,
                estimated_cost: data.estimated_cost,
            },
            include: {
                property: true,
                contractor: true,
                created_by: {
                    select: {
                        id: true,
                        email: true,
                        full_name: true,
                    },
                },
            },
        });
    }
    async list(tenantId, filters = {}, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {
            tenant_id: tenantId,
            deleted_at: null,
        };
        if (filters.property_id) {
            where.property_id = filters.property_id;
        }
        if (filters.contractor_id) {
            where.contractor_id = filters.contractor_id;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.category) {
            where.category = filters.category;
        }
        const [workOrders, total] = await Promise.all([
            prisma.workOrder.findMany({
                where,
                skip,
                take: limit,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            address_line1: true,
                            city: true,
                            postcode: true,
                        },
                    },
                    contractor: {
                        select: {
                            id: true,
                            name: true,
                            trade: true,
                            phone: true,
                        },
                    },
                    created_by: {
                        select: {
                            id: true,
                            email: true,
                            full_name: true,
                        },
                    },
                },
                orderBy: [
                    { priority: 'desc' },
                    { created_at: 'desc' },
                ],
            }),
            prisma.workOrder.count({ where }),
        ]);
        return {
            data: workOrders,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async getById(tenantId, workOrderId) {
        return await prisma.workOrder.findFirst({
            where: {
                id: workOrderId,
                tenant_id: tenantId,
                deleted_at: null,
            },
            include: {
                property: true,
                contractor: true,
                created_by: {
                    select: {
                        id: true,
                        email: true,
                        full_name: true,
                    },
                },
                photos: true,
            },
        });
    }
    async update(tenantId, workOrderId, data) {
        // Verify work order belongs to tenant
        const workOrder = await prisma.workOrder.findFirst({
            where: {
                id: workOrderId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!workOrder) {
            throw new Error('Work order not found');
        }
        // Verify contractor belongs to tenant if provided
        if (data.contractor_id) {
            const contractor = await prisma.contractor.findFirst({
                where: {
                    id: data.contractor_id,
                    tenant_id: tenantId,
                    deleted_at: null,
                },
            });
            if (!contractor) {
                throw new Error('Contractor not found');
            }
        }
        // Auto-set timestamps based on status changes
        const updateData = { ...data };
        if (data.status === database_1.WorkOrderStatus.IN_PROGRESS && !workOrder.started_at) {
            updateData.started_at = new Date();
        }
        if (data.status === database_1.WorkOrderStatus.COMPLETED && !workOrder.completed_at) {
            updateData.completed_at = new Date();
        }
        return await prisma.workOrder.update({
            where: { id: workOrderId },
            data: updateData,
            include: {
                property: true,
                contractor: true,
                created_by: {
                    select: {
                        id: true,
                        email: true,
                        full_name: true,
                    },
                },
            },
        });
    }
    async delete(tenantId, workOrderId) {
        const workOrder = await prisma.workOrder.findFirst({
            where: {
                id: workOrderId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!workOrder) {
            throw new Error('Work order not found');
        }
        await prisma.workOrder.update({
            where: { id: workOrderId },
            data: { deleted_at: new Date() },
        });
    }
    async assignContractor(tenantId, workOrderId, contractorId) {
        // Update work order with contractor
        const workOrder = await this.update(tenantId, workOrderId, { contractor_id: contractorId });
        // Send SMS notification if contractor has phone and didn't opt out
        try {
            const contractor = await prisma.contractor.findFirst({
                where: {
                    id: contractorId,
                    tenant_id: tenantId,
                    deleted_at: null,
                },
            });
            const property = await prisma.property.findFirst({
                where: {
                    id: workOrder.property_id,
                    tenant_id: tenantId,
                    deleted_at: null,
                },
                include: {
                    owner: true,
                },
            });
            if (contractor && property && !contractor.sms_opt_out) {
                await SmsService_1.default.sendWorkOrderAssignmentNotification({
                    contractorName: contractor.name,
                    contractorPhone: contractor.phone,
                    workOrderTitle: workOrder.title,
                    propertyAddress: `${property.address_line1}, ${property.city}`,
                    priority: workOrder.priority,
                    landlordName: property.owner.full_name,
                    landlordPhone: property.owner.email, // In production, store phone on user
                });
            }
        }
        catch (smsError) {
            // Log error but don't fail the assignment
            console.error('SMS notification error:', smsError.message);
        }
        return workOrder;
    }
    async updateStatus(tenantId, workOrderId, status, note) {
        const updateData = { status };
        if (status === database_1.WorkOrderStatus.COMPLETED && note) {
            updateData.completion_note = note;
        }
        if (status === database_1.WorkOrderStatus.CANCELLED && note) {
            updateData.cancellation_reason = note;
        }
        return await this.update(tenantId, workOrderId, updateData);
    }
}
exports.default = new WorkOrdersService();
//# sourceMappingURL=WorkOrdersService.js.map