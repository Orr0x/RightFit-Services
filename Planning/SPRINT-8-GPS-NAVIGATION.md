# Sprint 8: GPS Navigation & Location Services

**Project**: RightFit Services - Worker Web App Enhancement
**Sprint Duration**: 10-14 days (flexible based on quality gates)
**Story Points**: 42 points
**Status**: ⏳ READY TO START
**Priority**: HIGH - Worker productivity enhancement
**Philosophy**: **RightFit, not QuickFix** - Production-ready navigation with zero monthly cost

---

## Table of Contents

1. [Sprint Overview](#sprint-overview)
2. [Quality Gates](#quality-gates)
3. [Database Schema Changes](#database-schema-changes)
4. [API Development](#api-development)
5. [Frontend Components](#frontend-components)
6. [Testing Requirements](#testing-requirements)
7. [Story Breakdown](#story-breakdown)
8. [Implementation Timeline](#implementation-timeline)
9. [Risk Management](#risk-management)
10. [Success Metrics](#success-metrics)

---

## Sprint Overview

### Goal

Enable workers to navigate to job locations with GPS, real-time traffic, and weather information - all using free API tiers at zero monthly cost.

### Business Value

**For Workers**:
- Save 15-30 mins/day with optimized routing
- Arrive on time with traffic-aware navigation
- Plan better with weather forecasts
- Reduce fuel costs by 10-15%

**For Business**:
- Higher on-time arrival rate (target 95%)
- Better customer satisfaction
- Competitive advantage over Jobber, Housecall Pro
- Reduced support calls ("where is the property?")

**For Platform**:
- Demonstrates innovation and user-centricity
- Minimal cost ($0/month with free APIs)
- Foundation for future features (tracking, geofencing)

---

## Quality Gates

All stories must meet these gates before sprint completion:

### Code Quality ✅
- [x] TypeScript strict mode (zero `any` types)
- [x] ESLint + Prettier passing
- [x] All console.errors and warnings resolved
- [x] No TODO or FIXME comments in production code
- [x] Code reviewed by senior developer

### Testing ✅
- [x] Unit tests with >80% coverage (aim for >90%)
- [x] Integration tests for all API endpoints
- [x] E2E test for complete navigation flow
- [x] Manual testing on 5+ real mobile devices
- [x] Tested on slow 3G network
- [x] Tested with location permission denied

### Accessibility ✅
- [x] WCAG 2.1 AA compliant (AAA preferred)
- [x] Keyboard navigation fully supported
- [x] Screen reader tested (iOS VoiceOver, Android TalkBack)
- [x] Color contrast >4.5:1 (>7:1 preferred)
- [x] Touch targets >44x44 pixels
- [x] Text readable at 200% zoom

### Performance ✅
- [x] Time to first navigation <3 seconds
- [x] Geocoding cached (no repeated API calls)
- [x] Maps load <2 seconds
- [x] Works offline (graceful degradation)
- [x] Bundle size increase <100KB

### Security ✅
- [x] API keys stored in environment variables (never in code)
- [x] Location data encrypted in transit (HTTPS only)
- [x] User location not stored without permission
- [x] Multi-tenant isolation verified
- [x] No sensitive data in logs

### User Experience ✅
- [x] Works on iOS Safari, Android Chrome, Firefox Mobile
- [x] Clear permission request with explanation
- [x] Helpful error messages (not technical jargon)
- [x] Loading states for all async operations
- [x] Offline fallback (open native maps app)
- [x] One-tap navigation to job site

### Documentation ✅
- [x] API endpoints documented (OpenAPI/Swagger)
- [x] Component props documented with JSDoc
- [x] README updated with new dependencies
- [x] Architecture decision record (ADR) for API choices
- [x] User guide for workers

---

## Database Schema Changes

### Migration: Add Location Fields to Property Table

**File**: `packages/database/prisma/migrations/YYYYMMDDHHMMSS_add_property_location_fields/migration.sql`

```sql
-- Add GPS coordinates (WGS84 standard)
ALTER TABLE "Property" ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE "Property" ADD COLUMN longitude DECIMAL(11, 8);

-- Add what3words address for remote locations
ALTER TABLE "Property" ADD COLUMN what3words VARCHAR(50);

-- Add Plus Code (Open Location Code) as free backup
ALTER TABLE "Property" ADD COLUMN plus_code VARCHAR(20);

-- Track location type for UI hints
ALTER TABLE "Property" ADD COLUMN location_type VARCHAR(20) DEFAULT 'ADDRESS';

-- Track when coordinates were last geocoded
ALTER TABLE "Property" ADD COLUMN geocoded_at TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN "Property".latitude IS 'Decimal degrees, WGS84. Range: -90 to 90';
COMMENT ON COLUMN "Property".longitude IS 'Decimal degrees, WGS84. Range: -180 to 180';
COMMENT ON COLUMN "Property".what3words IS 'what3words address (e.g., filled.count.soap) for remote properties';
COMMENT ON COLUMN "Property".plus_code IS 'Plus Code (Open Location Code) - free alternative to what3words';
COMMENT ON COLUMN "Property".location_type IS 'ADDRESS, WHAT3WORDS, PLUS_CODE, or GPS_ONLY';
COMMENT ON COLUMN "Property".geocoded_at IS 'Timestamp of last successful geocoding (for cache invalidation)';

-- Create index for geospatial queries (future optimization)
CREATE INDEX idx_property_location ON "Property" (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index for location type filtering
CREATE INDEX idx_property_location_type ON "Property" (location_type);
```

### Update Prisma Schema

**File**: `packages/database/prisma/schema.prisma`

```prisma
model Property {
  id                     String    @id @default(uuid())
  tenant_id              String
  owner_user_id          String
  name                   String    @db.VarChar(100)
  address_line1          String    @db.VarChar(255)
  address_line2          String?   @db.VarChar(255)
  city                   String    @db.VarChar(100)
  postcode               String    @db.VarChar(10)

  // Location fields (NEW)
  latitude               Decimal?  @db.Decimal(10, 8)
  longitude              Decimal?  @db.Decimal(11, 8)
  what3words             String?   @db.VarChar(50)
  plus_code              String?   @db.VarChar(20)
  location_type          String    @default("ADDRESS") @db.VarChar(20)
  geocoded_at            DateTime?

  property_type          PropertyType
  bedrooms               Int       @default(0)
  bathrooms              Int       @default(0)
  access_instructions    String?
  status                 PropertyStatus @default(ACTIVE)
  created_at             DateTime  @default(now())
  updated_at             DateTime  @updatedAt
  deleted_at             DateTime?

  // Relations
  certificates           Certificate[]
  financial_transactions FinancialTransaction[]
  photos                 Photo[]
  owner                  User      @relation("PropertyOwner", fields: [owner_user_id], references: [id])
  tenant                 Tenant    @relation(fields: [tenant_id], references: [id])
  property_budget        PropertyBudget?
  shares                 PropertyShare[]
  property_tenants       PropertyTenant[]
  work_orders            WorkOrder[]

  @@index([tenant_id])
  @@index([owner_user_id])
  @@index([postcode])
  @@index([latitude, longitude])
  @@index([location_type])
  @@map("properties")
}
```

### TypeScript Types Update

**File**: `packages/database/src/types.ts` (if exists) or `apps/api/src/types/index.ts`

```typescript
export interface PropertyLocation {
  latitude?: number
  longitude?: number
  what3words?: string
  plus_code?: string
  location_type: 'ADDRESS' | 'WHAT3WORDS' | 'PLUS_CODE' | 'GPS_ONLY'
  geocoded_at?: Date
}

export interface GeoCoordinates {
  lat: number
  lon: number
}

export interface NavigationRoute {
  distance: number          // meters
  duration: number          // seconds
  geometry: GeoJSON         // Route line coordinates
  steps: RouteStep[]        // Turn-by-turn instructions
  traffic_delay?: number    // seconds
}

export interface RouteStep {
  instruction: string       // "Turn left onto Main St"
  distance: number          // meters
  duration: number          // seconds
  maneuver: string          // "turn-left", "turn-right", etc.
}

export interface WeatherData {
  temperature: number       // Celsius
  condition: string         // "clear", "rain", "snow"
  description: string       // "Light rain"
  precipitation: number     // mm/hour
  wind_speed: number        // km/h
  alerts: WeatherAlert[]
}

export interface WeatherAlert {
  event: string             // "Heavy Rain Warning"
  severity: 'minor' | 'moderate' | 'severe' | 'extreme'
  description: string
  start: Date
  end: Date
}

export interface TrafficInfo {
  current_speed: number     // km/h
  free_flow_speed: number   // km/h
  confidence: number        // 0-1
  incidents: TrafficIncident[]
}

export interface TrafficIncident {
  type: 'accident' | 'construction' | 'closure' | 'congestion'
  description: string
  severity: 'minor' | 'moderate' | 'severe'
  delay: number             // minutes
  location: GeoCoordinates
}
```

---

## API Development

### New API Endpoints

All endpoints follow multi-tenant security model with `service_provider_id` validation.

#### 1. **Geocoding Endpoint**

**File**: `apps/api/src/routes/geocoding.ts`

```typescript
/**
 * POST /api/geocoding/address
 *
 * Geocode an address to GPS coordinates using Nominatim (free)
 * with fallback to Mapbox if Nominatim fails.
 *
 * Caches result in Property table to avoid repeated API calls.
 */
router.post('/address', authenticateToken, async (req, res) => {
  // Input: { property_id: string, address: string }
  // Output: { latitude: number, longitude: number, plus_code: string }
  // Security: Verify property belongs to user's service_provider_id
  // Cache: Update Property.latitude/longitude/geocoded_at
  // Error handling: Return helpful error if geocoding fails
})

/**
 * POST /api/geocoding/reverse
 *
 * Reverse geocode GPS coordinates to address
 */
router.post('/reverse', authenticateToken, async (req, res) => {
  // Input: { latitude: number, longitude: number }
  // Output: { address: string, city: string, postcode: string }
})

/**
 * POST /api/geocoding/what3words
 *
 * Convert what3words address to GPS coordinates
 */
router.post('/what3words', authenticateToken, async (req, res) => {
  // Input: { what3words: string }
  // Output: { latitude: number, longitude: number }
  // API: what3words API (25K free/month)
})
```

#### 2. **Navigation/Routing Endpoint**

**File**: `apps/api/src/routes/navigation.ts`

```typescript
/**
 * POST /api/navigation/route
 *
 * Get navigation route from origin to destination using OSRM (free)
 */
router.post('/route', authenticateToken, async (req, res) => {
  // Input: {
  //   origin: { lat: number, lon: number },
  //   destination: { lat: number, lon: number },
  //   include_traffic?: boolean,
  //   include_alternatives?: boolean
  // }
  // Output: NavigationRoute
  // API: OSRM (free, unlimited with self-hosting)
})

/**
 * POST /api/navigation/optimize
 *
 * Optimize route for multiple stops (traveling salesman problem)
 */
router.post('/optimize', authenticateToken, async (req, res) => {
  // Input: {
  //   origin: GeoCoordinates,
  //   stops: GeoCoordinates[],
  //   return_to_origin?: boolean
  // }
  // Output: {
  //   optimized_order: number[],
  //   routes: NavigationRoute[],
  //   total_distance: number,
  //   total_duration: number,
  //   savings: { distance: number, time: number }
  // }
})

/**
 * GET /api/navigation/job/:id/route
 *
 * Get route to specific job (convenience endpoint)
 */
router.get('/job/:id/route', authenticateToken, async (req, res) => {
  // Get job property coordinates
  // Get user's current location from query params or use service provider address
  // Return route
  // Security: Verify job belongs to user's service_provider_id
})
```

#### 3. **Traffic Endpoint**

**File**: `apps/api/src/routes/traffic.ts`

```typescript
/**
 * GET /api/traffic/flow
 *
 * Get real-time traffic flow data for a location
 */
router.get('/flow', authenticateToken, async (req, res) => {
  // Input: ?lat=51.5074&lon=-0.1278
  // Output: TrafficInfo
  // API: TomTom Traffic API (2,500 free/day)
})

/**
 * GET /api/traffic/incidents
 *
 * Get traffic incidents (accidents, closures) for a route
 */
router.get('/incidents', authenticateToken, async (req, res) => {
  // Input: ?bbox=-0.2,51.4,-0.1,51.6 (bounding box)
  // Output: TrafficIncident[]
})
```

#### 4. **Weather Endpoint**

**File**: `apps/api/src/routes/weather.ts`

```typescript
/**
 * GET /api/weather/current
 *
 * Get current weather for a location
 */
router.get('/current', authenticateToken, async (req, res) => {
  // Input: ?lat=51.5074&lon=-0.1278
  // Output: WeatherData
  // API: WeatherAPI.com (1M free/month)
})

/**
 * GET /api/weather/forecast
 *
 * Get hourly weather forecast for next 48 hours
 */
router.get('/forecast', authenticateToken, async (req, res) => {
  // Input: ?lat=51.5074&lon=-0.1278&hours=48
  // Output: WeatherData[]
  // Cache: 1 hour (weather doesn't change that fast)
})

/**
 * GET /api/weather/alerts
 *
 * Get weather alerts (storms, heavy rain, snow)
 */
router.get('/alerts', authenticateToken, async (req, res) => {
  // Input: ?lat=51.5074&lon=-0.1278
  // Output: WeatherAlert[]
})

/**
 * GET /api/weather/job/:id
 *
 * Get weather forecast for job location at scheduled time
 */
router.get('/job/:id', authenticateToken, async (req, res) => {
  // Get job scheduled time and property coordinates
  // Return weather forecast for that specific time
  // Include alerts if severe weather expected
  // Security: Verify job belongs to user's service_provider_id
})
```

### API Service Classes

**File**: `apps/api/src/services/NavigationService.ts`

```typescript
import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class NavigationService {
  /**
   * Geocode address to coordinates using Nominatim
   * Caches result in Property table
   */
  async geocodeAddress(
    propertyId: string,
    address: string,
    serviceProviderId: string
  ): Promise<{ lat: number; lon: number; plus_code: string }> {
    // 1. Check if property already has coordinates
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenant_id: serviceProviderId
      },
      select: {
        latitude: true,
        longitude: true,
        geocoded_at: true,
        plus_code: true
      }
    })

    // 2. If coordinates exist and geocoded within last 30 days, return cached
    if (
      property?.latitude &&
      property?.longitude &&
      property?.geocoded_at &&
      (new Date().getTime() - new Date(property.geocoded_at).getTime()) < 30 * 24 * 60 * 60 * 1000
    ) {
      return {
        lat: Number(property.latitude),
        lon: Number(property.longitude),
        plus_code: property.plus_code || this.generatePlusCode(Number(property.latitude), Number(property.longitude))
      }
    }

    // 3. Geocode using Nominatim (free)
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'RightFit-Services/1.0'
        }
      })

      if (response.data.length === 0) {
        throw new Error('Address not found')
      }

      const { lat, lon } = response.data[0]
      const plus_code = this.generatePlusCode(Number(lat), Number(lon))

      // 4. Update Property table with coordinates
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          latitude: Number(lat),
          longitude: Number(lon),
          plus_code,
          geocoded_at: new Date(),
          location_type: 'ADDRESS'
        }
      })

      return { lat: Number(lat), lon: Number(lon), plus_code }
    } catch (error) {
      // Fallback: Use Mapbox (100K free/month)
      // throw new Error('Geocoding failed')
      throw error
    }
  }

  /**
   * Generate Plus Code (Open Location Code) from coordinates
   * This is FREE and works offline
   */
  generatePlusCode(lat: number, lon: number): string {
    // Use open-location-code npm package
    const OpenLocationCode = require('open-location-code').OpenLocationCode
    const olc = new OpenLocationCode()
    return olc.encode(lat, lon, 10) // 10-digit code (~14m precision)
  }

  /**
   * Get route from origin to destination using OSRM
   */
  async getRoute(
    origin: { lat: number; lon: number },
    destination: { lat: number; lon: number },
    includeAlternatives: boolean = false
  ): Promise<any> {
    const url = `http://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`

    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true,
        alternatives: includeAlternatives
      }
    })

    return response.data
  }

  /**
   * Optimize route for multiple stops
   * Solves traveling salesman problem
   */
  async optimizeRoute(
    origin: { lat: number; lon: number },
    stops: { lat: number; lon: number }[],
    returnToOrigin: boolean = false
  ): Promise<any> {
    // Use OSRM trip service for route optimization
    const coordinates = [origin, ...stops]
    if (returnToOrigin) {
      coordinates.push(origin)
    }

    const coordString = coordinates
      .map(c => `${c.lon},${c.lat}`)
      .join(';')

    const url = `http://router.project-osrm.org/trip/v1/driving/${coordString}`

    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true
      }
    })

    return response.data
  }
}
```

**File**: `apps/api/src/services/WeatherService.ts`

```typescript
import axios from 'axios'

export class WeatherService {
  private apiKey: string = process.env.WEATHER_API_KEY || ''
  private baseUrl = 'https://api.weatherapi.com/v1'

  /**
   * Get current weather for coordinates
   */
  async getCurrentWeather(lat: number, lon: number): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/current.json`, {
      params: {
        key: this.apiKey,
        q: `${lat},${lon}`,
        aqi: 'no'
      }
    })

    return {
      temperature: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      description: response.data.current.condition.text,
      precipitation: response.data.current.precip_mm,
      wind_speed: response.data.current.wind_kph,
      humidity: response.data.current.humidity,
      icon: response.data.current.condition.icon
    }
  }

  /**
   * Get hourly forecast
   */
  async getForecast(lat: number, lon: number, hours: number = 48): Promise<any> {
    const days = Math.ceil(hours / 24)

    const response = await axios.get(`${this.baseUrl}/forecast.json`, {
      params: {
        key: this.apiKey,
        q: `${lat},${lon}`,
        days: days,
        aqi: 'no',
        alerts: 'yes'
      }
    })

    return response.data
  }

  /**
   * Get weather alerts
   */
  async getAlerts(lat: number, lon: number): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/forecast.json`, {
      params: {
        key: this.apiKey,
        q: `${lat},${lon}`,
        days: 1,
        alerts: 'yes'
      }
    })

    return response.data.alerts?.alert || []
  }

  /**
   * Check if weather is suitable for outdoor work
   */
  isSuitableForWork(weather: any): { suitable: boolean; warnings: string[] } {
    const warnings: string[] = []
    let suitable = true

    // Heavy rain
    if (weather.precipitation > 5) {
      suitable = false
      warnings.push(`Heavy rain expected (${weather.precipitation}mm/hr). Consider rescheduling outdoor work.`)
    }

    // High winds
    if (weather.wind_speed > 40) {
      suitable = false
      warnings.push(`High winds (${weather.wind_speed} km/h). Unsafe for ladder work or scaffolding.`)
    }

    // Extreme cold
    if (weather.temperature < 0) {
      warnings.push(`Freezing temperatures (${weather.temperature}°C). Take precautions.`)
    }

    // Extreme heat
    if (weather.temperature > 30) {
      warnings.push(`High temperature (${weather.temperature}°C). Stay hydrated and take breaks.`)
    }

    return { suitable, warnings }
  }
}
```

**File**: `apps/api/src/services/TrafficService.ts`

```typescript
import axios from 'axios'

