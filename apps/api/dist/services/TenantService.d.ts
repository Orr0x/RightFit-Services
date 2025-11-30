interface CreatePropertyTenantInput {
    propertyId: string;
    name: string;
    email?: string;
    phone?: string;
    moveInDate: Date;
    leaseExpiryDate?: Date;
    rentAmount: number;
    rentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    rentDueDay?: number;
    notes?: string;
}
interface UpdatePropertyTenantInput {
    name?: string;
    email?: string;
    phone?: string;
    moveInDate?: Date;
    leaseExpiryDate?: Date;
    rentAmount?: number;
    rentFrequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    rentDueDay?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'NOTICE_GIVEN';
    notes?: string;
}
interface RecordRentPaymentInput {
    propertyTenantId: string;
    amount: number;
    paymentDate: Date;
    expectedDate?: Date;
    paymentMethod?: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'STANDING_ORDER' | 'OTHER';
    reference?: string;
    notes?: string;
}
export declare class TenantService {
    /**
     * Create a new property tenant
     */
    createPropertyTenant(input: CreatePropertyTenantInput, tenantId: string): Promise<{
        id: string;
        email: string | null;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        status: import(".prisma/client").$Enums.TenantStatus;
        property_id: string;
        phone: string | null;
        notes: string | null;
        move_in_date: Date;
        lease_expiry_date: Date | null;
        rent_amount: import("@prisma/client/runtime/library").Decimal;
        rent_frequency: import(".prisma/client").$Enums.RentFrequency;
        rent_due_day: number | null;
    }>;
    /**
     * List property tenants with filtering
     */
    listPropertyTenants(tenantId: string, options?: {
        propertyId?: string;
        status?: 'ACTIVE' | 'INACTIVE' | 'NOTICE_GIVEN';
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            property: {
                id: string;
                name: string;
            };
            _count: {
                rent_payments: number;
            };
        } & {
            id: string;
            email: string | null;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            status: import(".prisma/client").$Enums.TenantStatus;
            property_id: string;
            phone: string | null;
            notes: string | null;
            move_in_date: Date;
            lease_expiry_date: Date | null;
            rent_amount: import("@prisma/client/runtime/library").Decimal;
            rent_frequency: import(".prisma/client").$Enums.RentFrequency;
            rent_due_day: number | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get a single property tenant by ID
     */
    getPropertyTenantById(id: string, tenantId: string): Promise<{
        property: {
            id: string;
            name: string;
        };
        rent_payments: {
            id: string;
            created_at: Date;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_date: Date;
            expected_date: Date | null;
            payment_method: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            property_tenant_id: string;
        }[];
    } & {
        id: string;
        email: string | null;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        status: import(".prisma/client").$Enums.TenantStatus;
        property_id: string;
        phone: string | null;
        notes: string | null;
        move_in_date: Date;
        lease_expiry_date: Date | null;
        rent_amount: import("@prisma/client/runtime/library").Decimal;
        rent_frequency: import(".prisma/client").$Enums.RentFrequency;
        rent_due_day: number | null;
    }>;
    /**
     * Update a property tenant
     */
    updatePropertyTenant(id: string, input: UpdatePropertyTenantInput, tenantId: string): Promise<{
        id: string;
        email: string | null;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        status: import(".prisma/client").$Enums.TenantStatus;
        property_id: string;
        phone: string | null;
        notes: string | null;
        move_in_date: Date;
        lease_expiry_date: Date | null;
        rent_amount: import("@prisma/client/runtime/library").Decimal;
        rent_frequency: import(".prisma/client").$Enums.RentFrequency;
        rent_due_day: number | null;
    }>;
    /**
     * Delete (soft) a property tenant
     */
    deletePropertyTenant(id: string, tenantId: string): Promise<void>;
    /**
     * Record a rent payment
     */
    recordRentPayment(input: RecordRentPaymentInput, tenantId: string): Promise<{
        id: string;
        created_at: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_date: Date;
        expected_date: Date | null;
        payment_method: import(".prisma/client").$Enums.PaymentMethod | null;
        reference: string | null;
        property_tenant_id: string;
    }>;
    /**
     * Get rent payments for a property tenant
     */
    getRentPayments(propertyTenantId: string, tenantId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            created_at: Date;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_date: Date;
            expected_date: Date | null;
            payment_method: import(".prisma/client").$Enums.PaymentMethod | null;
            reference: string | null;
            property_tenant_id: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get property tenants with expiring leases (for cron job alerts)
     */
    getExpiringLeases(tenantId: string, daysInAdvance?: number): Promise<{
        id: string;
        tenantName: string;
        propertyId: string;
        propertyName: string;
        ownerUserId: string;
        leaseExpiryDate: Date | null;
        daysUntilExpiry: number;
    }[]>;
    /**
     * Get overdue rent (for cron job alerts)
     * This is a simplified version - in production you'd want more sophisticated logic
     */
    getOverdueRent(tenantId: string): Promise<{
        id: string;
        tenantName: string;
        propertyId: string;
        propertyName: string;
        ownerUserId: string;
        rentAmount: number;
        rentFrequency: import(".prisma/client").$Enums.RentFrequency;
        daysOverdue: number;
        lastPaymentDate: Date;
    }[]>;
}
export declare const tenantService: TenantService;
export {};
//# sourceMappingURL=TenantService.d.ts.map