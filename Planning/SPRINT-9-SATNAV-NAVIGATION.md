# Sprint 9: Satnav-Style Navigation

## Overview
Transform the current map-based navigation into a professional satnav experience using Mapbox GL JS. This will provide workers with a true GPS navigation interface similar to Google Maps or Waze, with 3D perspective, auto-rotation, and optimized turn-by-turn guidance.

## Sprint Goals
- Replace Leaflet with Mapbox GL JS for enhanced 3D navigation
- Implement driver-focused satnav UI with tilted perspective
- Add compass bearing and auto-rotation based on movement direction
- Create simplified navigation-mode interface
- Maintain all existing functionality (traffic, weather, route info)

## Tech Stack
- **Mapbox GL JS**: 3D mapping and navigation
- **React Map GL**: React integration for Mapbox
- **Device Orientation API**: Compass bearing for rotation
- **Existing APIs**: TomTom Traffic, OpenWeatherMap, OSRM routing

---

## User Stories

### Story 1: Mapbox GL JS Integration
**As a** developer
**I want to** integrate Mapbox GL JS into the worker app
**So that** we can leverage 3D mapping capabilities

**Acceptance Criteria:**
- [ ] Install `mapbox-gl` and `react-map-gl` packages
- [ ] Configure Mapbox access token (free tier: 50k loads/month)
- [ ] Add Mapbox environment variable to .env
- [ ] Create initial MapboxMapView component
- [ ] Verify Mapbox map renders correctly
- [ ] Test map loads without errors

**Technical Notes:**
```bash
npm install mapbox-gl react-map-gl
```
```
VITE_MAPBOX_TOKEN=pk.your_token_here
```

**Estimated Effort:** 2 hours

---

### Story 2: Create Satnav Map Component
**As a** developer
**I want to** create a MapboxNavigationView component
**So that** it provides a 3D perspective satnav interface

**Acceptance Criteria:**
- [ ] Create `MapboxNavigationView.tsx` component
- [ ] Implement 3D perspective with 60-degree pitch
- [ ] Add user location marker with custom icon
- [ ] Add destination marker
- [ ] Render route polyline from OSRM data
- [ ] Support light/dark map styles
- [ ] Handle loading and error states

**Component Props:**
```typescript
interface MapboxNavigationViewProps {
  userLocation: Coordinates
  destination: Coordinates
  route: RouteData
  bearing?: number // Compass heading
  pitch?: number // Camera tilt (default: 60)
  followMode?: boolean
  navigationMode?: boolean // Satnav vs overview
}
```

**Estimated Effort:** 4 hours

---

### Story 3: Implement Camera Follow Mode
**As a** worker
**I want** the map to follow my location smoothly
**So that** I can see where I'm heading in real-time

**Acceptance Criteria:**
- [ ] Map centers on user location continuously
- [ ] Smooth camera transitions (no jarring jumps)
- [ ] Camera auto-rotates based on movement direction
- [ ] Zoom level adjusts appropriately (18 for driving)
- [ ] Works with geolocation updates from useGeolocation hook
- [ ] Toggle between follow and free-pan modes

**Technical Implementation:**
- Use Mapbox `flyTo()` for smooth transitions
- Calculate bearing from previous/current coordinates
- Update camera on each location update
- Implement easing for rotation

**Estimated Effort:** 3 hours

---

### Story 4: Add Compass Bearing and Auto-Rotation
**As a** worker
**I want** the map to rotate based on which direction I'm facing
**So that** the map always shows "north is up" relative to my movement

**Acceptance Criteria:**
- [ ] Integrate Device Orientation API for compass data
- [ ] Calculate bearing from GPS movement when no compass
- [ ] Rotate map smoothly as bearing changes
- [ ] Display compass indicator showing north direction
- [ ] Handle orientation permission requests
- [ ] Fallback to movement-based bearing on unsupported devices

**Technical Notes:**
- Device Orientation API requires HTTPS
- Calculate bearing from lat/lon changes as fallback
- Use `requestAnimationFrame` for smooth rotation

**Estimated Effort:** 4 hours

---

### Story 5: Create Satnav-Style UI Overlay
**As a** worker
**I want** a clean navigation interface showing next turn and ETA
**So that** I can focus on driving without distractions

**Acceptance Criteria:**
- [ ] Create NavigationOverlay component
- [ ] Display next turn instruction prominently
- [ ] Show distance to next turn
- [ ] Display current speed (if available)
- [ ] Show ETA and remaining distance
- [ ] Add turn arrow visualization
- [ ] Use large, readable fonts for driving
- [ ] Dark overlay for map clarity
- [ ] Toggle fullscreen mode