export class TrafficService {
  private apiKey: string = process.env.TOMTOM_API_KEY || ''

  /**
   * Get real-time traffic flow data
   */
  async getTrafficFlow(lat: number, lon: number): Promise<any> {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`

    const response = await axios.get(url, {
      params: {
        key: this.apiKey,
        point: `${lat},${lon}`
      }
    })

    const data = response.data.flowSegmentData

    return {
      current_speed: data.currentSpeed,
      free_flow_speed: data.freeFlowSpeed,
      current_travel_time: data.currentTravelTime,
      free_flow_travel_time: data.freeFlowTravelTime,
      confidence: data.confidence,
      delay_factor: (data.currentTravelTime / data.freeFlowTravelTime) - 1
    }
  }

  /**
   * Get traffic incidents in bounding box
   */
  async getIncidents(bbox: string): Promise<any> {
    const url = `https://api.tomtom.com/traffic/services/5/incidentDetails`

    const response = await axios.get(url, {
      params: {
        key: this.apiKey,
        bbox: bbox,
        fields: '{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory}}}}'
      }
    })

    return response.data.incidents || []
  }

  /**
   * Calculate delay from traffic data
   */
  calculateDelay(flow: any): number {
    if (!flow.current_travel_time || !flow.free_flow_travel_time) {
      return 0
    }

    return Math.round(flow.current_travel_time - flow.free_flow_travel_time)
  }
}
```

---

## Frontend Components

### Component Structure

```
apps/web-worker/src/
├── components/
│   └── navigation/
│       ├── NavigationButton.tsx       # One-tap navigation button
│       ├── MapView.tsx                 # Interactive map with route
│       ├── RouteDetails.tsx            # Distance, ETA, instructions
│       ├── WeatherAlert.tsx            # Weather warnings for job
│       ├── TrafficStatus.tsx           # Traffic delay indicator
│       ├── LocationPermission.tsx      # Request location access
│       └── RouteOptimizer.tsx          # Multi-stop optimization UI
├── services/
│   ├── navigationApi.ts                # API client for navigation endpoints
│   ├── locationService.ts              # Browser geolocation wrapper
│   └── mapService.ts                   # Map rendering (Leaflet.js)
├── hooks/
│   ├── useGeolocation.ts               # React hook for user location
│   ├── useNavigation.ts                # React hook for navigation state
│   └── useWeather.ts                   # React hook for weather data
└── pages/
    └── navigation/
        ├── RoutePreview.tsx            # Full-screen route preview
        └── NavigationSettings.tsx      # User preferences
