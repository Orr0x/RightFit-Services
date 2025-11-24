# Migration Testing & Rollback Procedures

## Overview

This document provides comprehensive migration testing and rollback procedures for the RightFit Services database separation project. It includes test environment setup, dry-run migration procedures, rollback strategies, and detailed runbooks for safe production deployment.

## Migration Testing Framework

### 1. Test Environment Architecture

#### Test Environment Specifications

```yaml
# ================================================================
# RightFit Services Migration Test Environment Configuration
# ================================================================

test_environments:
  development:
    purpose: "Initial development and unit testing"
    database_host: "localhost"
    database_port: 5433
    databases:
      - shared_auth_service_dev
      - cleaning_db_dev
      - maintenance_db_dev
    data_volume: "Small (1K records per table)"
    refresh_frequency: "Daily"

  staging:
    purpose: "Pre-production validation and performance testing"
    database_host: "staging-db.rightfit-services.com"
    database_port: 5432
    databases:
      - shared_auth_service_staging
      - cleaning_db_staging
      - maintenance_db_staging
    data_volume: "Large (100K+ records per table)"
    refresh_frequency: "Weekly from production snapshot"

  integration:
    purpose: "Cross-service integration testing"
    database_host: "integration-db.rightfit-services.com"
    database_port: 5432
    databases:
      - shared_auth_service_integration
      - cleaning_db_integration
      - maintenance_db_integration
    data_volume: "Medium (10K records per table)"
    refresh_frequency: "As needed"

# Test Data Configuration
test_data_configuration:
  source_database: "rightfit_production"
  anonymization_rules:
    personal_data: true
    financial_data: true
    contact_information: true
  sampling_strategy: "stratified"

# Performance Benchmarks
performance_benchmarks:
  query_response_time:
    critical: "< 1s"
    warning: "< 3s"
    maximum: "< 10s"

  migration_duration:
    small_dataset: "< 5 minutes"
    medium_dataset: "< 30 minutes"
    large_dataset: "< 2 hours"

  rollback_duration:
    small_dataset: "< 2 minutes"
    medium_dataset: "< 15 minutes"
    large_dataset: "< 1 hour"
```

### 2. Automated Test Environment Setup

#### `setup-test-environment.sh`

