#!/bin/bash
# seed-all-data.sh - Complete test data seeding

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
bash "$(dirname "$0")/seed-properties.sh" "$TOKEN"
echo ""

# Step 3: Seed work orders
echo "Step 3: Creating work orders..."
bash "$(dirname "$0")/seed-work-orders.sh" "$TOKEN"
echo ""

echo "🎉 All test data created successfully!"
echo ""
echo "You can now test the mobile app with:"
echo "  - 5 Properties (House, Apartment, Studio, Townhouse, Bungalow)"
echo "  - 10 Work Orders (all statuses and priorities)"
echo ""
echo "Open the mobile app and refresh to see the data!"
