# Financial Reporting and Analytics System

## Overview
This document outlines the comprehensive financial reporting and analytics system for separated cleaning and maintenance services, including real-time dashboards, predictive analytics, cross-service financial consolidation, and business intelligence capabilities.

## Reporting Architecture

### Multi-Layer Financial Analytics
```typescript
interface FinancialAnalyticsLayer {
  // Transaction Layer
  transactionAnalysis: TransactionAnalytics
  revenueAnalysis: RevenueAnalytics
  costAnalysis: CostAnalytics
  profitabilityAnalysis: ProfitabilityAnalytics

  // Service Layer
  serviceComparison: ServiceComparisonAnalytics
  operationalEfficiency: OperationalEfficiencyAnalytics
  customerProfitability: CustomerProfitabilityAnalytics
  propertyROI: PropertyROIAnalytics

  // Strategic Layer
  trendAnalysis: TrendAnalytics
  forecasting: ForecastingAnalytics
  budgetVariance: BudgetVarianceAnalytics
  kpiMonitoring: KPIAnalytics
}
```

### Real-Time Financial Dashboards
```sql
-- Executive financial dashboard view
CREATE MATERIALIZED VIEW IF NOT EXISTS executive_financial_dashboard AS
WITH current_period AS (
    SELECT
        DATE_TRUNC('month', CURRENT_DATE) as period_start,
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as period_end
),
cleaning_metrics AS (
    SELECT
        SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as cleaning_revenue,
        SUM(total_amount) FILTER (WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')) as cleaning_costs,
        COUNT(DISTINCT customer_profile_id) FILTER (WHERE transaction_type = 'REVENUE') as cleaning_customers,
        COUNT(*) FILTER (WHERE transaction_type = 'REVENUE') as cleaning_transactions
    FROM cleaning_financial_transactions
    WHERE transaction_date BETWEEN (SELECT period_start FROM current_period) AND (SELECT period_end FROM current_period)
    AND deleted_at IS NULL
),
maintenance_metrics AS (
    SELECT
        SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as maintenance_revenue,
        SUM(total_amount) FILTER (WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')) as maintenance_costs,
        COUNT(DISTINCT customer_profile_id) FILTER (WHERE transaction_type = 'REVENUE') as maintenance_customers,
        COUNT(*) FILTER (WHERE transaction_type = 'REVENUE') as maintenance_transactions
    FROM maintenance_financial_transactions
    WHERE transaction_date BETWEEN (SELECT period_start FROM current_period) AND (SELECT period_end FROM current_period)
    AND deleted_at IS NULL
),
period_comparison AS (
    SELECT
        SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as prior_revenue,
        SUM(total_amount) FILTER (WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')) as prior_costs
    FROM (
        SELECT total_amount, transaction_type FROM cleaning_financial_transactions
        UNION ALL
        SELECT total_amount, transaction_type FROM maintenance_financial_transactions
    ) all_transactions
    WHERE transaction_date BETWEEN (SELECT period_start FROM current_period) - INTERVAL '1 month'
                                AND (SELECT period_end FROM current_period) - INTERVAL '1 month'
    AND deleted_at IS NULL
)
SELECT
    (SELECT period_start FROM current_period) as reporting_month,
    (SELECT period_end FROM current_period) as reporting_end,

    -- Revenue metrics
    COALESCE(cm.cleaning_revenue, 0) + COALESCE(mm.maintenance_revenue, 0) as total_revenue,
    COALESCE(cm.cleaning_revenue, 0) as cleaning_revenue,
    COALESCE(mm.maintenance_revenue, 0) as maintenance_revenue,
    ROUND(
        ((COALESCE(cm.cleaning_revenue, 0) + COALESCE(mm.maintenance_revenue, 0)) -
         COALESCE(pc.prior_revenue, 0)) / NULLIF(COALESCE(pc.prior_revenue, 0), 0) * 100, 2
    ) as revenue_growth_pct,

    -- Cost metrics
    COALESCE(cm.cleaning_costs, 0) + COALESCE(mm.maintenance_costs, 0) as total_costs,
    COALESCE(cm.cleaning_costs, 0) as cleaning_costs,
    COALESCE(mm.maintenance_costs, 0) as maintenance_costs,

    -- Profitability
    (COALESCE(cm.cleaning_revenue, 0) + COALESCE(mm.maintenance_revenue, 0)) -
    (COALESCE(cm.cleaning_costs, 0) + COALESCE(mm.maintenance_costs, 0)) as gross_profit,
    ROUND(
        ((COALESCE(cm.cleaning_revenue, 0) + COALESCE(mm.maintenance_revenue, 0)) -
         (COALESCE(cm.cleaning_costs, 0) + COALESCE(mm.maintenance_costs, 0))) /
        NULLIF((COALESCE(cm.cleaning_revenue, 0) + COALESCE(mm.maintenance_revenue, 0)), 0) * 100, 2
    ) as profit_margin_pct,

    -- Customer metrics
    COALESCE(cm.cleaning_customers, 0) + COALESCE(mm.maintenance_customers, 0) as total_customers,
    COALESCE(cm.cleaning_customers, 0) as cleaning_customers,
    COALESCE(mm.maintenance_customers, 0) as maintenance_customers,

    -- Transaction volume
    COALESCE(cm.cleaning_transactions, 0) + COALESCE(mm.maintenance_transactions, 0) as total_transactions,

    -- Cost efficiency
    ROUND(
        (COALESCE(cm.cleaning_costs, 0) + COALESCE(mm.maintenance_costs, 0)) /
        NULLIF((COALESCE(cm.cleaning_revenue, 0) + COALESCE(mm.maintenance_revenue, 0)), 0) * 100, 2
    ) as cost_ratio_pct

FROM current_period cp
CROSS JOIN cleaning_metrics cm
CROSS JOIN maintenance_metrics mm
CROSS JOIN period_comparison pc;

-- Service comparison dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS service_comparison_dashboard AS
WITH monthly_metrics AS (
    SELECT
        DATE_TRUNC('month', transaction_date) as month,
        'CLEANING' as service_type,
        SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as revenue,
        SUM(total_amount) FILTER (WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')) as costs,
        COUNT(DISTINCT customer_profile_id) FILTER (WHERE transaction_type = 'REVENUE') as customers,
        AVG(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as avg_transaction_value
    FROM cleaning_financial_transactions
    WHERE deleted_at IS NULL
    GROUP BY DATE_TRUNC('month', transaction_date)

    UNION ALL

    SELECT
        DATE_TRUNC('month', transaction_date) as month,
        'MAINTENANCE' as service_type,
        SUM(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as revenue,
        SUM(total_amount) FILTER (WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')) as costs,
        COUNT(DISTINCT customer_profile_id) FILTER (WHERE transaction_type = 'REVENUE') as customers,
        AVG(total_amount) FILTER (WHERE transaction_type = 'REVENUE') as avg_transaction_value
    FROM maintenance_financial_transactions
    WHERE deleted_at IS NULL
    GROUP BY DATE_TRUNC('month', transaction_date)
)
SELECT
    month,
    service_type,
    revenue,
    costs,
    revenue - costs as profit,
    ROUND(((revenue - costs) / NULLIF(revenue, 0)) * 100, 2) as profit_margin_pct,
    customers,
    avg_transaction_value,
    -- Month-over-month growth
    ROUND(
        (revenue - LAG(revenue) OVER (PARTITION BY service_type ORDER BY month)) /
        NULLIF(LAG(revenue) OVER (PARTITION BY service_type ORDER BY month), 0) * 100, 2
    ) as revenue_growth_pct,
    -- Profit margin trend
    LAG(ROUND(((revenue - costs) / NULLIF(revenue, 0)) * 100, 2))
        OVER (PARTITION BY service_type ORDER BY month) as prior_margin_pct

FROM monthly_metrics
ORDER BY service_type, month DESC;
```

