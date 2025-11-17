# Job Analytics and Reporting System

## Overview
This document outlines the comprehensive analytics and reporting system for separated cleaning and maintenance services, providing real-time insights, performance metrics, and business intelligence for operational excellence.

## Analytics Architecture

### Data Warehouse Structure
```sql
-- Analytics fact tables for comprehensive reporting
CREATE TABLE IF NOT EXISTS analytics.job_performance_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_id INTEGER NOT NULL,
    service_type VARCHAR(20) NOT NULL,
    tenant_id UUID NOT NULL,
    contractor_id UUID,
    property_id UUID,
    job_id UUID NOT NULL,

    -- Job metrics
    job_type VARCHAR(50),
    job_category VARCHAR(50),
    scheduled_date DATE,
    actual_start_date DATE,
    completion_date DATE,
    scheduled_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),

    -- Quality metrics
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    on_time_completion BOOLEAN DEFAULT true,
    first_time_resolution BOOLEAN DEFAULT false,

    -- Performance metrics
    productivity_score DECIMAL(5,2),
    efficiency_score DECIMAL(5,2),
    revenue_per_hour DECIMAL(10,2),

    -- Categorization
    priority_level VARCHAR(20),
    complexity_level VARCHAR(20),
    is_emergency BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (date_id) REFERENCES analytics.date_dimension(id),
    FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),

    INDEX idx_job_facts_date_service (date_id, service_type),
    INDEX idx_job_facts_contractor (contractor_id),
    INDEX idx_job_facts_tenant (tenant_id),
    INDEX idx_job_facts_type (job_type)
);

-- Date dimension for time-based analytics
CREATE TABLE IF NOT EXISTS analytics.date_dimension (
    id INTEGER PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    month INTEGER,
    quarter INTEGER,
    year INTEGER,
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    season VARCHAR(20),
    fiscal_week INTEGER,
    fiscal_month INTEGER,
    fiscal_quarter INTEGER,
    fiscal_year INTEGER
);
```

### Service-Specific Analytics

#### Cleaning Service Analytics
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.cleaning_performance_dashboard AS
SELECT
    DATE_TRUNC('week', cj.created_at) as week_start,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED') as completed_jobs,
    COUNT(*) FILTER (WHERE cj.job_status = 'CANCELLED') as cancelled_jobs,

    -- Performance metrics
    ROUND(AVG(cj.completion_percentage), 2) as avg_completion_rate,
    ROUND(AVG(cj.quality_score), 2) as avg_quality_score,
    ROUND(AVG(cj.customer_rating), 2) as avg_customer_rating,
    ROUND(AVG(cj.actual_duration_minutes), 2) as avg_actual_duration,
    ROUND(AVG(cj.estimated_duration_minutes), 2) as avg_estimated_duration,

    -- Duration accuracy (how well we estimate)
    ROUND(
        AVG(
            CASE
                WHEN cj.estimated_duration_minutes > 0 THEN
                ABS(cj.actual_duration_minutes - cj.estimated_duration_minutes)::DECIMAL / cj.estimated_duration_minutes
                ELSE NULL
            END
        ) * 100, 2
    ) as duration_variance_percentage,

    -- Financial metrics
    SUM(cj.total_price) as total_revenue,
    ROUND(AVG(cj.total_price), 2) as avg_revenue_per_job,
    SUM(cj.additional_charges) as total_additional_charges,
    COUNT(DISTINCT cj.contractor_id) as active_contractors,

    -- Quality distribution
    COUNT(*) FILTER (WHERE cj.quality_score >= 4) as high_quality_jobs,
    COUNT(*) FILTER (WHERE cj.quality_score >= 4)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE cj.quality_score IS NOT NULL), 0) * 100 as high_quality_percentage,

    -- On-time performance
    COUNT(*) FILTER (
        WHERE cj.scheduled_date <= cj.completed_at OR cj.completed_at IS NULL
    ) as on_time_jobs,
    COUNT(*) FILTER (
        WHERE cj.scheduled_date <= cj.completed_at OR cj.completed_at IS NULL
    )::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED'), 0) * 100 as on_time_percentage,

    -- Job type breakdown
    jsonb_agg(
        jsonb_build_object(
            'job_type', cj.job_type,
            'count', COUNT(*),
            'percentage', ROUND(COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER () * 100, 2)
        )
    ) as job_type_distribution

