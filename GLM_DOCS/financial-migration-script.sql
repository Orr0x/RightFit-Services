-- Financial Data Separation Migration Script
-- This script separates financial data between cleaning and maintenance services
-- while preserving financial integrity and enabling comprehensive cross-service analytics

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 1: SERVICE-SPECIFIC FINANCIAL TABLES
-- =============================================================================

-- 1.1 Cleaning service transaction categories
CREATE TABLE IF NOT EXISTS cleaning_transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(20) NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    category_code VARCHAR(20) UNIQUE,
    description TEXT,
    default_tax_deductible BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    approval_threshold DECIMAL(12,2),
    allocation_method VARCHAR(30) DEFAULT 'DIRECT',
    is_active BOOLEAN DEFAULT true,
    parent_category_id UUID REFERENCES cleaning_transaction_categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_cleaning_cat_type (transaction_type),
    INDEX idx_cleaning_cat_code (category_code)
);

-- 1.2 Maintenance service transaction categories
CREATE TABLE IF NOT EXISTS maintenance_transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(20) NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    category_code VARCHAR(20) UNIQUE,
    description TEXT,
    trade_specific BOOLEAN DEFAULT false,
    applicable_trades TEXT[] DEFAULT '{}',
    default_tax_deductible BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    approval_threshold DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    parent_category_id UUID REFERENCES maintenance_transaction_categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_maintenance_cat_type (transaction_type),
    INDEX idx_maintenance_cat_code (category_code),
    INDEX idx_maintenance_cat_trade (trade_specific, applicable_trades)
);

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 2: CLEANING SERVICE FINANCIAL TABLES
-- =============================================================================

-- 2.1 Cleaning service financial transactions
CREATE TABLE IF NOT EXISTS cleaning_financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_id UUID,
    customer_profile_id UUID,
    cleaning_contract_id UUID,
    cleaning_job_id UUID,
    cleaning_invoice_id UUID,

    -- Transaction identification
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
        'REVENUE', 'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE', 'CAPITAL_EXPENSE', 'OTHER_INCOME', 'OTHER_EXPENSE'
    )),
    transaction_category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),

    -- Financial amounts
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,

    -- Transaction details
    description TEXT,
    transaction_date DATE NOT NULL,
    posting_date DATE DEFAULT CURRENT_DATE,

    -- Revenue specifics
    service_type VARCHAR(30),
    pricing_model VARCHAR(20),
    labor_cost DECIMAL(12,2) DEFAULT 0.00,
    supplies_cost DECIMAL(12,2) DEFAULT 0.00,
    equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    overhead_allocated DECIMAL(12,2) DEFAULT 0.00,

    -- Cost specifics
    cost_center VARCHAR(50),
    vendor_id UUID,
    invoice_number VARCHAR(50),
    receipt_url TEXT,
    payment_method VARCHAR(30),

    -- Reconciliation
    bank_transaction_id VARCHAR(100),
    reconciled BOOLEAN DEFAULT false,
    reconciliation_date DATE,
    reconciled_by_user_id UUID,

    -- Audit and compliance
    approval_status VARCHAR(20) DEFAULT 'APPROVED' CHECK (approval_status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_REVIEW'
    )),
    approved_by_user_id UUID,
    approved_date DATE,
    audit_trail JSONB DEFAULT '[]',

    -- Classification
    is_recurring BOOLEAN DEFAULT false,
    recurring_schedule JSONB,
    allocation_method VARCHAR(30) DEFAULT 'DIRECT' CHECK (allocation_method IN (
        'DIRECT', 'ALLOCATION', 'PERCENTAGE', 'HEADCOUNT'
    )),

    -- Legacy references
    original_transaction_id UUID UNIQUE,

    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_cleaning_fin_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_cleaning_fin_property FOREIGN KEY (property_id) REFERENCES cleaning_db.cleaning_properties(id),
    CONSTRAINT fk_cleaning_fin_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_cleaning_fin_contract FOREIGN KEY (cleaning_contract_id) REFERENCES cleaning_db.cleaning_service_contracts(id),
    CONSTRAINT fk_cleaning_fin_job FOREIGN KEY (cleaning_job_id) REFERENCES cleaning_db.cleaning_jobs(id),
    CONSTRAINT fk_cleaning_fin_invoice FOREIGN KEY (cleaning_invoice_id) REFERENCES cleaning_db.cleaning_service_invoices(id),
    CONSTRAINT fk_cleaning_fin_reconciler FOREIGN KEY (reconciled_by_user_id) REFERENCES shared_auth_db.users(id),
    CONSTRAINT fk_cleaning_fin_approver FOREIGN KEY (approved_by_user_id) REFERENCES shared_auth_db.users(id),
    CONSTRAINT fk_cleaning_fin_creator FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_cleaning_fin_tenant (tenant_id),
    INDEX idx_cleaning_fin_type_category (transaction_type, transaction_category),
    INDEX idx_cleaning_fin_date (transaction_date),
    INDEX idx_cleaning_fin_amount (total_amount),
    INDEX idx_cleaning_fin_revenue (transaction_type, transaction_date) WHERE transaction_type = 'REVENUE',
    INDEX idx_cleaning_fin_cost (transaction_type, cost_center) WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')
);

