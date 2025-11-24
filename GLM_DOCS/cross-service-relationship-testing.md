# Cross-Service Relationship Testing Framework

## Overview

This document provides a comprehensive framework for testing cross-service data relationships and foreign key integrity throughout the RightFit Services database separation process. The framework ensures that data relationships between cleaning, maintenance, and shared authentication services remain consistent and valid after migration.

## Cross-Service Relationship Testing Architecture

### 1. Foreign Key Integrity Validation Engine

#### `foreign-key-relationship-validator.sql`

```sql
-- ================================================================
-- Cross-Service Foreign Key Relationship Validator
-- ================================================================
-- Purpose: Comprehensive testing of foreign key relationships across services
-- Scope: All cross-service data dependencies and relationships
-- Features: Referential integrity, cascade validation, orphan detection
-- ================================================================

CREATE OR REPLACE FUNCTION validate_cross_service_relationships()
RETURNS TABLE (
    relationship_type VARCHAR(100),
    source_database VARCHAR(100),
    source_table VARCHAR(100),
    target_database VARCHAR(100),
    target_table VARCHAR(100),
    relationship_status VARCHAR(20),
    total_records BIGINT,
    valid_relationships BIGINT,
    invalid_relationships BIGINT,
    orphaned_records BIGINT,
    integrity_rate DECIMAL(5,2),
    critical_issues INTEGER,
    recommendations TEXT,
    validation_timestamp TIMESTAMP DEFAULT clock_timestamp()
) AS $$
DECLARE
    relationship_test RECORD;
    total_relationships INTEGER := 0;
    passed_relationships INTEGER := 0;
    failed_relationships INTEGER := 0;
BEGIN

    RAISE NOTICE 'Starting Cross-Service Relationship Validation';
    RAISE NOTICE '===============================================';

    -- Create relationship validation results table
    DROP TABLE IF EXISTS cross_service_relationship_validation;
    CREATE TABLE cross_service_relationship_validation (
        id SERIAL PRIMARY KEY,
        relationship_type VARCHAR(100),
        source_database VARCHAR(100),
        source_table VARCHAR(100),
        target_database VARCHAR(100),
        target_table VARCHAR(100),
        relationship_status VARCHAR(20),
        total_records BIGINT,
        valid_relationships BIGINT,
        invalid_relationships BIGINT,
        orphaned_records BIGINT,
        integrity_rate DECIMAL(5,2),
        critical_issues INTEGER,
        recommendations TEXT,
        validation_timestamp TIMESTAMP DEFAULT clock_timestamp()
    );

    -- ============================================================
    -- 1. AUTHENTICATION TO SERVICE RELATIONSHIPS
    -- ============================================================

    -- Test 1.1: Cleaning Customers to Shared Auth Users
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    SELECT
        'authentication_customer' as relationship_type,
        'cleaning_db' as source_database,
        'cleaning_customers' as source_table,
        'shared_auth_service' as target_database,
        'users' as target_table,
        CASE
            WHEN COUNT(*) = 0 THEN 'NO_DATA'
            WHEN invalid_count = 0 THEN 'VALID'
            WHEN invalid_count < 10 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        COUNT(*) as total_records,
        COUNT(*) - invalid_count as valid_relationships,
        invalid_count as invalid_relationships,
        0 as orphaned_records,
        ROUND(((COUNT(*) - invalid_count)::DECIMAL / COUNT(*)) * 100, 2) as integrity_rate,
        CASE WHEN invalid_count > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN invalid_count = 0 THEN 'All customer records have valid user references'
            WHEN invalid_count < 10 THEN 'Few customer records have invalid user references - investigate data entry issues'
            ELSE 'Many customer records have invalid user references - critical data integrity issue'
        END as recommendations
    FROM (
        SELECT
            cc.customer_id,
            CASE WHEN u.id IS NULL THEN 1 ELSE 0 END as invalid_flag
        FROM cleaning_customers cc
        LEFT JOIN shared_auth_service.users u ON cc.customer_id = u.id
        WHERE u.id IS NULL OR u.role != 'CUSTOMER'
    ) invalid_customers
    CROSS JOIN (
        SELECT COUNT(*) as invalid_count
        FROM cleaning_customers cc
        LEFT JOIN shared_auth_service.users u ON cc.customer_id = u.id
        WHERE u.id IS NULL OR u.role != 'CUSTOMER'
    ) invalid_counts;

    -- Test 1.2: Maintenance Customers to Shared Auth Users
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    SELECT
        'authentication_customer' as relationship_type,
        'maintenance_db' as source_database,
        'maintenance_customers' as source_table,
        'shared_auth_service' as target_database,
        'users' as target_table,
        CASE
            WHEN COUNT(*) = 0 THEN 'NO_DATA'
            WHEN invalid_count = 0 THEN 'VALID'
            WHEN invalid_count < 10 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        COUNT(*) as total_records,
        COUNT(*) - invalid_count as valid_relationships,
        invalid_count as invalid_relationships,
        0 as orphaned_records,
        ROUND(((COUNT(*) - invalid_count)::DECIMAL / COUNT(*)) * 100, 2) as integrity_rate,
        CASE WHEN invalid_count > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN invalid_count = 0 THEN 'All maintenance customer records have valid user references'
            WHEN invalid_count < 10 THEN 'Few maintenance customer records have invalid user references'
            ELSE 'Many maintenance customer records have invalid user references - critical issue'
        END as recommendations
    FROM (
        SELECT
            mc.customer_id,
            CASE WHEN u.id IS NULL THEN 1 ELSE 0 END as invalid_flag
        FROM maintenance_customers mc
        LEFT JOIN shared_auth_service.users u ON mc.customer_id = u.id
        WHERE u.id IS NULL OR u.role != 'CUSTOMER'
    ) invalid_customers
    CROSS JOIN (
        SELECT COUNT(*) as invalid_count
        FROM maintenance_customers mc
        LEFT JOIN shared_auth_service.users u ON mc.customer_id = u.id
        WHERE u.id IS NULL OR u.role != 'CUSTOMER'
    ) invalid_counts;

    -- ============================================================
    -- 2. PROPERTY RELATIONSHIPS
    -- ============================================================

    -- Test 2.1: Cleaning Properties to Cleaning Customers
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    SELECT
        'property_customer' as relationship_type,
        'cleaning_db' as source_database,
        'cleaning_properties' as source_table,
        'cleaning_db' as target_database,
        'cleaning_customers' as target_table,
        CASE
            WHEN COUNT(*) = 0 THEN 'NO_DATA'
            WHEN orphan_count = 0 THEN 'VALID'
            WHEN orphan_count < 5 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        COUNT(*) as total_records,
        COUNT(*) - orphan_count as valid_relationships,
        orphan_count as invalid_relationships,
        orphan_count as orphaned_records,
        ROUND(((COUNT(*) - orphan_count)::DECIMAL / GREATEST(COUNT(*), 1)) * 100, 2) as integrity_rate,
        CASE WHEN orphan_count > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN orphan_count = 0 THEN 'All properties have valid customer owners'
            WHEN orphan_count < 5 THEN 'Few properties have missing customer references'
            ELSE 'Many properties have missing customer references - critical data integrity issue'
        END as recommendations
    FROM cleaning_properties cp
    CROSS JOIN (
        SELECT COUNT(*) as orphan_count
        FROM cleaning_properties cp
        LEFT JOIN cleaning_customers cc ON cp.owner_id = cc.customer_id
        WHERE cc.customer_id IS NULL
    ) orphan_counts;

    -- Test 2.2: Maintenance Properties to Maintenance Customers
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    SELECT
        'property_customer' as relationship_type,
        'maintenance_db' as source_database,
        'maintenance_properties' as source_table,
        'maintenance_db' as target_database,
        'maintenance_customers' as target_table,
        CASE
            WHEN COUNT(*) = 0 THEN 'NO_DATA'
            WHEN orphan_count = 0 THEN 'VALID'
            WHEN orphan_count < 5 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        COUNT(*) as total_records,
        COUNT(*) - orphan_count as valid_relationships,
        orphan_count as invalid_relationships,
        orphan_count as orphaned_records,
        ROUND(((COUNT(*) - orphan_count)::DECIMAL / GREATEST(COUNT(*), 1)) * 100, 2) as integrity_rate,
        CASE WHEN orphan_count > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN orphan_count = 0 THEN 'All maintenance properties have valid customer owners'
            WHEN orphan_count < 5 THEN 'Few maintenance properties have missing customer references'
            ELSE 'Many maintenance properties have missing customer references - critical issue'
        END as recommendations
    FROM maintenance_properties cp
    CROSS JOIN (
        SELECT COUNT(*) as orphan_count
        FROM maintenance_properties cp
        LEFT JOIN maintenance_customers cc ON cp.owner_id = cc.customer_id
        WHERE cc.customer_id IS NULL
    ) orphan_counts;

    -- ============================================================
    -- 3. JOB RELATIONSHIPS
    -- ============================================================

    -- Test 3.1: Cleaning Jobs to Cleaning Customers and Properties
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    WITH job_relationships AS (
        SELECT
            cj.id as job_id,
            CASE WHEN cc.customer_id IS NULL THEN 1 ELSE 0 END as invalid_customer,
            CASE WHEN cp.id IS NULL THEN 1 ELSE 0 END as invalid_property
        FROM cleaning_jobs cj
        LEFT JOIN cleaning_customers cc ON cj.customer_id = cc.customer_id
        LEFT JOIN cleaning_properties cp ON cj.property_id = cp.id
    ),
        relationship_summary AS (
        SELECT
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE invalid_customer = 0 AND invalid_property = 0) as valid_jobs,
            COUNT(*) FILTER (WHERE invalid_customer = 1 OR invalid_property = 1) as invalid_jobs,
            COUNT(*) FILTER (WHERE invalid_customer = 1 OR invalid_property = 1) as orphaned_jobs
        FROM job_relationships
    )
    SELECT
        'job_customer_property' as relationship_type,
        'cleaning_db' as source_database,
        'cleaning_jobs' as source_table,
        'multiple' as target_database,
        'customers_properties' as target_table,
        CASE
            WHEN total_jobs = 0 THEN 'NO_DATA'
            WHEN invalid_jobs = 0 THEN 'VALID'
            WHEN invalid_jobs < 10 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        total_jobs as total_records,
        valid_jobs as valid_relationships,
        invalid_jobs as invalid_relationships,
        orphaned_jobs as orphaned_records,
        ROUND((valid_jobs::DECIMAL / GREATEST(total_jobs, 1)) * 100, 2) as integrity_rate,
        CASE WHEN invalid_jobs > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN invalid_jobs = 0 THEN 'All cleaning jobs have valid customer and property references'
            WHEN invalid_jobs < 10 THEN 'Few cleaning jobs have missing customer or property references'
            ELSE 'Many cleaning jobs have missing references - critical operational issue'
        END as recommendations
    FROM relationship_summary;

    -- Test 3.2: Maintenance Jobs to Maintenance Customers and Properties
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    WITH job_relationships AS (
        SELECT
            mj.id as job_id,
            CASE WHEN mc.customer_id IS NULL THEN 1 ELSE 0 END as invalid_customer,
            CASE WHEN mp.id IS NULL THEN 1 ELSE 0 END as invalid_property
        FROM maintenance_jobs mj
        LEFT JOIN maintenance_customers mc ON mj.customer_id = mc.customer_id
        LEFT JOIN maintenance_properties mp ON mj.property_id = mp.id
    ),
        relationship_summary AS (
        SELECT
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE invalid_customer = 0 AND invalid_property = 0) as valid_jobs,
            COUNT(*) FILTER (WHERE invalid_customer = 1 OR invalid_property = 1) as invalid_jobs,
            COUNT(*) FILTER (WHERE invalid_customer = 1 OR invalid_property = 1) as orphaned_jobs
        FROM job_relationships
    )
    SELECT
        'job_customer_property' as relationship_type,
        'maintenance_db' as source_database,
        'maintenance_jobs' as source_table,
        'multiple' as target_database,
        'customers_properties' as target_table,
        CASE
            WHEN total_jobs = 0 THEN 'NO_DATA'
            WHEN invalid_jobs = 0 THEN 'VALID'
            WHEN invalid_jobs < 10 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        total_jobs as total_records,
        valid_jobs as valid_relationships,
        invalid_jobs as invalid_relationships,
        orphaned_jobs as orphaned_records,
        ROUND((valid_jobs::DECIMAL / GREATEST(total_jobs, 1)) * 100, 2) as integrity_rate,
        CASE WHEN invalid_jobs > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN invalid_jobs = 0 THEN 'All maintenance jobs have valid customer and property references'
            WHEN invalid_jobs < 10 THEN 'Few maintenance jobs have missing customer or property references'
            ELSE 'Many maintenance jobs have missing references - critical operational issue'
        END as recommendations
    FROM relationship_summary;

    -- ============================================================
    -- 4. DUAL-SERVICE CUSTOMER CONSISTENCY
    -- ============================================================

    -- Test 4.1: Dual-Service Customer Data Consistency
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    WITH dual_service_analysis AS (
        SELECT
            dsc.customer_id,
            cc.email as cleaning_email,
            mc.email as maintenance_email,
            cc.first_name as cleaning_first_name,
            mc.first_name as maintenance_first_name,
            cc.last_name as cleaning_last_name,
            mc.last_name as maintenance_last_name,
            cc.phone as cleaning_phone,
            mc.phone as maintenance_phone,
            CASE
                WHEN cc.email != mc.email
                OR cc.first_name != mc.first_name
                OR cc.last_name != mc.last_name
                OR cc.phone != mc.phone
                THEN 1
                ELSE 0
            END as inconsistency_flag
        FROM dual_service_customers dsc
        JOIN cleaning_customers cc ON dsc.customer_id = cc.customer_id
        JOIN maintenance_customers mc ON dsc.customer_id = mc.customer_id
    ),
        consistency_summary AS (
        SELECT
            COUNT(*) as total_dual_customers,
            COUNT(*) FILTER (WHERE inconsistency_flag = 0) as consistent_customers,
            COUNT(*) FILTER (WHERE inconsistency_flag = 1) as inconsistent_customers,
            COUNT(*) FILTER (WHERE inconsistency_flag = 1) as orphaned_records
        FROM dual_service_analysis
    )
    SELECT
        'dual_service_consistency' as relationship_type,
        'cross_service' as source_database,
        'dual_service_customers' as source_table,
        'cleaning_maintenance' as target_database,
        'customer_tables' as target_table,
        CASE
            WHEN total_dual_customers = 0 THEN 'NO_DATA'
            WHEN inconsistent_customers = 0 THEN 'VALID'
            WHEN inconsistent_customers < 5 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        total_dual_customers as total_records,
        consistent_customers as valid_relationships,
        inconsistent_customers as invalid_relationships,
        orphaned_records as orphaned_records,
        ROUND((consistent_customers::DECIMAL / GREATEST(total_dual_customers, 1)) * 100, 2) as integrity_rate,
        CASE WHEN inconsistent_customers > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN inconsistent_customers = 0 THEN 'All dual-service customers have consistent data across services'
            WHEN inconsistent_customers < 5 THEN 'Few dual-service customers have inconsistent contact information'
            ELSE 'Many dual-service customers have inconsistent data - critical data quality issue'
        END as recommendations
    FROM consistency_summary;

    -- ============================================================
    -- 5. FINANCIAL TRANSACTION RELATIONSHIPS
    -- ============================================================

    -- Test 5.1: Cleaning Financial Transactions to Customers
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    SELECT
        'financial_transaction_customer' as relationship_type,
        'cleaning_db' as source_database,
        'cleaning_financial_transactions' as source_table,
        'cleaning_db' as target_database,
        'cleaning_customers' as target_table,
        CASE
            WHEN COUNT(*) = 0 THEN 'NO_DATA'
            WHEN orphan_count = 0 THEN 'VALID'
            WHEN orphan_count < 20 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        COUNT(*) as total_records,
        COUNT(*) - orphan_count as valid_relationships,
        orphan_count as invalid_relationships,
        orphan_count as orphaned_records,
        ROUND(((COUNT(*) - orphan_count)::DECIMAL / GREATEST(COUNT(*), 1)) * 100, 2) as integrity_rate,
        CASE WHEN orphan_count > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN orphan_count = 0 THEN 'All financial transactions have valid customer references'
            WHEN orphan_count < 20 THEN 'Few financial transactions have missing customer references'
            ELSE 'Many financial transactions have missing customer references - critical financial integrity issue'
        END as recommendations
    FROM cleaning_financial_transactions cft
    CROSS JOIN (
        SELECT COUNT(*) as orphan_count
        FROM cleaning_financial_transactions cft
        LEFT JOIN cleaning_customers cc ON cft.customer_id = cc.customer_id
        WHERE cft.customer_id IS NOT NULL
        AND cc.customer_id IS NULL
    ) orphan_counts
    WHERE cft.customer_id IS NOT NULL;

    -- Test 5.2: Maintenance Financial Transactions to Customers
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    SELECT
        'financial_transaction_customer' as relationship_type,
        'maintenance_db' as source_database,
        'maintenance_financial_transactions' as source_table,
        'maintenance_db' as target_database,
        'maintenance_customers' as target_table,
        CASE
            WHEN COUNT(*) = 0 THEN 'NO_DATA'
            WHEN orphan_count = 0 THEN 'VALID'
            WHEN orphan_count < 20 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        COUNT(*) as total_records,
        COUNT(*) - orphan_count as valid_relationships,
        orphan_count as invalid_relationships,
        orphan_count as orphaned_records,
        ROUND(((COUNT(*) - orphan_count)::DECIMAL / GREATEST(COUNT(*), 1)) * 100, 2) as integrity_rate,
        CASE WHEN orphan_count > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN orphan_count = 0 THEN 'All maintenance financial transactions have valid customer references'
            WHEN orphan_count < 20 THEN 'Few maintenance financial transactions have missing customer references'
            ELSE 'Many maintenance financial transactions have missing customer references - critical issue'
        END as recommendations
    FROM maintenance_financial_transactions mft
    CROSS JOIN (
        SELECT COUNT(*) as orphan_count
        FROM maintenance_financial_transactions mft
        LEFT JOIN maintenance_customers mc ON mft.customer_id = mc.customer_id
        WHERE mft.customer_id IS NOT NULL
        AND mc.customer_id IS NULL
    ) orphan_counts
    WHERE mft.customer_id IS NOT NULL;

    -- ============================================================
    -- 6. CONTRACT RELATIONSHIPS
    -- ============================================================

    -- Test 6.1: Cleaning Contracts to Customers and Properties
    INSERT INTO cross_service_relationship_validation (
        relationship_type, source_database, source_table,
        target_database, target_table, relationship_status,
        total_records, valid_relationships, invalid_relationships,
        orphaned_records, integrity_rate, critical_issues, recommendations
    )
    WITH contract_relationships AS (
        SELECT
            cc.id as contract_id,
            CASE WHEN cust.customer_id IS NULL THEN 1 ELSE 0 END as invalid_customer,
            CASE WHEN prop.id IS NULL THEN 1 ELSE 0 END as invalid_property
        FROM cleaning_contracts cc
        LEFT JOIN cleaning_customers cust ON cc.customer_id = cust.customer_id
        LEFT JOIN cleaning_properties prop ON cc.property_id = prop.id
    ),
        relationship_summary AS (
        SELECT
            COUNT(*) as total_contracts,
            COUNT(*) FILTER (WHERE invalid_customer = 0 AND invalid_property = 0) as valid_contracts,
            COUNT(*) FILTER (WHERE invalid_customer = 1 OR invalid_property = 1) as invalid_contracts,
            COUNT(*) FILTER (WHERE invalid_customer = 1 OR invalid_property = 1) as orphaned_contracts
        FROM contract_relationships
    )
    SELECT
        'contract_customer_property' as relationship_type,
        'cleaning_db' as source_database,
        'cleaning_contracts' as source_table,
        'cleaning_db' as target_database,
        'customers_properties' as target_table,
        CASE
            WHEN total_contracts = 0 THEN 'NO_DATA'
            WHEN invalid_contracts = 0 THEN 'VALID'
            WHEN invalid_contracts < 5 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as relationship_status,
        total_contracts as total_records,
        valid_contracts as valid_relationships,
        invalid_contracts as invalid_relationships,
        orphaned_contracts as orphaned_records,
        ROUND((valid_contracts::DECIMAL / GREATEST(total_contracts, 1)) * 100, 2) as integrity_rate,
        CASE WHEN invalid_contracts > 0 THEN 1 ELSE 0 END as critical_issues,
        CASE
            WHEN invalid_contracts = 0 THEN 'All cleaning contracts have valid customer and property references'
            WHEN invalid_contracts < 5 THEN 'Few cleaning contracts have missing customer or property references'
            ELSE 'Many cleaning contracts have missing references - critical contractual issue'
        END as recommendations
    FROM relationship_summary;

    -- ============================================================
    -- RELATIONSHIP VALIDATION SUMMARY
    -- ============================================================

    -- Generate summary statistics
    SELECT
        COUNT(*) INTO total_relationships
    FROM cross_service_relationship_validation;

    SELECT
        COUNT(*) INTO passed_relationships
    FROM cross_service_relationship_validation
    WHERE relationship_status = 'VALID';

    SELECT
        COUNT(*) INTO failed_relationships
    FROM cross_service_relationship_validation
    WHERE relationship_status IN ('WARNING', 'CRITICAL');

    -- Generate validation report
    RAISE NOTICE 'Cross-Service Relationship Validation Summary';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Total Relationships Tested: %', total_relationships;
    RAISE NOTICE 'Passed: %', passed_relationships;
    RAISE NOTICE 'Failed/Warning: %', failed_relationships;
    RAISE NOTICE 'Success Rate: %', ROUND((passed_relationships::DECIMAL / total_relationships::DECIMAL) * 100, 2);

    -- Return detailed results
    RETURN QUERY
    SELECT
        relationship_type,
        source_database,
        source_table,
        target_database,
        target_table,
        relationship_status,
        total_records,
        valid_relationships,
        invalid_relationships,
        orphaned_records,
        integrity_rate,
        critical_issues,
        recommendations,
        validation_timestamp
    FROM cross_service_relationship_validation
    ORDER BY
        CASE WHEN relationship_status = 'CRITICAL' THEN 1
             WHEN relationship_status = 'WARNING' THEN 2
             WHEN relationship_status = 'VALID' THEN 3
             ELSE 4 END,
        relationship_type;

END;
$$ LANGUAGE plpgsql;

-- Create relationship monitoring view
CREATE OR REPLACE VIEW cross_service_relationship_health AS
SELECT
    relationship_type,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE relationship_status = 'VALID') as passed_tests,
    COUNT(*) FILTER (WHERE relationship_status = 'WARNING') as warning_tests,
    COUNT(*) FILTER (WHERE relationship_status = 'CRITICAL') as critical_tests,
    COUNT(*) FILTER (WHERE relationship_status = 'NO_DATA') as no_data_tests,
    ROUND(AVG(integrity_rate), 2) as average_integrity_rate,
    SUM(critical_issues) as total_critical_issues,
    SUM(orphaned_records) as total_orphaned_records,
    MAX(validation_timestamp) as last_validation
FROM cross_service_relationship_validation
GROUP BY relationship_type
ORDER BY total_critical_issues DESC, average_integrity_rate ASC;

-- Create relationship repair suggestions function
CREATE OR REPLACE FUNCTION generate_relationship_repair_suggestions()
RETURNS TABLE (
    repair_priority VARCHAR(20),
    relationship_type VARCHAR(100),
    affected_table VARCHAR(100),
    issue_description TEXT,
    estimated_records_affected BIGINT,
    repair_sql TEXT,
    prevention_recommendations TEXT
) AS $$
BEGIN

    RETURN QUERY

    -- Critical: Invalid Customer References
    SELECT
        'CRITICAL' as repair_priority,
        'authentication_customer' as relationship_type,
        'cleaning_customers' as affected_table,
        'Customer records without valid user authentication references' as issue_description,
        COUNT(*) as estimated_records_affected,
        'UPDATE cleaning_customers SET is_active = false WHERE customer_id IN (SELECT cc.customer_id FROM cleaning_customers cc LEFT JOIN shared_auth_service.users u ON cc.customer_id = u.id WHERE u.id IS NULL);' as repair_sql,
        'Implement foreign key constraints and validation triggers in application layer' as prevention_recommendations
    FROM cleaning_customers cc
    LEFT JOIN shared_auth_service.users u ON cc.customer_id = u.id
    WHERE u.id IS NULL
    HAVING COUNT(*) > 0

    UNION ALL

    -- High: Orphaned Financial Transactions
    SELECT
        'HIGH' as repair_priority,
        'financial_transaction_customer' as relationship_type,
        'cleaning_financial_transactions' as affected_table,
        'Financial transactions without valid customer references' as issue_description,
        COUNT(*) as estimated_records_affected,
        'UPDATE cleaning_financial_transactions SET customer_id = NULL WHERE customer_id IN (SELECT cft.customer_id FROM cleaning_financial_transactions cft LEFT JOIN cleaning_customers cc ON cft.customer_id = cc.customer_id WHERE cc.customer_id IS NULL);' as repair_sql,
        'Add customer validation before transaction creation' as prevention_recommendations
    FROM cleaning_financial_transactions cft
    LEFT JOIN cleaning_customers cc ON cft.customer_id = cc.customer_id
    WHERE cft.customer_id IS NOT NULL
    AND cc.customer_id IS NULL
    HAVING COUNT(*) > 0

    UNION ALL

    -- Medium: Inconsistent Dual-Service Customer Data
    SELECT
        'MEDIUM' as repair_priority,
        'dual_service_consistency' as relationship_type,
        'dual_service_customers' as affected_table,
        'Inconsistent contact information between services for dual-service customers' as issue_description,
        COUNT(*) as estimated_records_affected,
        '-- Manual review required:\nSELECT dsc.customer_id, cc.email as cleaning_email, mc.email as maintenance_email FROM dual_service_customers dsc JOIN cleaning_customers cc ON dsc.customer_id = cc.customer_id JOIN maintenance_customers mc ON dsc.customer_id = mc.customer_id WHERE cc.email != mc.email;' as repair_sql,
        'Implement synchronization process for dual-service customer updates' as prevention_recommendations
    FROM dual_service_customers dsc
    JOIN cleaning_customers cc ON dsc.customer_id = cc.customer_id
    JOIN maintenance_customers mc ON dsc.customer_id = mc.customer_id
    WHERE cc.email != mc.email
       OR cc.first_name != mc.first_name
       OR cc.last_name != mc.last_name
       OR cc.phone != mc.phone
    HAVING COUNT(*) > 0

    UNION ALL

    -- Low: Missing Property References
    SELECT
        'LOW' as repair_priority,
        'property_customer' as relationship_type,
        'cleaning_properties' as affected_table,
        'Properties without assigned customer owners' as issue_description,
        COUNT(*) as estimated_records_affected,
        'UPDATE cleaning_properties SET owner_id = NULL WHERE owner_id IN (SELECT cp.id FROM cleaning_properties cp LEFT JOIN cleaning_customers cc ON cp.owner_id = cc.customer_id WHERE cc.customer_id IS NULL);' as repair_sql,
        'Make customer assignment mandatory during property creation' as prevention_recommendations
    FROM cleaning_properties cp
    LEFT JOIN cleaning_customers cc ON cp.owner_id = cc.customer_id
    WHERE cc.customer_id IS NULL
    HAVING COUNT(*) > 0

    ORDER BY
        CASE repair_priority
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            WHEN 'LOW' THEN 4
        END,
        estimated_records_affected DESC;

END;
$$ LANGUAGE plpgsql;
```

