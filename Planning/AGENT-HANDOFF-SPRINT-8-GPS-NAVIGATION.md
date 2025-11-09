# Agent Handoff: Sprint 8 - GPS Navigation & Location Services

**Date**: November 9, 2025
**Sprint**: Sprint 8 - GPS Navigation & Location Services
**Status**: Ready to start implementation
**Estimated Duration**: 12-16 days (flexible based on quality gates)
**Story Points**: 56 points
**Philosophy**: RightFit, not QuickFix

---

## 📋 Quick Summary

You are implementing a complete GPS navigation system for the RightFit Services Worker Web App. This includes:

1. **My Locations Page** - Workers can see all their job properties in one place
2. **Navigation Page** - Full-screen navigation with map, weather, and traffic
3. **Dashboard Widgets** - Weather and traffic at-a-glance on dashboard
4. **Database Schema** - Add location fields (lat/lon, what3words, plus_code)
5. **API Layer** - Geocoding, routing, weather, and traffic endpoints
6. **Frontend Components** - Maps, navigation, weather, traffic components

**Monthly Cost**: $0 (all free API tiers)

---

## 🎯 What You're Building

### User Story
As a **worker**, I want to:
- See all my job locations in one place
- Navigate to properties with traffic and weather info
- Check weather and traffic conditions before leaving
- Get turn-by-turn directions to job sites
- Handle remote properties using what3words

So that I can:
- Save 20-35 minutes per day
- Arrive on time (95% target)
- Plan better with weather/traffic awareness
- Reduce fuel costs by 10-15%

### Navigation Flow
```
Dashboard
├─ Weather Widget (current conditions)
├─ Traffic Widget (local traffic)
└─ "My Locations" link
    ↓
My Locations Page (/locations)
├─ List of all unique properties
├─ Distance from current location
├─ Search & filter
└─ "Navigate Here" button on each property
    ↓
Navigation Page (/navigate/:propertyId)
├─ Interactive map with route
├─ Weather at destination
├─ Traffic along route
├─ Turn-by-turn directions
└─ "Start Navigation" button
    ↓
Opens Google Maps (Android) or Apple Maps (iOS)
```

---

## 📚 Required Reading (CRITICAL - READ FIRST)

Before starting, **you MUST read these documents in order**:

1. **[CLAUDE-RULES.md](../CLAUDE-RULES.md)** - Development philosophy and rules
2. **[Planning/PHILOSOPHY.md](PHILOSOPHY.md)** - RightFit quality standards
3. **[Planning/SPRINT-8-GPS-NAVIGATION-ENHANCED.md](SPRINT-8-GPS-NAVIGATION-ENHANCED.md)** - Full sprint plan
4. **[Planning/GPS-NAVIGATION-FEASIBILITY-REPORT.md](GPS-NAVIGATION-FEASIBILITY-REPORT.md)** - API research
5. **[Planning/REMOTE-LOCATION-SOLUTIONS-ADDENDUM.md](REMOTE-LOCATION-SOLUTIONS-ADDENDUM.md)** - what3words integration

**Key Principles**:
- ✅ **Quality over speed** - No compromises, no technical debt
- ✅ **Production-ready from day one** - No "MVP" shortcuts
- ✅ **Test everything** - >80% coverage required (aim for >90%)
- ✅ **Accessibility first** - WCAG 2.1 AA compliant
- ✅ **Mobile responsive** - Tested on real devices
- ✅ **Zero `any` types** - TypeScript strict mode
- ✅ **No TODOs in production** - Fix it now, not later

---

## 🏗️ Project Context

### Current State
- **Project**: RightFit Services - Multi-tenant SaaS for cleaning and maintenance companies
- **Phase**: Phase 4A - Cleaning Portal Completion & Worker App Enhancement
- **Tech Stack**:
  - Backend: Node.js, Express, Prisma, PostgreSQL
  - Frontend: React 18.2, TypeScript, Vite, Tailwind CSS
  - Mobile: Progressive Web App (PWA) architecture
- **Recent Completion**: Sprint 1 (Component Library Refactor) and Sprint 2 (Worker App Completion)
- **Current Sprint**: Sprint 8 (GPS Navigation)