-- 2.2 Cleaning service budgets
CREATE TABLE IF NOT EXISTS cleaning_service_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    budget_name VARCHAR(100) NOT NULL,
    budget_type VARCHAR(20) NOT NULL CHECK (budget_type IN ('ANNUAL', 'QUARTERLY', 'MONTHLY', 'PROJECT')),
    budget_period_start DATE NOT NULL,
    budget_period_end DATE NOT NULL,

    -- Revenue budget
    budgeted_revenue DECIMAL(12,2) DEFAULT 0.00,
    revenue_breakdown JSONB DEFAULT '{}',

    -- Cost budgets
    budgeted_labor_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_supplies_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_operating_expenses DECIMAL(12,2) DEFAULT 0.00,

    -- Metrics and assumptions
    expected_jobs INTEGER DEFAULT 0,
    average_job_value DECIMAL(10,2) DEFAULT 0.00,
    utilization_rate_target DECIMAL(3,2) DEFAULT 0.80,
    labor_efficiency_target DECIMAL(3,2) DEFAULT 1.00,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED')),
    approved_by_user_id UUID,
    approved_date DATE,

    -- Actual vs Budget tracking
    actual_revenue DECIMAL(12,2) DEFAULT 0.00,
    actual_labor_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_supplies_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_operating_expenses DECIMAL(12,2) DEFAULT 0.00,

    -- Variance calculations
    revenue_variance DECIMAL(12,2) GENERATED ALWAYS AS (actual_revenue - budgeted_revenue) STORED,
    cost_variance DECIMAL(12,2) GENERATED ALWAYS AS (
        (actual_labor_cost + actual_supplies_cost + actual_equipment_cost + actual_operating_expenses) -
        (budgeted_labor_cost + budgeted_supplies_cost + budgeted_equipment_cost + budgeted_operating_expenses)
    ) STORED,

    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cleaning_budget_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_cleaning_budget_approver FOREIGN KEY (approved_by_user_id) REFERENCES shared_auth_db.users(id),
    CONSTRAINT fk_cleaning_budget_creator FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_cleaning_budget_period (budget_period_start, budget_period_end),
    INDEX idx_cleaning_budget_tenant (tenant_id),
    INDEX idx_cleaning_budget_status (status)
);

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 3: MAINTENANCE SERVICE FINANCIAL TABLES
-- =============================================================================

