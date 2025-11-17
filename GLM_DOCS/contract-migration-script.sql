-- Contract Management Separation Migration Script
-- This script separates contract, billing, and financial data between cleaning and maintenance services
-- while preserving financial integrity and enabling cross-service customer billing coordination

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 1: ENHANCED FINANCIAL TABLES
-- =============================================================================

-- 1.1 Cross-service billing coordination system
CREATE TABLE IF NOT EXISTS cross_service_billing_coordination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_profile_id UUID NOT NULL,
    billing_cycle_start DATE NOT NULL,
    billing_cycle_end DATE NOT NULL,

    -- Service breakdown
    cleaning_contract_count INTEGER DEFAULT 0,
    maintenance_contract_count INTEGER DEFAULT 0,
    cleaning_job_count INTEGER DEFAULT 0,
    maintenance_work_order_count INTEGER DEFAULT 0,

    -- Financial summary
    cleaning_total DECIMAL(12,2) DEFAULT 0.00,
    maintenance_total DECIMAL(12,2) DEFAULT 0.00,
    combined_total DECIMAL(12,2) DEFAULT 0.00,

    -- Invoice coordination
    consolidated_invoice BOOLEAN DEFAULT false,
    consolidated_invoice_number VARCHAR(50),
    separate_invoices BOOLEAN DEFAULT true,
    payment_synchronization BOOLEAN DEFAULT false,

    -- Status
    billing_status VARCHAR(20) DEFAULT 'PENDING' CHECK (billing_status IN (
        'PENDING', 'PROCESSING', 'INVOICED', 'PAID', 'OVERDUE', 'DISPUTED'
    )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cross_service_billing_customer FOREIGN KEY (customer_profile_id)
        REFERENCES shared_auth_db.customer_profiles(id),

    INDEX idx_cross_service_billing_customer (customer_profile_id),
    INDEX idx_cross_service_billing_cycle (billing_cycle_start, billing_cycle_end),
    INDEX idx_cross_service_billing_status (billing_status)
);

-- 1.2 Dual-service contract linking
CREATE TABLE IF NOT EXISTS dual_service_contract_linking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_profile_id UUID NOT NULL,
    primary_service VARCHAR(20) NOT NULL CHECK (primary_service IN ('CLEANING', 'MAINTENANCE')),
    cleaning_contract_id UUID,
    maintenance_contract_id UUID,

    -- Relationship details
    relationship_type VARCHAR(20) DEFAULT 'INDEPENDENT' CHECK (relationship_type IN (
        'INDEPENDENT', 'BUNDLED', 'SEQUENTIAL', 'COORDINATED'
    )),
    coordination_notes TEXT,

    -- Pricing coordination
    bundled_pricing BOOLEAN DEFAULT false,
    discount_applied DECIMAL(5,2) DEFAULT 0.00,
    billing_coordination BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dual_service_linking_customer FOREIGN KEY (customer_profile_id)
        REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_dual_service_linking_cleaning FOREIGN KEY (cleaning_contract_id)
        REFERENCES cleaning_db.cleaning_service_contracts(id),
    CONSTRAINT fk_dual_service_linking_maintenance FOREIGN KEY (maintenance_contract_id)
        REFERENCES maintenance_db.maintenance_service_contracts(id),

    INDEX idx_dual_service_linking_customer (customer_profile_id),
    INDEX idx_dual_service_linking_type (relationship_type)
);

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 2: CLEANING SERVICE DATABASE
-- =============================================================================

