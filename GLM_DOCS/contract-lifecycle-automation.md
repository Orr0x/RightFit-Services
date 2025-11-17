# Contract Lifecycle Automation

## Overview
This document outlines the comprehensive contract lifecycle automation system for cleaning and maintenance services, including automated renewals, expirations, compliance tracking, and performance monitoring.

## Automation Architecture

### Contract Lifecycle Stages
```typescript
interface ContractLifecycleStage {
  stage: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'RENEWAL_PENDING' |
         'RENEWED' | 'EXPIRING_SOON' | 'EXPIRED' | 'TERMINATED' | 'CANCELLED'
  duration_days?: number
  automated_actions: AutomatedAction[]
  manual_review_required: boolean
  notification_triggers: NotificationTrigger[]
}

interface AutomatedAction {
  action_id: string
  action_type: 'NOTIFICATION' | 'INVOICE_GENERATION' | 'STATUS_UPDATE' |
             'RENEWAL_OFFER' | 'TERMINATION' | 'PERFORMANCE_REVIEW'
  execution_timing: 'IMMEDIATE' | 'SCHEDULED' | 'CONDITIONAL'
  target_system: 'BILLING' | 'CRM' | 'OPERATIONS' | 'COMPLIANCE' | 'CUSTOMER'
  parameters: Record<string, any>
  rollback_action?: string
}

interface NotificationTrigger {
  trigger_type: 'DATE_BASED' | 'EVENT_BASED' | 'PERFORMANCE_BASED' | 'COMPLIANCE_BASED'
  trigger_condition: string
  recipients: NotificationRecipient[]
  channels: ('EMAIL' | 'SMS' | 'PORTAL' | 'WEBHOOK')[]
  template_id: string
  personalization_data: Record<string, any>
}
```

## Automated Renewal Management

