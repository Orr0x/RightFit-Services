# Sprint 10 - Property Management Integration

## Overview
Sprint 10 connects the GPS navigation system (Sprints 8-9) with the core business workflow by adding intelligent automation for job arrival, route tracking, and customer communication.

## Business Value
- **Eliminate manual status updates**: Auto-detect when workers arrive at properties
- **Automatic mileage tracking**: Calculate travel distance for reimbursement and tax purposes
- **Improved customer experience**: Proactive "on my way" notifications
- **Evidence trail**: Geo-tagged photos prove work was done at correct location
- **Efficiency gains**: Multi-job route optimization saves time and fuel

---

## Feature 1: Geofencing & Auto-Arrival Detection

### User Story
**As a worker**, when I arrive within 50 meters of a job site, **I want the system to automatically detect my arrival** so I don't have to manually update the job status.

### Technical Implementation

#### 1.1 Geofencing Utility
Create a utility function to calculate distance between two GPS coordinates using the Haversine formula.

**File**: `apps/web-worker/src/utils/geofencing.ts`

```typescript
export interface GeofenceConfig {
  radius: number // in meters
  centerLat: number
  centerLon: number
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula implementation
  // Returns distance in meters
}

export function isWithinGeofence(
  userLat: number,
  userLon: number,
  geofence: GeofenceConfig
): boolean {
  const distance = calculateDistance(userLat, userLon, geofence.centerLat, geofence.centerLon)
  return distance <= geofence.radius
}
```

#### 1.2 Arrival Detection Hook
Create a React hook that monitors GPS position and triggers arrival events.

**File**: `apps/web-worker/src/hooks/useArrivalDetection.ts`

```typescript
export interface ArrivalDetectionConfig {
  jobId: string
  propertyLocation: Coordinates
  arrivalRadius: number // default 50 meters
  onArrival: (jobId: string, arrivalTime: Date, distance: number) => void
  enabled: boolean
}

export function useArrivalDetection(config: ArrivalDetectionConfig) {
  const { jobId, propertyLocation, arrivalRadius, onArrival, enabled } = config
  const [hasArrived, setHasArrived] = useState(false)
  const { location } = useGeolocation()

  useEffect(() => {
    if (!enabled || hasArrived || !location) return

    const isWithin = isWithinGeofence(
      location.latitude,
      location.longitude,
      {
        radius: arrivalRadius,
        centerLat: propertyLocation.latitude,
        centerLon: propertyLocation.longitude,
      }
    )

    if (isWithin) {
      setHasArrived(true)
      onArrival(jobId, new Date(), distance)
    }
  }, [location, enabled, hasArrived])

  return { hasArrived }
}
```

#### 1.3 API Integration
Add endpoint to record job arrival events.

**API Endpoint**: `POST /api/jobs/:jobId/arrival`

**Request Body**:
```json
{
  "arrivalTime": "2025-11-10T14:30:00Z",
  "location": {
    "latitude": 53.4808,
    "longitude": -2.2426
  },
  "distanceFromProperty": 42.5
}
```

**Database**: Add `arrivedAt` timestamp to Job/Timesheet records

---

## Feature 2: Navigation History & Mileage Tracking

### User Story
**As a worker**, when I complete a job, **I want the system to automatically calculate how far I traveled** so I can claim accurate mileage reimbursement.

### Technical Implementation

#### 2.1 Route History Storage
Store navigation routes in localStorage for offline-first approach.

**File**: `apps/web-worker/src/utils/routeHistory.ts`

```typescript
export interface RouteHistoryEntry {
  id: string
  jobId: string
  startTime: Date
  endTime: Date | null
  startLocation: Coordinates
  endLocation: Coordinates
  routePoints: Coordinates[] // GPS breadcrumbs
  totalDistanceMeters: number
  estimatedDistanceMeters: number // from OSRM
  syncedToServer: boolean
}

export class RouteHistoryManager {
  private storageKey = 'rightfit_route_history'

  startTracking(jobId: string, startLocation: Coordinates): string
  updateRoute(routeId: string, newPoint: Coordinates): void
  endTracking(routeId: string, endLocation: Coordinates): RouteHistoryEntry
  getHistory(jobId: string): RouteHistoryEntry[]
  syncToServer(): Promise<void>
}
```