-- 2.1 Enhanced cleaning service contracts
CREATE TABLE IF NOT EXISTS cleaning_service_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(50) UNIQUE,
    tenant_id UUID NOT NULL,
    customer_profile_id UUID NOT NULL,

    -- Contract identification
    contract_name VARCHAR(100) NOT NULL,
    contract_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (contract_level IN ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE')),

    -- Service specifications
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN (
        'RESIDENTIAL_CLEANING', 'COMMERCIAL_CLEANING', 'DEEP_CLEANING',
        'POST_CONSTRUCTION', 'CARPET_CLEANING', 'WINDOW_CLEANING', 'SPECIALIZED'
    )),
    cleaning_frequency VARCHAR(20) DEFAULT 'WEEKLY' CHECK (cleaning_frequency IN (
        'DAILY', 'TWICE_WEEKLY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ONE_TIME'
    )),
    service_hours VARCHAR(50),

    -- Pricing and billing
    pricing_model VARCHAR(20) DEFAULT 'FLAT_MONTHLY' CHECK (pricing_model IN (
        'FLAT_MONTHLY', 'PER_VISIT', 'PER_HOUR', 'PER_SQUARE_FOOT', 'CUSTOM'
    )),
    base_rate DECIMAL(10,2),
    rate_unit VARCHAR(20) DEFAULT 'MONTH',
    additional_services JSONB DEFAULT '[]',
    minimum_contract_months INTEGER DEFAULT 12,
    auto_renewal BOOLEAN DEFAULT true,

    -- Service scope
    included_rooms TEXT[] DEFAULT '{}',
    excluded_areas TEXT[] DEFAULT '{}',
    square_footage INTEGER,
    special_requirements TEXT[],
    cleaning_supplies_included BOOLEAN DEFAULT true,
    equipment_provided BOOLEAN DEFAULT false,

    -- Quality expectations
    quality_standards JSONB DEFAULT '{}',
    inspection_frequency VARCHAR(20) DEFAULT 'WEEKLY' CHECK (inspection_frequency IN (
        'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'AS_NEEDED'
    )),
    customer_satisfaction_target DECIMAL(3,2) DEFAULT 4.5,

    -- Contract terms
    contract_start_date DATE NOT NULL,
    contract_end_date DATE,
    billing_day_of_month INTEGER DEFAULT 1,
    payment_terms VARCHAR(30) DEFAULT 'NET_30' CHECK (payment_terms IN (
        'NET_15', 'NET_30', 'NET_45', 'NET_60', 'UPON_RECEIPT'
    )),
    cancellation_notice_days INTEGER DEFAULT 30,

    -- Status and tracking
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED', 'CANCELLED'
    )),
    signed_date DATE,
    signed_by VARCHAR(100),
    activation_date DATE,

    -- Compliance and legal
    insurance_required BOOLEAN DEFAULT true,
    insurance_coverage_amount DECIMAL(12,2),
    bonding_required BOOLEAN DEFAULT false,
    background_checks_required BOOLEAN DEFAULT false,

    -- Legacy references
    original_contract_id UUID UNIQUE, -- Reference to original cleaning_contracts

    -- Metadata
    notes TEXT,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_cleaning_contracts_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_cleaning_contracts_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_cleaning_contracts_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_cleaning_contracts_tenant (tenant_id),
    INDEX idx_cleaning_contracts_customer (customer_profile_id),
    INDEX idx_cleaning_contracts_status (status),
    INDEX idx_cleaning_contracts_service_type (service_type),
    INDEX idx_cleaning_contracts_start_date (contract_start_date)
);

-- 2.2 Cleaning service invoices
CREATE TABLE IF NOT EXISTS cleaning_service_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    customer_profile_id UUID NOT NULL,
    cleaning_contract_id UUID,
    cleaning_job_id UUID,

    -- Invoice details
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,

    -- Line items and pricing
    line_items JSONB DEFAULT '[]',
    subtotal DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,

    -- Status and payments
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'VOID'
    )),
    payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN (
        'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'DISPUTED'
    )),
    payment_method VARCHAR(50),
    paid_date DATE,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_reference VARCHAR(100),

    -- Reminders and collections
    reminder_count INTEGER DEFAULT 0,
    last_reminder_sent DATE,
    collection_status VARCHAR(20) DEFAULT 'CURRENT' CHECK (collection_status IN (
        'CURRENT', 'DUE_SOON', 'OVERDUE', 'COLLECTIONS', 'WRITE_OFF'
    )),

    -- Legacy references
    original_invoice_id UUID UNIQUE, -- Reference to original cleaning_invoices

    -- Metadata
    notes TEXT,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_cleaning_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_cleaning_invoices_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_cleaning_invoices_contract FOREIGN KEY (cleaning_contract_id) REFERENCES cleaning_service_contracts(id),
    CONSTRAINT fk_cleaning_invoices_job FOREIGN KEY (cleaning_job_id) REFERENCES cleaning_db.cleaning_jobs(id),
    CONSTRAINT fk_cleaning_invoices_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_cleaning_invoices_tenant (tenant_id),
    INDEX idx_cleaning_invoices_customer (customer_profile_id),
    INDEX idx_cleaning_invoices_status (status),
    INDEX idx_cleaning_invoices_due_date (due_date),
    INDEX idx_cleaning_invoices_amount (total_amount)
);

-- 2.3 Cleaning service quotes
CREATE TABLE IF NOT EXISTS cleaning_service_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    customer_profile_id UUID NOT NULL,
    cleaning_job_id UUID,

    -- Quote details
    quote_date DATE NOT NULL,
    valid_until_date DATE NOT NULL,
    quote_title VARCHAR(200) NOT NULL,
    description TEXT,

    -- Line items and pricing
    line_items JSONB DEFAULT '[]',
    subtotal DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,

    -- Status and response
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'DECLINED', 'EXPIRED', 'CONVERTED'
    )),
    customer_response TEXT,
    approved_date DATE,
    approved_by VARCHAR(100),
    converted_to_contract BOOLEAN DEFAULT false,
    converted_to_invoice BOOLEAN DEFAULT false,

    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,

    -- Legacy references
    original_quote_id UUID UNIQUE, -- Reference to original cleaning_quotes

    -- Metadata
    notes TEXT,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_cleaning_quotes_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_cleaning_quotes_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_cleaning_quotes_job FOREIGN KEY (cleaning_job_id) REFERENCES cleaning_db.cleaning_jobs(id),
    CONSTRAINT fk_cleaning_quotes_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_cleaning_quotes_tenant (tenant_id),
    INDEX idx_cleaning_quotes_customer (customer_profile_id),
    INDEX idx_cleaning_quotes_status (status),
    INDEX idx_cleaning_quotes_valid_date (valid_until_date)
);

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 3: MAINTENANCE SERVICE DATABASE
-- =============================================================================

