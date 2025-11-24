# Automated Validation Scripts Package

## Overview

This package contains a comprehensive suite of automated validation scripts designed to continuously monitor data integrity throughout the RightFit Services database separation process. These scripts provide real-time validation, automated reporting, and immediate alerting capabilities.

## Script Architecture

### 1. Master Validation Orchestrator

#### `run-complete-validation.sh`

```bash
#!/bin/bash

# ================================================================
# Complete Migration Validation Orchestrator
# ================================================================
# Purpose: Execute all validation scripts in sequence
# Usage: ./run-complete-validation.sh [environment]
# Environment options: development, staging, production
# ================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENVIRONMENT="${1:-development}"
LOG_DIR="${SCRIPT_DIR}/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
VALIDATION_LOG="${LOG_DIR}/validation_${ENVIRONMENT}_${TIMESTAMP}.log"

# Database connection variables (loaded from environment)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
SHARED_AUTH_DB="${SHARED_AUTH_DB:-shared_auth_service}"
CLEANING_DB="${CLEANING_DB:-cleaning_db}"
MAINTENANCE_DB="${MAINTENANCE_DB:-maintenance_db}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$VALIDATION_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$VALIDATION_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$VALIDATION_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$VALIDATION_LOG"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$VALIDATION_LOG"
}

# Validation results tracking
VALIDATION_RESULTS=()
SCRIPT_RESULTS=()

# Function to execute SQL validation script
execute_validation_script() {
    local script_name="$1"
    local script_path="$2"
    local description="$3"
    local criticality="$4"  # CRITICAL, HIGH, MEDIUM, LOW

    log_info "Executing: $description"
    log_info "Script: $script_name"

    local start_time=$(date +%s)
    local temp_output="/tmp/validation_${script_name}_${TIMESTAMP}.out"

    # Execute the SQL script
    if PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$SHARED_AUTH_DB" \
        -f "$script_path" \
        > "$temp_output" 2>&1; then

        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        # Check for critical errors in output
        if grep -qi "error\|failed\|exception" "$temp_output"; then
            log_error "Validation completed with errors: $script_name"
            VALIDATION_RESULTS+=("$script_name:FAILED:$criticality:$duration")
            SCRIPT_RESULTS+=("$script_name,FAILED,$description,$duration,Critical errors detected")
        else
            log_success "Validation completed successfully: $script_name (${duration}s)"
            VALIDATION_RESULTS+=("$script_name:PASSED:$criticality:$duration")
            SCRIPT_RESULTS+=("$script_name,PASSED,$description,$duration,Normal execution")
        fi
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_error "Validation script failed to execute: $script_name"
        VALIDATION_RESULTS+=("$script_name:ERROR:$criticality:$duration")
        SCRIPT_RESULTS+=("$script_name,ERROR,$description,$duration,Script execution failed")
    fi

    # Append script output to main log
    cat "$temp_output" >> "$VALIDATION_LOG"
    rm -f "$temp_output"
}

# Function to check database connectivity
check_database_connectivity() {
    log_info "Checking database connectivity..."

    local databases=("$SHARED_AUTH_DB" "$CLEANING_DB" "$MAINTENANCE_DB")
    local all_connected=true

    for db in "${databases[@]}"; do
        if PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$db" \
            -c "SELECT 1;" >/dev/null 2>&1; then
            log_success "Connected to: $db"
        else
            log_error "Failed to connect to: $db"
            all_connected=false
        fi
    done

    if [ "$all_connected" = false ]; then
        log_error "Database connectivity check failed. Aborting validation."
        exit 1
    fi

    log_success "All databases are accessible"
}

# Function to generate validation summary
generate_validation_summary() {
    log_info "Generating validation summary..."

    local total_scripts=${#VALIDATION_RESULTS[@]}
    local passed_scripts=0
    local failed_scripts=0
    local error_scripts=0
    local critical_failures=0
    local total_duration=0

    # Process results
    for result in "${VALIDATION_RESULTS[@]}"; do
        IFS=':' read -r script_name status criticality duration <<< "$result"
        total_duration=$((total_duration + duration))

        case "$status" in
            "PASSED")
                passed_scripts=$((passed_scripts + 1))
                ;;
            "FAILED")
                failed_scripts=$((failed_scripts + 1))
                if [ "$criticality" = "CRITICAL" ]; then
                    critical_failures=$((critical_failures + 1))
                fi
                ;;
            "ERROR")
                error_scripts=$((error_scripts + 1))
                critical_failures=$((critical_failures + 1))
                ;;
        esac
    done

    # Calculate success rate
    local success_rate=0
    if [ $total_scripts -gt 0 ]; then
        success_rate=$(echo "scale=2; ($passed_scripts * 100) / $total_scripts" | bc -l)
    fi

    # Generate summary report
    cat << EOF

========================================
VALIDATION SUMMARY REPORT
========================================
Environment: $ENVIRONMENT
Timestamp: $TIMESTAMP
Total Duration: ${total_duration}s

Execution Results:
-----------------
Total Scripts: $total_scripts
Passed: $passed_scripts
Failed: $failed_scripts
Errors: $error_scripts
Success Rate: ${success_rate}%

Critical Failures: $critical_failures

EOF

    # Critical failures handling
    if [ $critical_failures -gt 0 ]; then
        log_error "CRITICAL VALIDATION FAILURES DETECTED!"
        log_error "Immediate action required before proceeding with deployment."

        echo "Critical Failures:" >> "$VALIDATION_LOG"
        for result in "${VALIDATION_RESULTS[@]}"; do
            IFS=':' read -r script_name status criticality duration <<< "$result"
            if [ "$status" != "PASSED" ] && [ "$criticality" = "CRITICAL" ]; then
                echo "  - $script_name: $status" >> "$VALIDATION_LOG"
            fi
        done
    else
        log_success "No critical validation failures detected."
    fi

    # Detailed results for CSV export
    local csv_file="${LOG_DIR}/validation_results_${ENVIRONMENT}_${TIMESTAMP}.csv"
    echo "ScriptName,Status,Description,Duration,Notes" > "$csv_file"
    for result in "${SCRIPT_RESULTS[@]}"; do
        echo "$result" >> "$csv_file"
    done

    log_info "Detailed results exported to: $csv_file"

    # Return appropriate exit code
    if [ $critical_failures -gt 0 ]; then
        return 1
    else
        return 0
    fi
}

# Function to send notifications
send_notifications() {
    local exit_code=$1

    if [ "$NOTIFICATION_ENABLED" = "true" ]; then
        local subject="RightFit Validation Report - $ENVIRONMENT"
        local status_text=""

        if [ $exit_code -eq 0 ]; then
            status_text="✅ SUCCESS - All validations passed"
        else
            status_text="❌ FAILURE - Critical issues detected"
        fi

        # Email notification (if configured)
        if [ -n "$NOTIFICATION_EMAIL" ]; then
            mail -s "$subject: $status_text" "$NOTIFICATION_EMAIL" < "$VALIDATION_LOG"
        fi

        # Slack notification (if configured)
        if [ -n "$SLACK_WEBHOOK" ]; then
            local payload=$(cat <<EOF
{
    "text": "$subject: $status_text",
    "attachments": [
        {
            "color": "$([ $exit_code -eq 0 ] && echo "good" || echo "danger")",
            "fields": [
                {
                    "title": "Environment",
                    "value": "$ENVIRONMENT",
                    "short": true
                },
                {
                    "title": "Timestamp",
                    "value": "$TIMESTAMP",
                    "short": true
                },
                {
                    "title": "Total Scripts",
                    "value": "${#VALIDATION_RESULTS[@]}",
                    "short": true
                },
                {
                    "title": "Success Rate",
                    "value": "$(echo "scale=1; (${#VALIDATION_RESULTS[@]} - $failed_scripts - $error_scripts) * 100 / ${#VALIDATION_RESULTS[@]}" | bc -l)%",
                    "short": true
                }
            ]
        }
    ]
}
EOF
            )
            curl -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK"
        fi
    fi
}

# Main execution function
main() {
    log_info "Starting RightFit Services Migration Validation"
    log_info "Environment: $ENVIRONMENT"
    log_info "Timestamp: $TIMESTAMP"
    log_info "Log file: $VALIDATION_LOG"

    # Create log directory
    mkdir -p "$LOG_DIR"

    # Check prerequisites
    check_database_connectivity

    # Initialize validation results tracking
    log_info "Initializing validation results tracking..."
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$SHARED_AUTH_DB" \
        -c "CREATE TABLE IF NOT EXISTS validation_execution_log (
            execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            environment VARCHAR(50) NOT NULL,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            total_scripts INTEGER,
            passed_scripts INTEGER,
            failed_scripts INTEGER,
            status VARCHAR(20),
            log_file_path TEXT
        );"

    # Start validation execution
    local validation_start_time=$(date +%s)

    # Execute validation scripts in order of criticality
    log_info "Executing validation scripts..."

    # Critical Validations
    execute_validation_script "data_integrity" "${SCRIPT_DIR}/sql/validate-migration-integrity.sql" "Data Integrity Validation" "CRITICAL"
    execute_validation_script "data_completeness" "${SCRIPT_DIR}/sql/data-completeness-validation.sql" "Data Completeness Validation" "CRITICAL"
    execute_validation_script "foreign_keys" "${SCRIPT_DIR}/sql/foreign-key-validation.sql" "Foreign Key Relationship Validation" "CRITICAL"

    # High Priority Validations
    execute_validation_script "cross_service" "${SCRIPT_DIR}/sql/cross-service-validation.sql" "Cross-Service Relationship Validation" "HIGH"
    execute_validation_script "financial_accuracy" "${SCRIPT_DIR}/sql/financial-accuracy-validation.sql" "Financial Data Accuracy Validation" "HIGH"

    # Medium Priority Validations
    execute_validation_script "performance_impact" "${SCRIPT_DIR}/sql/performance-impact-validation.sql" "Performance Impact Validation" "MEDIUM"
    execute_validation_script "data_consistency" "${SCRIPT_DIR}/sql/data-consistency-validation.sql" "Data Consistency Validation" "MEDIUM"

    # Low Priority Validations
    execute_validation_script "index_optimization" "${SCRIPT_DIR}/sql/index-optimization-validation.sql" "Index Optimization Validation" "LOW"
    execute_validation_script "security_audit" "${SCRIPT_DIR}/sql/security-audit-validation.sql" "Security Audit Validation" "LOW"

    local validation_end_time=$(date +%s)
    local total_validation_duration=$((validation_end_time - validation_start_time))

    # Generate summary and determine exit code
    log_info "Total validation duration: ${total_validation_duration}s"

    if generate_validation_summary; then
        log_success "All validations completed successfully!"
        local exit_code=0
    else
        log_error "Validation completed with critical failures!"
        local exit_code=1
    fi

    # Log execution completion
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$SHARED_AUTH_DB" \
        -c "INSERT INTO validation_execution_log (environment, start_time, end_time, total_scripts, passed_scripts, failed_scripts, status, log_file_path)
           VALUES ('$ENVIRONMENT', to_timestamp($validation_start_time), to_timestamp($validation_end_time), ${#VALIDATION_RESULTS[@]}, $passed_scripts, $failed_scripts, '$([ $exit_code -eq 0 ] && echo 'SUCCESS' || echo 'FAILURE')', '$VALIDATION_LOG');"

    # Send notifications
    send_notifications $exit_code

    log_info "Validation process completed. Log file: $VALIDATION_LOG"

    exit $exit_code
}

# Execute main function
main "$@"
```