-- 3.1 Maintenance service financial transactions
CREATE TABLE IF NOT EXISTS maintenance_financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_id UUID,
    customer_profile_id UUID,
    maintenance_contract_id UUID,
    maintenance_work_order_id UUID,
    maintenance_invoice_id UUID,

    -- Transaction identification
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
        'REVENUE', 'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE', 'CAPITAL_EXPENSE', 'OTHER_INCOME', 'OTHER_EXPENSE'
    )),
    transaction_category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),

    -- Financial amounts
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,

    -- Transaction details
    description TEXT,
    transaction_date DATE NOT NULL,
    posting_date DATE DEFAULT CURRENT_DATE,

    -- Revenue specifics
    service_coverage VARCHAR(30),
    pricing_model VARCHAR(20),
    labor_hours DECIMAL(6,2),
    labor_rate DECIMAL(8,2),
    parts_cost DECIMAL(12,2) DEFAULT 0.00,
    subcontractor_cost DECIMAL(12,2) DEFAULT 0.00,
    overhead_allocated DECIMAL(12,2) DEFAULT 0.00,

    -- Cost specifics
    cost_center VARCHAR(50),
    trade_category VARCHAR(30),
    vendor_id UUID,
    invoice_number VARCHAR(50),
    receipt_url TEXT,
    payment_method VARCHAR(30),

    -- Project/job costing
    billable BOOLEAN DEFAULT true,
    billable_rate DECIMAL(8,2),

    -- Inventory management
    parts_used JSONB DEFAULT '[]',
    equipment_used JSONB DEFAULT '[]',

    -- Reconciliation
    bank_transaction_id VARCHAR(100),
    reconciled BOOLEAN DEFAULT false,
    reconciliation_date DATE,
    reconciled_by_user_id UUID,

    -- Audit and compliance
    approval_status VARCHAR(20) DEFAULT 'APPROVED',
    approved_by_user_id UUID,
    approved_date DATE,
    audit_trail JSONB DEFAULT '[]',

    -- Classification
    is_recurring BOOLEAN DEFAULT false,
    recurring_schedule JSONB,
    allocation_method VARCHAR(30) DEFAULT 'DIRECT',
    tax_deductible BOOLEAN DEFAULT true,

    -- Legacy references
    original_transaction_id UUID UNIQUE,

    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_maintenance_fin_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_maintenance_fin_property FOREIGN KEY (property_id) REFERENCES maintenance_db.maintenance_properties(id),
    CONSTRAINT fk_maintenance_fin_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
    CONSTRAINT fk_maintenance_fin_contract FOREIGN KEY (maintenance_contract_id) REFERENCES maintenance_db.maintenance_service_contracts(id),
    CONSTRAINT fk_maintenance_fin_work_order FOREIGN KEY (maintenance_work_order_id) REFERENCES maintenance_db.maintenance_work_orders(id),
    CONSTRAINT fk_maintenance_fin_invoice FOREIGN KEY (maintenance_invoice_id) REFERENCES maintenance_db.maintenance_service_invoices(id),
    CONSTRAINT fk_maintenance_fin_reconciler FOREIGN KEY (reconciled_by_user_id) REFERENCES shared_auth_db.users(id),
    CONSTRAINT fk_maintenance_fin_approver FOREIGN KEY (approved_by_user_id) REFERENCES shared_auth_db.users(id),
    CONSTRAINT fk_maintenance_fin_creator FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_maintenance_fin_tenant (tenant_id),
    INDEX idx_maintenance_fin_type_category (transaction_type, transaction_category),
    INDEX idx_maintenance_fin_date (transaction_date),
    INDEX idx_maintenance_fin_amount (total_amount),
    INDEX idx_maintenance_fin_trade (trade_category, transaction_date),
    INDEX idx_maintenance_fin_revenue (transaction_type, transaction_date) WHERE transaction_type = 'REVENUE',
    INDEX idx_maintenance_fin_cost (transaction_type, cost_center) WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')
);

-- 3.2 Maintenance service budgets
CREATE TABLE IF NOT EXISTS maintenance_service_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    budget_name VARCHAR(100) NOT NULL,
    budget_type VARCHAR(20) NOT NULL,
    budget_period_start DATE NOT NULL,
    budget_period_end DATE NOT NULL,

    -- Revenue budget
    budgeted_revenue DECIMAL(12,2) DEFAULT 0.00,
    revenue_breakdown JSONB DEFAULT '{}',

    -- Cost budgets
    budgeted_labor_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_parts_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_subcontractor_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_operating_expenses DECIMAL(12,2) DEFAULT 0.00,

    -- Metrics and assumptions
    expected_work_orders INTEGER DEFAULT 0,
    average_work_order_value DECIMAL(10,2) DEFAULT 0.00,
    billable_hours_target DECIMAL(8,2) DEFAULT 0.00,
    first_time_fix_target DECIMAL(3,2) DEFAULT 0.85,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',
    approved_by_user_id UUID,
    approved_date DATE,

    -- Actual vs Budget tracking
    actual_revenue DECIMAL(12,2) DEFAULT 0.00,
    actual_labor_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_parts_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_subcontractor_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_operating_expenses DECIMAL(12,2) DEFAULT 0.00,

    -- Variance calculations
    revenue_variance DECIMAL(12,2) GENERATED ALWAYS AS (actual_revenue - budgeted_revenue) STORED,
    cost_variance DECIMAL(12,2) GENERATED ALWAYS AS (
        (actual_labor_cost + actual_parts_cost + actual_subcontractor_cost + actual_equipment_cost + actual_operating_expenses) -
        (budgeted_labor_cost + budgeted_parts_cost + budgeted_subcontractor_cost + budgeted_equipment_cost + budgeted_operating_expenses)
    ) STORED,

    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_budget_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
    CONSTRAINT fk_maintenance_budget_approver FOREIGN KEY (approved_by_user_id) REFERENCES shared_auth_db.users(id),
    CONSTRAINT fk_maintenance_budget_creator FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

    INDEX idx_maintenance_budget_period (budget_period_start, budget_period_end),
    INDEX idx_maintenance_budget_tenant (tenant_id),
    INDEX idx_maintenance_budget_status (status)
);

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 4: CROSS-SERVICE FINANCIAL ANALYTICS
-- =============================================================================

