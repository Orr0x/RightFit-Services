#!/bin/bash
# seed-properties.sh - Create 5 test properties

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
