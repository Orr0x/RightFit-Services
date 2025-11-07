# Test Data Seeding Scripts

Scripts to populate the database with test data for mobile app testing after STORY-003 migration.

---

## Prerequisites

1. API server running on `http://localhost:3001`
2. Valid JWT token from login
3. `curl` and `jq` installed (for bash scripts)

---

## Get JWT Token

```bash
# Login and save token
export TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jamesrobins9@gmail.com",
    "password": "Password123!"
  }' | jq -r '.accessToken')

echo "Token saved: $TOKEN"
```

---

## Seed Properties

### Create 5 Test Properties

```bash
#!/bin/bash
# seed-properties.sh

TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "Usage: ./seed-properties.sh <jwt_token>"
  exit 1
fi

echo "Creating 5 test properties..."

# Property 1: House
curl -s -X POST http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Riverside House",
    "address_line1": "123 Thames Street",
    "city": "London",
    "postcode": "SE1 9PL",
    "property_type": "HOUSE",
    "bedrooms": 4,
    "bathrooms": 3,
    "access_instructions": "Gate code: 1234. Parking in driveway."
  }' | jq -r '.id' > /tmp/property1_id.txt

echo "✅ Created: Riverside House"

# Property 2: Apartment
curl -s -X POST http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City View Apartment",
    "address_line1": "45 High Street",
    "address_line2": "Flat 3B",
    "city": "Manchester",
    "postcode": "M1 4AA",
    "property_type": "APARTMENT",
    "bedrooms": 2,
    "bathrooms": 1,
    "access_instructions": "Intercom code: 3B. Lift to 3rd floor."
  }' | jq -r '.id' > /tmp/property2_id.txt

echo "✅ Created: City View Apartment"

# Property 3: Studio
curl -s -X POST http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Modern Studio",
    "address_line1": "78 Station Road",
    "city": "Birmingham",
    "postcode": "B5 4AA",
    "property_type": "STUDIO",
    "bedrooms": 1,
    "bathrooms": 1,
    "access_instructions": "Key collection from reception."
  }' | jq -r '.id' > /tmp/property3_id.txt

echo "✅ Created: Modern Studio"

# Property 4: Townhouse
curl -s -X POST http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Victorian Townhouse",
    "address_line1": "234 Park Lane",
    "city": "Edinburgh",
    "postcode": "EH1 1AA",
    "property_type": "HOUSE",
    "bedrooms": 5,
    "bathrooms": 3,
    "access_instructions": "Smart lock code will be sent via SMS."
  }' | jq -r '.id' > /tmp/property4_id.txt

echo "✅ Created: Victorian Townhouse"

# Property 5: Bungalow
curl -s -X POST http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seaside Bungalow",
    "address_line1": "12 Coastal Drive",
    "city": "Brighton",
    "postcode": "BN2 5AA",
    "property_type": "BUNGALOW",
    "bedrooms": 3,
    "bathrooms": 2,
    "access_instructions": "Key under flowerpot by front door."
  }' | jq -r '.id' > /tmp/property5_id.txt

echo "✅ Created: Seaside Bungalow"

echo ""
echo "🎉 Successfully created 5 properties!"
echo "Property IDs saved to /tmp/property*_id.txt"
```

---

## Seed Work Orders

### Create 10 Test Work Orders

