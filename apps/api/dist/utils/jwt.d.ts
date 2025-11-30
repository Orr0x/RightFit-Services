import { JWTPayload, RefreshTokenPayload } from '@rightfit/shared';
export declare function generateAccessToken(payload: {
    user_id: string;
    tenant_id: string;
    email: string;
    role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR';
}): string;
export declare function generateRefreshToken(payload: {
    user_id: string;
    tenant_id: string;
}): string;
export declare function verifyAccessToken(token: string): JWTPayload;
export declare function verifyRefreshToken(token: string): RefreshTokenPayload;
//# sourceMappingURL=jwt.d.ts.map