# Customer Data Separation Implementation

## Overview

This document outlines the strategy and implementation for separating customer data between cleaning and maintenance services based on their service contracts and relationships.

## Current Customer Architecture Analysis

### Existing Customer Data Model

```sql
-- Current unified customer structure
customers:
├── id (UUID)
├── customer_number (VARCHAR)
├── service_provider_id (UUID)
├── business_name (VARCHAR)
├── contact_name (VARCHAR)
├── email (VARCHAR)
├── phone (VARCHAR)
├── customer_type (VARCHAR)
├── has_cleaning_contract (BOOLEAN)
├── has_maintenance_contract (BOOLEAN)
├── payment_terms (VARCHAR)
├── satisfaction_score (INTEGER)
└── ...

customer_properties:
├── id (UUID)
├── customer_id (UUID)
├── property_name (VARCHAR)
├── address (TEXT)
├── postcode (VARCHAR)
├── cleaning_checklist_template_id (UUID)
└── ...

cleaning_contracts:
├── id (UUID)
├── customer_id (UUID)
├── contract_type (VARCHAR)
├── monthly_fee (DECIMAL)
├── status (VARCHAR)
└── ...

maintenance_contracts:
├── id (UUID)
├── customer_id (UUID)
├── contract_type (VARCHAR)
├── monthly_fee (DECIMAL)
├── status (VARCHAR)
└── ...
```

### Customer Distribution Analysis

Based on the database schema, we can identify customer categories:

1. **Cleaning-Only Customers**: `has_cleaning_contract = true, has_maintenance_contract = false`
2. **Maintenance-Only Customers**: `has_cleaning_contract = false, has_maintenance_contract = true`
3. **Dual-Service Customers**: `has_cleaning_contract = true, has_maintenance_contract = true`
4. **Potential Customers**: Both flags are false (prospects or inactive)

## Separation Strategy

### Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Shared Customer Reference                  │
│                      (Optional)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐           ┌─────────────────┐      │
│  │Cleaning Service │           │Maintenance      │      │
│  │   Customers     │           │ Service          │      │
│  │                 │           │   Customers      │      │
│  └─────────────────┘           └─────────────────┘      │
│           │                               │              │
│           └───────────────┬───────────────────┘              │
│                           │                                   │
│                  ┌────────▼─────────┐                       │
│                  │Dual Service Link │                       │
│                  │Reference Table   │                       │
│                  └──────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

### Separated Database Schema

#### Cleaning Service Database

```sql
-- Cleaning-specific customers
CREATE TABLE cleaning_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_number VARCHAR(50) UNIQUE,
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),

    -- Core customer information
    business_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Address information
    business_address_line1 VARCHAR(255),
    business_address_line2 VARCHAR(255),
    business_city VARCHAR(100),
    business_postcode VARCHAR(20),
    business_country VARCHAR(100),

    -- Customer classification
    customer_type VARCHAR(50) NOT NULL,
    industry_type VARCHAR(50),

    -- Business details
    payment_terms VARCHAR(20) DEFAULT 'NET_14',
    payment_reliability_score INTEGER DEFAULT 50,
    satisfaction_score INTEGER,
    cross_sell_potential VARCHAR(20) DEFAULT 'MEDIUM',

    -- Cleaning-specific fields
    cleaning_frequency VARCHAR(20),
    cleaning_preferences JSONB DEFAULT '{}',
    preferred_cleaning_times VARCHAR(100)[],
    special_requirements TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Shared reference (for dual-service customers)
    shared_customer_id UUID,

    -- Constraints
    CONSTRAINT cleaning_customers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Cleaning customer properties
CREATE TABLE cleaning_customer_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES cleaning_customers(id) ON DELETE CASCADE,
    property_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    property_type VARCHAR(50),
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,

    -- Access information
    access_instructions TEXT,
    access_code VARCHAR(255),
    parking_info TEXT,
    pet_info TEXT,

    -- Cleaning-specific fields
    cleaning_checklist_template_id UUID,
    cleaning_frequency VARCHAR(20),
    cleaning_duration_minutes INTEGER DEFAULT 60,
    cleaning_difficulty_level VARCHAR(20) DEFAULT 'MEDIUM',
    preferred_cleaner_id UUID,

    -- Location for scheduling
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    what3words VARCHAR(50),

    -- Guest portal
    guest_portal_enabled BOOLEAN DEFAULT false,
    guest_portal_qr_code_url TEXT,

    -- Additional fields
    photo_urls JSONB DEFAULT '[]',
    utility_locations JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '[]',
    cleaner_notes TEXT,
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Shared reference
    shared_property_id UUID
);
```

