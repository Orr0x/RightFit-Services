import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Configuration for a circular geofence
 */
export interface GeofenceConfig {
  /** Center latitude of the geofence */
  centerLat: number
  /** Center longitude of the geofence */
  centerLon: number
  /** Radius in meters */
  radius: number
}

/**
 * Result of a distance calculation
 */
export interface DistanceResult {
  /** Distance in meters */
  meters: number
  /** Distance in kilometers */
  kilometers: number
  /** Distance in miles */
  miles: number
  /** Whether the distance is within a specific threshold */
  isNearby: (thresholdMeters: number) => boolean
}

/**
 * Calculate distance between two GPS coordinates using the Haversine formula
 *
 * The Haversine formula determines the great-circle distance between two points
 * on a sphere given their longitudes and latitudes. This is the shortest distance
 * over the earth's surface.
 *
 * @param lat1 - Latitude of first point in degrees
 * @param lon1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lon2 - Longitude of second point in degrees
 * @returns Distance in meters
 *
 * @example
 * ```typescript
 * const distance = calculateDistance(53.4808, -2.2426, 53.4839, -2.2446)
 * console.log(`Distance: ${distance.toFixed(2)}m`) // Distance: 367.25m
 * ```
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Earth's radius in meters
  const EARTH_RADIUS_METERS = 6371000

  // Convert degrees to radians
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180

  const φ1 = toRadians(lat1)
  const φ2 = toRadians(lat2)
  const Δφ = toRadians(lat2 - lat1)
  const Δλ = toRadians(lon2 - lon1)

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // Distance in meters
  return EARTH_RADIUS_METERS * c
}

/**
 * Calculate distance with enhanced result object
 *
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns DistanceResult object with distance in multiple units
 *
 * @example
 * ```typescript
 * const result = getDistanceResult(53.4808, -2.2426, 53.4839, -2.2446)
 * console.log(`${result.meters}m (${result.kilometers}km)`)
 * if (result.isNearby(100)) {
 *   console.log('Within 100 meters!')
 * }
 * ```
 */