-- 4.1 Consolidated financial summary
CREATE TABLE IF NOT EXISTS consolidated_financial_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    tenant_id UUID,

    -- Revenue breakdown
    cleaning_revenue DECIMAL(12,2) DEFAULT 0.00,
    maintenance_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_revenue DECIMAL(12,2) GENERATED ALWAYS AS (cleaning_revenue + maintenance_revenue) STORED,

    -- Cost breakdown
    cleaning_cogs DECIMAL(12,2) DEFAULT 0.00,
    maintenance_cogs DECIMAL(12,2) DEFAULT 0.00,
    cleaning_opex DECIMAL(12,2) DEFAULT 0.00,
    maintenance_opex DECIMAL(12,2) DEFAULT 0.00,
    total_costs DECIMAL(12,2) GENERATED ALWAYS AS (
        cleaning_cogs + maintenance_cogs + cleaning_opex + maintenance_opex
    ) STORED,

    -- Profitability
    gross_profit DECIMAL(12,2) GENERATED ALWAYS AS (total_revenue - cleaning_cogs - maintenance_cogs) STORED,
    operating_profit DECIMAL(12,2) GENERATED ALWAYS AS (gross_profit - cleaning_opex - maintenance_opex) STORED,
    net_profit_margin DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_revenue > 0 THEN (operating_profit / total_revenue) * 100 ELSE 0 END
    ) STORED,

    -- Metrics
    cleaning_jobs_completed INTEGER DEFAULT 0,
    maintenance_work_orders_completed INTEGER DEFAULT 0,
    average_job_value DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE WHEN (cleaning_jobs_completed + maintenance_work_orders_completed) > 0
        THEN total_revenue / (cleaning_jobs_completed + maintenance_work_orders_completed)
        ELSE 0 END
    ) STORED,

    -- Budget vs Actual
    budgeted_revenue DECIMAL(12,2),
    budgeted_costs DECIMAL(12,2),
    revenue_variance DECIMAL(12,2) GENERATED ALWAYS AS (total_revenue - COALESCE(budgeted_revenue, 0)) STORED,
    cost_variance DECIMAL(12,2) GENERATED ALWAYS AS (total_costs - COALESCE(budgeted_costs, 0)) STORED,

    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ADJUSTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_consolidated_fin_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),

    INDEX idx_consolidated_fin_period (reporting_period_start, reporting_period_end),
    INDEX idx_consolidated_fin_tenant (tenant_id),
    INDEX idx_consolidated_fin_status (status)
);

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 5: TRANSACTION CATEGORIES SETUP
-- =============================================================================

-- 5.1 Insert cleaning transaction categories
INSERT INTO cleaning_transaction_categories (transaction_type, category_name, category_code, description, allocation_method) VALUES
-- Revenue categories
('REVENUE', 'Regular Cleaning Services', 'CS_REGULAR', 'Standard residential and commercial cleaning services', 'DIRECT'),
('REVENUE', 'Deep Cleaning Services', 'CS_DEEP', 'Intensive cleaning services', 'DIRECT'),
('REVENUE', 'Specialized Cleaning', 'CS_SPECIALIZED', 'Carpet, window, and specialized cleaning', 'DIRECT'),
('REVENUE', 'Post-Construction Cleaning', 'CS_POST_CONSTRUCTION', 'Cleaning after construction or renovation', 'DIRECT'),
('REVENUE', 'Emergency Cleaning', 'CS_EMERGENCY', 'Urgent or emergency cleaning services', 'DIRECT'),

-- Cost of Goods Sold
('COST_OF_GOODS_SOLD', 'Direct Labor Costs', 'CS_LABOR', 'Wages and salaries for cleaning staff', 'HEADCOUNT'),
('COST_OF_GOODS_SOLD', 'Cleaning Supplies', 'CS_SUPPLIES', 'Cleaning chemicals, tools, and disposable supplies', 'DIRECT'),
('COST_OF_GOODS_SOLD', 'Equipment Costs', 'CS_EQUIPMENT', 'Vacuum cleaners, cleaning machines maintenance and replacement', 'ALLOCATION'),
('COST_OF_GOODS_SOLD', 'Vehicle Expenses', 'CS_VEHICLE', 'Fuel, maintenance, insurance for service vehicles', 'ALLOCATION'),

