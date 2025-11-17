-- Job Management Separation Migration Script
-- This script separates job management data between cleaning and maintenance services
-- while preserving operational workflows and enabling cross-service coordination

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 1: SERVICE-SPECIFIC JOB TABLES
-- =============================================================================

-- 1.1 Create shared job reference system
CREATE TABLE IF NOT EXISTS shared_job_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_work_order_id UUID NOT NULL,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('CLEANING', 'MAINTENANCE')),
    service_job_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(original_work_order_id, service_type),
    INDEX idx_shared_job_references_original (original_work_order_id),
    INDEX idx_shared_job_references_service (service_job_id, service_type)
);

-- 1.2 Cross-service property job relationships
CREATE TABLE IF NOT EXISTS cross_service_property_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    cleaning_job_id UUID,
    maintenance_work_order_id UUID,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('SEQUENTIAL', 'PARALLEL', 'DEPENDENT')),
    dependency_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_cross_service_property (property_id),
    INDEX idx_cross_service_cleaning (cleaning_job_id),
    INDEX idx_cross_service_maintenance (maintenance_work_order_id)
);

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 2: CLEANING SERVICE DATABASE
-- =============================================================================

-- 2.1 Enhanced cleaning jobs table
CREATE TABLE IF NOT EXISTS cleaning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_reference_id UUID UNIQUE, -- Reference to original work_order
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL,
    contractor_id UUID,
    created_by_user_id UUID NOT NULL,

    -- Job identification
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT,
    job_type VARCHAR(50) NOT NULL,
    cleaning_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (cleaning_level IN ('LIGHT', 'STANDARD', 'DEEP', 'SPECIALIZED')),

    -- Job scheduling
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME,
    estimated_duration_minutes INTEGER DEFAULT 120,
    actual_duration_minutes INTEGER,
    cleaning_team_size INTEGER DEFAULT 1,

    -- Job status and priority
    job_status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (job_status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
    priority_level VARCHAR(10) DEFAULT 'NORMAL' CHECK (priority_level IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    -- Job scope and requirements
    room_count INTEGER DEFAULT 1,
    bathroom_count INTEGER DEFAULT 0,
    square_footage INTEGER,
    special_requirements TEXT[] DEFAULT '{}',
    cleaning_supplies_provided BOOLEAN DEFAULT true,
    equipment_needed TEXT[] DEFAULT '{}',

    -- Quality control
    quality_checklist JSONB DEFAULT '{}',
    inspection_required BOOLEAN DEFAULT false,
    inspection_completed BOOLEAN DEFAULT false,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),

    -- Financial information
    base_price DECIMAL(10,2),
    additional_charges DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'OVERDUE', 'DISPUTED')),

    -- Customer feedback
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    follow_up_required BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_cleaning_jobs_property FOREIGN KEY (property_id) REFERENCES cleaning_db.cleaning_properties(id),
    CONSTRAINT fk_cleaning_jobs_contractor FOREIGN KEY (contractor_id) REFERENCES cleaning_db.cleaning_contractors(id),
    CONSTRAINT fk_cleaning_jobs_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id)
);

-- 2.2 Cleaning job tasks checklist
CREATE TABLE IF NOT EXISTS cleaning_job_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    task_name VARCHAR(100) NOT NULL,
    task_category VARCHAR(50) NOT NULL CHECK (task_category IN ('SURFACE_CLEANING', 'FLOOR_CARE', 'BATHROOM', 'KITCHEN', 'GENERAL', 'SPECIALIZED')),
    is_required BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    completion_notes TEXT,
    completed_by_user_id UUID,
    completed_at TIMESTAMP,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),

    UNIQUE(job_id, task_name),
    INDEX idx_cleaning_tasks_job (job_id),
    INDEX idx_cleaning_tasks_category (task_category)
);

-- 2.3 Cleaning task templates
CREATE TABLE IF NOT EXISTS cleaning_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,
    cleaning_level VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) CHECK (room_type IN ('BEDROOM', 'BATHROOM', 'KITCHEN', 'LIVING_ROOM', 'DINING_ROOM', 'OFFICE', 'ALL')),
    tasks JSONB NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_cleaning_templates_level (cleaning_level),
    INDEX idx_cleaning_templates_room (room_type)
);

-- 2.4 Cleaning job status transitions
CREATE TABLE IF NOT EXISTS cleaning_job_status_transitions (
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    is_allowed BOOLEAN DEFAULT true,
    requires_confirmation BOOLEAN DEFAULT false,
    auto_transition BOOLEAN DEFAULT false,
    transition_notes TEXT,

    PRIMARY KEY (from_status, to_status)
);

-- 2.5 Insert cleaning job status transitions
INSERT INTO cleaning_job_status_transitions VALUES
    ('SCHEDULED', 'IN_PROGRESS', true, false, false, 'Contractor starts cleaning'),
    ('IN_PROGRESS', 'COMPLETED', true, false, false, 'Cleaning completed'),
    ('IN_PROGRESS', 'RESCHEDULED', true, true, false, 'Job needs rescheduling'),
    ('SCHEDULED', 'CANCELLED', true, true, false, 'Customer cancelled'),
    ('RESCHEDULED', 'SCHEDULED', true, false, false, 'New date assigned'),
    ('COMPLETED', 'COMPLETED', true, false, true, 'Final quality check passed')