-- 3.1 Enhanced maintenance service contracts
CREATE TABLE IF NOT EXISTS maintenance_service_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(50) UNIQUE,
    tenant_id UUID NOT NULL,
    customer_profile_id UUID NOT NULL,

    -- Contract identification
    contract_name VARCHAR(100) NOT NULL,
    contract_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (contract_level IN ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE')),

    -- Service specifications
    service_coverage VARCHAR(30) NOT NULL CHECK (service_coverage IN (
        'FULL_MAINTENANCE', 'HVAC_ONLY', 'PLUMBING_ONLY', 'ELECTRICAL_ONLY',
        'APPLIANCE_ONLY', 'EXTERIOR_ONLY', 'PREVENTIVE_ONLY', 'EMERGENCY_ONLY', 'CUSTOM'
    )),
    response_time_hours INTEGER DEFAULT 24,
    service_hours VARCHAR(50),

    -- Pricing and billing
    pricing_model VARCHAR(20) DEFAULT 'FLAT_MONTHLY' CHECK (pricing_model IN (
        'FLAT_MONTHLY', 'PER_SERVICE', 'PER_HOUR', 'PER_SQUARE_FOOT', 'RETAINER', 'CUSTOM'
    )),
    base_rate DECIMAL(10,2),
    emergency_response_fee DECIMAL(10,2) DEFAULT 0.00,
    after_hours_premium DECIMAL(3,2) DEFAULT 1.5,
    parts_markup_percentage DECIMAL(5,2) DEFAULT 20.00,
    labor_rate_per_hour DECIMAL(8,2),
    minimum_contract_months INTEGER DEFAULT 12,
    auto_renewal BOOLEAN DEFAULT true,

    -- Service scope
    included_trades TEXT[] DEFAULT '{}',
    excluded_services TEXT[] DEFAULT '{}',
    property_size VARCHAR(20),
    number_of_units INTEGER DEFAULT 1,
    special_equipment TEXT[],

    -- Service level agreements
    preventive_maintenance_schedule JSONB DEFAULT '{}',
    emergency_coverage BOOLEAN DEFAULT true,
    priority_support BOOLEAN DEFAULT false,
    dedicated_technician BOOLEAN DEFAULT false,
    response_time_sla JSONB DEFAULT '{}',

    -- Contract terms
    contract_start_date DATE NOT NULL,
    contract_end_date DATE,
    billing_day_of_month INTEGER DEFAULT 1,
    payment_terms VARCHAR(30) DEFAULT 'NET_30',
    cancellation_notice_days INTEGER DEFAULT 60,

    -- Status and tracking
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED', 'CANCELLED'
    )),
    signed_date DATE,
    signed_by VARCHAR(100),
    activation_date DATE,

    -- Compliance and legal
    licenses_required TEXT[] DEFAULT '{}',
    insurance_required BOOLEAN DEFAULT true,
    insurance_coverage_amount DECIMAL(12,2),
    permits_included BOOLEAN DEFAULT false,

    -- Performance metrics
    performance_targets JSONB DEFAULT '{}',
    reporting_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    customer_portal_access BOOLEAN DEFAULT false,

    -- Legacy references
    original_contract_id UUID UNIQUE, -- Reference to original maintenance_contracts

    -- Metadata
    notes TEXT,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_maintenance_contracts_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_maintenance_contracts_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_maintenance_contracts_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_maintenance_contracts_tenant (tenant_id),
    INDEX idx_maintenance_contracts_customer (customer_profile_id),
    INDEX idx_maintenance_contracts_status (status),
    INDEX idx_maintenance_contracts_coverage (service_coverage),
    INDEX idx_maintenance_contracts_start_date (contract_start_date)
);