```

### Component: NavigationButton

**File**: `apps/web-worker/src/components/navigation/NavigationButton.tsx`

```typescript
import React, { useState } from 'react'
import { Navigation, Loader, MapPin, ExternalLink } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeolocation'
import { navigationApi } from '../../services/navigationApi'

interface NavigationButtonProps {
  propertyId: string
  propertyName: string
  address: string
  latitude?: number
  longitude?: number
  className?: string
}

export function NavigationButton({
  propertyId,
  propertyName,
  address,
  latitude,
  longitude,
  className = ''
}: NavigationButtonProps) {
  const [loading, setLoading] = useState(false)
  const { location, error: locationError, requestPermission } = useGeolocation()

  const handleNavigate = async () => {
    setLoading(true)

    try {
      // 1. Get user's current location
      if (!location) {
        await requestPermission()
      }

      // 2. Geocode property address if coordinates not available
      let destLat = latitude
      let destLon = longitude

      if (!destLat || !destLon) {
        const coords = await navigationApi.geocodeAddress(propertyId, address)
        destLat = coords.latitude
        destLon = coords.longitude
      }

      // 3. Open in native maps app (Google Maps on Android, Apple Maps on iOS)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const mapsUrl = isIOS
        ? `maps://maps.apple.com/?daddr=${destLat},${destLon}&saddr=${location?.latitude},${location?.longitude}`
        : `https://www.google.com/maps/dir/?api=1&origin=${location?.latitude},${location?.longitude}&destination=${destLat},${destLon}&travelmode=driving`

      window.open(mapsUrl, '_blank')

    } catch (error) {
      console.error('Navigation failed:', error)
      alert('Unable to start navigation. Please check your location permissions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleNavigate}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      aria-label={`Navigate to ${propertyName}`}
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>Getting directions...</span>
        </>
      ) : (
        <>
          <Navigation className="w-5 h-5" />
          <span>Navigate</span>
          <ExternalLink className="w-4 h-4 opacity-70" />
        </>
      )}
    </button>
  )
}
```

### Component: MapView

**File**: `apps/web-worker/src/components/navigation/MapView.tsx`

```typescript
import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { navigationApi } from '../../services/navigationApi'
import { Loader } from 'lucide-react'

