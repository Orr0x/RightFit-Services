"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersService = void 0;
const database_1 = require("@rightfit/database");
const errors_1 = require("../utils/errors");
class WorkersService {
    async list(serviceProviderId) {
        const workers = await database_1.prisma.worker.findMany({
            where: {
                service_provider_id: serviceProviderId,
                is_active: true,
            },
            orderBy: { first_name: 'asc' },
        });
        return workers;
    }
    async getById(id, serviceProviderId) {
        const worker = await database_1.prisma.worker.findFirst({
            where: {
                id,
                service_provider_id: serviceProviderId,
            },
            include: {
                _count: {
                    select: {
                        cleaning_jobs: true,
                        maintenance_jobs: true,
                    },
                },
            },
        });
        if (!worker) {
            throw new errors_1.NotFoundError('Worker not found');
        }
        return worker;
    }
    async create(data, serviceProviderId) {
        const worker = await database_1.prisma.worker.create({
            data: {
                ...data,
                service_provider_id: serviceProviderId,
            },
        });
        return worker;
    }
    async update(id, data, serviceProviderId) {
        await this.getById(id, serviceProviderId);
        const worker = await database_1.prisma.worker.update({
            where: { id },
            data,
        });
        return worker;
    }
}
exports.WorkersService = WorkersService;
//# sourceMappingURL=WorkersService.js.map