## Predictive Financial Analytics

### Revenue Forecasting Model
```sql
-- Revenue forecasting using historical trends and seasonality
CREATE OR REPLACE FUNCTION forecast_service_revenue(
    service_type VARCHAR,
    forecast_months INTEGER DEFAULT 12,
    confidence_level VARCHAR DEFAULT 'MEDIUM' -- LOW, MEDIUM, HIGH
) RETURNS TABLE(
    forecast_month DATE,
    forecasted_revenue DECIMAL,
    confidence_range_low DECIMAL,
    confidence_range_high DECIMAL,
    trend_factor DECIMAL,
    seasonality_factor DECIMAL,
    forecast_confidence VARCHAR
) AS $$
DECLARE
    confidence_multiplier DECIMAL;
BEGIN
    -- Set confidence multiplier based on confidence level
    CASE confidence_level
        WHEN 'LOW' THEN confidence_multiplier := 0.3;
        WHEN 'MEDIUM' THEN confidence_multiplier := 0.15;
        WHEN 'HIGH' THEN confidence_multiplier := 0.08;
    END CASE;

    RETURN QUERY
    WITH historical_data AS (
        SELECT
            DATE_TRUNC('month', transaction_date) as month,
            SUM(total_amount) as monthly_revenue,
            EXTRACT(MONTH FROM transaction_date) as month_number,
            EXTRACT(YEAR FROM transaction_date) as year_number,
            COUNT(*) as transaction_count
        FROM (
            SELECT transaction_date, total_amount
            FROM cleaning_financial_transactions
            WHERE transaction_type = 'REVENUE' AND deleted_at IS NULL
            AND service_type = 'CLEANING'

            UNION ALL

            SELECT transaction_date, total_amount
            FROM maintenance_financial_transactions
            WHERE transaction_type = 'REVENUE' AND deleted_at IS NULL
            AND service_type = 'MAINTENANCE'
        ) combined_data
        WHERE service_type = forecast_service_revenue.service_type
        AND transaction_date >= CURRENT_DATE - INTERVAL '24 months'
        GROUP BY DATE_TRUNC('month', transaction_date), EXTRACT(MONTH FROM transaction_date), EXTRACT(YEAR FROM transaction_date)
    ),
    trend_analysis AS (
        SELECT
            month,
            monthly_revenue,
            -- Simple linear trend calculation
            AVG(monthly_revenue) OVER (ORDER BY month ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) as moving_avg,
            -- Calculate month-over-month growth trend
            (monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY month)) / LAG(monthly_revenue) OVER (ORDER BY month) as growth_rate
        FROM historical_data
    ),
    seasonality_factors AS (
        SELECT
            month_number,
            AVG(monthly_revenue) / AVG(AVG(monthly_revenue)) OVER () as seasonality_index
        FROM historical_data
        GROUP BY month_number
    )
    SELECT
        -- Generate forecast for each future month
        (DATE_TRUNC('month', CURRENT_DATE) + (generate_series.month_offset || ' months')::INTERVAL)::DATE as forecast_month,

        -- Base forecast using trend
        ROUND(
            (SELECT AVG(monthly_revenue) FROM trend_analysis WHERE month >= CURRENT_DATE - INTERVAL '3 months') *
            (1 + COALESCE(AVG(growth_rate) FROM trend_analysis WHERE month >= CURRENT_DATE - INTERVAL '6 months'), 0))
            *
            COALESCE(sf.seasonality_index, 1.0), 2
        ) as forecasted_revenue,

        -- Confidence ranges
        ROUND(
            (SELECT AVG(monthly_revenue) FROM trend_analysis WHERE month >= CURRENT_DATE - INTERVAL '3 months') *
            (1 + COALESCE(AVG(growth_rate) FROM trend_analysis WHERE month >= CURRENT_DATE - INTERVAL '6 months'), 0))
            *
            COALESCE(sf.seasonality_index, 1.0) * (1 - confidence_multiplier), 2
        ) as confidence_range_low,

        ROUND(
            (SELECT AVG(monthly_revenue) FROM trend_analysis WHERE month >= CURRENT_DATE - INTERVAL '3 months') *
            (1 + COALESCE(AVG(growth_rate) FROM trend_analysis WHERE month >= CURRENT_DATE - INTERVAL '6 months'), 0))
            *
            COALESCE(sf.seasonality_index, 1.0) * (1 + confidence_multiplier), 2
        ) as confidence_range_high,

        COALESCE(AVG(growth_rate) FROM trend_analysis WHERE month >= CURRENT_DATE - INTERVAL '6 months') as trend_factor,
        COALESCE(sf.seasonality_index, 1.0) as seasonality_factor,
        confidence_level as forecast_confidence

    FROM generate_series(1, forecast_months) AS generate_series(month_offset)
    LEFT JOIN seasonality_factors sf ON sf.month_number = EXTRACT(MONTH FROM
        (DATE_TRUNC('month', CURRENT_DATE) + (generate_series.month_offset || ' months')::INTERVAL))
    ORDER BY forecast_month;
END;
$$ LANGUAGE plpgsql;

-- Cost forecasting model
CREATE OR REPLACE FUNCTION forecast_service_costs(
    service_type VARCHAR,
    forecast_months INTEGER DEFAULT 12,
    cost_category VARCHAR DEFAULT 'ALL' -- ALL, LABOR, SUPPLIES, OPERATING
) RETURNS TABLE(
    forecast_month DATE,
    forecasted_costs DECIMAL,
    cost_breakdown JSONB,
    efficiency_trend DECIMAL,
    cost_growth_rate DECIMAL,
    cost_ratio_to_revenue DECIMAL
) AS $$
WITH historical_costs AS (
    SELECT
        DATE_TRUNC('month', transaction_date) as month,
        transaction_category,
        SUM(total_amount) as monthly_costs,
        COUNT(*) as transaction_count
    FROM (
        SELECT transaction_date, transaction_type, transaction_category, total_amount
        FROM cleaning_financial_transactions
        WHERE deleted_at IS NULL
        AND service_type = 'CLEANING'

        UNION ALL

        SELECT transaction_date, transaction_type, transaction_category, total_amount
        FROM maintenance_financial_transactions
        WHERE deleted_at IS NULL
        AND service_type = 'MAINTENANCE'
    ) combined_data
    WHERE combined_data.service_type = forecast_service_costs.service_type
    AND transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE')
    AND (cost_category = 'ALL' OR transaction_category = cost_category)
    AND transaction_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', transaction_date), transaction_category
),
cost_trend AS (
    SELECT
        month,
        SUM(monthly_costs) as total_monthly_costs,
        AVG(monthly_costs) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg,
        -- Month-over-month cost growth
        (SUM(monthly_costs) - LAG(SUM(monthly_costs)) OVER (ORDER BY month)) /
        LAG(SUM(monthly_costs)) OVER (ORDER BY month) as cost_growth_rate
    FROM historical_costs
    GROUP BY month
)
SELECT
    (DATE_TRUNC('month', CURRENT_DATE) + (generate_series.month_offset || ' months')::INTERVAL)::DATE as forecast_month,

    -- Base cost forecast
    ROUND(
        (SELECT AVG(total_monthly_costs) FROM cost_trend WHERE month >= CURRENT_DATE - INTERVAL '3 months') *
        (1 + COALESCE(AVG(cost_growth_rate) FROM cost_trend WHERE month >= CURRENT_DATE - INTERVAL '6 months'), 0)
    ) as forecasted_costs,

    -- Cost breakdown by category
    jsonb_build_object(
        'predicted_distribution', jsonb_agg(
            jsonb_build_object(
                'category', hc.transaction_category,
                'percentage', ROUND((hc.monthly_costs / NULLIF(SUM(hc.monthly_costs) OVER (PARTITION BY hc.month), 0)) * 100, 2)
            )
        )
    ) as cost_breakdown,

    -- Efficiency trend (inverse of cost growth)
    COALESCE(AVG(cost_growth_rate) FROM cost_trend WHERE month >= CURRENT_DATE - INTERVAL '6 months') as efficiency_trend,

    COALESCE(AVG(cost_growth_rate) FROM cost_trend WHERE month >= CURRENT_DATE - INTERVAL '6 months') as cost_growth_rate,

    -- Projected cost to revenue ratio (assuming current revenue growth continues)
    0.65 as cost_ratio_to_revenue -- This would be calculated based on revenue forecasts

FROM generate_series(1, forecast_months) AS generate_series(month_offset)
LEFT JOIN (
    SELECT DISTINCT month, transaction_category, monthly_costs
    FROM historical_costs
    WHERE month >= CURRENT_DATE - INTERVAL '3 months'
) hc ON generate_series.month_offset = 1 -- Placeholder for proper temporal logic
GROUP BY generate_series.month_offset
ORDER BY forecast_month;
$$ LANGUAGE plpgsql;
```