interface MapViewProps {
  origin: { lat: number; lon: number }
  destination: { lat: number; lon: number }
  showTraffic?: boolean
  className?: string
}

export function MapView({
  origin,
  destination,
  showTraffic = false,
  className = ''
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([origin.lat, origin.lon], 13)
    mapInstanceRef.current = map

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Add origin marker
    L.marker([origin.lat, origin.lon], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
        iconSize: [20, 20]
      })
    }).addTo(map).bindPopup('Your Location')

    // Add destination marker
    L.marker([destination.lat, destination.lon], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
        iconSize: [20, 20]
      })
    }).addTo(map).bindPopup('Job Location')

    // Fetch and display route
    fetchRoute(map)

    return () => {
      map.remove()
    }
  }, [])

  const fetchRoute = async (map: L.Map) => {
    try {
      const routeData = await navigationApi.getRoute(origin, destination)
      setRoute(routeData)

      // Draw route on map
      const coordinates = routeData.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] // Flip lon,lat to lat,lon
      )

      L.polyline(coordinates, {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.7
      }).addTo(map)

      // Fit map bounds to show entire route
      const bounds = L.latLngBounds(coordinates)
      map.fitBounds(bounds, { padding: [50, 50] })

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch route:', error)
      setLoading(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />
      {route && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-lg font-bold">{(route.routes[0].distance / 1000).toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-bold">{Math.round(route.routes[0].duration / 60)} min</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Component: WeatherAlert

**File**: `apps/web-worker/src/components/navigation/WeatherAlert.tsx`

```typescript
import React from 'react'
import { Cloud, CloudRain, CloudSnow, CloudDrizzle, Sun, Wind, AlertTriangle } from 'lucide-react'

interface WeatherAlertProps {
  weather: {
    temperature: number
    condition: string
    precipitation: number
    wind_speed: number
    alerts?: Array<{
      event: string
      severity: string
      description: string
    }>
  }
  jobTime?: Date
  className?: string
}

export function WeatherAlert({ weather, jobTime, className = '' }: WeatherAlertProps) {
  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase()
    if (condition.includes('rain')) return <CloudRain className="w-6 h-6" />
    if (condition.includes('snow')) return <CloudSnow className="w-6 h-6" />
    if (condition.includes('drizzle')) return <CloudDrizzle className="w-6 h-6" />
    if (condition.includes('cloud')) return <Cloud className="w-6 h-6" />
    return <Sun className="w-6 h-6" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-100 border-red-300 text-red-800'
      case 'severe': return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'moderate': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default: return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  const hasWarnings = weather.precipitation > 5 || weather.wind_speed > 40 || (weather.alerts && weather.alerts.length > 0)

  return (
    <div className={`border rounded-lg p-4 ${hasWarnings ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getWeatherIcon()}
          <div>
            <h3 className="font-semibold text-gray-900">{weather.condition}</h3>
            <p className="text-sm text-gray-600">
              {weather.temperature}°C
              {jobTime && ` at ${jobTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
        </div>
        {hasWarnings && (
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        )}
      </div>

      {/* Weather details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{weather.precipitation} mm/hr</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{weather.wind_speed} km/h</span>
        </div>
      </div>

      {/* Warnings */}
      {weather.precipitation > 5 && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-medium text-blue-900">☔ Heavy rain expected</p>
          <p className="text-blue-700">Allow +10 minutes travel time. Bring rain gear.</p>
        </div>
      )}

      {weather.wind_speed > 40 && (
        <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
          <p className="font-medium text-orange-900">💨 High winds</p>
          <p className="text-orange-700">Unsafe for ladder work. Consider rescheduling outdoor tasks.</p>
        </div>
      )}

      {/* Severe weather alerts */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="space-y-2">
          {weather.alerts.map((alert, index) => (
            <div key={index} className={`p-3 border rounded ${getSeverityColor(alert.severity)}`}>
              <p className="font-bold text-sm mb-1">⚠️ {alert.event}</p>
              <p className="text-xs">{alert.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Hook: useGeolocation

**File**: `apps/web-worker/src/hooks/useGeolocation.ts`

```typescript
import { useState, useEffect } from 'react'

interface GeolocationState {
  location: {
    latitude: number
    longitude: number
    accuracy: number
  } | null
  error: string | null
  loading: boolean
}

export function useGeolocation(requestOnMount: boolean = false) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false
  })

  const requestPermission = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          error: null,
          loading: false
        })
      },
      (error) => {
        let errorMessage = 'Unable to get your location'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }

        setState({
          location: null,
          error: errorMessage,
          loading: false
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      }
    )
  }

  useEffect(() => {
    if (requestOnMount) {
      requestPermission()
    }
  }, [requestOnMount])

  return {
    ...state,
    requestPermission
  }
}
```

### Service: navigationApi

**File**: `apps/web-worker/src/services/navigationApi.ts`

```typescript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class NavigationAPI {
  /**
   * Geocode an address to GPS coordinates
   */
  async geocodeAddress(
    propertyId: string,
    address: string
  ): Promise<{ latitude: number; longitude: number; plus_code: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/geocoding/address`,
      { property_id: propertyId, address },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    return response.data
  }

  /**
   * Get navigation route
   */
  async getRoute(
    origin: { lat: number; lon: number },
    destination: { lat: number; lon: number }
  ): Promise<any> {
    const response = await axios.post(
      `${API_BASE_URL}/api/navigation/route`,
      { origin, destination },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    return response.data
  }

  /**
   * Get route for specific job
   */
  async getJobRoute(
    jobId: string,
    userLocation: { lat: number; lon: number }
  ): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/api/navigation/job/${jobId}/route`,
      {
        params: { lat: userLocation.lat, lon: userLocation.lon },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    return response.data
  }

  /**
   * Get weather for job
   */
  async getJobWeather(jobId: string): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/api/weather/job/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    return response.data
  }

  /**
   * Optimize multi-stop route
   */
  async optimizeRoute(
    origin: { lat: number; lon: number },
    stops: Array<{ lat: number; lon: number; jobId: string }>
  ): Promise<any> {
    const response = await axios.post(
      `${API_BASE_URL}/api/navigation/optimize`,
      { origin, stops },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    return response.data
  }
}

export const navigationApi = new NavigationAPI()
```

---

## Testing Requirements

### Unit Tests

**File**: `apps/api/src/services/__tests__/NavigationService.test.ts`

```typescript
import { NavigationService } from '../NavigationService'

describe('NavigationService', () => {
  let service: NavigationService

  beforeEach(() => {
    service = new NavigationService()
  })

  describe('geocodeAddress', () => {
    it('should geocode London address correctly', async () => {
      const result = await service.geocodeAddress(
        'test-property-id',
        '10 Downing Street, London, SW1A 2AA',
        'test-service-provider-id'
      )

      expect(result.lat).toBeCloseTo(51.5034, 2)
      expect(result.lon).toBeCloseTo(-0.1276, 2)
      expect(result.plus_code).toBeDefined()
    })

    it('should return cached coordinates if available', async () => {
      // Test caching logic
    })

    it('should throw error for invalid address', async () => {
      await expect(
        service.geocodeAddress('id', 'INVALID_ADDRESS_12345', 'sp-id')
      ).rejects.toThrow('Address not found')
    })
  })

  describe('generatePlusCode', () => {
    it('should generate valid Plus Code', () => {
      const code = service.generatePlusCode(51.5074, -0.1278)
      expect(code).toMatch(/^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/)
    })
  })

  describe('getRoute', () => {
    it('should return route with distance and duration', async () => {
      const origin = { lat: 51.5074, lon: -0.1278 }
      const destination = { lat: 51.5142, lon: -0.0877 }

      const route = await service.getRoute(origin, destination)

      expect(route.routes).toBeDefined()
      expect(route.routes[0].distance).toBeGreaterThan(0)
      expect(route.routes[0].duration).toBeGreaterThan(0)
    })
  })
})
```

### Integration Tests

**File**: `apps/api/src/routes/__tests__/navigation.integration.test.ts`

```typescript
import request from 'supertest'
import app from '../../index'

describe('Navigation API Integration', () => {
  let authToken: string

  beforeAll(async () => {
    // Login and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
    authToken = response.body.token
  })

  describe('POST /api/geocoding/address', () => {
    it('should geocode address with authentication', async () => {
      const response = await request(app)
        .post('/api/geocoding/address')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          property_id: 'test-property-id',
          address: '10 Downing Street, London'
        })
        .expect(200)

      expect(response.body.latitude).toBeDefined()
      expect(response.body.longitude).toBeDefined()
      expect(response.body.plus_code).toBeDefined()
    })

    it('should reject without authentication', async () => {
      await request(app)
        .post('/api/geocoding/address')
        .send({ property_id: 'id', address: 'test' })
        .expect(401)
    })
  })

  describe('POST /api/navigation/route', () => {
    it('should return route between two points', async () => {
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          origin: { lat: 51.5074, lon: -0.1278 },
          destination: { lat: 51.5142, lon: -0.0877 }
        })
        .expect(200)

      expect(response.body.distance).toBeGreaterThan(0)
      expect(response.body.duration).toBeGreaterThan(0)
      expect(response.body.geometry).toBeDefined()
    })
  })

  describe('GET /api/weather/job/:id', () => {
    it('should return weather for job location', async () => {
      const response = await request(app)
        .get('/api/weather/job/test-job-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.temperature).toBeDefined()
      expect(response.body.condition).toBeDefined()
    })
  })
})
```

### E2E Tests

**File**: `apps/web-worker/e2e/navigation.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Worker Navigation Flow', () => {
  test('should navigate to job from details page', async ({ page, context }) => {
    // Grant location permission
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 })

    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'worker@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Navigate to job details
    await page.goto('/jobs/test-job-id')
    await expect(page.locator('h1')).toContainText('Job Details')

    // Click navigate button
    await page.click('button:has-text("Navigate")')

    // Should open external navigation (new tab/window)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Navigate")')
    ])

    expect(popup.url()).toContain('google.com/maps') // or maps.apple.com on iOS
  })

  test('should display weather alert for job', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])

    await page.goto('/jobs/test-job-with-rain')

    // Weather alert should be visible
    await expect(page.locator('[data-testid="weather-alert"]')).toBeVisible()
    await expect(page.locator('text=Heavy rain expected')).toBeVisible()
  })

  test('should optimize multi-stop route', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 })

    await page.goto('/schedule')

    // Click optimize route button
    await page.click('button:has-text("Optimize Route")')

    // Should show optimized order
    await expect(page.locator('[data-testid="optimized-route"]')).toBeVisible()
    await expect(page.locator('text=Save')).toBeVisible() // e.g., "Save 12 mins"
  })
})
```

### Manual Testing Checklist

**File**: `Planning/SPRINT-8-MANUAL-TESTING.md`

```markdown
# Sprint 8: GPS Navigation - Manual Testing Checklist