#### Maintenance Service Database

```sql
-- Maintenance-specific customers
CREATE TABLE maintenance_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_number VARCHAR(50) UNIQUE,
    tenant_id UUID NOT NULL REFERENCES maintenance_tenants(id),

    -- Core customer information
    business_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Address information
    business_address_line1 VARCHAR(255),
    business_address_line2 VARCHAR(255),
    business_city VARCHAR(100),
    business_postcode VARCHAR(20),
    business_country VARCHAR(100),

    -- Customer classification
    customer_type VARCHAR(50) NOT NULL,
    industry_type VARCHAR(50),

    -- Business details
    payment_terms VARCHAR(20) DEFAULT 'NET_14',
    payment_reliability_score INTEGER DEFAULT 50,
    satisfaction_score INTEGER,

    -- Maintenance-specific fields
    property_portfolio_size INTEGER DEFAULT 1,
    maintenance_contract_type VARCHAR(20),
    emergency_contact_preference VARCHAR(50),
    preferred_contractors TEXT[],

    -- Service level agreements
    response_time_requirement INTEGER, -- minutes
    service_level_agreement JSONB DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Shared reference (for dual-service customers)
    shared_customer_id UUID,

    -- Constraints
    CONSTRAINT maintenance_customers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Maintenance customer properties
CREATE TABLE maintenance_customer_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES maintenance_customers(id) ON DELETE CASCADE,
    property_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    property_type VARCHAR(50),
    year_built INTEGER,

    -- Property details
    square_footage INTEGER,
    number_of_floors INTEGER DEFAULT 1,
    has_basement BOOLEAN DEFAULT false,
    has_attic BOOLEAN DEFAULT false,

    -- Systems information
    hvac_type VARCHAR(50),
    electrical_system VARCHAR(50),
    plumbing_system VARCHAR(50),
    roofing_type VARCHAR(50),

    -- Maintenance-specific fields
    maintenance_history JSONB DEFAULT '{}',
    preferred_contractors JSONB DEFAULT '{}',
    emergency_access_instructions TEXT,
    maintenance_notes TEXT,

    -- Asset information
    key_equipment JSONB DEFAULT '{}',
    warranty_information JSONB DEFAULT '{}',

    -- Location for routing
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    what3words VARCHAR(50),

    -- Compliance and certificates
    safety_certificates JSONB DEFAULT '{}',
    compliance_due_dates JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Shared reference
    shared_property_id UUID
);
```

#### Shared Customer Reference (Optional)

```sql
-- For tracking dual-service customer relationships
CREATE TABLE shared_customer_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_customer_id UUID NOT NULL, -- Reference to original unified database
    cleaning_customer_id UUID REFERENCES cleaning_customers(id),
    maintenance_customer_id UUID REFERENCES maintenance_customers(id),

    -- Relationship metadata
    service_combination VARCHAR(20) NOT NULL CHECK (service_combination IN ('CLEANING_ONLY', 'MAINTENANCE_ONLY', 'DUAL_SERVICE')),
    primary_service VARCHAR(20), -- Which service they started with

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Constraints
    CONSTRAINT shared_customer_links_unique_original UNIQUE (original_customer_id)
);
```

## Customer Data Migration Implementation

### Phase 1: Customer Analysis and Categorization