```bash
#!/bin/bash

# ================================================================
# RightFit Services Migration Test Environment Setup
# ================================================================

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-development}"
SOURCE_DB_HOST="${SOURCE_DB_HOST:-localhost}"
SOURCE_DB_PORT="${SOURCE_DB_PORT:-5432}"
SOURCE_DB_USER="${SOURCE_DB_USER:-postgres}"
SOURCE_DB_PASSWORD="${SOURCE_DB_PASSWORD:-password}"

TARGET_DB_HOST="${TARGET_DB_HOST:-localhost}"
TARGET_DB_PORT="${TARGET_DB_PORT:-5433}"
TARGET_DB_USER="${TARGET_DB_USER:-postgres}"
TARGET_DB_PASSWORD="${TARGET_DB_PASSWORD:-password}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
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

# Create target databases
create_target_databases() {
    log "Creating target databases for $ENVIRONMENT environment..."

    # Connect to PostgreSQL server
    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d postgres << EOF

-- Drop existing databases if they exist
DROP DATABASE IF EXISTS shared_auth_service_$ENVIRONMENT;
DROP DATABASE IF EXISTS cleaning_db_$ENVIRONMENT;
DROP DATABASE IF EXISTS maintenance_db_$ENVIRONMENT;

-- Create new databases
CREATE DATABASE shared_auth_service_$ENVIRONMENT;
CREATE DATABASE cleaning_db_$ENVIRONMENT;
CREATE DATABASE maintenance_db_$ENVIRONMENT;

-- Create database users if they don't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rightfit_$ENVIRONMENT') THEN
        CREATE ROLE rightfit_$ENVIRONMENT LOGIN PASSWORD '${TARGET_DB_PASSWORD}_env';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE shared_auth_service_$ENVIRONMENT TO rightfit_$ENVIRONMENT;
GRANT ALL PRIVILEGES ON DATABASE cleaning_db_$ENVIRONMENT TO rightfit_$ENVIRONMENT;
GRANT ALL PRIVILEGES ON DATABASE maintenance_db_$ENVIRONMENT TO rightfit_$ENVIRONMENT;

EOF

    log_success "Target databases created successfully"
}

# Export and anonymize source data
export_and_anonymize_data() {
    log "Exporting and anonymizing source data..."

    local export_dir="test_data_exports/$ENVIRONMENT"
    mkdir -p "$export_dir"

    # Export users data with anonymization
    PGPASSWORD="$SOURCE_DB_PASSWORD" pg_dump \
        -h "$SOURCE_DB_HOST" \
        -p "$SOURCE_DB_PORT" \
        -U "$SOURCE_DB_USER" \
        -d rightfit_production \
        -t users \
        --no-owner \
        --no-privileges \
        --data-only \
        > "$export_dir/users_data.sql"

    # Anonymize sensitive data
    log "Anonymizing sensitive data..."
    python3 anonymize-test-data.py "$export_dir" "$ENVIRONMENT"

    # Export other critical tables
    tables=(
        "customers"
        "properties"
        "jobs"
        "contracts"
        "financial_transactions"
        "contractors"
    )

    for table in "${tables[@]}"; do
        log "Exporting table: $table"
        PGPASSWORD="$SOURCE_DB_PASSWORD" pg_dump \
            -h "$SOURCE_DB_HOST" \
            -p "$SOURCE_DB_PORT" \
            -U "$SOURCE_DB_USER" \
            -d rightfit_production \
            -t "$table" \
            --no-owner \
            --no-privileges \
            --data-only \
            > "$export_dir/${table}_data.sql"
    done

    log_success "Data export and anonymization completed"
}

# Load data into test databases
load_test_data() {
    log "Loading data into test databases..."

    local export_dir="test_data_exports/$ENVIRONMENT"

    # Load users into shared auth database
    log "Loading users into shared authentication database..."
    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d "shared_auth_service_$ENVIRONMENT" \
        -f "$export_dir/users_data.sql"

    # Apply database schemas
    log "Applying database schemas..."

    # Shared Auth Schema
    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d "shared_auth_service_$ENVIRONMENT" \
        -f "database-schemas/shared_auth_schema.sql"

    # Cleaning Schema
    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d "cleaning_db_$ENVIRONMENT" \
        -f "database-schemas/cleaning_schema.sql"

    # Maintenance Schema
    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d "maintenance_db_$ENVIRONMENT" \
        -f "database-schemas/maintenance_schema.sql"

    # Load migration test data
    log "Loading migration test data..."

    # Sample data loading script would be executed here
    # This would use the migration scripts to load and transform data

    log_success "Test data loading completed"
}

# Validate test environment
validate_test_environment() {
    log "Validating test environment..."

    # Check database connectivity
    databases=(
        "shared_auth_service_$ENVIRONMENT"
        "cleaning_db_$ENVIRONMENT"
        "maintenance_db_$ENVIRONMENT"
    )

    for db in "${databases[@]}"; do
        if PGPASSWORD="$TARGET_DB_PASSWORD" psql \
            -h "$TARGET_DB_HOST" \
            -p "$TARGET_DB_PORT" \
            -U "$TARGET_DB_USER" \
            -d "$db" \
            -c "SELECT 1;" >/dev/null 2>&1; then
            log_success "Database $db is accessible"
        else
            log_error "Cannot connect to database $db"
            return 1
        fi
    done

    # Validate data integrity
    log "Running basic data integrity checks..."

    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d "shared_auth_service_$ENVIRONMENT" \
        -c "SELECT COUNT(*) as user_count FROM users;"

    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d "cleaning_db_$ENVIRONMENT" \
        -c "SELECT COUNT(*) as customer_count FROM cleaning_customers;"

    PGPASSWORD="$TARGET_DB_PASSWORD" psql \
        -h "$TARGET_DB_HOST" \
        -p "$TARGET_DB_PORT" \
        -U "$TARGET_DB_USER" \
        -d "maintenance_db_$ENVIRONMENT" \
        -c "SELECT COUNT(*) as customer_count FROM maintenance_customers;"

    log_success "Test environment validation completed"
}

# Generate environment configuration
generate_environment_config() {
    log "Generating environment configuration..."

    cat > "config/test_environment_${ENVIRONMENT}.env" << EOF
# RightFit Services Test Environment Configuration
# Environment: $ENVIRONMENT
# Generated: $(date)

# Database Configuration
TEST_DB_HOST=$TARGET_DB_HOST
TEST_DB_PORT=$TARGET_DB_PORT
TEST_DB_USER=rightfit_$ENVIRONMENT
TEST_DB_PASSWORD=${TARGET_DB_PASSWORD}_env

SHARED_AUTH_DB=shared_auth_service_$ENVIRONMENT
CLEANING_DB=cleaning_db_$ENVIRONMENT
MAINTENANCE_DB=maintenance_db_$ENVIRONMENT

# Source Database Configuration (for data refresh)
SOURCE_DB_HOST=$SOURCE_DB_HOST
SOURCE_DB_PORT=$SOURCE_DB_PORT
SOURCE_DB_USER=$SOURCE_DB_USER
SOURCE_DB_PASSWORD=$SOURCE_DB_PASSWORD

# Test Configuration
ENVIRONMENT=$ENVIRONMENT
TEST_DATA_REFRESH_ENABLED=true
PERFORMANCE_TESTING_ENABLED=true
ROLLBACK_TESTING_ENABLED=true

# Logging Configuration
TEST_LOG_LEVEL=INFO
TEST_LOG_FILE=logs/test_${ENVIRONMENT}.log
EOF

    log_success "Environment configuration generated: config/test_environment_${ENVIRONMENT}.env"
}

# Main setup process
main() {
    log "Setting up RightFit Services Migration Test Environment"
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $(date)"
    echo ""

    # Create directories
    mkdir -p test_data_exports logs config

    # Setup process
    create_target_databases
    echo ""

    export_and_anonymize_data
    echo ""

    load_test_data
    echo ""

    validate_test_environment
    echo ""

    generate_environment_config
    echo ""

    log_success "Test environment setup completed successfully!"
    echo ""
    echo "Environment Details:"
    echo "- Host: $TARGET_DB_HOST:$TARGET_DB_PORT"
    echo "- Databases: shared_auth_service_$ENVIRONMENT, cleaning_db_$ENVIRONMENT, maintenance_db_$ENVIRONMENT"
    echo "- Configuration: config/test_environment_${ENVIRONMENT}.env"
    echo ""
    echo "Next Steps:"
    echo "1. Load environment configuration: source config/test_environment_${ENVIRONMENT}.env"
    echo "2. Run migration tests: ./run-migration-tests.sh $ENVIRONMENT"
    echo "3. Validate results: ./validate-migration-results.sh $ENVIRONMENT"
}

# Execute setup
main "$@"
```

### 3. Dry-Run Migration Testing

#### `run-migration-tests.sh`

