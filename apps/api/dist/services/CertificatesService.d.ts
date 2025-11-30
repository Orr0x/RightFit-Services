import { Certificate, CertificateType } from '@rightfit/database';
export interface CreateCertificateDTO {
    property_id: string;
    certificate_type: CertificateType;
    issue_date: string;
    expiry_date: string;
    certificate_number?: string;
    issuer_name?: string;
    notes?: string;
}
export interface UpdateCertificateDTO {
    certificate_type?: CertificateType;
    issue_date?: string;
    expiry_date?: string;
    certificate_number?: string;
    issuer_name?: string;
    notes?: string;
}
declare class CertificatesService {
    create(tenantId: string, file: Express.Multer.File, data: CreateCertificateDTO): Promise<Certificate>;
    list(tenantId: string, filters?: {
        property_id?: string;
        certificate_type?: CertificateType;
    }): Promise<{
        days_until_expiry: number;
        is_expired: boolean;
        property: {
            id: string;
            name: string;
            postcode: string;
            address_line1: string;
            city: string;
        };
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        property_id: string;
        notes: string | null;
        certificate_type: import(".prisma/client").$Enums.CertificateType;
        issue_date: Date;
        expiry_date: Date;
        document_url: string;
        certificate_number: string | null;
        issuer_name: string | null;
    }[]>;
    getById(tenantId: string, certificateId: string): Promise<{
        days_until_expiry: number;
        is_expired: boolean;
        property: {
            id: string;
            name: string;
            postcode: string;
            address_line1: string;
            city: string;
        };
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        property_id: string;
        notes: string | null;
        certificate_type: import(".prisma/client").$Enums.CertificateType;
        issue_date: Date;
        expiry_date: Date;
        document_url: string;
        certificate_number: string | null;
        issuer_name: string | null;
    }>;
    update(tenantId: string, certificateId: string, data: UpdateCertificateDTO): Promise<Certificate>;
    delete(tenantId: string, certificateId: string): Promise<void>;
    getExpiringSoon(tenantId: string, daysAhead?: number): Promise<{
        days_until_expiry: number;
        property: {
            id: string;
            name: string;
            postcode: string;
            address_line1: string;
            city: string;
        };
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        property_id: string;
        notes: string | null;
        certificate_type: import(".prisma/client").$Enums.CertificateType;
        issue_date: Date;
        expiry_date: Date;
        document_url: string;
        certificate_number: string | null;
        issuer_name: string | null;
    }[]>;
    getExpired(tenantId: string): Promise<{
        days_since_expired: number;
        property: {
            id: string;
            name: string;
            postcode: string;
            address_line1: string;
            city: string;
        };
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        property_id: string;
        notes: string | null;
        certificate_type: import(".prisma/client").$Enums.CertificateType;
        issue_date: Date;
        expiry_date: Date;
        document_url: string;
        certificate_number: string | null;
        issuer_name: string | null;
    }[]>;
}
export { CertificatesService };
declare const _default: CertificatesService;
export default _default;
//# sourceMappingURL=CertificatesService.d.ts.map