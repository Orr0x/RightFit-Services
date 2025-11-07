import { Request, Response, NextFunction } from 'express';
import { prisma } from '@rightfit/database';
import { ForbiddenError, BadRequestError } from '../utils/errors';

/**
 * Middleware to verify service_provider_id belongs to authenticated user's tenant
 * Must be used AFTER authMiddleware
 *
 * @throws {BadRequestError} If service_provider_id is missing
 * @throws {ForbiddenError} If service_provider_id does not belong to user's tenant
 */
export const requireServiceProvider = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract service_provider_id from query or body
    const serviceProviderId =
      (req.query.service_provider_id as string) ||
      (req.body.service_provider_id as string);

    if (!serviceProviderId) {
      throw new BadRequestError('service_provider_id is required');
    }

    // Extract tenant_id from authenticated user
    const userTenantId = req.user?.tenant_id;

    if (!userTenantId) {
      throw new ForbiddenError('Authentication required');
    }

    // Verify service_provider_id belongs to this tenant
    const serviceProvider = await prisma.serviceProvider.findFirst({
      where: {
        id: serviceProviderId,
        tenant_id: userTenantId,
      },
    });

    if (!serviceProvider) {
      // Log security event
      console.warn(
        `[SECURITY] User ${req.user?.user_id} attempted to access service_provider ${serviceProviderId} (unauthorized)`
      );

      throw new ForbiddenError('Invalid service provider');
    }

    // Attach service provider to request for later use
    req.serviceProvider = serviceProvider;

    next();
  } catch (error) {
    next(error);
  }
};
