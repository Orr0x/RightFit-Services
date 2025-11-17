-- Worker Management Separation Migration Script
-- This script separates contractor/worker data between cleaning and maintenance services
-- while preserving data integrity and enabling cross-service worker management

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 1: SHARED AUTHENTICATION SETUP
-- =============================================================================

-- Create shared contractor profiles database if not exists
-- This should be run on the shared authentication database

-- 1.1 Shared contractor profiles table
CREATE TABLE IF NOT EXISTS shared_contractor_profiles (
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

-- 1.2 Contractor service assignments
CREATE TABLE IF NOT EXISTS contractor_service_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_profile_id UUID NOT NULL REFERENCES shared_contractor_profiles(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('CLEANING', 'MAINTENANCE')),
    trade VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contractor_profile_id, service_type)
);

-- 1.3 Cross-service worker permissions
CREATE TABLE IF NOT EXISTS cross_service_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_profile_id UUID NOT NULL REFERENCES shared_contractor_profiles(id) ON DELETE CASCADE,
    primary_service VARCHAR(20) NOT NULL CHECK (primary_service IN ('CLEANING', 'MAINTENANCE')),
    secondary_service VARCHAR(20) CHECK (secondary_service IN ('CLEANING', 'MAINTENANCE')),
    can_accept_secondary BOOLEAN DEFAULT false,
    max_weekly_hours_secondary INTEGER DEFAULT 20,
    schedule_conflicts_prevented BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 Worker skill mappings
CREATE TABLE IF NOT EXISTS worker_skill_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_profile_id UUID NOT NULL REFERENCES shared_contractor_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    applicable_services VARCHAR(50)[] NOT NULL, -- e.g., ['CLEANING'], ['MAINTENANCE'], ['CLEANING', 'MAINTENANCE']
    proficiency_level VARCHAR(20) DEFAULT 'INTERMEDIATE',
    years_experience INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    verification_source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 2: CLEANING SERVICE DATABASE
-- =============================================================================

-- This should be run on the cleaning service database

-- 2.1 Enhanced cleaning contractors table
CREATE TABLE IF NOT EXISTS cleaning_contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_profile_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    user_id UUID UNIQUE,
    trade VARCHAR(50) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    certification_level VARCHAR(20) DEFAULT 'BASIC' CHECK (certification_level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'SPECIALIST')),
    availability_schedule JSONB DEFAULT '{}',
    preferred_property_types TEXT[] DEFAULT '{}',
    average_job_time_minutes INTEGER DEFAULT 120,
    quality_score_avg DECIMAL(3,2) DEFAULT 3.00,
    reliability_score DECIMAL(3,2) DEFAULT 3.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_cleaning_contractors_profile FOREIGN KEY (contractor_profile_id)
        REFERENCES shared_auth_db.shared_contractor_profiles(id) ON DELETE CASCADE
);

-- 2.2 Cleaning-specific certifications
CREATE TABLE IF NOT EXISTS cleaning_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES cleaning_contractors(id) ON DELETE CASCADE,
    certification_name VARCHAR(100) NOT NULL,
    certification_type VARCHAR(50) NOT NULL CHECK (certification_type IN ('SAFETY', 'TECHNIQUE', 'EQUIPMENT', 'CHEMICAL', 'SPECIALIZED')),
    issued_by VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    is_active BOOLEAN DEFAULT true,
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Cleaning performance metrics
CREATE TABLE IF NOT EXISTS cleaning_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES cleaning_contractors(id) ON DELETE CASCADE,
    job_id UUID NOT NULL,
    property_id UUID NOT NULL,
    completion_time_minutes INTEGER,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    adherence_to_schedule BOOLEAN DEFAULT true,
    notes TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(contractor_id, job_id)
);

-- 2.4 Cleaning availability and scheduling
CREATE TABLE IF NOT EXISTS cleaning_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES cleaning_contractors(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT true,
    max_jobs_per_day INTEGER DEFAULT 8,
    preferred_property_types TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(contractor_id, day_of_week)
);

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 3: MAINTENANCE SERVICE DATABASE
-- =============================================================================

-- This should be run on the maintenance service database