```sql
-- Step 1.1: Analyze customer distribution
WITH customer_analysis AS (
    SELECT
        c.id,
        c.customer_number,
        c.business_name,
        c.email,
        c.has_cleaning_contract,
        c.has_maintenance_contract,
        COUNT(DISTINCT cp.id) as property_count,
        COUNT(DISTINCT cc.id) as cleaning_contracts,
        COUNT(DISTINCT mc.id) as maintenance_contracts,
        CASE
            WHEN c.has_cleaning_contract = true AND c.has_maintenance_contract = false THEN 'CLEANING_ONLY'
            WHEN c.has_cleaning_contract = false AND c.has_maintenance_contract = true THEN 'MAINTENANCE_ONLY'
            WHEN c.has_cleaning_contract = true AND c.has_maintenance_contract = true THEN 'DUAL_SERVICE'
            ELSE 'NO_SERVICE'
        END as service_category,
        -- Determine primary service based on activity
        CASE
            WHEN COUNT(DISTINCT cc.id) > COUNT(DISTINCT mc.id) THEN 'CLEANING_PRIMARY'
            WHEN COUNT(DISTINCT mc.id) > COUNT(DISTINCT cc.id) THEN 'MAINTENANCE_PRIMARY'
            ELSE 'EQUAL_SPLIT'
        END as primary_service
    FROM customers c
    LEFT JOIN customer_properties cp ON c.id = cp.customer_id
    LEFT JOIN cleaning_contracts cc ON c.id = cc.customer_id
    LEFT JOIN maintenance_contracts mc ON c.id = mc.customer_id
    WHERE c.deleted_at IS NULL
    GROUP BY c.id, c.customer_number, c.business_name, c.email, c.has_cleaning_contract, c.has_maintenance_contract
)
SELECT
    service_category,
    COUNT(*) as customer_count,
    COUNT(CASE WHEN property_count > 0 THEN 1 END) as customers_with_properties,
    AVG(property_count) as avg_properties_per_customer,
    COUNT(DISTINCT customer_number) as unique_customer_numbers
FROM customer_analysis
GROUP BY service_category
ORDER BY customer_count DESC;
```

### Phase 2: Data Migration Scripts

#### Cleaning Customers Migration

```sql
-- Step 2.1: Migrate cleaning-only customers
INSERT INTO cleaning_customers (
    id,
    customer_number,
    tenant_id,
    business_name,
    contact_name,
    email,
    phone,
    business_address_line1,
    business_address_line2,
    business_city,
    business_postcode,
    business_country,
    customer_type,
    payment_terms,
    payment_reliability_score,
    satisfaction_score,
    cross_sell_potential,
    created_at,
    updated_at,
    is_active
)
SELECT
    c.id,
    c.customer_number,
    c.tenant_id,
    c.business_name,
    c.contact_name,
    c.email,
    c.phone,
    c.address_line1,
    c.address_line2,
    c.city,
    c.postcode,
    c.country,
    c.customer_type,
    c.payment_terms,
    c.payment_reliability_score,
    c.satisfaction_score,
    c.cross_sell_potential,
    c.created_at,
    c.updated_at,
    c.deleted_at IS NULL as is_active
FROM customers c
WHERE c.has_cleaning_contract = true
    AND c.has_maintenance_contract = false
    AND c.deleted_at IS NULL
    AND c.email IS NOT NULL
ON CONFLICT (customer_number) DO NOTHING;

-- Step 2.2: Migrate dual-service customers (cleaning service copy)
INSERT INTO cleaning_customers (
    id,
    customer_number,
    tenant_id,
    business_name,
    contact_name,
    email,
    phone,
    business_address_line1,
    business_address_line2,
    business_city,
    business_postcode,
    business_country,
    customer_type,
    payment_terms,
    payment_reliability_score,
    satisfaction_score,
    cross_sell_potential,
    created_at,
    updated_at,
    is_active,
    shared_customer_id
)
SELECT
    gen_random_uuid() as id,
    c.customer_number || '_CLEANING' as customer_number,
    c.tenant_id,
    c.business_name,
    c.contact_name,
    c.email,
    c.phone,
    c.address_line1,
    c.address_line2,
    c.city,
    c.postcode,
    c.country,
    c.customer_type,
    c.payment_terms,
    c.payment_reliability_score,
    c.satisfaction_score,
    c.cross_sell_potential,
    c.created_at,
    c.updated_at,
    c.deleted_at IS NULL as is_active,
    c.id as shared_customer_id
FROM customers c
WHERE c.has_cleaning_contract = true
    AND c.has_maintenance_contract = true
    AND c.deleted_at IS NULL
    AND c.email IS NOT NULL;
```

#### Maintenance Customers Migration

