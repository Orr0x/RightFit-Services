# Data Integrity Validation Framework

## Overview

This document provides a comprehensive framework for validating data integrity after the RightFit Services database separation. The framework ensures that no data has been lost or corrupted during the migration from the unified database to service-specific databases.

## Validation Scope

### Data Categories to Validate

1. **Authentication Data**
   - User accounts and credentials
   - JWT tokens and refresh tokens
   - Permission and role assignments

2. **Customer Data**
   - Customer profiles and contact information
   - Service categorization (cleaning-only, maintenance-only, dual-service)
   - Property assignments and relationships

3. **Worker Data**
   - Contractor profiles and certifications
   - Skills categorization and service assignments
   - Performance history and ratings

4. **Business Logic Data**
   - Jobs and work orders
   - Contracts and agreements
   - Financial transactions and billing records

5. **Cross-Service Relationships**
   - Dual-service customer references
   - Shared worker assignments
   - Cross-service billing coordination

## Validation Framework Architecture

### 1. Automated Validation Scripts

#### Core Validation Script (`validate-migration-integrity.sql`)

```sql
-- ================================================================
-- Migration Integrity Validation Script
-- ================================================================
-- Purpose: Comprehensive validation of database migration integrity
-- Scope: All data migrated from unified to service-specific databases
-- Execution: Run after each migration phase for validation
-- ================================================================

DO $$
DECLARE
    validation_results TEXT;
    total_checks INTEGER := 0;
    passed_checks INTEGER := 0;
    failed_checks INTEGER := 0;
    start_time TIMESTAMP := clock_timestamp();
    end_time TIMESTAMP;
BEGIN

    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Starting Migration Integrity Validation';
    RAISE NOTICE 'Started at: %', start_time;
    RAISE NOTICE '===========================================';

    -- Create validation results table
    DROP TABLE IF EXISTS migration_validation_results;
    CREATE TABLE migration_validation_results (
        test_name VARCHAR(255) PRIMARY KEY,
        test_category VARCHAR(100),
        expected_count INTEGER,
        actual_count INTEGER,
        status VARCHAR(20) CHECK (status IN ('PASSED', 'FAILED', 'WARNING')),
        details TEXT,
        test_timestamp TIMESTAMP DEFAULT clock_timestamp()
    );

    -- ============================================================
    -- 1. AUTHENTICATION DATA VALIDATION
    -- ============================================================

    -- Test 1.1: User Account Migration
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'user_account_migration' as test_name,
        'Authentication' as test_category,
        COUNT(*) as expected_count,
        (SELECT COUNT(*) FROM shared_auth_service.users) as actual_count,
        CASE
            WHEN COUNT(*) = (SELECT COUNT(*) FROM shared_auth_service.users) THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'User accounts migration from original users table' as details
    FROM users;

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'user_account_migration') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- Test 1.2: Email Uniqueness Validation
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'email_uniqueness_validation' as test_name,
        'Authentication' as test_category,
        COUNT(*) as expected_count,
        COUNT(DISTINCT email) as actual_count,
        CASE
            WHEN COUNT(*) = COUNT(DISTINCT email) THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'Email uniqueness across all users' as details
    FROM shared_auth_service.users;

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'email_uniqueness_validation') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- ============================================================
    -- 2. CUSTOMER DATA VALIDATION
    -- ============================================================

    -- Test 2.1: Total Customer Count Validation
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'total_customer_count_validation' as test_name,
        'Customer Data' as test_category,
        COUNT(*) as expected_count,
        (SELECT COUNT(*) FROM cleaning_customers) + (SELECT COUNT(*) FROM maintenance_customers) as actual_count,
        CASE
            WHEN COUNT(*) = (SELECT COUNT(*) FROM cleaning_customers) + (SELECT COUNT(*) FROM maintenance_customers) THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'Total customer count across both services' as details
    FROM customers WHERE role = 'CUSTOMER';

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'total_customer_count_validation') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- Test 2.2: Dual-Service Customer Validation
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'dual_service_customer_validation' as test_name,
        'Customer Data' as test_category,
        COUNT(*) as expected_count,
        (SELECT COUNT(*) FROM dual_service_customers) as actual_count,
        CASE
            WHEN COUNT(*) = (SELECT COUNT(*) FROM dual_service_customers) THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'Dual-service customers properly identified' as details
    FROM (
        SELECT customer_id
        FROM cleaning_customers
        INTERSECT
        SELECT customer_id
        FROM maintenance_customers
    ) dual_customers;

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'dual_service_customer_validation') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- ============================================================
    -- 3. WORKER DATA VALIDATION
    -- ============================================================

    -- Test 3.1: Total Worker Count Validation
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'total_worker_count_validation' as test_name,
        'Worker Data' as test_category,
        COUNT(*) as expected_count,
        (SELECT COUNT(*) FROM cleaning_contractors) + (SELECT COUNT(*) FROM maintenance_contractors) as actual_count,
        CASE
            WHEN COUNT(*) = (SELECT COUNT(*) FROM cleaning_contractors) + (SELECT COUNT(*) FROM maintenance_contractors) THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'Total worker count across both services' as details
    FROM users WHERE role IN ('CONTRACTOR', 'EMPLOYEE');

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'total_worker_count_validation') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- ============================================================
    -- 4. BUSINESS LOGIC VALIDATION
    -- ============================================================

    -- Test 4.1: Jobs Migration Validation
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'jobs_migration_validation' as test_name,
        'Business Logic' as test_category,
        COUNT(*) as expected_count,
        (SELECT COUNT(*) FROM cleaning_jobs) + (SELECT COUNT(*) FROM maintenance_jobs) as actual_count,
        CASE
            WHEN COUNT(*) = (SELECT COUNT(*) FROM cleaning_jobs) + (SELECT COUNT(*) FROM maintenance_jobs) THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'Total jobs migrated to both services' as details
    FROM jobs;

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'jobs_migration_validation') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- Test 4.2: Financial Transactions Validation
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'financial_transactions_validation' as test_name,
        'Financial Data' as test_category,
        COUNT(*) as expected_count,
        (SELECT COUNT(*) FROM cleaning_financial_transactions) + (SELECT COUNT(*) FROM maintenance_financial_transactions) as actual_count,
        CASE
            WHEN COUNT(*) = (SELECT COUNT(*) FROM cleaning_financial_transactions) + (SELECT COUNT(*) FROM maintenance_financial_transactions) THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'Total financial transactions migrated' as details
    FROM financial_transactions;

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'financial_transactions_validation') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- ============================================================
    -- 5. FINANCIAL INTEGRITY VALIDATION
    -- ============================================================

    -- Test 5.1: Revenue Amount Validation
    INSERT INTO migration_validation_results (test_name, test_category, expected_count, actual_count, status, details)
    SELECT
        'revenue_amount_validation' as test_name,
        'Financial Integrity' as test_category,
        1 as expected_count,
        CASE
            WHEN ABS(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END) -
                 ((SELECT COALESCE(SUM(amount), 0) FROM cleaning_financial_transactions WHERE transaction_type = 'REVENUE') +
                  (SELECT COALESCE(SUM(amount), 0) FROM maintenance_financial_transactions WHERE transaction_type = 'REVENUE'))) < 0.01 THEN 1
            ELSE 0
        END as actual_count,
        CASE
            WHEN ABS(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END) -
                 ((SELECT COALESCE(SUM(amount), 0) FROM cleaning_financial_transactions WHERE transaction_type = 'REVENUE') +
                  (SELECT COALESCE(SUM(amount), 0) FROM maintenance_financial_transactions WHERE transaction_type = 'REVENUE'))) < 0.01 THEN 'PASSED'
            ELSE 'FAILED'
        END as status,
        'Total revenue amount integrity check' as details
    FROM financial_transactions;

    total_checks := total_checks + 1;
    IF (SELECT status FROM migration_validation_results WHERE test_name = 'revenue_amount_validation') = 'PASSED'
    THEN passed_checks := passed_checks + 1;
    ELSE failed_checks := failed_checks + 1;
    END IF;

    -- ============================================================
    -- VALIDATION SUMMARY
    -- ============================================================

    end_time := clock_timestamp();

    -- Generate summary report
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Migration Integrity Validation Summary';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Total Checks: %', total_checks;
    RAISE NOTICE 'Passed: %', passed_checks;
    RAISE NOTICE 'Failed: %', failed_checks;
    RAISE NOTICE 'Success Rate: %', ROUND((passed_checks::NUMERIC / total_checks::NUMERIC) * 100, 2);
    RAISE NOTICE 'Duration: %', end_time - start_time;
    RAISE NOTICE 'Completed at: %', end_time;

    -- Generate detailed results
    RAISE NOTICE '';
    RAISE NOTICE 'Detailed Results:';
    RAISE NOTICE '==================';

    FOR validation_results IN
        SELECT
            test_category,
            test_name,
            expected_count,
            actual_count,
            status,
            details
        FROM migration_validation_results
        ORDER BY test_category, test_name
    LOOP
        RAISE NOTICE 'Category: %', validation_results.test_category;
        RAISE NOTICE 'Test: %', validation_results.test_name;
        RAISE NOTICE 'Expected: % | Actual: % | Status: %',
            validation_results.expected_count,
            validation_results.actual_count,
            validation_results.status;
        RAISE NOTICE 'Details: %', validation_results.details;
        RAISE NOTICE '---';
    END LOOP;

    -- Overall validation result
    IF failed_checks = 0 THEN
        RAISE NOTICE '🎉 ALL VALIDATION CHECKS PASSED! Migration is successful.';
    ELSE
        RAISE NOTICE '⚠️  VALIDATION FAILURES DETECTED! Please review failed tests.';
    END IF;

    RAISE NOTICE '===========================================';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Validation failed with error: %', SQLERRM;
END $$;

-- Create validation view for ongoing monitoring
CREATE OR REPLACE VIEW migration_validation_summary AS
SELECT
    test_category,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE status = 'PASSED') as passed_tests,
    COUNT(*) FILTER (WHERE status = 'FAILED') as failed_tests,
    COUNT(*) FILTER (WHERE status = 'WARNING') as warning_tests,
    ROUND((COUNT(*) FILTER (WHERE status = 'PASSED')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) as success_rate,
    MAX(test_timestamp) as last_test_run
FROM migration_validation_results
GROUP BY test_category
ORDER BY test_category;
```

