import { Contractor } from '@rightfit/database';
export interface CreateContractorDTO {
    name: string;
    trade: string;
    company_name?: string;
    phone: string;
    email?: string;
    notes?: string;
    sms_opt_out?: boolean;
    user_id?: string;
}
export interface UpdateContractorDTO {
    name?: string;
    trade?: string;
    company_name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    sms_opt_out?: boolean;
}
export interface ContractorFilters {
    trade?: string;
    search?: string;
}
declare class ContractorsService {
    create(tenantId: string, data: CreateContractorDTO): Promise<Contractor>;
    list(tenantId: string, filters?: ContractorFilters, page?: number, limit?: number): Promise<{
        data: ({
            work_orders: {
                id: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
            }[];
            user: {
                id: string;
                email: string;
                full_name: string;
            } | null;
        } & {
            id: string;
            email: string | null;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            user_id: string | null;
            trade: string;
            company_name: string | null;
            phone: string;
            notes: string | null;
            sms_opt_out: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
        };
    }>;
    getById(tenantId: string, contractorId: string): Promise<Contractor | null>;
    update(tenantId: string, contractorId: string, data: UpdateContractorDTO): Promise<Contractor>;
    delete(tenantId: string, contractorId: string): Promise<void>;
    getByTrade(tenantId: string, trade: string): Promise<Contractor[]>;
}
declare const _default: ContractorsService;
export default _default;
//# sourceMappingURL=ContractorsService.d.ts.map