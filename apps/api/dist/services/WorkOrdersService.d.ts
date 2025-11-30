import { WorkOrder, WorkOrderStatus, WorkOrderPriority, WorkOrderCategory } from '@rightfit/database';
export interface CreateWorkOrderDTO {
    property_id: string;
    contractor_id?: string;
    title: string;
    description?: string;
    priority?: WorkOrderPriority;
    category?: WorkOrderCategory;
    due_date?: Date;
    estimated_cost?: number;
}
export interface UpdateWorkOrderDTO {
    contractor_id?: string;
    title?: string;
    description?: string;
    status?: WorkOrderStatus;
    priority?: WorkOrderPriority;
    category?: WorkOrderCategory;
    due_date?: Date;
    estimated_cost?: number;
    actual_cost?: number;
    started_at?: Date;
    completed_at?: Date;
    completion_note?: string;
    cancellation_reason?: string;
}
export interface WorkOrderFilters {
    property_id?: string;
    contractor_id?: string;
    status?: WorkOrderStatus;
    priority?: WorkOrderPriority;
    category?: WorkOrderCategory;
}
declare class WorkOrdersService {
    create(tenantId: string, userId: string, data: CreateWorkOrderDTO): Promise<WorkOrder>;
    list(tenantId: string, filters?: WorkOrderFilters, page?: number, limit?: number): Promise<{
        data: ({
            property: {
                id: string;
                name: string;
                postcode: string;
                address_line1: string;
                city: string;
            };
            contractor: {
                id: string;
                name: string;
                trade: string;
                phone: string;
            } | null;
            created_by: {
                id: string;
                email: string;
                full_name: string;
            };
        } & {
            id: string;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            property_id: string;
            contractor_id: string | null;
            created_by_user_id: string;
            title: string;
            description: string | null;
            priority: import(".prisma/client").$Enums.WorkOrderPriority;
            category: import(".prisma/client").$Enums.WorkOrderCategory;
            due_date: Date | null;
            estimated_cost: import("@prisma/client/runtime/library").Decimal | null;
            actual_cost: import("@prisma/client/runtime/library").Decimal | null;
            started_at: Date | null;
            completed_at: Date | null;
            completion_note: string | null;
            cancellation_reason: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
        };
    }>;
    getById(tenantId: string, workOrderId: string): Promise<WorkOrder | null>;
    update(tenantId: string, workOrderId: string, data: UpdateWorkOrderDTO): Promise<WorkOrder>;
    delete(tenantId: string, workOrderId: string): Promise<void>;
    assignContractor(tenantId: string, workOrderId: string, contractorId: string): Promise<WorkOrder>;
    updateStatus(tenantId: string, workOrderId: string, status: WorkOrderStatus, note?: string): Promise<WorkOrder>;
}
declare const _default: WorkOrdersService;
export default _default;
//# sourceMappingURL=WorkOrdersService.d.ts.map