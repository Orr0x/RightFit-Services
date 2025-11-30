"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleaningJobsService = void 0;
const database_1 = require("@rightfit/database");
const errors_1 = require("../utils/errors");
class CleaningJobsService {
    async list(serviceProviderId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            service: {
                service_provider_id: serviceProviderId,
            },
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.worker_id) {
            where.assigned_worker_id = filters.worker_id;
        }
        if (filters?.property_id) {
            where.property_id = filters.property_id;
        }
        if (filters?.customer_id) {
            where.customer_id = filters.customer_id;
        }
        if (filters?.from_date || filters?.to_date) {
            where.scheduled_date = {};
            if (filters.from_date) {
                where.scheduled_date.gte = filters.from_date;
            }
            if (filters.to_date) {
                where.scheduled_date.lte = filters.to_date;
            }
        }
        const [jobs, total] = await Promise.all([
            database_1.prisma.cleaningJob.findMany({
                where,
                skip,
                take: limit,
                orderBy: { scheduled_date: 'desc' },
                include: {
                    property: {
                        select: {
                            id: true,
                            property_name: true,
                            address: true,
                            postcode: true,
                        },
                    },
                    customer: {
                        select: {
                            id: true,
                            business_name: true,
                            contact_name: true,
                        },
                    },
                    assigned_worker: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            phone: true,
                        },
                    },
                },
            }),
            database_1.prisma.cleaningJob.count({ where }),
        ]);
        return {
            data: jobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getById(id, serviceProviderId) {
        const job = await database_1.prisma.cleaningJob.findFirst({
            where: {
                id,
                service: {
                    service_provider_id: serviceProviderId,
                },
            },
            include: {
                service: true,
                property: true,
                customer: true,
                assigned_worker: true,
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
        if (!job) {
            throw new errors_1.NotFoundError('Cleaning job not found');
        }
        return job;
    }
    async create(input, serviceProviderId) {
        // Verify service belongs to this provider
        const service = await database_1.prisma.service.findFirst({
            where: {
                id: input.service_id,
                service_provider_id: serviceProviderId,
            },
        });
        if (!service) {
            throw new errors_1.ValidationError('Invalid service ID');
        }
        const job = await database_1.prisma.cleaningJob.create({
            data: {
                service_id: input.service_id,
                property_id: input.property_id,
                customer_id: input.customer_id,
                assigned_worker_id: input.assigned_worker_id,
                scheduled_date: input.scheduled_date,
                scheduled_start_time: input.scheduled_start_time,
                scheduled_end_time: input.scheduled_end_time,
                checklist_template_id: input.checklist_template_id,
                checklist_total_items: input.checklist_total_items || 0,
                pricing_type: input.pricing_type,
                quoted_price: input.quoted_price,
                before_photos: [],
                after_photos: [],
                issue_photos: [],
            },
            include: {
                property: true,
                customer: true,
                assigned_worker: true,
            },
        });
        return job;
    }
    async update(id, input, serviceProviderId) {
        // Verify job belongs to this provider
        await this.getById(id, serviceProviderId);
        const job = await database_1.prisma.cleaningJob.update({
            where: { id },
            data: input,
            include: {
                property: true,
                customer: true,
                assigned_worker: true,
            },
        });
        return job;
    }
    async delete(id, serviceProviderId) {
        // Verify job belongs to this provider
        await this.getById(id, serviceProviderId);
        await database_1.prisma.cleaningJob.delete({
            where: { id },
        });
    }
    async getTodaysJobs(workerId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const jobs = await database_1.prisma.cleaningJob.findMany({
            where: {
                assigned_worker_id: workerId,
                scheduled_date: {
                    gte: today,
                    lt: tomorrow,
                },
                status: {
                    in: ['SCHEDULED', 'IN_PROGRESS'],
                },
            },
            orderBy: { scheduled_start_time: 'asc' },
            include: {
                property: true,
                customer: {
                    select: {
                        business_name: true,
                        contact_name: true,
                        phone: true,
                    },
                },
            },
        });
        return jobs;
    }
    async startJob(id, workerId) {
        const job = await database_1.prisma.cleaningJob.findFirst({
            where: {
                id,
                assigned_worker_id: workerId,
            },
        });
        if (!job) {
            throw new errors_1.NotFoundError('Cleaning job not found or not assigned to you');
        }
        return await database_1.prisma.cleaningJob.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS',
                actual_start_time: new Date(),
            },
        });
    }
    async completeJob(id, workerId, completionData) {
        const job = await database_1.prisma.cleaningJob.findFirst({
            where: {
                id,
                assigned_worker_id: workerId,
            },
        });
        if (!job) {
            throw new errors_1.NotFoundError('Cleaning job not found or not assigned to you');
        }
        return await database_1.prisma.cleaningJob.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                actual_end_time: new Date(),
                ...completionData,
            },
        });
    }
}
exports.CleaningJobsService = CleaningJobsService;
//# sourceMappingURL=CleaningJobsService.js.map