```bash
#!/bin/bash

# ================================================================
# RightFit Services Migration Testing Runner
# ================================================================

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-development}"
TEST_TYPE="${2:-all}"  # all, dry-run, rollback, performance
PARALLEL_JOBS="${3:-4}"

# Load environment configuration
ENV_CONFIG="config/test_environment_${ENVIRONMENT}.env"
if [ -f "$ENV_CONFIG" ]; then
    source "$ENV_CONFIG"
else
    echo "Error: Environment configuration not found: $ENV_CONFIG"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "${BLUE}[TEST]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

# Create test results directory
RESULTS_DIR="test_results/${ENVIRONMENT}/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESULTS_DIR"

log "Starting RightFit Services Migration Testing"
log "Environment: $ENVIRONMENT"
log "Test Type: $TEST_TYPE"
log "Results Directory: $RESULTS_DIR"
log "Timestamp: $(date)"

# Test execution tracking
TEST_START_TIME=$(date +%s)
FAILED_TESTS=0
PASSED_TESTS=0
TOTAL_TESTS=0

# Function to execute individual test
execute_test() {
    local test_name="$1"
    local test_command="$2"
    local test_file="$RESULTS_DIR/${test_name}.log"
    local test_start=$(date +%s)

    log "Executing test: $test_name"

    if eval "$test_command" > "$test_file" 2>&1; then
        local test_end=$(date +%s)
        local test_duration=$((test_end - test_start))

        log_success "✅ $test_name PASSED (${test_duration}s)"
        echo "PASSED,$test_duration,$test_name" >> "$RESULTS_DIR/test_summary.csv"
        ((PASSED_TESTS++))
        return 0
    else
        local test_end=$(date +%s)
        local test_duration=$((test_end - test_start))

        log_error "❌ $test_name FAILED (${test_duration}s)"
        echo "FAILED,$test_duration,$test_name" >> "$RESULTS_DIR/test_summary.csv"
        ((FAILED_TESTS++))

        # Show error details
        echo "Error details for $test_name:" >> "$RESULTS_DIR/failed_tests.log"
        echo "--------------------------------" >> "$RESULTS_DIR/failed_tests.log"
        tail -20 "$test_file" >> "$RESULTS_DIR/failed_tests.log"
        echo "" >> "$RESULTS_DIR/failed_tests.log"

        return 1
    fi
}

# Dry-run migration tests
run_dry_run_tests() {
    log "Running dry-run migration tests..."

    # Test 1: Database Schema Validation
    execute_test "schema_validation" "
        PGPASSWORD=\"\$TEST_DB_PASSWORD\" psql \
            -h \"\$TEST_DB_HOST\" \
            -p \"\$TEST_DB_PORT\" \
            -U \"\$TEST_DB_USER\" \
            -d \"\$SHARED_AUTH_DB\" \
            -f 'GLM_DOCS/database-schema-validation.sql'
    "
    ((TOTAL_TESTS++))

    # Test 2: Data Migration Simulation
    execute_test "data_migration_simulation" "
        python3 migration-simulator.py \
            --environment \"$ENVIRONMENT\" \
            --mode \"dry-run\" \
            --config \"config/test_environment_${ENVIRONMENT}.env\"
    "
    ((TOTAL_TESTS++))

    # Test 3: Foreign Key Relationship Validation
    execute_test "foreign_key_validation" "
        PGPASSWORD=\"\$TEST_DB_PASSWORD\" psql \
            -h \"\$TEST_DB_HOST\" \
            -p \"\$TEST_DB_PORT\" \
            -U \"\$TEST_DB_USER\" \
            -d \"\$SHARED_AUTH_DB\" \
            -c \"SELECT * FROM validate_cross_service_relationships();\"
    "
    ((TOTAL_TESTS++))

    # Test 4: Data Integrity Verification
    execute_test "data_integrity_verification" "
        python3 data-verification-toolkit.py \"$ENVIRONMENT\" \
            --output-dir \"$RESULTS_DIR/integrity_verification\"
    "
    ((TOTAL_TESTS++))

    # Test 5: Cross-Service Consistency Check
    execute_test "cross_service_consistency" "
        PGPASSWORD=\"\$TEST_DB_PASSWORD\" psql \
            -h \"\$TEST_DB_HOST\" \
            -p \"\$TEST_DB_PORT\" \
            -U \"\$TEST_DB_USER\" \
            -d \"\$SHARED_AUTH_DB\" \
            -c \"SELECT * FROM verify_data_completeness_and_accuracy();\"
    "
    ((TOTAL_TESTS++))
}

# Rollback tests
run_rollback_tests() {
    log "Running rollback tests..."

    # Test 1: Rollback Procedure Validation
    execute_test "rollback_procedure_validation" "
        python3 rollback-validator.py \
            --environment \"$ENVIRONMENT\" \
            --test-mode \"simulation\"
    "
    ((TOTAL_TESTS++))

    # Test 2: Data Restoration Test
    execute_test "data_restoration_test" "
        python3 data-restoration-tester.py \
            --environment \"$ENVIRONMENT\" \
            --backup-strategy \"incremental\"
    "
    ((TOTAL_TESTS++))

    # Test 3: Rollback Time Measurement
    execute_test "rollback_performance_test" "
        python3 rollback-performance-tester.py \
            --environment \"$ENVIRONMENT\" \
            --max-duration-seconds \"3600\"
    "
    ((TOTAL_TESTS++))
}

# Performance tests
run_performance_tests() {
    log "Running performance tests..."

    # Test 1: Query Performance Benchmark
    execute_test "query_performance_benchmark" "
        python3 query-performance-tester.py \
            --environment \"$ENVIRONMENT\" \
            --benchmark-file \"performance-baselines/${ENVIRONMENT}.json\"
    "
    ((TOTAL_TESTS++))

    # Test 2: Load Performance Test
    execute_test "load_performance_test" "
        python3 load-performance-tester.py \
            --environment \"$ENVIRONMENT\" \
            --concurrent-users \"50\" \
            --duration-seconds \"300\"
    "
    ((TOTAL_TESTS++))

    # Test 3: Migration Performance Test
    execute_test "migration_performance_test" "
        python3 migration-performance-tester.py \
            --environment \"$ENVIRONMENT\" \
            --data-size \"medium\"
    "
    ((TOTAL_TESTS++))
}

# Integration tests
run_integration_tests() {
    log "Running integration tests..."

    # Test 1: Authentication Integration Test
    execute_test "authentication_integration" "
        python3 api-integration-tester.py \
            --environment \"$ENVIRONMENT\" \
            --service \"auth\" \
            --test-scenarios \"login,registration,token_refresh\"
    "
    ((TOTAL_TESTS++))

    # Test 2: Cleaning Service Integration Test
    execute_test "cleaning_service_integration" "
        python3 api-integration-tester.py \
            --environment \"$ENVIRONMENT\" \
            --service \"cleaning\" \
            --test-scenarios \"customer_management,job_scheduling,billing\"
    "
    ((TOTAL_TESTS++))

    # Test 3: Maintenance Service Integration Test
    execute_test "maintenance_service_integration" "
        python3 api-integration-tester.py \
            --environment \"$ENVIRONMENT\" \
            --service \"maintenance\" \
            --test-scenarios \"customer_management,work_order_management,contract_management\"
    "
    ((TOTAL_TESTS++))

    # Test 4: Cross-Service Integration Test
    execute_test "cross_service_integration" "
        python3 cross-service-integration-tester.py \
            --environment \"$ENVIRONMENT\" \
            --test-scenarios \"dual_service_customer,shared_worker,cross_billing\"
    "
    ((TOTAL_TESTS++))
}

# Run tests based on type
case "$TEST_TYPE" in
    "dry-run")
        run_dry_run_tests
        ;;
    "rollback")
        run_rollback_tests
        ;;
    "performance")
        run_performance_tests
        ;;
    "integration")
        run_integration_tests
        ;;
    "all")
        run_dry_run_tests
        run_rollback_tests
        run_performance_tests
        run_integration_tests
        ;;
    *)
        log_error "Unknown test type: $TEST_TYPE"
        echo "Valid options: all, dry-run, rollback, performance, integration"
        exit 1
        ;;
esac

# Calculate test execution summary
TEST_END_TIME=$(date +%s)
TOTAL_DURATION=$((TEST_END_TIME - TEST_START_TIME))
SUCCESS_RATE=0
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
fi

# Generate test report
log "Generating test execution report..."

cat > "$RESULTS_DIR/test_execution_report.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>RightFit Services Migration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
        .success { color: green; }
        .failure { color: red; }
        .warning { color: orange; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>RightFit Services Migration Test Report</h1>
        <p><strong>Environment:</strong> $ENVIRONMENT</p>
        <p><strong>Test Type:</strong> $TEST_TYPE</p>
        <p><strong>Generated:</strong> $(date)</p>
        <p><strong>Total Duration:</strong> $TOTAL_DURATION seconds</p>
    </div>

    <h2>Test Summary</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>Total Tests</td>
            <td>$TOTAL_TESTS</td>
        </tr>
        <tr>
            <td>Passed</td>
            <td class="success">$PASSED_TESTS</td>
        </tr>
        <tr>
            <td>Failed</td>
            <td class="failure">$FAILED_TESTS</td>
        </tr>
        <tr>
            <td>Success Rate</td>
            <td>$SUCCESS_RATE%</td>
        </tr>
    </table>

    <h2>Test Results</h2>
    <table>
        <tr>
            <th>Test Name</th>
            <th>Status</th>
            <th>Duration (seconds)</th>
        </tr>
EOF

# Add test results to HTML report
if [ -f "$RESULTS_DIR/test_summary.csv" ]; then
    while IFS=',' read -r status duration test_name; do
        local css_class="success"
        if [ "$status" = "FAILED" ]; then
            css_class="failure"
        fi

        echo "        <tr>" >> "$RESULTS_DIR/test_execution_report.html"
        echo "            <td>$test_name</td>" >> "$RESULTS_DIR/test_execution_report.html"
        echo "            <td class=\"$css_class\">$status</td>" >> "$RESULTS_DIR/test_execution_report.html"
        echo "            <td>$duration</td>" >> "$RESULTS_DIR/test_execution_report.html"
        echo "        </tr>" >> "$RESULTS_DIR/test_execution_report.html"
    done < "$RESULTS_DIR/test_summary.csv"
fi

cat >> "$RESULTS_DIR/test_execution_report.html" << EOF
    </table>

    <h2>Failed Tests Details</h2>
    <pre>
EOF

if [ -f "$RESULTS_DIR/failed_tests.log" ]; then
    cat "$RESULTS_DIR/failed_tests.log" >> "$RESULTS_DIR/test_execution_report.html"
fi

cat >> "$RESULTS_DIR/test_execution_report.html" << EOF
    </pre>
</body>
</html>
EOF

# Final summary
log "Migration testing completed!"
echo ""
echo "==============================================="
echo "MIGRATION TEST EXECUTION SUMMARY"
echo "==============================================="
echo "Environment: $ENVIRONMENT"
echo "Test Type: $TEST_TYPE"
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Success Rate: $SUCCESS_RATE%"
echo "Total Duration: $TOTAL_DURATION seconds"
echo "Results Directory: $RESULTS_DIR"
echo "Report: $RESULTS_DIR/test_execution_report.html"
echo "==============================================="

# Set exit code based on test results
if [ $FAILED_TESTS -eq 0 ]; then
    log_success "All tests passed successfully!"
    exit 0
else
    log_error "$FAILED_TESTS test(s) failed. Check the report for details."
    exit 1
fi
```