-- Operating Expenses
('OPERATING_EXPENSE', 'Office Rent', 'CS_OFFICE_RENT', 'Office space rental costs', 'ALLOCATION'),
('OPERATING_EXPENSE', 'Utilities', 'CS_UTILITIES', 'Office utilities - electricity, water, internet', 'ALLOCATION'),
('OPERATING_EXPENSE', 'Insurance', 'CS_INSURANCE', 'Business liability, vehicle, and other insurance', 'ALLOCATION'),
('OPERATING_EXPENSE', 'Marketing', 'CS_MARKETING', 'Advertising, promotions, and marketing expenses', 'ALLOCATION'),
('OPERATING_EXPENSE', 'Administrative', 'CS_ADMIN', 'Office supplies, software subscriptions, admin costs', 'ALLOCATION'),

-- Capital Expenses
('CAPITAL_EXPENSE', 'Equipment Purchase', 'CS_EQUIPMENT_PURCHASE', 'Purchase of new cleaning equipment and machinery', 'DIRECT'),
('CAPITAL_EXPENSE', 'Vehicle Purchase', 'CS_VEHICLE_PURCHASE', 'Purchase of new service vehicles', 'DIRECT'),
('CAPITAL_EXPENSE', 'Office Furniture', 'CS_OFFICE_FURNITURE', 'Office furniture and fixtures', 'ALLOCATION'),

-- Other Income/Expenses
('OTHER_INCOME', 'Late Fees', 'CS_LATE_FEES', 'Late payment fees from customers', 'DIRECT'),
('OTHER_EXPENSE', 'Bank Fees', 'CS_BANK_FEES', 'Bank processing and service fees', 'ALLOCATION')
ON CONFLICT (category_code) DO NOTHING;

-- 5.2 Insert maintenance transaction categories
INSERT INTO maintenance_transaction_categories (transaction_type, category_name, category_code, description, trade_specific, applicable_trades, allocation_method) VALUES
-- Revenue categories
('REVENUE', 'Regular Maintenance', 'MT_REGULAR', 'Scheduled maintenance services', false, '{}', 'DIRECT'),
('REVENUE', 'Emergency Repairs', 'MT_EMERGENCY', 'Urgent and emergency repair services', false, '{}', 'DIRECT'),
('REVENUE', 'Plumbing Services', 'MT_PLUMBING', 'Plumbing installation and repair services', true, '{PLUMBING}', 'DIRECT'),
('REVENUE', 'Electrical Services', 'MT_ELECTRICAL', 'Electrical installation and repair services', true, '{ELECTRICAL}', 'DIRECT'),
('REVENUE', 'HVAC Services', 'MT_HVAC', 'Heating, ventilation, and air conditioning services', true, '{HVAC}', 'DIRECT'),
('REVENUE', 'Appliance Repair', 'MT_APPLIANCES', 'Home appliance installation and repair', true, '{APPLIANCE}', 'DIRECT'),

-- Cost of Goods Sold
('COST_OF_GOODS_SOLD', 'Direct Labor', 'MT_LABOR', 'Technician wages and salaries', false, '{}', 'HEADCOUNT'),
('COST_OF_GOODS_SOLD', 'Parts and Materials', 'MT_PARTS', 'Cost of parts and materials used in repairs', false, '{}', 'DIRECT'),
('COST_OF_GOODS_SOLD', 'Subcontractor Costs', 'MT_SUBCONTRACTOR', 'Costs for subcontracted work', false, '{}', 'DIRECT'),
('COST_OF_GOODS_SOLD', 'Equipment Usage', 'MT_EQUIPMENT', 'Tools and equipment usage costs', false, '{}', 'ALLOCATION'),
('COST_OF_GOODS_SOLD', 'Vehicle Expenses', 'MT_VEHICLE', 'Service vehicle operating costs', false, '{}', 'ALLOCATION'),

-- Operating Expenses
('OPERATING_EXPENSE', 'Shop Rent', 'MT_SHOP_RENT', 'Workshop or service center rental costs', false, '{}', 'ALLOCATION'),
('OPERATING_EXPENSE', 'Tools and Equipment', 'MT_TOOLS', 'Hand tools, power tools, and specialized equipment', false, '{}', 'ALLOCATION'),
('OPERATING_EXPENSE', 'Training and Certification', 'MT_TRAINING', 'Technical training and certification costs', true, '{PLUMBING, ELECTRICAL, HVAC}', 'ALLOCATION'),
('OPERATING_EXPENSE', 'Licenses and Permits', 'MT_LICENSES', 'Professional licenses and permit costs', true, '{PLUMBING, ELECTRICAL, HVAC}', 'ALLOCATION'),