## Customer and Property Profitability Analytics

### Customer Profitability Analysis
```sql
-- Customer profitability ranking
CREATE MATERIALIZED VIEW IF NOT EXISTS customer_profitability_analysis AS
WITH customer_revenue AS (
    SELECT
        customer_profile_id,
        service_type,
        SUM(total_amount) as total_revenue,
        COUNT(*) as transaction_count,
        AVG(total_amount) as avg_transaction_value,
        MIN(transaction_date) as first_transaction_date,
        MAX(transaction_date) as last_transaction_date
    FROM (
        SELECT customer_profile_id, total_amount, transaction_date, 'CLEANING' as service_type
        FROM cleaning_financial_transactions
        WHERE transaction_type = 'REVENUE' AND deleted_at IS NULL

        UNION ALL

        SELECT customer_profile_id, total_amount, transaction_date, 'MAINTENANCE' as service_type
        FROM maintenance_financial_transactions
        WHERE transaction_type = 'REVENUE' AND deleted_at IS NULL
    ) all_revenue
    GROUP BY customer_profile_id, service_type
),
customer_costs AS (
    SELECT
        customer_profile_id,
        service_type,
        SUM(total_amount) as total_direct_costs,
        SUM(labor_cost + COALESCE(supplies_cost, 0) + COALESCE(equipment_cost, 0)) as total_allocated_costs
    FROM (
        SELECT customer_profile_id, total_amount, labor_cost, supplies_cost, equipment_cost, 'CLEANING' as service_type
        FROM cleaning_financial_transactions
        WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE') AND deleted_at IS NULL

        UNION ALL

        SELECT customer_profile_id, total_amount, labor_cost, COALESCE(parts_cost, 0), 0 as equipment_cost, 'MAINTENANCE' as service_type
        FROM maintenance_financial_transactions
        WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE') AND deleted_at IS NULL
    ) all_costs
    GROUP BY customer_profile_id, service_type
),
customer_lifetime AS (
    SELECT
        cr.customer_profile_id,
        cr.service_type,
        cr.total_revenue,
        COALESCE(cc.total_direct_costs, 0) + COALESCE(cc.total_allocated_costs, 0) as total_costs,
        cr.total_revenue - (COALESCE(cc.total_direct_costs, 0) + COALESCE(cc.total_allocated_costs, 0)) as gross_profit,
        ROUND(
            (cr.total_revenue - (COALESCE(cc.total_direct_costs, 0) + COALESCE(cc.total_allocated_costs, 0))) /
            NULLIF(cr.total_revenue, 0) * 100, 2
        ) as profit_margin_pct,
        cr.transaction_count,
        cr.avg_transaction_value,
        CURRENT_DATE - cr.first_transaction_date as customer_age_days,
        cr.last_transaction_date,
        -- Customer value indicators
        CASE
            WHEN cr.total_revenue > 10000 THEN 'HIGH_VALUE'
            WHEN cr.total_revenue > 5000 THEN 'MEDIUM_VALUE'
            ELSE 'LOW_VALUE'
        END as value_tier,
        -- Activity level based on transaction frequency
        CASE
            WHEN cr.transaction_count > 50 THEN 'VERY_ACTIVE'
            WHEN cr.transaction_count > 20 THEN 'ACTIVE'
            WHEN cr.transaction_count > 5 THEN 'MODERATELY_ACTIVE'
            ELSE 'LOW_ACTIVITY'
        END as activity_level
    FROM customer_revenue cr
    LEFT JOIN customer_costs cc ON cr.customer_profile_id = cc.customer_profile_id AND cr.service_type = cc.service_type
),
customers_with_profiles AS (
    SELECT
        clt.*,
        cp.first_name,
        cp.last_name,
        cp.email,
        cp.phone,
        -- Service preference
        CASE WHEN clt.service_type = 'CLEANING' THEN 'PRIMARY_CLEANING'
             WHEN clt.service_type = 'MAINTENANCE' THEN 'PRIMARY_MAINTENANCE'
             ELSE 'DUAL_SERVICE'
        END as service_preference
    FROM customer_lifetime clt
    JOIN shared_auth_db.customer_profiles cp ON clt.customer_profile_id = cp.id
)
SELECT
    customer_profile_id,
    service_type,
    first_name,
    last_name,
    email,
    phone,
    service_preference,
    total_revenue,
    total_costs,
    gross_profit,
    profit_margin_pct,
    transaction_count,
    avg_transaction_value,
    customer_age_days,
    last_transaction_date,
    value_tier,
    activity_level,
    -- Ranking metrics
    ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY gross_profit DESC) as profit_rank,
    ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY total_revenue DESC) as revenue_rank,
    ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY profit_margin_pct DESC) as efficiency_rank
FROM customers_with_profiles
ORDER BY service_type, gross_profit DESC;
```