ON CONFLICT (from_status, to_status) DO NOTHING;

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 3: MAINTENANCE SERVICE DATABASE
-- =============================================================================

-- 3.1 Enhanced maintenance work orders table
CREATE TABLE IF NOT EXISTS maintenance_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_reference_id UUID UNIQUE, -- Reference to original work_order
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL,
    contractor_id UUID,
    created_by_user_id UUID NOT NULL,

    -- Work order identification
    title VARCHAR(255) NOT NULL,
    description TEXT,
    work_type VARCHAR(50) NOT NULL,
    trade_category VARCHAR(50) NOT NULL,
    complexity_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (complexity_level IN ('SIMPLE', 'STANDARD', 'COMPLEX', 'SPECIALIZED')),

    -- Work scheduling
    scheduled_date DATE,
    scheduled_start_time TIME,
    estimated_duration_hours DECIMAL(4,2) DEFAULT 2.00,
    actual_duration_hours DECIMAL(4,2),
    priority_level VARCHAR(10) DEFAULT 'NORMAL' CHECK (priority_level IN ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY')),
    is_emergency BOOLEAN DEFAULT false,

    -- Work status
    work_status VARCHAR(20) DEFAULT 'OPEN' CHECK (work_status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'REJECTED')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    -- Technical details
    problem_description TEXT,
    diagnosis TEXT,
    solution_description TEXT,
    parts_required TEXT[] DEFAULT '{}',
    parts_used TEXT[] DEFAULT '{}',
    tools_required TEXT[] DEFAULT '{}',
    safety_precautions TEXT[] DEFAULT '{}',

    -- Permit and compliance
    permit_required BOOLEAN DEFAULT false,
    permit_obtained BOOLEAN DEFAULT false,
    permit_number VARCHAR(100),
    inspection_required BOOLEAN DEFAULT false,
    inspection_passed BOOLEAN DEFAULT false,
    compliance_notes TEXT,

    -- Financial information
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2) DEFAULT 0.00,
    permit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2),
    invoice_status VARCHAR(20) DEFAULT 'DRAFT' CHECK (invoice_status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'DISPUTED')),

    -- Customer satisfaction
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    warranty_period_days INTEGER DEFAULT 30,
    warranty_expiry DATE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_maintenance_work_orders_property FOREIGN KEY (property_id) REFERENCES maintenance_db.maintenance_properties(id),
    CONSTRAINT fk_maintenance_work_orders_contractor FOREIGN KEY (contractor_id) REFERENCES maintenance_db.maintenance_contractors(id),
    CONSTRAINT fk_maintenance_work_orders_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id)
);

-- 3.2 Maintenance work order progress tracking
CREATE TABLE IF NOT EXISTS maintenance_work_order_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES maintenance_work_orders(id) ON DELETE CASCADE,
    progress_stage VARCHAR(50) NOT NULL,
    stage_description TEXT,
    is_completed BOOLEAN DEFAULT false,
    completion_notes TEXT,
    completed_by_user_id UUID,
    completed_at TIMESTAMP,
    photos_taken TEXT[] DEFAULT '{}',

    INDEX idx_maintenance_progress_work_order (work_order_id),
    INDEX idx_maintenance_progress_stage (progress_stage)
);

-- 3.3 Maintenance status transitions
CREATE TABLE IF NOT EXISTS maintenance_status_transitions (
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    is_allowed BOOLEAN DEFAULT true,
    requires_confirmation BOOLEAN DEFAULT false,
    requires_supervisor BOOLEAN DEFAULT false,
    transition_notes TEXT,

    PRIMARY KEY (from_status, to_status)
);

-- 3.4 Insert maintenance status transitions
INSERT INTO maintenance_status_transitions VALUES
    ('OPEN', 'ASSIGNED', true, false, false, 'Contractor assigned'),
    ('ASSIGNED', 'IN_PROGRESS', true, false, false, 'Work started'),
    ('IN_PROGRESS', 'ON_HOLD', true, true, false, 'Work paused'),
    ('ON_HOLD', 'IN_PROGRESS', true, false, false, 'Work resumed'),
    ('IN_PROGRESS', 'COMPLETED', true, false, false, 'Work completed'),
    ('OPEN', 'REJECTED', true, true, true, 'Work order rejected'),
    ('COMPLETED', 'COMPLETED', true, false, true, 'Inspection passed')
ON CONFLICT (from_status, to_status) DO NOTHING;

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 4: JOB CATEGORIZATION FUNCTIONS
-- =============================================================================

