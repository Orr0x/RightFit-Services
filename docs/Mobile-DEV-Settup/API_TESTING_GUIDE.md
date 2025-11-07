# API Testing Guide for Mobile Development

## Quick Start

### Prerequisites
- ✅ API server running on `http://localhost:3001`
- ✅ PostgreSQL database running on port 5433
- ✅ WSL IP address: `192.168.0.17`
- ✅ Mobile app configured to connect to `http://192.168.0.17:3001`

### Test Credentials
```
Email: jamesrobins9@gmail.com
Password: Password123!
```

---

## API Health Check

```bash
# Check if API is running
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-31T21:52:26.685Z","environment":"development"}
```

---

## Testing Endpoints

### 1. Authentication

#### Login (Get JWT Token)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jamesrobins9@gmail.com",
    "password": "Password123!"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "jamesrobins9@gmail.com",
    "name": "James Robins",
    "tenant_id": "..."
  },
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

**Save the token for subsequent requests:**
```bash
export TOKEN="your_access_token_here"
```

---

### 2. Properties

#### Get All Properties
```bash
curl http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN"
```

#### Create Property
```bash
curl -X POST http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Property from API",
    "address_line1": "123 Test Street",
    "city": "London",
    "postcode": "SW1A 1AA",
    "property_type": "HOUSE",
    "bedrooms": 3,
    "bathrooms": 2
  }'
```

#### Get Single Property
```bash
curl http://localhost:3001/api/properties/{propertyId} \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Property
```bash
curl -X PUT http://localhost:3001/api/properties/{propertyId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Property Name",
    "bedrooms": 4
  }'
```

#### Delete Property
```bash
curl -X DELETE http://localhost:3001/api/properties/{propertyId} \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Work Orders

#### Get All Work Orders
```bash
curl http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN"
```

#### Create Work Order
```bash
curl -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix leaking tap",
    "description": "Kitchen tap is dripping constantly",
    "property_id": "{propertyId}",
    "priority": "HIGH",
    "category": "PLUMBING",
    "status": "OPEN"
  }'
```

#### Update Work Order Status
```bash
curl -X PUT http://localhost:3001/api/work-orders/{workOrderId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

---

## Testing Migrated Mobile Screens

### Test Scenario 1: Properties List Screen
1. **Start mobile app** (on device or emulator)
2. **Login** with test credentials
3. **Navigate to Properties**
4. **Verify:**
   - Properties load from API
   - Cards use new design system (custom Card component)
   - Status colors match design tokens
   - Loading spinner shows while fetching
   - Empty state shows if no properties

### Test Scenario 2: Create Property Screen
1. **Tap "+ Add Property" button**
2. **Fill in form:**
   - Property Name: "API Test House"
   - Address: "456 API Test St"
   - City: "London"
   - Postcode: "EC1A 1BB"
   - Bedrooms: 3
   - Bathrooms: 2
3. **Tap "Create Property"**
4. **Verify:**
   - Form submits to API
   - Success toast appears
   - Redirects to Properties list
   - New property appears in list
   - API logs show POST request

### Test Scenario 3: Work Orders Screen
1. **Navigate to Work Orders**
2. **Verify:**
   - Work orders load
   - Status badges show correct colors:
     - OPEN: Blue (colors.info)
     - IN_PROGRESS: Primary (colors.primary)
     - COMPLETED: Green (colors.success)
   - Priority badges show correct colors:
     - HIGH: Red (colors.error)
     - MEDIUM: Yellow (colors.warning)
     - LOW: Green (colors.success)

### Test Scenario 4: Offline Mode
1. **Enable Airplane Mode** on device
2. **Create a property offline**
3. **Verify:**
   - Property saves locally (WatermelonDB)
   - "Pending sync" indicator shows
   - Property appears in list immediately
4. **Disable Airplane Mode**
5. **Verify:**
   - Auto-sync triggers
   - Property syncs to API
   - "Pending sync" indicator disappears

---

## API Monitoring

### View API Logs
```bash
# Real-time logs
tail -f apps/api/logs/combined.log

# Error logs only
tail -f apps/api/logs/error.log
```

### Check Database
```bash
# Using Prisma Studio
cd packages/database
pnpx prisma studio

# Opens at: http://localhost:5555
```

### Monitor Network Requests
```bash
# View mobile app network logs
adb logcat -s ReactNativeJS:V | grep "API_CLIENT"
```

---

## Troubleshooting

### Issue: API Returns 401 Unauthorized
**Solution:** Token expired. Login again to get new token.
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jamesrobins9@gmail.com", "password": "Password123!"}'
```

### Issue: Mobile App Can't Connect to API
**Solution:** Check WSL IP hasn't changed
```bash
# Get current WSL IP
ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1

# If changed from 192.168.0.17, update:
# apps/mobile/src/services/api.ts (line 8)
```

### Issue: CORS Errors
**Solution:** Add mobile app origin to API CORS config
```bash
# Edit apps/api/.env
ALLOWED_ORIGINS="http://localhost:3001,http://localhost:8081,http://192.168.0.17:8081"
```

### Issue: Database Connection Error
**Solution:** Ensure PostgreSQL is running
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# If not running, start it
docker start rightfit-postgres
```

---

## Test Data Seeding

See [SEED_TEST_DATA.md](./SEED_TEST_DATA.md) for scripts to populate the database with test data.

---

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (invalidate tokens)

### Properties Endpoints
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get single property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Work Orders Endpoints
- `GET /api/work-orders` - List all work orders
- `POST /api/work-orders` - Create work order
- `GET /api/work-orders/:id` - Get single work order
- `PUT /api/work-orders/:id` - Update work order
- `DELETE /api/work-orders/:id` - Delete work order
- `POST /api/work-orders/:id/photos` - Upload photos

### Contractors Endpoints
- `GET /api/contractors` - List contractors
- `POST /api/contractors` - Create contractor
- `GET /api/contractors/:id` - Get contractor
- `PUT /api/contractors/:id` - Update contractor
- `DELETE /api/contractors/:id` - Delete contractor

---

## Quick Reference Commands

```bash
# Start API server
cd ~/projects/RightFit-Services/apps/api
npm run dev

# Start mobile app
cd ~/projects/RightFit-Services/apps/mobile
npx expo start --port 8082

# View API logs
tail -f ~/projects/RightFit-Services/apps/api/logs/combined.log

# View mobile logs
adb logcat -s ReactNativeJS:V

# Database UI
cd ~/projects/RightFit-Services/packages/database
pnpx prisma studio
```

---

**Created:** 2025-10-31
**Last Updated:** 2025-10-31
**Related:** STORY-003 Mobile Screen Migration