### Renewal Prediction Engine
```sql
-- Contract renewal likelihood prediction
CREATE OR REPLACE FUNCTION predict_renewal_likelihood(
    contract_id UUID,
    service_type VARCHAR
) RETURNS TABLE(
    renewal_likelihood DECIMAL,
    confidence_score DECIMAL,
    risk_factors TEXT[],
    recommendations TEXT[],
    optimal_renewal_terms JSONB
) AS $$
DECLARE
    contract_details RECORD;
    performance_metrics RECORD;
    customer_history RECORD;
    base_likelihood DECIMAL := 0.75; -- Base 75% renewal rate
    likelihood_adjustment DECIMAL := 0.0;
    risk_factors TEXT[] := ARRAY[]::TEXT[];
    recommendations TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get contract details
    IF service_type = 'CLEANING' THEN
        SELECT * INTO contract_details
        FROM cleaning_db.cleaning_service_contracts csc
        WHERE csc.id = predict_renewal_likelihood.contract_id;

        -- Get performance metrics
        SELECT
            AVG(cj.quality_score) as avg_quality,
            AVG(cj.customer_rating) as avg_rating,
            COUNT(*) FILTER (WHERE cj.completion_date > cj.due_date) as late_deliveries,
            COUNT(*) as total_jobs
        INTO performance_metrics
        FROM cleaning_db.cleaning_jobs cj
        WHERE cj.contractor_id IN (
            SELECT contractor_id FROM cleaning_db.cleaning_service_contracts WHERE id = contract_id
        )
        AND cj.completed_at >= CURRENT_DATE - INTERVAL '12 months';

    ELSIF service_type = 'MAINTENANCE' THEN
        SELECT * INTO contract_details
        FROM maintenance_db.maintenance_service_contracts msc
        WHERE msc.id = predict_renewal_likelihood.contract_id;

        -- Get performance metrics
        SELECT
            AVG(mwo.customer_rating) as avg_rating,
            AVG(
                EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600
            ) FILTER (WHERE mwo.is_emergency = true) as avg_response_time,
            COUNT(*) FILTER (WHERE mwo.first_time_fix = true) as first_time_fixes,
            COUNT(*) as total_orders
        INTO performance_metrics
        FROM maintenance_db.maintenance_work_orders mwo
        WHERE mwo.contractor_id IN (
            SELECT contractor_id FROM maintenance_db.maintenance_service_contracts WHERE id = contract_id
        )
        AND mwo.completed_at >= CURRENT_DATE - INTERVAL '12 months';
    END IF;

    -- Get customer payment history
    SELECT
        COUNT(*) FILTER (WHERE payment_status = 'PAID' AND paid_date <= due_date) as on_time_payments,
        COUNT(*) as total_invoices,
        AVG(total_amount) as avg_invoice_value
    INTO customer_history
    FROM (
        SELECT payment_status, paid_date, due_date, total_amount
        FROM cleaning_db.cleaning_service_invoices
        WHERE customer_profile_id = contract_details.customer_profile_id
        UNION ALL
        SELECT payment_status, paid_date, due_date, total_amount
        FROM maintenance_db.maintenance_service_invoices
        WHERE customer_profile_id = contract_details.customer_profile_id
    ) customer_invoices
    WHERE invoice_date >= CURRENT_DATE - INTERVAL '12 months';

    -- Calculate likelihood adjustments based on performance
    IF performance_metrics.avg_rating >= 4.5 THEN
        likelihood_adjustment := likelihood_adjustment + 0.15;
        recommendations := recommendations || ARRAY['High customer satisfaction - consider premium renewal offer'];
    ELSIF performance_metrics.avg_rating < 3.5 THEN
        likelihood_adjustment := likelihood_adjustment - 0.25;
        risk_factors := risk_factors || ARRAY['Low customer satisfaction ratings'];
        recommendations := recommendations || ARRAY['Address service quality issues before renewal'];
    END IF;

    -- Payment history impact
    IF customer_history.total_invoices > 0 THEN
        DECLARE
            payment_rate DECIMAL;
        BEGIN
            payment_rate := (customer_history.on_time_payments::DECIMAL / customer_history.total_invoices);
            IF payment_rate >= 0.95 THEN
                likelihood_adjustment := likelihood_adjustment + 0.10;
            ELSIF payment_rate < 0.80 THEN
                likelihood_adjustment := likelihood_adjustment - 0.20;
                risk_factors := risk_factors || ARRAY['Poor payment history'];
            END IF;
        END;
    END IF;

    -- Contract duration impact
    IF contract_details.contract_start_date <= CURRENT_DATE - INTERVAL '2 years' THEN
        likelihood_adjustment := likelihood_adjustment + 0.10;
        recommendations := recommendations || ARRAY['Long-term customer - loyalty discount recommended'];
    ELSIF contract_details.contract_start_date >= CURRENT_DATE - INTERVAL '6 months' THEN
        likelihood_adjustment := likelihood_adjustment - 0.05;
        risk_factors := risk_factors || ARRAY['New customer - still in evaluation period'];
    END IF;

    -- Calculate final likelihood
    DECLARE
        final_likelihood DECIMAL;
    BEGIN
        final_likelihood := GREATEST(0.05, LEAST(0.99, base_likelihood + likelihood_adjustment));

        -- Generate optimal renewal terms
        RETURN QUERY
        SELECT
            final_likelihood as renewal_likelihood,
            CASE
                WHEN performance_metrics.avg_rating IS NOT NULL AND customer_history.total_invoices > 0 THEN 0.85
                WHEN performance_metrics.avg_rating IS NOT NULL OR customer_history.total_invoices > 0 THEN 0.70
                ELSE 0.50
            END as confidence_score,
            risk_factors,
            recommendations,
            jsonb_build_object(
                'pricing_adjustment', CASE
                    WHEN final_likelihood >= 0.85 THEN -0.05 -- 5% discount for high likelihood
                    WHEN final_likelihood >= 0.70 THEN 0.00    -- Standard pricing
                    WHEN final_likelihood >= 0.50 THEN 0.03    -- 3% increase for moderate risk
                    ELSE 0.05                                      -- 5% increase for high risk
                END,
                'term_extension_months', CASE
                    WHEN final_likelihood >= 0.85 THEN 24 -- 2-year term for high likelihood
                    WHEN final_likelihood >= 0.70 THEN 12 -- 1-year term standard
                    ELSE 6                                      -- 6-month term for high risk
                END,
                'early_renewal_incentive', CASE
                    WHEN final_likelihood >= 0.70 THEN 0.02 -- 2% discount for early renewal
                    ELSE 0.00
                END,
                'performance_requirements', CASE
                    WHEN final_likelihood < 0.70 THEN jsonb_build_array(
                        'quality_score_target', 4.0,
                        'on_time_completion_target', 0.90,
                        'customer_satisfaction_target', 4.0
                    )
                    ELSE '[]'::jsonb
                END
            ) as optimal_renewal_terms;
    END;
END;
$$ LANGUAGE plpgsql;

-- Automated renewal offer generation
CREATE OR REPLACE FUNCTION generate_renewal_offer(
    contract_id UUID,
    service_type VARCHAR,
    custom_terms JSONB DEFAULT NULL
) RETURNS TABLE(
    offer_generated BOOLEAN,
    renewal_offer_id UUID,
    proposed_terms JSONB,
    customer_savings DECIMAL,
    company_revenue_impact DECIMAL,
    expiration_date DATE
) AS $$
DECLARE
    contract_details RECORD;
    renewal_prediction RECORD;
    new_renewal_id UUID;
    proposed_terms JSONB;
    customer_savings DECIMAL := 0.00;
    revenue_impact DECIMAL := 0.00;
BEGIN
    -- Get contract details
    IF service_type = 'CLEANING' THEN
        SELECT * INTO contract_details
        FROM cleaning_db.cleaning_service_contracts
        WHERE id = contract_id;
    ELSIF service_type = 'MAINTENANCE' THEN
        SELECT * INTO contract_details
        FROM maintenance_db.maintenance_service_contracts
        WHERE id = contract_id;
    END IF;

    -- Get renewal prediction
    SELECT * INTO renewal_prediction
    FROM predict_renewal_likelihood(contract_id, service_type)
    LIMIT 1;

    -- Generate proposed terms
    proposed_terms := COALESCE(
        custom_terms,
        renewal_prediction.optimal_renewal_terms
    );

    -- Calculate financial impact
    DECLARE
        current_monthly_rate DECIMAL;
        proposed_monthly_rate DECIMAL;
        term_months INTEGER;
    BEGIN
        current_monthly_rate := contract_details.base_rate;
        proposed_monthly_rate := current_monthly_rate * (1 + (proposed_terms->>'pricing_adjustment')::DECIMAL);
        term_months := (proposed_terms->>'term_extension_months')::INTEGER;

        customer_savings := (current_monthly_rate - proposed_monthly_rate) * term_months;
        revenue_impact := (proposed_monthly_rate - current_monthly_rate) * term_months;
    END;

    -- Create renewal management record
    INSERT INTO contract_renewal_management (
        contract_type, contract_id, current_end_date,
        renewal_option, renewal_terms, pricing_adjustment,
        renewal_start_date, decision_deadline,
        current_monthly_rate, proposed_monthly_rate,
        renewal_value_change, renewal_status
    ) VALUES (
        service_type,
        contract_id,
        contract_details.contract_end_date,
        CASE WHEN renewal_prediction.renewal_likelihood >= 0.70 THEN 'AUTO_RENEW' ELSE 'MANUAL_RENEW' END,
        proposed_terms,
        (proposed_terms->>'pricing_adjustment')::DECIMAL,
        CURRENT_DATE,
        contract_details.contract_end_date - INTERVAL '30 days',
        contract_details.base_rate,
        contract_details.base_rate * (1 + (proposed_terms->>'pricing_adjustment')::DECIMAL),
        revenue_impact,
        'PENDING'
    ) RETURNING id INTO new_renewal_id;

    RETURN QUERY SELECT true, new_renewal_id, proposed_terms, customer_savings,
                       revenue_impact, CURRENT_DATE + INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;
```