```bash
#!/bin/bash
# seed-work-orders.sh

TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "Usage: ./seed-work-orders.sh <jwt_token>"
  exit 1
fi

# Read property IDs
PROP1=$(cat /tmp/property1_id.txt)
PROP2=$(cat /tmp/property2_id.txt)
PROP3=$(cat /tmp/property3_id.txt)

echo "Creating work orders..."

# Work Order 1: HIGH priority OPEN
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Burst pipe in kitchen\",
    \"description\": \"Water leaking from pipe under sink. Urgent repair needed.\",
    \"property_id\": \"$PROP1\",
    \"priority\": \"HIGH\",
    \"category\": \"PLUMBING\",
    \"status\": \"OPEN\",
    \"estimated_cost\": 250.00
  }" > /dev/null

echo "✅ HIGH: Burst pipe in kitchen"

# Work Order 2: MEDIUM priority IN_PROGRESS
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Repaint bedroom walls\",
    \"description\": \"Repaint master bedroom in white. Two coats required.\",
    \"property_id\": \"$PROP1\",
    \"priority\": \"MEDIUM\",
    \"category\": \"MAINTENANCE\",
    \"status\": \"IN_PROGRESS\",
    \"estimated_cost\": 400.00
  }" > /dev/null

echo "✅ MEDIUM: Repaint bedroom walls"

# Work Order 3: LOW priority COMPLETED
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Replace light bulbs\",
    \"description\": \"Replace all LED bulbs in living room.\",
    \"property_id\": \"$PROP2\",
    \"priority\": \"LOW\",
    \"category\": \"ELECTRICAL\",
    \"status\": \"COMPLETED\",
    \"estimated_cost\": 50.00,
    \"actual_cost\": 45.00
  }" > /dev/null

echo "✅ LOW: Replace light bulbs"

# Work Order 4: HIGH priority OPEN
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Boiler not heating\",
    \"description\": \"Central heating not working. Boiler making strange noises.\",
    \"property_id\": \"$PROP2\",
    \"priority\": \"HIGH\",
    \"category\": \"HEATING\",
    \"status\": \"OPEN\",
    \"estimated_cost\": 350.00
  }" > /dev/null

echo "✅ HIGH: Boiler not heating"

# Work Order 5: MEDIUM priority ASSIGNED
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Garden maintenance\",
    \"description\": \"Mow lawn, trim hedges, weed flower beds.\",
    \"property_id\": \"$PROP3\",
    \"priority\": \"MEDIUM\",
    \"category\": \"MAINTENANCE\",
    \"status\": \"ASSIGNED\",
    \"estimated_cost\": 150.00
  }" > /dev/null

echo "✅ MEDIUM: Garden maintenance"

# Work Order 6: LOW priority OPEN
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Clean gutters\",
    \"description\": \"Remove leaves and debris from roof gutters.\",
    \"property_id\": \"$PROP3\",
    \"priority\": \"LOW\",
    \"category\": \"MAINTENANCE\",
    \"status\": \"OPEN\",
    \"estimated_cost\": 80.00
  }" > /dev/null

echo "✅ LOW: Clean gutters"

# Work Order 7: HIGH priority IN_PROGRESS
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Fix broken window\",
    \"description\": \"Replace cracked double-glazed window in bedroom.\",
    \"property_id\": \"$PROP1\",
    \"priority\": \"HIGH\",
    \"category\": \"GLAZING\",
    \"status\": \"IN_PROGRESS\",
    \"estimated_cost\": 500.00
  }" > /dev/null

echo "✅ HIGH: Fix broken window"

# Work Order 8: MEDIUM priority COMPLETED
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Service boiler\",
    \"description\": \"Annual boiler service and safety check.\",
    \"property_id\": \"$PROP2\",
    \"priority\": \"MEDIUM\",
    \"category\": \"HEATING\",
    \"status\": \"COMPLETED\",
    \"estimated_cost\": 120.00,
    \"actual_cost\": 120.00
  }" > /dev/null

echo "✅ MEDIUM: Service boiler"

# Work Order 9: LOW priority OPEN
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Paint front door\",
    \"description\": \"Repaint front door in black. Weatherproof paint.\",
    \"property_id\": \"$PROP3\",
    \"priority\": \"LOW\",
    \"category\": \"MAINTENANCE\",
    \"status\": \"OPEN\",
    \"estimated_cost\": 100.00
  }" > /dev/null

echo "✅ LOW: Paint front door"

# Work Order 10: HIGH priority CANCELLED
curl -s -X POST http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Install new carpet\",
    \"description\": \"Remove old carpet and install new carpet in living room.\",
    \"property_id\": \"$PROP1\",
    \"priority\": \"HIGH\",
    \"category\": \"MAINTENANCE\",
    \"status\": \"CANCELLED\",
    \"estimated_cost\": 800.00
  }" > /dev/null

echo "✅ HIGH: Install new carpet (CANCELLED)"

echo ""
echo "🎉 Successfully created 10 work orders!"
echo "Covers all status types: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED"
echo "Covers all priority levels: HIGH, MEDIUM, LOW"
```