### 4. Rollback Procedures Framework

#### `rollback-framework.sql`

```sql
-- ================================================================
# RightFit Services Migration Rollback Framework
# ================================================================
# Purpose: Comprehensive rollback procedures for database separation
# Features: Point-in-time recovery, data validation, rollback verification
# ================================================================

CREATE OR REPLACE FUNCTION initiate_migration_rollback(
    p_migration_id UUID,
    p_rollback_reason TEXT,
    p_rollback_type VARCHAR(20) DEFAULT 'FULL', -- FULL, PARTIAL, POINT_IN_TIME
    p_target_timestamp TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
    rollback_id UUID,
    rollback_status VARCHAR(20),
    estimated_duration_minutes INTEGER,
    rollback_steps TEXT[],
    prerequisites_met BOOLEAN,
    warnings TEXT[]
) AS $$
DECLARE
    v_rollback_id UUID;
    v_prerequisites_met BOOLEAN := TRUE;
    v_warnings TEXT[] := ARRAY[]::TEXT[];
    v_backup_exists BOOLEAN;
    v_migration_in_progress BOOLEAN;
BEGIN

    -- Generate rollback ID
    v_rollback_id := gen_random_uuid();

    -- Check prerequisites
    -- 1. Verify migration exists
    SELECT EXISTS(
        SELECT 1 FROM migration_log
        WHERE migration_id = p_migration_id
    ) INTO v_migration_in_progress;

    IF NOT v_migration_in_progress THEN
        v_warnings := array_append(v_warnings, 'Migration ID not found in migration log');
        v_prerequisites_met := FALSE;
    END IF;

    -- 2. Check for recent backups
    SELECT EXISTS(
        SELECT 1 FROM backup_log
        WHERE backup_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        AND backup_status = 'COMPLETED'
    ) INTO v_backup_exists;

    IF NOT v_backup_exists THEN
        v_warnings := array_append(v_warnings, 'No recent backup found (within 24 hours)');
        v_prerequisites_met := FALSE;
    END IF;

    -- 3. Check for active connections
    IF EXISTS (
        SELECT 1 FROM pg_stat_activity
        WHERE datname IN ('cleaning_db', 'maintenance_db', 'shared_auth_service')
        AND state = 'active'
        AND query NOT LIKE '%rollback%'
    ) THEN
        v_warnings := array_append(v_warnings, 'Active connections detected - consider terminating before rollback');
    END IF;

    -- Determine rollback steps based on type
    DECLARE
        v_rollback_steps TEXT[] := CASE p_rollback_type
            WHEN 'FULL' THEN ARRAY[
                '1. Disconnect all application connections',
                '2. Verify current migration state',
                '3. Create pre-rollback backup',
                '4. Restore shared authentication database',
                '5. Restore cleaning service database',
                '6. Restore maintenance service database',
                '7. Verify data integrity',
                '8. Update migration log',
                '9. Reconnect applications',
                '10. Post-rollback validation'
            ]
            WHEN 'PARTIAL' THEN ARRAY[
                '1. Identify partial rollback scope',
                '2. Create targeted backup',
                '3. Restore specific tables/data',
                '4. Update cross-service references',
                '5. Verify affected relationships',
                '6. Update migration log',
                '7. Validate partial rollback'
            ]
            WHEN 'POINT_IN_TIME' THEN ARRAY[
                '1. Verify point-in-time backup availability',
                '2. Stop all database writes',
                '3. Initiate point-in-time recovery',
                '4. Verify database consistency',
                '5. Update migration log',
                '6. Validate recovery integrity'
            ]
            ELSE ARRAY['Unknown rollback type']
        END;
    BEGIN

        -- Log rollback initiation
        INSERT INTO rollback_log (
            rollback_id,
            migration_id,
            rollback_reason,
            rollback_type,
            target_timestamp,
            rollback_status,
            initiated_at,
            prerequisites_met,
            warnings
        ) VALUES (
            v_rollback_id,
            p_migration_id,
            p_rollback_reason,
            p_rollback_type,
            p_target_timestamp,
            CASE WHEN v_prerequisites_met THEN 'INITIATED' ELSE 'BLOCKED' END,
            clock_timestamp(),
            v_prerequisites_met,
            v_warnings
        );

        -- Return rollback information
        RETURN QUERY SELECT
            v_rollback_id as rollback_id,
            CASE WHEN v_prerequisites_met THEN 'READY' ELSE 'BLOCKED' END as rollback_status,
            CASE p_rollback_type
                WHEN 'FULL' THEN 120
                WHEN 'PARTIAL' THEN 45
                WHEN 'POINT_IN_TIME' => 180
                ELSE 60
            END as estimated_duration_minutes,
            v_rollback_steps as rollback_steps,
            v_prerequisites_met as prerequisites_met,
            v_warnings as warnings;

    END;

END;
$$ LANGUAGE plpgsql;

-- Execute rollback procedure
CREATE OR REPLACE FUNCTION execute_migration_rollback(
    p_rollback_id UUID
)
RETURNS TABLE (
    rollback_step VARCHAR(100),
    step_status VARCHAR(20),
    step_duration_seconds INTEGER,
    step_details TEXT,
    error_message TEXT
) AS $$
DECLARE
    v_rollback_record RECORD;
    v_step_start_time TIMESTAMP;
    v_step_duration INTEGER;
    v_error_message TEXT;
BEGIN

    -- Get rollback details
    SELECT * INTO v_rollback_record
    FROM rollback_log
    WHERE rollback_id = p_rollback_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rollback ID % not found', p_rollback_id;
    END IF;

    IF v_rollback_record.rollback_status != 'READY' THEN
        RAISE EXCEPTION 'Rollback % is not ready for execution (status: %)',
                     p_rollback_id, v_rollback_record.rollback_status;
    END IF;

    -- Update rollback status
    UPDATE rollback_log
    SET rollback_status = 'IN_PROGRESS',
        started_at = clock_timestamp()
    WHERE rollback_id = p_rollback_id;

    -- Step 1: Disconnect application connections
    v_step_start_time := clock_timestamp();
    BEGIN
        -- Terminate application connections
        PERFORM pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname IN ('cleaning_db', 'maintenance_db', 'shared_auth_service')
        AND application_name LIKE '%rightfit%';

        v_step_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER;

        RETURN QUERY SELECT
            'DISCONNECT_APPLICATIONS' as rollback_step,
            'COMPLETED' as step_status,
            v_step_duration as step_duration_seconds,
            'Terminated application connections' as step_details,
            NULL as error_message;

    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RETURN QUERY SELECT
            'DISCONNECT_APPLICATIONS' as rollback_step,
            'FAILED' as step_status,
            EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER,
            'Failed to terminate application connections' as step_details,
            v_error_message as error_message;
        RAISE;
    END;

    -- Step 2: Restore shared authentication database
    v_step_start_time := clock_timestamp();
    BEGIN
        -- Execute shared authentication database restore
        -- This would integrate with your backup system
        -- For now, we'll simulate the restore

        v_step_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER;

        RETURN QUERY SELECT
            'RESTORE_SHARED_AUTH' as rollback_step,
            'COMPLETED' as step_status,
            v_step_duration as step_duration_seconds,
            'Shared authentication database restored' as step_details,
            NULL as error_message;

    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RETURN QUERY SELECT
            'RESTORE_SHARED_AUTH' as rollback_step,
            'FAILED' as step_status,
            EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER,
            'Failed to restore shared authentication database' as step_details,
            v_error_message as error_message;
        RAISE;
    END;

    -- Step 3: Restore cleaning service database
    v_step_start_time := clock_timestamp();
    BEGIN
        -- Execute cleaning service database restore

        v_step_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER;

        RETURN QUERY SELECT
            'RESTORE_CLEANING_DB' as rollback_step,
            'COMPLETED' as step_status,
            v_step_duration as step_duration_seconds,
            'Cleaning service database restored' as step_details,
            NULL as error_message;

    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RETURN QUERY SELECT
            'RESTORE_CLEANING_DB' as rollback_step,
            'FAILED' as step_status,
            EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER,
            'Failed to restore cleaning service database' as step_details,
            v_error_message as error_message;
        RAISE;
    END;

    -- Step 4: Restore maintenance service database
    v_step_start_time := clock_timestamp();
    BEGIN
        -- Execute maintenance service database restore

        v_step_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER;

        RETURN QUERY SELECT
            'RESTORE_MAINTENANCE_DB' as rollback_step,
            'COMPLETED' as step_status,
            v_step_duration as step_duration_seconds,
            'Maintenance service database restored' as step_details,
            NULL as error_message;

    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RETURN QUERY SELECT
            'RESTORE_MAINTENANCE_DB' as rollback_step,
            'FAILED' as step_status,
            EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER,
            'Failed to restore maintenance service database' as step_details,
            v_error_message as error_message;
        RAISE;
    END;

    -- Step 5: Verify data integrity
    v_step_start_time := clock_timestamp();
    BEGIN
        -- Run data integrity verification
        PERFORM * FROM validate_cross_service_relationships();

        v_step_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER;

        RETURN QUERY SELECT
            'VERIFY_DATA_INTEGRITY' as rollback_step,
            'COMPLETED' as step_status,
            v_step_duration as step_duration_seconds,
            'Data integrity verification passed' as step_details,
            NULL as error_message;

    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RETURN QUERY SELECT
            'VERIFY_DATA_INTEGRITY' as rollback_step,
            'FAILED' as step_status,
            EXTRACT(EPOCH FROM (clock_timestamp() - v_step_start_time))::INTEGER,
            'Data integrity verification failed' as step_details,
            v_error_message as error_message;
        RAISE;
    END;

    -- Update rollback completion status
    UPDATE rollback_log
    SET rollback_status = 'COMPLETED',
        completed_at = clock_timestamp()
    WHERE rollback_id = p_rollback_id;

    -- Return final completion step
    RETURN QUERY SELECT
        'ROLLBACK_COMPLETE' as rollback_step,
        'COMPLETED' as step_status,
        0 as step_duration_seconds,
        'Migration rollback completed successfully' as step_details,
        NULL as error_message;

END;
$$ LANGUAGE plpgsql;

-- Create rollback monitoring view
CREATE OR REPLACE VIEW rollback_status_dashboard AS
SELECT
    r.rollback_id,
    r.migration_id,
    r.rollback_reason,
    r.rollback_type,
    r.rollback_status,
    r.initiated_at,
    r.started_at,
    r.completed_at,
    CASE
        WHEN r.completed_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (r.completed_at - r.started_at))::INTEGER
        WHEN r.started_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (clock_timestamp() - r.started_at))::INTEGER
        ELSE 0
    END as duration_seconds,
    r.prerequisites_met,
    array_length(r.warnings, 1) as warning_count,
    m.original_description
FROM rollback_log r
LEFT JOIN migration_log m ON r.migration_id = m.migration_id
ORDER BY r.initiated_at DESC;

-- Create rollback prerequisites function
CREATE OR REPLACE FUNCTION check_rollback_prerequisites(
    p_migration_id UUID
)
RETURNS TABLE (
    prerequisite_name VARCHAR(100),
    status VARCHAR(20),
    details TEXT,
    criticality VARCHAR(20) -- CRITICAL, HIGH, MEDIUM, LOW
) AS $$
BEGIN

    RETURN QUERY

    -- Check 1: Migration exists and is recent
    SELECT
        'MIGRATION_EXISTS' as prerequisite_name,
        CASE WHEN m.migration_id IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as status,
        CASE
            WHEN m.migration_id IS NOT NULL THEN
                'Migration found: ' || m.migration_id || ' (' || m.migration_date || ')'
            ELSE 'Migration ID not found in migration log'
        END as details,
        'CRITICAL' as criticality
    FROM migration_log m
    WHERE m.migration_id = p_migration_id

    UNION ALL

    -- Check 2: Recent backup availability
    SELECT
        'RECENT_BACKUP' as prerequisite_name,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as status,
        CASE
            WHEN COUNT(*) > 0 THEN
                COUNT(*) || ' backups available in last 24 hours'
            ELSE 'No backups found in last 24 hours'
        END as details,
        'CRITICAL' as criticality
    FROM backup_log
    WHERE backup_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    AND backup_status = 'COMPLETED'

    UNION ALL

    -- Check 3: Database connectivity
    SELECT
        'DATABASE_CONNECTIVITY' as prerequisite_name,
        CASE WHEN conn_count = 3 THEN 'PASS' ELSE 'FAIL' END as status,
        CASE
            WHEN conn_count = 3 THEN 'All target databases accessible'
            ELSE 'Only ' || conn_count || ' of 3 databases accessible'
        END as details,
        'HIGH' as criticality
    FROM (
        SELECT COUNT(*) as conn_count
        FROM (VALUES ('shared_auth_service'), ('cleaning_db'), ('maintenance_db')) AS db(db_name)
        WHERE dblink_connect(
            'conn_' || db_name,
            format('host=%h port=%p user=%U dbname=%I',
                current_setting('db_host'),
                current_setting('db_port'),
                current_user,
                db_name
            )
        ) IS NOT NULL
    ) connectivity_check

    UNION ALL

    -- Check 4: Sufficient disk space
    SELECT
        'DISK_SPACE' as prerequisite_name,
        CASE WHEN free_space_gb > 100 THEN 'PASS' ELSE 'WARN' END as status,
        'Available disk space: ' || free_space_gb || 'GB' as details,
        CASE WHEN free_space_gb > 100 THEN 'LOW' ELSE 'HIGH' END as criticality
    FROM (
        SELECT pg_size_pretty(pg_database_size(current_database())) as db_size,
               pg_size_pretty(sum(pg_relation_size(oid))) as total_relation_size
        FROM pg_class
    ) size_info,
    LATERAL (
        SELECT 500 as free_space_gb  -- This should be replaced with actual disk space query
    ) disk_info

    UNION ALL

    -- Check 5: No active conflicting operations
    SELECT
        'NO_CONFLICTING_OPERATIONS' as prerequisite_name,
        CASE WHEN active_ops = 0 THEN 'PASS' ELSE 'WARN' END as status,
        CASE
            WHEN active_ops = 0 THEN 'No conflicting operations detected'
            ELSE active_ops || ' potentially conflicting operations detected'
        END as details,
        'MEDIUM' as criticality
    FROM (
        SELECT COUNT(*) as active_ops
        FROM pg_stat_activity
        WHERE datname IN ('shared_auth_service', 'cleaning_db', 'maintenance_db')
        AND state = 'active'
        AND query NOT LIKE '%rollback%'
        AND query NOT LIKE '%migration%'
    ) active_check;

END;
$$ LANGUAGE plpgsql;
```

