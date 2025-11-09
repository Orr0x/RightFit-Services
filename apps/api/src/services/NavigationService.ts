/**
 * NavigationService - GPS Navigation and Geocoding
 *
 * Handles geocoding, routing, and location services for worker navigation.
 * Implements caching to minimize external API calls and stay within free tier limits.
 *
 * Features:
 * - Address geocoding via Nominatim (OpenStreetMap)
 * - Plus Code (Open Location Code) generation
 * - Database caching (30-day TTL)
 * - Rate limiting (1 req/sec for Nominatim)
 * - Multi-tenant security
 * - what3words integration (optional)
 */

import axios, { AxiosError } from 'axios';
import { prisma } from '@rightfit/database';
import { getNavigationConfig } from '../config/navigation';
import * as OpenLocationCode from 'open-location-code';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  plus_code: string;
  what3words?: string | null;
  location_type: string;
  source: 'CACHE' | 'NOMINATIM';
  geocoded_at: Date;
}

export interface ReverseGeocodeResult {
  address: string;
  city: string;
  postcode: string;
  country: string;
}

export interface DistanceResult {
  distance_meters: number;
  distance_km: number;
  distance_miles: number;
}

export class NavigationService {
  private config = getNavigationConfig();
  private lastNominatimRequest = 0;

  /**
   * Geocode an address for a property (with caching)
   *
   * @param propertyId - Property ID (for multi-tenant security check)
   * @param address - Full address to geocode
   * @param serviceProviderId - Service Provider ID (for security)
   * @param forceRefresh - Force re-geocoding even if cached
   * @returns Geocoding result with coordinates and metadata
   */
  async geocodePropertyAddress(
    propertyId: string,
    address: string,
    serviceProviderId: string,
    forceRefresh = false
  ): Promise<GeocodeResult> {
    // 1. Verify property belongs to this service provider
    const property = await prisma.customerProperty.findFirst({
      where: {
        id: propertyId,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        plus_code: true,
        what3words: true,
        location_type: true,
        geocoded_at: true,
      },
    });

    if (!property) {
      throw new Error('Property not found or access denied');
    }

    // 2. Check if we have valid cached coordinates
    if (!forceRefresh && property.latitude && property.longitude && property.geocoded_at) {
      const daysSinceGeocoded =
        (Date.now() - property.geocoded_at.getTime()) / (1000 * 60 * 60 * 24);

      // Cache valid for 30 days
      if (daysSinceGeocoded < this.config.geocoding.cacheDays) {
        return {
          latitude: Number(property.latitude),
          longitude: Number(property.longitude),
          plus_code: property.plus_code || this.generatePlusCode(
            Number(property.latitude),
            Number(property.longitude)
          ),
          what3words: property.what3words,
          location_type: property.location_type || 'ADDRESS',
          source: 'CACHE',
          geocoded_at: property.geocoded_at,
        };
      }
    }

    // 3. Geocode using Nominatim
    const result = await this.geocodeWithNominatim(address);

    // 4. Generate Plus Code
    const plusCode = this.generatePlusCode(result.lat, result.lon);

    // 5. Optionally get what3words
    let what3words: string | null = null;
    if (this.config.what3words.enabled && this.config.what3words.apiKey) {
      try {
        what3words = await this.getWhat3Words(result.lat, result.lon);
      } catch (error) {
        console.warn('what3words API failed, using Plus Code fallback:', error);
      }
    }

    // 6. Update database with geocoded coordinates
    await prisma.customerProperty.update({
      where: { id: propertyId },
      data: {
        latitude: result.lat,
        longitude: result.lon,
        plus_code: plusCode,
        what3words: what3words,
        location_type: result.location_type,
        geocoded_at: new Date(),
      },
    });

    return {
      latitude: result.lat,
      longitude: result.lon,
      plus_code: plusCode,
      what3words,
      location_type: result.location_type,
      source: 'NOMINATIM',
      geocoded_at: new Date(),
    };
  }