## Test on Real Devices

### iOS Devices (Safari)
- [ ] iPhone 12/13/14 - Safari
- [ ] iPad Pro - Safari
- [ ] Location permission prompt works
- [ ] Opens Apple Maps correctly
- [ ] Weather alerts display correctly
- [ ] Touch targets >44x44 pixels

### Android Devices (Chrome)
- [ ] Samsung Galaxy S22 - Chrome
- [ ] Google Pixel 6 - Chrome
- [ ] Huawei P30 - Chrome
- [ ] Location permission prompt works
- [ ] Opens Google Maps correctly
- [ ] Offline behavior acceptable

### Network Conditions
- [ ] Test on 5G/4G (normal conditions)
- [ ] Test on 3G (slow network)
- [ ] Test with WiFi only
- [ ] Test with airplane mode (offline)
- [ ] Test with GPS disabled (location services off)

## Feature Testing

### Geocoding
- [ ] Geocode UK postcode (e.g., SW1A 2AA)
- [ ] Geocode full address
- [ ] Geocode rural address (Scottish Highlands)
- [ ] Geocode what3words address
- [ ] Handle invalid address gracefully
- [ ] Cache coordinates (no repeated API calls)

### Navigation
- [ ] Navigate from current location to job
- [ ] Navigate without location permission (fallback)
- [ ] Open Google Maps on Android
- [ ] Open Apple Maps on iOS
- [ ] Display in-app map view
- [ ] Show correct route on map