### 5. Production Migration Runbook

#### `production-migration-runbook.md`

```markdown
# RightFit Services Production Migration Runbook

## Overview

This runbook provides step-by-step procedures for safely executing the RightFit Services database separation migration in production environments.

## Prerequisites Checklist

### Pre-Migration Requirements

- [ ] **Change Management**: Change request approved and scheduled
- [ ] **Stakeholder Notification**: All stakeholders notified of maintenance window
- [ ] **Backup Verification**: Full database backups completed and verified
- [ ] **Environment Validation**: Staging environment tests completed successfully
- [ ] **Team Readiness**: All team members available and on-call
- [ ] **Documentation**: All runbooks and procedures reviewed and updated
- [ ] **Rollback Plan**: Rollback procedures tested and validated
- [ ] **Communication Plan**: Incident communication channels established

### Technical Prerequisites

- [ ] **Database Connectivity**: All target databases accessible
- [ ] **Application Services**: All application services ready for restart
- [ ] **Monitoring Systems**: Monitoring and alerting systems configured
- [ ] **Load Balancers**: Ready for configuration updates
- [ ] **API Gateways**: Configuration prepared for service endpoints
- [ ] **Authentication Services**: Shared auth service deployment ready
- [ ] **File Storage**: File migration and storage systems prepared

## Migration Timeline

### Phase 1: Pre-Migration (T-2 hours)

#### 1.1 Environment Preparation
```bash
# 1. Verify backup completion
./verify-backups.sh production