-- 4.1 Job categorization function
CREATE OR REPLACE FUNCTION categorize_job_service(
    job_category_in VARCHAR,
    job_title_in VARCHAR,
    job_description_in VARCHAR,
    job_priority_in VARCHAR DEFAULT 'MEDIUM'
) RETURNS TABLE(service_type VARCHAR, job_type VARCHAR, confidence_score NUMERIC, priority_level VARCHAR) AS $$
BEGIN
    -- Determine priority level
    RETURN QUERY
    -- Cleaning-specific patterns with high confidence
    SELECT 'CLEANING'::VARCHAR,
           CASE
               WHEN job_title_in ~* 'DEEP.*CLEAN|THOROUGH.*CLEAN|MOVE.*IN|MOVE.*OUT' THEN 'DEEP_CLEANING'::VARCHAR
               WHEN job_title_in ~* 'WINDOW|GLASS' OR job_description_in ~* 'WINDOW|GLASS' THEN 'WINDOW_CLEANING'::VARCHAR
               WHEN job_title_in ~* 'CARPET|UPHOLSTERY|RUG' OR job_description_in ~* 'CARPET|UPHOLSTERY|RUG' THEN 'CARPET_CLEANING'::VARCHAR
               WHEN job_title_in ~* 'POST.*CONSTRUCTION|CONSTRUCTION.*CLEAN' THEN 'POST_CONSTRUCTION_CLEAN'::VARCHAR
               ELSE 'REGULAR_CLEANING'::VARCHAR
           END as job_type,
           0.95::NUMERIC as confidence_score,
           CASE
               WHEN job_priority_in = 'HIGH' OR job_title_in ~* 'URGENT|EMERGENCY' THEN 'HIGH'::VARCHAR
               WHEN job_priority_in = 'LOW' THEN 'LOW'::VARCHAR
               ELSE 'NORMAL'::VARCHAR
           END as priority_level
    WHERE job_category_in = 'INTERIOR' AND (
        job_title_in ~* 'CLEAN|SANIT|WASH|VACUUM|MOP|DUST' OR
        job_description_in ~* 'CLEAN|SANIT|WASH|VACUUM|MOP|DUST'
    )

    UNION ALL

    -- Maintenance-specific patterns with high confidence
    SELECT 'MAINTENANCE'::VARCHAR,
           CASE
               WHEN job_category_in = 'PLUMBING' THEN 'PLUMBING_REPAIR'::VARCHAR
               WHEN job_category_in = 'ELECTRICAL' THEN 'ELECTRICAL_REPAIR'::VARCHAR
               WHEN job_category_in = 'HEATING' THEN 'HVAC_MAINTENANCE'::VARCHAR
               WHEN job_category_in = 'APPLIANCES' THEN 'APPLIANCE_REPAIR'::VARCHAR
               WHEN job_category_in = 'EXTERIOR' THEN 'EXTERIOR_MAINTENANCE'::VARCHAR
               ELSE 'INTERIOR_REPAIRS'::VARCHAR
           END as job_type,
           1.00::NUMERIC as confidence_score,
           CASE
               WHEN job_priority_in = 'HIGH' OR job_title_in ~* 'EMERGENCY|URGENT' THEN 'URGENT'::VARCHAR
               WHEN job_priority_in = 'LOW' THEN 'LOW'::VARCHAR
               ELSE 'NORMAL'::VARCHAR
           END as priority_level
    WHERE job_category_in IN ('PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'EXTERIOR')

    UNION ALL

    -- Emergency/urgent maintenance patterns
    SELECT 'MAINTENANCE'::VARCHAR,
           'EMERGENCY_REPAIR'::VARCHAR as job_type,
           0.90::NUMERIC as confidence_score,
           'EMERGENCY'::VARCHAR as priority_level
    WHERE job_title_in ~* 'EMERGENCY|URGENT|IMMEDIATE|ASAP' OR
          job_description_in ~* 'EMERGENCY|URGENT|IMMEDIATE|ASAP'

    UNION ALL

    -- Preventive maintenance patterns
    SELECT 'MAINTENANCE'::VARCHAR,
           'PREVENTIVE_MAINTENANCE'::VARCHAR as job_type,
           0.80::NUMERIC as confidence_score,
           CASE
               WHEN job_priority_in = 'HIGH' THEN 'HIGH'::VARCHAR
               WHEN job_priority_in = 'LOW' THEN 'LOW'::VARCHAR
               ELSE 'NORMAL'::VARCHAR
           END as priority_level
    WHERE job_title_in ~* 'PREVENTIVE|SCHEDULED|ROUTINE|MAINTENANCE'

    UNION ALL

    -- Default categorization with lower confidence
    SELECT
        CASE
            WHEN job_title_in ~* 'REPAIR|FIX|SERVICE|INSTALL' THEN 'MAINTENANCE'::VARCHAR
            WHEN job_title_in ~* 'CLEAN|WASH|MOP|DUST' THEN 'CLEANING'::VARCHAR
            ELSE 'MAINTENANCE'::VARCHAR -- Default to maintenance for unknown jobs
        END as service_type,
        CASE
            WHEN job_title_in ~* 'REPAIR|FIX' THEN 'INTERIOR_REPAIRS'::VARCHAR
            WHEN job_title_in ~* 'CLEAN' THEN 'SPECIALIZED_CLEAN'::VARCHAR
            ELSE 'INTERIOR_REPAIRS'::VARCHAR
        END as job_type,
        0.50::NUMERIC as confidence_score,
        job_priority_in as priority_level;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Job assignment optimization function
CREATE OR REPLACE FUNCTION assign_job_to_contractor(
    job_id UUID,
    service_type VARCHAR,
    preferred_contractor_id UUID DEFAULT NULL,
    required_skills TEXT[] DEFAULT NULL
) RETURNS TABLE(contractor_id UUID, assignment_score NUMERIC, estimated_start TIMESTAMP, availability_conflicts TEXT[]) AS $$
DECLARE
    best_contractor UUID;
    best_score NUMERIC := 0;
    estimated_start_time TIMESTAMP;
    conflicts TEXT[] := ARRAY[]::TEXT[];
BEGIN
    IF service_type = 'CLEANING' THEN
        -- Find best cleaning contractor
        SELECT cc.id,
               (cc.quality_score_avg * 0.4 +
                cc.reliability_score * 0.3 +
                CASE WHEN required_skills IS NOT NULL THEN
                    (SELECT COUNT(*) FROM unnest(required_skills) skill
                     JOIN unnest(cc.skills) cc_skill ON skill = cc_skill)::NUMERIC / array_length(required_skills, 1) * 0.3
                ELSE 0.3 END) as score
        INTO best_contractor, best_score
        FROM cleaning_contractors cc
        WHERE cc.deleted_at IS NULL
        AND (preferred_contractor_id IS NULL OR cc.id = preferred_contractor_id)
        AND (required_skills IS NULL OR cc.skills && required_skills)
        ORDER BY score DESC
        LIMIT 1;

        -- Check availability and calculate conflicts
        SELECT ARRAY_AGG(conflict_details)
        INTO conflicts
        FROM (
            SELECT 'Cleaning job already scheduled: ' || cj.job_title as conflict_details
            FROM cleaning_jobs cj
            WHERE cj.contractor_id = best_contractor
            AND cj.scheduled_date = CURRENT_DATE
            AND cj.job_status IN ('SCHEDULED', 'IN_PROGRESS')
        ) conf
        LIMIT 5;

        -- Estimate start time based on current schedule
        SELECT MIN(scheduled_date || ' ' || COALESCE(scheduled_start_time, '09:00')::TIME)::TIMESTAMP
        INTO estimated_start_time
        FROM cleaning_jobs
        WHERE contractor_id = best_contractor
        AND scheduled_date >= CURRENT_DATE
        AND job_status = 'SCHEDULED'
        ORDER BY scheduled_date, scheduled_start_time
        LIMIT 1;

        IF estimated_start_time IS NULL THEN
            estimated_start_time := CURRENT_TIMESTAMP + INTERVAL '1 day';
        END IF;

    ELSIF service_type = 'MAINTENANCE' THEN
        -- Find best maintenance contractor
        SELECT mc.id,
               (mc.quality_score_avg * 0.4 +
                mc.reliability_score * 0.3 +
                CASE WHEN mc.is_available_emergency THEN 0.3 ELSE 0.2 END) as score
        INTO best_contractor, best_score
        FROM maintenance_contractors mc
        WHERE mc.deleted_at IS NULL
        AND (preferred_contractor_id IS NULL OR mc.id = preferred_contractor_id)
        ORDER BY score DESC
        LIMIT 1;

        -- Check availability conflicts
        SELECT ARRAY_AGG(conflict_details)
        INTO conflicts
        FROM (
            SELECT 'Maintenance work already scheduled: ' || mwo.title as conflict_details
            FROM maintenance_work_orders mwo
            WHERE mwo.contractor_id = best_contractor
            AND mwo.scheduled_date = CURRENT_DATE
            AND mwo.work_status IN ('ASSIGNED', 'IN_PROGRESS')
        ) conf
        LIMIT 5;

        -- Calculate start time considering priority and emergency status
        IF EXISTS(SELECT 1 FROM maintenance_work_orders WHERE id = assign_job_to_contractor.job_id AND is_emergency = true) THEN
            estimated_start_time := CURRENT_TIMESTAMP;
        ELSE
            estimated_start_time := CURRENT_TIMESTAMP + INTERVAL '1 day';
        END IF;
    END IF;

    RETURN QUERY SELECT best_contractor, best_score, estimated_start_time, conflicts;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 5: DATA MIGRATION
-- =============================================================================

-- 5.1 Analyze existing work orders for categorization
WITH work_order_analysis AS (
    SELECT
        wo.id as work_order_id,
        wo.tenant_id,
        wo.property_id,
        wo.contractor_id,
        wo.created_by_user_id,
        wo.title,
        wo.description,
        wo.category::VARCHAR as category,
        wo.status::VARCHAR as status,
        wo.priority::VARCHAR as priority,
        wo.due_date,
        wo.estimated_cost,
        wo.actual_cost,
        wo.started_at,
        wo.completed_at,
        wo.completion_note,
        wo.cancellation_reason,
        wo.created_at,
        wo.updated_at,
        (cs.service_type)::VARCHAR,
        (cs.job_type)::VARCHAR,
        (cs.confidence_score)::NUMERIC,
        (cs.priority_level)::VARCHAR as new_priority
    FROM work_orders wo
    LEFT JOIN LATERAL categorize_job_service(wo.category::VARCHAR, wo.title, COALESCE(wo.description, ''), wo.priority::VARCHAR)
         cs(service_type, job_type, confidence_score, priority_level) ON true
    WHERE wo.deleted_at IS NULL
)
-- Select the migration data
SELECT
    work_order_id,
    tenant_id,
    property_id,
    contractor_id,
    created_by_user_id,
    title,
    description,
    service_type,
    job_type,
    new_priority,
    confidence_score,
    status,
    due_date,
    estimated_cost,
    actual_cost,
    started_at,
    completed_at,
    completion_note,
    cancellation_reason,
    created_at,
    updated_at
FROM work_order_analysis
ORDER BY confidence_score DESC, created_at DESC;

-- 5.2 Migrate work orders to cleaning service
INSERT INTO cleaning_db.cleaning_jobs (
    job_reference_id, tenant_id, property_id, contractor_id, created_by_user_id,
    job_title, job_description, job_type, cleaning_level, scheduled_date, scheduled_start_time,
    estimated_duration_minutes, job_status, priority_level, base_price, additional_charges,
    total_price, payment_status, customer_rating, customer_feedback,
    created_at, updated_at, started_at, completed_at, cancelled_at
)
WITH cleaning_work_orders AS (
    SELECT
        wo.*,
        cs.service_type,
        cs.job_type,
        cs.confidence_score,
        cs.new_priority
    FROM work_orders wo
    JOIN LATERAL categorize_job_service(wo.category::VARCHAR, wo.title, COALESCE(wo.description, ''), wo.priority::VARCHAR)
         cs(service_type, job_type, confidence_score, priority_level) ON true
    WHERE wo.deleted_at IS NULL
    AND cs.service_type = 'CLEANING'
    AND cs.confidence_score >= 0.6
)
SELECT
    wo.id as job_reference_id,
    wo.tenant_id,
    wo.property_id,
    wo.contractor_id,
    wo.created_by_user_id,
    wo.title as job_title,
    wo.description as job_description,
    cwo.job_type,
    CASE
        WHEN cwo.job_type IN ('DEEP_CLEANING', 'POST_CONSTRUCTION_CLEAN') THEN 'DEEP'
        WHEN cwo.job_type IN ('WINDOW_CLEANING', 'CARPET_CLEANING') THEN 'SPECIALIZED'
        ELSE 'STANDARD'
    END as cleaning_level,
    COALESCE(wo.due_date::DATE, wo.created_at::DATE) as scheduled_date,
    CASE WHEN wo.started_at IS NOT NULL THEN wo.started_at::TIME ELSE '09:00'::TIME END as scheduled_start_time,
    CASE
        WHEN cwo.job_type = 'DEEP_CLEANING' THEN 240
        WHEN cwo.job_type = 'POST_CONSTRUCTION_CLEAN' THEN 300
        WHEN cwo.job_type IN ('WINDOW_CLEANING', 'CARPET_CLEANING') THEN 180
        ELSE 120
    END as estimated_duration_minutes,
    CASE
        WHEN wo.status = 'OPEN' THEN 'SCHEDULED'
        WHEN wo.status = 'IN_PROGRESS' THEN 'IN_PROGRESS'
        WHEN wo.status = 'COMPLETED' THEN 'COMPLETED'
        WHEN wo.status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'SCHEDULED'
    END as job_status,
    cwo.new_priority as priority_level,
    wo.estimated_cost as base_price,
    0.00 as additional_charges,
    COALESCE(wo.actual_cost, wo.estimated_cost, 0) as total_price,
    CASE
        WHEN wo.actual_cost IS NOT NULL THEN 'PAID'
        ELSE 'PENDING'
    END as payment_status,
    NULL::INTEGER as customer_rating, -- Will be populated from customer feedback
    wo.completion_note as customer_feedback,
    wo.created_at,
    wo.updated_at,
    wo.started_at,
    wo.completed_at,
    CASE WHEN wo.status = 'CANCELLED' THEN wo.updated_at ELSE NULL END as cancelled_at
FROM cleaning_work_orders cwo
JOIN work_orders wo ON wo.id = cwo.work_order_id;

-- 5.3 Migrate work orders to maintenance service
INSERT INTO maintenance_db.maintenance_work_orders (
    work_order_reference_id, tenant_id, property_id, contractor_id, created_by_user_id,
    title, description, work_type, trade_category, complexity_level, scheduled_date, scheduled_start_time,
    estimated_duration_hours, work_status, priority_level, is_emergency,
    problem_description, diagnosis, solution_description,
    labor_cost, parts_cost, total_cost, invoice_status,
    customer_rating, customer_feedback,
    created_at, updated_at, assigned_at, started_at, completed_at, cancelled_at
)
WITH maintenance_work_orders AS (
    SELECT
        wo.*,
        cs.service_type,
        cs.job_type,
        cs.confidence_score,
        cs.new_priority
    FROM work_orders wo
    JOIN LATERAL categorize_job_service(wo.category::VARCHAR, wo.title, COALESCE(wo.description, ''), wo.priority::VARCHAR)
         cs(service_type, job_type, confidence_score, priority_level) ON true
    WHERE wo.deleted_at IS NULL
    AND cs.service_type = 'MAINTENANCE'
    AND cs.confidence_score >= 0.6
)
SELECT
    wo.id as work_order_reference_id,
    wo.tenant_id,
    wo.property_id,
    wo.contractor_id,
    wo.created_by_user_id,
    wo.title,
    wo.description as description,
    mwo.job_type as work_type,
    wo.category::VARCHAR as trade_category,
    CASE
        WHEN mwo.job_type = 'EMERGENCY_REPAIR' THEN 'SPECIALIZED'
        WHEN wo.category::VARCHAR IN ('PLUMBING', 'ELECTRICAL') THEN 'COMPLEX'
        ELSE 'STANDARD'
    END as complexity_level,
    wo.due_date::DATE as scheduled_date,
    CASE WHEN wo.started_at IS NOT NULL THEN wo.started_at::TIME ELSE '09:00'::TIME END as scheduled_start_time,
    CASE
        WHEN mwo.job_type = 'EMERGENCY_REPAIR' THEN 1.0
        WHEN wo.category::VARCHAR IN ('PLUMBING', 'ELECTRICAL') THEN 3.0
        ELSE 2.0
    END as estimated_duration_hours,
    CASE
        WHEN wo.status = 'OPEN' THEN 'OPEN'
        WHEN wo.status = 'IN_PROGRESS' THEN 'IN_PROGRESS'
        WHEN wo.status = 'COMPLETED' THEN 'COMPLETED'
        WHEN wo.status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'OPEN'
    END as work_status,
    mwo.new_priority as priority_level,
    CASE WHEN mwo.new_priority = 'EMERGENCY' OR mwo.job_type = 'EMERGENCY_REPAIR' THEN true ELSE false END as is_emergency,
    wo.description as problem_description,
    NULL as diagnosis, -- Will be populated during work execution
    NULL as solution_description, -- Will be populated during work execution
    COALESCE(wo.estimated_cost, wo.actual_cost, 0) as labor_cost,
    0.00 as parts_cost,
    COALESCE(wo.actual_cost, wo.estimated_cost, 0) as total_cost,
    CASE
        WHEN wo.actual_cost IS NOT NULL THEN 'SENT'
        ELSE 'DRAFT'
    END as invoice_status,
    NULL::INTEGER as customer_rating, -- Will be populated from customer feedback
    wo.completion_note as customer_feedback,
    wo.created_at,
    wo.updated_at,
    CASE WHEN wo.contractor_id IS NOT NULL THEN wo.created_at ELSE NULL END as assigned_at,
    wo.started_at,
    wo.completed_at,
    CASE WHEN wo.status = 'CANCELLED' THEN wo.updated_at ELSE NULL END as cancelled_at
FROM maintenance_work_orders mwo
JOIN work_orders wo ON wo.id = mwo.work_order_id;

-- 5.4 Create shared job references
INSERT INTO shared_job_references (original_work_order_id, service_type, service_job_id)
SELECT
    wo.id as original_work_order_id,
    'CLEANING' as service_type,
    cj.id as service_job_id
FROM work_orders wo
JOIN cleaning_db.cleaning_jobs cj ON cj.job_reference_id = wo.id
WHERE wo.deleted_at IS NULL

UNION ALL

SELECT
    wo.id as original_work_order_id,
    'MAINTENANCE' as service_type,
    mwo.id as service_job_id
FROM work_orders wo
JOIN maintenance_db.maintenance_work_orders mwo ON mwo.work_order_reference_id = wo.id
WHERE wo.deleted_at IS NULL;

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 6: CLEANING TASK SETUP
-- =============================================================================

-- 6.1 Insert cleaning task templates
INSERT INTO cleaning_db.cleaning_task_templates (template_name, cleaning_level, room_type, tasks, estimated_duration_minutes) VALUES
    ('Standard Bedroom Cleaning', 'STANDARD', 'BEDROOM', '[
        {"task_name": "Dust all surfaces", "task_category": "SURFACE_CLEANING", "is_required": true},
        {"task_name": "Clean mirrors and windows", "task_category": "SURFACE_CLEANING", "is_required": true},
        {"task_name": "Vacuum carpets", "task_category": "FLOOR_CARE", "is_required": true},
        {"task_name": "Clean bedside tables", "task_category": "SURFACE_CLEANING", "is_required": true},
        {"task_name": "Organize closet if requested", "task_category": "GENERAL", "is_required": false}
    ]', 45),

    ('Deep Bathroom Cleaning', 'DEEP', 'BATHROOM', '[
        {"task_name": "Scrub and disinfect toilet", "task_category": "BATHROOM", "is_required": true},
        {"task_name": "Clean shower and bathtub", "task_category": "BATHROOM", "is_required": true},
        {"task_name": "Clean sink and countertop", "task_category": "BATHROOM", "is_required": true},
        {"task_name": "Clean mirrors", "task_category": "BATHROOM", "is_required": true},
        {"task_name": "Mop floor", "task_category": "FLOOR_CARE", "is_required": true},
        {"task_name": "Clean grout lines", "task_category": "SPECIALIZED", "is_required": true},
        {"task_name": "Clean exhaust fan", "task_category": "SPECIALIZED", "is_required": false}
    ]', 60),

    ('Standard Kitchen Cleaning', 'STANDARD', 'KITCHEN', '[
        {"task_name": "Clean countertops", "task_category": "KITCHEN", "is_required": true},
        {"task_name": "Clean sink and faucet", "task_category": "KITCHEN", "is_required": true},
        {"task_name": "Wipe down appliances", "task_category": "KITCHEN", "is_required": true},
        {"task_name": "Clean stove top", "task_category": "KITCHEN", "is_required": true},
        {"task_name": "Sweep and mop floor", "task_category": "FLOOR_CARE", "is_required": true},
        {"task_name": "Empty trash", "task_category": "GENERAL", "is_required": true}
    ]', 50),

    ('Deep Kitchen Cleaning', 'DEEP', 'KITCHEN', '[
        {"task_name": "Clean inside microwave", "task_category": "KITCHEN", "is_required": true},
        {"task_name": "Clean inside oven", "task_category": "SPECIALIZED", "is_required": true},
        {"task_name": "Clean refrigerator interior", "task_category": "KITCHEN", "is_required": true},
        {"task_name": "Clean dishwasher", "task_category": "SPECIALIZED", "is_required": true},
        {"task_name": "Degrease stove and range hood", "task_category": "SPECIALIZED", "is_required": true},
        {"task_name": "Clean cabinet fronts", "task_category": "KITCHEN", "is_required": true},
        {"task_name": "Clean backsplash", "task_category": "KITCHEN", "is_required": true}
    ]', 90),

    ('General Living Area Cleaning', 'STANDARD', 'LIVING_ROOM', '[
        {"task_name": "Dust all furniture and surfaces", "task_category": "SURFACE_CLEANING", "is_required": true},
        {"task_name": "Clean mirrors and glass surfaces", "task_category": "SURFACE_CLEANING", "is_required": true},
        {"task_name": "Vacuum all floors and rugs", "task_category": "FLOOR_CARE", "is_required": true},
        {"task_name": "Clean electronics screens", "task_category": "SURFACE_CLEANING", "is_required": false},
        {"task_name": "Fluff cushions and arrange furniture", "task_category": "GENERAL", "is_required": false}
    ]', 40)

ON CONFLICT DO NOTHING;

-- 6.2 Auto-generate tasks for existing cleaning jobs
INSERT INTO cleaning_db.cleaning_job_tasks (job_id, task_name, task_category, is_required)
WITH job_tasks AS (
    SELECT
        cj.id as job_id,
        ct.task_name,
        ct.task_category,
        ct.is_required
    FROM cleaning_db.cleaning_jobs cj
    CROSS JOIN LATERAL (
        SELECT jsonb_array_elements(ctt.tasks)->>'task_name' as task_name,
               jsonb_array_elements(ctt.tasks)->>'task_category' as task_category,
               (jsonb_array_elements(ctt.tasks)->>'is_required')::BOOLEAN as is_required
        FROM cleaning_db.cleaning_task_templates ctt
        WHERE ctt.cleaning_level = cj.cleaning_level
        AND (ctt.room_type = 'ALL' OR ctt.room_type IN (SELECT UNNEST(STRING_TO_ARRAY(cj.job_description, ' '))))
        LIMIT 10
    ) ct
    WHERE cj.job_status IN ('SCHEDULED', 'IN_PROGRESS')
)
SELECT * FROM job_tasks
ON CONFLICT (job_id, task_name) DO NOTHING;

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 7: POST-MIGRATION INDEXES
-- =============================================================================

-- 7.1 Cleaning service indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_jobs_tenant_status ON cleaning_db.cleaning_jobs(tenant_id, job_status);
CREATE INDEX IF NOT EXISTS idx_cleaning_jobs_property_date ON cleaning_db.cleaning_jobs(property_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_jobs_contractor_status ON cleaning_db.cleaning_jobs(contractor_id, job_status);
CREATE INDEX IF NOT EXISTS idx_cleaning_jobs_scheduled ON cleaning_db.cleaning_jobs(scheduled_date DESC, scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_cleaning_jobs_priority ON cleaning_db.cleaning_jobs(priority_level, scheduled_date);

-- 7.2 Maintenance service indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_work_orders_tenant_status ON maintenance_db.maintenance_work_orders(tenant_id, work_status);
CREATE INDEX IF NOT EXISTS idx_maintenance_work_orders_property_date ON maintenance_db.maintenance_work_orders(property_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_work_orders_contractor_status ON maintenance_db.maintenance_work_orders(contractor_id, work_status);
CREATE INDEX IF NOT EXISTS idx_maintenance_work_orders_emergency ON maintenance_db.maintenance_work_orders(is_emergency, priority_level);
CREATE INDEX IF NOT EXISTS idx_maintenance_work_orders_trade ON maintenance_db.maintenance_work_orders(trade_category, work_status);

-- 7.3 Performance analytics materialized views
CREATE MATERIALIZED VIEW IF NOT EXISTS cleaning_db.cleaning_performance_analytics AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE job_status = 'COMPLETED') as completed_jobs,
    AVG(completion_percentage) as avg_completion_rate,
    AVG(quality_score) FILTER (WHERE quality_score IS NOT NULL) as avg_quality_score,
    AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL) as avg_customer_rating,
    AVG(actual_duration_minutes) FILTER (WHERE actual_duration_minutes IS NOT NULL) as avg_duration_minutes,
    AVG(total_price) FILTER (WHERE total_price IS NOT NULL) as avg_revenue_per_job,
    SUM(total_price) FILTER (WHERE total_price IS NOT NULL) as total_revenue,
    COUNT(*) FILTER (WHERE scheduled_date < CURRENT_DATE AND job_status != 'COMPLETED') as overdue_jobs
FROM cleaning_db.cleaning_jobs
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at);

CREATE MATERIALIZED VIEW IF NOT EXISTS maintenance_db.maintenance_performance_analytics AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_work_orders,
    COUNT(*) FILTER (WHERE work_status = 'COMPLETED') as completed_work_orders,
    AVG(completion_percentage) as avg_completion_rate,
    AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL) as avg_customer_rating,
    AVG(actual_duration_hours) FILTER (WHERE actual_duration_hours IS NOT NULL) as avg_duration_hours,
    AVG(total_cost) FILTER (WHERE total_cost IS NOT NULL) as avg_cost_per_order,
    SUM(total_cost) FILTER (WHERE total_cost IS NOT NULL) as total_revenue,
    COUNT(*) FILTER (WHERE is_emergency = true) as emergency_orders,
    AVG(actual_duration_hours) FILTER (WHERE is_emergency = true AND actual_duration_hours IS NOT NULL) as avg_emergency_response_time
