import { CreatePropertyInput, UpdatePropertyInput } from '@rightfit/shared';
export declare class PropertiesService {
    list(tenantId: string, page?: number, limit?: number, search?: string): Promise<{
        data: ({
            _count: {
                work_orders: number;
            };
        } & {
            id: string;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            postcode: string;
            address_line1: string;
            owner_user_id: string;
            address_line2: string | null;
            city: string;
            property_type: import(".prisma/client").$Enums.PropertyType;
            bedrooms: number;
            bathrooms: number;
            access_instructions: string | null;
            status: import(".prisma/client").$Enums.PropertyStatus;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(id: string, tenantId: string): Promise<{
        owner: {
            id: string;
            email: string;
            full_name: string;
        };
        _count: {
            work_orders: number;
            certificates: number;
            photos: number;
        };
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        postcode: string;
        address_line1: string;
        owner_user_id: string;
        address_line2: string | null;
        city: string;
        property_type: import(".prisma/client").$Enums.PropertyType;
        bedrooms: number;
        bathrooms: number;
        access_instructions: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
    }>;
    create(input: CreatePropertyInput, tenantId: string, userId: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        postcode: string;
        address_line1: string;
        owner_user_id: string;
        address_line2: string | null;
        city: string;
        property_type: import(".prisma/client").$Enums.PropertyType;
        bedrooms: number;
        bathrooms: number;
        access_instructions: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
    }>;
    update(id: string, input: UpdatePropertyInput, tenantId: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        postcode: string;
        address_line1: string;
        owner_user_id: string;
        address_line2: string | null;
        city: string;
        property_type: import(".prisma/client").$Enums.PropertyType;
        bedrooms: number;
        bathrooms: number;
        access_instructions: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
    }>;
    delete(id: string, tenantId: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        postcode: string;
        address_line1: string;
        owner_user_id: string;
        address_line2: string | null;
        city: string;
        property_type: import(".prisma/client").$Enums.PropertyType;
        bedrooms: number;
        bathrooms: number;
        access_instructions: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
    }>;
}
//# sourceMappingURL=PropertiesService.d.ts.map