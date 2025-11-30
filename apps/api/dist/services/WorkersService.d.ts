export declare class WorkersService {
    list(serviceProviderId: string): Promise<{
        id: string;
        email: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        phone: string;
        is_active: boolean;
        service_provider_id: string;
        first_name: string;
        last_name: string;
        worker_type: import(".prisma/client").$Enums.WorkerType;
        employment_type: import(".prisma/client").$Enums.EmploymentType;
        hourly_rate: import("@prisma/client/runtime/library").Decimal;
        max_weekly_hours: number | null;
        jobs_completed: number;
        average_rating: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getById(id: string, serviceProviderId: string): Promise<{
        _count: {
            maintenance_jobs: number;
            cleaning_jobs: number;
        };
    } & {
        id: string;
        email: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        phone: string;
        is_active: boolean;
        service_provider_id: string;
        first_name: string;
        last_name: string;
        worker_type: import(".prisma/client").$Enums.WorkerType;
        employment_type: import(".prisma/client").$Enums.EmploymentType;
        hourly_rate: import("@prisma/client/runtime/library").Decimal;
        max_weekly_hours: number | null;
        jobs_completed: number;
        average_rating: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    create(data: any, serviceProviderId: string): Promise<{
        id: string;
        email: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        phone: string;
        is_active: boolean;
        service_provider_id: string;
        first_name: string;
        last_name: string;
        worker_type: import(".prisma/client").$Enums.WorkerType;
        employment_type: import(".prisma/client").$Enums.EmploymentType;
        hourly_rate: import("@prisma/client/runtime/library").Decimal;
        max_weekly_hours: number | null;
        jobs_completed: number;
        average_rating: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, data: any, serviceProviderId: string): Promise<{
        id: string;
        email: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        phone: string;
        is_active: boolean;
        service_provider_id: string;
        first_name: string;
        last_name: string;
        worker_type: import(".prisma/client").$Enums.WorkerType;
        employment_type: import(".prisma/client").$Enums.EmploymentType;
        hourly_rate: import("@prisma/client/runtime/library").Decimal;
        max_weekly_hours: number | null;
        jobs_completed: number;
        average_rating: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
//# sourceMappingURL=WorkersService.d.ts.map