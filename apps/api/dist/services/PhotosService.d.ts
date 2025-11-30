import { Photo, PhotoLabel } from '@rightfit/database';
export interface CreatePhotoDTO {
    property_id?: string;
    work_order_id?: string;
    label?: PhotoLabel;
    caption?: string;
    gps_latitude?: number;
    gps_longitude?: number;
}
export interface PhotoQualityData {
    isBlurry: boolean;
    blurScore: number;
    brightness: number;
    hasGoodQuality: boolean;
    warnings: string[];
}
export interface PhotoUploadResult {
    photo: Photo;
    uploadSuccess: boolean;
    error?: string;
    quality?: PhotoQualityData;
}
declare class PhotosService {
    uploadPhoto(tenantId: string, userId: string, file: Express.Multer.File, data: CreatePhotoDTO): Promise<PhotoUploadResult>;
    list(tenantId: string, filters?: {
        property_id?: string;
        work_order_id?: string;
    }): Promise<({
        property: {
            id: string;
            name: string;
        } | null;
        work_order: {
            id: string;
            title: string;
        } | null;
        uploaded_by: {
            id: string;
            email: string;
            full_name: string;
        };
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        property_id: string | null;
        uploaded_by_user_id: string;
        work_order_id: string | null;
        s3_key: string;
        s3_url: string;
        thumbnail_url: string;
        file_size: number;
        mime_type: string;
        width: number;
        height: number;
        label: import(".prisma/client").$Enums.PhotoLabel | null;
        caption: string | null;
        gps_latitude: import("@prisma/client/runtime/library").Decimal | null;
        gps_longitude: import("@prisma/client/runtime/library").Decimal | null;
        quality_check_passed: boolean | null;
        quality_check_details: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getById(tenantId: string, photoId: string): Promise<Photo | null>;
    delete(tenantId: string, photoId: string): Promise<void>;
}
declare const _default: PhotosService;
export default _default;
//# sourceMappingURL=PhotosService.d.ts.map