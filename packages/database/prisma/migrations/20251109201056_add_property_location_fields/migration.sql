-- Add GPS coordinates and location fields to properties table (WGS84 standard)
ALTER TABLE "properties" ADD COLUMN "latitude" DECIMAL(10, 8);
ALTER TABLE "properties" ADD COLUMN "longitude" DECIMAL(11, 8);

-- Add what3words address for remote locations
ALTER TABLE "properties" ADD COLUMN "what3words" VARCHAR(50);

-- Add Plus Code (Open Location Code) as free backup
ALTER TABLE "properties" ADD COLUMN "plus_code" VARCHAR(20);

-- Track location type for UI hints
ALTER TABLE "properties" ADD COLUMN "location_type" VARCHAR(20) NOT NULL DEFAULT 'ADDRESS';

-- Track when coordinates were last geocoded
ALTER TABLE "properties" ADD COLUMN "geocoded_at" TIMESTAMP(3);

-- Create index for geospatial queries
CREATE INDEX "properties_latitude_longitude_idx" ON "properties" ("latitude", "longitude")
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- Create index for location type filtering
CREATE INDEX "properties_location_type_idx" ON "properties" ("location_type");

-- Add GPS coordinates and location fields to customer_properties table (WGS84 standard)
ALTER TABLE "customer_properties" ADD COLUMN "latitude" DECIMAL(10, 8);
ALTER TABLE "customer_properties" ADD COLUMN "longitude" DECIMAL(11, 8);

-- Add what3words address for remote locations
ALTER TABLE "customer_properties" ADD COLUMN "what3words" VARCHAR(50);

-- Add Plus Code (Open Location Code) as free backup
ALTER TABLE "customer_properties" ADD COLUMN "plus_code" VARCHAR(20);

-- Track location type for UI hints
ALTER TABLE "customer_properties" ADD COLUMN "location_type" VARCHAR(20) NOT NULL DEFAULT 'ADDRESS';

-- Track when coordinates were last geocoded
ALTER TABLE "customer_properties" ADD COLUMN "geocoded_at" TIMESTAMP(3);

-- Create index for geospatial queries
CREATE INDEX "customer_properties_latitude_longitude_idx" ON "customer_properties" ("latitude", "longitude")
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- Create index for location type filtering
CREATE INDEX "customer_properties_location_type_idx" ON "customer_properties" ("location_type");