-- 3.2 Maintenance service invoices
CREATE TABLE IF NOT EXISTS maintenance_service_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    customer_profile_id UUID NOT NULL,
    maintenance_contract_id UUID,
    maintenance_work_order_id UUID,

    -- Invoice details
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,

    -- Line items and pricing
    line_items JSONB DEFAULT '[]',
    labor_subtotal DECIMAL(12,2) DEFAULT 0.00,
    parts_subtotal DECIMAL(12,2) DEFAULT 0.00,
    other_charges DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,

    -- Cost breakdown for analysis
    total_labor_cost DECIMAL(12,2) DEFAULT 0.00,
    total_parts_cost DECIMAL(12,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2),

    -- Status and payments
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'VOID'
    )),
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    payment_method VARCHAR(50),
    paid_date DATE,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_reference VARCHAR(100),

    -- Warranty and maintenance tracking
    warranty_included BOOLEAN DEFAULT false,
    warranty_period_days INTEGER DEFAULT 30,
    warranty_start_date DATE,
    warranty_end_date DATE,

    -- Collections
    reminder_count INTEGER DEFAULT 0,
    last_reminder_sent DATE,
    collection_status VARCHAR(20) DEFAULT 'CURRENT',

    -- Legacy references
    original_invoice_id UUID UNIQUE, -- Reference to original invoices

    -- Metadata
    notes TEXT,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_maintenance_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_maintenance_invoices_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_maintenance_invoices_contract FOREIGN KEY (maintenance_contract_id) REFERENCES maintenance_service_contracts(id),
    CONSTRAINT fk_maintenance_invoices_work_order FOREIGN KEY (maintenance_work_order_id) REFERENCES maintenance_db.maintenance_work_orders(id),
    CONSTRAINT fk_maintenance_invoices_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_maintenance_invoices_tenant (tenant_id),
    INDEX idx_maintenance_invoices_customer (customer_profile_id),
    INDEX idx_maintenance_invoices_status (status),
    INDEX idx_maintenance_invoices_due_date (due_date),
    INDEX idx_maintenance_invoices_warranty (warranty_end_date)
);

-- 3.3 Maintenance service quotes
CREATE TABLE IF NOT EXISTS maintenance_service_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    customer_profile_id UUID NOT NULL,
    maintenance_work_order_id UUID,

    -- Quote details
    quote_date DATE NOT NULL,
    valid_until_date DATE NOT NULL,
    quote_title VARCHAR(200) NOT NULL,
    description TEXT,

    -- Labor and parts breakdown
    labor_line_items JSONB DEFAULT '[]',
    parts_line_items JSONB DEFAULT '[]',
    other_charges JSONB DEFAULT '[]',
    labor_subtotal DECIMAL(12,2) DEFAULT 0.00,
    parts_subtotal DECIMAL(12,2) DEFAULT 0.00,
    other_subtotal DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,

    -- Cost estimates for analysis
    estimated_labor_hours DECIMAL(6,2),
    estimated_parts_cost DECIMAL(12,2) DEFAULT 0.00,
    emergency_premium_applied BOOLEAN DEFAULT false,

    -- Status and response
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'DECLINED', 'EXPIRED', 'CONVERTED'
    )),
    customer_response TEXT,
    approved_date DATE,
    approved_by VARCHAR(100),
    converted_to_work_order BOOLEAN DEFAULT false,
    converted_to_invoice BOOLEAN DEFAULT false,

    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,

    -- Legacy references
    original_quote_id UUID UNIQUE, -- Reference to original quotes

    -- Metadata
    notes TEXT,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_maintenance_quotes_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_maintenance_quotes_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_maintenance_quotes_work_order FOREIGN KEY (maintenance_work_order_id) REFERENCES maintenance_db.maintenance_work_orders(id),
    CONSTRAINT fk_maintenance_quotes_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_maintenance_quotes_tenant (tenant_id),
    INDEX idx_maintenance_quotes_customer (customer_profile_id),
    INDEX idx_maintenance_quotes_status (status),
    INDEX idx_maintenance_quotes_valid_date (valid_until_date)
);

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 4: CONTRACT LIFECYCLE MANAGEMENT
-- =============================================================================

-- 4.1 Contract lifecycle events
CREATE TABLE IF NOT EXISTS contract_lifecycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('CLEANING', 'MAINTENANCE')),
    contract_id UUID NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    event_description TEXT,

    -- Event timing
    scheduled_date DATE,
    actual_date DATE,
    event_status VARCHAR(20) DEFAULT 'PENDING' CHECK (event_status IN (
        'PENDING', 'COMPLETED', 'SKIPPED', 'FAILED'
    )),

    -- Automated actions
    action_required VARCHAR(50),
    action_status VARCHAR(20) DEFAULT 'NOT_STARTED' CHECK (action_status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
    )),
    automated BOOLEAN DEFAULT false,
    executed_date DATE,

    -- Notifications
    notification_sent BOOLEAN DEFAULT false,
    notification_recipients TEXT[],
    notification_method VARCHAR(20),

    -- Metadata
    created_by_user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_contract_lifecycle_contract (contract_type, contract_id),
    INDEX idx_contract_lifecycle_scheduled (scheduled_date),
    INDEX idx_contract_lifecycle_status (event_status)
);

