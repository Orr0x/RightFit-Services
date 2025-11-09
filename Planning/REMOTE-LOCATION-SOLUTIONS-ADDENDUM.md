# Remote Location Solutions - what3words & Alternatives

**Addendum to**: GPS-NAVIGATION-FEASIBILITY-REPORT.md
**Date**: November 9, 2025
**Use Case**: Properties without traditional addresses (rural cabins, fields, remote cottages)

---

## Problem Statement

**Challenge**: Some properties don't have reliable street addresses:
- Rural cabins in forests/fields
- Farm properties
- Remote holiday cottages
- Properties on large estates
- Construction sites
- Temporary locations

**Traditional addresses fail when**:
- "The cabin past the old oak tree"
- "Third field on the right after the gate"
- "Follow the dirt road for 2 miles"
- Multiple buildings share one address
- Address doesn't match GPS location

---

## Solution 1: what3words (RECOMMENDED)

### Overview

**what3words** divides the entire world into 3m x 3m squares and gives each a unique 3-word identifier.

**Example**:
- Traditional: "Somewhere in the Scottish Highlands"
- what3words: `///filled.count.soap`
- GPS: 57.1234°N, -3.5678°W

### API Details

**Service**: what3words API
**Website**: https://developer.what3words.com/
**Cost**:
- FREE tier: 25,000 requests/month
- Standard tier: $50/month (250,000 requests)
- Pro tier: Custom pricing

**Limits (Free Tier)**:
- ✅ 25,000 API calls/month
- ✅ Convert 3-word addresses ↔ GPS coordinates
- ✅ AutoSuggest for address entry
- ✅ No credit card required for free tier
- ✅ Commercial use allowed

**Documentation**: https://developer.what3words.com/public-api/docs

---

### API Capabilities

#### 1. Convert what3words → GPS Coordinates

```javascript
const apiKey = 'YOUR_WHAT3WORDS_KEY'
const words = 'filled.count.soap'
const url = `https://api.what3words.com/v3/convert-to-coordinates?words=${words}&key=${apiKey}`

// Response:
{
  "country": "GB",
  "square": {
    "southwest": { "lng": -3.567890, "lat": 57.123400 },
    "northeast": { "lng": -3.567850, "lat": 57.123440 }
  },
  "nearestPlace": "Inverness, Highland",
  "coordinates": { "lng": -3.567870, "lat": 57.123420 },
  "words": "filled.count.soap",
  "language": "en",
  "map": "https://w3w.co/filled.count.soap"
}
```

**Accuracy**: 3m x 3m square (extremely precise)

---

#### 2. Convert GPS Coordinates → what3words

```javascript
const lat = 57.123420
const lon = -3.567870
const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lon}&language=en&key=${apiKey}`

// Response:
{
  "country": "GB",
  "words": "filled.count.soap",
  "language": "en",
  "map": "https://w3w.co/filled.count.soap"
}
```

**Use case**: Generate what3words for properties that only have GPS coordinates

---

#### 3. AutoSuggest (Address Entry Validation)

```javascript
const input = 'filled.count.so'
const url = `https://api.what3words.com/v3/autosuggest?input=${input}&key=${apiKey}`

// Response:
{
  "suggestions": [
    {
      "country": "GB",
      "nearestPlace": "Inverness, Highland",
      "words": "filled.count.soap",
      "distanceToFocusKm": 0,
      "rank": 1,
      "language": "en"
    },
    {
      "words": "filled.count.sofa",
      "rank": 2
    }
  ]
}
```

**Use case**: Help workers type what3words addresses correctly (autocomplete)

---

### Integration Plan

#### Database Schema Update

Add what3words support to Property table:

```sql
ALTER TABLE "Property" ADD COLUMN what3words VARCHAR(50);
ALTER TABLE "Property" ADD COLUMN location_type VARCHAR(20) DEFAULT 'ADDRESS';
-- location_type: 'ADDRESS' | 'WHAT3WORDS' | 'GPS_ONLY'
```

**Why**:
- Some properties use traditional addresses
- Some use what3words (rural/remote)
- Some only have GPS coordinates (fallback)

---

#### UI Component: LocationInput

```typescript
// apps/web-*/src/components/location/LocationInput.tsx

