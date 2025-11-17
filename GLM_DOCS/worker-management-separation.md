# Worker Management Separation

## Overview
This document outlines the strategy for separating worker/contractor data between cleaning and maintenance services, ensuring workers are properly categorized and can be managed independently by each service while maintaining data integrity.

## Current Worker Data Analysis

### Existing Contractor Model
```sql
model Contractor {
  id           String      @id @default(uuid())
  tenant_id    String
  user_id      String?     @unique
  name         String      @db.VarChar(100)
  trade        String      @db.VarChar(50)  -- Key field for categorization
  company_name String?     @db.VarChar(100)
  phone        String      @db.VarChar(20)
  email        String?     @db.VarChar(255)
  notes        String?     @db.VarChar(500)
  sms_opt_out  Boolean     @default(false)
  created_at   DateTime    @default(now())
  updated_at   DateTime    @updatedAt
  deleted_at   DateTime?
}
```

### Key Findings
1. **Trade Field**: The `trade` field is the primary indicator of worker specialization
2. **User Link**: Contractors can be linked to Users with role 'CONTRACTOR'
3. **Work Orders**: Contractors are assigned to Work Orders with different categories
4. **No Service Type**: No explicit service type classification exists

## Worker Categorization Strategy

### Trade-Based Classification
Based on existing WorkOrder categories and typical trade classifications:

#### Cleaning Trades
- `CLEANER`
- `JANITORIAL`
- `HOUSEKEEPING`
- `COMMERCIAL_CLEANING`

#### Maintenance Trades
- `PLUMBING`
- `ELECTRICAL`
- `HEATING`
- `APPLIANCES`
- `EXTERIOR`
- `INTERIOR`
- `GENERAL_MAINTENANCE`
- `HANDYMAN`

#### Dual-Service Trades
- `GENERAL_CONTRACTOR`
- `PROPERTY_MANAGEMENT`
- `FACILITY_MANAGEMENT`

### Enhanced Contractor Schema

#### Shared Authentication Database
```sql
-- Shared contractor profiles for authentication
CREATE TABLE shared_contractor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_contractor_id UUID UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  company_name VARCHAR(100),
  sms_opt_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker service type assignments
CREATE TABLE contractor_service_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_profile_id UUID NOT NULL REFERENCES shared_contractor_profiles(id),
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('CLEANING', 'MAINTENANCE')),
  trade VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contractor_profile_id, service_type)
);
```

#### Cleaning Service Database
```sql
CREATE TABLE cleaning_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_profile_id UUID NOT NULL REFERENCES shared_contractor_profiles(id),
  tenant_id UUID NOT NULL,
  user_id UUID UNIQUE,
  trade VARCHAR(50) NOT NULL,
  skills TEXT[], -- Cleaning-specific skills
  experience_years INTEGER DEFAULT 0,
  certification_level VARCHAR(20) DEFAULT 'BASIC',
  availability_schedule JSONB, -- Weekly availability
  preferred_property_types TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  INDEX idx_cleaning_contractors_tenant (tenant_id),
  INDEX idx_cleaning_contractors_trade (trade),
  INDEX idx_cleaning_contractors_profile (contractor_profile_id)
);

-- Cleaning-specific certifications
CREATE TABLE cleaning_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES cleaning_contractors(id),
  certification_name VARCHAR(100) NOT NULL,
  certification_type VARCHAR(50) NOT NULL,
  issued_by VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cleaning performance metrics
CREATE TABLE cleaning_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES cleaning_contractors(id),
  job_id UUID NOT NULL,
  property_id UUID NOT NULL,
  completion_time_minutes INTEGER,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  notes TEXT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_cleaning_performance_contractor (contractor_id),
  INDEX idx_cleaning_performance_date (completed_at)
);
```