FROM maintenance_db.maintenance_work_orders
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at);

-- =============================================================================
-- JOB SEPARATION MIGRATION - PHASE 8: MIGRATION VALIDATION
-- =============================================================================

-- 8.1 Migration summary report
WITH migration_summary AS (
    SELECT
        'ORIGINAL_WORK_ORDERS' as metric,
        COUNT(*) as count
    FROM work_orders
    WHERE deleted_at IS NULL

    UNION ALL

    SELECT
        'CLEANING_JOBS_CREATED' as metric,
        COUNT(*) as count
    FROM cleaning_db.cleaning_jobs

    UNION ALL

    SELECT
        'MAINTENANCE_WORK_ORDERS_CREATED' as metric,
        COUNT(*) as count
    FROM maintenance_db.maintenance_work_orders

    UNION ALL

    SELECT
        'SHARED_JOB_REFERENCES' as metric,
        COUNT(*) as count
    FROM shared_job_references

    UNION ALL

    SELECT
        'CLEANING_TASK_TEMPLATES' as metric,
        COUNT(*) as count
    FROM cleaning_db.cleaning_task_templates

    UNION ALL

    SELECT
        'CLEANING_JOB_TASKS_GENERATED' as metric,
        COUNT(*) as count
    FROM cleaning_db.cleaning_job_tasks
)
SELECT * FROM migration_summary ORDER BY metric;