**UI Layout:**
```
┌─────────────────────────────┐
│  ← Turn left in 200m        │ ← Next instruction
├─────────────────────────────┤
│  🎯 ETA: 15:30  📍 2.5 km  │ ← Quick stats
└─────────────────────────────┘
        [3D Map View]
┌─────────────────────────────┐
│  Settings ⚙️  Exit 🚪        │ ← Bottom controls
└─────────────────────────────┘
```

**Estimated Effort:** 5 hours

---

### Story 6: Navigation Mode Toggle
**As a** worker
**I want to** switch between satnav mode and overview mode
**So that** I can see the full route or focus on driving

**Acceptance Criteria:**
- [ ] Add navigation mode toggle button
- [ ] Satnav mode: 3D tilted view, auto-follow, auto-rotate
- [ ] Overview mode: 2D top-down, fit route bounds
- [ ] Smooth transition between modes
- [ ] Remember user preference
- [ ] Show mode indicator icon

**Mode Behaviors:**
- **Satnav Mode**: pitch=60°, zoom=18, bearing=auto, follow=on
- **Overview Mode**: pitch=0°, zoom=auto-fit, bearing=0°, follow=off

**Estimated Effort:** 3 hours

---

### Story 7: Voice-Style Turn Instructions
**As a** worker
**I want** clear, voice-style turn instructions
**So that** I know exactly when and where to turn

**Acceptance Criteria:**
- [ ] Parse OSRM maneuver types into readable instructions
- [ ] Display instructions at appropriate distances (500m, 200m, 50m)
- [ ] Update instruction based on proximity to turn
- [ ] Show turn icons (left, right, straight, u-turn, etc.)
- [ ] Highlight instruction when approaching turn
- [ ] Clear instruction after completing turn

**Instruction Examples:**
- "In 500m, turn left onto High Street"
- "In 200m, keep right to stay on A38"
- "Turn left now"
- "You have arrived at your destination"

**Estimated Effort:** 4 hours

---

### Story 8: Traffic Integration on 3D Map
**As a** worker
**I want** traffic conditions overlaid on the navigation map
**So that** I can see congestion ahead

**Acceptance Criteria:**
- [ ] Display traffic flow data on route polyline
- [ ] Color-code route segments by traffic level
- [ ] Red = severe, Orange = high, Yellow = moderate, Green = clear
- [ ] Integrate with existing TrafficService
- [ ] Update traffic data every 5 minutes
- [ ] Show traffic incidents as map markers

**Technical Implementation:**
- Use Mapbox line layer with gradient colors
- Segment route based on traffic flow data
- Add incident markers with severity icons

**Estimated Effort:** 4 hours

---

### Story 9: Speed and Location Accuracy Display
**As a** worker
**I want** to see my current speed and GPS accuracy
**So that** I know if my location is reliable

**Acceptance Criteria:**
- [ ] Calculate speed from GPS coordinates
- [ ] Display speed in km/h or mph
- [ ] Show GPS accuracy indicator (±Xm)
- [ ] Update speed in real-time
- [ ] Warn when GPS accuracy is poor (>50m)
- [ ] Show "acquiring GPS" state

**Speed Calculation:**
- Derive from consecutive GPS coordinates and timestamps
- Smooth using moving average (last 3-5 readings)
- Handle stationary state (speed ~0)

**Estimated Effort:** 2 hours

---

### Story 10: Migrate Existing Features
**As a** worker
**I want** all current features to work in satnav mode
**So that** I don't lose functionality

**Acceptance Criteria:**
- [ ] Weather alerts still display
- [ ] Traffic alerts still display
- [ ] Turn-by-turn directions accessible
- [ ] Property info card available
- [ ] Zoom controls functional
- [ ] Follow mode toggle works
- [ ] Maintain collapsible sections

**Migration Tasks:**
- Adapt WeatherAlert for satnav UI
- Adapt TrafficAlert for satnav UI
- Update property info overlay
- Ensure all controls work with new map

**Estimated Effort:** 4 hours

---

### Story 11: Performance Optimization
**As a** developer
**I want** the navigation to run smoothly on mobile
**So that** workers have a responsive experience

**Acceptance Criteria:**
- [ ] Optimize map rendering for mobile devices
- [ ] Throttle location updates (max 1 per second)
- [ ] Debounce bearing calculations
- [ ] Lazy load traffic/weather data
- [ ] Reduce route complexity if needed
- [ ] Test on low-end devices
- [ ] Target 60fps for smooth animations

**Optimization Techniques:**
- Use `requestAnimationFrame` for updates
- Simplify polylines using Douglas-Peucker
- Batch map style updates
- Preload critical assets

**Estimated Effort:** 3 hours

---

### Story 12: Testing and Refinement
**As a** developer
**I want** comprehensive testing of navigation features
**So that** the satnav is reliable for workers

