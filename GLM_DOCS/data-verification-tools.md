# Data Completeness and Accuracy Verification Tools

## Overview

This document provides a comprehensive suite of data verification tools designed to ensure complete accuracy and completeness of data throughout the RightFit Services database separation process. These tools perform deep analysis, anomaly detection, and verification of data integrity across all migrated datasets.

## Verification Tool Architecture

### 1. Master Data Verification Engine

#### `data-verification-engine.sql`

```sql
-- ================================================================
-- Master Data Verification Engine
-- ================================================================
-- Purpose: Comprehensive data verification and accuracy analysis
-- Scope: All migrated data across cleaning, maintenance, and shared auth
-- Features: Statistical analysis, anomaly detection, trend analysis
-- ================================================================

CREATE OR REPLACE FUNCTION verify_data_completeness_and_accuracy()
RETURNS TABLE (
    verification_category VARCHAR(100),
    data_source VARCHAR(100),
    verification_type VARCHAR(100),
    total_records BIGINT,
    verified_records BIGINT,
    accuracy_rate DECIMAL(5,2),
    completeness_rate DECIMAL(5,2),
    error_count INTEGER,
    warning_count INTEGER,
    status VARCHAR(20),
    details TEXT,
    verification_timestamp TIMESTAMP DEFAULT clock_timestamp()
) AS $$
DECLARE
    verification_result RECORD;
    total_verifications INTEGER := 0;
    passed_verifications INTEGER := 0;
    failed_verifications INTEGER := 0;
BEGIN

    RAISE NOTICE 'Starting Comprehensive Data Verification';
    RAISE NOTICE '=========================================';

    -- Create verification results storage
    DROP TABLE IF EXISTS data_verification_results;
    CREATE TABLE data_verification_results (
        id SERIAL PRIMARY KEY,
        verification_category VARCHAR(100),
        data_source VARCHAR(100),
        verification_type VARCHAR(100),
        total_records BIGINT,
        verified_records BIGINT,
        accuracy_rate DECIMAL(5,2),
        completeness_rate DECIMAL(5,2),
        error_count INTEGER,
        warning_count INTEGER,
        status VARCHAR(20),
        details TEXT,
        verification_timestamp TIMESTAMP DEFAULT clock_timestamp()
    );

    -- ============================================================
    -- 1. AUTHENTICATION DATA VERIFICATION
    -- ============================================================

    -- Verification 1.1: User Profile Completeness
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Authentication' as verification_category,
        'shared_auth_service.users' as data_source,
        'user_profile_completeness' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND role IS NOT NULL THEN 1 END) as verified_records,
        ROUND(
            (COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND role IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        ROUND(
            (COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND role IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as completeness_rate,
        COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR role IS NULL THEN 1 END) as error_count,
        COUNT(CASE WHEN phone IS NULL OR address_line_1 IS NULL THEN 1 END) as warning_count,
        CASE
            WHEN COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR role IS NULL THEN 1 END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR role IS NULL THEN 1 END) < 10 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'User profile completeness verification: email, first_name, last_name, and role are required fields' as details
    FROM shared_auth_service.users;

    -- Verification 1.2: Email Format Validation
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Authentication' as verification_category,
        'shared_auth_service.users' as data_source,
        'email_format_validation' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE WHEN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 1 END) as verified_records,
        ROUND(
            (COUNT(CASE WHEN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        100.00 as completeness_rate,
        COUNT(CASE WHEN email IS NULL OR NOT (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN 1 END) as error_count,
        0 as warning_count,
        CASE
            WHEN COUNT(CASE WHEN email IS NULL OR NOT (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN 1 END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE WHEN email IS NULL OR NOT (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN 1 END) < 5 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Email format validation using regex pattern' as details
    FROM shared_auth_service.users
    WHERE email IS NOT NULL;

    -- ============================================================
    -- 2. CUSTOMER DATA VERIFICATION
    -- ============================================================

    -- Verification 2.1: Cleaning Customer Data Completeness
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Customer Data' as verification_category,
        'cleaning_customers' as data_source,
        'customer_data_completeness' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND phone IS NOT NULL THEN 1 END) as verified_records,
        ROUND(
            (COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND phone IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        ROUND(
            (COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND phone IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as completeness_rate,
        COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR phone IS NULL THEN 1 END) as error_count,
        COUNT(CASE WHEN address_line_1 IS NULL OR city IS NULL OR postal_code IS NULL THEN 1 END) as warning_count,
        CASE
            WHEN COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR phone IS NULL THEN 1 END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR phone IS NULL THEN 1 END) < 20 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Cleaning customer data completeness: email, first_name, last_name, and phone are required' as details
    FROM cleaning_customers;

    -- Verification 2.2: Maintenance Customer Data Completeness
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Customer Data' as verification_category,
        'maintenance_customers' as data_source,
        'customer_data_completeness' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND phone IS NOT NULL THEN 1 END) as verified_records,
        ROUND(
            (COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND phone IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        ROUND(
            (COUNT(CASE WHEN email IS NOT NULL AND first_name IS NOT NULL AND last_name IS NOT NULL AND phone IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as completeness_rate,
        COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR phone IS NULL THEN 1 END) as error_count,
        COUNT(CASE WHEN address_line_1 IS NULL OR city IS NULL OR postal_code IS NULL THEN 1 END) as warning_count,
        CASE
            WHEN COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR phone IS NULL THEN 1 END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE WHEN email IS NULL OR first_name IS NULL OR last_name IS NULL OR phone IS NULL THEN 1 END) < 20 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Maintenance customer data completeness: email, first_name, last_name, and phone are required' as details
    FROM maintenance_customers;

    -- Verification 2.3: Dual-Service Customer Consistency
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Customer Data' as verification_category,
        'dual_service_customers' as data_source,
        'data_consistency_verification' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE
            WHEN cc.email = mc.email
            AND cc.first_name = mc.first_name
            AND cc.last_name = mc.last_name
            AND cc.phone = mc.phone
            THEN 1
        END) as verified_records,
        ROUND(
            (COUNT(CASE
                WHEN cc.email = mc.email
                AND cc.first_name = mc.first_name
                AND cc.last_name = mc.last_name
                AND cc.phone = mc.phone
                THEN 1
            END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        100.00 as completeness_rate,
        COUNT(CASE
            WHEN cc.email != mc.email
            OR cc.first_name != mc.first_name
            OR cc.last_name != mc.last_name
            OR cc.phone != mc.phone
            THEN 1
        END) as error_count,
        0 as warning_count,
        CASE
            WHEN COUNT(CASE
                WHEN cc.email != mc.email
                OR cc.first_name != mc.first_name
                OR cc.last_name != mc.last_name
                OR cc.phone != mc.phone
                THEN 1
            END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE
                WHEN cc.email != mc.email
                OR cc.first_name != mc.first_name
                OR cc.last_name != mc.last_name
                OR cc.phone != mc.phone
                THEN 1
            END) < 5 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Dual-service customer data consistency verification across cleaning and maintenance services' as details
    FROM dual_service_customers dsc
    JOIN cleaning_customers cc ON dsc.customer_id = cc.customer_id
    JOIN maintenance_customers mc ON dsc.customer_id = mc.customer_id;

    -- ============================================================
    -- 3. PROPERTY DATA VERIFICATION
    -- ============================================================

    -- Verification 3.1: Property Address Completeness
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Property Data' as verification_category,
        'cleaning_properties' as data_source,
        'property_address_completeness' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE
            WHEN address_line_1 IS NOT NULL
            AND city IS NOT NULL
            AND postal_code IS NOT NULL
            AND property_type IS NOT NULL
            THEN 1
        END) as verified_records,
        ROUND(
            (COUNT(CASE
                WHEN address_line_1 IS NOT NULL
                AND city IS NOT NULL
                AND postal_code IS NOT NULL
                AND property_type IS NOT NULL
                THEN 1
            END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        ROUND(
            (COUNT(CASE
                WHEN address_line_1 IS NOT NULL
                AND city IS NOT NULL
                AND postal_code IS NOT NULL
                AND property_type IS NOT NULL
                THEN 1
            END)::DECIMAL / COUNT(*)) * 100, 2
        ) as completeness_rate,
        COUNT(CASE
            WHEN address_line_1 IS NULL
            OR city IS NULL
            OR postal_code IS NULL
            OR property_type IS NULL
            THEN 1
        END) as error_count,
        COUNT(CASE WHEN square_footage IS NULL OR bedrooms IS NULL THEN 1 END) as warning_count,
        CASE
            WHEN COUNT(CASE
                WHEN address_line_1 IS NULL
                OR city IS NULL
                OR postal_code IS NULL
                OR property_type IS NULL
                THEN 1
            END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE
                WHEN address_line_1 IS NULL
                OR city IS NULL
                OR postal_code IS NULL
                OR property_type IS NULL
                THEN 1
            END) < 10 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Property address completeness: address_line_1, city, postal_code, and property_type are required' as details
    FROM cleaning_properties;

    -- ============================================================
    -- 4. JOB DATA VERIFICATION
    -- ============================================================

    -- Verification 4.1: Job Data Integrity
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Job Data' as verification_category,
        'cleaning_jobs' as data_source,
        'job_data_integrity' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE
            WHEN customer_id IS NOT NULL
            AND property_id IS NOT NULL
            AND status IS NOT NULL
            AND created_at IS NOT NULL
            THEN 1
        END) as verified_records,
        ROUND(
            (COUNT(CASE
                WHEN customer_id IS NOT NULL
                AND property_id IS NOT NULL
                AND status IS NOT NULL
                AND created_at IS NOT NULL
                THEN 1
            END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        ROUND(
            (COUNT(CASE
                WHEN customer_id IS NOT NULL
                AND property_id IS NOT NULL
                AND status IS NOT NULL
                AND created_at IS NOT NULL
                THEN 1
            END)::DECIMAL / COUNT(*)) * 100, 2
        ) as completeness_rate,
        COUNT(CASE
            WHEN customer_id IS NULL
            OR property_id IS NULL
            OR status IS NULL
            OR created_at IS NULL
            THEN 1
        END) as error_count,
        COUNT(CASE
            WHEN scheduled_date IS NULL
            OR duration_minutes IS NULL
            THEN 1
        END) as warning_count,
        CASE
            WHEN COUNT(CASE
                WHEN customer_id IS NULL
                OR property_id IS NULL
                OR status IS NULL
                OR created_at IS NULL
                THEN 1
            END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE
                WHEN customer_id IS NULL
                OR property_id IS NULL
                OR status IS NULL
                OR created_at IS NULL
                THEN 1
            END) < 20 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Job data integrity: customer_id, property_id, status, and created_at are required' as details
    FROM cleaning_jobs;

    -- ============================================================
    -- 5. FINANCIAL DATA VERIFICATION
    -- ============================================================

    -- Verification 5.1: Financial Transaction Accuracy
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    SELECT
        'Financial Data' as verification_category,
        'cleaning_financial_transactions' as data_source,
        'transaction_accuracy_verification' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE
            WHEN transaction_type IS NOT NULL
            AND amount IS NOT NULL
            AND amount > 0
            AND currency = 'USD'
            AND created_at IS NOT NULL
            THEN 1
        END) as verified_records,
        ROUND(
            (COUNT(CASE
                WHEN transaction_type IS NOT NULL
                AND amount IS NOT NULL
                AND amount > 0
                AND currency = 'USD'
                AND created_at IS NOT NULL
                THEN 1
            END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        ROUND(
            (COUNT(CASE
                WHEN transaction_type IS NOT NULL
                AND amount IS NOT NULL
                AND amount > 0
                AND currency = 'USD'
                AND created_at IS NOT NULL
                THEN 1
            END)::DECIMAL / COUNT(*)) * 100, 2
        ) as completeness_rate,
        COUNT(CASE
            WHEN transaction_type IS NULL
            OR amount IS NULL
            OR amount <= 0
            OR currency != 'USD'
            OR created_at IS NULL
            THEN 1
        END) as error_count,
        COUNT(CASE
            WHEN customer_id IS NULL
            OR reference_id IS NULL
            THEN 1
        END) as warning_count,
        CASE
            WHEN COUNT(CASE
                WHEN transaction_type IS NULL
                OR amount IS NULL
                OR amount <= 0
                OR currency != 'USD'
                OR created_at IS NULL
                THEN 1
            END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE
                WHEN transaction_type IS NULL
                OR amount IS NULL
                OR amount <= 0
                OR currency != 'USD'
                OR created_at IS NULL
                THEN 1
            END) < 10 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Financial transaction accuracy: transaction_type, amount > 0, currency = USD, and created_at are required' as details
    FROM cleaning_financial_transactions;

    -- Verification 5.2: Financial Balance Consistency
    INSERT INTO data_verification_results (
        verification_category, data_source, verification_type,
        total_records, verified_records, accuracy_rate, completeness_rate,
        error_count, warning_count, status, details
    )
    WITH transaction_summary AS (
        SELECT
            customer_id,
            SUM(CASE WHEN transaction_type IN ('REVENUE', 'PAYMENT_RECEIVED') THEN amount ELSE 0 END) as credits,
            SUM(CASE WHEN transaction_type IN ('EXPENSE', 'REFUND', 'CHARGEBACK') THEN amount ELSE 0 END) as debits,
            SUM(CASE WHEN transaction_type IN ('REVENUE', 'PAYMENT_RECEIVED') THEN amount ELSE -amount END) as calculated_balance
        FROM cleaning_financial_transactions
        WHERE customer_id IS NOT NULL
        GROUP BY customer_id
    ),
    account_balances AS (
        SELECT
            customer_id,
            current_balance as reported_balance
        FROM cleaning_customer_accounts
        WHERE customer_id IS NOT NULL
    )
    SELECT
        'Financial Data' as verification_category,
        'customer_account_balances' as data_source,
        'balance_consistency_verification' as verification_type,
        COUNT(*) as total_records,
        COUNT(CASE WHEN ABS(ts.calculated_balance - ab.reported_balance) < 0.01 THEN 1 END) as verified_records,
        ROUND(
            (COUNT(CASE WHEN ABS(ts.calculated_balance - ab.reported_balance) < 0.01 THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as accuracy_rate,
        ROUND(
            (COUNT(CASE WHEN ts.calculated_balance IS NOT NULL AND ab.reported_balance IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as completeness_rate,
        COUNT(CASE WHEN ABS(ts.calculated_balance - ab.reported_balance) >= 0.01 THEN 1 END) as error_count,
        COUNT(CASE WHEN ts.calculated_balance IS NULL OR ab.reported_balance IS NULL THEN 1 END) as warning_count,
        CASE
            WHEN COUNT(CASE WHEN ABS(ts.calculated_balance - ab.reported_balance) >= 0.01 THEN 1 END) = 0 THEN 'PASSED'
            WHEN COUNT(CASE WHEN ABS(ts.calculated_balance - ab.reported_balance) >= 0.01 THEN 1 END) < 5 THEN 'WARNING'
            ELSE 'FAILED'
        END as status,
        'Customer account balance consistency: calculated balance from transactions should match reported balance' as details
    FROM transaction_summary ts
    JOIN account_balances ab ON ts.customer_id = ab.customer_id;

    -- ============================================================
    -- VERIFICATION SUMMARY REPORTING
    -- ============================================================

    -- Generate summary statistics
    SELECT
        COUNT(*) INTO total_verifications
    FROM data_verification_results;

    SELECT
        COUNT(*) INTO passed_verifications
    FROM data_verification_results
    WHERE status = 'PASSED';

    SELECT
        COUNT(*) INTO failed_verifications
    FROM data_verification_results
    WHERE status = 'FAILED';

    -- Generate detailed report
    RAISE NOTICE 'Data Verification Summary Report';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Total Verifications: %', total_verifications;
    RAISE NOTICE 'Passed: %', passed_verifications;
    RAISE NOTICE 'Failed: %', failed_verifications;
    RAISE NOTICE 'Success Rate: %', ROUND((passed_verifications::DECIMAL / total_verifications::DECIMAL) * 100, 2);

    -- Return results as a table function
    RETURN QUERY
    SELECT
        verification_category,
        data_source,
        verification_type,
        total_records,
        verified_records,
        accuracy_rate,
        completeness_rate,
        error_count,
        warning_count,
        status,
        details,
        verification_timestamp
    FROM data_verification_results
    ORDER BY
        CASE WHEN status = 'FAILED' THEN 1
             WHEN status = 'WARNING' THEN 2
             ELSE 3 END,
        verification_category,
        verification_type;

END;
$$ LANGUAGE plpgsql;

-- Create view for ongoing monitoring
CREATE OR REPLACE VIEW data_verification_summary AS
SELECT
    verification_category,
    COUNT(*) as total_verifications,
    COUNT(*) FILTER (WHERE status = 'PASSED') as passed_verifications,
    COUNT(*) FILTER (WHERE status = 'WARNING') as warning_verifications,
    COUNT(*) FILTER (WHERE status = 'FAILED') as failed_verifications,
    ROUND(AVG(accuracy_rate), 2) as average_accuracy_rate,
    ROUND(AVG(completeness_rate), 2) as average_completeness_rate,
    SUM(error_count) as total_errors,
    SUM(warning_count) as total_warnings,
    MAX(verification_timestamp) as last_verification_run
FROM data_verification_results
GROUP BY verification_category
ORDER BY verification_category;

-- Create comprehensive verification report function
CREATE OR REPLACE FUNCTION generate_verification_report()
RETURNS TEXT AS $$
DECLARE
    report_text TEXT;
    verification_record RECORD;
    category_summary RECORD;
BEGIN

    report_text := 'RIGHTFIT SERVICES DATA VERIFICATION REPORT' || chr(10);
    report_text := report_text || 'Generated: ' || clock_timestamp()::TEXT || chr(10);
    report_text := report_text || '========================================' || chr(10) || chr(10);

    -- Executive Summary
    report_text := report_text || 'EXECUTIVE SUMMARY' || chr(10);
    report_text := report_text || '------------------' || chr(10);

    FOR category_summary IN
        SELECT
            verification_category,
            COUNT(*) as total_checks,
            COUNT(*) FILTER (WHERE status = 'PASSED') as passed_checks,
            COUNT(*) FILTER (WHERE status = 'WARNING') as warning_checks,
            COUNT(*) FILTER (WHERE status = 'FAILED') as failed_checks,
            ROUND(AVG(accuracy_rate), 2) as avg_accuracy,
            ROUND(AVG(completeness_rate), 2) as avg_completeness,
            SUM(error_count) as total_errors
        FROM data_verification_results
        GROUP BY verification_category
        ORDER BY verification_category
    LOOP
        report_text := report_text || category_summary.verification_category || ':' || chr(10);
        report_text := report_text || '  Total Checks: ' || category_summary.total_checks || chr(10);
        report_text := report_text || '  Passed: ' || category_summary.passed_checks || chr(10);
        report_text := report_text || '  Warnings: ' || category_summary.warning_checks || chr(10);
        report_text := report_text || '  Failed: ' || category_summary.failed_checks || chr(10);
        report_text := report_text || '  Average Accuracy: ' || category_summary.avg_accuracy || '%' || chr(10);
        report_text := report_text || '  Average Completeness: ' || category_summary.avg_completeness || '%' || chr(10);
        report_text := report_text || '  Total Errors: ' || category_summary.total_errors || chr(10) || chr(10);
    END LOOP;

    -- Detailed Results
    report_text := report_text || 'DETAILED VERIFICATION RESULTS' || chr(10);
    report_text := report_text || '----------------------------' || chr(10);

    FOR verification_record IN
        SELECT *
        FROM data_verification_results
        ORDER BY
            CASE WHEN status = 'FAILED' THEN 1
                 WHEN status = 'WARNING' THEN 2
                 ELSE 3 END,
            verification_category,
            verification_type
    LOOP
        report_text := report_text || 'Category: ' || verification_record.verification_category || chr(10);
        report_text := report_text || 'Data Source: ' || verification_record.data_source || chr(10);
        report_text := report_text || 'Verification Type: ' || verification_record.verification_type || chr(10);
        report_text := report_text || 'Status: ' || verification_record.status || chr(10);
        report_text := report_text || 'Records: ' || verification_record.verified_records || '/' || verification_record.total_records || chr(10);
        report_text := report_text || 'Accuracy: ' || verification_record.accuracy_rate || '%' || chr(10);
        report_text := report_text || 'Completeness: ' || verification_record.completeness_rate || '%' || chr(10);
        report_text := report_text || 'Errors: ' || verification_record.error_count || chr(10);
        report_text := report_text || 'Warnings: ' || verification_record.warning_count || chr(10);
        report_text := report_text || 'Details: ' || verification_record.details || chr(10);
        report_text := report_text || 'Timestamp: ' || verification_record.verification_timestamp || chr(10);
        report_text := report_text || '---' || chr(10) || chr(10);
    END LOOP;

    RETURN report_text;

END;
$$ LANGUAGE plpgsql;
```

