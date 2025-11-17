-- =====================================================
-- RightFit Services: Database Separation Migration Scripts
-- =====================================================
-- Version: 1.0
-- Created: November 17, 2025
-- Purpose: Separate shared database into cleaning and maintenance services
-- =====================================================

-- ============================================
-- PHASE 1: ENVIRONMENT SETUP
-- ============================================

-- Create separate databases (run in PostgreSQL admin)
/*
CREATE DATABASE rightfit_cleaning;
CREATE DATABASE rightfit_maintenance;
CREATE DATABASE rightfit_shared_auth;
*/

-- Grant permissions
/*
GRANT ALL PRIVILEGES ON DATABASE rightfit_cleaning TO cleaning_user;
GRANT ALL PRIVILEGES ON DATABASE rightfit_maintenance TO maintenance_user;
GRANT ALL PRIVILEGES ON DATABASE rightfit_shared_auth TO shared_user;
*/

-- ============================================
-- PHASE 2: SHARED AUTHENTICATION DATABASE
-- ============================================

-- Connect to rightfit_shared_auth database

-- Shared Users Table (Authentication Only)
CREATE TABLE shared_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Constraints
    CONSTRAINT shared_users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Shared Password Reset Tokens
CREATE TABLE shared_password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shared_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_shared_password_tokens_token (token),
    INDEX idx_shared_password_tokens_user_id (user_id),
    INDEX idx_shared_password_tokens_expires_at (expires_at)
);

-- User Service Mappings (Track which services a user has access to)
CREATE TABLE user_service_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shared_users(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('CLEANING', 'MAINTENANCE', 'BOTH')),
    cleaning_user_id UUID,
    maintenance_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT user_service_mappings_unique UNIQUE (user_id, service_type)
);

-- Indexes for shared auth database
CREATE INDEX idx_shared_users_email ON shared_users(email);
CREATE INDEX idx_shared_users_active ON shared_users(is_active);
CREATE INDEX idx_user_service_mappings_user_id ON user_service_mappings(user_id);
CREATE INDEX idx_user_service_mappings_service_type ON user_service_mappings(service_type);

-- ============================================
-- PHASE 3: CLEANING SERVICE DATABASE
-- ============================================

-- Connect to rightfit_cleaning database

-- Cleaning Tenants
CREATE TABLE cleaning_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name VARCHAR(100) NOT NULL,
    subscription_status VARCHAR(20) DEFAULT 'TRIAL' CHECK (subscription_status IN ('TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Cleaning-specific fields
    max_properties INTEGER DEFAULT 10,
    max_workers INTEGER DEFAULT 5,
    feature_flags JSONB DEFAULT '{}'
);

-- Cleaning Users (Service-specific profiles)
CREATE TABLE cleaning_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightfit_shared_auth.shared_users(id),
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER', 'CONTRACTOR')),
    phone VARCHAR(20),
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Cleaning-specific fields
    cleaning_permissions JSONB DEFAULT '{}',
    preferred_work_areas TEXT[],

    -- Constraints
    CONSTRAINT cleaning_users_unique_user UNIQUE (user_id),
    CONSTRAINT cleaning_users_tenant_user UNIQUE (tenant_id, user_id)
);

-- Cleaning Customers
CREATE TABLE cleaning_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),
    customer_number VARCHAR(50) UNIQUE,
    business_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Address fields
    business_address_line1 VARCHAR(255),
    business_address_line2 VARCHAR(255),
    business_city VARCHAR(100),
    business_postcode VARCHAR(20),
    business_country VARCHAR(100),

    -- Customer details
    customer_type VARCHAR(50) NOT NULL,
    payment_terms VARCHAR(20) DEFAULT 'NET_14',
    payment_reliability_score INTEGER DEFAULT 50,
    satisfaction_score INTEGER,

    -- Cleaning-specific fields
    cleaning_frequency VARCHAR(20),
    cleaning_preferences JSONB DEFAULT '{}',
    cleaning_notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT cleaning_customers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Cleaning Properties (Properties managed for cleaning customers)
CREATE TABLE cleaning_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES cleaning_customers(id),
    property_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    property_type VARCHAR(50),
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,

    -- Access information
    access_instructions TEXT,
    access_code VARCHAR(255),

    -- Cleaning-specific fields
    cleaning_checklist_template_id UUID,
    cleaning_frequency VARCHAR(20),
    cleaning_duration_minutes INTEGER DEFAULT 60,
    cleaning_difficulty_level VARCHAR(20) DEFAULT 'MEDIUM',
    cleaning_equipment_required TEXT[],
    cleaning_supplies_preference VARCHAR(20) DEFAULT 'PROVIDED',

    -- Location fields
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    what3words VARCHAR(50),

    -- Guest portal
    guest_portal_enabled BOOLEAN DEFAULT false,
    guest_portal_qr_code_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Additional fields
    photo_urls JSONB DEFAULT '[]',
    utility_locations JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '[]',
    cleaner_notes TEXT,
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),
    parking_info TEXT,
    pet_info TEXT,
    special_requirements TEXT
);