-- 3.1 Enhanced maintenance contractors table
CREATE TABLE IF NOT EXISTS maintenance_contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_profile_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    user_id UUID UNIQUE,
    trade VARCHAR(50) NOT NULL,
    specializations TEXT[] DEFAULT '{}',
    license_number VARCHAR(100),
    license_expiry DATE,
    license_type VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    is_available_emergency BOOLEAN DEFAULT false,
    service_radius_km INTEGER DEFAULT 50,
    average_job_time_hours DECIMAL(4,2) DEFAULT 2.00,
    quality_score_avg DECIMAL(3,2) DEFAULT 3.00,
    reliability_score DECIMAL(3,2) DEFAULT 3.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_maintenance_contractors_profile FOREIGN KEY (contractor_profile_id)
        REFERENCES shared_auth_db.shared_contractor_profiles(id) ON DELETE CASCADE
);

-- 3.2 Technical certifications and licenses
CREATE TABLE IF NOT EXISTS maintenance_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES maintenance_contractors(id) ON DELETE CASCADE,
    certification_name VARCHAR(100) NOT NULL,
    certification_type VARCHAR(50) NOT NULL CHECK (certification_type IN ('LICENSE', 'CERTIFICATION', 'TRAINING', 'SPECIALIZATION')),
    license_number VARCHAR(100),
    issued_by VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    is_active BOOLEAN DEFAULT true,
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.3 Technical skills and qualifications
CREATE TABLE IF NOT EXISTS maintenance_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES maintenance_contractors(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    skill_category VARCHAR(50) NOT NULL CHECK (skill_category IN ('TECHNICAL', 'SAFETY', 'SOFTWARE', 'EQUIPMENT', 'SOFT_SKILLS')),
    proficiency_level VARCHAR(20) DEFAULT 'INTERMEDIATE' CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    years_experience INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    verification_date DATE,
    verification_source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(contractor_id, skill_name)
);

-- 3.4 Maintenance performance metrics
CREATE TABLE IF NOT EXISTS maintenance_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES maintenance_contractors(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL,
    completion_time_hours DECIMAL(5,2),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    on_time_completion BOOLEAN DEFAULT true,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    cost_efficiency_score DECIMAL(3,2) CHECK (cost_efficiency_score >= 0.00 AND cost_efficiency_score <= 5.00),
    first_time_fix BOOLEAN DEFAULT false,
    notes TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(contractor_id, work_order_id)
);

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 4: CATEGORIZATION FUNCTIONS
-- =============================================================================