### 2. Cross-Service Relationship Impact Analysis

#### `relationship-impact-analyzer.sql`

```sql
-- ================================================================
-- Cross-Service Relationship Impact Analyzer
-- ================================================================
-- Purpose: Analyze the impact of relationship changes across services
-- Features: Change propagation analysis, dependency mapping, impact assessment
-- ================================================================

CREATE OR REPLACE FUNCTION analyze_relationship_change_impact(
    p_source_database VARCHAR(100),
    p_source_table VARCHAR(100),
    p_record_id UUID,
    p_change_type VARCHAR(50) -- 'UPDATE', 'DELETE', 'MERGE', 'SPLIT'
)
RETURNS TABLE (
    affected_service VARCHAR(100),
    affected_table VARCHAR(100),
    affected_records BIGINT,
    impact_level VARCHAR(20), -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    impact_description TEXT,
    recommended_actions TEXT,
    cascade_risk BOOLEAN
) AS $$
DECLARE
    v_record_exists BOOLEAN;
    v_customer_type VARCHAR(50);
BEGIN

    -- Check if record exists
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I.%I WHERE id = $1)', p_source_database, p_source_table)
    USING p_record_id
    INTO v_record_exists;

    IF NOT v_record_exists AND p_change_type != 'DELETE' THEN
        RAISE EXCEPTION 'Record % does not exist in %I.%I', p_record_id, p_source_database, p_source_table;
    END IF;

    -- ============================================================
    -- ANALYZE CUSTOMER-LEVEL CHANGES
    -- ============================================================

    IF p_source_table IN ('cleaning_customers', 'maintenance_customers', 'users') THEN

        -- Determine customer type
        IF p_source_table = 'users' THEN
            SELECT role INTO v_customer_type
            FROM shared_auth_service.users
            WHERE id = p_record_id;
        ELSE
            v_customer_type := 'CUSTOMER';
        END IF;

        IF v_customer_type = 'CUSTOMER' THEN

            -- Impact Analysis for Customer Changes
            RETURN QUERY

            -- Check for dual-service customer impact
            SELECT
                'both_services' as affected_service,
                'dual_service_customers' as affected_table,
                COUNT(*) as affected_records,
                CASE WHEN COUNT(*) > 0 THEN 'CRITICAL' ELSE 'NONE' END as impact_level,
                format('Customer is used in both cleaning and maintenance services - changes will affect % records', COUNT(*)) as impact_description,
                'Synchronize changes across both services and maintain data consistency' as recommended_actions,
                true as cascade_risk
            FROM dual_service_customers
            WHERE customer_id = p_record_id

            UNION ALL

            -- Cleaning service impact
            SELECT
                'cleaning_service' as affected_service,
                string_agg(affected_table, ', ') as affected_table,
                SUM(affected_records) as affected_records,
                CASE WHEN SUM(affected_records) > 50 THEN 'CRITICAL'
                     WHEN SUM(affected_records) > 10 THEN 'HIGH'
                     WHEN SUM(affected_records) > 0 THEN 'MEDIUM'
                     ELSE 'NONE' END as impact_level,
                format('Customer has % active relationships in cleaning service', SUM(affected_records)) as impact_description,
                'Review and update all customer-related records in cleaning service' as recommended_actions,
                CASE WHEN SUM(affected_records) > 0 THEN true ELSE false END as cascade_risk
            FROM (
                SELECT 'cleaning_jobs' as affected_table, COUNT(*) as affected_records
                FROM cleaning_jobs WHERE customer_id = p_record_id AND status NOT IN ('cancelled', 'completed')
                UNION ALL
                SELECT 'cleaning_contracts', COUNT(*)
                FROM cleaning_contracts WHERE customer_id = p_record_id AND end_date >= CURRENT_DATE
                UNION ALL
                SELECT 'cleaning_properties', COUNT(*)
                FROM cleaning_properties WHERE owner_id = p_record_id
                UNION ALL
                SELECT 'cleaning_financial_transactions', COUNT(*)
                FROM cleaning_financial_transactions WHERE customer_id = p_record_id
            ) cleaning_impacts

            UNION ALL

            -- Maintenance service impact
            SELECT
                'maintenance_service' as affected_service,
                string_agg(affected_table, ', ') as affected_table,
                SUM(affected_records) as affected_records,
                CASE WHEN SUM(affected_records) > 50 THEN 'CRITICAL'
                     WHEN SUM(affected_records) > 10 THEN 'HIGH'
                     WHEN SUM(affected_records) > 0 THEN 'MEDIUM'
                     ELSE 'NONE' END as impact_level,
                format('Customer has % active relationships in maintenance service', SUM(affected_records)) as impact_description,
                'Review and update all customer-related records in maintenance service' as recommended_actions,
                CASE WHEN SUM(affected_records) > 0 THEN true ELSE false END as cascade_risk
            FROM (
                SELECT 'maintenance_jobs' as affected_table, COUNT(*) as affected_records
                FROM maintenance_jobs WHERE customer_id = p_record_id AND status NOT IN ('cancelled', 'completed')
                UNION ALL
                SELECT 'maintenance_contracts', COUNT(*)
                FROM maintenance_contracts WHERE customer_id = p_record_id AND end_date >= CURRENT_DATE
                UNION ALL
                SELECT 'maintenance_properties', COUNT(*)
                FROM maintenance_properties WHERE owner_id = p_record_id
                UNION ALL
                SELECT 'maintenance_financial_transactions', COUNT(*)
                FROM maintenance_financial_transactions WHERE customer_id = p_record_id
            ) maintenance_impacts;

        END IF;

    END IF;

    -- ============================================================
    -- ANALYZE PROPERTY-LEVEL CHANGES
    -- ============================================================

    IF p_source_table IN ('cleaning_properties', 'maintenance_properties') THEN

        RETURN QUERY

        -- Property impact analysis
        SELECT
            CASE WHEN p_source_table LIKE 'cleaning%' THEN 'cleaning_service' ELSE 'maintenance_service' END as affected_service,
            string_agg(affected_table, ', ') as affected_table,
            SUM(affected_records) as affected_records,
            CASE WHEN SUM(affected_records) > 20 THEN 'CRITICAL'
                 WHEN SUM(affected_records) > 5 THEN 'HIGH'
                 WHEN SUM(affected_records) > 0 THEN 'MEDIUM'
                 ELSE 'NONE' END as impact_level,
            format('Property has % active dependent records', SUM(affected_records)) as impact_description,
            'Update all property-dependent records and validate service assignments' as recommended_actions,
            CASE WHEN SUM(affected_records) > 0 THEN true ELSE false END as cascade_risk
        FROM (
            SELECT CASE WHEN p_source_table LIKE 'cleaning%' THEN 'cleaning_jobs' ELSE 'maintenance_jobs' END as affected_table, COUNT(*) as affected_records
            FROM CASE
                WHEN p_source_table LIKE 'cleaning%' THEN cleaning_jobs
                ELSE maintenance_jobs
            END
            WHERE property_id = p_record_id AND status NOT IN ('cancelled', 'completed')

            UNION ALL

            SELECT CASE WHEN p_source_table LIKE 'cleaning%' THEN 'cleaning_contracts' ELSE 'maintenance_contracts' END as affected_table, COUNT(*)
            FROM CASE
                WHEN p_source_table LIKE 'cleaning%' THEN cleaning_contracts
                ELSE maintenance_contracts
            END
            WHERE property_id = p_record_id AND end_date >= CURRENT_DATE
        ) property_impacts;

    END IF;

    -- ============================================================
    -- ANALYZE JOB-LEVEL CHANGES
    -- ============================================================

    IF p_source_table IN ('cleaning_jobs', 'maintenance_jobs') THEN

        RETURN QUERY

        -- Job impact analysis
        SELECT
            CASE WHEN p_source_table LIKE 'cleaning%' THEN 'cleaning_service' ELSE 'maintenance_service' END as affected_service,
            'job_operations' as affected_table,
            1 as affected_records,
            CASE WHEN p_change_type = 'DELETE' THEN 'CRITICAL'
                 WHEN p_change_type = 'UPDATE' THEN 'HIGH'
                 ELSE 'MEDIUM' END as impact_level,
            format('Job modification will affect scheduling and financial records') as impact_description,
            'Review job schedules, contractor assignments, and financial transactions' as recommended_actions,
            true as cascade_risk

        UNION ALL

        -- Financial impact
        SELECT
            CASE WHEN p_source_table LIKE 'cleaning%' THEN 'cleaning_service' ELSE 'maintenance_service' END as affected_service,
            'financial_transactions' as affected_table,
            COALESCE(ft_count, 0) as affected_records,
            CASE WHEN COALESCE(ft_count, 0) > 0 THEN 'HIGH' ELSE 'LOW' END as impact_level,
            format('Job has % associated financial transactions', COALESCE(ft_count, 0)) as impact_description,
            'Review and update related financial transactions and billing records' as recommended_actions,
            CASE WHEN COALESCE(ft_count, 0) > 0 THEN true ELSE false END as cascade_risk
        FROM (
            SELECT COUNT(*) as ft_count
            FROM CASE
                WHEN p_source_table LIKE 'cleaning%' THEN cleaning_financial_transactions
                ELSE maintenance_financial_transactions
            END
            WHERE reference_id = p_record_id
        ) financial_data;

    END IF;

    -- ============================================================
    -- ANALYZE CONTRACT-LEVEL CHANGES
    -- ============================================================

    IF p_source_table IN ('cleaning_contracts', 'maintenance_contracts') THEN

        RETURN QUERY

        -- Contract impact analysis
        SELECT
            CASE WHEN p_source_table LIKE 'cleaning%' THEN 'cleaning_service' ELSE 'maintenance_service' END as affected_service,
            'contract_operations' as affected_table,
            1 as affected_records,
            CASE WHEN p_change_type = 'DELETE' THEN 'CRITICAL'
                 WHEN p_change_type = 'UPDATE' THEN 'HIGH'
                 ELSE 'MEDIUM' END as impact_level,
            'Contract changes affect billing, scheduling, and customer relationships' as impact_description,
            'Update billing schedules, job assignments, and customer notifications' as recommended_actions,
            true as cascade_risk

        UNION ALL

        -- Job scheduling impact
        SELECT
            CASE WHEN p_source_table LIKE 'cleaning%' THEN 'cleaning_service' ELSE 'maintenance_service' END as affected_service,
            'scheduled_jobs' as affected_table,
            COALESCE(job_count, 0) as affected_records,
            CASE WHEN COALESCE(job_count, 0) > 10 THEN 'CRITICAL'
                 WHEN COALESCE(job_count, 0) > 0 THEN 'HIGH'
                 ELSE 'LOW' END as impact_level,
            format('Contract affects % scheduled or active jobs', COALESCE(job_count, 0)) as impact_description,
            'Review and reschedule affected jobs, notify contractors and customers' as recommended_actions,
            CASE WHEN COALESCE(job_count, 0) > 0 THEN true ELSE false END as cascade_risk
        FROM (
            SELECT COUNT(*) as job_count
            FROM CASE
                WHEN p_source_table LIKE 'cleaning%' THEN cleaning_jobs
                ELSE maintenance_jobs
            END
            WHERE contract_id = p_record_id
            AND status NOT IN ('cancelled', 'completed')
        ) job_data;

    END IF;

END;
$$ LANGUAGE plpgsql;

-- Create relationship change impact summary view
CREATE OR REPLACE VIEW relationship_change_impact_summary AS
SELECT
    source_database,
    source_table,
    record_id,
    change_type,
    COUNT(*) as total_impacts,
    COUNT(*) FILTER (WHERE impact_level = 'CRITICAL') as critical_impacts,
    COUNT(*) FILTER (WHERE impact_level = 'HIGH') as high_impacts,
    COUNT(*) FILTER (WHERE impact_level = 'MEDIUM') as medium_impacts,
    COUNT(*) FILTER (WHERE impact_level = 'LOW') as low_impacts,
    BOOL_OR(cascade_risk) as has_cascade_risk,
    MAX(analysis_timestamp) as last_analysis
FROM (
    -- This would be populated by a trigger or logging mechanism
    SELECT * FROM relationship_change_log
) impact_logs
GROUP BY source_database, source_table, record_id, change_type
ORDER BY critical_impacts DESC, total_impacts DESC;
```