-- 8.2 Data integrity checks
SELECT
    'WORK_ORDERS_WITHOUT_REFERENCES' as check_name,
    COUNT(*) as issue_count
FROM work_orders wo
WHERE wo.deleted_at IS NULL
AND NOT EXISTS (
    SELECT 1 FROM shared_job_references sjr
    WHERE sjr.original_work_order_id = wo.id
)

UNION ALL

SELECT
    'CLEANING_JOBS_MISMATCH' as check_name,
    COUNT(*) as issue_count
FROM cleaning_db.cleaning_jobs cj
WHERE cj.job_reference_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM shared_job_references sjr
    WHERE sjr.service_job_id = cj.id
    AND sjr.service_type = 'CLEANING'
)

UNION ALL

SELECT
    'MAINTENANCE_WORK_ORDERS_MISMATCH' as check_name,
    COUNT(*) as issue_count
FROM maintenance_db.maintenance_work_orders mwo
WHERE mwo.work_order_reference_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM shared_job_references sjr
    WHERE sjr.service_job_id = mwo.id
    AND sjr.service_type = 'MAINTENANCE'
);

-- 8.3 Performance analytics verification
SELECT
    'CLEANING_ANALYTICS_DATA' as check_name,
    COUNT(*) as months_with_data
FROM cleaning_db.cleaning_performance_analytics