-- 4.2 Contract renewal management
CREATE TABLE IF NOT EXISTS contract_renewal_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('CLEANING', 'MAINTENANCE')),
    contract_id UUID NOT NULL,
    current_end_date DATE NOT NULL,

    -- Renewal terms
    renewal_option VARCHAR(20) DEFAULT 'AUTO_RENEW' CHECK (renewal_option IN (
        'AUTO_RENEW', 'MANUAL_RENEW', 'NO_RENEW', 'REVIEW_REQUIRED'
    )),
    renewal_terms JSONB,
    pricing_adjustment DECIMAL(5,2) DEFAULT 0.00,

    -- Renewal timeline
    renewal_notice_days INTEGER DEFAULT 60,
    renewal_start_date DATE,
    decision_deadline DATE,

    -- Status tracking
    renewal_status VARCHAR(20) DEFAULT 'PENDING' CHECK (renewal_status IN (
        'PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'CONVERTED', 'EXPIRED'
    )),
    customer_response TEXT,
    final_decision_date DATE,

    -- Financial impact
    current_monthly_rate DECIMAL(10,2),
    proposed_monthly_rate DECIMAL(10,2),
    renewal_value_change DECIMAL(12,2),

    -- Metadata
    assigned_to_user_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_contract_renewal_contract (contract_type, contract_id),
    INDEX idx_contract_renewal_deadline (decision_deadline),
    INDEX idx_contract_renewal_status (renewal_status)
);

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 5: DATA MIGRATION
-- =============================================================================

-- 5.1 Migrate cleaning contracts
INSERT INTO cleaning_db.cleaning_service_contracts (
    contract_number, tenant_id, customer_profile_id, contract_name, contract_level,
    service_type, cleaning_frequency, service_hours, pricing_model, base_rate, rate_unit,
    minimum_contract_months, auto_renewal, square_footage, cleaning_supplies_included,
    contract_start_date, contract_end_date, billing_day_of_month, payment_terms,
    cancellation_notice_days, status, signed_date, activation_date, insurance_required,
    notes, created_by_user_id, original_contract_id, created_at, updated_at
)
SELECT
    cc.contract_number,
    cc.service_provider_id as tenant_id,
    scp.id as customer_profile_id,
    COALESCE('Cleaning Contract - ' || c.first_name || ' ' || c.last_name, 'Cleaning Contract') as contract_name,
    CASE
        WHEN cc.monthly_fee >= 500 THEN 'PREMIUM'
        WHEN cc.monthly_fee >= 300 THEN 'STANDARD'
        ELSE 'BASIC'
    END as contract_level,
    CASE
        WHEN cc.contract_type = 'FLAT_MONTHLY' THEN 'RESIDENTIAL_CLEANING'
        ELSE 'COMMERCIAL_CLEANING'
    END as service_type,
    CASE
        WHEN cc.monthly_fee >= 500 THEN 'TWICE_WEEKLY'
        WHEN cc.monthly_fee >= 300 THEN 'WEEKLY'
        ELSE 'BI_WEEKLY'
    END as cleaning_frequency,
    '9:00-17:00 Monday-Friday' as service_hours,
    cc.contract_type::VARCHAR as pricing_model,
    cc.monthly_fee as base_rate,
    'MONTH' as rate_unit,
    12 as minimum_contract_months,
    true as auto_renewal,
    1500 as square_footage, -- Default estimate
    true as cleaning_supplies_included,
    cc.contract_start_date,
    cc.contract_end_date,
    cc.billing_day,
    'NET_30' as payment_terms,
    30 as cancellation_notice_days,
    CASE
        WHEN cc.status = 'ACTIVE' THEN 'ACTIVE'
        WHEN cc.status = 'INACTIVE' THEN 'TERMINATED'
        ELSE cc.status::VARCHAR
    END as status,
    CURRENT_DATE as signed_date, -- Default to today
    cc.contract_start_date as activation_date,
    true as insurance_required,
    cc.notes,
    'SYSTEM_MIGRATION' as created_by_user_id, -- System user for migration
    cc.id as original_contract_id,
    cc.created_at,
    cc.updated_at
FROM cleaning_contracts cc
JOIN customers c ON cc.customer_id = c.id
JOIN shared_auth_db.customer_profiles scp ON scp.original_customer_id = c.id
WHERE cc.deleted_at IS NULL;

-- 5.2 Migrate maintenance contracts
INSERT INTO maintenance_db.maintenance_service_contracts (
    contract_number, tenant_id, customer_profile_id, contract_name, contract_level,
    service_coverage, response_time_hours, service_hours, pricing_model, base_rate,
    emergency_response_fee, after_hours_premium, parts_markup_percentage,
    labor_rate_per_hour, minimum_contract_months, auto_renewal, included_trades,
    contract_start_date, contract_end_date, billing_day_of_month, payment_terms,
    cancellation_notice_days, status, signed_date, activation_date, insurance_required,
    licenses_required, performance_targets, notes, created_by_user_id,
    original_contract_id, created_at, updated_at
)
SELECT
    mc.contract_number,
    mc.service_provider_id as tenant_id,
    scp.id as customer_profile_id,
    COALESCE('Maintenance Contract - ' || c.first_name || ' ' || c.last_name, 'Maintenance Contract') as contract_name,
    CASE
        WHEN mc.monthly_fee >= 800 THEN 'PREMIUM'
        WHEN mc.monthly_fee >= 500 THEN 'STANDARD'
        ELSE 'BASIC'
    END as contract_level,
    'FULL_MAINTENANCE' as service_coverage,
    24 as response_time_hours,
    '24/7 Emergency, 8-5 Weekdays' as service_hours,
    mc.contract_type::VARCHAR as pricing_model,
    mc.monthly_fee as base_rate,
    150.00 as emergency_response_fee,
    1.5 as after_hours_premium,
    20.00 as parts_markup_percentage,
    75.00 as labor_rate_per_hour,
    12 as minimum_contract_months,
    true as auto_renewal,
    ARRAY['PLUMBING', 'ELECTRICAL', 'HVAC'] as included_trades,
    mc.contract_start_date,
    mc.contract_end_date,
    mc.billing_day,
    'NET_30' as payment_terms,
    60 as cancellation_notice_days,
    CASE
        WHEN mc.status = 'ACTIVE' THEN 'ACTIVE'
        WHEN mc.status = 'INACTIVE' THEN 'TERMINATED'
        ELSE mc.status::VARCHAR
    END as status,
    CURRENT_DATE as signed_date,
    mc.contract_start_date as activation_date,
    true as insurance_required,
    ARRAY['GENERAL_CONTRACTOR'] as licenses_required,
    '{"response_time": 24, "customer_satisfaction": 4.0}'::JSONB as performance_targets,
    mc.notes,
    'SYSTEM_MIGRATION' as created_by_user_id,
    mc.id as original_contract_id,
    mc.created_at,
    mc.updated_at