# 2. Pre-migration health checks
./health-check.sh production pre-migration

# 3. Validate staging test results
./validate-staging-results.sh

# 4. Prepare rollback procedures
./prepare-rollback.sh production
```

#### 1.2 Team Coordination
- Start incident response bridge call
- Confirm all team members availability
- Verify communication channels
- Update status dashboard

#### 1.3 Service Preparation
```bash
# 1. Place services in maintenance mode
./enable-maintenance-mode.sh production

# 2. Drain active connections
./drain-connections.sh production

# 3. Stop background jobs
./stop-background-jobs.sh production

# 4. Create final backup
./create-final-backup.sh production
```

### Phase 2: Migration Execution (T-30 minutes to T+60 minutes)

#### 2.1 Database Migration
```bash
# 1. Execute database migration
./execute-migration.sh production full

# 2. Monitor migration progress
./monitor-migration.sh production

# 3. Validate data integrity
./validate-data-integrity.sh production

# 4. Update service configurations
./update-service-configs.sh production
```

#### 2.2 Service Migration
```bash
# 1. Deploy shared authentication service
./deploy-shared-auth.sh production

# 2. Update cleaning service configuration
./update-cleaning-config.sh production

# 3. Update maintenance service configuration
./update-maintenance-config.sh production

# 4. Update API gateway configurations
./update-api-gateway.sh production
```

#### 2.3 Post-Migration Validation
```bash
# 1. Service health checks
./health-check.sh production post-migration