### Property ROI Analysis
```sql
-- Property investment return analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS property_roi_analysis AS
WITH property_revenue AS (
    SELECT
        property_id,
        service_type,
        SUM(total_amount) as total_revenue,
        COUNT(*) as service_transactions,
        AVG(total_amount) as avg_service_value,
        MIN(transaction_date) as first_service_date,
        MAX(transaction_date) as last_service_date
    FROM (
        SELECT property_id, total_amount, transaction_date, 'CLEANING' as service_type
        FROM cleaning_financial_transactions
        WHERE transaction_type = 'REVENUE' AND deleted_at IS NULL
        AND property_id IS NOT NULL

        UNION ALL

        SELECT property_id, total_amount, transaction_date, 'MAINTENANCE' as service_type
        FROM maintenance_financial_transactions
        WHERE transaction_type = 'REVENUE' AND deleted_at IS NULL
        AND property_id IS NOT NULL
    ) all_property_revenue
    GROUP BY property_id, service_type
),
property_costs AS (
    SELECT
        property_id,
        service_type,
        SUM(total_amount) as total_property_costs,
        SUM(labor_cost + COALESCE(supplies_cost, 0) + COALESCE(equipment_cost, 0) + COALESCE(parts_cost, 0)) as total_direct_costs
    FROM (
        SELECT property_id, total_amount, labor_cost, supplies_cost, equipment_cost, 0 as parts_cost, 'CLEANING' as service_type
        FROM cleaning_financial_transactions
        WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE') AND deleted_at IS NULL
        AND property_id IS NOT NULL

        UNION ALL

        SELECT property_id, total_amount, labor_cost, 0 as supplies_cost, 0 as equipment_cost, parts_cost, 'MAINTENANCE' as service_type
        FROM maintenance_financial_transactions
        WHERE transaction_type IN ('COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE') AND deleted_at IS NULL
        AND property_id IS NOT NULL
    ) all_property_costs
    GROUP BY property_id, service_type
),
property_performance AS (
    SELECT
        pr.property_id,
        pr.service_type,
        pr.total_revenue,
        COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0) as total_costs,
        pr.total_revenue - (COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0)) as net_profit,
        ROUND(
            (pr.total_revenue - (COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0))) /
            NULLIF(COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0), 0) * 100, 2
        ) as roi_percentage,
        pr.service_transactions,
        pr.avg_service_value,
        CURRENT_DATE - pr.first_service_date as service_age_days,
        -- ROI classification
        CASE
            WHEN (pr.total_revenue - (COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0))) /
                 NULLIF(COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0), 0) > 1.0 THEN 'HIGH_ROI'
            WHEN (pr.total_revenue - (COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0))) /
                 NULLIF(COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0), 0) > 0.5 THEN 'MODERATE_ROI'
            WHEN (pr.total_revenue - (COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0))) /
                 NULLIF(COALESCE(pc.total_property_costs, 0) + COALESCE(pc.total_direct_costs, 0), 0) > 0 THEN 'LOW_ROI'
            ELSE 'NEGATIVE_ROI'
        END as roi_classification
    FROM property_revenue pr
    LEFT JOIN property_costs pc ON pr.property_id = pc.property_id AND pr.service_type = pc.service_type
)
SELECT
    pp.*,
    -- Property details
    COALESCE(cp.address_line1, 'Unknown Address') as property_address,
    COALESCE(cp.city, 'Unknown City') as property_city,
    COALESCE(cp.postcode, 'Unknown') as property_postcode,

    -- Performance metrics per month
    ROUND(pp.net_profit / NULLIF((CURRENT_DATE - pp.first_service_date) / 30, 0), 2) as monthly_avg_profit,
    ROUND(pp.total_revenue / NULLIF(pp.service_transactions, 0), 2) as revenue_per_service,

    -- Ranking within service type
    ROW_NUMBER() OVER (PARTITION BY pp.service_type ORDER BY pp.net_profit DESC) as profit_rank,
    ROW_NUMBER() OVER (PARTITION BY pp.service_type ORDER BY pp.roi_percentage DESC) as roi_rank

FROM property_performance pp
LEFT JOIN cleaning_db.cleaning_properties cp ON pp.property_id = cp.id AND pp.service_type = 'CLEANING'
LEFT JOIN maintenance_db.maintenance_properties mp ON pp.property_id = mp.id AND pp.service_type = 'MAINTENANCE'
ORDER BY pp.service_type, pp.net_profit DESC;
```