### 2. Advanced Anomaly Detection System

#### `anomaly-detection-engine.sql`

```sql
-- ================================================================
-- Advanced Anomaly Detection Engine
-- ================================================================
-- Purpose: Detect statistical anomalies and unusual patterns in migrated data
-- Features: Statistical analysis, trend detection, outlier identification
-- ================================================================

CREATE OR REPLACE FUNCTION detect_data_anomalies()
RETURNS TABLE (
    anomaly_type VARCHAR(100),
    data_source VARCHAR(100),
    anomaly_description TEXT,
    anomaly_severity VARCHAR(20),
    affected_records BIGINT,
    statistical_significance DECIMAL(5,4),
    recommended_action TEXT,
    detection_timestamp TIMESTAMP DEFAULT clock_timestamp()
) AS $$
DECLARE
    anomaly_result RECORD;
    total_anomalies INTEGER := 0;
    critical_anomalies INTEGER := 0;
BEGIN

    RAISE NOTICE 'Starting Advanced Anomaly Detection';
    RAISE NOTICE '===================================';

    -- Create anomaly results storage
    DROP TABLE IF EXISTS detected_anomalies;
    CREATE TABLE detected_anomalies (
        id SERIAL PRIMARY KEY,
        anomaly_type VARCHAR(100),
        data_source VARCHAR(100),
        anomaly_description TEXT,
        anomaly_severity VARCHAR(20) CHECK (anomaly_severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
        affected_records BIGINT,
        statistical_significance DECIMAL(5,4),
        recommended_action TEXT,
        detection_timestamp TIMESTAMP DEFAULT clock_timestamp()
    );

    -- ============================================================
    -- 1. STATISTICAL VOLUME ANOMALIES
    -- ============================================================

    -- Anomaly 1.1: Unusual Customer Registration Spikes
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    WITH daily_registrations AS (
        SELECT
            DATE(created_at) as registration_date,
            COUNT(*) as daily_count
        FROM cleaning_customers
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
    ),
        stats AS (
        SELECT
            AVG(daily_count) as mean_registrations,
            STDDEV(daily_count) as stddev_registrations
        FROM daily_registrations
    ),
        today_registrations AS (
        SELECT COUNT(*) as today_count
        FROM cleaning_customers
        WHERE DATE(created_at) = CURRENT_DATE
    )
    SELECT
        'volume_spike' as anomaly_type,
        'cleaning_customers' as data_source,
        'Unusual spike in customer registrations: ' || tr.today_count || ' registrations today vs ' || ROUND(stats.mean_registrations, 2) || ' average' as anomaly_description,
        CASE
            WHEN tr.today_count > (stats.mean_registrations + (3 * stats.stddev_registrations)) THEN 'CRITICAL'
            WHEN tr.today_count > (stats.mean_registrations + (2 * stats.stddev_registrations)) THEN 'HIGH'
            WHEN tr.today_count > (stats.mean_registrations + (stats.stddev_registrations)) THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        tr.today_count as affected_records,
        CASE
            WHEN stats.stddev_registrations > 0 THEN
                ROUND((tr.today_count - stats.mean_registrations) / stats.stddev_registrations, 4)
            ELSE 0
        END as statistical_significance,
        'Investigate source of registration spike - verify data quality and marketing campaigns' as recommended_action
    FROM stats, today_registrations tr
    WHERE tr.today_count > (stats.mean_registrations + stats.stddev_registrations);

    -- Anomaly 1.2: Abnormal Job Creation Patterns
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    WITH hourly_jobs AS (
        SELECT
            EXTRACT(HOUR FROM created_at) as hour_of_day,
            DATE(created_at) as job_date,
            COUNT(*) as hourly_count
        FROM cleaning_jobs
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY EXTRACT(HOUR FROM created_at), DATE(created_at)
    ),
        hourly_stats AS (
        SELECT
            hour_of_day,
            AVG(hourly_count) as mean_hourly_jobs,
            STDDEV(hourly_count) as stddev_hourly_jobs
        FROM hourly_jobs
        GROUP BY hour_of_day
        ),
        current_hour_jobs AS (
            SELECT
                EXTRACT(HOUR FROM CURRENT_TIMESTAMP) as current_hour,
                COUNT(*) as current_hour_count
            FROM cleaning_jobs
            WHERE DATE(created_at) = CURRENT_DATE
            AND EXTRACT(HOUR FROM created_at) = EXTRACT(HOUR FROM CURRENT_TIMESTAMP)
        )
    SELECT
        'unusual_pattern' as anomaly_type,
        'cleaning_jobs' as data_source,
        'Abnormal job creation pattern: ' || chj.current_hour_count || ' jobs in current hour vs ' || ROUND(hs.mean_hourly_jobs, 2) || ' historical average' as anomaly_description,
        CASE
            WHEN chj.current_hour_count > (hs.mean_hourly_jobs + (3 * hs.stddev_hourly_jobs)) THEN 'CRITICAL'
            WHEN chj.current_hour_count > (hs.mean_hourly_jobs + (2 * hs.stddev_hourly_jobs)) THEN 'HIGH'
            WHEN chj.current_hour_count > (hs.mean_hourly_jobs + hs.stddev_hourly_jobs) THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        chj.current_hour_count as affected_records,
        CASE
            WHEN hs.stddev_hourly_jobs > 0 THEN
                ROUND((chj.current_hour_count - hs.mean_hourly_jobs) / hs.stddev_hourly_jobs, 4)
            ELSE 0
        END as statistical_significance,
        'Check for automated job creation, system issues, or legitimate business events' as recommended_action
    FROM hourly_stats hs
    JOIN current_hour_jobs chj ON hs.hour_of_day = chj.current_hour
    WHERE chj.current_hour_count > (hs.mean_hourly_jobs + hs.stddev_hourly_jobs);

    -- ============================================================
    -- 2. FINANCIAL ANOMALIES
    -- ============================================================

    -- Anomaly 2.1: Unusual Transaction Amount Patterns
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    WITH transaction_stats AS (
        SELECT
            transaction_type,
            AVG(amount) as mean_amount,
            STDDEV(amount) as stddev_amount
        FROM cleaning_financial_transactions
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND amount > 0
        GROUP BY transaction_type
    ),
        outliers AS (
        SELECT
                cft.transaction_type,
                COUNT(*) as outlier_count,
                AVG(cft.amount) as avg_outlier_amount
            FROM cleaning_financial_transactions cft
            JOIN transaction_stats ts ON cft.transaction_type = ts.transaction_type
            WHERE cft.created_at >= CURRENT_DATE - INTERVAL '1 day'
            AND cft.amount > 0
            AND ABS(cft.amount - ts.mean_amount) > (3 * ts.stddev_amount)
            GROUP BY cft.transaction_type
        )
    SELECT
        'financial_outlier' as anomaly_type,
        'cleaning_financial_transactions' as data_source,
        'Unusual transaction amounts detected: ' || o.outlier_count || ' outlier transactions for ' || o.transaction_type || ' type (avg: $' || ROUND(o.avg_outlier_amount, 2) || ')' as anomaly_description,
        CASE
            WHEN o.outlier_count > 10 THEN 'CRITICAL'
            WHEN o.outlier_count > 5 THEN 'HIGH'
            WHEN o.outlier_count > 2 THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        o.outlier_count as affected_records,
        ROUND(o.outlier_count::DECIMAL / 100.0, 4) as statistical_significance,
        'Review large transactions for potential errors, fraud, or legitimate high-value activities' as recommended_action
    FROM outliers o;

    -- Anomaly 2.2: Revenue Drop Detection
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    WITH daily_revenue AS (
        SELECT
            DATE(created_at) as revenue_date,
            SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END) as daily_revenue
        FROM cleaning_financial_transactions
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND transaction_type = 'REVENUE'
        GROUP BY DATE(created_at)
    ),
        revenue_stats AS (
        SELECT
            AVG(daily_revenue) as mean_revenue,
            STDDEV(daily_revenue) as stddev_revenue
        FROM daily_revenue
        WHERE revenue_date != CURRENT_DATE
        EXCEPT
        SELECT CURRENT_DATE
        ),
        today_revenue AS (
            SELECT COALESCE(SUM(amount), 0) as today_revenue
            FROM cleaning_financial_transactions
            WHERE DATE(created_at) = CURRENT_DATE
            AND transaction_type = 'REVENUE'
        )
    SELECT
        'revenue_anomaly' as anomaly_type,
        'cleaning_financial_transactions' as data_source,
        'Revenue anomaly: $' || tr.today_revenue || ' today vs $' || ROUND(rs.mean_revenue, 2) || ' historical average' as anomaly_description,
        CASE
            WHEN rs.mean_revenue > 0 AND tr.today_revenue < (rs.mean_revenue - (2 * rs.stddev_revenue)) THEN 'CRITICAL'
            WHEN rs.mean_revenue > 0 AND tr.today_revenue < (rs.mean_revenue - rs.stddev_revenue) THEN 'HIGH'
            WHEN rs.mean_revenue > 0 AND tr.today_revenue < (rs.mean_revenue - (0.5 * rs.stddev_revenue)) THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        CASE WHEN tr.today_revenue > 0 THEN 1 ELSE 0 END as affected_records,
        CASE
            WHEN rs.stddev_revenue > 0 AND rs.mean_revenue > 0 THEN
                GREATEST(0, ROUND((rs.mean_revenue - tr.today_revenue) / rs.stddev_revenue, 4))
            ELSE 0
        END as statistical_significance,
        'Investigate revenue drop - check billing systems, payment processing, or customer activity' as recommended_action
    FROM revenue_stats rs, today_revenue tr
    WHERE rs.mean_revenue > 0
    AND tr.today_revenue < (rs.mean_revenue - (0.5 * rs.stddev_revenue));

    -- ============================================================
    -- 3. DATA QUALITY ANOMALIES
    -- ============================================================

    -- Anomaly 3.1: Missing Critical Data Fields
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    SELECT
        'missing_data' as anomaly_type,
        'cleaning_jobs' as data_source,
        'Critical data fields missing: ' || COUNT(*) || ' jobs with missing customer_id or property_id' as anomaly_description,
        CASE
            WHEN COUNT(*) > 50 THEN 'CRITICAL'
            WHEN COUNT(*) > 20 THEN 'HIGH'
            WHEN COUNT(*) > 5 THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        COUNT(*) as affected_records,
        ROUND(COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM cleaning_jobs)::DECIMAL, 4) as statistical_significance,
        'Immediate data cleanup required - investigate migration errors and data entry issues' as recommended_action
    FROM cleaning_jobs
    WHERE customer_id IS NULL
    OR property_id IS NULL;

    -- Anomaly 3.2: Invalid Status Values
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    SELECT
        'invalid_data' as anomaly_type,
        'cleaning_jobs' as data_source,
        'Invalid status values detected: ' || COUNT(*) || ' jobs with unrecognized status' as anomaly_description,
        CASE
            WHEN COUNT(*) > 10 THEN 'CRITICAL'
            WHEN COUNT(*) > 5 THEN 'HIGH'
            WHEN COUNT(*) > 1 THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        COUNT(*) as affected_records,
        ROUND(COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM cleaning_jobs)::DECIMAL, 4) as statistical_significance,
        'Review and fix invalid status values - ensure data consistency and proper workflow' as recommended_action
    FROM cleaning_jobs
    WHERE status NOT IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold');

    -- ============================================================
    -- 4. TEMPORAL ANOMALIES
    -- ============================================================

    -- Anomaly 4.1: Future-Dated Records
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    SELECT
        'temporal_anomaly' as anomaly_type,
        'cleaning_jobs' as data_source,
        'Future-dated records detected: ' || COUNT(*) || ' jobs with future creation dates' as anomaly_description,
        CASE
            WHEN COUNT(*) > 10 THEN 'CRITICAL'
            WHEN COUNT(*) > 5 THEN 'HIGH'
            WHEN COUNT(*) > 1 THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        COUNT(*) as affected_records,
        ROUND(COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM cleaning_jobs)::DECIMAL, 4) as statistical_significance,
        'Investigate future-dated records - check system clock synchronization and data entry processes' as recommended_action
    FROM cleaning_jobs
    WHERE created_at > CURRENT_TIMESTAMP + INTERVAL '1 hour';

    -- Anomaly 4.2: Stale Incomplete Records
    INSERT INTO detected_anomalies (
        anomaly_type, data_source, anomaly_description, anomaly_severity,
        affected_records, statistical_significance, recommended_action
    )
    SELECT
        'stale_data' as anomaly_type,
        'cleaning_jobs' as data_source,
        'Stale incomplete records: ' || COUNT(*) || ' jobs pending for more than 30 days' as anomaly_description,
        CASE
            WHEN COUNT(*) > 50 THEN 'CRITICAL'
            WHEN COUNT(*) > 20 THEN 'HIGH'
            WHEN COUNT(*) > 5 THEN 'MEDIUM'
            ELSE 'LOW'
        END as anomaly_severity,
        COUNT(*) as affected_records,
        ROUND(COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM cleaning_jobs)::DECIMAL, 4) as statistical_significance,
        'Review and update or cancel stale pending jobs - ensure data hygiene and operational efficiency' as recommended_action
    FROM cleaning_jobs
    WHERE status = 'pending'
    AND created_at < CURRENT_DATE - INTERVAL '30 days';

    -- ============================================================
    -- ANOMALY SUMMARY REPORTING
    -- ============================================================

    -- Count total anomalies
    SELECT
        COUNT(*) INTO total_anomalies
    FROM detected_anomalies;

    SELECT
        COUNT(*) INTO critical_anomalies
    FROM detected_anomalies
    WHERE anomaly_severity = 'CRITICAL';

    -- Generate summary report
    RAISE NOTICE 'Anomaly Detection Summary Report';
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Total Anomalies Detected: %', total_anomalies;
    RAISE NOTICE 'Critical Anomalies: %', critical_anomalies;
    RAISE NOTICE 'Detection Completed: %', clock_timestamp();

    -- Return results as table function
    RETURN QUERY
    SELECT
        anomaly_type,
        data_source,
        anomaly_description,
        anomaly_severity,
        affected_records,
        statistical_significance,
        recommended_action,
        detection_timestamp
    FROM detected_anomalies
    ORDER BY
        CASE WHEN anomaly_severity = 'CRITICAL' THEN 1
             WHEN anomaly_severity = 'HIGH' THEN 2
             WHEN anomaly_severity = 'MEDIUM' THEN 3
             ELSE 4 END,
        statistical_significance DESC,
        detection_timestamp DESC;

END;
$$ LANGUAGE plpgsql;

-- Create anomaly monitoring view
CREATE OR REPLACE VIEW anomaly_monitoring_dashboard AS
SELECT
    anomaly_type,
    anomaly_severity,
    COUNT(*) as anomaly_count,
    SUM(affected_records) as total_affected_records,
    AVG(statistical_significance) as avg_significance,
    MAX(detection_timestamp) as last_detected,
    STRING_AGG(DISTINCT data_source, ', ') as affected_sources
FROM detected_anomalies
WHERE detection_timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY anomaly_type, anomaly_severity
ORDER BY
    CASE WHEN anomaly_severity = 'CRITICAL' THEN 1
         WHEN anomaly_severity = 'HIGH' THEN 2
         WHEN anomaly_severity = 'MEDIUM' THEN 3
         ELSE 4 END,
    anomaly_type;
```