### Architecture
- **Multi-tenant**: All data filtered by `tenant_id` or `service_provider_id`
- **Monorepo**: pnpm workspaces with 8 apps (5 web, 2 mobile, 1 guest tablet)
- **Shared Packages**: `@rightfit/database`, `@rightfit/ui-core`, `@rightfit/ui-cleaning`, `@rightfit/ui-maintenance`
- **Authentication**: JWT with refresh tokens
- **Database**: PostgreSQL with Prisma ORM

### File Structure
```
apps/
├── api/                          # Backend API (Express)
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   └── middleware/          # Auth, validation
│   └── package.json
├── web-worker/                   # Worker web app (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
packages/
├── database/                     # Prisma schema & client
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── shared/                       # Shared TypeScript types
    └── src/
        └── types/
```

---

## 📦 Implementation Order (Critical Path)

### Phase 1: Database & Foundation (Days 1-2) - 8 points
Start here. **Do not skip ahead**.

**NAV-001: Database Schema Migration (3 pts)**
- Add location fields to Property table
- Create migration file
- Update Prisma schema
- Generate Prisma client
- Test migration

**NAV-002: TypeScript Types (2 pts)**
- Create navigation types
- Create location types
- Create weather/traffic types
- Export from shared package

**NAV-003: Environment Configuration (3 pts)**
- Register for free API keys
- Add to .env
- Document in README
- Create .env.example

---

### Phase 2: API Development (Days 3-5) - 12 points
Backend services and endpoints.

**NAV-004: Geocoding Service & API (5 pts)**
- Create NavigationService class
- Implement Nominatim geocoding
- Implement Plus Code generation
- Create geocoding endpoints
- Add caching logic
- Write unit tests (>80% coverage)

**NAV-005: Navigation/Routing Service & API (4 pts)**
- Implement OSRM routing
- Implement route optimization
- Create navigation endpoints
- Parse OSRM responses
- Write unit tests

**NAV-006: Weather Service & API (3 pts)**
- Create WeatherService class
- Integrate WeatherAPI.com
- Create weather endpoints
- Add caching (1 hour)
- Write unit tests

---

### Phase 3: Core Components (Days 6-8) - 14 points
Reusable React components.

**NAV-007: Geolocation Hook (2 pts)**
- Create useGeolocation hook
- Request browser permission
- Handle errors gracefully
- Cache location (1 min)
- Write tests

**NAV-008: NavigationButton Component (3 pts)**
- Create NavigationButton
- Integrate geolocation
- Open native maps (iOS/Android)
- Add loading states
- Make accessible
- Write tests

**NAV-009: MapView Component (5 pts)**
- Install Leaflet.js
- Create MapView component
- Display route on map
- Add markers (origin/destination)
- Show distance/ETA
- Make mobile responsive
- Write tests

**NAV-010: WeatherAlert Component (4 pts)**
- Create WeatherAlert component
- Display weather data
- Show alerts if severe
- Provide recommendations
- Style with Tailwind
- Make accessible
- Write tests

---

### Phase 4: New Pages & Widgets (Days 9-12) - 14 points
Main feature pages.

**NAV-014: My Locations Page (5 pts)**
- Create MyLocations page
- Create LocationCard component
- Create /api/workers/my-locations endpoint
- Fetch unique properties
- Calculate distances
- Add search functionality
- Sort by distance
- Write tests

**NAV-015: Dedicated Navigation Page (5 pts)**
- Create NavigationPage
- Integrate all components (Map, Weather, Traffic)
- Add route details
- Add "Start Navigation" button
- Handle loading/errors
- Write tests

**NAV-016: Dashboard Weather Widget (2 pts)**
- Create WeatherWidget
- Add to WorkerDashboard
- Style with gradient
- Cache data (1 hour)
- Write tests

**NAV-017: Dashboard Traffic Widget (2 pts)**
- Create TrafficWidget
- Add to WorkerDashboard
- Style with gradient
- Show incidents
- Write tests

---

### Phase 5: Integration & Polish (Days 13-14) - 8 points
Tie everything together.

**NAV-018: App Routing & Navigation (3 pts)**
- Add /locations route
- Add /navigate/:propertyId route
- Update App.tsx routing
- Add "My Locations" link to dashboard
- Test all navigation flows