### 3. Cross-Service Relationship Testing Framework

#### `relationship-testing-framework.py`

```python
#!/usr/bin/env python3
"""
Cross-Service Relationship Testing Framework

Purpose: Comprehensive testing of cross-service relationships and dependencies
Features: Automated testing, relationship validation, impact analysis
Usage: python relationship-testing-framework.py [test_type] [environment]
"""

import os
import sys
import argparse
import logging
import json
import unittest
from datetime import datetime
from typing import Dict, List, Tuple, Any
import pandas as pd
from sqlalchemy import create_engine, text
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('relationship_testing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TestResult(Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    WARNING = "WARNING"
    SKIPPED = "SKIPPED"
    ERROR = "ERROR"

class RelationshipType(Enum):
    AUTHENTICATION_CUSTOMER = "authentication_customer"
    PROPERTY_CUSTOMER = "property_customer"
    JOB_CUSTOMER_PROPERTY = "job_customer_property"
    DUAL_SERVICE_CONSISTENCY = "dual_service_consistency"
    FINANCIAL_TRANSACTION_CUSTOMER = "financial_transaction_customer"
    CONTRACT_CUSTOMER_PROPERTY = "contract_customer_property"

@dataclass
class RelationshipTestResult:
    test_name: str
    relationship_type: RelationshipType
    source_database: str
    source_table: str
    target_database: str
    target_table: str
    result: TestResult
    total_records: int
    valid_relationships: int
    invalid_relationships: int
    orphaned_records: int
    integrity_rate: float
    details: str
    execution_time: float

class CrossServiceRelationshipTester:
    def __init__(self, environment: str = 'development'):
        """Initialize the cross-service relationship tester"""
        self.environment = environment
        self.db_config = self._load_database_config()
        self.engine = self._create_database_connection()
        self.test_results: List[RelationshipTestResult] = []

        logger.info(f"Cross-Service Relationship Tester initialized for {environment}")

    def _load_database_config(self) -> Dict[str, Any]:
        """Load database configuration"""
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

    def execute_query(self, database: str, query: str) -> pd.DataFrame:
        """Execute SQL query and return DataFrame"""
        try:
            full_query = f"SET search_path TO {self.db_config['databases'][database]}; {query}"
            df = pd.read_sql(text(full_query), self.engine)
            return df
        except Exception as e:
            logger.error(f"Error executing query on {database}: {str(e)}")
            return pd.DataFrame()

    def test_authentication_customer_relationship(self) -> RelationshipTestResult:
        """Test customer to authentication user relationships"""
        logger.info("Testing authentication-customer relationships")
        start_time = datetime.now()

        try:
            # Test cleaning customers
            cleaning_query = """
            SELECT
                COUNT(*) as total_records,
                COUNT(*) FILTER (WHERE u.id IS NOT NULL AND u.role = 'CUSTOMER') as valid_relationships,
                COUNT(*) FILTER (WHERE u.id IS NULL OR u.role != 'CUSTOMER') as invalid_relationships,
                0 as orphaned_records
            FROM cleaning_customers cc
            LEFT JOIN shared_auth_service.users u ON cc.customer_id = u.id
            """

            cleaning_result = self.execute_query('cleaning', cleaning_query)

            if cleaning_result.empty:
                return RelationshipTestResult(
                    test_name="Authentication Customer - Cleaning",
                    relationship_type=RelationshipType.AUTHENTICATION_CUSTOMER,
                    source_database="cleaning_db",
                    source_table="cleaning_customers",
                    target_database="shared_auth_service",
                    target_table="users",
                    result=TestResult.ERROR,
                    total_records=0,
                    valid_relationships=0,
                    invalid_relationships=0,
                    orphaned_records=0,
                    integrity_rate=0.0,
                    details="Failed to query cleaning customer relationships",
                    execution_time=0
                )

            row = cleaning_result.iloc[0]
            total_records = int(row['total_records'])
            valid_relationships = int(row['valid_relationships'])
            invalid_relationships = int(row['invalid_relationships'])
            integrity_rate = (valid_relationships / total_records * 100) if total_records > 0 else 0

            # Determine test result
            if invalid_relationships == 0:
                result = TestResult.PASSED
                details = "All cleaning customers have valid authentication references"
            elif invalid_relationships < 10:
                result = TestResult.WARNING
                details = f"Few cleaning customers ({invalid_relationships}) have invalid authentication references"
            else:
                result = TestResult.FAILED
                details = f"Many cleaning customers ({invalid_relationships}) have invalid authentication references"

            execution_time = (datetime.now() - start_time).total_seconds()

            return RelationshipTestResult(
                test_name="Authentication Customer - Cleaning",
                relationship_type=RelationshipType.AUTHENTICATION_CUSTOMER,
                source_database="cleaning_db",
                source_table="cleaning_customers",
                target_database="shared_auth_service",
                target_table="users",
                result=result,
                total_records=total_records,
                valid_relationships=valid_relationships,
                invalid_relationships=invalid_relationships,
                orphaned_records=int(row['orphaned_records']),
                integrity_rate=integrity_rate,
                details=details,
                execution_time=execution_time
            )

        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"Error in authentication customer test: {str(e)}")

            return RelationshipTestResult(
                test_name="Authentication Customer - Cleaning",
                relationship_type=RelationshipType.AUTHENTICATION_CUSTOMER,
                source_database="cleaning_db",
                source_table="cleaning_customers",
                target_database="shared_auth_service",
                target_table="users",
                result=TestResult.ERROR,
                total_records=0,
                valid_relationships=0,
                invalid_relationships=0,
                orphaned_records=0,
                integrity_rate=0.0,
                details=f"Test execution error: {str(e)}",
                execution_time=execution_time
            )

    def test_dual_service_consistency(self) -> RelationshipTestResult:
        """Test data consistency for dual-service customers"""
        logger.info("Testing dual-service customer consistency")
        start_time = datetime.now()

        try:
            consistency_query = """
            WITH dual_service_analysis AS (
                SELECT
                    dsc.customer_id,
                    cc.email as cleaning_email,
                    mc.email as maintenance_email,
                    cc.first_name as cleaning_first_name,
                    mc.first_name as maintenance_first_name,
                    cc.last_name as cleaning_last_name,
                    mc.last_name as maintenance_last_name,
                    cc.phone as cleaning_phone,
                    mc.phone as maintenance_phone,
                    CASE
                        WHEN cc.email != mc.email
                        OR cc.first_name != mc.first_name
                        OR cc.last_name != mc.last_name
                        OR cc.phone != mc.phone
                        THEN 1
                        ELSE 0
                    END as inconsistency_flag
                FROM dual_service_customers dsc
                JOIN cleaning_customers cc ON dsc.customer_id = cc.customer_id
                JOIN maintenance_customers mc ON dsc.customer_id = mc.customer_id
            ),
            consistency_summary AS (
                SELECT
                    COUNT(*) as total_dual_customers,
                    COUNT(*) FILTER (WHERE inconsistency_flag = 0) as consistent_customers,
                    COUNT(*) FILTER (WHERE inconsistency_flag = 1) as inconsistent_customers
                FROM dual_service_analysis
            )
            SELECT * FROM consistency_summary
            """

            result_df = self.execute_query('shared_auth', consistency_query)

            if result_df.empty:
                return RelationshipTestResult(
                    test_name="Dual Service Consistency",
                    relationship_type=RelationshipType.DUAL_SERVICE_CONSISTENCY,
                    source_database="cross_service",
                    source_table="dual_service_customers",
                    target_database="cleaning_maintenance",
                    target_table="customer_tables",
                    result=TestResult.ERROR,
                    total_records=0,
                    valid_relationships=0,
                    invalid_relationships=0,
                    orphaned_records=0,
                    integrity_rate=0.0,
                    details="Failed to query dual-service consistency",
                    execution_time=0
                )

            row = result_df.iloc[0]
            total_customers = int(row['total_dual_customers'])
            consistent_customers = int(row['consistent_customers'])
            inconsistent_customers = int(row['inconsistent_customers'])
            integrity_rate = (consistent_customers / total_customers * 100) if total_customers > 0 else 100

            # Determine test result
            if inconsistent_customers == 0:
                result = TestResult.PASSED
                details = "All dual-service customers have consistent data"
            elif inconsistent_customers < 5:
                result = TestResult.WARNING
                details = f"Few dual-service customers ({inconsistent_customers}) have inconsistent data"
            else:
                result = TestResult.FAILED
                details = f"Many dual-service customers ({inconsistent_customers}) have inconsistent data"

            execution_time = (datetime.now() - start_time).total_seconds()

            return RelationshipTestResult(
                test_name="Dual Service Consistency",
                relationship_type=RelationshipType.DUAL_SERVICE_CONSISTENCY,
                source_database="cross_service",
                source_table="dual_service_customers",
                target_database="cleaning_maintenance",
                target_table="customer_tables",
                result=result,
                total_records=total_customers,
                valid_relationships=consistent_customers,
                invalid_relationships=inconsistent_customers,
                orphaned_records=inconsistent_customers,
                integrity_rate=integrity_rate,
                details=details,
                execution_time=execution_time
            )

        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"Error in dual-service consistency test: {str(e)}")

            return RelationshipTestResult(
                test_name="Dual Service Consistency",
                relationship_type=RelationshipType.DUAL_SERVICE_CONSISTENCY,
                source_database="cross_service",
                source_table="dual_service_customers",
                target_database="cleaning_maintenance",
                target_table="customer_tables",
                result=TestResult.ERROR,
                total_records=0,
                valid_relationships=0,
                invalid_relationships=0,
                orphaned_records=0,
                integrity_rate=0.0,
                details=f"Test execution error: {str(e)}",
                execution_time=execution_time
            )

    def test_property_customer_relationship(self, service: str) -> RelationshipTestResult:
        """Test property to customer relationships for a specific service"""
        logger.info(f"Testing {service} property-customer relationships")
        start_time = datetime.now()

        try:
            table_prefix = "cleaning" if service == "cleaning" else "maintenance"

            relationship_query = f"""
            SELECT
                COUNT(*) as total_records,
                COUNT(*) FILTER (WHERE cc.customer_id IS NOT NULL) as valid_relationships,
                COUNT(*) FILTER (WHERE cc.customer_id IS NULL) as invalid_relationships,
                COUNT(*) FILTER (WHERE cc.customer_id IS NULL) as orphaned_records
            FROM {table_prefix}_properties cp
            LEFT JOIN {table_prefix}_customers cc ON cp.owner_id = cc.customer_id
            """

            result_df = self.execute_query(service, relationship_query)

            if result_df.empty:
                return RelationshipTestResult(
                    test_name=f"Property Customer - {service.title()}",
                    relationship_type=RelationshipType.PROPERTY_CUSTOMER,
                    source_database=f"{service}_db",
                    source_table=f"{table_prefix}_properties",
                    target_database=f"{service}_db",
                    target_table=f"{table_prefix}_customers",
                    result=TestResult.ERROR,
                    total_records=0,
                    valid_relationships=0,
                    invalid_relationships=0,
                    orphaned_records=0,
                    integrity_rate=0.0,
                    details=f"Failed to query {service} property relationships",
                    execution_time=0
                )

            row = result_df.iloc[0]
            total_records = int(row['total_records'])
            valid_relationships = int(row['valid_relationships'])
            invalid_relationships = int(row['invalid_relationships'])
            orphaned_records = int(row['orphaned_records'])
            integrity_rate = (valid_relationships / total_records * 100) if total_records > 0 else 0

            # Determine test result
            if orphaned_records == 0:
                result = TestResult.PASSED
                details = f"All {service} properties have valid customer owners"
            elif orphaned_records < 5:
                result = TestResult.WARNING
                details = f"Few {service} properties ({orphaned_records}) have missing customer references"
            else:
                result = TestResult.FAILED
                details = f"Many {service} properties ({orphaned_records}) have missing customer references"

            execution_time = (datetime.now() - start_time).total_seconds()

            return RelationshipTestResult(
                test_name=f"Property Customer - {service.title()}",
                relationship_type=RelationshipType.PROPERTY_CUSTOMER,
                source_database=f"{service}_db",
                source_table=f"{table_prefix}_properties",
                target_database=f"{service}_db",
                target_table=f"{table_prefix}_customers",
                result=result,
                total_records=total_records,
                valid_relationships=valid_relationships,
                invalid_relationships=invalid_relationships,
                orphaned_records=orphaned_records,
                integrity_rate=integrity_rate,
                details=details,
                execution_time=execution_time
            )

        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"Error in {service} property customer test: {str(e)}")

            return RelationshipTestResult(
                test_name=f"Property Customer - {service.title()}",
                relationship_type=RelationshipType.PROPERTY_CUSTOMER,
                source_database=f"{service}_db",
                source_table=f"{service}_properties",
                target_database=f"{service}_db",
                target_table=f"{service}_customers",
                result=TestResult.ERROR,
                total_records=0,
                valid_relationships=0,
                invalid_relationships=0,
                orphaned_records=0,
                integrity_rate=0.0,
                details=f"Test execution error: {str(e)}",
                execution_time=execution_time
            )

    def run_all_tests(self) -> List[RelationshipTestResult]:
        """Run all cross-service relationship tests"""
        logger.info("Starting comprehensive cross-service relationship testing")

        test_results = []

        # Authentication-Customer Relationships
        test_results.append(self.test_authentication_customer_relationship())

        # Dual-Service Consistency
        test_results.append(self.test_dual_service_consistency())

        # Property-Customer Relationships
        test_results.append(self.test_property_customer_relationship('cleaning'))
        test_results.append(self.test_property_customer_relationship('maintenance'))

        # Store results
        self.test_results = test_results

        logger.info(f"Completed {len(test_results)} cross-service relationship tests")
        return test_results

    def generate_test_report(self, output_dir: str = 'relationship_test_reports') -> str:
        """Generate comprehensive test report"""
        if not self.test_results:
            logger.warning("No test results available for report generation")
            return ""

        os.makedirs(output_dir, exist_ok=True)

        # Calculate summary statistics
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r.result == TestResult.PASSED])
        failed_tests = len([r for r in self.test_results if r.result == TestResult.FAILED])
        warning_tests = len([r for r in self.test_results if r.result == TestResult.WARNING])
        error_tests = len([r for r in self.test_results if r.result == TestResult.ERROR])

        total_execution_time = sum(r.execution_time for r in self.test_results)
        average_integrity_rate = sum(r.integrity_rate for r in self.test_results) / total_tests if total_tests > 0 else 0

        # Generate report data
        report_data = {
            'test_metadata': {
                'generated_at': datetime.now().isoformat(),
                'environment': self.environment,
                'framework_version': '1.0.0'
            },
            'test_summary': {
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': failed_tests,
                'warning_tests': warning_tests,
                'error_tests': error_tests,
                'success_rate': round((passed_tests / total_tests) * 100, 2) if total_tests > 0 else 0,
                'total_execution_time': round(total_execution_time, 2),
                'average_integrity_rate': round(average_integrity_rate, 2)
            },
            'test_results': [
                {
                    'test_name': result.test_name,
                    'relationship_type': result.relationship_type.value,
                    'source_database': result.source_database,
                    'source_table': result.source_table,
                    'target_database': result.target_database,
                    'target_table': result.target_table,
                    'result': result.result.value,
                    'total_records': result.total_records,
                    'valid_relationships': result.valid_relationships,
                    'invalid_relationships': result.invalid_relationships,
                    'orphaned_records': result.orphaned_records,
                    'integrity_rate': result.integrity_rate,
                    'details': result.details,
                    'execution_time': result.execution_time
                }
                for result in self.test_results
            ],
            'recommendations': self._generate_recommendations()
        }

        # Save report
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_filename = f"{output_dir}/cross_service_relationship_test_report_{self.environment}_{timestamp}.json"

        with open(report_filename, 'w') as f:
            json.dump(report_data, f, indent=2)

        logger.info(f"Test report saved to: {report_filename}")
        return report_filename

    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []

        failed_tests = [r for r in self.test_results if r.result in [TestResult.FAILED, TestResult.ERROR]]
        warning_tests = [r for r in self.test_results if r.result == TestResult.WARNING]

        if failed_tests:
            recommendations.append("CRITICAL: Address failed relationship tests immediately to prevent data integrity issues")
            for test in failed_tests:
                recommendations.append(f"  - {test.test_name}: {test.details}")

        if warning_tests:
            recommendations.append("WARNING: Review warning-level issues to prevent future problems")
            for test in warning_tests:
                recommendations.append(f"  - {test.test_name}: {test.details}")

        # General recommendations
        recommendations.extend([
            "Implement regular automated relationship testing in CI/CD pipeline",
            "Add foreign key constraints and validation triggers where missing",
            "Create synchronization processes for dual-service customer data",
            "Monitor relationship integrity metrics in production dashboards",
            "Establish data quality standards and validation procedures"
        ])

        return recommendations

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Cross-Service Relationship Testing Framework')
    parser.add_argument('environment', choices=['development', 'staging', 'production'],
                       default='development', help='Environment to test')
    parser.add_argument('--test-type', choices=['all', 'auth', 'dual-service', 'property'],
                       default='all', help='Type of test to run')
    parser.add_argument('--output-dir', default='relationship_test_reports',
                       help='Output directory for test reports')

    args = parser.parse_args()

    # Initialize tester
    tester = CrossServiceRelationshipTester(args.environment)

    # Run tests based on type
    if args.test_type == 'all':
        test_results = tester.run_all_tests()
    else:
        # Run specific test types
        test_results = []
        if args.test_type == 'auth':
            test_results.append(tester.test_authentication_customer_relationship())
        elif args.test_type == 'dual-service':
            test_results.append(tester.test_dual_service_consistency())
        elif args.test_type == 'property':
            test_results.append(tester.test_property_customer_relationship('cleaning'))
            test_results.append(tester.test_property_customer_relationship('maintenance'))

        tester.test_results = test_results

    # Generate report
    report_path = tester.generate_test_report(args.output_dir)

    # Display summary
    if tester.test_results:
        passed = len([r for r in tester.test_results if r.result == TestResult.PASSED])
        total = len(tester.test_results)
        print(f"\n=== Cross-Service Relationship Test Summary ===")
        print(f"Environment: {args.environment}")
        print(f"Tests Run: {total}")
        print(f"Passed: {passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print(f"Report: {report_path}")

        # Show failed tests
        failed_tests = [r for r in tester.test_results if r.result in [TestResult.FAILED, TestResult.ERROR]]
        if failed_tests:
            print(f"\n=== Failed Tests ===")
            for test in failed_tests:
                print(f"- {test.test_name}: {test.details}")

    return 0 if all(r.result in [TestResult.PASSED, TestResult.WARNING] for r in tester.test_results) else 1

if __name__ == "__main__":
    sys.exit(main())
```