export function getDistanceResult(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceResult {
  const meters = calculateDistance(lat1, lon1, lat2, lon2)

  return {
    meters,
    kilometers: meters / 1000,
    miles: meters / 1609.34,
    isNearby: (thresholdMeters: number) => meters <= thresholdMeters,
  }
}

/**
 * Calculate distance between two Coordinates objects
 *
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in meters
 *
 * @example
 * ```typescript
 * const userLocation = { latitude: 53.4808, longitude: -2.2426 }
 * const propertyLocation = { latitude: 53.4839, longitude: -2.2446 }
 * const distance = getDistanceBetweenCoordinates(userLocation, propertyLocation)
 * console.log(`Distance: ${distance.toFixed(0)}m`)
 * ```
 */
export function getDistanceBetweenCoordinates(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  return calculateDistance(
    coord1.latitude,
    coord1.longitude,
    coord2.latitude,
    coord2.longitude
  )
}

/**
 * Check if a point is within a circular geofence
 *
 * @param userLat - User's current latitude
 * @param userLon - User's current longitude
 * @param geofence - Geofence configuration
 * @returns true if the point is within the geofence radius
 *
 * @example
 * ```typescript
 * const propertyGeofence = {
 *   centerLat: 53.4808,
 *   centerLon: -2.2426,
 *   radius: 50 // 50 meters
 * }
 * const isAtProperty = isWithinGeofence(53.4809, -2.2427, propertyGeofence)
 * if (isAtProperty) {
 *   console.log('Worker has arrived!')
 * }
 * ```
 */
export function isWithinGeofence(
  userLat: number,
  userLon: number,
  geofence: GeofenceConfig
): boolean {
  const distance = calculateDistance(
    userLat,
    userLon,
    geofence.centerLat,
    geofence.centerLon
  )
  return distance <= geofence.radius
}

/**
 * Check if coordinates are within a geofence
 *
 * @param userCoords - User's current coordinates
 * @param centerCoords - Center of the geofence
 * @param radiusMeters - Radius in meters
 * @returns true if within geofence
 *
 * @example
 * ```typescript
 * const userLocation = { latitude: 53.4808, longitude: -2.2426 }
 * const propertyLocation = { latitude: 53.4809, longitude: -2.2427 }
 * const hasArrived = isWithinRadius(userLocation, propertyLocation, 50)
 * ```
 */
export function isWithinRadius(
  userCoords: Coordinates,
  centerCoords: Coordinates,
  radiusMeters: number
): boolean {
  const distance = getDistanceBetweenCoordinates(userCoords, centerCoords)
  return distance <= radiusMeters
}

/**
 * Format distance for display
 *
 * @param meters - Distance in meters
 * @param precision - Number of decimal places (default: 0)
 * @returns Formatted string with appropriate unit
 *
 * @example
 * ```typescript
 * formatDistance(25) // "25m"
 * formatDistance(1200) // "1.2km"
 * formatDistance(45678) // "45.7km"
 * formatDistance(120, 1) // "120.0m"
 * ```
 */
export function formatDistance(meters: number, precision: number = 0): string {
  if (meters < 1000) {
    return `${meters.toFixed(precision)}m`
  }
  const km = meters / 1000
  return `${km.toFixed(Math.max(1, precision))}km`
}

/**
 * Create a geofence configuration from coordinates
 *
 * @param center - Center coordinates
 * @param radiusMeters - Radius in meters
 * @returns GeofenceConfig object
 *
 * @example
 * ```typescript
 * const propertyLocation = { latitude: 53.4808, longitude: -2.2426 }
 * const arrivalGeofence = createGeofence(propertyLocation, 50)
 * ```
 */
export function createGeofence(
  center: Coordinates,
  radiusMeters: number
): GeofenceConfig {
  return {
    centerLat: center.latitude,
    centerLon: center.longitude,
    radius: radiusMeters,
  }
}

/**
 * Calculate the total distance of a route from GPS points
 *
 * @param routePoints - Array of GPS coordinates
 * @returns Total distance in meters
 *
 * @example
 * ```typescript
 * const route = [
 *   { latitude: 53.4808, longitude: -2.2426 },
 *   { latitude: 53.4839, longitude: -2.2446 },
 *   { latitude: 53.4850, longitude: -2.2460 }
 * ]
 * const totalDistance = calculateRouteDistance(route)
 * console.log(`Total: ${formatDistance(totalDistance)}`)
 * ```
 */
export function calculateRouteDistance(routePoints: Coordinates[]): number {
  if (routePoints.length < 2) {
    return 0
  }

  let totalDistance = 0
  for (let i = 1; i < routePoints.length; i++) {
    totalDistance += getDistanceBetweenCoordinates(
      routePoints[i - 1],
      routePoints[i]
    )
  }

  return totalDistance
}

/**
 * Common geofence radii for different use cases
 */
export const GEOFENCE_RADII = {
  /** Very close - for confirming worker is at exact location */
  EXACT: 10, // 10 meters

  /** Close - for job arrival detection */
  ARRIVAL: 50, // 50 meters

  /** Nearby - for showing nearby jobs */
  NEARBY: 200, // 200 meters

  /** Area - for general vicinity */
  AREA: 500, // 500 meters

  /** Wide - for city-level proximity */
  WIDE: 2000, // 2 kilometers
} as const

/**
 * Verify that GPS coordinates are valid
 *
 * @param coords - Coordinates to validate
 * @returns true if coordinates are valid
 *
 * @example
 * ```typescript
 * const userLocation = { latitude: 53.4808, longitude: -2.2426 }
 * if (isValidCoordinates(userLocation)) {
 *   // Safe to use coordinates
 * }
 * ```
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180 &&
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude)
  )
}

/**
 * Get a human-readable proximity description
 *
 * @param meters - Distance in meters
 * @returns Description like "At location", "Very close", "Nearby", etc.
 *
 * @example
 * ```typescript
 * getProximityDescription(5) // "At location"
 * getProximityDescription(35) // "Very close"
 * getProximityDescription(150) // "Nearby"
 * getProximityDescription(5000) // "Far away"
 * ```
 */
export function getProximityDescription(meters: number): string {
  if (meters <= GEOFENCE_RADII.EXACT) return 'At location'
  if (meters <= GEOFENCE_RADII.ARRIVAL) return 'Very close'
  if (meters <= GEOFENCE_RADII.NEARBY) return 'Nearby'
  if (meters <= GEOFENCE_RADII.AREA) return 'In the area'
  if (meters <= GEOFENCE_RADII.WIDE) return 'A few minutes away'
  return 'Far away'
}