### 2. Data Completeness Checks

#### Completeness Validation Script (`data-completeness-validation.sql`)

```sql
-- ================================================================
-- Data Completeness Validation Script
-- ================================================================
-- Purpose: Validate data completeness after migration
-- Scope: Ensures no data loss during separation process
-- ================================================================

DO $$
DECLARE
    completeness_report TEXT;
    missing_data_count INTEGER;
BEGIN

    RAISE NOTICE 'Starting Data Completeness Validation';
    RAISE NOTICE '====================================';

    -- Create completeness issues table
    DROP TABLE IF EXISTS data_completeness_issues;
    CREATE TABLE data_completeness_issues (
        issue_id SERIAL PRIMARY KEY,
        issue_type VARCHAR(100),
        affected_table VARCHAR(255),
        record_identifier UUID,
        issue_description TEXT,
        severity VARCHAR(20) CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
        recommended_action TEXT,
        discovered_at TIMESTAMP DEFAULT clock_timestamp()
    );

    -- ============================================================
    -- 1. CRITICAL DATA INTEGRITY CHECKS
    -- ============================================================

    -- Check for missing user profiles in service-specific tables
    INSERT INTO data_completeness_issues (issue_type, affected_table, record_identifier, issue_description, severity, recommended_action)
    SELECT
        'missing_service_profile' as issue_type,
        'cleaning_customers' as affected_table,
        u.id as record_identifier,
        'User missing from cleaning customers table but should have cleaning service' as issue_description,
        'CRITICAL' as severity,
        'Investigate why user was not migrated to cleaning customers' as recommended_action
    FROM shared_auth_service.users u
    LEFT JOIN cleaning_customers cc ON u.id = cc.customer_id
    WHERE u.role = 'CUSTOMER'
    AND u.id IN (
        SELECT DISTINCT customer_id
        FROM properties
        WHERE property_type IN ('apartment', 'house', 'condo')
        AND id IN (
            SELECT property_id
            FROM contracts
            WHERE service_type = 'cleaning'
        )
    )
    AND cc.customer_id IS NULL;

    -- Check for orphaned financial transactions
    INSERT INTO data_completeness_issues (issue_type, affected_table, record_identifier, issue_description, severity, recommended_action)
    SELECT
        'orphaned_financial_transaction' as issue_type,
        'cleaning_financial_transactions' as affected_table,
        cft.id as record_identifier,
        'Financial transaction without corresponding customer reference' as issue_description,
        'HIGH' as severity,
        'Verify customer reference and update transaction record' as recommended_action
    FROM cleaning_financial_transactions cft
    LEFT JOIN cleaning_customers cc ON cft.customer_id = cc.customer_id
    WHERE cft.customer_id IS NOT NULL
    AND cc.customer_id IS NULL;

    -- Check for missing job assignments
    INSERT INTO data_completeness_issues (issue_type, affected_table, record_identifier, issue_description, severity, recommended_action)
    SELECT
        'missing_job_assignment' as issue_type,
        'cleaning_jobs' as affected_table,
        cj.id as record_identifier,
        'Job without assigned contractor or employee' as issue_description,
        'HIGH' as severity,
        'Assign appropriate contractor or employee to complete job' as recommended_action
    FROM cleaning_jobs cj
    WHERE cj.assigned_contractor_id IS NULL
    AND cj.assigned_employee_id IS NULL
    AND cj.status NOT IN ('cancelled', 'completed');

    -- ============================================================
    -- 2. DATA RELATIONSHIP INTEGRITY CHECKS
    -- ============================================================

    -- Check for broken foreign key relationships in properties
    INSERT INTO data_completeness_issues (issue_type, affected_table, record_identifier, issue_description, severity, recommended_action)
    SELECT
        'broken_foreign_key' as issue_type,
        'cleaning_properties' as affected_table,
        cp.id as record_identifier,
        'Property with invalid owner reference' as issue_description,
        'MEDIUM' as severity,
        'Update property owner reference to valid customer' as recommended_action
    FROM cleaning_properties cp
    LEFT JOIN cleaning_customers cc ON cp.owner_id = cc.customer_id
    WHERE cp.owner_id IS NOT NULL
    AND cc.customer_id IS NULL;

    -- ============================================================
    -- 3. BUSINESS RULE VALIDATION
    -- ============================================================

    -- Check for contracts without associated properties
    INSERT INTO data_completeness_issues (issue_type, affected_table, record_identifier, issue_description, severity, recommended_action)
    SELECT
        'contract_without_property' as issue_type,
        'cleaning_contracts' as affected_table,
        cc.id as record_identifier,
        'Contract without associated property' as issue_description,
        'MEDIUM' as severity,
        'Link contract to appropriate property or investigate discrepancy' as recommended_action
    FROM cleaning_contracts cc
    LEFT JOIN cleaning_properties cp ON cc.property_id = cp.id
    WHERE cp.id IS NULL;

    -- Check for negative balances in financial accounts
    INSERT INTO data_completeness_issues (issue_type, affected_table, record_identifier, issue_description, severity, recommended_action)
    SELECT
        'negative_balance' as issue_type,
        'cleaning_customer_accounts' as affected_table,
        cca.customer_id as record_identifier,
        'Customer account with negative balance requiring attention' as issue_description,
        'HIGH' as severity,
        'Review payment history and contact customer if necessary' as recommended_action
    FROM cleaning_customer_accounts cca
    WHERE cca.current_balance < 0;

    -- ============================================================
    -- 4. DATA CONSISTENCY CHECKS
    -- ============================================================

    -- Check for duplicate customer records
    INSERT INTO data_completeness_issues (issue_type, affected_table, record_identifier, issue_description, severity, recommended_action)
    SELECT
        'duplicate_customer_record' as issue_type,
        'cleaning_customers' as affected_table,
        cc1.customer_id as record_identifier,
        'Potential duplicate customer record detected' as issue_description,
        'MEDIUM' as severity,
        'Investigate and merge duplicate records if confirmed' as recommended_action
    FROM cleaning_customers cc1
    JOIN cleaning_customers cc2 ON (
        LOWER(cc1.email) = LOWER(cc2.email)
        AND cc1.customer_id != cc2.customer_id
    );

    -- Generate completeness summary
    SELECT COUNT(*) INTO missing_data_count FROM data_completeness_issues;

    RAISE NOTICE 'Data Completeness Validation Summary';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Total Issues Found: %', missing_data_count;

    IF missing_data_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Issues by Severity:';
        RAISE NOTICE 'CRITICAL: %', (SELECT COUNT(*) FROM data_completeness_issues WHERE severity = 'CRITICAL');
        RAISE NOTICE 'HIGH: %', (SELECT COUNT(*) FROM data_completeness_issues WHERE severity = 'HIGH');
        RAISE NOTICE 'MEDIUM: %', (SELECT COUNT(*) FROM data_completeness_issues WHERE severity = 'MEDIUM');
        RAISE NOTICE 'LOW: %', (SELECT COUNT(*) FROM data_completeness_issues WHERE severity = 'LOW');

        RAISE NOTICE '';
        RAISE NOTICE 'Top 5 Issues Requiring Immediate Attention:';
        RAISE NOTICE '==========================================';

        FOR completeness_report IN
            SELECT
                issue_type,
                issue_description,
                recommended_action
            FROM data_completeness_issues
            WHERE severity IN ('CRITICAL', 'HIGH')
            ORDER BY severity, discovered_at DESC
            LIMIT 5
        LOOP
            RAISE NOTICE 'Issue: %', completeness_report.issue_type;
            RAISE NOTICE 'Description: %', completeness_report.issue_description;
            RAISE NOTICE 'Action: %', completeness_report.recommended_action;
            RAISE NOTICE '---';
        END LOOP;
    ELSE
        RAISE NOTICE '🎉 NO DATA COMPLETENESS ISSUES FOUND! Migration appears complete.';
    END IF;

    RAISE NOTICE '====================================';

END $$;
```