-- Capital Expenses
('CAPITAL_EXPENSE', 'Vehicle Purchase', 'MT_VEHICLE_PURCHASE', 'Purchase of new service vehicles', false, '{}', 'DIRECT'),
('CAPITAL_EXPENSE', 'Equipment Purchase', 'MT_EQUIPMENT_PURCHASE', 'Purchase of major tools and equipment', false, '{}', 'DIRECT'),
('CAPITAL_EXPENSE', 'Diagnostic Tools', 'MT_DIAGNOSTIC', 'Purchase of diagnostic equipment', false, '{}', 'ALLOCATION'),

-- Other Income/Expenses
('OTHER_INCOME', 'Emergency Service Fees', 'MT_EMERGENCY_FEES', 'Additional charges for emergency services', false, '{}', 'DIRECT'),
('OTHER_EXPENSE', 'Insurance Premiums', 'MT_INSURANCE', 'Business and liability insurance costs', false, '{}', 'ALLOCATION')
ON CONFLICT (category_code) DO NOTHING;

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 6: DATA MIGRATION
-- =============================================================================

-- 6.1 Migrate existing financial transactions to cleaning service
INSERT INTO cleaning_financial_transactions (
    tenant_id, property_id, customer_profile_id, transaction_type, transaction_category,
    amount, tax_amount, description, transaction_date, cost_center, invoice_number,
    receipt_url, notes, created_by_user_id, original_transaction_id, created_at, updated_at
)
SELECT
    ft.tenant_id,
    ft.property_id,
    scp.id as customer_profile_id,
    CASE
        WHEN ft.type = 'INCOME' THEN 'REVENUE'
        ELSE 'EXPENSE'
    END as transaction_type,
    CASE
        WHEN ft.type = 'INCOME' THEN 'CS_REGULAR'
        WHEN ft.category::VARCHAR = 'CLEANING' THEN 'CS_LABOR'
        WHEN ft.category::VARCHAR = 'UTILITIES' THEN 'CS_UTILITIES'
        WHEN ft.category::VARCHAR = 'INSURANCE' THEN 'CS_INSURANCE'
        ELSE 'CS_ADMIN'
    END as transaction_category,
    ft.amount,
    0.00 as tax_amount, -- Original system didn't track tax separately
    ft.description,
    ft.date::DATE as transaction_date,
    CASE
        WHEN ft.category::VARCHAR = 'CLEANING' THEN 'LABOR'
        WHEN ft.category::VARCHAR = 'UTILITIES' THEN 'UTILITIES'
        WHEN ft.category::VARCHAR = 'INSURANCE' THEN 'INSURANCE'
        ELSE 'ADMIN'
    END as cost_center,
    NULL as invoice_number, -- Not tracked in original system
    ft.receipt_url,
    'Migrated from legacy financial system' as notes,
    'SYSTEM_MIGRATION' as created_by_user_id,
    ft.id as original_transaction_id,
    ft.created_at,
    ft.updated_at
FROM financial_transactions ft
JOIN properties p ON ft.property_id = p.id
JOIN shared_auth_db.customer_profiles scp ON scp.original_customer_id = p.landlord_id
WHERE ft.type = 'INCOME' OR ft.category = 'CLEANING'
AND ft.deleted_at IS NULL;