### 2. Real-Time Monitoring Scripts

#### `continuous-monitoring.sh`

```bash
#!/bin/bash

# ================================================================
# Continuous Database Monitoring Script
# ================================================================
# Purpose: Real-time monitoring of database health and integrity
# Usage: ./continuous-monitoring.sh [interval_in_seconds]
# ================================================================

set -euo pipefail

# Configuration
MONITORING_INTERVAL="${1:-300}"  # Default 5 minutes
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALERT_LOG="${SCRIPT_DIR}/logs/alerts.log"
METRICS_LOG="${SCRIPT_DIR}/logs/metrics.log"
HEALTH_CHECK_LOG="${SCRIPT_DIR}/logs/health_checks.log"

# Create log directories
mkdir -p "$(dirname "$ALERT_LOG")" "$(dirname "$METRICS_LOG")" "$(dirname "$HEALTH_CHECK_LOG")"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"

# Monitoring thresholds
CRITICAL_CONNECTION_TIME=10
WARNING_CONNECTION_TIME=5
CRITICAL_QUERY_TIME=30
WARNING_QUERY_TIME=10
MAX_FAILED_CONNECTIONS=3

# Alert counters
FAILED_CONNECTIONS=0
CONSECUTIVE_FAILURES=0

# Logging functions
log_alert() {
    local severity="$1"
    local message="$2"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$severity] $message" >> "$ALERT_LOG"

    # Critical alerts to stderr for immediate visibility
    if [ "$severity" = "CRITICAL" ]; then
        echo "[$severity] $message" >&2
    fi
}

log_metric() {
    local metric_name="$1"
    local metric_value="$2"
    echo "$(date '+%Y-%m-%d %H:%M:%S'),$metric_name,$metric_value" >> "$METRICS_LOG"
}

log_health() {
    local status="$1"
    local details="$2"
    echo "$(date '+%Y-%m-%d %H:%M:%S'),$status,$details" >> "$HEALTH_CHECK_LOG"
}

# Function to test database connectivity
test_database_connectivity() {
    local db_name="$1"
    local start_time=$(date +%s.%N)

    if PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$db_name" \
        -c "SELECT 1;" >/dev/null 2>&1; then

        local end_time=$(date +%s.%N)
        local connection_time=$(echo "$end_time - $start_time" | bc -l)

        echo "$connection_time"
        return 0
    else
        echo "-1"
        return 1
    fi
}

# Function to monitor query performance
monitor_query_performance() {
    local db_name="$1"
    local query="$2"
    local query_name="$3"

    local start_time=$(date +%s.%N)

    if PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$db_name" \
        -c "$query" >/dev/null 2>&1; then

        local end_time=$(date +%s.%N)
        local query_time=$(echo "$end_time - $start_time" | bc -l)

        # Log the metric
        log_metric "${query_name}_${db_name}_query_time" "$query_time"

        # Check thresholds and alert if necessary
        if (( $(echo "$query_time > $CRITICAL_QUERY_TIME" | bc -l) )); then
            log_alert "CRITICAL" "Slow query detected: $query_name on $db_name (${query_time}s)"
        elif (( $(echo "$query_time > $WARNING_QUERY_TIME" | bc -l) )); then
            log_alert "WARNING" "Query performance warning: $query_name on $db_name (${query_time}s)"
        fi

        echo "$query_time"
    else
        log_alert "ERROR" "Query failed: $query_name on $db_name"
        echo "-1"
    fi
}

# Function to check database sizes and growth
monitor_database_sizes() {
    local databases=("shared_auth_service" "cleaning_db" "maintenance_db")

    for db in "${databases[@]}"; do
        local size_query="
            SELECT pg_size_pretty(pg_database_size('$db')) as size,
                   pg_database_size('$db') as size_bytes
            FROM pg_database WHERE datname = '$db';
        "

        local size_result=$(PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$db" \
            -t -c "$size_query" 2>/dev/null | tr -d ' ')

        if [ -n "$size_result" ]; then
            local size_pretty=$(echo "$size_result" | cut -d'|' -f1)
            local size_bytes=$(echo "$size_result" | cut -d'|' -f2)

            log_metric "${db}_database_size_bytes" "$size_bytes"
            log_metric "${db}_database_size_pretty" "$size_pretty"
        fi
    done
}

# Function to monitor active connections
monitor_active_connections() {
    local connection_query="
        SELECT datname, count(*) as active_connections
        FROM pg_stat_activity
        WHERE state = 'active'
        GROUP BY datname;
    "

    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "postgres" \
        -t -c "$connection_query" | while read -r line; do

        if [ -n "$line" ]; then
            local db_name=$(echo "$line" | awk '{print $1}')
            local connections=$(echo "$line" | awk '{print $2}')

            log_metric "${db_name}_active_connections" "$connections"

            # Alert if too many connections
            if [ "$connections" -gt 50 ]; then
                log_alert "WARNING" "High connection count on $db_name: $connections"
            fi
        fi
    done
}

# Function to check table row counts for anomaly detection
monitor_table_row_counts() {
    local tables_config="
        cleaning_db:cleaning_customers
        cleaning_db:cleaning_jobs
        cleaning_db:cleaning_contracts
        maintenance_db:maintenance_customers
        maintenance_db:maintenance_jobs
        maintenance_db:maintenance_contracts
        shared_auth_service:users
        shared_auth_service:refresh_tokens
    "

    echo "$tables_config" | while IFS=':' read -r db_name table_name; do
        local count_query="SELECT COUNT(*) FROM $table_name;"

        local row_count=$(PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$db_name" \
            -t -c "$count_query" 2>/dev/null | tr -d ' ')

        if [ -n "$row_count" ] && [ "$row_count" != "0" ]; then
            log_metric "${db_name}_${table_name}_row_count" "$row_count"
        fi
    done
}

# Function to check for data integrity issues
monitor_data_integrity() {
    local integrity_queries="
        cleaning_db:SELECT COUNT(*) FROM cleaning_jobs WHERE customer_id IS NULL AND status != 'cancelled';
        maintenance_db:SELECT COUNT(*) FROM maintenance_jobs WHERE customer_id IS NULL AND status != 'cancelled';
        shared_auth_service:SELECT COUNT(*) FROM refresh_tokens WHERE user_id NOT IN (SELECT id FROM users);
    "

    echo "$integrity_queries" | while IFS=':' read -r db_name query; do
        local issue_count=$(PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$db_name" \
            -t -c "$query" 2>/dev/null | tr -d ' ')

        if [ -n "$issue_count" ] && [ "$issue_count" != "0" ]; then
            log_alert "WARNING" "Data integrity issue detected in $db_name: $issue_count problematic records"
            log_metric "${db_name}_data_integrity_issues" "$issue_count"
        fi
    done
}

# Main monitoring loop
main() {
    echo "Starting continuous database monitoring..."
    echo "Monitoring interval: ${MONITORING_INTERVAL}s"
    echo "Alert log: $ALERT_LOG"
    echo "Metrics log: $METRICS_LOG"

    # Main monitoring loop
    while true; do
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local overall_status="HEALTHY"
        local status_details="All systems operational"

        echo "[$timestamp] Running health checks..."

        # Test connectivity to all databases
        local databases=("shared_auth_service" "cleaning_db" "maintenance_db")
        local all_healthy=true

        for db in "${databases[@]}"; do
            local connection_time=$(test_database_connectivity "$db")

            if [ "$connection_time" = "-1" ]; then
                log_alert "CRITICAL" "Database connection failed: $db"
                CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
                all_healthy=false
                overall_status="UNHEALTHY"
                status_details="Database connection failures"
            else
                CONSECUTIVE_FAILURES=0
                log_metric "${db}_connection_time" "$connection_time"

                # Check connection time thresholds
                if (( $(echo "$connection_time > $CRITICAL_CONNECTION_TIME" | bc -l) )); then
                    log_alert "CRITICAL" "Very slow connection to $db: ${connection_time}s"
                    overall_status="DEGRADED"
                    status_details="Slow database connections"
                elif (( $(echo "$connection_time > $WARNING_CONNECTION_TIME" | bc -l) )); then
                    log_alert "WARNING" "Slow connection to $db: ${connection_time}s"
                    if [ "$overall_status" = "HEALTHY" ]; then
                        overall_status="DEGRADED"
                        status_details="Slow database connections"
                    fi
                fi
            fi
        done

        # If consecutive failures exceed threshold, send critical alert
        if [ "$CONSECUTIVE_FAILURES" -ge "$MAX_FAILED_CONNECTIONS" ]; then
            log_alert "CRITICAL" "$CONSECUTIVE_FAILURES consecutive database connection failures detected!"
        fi

        # Only run detailed monitoring if basic connectivity is working
        if [ "$all_healthy" = true ]; then
            # Monitor query performance
            monitor_query_performance "cleaning_db" "SELECT COUNT(*) FROM cleaning_customers WHERE email LIKE '%@%';" "customer_count"
            monitor_query_performance "maintenance_db" "SELECT COUNT(*) FROM maintenance_jobs WHERE status = 'scheduled';" "scheduled_jobs"

            # Monitor database sizes
            monitor_database_sizes

            # Monitor active connections
            monitor_active_connections

            # Monitor table row counts
            monitor_table_row_counts

            # Monitor data integrity
            monitor_data_integrity
        fi

        # Log overall health status
        log_health "$overall_status" "$status_details"

        # Sleep until next monitoring cycle
        sleep "$MONITORING_INTERVAL"
    done
}

# Handle script termination gracefully
trap 'echo "Monitoring stopped by user"; exit 0' INT TERM

# Start monitoring
main
```