-- Cleaning Workers
CREATE TABLE cleaning_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),
    user_id UUID REFERENCES rightfit_shared_auth.shared_users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(100),

    -- Employment
    employment_type VARCHAR(20) NOT NULL CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACTOR')),
    hourly_rate DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    max_weekly_hours INTEGER,
    employment_start_date DATE,

    -- Professional details
    bio TEXT,
    experience_years INTEGER,
    cleaning_specializations TEXT[],
    preferred_property_types TEXT[],

    -- Performance
    jobs_completed INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2),
    customer_ratings JSONB DEFAULT '[]',

    -- Media
    photo_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT cleaning_workers_email_unique UNIQUE (email),
    CONSTRAINT cleaning_workers_user_unique UNIQUE (user_id)
);

-- Cleaning Jobs
CREATE TABLE cleaning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),
    property_id UUID NOT NULL REFERENCES cleaning_properties(id),
    customer_id UUID NOT NULL REFERENCES cleaning_customers(id),
    assigned_worker_id UUID REFERENCES cleaning_workers(id),
    contract_id UUID, -- Will reference cleaning_contracts

    -- Scheduling
    scheduled_date DATE,
    scheduled_start_time VARCHAR(10),
    scheduled_end_time VARCHAR(10),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,

    -- Checklist
    checklist_template_id UUID,
    checklist_items JSONB,
    checklist_completed_items INTEGER DEFAULT 0,
    checklist_total_items INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    completion_notes TEXT,
    worker_notes TEXT,

    -- Photos (as URLs)
    job_note_photos TEXT[] DEFAULT '{}',
    before_photos TEXT[] DEFAULT '{}',
    after_photos TEXT[] DEFAULT '{}',
    issue_photos TEXT[] DEFAULT '{}',

    -- Pricing
    pricing_type VARCHAR(50),
    quoted_price DECIMAL(10, 2),
    actual_price DECIMAL(10, 2),

    -- Issue reporting
    maintenance_issues_found INTEGER DEFAULT 0,
    maintenance_quotes_generated INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cleaning Contracts
CREATE TABLE cleaning_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),
    customer_id UUID NOT NULL REFERENCES cleaning_customers(id),
    contract_number VARCHAR(50) UNIQUE,
    contract_type VARCHAR(20) DEFAULT 'FLAT_MONTHLY' CHECK (contract_type IN ('FLAT_MONTHLY', 'PER_PROPERTY')),
    contract_start_date DATE NOT NULL,
    contract_end_date DATE,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    billing_day INTEGER NOT NULL CHECK (billing_day BETWEEN 1 AND 31),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED')),
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract Properties Link (for contracts covering multiple properties)
CREATE TABLE cleaning_contract_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES cleaning_contracts(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES cleaning_properties(id) ON DELETE CASCADE,
    property_monthly_fee DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT cleaning_contract_props_unique UNIQUE (contract_id, property_id)
);

-- Cleaning Invoices
CREATE TABLE cleaning_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),
    contract_id UUID NOT NULL REFERENCES cleaning_contracts(id),
    customer_id UUID NOT NULL REFERENCES cleaning_customers(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,

    -- Billing period
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,

    -- Job counts
    total_cleans_completed INTEGER DEFAULT 0,

    -- Financial details
    contract_monthly_fee DECIMAL(10, 2) NOT NULL,
    additional_charges DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_percentage DECIMAL(5, 2) DEFAULT 20,
    tax_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cleaning Quotes
CREATE TABLE cleaning_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES cleaning_tenants(id),
    customer_id UUID NOT NULL REFERENCES cleaning_customers(id),
    property_id UUID REFERENCES cleaning_properties(id),
    cleaning_job_id UUID REFERENCES cleaning_jobs(id),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    quote_date DATE NOT NULL,
    valid_until_date DATE NOT NULL,

    -- Line items
    line_items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'APPROVED', 'DECLINED', 'EXPIRED')),
    customer_response TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Calendar (for scheduling)