```sql
-- Step 2.3: Migrate maintenance-only customers
INSERT INTO maintenance_customers (
    id,
    customer_number,
    tenant_id,
    business_name,
    contact_name,
    email,
    phone,
    business_address_line1,
    business_address_line2,
    business_city,
    business_postcode,
    business_country,
    customer_type,
    payment_terms,
    payment_reliability_score,
    satisfaction_score,
    created_at,
    updated_at,
    is_active
)
SELECT
    c.id,
    c.customer_number,
    c.tenant_id,
    c.business_name,
    c.contact_name,
    c.email,
    c.phone,
    c.address_line1,
    c.address_line2,
    c.city,
    c.postcode,
    c.country,
    c.customer_type,
    c.payment_terms,
    c.payment_reliability_score,
    c.satisfaction_score,
    c.created_at,
    c.updated_at,
    c.deleted_at IS NULL as is_active
FROM customers c
WHERE c.has_maintenance_contract = true
    AND c.has_cleaning_contract = false
    AND c.deleted_at IS NULL
    AND c.email IS NOT NULL
ON CONFLICT (customer_number) DO NOTHING;

-- Step 2.4: Migrate dual-service customers (maintenance service copy)
INSERT INTO maintenance_customers (
    id,
    customer_number,
    tenant_id,
    business_name,
    contact_name,
    email,
    phone,
    business_address_line1,
    business_address_line2,
    business_city,
    business_postcode,
    business_country,
    customer_type,
    payment_terms,
    payment_reliability_score,
    satisfaction_score,
    created_at,
    updated_at,
    is_active,
    shared_customer_id
)
SELECT
    gen_random_uuid() as id,
    c.customer_number || '_MAINTENANCE' as customer_number,
    c.tenant_id,
    c.business_name,
    c.contact_name,
    c.email,
    c.phone,
    c.address_line1,
    c.address_line2,
    c.city,
    c.postcode,
    c.country,
    c.customer_type,
    c.payment_terms,
    c.payment_reliability_score,
    c.satisfaction_score,
    c.created_at,
    c.updated_at,
    c.deleted_at IS NULL as is_active,
    c.id as shared_customer_id
FROM customers c
WHERE c.has_maintenance_contract = true
    AND c.has_cleaning_contract = true
    AND c.deleted_at IS NULL
    AND c.email IS NOT NULL;
```

#### Property Migration