### 3. Alert Configuration Files

#### `alert-config.yaml`

```yaml
# ================================================================
# Alert Configuration for RightFit Services Validation
# ================================================================

# General settings
alerting:
  enabled: true
  notification_channels:
    - email
    - slack
    # - pagerduty  # Uncomment to enable

# Email configuration
email:
  smtp_server: "smtp.gmail.com"
  smtp_port: 587
  username: "${SMTP_USERNAME}"
  password: "${SMTP_PASSWORD}"
  from_address: "alerts@rightfit-services.com"
  to_addresses:
    - "devops@rightfit-services.com"
    - "dba@rightfit-services.com"

# Slack configuration
slack:
  webhook_url: "${SLACK_WEBHOOK_URL}"
  channel: "#alerts-rightfit"
  username: "RightFit Monitor"
  icon_emoji: ":robot_face:"

# PagerDuty configuration (optional)
pagerduty:
  integration_key: "${PAGERDUTY_INTEGRATION_KEY}"
  severity: "critical"

# Alert thresholds
thresholds:
  connection_time:
    warning: 5.0  # seconds
    critical: 10.0  # seconds

  query_time:
    warning: 10.0  # seconds
    critical: 30.0  # seconds

  failed_connections:
    max_consecutive: 3
    warning_rate: 0.1  # 10% failure rate
    critical_rate: 0.25  # 25% failure rate

  database_size_growth:
    warning_percent: 20.0  # 20% growth in 24 hours
    critical_percent: 50.0  # 50% growth in 24 hours

  active_connections:
    warning: 50
    critical: 100

  data_integrity_issues:
    warning: 10
    critical: 100

# Alert suppression rules
suppression_rules:
  # Suppress repeated identical alerts for 1 hour
  duplicate_suppression: 3600  # seconds

  # Suppress alerts during maintenance windows
  maintenance_windows:
    - start: "2024-01-15 02:00:00"
      end: "2024-01-15 04:00:00"
      reason: "Scheduled maintenance"

  # Suppress low-priority alerts during business hours
  business_hours_suppression:
    enabled: true
    start_time: "09:00:00"
    end_time: "17:00:00"
    timezone: "America/New_York"
    suppressed_severities:
      - "LOW"

# Alert templates
templates:
  critical_alert: |
    🚨 CRITICAL ALERT - RightFit Services
    =====================================

    Environment: {environment}
    Timestamp: {timestamp}
    Alert: {alert_name}

    Details:
    {details}

    Immediate Action Required:
    {action_required}

    Investigation Checklist:
    - Check system logs: {log_file}
    - Verify database connectivity
    - Review recent changes
    - Contact on-call engineer if unresolved within 15 minutes

  warning_alert: |
    ⚠️ WARNING ALERT - RightFit Services
    ===================================

    Environment: {environment}
    Timestamp: {timestamp}
    Alert: {alert_name}

    Details:
    {details}

    Recommended Action:
    {recommended_action}

  recovery_alert: |
    ✅ RECOVERY NOTIFICATION - RightFit Services
    ==========================================

    Environment: {environment}
    Timestamp: {timestamp}
    Alert: {alert_name}

    The previous issue has been resolved.

    Resolution Details:
    {resolution_details}

# Custom alert rules
custom_alerts:
  - name: "customer_data_anomaly"
    description: "Detect unusual changes in customer data"
    query: "SELECT ABS(COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY date_trunc('hour', created_at))) > 100 FROM cleaning_customers WHERE created_at > NOW() - INTERVAL '1 hour' GROUP BY date_trunc('hour', created_at)"
    severity: "WARNING"
    notification_channels: ["email"]

  - name: "job_queue_backlog"
    description: "Detect excessive job queue backlog"
    query: "SELECT COUNT(*) FROM cleaning_jobs WHERE status = 'pending' AND created_at < NOW() - INTERVAL '2 hours'"
    threshold: 50
    severity: "CRITICAL"
    notification_channels: ["email", "slack", "pagerduty"]

  - name: "authentication_failure_spike"
    description: "Detect spike in authentication failures"
    query: "SELECT COUNT(*) FROM authentication_logs WHERE success = false AND created_at > NOW() - INTERVAL '15 minutes'"
    threshold: 20
    severity: "HIGH"
    notification_channels: ["email", "slack"]

# Health check configuration
health_checks:
  endpoints:
    - name: "authentication_service"
      url: "http://localhost:3001/health"
      expected_status: 200
      timeout: 5

    - name: "cleaning_api"
      url: "http://localhost:3002/health"
      expected_status: 200
      timeout: 5

    - name: "maintenance_api"
      url: "http://localhost:3003/health"
      expected_status: 200
      timeout: 5

# Reporting configuration
reporting:
  daily_summary:
    enabled: true
    time: "08:00:00"
    recipients:
      - "management@rightfit-services.com"

  weekly_report:
    enabled: true
    day: "monday"
    time: "09:00:00"
    recipients:
      - "leadership@rightfit-services.com"
      - "devops@rightfit-services.com"
```

