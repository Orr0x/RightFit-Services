/**
 * Navigation API Routes
 *
 * Endpoints for GPS navigation, geocoding, and location services
 */

import { Router, Request, Response, NextFunction } from 'express';
import { NavigationService } from '../services/NavigationService';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '@rightfit/database';

const router: Router = Router();
const navigationService = new NavigationService();

router.use(authMiddleware);

/**
 * POST /api/navigation/geocode/property
 * Geocode a property address
 *
 * Body:
 * {
 *   "property_id": "string",
 *   "address": "string",
 *   "force_refresh": boolean (optional)
 * }
 */
router.post('/geocode/property', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { property_id, address, force_refresh } = req.body;
    const tenantId = req.user!.tenant_id;

    if (!property_id || !address) {
      return res.status(400).json({
        error: 'Missing required fields: property_id and address',
      });
    }

    // Get service provider ID from tenant
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { tenant_id: tenantId },
      select: { id: true },
    });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    const result = await navigationService.geocodePropertyAddress(
      property_id,
      address,
      serviceProvider.id,
      force_refresh || false
    );

    res.json({
      data: result,
      message: result.source === 'CACHE' ? 'Retrieved from cache' : 'Geocoded successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/navigation/reverse-geocode
 * Convert coordinates to address
 *
 * Body:
 * {
 *   "latitude": number,
 *   "longitude": number
 * }
 */
router.post('/reverse-geocode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: latitude and longitude',
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates: latitude must be [-90, 90], longitude must be [-180, 180]',
      });
    }

    const result = await navigationService.reverseGeocode(latitude, longitude);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/navigation/plus-code/decode
 * Decode a Plus Code to coordinates
 *
 * Body:
 * {
 *   "plus_code": "string"
 * }
 */
router.post('/plus-code/decode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plus_code } = req.body;

    if (!plus_code) {
      return res.status(400).json({
        error: 'Missing required field: plus_code',
      });
    }

    const result = navigationService.decodePlusCode(plus_code);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/navigation/distance
 * Calculate distance between two coordinates
 *
 * Body:
 * {
 *   "origin": { "latitude": number, "longitude": number },
 *   "destination": { "latitude": number, "longitude": number }
 * }
 */
router.post('/distance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Missing required fields: origin and destination',
      });
    }

    if (!origin.latitude || !origin.longitude || !destination.latitude || !destination.longitude) {
      return res.status(400).json({
        error: 'Invalid coordinates format',
      });
    }

    const result = navigationService.calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/navigation/my-locations
 * Get all unique property locations for the current worker
 *
 * Query params:
 * - user_lat: number (optional) - User's current latitude
 * - user_lon: number (optional) - User's current longitude
 */
router.get('/my-locations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenant_id;
    const userId = req.user!.user_id;
    const userLat = req.query.user_lat ? parseFloat(req.query.user_lat as string) : undefined;
    const userLon = req.query.user_lon ? parseFloat(req.query.user_lon as string) : undefined;

    // Get worker ID from user ID
    const worker = await prisma.worker.findFirst({
      where: {
        service_provider: {
          tenant_id: tenantId,
        },
        email: req.user!.email, // Match by email
      },
      select: { id: true },
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    let userLocation: { latitude: number; longitude: number } | undefined;
    if (userLat !== undefined && userLon !== undefined) {
      userLocation = { latitude: userLat, longitude: userLon };
    }

    const locations = await navigationService.getMyLocations(worker.id, userLocation);

    res.json({
      data: locations,
      user_location: userLocation || null,
      total_count: locations.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