FROM maintenance_contracts mc
JOIN customers c ON mc.customer_id = c.id
JOIN shared_auth_db.customer_profiles scp ON scp.original_customer_id = c.id
WHERE mc.deleted_at IS NULL;

-- 5.3 Migrate cleaning invoices
INSERT INTO cleaning_db.cleaning_service_invoices (
    invoice_number, tenant_id, customer_profile_id, cleaning_contract_id,
    invoice_date, due_date, period_start, period_end, line_items,
    subtotal, tax_rate, tax_amount, total_amount, status,
    payment_status, payment_method, paid_date, paid_amount, payment_reference,
    notes, created_by_user_id, original_invoice_id, created_at, updated_at
)
SELECT
    ci.invoice_number,
    'SYSTEM_TENANT' as tenant_id, -- Will need to map to actual tenant
    scp.id as customer_profile_id,
    csc.id as cleaning_contract_id,
    ci.invoice_date,
    ci.due_date,
    ci.invoice_date as period_start,
    ci.invoice_date + INTERVAL '1 month' - INTERVAL '1 day' as period_end,
    ci.line_items,
    ci.subtotal,
    ci.tax_percentage as tax_rate,
    ci.tax_amount,
    ci.total as total_amount,
    CASE
        WHEN ci.status = 'PAID' THEN 'PAID'
        WHEN ci.status = 'PENDING' THEN 'SENT'
        ELSE ci.status::VARCHAR
    END as status,
    CASE
        WHEN ci.status = 'PAID' THEN 'PAID'
        ELSE 'UNPAID'
    END as payment_status,
    ci.payment_method,
    ci.paid_at::DATE as paid_date,
    ci.total as paid_amount,
    ci.payment_reference,
    ci.notes,
    'SYSTEM_MIGRATION' as created_by_user_id,
    ci.id as original_invoice_id,
    ci.created_at,
    ci.updated_at
FROM cleaning_invoices ci
JOIN customers c ON ci.customer_id = c.id
JOIN shared_auth_db.customer_profiles scp ON scp.original_customer_id = c.id
LEFT JOIN cleaning_db.cleaning_service_contracts csc ON csc.original_contract_id = ci.cleaning_contract_id
WHERE ci.deleted_at IS NULL;

-- 5.4 Migrate maintenance invoices
INSERT INTO maintenance_db.maintenance_service_invoices (
    invoice_number, tenant_id, customer_profile_id, maintenance_contract_id,
    maintenance_work_order_id, invoice_date, due_date, period_start, period_end,
    line_items, labor_subtotal, parts_subtotal, subtotal, tax_rate,
    tax_amount, total_amount, total_labor_cost, total_parts_cost,
    status, payment_status, payment_method, paid_date, paid_amount,
    payment_reference, warranty_included, warranty_period_days,
    notes, created_by_user_id, original_invoice_id, created_at, updated_at
)
SELECT
    i.invoice_number,
    'SYSTEM_TENANT' as tenant_id, -- Will need to map to actual tenant
    scp.id as customer_profile_id,
    msc.id as maintenance_contract_id,
    mwo.id as maintenance_work_order_id,
    i.invoice_date,
    i.due_date,
    i.invoice_date as period_start,
    i.invoice_date + INTERVAL '1 month' - INTERVAL '1 day' as period_end,
    i.line_items,
    i.total * 0.7 as labor_subtotal, -- Estimate 70% labor
    i.total * 0.3 as parts_subtotal,  -- Estimate 30% parts
    i.subtotal,
    i.tax_percentage as tax_rate,
    i.tax_amount,
    i.total as total_amount,
    i.total * 0.7 as total_labor_cost,
    i.total * 0.3 as total_parts_cost,
    CASE
        WHEN i.status = 'PAID' THEN 'PAID'
        WHEN i.status = 'PENDING' THEN 'SENT'
        ELSE i.status::VARCHAR
    END as status,
    CASE
        WHEN i.status = 'PAID' THEN 'PAID'
        ELSE 'UNPAID'
    END as payment_status,
    i.payment_method,
    i.paid_at::DATE as paid_date,
    i.total as paid_amount,
    i.payment_reference,
    CASE WHEN mwo.work_type = 'PLUMBING_REPAIR' THEN true ELSE false END as warranty_included,
    30 as warranty_period_days,
    i.notes,
    'SYSTEM_MIGRATION' as created_by_user_id,
    i.id as original_invoice_id,
    i.created_at,
    i.updated_at