```sql
-- Step 2.5: Migrate cleaning customer properties
INSERT INTO cleaning_customer_properties (
    id,
    customer_id,
    property_name,
    address,
    postcode,
    property_type,
    bedrooms,
    bathrooms,
    access_instructions,
    access_code,
    parking_info,
    pet_info,
    cleaning_checklist_template_id,
    cleaning_frequency,
    cleaning_duration_minutes,
    cleaning_difficulty_level,
    latitude,
    longitude,
    what3words,
    guest_portal_enabled,
    guest_portal_qr_code_url,
    photo_urls,
    utility_locations,
    emergency_contacts,
    cleaner_notes,
    wifi_ssid,
    wifi_password,
    created_at,
    updated_at,
    is_active,
    shared_property_id
)
SELECT
    gen_random_uuid() as id,
    cc.id as customer_id,
    cp.property_name,
    cp.address,
    cp.postcode,
    cp.property_type,
    cp.bedrooms,
    cp.bathrooms,
    cp.access_instructions,
    cp.access_code,
    cp.parking_info,
    cp.pet_info,
    cp.cleaning_checklist_template_id,
    cp.cleaning_frequency,
    60 as cleaning_duration_minutes, -- Default value
    'MEDIUM' as cleaning_difficulty_level, -- Default value
    cp.latitude,
    cp.longitude,
    cp.what3words,
    cp.guest_portal_enabled,
    cp.guest_portal_qr_code_url,
    cp.photo_urls,
    cp.utility_locations,
    cp.emergency_contacts,
    cp.cleaner_notes,
    cp.wifi_ssid,
    cp.wifi_password,
    cp.created_at,
    cp.updated_at,
    cp.is_active,
    cp.id as shared_property_id
FROM customer_properties cp
JOIN cleaning_customers cc ON (
    (cc.shared_customer_id IS NOT NULL AND cc.shared_customer_id = cp.customer_id) OR
    (cc.shared_customer_id IS NULL AND cc.id = cp.customer_id)
)
WHERE EXISTS (
    SELECT 1 FROM cleaning_contracts cc2
    WHERE cc2.customer_id = cp.customer_id
    OR (cc.shared_customer_id IS NOT NULL AND cc2.customer_id = cc.shared_customer_id)
);

-- Step 2.6: Migrate maintenance customer properties
INSERT INTO maintenance_customer_properties (
    id,
    customer_id,
    property_name,
    address,
    postcode,
    property_type,
    year_built,
    square_footage,
    number_of_floors,
    has_basement,
    has_attic,
    hvac_type,
    electrical_system,
    plumbing_system,
    roofing_type,
    maintenance_history,
    preferred_contractors,
    emergency_access_instructions,
    maintenance_notes,
    key_equipment,
    warranty_information,
    latitude,
    longitude,
    what3words,
    safety_certificates,
    compliance_due_dates,
    created_at,
    updated_at,
    is_active,
    shared_property_id
)
SELECT
    gen_random_uuid() as id,
    mc.id as customer_id,
    cp.property_name,
    cp.address,
    cp.postcode,
    cp.property_type,
    NULL as year_built, -- Default, populate later if available
    NULL as square_footage, -- Default, populate later if available
    1 as number_of_floors,
    false as has_basement,
    false as has_attic,
    'UNKNOWN' as hvac_type,
    'UNKNOWN' as electrical_system,
    'UNKNOWN' as plumbing_system,
    'UNKNOWN' as roofing_type,
    '[]'::jsonb as maintenance_history,
    '[]'::jsonb as preferred_contractors,
    cp.access_instructions as emergency_access_instructions,
    cp.access_instructions as maintenance_notes,
    '[]'::jsonb as key_equipment,
    '[]'::jsonb as warranty_information,
    cp.latitude,
    cp.longitude,
    cp.what3words,
    '[]'::jsonb as safety_certificates,
    '[]'::jsonb as compliance_due_dates,
    cp.created_at,
    cp.updated_at,
    cp.is_active,
    cp.id as shared_property_id
FROM customer_properties cp
JOIN maintenance_customers mc ON (
    (mc.shared_customer_id IS NOT NULL AND mc.shared_customer_id = cp.customer_id) OR
    (mc.shared_customer_id IS NULL AND mc.id = cp.customer_id)
)
WHERE EXISTS (
    SELECT 1 FROM maintenance_contracts mc2
    WHERE mc2.customer_id = cp.customer_id
    OR (mc.shared_customer_id IS NOT NULL AND mc2.customer_id = mc.shared_customer_id)
);
```

### Phase 3: Reference and Link Management

```sql
-- Step 3.1: Create shared customer links
INSERT INTO shared_customer_links (
    original_customer_id,
    cleaning_customer_id,
    maintenance_customer_id,
    service_combination,
    primary_service,
    created_at,
    updated_at,
    is_active
)
SELECT
    c.id as original_customer_id,
    cc.id as cleaning_customer_id,
    mc.id as maintenance_customer_id,
    CASE
        WHEN c.has_cleaning_contract = true AND c.has_maintenance_contract = false THEN 'CLEANING_ONLY'
        WHEN c.has_cleaning_contract = false AND c.has_maintenance_contract = true THEN 'MAINTENANCE_ONLY'
        WHEN c.has_cleaning_contract = true AND c.has_maintenance_contract = true THEN 'DUAL_SERVICE'
        ELSE 'NO_SERVICE'
    END as service_combination,
    CASE
        WHEN c.has_cleaning_contract = true AND c.has_maintenance_contract = true THEN
            CASE
                WHEN (SELECT COUNT(*) FROM cleaning_contracts WHERE customer_id = c.id) >=
                     (SELECT COUNT(*) FROM maintenance_contracts WHERE customer_id = c.id)
                THEN 'CLEANING_PRIMARY'
                ELSE 'MAINTENANCE_PRIMARY'
            END
        WHEN c.has_cleaning_contract = true THEN 'CLEANING_PRIMARY'
        WHEN c.has_maintenance_contract = true THEN 'MAINTENANCE_PRIMARY'
        ELSE 'UNKNOWN'
    END as primary_service,
    c.created_at,
    c.updated_at,
    true as is_active
FROM customers c
LEFT JOIN cleaning_customers cc ON cc.shared_customer_id = c.id
LEFT JOIN maintenance_customers mc ON mc.shared_customer_id = c.id
WHERE (c.has_cleaning_contract = true OR c.has_maintenance_contract = true)
    AND c.deleted_at IS NULL
    AND c.email IS NOT NULL;
```