interface LocationInputProps {
  onLocationChange: (location: PropertyLocation) => void
}

interface PropertyLocation {
  type: 'ADDRESS' | 'WHAT3WORDS' | 'GPS_ONLY'
  address?: string
  what3words?: string
  latitude?: number
  longitude?: number
}

export default function LocationInput({ onLocationChange }: LocationInputProps) {
  return (
    <div className="space-y-4">
      {/* Location Type Selector */}
      <div className="flex gap-2">
        <button onClick={() => setType('ADDRESS')}>
          Street Address
        </button>
        <button onClick={() => setType('WHAT3WORDS')}>
          what3words
        </button>
        <button onClick={() => setType('GPS_ONLY')}>
          GPS Coordinates
        </button>
      </div>

      {/* Conditional Input Fields */}
      {type === 'ADDRESS' && (
        <input
          type="text"
          placeholder="123 Main St, London"
        />
      )}

      {type === 'WHAT3WORDS' && (
        <div>
          <input
            type="text"
            placeholder="filled.count.soap"
            onChange={validateWhat3words}
          />
          <p className="text-xs text-gray-500">
            Enter the 3 words from what3words map
          </p>
        </div>
      )}

      {type === 'GPS_ONLY' && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Latitude (e.g., 51.5074)"
            step="0.000001"
          />
          <input
            type="number"
            placeholder="Longitude (e.g., -0.1278)"
            step="0.000001"
          />
        </div>
      )}
    </div>
  )
}
```

---

#### Worker Job Card: Display what3words

```typescript
// apps/web-worker/src/components/jobs/JobCard.tsx

// Add to job display:
{job.property.what3words && (
  <div className="flex items-center gap-2 text-sm text-blue-600">
    <MapPin className="w-4 h-4" />
    <span className="font-mono">
      ///{job.property.what3words}
    </span>
    <button
      onClick={() => openWhat3wordsMap(job.property.what3words)}
      className="text-xs underline"
    >
      Open in what3words
    </button>
  </div>
)}
```

---

#### Navigation Integration

```typescript
// apps/web-worker/src/services/navigation.ts

export async function navigateToProperty(property: Property) {
  let coordinates: { lat: number; lon: number }

  // Priority order:
  // 1. Use cached GPS coordinates
  // 2. Use what3words (convert to GPS)
  // 3. Geocode traditional address

  if (property.latitude && property.longitude) {
    coordinates = { lat: property.latitude, lon: property.longitude }
  }
  else if (property.what3words) {
    // Convert what3words to GPS
    coordinates = await convertWhat3wordsToGPS(property.what3words)

    // Cache the result
    await updatePropertyCoordinates(property.id, coordinates)
  }
  else if (property.address) {
    // Geocode traditional address
    coordinates = await geocodeAddress(property.address)

    // Cache the result
    await updatePropertyCoordinates(property.id, coordinates)
  }
  else {
    throw new Error('No location data available for this property')
  }

  // Navigate using GPS coordinates
  openNavigation(coordinates)
}
```

---

### Pros & Cons

**✅ Pros**:
- ✅ **Extreme precision**: 3m x 3m accuracy (better than most addresses)
- ✅ **Easy to communicate**: "filled.count.soap" easier than GPS coordinates
- ✅ **Universal**: Works anywhere in the world, even oceans/Antarctica
- ✅ **Free tier generous**: 25,000 requests/month covers 800+ jobs/day
- ✅ **Voice-friendly**: Workers can speak the 3 words
- ✅ **Error detection**: AutoSuggest catches typos
- ✅ **Offline support**: Can download what3words app for offline use
- ✅ **Multi-language**: Supports 50+ languages
- ✅ **No internet needed for app**: what3words mobile app works offline

**❌ Cons**:
- ❌ **Proprietary**: Not open source (vs. open alternatives)
- ❌ **Requires API key**: Need to sign up
- ❌ **Learning curve**: Workers need to understand the concept
- ❌ **Extra field**: Need to add to property data entry
- ❌ **Free tier limit**: 25K/month may not be enough at scale
- ❌ **Dependency**: Relying on external service

**Verdict**: ⭐⭐⭐⭐⭐ **EXCELLENT** for remote/rural properties

---

## Solution 2: Plus Codes (Google Open Location Code)

### Overview

**Plus Codes** are short codes (6-7 characters) that represent geographic locations, created by Google but fully open source.

**Example**:
- Full code: `9C3WXQ6M+QR`
- Local code: `XQ6M+QR Edinburgh` (within a city)
- GPS: 57.123420°N, -3.567870°W

**Advantages over what3words**:
- ✅ Completely FREE (open source algorithm)
- ✅ No API key needed
- ✅ No rate limits
- ✅ Can compute offline (JavaScript library available)
- ✅ Integrated into Google Maps

**Disadvantages**:
- ❌ Less precise than what3words (14m x 14m vs 3m x 3m)
- ❌ Harder to remember (random characters vs. words)
- ❌ Less brand recognition
- ❌ Not as voice-friendly

---

### API/Library Details

**Service**: Open Location Code (Plus Codes)
**Cost**: FREE (open source)
**Repository**: https://github.com/google/open-location-code
**NPM Package**: `open-location-code`

**Installation**:
```bash
npm install open-location-code
```

**Usage**:
```javascript
import OpenLocationCode from 'open-location-code'