FROM cleaning_db.cleaning_jobs cj
WHERE cj.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('week', cj.created_at)
ORDER BY week_start DESC;

-- Cleaning contractor performance analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.cleaning_contractor_performance AS
SELECT
    cc.id as contractor_id,
    cc.name,
    cj.job_type,

    -- Job volume
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED') as completed_jobs,
    COUNT(*) FILTER (WHERE cj.job_status = 'CANCELLED') as cancelled_jobs,

    -- Quality metrics
    ROUND(AVG(cj.quality_score), 2) as avg_quality_score,
    ROUND(AVG(cj.customer_rating), 2) as avg_customer_rating,
    COUNT(*) FILTER (WHERE cj.quality_score >= 4) as high_quality_jobs,

    -- Performance metrics
    ROUND(AVG(cj.completion_percentage), 2) as avg_completion_rate,
    ROUND(AVG(cj.actual_duration_minutes), 2) as avg_actual_duration,
    ROUND(AVG(CASE WHEN cj.estimated_duration_minutes > 0
            THEN cj.actual_duration_minutes::DECIMAL / cj.estimated_duration_minutes
            ELSE NULL END), 2) as duration_accuracy_ratio,

    -- Financial metrics
    SUM(cj.total_price) as total_revenue,
    ROUND(AVG(cj.total_price), 2) as avg_revenue_per_job,
    ROUND(SUM(cj.total_price) / NULLIF(SUM(cj.actual_duration_minutes), 0) * 60, 2) as revenue_per_hour,

    -- Reliability metrics
    COUNT(*) FILTER (WHERE cj.scheduled_date <= cj.completed_at OR cj.completed_at IS NULL)::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED'), 0) * 100 as on_time_percentage,

    -- Recent performance (last 30 days)
    COUNT(*) FILTER (WHERE cj.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_jobs,
    ROUND(AVG(cj.quality_score) FILTER (WHERE cj.created_at >= CURRENT_DATE - INTERVAL '30 days'), 2) as recent_quality_score

FROM cleaning_db.cleaning_contractors cc
LEFT JOIN cleaning_db.cleaning_jobs cj ON cc.id = cj.contractor_id
WHERE cc.deleted_at IS NULL
GROUP BY cc.id, cc.name, cj.job_type
ORDER BY total_revenue DESC NULLS LAST;
```

#### Maintenance Service Analytics
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.maintenance_performance_dashboard AS
SELECT
    DATE_TRUNC('week', mwo.created_at) as week_start,
    COUNT(*) as total_work_orders,
    COUNT(*) FILTER (WHERE mwo.work_status = 'COMPLETED') as completed_orders,
    COUNT(*) FILTER (WHERE mwo.work_status = 'CANCELLED') as cancelled_orders,
    COUNT(*) FILTER (WHERE mwo.is_emergency = true) as emergency_orders,

    -- Performance metrics
    ROUND(AVG(mwo.completion_percentage), 2) as avg_completion_rate,
    ROUND(AVG(mwo.customer_rating), 2) as avg_customer_rating,
    ROUND(AVG(mwo.actual_duration_hours), 2) as avg_actual_duration,
    ROUND(AVG(mwo.estimated_duration_hours), 2) as avg_estimated_duration,

    -- Response time metrics (for emergency orders)
    ROUND(
        AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600)
        FILTER (WHERE mwo.is_emergency = true AND mwo.started_at IS NOT NULL), 2
    ) as avg_emergency_response_hours,

    -- First time fix rate
    COUNT(*) FILTER (WHERE mwo.first_time_fix = true)::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE mwo.work_status = 'COMPLETED'), 0) * 100 as first_time_fix_percentage,

    -- Financial metrics
    SUM(mwo.total_cost) as total_revenue,
    ROUND(AVG(mwo.total_cost), 2) as avg_revenue_per_order,
    SUM(mwo.parts_cost) as total_parts_cost,
    SUM(mwo.labor_cost) as total_labor_cost,
    ROUND(AVG(mwo.labor_cost), 2) as avg_labor_cost,

    -- Trade breakdown
    jsonb_agg(
        jsonb_build_object(
            'trade', mwo.trade_category,
            'count', COUNT(*),
            'percentage', ROUND(COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER () * 100, 2),
            'avg_cost', ROUND(AVG(mwo.total_cost), 2)
        )
    ) as trade_distribution,

    -- Complexity breakdown
    jsonb_agg(
        jsonb_build_object(
            'complexity', mwo.complexity_level,
            'count', COUNT(*),
            'percentage', ROUND(COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER () * 100, 2),
            'avg_duration', ROUND(AVG(mwo.actual_duration_hours), 2)
        )
    ) as complexity_distribution,

    COUNT(DISTINCT mwo.contractor_id) as active_contractors

FROM maintenance_db.maintenance_work_orders mwo
WHERE mwo.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('week', mwo.created_at)
ORDER BY week_start DESC;

-- Maintenance contractor performance analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.maintenance_contractor_performance AS
SELECT
    mc.id as contractor_id,
    mc.name,
    mc.trade,
    mc.specializations,

    -- Work order volume
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE mwo.work_status = 'COMPLETED') as completed_orders,
    COUNT(*) FILTER (WHERE mwo.is_emergency = true) as emergency_orders,

    -- Performance metrics
    ROUND(AVG(mwo.customer_rating), 2) as avg_customer_rating,
    ROUND(AVG(mwo.completion_percentage), 2) as avg_completion_rate,
    ROUND(AVG(mwo.actual_duration_hours), 2) as avg_actual_duration,
    ROUND(AVG(mwo.estimated_duration_hours), 2) as avg_estimated_duration,

    -- Duration accuracy
    ROUND(
        AVG(
            CASE
                WHEN mwo.estimated_duration_hours > 0 THEN
                ABS(mwo.actual_duration_hours - mwo.estimated_duration_hours)::DECIMAL / mwo.estimated_duration_hours
                ELSE NULL
            END
        ) * 100, 2
    ) as duration_variance_percentage,

    -- Emergency response metrics
    COUNT(*) FILTER (WHERE mwo.is_emergency = true AND mwo.started_at IS NOT NULL) as emergency_responses,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600)
        FILTER (WHERE mwo.is_emergency = true AND mwo.started_at IS NOT NULL), 2
    ) as avg_emergency_response_time,

    -- Financial metrics
    SUM(mwo.total_cost) as total_revenue,
    ROUND(AVG(mwo.total_cost), 2) as avg_revenue_per_order,
    ROUND(SUM(mwo.labor_cost) / NULLIF(SUM(mwo.actual_duration_hours), 0), 2) as labor_rate_per_hour,

    -- Quality and reliability
    COUNT(*) FILTER (WHERE mwo.first_time_fix = true)::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE mwo.work_status = 'COMPLETED'), 0) * 100 as first_time_fix_rate,
    COUNT(*) FILTER (WHERE mwo.inspection_required = true AND mwo.inspection_passed = true)::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE mwo.inspection_required = true), 0) * 100 as inspection_pass_rate,

    -- Specialization effectiveness
    COUNT(*) FILTER (WHERE mwo.trade_category = ANY(mc.specializations)) as specialized_orders,
    ROUND(AVG(mwo.customer_rating) FILTER (WHERE mwo.trade_category = ANY(mc.specializations)), 2) as specialized_rating

FROM maintenance_db.maintenance_contractors mc
LEFT JOIN maintenance_db.maintenance_work_orders mwo ON mc.id = mwo.contractor_id
WHERE mc.deleted_at IS NULL
GROUP BY mc.id, mc.name, mc.trade, mc.specializations
ORDER BY total_revenue DESC NULLS LAST;
```

## Real-Time Reporting System

### KPI Dashboard Queries
```sql
-- Real-time KPI dashboard for both services
CREATE OR REPLACE FUNCTION get_realtime_kpis(
    service_type VARCHAR DEFAULT 'ALL',
    tenant_id UUID DEFAULT NULL,
    date_range VARCHAR DEFAULT 'TODAY' -- TODAY, WEEK, MONTH, QUARTER, YEAR
) RETURNS TABLE(
    metric_name VARCHAR,
    current_value DECIMAL,
    target_value DECIMAL,
    previous_period_value DECIMAL,
    trend VARCHAR,
    performance_status VARCHAR
) AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    previous_start_date DATE;
    previous_end_date DATE;
BEGIN
    -- Calculate date range based on input
    CASE date_range
        WHEN 'TODAY' THEN
            start_date := CURRENT_DATE;
            end_date := CURRENT_DATE;
            previous_start_date := CURRENT_DATE - INTERVAL '1 day';
            previous_end_date := CURRENT_DATE - INTERVAL '1 day';
        WHEN 'WEEK' THEN
            start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
            end_date := CURRENT_DATE;
            previous_start_date := start_date - INTERVAL '1 week';
            previous_end_date := start_date - INTERVAL '1 day';
        WHEN 'MONTH' THEN
            start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
            end_date := CURRENT_DATE;
            previous_start_date := start_date - INTERVAL '1 month';
            previous_end_date := start_date - INTERVAL '1 day';
        WHEN 'QUARTER' THEN
            start_date := DATE_TRUNC('quarter', CURRENT_DATE)::DATE;
            end_date := CURRENT_DATE;
            previous_start_date := start_date - INTERVAL '3 months';
            previous_end_date := start_date - INTERVAL '1 day';
        WHEN 'YEAR' THEN
            start_date := DATE_TRUNC('year', CURRENT_DATE)::DATE;
            end_date := CURRENT_DATE;
            previous_start_date := start_date - INTERVAL '1 year';
            previous_end_date := start_date - INTERVAL '1 day';
    END CASE;

    RETURN QUERY

    -- Cleaning service KPIs
    SELECT
        'Cleaning Jobs Completed' as metric_name,
        COUNT(*)::DECIMAL as current_value,
        TARGET.daily_cleaning_jobs as target_value,
        LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', cj.created_at)) as previous_period_value,
        CASE
            WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', cj.created_at)) THEN 'UP'
            WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', cj.created_at)) THEN 'DOWN'
            ELSE 'STABLE'
        END as trend,
        CASE
            WHEN COUNT(*) >= TARGET.daily_cleaning_jobs THEN 'ON_TARGET'
            WHEN COUNT(*) >= TARGET.daily_cleaning_jobs * 0.8 THEN 'NEAR_TARGET'
            ELSE 'BELOW_TARGET'
        END as performance_status
    FROM cleaning_db.cleaning_jobs cj, (SELECT 50 as daily_cleaning_jobs) TARGET
    WHERE cj.created_at BETWEEN start_date AND end_date
    AND cj.job_status = 'COMPLETED'
    AND (service_type = 'ALL' OR service_type = 'CLEANING')
    AND (tenant_id IS NULL OR cj.tenant_id = tenant_id)
    GROUP BY DATE_TRUNC('day', cj.created_at)
    ORDER BY DATE_TRUNC('day', cj.created_at) DESC
    LIMIT 1

    UNION ALL

    SELECT
        'Average Cleaning Quality Score' as metric_name,
        ROUND(AVG(cj.quality_score), 2) as current_value,
        4.5 as target_value,
        ROUND(LAG(AVG(cj.quality_score)) OVER (ORDER BY DATE_TRUNC('week', cj.created_at)), 2) as previous_period_value,
        CASE
            WHEN AVG(cj.quality_score) > LAG(AVG(cj.quality_score)) OVER (ORDER BY DATE_TRUNC('week', cj.created_at)) THEN 'UP'
            WHEN AVG(cj.quality_score) < LAG(AVG(cj.quality_score)) OVER (ORDER BY DATE_TRUNC('week', cj.created_at)) THEN 'DOWN'
            ELSE 'STABLE'
        END as trend,
        CASE
            WHEN AVG(cj.quality_score) >= 4.5 THEN 'EXCELLENT'
            WHEN AVG(cj.quality_score) >= 4.0 THEN 'GOOD'
            WHEN AVG(cj.quality_score) >= 3.5 THEN 'ACCEPTABLE'
            ELSE 'NEEDS_IMPROVEMENT'
        END as performance_status
    FROM cleaning_db.cleaning_jobs cj
    WHERE cj.created_at BETWEEN start_date AND end_date
    AND cj.quality_score IS NOT NULL
    AND (service_type = 'ALL' OR service_type = 'CLEANING')
    AND (tenant_id IS NULL OR cj.tenant_id = tenant_id)
    GROUP BY DATE_TRUNC('week', cj.created_at)
    ORDER BY DATE_TRUNC('week', cj.created_at) DESC
    LIMIT 1

    UNION ALL

    -- Maintenance service KPIs
    SELECT
        'Maintenance Orders Completed' as metric_name,
        COUNT(*)::DECIMAL as current_value,
        TARGET.daily_maintenance_orders as target_value,
        LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', mwo.created_at)) as previous_period_value,
        CASE
            WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', mwo.created_at)) THEN 'UP'
            WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', mwo.created_at)) THEN 'DOWN'
            ELSE 'STABLE'
        END as trend,
        CASE
            WHEN COUNT(*) >= TARGET.daily_maintenance_orders THEN 'ON_TARGET'
            WHEN COUNT(*) >= TARGET.daily_maintenance_orders * 0.8 THEN 'NEAR_TARGET'
            ELSE 'BELOW_TARGET'
        END as performance_status
    FROM maintenance_db.maintenance_work_orders mwo, (SELECT 30 as daily_maintenance_orders) TARGET
    WHERE mwo.created_at BETWEEN start_date AND end_date
    AND mwo.work_status = 'COMPLETED'
    AND (service_type = 'ALL' OR service_type = 'MAINTENANCE')
    AND (tenant_id IS NULL OR mwo.tenant_id = tenant_id)
    GROUP BY DATE_TRUNC('day', mwo.created_at)
    ORDER BY DATE_TRUNC('day', mwo.created_at) DESC
    LIMIT 1

    UNION ALL

    SELECT
        'Emergency Response Time (Hours)' as metric_name,
        ROUND(
            AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600), 2
        ) as current_value,
        2.0 as target_value,
        ROUND(
            LAG(AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600)) OVER (ORDER BY DATE_TRUNC('week', mwo.created_at)), 2
        ) as previous_period_value,
        CASE
            WHEN AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600) <
                 LAG(AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600)) OVER (ORDER BY DATE_TRUNC('week', mwo.created_at)) THEN 'UP'
            WHEN AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600) >
                 LAG(AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600)) OVER (ORDER BY DATE_TRUNC('week', mwo.created_at)) THEN 'DOWN'
            ELSE 'STABLE'
        END as trend,
        CASE
            WHEN AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600) <= 2 THEN 'EXCELLENT'
            WHEN AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600) <= 4 THEN 'GOOD'
            WHEN AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600) <= 6 THEN 'ACCEPTABLE'
            ELSE 'NEEDS_IMPROVEMENT'
        END as performance_status
    FROM maintenance_db.maintenance_work_orders mwo
    WHERE mwo.created_at BETWEEN start_date AND end_date
    AND mwo.is_emergency = true
    AND mwo.started_at IS NOT NULL
    AND (service_type = 'ALL' OR service_type = 'MAINTENANCE')
    AND (tenant_id IS NULL OR mwo.tenant_id = tenant_id)
    GROUP BY DATE_TRUNC('week', mwo.created_at)
    ORDER BY DATE_TRUNC('week', mwo.created_at) DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

## Predictive Analytics

### Job Completion Prediction
```sql
CREATE OR REPLACE FUNCTION predict_job_completion_probability(
    job_id UUID,
    service_type VARCHAR
) RETURNS TABLE(
    predicted_completion_probability DECIMAL,
    confidence_level VARCHAR,
    risk_factors TEXT[],
    recommendations TEXT[]
) AS $$
DECLARE
    job_details RECORD;
    contractor_performance RECORD;
    historical_similar_jobs DECIMAL;
    base_probability DECIMAL := 0.85; -- Base 85% completion rate
    adjustment_factors DECIMAL := 0;
    risk_factors TEXT[] := ARRAY[]::TEXT[];
    recommendations TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get job details
    IF service_type = 'CLEANING' THEN
        SELECT * INTO job_details
        FROM cleaning_jobs cj
        JOIN cleaning_db.cleaning_properties p ON cj.property_id = p.id
        WHERE cj.id = predict_job_completion_probability.job_id;

        -- Get contractor performance
        SELECT * INTO contractor_performance
        FROM analytics.cleaning_contractor_performance
        WHERE contractor_id = job_details.contractor_id;

        -- Calculate historical completion rate for similar jobs
        SELECT AVG(
            CASE WHEN cj.job_status = 'COMPLETED' THEN 1.0 ELSE 0.0 END
        ) INTO historical_similar_jobs
        FROM cleaning_jobs cj
        WHERE cj.job_type = job_details.job_type
        AND cj.contractor_id = job_details.contractor_id
        AND cj.created_at >= CURRENT_DATE - INTERVAL '90 days';

    ELSIF service_type = 'MAINTENANCE' THEN
        SELECT * INTO job_details
        FROM maintenance_work_orders mwo
        JOIN maintenance_db.maintenance_properties p ON mwo.property_id = p.id
        WHERE mwo.id = predict_job_completion_probability.job_id;

        -- Get contractor performance
        SELECT * INTO contractor_performance
        FROM analytics.maintenance_contractor_performance
        WHERE contractor_id = job_details.contractor_id;

        -- Calculate historical completion rate for similar jobs
        SELECT AVG(
            CASE WHEN mwo.work_status = 'COMPLETED' THEN 1.0 ELSE 0.0 END
        ) INTO historical_similar_jobs
        FROM maintenance_work_orders mwo
        WHERE mwo.work_type = job_details.work_type
        AND mwo.contractor_id = job_details.contractor_id
        AND mwo.created_at >= CURRENT_DATE - INTERVAL '90 days';
    END IF;

    -- Calculate risk factors and adjustments
    IF contractor_performance.avg_customer_rating < 3.5 THEN
        adjustment_factors := adjustment_factors - 0.15;
        risk_factors := risk_factors || ARRAY['Low customer satisfaction rating'];
        recommendations := recommendations || ARRAY['Consider additional supervision'];
    END IF;

    IF job_details.estimated_duration_minutes > 240 OR job_details.estimated_duration_hours > 4 THEN
        adjustment_factors := adjustment_factors - 0.10;
        risk_factors := risk_factors || ARRAY['Extended job duration increases risk'];
        recommendations := recommendations || ARRAY['Break job into smaller phases'];
    END IF;

    IF service_type = 'MAINTENANCE' AND job_details.is_emergency = true THEN
        adjustment_factors := adjustment_factors - 0.05;
        risk_factors := risk_factors || ARRAY['Emergency jobs have higher completion variance'];
        recommendations := recommendations || ARRAY['Ensure parts availability before starting'];
    END IF;

    IF job_details.priority_level = 'HIGH' OR job_details.priority_level = 'URGENT' THEN
        adjustment_factors := adjustment_factors + 0.05;
    END IF;

    -- Calculate final probability
    base_probability := COALESCE(historical_similar_jobs, base_probability) + adjustment_factors;

    -- Ensure probability stays within bounds
    base_probability := GREATEST(0.1, LEAST(0.99, base_probability));

    -- Determine confidence level
    RETURN QUERY
    SELECT
        base_probability as predicted_completion_probability,
        CASE
            WHEN historical_similar_jobs IS NOT NULL THEN 'HIGH'
            WHEN contractor_performance.total_jobs >= 10 THEN 'MEDIUM'
            ELSE 'LOW'
        END as confidence_level,
        risk_factors,
        recommendations;
END;
$$ LANGUAGE plpgsql;
```

### Revenue Forecasting
```sql
CREATE OR REPLACE FUNCTION forecast_service_revenue(
    service_type VARCHAR,
    forecast_days INTEGER DEFAULT 30,
    confidence_level VARCHAR DEFAULT 'MEDIUM' -- LOW, MEDIUM, HIGH
) RETURNS TABLE(
    forecast_date DATE,
    predicted_revenue DECIMAL,
    confidence_range_low DECIMAL,
    confidence_range_high DECIMAL,
    contributing_factors TEXT[]
) AS $$
DECLARE
    growth_rate DECIMAL := 0.02; -- 2% monthly growth
    seasonal_multiplier DECIMAL := 1.0;
    confidence_multiplier DECIMAL;
BEGIN
    -- Set confidence multiplier based on confidence level
    CASE confidence_level
        WHEN 'LOW' THEN confidence_multiplier := 0.3;
        WHEN 'MEDIUM' THEN confidence_multiplier := 0.15;
        WHEN 'HIGH' THEN confidence_multiplier := 0.08;
    END CASE;

    -- Generate forecast for each day
    RETURN QUERY
    WITH daily_revenue_base AS (
        SELECT
            DATE_TRUNC('day', created_at) as revenue_date,
            AVG(total_price) as avg_daily_revenue,
            STDDEV(total_price) as revenue_stddev
        FROM cleaning_db.cleaning_jobs
        WHERE service_type = 'ALL' OR service_type = 'CLEANING'
        AND created_at >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY DATE_TRUNC('day', created_at)

        UNION ALL

        SELECT
            DATE_TRUNC('day', created_at) as revenue_date,
            AVG(total_cost) as avg_daily_revenue,
            STDDEV(total_cost) as revenue_stddev
        FROM maintenance_db.maintenance_work_orders
        WHERE service_type = 'ALL' OR service_type = 'MAINTENANCE'
        AND created_at >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY DATE_TRUNC('day', created_at)
    )
    SELECT
        CURRENT_DATE + generate_series.day_offset as forecast_date,
        ROUND(
            (drb.avg_daily_revenue * (1 + growth_rate * (generate_series.day_offset::DECIMAL / 30))) *
            seasonal_multiplier, 2
        ) as predicted_revenue,
        ROUND(
            ((drb.avg_daily_revenue * (1 + growth_rate * (generate_series.day_offset::DECIMAL / 30))) *
            seasonal_multiplier) - (drb.revenue_stddev * confidence_multiplier), 2
        ) as confidence_range_low,
        ROUND(
            ((drb.avg_daily_revenue * (1 + growth_rate * (generate_series.day_offset::DECIMAL / 30))) *
            seasonal_multiplier) + (drb.revenue_stddev * confidence_multiplier), 2
        ) as confidence_range_high,
        ARRAY[
            CASE WHEN generate_series.day_offset % 7 IN (0, 6) THEN 'Weekend demand pattern' END,
            CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE + generate_series.day_offset) IN (12, 1, 2) THEN 'Winter season factor' END,
            CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE + generate_series.day_offset) IN (6, 7, 8) THEN 'Summer season factor' END,
            'Historical trend: ' || ROUND(growth_rate * 100, 1) || '% monthly growth'
        ] FILTER (WHERE element IS NOT NULL) as contributing_factors
    FROM daily_revenue_base drb
    CROSS JOIN generate_series(1, forecast_days) as generate_series(day_offset)
    ORDER BY forecast_date;