### 3. Cross-Service Relationship Validation

#### Cross-Service Validation Script (`cross-service-validation.sql`)

```sql
-- ================================================================
-- Cross-Service Relationship Validation Script
-- ================================================================
-- Purpose: Validate relationships between separated services
-- Scope: Ensures proper coordination between cleaning and maintenance
-- ================================================================

DO $$
DECLARE
    relationship_issues INTEGER;
BEGIN

    RAISE NOTICE 'Starting Cross-Service Relationship Validation';
    RAISE NOTICE '==============================================';

    -- Create cross-service issues table
    DROP TABLE IF EXISTS cross_service_relationship_issues;
    CREATE TABLE cross_service_relationship_issues (
        issue_id SERIAL PRIMARY KEY,
        relationship_type VARCHAR(100),
        service_a VARCHAR(50),
        service_b VARCHAR(50),
        record_identifier_a UUID,
        record_identifier_b UUID,
        issue_description TEXT,
        impact_level VARCHAR(20) CHECK (impact_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
        resolution_steps TEXT,
        discovered_at TIMESTAMP DEFAULT clock_timestamp()
    );

    -- ============================================================
    -- 1. DUAL-SERVICE CUSTOMER COORDINATION
    -- ============================================================

    -- Check for inconsistent dual-service customer data
    INSERT INTO cross_service_relationship_issues (
        relationship_type, service_a, service_b,
        record_identifier_a, record_identifier_b,
        issue_description, impact_level, resolution_steps
    )
    SELECT
        'inconsistent_dual_customer_data' as relationship_type,
        'cleaning' as service_a,
        'maintenance' as service_b,
        cc.customer_id as record_identifier_a,
        mc.customer_id as record_identifier_b,
        'Contact information mismatch between services for dual-service customer' as issue_description,
        'MEDIUM' as impact_level,
        'Standardize contact information across both services' as resolution_steps
    FROM cleaning_customers cc
    JOIN maintenance_customers mc ON cc.customer_id = mc.customer_id
    WHERE (
        cc.email != mc.email
        OR cc.phone != mc.phone
        OR cc.first_name != mc.first_name
        OR cc.last_name != mc.last_name
    );

    -- ============================================================
    -- 2. SHARED PROPERTY COORDINATION
    -- ============================================================

    -- Check for properties with both services but inconsistent data
    INSERT INTO cross_service_relationship_issues (
        relationship_type, service_a, service_b,
        record_identifier_a, record_identifier_b,
        issue_description, impact_level, resolution_steps
    )
    SELECT
        'inconsistent_property_data' as relationship_type,
        'cleaning' as service_a,
        'maintenance' as service_b,
        cp.id as record_identifier_a,
        mp.id as record_identifier_b,
        'Property address or details mismatch between services' as issue_description,
        'HIGH' as impact_level,
        'Reconcile property data and maintain consistency across services' as resolution_steps
    FROM cleaning_properties cp
    JOIN maintenance_properties mp ON (
        cp.address_line_1 = mp.address_line_1
        AND cp.postal_code = mp.postal_code
        AND cp.city = mp.city
    )
    WHERE (
        cp.address_line_1 != mp.address_line_1
        OR cp.property_type != mp.property_type
        OR cp.square_footage != mp.square_footage
    );

    -- ============================================================
    -- 3. WORKER CROSS-SERVICE AVAILABILITY
    -- ============================================================

    -- Check for workers available in both services with scheduling conflicts
    INSERT INTO cross_service_relationship_issues (
        relationship_type, service_a, service_b,
        record_identifier_a, record_identifier_b,
        issue_description, impact_level, resolution_steps
    )
    SELECT
        'worker_scheduling_conflict' as relationship_type,
        'cleaning' as service_a,
        'maintenance' as service_b,
        cc.contractor_id as record_identifier_a,
        mc.contractor_id as record_identifier_b,
        'Worker scheduled for overlapping jobs in both services' as issue_description,
        'HIGH' as impact_level,
        'Reschedule conflicting assignments or coordinate worker availability' as resolution_steps
    FROM cleaning_contractors cc
    JOIN maintenance_contractors mc ON cc.contractor_id = mc.contractor_id
    JOIN cleaning_jobs cj ON cj.assigned_contractor_id = cc.contractor_id
    JOIN maintenance_jobs mj ON mj.assigned_contractor_id = mc.contractor_id
    WHERE cj.scheduled_start_time BETWEEN mj.scheduled_start_time AND mj.scheduled_end_time
    OR mj.scheduled_start_time BETWEEN cj.scheduled_start_time AND cj.scheduled_end_time
    AND cj.status NOT IN ('cancelled', 'completed')
    AND mj.status NOT IN ('cancelled', 'completed');

    -- ============================================================
    -- 4. FINANCIAL CROSS-SERVICE RECONCILIATION
    -- ============================================================

    -- Check for dual-service customers with inconsistent billing
    INSERT INTO cross_service_relationship_issues (
        relationship_type, service_a, service_b,
        record_identifier_a, record_identifier_b,
        issue_description, impact_level, resolution_steps
    )
    SELECT
        'inconsistent_dual_billing' as relationship_type,
        'cleaning' as service_a,
        'maintenance' as service_b,
        ca.customer_id as record_identifier_a,
        ma.customer_id as record_identifier_b,
        'Different billing addresses or payment methods for dual-service customer' as issue_description,
        'MEDIUM' as impact_level,
        'Coordinate billing preferences and maintain consistent payment methods' as resolution_steps
    FROM cleaning_customer_accounts ca
    JOIN maintenance_customer_accounts ma ON ca.customer_id = ma.customer_id
    WHERE (
        ca.billing_address_line_1 != ma.billing_address_line_1
        OR ca.preferred_payment_method != ma.preferred_payment_method
    );

    -- Generate relationship validation summary
    SELECT COUNT(*) INTO relationship_issues FROM cross_service_relationship_issues;

    RAISE NOTICE 'Cross-Service Relationship Validation Summary';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Total Relationship Issues: %', relationship_issues;

    IF relationship_issues > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Issues by Impact Level:';
        RAISE NOTICE 'CRITICAL: %', (SELECT COUNT(*) FROM cross_service_relationship_issues WHERE impact_level = 'CRITICAL');
        RAISE NOTICE 'HIGH: %', (SELECT COUNT(*) FROM cross_service_relationship_issues WHERE impact_level = 'HIGH');
        RAISE NOTICE 'MEDIUM: %', (SELECT COUNT(*) FROM cross_service_relationship_issues WHERE impact_level = 'MEDIUM');
        RAISE NOTICE 'LOW: %', (SELECT COUNT(*) FROM cross_service_relationship_issues WHERE impact_level = 'LOW');

        RAISE NOTICE '';
        RAISE NOTICE 'Critical Relationship Issues Requiring Attention:';
        RAISE NOTICE '=================================================';

        FOR i IN 1..5 LOOP
            BEGIN
                EXECUTE '
                    SELECT
                        relationship_type,
                        issue_description,
                        resolution_steps
                    FROM cross_service_relationship_issues
                    WHERE impact_level IN (''CRITICAL'', ''HIGH'')
                    ORDER BY impact_level, discovered_at DESC
                    LIMIT 1 OFFSET ' || (i-1) || '
                ' INTO relationship_issues, relationship_issues, relationship_issues;

                EXIT WHEN NOT FOUND;
            EXCEPTION WHEN NO_DATA_FOUND THEN
                EXIT;
            END;
        END LOOP;
    ELSE
        RAISE NOTICE '🎉 NO CROSS-SERVICE RELATIONSHIP ISSUES DETECTED!';
        RAISE NOTICE 'Service coordination appears to be functioning correctly.';
    END IF;

    RAISE NOTICE '==============================================';

END $$;
```

