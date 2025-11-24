# Cross-Service Financial Coordination

## Overview
This document outlines the comprehensive cross-service financial coordination system that enables unified financial management across cleaning and maintenance services while maintaining service autonomy, including consolidated reporting, shared insights, and enterprise-level financial intelligence.

## Cross-Service Architecture

### Unified Financial Data Lake
```sql
-- Enterprise financial data warehouse
CREATE TABLE IF NOT EXISTS enterprise_financial_data_lake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_system VARCHAR(50) NOT NULL, -- 'CLEANING', 'MAINTENANCE', 'SHARED'
    source_table VARCHAR(100) NOT NULL,
    source_record_id UUID NOT NULL,

    -- Universal transaction classification
    transaction_date DATE NOT NULL,
    posting_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    fiscal_month INTEGER NOT NULL,

    -- Standardized financial dimensions
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('REVENUE', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY')),
    category_level_1 VARCHAR(50) NOT NULL, -- GAAP primary category
    category_level_2 VARCHAR(50), -- Detailed subcategory
    category_level_3 VARCHAR(50), -- Specific item

    -- Service attribution
    primary_service VARCHAR(20) CHECK (primary_service IN ('CLEANING', 'MAINTENANCE', 'SHARED')),
    service_contribution JSONB DEFAULT '{}', -- % breakdown by service

    -- Universal amounts
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    functional_amount DECIMAL(15,2) GENERATED ALWAYS AS (amount * exchange_rate) STORED,

    -- Geographic and organizational dimensions
    region VARCHAR(50),
    territory VARCHAR(50),
    business_unit VARCHAR(50),
    cost_center VARCHAR(50),
    department VARCHAR(50),

    -- Customer/Property dimensions
    customer_segment VARCHAR(30), -- RESIDENTIAL, COMMERCIAL, INDUSTRIAL, GOVERNMENT
    customer_tier VARCHAR(20), -- PREMIUM, STANDARD, BASIC
    property_type VARCHAR(30),
    property_size_category VARCHAR(20), -- SMALL, MEDIUM, LARGE, ENTERPRISE

    -- Analytics dimensions
    is_recurring BOOLEAN DEFAULT false,
    is_capitalizable BOOLEAN DEFAULT false,
    is_tax_deductible BOOLEAN DEFAULT true,
    has_contract_reference BOOLEAN DEFAULT false,

    -- Data quality and lineage
    data_quality_score INTEGER CHECK (data_quality_score BETWEEN 1 AND 5),
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    description TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',

    CONSTRAINT fk_enterprise_fin_source FOREIGN KEY (source_system) REFERENCES enterprise_systems(name),

    INDEX idx_enterprise_fin_date (transaction_date),
    INDEX idx_enterprise_fin_entity (entity_type, category_level_1),
    INDEX idx_enterprise_fin_service (primary_service),
    INDEX idx_enterprise_fin_amount (functional_amount),
    INDEX idx_enterprise_fin_quality (data_quality_score)
);

-- System registry for tracking data sources
CREATE TABLE IF NOT EXISTS enterprise_systems (
    name VARCHAR(50) PRIMARY KEY,
    system_type VARCHAR(30) NOT NULL, -- TRANSACTIONAL, ANALYTICAL, EXTERNAL
    description TEXT,
    connection_details JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cross-service financial KPI definitions
CREATE TABLE IF NOT EXISTS cross_service_kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_name VARCHAR(100) NOT NULL UNIQUE,
    kpi_code VARCHAR(20) UNIQUE NOT NULL,
    kpi_category VARCHAR(30) NOT NULL, -- PROFITABILITY, EFFICIENCY, GROWTH, COMPLIANCE
    description TEXT,
    calculation_formula TEXT NOT NULL, -- SQL formula for calculation
    target_value DECIMAL(15,2),
    acceptable_range JSONB, -- { "min": value, "max": value }
    frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
    kpi_type VARCHAR(20) NOT NULL, -- FINANCIAL, OPERATIONAL, STRATEGIC
    benchmark_type VARCHAR(20), -- INTERNAL, INDUSTRY, COMPETITIVE
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Service Aggregation Layer
```sql
-- Service financial aggregation views for consolidated reporting
CREATE MATERIALIZED VIEW IF NOT EXISTS cross_service_financial_summary AS
WITH daily_financials AS (
    SELECT
        transaction_date,
        primary_service,
        entity_type,
        category_level_1,
        SUM(functional_amount) as amount,
        COUNT(*) as transaction_count,
        COUNT(DISTINCT cost_center) as active_cost_centers,
        COUNT(DISTINCT customer_segment) as customer_segments_served
    FROM enterprise_financial_data_lake
    WHERE validation_status = 'VALIDATED'
    AND data_quality_score >= 3
    GROUP BY transaction_date, primary_service, entity_type, category_level_1
),
monthly_aggregates AS (
    SELECT
        DATE_TRUNC('month', transaction_date) as month,
        primary_service,
        entity_type,
        category_level_1,
        SUM(amount) as monthly_amount,
        COUNT(*) as monthly_transactions,
        AVG(amount) as avg_transaction_amount,
        MIN(amount) as min_transaction_amount,
        MAX(amount) as max_transaction_amount,
        STDDEV(amount) as amount_stddev
    FROM daily_financials
    GROUP BY DATE_TRUNC('month', transaction_date), primary_service, entity_type, category_level_1
),
service_metrics AS (
    SELECT
        month,
        primary_service,
        -- Revenue metrics
        SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE') as total_revenue,
        COUNT(*) FILTER (WHERE entity_type = 'REVENUE') as revenue_transactions,
        AVG(monthly_amount) FILTER (WHERE entity_type = 'REVENUE') as avg_revenue_transaction,

        -- Cost metrics
        SUM(monthly_amount) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY')) as total_costs,
        COUNT(*) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY')) as cost_transactions,
        AVG(monthly_amount) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY')) as avg_cost_transaction,

        -- Profitability
        (SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE') -
         SUM(monthly_amount) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY'))) as net_profit,
        ROUND(
            (SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE') -
             SUM(monthly_amount) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY'))) /
            NULLIF(SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE'), 0) * 100, 2
        ) as profit_margin_pct,

        -- Efficiency ratios
        ROUND(
            (SUM(monthly_amount) FILTER (WHERE entity_type = 'EXPENSE' AND category_level_1 = 'Labor') /
             NULLIF(SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE'), 0)) * 100, 2
        ) as labor_cost_ratio,

        ROUND(
            (SUM(monthly_amount) FILTER (WHERE entity_type = 'EXPENSE' AND category_level_1 = 'Materials') /
             NULLIF(SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE'), 0)) * 100, 2
        ) as materials_cost_ratio,

        -- Growth metrics (Month-over-Month)
        LAG(SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE')) OVER (
            PARTITION BY primary_service ORDER BY month
        ) as prior_month_revenue,
        LAG(SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE')) OVER (
            PARTITION BY primary_service ORDER BY month
        ) - 1 as revenue_growth_mom,

        -- Year-over-Year comparison
        LAG(SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE')) OVER (
            PARTITION BY primary_service ORDER BY month
            ROWS BETWEEN 11 PRECEDING AND 12 PRECEDING
        ) as prior_year_month_revenue,

        -- Rolling 3-month averages
        ROUND(AVG(SUM(monthly_amount) FILTER (WHERE entity_type = 'REVENUE')) OVER (
            PARTITION BY primary_service ORDER BY month
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2) as avg_revenue_3months

    FROM monthly_aggregates
    GROUP BY month, primary_service
)
SELECT
    sm.*,
    -- Comparative metrics
    ROUND((sm.total_revenue - sm.prior_month_revenue) / NULLIF(sm.prior_month_revenue, 0) * 100, 2) as revenue_growth_pct,
    ROUND((sm.total_revenue - sm.prior_year_month_revenue) / NULLIF(sm.prior_year_month_revenue, 0) * 100, 2) as yoy_growth_pct,

    -- Service contribution to total
    ROUND(
        sm.total_revenue / NULLIF(SUM(sm.total_revenue) OVER (PARTITION BY sm.month), 0) * 100, 2
    ) as revenue_contribution_pct,
    ROUND(
        sm.net_profit / NULLIF(SUM(sm.net_profit) OVER (PARTITION BY sm.month), 0) * 100, 2
    ) as profit_contribution_pct,

    -- Performance indicators
    CASE
        WHEN sm.profit_margin_pct >= 25 THEN 'EXCELLENT'
        WHEN sm.profit_margin_pct >= 15 THEN 'GOOD'
        WHEN sm.profit_margin_pct >= 5 THEN 'ACCEPTABLE'
        ELSE 'NEEDS_IMPROVEMENT'
    END as profitability_rating,

    CASE
        WHEN sm.labor_cost_ratio <= 40 THEN 'OPTIMAL'
        WHEN sm.labor_cost_ratio <= 50 THEN 'ACCEPTABLE'
        WHEN sm.labor_cost_ratio <= 60 THEN 'HIGH'
        ELSE 'CRITICAL'
    END as labor_efficiency_rating,

    -- Trend indicators
    CASE
        WHEN sm.revenue_growth_mom > 10 THEN 'STRONG_GROWTH'
        WHEN sm.revenue_growth_mom > 5 THEN 'MODERATE_GROWTH'
        WHEN sm.revenue_growth_mom > 0 THEN 'SLOW_GROWTH'
        WHEN sm.revenue_growth_mom > -5 THEN 'STABLE'
        ELSE 'DECLINING'
    END as growth_trend

FROM service_metrics sm
ORDER BY sm.month DESC, sm.primary_service;
```

## Unified Customer Financial View

### 360-Degree Customer Profitability
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS unified_customer_financial_view AS
WITH customer_revenue AS (
    SELECT
        cp.id as customer_profile_id,
        cp.first_name,
        cp.last_name,
        cp.email,
        'CLEANING' as service_type,
        SUM(ft.functional_amount) as total_revenue,
        COUNT(*) as revenue_transactions,
        AVG(ft.functional_amount) as avg_revenue_per_transaction,
        MIN(ft.transaction_date) as first_service_date,
        MAX(ft.transaction_date) as last_service_date,
        DATE_PART('year', AGE(CURRENT_DATE, MIN(ft.transaction_date))) as service_years,
        STRING_AGG(DISTINCT ft.category_level_2, ', ') as service_types_consumed
    FROM enterprise_financial_data_lake ft
    JOIN shared_auth_db.customer_profiles cp ON ft.source_record_id = ANY(
        ARRAY_AGG(csi.contract_id) FILTER (WHERE csi.customer_profile_id = cp.id)
    )
    LEFT JOIN cleaning_db.cleaning_service_contracts csi ON ft.source_record_id = csi.id
    WHERE ft.primary_service = 'CLEANING'
    AND ft.entity_type = 'REVENUE'
    AND ft.validation_status = 'VALIDATED'
    GROUP BY cp.id, cp.first_name, cp.last_name, cp.email

    UNION ALL

    SELECT
        cp.id as customer_profile_id,
        cp.first_name,
        cp.last_name,
        cp.email,
        'MAINTENANCE' as service_type,
        SUM(ft.functional_amount) as total_revenue,
        COUNT(*) as revenue_transactions,
        AVG(ft.functional_amount) as avg_revenue_per_transaction,
        MIN(ft.transaction_date) as first_service_date,
        MAX(ft.transaction_date) as last_service_date,
        DATE_PART('year', AGE(CURRENT_DATE, MIN(ft.transaction_date))) as service_years,
        STRING_AGG(DISTINCT ft.category_level_2, ', ') as service_types_consumed
    FROM enterprise_financial_data_lake ft
    JOIN shared_auth_db.customer_profiles cp ON ft.source_record_id = ANY(
        ARRAY_AGG(msi.contract_id) FILTER (WHERE msi.customer_profile_id = cp.id)
    )
    LEFT JOIN maintenance_db.maintenance_service_contracts msi ON ft.source_record_id = msi.id
    WHERE ft.primary_service = 'MAINTENANCE'
    AND ft.entity_type = 'REVENUE'
    AND ft.validation_status = 'VALIDATED'
    GROUP BY cp.id, cp.first_name, cp.last_name, cp.email
),
customer_costs AS (
    SELECT
        cp.id as customer_profile_id,
        cr.service_type,
        SUM(ft.functional_amount) as total_direct_costs,
        SUM(ft.functional_amount) FILTER (WHERE ft.category_level_1 = 'Labor') as labor_costs,
        SUM(ft.functional_amount) FILTER (WHERE ft.category_level_1 = 'Materials') as materials_costs,
        SUM(ft.functional_amount) FILTER (WHERE ft.category_level_1 = 'Operating') as operating_costs,
        COUNT(*) as cost_transactions
    FROM customer_revenue cr
    JOIN enterprise_financial_data_lake ft ON cr.customer_profile_id = ANY(
        SELECT customer_profile_id FROM cleaning_db.cleaning_service_contracts WHERE id = ft.source_record_id
        UNION ALL
        SELECT customer_profile_id FROM maintenance_db.maintenance_service_contracts WHERE id = ft.source_record_id
    )
    WHERE ft.primary_service = cr.service_type
    AND ft.entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY')
    AND ft.validation_status = 'VALIDATED'
    GROUP BY cp.id, cr.service_type
),
customer_metrics AS (
    SELECT
        cr.customer_profile_id,
        cr.first_name,
        cr.last_name,
        cr.email,
        MAX(cr.service_type) as primary_service,
        STRING_AGG(cr.service_type, ', ') as all_services,
        SUM(cr.total_revenue) as total_revenue,
        SUM(cc.total_direct_costs) as total_costs,
        SUM(cr.total_revenue) - SUM(cc.total_direct_costs) as net_profit,
        ROUND(
            (SUM(cr.total_revenue) - SUM(cc.total_direct_costs)) /
            NULLIF(SUM(cr.total_revenue), 0) * 100, 2
        ) as profit_margin_pct,
        SUM(cr.revenue_transactions) as total_transactions,
        SUM(cc.cost_transactions) as total_cost_transactions,
        MAX(cr.service_years) as longest_service_tenure,
        MIN(cr.first_service_date) as earliest_service,
        MAX(cr.last_service_date) as latest_service,
        -- Lifetime value calculation
        ROUND(
            (SUM(cr.total_revenue) - SUM(cc.total_direct_costs)) /
            NULLIF(DATE_PART('day', MAX(cr.last_service_date) - MIN(cr.first_service_date)), 0), 2
        ) as daily_avg_profit,
        ROUND(
            (SUM(cr.total_revenue) - SUM(cc.total_direct_costs)) *
            DATE_PART('year', AGE(CURRENT_DATE, MIN(cr.first_service_date))), 2
        ) as lifetime_value,
        -- Customer categorization
        CASE
            WHEN SUM(cr.total_revenue) >= 50000 THEN 'PLATINUM'
            WHEN SUM(cr.total_revenue) >= 25000 THEN 'GOLD'
            WHEN SUM(cr.total_revenue) >= 10000 THEN 'SILVER'
            ELSE 'BRONZE'
        END as customer_tier,
        CASE
            WHEN MAX(cr.service_years) >= 5 THEN 'LOYAL'
            WHEN MAX(cr.service_years) >= 2 THEN 'ESTABLISHED'
            WHEN MAX(cr.service_years) >= 1 THEN 'NEW'
            ELSE 'RECENT'
        END as loyalty_status,
        -- Service diversity
        CASE
            WHEN COUNT(DISTINCT cr.service_type) = 1 THEN 'SINGLE_SERVICE'
            WHEN COUNT(DISTINCT cr.service_type) = 2 THEN 'DUAL_SERVICE'
            ELSE 'MULTI_SERVICE'
        END as service_diversity

    FROM customer_revenue cr
    LEFT JOIN customer_costs cc ON cr.customer_profile_id = cc.customer_profile_id
    GROUP BY cr.customer_profile_id, cr.first_name, cr.last_name, cr.email
),
cross_sell_opportunities AS (
    SELECT
        cm.customer_profile_id,
        CASE
            WHEN cm.service_diversity = 'SINGLE_SERVICE' AND cm.primary_service = 'CLEANING'
            THEN 'MAINTENANCE_SERVICES'
            WHEN cm.service_diversity = 'SINGLE_SERVICE' AND cm.primary_service = 'MAINTENANCE'
            THEN 'CLEANING_SERVICES'
            ELSE 'EXPANDED_SERVICES'
        END as cross_sell_opportunity,
        CASE
            WHEN cm.service_diversity = 'SINGLE_SERVICE' AND cm.profit_margin_pct >= 20 THEN 'HIGH_PRIORITY'
            WHEN cm.service_diversity = 'SINGLE_SERVICE' AND cm.profit_margin_pct >= 15 THEN 'MEDIUM_PRIORITY'
            ELSE 'LOW_PRIORITY'
        END as cross_sell_priority,
        ROUND(cm.total_revenue * 0.25, 2) as estimated_cross_sell_value, -- 25% of current revenue
        cm.lifetime_value
    FROM customer_metrics cm
    WHERE cm.service_diversity = 'SINGLE_SERVICE'
)
SELECT
    cm.*,
    cso.cross_sell_opportunity,
    cso.cross_sell_priority,
    cso.estimated_cross_sell_value,

    -- Comparison with service averages
    ROUND(
        cm.profit_margin_pct - AVG(cm.profit_margin_pct) OVER (), 2
    ) as profit_margin_vs_avg,

    -- Risk indicators
    CASE
        WHEN cm.latest_service < CURRENT_DATE - INTERVAL '90 days' THEN 'AT_RISK'
        WHEN cm.latest_service < CURRENT_DATE - INTERVAL '180 days' THEN 'HIGH_RISK'
        WHEN cm.profit_margin_pct < 5 THEN 'LOW_MARGIN'
        ELSE 'HEALTHY'
    END as customer_risk_status,

    -- Action recommendations
    CASE
        WHEN cm.service_diversity = 'SINGLE_SERVICE' AND cso.cross_sell_priority = 'HIGH_PRIORITY' THEN
            ARRAY['Contact for additional services', 'Create bundle offer', 'Schedule service consultation']
        WHEN cm.customer_risk_status = 'AT_RISK' THEN
            ARRAY['Immediate outreach required', 'Offer incentive', 'Service satisfaction survey']
        WHEN cm.profit_margin_pct < 10 THEN
            ARRAY['Review pricing structure', 'Optimize service delivery', 'Cost reduction plan']
        ELSE ARRAY[]
    END as recommended_actions

FROM customer_metrics cm
LEFT JOIN cross_sell_opportunities cso ON cm.customer_profile_id = cso.customer_profile_id
ORDER BY cm.lifetime_value DESC, cm.total_revenue DESC;
```

## Executive Financial Intelligence

### C-Suite Ready Dashboards
```sql
-- Executive financial summary for C-level reporting
CREATE MATERIALIZED VIEW IF NOT EXISTS executive_financial_dashboard AS
WITH ytd_metrics AS (
    SELECT
        primary_service,
        SUM(functional_amount) FILTER (WHERE entity_type = 'REVENUE') as ytd_revenue,
        SUM(functional_amount) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY')) as ytd_costs,
        COUNT(*) FILTER (WHERE entity_type = 'REVENUE') as ytd_transactions,
        COUNT(DISTINCT DATE_TRUNC('month', transaction_date)) as active_months,
        MIN(transaction_date) as period_start,
        MAX(transaction_date) as period_end
    FROM enterprise_financial_data_lake
    WHERE transaction_date >= DATE_TRUNC('year', CURRENT_DATE)
    AND validation_status = 'VALIDATED'
    AND data_quality_score >= 4
    GROUP BY primary_service
),
quarterly_metrics AS (
    SELECT
        primary_service,
        DATE_TRUNC('quarter', transaction_date) as quarter,
        SUM(functional_amount) FILTER (WHERE entity_type = 'REVENUE') as quarterly_revenue,
        SUM(functional_amount) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY')) as quarterly_costs,
        COUNT(*) FILTER (WHERE entity_type = 'REVENUE') as quarterly_transactions,
        -- Quarter-over-quarter growth
        LAG(SUM(functional_amount) FILTER (WHERE entity_type = 'REVENUE')) OVER (
            PARTITION BY primary_service ORDER BY DATE_TRUNC('quarter', transaction_date)
        ) as prior_quarter_revenue
    FROM enterprise_financial_data_lake
    WHERE transaction_date >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'
    AND validation_status = 'VALIDATED'
    GROUP BY primary_service, DATE_TRUNC('quarter', transaction_date)
),
leading_indicators AS (
    SELECT
        primary_service,
        -- Recent performance trends
        AVG(functional_amount) FILTER (WHERE entity_type = 'REVENUE' AND
            transaction_date >= CURRENT_DATE - INTERVAL '30 days') as avg_daily_revenue_30d,
        AVG(functional_amount) FILTER (WHERE entity_type = 'REVENUE' AND
            transaction_date >= CURRENT_DATE - INTERVAL '7 days') as avg_daily_revenue_7d,
        -- Expense trends
        AVG(functional_amount) FILTER (WHERE entity_type IN ('EXPENSE', 'ASSET', 'LIABILITY') AND
            transaction_date >= CURRENT_DATE - INTERVAL '30 days') as avg_daily_costs_30d,
        -- Customer metrics
        COUNT(DISTINCT source_record_id) FILTER (WHERE entity_type = 'REVENUE' AND
            transaction_date >= CURRENT_DATE - INTERVAL '30 days') as active_customers_30d,
        -- Efficiency metrics
        ROUND(
            AVG(functional_amount) FILTER (WHERE entity_type = 'EXPENSE' AND category_level_1 = 'Labor') /
            NULLIF(AVG(functional_amount) FILTER (WHERE entity_type = 'REVENUE' AND
                transaction_date >= CURRENT_DATE - INTERVAL '30 days'), 0) * 100, 2
        ) as recent_labor_cost_ratio
    FROM enterprise_financial_data_lake
    WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    AND validation_status = 'VALIDATED'
    GROUP BY primary_service
),
budget_vs_actual AS (
    SELECT
        'CLEANING' as service_type,
        SUM(budgeted_amount) as total_budgeted,
        SUM(actual_amount) as total_actual,
        SUM(actual_amount - budgeted_amount) as variance,
        ROUND((SUM(actual_amount - budgeted_amount) / NULLIF(SUM(budgeted_amount), 0)) * 100, 2) as variance_pct
    FROM cleaning_service_budgets
    WHERE status = 'ACTIVE'

    UNION ALL

    SELECT
        'MAINTENANCE' as service_type,
        SUM(budgeted_amount) as total_budgeted,
        SUM(actual_amount) as total_actual,
        SUM(actual_amount - budgeted_amount) as variance,
        ROUND((SUM(actual_amount - budgeted_amount) / NULLIF(SUM(budgeted_amount), 0)) * 100, 2) as variance_pct
    FROM maintenance_service_budgets
    WHERE status = 'ACTIVE'
)
SELECT
    -- Executive Summary Metrics
    CURRENT_DATE as report_date,
    'YEAR_TO_DATE' as reporting_period,

    -- Consolidated company-wide metrics
    (SELECT SUM(ytd_revenue) FROM ytd_metrics) as total_company_revenue,
    (SELECT SUM(ytd_costs) FROM ytd_metrics) as total_company_costs,
    (SELECT SUM(ytd_revenue) - SUM(ytd_costs) FROM ytd_metrics) as total_company_profit,
    ROUND(((SELECT SUM(ytd_revenue) - SUM(ytd_costs)) / NULLIF(SUM(ytd_revenue), 0)) * 100, 2) as company_profit_margin,

    -- Service-specific breakdown
    ym.primary_service as service_name,
    ym.ytd_revenue,
    ym.ytd_costs,
    ym.ytd_revenue - ym.ytd_costs as ytd_profit,
    ROUND(((ym.ytd_revenue - ym.ytd_costs) / NULLIF(ym.ytd_revenue, 0)) * 100, 2) as ytd_margin,
    ym.ytd_transactions,
    ROUND(ym.ytd_revenue / NULLIF(ym.active_months, 0), 2) as avg_monthly_revenue,

    -- Quarterly trends
    ROUND(AVG(qm.quarterly_revenue), 2) as avg_quarterly_revenue,
    ROUND(AVG(qm.quarterly_revenue - COALESCE(qm.prior_quarter_revenue, 0)), 2) as avg_quarterly_growth,

    -- Performance indicators
    li.avg_daily_revenue_30d,
    li.avg_daily_revenue_7d,
    li.avg_daily_costs_30d,
    li.active_customers_30d,
    li.recent_labor_cost_ratio,

    -- Recent performance
    CASE
        WHEN li.avg_daily_revenue_7d > li.avg_daily_revenue_30d * 1.1 THEN 'ACCELERATING'
        WHEN li.avg_daily_revenue_7d > li.avg_daily_revenue_30d * 0.95 THEN 'STABLE'
        ELSE 'DECLINING'
    END as revenue_trend,

    -- Budget performance
    bva.total_actual / NULLIF(bva.total_budgeted, 0) * 100 as budget_utilization_pct,
    CASE
        WHEN bva.variance_pct > 10 THEN 'OVER_BUDGET'
        WHEN bva.variance_pct < -10 THEN 'UNDER_BUDGET'
        ELSE 'ON_TARGET'
    END as budget_status,

    -- Overall health indicators
    CASE
        WHEN ((SELECT total_company_revenue - total_company_costs) / NULLIF(total_company_revenue, 0)) > 0.20 THEN 'EXCELLENT'
        WHEN ((SELECT total_company_revenue - total_company_costs) / NULLIF(total_company_revenue, 0)) > 0.15 THEN 'GOOD'
        WHEN ((SELECT total_company_revenue - total_company_costs) / NULLIF(total_company_revenue, 0)) > 0.10 THEN 'ACCEPTABLE'
        ELSE 'NEEDS_ATTENTION'
    END as financial_health_status,

    -- Executive recommendations
    CASE
        WHEN bva.variance_pct > 15 THEN ARRAY['Review spending', 'Implement cost controls', 'Budget re-forecasting']
        WHEN li.recent_labor_cost_ratio > 60 THEN ARRAY['Optimize labor efficiency', 'Review staffing levels', 'Process improvement']
        WHEN (SELECT total_company_revenue - total_company_costs) / NULLIF(total_company_revenue, 0) < 0.10 THEN ARRAY['Revenue enhancement initiatives', 'Cost reduction programs', 'Strategic pricing review']
        ELSE ARRAY[]::TEXT[]
    END as executive_recommendations

FROM ytd_metrics ym
JOIN leading_indicators li ON ym.primary_service = li.primary_service
LEFT JOIN (
    SELECT AVG(quarterly_revenue), AVG(prior_quarter_revenue)
    FROM quarterly_metrics
    WHERE quarter >= DATE_TRUNC('quarter', CURRENT_DATE) - INTERVAL '2 quarters'
) qm_avg ON true
JOIN budget_vs_actual bva ON bva.service_type = ym.primary_service

ORDER BY total_company_revenue DESC;
```

## Benefits

### For Executive Decision Making
- Real-time C-level financial dashboard with KPI tracking
- Cross-service performance comparison and trend analysis
- Predictive forecasting with confidence intervals
- Budget variance monitoring with actionable recommendations

### For Strategic Planning
- Customer lifetime value analysis with cross-sell opportunities
- Service profitability optimization insights
- Market expansion and growth strategy support
- Risk assessment and early warning indicators

### For Operational Excellence
- Unified financial data lake for comprehensive analytics
- Service-specific performance benchmarking
- Resource allocation optimization recommendations
- Automated anomaly detection and alerting

## Risk Mitigation

### Data Quality
- Multi-level validation and data quality scoring
- Automated reconciliation and integrity checks
- Audit trail maintenance for all financial transactions
- Error detection and correction workflows

### Performance
- Materialized views for high-frequency executive reporting
- Optimized query execution plans for large datasets
- Caching strategies for real-time dashboards
- Scalable architecture supporting data growth

### Security & Compliance
- Role-based access control with audit logging
- Data encryption and secure storage
- Compliance with financial reporting standards (GAAP, IFRS)
- Privacy protection for customer financial data

## Next Steps

1. **Implement Data Integration**: Connect to external accounting and ERP systems
2. **Build Executive Dashboard**: Create user-friendly C-level reporting interface
3. **Set Up Alerting System**: Configure automated alerts for KPI thresholds
4. **Enhance Forecasting**: Implement machine learning for improved accuracy
5. **Create Mobile Access**: Develop mobile-friendly financial dashboards for executives