#### 2.2 GPS Breadcrumb Collection
Collect GPS points during navigation at regular intervals (every 30 seconds or 50 meters).

**Integration Point**: `NavigationView.tsx`
- Start tracking when navigation begins
- Collect breadcrumbs during travel
- End tracking when job starts or navigation cancelled

#### 2.3 Mileage Calculation
Calculate actual distance traveled from GPS breadcrumbs.

```typescript
export function calculateTotalDistance(routePoints: Coordinates[]): number {
  let total = 0
  for (let i = 1; i < routePoints.length; i++) {
    total += calculateDistance(
      routePoints[i-1].latitude,
      routePoints[i-1].longitude,
      routePoints[i].latitude,
      routePoints[i].longitude
    )
  }
  return total
}
```

#### 2.4 API Integration
**API Endpoint**: `POST /api/navigation/route-history`

**Request Body**:
```json
{
  "jobId": "abc123",
  "startTime": "2025-11-10T14:00:00Z",
  "endTime": "2025-11-10T14:25:00Z",
  "distanceMeters": 8420,
  "routePoints": [...]
}
```

**Database**: Add `NavigationHistory` table or extend Timesheet records

---

## Feature 3: Geo-Tagged Evidence Photos

### User Story
**As a worker**, when I upload a photo for a job, **I want the GPS coordinates automatically attached** so there's proof the work was done at the correct property.

### Technical Implementation

#### 3.1 Photo Metadata Utility
Extract/add GPS metadata to photo uploads.

**File**: `apps/web-worker/src/utils/photoGeotagging.ts`

```typescript
export interface GeotaggedPhoto {
  file: File
  latitude: number
  longitude: number
  timestamp: Date
  accuracy: number // GPS accuracy in meters
}

export async function addGeotag(
  photo: File,
  location: Coordinates,
  timestamp: Date
): Promise<GeotaggedPhoto> {
  // Add GPS metadata to photo
}

export function verifyLocation(
  photoLocation: Coordinates,
  expectedLocation: Coordinates,
  maxDistance: number = 500 // meters
): { valid: boolean; distance: number } {
  const distance = calculateDistance(
    photoLocation.latitude,
    photoLocation.longitude,
    expectedLocation.latitude,
    expectedLocation.longitude
  )
  return {
    valid: distance <= maxDistance,
    distance
  }
}
```

#### 3.2 Photo Upload Component Enhancement
Modify existing photo upload to include GPS data.

**File**: `apps/web-worker/src/components/jobs/PhotoUpload.tsx`
- Capture GPS coordinates when photo is taken/selected
- Display "Location verified" badge if within expected range
- Show warning if GPS is unavailable or location doesn't match
- Include GPS data in upload metadata

#### 3.3 API Integration
Update photo upload endpoint to accept GPS metadata.

**API Endpoint**: `POST /api/jobs/:jobId/photos`

**Request Body** (FormData):
```
photo: File
latitude: number
longitude: number
accuracy: number
timestamp: ISO date string
```

**Database**: Add GPS columns to Photos table:
- `latitude`
- `longitude`
- `gps_accuracy`
- `captured_at`
- `location_verified` (boolean)

---

## Feature 4: Customer "On My Way" Notifications

### User Story
**As a customer**, when a worker starts navigating to my property, **I want to receive a notification** so I know when to expect them.

### Technical Implementation

#### 4.1 Notification Trigger
Add "Notify Customer" button when worker starts navigation.