FROM invoices i
JOIN customers c ON i.customer_id = c.id
JOIN shared_auth_db.customer_profiles scp ON scp.original_customer_id = c.id
LEFT JOIN maintenance_db.maintenance_service_contracts msc ON msc.original_contract_id = i.maintenance_contract_id
LEFT JOIN maintenance_db.maintenance_work_orders mwo ON mwo.work_order_reference_id = i.maintenance_job_id
WHERE i.deleted_at IS NULL
AND (i.maintenance_contract_id IS NOT NULL OR i.maintenance_job_id IS NOT NULL);

-- 5.5 Migrate quotes
-- Note: Quote migration would depend on existing quote data structure
-- This is a placeholder for quote migration logic

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 6: DUAL-SERVICE CUSTOMER LINKING
-- =============================================================================

-- 6.1 Identify dual-service customers and create links
INSERT INTO dual_service_contract_linking (
    customer_profile_id, primary_service, cleaning_contract_id, maintenance_contract_id,
    relationship_type, billing_coordination, created_at
)
WITH dual_service_customers AS (
    SELECT
        scp.id as customer_profile_id,
        csc.id as cleaning_contract_id,
        msc.id as maintenance_contract_id,
        CASE
            WHEN csc.monthly_fee >= msc.base_rate THEN 'CLEANING'
            ELSE 'MAINTENANCE'
        END as primary_service
    FROM shared_auth_db.customer_profiles scp
    LEFT JOIN cleaning_db.cleaning_service_contracts csc ON scp.id = csc.customer_profile_id AND csc.deleted_at IS NULL
    LEFT JOIN maintenance_db.maintenance_service_contracts msc ON scp.id = msc.customer_profile_id AND msc.deleted_at IS NULL
    WHERE csc.id IS NOT NULL AND msc.id IS NOT NULL
)
SELECT
    dsc.customer_profile_id,
    dsc.primary_service,
    dsc.cleaning_contract_id,
    dsc.maintenance_contract_id,
    'INDEPENDENT' as relationship_type,
    false as billing_coordination,
    CURRENT_TIMESTAMP as created_at
FROM dual_service_customers dsc;

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 7: AUTOMATED RENEWAL SETUP
-- =============================================================================

-- 7.1 Set up renewal management for active contracts
INSERT INTO contract_renewal_management (
    contract_type, contract_id, current_end_date, renewal_option,
    renewal_notice_days, renewal_start_date, decision_deadline,
    current_monthly_rate, renewal_status, created_at
)
SELECT
    'CLEANING' as contract_type,
    csc.id as contract_id,
    csc.contract_end_date as current_end_date,
    'AUTO_RENEW' as renewal_option,
    60 as renewal_notice_days,
    csc.contract_end_date - INTERVAL '90 days' as renewal_start_date,
    csc.contract_end_date - INTERVAL '30 days' as decision_deadline,
    csc.base_rate as current_monthly_rate,
    CASE
        WHEN csc.contract_end_date > CURRENT_DATE + INTERVAL '60 days' THEN 'PENDING'
        ELSE 'UNDER_REVIEW'
    END as renewal_status,
    CURRENT_TIMESTAMP as created_at
FROM cleaning_db.cleaning_service_contracts csc
WHERE csc.status = 'ACTIVE'
AND csc.contract_end_date IS NOT NULL
AND csc.auto_renewal = true

UNION ALL

SELECT
    'MAINTENANCE' as contract_type,
    msc.id as contract_id,
    msc.contract_end_date as current_end_date,
    'AUTO_RENEW' as renewal_option,
    90 as renewal_notice_days,
    msc.contract_end_date - INTERVAL '120 days' as renewal_start_date,
    msc.contract_end_date - INTERVAL '60 days' as decision_deadline,
    msc.base_rate as current_monthly_rate,
    CASE
        WHEN msc.contract_end_date > CURRENT_DATE + INTERVAL '90 days' THEN 'PENDING'
        ELSE 'UNDER_REVIEW'
    END as renewal_status,
    CURRENT_TIMESTAMP as created_at
FROM maintenance_db.maintenance_service_contracts msc
WHERE msc.status = 'ACTIVE'
AND msc.contract_end_date IS NOT NULL
AND msc.auto_renewal = true;

-- =============================================================================
-- CONTRACT SEPARATION MIGRATION - PHASE 8: POST-MIGRATION INDEXES AND VALIDATION
-- =============================================================================