### 4. Docker Configuration for Validation

#### `docker-compose.validation.yml`

```yaml
# ================================================================
# Docker Compose for Validation Environment
# ================================================================

version: '3.8'

services:
  validation-runner:
    build:
      context: .
      dockerfile: Dockerfile.validation
    container_name: rightfit-validation
    environment:
      - DB_HOST=database
      - DB_PORT=5432
      - DB_USER=${DB_USER:-postgres}
      - DB_PASSWORD=${DB_PASSWORD}
      - SHARED_AUTH_DB=shared_auth_service
      - CLEANING_DB=cleaning_db
      - MAINTENANCE_DB=maintenance_db
      - ENVIRONMENT=${ENVIRONMENT:-development}
      - NOTIFICATION_ENABLED=${NOTIFICATION_ENABLED:-false}
      - NOTIFICATION_EMAIL=${NOTIFICATION_EMAIL}
      - SLACK_WEBHOOK=${SLACK_WEBHOOK}
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    volumes:
      - ./validation-scripts:/app/validation-scripts
      - ./logs:/app/logs
      - ./GLM_DOCS:/app/docs
    depends_on:
      - database
    networks:
      - validation-network
    restart: unless-stopped
    command: /app/validation-scripts/run-complete-validation.sh

  continuous-monitor:
    build:
      context: .
      dockerfile: Dockerfile.validation
    container_name: rightfit-monitor
    environment:
      - DB_HOST=database
      - DB_PORT=5432
      - DB_USER=${DB_USER:-postgres}
      - DB_PASSWORD=${DB_PASSWORD}
      - MONITORING_INTERVAL=${MONITORING_INTERVAL:-300}
    volumes:
      - ./validation-scripts:/app/validation-scripts
      - ./logs:/app/logs
      - ./alert-config.yaml:/app/config/alert-config.yaml
    depends_on:
      - database
    networks:
      - validation-network
    restart: unless-stopped
    command: /app/validation-scripts/continuous-monitoring.sh 300

  database:
    image: postgres:15-alpine
    container_name: rightfit-validation-db
    environment:
      - POSTGRES_USER=${DB_USER:-postgres}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=validation_db
    volumes:
      - validation_db_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5433:5432"
    networks:
      - validation-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 30s
      timeout: 10s
      retries: 3

  grafana:
    image: grafana/grafana:latest
    container_name: rightfit-grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    ports:
      - "3000:3000"
    networks:
      - validation-network
    restart: unless-stopped
    depends_on:
      - database

  prometheus:
    image: prom/prometheus:latest
    container_name: rightfit-prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - validation-network
    restart: unless-stopped

volumes:
  validation_db_data:
  grafana_data:
  prometheus_data:

networks:
  validation-network:
    driver: bridge
```