## Budget Variance and Performance Analytics

### Budget Performance Monitoring
```sql
-- Real-time budget variance analysis
CREATE OR REPLACE FUNCTION analyze_budget_variance(
    tenant_id UUID DEFAULT NULL,
    budget_type VARCHAR DEFAULT 'MONTHLY'
) RETURNS TABLE(
    service_type VARCHAR,
    budget_name VARCHAR,
    variance_type VARCHAR, -- REVENUE, COSTS, PROFIT
    budgeted_amount DECIMAL,
    actual_amount DECIMAL,
    variance_amount DECIMAL,
    variance_percentage DECIMAL,
    variance_status VARCHAR, -- FAVORABLE, UNFAVORABLE, ON_TARGET
    alert_level VARCHAR, -- GREEN, YELLOW, RED
    recommendations TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    -- Cleaning service budget variance
    SELECT
        'CLEANING' as service_type,
        csb.budget_name,
        'REVENUE' as variance_type,
        csb.budgeted_revenue as budgeted_amount,
        csb.actual_revenue as actual_amount,
        csb.revenue_variance as variance_amount,
        ROUND(csb.revenue_variance / NULLIF(csb.budgeted_revenue, 0) * 100, 2) as variance_percentage,
        CASE
            WHEN csb.revenue_variance > 0 THEN 'FAVORABLE'
            WHEN csb.revenue_variance < 0 THEN 'UNFAVORABLE'
            ELSE 'ON_TARGET'
        END as variance_status,
        CASE
            WHEN ABS(csb.revenue_variance / NULLIF(csb.budgeted_revenue, 0) * 100) >= 20 THEN 'RED'
            WHEN ABS(csb.revenue_variance / NULLIF(csb.budgeted_revenue, 0) * 100) >= 10 THEN 'YELLOW'
            ELSE 'GREEN'
        END as alert_level,
        CASE
            WHEN csb.revenue_variance < 0 AND ABS(csb.revenue_variance / NULLIF(csb.budgeted_revenue, 0) * 100) > 15 THEN
                ARRAY['Review pricing strategy', 'Analyze customer retention', 'Increase marketing efforts']
            WHEN csb.revenue_variance > 0 AND csb.revenue_variance / NULLIF(csb.budgeted_revenue, 0) > 20 THEN
                ARRAY['Consider capacity expansion', 'Optimize pricing', 'Scale successful initiatives']
            ELSE ARRAY[]
        END as recommendations
    FROM cleaning_service_budgets csb
    WHERE (tenant_id IS NULL OR csb.tenant_id = tenant_id)
    AND csb.status = 'ACTIVE'
    AND csb.budget_type = analyze_budget_variance.budget_type

    UNION ALL

    SELECT
        'MAINTENANCE' as service_type,
        msb.budget_name,
        'REVENUE' as variance_type,
        msb.budgeted_revenue as budgeted_amount,
        msb.actual_revenue as actual_amount,
        msb.revenue_variance as variance_amount,
        ROUND(msb.revenue_variance / NULLIF(msb.budgeted_revenue, 0) * 100, 2) as variance_percentage,
        CASE
            WHEN msb.revenue_variance > 0 THEN 'FAVORABLE'
            WHEN msb.revenue_variance < 0 THEN 'UNFAVORABLE'
            ELSE 'ON_TARGET'
        END as variance_status,
        CASE
            WHEN ABS(msb.revenue_variance / NULLIF(msb.budgeted_revenue, 0) * 100) >= 20 THEN 'RED'
            WHEN ABS(msb.revenue_variance / NULLIF(msb.budgeted_revenue, 0) * 100) >= 10 THEN 'YELLOW'
            ELSE 'GREEN'
        END as alert_level,
        CASE
            WHEN msb.revenue_variance < 0 AND ABS(msb.revenue_variance / NULLIF(msb.budgeted_revenue, 0) * 100) > 15 THEN
                ARRAY['Review service offerings', 'Analyze competitive pricing', 'Expand service areas']
            WHEN msb.revenue_variance > 0 AND msb.revenue_variance / NULLIF(msb.budgeted_revenue, 0) > 20 THEN
                ARRAY['Invest in equipment', 'Hire additional technicians', 'Expand service coverage']
            ELSE ARRAY[]
        END as recommendations
    FROM maintenance_service_budgets msb
    WHERE (tenant_id IS NULL OR msb.tenant_id = tenant_id)
    AND msb.status = 'ACTIVE'
    AND msb.budget_type = analyze_budget_variance.budget_type

    UNION ALL

    -- Cost variance analysis for both services
    SELECT
        'CLEANING' as service_type,
        csb.budget_name,
        'COSTS' as variance_type,
        (csb.budgeted_labor_cost + csb.budgeted_supplies_cost + csb.budgeted_equipment_cost + csb.budgeted_operating_expenses) as budgeted_amount,
        (csb.actual_labor_cost + csb.actual_supplies_cost + csb.actual_equipment_cost + csb.actual_operating_expenses) as actual_amount,
        csb.cost_variance as variance_amount,
        ROUND(csb.cost_variance / NULLIF((csb.budgeted_labor_cost + csb.budgeted_supplies_cost + csb.budgeted_equipment_cost + csb.budgeted_operating_expenses), 0) * 100, 2) as variance_percentage,
        CASE
            WHEN csb.cost_variance < 0 THEN 'FAVORABLE'
            WHEN csb.cost_variance > 0 THEN 'UNFAVORABLE'
            ELSE 'ON_TARGET'
        END as variance_status,
        CASE
            WHEN ABS(csb.cost_variance / NULLIF((csb.budgeted_labor_cost + csb.budgeted_supplies_cost + csb.budgeted_equipment_cost + csb.budgeted_operating_expenses), 0) * 100) >= 15 THEN 'RED'
            WHEN ABS(csb.cost_variance / NULLIF((csb.budgeted_labor_cost + csb.budgeted_supplies_cost + csb.budgeted_equipment_cost + csb.budgeted_operating_expenses), 0) * 100) >= 8 THEN 'YELLOW'
            ELSE 'GREEN'
        END as alert_level,
        CASE
            WHEN csb.cost_variance > 0 AND ABS(csb.cost_variance / NULLIF((csb.budgeted_labor_cost + csb.budgeted_supplies_cost + csb.budgeted_equipment_cost + csb.budgeted_operating_expenses), 0) * 100) > 12 THEN
                ARRAY['Review cost controls', 'Analyze expense categories', 'Optimize resource allocation']
            ELSE ARRAY[]
        END as recommendations
    FROM cleaning_service_budgets csb
    WHERE (tenant_id IS NULL OR csb.tenant_id = tenant_id)
    AND csb.status = 'ACTIVE'
    AND csb.budget_type = analyze_budget_variance.budget_type;
END;
$$ LANGUAGE plpgsql;
```