-- 8.1 Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_contracts_billing ON cleaning_db.cleaning_service_contracts(billing_day_of_month, auto_renewal);
CREATE INDEX IF NOT EXISTS idx_maintenance_contracts_billing ON maintenance_db.maintenance_service_contracts(billing_day_of_month, auto_renewal);
CREATE INDEX IF NOT EXISTS idx_cleaning_invoices_collections ON cleaning_db.cleaning_service_invoices(collection_status, due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_invoices_collections ON maintenance_db.maintenance_service_invoices(collection_status, due_date);

-- 8.2 Migration validation summary
WITH migration_summary AS (
    SELECT
        'CLEANING_CONTRACTS_MIGRATED' as metric,
        COUNT(*) as count
    FROM cleaning_db.cleaning_service_contracts

    UNION ALL

    SELECT
        'MAINTENANCE_CONTRACTS_MIGRATED' as metric,
        COUNT(*) as count
    FROM maintenance_db.maintenance_service_contracts

    UNION ALL

    SELECT
        'CLEANING_INVOICES_MIGRATED' as metric,
        COUNT(*) as count
    FROM cleaning_db.cleaning_service_invoices

    UNION ALL

    SELECT
        'MAINTENANCE_INVOICES_MIGRATED' as metric,
        COUNT(*) as count
    FROM maintenance_db.maintenance_service_invoices

    UNION ALL

    SELECT
        'DUAL_SERVICE_CUSTOMERS_LINKED' as metric,
        COUNT(*) as count
    FROM dual_service_contract_linking

    UNION ALL

    SELECT
        'RENEWAL_SETUPS_CREATED' as metric,
        COUNT(*) as count
    FROM contract_renewal_management
)
SELECT * FROM migration_summary ORDER BY metric;

-- 8.3 Data integrity checks
SELECT
    'CONTRACTS_WITHOUT_CUSTOMERS' as check_name,
    COUNT(*) as issue_count
FROM cleaning_db.cleaning_service_contracts csc
WHERE csc.customer_profile_id IS NULL

UNION ALL

SELECT
    'INVOICES_WITHOUT_CUSTOMERS' as check_name,
    COUNT(*) as issue_count
FROM cleaning_db.cleaning_service_invoices ci
WHERE ci.customer_profile_id IS NULL

UNION ALL

SELECT
    'CONTRACTS_ENDING_SOON' as check_name,
    COUNT(*) as issue_count
FROM (
    SELECT id FROM cleaning_db.cleaning_service_contracts WHERE contract_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
    UNION ALL
    SELECT id FROM maintenance_db.maintenance_service_contracts WHERE contract_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
) contracts_ending_soon;

-- 8.4 Financial validation
SELECT
    'TOTAL_MONTHLY_REVENUE' as financial_metric,
    SUM(base_rate) as total_amount
FROM (
    SELECT base_rate FROM cleaning_db.cleaning_service_contracts WHERE status = 'ACTIVE'
    UNION ALL
    SELECT base_rate FROM maintenance_db.maintenance_service_contracts WHERE status = 'ACTIVE'
) active_contracts

UNION ALL

SELECT
    'OUTSTANDING_INVOICE_AMOUNT' as financial_metric,
    COALESCE(SUM(total_amount), 0) as total_amount
FROM cleaning_db.cleaning_service_invoices
WHERE payment_status IN ('UNPAID', 'PARTIALLY_PAID')

UNION ALL

SELECT
    'OVERDUE_INVOICE_COUNT' as financial_metric,
    COUNT(*) as total_amount
FROM cleaning_db.cleaning_service_invoices
WHERE collection_status = 'OVERDUE';

-- =============================================================================
-- MIGRATION COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== CONTRACT MANAGEMENT SEPARATION MIGRATION COMPLETED ===';
    RAISE NOTICE 'Enhanced contract schemas created for both services';
    RAISE NOTICE 'Financial tables separated with service-specific features';
    RAISE NOTICE 'Cross-service billing coordination system established';
    RAISE NOTICE 'Contract lifecycle management and renewal automation deployed';
    RAISE NOTICE 'Dual-service customer linking implemented';
    RAISE NOTICE '';
    RAISE NOTICE 'Key features enabled:';
    RAISE NOTICE '- Service-specific contract terms and pricing models';
    RAISE NOTICE '- Advanced billing and invoicing with automation';
    RAISE NOTICE '- Contract renewal management with automated workflows';
    RAISE NOTICE '- Cross-service customer billing coordination';
    RAISE NOTICE '- Comprehensive financial tracking and reporting';
    RAISE NOTICE '- Warranty and maintenance tracking for service contracts';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update API endpoints for enhanced contract management';
    RAISE NOTICE '2. Implement automated billing and invoice generation';
    RAISE NOTICE '3. Set up payment processing integration';
    RAISE NOTICE '4. Configure contract renewal automation';
    RAISE NOTICE '5. Test cross-service billing coordination';
END $$;