END;
$$ LANGUAGE plpgsql;
```

## Custom Report Builder

### Dynamic Report Generation
```sql
CREATE OR REPLACE FUNCTION generate_custom_report(
    report_name VARCHAR,
    service_types VARCHAR[] DEFAULT ARRAY['CLEANING', 'MAINTENANCE'],
    metrics VARCHAR[] DEFAULT ARRAY['revenue', 'completion_rate', 'quality_score'],
    group_by VARCHAR DEFAULT 'day', -- day, week, month, quarter
    date_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    date_end DATE DEFAULT CURRENT_DATE,
    tenant_ids UUID[] DEFAULT NULL
) RETURNS TABLE(
    report_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH report_data AS (
        -- Cleaning service metrics
        SELECT
            'CLEANING' as service_type,
            DATE_TRUNC(group_by, cj.created_at) as period,
            jsonb_build_object(
                'revenue', SUM(cj.total_price),
                'job_count', COUNT(*),
                'completion_rate', COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED')::DECIMAL / COUNT(*),
                'quality_score', AVG(cj.quality_score),
                'customer_rating', AVG(cj.customer_rating),
                'avg_duration', AVG(cj.actual_duration_minutes),
                'on_time_rate', COUNT(*) FILTER (WHERE cj.completed_at <= cj.due_date OR cj.due_date IS NULL)::DECIMAL / COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED')
            ) as metrics
        FROM cleaning_db.cleaning_jobs cj
        WHERE cj.created_at BETWEEN date_start AND date_end
        AND (tenant_ids IS NULL OR cj.tenant_id = ANY(tenant_ids))
        GROUP BY DATE_TRUNC(group_by, cj.created_at)

        UNION ALL

        -- Maintenance service metrics
        SELECT
            'MAINTENANCE' as service_type,
            DATE_TRUNC(group_by, mwo.created_at) as period,
            jsonb_build_object(
                'revenue', SUM(mwo.total_cost),
                'job_count', COUNT(*),
                'completion_rate', COUNT(*) FILTER (WHERE mwo.work_status = 'COMPLETED')::DECIMAL / COUNT(*),
                'customer_rating', AVG(mwo.customer_rating),
                'avg_duration', AVG(mwo.actual_duration_hours),
                'emergency_response_time', AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600) FILTER (WHERE mwo.is_emergency = true),
                'first_time_fix_rate', COUNT(*) FILTER (WHERE mwo.first_time_fix = true)::DECIMAL / COUNT(*) FILTER (WHERE mwo.work_status = 'COMPLETED')
            ) as metrics
        FROM maintenance_db.maintenance_work_orders mwo
        WHERE mwo.created_at BETWEEN date_start AND date_end
        AND (tenant_ids IS NULL OR mwo.tenant_id = ANY(tenant_ids))
        GROUP BY DATE_TRUNC(group_by, mwo.created_at)
    )
    SELECT jsonb_build_object(
        'report_name', report_name,
        'generated_at', CURRENT_TIMESTAMP,
        'date_range', jsonb_build_object('start', date_start, 'end', date_end),
        'service_types', service_types,
        'metrics', metrics,
        'grouping', group_by,
        'data', jsonb_agg(
            jsonb_build_object(
                'service_type', service_type,
                'period', period,
                'metrics', metrics
            )
        )
    ) as report_data
    FROM report_data
    WHERE service_type = ANY(service_types);