**NAV-019: JobDetails Integration (2 pts)**
- Add NavigationButton to JobDetails
- Link to NavigationPage
- Test flow

**NAV-020: Error Handling & Polish (3 pts)**
- Handle all error scenarios
- Add empty states
- Add loading states
- Smooth transitions
- Final UX polish

---

## 🔑 Critical Implementation Details

### 1. Database Migration

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

-- Create index for geospatial queries
CREATE INDEX idx_property_location ON "Property" (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index for location type filtering
CREATE INDEX idx_property_location_type ON "Property" (location_type);
```

**Run migration**:
```bash
cd packages/database
npx prisma migrate dev --name add_property_location_fields
npx prisma generate
```

**Update Prisma schema** at `packages/database/prisma/schema.prisma`:
```prisma
model Property {
  // ... existing fields ...

  // Location fields (NEW)
  latitude               Decimal?  @db.Decimal(10, 8)
  longitude              Decimal?  @db.Decimal(11, 8)
  what3words             String?   @db.VarChar(50)
  plus_code              String?   @db.VarChar(20)
  location_type          String    @default("ADDRESS") @db.VarChar(20)
  geocoded_at            DateTime?

  // ... rest of model ...

  @@index([latitude, longitude])
  @@index([location_type])
}
```

---

### 2. Free API Keys Registration

**WeatherAPI.com** (FREE - 1M calls/month):
1. Go to https://www.weatherapi.com/signup.aspx
2. Sign up (no credit card required)
3. Get API key from dashboard
4. Add to `.env`: `WEATHER_API_KEY=your_key_here`

**TomTom Traffic** (OPTIONAL - FREE 2,500/day):
1. Go to https://developer.tomtom.com/
2. Sign up (free trial)
3. Create API key with Traffic API enabled
4. Add to `.env`: `TOMTOM_API_KEY=your_key_here`

**what3words** (OPTIONAL - FREE 25K/month):
1. Go to https://developer.what3words.com/
2. Sign up (no credit card)
3. Get API key
4. Add to `.env`: `WHAT3WORDS_API_KEY=your_key_here`

**OSRM** (FREE - unlimited):
- No API key needed for public server
- Uses: http://router.project-osrm.org/
- Can self-host if needed

**Nominatim** (FREE - unlimited):
- No API key needed
- Uses: https://nominatim.openstreetmap.org/
- Must include User-Agent header: 'RightFit-Services/1.0'

---

### 3. Multi-Tenant Security (CRITICAL)

**Every API endpoint must validate tenant access**:

```typescript
// Example: Geocoding endpoint
router.post('/address', authenticateToken, async (req, res) => {
  const { property_id, address } = req.body
  const serviceProviderId = req.user.service_provider_id // From JWT

  // CRITICAL: Verify property belongs to this service provider
  const property = await prisma.property.findFirst({
    where: {
      id: property_id,
      tenant_id: serviceProviderId // MUST filter by tenant
    }
  })

  if (!property) {
    return res.status(404).json({ error: 'Property not found' })
  }

  // Now safe to geocode...
})
```

**Never trust client-provided IDs without validation**.

---

### 4. Geocoding with Caching

**Always check cache first to avoid repeated API calls**:

```typescript
async geocodeAddress(propertyId: string, address: string, serviceProviderId: string) {
  // 1. Check if coordinates already exist
  const property = await prisma.property.findFirst({
    where: { id: propertyId, tenant_id: serviceProviderId },
    select: { latitude: true, longitude: true, geocoded_at: true }
  })

  // 2. If geocoded within last 30 days, return cached
  if (property?.latitude && property?.longitude && property?.geocoded_at) {
    const daysSinceGeocoded = (Date.now() - property.geocoded_at.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceGeocoded < 30) {
      return { lat: Number(property.latitude), lon: Number(property.longitude) }
    }
  }

  // 3. Geocode using Nominatim
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: address, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'RightFit-Services/1.0' }
  })

  if (response.data.length === 0) {
    throw new Error('Address not found')
  }

  const { lat, lon } = response.data[0]

  // 4. Update database with coordinates
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      latitude: Number(lat),
      longitude: Number(lon),
      geocoded_at: new Date()
    }
  })

  return { lat: Number(lat), lon: Number(lon) }
}
```

---

### 5. React Component Best Practices

**All components must**:
- ✅ Be TypeScript strict mode compliant (zero `any`)
- ✅ Have proper JSDoc comments
- ✅ Handle loading states
- ✅ Handle error states
- ✅ Be accessible (ARIA labels, keyboard nav)
- ✅ Be mobile responsive
- ✅ Have unit tests

**Example structure**:
```typescript
import React, { useState, useEffect } from 'react'
import { Navigation, Loader, AlertCircle } from 'lucide-react'