### 5. Dockerfile for Validation

#### `Dockerfile.validation`

```dockerfile
# ================================================================
# Dockerfile for RightFit Services Validation
# ================================================================

FROM postgres:15-alpine

# Install required packages
RUN apk add --no-cache \
    bash \
    bc \
    curl \
    mailcap \
    mailutils \
    jq \
    netcat-openbsd \
    python3 \
    py3-pip

# Install Python monitoring tools
RUN pip3 install \
    prometheus-client \
    requests \
    PyYAML

# Create application directory
WORKDIR /app

# Create validation user
RUN addgroup -g 1000 validation && \
    adduser -D -s /bin/bash -u 1000 -G validation validation

# Copy validation scripts
COPY --chown=validation:validation ./validation-scripts /app/validation-scripts
COPY --chown=validation:validation ./alert-config.yaml /app/config/

# Create necessary directories
RUN mkdir -p /app/logs /app/docs && \
    chmod +x /app/validation-scripts/*.sh

# Set ownership
RUN chown -R validation:validation /app

# Switch to validation user
USER validation

# Expose health check endpoint
EXPOSE 8080

# Add health check script
COPY --chown=validation:validation <<EOF /app/health-check.sh
#!/bin/bash
echo "Validation container is healthy"
exit 0
EOF

RUN chmod +x /app/health-check.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/health-check.sh

# Default command
CMD ["/app/validation-scripts/run-complete-validation.sh"]
```