END;
$$ LANGUAGE plpgsql;
```

## Benefits

### For Business Intelligence
- Real-time performance monitoring across both services
- Predictive analytics for resource planning
- Customizable reporting for different stakeholders
- KPI tracking with trend analysis

### For Operations Management
- Contractor performance insights and optimization
- Quality control metrics and improvement tracking
- Revenue forecasting and financial planning
- Capacity planning and resource allocation

### For Customer Service
- Service quality monitoring and improvement
- Customer satisfaction tracking
- Performance-based contractor recommendations
- Service level agreement (SLA) compliance monitoring

## Risk Mitigation

### Data Quality
- Automated data validation and cleaning
- Audit trails for all analytical calculations
- Version control for report definitions
- Regular data quality checks and alerts

### Performance Considerations
- Materialized views for frequently accessed reports
- Query optimization and indexing strategies
- Caching for real-time dashboards
- Batch processing for heavy analytical queries

### Privacy and Security
- Role-based access to analytics data
- Data anonymization for sensitive metrics
- Audit logging for report access
- Compliance with data protection regulations

## Next Steps

1. **Implement Analytics API**: Create REST endpoints for report generation
2. **Build Dashboard UI**: Develop interactive analytics dashboards
3. **Set Up Data Pipeline**: Implement ETL processes for data warehouse
4. **Create Alerting System**: Set up automated alerts for KPI thresholds
5. **Train Users**: Train staff on analytics tools and interpretation