**Integration Point**: `NavigationView.tsx`
- Show prominent "Notify Customer" button
- Auto-trigger notification when navigation starts (optional, with confirmation)
- Show notification sent status

#### 4.2 Notification API
**API Endpoint**: `POST /api/jobs/:jobId/notify-customer`

**Request Body**:
```json
{
  "estimatedArrival": "2025-11-10T14:30:00Z",
  "currentDistance": 8420,
  "message": "Your cleaner is on their way and will arrive in approximately 25 minutes."
}
```

**Backend Implementation**:
- Use existing notification system (SMS/Email)
- Get customer contact details from job
- Send message via Twilio (SMS) or SendGrid (Email)
- Record notification in database

#### 4.3 Notification Templates
```
SMS Template:
"Hi {customerName}, {workerName} is on their way to {propertyAddress}.
Estimated arrival: {estimatedTime}. View live tracking: {trackingLink}"

Email Template:
Subject: Your worker is on the way - Arriving at {estimatedTime}
Body: Professional HTML email with map, ETA, worker details
```

---

## Feature 5: Multi-Job Route Optimization

### User Story
**As a worker with multiple jobs**, when I view my daily schedule, **I want to see the most efficient order to visit properties** so I minimize travel time.

### Technical Implementation

#### 5.1 Route Optimization Algorithm
Implement nearest-neighbor or use OSRM's trip optimization API.

**File**: `apps/web-worker/src/utils/routeOptimization.ts`

```typescript
export interface JobLocation {
  jobId: string
  propertyName: string
  location: Coordinates
  scheduledTime?: Date
  duration: number // estimated job duration in minutes
}

export interface OptimizedRoute {
  jobs: JobLocation[]
  totalDistance: number
  totalDuration: number
  waypoints: Coordinates[]
}

export async function optimizeRoute(
  jobs: JobLocation[],
  startLocation: Coordinates
): Promise<OptimizedRoute> {
  // Use OSRM Trip API or simple nearest-neighbor algorithm
}
```

#### 5.2 Schedule View Enhancement
Add route optimization to MySchedule page.

**File**: `apps/web-worker/src/pages/schedule/MySchedule.tsx`
- Show "Optimize Route" button when multiple jobs exist
- Display optimized order with distance/time savings
- Allow reordering jobs manually
- Show map preview of optimized route

#### 5.3 OSRM Trip API Integration
Use OSRM's trip optimization endpoint for professional results.

**API Call**:
```
GET https://router.project-osrm.org/trip/v1/driving/{coordinates}?overview=full
```

**Response**: Optimized waypoint order + total distance/duration

---

## Implementation Priority

### Phase 1 (High Priority - Core Automation)
1. ✅ Geofencing utility (Foundation for all location features)
2. ✅ Auto-arrival detection (Biggest time saver)
3. ✅ Navigation history tracking (Essential for mileage)

### Phase 2 (Medium Priority - Evidence & Communication)
4. ✅ Geo-tagged photos (Legal/evidence value)
5. ✅ Customer notifications (UX improvement)

### Phase 3 (Low Priority - Optimization)
6. ✅ Multi-job route optimization (Nice to have, requires multiple jobs)

---

## Database Schema Changes

### Jobs Table
```sql
ALTER TABLE jobs
ADD COLUMN arrived_at TIMESTAMP,
ADD COLUMN arrival_location_lat DECIMAL(10, 8),
ADD COLUMN arrival_location_lon DECIMAL(11, 8),
ADD COLUMN arrival_distance_meters DECIMAL(10, 2);
```

