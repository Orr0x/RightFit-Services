/**
 * Navigation and Location Types for GPS Navigation Feature
 *
 * These types support the complete navigation system including:
 * - Geocoding and reverse geocoding
 * - Route calculation and turn-by-turn directions
 * - Weather and traffic data
 * - Location sharing and tracking
 */

// ============================================================================
// LOCATION TYPES
// ============================================================================

/**
 * Geographic coordinates using WGS84 standard
 */
export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number // Accuracy in meters
  altitude?: number // Altitude in meters
  altitudeAccuracy?: number // Altitude accuracy in meters
}

/**
 * Location type indicator for UI hints and special handling
 */
export type LocationType =
  | 'ADDRESS'           // Standard street address
  | 'RURAL'             // Rural location with limited addressing
  | 'REMOTE'            // Remote location requiring what3words
  | 'COORDINATES_ONLY'  // Only lat/lon available
  | 'PLUS_CODE'         // Plus Code (OLC) location

/**
 * Complete location information
 */
export interface Location extends Coordinates {
  address?: string
  city?: string
  postcode?: string
  what3words?: string | null
  plus_code?: string | null
  location_type: LocationType
  geocoded_at?: Date | null
}

/**
 * Geocoding request
 */
export interface GeocodeRequest {
  property_id: string
  address: string
  force_refresh?: boolean // Force re-geocode even if cached
}

/**
 * Geocoding response
 */
export interface GeocodeResponse {
  property_id: string
  latitude: number
  longitude: number
  what3words?: string | null
  plus_code?: string | null
  location_type: LocationType
  geocoded_at: Date
  source: 'CACHE' | 'NOMINATIM' | 'MANUAL'
}

/**
 * Reverse geocoding (coordinates to address)
 */
export interface ReverseGeocodeRequest {
  latitude: number
  longitude: number
}

export interface ReverseGeocodeResponse {
  address: string
  city: string
  postcode: string
  country: string
}

// ============================================================================
// NAVIGATION & ROUTING TYPES
// ============================================================================

/**
 * Route request between two points
 */
export interface RouteRequest {
  origin: Coordinates
  destination: Coordinates
  mode?: 'driving' | 'walking' | 'cycling'
}

/**
 * Single step in turn-by-turn directions
 */
export interface RouteStep {
  instruction: string
  distance: number // meters
  duration: number // seconds
  start_location: Coordinates
  end_location: Coordinates
  maneuver?: string // e.g., "turn-left", "turn-right", "straight"
  road_name?: string
}

/**
 * Complete route with turn-by-turn directions
 */
export interface Route {
  distance: number // Total distance in meters
  duration: number // Total duration in seconds
  start_location: Coordinates
  end_location: Coordinates
  steps: RouteStep[]
  polyline?: string // Encoded polyline for map display
  bounds?: {
    northeast: Coordinates
    southwest: Coordinates
  }
}

/**
 * Route response
 */
export interface RouteResponse {
  routes: Route[]
  status: 'OK' | 'NO_ROUTE' | 'ERROR'
  error_message?: string
}

// ============================================================================
// WEATHER TYPES
// ============================================================================

/**
 * Weather condition
 */
export interface WeatherCondition {
  code: number
  text: string // e.g., "Partly cloudy", "Rainy"
  icon: string // Icon URL or code
}

/**
 * Current weather data
 */
export interface Weather {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
  }
  current: {
    temp_c: number
    temp_f: number
    condition: WeatherCondition
    wind_kph: number
    wind_mph: number
    wind_degree: number
    wind_dir: string // e.g., "N", "NE", "E"
    pressure_mb: number
    precip_mm: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    uv: number
  }
  last_updated: Date
}

/**
 * Weather alert
 */
export interface WeatherAlert {
  severity: 'ADVISORY' | 'WATCH' | 'WARNING' | 'EXTREME'
  headline: string
  description: string
  effective: Date
  expires: Date
  areas: string[]
}

/**
 * Weather recommendation for workers
 */
export interface WeatherRecommendation {
  is_safe_to_travel: boolean
  warnings: string[]
  suggestions: string[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE'
}

// ============================================================================
// TRAFFIC TYPES
// ============================================================================

/**
 * Traffic severity level
 */
export type TrafficSeverity = 'CLEAR' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE'

/**
 * Traffic incident type
 */
export type TrafficIncidentType =
  | 'ACCIDENT'
  | 'CONGESTION'
  | 'ROAD_WORK'
  | 'ROAD_CLOSURE'
  | 'WEATHER'
  | 'OTHER'

/**
 * Traffic incident
 */
export interface TrafficIncident {
  id: string
  type: TrafficIncidentType
  severity: TrafficSeverity
  description: string
  location: Coordinates
  road_name?: string
  delay_minutes?: number
  start_time: Date
  end_time?: Date
}

/**
 * Traffic conditions along a route
 */
export interface TrafficConditions {
  overall_severity: TrafficSeverity
  delay_minutes: number
  incidents: TrafficIncident[]
  updated_at: Date
}

// ============================================================================
// PROPERTY LOCATION TYPES (Extended from database schema)
// ============================================================================

/**
 * Property with location data (for worker navigation)
 */
export interface PropertyLocation {
  id: string
  name: string
  address: string
  postcode: string
  latitude: number | null
  longitude: number | null
  what3words: string | null
  plus_code: string | null
  location_type: LocationType
  geocoded_at: Date | null
  distance?: number // Distance from user's current location (meters)
  eta?: number // Estimated time of arrival (seconds)
}

/**
 * My Locations list item
 */
export interface MyLocation extends PropertyLocation {
  customer_name?: string
  next_job_date?: Date | null
  last_visited?: Date | null
}

// ============================================================================
// NAVIGATION STATE TYPES
// ============================================================================

/**
 * Geolocation permission state
 */
export type GeolocationPermission = 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNKNOWN'

/**
 * Geolocation error codes
 */
export type GeolocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'
  | 'UNKNOWN_ERROR'

/**
 * Geolocation error
 */
export interface GeolocationError {
  code: GeolocationErrorCode
  message: string
}

/**
 * Geolocation state
 */
export interface GeolocationState {
  location: Coordinates | null
  error: GeolocationError | null
  loading: boolean
  permission: GeolocationPermission
}

// ============================================================================
// NAVIGATION CONTEXT TYPES
// ============================================================================

/**
 * Navigation session
 */
export interface NavigationSession {
  property_id: string
  origin: Coordinates
  destination: Coordinates
  route: Route | null
  weather: Weather | null
  traffic: TrafficConditions | null
  started_at: Date
  estimated_arrival: Date
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Generic navigation API response
 */
export interface NavigationApiResponse<T> {
  data?: T
  error?: string
  message?: string
  cached?: boolean
  cache_expires_at?: Date
}

/**
 * My Locations API response
 */
export interface MyLocationsResponse {
  locations: MyLocation[]
  user_location: Coordinates | null
  total_count: number
}

/**
 * Navigation data for a specific property
 */
export interface NavigationDataRequest {
  property_id: string
  user_location?: Coordinates
}

export interface NavigationDataResponse {
  property: PropertyLocation
  route: Route | null
  weather: Weather | null
  traffic: TrafficConditions | null
  weather_recommendation: WeatherRecommendation | null
}