### Automated Renewal Processing
```sql
-- Process automated renewals
CREATE OR REPLACE FUNCTION process_automated_renewals() RETURNS TABLE(
    renewals_processed INTEGER,
    contracts_renewed INTEGER,
    revenue_preserved DECIMAL,
    errors_encountered INTEGER
) AS $$
DECLARE
    renewal_count INTEGER := 0;
    renewed_count INTEGER := 0;
    total_revenue DECIMAL := 0.00;
    error_count INTEGER := 0;
BEGIN
    -- Process cleaning contract renewals
    BEGIN
        WITH pending_renewals AS (
            SELECT
                crm.id,
                crm.contract_id,
                crm.proposed_monthly_rate,
                crm.decision_deadline,
                csc.customer_profile_id,
                csc.contract_end_date,
                crm.renewal_terms
            FROM contract_renewal_management crm
            JOIN cleaning_db.cleaning_service_contracts csc ON crm.contract_id = csc.id
            WHERE crm.contract_type = 'CLEANING'
            AND crm.renewal_option = 'AUTO_RENEW'
            AND crm.renewal_status = 'PENDING'
            AND crm.decision_deadline <= CURRENT_DATE
            AND csc.status = 'ACTIVE'
        )
        SELECT COUNT(*) INTO renewal_count FROM pending_renewals;

        -- Create new contracts for auto-renewals
        INSERT INTO cleaning_db.cleaning_service_contracts (
            customer_profile_id, contract_name, service_type, pricing_model,
            base_rate, contract_start_date, contract_end_date,
            billing_day_of_month, auto_renewal, status,
            notes, created_by_user_id, created_at
        )
        SELECT
            pr.customer_profile_id,
            'Auto-Renewed Cleaning Contract',
            (SELECT service_type FROM cleaning_db.cleaning_service_contracts WHERE id = pr.contract_id),
            (SELECT pricing_model FROM cleaning_db.cleaning_service_contracts WHERE id = pr.contract_id),
            pr.proposed_monthly_rate,
            pr.contract_end_date + INTERVAL '1 day',
            (pr.contract_end_date + INTERVAL '1 day') + ((pr.renewal_terms->>'term_extension_months')::INTEGER || ' months')::INTERVAL,
            (SELECT billing_day_of_month FROM cleaning_db.cleaning_service_contracts WHERE id = pr.contract_id),
            true,
            'ACTIVE',
            'Automatically renewed from contract ' || pr.contract_id,
            'SYSTEM_RENEWAL',
            CURRENT_TIMESTAMP
        FROM pending_renewals pr
        RETURNING id INTO renewed_count;

        -- Update renewal management status
        UPDATE contract_renewal_management
        SET renewal_status = 'CONVERTED',
            final_decision_date = CURRENT_DATE,
            renewal_value_change = proposed_monthly_rate - current_monthly_rate
        WHERE contract_type = 'CLEANING'
        AND renewal_option = 'AUTO_RENEW'
        AND renewal_status = 'PENDING'
        AND decision_deadline <= CURRENT_DATE;

        -- Calculate preserved revenue
        SELECT SUM(proposed_monthly_rate * 12) INTO total_revenue
        FROM contract_renewal_management crm
        WHERE crm.contract_type = 'CLEANING'
        AND crm.renewal_option = 'AUTO_RENEW'
        AND crm.renewal_status = 'CONVERTED'
        AND crm.final_decision_date = CURRENT_DATE;

    EXCEPTION WHEN OTHERS THEN
        error_count := error_count + 1;
    END;

    -- Process maintenance contract renewals
    BEGIN
        WITH pending_renewals AS (
            SELECT
                crm.id,
                crm.contract_id,
                crm.proposed_monthly_rate,
                crm.decision_deadline,
                msc.customer_profile_id,
                msc.contract_end_date,
                crm.renewal_terms
            FROM contract_renewal_management crm
            JOIN maintenance_db.maintenance_service_contracts msc ON crm.contract_id = msc.id
            WHERE crm.contract_type = 'MAINTENANCE'
            AND crm.renewal_option = 'AUTO_RENEW'
            AND crm.renewal_status = 'PENDING'
            AND crm.decision_deadline <= CURRENT_DATE
            AND msc.status = 'ACTIVE'
        )
        INSERT INTO maintenance_db.maintenance_service_contracts (
            customer_profile_id, contract_name, service_coverage, pricing_model,
            base_rate, contract_start_date, contract_end_date,
            billing_day_of_month, auto_renewal, status,
            notes, created_by_user_id, created_at
        )
        SELECT
            pr.customer_profile_id,
            'Auto-Renewed Maintenance Contract',
            (SELECT service_coverage FROM maintenance_db.maintenance_service_contracts WHERE id = pr.contract_id),
            (SELECT pricing_model FROM maintenance_db.maintenance_service_contracts WHERE id = pr.contract_id),
            pr.proposed_monthly_rate,
            pr.contract_end_date + INTERVAL '1 day',
            (pr.contract_end_date + INTERVAL '1 day') + ((pr.renewal_terms->>'term_extension_months')::INTEGER || ' months')::INTERVAL,
            (SELECT billing_day_of_month FROM maintenance_db.maintenance_service_contracts WHERE id = pr.contract_id),
            true,
            'ACTIVE',
            'Automatically renewed from contract ' || pr.contract_id,
            'SYSTEM_RENEWAL',
            CURRENT_TIMESTAMP
        FROM pending_renewals pr;

        -- Update renewal management status
        UPDATE contract_renewal_management
        SET renewal_status = 'CONVERTED',
            final_decision_date = CURRENT_DATE
        WHERE contract_type = 'MAINTENANCE'
        AND renewal_option = 'AUTO_RENEW'
        AND renewal_status = 'PENDING'
        AND decision_deadline <= CURRENT_DATE;

    EXCEPTION WHEN OTHERS THEN
        error_count := error_count + 1;
    END;

    RETURN QUERY SELECT renewal_count, renewed_count, total_revenue, error_count;
END;
$$ LANGUAGE plpgsql;
```

