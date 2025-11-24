# Financial Data Separation

## Overview
This document outlines the comprehensive financial data separation between cleaning and maintenance services, including revenue tracking, expense management, financial analytics, and cross-service financial reporting while maintaining data integrity and enabling unified business intelligence.

## Current Financial Data Analysis

### Existing Financial Transaction Model
```sql
model FinancialTransaction {
  id          String           @id @default(uuid())
  tenant_id   String
  property_id String
  type        TransactionType -- INCOME, EXPENSE
  category    ExpenseCategory?
  amount      Decimal          @db.Decimal(10, 2)
  date        DateTime
  description String           @db.VarChar(500)
  receipt_url String?          @db.VarChar(500)
  notes       String?
  created_at  DateTime         @default(now())
  updated_at  DateTime         @updatedAt
  deleted_at  DateTime?
}
```

### Current Expense Categories
```sql
enum ExpenseCategory {
  MAINTENANCE
  REPAIRS
  UTILITIES
  INSURANCE
  PROPERTY_TAX
  MANAGEMENT_FEES
  MORTGAGE
  LEGAL_FEES
  CLEANING
  GARDENING
  SAFETY_CERTIFICATES
  OTHER
}
```

### Key Findings
1. **Shared Financial Model**: Single financial transaction table for all services
2. **Property-Based Tracking**: Financial transactions linked to properties rather than services
3. **Basic Categorization**: Simple income/expense with limited category granularity
4. **No Service Attribution**: No direct service attribution for revenue and costs
5. **Limited Analytics**: Basic transaction tracking without comprehensive financial reporting

## Financial Separation Strategy

### Service-Specific Financial Architecture

#### Cleaning Service Financial Data Model
```sql
-- Cleaning service revenue and cost tracking
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
    service_type VARCHAR(30), -- RESIDENTIAL_CLEANING, COMMERCIAL_CLEANING, etc.
    pricing_model VARCHAR(20), -- FLAT_MONTHLY, PER_VISIT, etc.
    labor_cost DECIMAL(12,2) DEFAULT 0.00,
    supplies_cost DECIMAL(12,2) DEFAULT 0.00,
    equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    overhead_allocated DECIMAL(12,2) DEFAULT 0.00,

    -- Cost specifics
    cost_center VARCHAR(50), -- LABOR, SUPPLIES, EQUIPMENT, MARKETING, ADMIN
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
    recurring_schedule JSONB, -- For recurring transactions
    allocation_method VARCHAR(30) DEFAULT 'DIRECT' CHECK (allocation_method IN (
        'DIRECT', 'ALLOCATION', 'PERCENTAGE', 'HEADCOUNT'
    )),

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
```

#### Maintenance Service Financial Data Model
```sql
-- Maintenance service revenue and cost tracking
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
    service_coverage VARCHAR(30), -- FULL_MAINTENANCE, HVAC_ONLY, etc.
    pricing_model VARCHAR(20), -- FLAT_MONTHLY, PER_SERVICE, etc.
    labor_hours DECIMAL(6,2),
    labor_rate DECIMAL(8,2),
    parts_cost DECIMAL(12,2) DEFAULT 0.00,
    subcontractor_cost DECIMAL(12,2) DEFAULT 0.00,
    overhead_allocated DECIMAL(12,2) DEFAULT 0.00,

    -- Cost specifics
    cost_center VARCHAR(50), -- LABOR, PARTS, EQUIPMENT, TOOLS, VEHICLE, FACILITY
    trade_category VARCHAR(30), -- PLUMBING, ELECTRICAL, HVAC, etc.
    vendor_id UUID,
    invoice_number VARCHAR(50),
    receipt_url TEXT,
    payment_method VARCHAR(30),

    -- Project/job costing
    work_order_id UUID,
    project_id UUID,
    billable BOOLEAN DEFAULT true,
    billable_rate DECIMAL(8,2),

    -- Inventory management
    parts_used JSONB DEFAULT '[]', -- Array of part objects
    equipment_used JSONB DEFAULT '[]', -- Array of equipment objects

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
```

## Enhanced Financial Categories

### Service-Specific Transaction Categories
```sql
-- Cleaning service transaction categories
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

-- Maintenance service transaction categories
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
```

## Cross-Service Financial Consolidation

### Unified Financial Reporting System
```sql
-- Cross-service financial consolidation
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
    cleaning_cogs DECIMAL(12,2) DEFAULT 0.00, -- Cost of Goods Sold
    maintenance_cogs DECIMAL(12,2) DEFAULT 0.00,
    cleaning_opex DECIMAL(12,2) DEFAULT 0.00, -- Operating Expenses
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
```

## Financial Analytics and Reporting