-- 4.1 Worker categorization function
CREATE OR REPLACE FUNCTION categorize_worker_service(
    trade_in VARCHAR,
    work_order_categories TEXT[],
    total_work_orders INTEGER DEFAULT 0
) RETURNS TABLE(service_type VARCHAR, contractor_type VARCHAR, confidence_score NUMERIC) AS $$
BEGIN
    -- Pure cleaning trades with high confidence
    IF trade_in IN ('CLEANER', 'JANITORIAL', 'HOUSEKEEPING', 'COMMERCIAL_CLEANING', 'CLEANING_STAFF') THEN
        RETURN VALUES ('CLEANING', 'CLEANING_ONLY', 1.00);

    -- Pure maintenance trades with high confidence
    ELSIF trade_in IN ('PLUMBING', 'ELECTRICAL', 'HEATING', 'HVAC', 'APPLIANCES', 'ELECTRICIAN', 'PLUMBER') THEN
        RETURN VALUES ('MAINTENANCE', 'MAINTENANCE_ONLY', 1.00);

    -- Specialized maintenance trades
    ELSIF trade_in IN ('ROOFING', 'CARPENTRY', 'PAINTING', 'LANDSCAPING', 'CONCRETE') THEN
        RETURN VALUES ('MAINTENANCE', 'MAINTENANCE_ONLY', 0.95);

    -- Mixed or ambiguous trades - analyze work order history
    ELSE
        IF total_work_orders = 0 THEN
            -- No work order history, categorize by trade name analysis
            IF trade_in ~* 'CLEAN' THEN
                RETURN VALUES ('CLEANING', 'POTENTIAL_CLEANING', 0.70);
            ELSIF trade_in ~* 'MAINT|REPAIR|FIX|SERVICE' THEN
                RETURN VALUES ('MAINTENANCE', 'POTENTIAL_MAINTENANCE', 0.70);
            ELSE
                -- Default to maintenance for unknown trades
                RETURN VALUES ('MAINTENANCE', 'UNKNOWN_TRADE', 0.50);
            END IF;
        ELSE
            -- Analyze work order categories
            IF work_order_categories && ARRAY['PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'HVAC'] THEN
                RETURN VALUES ('MAINTENANCE', 'MAINTENANCE_PRIMARY', 0.90);
            ELSIF work_order_categories && ARRAY['INTERIOR'] AND
                 NOT (work_order_categories && ARRAY['PLUMBING', 'ELECTRICAL']) THEN
                RETURN VALUES ('CLEANING', 'CLEANING_PRIMARY', 0.85);
            ELSE
                -- Mixed categories - assign to maintenance as primary
                RETURN VALUES ('MAINTENANCE', 'MAINTENANCE_PRIMARY', 0.60);
            END IF;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Dual-service worker identification
CREATE OR REPLACE FUNCTION identify_dual_service_workers(
    contractor_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    cleaning_categories TEXT[] := ARRAY['INTERIOR'];
    maintenance_categories TEXT[] := ARRAY['PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'EXTERIOR'];
    worker_categories TEXT[];
    has_cleaning BOOLEAN := FALSE;
    has_maintenance BOOLEAN := FALSE;
BEGIN
    -- Get worker's work order categories
    SELECT ARRAY_AGG(DISTINCT category) INTO worker_categories
    FROM work_orders
    WHERE contractor_id = identify_dual_service_workers.contractor_id
    AND deleted_at IS NULL;

    -- Check for cleaning categories
    IF worker_categories && cleaning_categories THEN
        has_cleaning := TRUE;
    END IF;

    -- Check for maintenance categories
    IF worker_categories && maintenance_categories THEN
        has_maintenance := TRUE;
    END IF;

    -- Return true if has both types
    RETURN has_cleaning AND has_maintenance;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 5: DATA MIGRATION
-- =============================================================================

-- 5.1 Migrate contractor profiles to shared database
INSERT INTO shared_auth_db.shared_contractor_profiles (
    original_contractor_id, name, phone, email, company_name, sms_opt_out
)
SELECT
    id as original_contractor_id,
    name,
    phone,
    email,
    company_name,
    COALESCE(sms_opt_out, false) as sms_opt_out
FROM contractors
WHERE deleted_at IS NULL
ON CONFLICT (original_contractor_id) DO NOTHING;

-- 5.2 Analyze and categorize contractors
WITH contractor_analysis AS (
    SELECT
        c.id as contractor_id,
        c.tenant_id,
        c.trade,
        c.user_id,
        COALESCE(ARRAY_AGG(DISTINCT wo.category) FILTER (WHERE wo.category IS NOT NULL), ARRAY[]::TEXT[]) as categories,
        COUNT(wo.id) as total_work_orders,
        (c.created_at < CURRENT_DATE - INTERVAL '2 years') as is_experienced,
        (c.created_at < CURRENT_DATE - INTERVAL '5 years') as is_highly_experienced
    FROM contractors c
    LEFT JOIN work_orders wo ON c.id = wo.contractor_id AND wo.deleted_at IS NULL
    WHERE c.deleted_at IS NULL
    GROUP BY c.id, c.tenant_id, c.trade, c.user_id, c.created_at
),
service_assignments AS (
    SELECT
        ca.contractor_id,
        ca.tenant_id,
        ca.trade,
        ca.user_id,
        ca.categories,
        ca.total_work_orders,
        ca.is_experienced,
        ca.is_highly_experienced,
        (csa.service_type)::VARCHAR,
        (csa.contractor_type)::VARCHAR,
        (csa.confidence_score)::NUMERIC,
        identify_dual_service_workers(ca.contractor_id) as is_dual_service
    FROM contractor_analysis ca
    JOIN LATERAL categorize_worker_service(ca.trade, ca.categories, ca.total_work_orders)
         csa(service_type, contractor_type, confidence_score) ON true
)
-- Insert service assignments
INSERT INTO shared_auth_db.contractor_service_assignments (
    contractor_profile_id, service_type, trade, is_primary
)
SELECT
    scp.id as contractor_profile_id,
    sa.service_type,
    sa.trade,
    CASE
        WHEN sa.contractor_type = 'CLEANING_ONLY' OR sa.contractor_type = 'MAINTENANCE_ONLY' THEN true
        WHEN sa.service_type = 'MAINTENANCE' AND sa.contractor_type LIKE '%MAINTENANCE%' THEN true
        WHEN sa.service_type = 'CLEANING' AND sa.contractor_type LIKE '%CLEANING%' THEN true
        ELSE false
    END as is_primary
FROM service_assignments sa
JOIN contractors c ON sa.contractor_id = c.id
JOIN shared_auth_db.shared_contractor_profiles scp ON scp.original_contractor_id = c.id
WHERE sa.confidence_score >= 0.5  -- Only assign services with reasonable confidence
ON CONFLICT (contractor_profile_id, service_type) DO NOTHING;

-- 5.3 Handle dual-service workers
INSERT INTO shared_auth_db.cross_service_permissions (
    contractor_profile_id, primary_service, secondary_service, can_accept_secondary
)
SELECT
    scp.id as contractor_profile_id,
    sa.service_type as primary_service,
    CASE
        WHEN sa.service_type = 'MAINTENANCE' THEN 'CLEANING'
        WHEN sa.service_type = 'CLEANING' THEN 'MAINTENANCE'
        ELSE NULL
    END as secondary_service,
    sa.confidence_score >= 0.6 AND sa.is_dual_service as can_accept_secondary
FROM service_assignments sa
JOIN contractors c ON sa.contractor_id = c.id
JOIN shared_auth_db.shared_contractor_profiles scp ON scp.original_contractor_id = c.id
WHERE sa.is_dual_service = true
ON CONFLICT (contractor_profile_id) DO NOTHING;

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 6: SERVICE-SPECIFIC MIGRATION
-- =============================================================================

-- 6.1 Migrate workers to cleaning service database
INSERT INTO cleaning_db.cleaning_contractors (
    contractor_profile_id, tenant_id, user_id, trade, experience_years,
    certification_level, availability_schedule, preferred_property_types,
    average_job_time_minutes, quality_score_avg, reliability_score
)
SELECT
    csa.contractor_profile_id,
    c.tenant_id,
    c.user_id,
    c.trade,
    CASE
        WHEN c.created_at < CURRENT_DATE - INTERVAL '5 years' THEN 5
        WHEN c.created_at < CURRENT_DATE - INTERVAL '3 years' THEN 3
        WHEN c.created_at < CURRENT_DATE - INTERVAL '1 year' THEN 1
        ELSE 0
    END as experience_years,
    CASE
        WHEN c.created_at < CURRENT_DATE - INTERVAL '5 years' THEN 'ADVANCED'
        WHEN c.created_at < CURRENT_DATE - INTERVAL '2 years' THEN 'INTERMEDIATE'
        ELSE 'BASIC'
    END as certification_level,
    '{
        "monday": {"available": true, "hours": "09:00-17:00"},
        "tuesday": {"available": true, "hours": "09:00-17:00"},
        "wednesday": {"available": true, "hours": "09:00-17:00"},
        "thursday": {"available": true, "hours": "09:00-17:00"},
        "friday": {"available": true, "hours": "09:00-17:00"}
    }'::JSONB as availability_schedule,
    ARRAY['HOUSE', 'APARTMENT', 'CONDO']::TEXT[] as preferred_property_types,
    120 as average_job_time_minutes,
    -- Use average ratings from work orders if available
    COALESCE(
        (SELECT AVG(woc.customer_rating::NUMERIC)
         FROM work_orders wo
         LEFT JOIN work_order_completions woc ON wo.id = woc.work_order_id
         WHERE wo.contractor_id = c.id
         AND wo.deleted_at IS NULL
         AND woc.customer_rating IS NOT NULL),
        3.00
    ) as quality_score_avg,
    COALESCE(
        (SELECT AVG(CASE WHEN wo.completed_at <= wo.due_date THEN 1.0 ELSE 0.5 END)
         FROM work_orders wo
         WHERE wo.contractor_id = c.id
         AND wo.deleted_at IS NULL
         AND wo.status = 'COMPLETED'),
        0.80
    ) as reliability_score
FROM contractors c
JOIN shared_auth_db.contractor_service_assignments csa ON csa.contractor_profile_id = (
    SELECT scp.id FROM shared_auth_db.shared_contractor_profiles scp WHERE scp.original_contractor_id = c.id
)
WHERE csa.service_type = 'CLEANING'
AND c.deleted_at IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 6.2 Migrate workers to maintenance service database
INSERT INTO maintenance_db.maintenance_contractors (
    contractor_profile_id, tenant_id, user_id, trade, specializations,
    experience_years, hourly_rate, service_radius_km, is_available_emergency,
    average_job_time_hours, quality_score_avg, reliability_score
)
SELECT
    csa.contractor_profile_id,
    c.tenant_id,
    c.user_id,
    c.trade,
    CASE
        WHEN c.trade = 'PLUMBING' THEN ARRAY['PIPES', 'DRAINS', 'FIXTURES', 'WATER_HEATERS']
        WHEN c.trade = 'ELECTRICAL' THEN ARRAY['WIRING', 'PANELS', 'OUTLETS', 'LIGHTING']
        WHEN c.trade = 'HEATING' THEN ARRAY['FURNACES', 'BOILERS', 'THERMOSTATS', 'DUCTS']
        WHEN c.trade = 'APPLIANCES' THEN ARRAY['REFRIGERATORS', 'DISHWASHERS', 'WASHERS', 'DRYERS']
        ELSE ARRAY['GENERAL_REPAIR']
    END as specializations,
    CASE
        WHEN c.created_at < CURRENT_DATE - INTERVAL '10 years' THEN 10
        WHEN c.created_at < CURRENT_DATE - INTERVAL '5 years' THEN 5
        WHEN c.created_at < CURRENT_DATE - INTERVAL '2 years' THEN 2
        ELSE 1
    END as experience_years,
    CASE
        WHEN c.trade IN ('PLUMBING', 'ELECTRICAL') THEN 75.00
        WHEN c.trade IN ('HEATING', 'HVAC') THEN 85.00
        WHEN c.trade = 'APPLIANCES' THEN 65.00
        ELSE 45.00
    END as hourly_rate,
    50 as service_radius_km,
    CASE
        WHEN c.trade IN ('PLUMBING', 'ELECTRICAL') AND c.created_at < CURRENT_DATE - INTERVAL '2 years'
        THEN true ELSE false
    END as is_available_emergency,
    CASE
        WHEN c.trade IN ('PLUMBING', 'ELECTRICAL') THEN 3.00
        WHEN c.trade = 'APPLIANCES' THEN 2.50
        ELSE 2.00
    END as average_job_time_hours,
    -- Use average ratings from work orders if available
    COALESCE(
        (SELECT AVG(woc.customer_rating::NUMERIC)
         FROM work_orders wo
         LEFT JOIN work_order_completions woc ON wo.id = woc.work_order_id
         WHERE wo.contractor_id = c.id
         AND wo.deleted_at IS NULL
         AND woc.customer_rating IS NOT NULL),
        3.00
    ) as quality_score_avg,
    COALESCE(
        (SELECT AVG(CASE WHEN wo.completed_at <= wo.due_date THEN 1.0 ELSE 0.5 END)
         FROM work_orders wo
         WHERE wo.contractor_id = c.id
         AND wo.deleted_at IS NULL
         AND wo.status = 'COMPLETED'),
        0.80
    ) as reliability_score
FROM contractors c
JOIN shared_auth_db.contractor_service_assignments csa ON csa.contractor_profile_id = (
    SELECT scp.id FROM shared_auth_db.shared_contractor_profiles scp WHERE scp.original_contractor_id = c.id
)
WHERE csa.service_type = 'MAINTENANCE'
AND c.deleted_at IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 7: MIGRATION VALIDATION
-- =============================================================================

-- 7.1 Migration summary
WITH migration_summary AS (
    SELECT
        'CONTRACTORS_PROCESSED' as metric,
        COUNT(*) as count
    FROM contractors
    WHERE deleted_at IS NULL

    UNION ALL

    SELECT
        'SHARED_PROFILES_CREATED' as metric,
        COUNT(*) as count
    FROM shared_auth_db.shared_contractor_profiles

    UNION ALL

    SELECT
        'CLEANING_ASSIGNMENTS' as metric,
        COUNT(*) as count
    FROM shared_auth_db.contractor_service_assignments
    WHERE service_type = 'CLEANING'

    UNION ALL

    SELECT
        'MAINTENANCE_ASSIGNMENTS' as metric,
        COUNT(*) as count
    FROM shared_auth_db.contractor_service_assignments
    WHERE service_type = 'MAINTENANCE'

    UNION ALL

    SELECT
        'DUAL_SERVICE_WORKERS' as metric,
        COUNT(*) as count
    FROM shared_auth_db.cross_service_permissions
    WHERE secondary_service IS NOT NULL
)
SELECT * FROM migration_summary;

-- 7.2 Data integrity checks
SELECT
    'MISSING_SHARED_PROFILES' as check_name,
    COUNT(*) as issue_count
FROM contractors c
WHERE deleted_at IS NULL
AND NOT EXISTS (
    SELECT 1 FROM shared_auth_db.shared_contractor_profiles scp
    WHERE scp.original_contractor_id = c.id
)

UNION ALL

SELECT
    'CONTRACTORS_WITHOUT_ASSIGNMENTS' as check_name,
    COUNT(*) as issue_count
FROM shared_auth_db.shared_contractor_profiles scp
WHERE NOT EXISTS (
    SELECT 1 FROM shared_auth_db.contractor_service_assignments csa
    WHERE csa.contractor_profile_id = scp.id
)

UNION ALL

SELECT
    'CLEANING_WORKERS_MISMATCH' as check_name,
    COUNT(*) as issue_count
FROM shared_auth_db.contractor_service_assignments csa
WHERE service_type = 'CLEANING'
AND NOT EXISTS (
    SELECT 1 FROM cleaning_db.cleaning_contractors cc
    WHERE cc.contractor_profile_id = csa.contractor_profile_id
)

UNION ALL

SELECT
    'MAINTENANCE_WORKERS_MISMATCH' as check_name,
    COUNT(*) as issue_count
FROM shared_auth_db.contractor_service_assignments csa
WHERE service_type = 'MAINTENANCE'
AND NOT EXISTS (
    SELECT 1 FROM maintenance_db.maintenance_contractors mc
    WHERE mc.contractor_profile_id = csa.contractor_profile_id
);

-- =============================================================================
-- WORKER SEPARATION MIGRATION - PHASE 8: POST-MIGRATION INDEXES
-- =============================================================================

-- 8.1 Cleaning service indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_contractors_tenant
ON cleaning_db.cleaning_contractors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_contractors_trade
ON cleaning_db.cleaning_contractors(trade);
CREATE INDEX IF NOT EXISTS idx_cleaning_contractors_profile
ON cleaning_db.cleaning_contractors(contractor_profile_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_contractors_experience
ON cleaning_db.cleaning_contractors(experience_years DESC);
CREATE INDEX IF NOT EXISTS idx_cleaning_contractors_quality
ON cleaning_db.cleaning_contractors(quality_score_avg DESC);

-- 8.2 Maintenance service indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_contractors_tenant
ON maintenance_db.maintenance_contractors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_contractors_trade
ON maintenance_db.maintenance_contractors(trade);
CREATE INDEX IF NOT EXISTS idx_maintenance_contractors_profile
ON maintenance_db.maintenance_contractors(contractor_profile_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_contractors_license
ON maintenance_db.maintenance_contractors(license_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_contractors_experience
ON maintenance_db.maintenance_contractors(experience_years DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_contractors_quality
ON maintenance_db.maintenance_contractors(quality_score_avg DESC);

-- 8.3 Shared authentication indexes
CREATE INDEX IF NOT EXISTS idx_shared_contractor_original_id
ON shared_auth_db.shared_contractor_profiles(original_contractor_id);
CREATE INDEX IF NOT EXISTS idx_service_assignments_profile
ON shared_auth_db.contractor_service_assignments(contractor_profile_id);
CREATE INDEX IF NOT EXISTS idx_service_assignments_type
ON shared_auth_db.contractor_service_assignments(service_type);
CREATE INDEX IF NOT EXISTS idx_cross_service_primary
ON shared_auth_db.cross_service_permissions(primary_service);

-- =============================================================================
-- MIGRATION COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== WORKER SEPARATION MIGRATION COMPLETED ===';
    RAISE NOTICE 'Shared contractor profiles created in shared authentication database';
    RAISE NOTICE 'Workers categorized and assigned to appropriate services';
    RAISE NOTICE 'Enhanced worker management tables created for both services';
    RAISE NOTICE 'Performance metrics and skills tracking enabled';
    RAISE NOTICE 'Cross-service worker permissions established';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update API endpoints to use new worker tables';
    RAISE NOTICE '2. Update frontend contractor management interfaces';
    RAISE NOTICE '3. Test worker functionality in both services';
    RAISE NOTICE '4. Train staff on separated worker management';
END $$;