## Compliance and Expiration Management

### Automated Compliance Tracking
```sql
-- Compliance monitoring and alerts
CREATE OR REPLACE FUNCTION monitor_contract_compliance() RETURNS TABLE(
    compliance_issues INTEGER,
    contracts_affected INTEGER,
    alerts_generated INTEGER,
    critical_issues INTEGER
) AS $$
BEGIN
    -- Monitor cleaning contract compliance
    INSERT INTO contract_lifecycle_events (
        contract_type, contract_id, event_type, event_description,
        scheduled_date, event_status, action_required, notification_sent
    )
    SELECT
        'CLEANING',
        csc.id,
        'COMPLIANCE_CHECK',
        'Insurance coverage expiring soon',
        insurance_expiry_date - INTERVAL '30 days',
        'PENDING',
        'RENEW_INSURANCE',
        false
    FROM cleaning_db.cleaning_service_contracts csc
    WHERE csc.insurance_required = true
    AND csc.insurance_coverage_amount IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM contract_lifecycle_events cle
        WHERE cle.contract_type = 'CLEANING'
        AND cle.contract_id = csc.id
        AND cle.event_type = 'COMPLIANCE_CHECK'
        AND cle.action_required = 'RENEW_INSURANCE'
        AND cle.event_status = 'COMPLETED'
        AND cle.actual_date >= CURRENT_DATE - INTERVAL '6 months'
    ) = false
    RETURNING 1 INTO compliance_issues;

    -- Monitor maintenance contract compliance
    INSERT INTO contract_lifecycle_events (
        contract_type, contract_id, event_type, event_description,
        scheduled_date, event_status, action_required, notification_sent
    )
    SELECT
        'MAINTENANCE',
        msc.id,
        'COMPLIANCE_CHECK',
        'License renewal required',
        CURRENT_DATE + INTERVAL '7 days',
        'PENDING',
        'RENEW_LICENSES',
        false
    FROM maintenance_db.maintenance_service_contracts msc
    WHERE msc.licenses_required IS NOT NULL
    AND ARRAY_LENGTH(msc.licenses_required, 1) > 0
    AND EXISTS (
        SELECT 1 FROM contract_lifecycle_events cle
        WHERE cle.contract_type = 'MAINTENANCE'
        AND cle.contract_id = msc.id
        AND cle.event_type = 'COMPLIANCE_CHECK'
        AND cle.action_required = 'RENEW_LICENSES'
        AND cle.event_status = 'COMPLETED'
        AND cle.actual_date >= CURRENT_DATE - INTERVAL '1 year'
    ) = false;

    -- Check for expiring contracts
    INSERT INTO contract_lifecycle_events (
        contract_type, contract_id, event_type, event_description,
        scheduled_date, event_status, action_required, automated
    )
    SELECT
        'CLEANING',
        csc.id,
        'CONTRACT_EXPIRING',
        'Contract expiring in 60 days',
        csc.contract_end_date - INTERVAL '60 days',
        'PENDING',
        'RENEWAL_REVIEW',
        true
    FROM cleaning_db.cleaning_service_contracts csc
    WHERE csc.contract_end_date BETWEEN CURRENT_DATE + INTERVAL '60 days' AND CURRENT_DATE + INTERVAL '65 days'
    AND csc.status = 'ACTIVE'

    UNION ALL

    SELECT
        'MAINTENANCE',
        msc.id,
        'CONTRACT_EXPIRING',
        'Contract expiring in 60 days',
        msc.contract_end_date - INTERVAL '60 days',
        'PENDING',
        'RENEWAL_REVIEW',
        true
    FROM maintenance_db.maintenance_service_contracts msc
    WHERE msc.contract_end_date BETWEEN CURRENT_DATE + INTERVAL '60 days' AND CURRENT_DATE + INTERVAL '65 days'
    AND msc.status = 'ACTIVE';

    RETURN QUERY SELECT
        (SELECT COUNT(*) FROM contract_lifecycle_events WHERE event_status = 'PENDING'),
        (SELECT COUNT(DISTINCT contract_id) FROM contract_lifecycle_events WHERE event_status = 'PENDING'),
        (SELECT COUNT(*) FROM contract_lifecycle_events WHERE notification_sent = false),
        (SELECT COUNT(*) FROM contract_lifecycle_events WHERE action_required IN ('RENEW_INSURANCE', 'RENEW_LICENSES'));
END;
$$ LANGUAGE plpgsql;
```