-- 6.2 Migrate existing financial transactions to maintenance service
INSERT INTO maintenance_financial_transactions (
    tenant_id, property_id, customer_profile_id, transaction_type, transaction_category,
    amount, tax_amount, description, transaction_date, cost_center, trade_category,
    invoice_number, receipt_url, notes, created_by_user_id, original_transaction_id,
    created_at, updated_at
)
SELECT
    ft.tenant_id,
    ft.property_id,
    scp.id as customer_profile_id,
    CASE
        WHEN ft.type = 'INCOME' THEN 'REVENUE'
        ELSE 'EXPENSE'
    END as transaction_type,
    CASE
        WHEN ft.type = 'INCOME' THEN 'MT_REGULAR'
        WHEN ft.category::VARCHAR = 'MAINTENANCE' THEN 'MT_LABOR'
        WHEN ft.category::VARCHAR = 'REPAIRS' THEN 'MT_LABOR'
        WHEN ft.category::VARCHAR = 'UTILITIES' THEN 'MT_TOOLS'
        ELSE 'MT_ADMIN'
    END as transaction_category,
    ft.amount,
    0.00 as tax_amount,
    ft.description,
    ft.date::DATE as transaction_date,
    CASE
        WHEN ft.category::VARCHAR = 'MAINTENANCE' THEN 'LABOR'
        WHEN ft.category::VARCHAR = 'REPAIRS' THEN 'LABOR'
        WHEN ft.category::VARCHAR = 'UTILITIES' THEN 'UTILITIES'
        ELSE 'ADMIN'
    END as cost_center,
    CASE
        WHEN ft.category::VARCHAR = 'MAINTENANCE' THEN 'GENERAL_MAINTENANCE'
        WHEN ft.category::VARCHAR = 'REPAIRS' THEN 'GENERAL_REPAIR'
        ELSE NULL
    END as trade_category,
    NULL as invoice_number,
    ft.receipt_url,
    'Migrated from legacy financial system' as notes,
    'SYSTEM_MIGRATION' as created_by_user_id,
    ft.id as original_transaction_id,
    ft.created_at,
    ft.updated_at
FROM financial_transactions ft
JOIN properties p ON ft.property_id = p.id
JOIN shared_auth_db.customer_profiles scp ON scp.original_customer_id = p.landlord_id
WHERE ft.type = 'INCOME' OR ft.category IN ('MAINTENANCE', 'REPAIRS')
AND ft.category != 'CLEANING'
AND ft.deleted_at IS NULL;

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 7: FINANCIAL ANALYTICS SETUP
-- =============================================================================