UNION ALL

SELECT
    'MAINTENANCE_ANALYTICS_DATA' as check_name,
    COUNT(*) as months_with_data
FROM maintenance_db.maintenance_performance_analytics;

-- =============================================================================
-- MIGRATION COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== JOB MANAGEMENT SEPARATION MIGRATION COMPLETED ===';
    RAISE NOTICE 'Work orders categorized and migrated to appropriate services';
    RAISE NOTICE 'Enhanced job management schemas created for both services';
    RAISE NOTICE 'Shared job reference system established';
    RAISE NOTICE 'Cleaning task templates and auto-generation implemented';
    RAISE NOTICE 'Performance analytics views created';
    RAISE NOTICE 'Job assignment optimization functions deployed';
    RAISE NOTICE '';
    RAISE NOTICE 'Key features enabled:';
    RAISE NOTICE '- Service-specific job workflows and status management';
    RAISE NOTICE '- Cleaning job task checklists and quality control';
    RAISE NOTICE '- Maintenance work order progress tracking and technical details';
    RAISE NOTICE '- Smart contractor assignment with availability checking';
    RAISE NOTICE '- Cross-service job conflict detection';
    RAISE NOTICE '- Comprehensive performance analytics for both services';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update API endpoints to use new job management tables';
    RAISE NOTICE '2. Implement job scheduling interfaces for both services';
    RAISE NOTICE '3. Test job workflows and cross-service coordination';
    RAISE NOTICE '4. Train staff on separated job management systems';
    RAISE NOTICE '5. Set up automated job assignment and conflict detection';
END $$;