### 4. Performance Impact Validation

#### Performance Validation Script (`performance-impact-validation.sql`)

```sql
-- ================================================================
-- Performance Impact Validation Script
-- ================================================================
-- Purpose: Validate performance impact of database separation
-- Scope: Query performance, index efficiency, and response times
-- ================================================================

DO $$
DECLARE
    performance_threshold_ms INTEGER := 1000; -- 1 second threshold for critical queries
    query_performance TEXT;
BEGIN

    RAISE NOTICE 'Starting Performance Impact Validation';
    RAISE NOTICE '=====================================';

    -- Create performance metrics table
    DROP TABLE IF EXISTS migration_performance_metrics;
    CREATE TABLE migration_performance_metrics (
        test_name VARCHAR(255) PRIMARY KEY,
        query_type VARCHAR(100),
        database_name VARCHAR(100),
        execution_time_ms INTEGER,
        rows_returned INTEGER,
        performance_rating VARCHAR(20) CHECK (performance_rating IN ('EXCELLENT', 'GOOD', 'ACCEPTABLE', 'POOR', 'CRITICAL')),
        recommendations TEXT,
        test_timestamp TIMESTAMP DEFAULT clock_timestamp()
    );

    -- ============================================================
    -- 1. CLEANING DATABASE PERFORMANCE TESTS
    -- ============================================================

    -- Test: Customer Lookup Performance
    EXECUTE '
        INSERT INTO migration_performance_metrics (test_name, query_type, database_name, execution_time_ms, rows_returned, performance_rating, recommendations)
        SELECT
            ''customer_lookup_cleaning'' as test_name,
            ''SELECT'' as query_type,
            ''cleaning_db'' as database_name,
            EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time))::INTEGER as execution_time_ms,
            COUNT(*) as rows_returned,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 100 THEN ''EXCELLENT''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 300 THEN ''GOOD''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 1000 THEN ''ACCEPTABLE''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 3000 THEN ''POOR''
                ELSE ''CRITICAL''
            END as performance_rating,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) > 1000 THEN ''Consider adding index on email or frequently searched columns''
                ELSE ''Performance is acceptable''
            END as recommendations
        FROM (
            SELECT clock_timestamp() as start_time
            FROM cleaning_customers
            WHERE email LIKE ''%@example.com''
            LIMIT 1000
        ) timed_query';

    -- Test: Job Search Performance
    EXECUTE '
        INSERT INTO migration_performance_metrics (test_name, query_type, database_name, execution_time_ms, rows_returned, performance_rating, recommendations)
        SELECT
            ''job_search_cleaning'' as test_name,
            ''SELECT'' as query_type,
            ''cleaning_db'' as database_name,
            EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time))::INTEGER as execution_time_ms,
            COUNT(*) as rows_returned,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 200 THEN ''EXCELLENT''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 500 THEN ''GOOD''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 1500 THEN ''ACCEPTABLE''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 5000 THEN ''POOR''
                ELSE ''CRITICAL''
            END as performance_rating,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) > 1500 THEN ''Optimize job status and date indexes''
                ELSE ''Job search performance is acceptable''
            END as recommendations
        FROM (
            SELECT clock_timestamp() as start_time
            FROM cleaning_jobs
            WHERE status IN (''scheduled'', ''in_progress'')
            AND scheduled_date >= CURRENT_DATE - INTERVAL ''30 days''
            ORDER BY scheduled_date DESC
            LIMIT 500
        ) timed_query';

    -- ============================================================
    -- 2. MAINTENANCE DATABASE PERFORMANCE TESTS
    -- ============================================================

    -- Test: Contractor Search Performance
    EXECUTE '
        INSERT INTO migration_performance_metrics (test_name, query_type, database_name, execution_time_ms, rows_returned, performance_rating, recommendations)
        SELECT
            ''contractor_search_maintenance'' as test_name,
            ''SELECT'' as query_type,
            ''maintenance_db'' as database_name,
            EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time))::INTEGER as execution_time_ms,
            COUNT(*) as rows_returned,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 150 THEN ''EXCELLENT''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 400 THEN ''GOOD''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 1200 THEN ''ACCEPTABLE''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 4000 THEN ''POOR''
                ELSE ''CRITICAL''
            END as performance_rating,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) > 1200 THEN ''Consider composite index on skills and availability''
                ELSE ''Contractor search performance is acceptable''
            END as recommendations
        FROM (
            SELECT clock_timestamp() as start_time
            FROM maintenance_contractors mc
            JOIN maintenance_contractor_skills mcs ON mc.contractor_id = mcs.contractor_id
            WHERE mc.is_active = true
            AND mcs.skill_name IN (''plumbing'', ''electrical'')
            GROUP BY mc.contractor_id
            LIMIT 200
        ) timed_query';

    -- ============================================================
    -- 3. SHARED AUTHENTICATION PERFORMANCE TESTS
    -- ============================================================

    -- Test: Authentication Token Validation Performance
    EXECUTE '
        INSERT INTO migration_performance_metrics (test_name, query_type, database_name, execution_time_ms, rows_returned, performance_rating, recommendations)
        SELECT
            ''token_validation_auth'' as test_name,
            ''SELECT'' as query_type,
            ''shared_auth'' as database_name,
            EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time))::INTEGER as execution_time_ms,
            COUNT(*) as rows_returned,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 50 THEN ''EXCELLENT''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 100 THEN ''GOOD''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 300 THEN ''ACCEPTABLE''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 1000 THEN ''POOR''
                ELSE ''CRITICAL''
            END as performance_rating,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) > 300 THEN ''Optimize token lookup indexes and consider caching''
                ELSE ''Token validation performance is acceptable''
            END as recommendations
        FROM (
            SELECT clock_timestamp() as start_time
            FROM shared_auth_service.refresh_tokens rt
            JOIN shared_auth_service.users u ON rt.user_id = u.id
            WHERE rt.is_active = true
            AND rt.expires_at > CURRENT_TIMESTAMP
            LIMIT 100
        ) timed_query';

    -- ============================================================
    -- 4. CROSS-SERVICE QUERY PERFORMANCE TESTS
    -- ============================================================

    -- Test: Dual-Service Customer Lookup Performance
    EXECUTE '
        INSERT INTO migration_performance_metrics (test_name, query_type, database_name, execution_time_ms, rows_returned, performance_rating, recommendations)
        SELECT
            ''dual_service_customer_lookup'' as test_name,
            ''CROSS_SERVICE_JOIN'' as query_type,
            ''multiple_databases'' as database_name,
            EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time))::INTEGER as execution_time_ms,
            COUNT(*) as rows_returned,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 500 THEN ''EXCELLENT''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 1000 THEN ''GOOD''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 2000 THEN ''ACCEPTABLE''
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) < 5000 THEN ''POOR''
                ELSE ''CRITICAL''
            END as performance_rating,
            CASE
                WHEN EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time)) > 2000 THEN ''Consider caching dual-service customer data or optimizing cross-service queries''
                ELSE ''Cross-service lookup performance is acceptable''
            END as recommendations
        FROM (
            SELECT clock_timestamp() as start_time
            FROM dual_service_customers dsc
            JOIN cleaning_customers cc ON dsc.customer_id = cc.customer_id
            JOIN maintenance_customers mc ON dsc.customer_id = mc.customer_id
            WHERE cc.is_active = true
            AND mc.is_active = true
            LIMIT 100
        ) timed_query';

    -- ============================================================
    -- PERFORMANCE SUMMARY REPORT
    -- ============================================================

    RAISE NOTICE 'Performance Impact Validation Summary';
    RAISE NOTICE '=====================================';

    RAISE NOTICE 'Performance Ratings Distribution:';
    RAISE NOTICE 'EXCELLENT: %', (SELECT COUNT(*) FROM migration_performance_metrics WHERE performance_rating = 'EXCELLENT');
    RAISE NOTICE 'GOOD: %', (SELECT COUNT(*) FROM migration_performance_metrics WHERE performance_rating = 'GOOD');
    RAISE NOTICE 'ACCEPTABLE: %', (SELECT COUNT(*) FROM migration_performance_metrics WHERE performance_rating = 'ACCEPTABLE');
    RAISE NOTICE 'POOR: %', (SELECT COUNT(*) FROM migration_performance_metrics WHERE performance_rating = 'POOR');
    RAISE NOTICE 'CRITICAL: %', (SELECT COUNT(*) FROM migration_performance_metrics WHERE performance_rating = 'CRITICAL');

    RAISE NOTICE '';
    RAISE NOTICE 'Performance Tests Requiring Attention:';
    RAISE NOTICE '=====================================';

    FOR query_performance IN
        SELECT
            test_name,
            database_name,
            execution_time_ms,
            performance_rating,
            recommendations
        FROM migration_performance_metrics
        WHERE performance_rating IN ('POOR', 'CRITICAL')
        ORDER BY execution_time_ms DESC
    LOOP
        RAISE NOTICE 'Test: %', query_performance.test_name;
        RAISE NOTICE 'Database: %', query_performance.database_name;
        RAISE NOTICE 'Execution Time: %ms', query_performance.execution_time_ms;
        RAISE NOTICE 'Rating: %', query_performance.performance_rating;
        RAISE NOTICE 'Recommendations: %', query_performance.recommendations;
        RAISE NOTICE '---';
    END LOOP;

    -- Overall performance assessment
    IF (SELECT COUNT(*) FROM migration_performance_metrics WHERE performance_rating IN ('POOR', 'CRITICAL')) = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ALL PERFORMANCE TESTS PASSED ACCEPTABLE THRESHOLDS!';
        RAISE NOTICE 'Database separation has not negatively impacted system performance.';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  PERFORMANCE ISSUES DETECTED!';
        RAISE NOTICE 'Some queries require optimization before production deployment.';
    END IF;

    RAISE NOTICE '=====================================';

END $$;
```