#### Maintenance Service Database
```sql
CREATE TABLE maintenance_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_profile_id UUID NOT NULL REFERENCES shared_contractor_profiles(id),
  tenant_id UUID NOT NULL,
  user_id UUID UNIQUE,
  trade VARCHAR(50) NOT NULL,
  specializations TEXT[], -- Technical specializations
  license_number VARCHAR(100),
  license_expiry DATE,
  insurance_provider VARCHAR(100),
  insurance_policy_number VARCHAR(100),
  insurance_expiry DATE,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  is_available_emergency BOOLEAN DEFAULT false,
  service_radius_km INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  INDEX idx_maintenance_contractors_tenant (tenant_id),
  INDEX idx_maintenance_contractors_trade (trade),
  INDEX idx_maintenance_contractors_license (license_number),
  INDEX idx_maintenance_contractors_profile (contractor_profile_id)
);

-- Technical certifications
CREATE TABLE maintenance_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES maintenance_contractors(id),
  certification_name VARCHAR(100) NOT NULL,
  certification_type VARCHAR(50) NOT NULL,
  license_number VARCHAR(100),
  issued_by VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills and qualifications
CREATE TABLE maintenance_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES maintenance_contractors(id),
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50) NOT NULL,
  proficiency_level VARCHAR(20) DEFAULT 'INTERMEDIATE',
  years_experience INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verification_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(contractor_id, skill_name)
);

-- Work order performance
CREATE TABLE maintenance_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES maintenance_contractors(id),
  work_order_id UUID NOT NULL,
  completion_time_hours DECIMAL(5,2),
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  on_time_completion BOOLEAN DEFAULT true,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  cost_efficiency_score DECIMAL(3,2),
  notes TEXT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_maintenance_performance_contractor (contractor_id),
  INDEX idx_maintenance_performance_date (completed_at)
);
```

## Worker Migration Logic

### Categorization Algorithm
```sql
CREATE OR REPLACE FUNCTION categorize_contractor_service(
  trade_in VARCHAR,
  work_order_categories TEXT[]
) RETURNS TABLE(service_type VARCHAR, contractor_type VARCHAR) AS $$
BEGIN
  -- Pure cleaning trades
  IF trade_in IN ('CLEANER', 'JANITORIAL', 'HOUSEKEEPING', 'COMMERCIAL_CLEANING') THEN
    RETURN VALUES ('CLEANING', 'CLEANING_ONLY');

  -- Pure maintenance trades
  ELSIF trade_in IN ('PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'HANDYMAN') THEN
    RETURN VALUES ('MAINTENANCE', 'MAINTENANCE_ONLY');

  -- Mixed or ambiguous trades - analyze work order history
  ELSE
    IF work_order_categories && ARRAY['PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES'] THEN
      RETURN VALUES ('MAINTENANCE', 'MAINTENANCE_ONLY');
    ELSIF work_order_categories && ARRAY['INTERIOR'] AND
          NOT (work_order_categories && ARRAY['PLUMBING', 'ELECTRICAL']) THEN
      RETURN VALUES ('CLEANING', 'CLEANING_ONLY');
    ELSE
      -- Default to maintenance for ambiguous cases
      RETURN VALUES ('MAINTENANCE', 'MAINTENANCE_PRIMARY');
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Dual-Service Worker Handling
For workers who can perform both cleaning and maintenance:

1. **Primary Service Assignment**: Determine based on trade and work order history
2. **Secondary Service Access**: Grant limited access to secondary service
3. **Cross-Service Scheduling**: Allow scheduling in both services with conflict detection
4. **Separate Performance Tracking**: Track performance metrics independently

## Separation Implementation

### Phase 1: Worker Analysis
```sql
-- Analyze current contractor distribution
SELECT
  trade,
  COUNT(*) as contractor_count,
  ARRAY_AGG(DISTINCT wo.category) as work_order_categories
FROM contractors c
LEFT JOIN work_orders wo ON c.id = wo.contractor_id
WHERE c.deleted_at IS NULL
GROUP BY trade
ORDER BY contractor_count DESC;
```

### Phase 2: Service Assignment
```sql
-- Create service assignments based on trade and work order history
INSERT INTO contractor_service_assignments (contractor_profile_id, service_type, trade, is_primary)
WITH contractor_analysis AS (
  SELECT
    c.id as contractor_id,
    c.trade,
    ARRAY_AGG(DISTINCT wo.category) FILTER (WHERE wo.category IS NOT NULL) as categories,
    COUNT(wo.id) as total_work_orders
  FROM contractors c
  LEFT JOIN work_orders wo ON c.id = wo.contractor_id AND wo.deleted_at IS NULL
  WHERE c.deleted_at IS NULL
  GROUP BY c.id, c.trade
)
SELECT
  scp.id,
  (csa.service_type)::VARCHAR,
  ca.trade::VARCHAR,
  true