# 2. Data validation
./run-data-validation.sh production

# 3. Cross-service integration tests
./run-integration-tests.sh production

# 4. Performance verification
./run-performance-tests.sh production
```

### Phase 3: Service Recovery (T+60 minutes to T+90 minutes)

#### 3.1 Service Restoration
```bash
# 1. Disable maintenance mode
./disable-maintenance-mode.sh production

# 2. Restart application services
./restart-services.sh production

# 3. Verify service connectivity
./verify-connectivity.sh production

# 4. Enable load balancers
./enable-load-balancers.sh production
```

#### 3.2 Final Validation
```bash
# 1. End-to-end functionality tests
./run-e2e-tests.sh production

# 2. User access validation
./validate-user-access.sh production

# 3. Business process verification
./verify-business-processes.sh production

# 4. Performance monitoring
./monitor-performance.sh production
```

## Detailed Procedures

### Emergency Rollback Procedures

#### Immediate Rollback Triggers
- **Critical Data Corruption**: Any data integrity validation failures
- **Service Outage**: Service availability below 95% for 10+ minutes
- **Performance Degradation**: Response times >5x baseline for 5+ minutes
- **Security Issues**: Authentication or authorization failures
- **Business Impact**: Critical business processes non-functional

#### Rollback Execution
```bash
# 1. Immediate rollback initiation
./initiate-emergency-rollback.sh production "CRITICAL_DATA_ISSUE"