### Performance-Based Contract Management
```sql
-- Performance monitoring and contract adjustments
CREATE OR REPLACE FUNCTION monitor_contract_performance() RETURNS TABLE(
    performance_reviews INTEGER,
    contracts_flagged INTEGER,
    recommended_actions TEXT[],
    auto_adjustments INTEGER
) AS $$
DECLARE
    reviews_count INTEGER := 0;
    flagged_count INTEGER := 0;
    auto_adjust_count INTEGER := 0;
    actions TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Monitor cleaning contract performance
    WITH cleaning_performance AS (
        SELECT
            csc.id as contract_id,
            csc.customer_profile_id,
            AVG(cj.quality_score) as avg_quality,
            AVG(cj.customer_rating) as avg_rating,
            COUNT(*) FILTER (WHERE cj.completion_date > cj.due_date) as late_jobs,
            COUNT(*) as total_jobs,
            COUNT(DISTINCT cj.property_id) as unique_properties
        FROM cleaning_db.cleaning_service_contracts csc
        LEFT JOIN cleaning_db.cleaning_jobs cj ON csc.id = (
            SELECT contract_id FROM cleaning_db.cleaning_job_properties cjp
            WHERE cjp.job_id = cj.id
            LIMIT 1
        )
        WHERE csc.status = 'ACTIVE'
        AND cj.completed_at >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY csc.id, csc.customer_profile_id
    )
    INSERT INTO contract_lifecycle_events (
        contract_type, contract_id, event_type, event_description,
        event_status, action_required, automated
    )
    SELECT
        'CLEANING',
        cp.contract_id,
        'PERFORMANCE_REVIEW',
        'Performance review completed',
        'COMPLETED',
        CASE
            WHEN cp.avg_quality < 3.5 THEN 'SERVICE_IMPROVEMENT'
            WHEN cp.late_jobs > cp.total_jobs * 0.15 THEN 'SCHEDULE_OPTIMIZATION'
            ELSE 'NO_ACTION'
        END,
        true
    FROM cleaning_performance cp
    WHERE cp.total_jobs >= 5 -- Only review contracts with sufficient data
    RETURNING 1 INTO reviews_count;

    -- Flag poor performing contracts
    UPDATE cleaning_db.cleaning_service_contracts
    SET notes = COALESCE(notes, '') || ' [Performance flag: ' ||
        CASE
            WHEN (SELECT AVG(cj.quality_score) FROM cleaning_db.cleaning_jobs cj
                  WHERE cj.contractor_id IN (SELECT contractor_id FROM cleaning_db.cleaning_service_contracts WHERE id = cleaning_db.cleaning_service_contracts.id)
                  AND cj.completed_at >= CURRENT_DATE - INTERVAL '90 days') < 3.5 THEN 'Low quality scores'
            WHEN (SELECT COUNT(*) FILTER (WHERE completion_date > due_date) / COUNT(*)::DECIMAL
                  FROM cleaning_db.cleaning_jobs cj
                  WHERE cj.contractor_id IN (SELECT contractor_id FROM cleaning_db.cleaning_service_contracts WHERE id = cleaning_db.cleaning_service_contracts.id)
                  AND cj.completed_at >= CURRENT_DATE - INTERVAL '90 days') > 0.20 THEN 'High late rate'
        END || ']'
    WHERE id IN (
        SELECT cp.contract_id FROM cleaning_performance cp
        WHERE (cp.avg_quality < 3.5 OR cp.late_jobs > cp.total_jobs * 0.15)
    )
    RETURNING 1 INTO flagged_count;

    -- Monitor maintenance contract performance
    WITH maintenance_performance AS (
        SELECT
            msc.id as contract_id,
            msc.customer_profile_id,
            AVG(mwo.customer_rating) as avg_rating,
            AVG(
                EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600
            ) FILTER (WHERE mwo.is_emergency = true) as avg_response_time,
            COUNT(*) FILTER (WHERE mwo.first_time_fix = true) as first_time_fixes,
            COUNT(*) as total_orders
        FROM maintenance_db.maintenance_service_contracts msc
        LEFT JOIN maintenance_db.maintenance_work_orders mwo ON msc.id = mwo.contract_id
        WHERE msc.status = 'ACTIVE'
        AND mwo.completed_at >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY msc.id, msc.customer_profile_id
    )
    INSERT INTO contract_lifecycle_events (
        contract_type, contract_id, event_type, event_description,
        event_status, action_required, automated
    )
    SELECT
        'MAINTENANCE',
        mp.contract_id,
        'PERFORMANCE_REVIEW',
        'Performance review completed',
        'COMPLETED',
        CASE
            WHEN mp.avg_rating < 3.5 THEN 'SERVICE_IMPROVEMENT'
            WHEN mp.avg_response_time > 4 THEN 'RESPONSE_TIME_IMPROVEMENT'
            ELSE 'NO_ACTION'
        END,
        true
    FROM maintenance_performance mp
    WHERE mp.total_orders >= 3
    RETURNING 1 INTO reviews_count;

    actions := actions || ARRAY['Performance reviews completed', 'Poor performing contracts flagged'];

    RETURN QUERY SELECT reviews_count, flagged_count, actions, auto_adjust_count;
END;
$$ LANGUAGE plpgsql;
```