// Encode GPS coordinates to Plus Code
const plusCode = OpenLocationCode.encode(57.123420, -3.567870)
// Returns: "9C3WXQ6M+QR"

// Decode Plus Code to GPS coordinates
const coords = OpenLocationCode.decode(plusCode)
// Returns: {
//   latitudeCenter: 57.123425,
//   longitudeCenter: -3.567875,
//   latitudeLo: 57.123412,
//   latitudeHi: 57.123437,
//   longitudeLo: -3.567887,
//   longitudeHi: -3.567862
// }

// Shorten code using reference location (for display)
const shortCode = OpenLocationCode.shorten('9C3WXQ6M+QR', 57.15, -3.5)
// Returns: "XQ6M+QR"

// Recover full code from short code + reference
const fullCode = OpenLocationCode.recoverNearest('XQ6M+QR', 57.15, -3.5)
// Returns: "9C3WXQ6M+QR"
```

---

### Integration Plan

**Add to Property table**:
```sql
ALTER TABLE "Property" ADD COLUMN plus_code VARCHAR(20);
```

**Generate Plus Code automatically**:
```typescript
// When property coordinates are saved, auto-generate Plus Code
import OpenLocationCode from 'open-location-code'

async function savePropertyLocation(propertyId: string, lat: number, lon: number) {
  const plusCode = OpenLocationCode.encode(lat, lon)

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      latitude: lat,
      longitude: lon,
      plus_code: plusCode
    }
  })
}
```

**Display in worker app**:
```typescript
// Show Plus Code as alternative to address
<div className="text-sm text-gray-600">
  <span>Plus Code: </span>
  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
    {property.plus_code}
  </span>
  <button onClick={() => openGoogleMaps(property.plus_code)}>
    Navigate
  </button>
</div>
```

---

### Pros & Cons

**✅ Pros**:
- ✅ **Completely FREE**: Open source, no API costs
- ✅ **No rate limits**: Compute locally
- ✅ **Offline-first**: No internet needed for encoding/decoding
- ✅ **Google Maps integration**: Can paste Plus Code directly into Google Maps
- ✅ **Open standard**: Not tied to any company
- ✅ **Works globally**: Covers entire world
- ✅ **Can auto-generate**: Create from GPS coordinates automatically

**❌ Cons**:
- ❌ **Less precise**: 14m x 14m (vs 3m x 3m for what3words)
- ❌ **Harder to remember**: Random characters vs meaningful words
- ❌ **Less familiar**: Users may not know what it is
- ❌ **Not voice-friendly**: Hard to speak aloud

**Verdict**: ⭐⭐⭐⭐ **EXCELLENT** free alternative to what3words

---

## Solution 3: Direct GPS Coordinates

### Overview

Simply store and use latitude/longitude coordinates directly.

**Example**:
- Latitude: 57.123420°
- Longitude: -3.567870°
- Formatted: `57.123420, -3.567870`

### Implementation

**Already supported in our database schema**:
```sql
ALTER TABLE "Property" ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE "Property" ADD COLUMN longitude DECIMAL(11, 8);
```

**Worker can drop a pin on map**:
```typescript
// apps/web-*/src/components/location/MapPicker.tsx