### Phase 4: Data Validation

```sql
-- Step 4.1: Validate customer migration integrity
WITH migration_validation AS (
    -- Validate total customer counts
    SELECT
        'total_customers' as validation_type,
        (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL) as original_count,
        (SELECT COUNT(*) FROM cleaning_customers) as cleaning_count,
        (SELECT COUNT(*) FROM maintenance_customers) as maintenance_count,
        (SELECT COUNT(*) FROM shared_customer_links WHERE service_combination = 'DUAL_SERVICE') as dual_service_count

    UNION ALL

    -- Validate dual-service customer mapping
    SELECT
        'dual_service_mapping' as validation_type,
        COUNT(*) as original_count,
        COUNT(cc.id) as cleaning_count,
        COUNT(mc.id) as maintenance_count,
        COUNT(scl.id) as link_count
    FROM customers c
    LEFT JOIN cleaning_customers cc ON cc.shared_customer_id = c.id
    LEFT JOIN maintenance_customers mc ON mc.shared_customer_id = c.id
    LEFT JOIN shared_customer_links scl ON scl.original_customer_id = c.id
    WHERE c.has_cleaning_contract = true
        AND c.has_maintenance_contract = true
        AND c.deleted_at IS NULL

    UNION ALL

    -- Validate property migration
    SELECT
        'property_migration' as validation_type,
        (SELECT COUNT(*) FROM customer_properties WHERE is_active = true) as original_count,
        (SELECT COUNT(*) FROM cleaning_customer_properties) as cleaning_count,
        (SELECT COUNT(*) FROM maintenance_customer_properties) as maintenance_count,
        NULL as link_count
)
SELECT * FROM migration_validation;

-- Step 4.2: Check for data consistency
SELECT
    'email_consistency' as check_type,
    COUNT(*) as total_checks,
    COUNT(CASE WHEN cu.email = cu_email THEN 1 END) as consistent_emails,
    COUNT(CASE WHEN cu.email != cu_email THEN 1 END) as inconsistent_emails
FROM (
    SELECT
        c.id,
        c.email,
        cc.email as cc_email,
        mc.email as mc_email
    FROM customers c
    LEFT JOIN cleaning_customers cc ON cc.shared_customer_id = c.id
    LEFT JOIN maintenance_customers mc ON mc.shared_customer_id = c.id
    WHERE c.deleted_at IS NULL
) cu;
```

## Implementation Timeline

### Day 1: Analysis and Planning
- [ ] Run customer analysis queries
- [ ] Document customer categorization results
- [ ] Create migration test data
- [ ] Validate migration approach

### Day 2: Schema Creation
- [ ] Create database schemas
- [ ] Set up indexes and constraints
- [ ] Test schema creation in development
- [ ] Validate schema structure

### Day 3: Data Migration
- [ ] Run customer migration scripts
- [ ] Migrate property data
- [ ] Create shared reference links
- [ ] Validate migration results

### Day 4: Testing and Validation
- [ ] Run comprehensive validation queries
- [ ] Test application functionality
- [ ] Verify data integrity
- [ ] Document any issues and fixes

## Risk Mitigation

### Data Loss Prevention
- Create full backup before migration
- Implement transaction rollback capability
- Run dry-run migration first
- Validate data at each step

### Service Disruption Prevention
- Plan migration during low-traffic periods
- Implement feature flags for gradual rollout
- Maintain read-only access during migration
- Have rollback plan ready

### Data Integrity Assurance
- Comprehensive validation scripts
- Cross-reference multiple data sources
- Verify relationships and constraints
- Test with production-like data volumes

---

**Status**: Ready for implementation
**Next Steps**: Execute migration in development environment
**Dependencies**: Authentication system separation must be completed first
**Rollback Capability**: Full rollback procedures documented and tested