## Automated Notification System

### Multi-Channel Notification Engine
```sql
-- Notification template system
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,
    service_type VARCHAR(20) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL, -- EMAIL, SMS, PORTAL, WEBHOOK
    subject_template TEXT,
    body_template TEXT,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contract notification processing
CREATE OR REPLACE FUNCTION process_contract_notifications() RETURNS TABLE(
    notifications_sent INTEGER,
    channels_used VARCHAR[],
    contract_events_processed INTEGER
) AS $$
DECLARE
    notifications_count INTEGER := 0;
    events_count INTEGER := 0;
    channels VARCHAR[] := ARRAY[]::VARCHAR;
BEGIN
    -- Process pending lifecycle events
    FOR event_record IN
        SELECT
            cle.*,
            CASE cle.contract_type
                WHEN 'CLEANING' THEN (
                    SELECT jsonb_build_object(
                        'contract_name', csc.contract_name,
                        'customer_name', p.first_name || ' ' || p.last_name,
                        'end_date', csc.contract_end_date,
                        'monthly_rate', csc.base_rate
                    )
                    FROM cleaning_db.cleaning_service_contracts csc
                    JOIN shared_auth_db.customer_profiles p ON csc.customer_profile_id = p.id
                    WHERE csc.id = cle.contract_id
                )
                WHEN 'MAINTENANCE' THEN (
                    SELECT jsonb_build_object(
                        'contract_name', msc.contract_name,
                        'customer_name', p.first_name || ' ' || p.last_name,
                        'end_date', msc.contract_end_date,
                        'monthly_rate', msc.base_rate
                    )
                    FROM maintenance_db.maintenance_service_contracts msc
                    JOIN shared_auth_db.customer_profiles p ON msc.customer_profile_id = p.id
                    WHERE msc.id = cle.contract_id
                )
            END as contract_data
        FROM contract_lifecycle_events cle
        WHERE cle.event_status = 'PENDING'
        AND cle.scheduled_date <= CURRENT_DATE
        AND cle.notification_sent = false
    LOOP
        events_count := events_count + 1;

        -- Send email notification
        IF 'EMAIL' = ANY(event_record.notification_method) THEN
            DECLARE
                email_template RECORD;
                personalized_subject TEXT;
                personalized_body TEXT;
            BEGIN
                SELECT * INTO email_template
                FROM notification_templates nt
                WHERE nt.service_type = event_record.contract_type
                AND nt.event_type = event_record.event_type
                AND nt.channel = 'EMAIL'
                AND nt.is_active = true
                LIMIT 1;

                IF email_template.id IS NOT NULL THEN
                    -- Personalize template (simplified - would use actual templating engine)
                    personalized_subject := replace(replace(email_template.subject_template, '{{customer_name}}',
                        (event_record.contract_data->>'customer_name')), '{{event_description}}', event_record.event_description);
                    personalized_body := replace(replace(email_template.body_template, '{{customer_name}}',
                        (event_record.contract_data->>'customer_name')), '{{event_description}}', event_record.event_description);

                    -- Send email (would integrate with actual email service)
                    -- For now, just log that we would send it
                    notifications_count := notifications_count + 1;
                    IF 'EMAIL' != ANY(channels) THEN
                        channels := channels || ARRAY['EMAIL'];
                    END IF;
                END IF;
            END;
        END IF;

        -- Send SMS notification
        IF 'SMS' = ANY(event_record.notification_method) THEN
            -- SMS sending logic here
            notifications_count := notifications_count + 1;
            IF 'SMS' != ANY(channels) THEN
                channels := channels || ARRAY['SMS'];
            END IF;
        END IF;

        -- Mark notification as sent
        UPDATE contract_lifecycle_events
        SET notification_sent = true,
            actual_date = CURRENT_DATE,
            event_status = 'COMPLETED'
        WHERE id = event_record.id;
    END LOOP;

    RETURN QUERY SELECT notifications_count, channels, events_count;
END;
$$ LANGUAGE plpgsql;
```