interface NavigationButtonProps {
  propertyId: string
  propertyName: string
  address: string
  latitude?: number
  longitude?: number
  className?: string
}

/**
 * NavigationButton - Opens native maps app for turn-by-turn navigation
 *
 * @param propertyId - Property UUID
 * @param propertyName - Display name for property
 * @param address - Full address string
 * @param latitude - Optional cached latitude
 * @param longitude - Optional cached longitude
 * @param className - Additional Tailwind classes
 */
export function NavigationButton({
  propertyId,
  propertyName,
  address,
  latitude,
  longitude,
  className = ''
}: NavigationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNavigate = async () => {
    // Implementation...
  }

  // Loading state
  if (loading) {
    return (
      <button disabled className={`... ${className}`}>
        <Loader className="w-5 h-5 animate-spin" />
        <span>Getting directions...</span>
      </button>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-600 text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )
  }

  // Normal state
  return (
    <button
      onClick={handleNavigate}
      className={`... ${className}`}
      aria-label={`Navigate to ${propertyName}`}
    >
      <Navigation className="w-5 h-5" />
      <span>Navigate</span>
    </button>
  )
}
```

---

### 6. Browser Geolocation API

**Request permission with clear explanation**:

```typescript
export function useGeolocation(requestOnMount: boolean = false) {
  const [state, setState] = useState<{
    location: { latitude: number; longitude: number; accuracy: number } | null
    error: string | null
    loading: boolean
  }>({
    location: null,
    error: null,
    loading: false
  })

  const requestPermission = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported by your browser' }))
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
            errorMessage = 'Location information unavailable. Please check your device settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
        }

        setState({ location: null, error: errorMessage, loading: false })
      },
      {
        enableHighAccuracy: true,  // Use GPS
        timeout: 10000,            // 10 second timeout
        maximumAge: 60000          // Cache for 1 minute
      }
    )
  }

  useEffect(() => {
    if (requestOnMount) {
      requestPermission()
    }
  }, [requestOnMount])

  return { ...state, requestPermission }
}
```

---

### 7. Opening Native Maps Apps

**Different URL schemes for iOS vs Android**:

```typescript
const handleStartNavigation = () => {
  if (!property || !userLocation) return

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  let mapsUrl: string

  if (isIOS) {
    // Apple Maps (iOS)
    mapsUrl = `maps://maps.apple.com/?daddr=${property.latitude},${property.longitude}&saddr=${userLocation.latitude},${userLocation.longitude}`
  } else {
    // Google Maps (Android, Desktop)
    mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${property.latitude},${property.longitude}&travelmode=driving`
  }

  // Open in new tab/window
  window.open(mapsUrl, '_blank')
}
```

---

### 8. Leaflet.js Map Integration

**Install dependencies**:
```bash
cd apps/web-worker
pnpm add leaflet react-leaflet
pnpm add -D @types/leaflet
```

**Import CSS in component**:
```typescript
import 'leaflet/dist/leaflet.css'
```

**Basic map setup**:
```typescript
import L from 'leaflet'
import { useEffect, useRef } from 'react'

export function MapView({ origin, destination }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([origin.lat, origin.lon], 13)
    mapInstanceRef.current = map

    // Add OpenStreetMap tiles (FREE)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Add markers
    L.marker([origin.lat, origin.lon]).addTo(map).bindPopup('Your Location')
    L.marker([destination.lat, destination.lon]).addTo(map).bindPopup('Job Location')

    // Fetch and draw route
    fetchRoute(map, origin, destination)

    return () => {
      map.remove()
    }
  }, [origin, destination])

  return <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
}
```

---

## ✅ Quality Gates (Must Pass Before Sprint Completion)

### Code Quality
- [x] TypeScript strict mode enabled
- [x] Zero `any` types
- [x] ESLint passing (no warnings)
- [x] Prettier formatted
- [x] No console.log/warn/error in production code
- [x] No TODO/FIXME comments
- [x] All imports organized

### Testing
- [x] Unit tests >80% coverage (aim for >90%)
- [x] Integration tests for all API endpoints
- [x] E2E test for complete navigation flow
- [x] Manual testing on 5+ real mobile devices:
  - iPhone (Safari)
  - iPad (Safari)
  - Android phone (Chrome)
  - Android tablet (Chrome)
  - Desktop (Chrome, Firefox, Safari)
- [x] Tested on slow 3G network
- [x] Tested with location permission denied
- [x] Tested offline (graceful degradation)

### Accessibility
- [x] WCAG 2.1 AA compliant (AAA preferred)
- [x] All interactive elements keyboard accessible
- [x] Screen reader tested (iOS VoiceOver + Android TalkBack)
- [x] Color contrast >4.5:1 (check with axe DevTools)
- [x] Touch targets >44x44 pixels
- [x] Text readable at 200% zoom
- [x] Focus indicators visible
- [x] ARIA labels on all buttons/links

### Performance
- [x] First navigation <3 seconds
- [x] Map loads <2 seconds
- [x] Dashboard widgets load <1 second
- [x] Geocoding <2 seconds (first time)
- [x] Geocoding <500ms (cached)
- [x] Bundle size increase <200KB
- [x] No layout shifts (CLS <0.1)
- [x] Lazy load maps (don't load until needed)

### Security
- [x] API keys in environment variables (never in code)
- [x] HTTPS only for all API calls
- [x] Multi-tenant isolation verified (no cross-tenant data leaks)
- [x] Location data not logged
- [x] SQL injection prevented (use Prisma parameterized queries)
- [x] XSS prevented (React auto-escapes)
- [x] CSRF tokens on state-changing endpoints

### User Experience
- [x] Works on iOS Safari
- [x] Works on Android Chrome
- [x] Works on Firefox Mobile
- [x] Clear permission request with explanation
- [x] Helpful error messages (not technical jargon)
- [x] Loading states for all async operations
- [x] Empty states with guidance
- [x] Offline fallback (open native maps)
- [x] Smooth page transitions
- [x] No flashing/jarring UI changes

### Documentation
- [x] API endpoints documented (JSDoc comments)
- [x] Component props documented (JSDoc)
- [x] README updated with:
  - New dependencies (Leaflet, open-location-code)
  - API key setup instructions
  - Environment variables
- [x] Architecture Decision Record (ADR) for API choices
- [x] User guide for workers (how to use navigation)

---

## 🧪 Testing Requirements

### Unit Tests (Jest)

**Example**: Testing NavigationService

```typescript
// apps/api/src/services/__tests__/NavigationService.test.ts
import { NavigationService } from '../NavigationService'
import { prismaMock } from '../../test/prismaMock'

describe('NavigationService', () => {
  let service: NavigationService

  beforeEach(() => {
    service = new NavigationService()
  })

  describe('geocodeAddress', () => {
    it('should return cached coordinates if available', async () => {
      const mockProperty = {
        id: 'prop-123',
        latitude: 51.5074,
        longitude: -0.1278,
        geocoded_at: new Date()
      }

      prismaMock.property.findFirst.mockResolvedValue(mockProperty)

      const result = await service.geocodeAddress('prop-123', 'test address', 'sp-123')

      expect(result.lat).toBe(51.5074)
      expect(result.lon).toBe(-0.1278)
      // Should NOT call external API (check no HTTP requests)
    })

    it('should geocode new address using Nominatim', async () => {
      // Mock property with no coordinates
      prismaMock.property.findFirst.mockResolvedValue({
        id: 'prop-123',
        latitude: null,
        longitude: null
      })

      // Test implementation...
    })

    it('should throw error for invalid address', async () => {
      await expect(
        service.geocodeAddress('prop-123', 'INVALID_ADDRESS_12345', 'sp-123')
      ).rejects.toThrow('Address not found')
    })
  })
})
```

**Run tests**:
```bash
cd apps/api
pnpm test
pnpm test:coverage  # Check coverage >80%
```

---

### Integration Tests (Supertest)

```typescript
// apps/api/src/routes/__tests__/navigation.integration.test.ts
import request from 'supertest'
import app from '../../index'

describe('Navigation API', () => {
  let authToken: string

  beforeAll(async () => {
    // Login as worker
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'worker@test.com', password: 'password' })
    authToken = response.body.token
  })

  describe('POST /api/geocoding/address', () => {
    it('should geocode address with valid authentication', async () => {
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
      expect(response.body.latitude).toBeCloseTo(51.5034, 2)
    })

    it('should reject without authentication', async () => {
      await request(app)
        .post('/api/geocoding/address')
        .send({ property_id: 'id', address: 'test' })
        .expect(401)
    })

    it('should reject cross-tenant access', async () => {
      // Login as different tenant
      const otherResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'other-worker@test.com', password: 'password' })

      // Try to geocode property from first tenant
      await request(app)
        .post('/api/geocoding/address')
        .set('Authorization', `Bearer ${otherResponse.body.token}`)
        .send({
          property_id: 'test-property-id', // Belongs to other tenant
          address: 'test'
        })
        .expect(404) // Should not find property
    })
  })
})
```

---

### E2E Tests (Playwright)

```typescript
// apps/web-worker/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Worker Navigation Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant location permission
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 })

    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'worker@test.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should navigate to My Locations from dashboard', async ({ page }) => {
    // Click "My Locations" link
    await page.click('text=My Locations')
    await expect(page).toHaveURL('/locations')

    // Should see locations list
    await expect(page.locator('h1')).toContainText('My Locations')

    // Should see at least one location card
    await expect(page.locator('[data-testid="location-card"]').first()).toBeVisible()
  })

  test('should search locations', async ({ page }) => {
    await page.goto('/locations')

    // Type in search
    await page.fill('input[placeholder="Search locations..."]', 'Luxury')

    // Should filter results
    await expect(page.locator('[data-testid="location-card"]')).toHaveCount(1)
    await expect(page.locator('text=Luxury Apartment')).toBeVisible()
  })

  test('should open navigation page from location card', async ({ page }) => {
    await page.goto('/locations')

    // Click "Navigate Here" on first location
    await page.click('[data-testid="location-card"] button:has-text("Navigate Here")')

    // Should navigate to navigation page
    await expect(page).toHaveURL(/\/navigate\/[a-f0-9-]+/)

    // Should see map
    await expect(page.locator('[data-testid="map-view"]')).toBeVisible()

    // Should see weather section
    await expect(page.locator('text=Weather')).toBeVisible()

    // Should see "Start Navigation" button
    await expect(page.locator('button:has-text("Start Navigation")')).toBeVisible()
  })

  test('should display weather and traffic widgets on dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // Weather widget visible
    await expect(page.locator('[data-testid="weather-widget"]')).toBeVisible()
    await expect(page.locator('text=/\\d+°C/')).toBeVisible() // Temperature

    // Traffic widget visible
    await expect(page.locator('[data-testid="traffic-widget"]')).toBeVisible()
    await expect(page.locator('text=/Clear|Light|Moderate|Heavy/')).toBeVisible()
  })
})
```

**Run E2E tests**:
```bash
cd apps/web-worker
pnpm exec playwright test
pnpm exec playwright test --headed  # Watch tests run
pnpm exec playwright test --debug   # Debug mode
```

---

## 🚨 Common Pitfalls to Avoid

### 1. ❌ Forgetting Multi-Tenant Filtering
```typescript
// WRONG - No tenant filtering
const property = await prisma.property.findUnique({
  where: { id: propertyId }
})

// RIGHT - Always filter by tenant
const property = await prisma.property.findFirst({
  where: {
    id: propertyId,
    tenant_id: serviceProviderId  // From JWT
  }
})
```

### 2. ❌ Not Caching Geocoding Results
```typescript
// WRONG - Geocodes every time (wastes API calls)
const coords = await geocodeAddress(address)

// RIGHT - Check cache first
const property = await prisma.property.findFirst({
  where: { id: propertyId },
  select: { latitude: true, longitude: true, geocoded_at: true }
})
if (property?.latitude && property?.longitude) {
  return { lat: property.latitude, lon: property.longitude }
}
// Only geocode if not cached
```

### 3. ❌ Blocking UI During Geocoding
```typescript
// WRONG - No loading state
const handleNavigate = async () => {
  const coords = await geocodeAddress()
  openMaps(coords)
}

// RIGHT - Show loading state
const handleNavigate = async () => {
  setLoading(true)
  try {
    const coords = await geocodeAddress()
    openMaps(coords)
  } finally {
    setLoading(false)
  }
}
```

### 4. ❌ Using `any` Type
```typescript
// WRONG
const weather: any = await fetchWeather()

// RIGHT
interface WeatherData {
  temperature: number
  condition: string
  precipitation: number
}
const weather: WeatherData = await fetchWeather()
```

### 5. ❌ Not Handling Permission Denial
```typescript
// WRONG - Crashes if permission denied
navigator.geolocation.getCurrentPosition((pos) => {
  setLocation(pos.coords)
})

// RIGHT - Handle all error cases
navigator.geolocation.getCurrentPosition(
  (pos) => setLocation(pos.coords),
  (error) => {
    if (error.code === error.PERMISSION_DENIED) {
      setError('Please enable location access in your browser settings')
    }
  }
)
```

### 6. ❌ Storing API Keys in Code
```typescript
// WRONG
const API_KEY = 'abc123def456'

// RIGHT
const API_KEY = process.env.WEATHER_API_KEY
if (!API_KEY) {
  throw new Error('WEATHER_API_KEY environment variable not set')
}
```

### 7. ❌ Not Cleaning Up Map Instances
```typescript
// WRONG - Memory leak
useEffect(() => {
  const map = L.map('map')
  // No cleanup
}, [])

// RIGHT - Clean up on unmount
useEffect(() => {
  const map = L.map('map')
  return () => {
    map.remove()  // Clean up
  }
}, [])
```

---

## 📝 Commit Message Format

Follow this format for all commits:

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Examples**:
```
feat(navigation): add database schema for property locations

- Add latitude, longitude, what3words, plus_code columns to Property table
- Add geocoded_at timestamp for cache invalidation
- Create indexes for geospatial queries
- Update Prisma schema and generate client

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
feat(navigation): implement geocoding service with caching

- Create NavigationService class
- Implement Nominatim geocoding with fallback to Mapbox
- Add Plus Code generation using open-location-code
- Cache coordinates in database to avoid repeated API calls
- Add comprehensive error handling
- Write unit tests with >85% coverage

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🎯 Success Criteria

Sprint is **COMPLETE** when:

### Functionality ✅
- [x] Workers can view all their job locations on My Locations page
- [x] Workers can search and filter locations
- [x] Workers can navigate to any location with one tap
- [x] Navigation Page shows map with route
- [x] Weather and traffic info displayed
- [x] "Start Navigation" opens Google Maps (Android) or Apple Maps (iOS)
- [x] Dashboard shows weather and traffic widgets
- [x] what3words support for remote properties

### Quality ✅
- [x] All quality gates passed (see above)
- [x] Tests passing (unit, integration, E2E)
- [x] Code reviewed (self-review with checklist)
- [x] Accessibility validated (axe DevTools + manual)
- [x] Performance benchmarks met
- [x] Mobile tested on 5+ devices
- [x] Works offline (graceful degradation)

### Documentation ✅
- [x] API endpoints documented
- [x] Components documented (JSDoc)
- [x] README updated
- [x] User guide created
- [x] ADR written

### User Acceptance ✅
- [x] Demo to stakeholder
- [x] Feedback incorporated
- [x] Stakeholder signoff

---

## 📞 When You Need Help

### Stuck on Something?

1. **Check the documentation**:
   - [SPRINT-8-GPS-NAVIGATION-ENHANCED.md](SPRINT-8-GPS-NAVIGATION-ENHANCED.md) - Full implementation guide
   - [GPS-NAVIGATION-FEASIBILITY-REPORT.md](GPS-NAVIGATION-FEASIBILITY-REPORT.md) - API details
   - [PHILOSOPHY.md](PHILOSOPHY.md) - Quality standards

2. **Common issues**:
   - **CORS errors**: Add CORS headers to API endpoints
   - **Location permission denied**: Provide clear instructions, fallback to manual entry
   - **Geocoding fails**: Check User-Agent header, verify API key, check rate limits
   - **Map not displaying**: Check Leaflet CSS import, verify container has height
   - **Tests failing**: Check mock data, verify async handling, check tenant filtering

3. **Ask the user**:
   - If requirements are unclear
   - If you find a better approach
   - If quality gates conflict with timeline

### Important Reminders

- ✅ **Never commit API keys** - Use .env
- ✅ **Always filter by tenant** - Multi-tenant security
- ✅ **Test on mobile** - This is a mobile-first feature
- ✅ **Cache aggressively** - Avoid repeated API calls
- ✅ **Handle errors gracefully** - Never let the app crash
- ✅ **Quality over speed** - RightFit, not QuickFix

---

## 🚀 Getting Started Checklist

Before you start coding:

- [ ] Read [CLAUDE-RULES.md](../CLAUDE-RULES.md)
- [ ] Read [PHILOSOPHY.md](PHILOSOPHY.md)
- [ ] Read [SPRINT-8-GPS-NAVIGATION-ENHANCED.md](SPRINT-8-GPS-NAVIGATION-ENHANCED.md)
- [ ] Understand multi-tenant architecture
- [ ] Register for free API keys (WeatherAPI.com)
- [ ] Set up .env file with API keys
- [ ] Verify database connection works
- [ ] Verify API server runs (`pnpm run dev:api`)
- [ ] Verify web-worker app runs (`pnpm run dev:worker`)
- [ ] Create a new git branch: `git checkout -b sprint-8-gps-navigation`

**When ready, start with NAV-001 (Database Migration)**

---

## 📊 Progress Tracking

Update this checklist as you complete stories:

### Phase 1: Foundation (8 pts)
- [ ] NAV-001: Database migration (3 pts)
- [ ] NAV-002: TypeScript types (2 pts)
- [ ] NAV-003: Environment config (3 pts)

### Phase 2: API Development (12 pts)
- [ ] NAV-004: Geocoding service (5 pts)
- [ ] NAV-005: Navigation/routing (4 pts)
- [ ] NAV-006: Weather service (3 pts)

### Phase 3: Core Components (14 pts)
- [ ] NAV-007: Geolocation hook (2 pts)
- [ ] NAV-008: NavigationButton (3 pts)
- [ ] NAV-009: MapView component (5 pts)
- [ ] NAV-010: WeatherAlert component (4 pts)

### Phase 4: Pages & Widgets (14 pts)
- [ ] NAV-014: My Locations page (5 pts)
- [ ] NAV-015: Navigation Page (5 pts)
- [ ] NAV-016: Weather widget (2 pts)
- [ ] NAV-017: Traffic widget (2 pts)

### Phase 5: Integration (8 pts)
- [ ] NAV-018: App routing (3 pts)
- [ ] NAV-019: JobDetails integration (2 pts)
- [ ] NAV-020: Error handling & polish (3 pts)

**Total**: 0 / 56 points completed

---

## 🎉 Final Checklist Before Sprint Review

- [ ] All stories completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage >80% (check with `pnpm test:coverage`)
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] No ESLint warnings (`pnpm lint`)
- [ ] Accessibility audit passed (axe DevTools)
- [ ] Manual testing on 5+ devices completed
- [ ] Performance benchmarks met
- [ ] API documentation complete
- [ ] README updated
- [ ] User guide written
- [ ] Demo recorded (optional but recommended)
- [ ] Code committed with proper messages
- [ ] Branch ready for code review

---

**You've got this! Build something amazing! 🚀**

**Remember**: Quality over speed. RightFit, not QuickFix.

**Questions?** Ask the user. They're here to help.

---

**Handoff Date**: November 9, 2025
**Prepared By**: Claude (Sprint Planning Agent)
**For**: Next Development Agent
**Status**: Ready to implement
**Let's ship best-in-class navigation!** 🗺️✨