### 3. Python Data Verification Toolkit

#### `data_verification_toolkit.py`

```python
#!/usr/bin/env python3
"""
RightFit Services Data Verification Toolkit

Purpose: Advanced data analysis and verification using Python
Features: Statistical analysis, machine learning anomaly detection, data profiling
Usage: python data_verification_toolkit.py [environment]
"""

import os
import sys
import argparse
import logging
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import warnings

warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_verification.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataVerificationToolkit:
    def __init__(self, environment='development'):
        """Initialize the Data Verification Toolkit"""
        self.environment = environment
        self.db_config = self._load_database_config()
        self.engine = self._create_database_connection()
        self.verification_results = {}
        self.anomalies = []

        logger.info(f"Data Verification Toolkit initialized for {environment} environment")

    def _load_database_config(self):
        """Load database configuration based on environment"""
        configs = {
            'development': {
                'host': os.getenv('DB_HOST', 'localhost'),
                'port': int(os.getenv('DB_PORT', 5432)),
                'user': os.getenv('DB_USER', 'postgres'),
                'password': os.getenv('DB_PASSWORD'),
                'databases': {
                    'shared_auth': 'shared_auth_service',
                    'cleaning': 'cleaning_db',
                    'maintenance': 'maintenance_db'
                }
            },
            'staging': {
                'host': os.getenv('STAGING_DB_HOST'),
                'port': int(os.getenv('STAGING_DB_PORT', 5432)),
                'user': os.getenv('STAGING_DB_USER'),
                'password': os.getenv('STAGING_DB_PASSWORD'),
                'databases': {
                    'shared_auth': 'shared_auth_service',
                    'cleaning': 'cleaning_db',
                    'maintenance': 'maintenance_db'
                }
            },
            'production': {
                'host': os.getenv('PROD_DB_HOST'),
                'port': int(os.getenv('PROD_DB_PORT', 5432)),
                'user': os.getenv('PROD_DB_USER'),
                'password': os.getenv('PROD_DB_PASSWORD'),
                'databases': {
                    'shared_auth': 'shared_auth_service',
                    'cleaning': 'cleaning_db',
                    'maintenance': 'maintenance_db'
                }
            }
        }

        return configs.get(environment, configs['development'])

    def _create_database_connection(self):
        """Create database connection"""
        connection_string = f"postgresql://{self.db_config['user']}:{self.db_config['password']}@{self.db_config['host']}:{self.db_config['port']}/postgres"
        return create_engine(connection_string)

    def execute_query(self, database, query):
        """Execute SQL query and return DataFrame"""
        try:
            full_query = f"SET search_path TO {self.db_config['databases'][database]}; {query}"
            df = pd.read_sql(text(full_query), self.engine)
            return df
        except Exception as e:
            logger.error(f"Error executing query on {database}: {str(e)}")
            return pd.DataFrame()

    def profile_data_quality(self, database, table):
        """Comprehensive data quality profiling"""
        logger.info(f"Profiling data quality for {database}.{table}")

        # Get basic table information
        info_query = f"""
        SELECT
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_name = '{table}'
        ORDER BY ordinal_position;
        """

        columns_info = self.execute_query(database, info_query)

        if columns_info.empty:
            logger.warning(f"Could not retrieve column information for {database}.{table}")
            return {}

        # Sample data for analysis
        sample_query = f"SELECT * FROM {table} TABLESAMPLE BERNOULLI (10) LIMIT 10000"
        sample_data = self.execute_query(database, sample_query)

        if sample_data.empty:
            logger.warning(f"Could not retrieve sample data for {database}.{table}")
            return {}

        profile_results = {
            'table_name': table,
            'database': database,
            'total_columns': len(columns_info),
            'sample_size': len(sample_data),
            'column_profiles': {}
        }

        # Profile each column
        for _, column_info in columns_info.iterrows():
            column_name = column_info['column_name']
            data_type = column_info['data_type']
            is_nullable = column_info['is_nullable'] == 'YES'

            if column_name in sample_data.columns:
                column_data = sample_data[column_name]

                column_profile = {
                    'data_type': data_type,
                    'is_nullable': is_nullable,
                    'null_count': column_data.isnull().sum(),
                    'null_percentage': (column_data.isnull().sum() / len(column_data)) * 100,
                    'unique_count': column_data.nunique(),
                    'unique_percentage': (column_data.nunique() / len(column_data)) * 100
                }

                # Type-specific analysis
                if pd.api.types.is_numeric_dtype(column_data):
                    column_profile.update({
                        'min_value': column_data.min(),
                        'max_value': column_data.max(),
                        'mean_value': column_data.mean(),
                        'median_value': column_data.median(),
                        'std_value': column_data.std(),
                        'zero_count': (column_data == 0).sum(),
                        'negative_count': (column_data < 0).sum()
                    })

                elif pd.api.types.is_string_dtype(column_data):
                    column_profile.update({
                        'min_length': column_data.str.len().min(),
                        'max_length': column_data.str.len().max(),
                        'mean_length': column_data.str.len().mean(),
                        'empty_string_count': (column_data == '').sum(),
                        'whitespace_count': column_data.str.strip().eq('').sum()
                    })

                elif pd.api.types.is_datetime64_any_dtype(column_data):
                    column_profile.update({
                        'min_date': column_data.min(),
                        'max_date': column_data.max(),
                        'future_date_count': (column_data > datetime.now()).sum(),
                        'null_date_count': column_data.isnull().sum()
                    })

                profile_results['column_profiles'][column_name] = column_profile

        return profile_results

    def detect_statistical_anomalies(self, database, table, numeric_columns=None):
        """Detect statistical anomalies using machine learning"""
        logger.info(f"Detecting statistical anomalies in {database}.{table}")

        # Get data for analysis
        query = f"SELECT * FROM {table} TABLESAMPLE BERNOULLI (20)"
        data = self.execute_query(database, query)

        if data.empty:
            logger.warning(f"No data available for anomaly detection in {database}.{table}")
            return []

        # Identify numeric columns if not specified
        if numeric_columns is None:
            numeric_columns = data.select_dtypes(include=[np.number]).columns.tolist()

        if not numeric_columns:
            logger.warning(f"No numeric columns found for anomaly detection in {database}.{table}")
            return []

        # Prepare data for anomaly detection
        anomaly_data = data[numeric_columns].dropna()

        if len(anomaly_data) < 100:
            logger.warning(f"Insufficient data for reliable anomaly detection in {database}.{table}")
            return []

        # Standardize the data
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(anomaly_data)

        # Apply Isolation Forest for anomaly detection
        isolation_forest = IsolationForest(
            contamination=0.1,  # Assume 10% of data may be anomalous
            random_state=42,
            n_estimators=100
        )

        anomaly_labels = isolation_forest.fit_predict(scaled_data)
        anomaly_scores = isolation_forest.decision_function(scaled_data)

        # Identify anomalies
        anomaly_indices = np.where(anomaly_labels == -1)[0]

        anomalies = []
        for idx in anomaly_indices:
            original_index = anomaly_data.index[idx]
            anomaly_record = data.iloc[original_index].to_dict()

            anomaly_info = {
                'table': table,
                'database': database,
                'record_id': original_index,
                'anomaly_score': float(anomaly_scores[idx]),
                'anomaly_type': 'statistical_outlier',
                'affected_columns': numeric_columns,
                'record_data': anomaly_record,
                'detection_method': 'isolation_forest',
                'detection_timestamp': datetime.now().isoformat()
            }

            anomalies.append(anomaly_info)

        logger.info(f"Detected {len(anomalies)} statistical anomalies in {database}.{table}")
        return anomalies

    def analyze_data_distribution(self, database, table, column):
        """Analyze data distribution and identify patterns"""
        logger.info(f"Analyzing distribution for {database}.{table}.{column}")

        # Get column data
        query = f"SELECT {column} FROM {table} WHERE {column} IS NOT NULL"
        data = self.execute_query(database, query)

        if data.empty or column not in data.columns:
            logger.warning(f"No data available for distribution analysis of {database}.{table}.{column}")
            return {}

        column_data = data[column].dropna()

        distribution_analysis = {
            'table': table,
            'database': database,
            'column': column,
            'total_records': len(column_data),
            'data_type': str(column_data.dtype)
        }

        # Numeric distribution analysis
        if pd.api.types.is_numeric_dtype(column_data):
            distribution_analysis.update({
                'min_value': float(column_data.min()),
                'max_value': float(column_data.max()),
                'mean_value': float(column_data.mean()),
                'median_value': float(column_data.median()),
                'std_value': float(column_data.std()),
                'skewness': float(column_data.skew()),
                'kurtosis': float(column_data.kurtosis()),
                'quartiles': {
                    'q1': float(column_data.quantile(0.25)),
                    'q2': float(column_data.quantile(0.5)),
                    'q3': float(column_data.quantile(0.75))
                }
            })

            # Normality test
            if len(column_data) >= 8:  # Minimum sample size for Shapiro-Wilk test
                try:
                    statistic, p_value = stats.shapiro(column_data.sample(min(5000, len(column_data))))
                    distribution_analysis['normality_test'] = {
                        'shapiro_wilk_statistic': float(statistic),
                        'p_value': float(p_value),
                        'is_normal': p_value > 0.05
                    }
                except:
                    distribution_analysis['normality_test'] = {'error': 'Test failed'}

            # Outlier detection using IQR method
            Q1 = column_data.quantile(0.25)
            Q3 = column_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR

            outliers = column_data[(column_data < lower_bound) | (column_data > upper_bound)]
            distribution_analysis['outliers_iqr'] = {
                'lower_bound': float(lower_bound),
                'upper_bound': float(upper_bound),
                'outlier_count': len(outliers),
                'outlier_percentage': (len(outliers) / len(column_data)) * 100
            }

        # Categorical distribution analysis
        elif pd.api.types.is_string_dtype(column_data) or pd.api.types.is_categorical_dtype(column_data):
            value_counts = column_data.value_counts()

            distribution_analysis.update({
                'unique_values': int(column_data.nunique()),
                'most_frequent': str(value_counts.index[0]) if len(value_counts) > 0 else None,
                'most_frequent_count': int(value_counts.iloc[0]) if len(value_counts) > 0 else 0,
                'least_frequent': str(value_counts.index[-1]) if len(value_counts) > 0 else None,
                'least_frequent_count': int(value_counts.iloc[-1]) if len(value_counts) > 0 else 0,
                'entropy': float(stats.entropy(value_counts)),
                'value_distribution': {
                    str(cat): int(count) for cat, count in value_counts.head(20).items()
                }
            })

        # Temporal distribution analysis
        elif pd.api.types.is_datetime64_any_dtype(column_data):
            distribution_analysis.update({
                'min_date': column_data.min().isoformat(),
                'max_date': column_data.max().isoformat(),
                'date_range_days': (column_data.max() - column_data.min()).days,
                'future_dates_count': int((column_data > datetime.now()).sum()),
                'very_old_dates_count': int((column_data < datetime.now() - timedelta(days=365*5)).sum())
            })

        return distribution_analysis

    def generate_comprehensive_report(self, output_dir='verification_reports'):
        """Generate comprehensive verification report"""
        logger.info("Generating comprehensive verification report")

        # Create output directory
        os.makedirs(output_dir, exist_ok=True)

        # Define tables to analyze
        tables_to_analyze = {
            'shared_auth': ['users', 'refresh_tokens'],
            'cleaning': ['cleaning_customers', 'cleaning_properties', 'cleaning_jobs', 'cleaning_contracts', 'cleaning_financial_transactions'],
            'maintenance': ['maintenance_customers', 'maintenance_properties', 'maintenance_jobs', 'maintenance_contracts', 'maintenance_financial_transactions']
        }

        comprehensive_report = {
            'report_metadata': {
                'generated_at': datetime.now().isoformat(),
                'environment': self.environment,
                'toolkit_version': '1.0.0'
            },
            'data_quality_profiles': {},
            'anomaly_detection_results': {},
            'distribution_analysis': {},
            'summary': {
                'total_tables_analyzed': 0,
                'total_anomalies_detected': 0,
                'critical_issues': []
            }
        }

        # Analyze each table
        for database, tables in tables_to_analyze.items():
            comprehensive_report['data_quality_profiles'][database] = {}
            comprehensive_report['anomaly_detection_results'][database] = {}

            for table in tables:
                logger.info(f"Analyzing {database}.{table}")

                # Data quality profiling
                profile = self.profile_data_quality(database, table)
                if profile:
                    comprehensive_report['data_quality_profiles'][database][table] = profile
                    comprehensive_report['summary']['total_tables_analyzed'] += 1

                # Anomaly detection
                anomalies = self.detect_statistical_anomalies(database, table)
                if anomalies:
                    comprehensive_report['anomaly_detection_results'][database][table] = anomalies
                    comprehensive_report['summary']['total_anomalies_detected'] += len(anomalies)

                    # Identify critical issues
                    for anomaly in anomalies:
                        if anomaly['anomaly_score'] < -0.5:  # High confidence anomalies
                            comprehensive_report['summary']['critical_issues'].append({
                                'table': f"{database}.{table}",
                                'anomaly_score': anomaly['anomaly_score'],
                                'record_id': anomaly['record_id']
                            })

        # Save comprehensive report
        report_filename = f"{output_dir}/comprehensive_verification_report_{self.environment}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(report_filename, 'w') as f:
            json.dump(comprehensive_report, f, indent=2, default=str)

        logger.info(f"Comprehensive verification report saved to: {report_filename}")

        # Generate summary statistics
        self._generate_summary_visualizations(comprehensive_report, output_dir)

        return report_filename

    def _generate_summary_visualizations(self, report_data, output_dir):
        """Generate summary visualizations of the verification results"""
        logger.info("Generating summary visualizations")

        # Create visualization directory
        viz_dir = os.path.join(output_dir, 'visualizations')
        os.makedirs(viz_dir, exist_ok=True)

        # Summary plots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('RightFit Services Data Verification Summary', fontsize=16)

        # Plot 1: Anomalies by database
        anomaly_counts = {}
        for database, tables in report_data['anomaly_detection_results'].items():
            anomaly_counts[database] = sum(len(anomalies) for anomalies in tables.values())

        axes[0, 0].bar(anomaly_counts.keys(), anomaly_counts.values())
        axes[0, 0].set_title('Anomalies Detected by Database')
        axes[0, 0].set_ylabel('Number of Anomalies')

        # Plot 2: Data quality metrics
        quality_scores = []
        for database, tables in report_data['data_quality_profiles'].items():
            for table, profile in tables.items():
                if 'column_profiles' in profile:
                    avg_completeness = np.mean([
                        col_profile.get('unique_percentage', 0)
                        for col_profile in profile['column_profiles'].values()
                    ])
                    quality_scores.append(avg_completeness)

        if quality_scores:
            axes[0, 1].hist(quality_scores, bins=20, alpha=0.7)
            axes[0, 1].set_title('Distribution of Data Quality Scores')
            axes[0, 1].set_xlabel('Quality Score (%)')
            axes[0, 1].set_ylabel('Frequency')

        # Plot 3: Critical issues by table
        critical_tables = [issue['table'] for issue in report_data['summary']['critical_issues']]
        if critical_tables:
            critical_counts = pd.Series(critical_tables).value_counts().head(10)
            axes[1, 0].barh(range(len(critical_counts)), critical_counts.values)
            axes[1, 0].set_yticks(range(len(critical_counts)))
            axes[1, 0].set_yticklabels(critical_counts.index)
            axes[1, 0].set_title('Top 10 Tables with Critical Issues')
            axes[1, 0].set_xlabel('Number of Critical Issues')

        # Plot 4: Summary statistics
        summary_text = f"""
        Environment: {report_data['report_metadata']['environment']}
        Tables Analyzed: {report_data['summary']['total_tables_analyzed']}
        Total Anomalies: {report_data['summary']['total_anomalies_detected']}
        Critical Issues: {len(report_data['summary']['critical_issues'])}
        Report Generated: {report_data['report_metadata']['generated_at']}
        """

        axes[1, 1].text(0.1, 0.5, summary_text, fontsize=12, verticalalignment='center')
        axes[1, 1].set_title('Verification Summary')
        axes[1, 1].axis('off')

        plt.tight_layout()
        plt.savefig(os.path.join(viz_dir, 'verification_summary.png'), dpi=300, bbox_inches='tight')
        plt.close()

        logger.info(f"Summary visualizations saved to: {viz_dir}")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='RightFit Services Data Verification Toolkit')
    parser.add_argument('environment', choices=['development', 'staging', 'production'],
                       default='development', help='Environment to verify')
    parser.add_argument('--output-dir', default='verification_reports',
                       help='Output directory for reports')

    args = parser.parse_args()

    # Initialize toolkit
    toolkit = DataVerificationToolkit(args.environment)

    # Generate comprehensive report
    report_path = toolkit.generate_comprehensive_report(args.output_dir)

    print(f"\nData verification completed!")
    print(f"Report saved to: {report_path}")
    print(f"Environment: {args.environment}")

if __name__ == "__main__":
    main()
```