### New Table: NavigationHistory
```sql
CREATE TABLE navigation_history (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  worker_id UUID REFERENCES users(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  start_lat DECIMAL(10, 8),
  start_lon DECIMAL(11, 8),
  end_lat DECIMAL(10, 8),
  end_lon DECIMAL(11, 8),
  distance_meters DECIMAL(10, 2),
  route_points JSONB, -- Array of GPS coordinates
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Photos Table
```sql
ALTER TABLE photos
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN gps_accuracy DECIMAL(10, 2),
ADD COLUMN captured_at TIMESTAMP,
ADD COLUMN location_verified BOOLEAN DEFAULT false;
```

### New Table: CustomerNotifications
```sql
CREATE TABLE customer_notifications (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  notification_type VARCHAR(50), -- 'on_my_way', 'arrived', 'completed'
  sent_at TIMESTAMP NOT NULL,
  delivery_method VARCHAR(20), -- 'sms', 'email'
  delivery_status VARCHAR(50), -- 'sent', 'delivered', 'failed'
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing Strategy

### Manual Testing
1. **Arrival Detection**:
   - Test with mock location at various distances (100m, 50m, 25m)
   - Verify arrival only triggers once
   - Test with GPS off/unavailable

2. **Route History**:
   - Start navigation, move to different locations, verify breadcrumbs
   - Calculate mileage manually vs system calculation
   - Test localStorage persistence across page reloads

3. **Geo-Tagged Photos**:
   - Upload photo at property, verify GPS matches
   - Upload photo away from property, verify warning
   - Test without GPS permission

4. **Notifications**:
   - Trigger notification, verify customer receives SMS/email
   - Check ETA accuracy
   - Verify notification not sent multiple times

5. **Route Optimization**:
   - Create 3-5 jobs in different locations
   - Compare manual order vs optimized order
   - Verify distance/time savings

### Edge Cases
- GPS signal lost during navigation
- User denies location permission
- Offline mode (notifications queued)
- Multiple workers at same property
- Property coordinates incorrect/missing

---

## Success Metrics

### Quantitative
- **Arrival detection accuracy**: >95% within 50m radius
- **Mileage calculation accuracy**: Within 5% of actual distance
- **Notification delivery rate**: >98% successful delivery
- **Route optimization savings**: Average 15-20% reduction in travel time
- **Photo location verification**: >90% of photos geo-tagged

### Qualitative
- Workers report time saved from manual status updates
- Reduced customer service calls asking "where's my worker?"
- Improved mileage reimbursement accuracy
- Evidence trail for dispute resolution

---

## Dependencies

### External APIs
- ✅ OSRM (already integrated) - Route optimization
- ✅ Twilio (already configured) - SMS notifications
- ✅ SendGrid (already configured) - Email notifications
- ✅ Nominatim (already integrated) - Reverse geocoding for addresses

### Browser APIs
- Geolocation API (already in use)
- LocalStorage (for route history)
- File API (for photo metadata)

### npm Packages
- No new packages required (using existing stack)

---

## Timeline Estimate

- **Feature 1 (Geofencing & Arrival)**: 2-3 hours
- **Feature 2 (Route History)**: 3-4 hours
- **Feature 3 (Geo-Tagged Photos)**: 2-3 hours
- **Feature 4 (Notifications)**: 2-3 hours
- **Feature 5 (Route Optimization)**: 3-4 hours
- **Testing & Bug Fixes**: 2-3 hours
- **Documentation**: 1 hour

**Total**: 15-20 hours

---

## Next Sprint Ideas (Sprint 11)

After completing property integration, consider:

1. **Worker Experience Polish**:
   - Dark mode for night navigation
   - Battery optimization
   - Offline mode for checklists
   - Push notifications

2. **Analytics Dashboard**:
   - Travel time analysis
   - Fuel cost tracking
   - Efficiency metrics
   - Route heatmaps

3. **Advanced Features**:
   - Voice navigation
   - Real-time worker tracking for managers
   - Predictive ETA with traffic
   - Smart scheduling based on location

---

## Notes

- All GPS features must gracefully degrade when location unavailable
- Privacy: Only track location during active navigation
- Battery: Use geolocation efficiently (don't poll continuously)
- Offline: Queue notifications and route history for sync when online
- Testing: Use mock locations for development (already implemented)