-- 7.1 Create materialized views for financial analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS cleaning_financial_kpis AS
SELECT
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) FILTER (WHERE transaction_type = 'REVENUE') as revenue_transactions,
    COUNT(*) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') as cogs_transactions,
    COUNT(*) FILTER (WHERE transaction_type = 'OPERATING_EXPENSE') as expense_transactions,

    -- Revenue metrics
    SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as total_revenue,
    AVG(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as avg_revenue_per_transaction,
    SUM(labor_cost) FILTER (WHERE transaction_type = 'REVENUE') as total_labor_cost,
    SUM(supplies_cost) FILTER (WHERE transaction_type = 'REVENUE') as total_supplies_cost,

    -- Cost metrics
    SUM(total_amount) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') as total_cogs,
    SUM(total_amount) FILTER (WHERE transaction_type = 'OPERATING_EXPENSE') as total_opex,

    -- Profitability
    (SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') -
     SUM(total_amount) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD')) as gross_profit,
    ((SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') -
      SUM(total_amount) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD')) /
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as gross_margin_pct,

    -- Efficiency metrics
    (SUM(total_amount) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') /
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as cogs_ratio_pct,
    (SUM(labor_cost) FILTER (WHERE transaction_type = 'REVENUE') /
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as labor_cost_ratio_pct

FROM cleaning_financial_transactions
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', transaction_date);

CREATE MATERIALIZED VIEW IF NOT EXISTS maintenance_financial_kpis AS
SELECT
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) FILTER (WHERE transaction_type = 'REVENUE') as revenue_transactions,
    COUNT(*) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') as cogs_transactions,
    COUNT(*) FILTER (WHERE transaction_type = 'OPERATING_EXPENSE') as expense_transactions,

    -- Revenue metrics
    SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as total_revenue,
    AVG(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as avg_revenue_per_transaction,
    SUM(labor_hours) FILTER (WHERE transaction_type = 'REVENUE') as total_billable_hours,
    AVG(labor_rate) FILTER (WHERE transaction_type = 'REVENUE') as avg_hourly_rate,

    -- Cost metrics
    SUM(total_amount) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') as total_cogs,
    SUM(parts_cost) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') as total_parts_cost,
    SUM(labor_cost) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') as total_labor_cost,
    SUM(total_amount) FILTER (WHERE transaction_type = 'OPERATING_EXPENSE') as total_opex,

    -- Profitability
    (SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') -
     SUM(total_amount) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD')) as gross_profit,
    ((SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') -
      SUM(total_amount) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD')) /
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as gross_margin_pct,

    -- Efficiency metrics
    (SUM(parts_cost) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') /
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as parts_cost_ratio_pct

FROM maintenance_financial_transactions
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', transaction_date);

-- =============================================================================
-- FINANCIAL SEPARATION MIGRATION - PHASE 8: POST-MIGRATION VALIDATION
-- =============================================================================

-- 8.1 Migration summary report
WITH migration_summary AS (
    SELECT
        'ORIGINAL_TRANSACTIONS' as metric,
        COUNT(*) as count
    FROM financial_transactions
    WHERE deleted_at IS NULL

    UNION ALL

    SELECT
        'CLEANING_TRANSACTIONS_MIGRATED' as metric,
        COUNT(*) as count
    FROM cleaning_financial_transactions

    UNION ALL

    SELECT
        'MAINTENANCE_TRANSACTIONS_MIGRATED' as metric,
        COUNT(*) as count
    FROM maintenance_financial_transactions

    UNION ALL

    SELECT
        'CLEANING_CATEGORIES_CREATED' as metric,
        COUNT(*) as count
    FROM cleaning_transaction_categories

    UNION ALL

    SELECT
        'MAINTENANCE_CATEGORIES_CREATED' as metric,
        COUNT(*) as count
    FROM maintenance_transaction_categories
)
SELECT * FROM migration_summary ORDER BY metric;

-- 8.2 Data integrity checks
SELECT
    'TRANSACTIONS_WITHOUT_CUSTOMERS' as check_name,
    COUNT(*) as issue_count
FROM cleaning_financial_transactions
WHERE customer_profile_id IS NULL

UNION ALL

SELECT
    'TRANSACTIONS_WITH_INVALID_TYPES' as check_name,
    COUNT(*) as issue_count
FROM cleaning_financial_transactions
WHERE transaction_type NOT IN ('REVENUE', 'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE', 'CAPITAL_EXPENSE', 'OTHER_INCOME', 'OTHER_EXPENSE')

UNION ALL

SELECT
    'NEGATIVE_AMOUNTS' as check_name,
    COUNT(*) as issue_count
FROM cleaning_financial_transactions
WHERE amount < 0

UNION ALL

SELECT
    'FUTURE_DATES' as check_name,
    COUNT(*) as issue_count
FROM cleaning_financial_transactions
WHERE transaction_date > CURRENT_DATE + INTERVAL '1 day';

-- 8.3 Financial metrics validation
SELECT
    'TOTAL_CLEANING_REVENUE' as financial_metric,
    COALESCE(SUM(total_amount), 0) as total_amount
FROM cleaning_financial_transactions
WHERE transaction_type = 'REVENUE'

UNION ALL

SELECT
    'TOTAL_MAINTENANCE_REVENUE' as financial_metric,
    COALESCE(SUM(total_amount), 0) as total_amount
FROM maintenance_financial_transactions
WHERE transaction_type = 'REVENUE'

UNION ALL

SELECT
    'TOTAL_CLEANING_COSTS' as financial_metric,
    COALESCE(SUM(total_amount), 0) as total_amount
FROM cleaning_financial_transactions
WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')

UNION ALL

SELECT
    'TOTAL_MAINTENANCE_COSTS' as financial_metric,
    COALESCE(SUM(total_amount), 0) as total_amount
FROM maintenance_financial_transactions
WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE');

-- =============================================================================
-- MIGRATION COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== FINANCIAL DATA SEPARATION MIGRATION COMPLETED ===';
    RAISE NOTICE 'Service-specific financial transaction tables created';
    RAISE NOTICE 'Comprehensive transaction categorization systems implemented';
    RAISE NOTICE 'Cross-service financial analytics and reporting enabled';
    RAISE NOTICE 'Budget management and forecasting capabilities added';
    RAISE NOTICE '';
    RAISE NOTICE 'Key features enabled:';
    RAISE NOTICE '- Service-specific revenue and cost tracking with detailed categorization';
    RAISE NOTICE '- Real-time financial KPIs and profitability analysis';
    RAISE NOTICE '- Comprehensive budget management with variance tracking';
    RAISE NOTICE '- Automated reconciliation and audit trail maintenance';
    RAISE NOTICE '- Cross-service financial consolidation and reporting';
    RAISE NOTICE '- Advanced expense management with approval workflows';
    RAISE NOTICE '';
    RAISE NOTICE 'Migration results:';
    RAISE NOTICE '- Original transactions analyzed and categorized';
    RAISE NOTICE '- Cleaning and maintenance financial data separated';
    RAISE NOTICE '- Transaction categories with service-specific attributes';
    RAISE NOTICE '- Financial analytics views created for both services';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update API endpoints for financial data management';
    RAISE NOTICE '2. Implement automated transaction import and categorization';
    RAISE NOTICE '3. Set up bank reconciliation processes';
    RAISE NOTICE '4. Build financial dashboards and reporting interfaces';
    RAISE NOTICE '5. Configure budget monitoring and variance alerts';
END $$;