### 4. Usage and Deployment Instructions

#### `deploy-relationship-testing.sh`

```bash
#!/bin/bash

# ================================================================
# Deploy Cross-Service Relationship Testing Framework
# ================================================================

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Deploy SQL validation functions
deploy_sql_validations() {
    log "Deploying SQL relationship validation functions..."

    # Deploy to shared authentication database
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d shared_auth_service -f GLM_DOCS/cross-service-relationship-testing.md; then
        log_success "SQL validation functions deployed successfully"
    else
        log_error "Failed to deploy SQL validation functions"
        return 1
    fi
}

# Setup Python testing framework
setup_python_framework() {
    log "Setting up Python relationship testing framework..."

    # Install Python dependencies
    pip3 install pandas sqlalchemy psycopg2-binary

    # Create testing script
    cat > test_cross_service_relationships.py << 'EOF'
#!/usr/bin/env python3

import sys
import os
sys.path.append('GLM_DOCS')

from relationship_testing_framework import CrossServiceRelationshipTester

def main():
    environment = sys.argv[1] if len(sys.argv) > 1 else 'development'

    tester = CrossServiceRelationshipTester(environment)
    results = tester.run_all_tests()
    report_path = tester.generate_test_report()

    print(f"Testing completed. Report: {report_path}")

if __name__ == "__main__":
    main()
EOF

    chmod +x test_cross_service_relationships.py
    log_success "Python testing framework setup completed"
}

# Create scheduled testing
create_scheduled_tests() {
    log "Creating scheduled cross-service relationship tests..."

    cat > schedule_relationship_tests.sh << 'EOF'
#!/bin/bash

# Scheduled Cross-Service Relationship Testing

ENVIRONMENT=${1:-production}
LOG_FILE="/var/log/rightfit-relationship-tests.log"

log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_with_timestamp "Starting scheduled cross-service relationship tests"

# Run Python testing framework
if python3 test_cross_service_relationships.py "$ENVIRONMENT" >> "$LOG_FILE" 2>&1; then
    log_with_timestamp "Relationship tests completed successfully"
else
    log_with_timestamp "Relationship tests failed - check logs for details"
fi

# Run SQL validation functions
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d shared_auth_service -c "SELECT * FROM validate_cross_service_relationships();" >> "$LOG_FILE" 2>&1; then
    log_with_timestamp "SQL relationship validation completed successfully"
else
    log_with_timestamp "SQL relationship validation failed"
fi

log_with_timestamp "Scheduled relationship testing completed"
EOF

    chmod +x schedule_relationship_tests.sh
    log_success "Scheduled testing script created"

    log_warning "Add to crontab for automated testing:"
    echo "0 */6 * * * /path/to/rightfit-services/schedule_relationship_tests.sh production"
}

# Main deployment
main() {
    log "Deploying Cross-Service Relationship Testing Framework..."
    echo ""

    if [ -z "${DB_HOST:-}" ] || [ -z "${DB_USER:-}" ]; then
        log_error "Database configuration required. Set DB_HOST and DB_USER environment variables."
        exit 1
    fi

    deploy_sql_validations
    echo ""

    setup_python_framework
    echo ""

    create_scheduled_tests
    echo ""

    log_success "Cross-Service Relationship Testing Framework deployment completed!"
    echo ""
    echo "Usage examples:"
    echo "  python3 test_cross_service_relationships.py development"
    echo "  python3 test_cross_service_relationships.py staging"
    echo "  python3 test_cross_service_relationships.py production"
    echo ""
    echo "SQL validation:"
    echo "  psql -h \$DB_HOST -U \$DB_USER -d shared_auth_service -c \"SELECT * FROM validate_cross_service_relationships();\""
}

main "$@"
```

This comprehensive cross-service relationship testing framework provides:

1. **SQL-based validation functions** for database-level relationship integrity checks
2. **Python testing framework** for automated cross-service relationship validation
3. **Impact analysis tools** for understanding the consequences of data changes
4. **Automated scheduling** for continuous relationship monitoring

The framework ensures that all cross-service data relationships remain valid and consistent throughout the RightFit Services database separation process and in ongoing operations.