FROM contractor_profiles ca
JOIN shared_contractor_profiles scp ON scp.original_contractor_id = ca.contractor_id
JOIN LATERAL categorize_contractor_service(ca.trade, ca.categories) csa(service_type, contractor_type) ON true;
```

### Phase 3: Data Migration
```sql
-- Migrate to cleaning service
INSERT INTO cleaning_contractors (
  contractor_profile_id, tenant_id, user_id, trade,
  experience_years, availability_schedule
)
SELECT
  csa.contractor_profile_id,
  c.tenant_id,
  c.user_id,
  c.trade,
  CASE
    WHEN c.created_at < CURRENT_DATE - INTERVAL '2 years' THEN 2
    WHEN c.created_at < CURRENT_DATE - INTERVAL '1 year' THEN 1
    ELSE 0
  END as experience_years,
  '{"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"]}'::JSONB
FROM contractors c
JOIN contractor_service_assignments csa ON csa.contractor_profile_id = (
  SELECT scp.id FROM shared_contractor_profiles scp WHERE scp.original_contractor_id = c.id
)
WHERE csa.service_type = 'CLEANING';

-- Migrate to maintenance service
INSERT INTO maintenance_contractors (
  contractor_profile_id, tenant_id, user_id, trade,
  experience_years, hourly_rate, service_radius_km
)
SELECT
  csa.contractor_profile_id,
  c.tenant_id,
  c.user_id,
  c.trade,
  CASE
    WHEN c.created_at < CURRENT_DATE - INTERVAL '5 years' THEN 5
    WHEN c.created_at < CURRENT_DATE - INTERVAL '2 years' THEN 3
    ELSE 1
  END as experience_years,
  CASE
    WHEN c.trade IN ('PLUMBING', 'ELECTRICAL') THEN 75.00
    WHEN c.trade IN ('HEATING', 'APPLIANCES') THEN 65.00
    ELSE 45.00
  END as hourly_rate,
  50 as service_radius_km
FROM contractors c
JOIN contractor_service_assignments csa ON csa.contractor_profile_id = (
  SELECT scp.id FROM shared_contractor_profiles scp WHERE scp.original_contractor_id = c.id
)
WHERE csa.service_type = 'MAINTENANCE';
```

## API Integration

### Cleaning Service Worker Endpoints
```typescript
// GET /api/cleaning/contractors
// POST /api/cleaning/contractors
// GET /api/cleaning/contractors/:id
// PUT /api/cleaning/contractors/:id
// DELETE /api/cleaning/contractors/:id
// GET /api/cleaning/contractors/:id/performance
// GET /api/cleaning/contractors/:id/availability
// POST /api/cleaning/contractors/:id/certifications
```

### Maintenance Service Worker Endpoints
```typescript
// GET /api/maintenance/contractors
// POST /api/maintenance/contractors
// GET /api/maintenance/contractors/:id
// PUT /api/maintenance/contractors/:id
// DELETE /api/maintenance/contractors/:id
// GET /api/maintenance/contractors/:id/performance
// GET /api/maintenance/contractors/:id/skills
// POST /api/maintenance/contractors/:id/certifications
```

### Shared Worker Service Endpoints
```typescript
// GET /api/shared/workers/profiles
// GET /api/shared/workers/profiles/:id
// PUT /api/shared/workers/profiles/:id
// GET /api/shared/workers/:id/service-assignments
// POST /api/shared/workers/:id/service-assignments
```

## Benefits

### For Cleaning Service
- Specialized worker management with cleaning-specific skills
- Performance tracking for cleaning quality metrics
- Certification management for cleaning standards
- Availability scheduling for cleaning routes

### For Maintenance Service
- Trade-specific licensing and insurance tracking
- Technical skill management and verification
- Emergency availability and service radius management
- Performance metrics for technical work quality

### For Workers
- Clear specialization profiles
- Service-specific performance tracking
- Appropriate certification and licensing management
- Flexible cross-service opportunities

## Risk Mitigation

### Data Integrity
- Comprehensive validation before migration
- Referential integrity maintained across databases
- Rollback procedures for each migration phase

### Service Continuity
- Workers maintain access to appropriate service interfaces
- Scheduling continuity during transition
- Performance history preservation

### Cross-Service Coordination
- Conflict detection for dual-service workers
- Shared authentication prevents duplicate profiles
- Consistent worker data across services

## Next Steps

1. **Execute Migration Scripts**: Run worker separation migration
2. **Update API Endpoints**: Implement service-specific contractor endpoints
3. **Update Frontend Interfaces**: Modify contractor management UIs
4. **Testing**: Comprehensive testing of worker separation
5. **Training**: Train staff on separated worker management systems