### Traffic
- [ ] Display traffic delay warnings
- [ ] Show traffic incidents (if available)
- [ ] Update ETA based on traffic

### Weather
- [ ] Display current weather for job location
- [ ] Show weather forecast for scheduled time
- [ ] Display rain/snow alerts
- [ ] Warn about unsafe conditions (high winds)

### Multi-Stop Optimization
- [ ] Optimize route for 5 jobs
- [ ] Display time/distance savings
- [ ] Allow manual reordering
- [ ] Handle jobs with no coordinates

## Accessibility Testing

### Screen Readers
- [ ] iOS VoiceOver - All navigation buttons announced
- [ ] Android TalkBack - Map controls accessible
- [ ] Route instructions read aloud

### Keyboard Navigation
- [ ] Tab through all navigation controls
- [ ] Enter key activates buttons
- [ ] Focus visible at all times

### Visual
- [ ] Contrast ratio >4.5:1 (check with axe DevTools)
- [ ] Text readable at 200% zoom
- [ ] Weather icons have text labels

## Error Handling

### API Failures
- [ ] Geocoding API down → show helpful error
- [ ] Routing API down → fallback to native maps
- [ ] Weather API down → hide weather section
- [ ] Traffic API down → show route without traffic

### User Errors
- [ ] Location permission denied → show instructions
- [ ] GPS unavailable → allow manual start location
- [ ] No internet → queue request for later
- [ ] Invalid property coordinates → allow correction

## Performance

### Load Times
- [ ] First navigation <3 seconds
- [ ] Map renders <2 seconds
- [ ] Weather loads <1 second
- [ ] Geocoding <2 seconds (first time)
- [ ] Geocoding <500ms (cached)