## Benefits

### For Financial Management
- Real-time visibility into service profitability and performance
- Advanced forecasting with confidence intervals and seasonality adjustments
- Comprehensive budget variance monitoring with actionable recommendations
- Customer and property profitability analysis for strategic decision-making

### For Business Intelligence
- Cross-service financial consolidation and comparison
- Predictive analytics for revenue and cost planning
- ROI analysis by property, customer, and service type
- Trend analysis with growth rate calculations

### For Operational Excellence
- Automated KPI monitoring and alerting
- Cost efficiency tracking and optimization opportunities
- Service performance benchmarking
- Data-driven recommendations for improvement

## Risk Mitigation

### Financial Accuracy
- Multi-layer validation for financial calculations
- Audit trails for all financial transactions and adjustments
- Automated reconciliation with external systems
- Error detection and correction mechanisms

### Data Privacy
- Role-based access to sensitive financial information
- Data anonymization for analytical reporting
- Secure storage of financial data with encryption
- Compliance with financial reporting standards

### System Performance
- Materialized views for high-frequency reporting queries
- Efficient indexing strategies for large datasets
- Caching mechanisms for real-time dashboards
- Optimized query execution plans

## Next Steps

1. **Integrate Accounting Systems**: Connect to QuickBooks, Xero, or other accounting platforms
2. **Build Executive Dashboards**: Create user-friendly financial reporting interfaces
3. **Implement Alert Systems**: Set up automated alerts for variance thresholds
4. **Enhance Forecasting Models**: Implement machine learning for improved accuracy
5. **Create Mobile Reporting**: Develop mobile-friendly financial dashboards for field staff