  /**
   * Geocode using Nominatim (OpenStreetMap)
   * Respects 1 req/sec rate limit
   */
  private async geocodeWithNominatim(address: string): Promise<{
    lat: number;
    lon: number;
    location_type: string;
  }> {
    // Enforce 1 req/sec rate limit (Nominatim usage policy)
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastNominatimRequest;
    const minInterval = 1000 / this.config.geocoding.rateLimit; // milliseconds

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    this.lastNominatimRequest = Date.now();

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': this.config.geocoding.nominatimUserAgent,
        },
        timeout: this.config.geocoding.timeout,
      });

      if (response.data.length === 0) {
        throw new Error(`Address not found: ${address}`);
      }

      const result = response.data[0];

      // Determine location type based on result quality
      let locationType = 'ADDRESS';
      if (result.addresstype === 'house' || result.addresstype === 'building') {
        locationType = 'ADDRESS';
      } else if (result.addresstype === 'hamlet' || result.addresstype === 'village') {
        locationType = 'RURAL';
      } else if (!result.address?.house_number) {
        locationType = 'COORDINATES_ONLY';
      }

      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        location_type: locationType,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 429) {
          throw new Error('Geocoding rate limit exceeded. Please try again in a moment.');
        }
        throw new Error(`Geocoding failed: ${axiosError.message}`);
      }
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
    // Enforce rate limit
    await this.enforceRateLimit();

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': this.config.geocoding.nominatimUserAgent,
        },
        timeout: this.config.geocoding.timeout,
      });

      const address = response.data.address || {};

      return {
        address: response.data.display_name || '',
        city: address.city || address.town || address.village || '',
        postcode: address.postcode || '',
        country: address.country || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Reverse geocoding failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate Plus Code (Open Location Code)
   * Free alternative to what3words
   */
  private generatePlusCode(lat: number, lon: number): string {
    return OpenLocationCode.encode(lat, lon);
  }

  /**
   * Decode Plus Code to coordinates
   */
  decodePlusCode(plusCode: string): { latitude: number; longitude: number } {
    const decoded = OpenLocationCode.decode(plusCode);
    return {
      latitude: decoded.latitudeCenter,
      longitude: decoded.longitudeCenter,
    };
  }

  /**
   * Get what3words address (optional, if API key configured)
   */
  private async getWhat3Words(lat: number, lon: number): Promise<string | null> {
    if (!this.config.what3words.enabled || !this.config.what3words.apiKey) {
      return null;
    }

    try {
      const response = await axios.get('https://api.what3words.com/v3/convert-to-3wa', {
        params: {
          coordinates: `${lat},${lon}`,
          key: this.config.what3words.apiKey,
        },
        timeout: this.config.what3words.timeout,
      });

      return response.data.words || null;
    } catch (error) {
      console.error('what3words API error:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): DistanceResult {
    const R = 6371; // Earth's radius in kilometers

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    return {
      distance_meters: Math.round(distanceKm * 1000),
      distance_km: Math.round(distanceKm * 10) / 10,
      distance_miles: Math.round(distanceKm * 0.621371 * 10) / 10,
    };
  }

  /**
   * Get all unique properties with locations for a worker
   */
  async getMyLocations(
    workerId: string,
    userLocation?: { latitude: number; longitude: number }
  ) {
    // Get worker to verify service provider
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      select: { service_provider_id: true },
    });

    if (!worker) {
      throw new Error('Worker not found');
    }

    // Get all unique properties from worker's jobs
    const properties = await prisma.customerProperty.findMany({
      where: {
        cleaning_jobs: {
          some: {
            assigned_worker_id: workerId,
          },
        },
      },
      select: {
        id: true,
        property_name: true,
        address: true,
        postcode: true,
        latitude: true,
        longitude: true,
        what3words: true,
        plus_code: true,
        location_type: true,
        geocoded_at: true,
        customer: {
          select: {
            business_name: true,
          },
        },
        cleaning_jobs: {
          where: {
            assigned_worker_id: workerId,
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
          orderBy: { scheduled_date: 'asc' },
          take: 1,
          select: {
            scheduled_date: true,
          },
        },
      },
      orderBy: {
        property_name: 'asc',
      },
    });

    // Calculate distances if user location provided
    const locationsWithDistance = properties.map(property => {
      let distance: DistanceResult | undefined;
      let eta: number | undefined;

      if (
        userLocation &&
        property.latitude &&
        property.longitude
      ) {
        distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          Number(property.latitude),
          Number(property.longitude)
        );

        // Estimate ETA: assume 50 km/h average speed
        eta = Math.round((distance.distance_km / 50) * 60); // minutes
      }

      return {
        id: property.id,
        name: property.property_name,
        address: property.address,
        postcode: property.postcode,
        latitude: property.latitude ? Number(property.latitude) : null,
        longitude: property.longitude ? Number(property.longitude) : null,
        what3words: property.what3words,
        plus_code: property.plus_code,
        location_type: property.location_type || 'ADDRESS',
        geocoded_at: property.geocoded_at,
        customer_name: property.customer.business_name,
        next_job_date: property.cleaning_jobs[0]?.scheduled_date || null,
        distance_meters: distance?.distance_meters,
        distance_km: distance?.distance_km,
        distance_miles: distance?.distance_miles,
        eta_minutes: eta,
      };
    });

    // Sort by distance if user location provided
    if (userLocation) {
      locationsWithDistance.sort((a, b) => {
        if (!a.distance_meters) return 1;
        if (!b.distance_meters) return -1;
        return a.distance_meters - b.distance_meters;
      });
    }

    return locationsWithDistance;
  }

  /**
   * Enforce rate limit
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastNominatimRequest;
    const minInterval = 1000 / this.config.geocoding.rateLimit;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    this.lastNominatimRequest = Date.now();
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get route between two points using OSRM
   *
   * @param originLat - Origin latitude
   * @param originLon - Origin longitude
   * @param destLat - Destination latitude
   * @param destLon - Destination longitude
   * @returns Route with turn-by-turn directions
   */
  async getRoute(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number
  ): Promise<{
    distance_meters: number;
    duration_seconds: number;
    steps: Array<{
      instruction: string;
      distance_meters: number;
      duration_seconds: number;
      maneuver?: string;
    }>;
    polyline?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.config.routing.osrmBaseUrl}/route/v1/driving/${originLon},${originLat};${destLon},${destLat}`,
        {
          params: {
            steps: true, // Get turn-by-turn instructions
            overview: 'full', // Get full route polyline
            geometries: 'polyline', // Polyline format for mapping
          },
          timeout: this.config.routing.timeout,
        }
      );

      if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found between these locations');
      }

      const route = response.data.routes[0];
      const leg = route.legs[0]; // Single leg for direct route

      // Parse steps into simpler format
      const steps = leg.steps.map((step: any) => {
        return {
          instruction: step.name || 'Continue',
          distance_meters: Math.round(step.distance),
          duration_seconds: Math.round(step.duration),
          maneuver: step.maneuver?.type,
        };
      });

      return {
        distance_meters: Math.round(route.distance),
        duration_seconds: Math.round(route.duration),
        steps,
        polyline: route.geometry, // Encoded polyline for map display
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Routing service temporarily unavailable. Please try again.');
        }
        throw new Error(`Routing failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get complete navigation data for a property
   * Includes route, weather, and traffic (if available)
   */
  async getNavigationData(
    propertyId: string,
    userLat: number,
    userLon: number,
    serviceProviderId: string
  ): Promise<{
    property: {
      id: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      what3words: string | null;
      plus_code: string | null;
    };
    route: {
      distance_meters: number;
      duration_seconds: number;
      steps: any[];
      polyline?: string;
    } | null;
    distance: {
      distance_meters: number;
      distance_km: number;
      distance_miles: number;
    };
  }> {
    // 1. Get property and verify access
    const property = await prisma.customerProperty.findFirst({
      where: {
        id: propertyId,
        customer: {
          service_provider_id: serviceProviderId,
        },
      },
      select: {
        id: true,
        property_name: true,
        address: true,
        latitude: true,
        longitude: true,
        what3words: true,
        plus_code: true,
      },
    });

    if (!property) {
      throw new Error('Property not found or access denied');
    }

    // 2. Ensure property has coordinates
    if (!property.latitude || !property.longitude) {
      throw new Error('Property has not been geocoded yet');
    }

    const propLat = Number(property.latitude);
    const propLon = Number(property.longitude);

    // 3. Calculate straight-line distance
    const distance = this.calculateDistance(userLat, userLon, propLat, propLon);

    // 4. Get route
    let route: any = null;
    try {
      route = await this.getRoute(userLat, userLon, propLat, propLon);
    } catch (error) {
      console.error('Route calculation failed:', error);
      // Continue without route - user can still see property location
    }

    return {
      property: {
        id: property.id,
        name: property.property_name,
        address: property.address,
        latitude: propLat,
        longitude: propLon,
        what3words: property.what3words,
        plus_code: property.plus_code,
      },
      route,
      distance,
    };
  }
}