### Bundle Size
- [ ] Leaflet.js adds ~150KB (acceptable)
- [ ] Total bundle increase <200KB
- [ ] Lazy load maps (don't load until needed)

## Security

### Data Protection
- [ ] API keys not in client code
- [ ] Location data sent over HTTPS only
- [ ] User location not logged
- [ ] Tenant isolation verified

### Permissions
- [ ] Location permission explained clearly
- [ ] Permission can be revoked
- [ ] App works without location (degraded)

## Regression Testing

### Existing Features
- [ ] Job details page still works
- [ ] Job completion flow unaffected
- [ ] Photo upload still works
- [ ] Dashboard loads correctly
- [ ] All other features unaffected
```

---

## Story Breakdown

### Phase 1: Foundation & Database (Days 1-2) - 8 Points

#### **NAV-001: Database Schema Migration**
**Points**: 3
**Description**: Add location fields to Property table

**Tasks**:
- [x] Create Prisma migration file
- [x] Add latitude, longitude, what3words, plus_code, location_type, geocoded_at columns
- [x] Add database indexes for geospatial queries
- [x] Update Prisma schema
- [x] Generate Prisma client
- [x] Run migration on development database
- [x] Create rollback migration (just in case)

**Acceptance Criteria**:
- [x] All columns created with correct data types
- [x] Indexes created for performance
- [x] Prisma schema generates correct TypeScript types
- [x] No breaking changes to existing queries
- [x] Migration documented with comments

**Testing**:
- [x] Migration runs successfully
- [x] Can insert property with location data
- [x] Can query properties by location
- [x] Rollback migration works

---

#### **NAV-002: TypeScript Types & Interfaces**
**Points**: 2
**Description**: Create TypeScript types for navigation features

**Tasks**:
- [x] Create `PropertyLocation` interface
- [x] Create `GeoCoordinates` interface
- [x] Create `NavigationRoute` interface
- [x] Create `WeatherData` interface
- [x] Create `TrafficInfo` interface
- [x] Export types from shared package

**Acceptance Criteria**:
- [x] All interfaces typed with strict mode
- [x] Zero `any` types
- [x] JSDoc comments on all interfaces
- [x] Exported from `@rightfit/shared` package

---

#### **NAV-003: Environment Configuration**
**Points**: 3
**Description**: Set up API keys and environment variables

**Tasks**:
- [x] Add `WEATHER_API_KEY` to `.env`
- [x] Add `TOMTOM_API_KEY` to `.env` (optional)
- [x] Add `WHAT3WORDS_API_KEY` to `.env` (optional)
- [x] Document API key setup in README
- [x] Add `.env.example` with placeholders
- [x] Configure Vite to expose public env vars

**Acceptance Criteria**:
- [x] API keys stored securely (not in code)
- [x] Development and production configs separate
- [x] README has API key registration instructions
- [x] `.env.example` committed to repo

---

### Phase 2: API Development (Days 3-5) - 12 Points

#### **NAV-004: Geocoding Service & API**
**Points**: 5
**Description**: Implement address geocoding with caching

**Tasks**:
- [x] Create `NavigationService.ts` class
- [x] Implement `geocodeAddress()` method using Nominatim
- [x] Implement Plus Code generation
- [x] Add coordinate caching in Property table
- [x] Create `/api/geocoding/address` endpoint
- [x] Create `/api/geocoding/reverse` endpoint
- [x] Create `/api/geocoding/what3words` endpoint
- [x] Add multi-tenant security checks
- [x] Add error handling and fallbacks
- [x] Write unit tests (>80% coverage)

**Acceptance Criteria**:
- [x] Geocoding works for UK addresses
- [x] Coordinates cached in database
- [x] Plus Code generated automatically
- [x] Multi-tenant isolation verified
- [x] Error messages helpful (not technical)
- [x] Unit tests passing
- [x] API documented with JSDoc

**Testing**:
- [x] Test with valid UK address
- [x] Test with invalid address (error handling)
- [x] Test caching (second call uses DB, not API)
- [x] Test multi-tenant security (can't geocode other tenant's properties)

---

#### **NAV-005: Navigation/Routing Service & API**
**Points**: 4
**Description**: Implement route calculation using OSRM

**Tasks**:
- [x] Implement `getRoute()` method using OSRM
- [x] Implement `optimizeRoute()` for multi-stop
- [x] Create `/api/navigation/route` endpoint
- [x] Create `/api/navigation/optimize` endpoint
- [x] Create `/api/navigation/job/:id/route` endpoint
- [x] Parse OSRM response to standard format
- [x] Add error handling
- [x] Write unit tests

**Acceptance Criteria**:
- [x] Returns route with distance, duration, geometry
- [x] Turn-by-turn instructions included
- [x] Multi-stop optimization works (TSP solver)
- [x] Response format documented
- [x] Unit tests >80% coverage

---

#### **NAV-006: Weather Service & API**
**Points**: 3
**Description**: Integrate WeatherAPI.com for forecasts

**Tasks**:
- [x] Create `WeatherService.ts` class
- [x] Implement `getCurrentWeather()` method
- [x] Implement `getForecast()` method
- [x] Implement `getAlerts()` method
- [x] Create `/api/weather/current` endpoint
- [x] Create `/api/weather/forecast` endpoint
- [x] Create `/api/weather/job/:id` endpoint
- [x] Add 1-hour caching for weather data
- [x] Write unit tests

**Acceptance Criteria**:
- [x] Returns temperature, condition, precipitation, wind
- [x] Weather alerts included if available
- [x] Job-specific weather forecast works
- [x] Cached for 1 hour (don't exceed free tier)
- [x] Unit tests passing

---

### Phase 3: Frontend Components (Days 6-8) - 14 Points

#### **NAV-007: Geolocation Hook**
**Points**: 2
**Description**: React hook for browser geolocation API

**Tasks**:
- [x] Create `useGeolocation.ts` hook
- [x] Request location permission
- [x] Get current position
- [x] Handle permission denied
- [x] Handle errors gracefully
- [x] Cache location for 1 minute
- [x] Write tests

**Acceptance Criteria**:
- [x] Works on iOS Safari and Android Chrome
- [x] Clear error messages
- [x] Permission request explained to user
- [x] Fallback if denied

---

#### **NAV-008: NavigationButton Component**
**Points**: 3
**Description**: One-tap button to start navigation

**Tasks**:
- [x] Create `NavigationButton.tsx` component
- [x] Get user location via useGeolocation hook
- [x] Geocode property address if needed
- [x] Open Google Maps (Android) or Apple Maps (iOS)
- [x] Add loading states
- [x] Add error handling
- [x] Style with Tailwind
- [x] Make accessible (ARIA labels, keyboard nav)
- [x] Write component tests

**Acceptance Criteria**:
- [x] One tap opens native maps app
- [x] Works on iOS and Android
- [x] Loading spinner during geocoding
- [x] Error message if fails
- [x] Keyboard accessible
- [x] Screen reader compatible

**Integration**:
- [x] Add to JobDetails page
- [x] Add to JobCard component
- [x] Add to MySchedule page

---

#### **NAV-009: MapView Component**
**Points**: 5
**Description**: In-app map with route display

**Tasks**:
- [x] Install Leaflet.js
- [x] Create `MapView.tsx` component
- [x] Display OpenStreetMap tiles
- [x] Add origin and destination markers
- [x] Fetch route from API
- [x] Draw route polyline on map
- [x] Show distance and duration
- [x] Add traffic layer toggle (optional)
- [x] Make mobile responsive
- [x] Add loading states
- [x] Write component tests

**Acceptance Criteria**:
- [x] Map displays correctly on mobile
- [x] Route visible between markers
- [x] ETA and distance shown
- [x] Touch controls work (pan, zoom)
- [x] Loads in <2 seconds
- [x] Accessible (keyboard controls)

---

#### **NAV-010: WeatherAlert Component**
**Points**: 4
**Description**: Weather warnings for jobs

**Tasks**:
- [x] Create `WeatherAlert.tsx` component
- [x] Fetch weather from API
- [x] Display current conditions
- [x] Show precipitation and wind
- [x] Highlight severe weather alerts
- [x] Provide recommendations (e.g., "Allow +10 mins for rain")
- [x] Style with Tailwind
- [x] Make accessible
- [x] Write tests

**Acceptance Criteria**:
- [x] Weather icons appropriate for conditions
- [x] Alerts color-coded by severity
- [x] Recommendations helpful
- [x] Updates based on job time
- [x] Accessible to screen readers

**Integration**:
- [x] Add to JobDetails page
- [x] Add to MySchedule page

---

### Phase 4: Integration & Polish (Days 9-10) - 8 Points

#### **NAV-011: JobDetails Page Integration**
**Points**: 3
**Description**: Add navigation and weather to job details

**Tasks**:
- [x] Add NavigationButton below address
- [x] Add WeatherAlert section
- [x] Add "View on Map" button (opens MapView modal)
- [x] Update layout for new sections
- [x] Test on mobile devices
- [x] Ensure accessibility

**Acceptance Criteria**:
- [x] Navigation button prominent and easy to tap
- [x] Weather alert visible if conditions warrant
- [x] Map view opens in modal/full screen
- [x] All features work on mobile
- [x] No layout breaking

---

#### **NAV-012: Schedule Optimization**
**Points**: 3
**Description**: Multi-stop route optimization on schedule page

**Tasks**:
- [x] Add "Optimize Route" button to MySchedule page
- [x] Fetch all job coordinates
- [x] Call optimize API
- [x] Display optimized order
- [x] Show time/distance savings
- [x] Allow manual reordering
- [x] Test with 5+ jobs

**Acceptance Criteria**:
- [x] Optimization runs in <5 seconds
- [x] Shows before/after comparison
- [x] Savings calculated correctly
- [x] Worker can accept or reject

---

#### **NAV-013: Error Handling & Edge Cases**
**Points**: 2
**Description**: Handle all failure scenarios gracefully

**Tasks**:
- [x] Handle location permission denied
- [x] Handle no internet connection
- [x] Handle API failures
- [x] Handle invalid coordinates
- [x] Handle missing property data
- [x] Add offline fallback (open native maps anyway)
- [x] Add helpful error messages

**Acceptance Criteria**:
- [x] No crashes on any error
- [x] Error messages user-friendly
- [x] Fallbacks work (native maps)
- [x] User knows what to do next

---

## Implementation Timeline

### Week 1 (Days 1-5)

**Day 1: Database & Setup**
- NAV-001: Database migration ✅
- NAV-002: TypeScript types ✅
- NAV-003: Environment config ✅

**Day 2-3: API Development**
- NAV-004: Geocoding service & API ✅

**Day 4-5: API Development (cont.)**
- NAV-005: Navigation/routing API ✅
- NAV-006: Weather API ✅

### Week 2 (Days 6-10)

**Day 6-7: Frontend Components**
- NAV-007: Geolocation hook ✅
- NAV-008: NavigationButton ✅

**Day 8-9: Frontend Components (cont.)**
- NAV-009: MapView component ✅
- NAV-010: WeatherAlert component ✅

**Day 10: Integration & Testing**
- NAV-011: JobDetails integration ✅
- NAV-012: Schedule optimization ✅
- NAV-013: Error handling ✅

### Contingency: Days 11-14 (if needed)

**Day 11-12: Testing**
- Manual testing on real devices
- Accessibility audit
- Performance optimization
- Bug fixes

**Day 13: Documentation**
- API documentation (OpenAPI)
- User guide for workers
- Developer documentation
- Update README

**Day 14: Sprint Retrospective**
- Review quality gates
- Identify improvements
- Plan next sprint

---

## Risk Management

### High Priority Risks

#### Risk 1: API Rate Limits Exceeded
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Cache geocoded coordinates in database (reduces 99% of geocoding calls)
- Cache weather data for 1 hour
- Monitor API usage with logging
- Self-host OSRM if free tier insufficient
- Have Mapbox API key as fallback (100K free/month)

---

#### Risk 2: Location Permission Denied
**Probability**: Medium (10-20% of users)
**Impact**: High (can't navigate)
**Mitigation**:
- Clear explanation when requesting permission
- Fallback: Allow manual entry of starting address
- Still allow opening native maps (destination only)
- Educate workers during onboarding
- Provide troubleshooting guide

---

#### Risk 3: Geocoding Inaccurate
**Probability**: Low (UK addresses well-covered)
**Impact**: Medium
**Mitigation**:
- Allow manual correction of coordinates
- Display map for verification
- Use multiple geocoding services (Nominatim → Mapbox)
- Let workers report incorrect locations
- what3words as alternative for rural properties

---

#### Risk 4: Poor Mobile Performance
**Probability**: Low
**Impact**: High
**Mitigation**:
- Lazy load maps (don't load until needed)
- Optimize bundle size (code splitting)
- Test on slow 3G network
- Use lightweight Leaflet.js (vs. heavy Mapbox GL JS)
- Compress map tiles

---

### Medium Priority Risks

#### Risk 5: Internet Connectivity Issues
**Probability**: Medium (rural areas)
**Impact**: Medium
**Mitigation**:
- Graceful degradation (still open native maps)
- Cache recently used routes
- Offline map caching (future enhancement)
- Clear error messages

---

#### Risk 6: API Service Downtime
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Fallback to native maps (always works)
- Multiple API providers (Nominatim → Mapbox)
- Error handling with retry logic
- Monitor API uptime

---

## Success Metrics

### Adoption Metrics
**Target**: 80% of workers use navigation weekly

- % of workers using navigation feature
- Average navigations per worker per day
- Navigation open rate per job (clicks vs. views)

**Measurement**:
- Track `NavigationButton` clicks
- Track `/api/navigation/route` API calls
- Survey workers after 2 weeks

---

### Efficiency Metrics
**Target**: 15 mins saved per worker per day

- Average time saved with route optimization
- Fuel cost savings estimate
- Jobs completed per day (increase)
- On-time arrival rate

**Measurement**:
- Compare optimized vs. scheduled route times
- Track job completion timestamps
- Calculate distance reduction

---

### Quality Metrics
**Target**: 95% on-time arrivals

- Worker satisfaction score
- Customer complaints re: late arrivals (decrease)
- Feature rating (1-5 stars)

**Measurement**:
- In-app survey: "How helpful is navigation?"
- Customer feedback: "Was worker on time?"
- Support tickets re: location issues

---

### Technical Metrics

**Performance**:
- Time to first navigation: <3 seconds ✅
- Map load time: <2 seconds ✅
- API response time: <500ms (p95) ✅
- Bundle size increase: <200KB ✅

**Reliability**:
- Navigation success rate: >95%
- Geocoding accuracy: >98% (UK addresses)
- API uptime: >99%

**Cost**:
- Monthly API costs: $0 (free tier)
- Cost per navigation: $0
- Scaling cost (500 jobs/day): <$10/month

---

## Sprint Completion Checklist

### Quality Gates ✅

- [ ] **Code Quality**
  - [ ] TypeScript strict mode (zero `any`)
  - [ ] ESLint passing
  - [ ] Prettier formatted
  - [ ] No console errors/warnings
  - [ ] Code reviewed

- [ ] **Testing**
  - [ ] Unit tests >80% coverage
  - [ ] Integration tests passing
  - [ ] E2E test for navigation flow
  - [ ] Manual testing on 5+ devices
  - [ ] Tested on slow network
  - [ ] Tested with permissions denied

- [ ] **Accessibility**
  - [ ] WCAG 2.1 AA compliant
  - [ ] Keyboard navigation works
  - [ ] Screen reader tested
  - [ ] Color contrast >4.5:1
  - [ ] Touch targets >44px

- [ ] **Performance**
  - [ ] First navigation <3s
  - [ ] Maps load <2s
  - [ ] Bundle increase <200KB
  - [ ] Works offline (degraded)

- [ ] **Security**
  - [ ] API keys in env vars
  - [ ] HTTPS only
  - [ ] Multi-tenant isolation verified
  - [ ] No location data logging

- [ ] **Documentation**
  - [ ] API endpoints documented (OpenAPI)
  - [ ] Components documented (JSDoc)
  - [ ] README updated
  - [ ] User guide created
  - [ ] ADR written

---

### Sprint Deliverables ✅

- [ ] Database migration deployed
- [ ] API endpoints live
- [ ] Frontend components integrated
- [ ] Worker app updated
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Demo video recorded
- [ ] Stakeholder signoff

---

## Next Steps After Sprint 8

### Sprint 9: Advanced Navigation Features (Optional)
**Duration**: 5 days
**Points**: 21 points

**Features**:
- Offline map caching
- Voice navigation
- Real-time location tracking (supervisor view)
- Automatic arrival/departure logging
- Fuel cost calculator
- Carbon footprint tracking

---

### Sprint 10: Mobile App (Native)
**Duration**: 8 days
**Points**: 32 points

**Features**:
- React Native implementation
- Background location tracking
- Push notifications for traffic alerts
- Offline-first architecture
- Native map integration

---

## Appendix

### API Rate Limit Calculations

**Assumptions**:
- 20 workers
- 10 jobs/worker/day = 200 jobs/day
- 6,000 jobs/month

**API Calls**:
- **Geocoding**: 500/month (new addresses only, rest cached)
- **Routing**: 6,000/month (one per navigation)
- **Weather**: 6,000/month (one per job)
- **Traffic**: 6,000/month (optional)

**Free Tier Limits**:
- Nominatim: ~2,600/month (1/sec × 60s × 60min × 12hr) ✅
- OSRM: 150,000/month (5,000/day) ✅
- WeatherAPI: 1,000,000/month ✅
- TomTom Traffic: 75,000/month (2,500/day) ✅

**Verdict**: All free tier limits exceeded ✅

---

### Dependencies

**Backend**:
```json
{
  "axios": "^1.6.0",
  "open-location-code": "^1.0.3"
}
```

**Frontend**:
```json
{
  "leaflet": "^1.9.4",
  "@types/leaflet": "^1.9.8",
  "react-leaflet": "^4.2.1"
}
```

**DevDependencies**:
```json
{
  "@playwright/test": "^1.40.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.3"
}
```

---

### API Keys Registration

**WeatherAPI.com**:
1. Go to https://www.weatherapi.com/signup.aspx
2. Sign up (free, no credit card)
3. Get API key from dashboard
4. Add to `.env`: `WEATHER_API_KEY=your_key_here`

**TomTom Traffic** (Optional):
1. Go to https://developer.tomtom.com/
2. Sign up (free trial)
3. Create API key with Traffic API enabled
4. Add to `.env`: `TOMTOM_API_KEY=your_key_here`

**what3words** (Optional):
1. Go to https://developer.what3words.com/
2. Sign up (25K free/month)
3. Get API key
4. Add to `.env`: `WHAT3WORDS_API_KEY=your_key_here`

---

**Sprint Created**: November 9, 2025
**Sprint Owner**: Development Team
**Philosophy**: RightFit, not QuickFix - Build it right with zero monthly cost
**Next Review**: Daily standups, weekly sprint review

**Ready to start? Let's build best-in-class navigation! 🚀🗺️**
