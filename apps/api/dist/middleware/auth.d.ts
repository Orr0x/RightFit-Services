import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id: string;
                tenant_id: string;
                email: string;
                role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR';
            };
        }
    }
}
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
export declare function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void;
export declare const authenticate: typeof authMiddleware;
//# sourceMappingURL=auth.d.ts.map