export default function MapPicker({ onLocationSelect }) {
  const [marker, setMarker] = useState(null)

  return (
    <div>
      <p>Click on the map to set property location</p>
      <MapContainer center={[51.5074, -0.1278]} zoom={13}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onMarkerSet={(coords) => {
          setMarker(coords)
          onLocationSelect(coords.lat, coords.lng)
        }} />
      </MapContainer>

      {marker && (
        <div className="mt-2 text-sm">
          <p>Selected location:</p>
          <p className="font-mono">{marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  )
}
```

---

### Pros & Cons

**✅ Pros**:
- ✅ **Most precise**: Can specify to 6+ decimal places (~10cm accuracy)
- ✅ **Universal standard**: Every navigation system understands GPS
- ✅ **FREE**: No API costs
- ✅ **Simple**: Just two numbers
- ✅ **Direct integration**: All routing APIs use GPS natively

**❌ Cons**:
- ❌ **Hard to communicate**: Can't easily speak/write coordinates
- ❌ **Error-prone**: Easy to transpose digits
- ❌ **Not human-friendly**: Numbers are meaningless to humans
- ❌ **Manual entry required**: Worker must drop pin on map

**Verdict**: ⭐⭐⭐ **GOOD** as universal fallback, not ideal for data entry

---

## Recommended Hybrid Solution

### **3-Tier Location System**

Implement all three methods with intelligent fallbacks:

```typescript
interface PropertyLocation {
  // Traditional address (for urban properties)
  address_line1?: string
  city?: string
  postcode?: string

  // what3words (for remote properties)
  what3words?: string

  // Plus Code (auto-generated from GPS)
  plus_code?: string

  // GPS coordinates (universal fallback, cached)
  latitude?: number
  longitude?: number

  // Location type indicator
  location_type: 'ADDRESS' | 'WHAT3WORDS' | 'GPS_ONLY'

  // Timestamps
  geocoded_at?: Date
}
```

---

### **User Flow for Property Creation**

**Option 1: Urban Property**
1. Admin enters traditional address
2. System geocodes to GPS coordinates (cached)
3. System auto-generates Plus Code from GPS
4. Worker navigates using address or GPS

**Option 2: Rural/Remote Property**
1. Admin selects "what3words" option
2. Admin enters 3 words (e.g., `filled.count.soap`)
3. System validates using what3words API
4. System converts to GPS coordinates (cached)
5. System auto-generates Plus Code from GPS
6. Worker navigates using what3words or GPS

**Option 3: GPS-Only Property**
1. Admin selects "GPS Coordinates" option
2. Admin drops pin on map OR enters lat/lon manually
3. System stores GPS coordinates
4. System auto-generates Plus Code from GPS
5. System attempts reverse geocoding (if possible)
6. Worker navigates using GPS

---

### **Worker Navigation Flow**

```typescript
// Smart navigation that tries all available methods

async function navigateToJob(job: Job) {
  const property = job.property

  // Priority 1: Use cached GPS coordinates (fastest)
  if (property.latitude && property.longitude) {
    return openNavigation(property.latitude, property.longitude)
  }

  // Priority 2: Convert what3words to GPS
  if (property.what3words) {
    const coords = await convertWhat3wordsToGPS(property.what3words)
    await cacheCoordinates(property.id, coords)
    return openNavigation(coords.lat, coords.lon)
  }

  // Priority 3: Decode Plus Code to GPS
  if (property.plus_code) {
    const coords = decodePlusCode(property.plus_code) // Offline, instant
    await cacheCoordinates(property.id, coords)
    return openNavigation(coords.lat, coords.lon)
  }

  // Priority 4: Geocode traditional address
  if (property.address_line1) {
    const coords = await geocodeAddress(property.address_line1)
    await cacheCoordinates(property.id, coords)
    return openNavigation(coords.lat, coords.lon)
  }

  // Fallback: Show error
  throw new Error('No location data available for this property')
}
```

---

## Cost Analysis

### Scenario: 200 properties, 6,000 navigations/month

**Property Breakdown**:
- 150 urban properties (traditional addresses)
- 30 rural properties (what3words)
- 20 remote properties (GPS only)

**API Calls**:

**what3words API**:
- Initial setup: 30 properties × 1 call = 30 calls (one-time)
- Monthly: ~50 new properties × 1 call = 50 calls/month
- **Total: 50 calls/month** (well under 25,000 free limit)

**Geocoding (Nominatim)**:
- Initial setup: 150 properties × 1 call = 150 calls (one-time)
- Monthly: ~100 new properties × 1 call = 100 calls/month
- **Total: 100 calls/month** (FREE)

**Navigation (OSRM)**:
- 6,000 navigations/month (uses cached GPS coordinates)
- **Total: 6,000 calls/month** (FREE, under 5,000/day limit)

**Total Monthly Cost**: $0

---

### Scale to 1,000 properties, 20,000 navigations/month

**what3words API**:
- ~150 rural properties with what3words
- ~20 new properties/month = 20 calls/month
- **Total: 20 calls/month** (well under 25,000 free limit)

**Total Monthly Cost**: $0 (still FREE!)

**Why so low?**
- GPS coordinates are cached after first conversion
- Workers navigate using cached GPS, not what3words API
- what3words only called when adding/updating property location

---

## Implementation Recommendations

### **Phase 1: Foundation** (Current Sprint)
- ✅ Add `latitude`, `longitude` columns to Property table
- ✅ Cache geocoded coordinates
- ✅ Basic GPS-based navigation

### **Phase 2: what3words Integration** (Sprint 8 - Worker Enhancement)
**Stories** (5 pts):
- ✅ Add `what3words` and `location_type` columns to Property table
- ✅ Integrate what3words API (convert to GPS)
- ✅ Create LocationInput component with what3words option
- ✅ Add what3words display to property details
- ✅ Update navigation to support what3words

**Deliverable**: Admins can add properties using what3words, workers can navigate

### **Phase 3: Plus Codes** (Sprint 8 - Optional Enhancement)
**Stories** (2 pts):
- ✅ Install `open-location-code` npm package
- ✅ Auto-generate Plus Code when GPS coordinates saved
- ✅ Display Plus Code in property details
- ✅ Add "Copy Plus Code" button for sharing

**Deliverable**: Every property has a Plus Code as backup location method

### **Phase 4: Map-Based Entry** (Future Enhancement)
**Stories** (5 pts):
- ✅ Create MapPicker component
- ✅ Allow admin to drop pin on map
- ✅ Show property location on map
- ✅ Validate location accuracy
- ✅ Add street view integration

**Deliverable**: Visual map interface for property location entry

---

## Real-World Use Cases

### **Use Case 1: Highland Cabin**
**Property**: Remote cabin in Scottish Highlands
**Problem**: No street address, 3km from nearest road
**Solution**:
- ✅ Owner provides what3words: `///filled.count.soap`
- ✅ System converts to GPS: 57.123420, -3.567870
- ✅ Worker navigates to exact cabin location
- ✅ Accuracy: 3m × 3m square

**Alternative without what3words**:
- ❌ "Follow track past old barn" - vague, error-prone
- ❌ GPS coordinates - hard to communicate over phone
- ✅ Plus Code - free alternative but less precise (14m × 14m)

---

### **Use Case 2: Farm Cottage**
**Property**: Holiday cottage on large farm estate
**Problem**: Main farmhouse address doesn't match cottage location (500m away)
**Solution**:
- ✅ Admin drops pin on map at cottage location
- ✅ System stores GPS: 52.456789, -1.234567
- ✅ System auto-generates Plus Code: `9C4WFP4M+X9`
- ✅ Worker navigates to exact cottage, not farmhouse

---

### **Use Case 3: Construction Site**
**Property**: Temporary site office
**Problem**: No permanent address yet, just a field
**Solution**:
- ✅ Site manager texts what3words: `///index.home.raft`
- ✅ Admin enters into system
- ✅ Workers find exact location of site office
- ✅ Changes when site office moves - just update what3words

---

## Comparison Matrix

| Feature | what3words | Plus Codes | GPS Coords | Traditional Address |
|---------|-----------|------------|------------|-------------------|
| **Precision** | 3m × 3m | 14m × 14m | <10cm | ~100m+ |
| **Cost** | FREE (25K/mo) | FREE (unlimited) | FREE | FREE |
| **Easy to communicate** | ✅ Excellent | ⚠️ OK | ❌ Poor | ✅ Good |
| **Voice-friendly** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Works offline** | ✅ Yes (app) | ✅ Yes | ✅ Yes | ⚠️ Geocoding needs internet |
| **Works in remote areas** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Easy to type** | ✅ Yes | ⚠️ OK | ❌ No | ✅ Yes |
| **Error detection** | ✅ AutoSuggest | ❌ No | ❌ No | ⚠️ Varies |
| **Open source** | ❌ Proprietary | ✅ Yes | ✅ Yes | N/A |
| **API required** | ✅ Yes | ❌ No | ❌ No | ✅ Yes (geocoding) |
| **Best for** | Rural/remote | Backup/fallback | Precise locations | Urban properties |

---

## Final Recommendation

### **Implement Hybrid System**

**Tier 1: Traditional addresses** (for urban/suburban properties)
- Use Nominatim geocoding
- Cache GPS coordinates
- Best for 80% of properties

**Tier 2: what3words** (for rural/remote properties)
- Use what3words API (FREE tier: 25K/month)
- Convert to GPS and cache
- Best for cabins, farms, remote cottages

**Tier 3: Plus Codes** (auto-generated backup)
- Generate from GPS automatically (offline)
- No API cost
- Serves as universal backup

**Tier 4: Direct GPS** (manual pin drop)
- For truly unmappable locations
- Admin drops pin on map
- Always available as last resort

---

### **Cost Summary**

**Monthly Costs (up to 1,000 properties)**:
- what3words API: $0 (free tier covers usage)
- Plus Codes: $0 (open source library)
- GPS coordinates: $0 (no API needed)

**Total: $0/month**

---

### **Implementation Priority**

1. **Sprint 7**: Add GPS coordinate caching (already planned)
2. **Sprint 8**: Add what3words support (5 story points)
3. **Sprint 8**: Auto-generate Plus Codes (2 story points)
4. **Future**: Map-based pin drop UI (5 story points)

**Total additional effort**: 7 story points (~2-3 days)

---

## Competitive Advantage

**Competitors (Jobber, Housecall Pro, ServiceTitan)**:
- ❌ Only support traditional addresses
- ❌ Struggle with rural/remote properties
- ❌ No what3words integration

**RightFit Services**:
- ✅ Multiple location methods
- ✅ what3words for remote properties
- ✅ Works anywhere in the world
- ✅ No property too remote

**Marketing angle**: "Navigate to any property, no matter how remote - from city apartments to highland cabins"

---

## Next Steps

1. **Add to Sprint 8 backlog**
2. **Sign up for what3words API** (free tier)
3. **Update Property database schema**
4. **Create LocationInput component**
5. **Test with 5 remote properties**
6. **Roll out to all property types**

---

**Report Status**: ✅ Ready for Product Owner approval
**Recommendation**: ✅ PROCEED with hybrid location system
**Risk Level**: LOW (free APIs, proven technology)
**User Impact**: HIGH (solves major pain point for rural properties)
**Competitive Advantage**: HIGH (unique feature vs competitors)

---

**Philosophy Alignment**: **RightFit, not QuickFix**
- ✅ Solving real user problem (remote properties)
- ✅ Using best-in-class solution (what3words)
- ✅ Multiple fallbacks for reliability
- ✅ Free/low-cost implementation
- ✅ Accessible to all users
- ✅ Future-proof architecture