CREATE TABLE cleaning_property_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES cleaning_properties(id) ON DELETE CASCADE,
    guest_checkout_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    next_guest_checkin_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    clean_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    clean_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cleaning_job_id UUID REFERENCES cleaning_jobs(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR CLEANING DATABASE
-- ============================================

CREATE INDEX idx_cleaning_users_tenant_id ON cleaning_users(tenant_id);
CREATE INDEX idx_cleaning_users_user_id ON cleaning_users(user_id);
CREATE INDEX idx_cleaning_users_email ON cleaning_users(email);
CREATE INDEX idx_cleaning_customers_tenant_id ON cleaning_customers(tenant_id);
CREATE INDEX idx_cleaning_customers_email ON cleaning_customers(email);
CREATE INDEX idx_cleaning_properties_customer_id ON cleaning_properties(customer_id);
CREATE INDEX idx_cleaning_properties_postcode ON cleaning_properties(postcode);
CREATE INDEX idx_cleaning_properties_location ON cleaning_properties(latitude, longitude);
CREATE INDEX idx_cleaning_workers_tenant_id ON cleaning_workers(tenant_id);
CREATE INDEX idx_cleaning_workers_email ON cleaning_workers(email);
CREATE INDEX idx_cleaning_workers_active ON cleaning_workers(is_active);
CREATE INDEX idx_cleaning_jobs_tenant_id ON cleaning_jobs(tenant_id);
CREATE INDEX idx_cleaning_jobs_property_id ON cleaning_jobs(property_id);
CREATE INDEX idx_cleaning_jobs_customer_id ON cleaning_jobs(customer_id);
CREATE INDEX idx_cleaning_jobs_worker_id ON cleaning_jobs(assigned_worker_id);
CREATE INDEX idx_cleaning_jobs_status ON cleaning_jobs(status);
CREATE INDEX idx_cleaning_jobs_scheduled_date ON cleaning_jobs(scheduled_date);
CREATE INDEX idx_cleaning_jobs_status_date ON cleaning_jobs(status, scheduled_date);
CREATE INDEX idx_cleaning_contracts_tenant_id ON cleaning_contracts(tenant_id);
CREATE INDEX idx_cleaning_contracts_customer_id ON cleaning_contracts(customer_id);
CREATE INDEX idx_cleaning_contracts_status ON cleaning_contracts(status);
CREATE INDEX idx_cleaning_invoices_contract_id ON cleaning_invoices(contract_id);
CREATE INDEX idx_cleaning_invoices_customer_id ON cleaning_invoices(customer_id);
CREATE INDEX idx_cleaning_invoices_status ON cleaning_invoices(status);
CREATE INDEX idx_cleaning_quotes_customer_id ON cleaning_quotes(customer_id);
CREATE INDEX idx_cleaning_quotes_property_id ON cleaning_quotes(property_id);
CREATE INDEX idx_cleaning_quotes_status ON cleaning_quotes(status);
CREATE INDEX idx_cleaning_calendars_property_id ON cleaning_property_calendars(property_id);
CREATE INDEX idx_cleaning_calendars_checkout ON cleaning_property_calendars(guest_checkout_datetime);

-- ============================================
-- PHASE 4: MAINTENANCE SERVICE DATABASE
-- ============================================

-- This section would contain similar structure for maintenance service
-- For brevity, showing key differences only

/*
-- Similar structure to cleaning database but with maintenance-specific fields:
-- maintenance_tenants, maintenance_users, maintenance_customers
-- maintenance_properties, maintenance_workers, maintenance_jobs
-- maintenance_contracts, maintenance_invoices, maintenance_quotes
-- External contractors, maintenance-specific workflows
*/

-- ============================================
-- PHASE 5: MIGRATION PROCEDURES
-- ============================================

-- Migration Procedure 1: Extract Shared Users
/*
-- Step 1: Extract unique users to shared authentication database
INSERT INTO rightfit_shared_auth.shared_users (id, email, password_hash, created_at, updated_at, is_active)
SELECT DISTINCT
    u.id,
    u.email,
    u.password_hash,
    u.created_at,
    u.updated_at,
    u.deleted_at IS NULL as is_active
FROM original_database.users u
WHERE u.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = EXCLUDED.updated_at;
*/

-- Migration Procedure 2: Categorize Users by Service
/*
-- Step 2: Analyze user service types
WITH user_service_analysis AS (
    SELECT
        u.id,
        u.email,
        CASE
            WHEN EXISTS(SELECT 1 FROM cleaning_jobs cj WHERE cj.assigned_worker_id IN (
                SELECT w.id FROM workers w WHERE w.user_id = u.id AND w.worker_type IN ('CLEANER', 'BOTH')
            )) OR u.role = 'ADMIN' THEN 'CLEANING'
            WHEN EXISTS(SELECT 1 FROM maintenance_jobs mj WHERE mj.assigned_worker_id IN (
                SELECT w.id FROM workers w WHERE w.user_id = u.id AND w.worker_type IN ('MAINTENANCE', 'BOTH')
            )) OR u.role = 'ADMIN' THEN 'MAINTENANCE'
            WHEN EXISTS(
                SELECT 1 FROM workers w
                WHERE w.user_id = u.id AND w.worker_type = 'BOTH'
            ) THEN 'BOTH'
            ELSE 'UNKNOWN'
        END as service_type
    FROM original_database.users u
)
SELECT * FROM user_service_analysis WHERE service_type != 'UNKNOWN';
*/

-- Migration Procedure 3: Migrate Cleaning Data
/*
-- Step 3: Migrate cleaning customers
INSERT INTO rightfit_cleaning.cleaning_customers (
    id, tenant_id, customer_number, business_name, contact_name,
    email, phone, business_address_line1, business_address_line2,
    business_city, business_postcode, business_country, customer_type,
    payment_terms, payment_reliability_score, satisfaction_score,
    created_at, updated_at
)
SELECT
    c.id,
    c.tenant_id,
    c.customer_number,
    c.business_name,
    c.contact_name,
    c.email,
    c.phone,
    c.business_address_line1,
    c.business_address_line2,
    c.business_city,
    c.business_postcode,
    c.business_country,
    c.customer_type,
    c.payment_terms,
    c.payment_reliability_score,
    c.satisfaction_score,
    c.created_at,
    c.updated_at
FROM original_database.customers c
WHERE c.has_cleaning_contract = true
OR EXISTS(SELECT 1 FROM cleaning_jobs cj WHERE cj.customer_id = c.id)
OR EXISTS(SELECT 1 FROM cleaning_contracts cc WHERE cc.customer_id = c.id);
*/

-- Migration Procedure 4: Migrate Maintenance Data
/*
-- Similar procedures for maintenance data migration
*/

-- ============================================
-- PHASE 6: VALIDATION SCRIPTS
-- ============================================

-- Validation Script 1: Data Integrity Check
/*
-- Check record counts before and after migration
SELECT 'users' as table_name, COUNT(*) as original_count FROM original_database.users
UNION ALL
SELECT 'cleaning_users' as table_name, COUNT(*) as migrated_count FROM rightfit_cleaning.cleaning_users
UNION ALL
SELECT 'maintenance_users' as table_name, COUNT(*) as migrated_count FROM rightfit_maintenance.maintenance_users;
*/

-- Validation Script 2: Relationship Integrity Check
/*
-- Verify all cleaning jobs have valid property references
SELECT COUNT(*) as orphaned_jobs
FROM rightfit_cleaning.cleaning_jobs cj
LEFT JOIN rightfit_cleaning.cleaning_properties cp ON cj.property_id = cp.id
WHERE cp.id IS NULL;
*/

-- Validation Script 3: Financial Data Validation
/*
-- Verify financial totals are preserved
SELECT
    'original_cleaning' as source,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM original_database.financial_transactions ft
WHERE category = 'CLEANING'
UNION ALL
SELECT
    'migrated_cleaning' as source,
    SUM(total_amount) as total_amount,
    COUNT(*) as invoice_count
FROM rightfit_cleaning.cleaning_invoices;
*/

-- ============================================
-- PHASE 7: ROLLBACK PROCEDURES
-- ============================================

-- Rollback Procedure 1: Database Restoration
/*
-- In case of migration failure, restore from backup:
-- 1. Stop all application services
-- 2. Drop target databases
-- 3. Restore original database from backup
-- 4. Restart application services
-- 5. Verify system functionality
*/

-- Rollback Procedure 2: Partial Rollback
/*
-- For partial rollback scenarios:
-- 1. Identify affected tables
-- 2. Truncate affected tables
-- 3. Restore data from original database
-- 4. Recreate indexes and constraints
-- 5. Run validation scripts
*/

-- ============================================
-- EXECUTION CHECKLIST
-- ============================================

/*
Pre-Migration Checklist:
☐ Database backups completed and verified
☐ Migration environment set up and tested
☐ Rollback procedures documented and tested
☐ Performance impact analysis completed
☐ Stakeholder communication completed
☐ Application maintenance windows scheduled

Migration Execution:
☐ Schema creation completed successfully
☐ Data extraction completed without errors
☐ Data transformation completed
☐ Data loading completed
☐ Referential integrity verified
☐ Performance testing completed
☐ Application testing completed
☐ User acceptance testing completed

Post-Migration:
☐ Old database archived
☐ Monitoring configured
☐ Documentation updated
☐ Team training completed
☐ Support procedures updated
*/

-- =====================================================
-- END OF MIGRATION SCRIPTS
-- =====================================================