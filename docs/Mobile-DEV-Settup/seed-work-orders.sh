#!/bin/bash
# seed-work-orders.sh - Create 10 test work orders

TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "Usage: ./seed-work-orders.sh <jwt_token>"
  exit 1
fi

# Read property IDs
PROP1=$(cat /tmp/property1_id.txt)
PROP2=$(cat /tmp/property2_id.txt)
PROP3=$(cat /tmp/property3_id.txt)

echo "Creating 10 work orders for testing..."

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
echo "Covers all statuses: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED"
echo "Covers all priorities: HIGH, MEDIUM, LOW"