## Validation Execution Plan

### Phase 1: Pre-Validation Preparation
1. **Environment Setup**
   - Create validation database with access to all service databases
   - Install necessary monitoring and logging tools
   - Set up performance baseline measurements

2. **Data Snapshot**
   - Create pre-migration data snapshots for comparison
   - Document expected record counts and totals
   - Establish validation baseline metrics

### Phase 2: Automated Validation Execution
1. **Run Integrity Validation Script**
   - Execute `validate-migration-integrity.sql`
   - Review validation summary reports
   - Document any failed checks

2. **Execute Completeness Validation**
   - Run `data-completeness-validation.sql`
   - Investigate any missing data issues
   - Validate data relationship integrity

3. **Perform Cross-Service Validation**
   - Execute `cross-service-validation.sql`
   - Verify service coordination functionality
   - Test dual-service customer workflows

4. **Validate Performance Impact**
   - Run `performance-impact-validation.sql`
   - Compare against baseline performance metrics
   - Identify optimization opportunities

### Phase 3: Validation Reporting
1. **Generate Comprehensive Reports**
   - Consolidate all validation results
   - Create executive summary with key findings
   - Document recommended actions and timeline

2. **Issue Resolution Planning**
   - Prioritize critical issues for immediate resolution
   - Plan fixes for high and medium priority issues
   - Schedule re-validation after fixes are implemented

## Success Criteria

### Critical Success Factors
- **Zero Data Loss**: All records successfully migrated
- **Relationship Integrity**: All foreign keys and references maintained
- **Performance Standards**: Query response times within acceptable thresholds
- **Cross-Service Coordination**: Dual-service scenarios functioning correctly

### Validation Thresholds
- **Data Accuracy**: 99.9%+ record accuracy across all migrations
- **Performance**: No more than 20% degradation in query performance
- **Relationship Integrity**: 100% foreign key consistency
- **Completeness**: Zero missing critical data elements

## Ongoing Monitoring

### Continuous Validation
1. **Automated Daily Checks**
   - Run simplified validation scripts
   - Monitor key data integrity metrics
   - Alert on any data anomalies

2. **Weekly Performance Reviews**
   - Track query performance trends
   - Monitor database growth and indexing needs
   - Plan proactive optimizations

3. **Monthly Cross-Service Audits**
   - Validate dual-service customer data consistency
   - Check cross-service billing coordination
   - Review shared worker assignment efficiency

This comprehensive validation framework ensures that the RightFit Services database separation maintains data integrity, performance standards, and cross-service coordination throughout the migration process and into ongoing operations.