## Benefits

### For Contract Management
- Automated renewal predictions and processing
- Performance-based contract adjustments
- Comprehensive compliance monitoring
- Risk-based pricing and terms

### For Customer Retention
- Proactive renewal offers based on likelihood
- Personalized communication and notifications
- Early intervention for at-risk contracts
- Loyalty rewards and incentives

### For Operational Efficiency
- Reduced manual contract administration
- Automated compliance tracking and alerts
- Performance monitoring and reporting
- Streamlined renewal workflows

## Risk Mitigation

### Contract Compliance
- Automated compliance checking and reminders
- License and insurance expiration tracking
- Regulatory requirement monitoring
- Audit trail maintenance

### Revenue Protection
- Early renewal processing to prevent gaps
- Performance-based pricing adjustments
- Risk assessment for contract terms
- Automated collections integration

### Data Accuracy
- Automated data validation
- Performance metrics calculation
- Financial impact analysis
- Error detection and correction

## Next Steps

1. **Integrate Email Service**: Connect to Mailchimp, SendGrid, or similar
2. **Implement SMS Gateway**: Connect to Twilio or other SMS providers
3. **Set Up Performance Analytics**: Build contract performance dashboards
4. **Configure Webhook Integrations**: Set up external system notifications
5. **Test Automation Workflows**: Validate end-to-end automation processes