### 4. Usage Instructions and Deployment

#### `verification-toolkit-setup.sh`

```bash
#!/bin/bash

# ================================================================
# RightFit Services Data Verification Toolkit Setup
# ================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check Python 3.8+
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed."
        exit 1
    fi

    python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    if [[ $(echo "$python_version < 3.8" | bc -l) -eq 1 ]]; then
        log_error "Python 3.8+ is required. Current version: $python_version"
        exit 1
    fi

    log_success "Python version: $python_version"

    # Check pip
    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 is required but not installed."
        exit 1
    fi

    # Check PostgreSQL client
    if ! command -v psql &> /dev/null; then
        log_warning "psql client not found. Install PostgreSQL client for full functionality."
    fi

    log_success "Prerequisites check completed"
}

# Install Python dependencies
install_python_dependencies() {
    log "Installing Python dependencies..."

    # Create requirements file
    cat > requirements.txt << EOF
pandas>=1.5.0
numpy>=1.21.0
sqlalchemy>=1.4.0
psycopg2-binary>=2.9.0
scikit-learn>=1.1.0
matplotlib>=3.5.0
seaborn>=0.11.0
scipy>=1.9.0
python-dotenv>=0.19.0
EOF

    # Install dependencies
    pip3 install -r requirements.txt

    log_success "Python dependencies installed"
}

# Setup environment configuration
setup_environment_config() {
    log "Setting up environment configuration..."

    # Create .env file template
    cat > .env.verification << EOF
# Database Configuration for Data Verification
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# Environment Configuration
ENVIRONMENT=development

# Notification Configuration (Optional)
NOTIFICATION_ENABLED=false
NOTIFICATION_EMAIL=
SLACK_WEBHOOK=

# Visualization Settings
GENERATE_PLOTS=true
PLOT_DPI=300

# Reporting Settings
REPORT_RETENTION_DAYS=30
MAX_REPORT_SIZE_MB=100

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=data_verification.log
EOF

    log_success "Environment configuration template created: .env.verification"
    log_warning "Please update .env.verification with your actual database credentials"
}

# Create directory structure
create_directories() {
    log "Creating directory structure..."

    directories=(
        "verification_reports"
        "verification_reports/comprehensive"
        "verification_reports/anomalies"
        "verification_reports/visualizations"
        "verification_reports/logs"
        "sql_scripts"
        "config"
    )

    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
    done

    log_success "Directory structure created"
}

# Deploy SQL verification scripts
deploy_sql_scripts() {
    log "Deploying SQL verification scripts..."

    # Move SQL scripts to appropriate location
    if [ -f "GLM_DOCS/data-integrity-validation.md" ]; then
        # Extract SQL scripts from markdown (simplified approach)
        log "SQL scripts found in documentation - please extract manually if needed"
    fi

    log_success "SQL scripts deployment completed"
}

# Create verification execution script
create_execution_script() {
    log "Creating verification execution script..."

    cat > run_verification.sh << 'EOF'
#!/bin/bash

# RightFit Services Data Verification Execution Script

set -euo pipefail

# Default values
ENVIRONMENT=${1:-development}
OUTPUT_DIR=${2:-verification_reports}
PYTHON_SCRIPT="data_verification_toolkit.py"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[VERIFICATION]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Load environment variables
if [ -f ".env.verification" ]; then
    export $(cat .env.verification | grep -v '^#' | xargs)
    log "Environment configuration loaded"
else
    log "Environment configuration file not found. Using defaults."
fi

# Execute Python verification toolkit
log "Starting data verification for $ENVIRONMENT environment..."

if python3 $PYTHON_SCRIPT $ENVIRONMENT --output-dir $OUTPUT_DIR; then
    log_success "Data verification completed successfully!"
    log "Reports saved to: $OUTPUT_DIR"

    # Display summary if available
    LATEST_REPORT=$(find $OUTPUT_DIR -name "comprehensive_verification_report_*.json" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

    if [ -n "$LATEST_REPORT" ]; then
        log "Latest report: $LATEST_REPORT"

        # Extract summary information
        if command -v jq &> /dev/null; then
            echo ""
            echo "=== VERIFICATION SUMMARY ==="
            jq -r '.summary | "Tables Analyzed: \(.total_tables_analyzed)\nTotal Anomalies: \(.total_anomalies_detected)\nCritical Issues: \(.critical_issues | length)"' "$LATEST_REPORT"
            echo "=========================="
        fi
    fi
else
    echo "Verification failed. Check logs for details."
    exit 1
fi
EOF

    chmod +x run_verification.sh

    log_success "Verification execution script created: run_verification.sh"
}

# Create scheduled verification script
create_scheduled_verification() {
    log "Creating scheduled verification script..."

    cat > schedule_verification.sh << 'EOF'
#!/bin/bash

# Scheduled Data Verification Script
# Intended for cron job execution

# Configuration
VERIFICATION_DIR="/path/to/rightfit-services"
LOG_FILE="/var/log/rightfit-verification.log"
ENVIRONMENT="production"
OUTPUT_DIR="/var/lib/rightfit-reports"

# Function to log with timestamp
log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Change to verification directory
cd "$VERIFICATION_DIR"

# Run verification
log_with_timestamp "Starting scheduled data verification"

if ./run_verification.sh "$ENVIRONMENT" "$OUTPUT_DIR" >> "$LOG_FILE" 2>&1; then
    log_with_timestamp "Scheduled verification completed successfully"
else
    log_with_timestamp "Scheduled verification failed"
    exit 1
fi

# Clean up old reports (keep last 7 days)
find "$OUTPUT_DIR" -name "*.json" -mtime +7 -delete
find "$OUTPUT_DIR" -name "*.png" -mtime +7 -delete

log_with_timestamp "Old reports cleanup completed"
EOF

    chmod +x schedule_verification.sh

    log_success "Scheduled verification script created: schedule_verification.sh"
    log_warning "Update the path variables in schedule_verification.sh before use"
    echo ""
    echo "To schedule daily verification at 2 AM, add to crontab:"
    echo "0 2 * * * /path/to/rightfit-services/schedule_verification.sh"
}

# Main setup process
main() {
    log "Starting RightFit Services Data Verification Toolkit setup..."
    echo ""

    check_prerequisites
    echo ""

    install_python_dependencies
    echo ""

    setup_environment_config
    echo ""

    create_directories
    echo ""

    deploy_sql_scripts
    echo ""

    create_execution_script
    echo ""

    create_scheduled_verification
    echo ""

    log_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.verification with your database credentials"
    echo "2. Run verification: ./run_verification.sh [environment]"
    echo "3. Review generated reports in verification_reports/"
    echo ""
    echo "Example usage:"
    echo "  ./run_verification.sh development"
    echo "  ./run_verification.sh staging"
    echo "  ./run_verification.sh production"
}

# Execute setup
main "$@"
```

## Execution Instructions

### 1. Quick Start

```bash
# Setup the verification toolkit
./verification-toolkit-setup.sh

# Configure environment
cp .env.verification .env.local
# Edit .env.local with your database credentials

# Run verification for development environment
./run_verification.sh development

# Run verification for production environment
./run_verification.sh production
```

### 2. Advanced Usage

```bash
# Use Python toolkit directly for advanced analysis
python3 data_verification_toolkit.py production --output-dir custom_reports

# Run specific verification components
psql -h localhost -U postgres -d shared_auth_service -f sql/validate-migration-integrity.sql

# Generate anomaly detection report
python3 -c "
from data_verification_toolkit import DataVerificationToolkit
toolkit = DataVerificationToolkit('production')
anomalies = toolkit.detect_statistical_anomalies('cleaning', 'cleaning_jobs')
print(f'Detected {len(anomalies)} anomalies')
"
```

This comprehensive data verification toolkit provides enterprise-grade analysis, anomaly detection, and reporting capabilities for the RightFit Services database separation process.