---

## One-Command Seed Everything

### Complete Seed Script

```bash
#!/bin/bash
# seed-all-data.sh

echo "🌱 Seeding test data for RightFit Services..."
echo ""

# Step 1: Login and get token
echo "Step 1: Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jamesrobins9@gmail.com",
    "password": "Password123!"
  }' | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Check credentials and API server."
  exit 1
fi

echo "✅ Login successful"
echo ""

# Step 2: Seed properties
echo "Step 2: Creating properties..."
bash seed-properties.sh "$TOKEN"
echo ""

# Step 3: Seed work orders
echo "Step 3: Creating work orders..."
bash seed-work-orders.sh "$TOKEN"
echo ""

echo "🎉 All test data created successfully!"
echo ""
echo "You can now test the mobile app with:"
echo "  - 5 Properties (House, Apartment, Studio, Townhouse, Bungalow)"
echo "  - 10 Work Orders (all statuses and priorities)"
echo ""
echo "Open the mobile app and refresh to see the data!"
```

---

## Make Scripts Executable

```bash
cd ~/projects/RightFit-Services/Mobile-DEV-Settup

# Make scripts executable
chmod +x seed-properties.sh
chmod +x seed-work-orders.sh
chmod +x seed-all-data.sh
```

---

## Usage

### Option 1: Seed Everything at Once
```bash
cd ~/projects/RightFit-Services/Mobile-DEV-Settup
./seed-all-data.sh
```

### Option 2: Seed Step-by-Step
```bash
# 1. Get token
export TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jamesrobins9@gmail.com",
    "password": "Password123!"
  }' | jq -r '.accessToken')

# 2. Seed properties
./seed-properties.sh "$TOKEN"

# 3. Seed work orders
./seed-work-orders.sh "$TOKEN"
```

---

## Verify Seeded Data

### Check Properties
```bash
curl http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Check Work Orders
```bash
curl http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### View in Prisma Studio
```bash
cd ~/projects/RightFit-Services/packages/database
pnpx prisma studio

# Opens at http://localhost:5555
# Browse Properties and WorkOrders tables
```

---

## Clean Up Test Data

### Delete All Properties
```bash
# Get all property IDs and delete them
curl -s http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.[].id' | \
  while read id; do
    curl -X DELETE "http://localhost:3001/api/properties/$id" \
      -H "Authorization: Bearer $TOKEN"
    echo "Deleted property: $id"
  done
```

### Reset Database Completely
```bash
cd ~/projects/RightFit-Services/apps/api
pnpm prisma migrate reset --skip-seed

# This will:
# - Drop all tables
# - Recreate schema
# - Run migrations
# - You'll need to re-register the test user
```

---

## Testing with Mobile App

After seeding data:

1. **Open mobile app** on device
2. **Login** with test credentials
3. **Navigate to Properties** → Should show 5 properties
4. **Navigate to Work Orders** → Should show 10 work orders
5. **Test the new UI:**
   - Custom Card components
   - Design token colors
   - Status badges (blue, yellow, green, gray)
   - Priority badges (red, yellow, green)
   - Loading spinners
   - Empty states (delete all to see)

---

**Created:** 2025-10-31
**Related:** STORY-003, API_TESTING_GUIDE.md