## Deployment Instructions

### 1. Environment Setup

```bash
# Clone or navigate to the RightFit Services project
cd /home/orrox/projects/RightFit-Services

# Create validation directory structure
mkdir -p validation-scripts/{sql,config,logs}
mkdir -p grafana/{dashboards,datasources}
mkdir -p prometheus

# Copy scripts to appropriate locations
cp GLM_DOCS/data-integrity-validation.md validation-scripts/sql/
cp GLM_DOCS/automated-validation-scripts.md validation-scripts/
```

### 2. Environment Variables Configuration

```bash
# Create .env file for validation
cat > .env.validation << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Notification Configuration
NOTIFICATION_ENABLED=true
NOTIFICATION_EMAIL=alerts@yourcompany.com
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password

# Monitoring Configuration
MONITORING_INTERVAL=300
ENVIRONMENT=staging

# Grafana Configuration
GRAFANA_PASSWORD=secure_grafana_password
EOF
```

### 3. Running Validations

```bash
# Run complete validation suite
./validation-scripts/run-complete-validation.sh staging

# Start continuous monitoring
./validation-scripts/continuous-monitoring.sh 300

# Run with Docker Compose
docker-compose -f docker-compose.validation.yml up -d
```

### 4. Monitoring Dashboard Access

- **Grafana Dashboard**: http://localhost:3000 (admin/admin or configured password)
- **Prometheus**: http://localhost:9090
- **Validation Logs**: `./validation-scripts/logs/`

This comprehensive automated validation package provides continuous monitoring, real-time alerting, and detailed reporting for the RightFit Services database separation process.