### Real-Time Financial Dashboards
```sql
-- Cleaning service financial KPIs
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
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as labor_cost_ratio_pct,

    -- Transaction volume
    COUNT(*) as total_transactions,
    COUNT(DISTINCT customer_profile_id) as active_customers,
    COUNT(DISTINCT cost_center) as active_cost_centers,

    -- Growth metrics
    SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') /
        LAG(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE')) OVER (ORDER BY DATE_TRUNC('month', transaction_date)) - 1 as revenue_growth_pct

FROM cleaning_financial_transactions
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- Maintenance service financial KPIs
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
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as parts_cost_ratio_pct,
    (SUM(labor_cost) FILTER (WHERE transaction_type = 'COST_OF_GOODS_SOLD') /
     NULLIF(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'), 0)) * 100 as labor_cost_ratio_pct,

    -- Trade breakdown
    jsonb_agg(
        jsonb_build_object(
            'trade', trade_category,
            'revenue', SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE'),
            'jobs', COUNT(DISTINCT work_order_id) FILTER (WHERE transaction_type = 'REVENUE')
        )
    ) FILTER (WHERE trade_category IS NOT NULL) as trade_performance,

    -- Transaction volume
    COUNT(*) as total_transactions,
    COUNT(DISTINCT customer_profile_id) as active_customers,
    COUNT(DISTINCT trade_category) as active_trades,

    -- Growth metrics
    SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') /
        LAG(SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE')) OVER (ORDER BY DATE_TRUNC('month', transaction_date)) - 1 as revenue_growth_pct

FROM maintenance_financial_transactions
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;
```

## Budget Management and Forecasting

### Service-Specific Budgeting
```sql
-- Cleaning service budgets
CREATE TABLE IF NOT EXISTS cleaning_service_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    budget_name VARCHAR(100) NOT NULL,
    budget_type VARCHAR(20) NOT NULL CHECK (budget_type IN ('ANNUAL', 'QUARTERLY', 'MONTHLY', 'PROJECT')),
    budget_period_start DATE NOT NULL,
    budget_period_end DATE NOT NULL,

    -- Revenue budget
    budgeted_revenue DECIMAL(12,2) DEFAULT 0.00,
    revenue_breakdown JSONB DEFAULT '{}', -- By service type, customer segment, etc.

    -- Cost budgets
    budgeted_labor_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_supplies_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    budgeted_operating_expenses DECIMAL(12,2) DEFAULT 0.00,

    -- Metrics and assumptions
    expected_jobs INTEGER DEFAULT 0,
    average_job_value DECIMAL(10,2) DEFAULT 0.00,
    utilization_rate_target DECIMAL(3,2) DEFAULT 0.80, -- 80%
    labor_efficiency_target DECIMAL(3,2) DEFAULT 1.00, -- 100%

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

-- Maintenance service budgets
CREATE TABLE IF NOT EXISTS maintenance_service_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    budget_name VARCHAR(100) NOT NULL,
    budget_type VARCHAR(20) NOT NULL,
    budget_period_start DATE NOT NULL,
    budget_period_end DATE NOT NULL,

    -- Revenue budget
    budgeted_revenue DECIMAL(12,2) DEFAULT 0.00,
    revenue_breakdown JSONB DEFAULT '{}', -- By trade, service coverage, etc.

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
    first_time_fix_target DECIMAL(3,2) DEFAULT 0.85, -- 85%

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
```

## Benefits

### For Financial Management
- Service-specific revenue and cost tracking with detailed categorization
- Real-time financial KPIs and profitability analysis
- Comprehensive budget management and variance reporting
- Automated reconciliation and audit trail maintenance

### For Business Intelligence
- Cross-service financial consolidation and reporting
- Performance comparison between cleaning and maintenance services
- Trend analysis and forecasting capabilities
- Customer and property profitability analysis

### For Operational Efficiency
- Automated transaction categorization and allocation
- Job costing and project profitability tracking
- Vendor and expense management with approval workflows
- Tax compliance and deductible expense tracking

## Risk Mitigation

### Financial Accuracy
- Service-specific validation rules and controls
- Automated reconciliation with bank transactions
- Audit trail with approval workflows
- Multi-level approval for significant transactions

### Compliance
- Tax compliance by jurisdiction and service type
- Expense categorization for tax optimization
- Document retention and retrieval systems
- Regulatory reporting automation

### Data Security
- Role-based access to financial data
- Encrypted storage of sensitive information
- Audit logging of all financial transactions
- Backup and disaster recovery procedures

## Next Steps

1. **Execute Financial Migration**: Migrate existing financial transactions to service-specific tables
2. **Implement Reconciliation**: Set up automated bank reconciliation processes
3. **Build Financial Dashboards**: Create user-friendly financial reporting interfaces
4. **Integrate Accounting Systems**: Connect to QuickBooks, Xero, or other accounting platforms
5. **Set Up Forecasting**: Implement financial forecasting and predictive analytics