**Acceptance Criteria:**
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test with mock location data
- [ ] Test bearing/rotation accuracy
- [ ] Test in different lighting conditions (day/night)
- [ ] Test with slow/fast movement
- [ ] Verify battery impact is acceptable
- [ ] Test traffic/weather integration

**Test Scenarios:**
- Driving simulation with mock coordinates
- Walking simulation
- Stationary (acquiring GPS)
- Lost GPS signal
- Switching between modes

**Estimated Effort:** 4 hours

---

## Sprint Timeline

### Week 1: Foundation
- Story 1: Mapbox Integration ✅
- Story 2: Satnav Map Component ✅
- Story 3: Camera Follow Mode ✅

### Week 2: Navigation Features
- Story 4: Compass & Auto-Rotation ✅
- Story 5: Satnav UI Overlay ✅
- Story 6: Navigation Mode Toggle ✅

### Week 3: Advanced Features
- Story 7: Turn Instructions ✅
- Story 8: Traffic Integration ✅
- Story 9: Speed & Accuracy ✅

### Week 4: Polish & Testing
- Story 10: Feature Migration ✅
- Story 11: Performance Optimization ✅
- Story 12: Testing & Refinement ✅

---

## Dependencies

### NPM Packages
```json
{
  "mapbox-gl": "^3.0.0",
  "react-map-gl": "^7.1.0",
  "@mapbox/mapbox-gl-directions": "^4.1.0"
}
```

### Environment Variables
```bash
# .env
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

### External APIs
- Mapbox GL JS (50k map loads/month free)
- Existing: TomTom Traffic API
- Existing: OpenWeatherMap API
- Existing: OSRM Routing API

---

## Technical Architecture

### Component Structure
```
apps/web-worker/src/
├── components/
│   └── navigation/
│       ├── MapboxNavigationView.tsx     (NEW - 3D satnav map)
│       ├── NavigationOverlay.tsx        (NEW - HUD overlay)
│       ├── TurnInstruction.tsx          (NEW - next turn display)
│       ├── Speedometer.tsx              (NEW - speed/accuracy)
│       ├── MapView.tsx                  (EXISTING - keep for fallback)
│       ├── TrafficAlert.tsx             (EXISTING - adapt)
│       └── WeatherAlert.tsx             (EXISTING - adapt)
├── hooks/
│   ├── useGeolocation.ts                (EXISTING - enhance)
│   ├── useDeviceOrientation.ts          (NEW - compass bearing)
│   └── useNavigationState.ts            (NEW - satnav state)
└── pages/
    └── navigation/
        └── NavigationView.tsx           (MODIFY - add satnav mode)
```

### State Management
```typescript
interface NavigationState {
  mode: 'overview' | 'satnav'
  bearing: number
  pitch: number
  zoom: number
  followMode: boolean
  currentInstructionIndex: number
  userSpeed: number
  gpsAccuracy: number
}
```

---

## Success Metrics

### User Experience
- [ ] Smooth map rotation (<16ms frame time)
- [ ] Accurate bearing calculation (±5°)
- [ ] Turn instructions display 500m in advance
- [ ] Battery drain <10% per hour of navigation
- [ ] GPS accuracy ≤20m in clear conditions

### Feature Completeness
- [ ] All existing features functional
- [ ] Satnav mode fully operational
- [ ] Traffic/weather integrated
- [ ] Works on iOS and Android
- [ ] Fallback to 2D map if WebGL unavailable

---

## Risk Mitigation

### Risk 1: Mapbox Free Tier Limits
- **Risk**: Exceeding 50k map loads/month
- **Mitigation**: Implement map caching, lazy loading, monitor usage
- **Fallback**: Keep Leaflet as backup

### Risk 2: Device Orientation Not Supported
- **Risk**: Compass bearing unavailable on some devices
- **Mitigation**: Calculate bearing from GPS movement as fallback
- **Impact**: Medium - still functional without compass

### Risk 3: Battery Consumption
- **Risk**: Continuous 3D rendering drains battery
- **Mitigation**: Optimize rendering, reduce update frequency, add power-saving mode
- **Monitoring**: Test battery drain on various devices

### Risk 4: GPS Accuracy in Urban Areas
- **Risk**: Poor GPS signal in city centers
- **Mitigation**: Show accuracy indicator, use map matching algorithms
- **Impact**: Low - workers aware of limitations

---

## Documentation

### Developer Docs
- [ ] Mapbox integration guide
- [ ] Navigation state management
- [ ] Testing procedures
- [ ] Troubleshooting common issues

### User Docs
- [ ] Satnav mode user guide
- [ ] GPS accuracy tips
- [ ] Battery optimization tips
- [ ] Troubleshooting navigation issues

---

## Sprint Retrospective (To be completed)

### What Went Well
- TBD

### What Could Improve
- TBD

### Action Items
- TBD