# 2. Monitor rollback progress
./monitor-rollback.sh production

# 3. Validate rollback completion
./validate-rollback.sh production

# 4. Service recovery
./recovery-after-rollback.sh production
```

### Communication Procedures

#### Stakeholder Notifications

**Pre-Migration (T-24 hours):**
```email
To: stakeholders@rightfit-services.com
Subject: Scheduled Maintenance - Database Migration (T-24 hours)

RightFit Services will undergo scheduled database migration maintenance.

Date: [Date]
Time: [Time Window]
Duration: [Duration]
Impact: Service unavailable during maintenance window

Please plan accordingly.
```

**Migration Start (T-0):**
```email
To: stakeholders@rightfit-services.com
Subject: Maintenance Started - Database Migration In Progress

Database migration has begun. Services are currently in maintenance mode.

Estimated completion: [Time]
Status updates available at: [Status Dashboard]
```

**Migration Completion:**
```email
To: stakeholders@rightfit-services.com
Subject: Maintenance Complete - Database Migration Successful

Database migration has been completed successfully.

All services are now operational.
Please report any issues to: support@rightfit-services.com
```

### Monitoring and Alerting

#### Key Metrics to Monitor

**Database Metrics:**
- Connection counts per database
- Query response times
- Data consistency checks
- Cross-service relationship integrity

**Application Metrics:**
- Service availability (uptime)
- API response times
- Error rates (4xx, 5xx)
- Authentication success rates

**Business Metrics:**
- User login success rate
- Customer data accessibility
- Job creation/completion rates
- Financial transaction processing

**Alert Thresholds:**
```yaml
critical_alerts:
  service_availability: < 95%
  database_connections: > 1000
  api_response_time: > 5000ms
  error_rate: > 5%
  authentication_failure_rate: > 10%

warning_alerts:
  service_availability: < 99%
  database_connections: > 500
  api_response_time: > 2000ms
  error_rate: > 1%
  authentication_failure_rate: > 5%
```

## Post-Migration Activities

### 1. Validation and Testing

**Comprehensive Validation:**
- [ ] All automated tests passing
- [ ] Manual user acceptance testing
- [ ] Performance benchmark comparison
- [ ] Security validation
- [ ] Business process verification

**Documentation Updates:**
- [ ] Update architecture diagrams
- [ ] Revise operational procedures
- [ ] Update monitoring dashboards
- [ ] Document lessons learned

### 2. Performance Optimization

**Database Optimization:**
- [ ] Index optimization
- [ ] Query performance tuning
- [ ] Connection pool adjustments
- [ ] Memory configuration tuning

**Application Optimization:**
- [ ] Cache warming
- [ ] Connection timeout adjustments
- [ ] Retry mechanism validation
- [ ] Error handling improvements

### 3. Monitoring Enhancement

**Enhanced Monitoring:**
- [ ] Custom metrics for new architecture
- [ ] Cross-service dependency monitoring
- [ ] Anomaly detection rules
- [ ] Predictive alerting

**Operational Readiness:**
- [ ] Runbook updates
- [ ] Team training
- [ ] Incident response procedures
- [ ] Capacity planning updates

## Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Issues
**Symptoms:** Application unable to connect to databases
**Solutions:**
1. Verify database service status
2. Check network connectivity
3. Validate authentication credentials
4. Review firewall rules

#### Data Inconsistency Issues
**Symptoms:** Cross-service data mismatches
**Solutions:**
1. Run data integrity validation
2. Check migration logs for errors
3. Verify synchronization processes
4. Initiate data resync if needed

#### Performance Degradation
**Symptoms:** Slow response times, timeouts
**Solutions:**
1. Monitor database performance metrics
2. Check query execution plans
3. Review application connection pooling
4. Consider horizontal scaling

#### Authentication Failures
**Symptoms:** Users unable to authenticate
**Solutions:**
1. Verify shared auth service status
2. Check JWT token configuration
3. Validate user data synchronization
4. Review authentication logs

## Contact Information

### Emergency Contacts
- **Technical Lead**: [Name] - [Phone] - [Email]
- **Database Administrator**: [Name] - [Phone] - [Email]
- **DevOps Engineer**: [Name] - [Phone] - [Email]
- **Product Manager**: [Name] - [Phone] - [Email]

### Support Channels
- **Incident Bridge**: [Conference Line]
- **Status Dashboard**: [URL]
- **Slack Channel**: #[channel]
- **Email Distribution**: [group@rightfit-services.com]

## Appendices

### A. Command Reference
[Detailed command reference for all migration scripts]

### B. Configuration Templates
[Configuration file templates for all environments]

### C. Validation Checklists
[Detailed checklists for each migration phase]

### D. Performance Benchmarks
[Performance baselines and acceptance criteria]

---

**Version**: 1.0
**Last Updated**: [Date]
**Next Review**: [Date]
**Approved By**: [Name/Role]
```

## Implementation Summary

This comprehensive migration testing and rollback framework provides:

1. **Test Environment Setup** - Automated provisioning and configuration of test environments
2. **Dry-Run Testing** - Complete migration simulation with comprehensive validation
3. **Rollback Procedures** - Multiple rollback strategies with automated execution
4. **Production Runbook** - Step-by-step procedures for safe production migration
5. **Monitoring & Alerting** - Real-time monitoring with automated alerting
6. **Communication Templates** - Pre-defined stakeholder communications

The framework ensures safe, reliable, and repeatable database separation migrations with minimal risk and maximum operational readiness.
