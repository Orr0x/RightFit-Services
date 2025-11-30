"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantService = exports.TenantService = void 0;
const database_1 = require("@rightfit/database");
const errors_1 = require("../utils/errors");
const date_fns_1 = require("date-fns");
class TenantService {
    /**
     * Create a new property tenant
     */
    async createPropertyTenant(input, tenantId) {
        // Verify property exists and belongs to tenant
        const property = await database_1.prisma.property.findFirst({
            where: {
                id: input.propertyId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        // Validate rent amount is positive
        if (input.rentAmount <= 0) {
            throw new errors_1.ValidationError('Rent amount must be positive');
        }
        // Validate rent due day if provided
        if (input.rentDueDay !== undefined) {
            if (input.rentDueDay < 1 || input.rentDueDay > 31) {
                throw new errors_1.ValidationError('Rent due day must be between 1 and 31');
            }
        }
        // Validate lease expiry date is after move-in date
        if (input.leaseExpiryDate && (0, date_fns_1.isBefore)(input.leaseExpiryDate, input.moveInDate)) {
            throw new errors_1.ValidationError('Lease expiry date must be after move-in date');
        }
        const propertyTenant = await database_1.prisma.propertyTenant.create({
            data: {
                tenant_id: tenantId,
                property_id: input.propertyId,
                name: input.name,
                email: input.email,
                phone: input.phone,
                move_in_date: input.moveInDate,
                lease_expiry_date: input.leaseExpiryDate,
                rent_amount: input.rentAmount,
                rent_frequency: input.rentFrequency,
                rent_due_day: input.rentDueDay,
                notes: input.notes,
                status: 'ACTIVE',
            },
        });
        return propertyTenant;
    }
    /**
     * List property tenants with filtering
     */
    async listPropertyTenants(tenantId, options = {}) {
        const { propertyId, status, page = 1, limit = 50 } = options;
        const skip = (page - 1) * limit;
        const where = {
            tenant_id: tenantId,
            deleted_at: null,
            ...(propertyId && { property_id: propertyId }),
            ...(status && { status }),
        };
        const [propertyTenants, total] = await Promise.all([
            database_1.prisma.propertyTenant.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            rent_payments: true,
                        },
                    },
                },
            }),
            database_1.prisma.propertyTenant.count({ where }),
        ]);
        return {
            data: propertyTenants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get a single property tenant by ID
     */
    async getPropertyTenantById(id, tenantId) {
        const propertyTenant = await database_1.prisma.propertyTenant.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                rent_payments: {
                    orderBy: {
                        payment_date: 'desc',
                    },
                    take: 10,
                },
            },
        });
        if (!propertyTenant) {
            throw new errors_1.NotFoundError('Property tenant not found');
        }
        return propertyTenant;
    }
    /**
     * Update a property tenant
     */
    async updatePropertyTenant(id, input, tenantId) {
        // Verify exists
        const existing = await database_1.prisma.propertyTenant.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Property tenant not found');
        }
        // Validate rent amount if provided
        if (input.rentAmount !== undefined && input.rentAmount <= 0) {
            throw new errors_1.ValidationError('Rent amount must be positive');
        }
        // Validate rent due day if provided
        if (input.rentDueDay !== undefined) {
            if (input.rentDueDay < 1 || input.rentDueDay > 31) {
                throw new errors_1.ValidationError('Rent due day must be between 1 and 31');
            }
        }
        // Validate lease expiry date if both dates are being updated
        const moveInDate = input.moveInDate || existing.move_in_date;
        const leaseExpiryDate = input.leaseExpiryDate || existing.lease_expiry_date;
        if (leaseExpiryDate && (0, date_fns_1.isBefore)(leaseExpiryDate, moveInDate)) {
            throw new errors_1.ValidationError('Lease expiry date must be after move-in date');
        }
        const updated = await database_1.prisma.propertyTenant.update({
            where: { id },
            data: input,
        });
        return updated;
    }
    /**
     * Delete (soft) a property tenant
     */
    async deletePropertyTenant(id, tenantId) {
        const existing = await database_1.prisma.propertyTenant.findFirst({
            where: {
                id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Property tenant not found');
        }
        await database_1.prisma.propertyTenant.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
    /**
     * Record a rent payment
     */
    async recordRentPayment(input, tenantId) {
        // Verify property tenant exists and belongs to tenant
        const propertyTenant = await database_1.prisma.propertyTenant.findFirst({
            where: {
                id: input.propertyTenantId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!propertyTenant) {
            throw new errors_1.NotFoundError('Property tenant not found');
        }
        if (input.amount <= 0) {
            throw new errors_1.ValidationError('Payment amount must be positive');
        }
        const payment = await database_1.prisma.rentPayment.create({
            data: {
                property_tenant_id: input.propertyTenantId,
                amount: input.amount,
                payment_date: input.paymentDate,
                expected_date: input.expectedDate,
                payment_method: input.paymentMethod,
                reference: input.reference,
                notes: input.notes,
            },
        });
        return payment;
    }
    /**
     * Get rent payments for a property tenant
     */
    async getRentPayments(propertyTenantId, tenantId, options = {}) {
        const { page = 1, limit = 50 } = options;
        const skip = (page - 1) * limit;
        // Verify property tenant exists
        const propertyTenant = await database_1.prisma.propertyTenant.findFirst({
            where: {
                id: propertyTenantId,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!propertyTenant) {
            throw new errors_1.NotFoundError('Property tenant not found');
        }
        const [payments, total] = await Promise.all([
            database_1.prisma.rentPayment.findMany({
                where: {
                    property_tenant_id: propertyTenantId,
                },
                skip,
                take: limit,
                orderBy: { payment_date: 'desc' },
            }),
            database_1.prisma.rentPayment.count({
                where: {
                    property_tenant_id: propertyTenantId,
                },
            }),
        ]);
        return {
            data: payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get property tenants with expiring leases (for cron job alerts)
     */
    async getExpiringLeases(tenantId, daysInAdvance = 60) {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const futureDate = (0, date_fns_1.addDays)(today, daysInAdvance);
        const propertyTenants = await database_1.prisma.propertyTenant.findMany({
            where: {
                tenant_id: tenantId,
                status: 'ACTIVE',
                deleted_at: null,
                lease_expiry_date: {
                    gte: today,
                    lte: futureDate,
                },
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        owner_user_id: true,
                    },
                },
            },
            orderBy: {
                lease_expiry_date: 'asc',
            },
        });
        return propertyTenants.map((pt) => {
            const daysUntilExpiry = Math.ceil((pt.lease_expiry_date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
                id: pt.id,
                tenantName: pt.name,
                propertyId: pt.property.id,
                propertyName: pt.property.name,
                ownerUserId: pt.property.owner_user_id,
                leaseExpiryDate: pt.lease_expiry_date,
                daysUntilExpiry,
            };
        });
    }
    /**
     * Get overdue rent (for cron job alerts)
     * This is a simplified version - in production you'd want more sophisticated logic
     */
    async getOverdueRent(tenantId) {
        const today = (0, date_fns_1.startOfDay)(new Date());
        // Get active tenants
        const activePropertyTenants = await database_1.prisma.propertyTenant.findMany({
            where: {
                tenant_id: tenantId,
                status: 'ACTIVE',
                deleted_at: null,
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        owner_user_id: true,
                    },
                },
                rent_payments: {
                    orderBy: {
                        payment_date: 'desc',
                    },
                    take: 1,
                },
            },
        });
        const overdueList = [];
        for (const pt of activePropertyTenants) {
            // Calculate expected payment date based on frequency
            let daysSinceLastPayment = 0;
            let expectedPaymentInterval = 0;
            if (pt.rent_payments.length > 0) {
                const lastPayment = pt.rent_payments[0];
                daysSinceLastPayment = Math.ceil((today.getTime() - lastPayment.payment_date.getTime()) / (1000 * 60 * 60 * 24));
            }
            else {
                // No payments recorded - check days since move-in
                daysSinceLastPayment = Math.ceil((today.getTime() - pt.move_in_date.getTime()) / (1000 * 60 * 60 * 24));
            }
            // Determine expected interval based on frequency
            switch (pt.rent_frequency) {
                case 'WEEKLY':
                    expectedPaymentInterval = 7;
                    break;
                case 'MONTHLY':
                    expectedPaymentInterval = 30;
                    break;
                case 'QUARTERLY':
                    expectedPaymentInterval = 90;
                    break;
            }
            // If payment is overdue by more than 7 days past expected interval
            const daysOverdue = daysSinceLastPayment - expectedPaymentInterval;
            if (daysOverdue > 7) {
                overdueList.push({
                    id: pt.id,
                    tenantName: pt.name,
                    propertyId: pt.property.id,
                    propertyName: pt.property.name,
                    ownerUserId: pt.property.owner_user_id,
                    rentAmount: Number(pt.rent_amount),
                    rentFrequency: pt.rent_frequency,
                    daysOverdue,
                    lastPaymentDate: pt.rent_payments[0]?.payment_date || null,
                });
            }
        }
        return overdueList;
    }
}
exports.TenantService = TenantService;
exports.tenantService = new TenantService();
//# sourceMappingURL=TenantService.js.map