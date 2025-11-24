# RightFit Services: Separated Database Setup Guide

## Overview

This guide explains how to set up and use the separated database architecture for RightFit Services. The new architecture separates the shared database into three independent databases while maintaining backward compatibility with the existing setup.

## Architecture Overview

### Database Structure

```
┌─────────────────────────────────────────────────────────┐
│                   RightFit Services                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │   Web Apps      │  │   Mobile Apps   │  │  API     │  │
│  │                 │  │                 │  │  Services │  │
│  └─────────────────┘  └─────────────────┘  └──────────┘  │
│           │                     │              │       │
│           └─────────────────────┴──────────────┘       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                  Separated Databases                     │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │  Shared Auth    │  │   Cleaning      │  │Maintenance│  │
│  │   Database      │  │   Database      │  │ Database │  │
│  │                 │  │                 │  │          │  │
│  │ Port: 5434      │  │ Port: 5435      │  │ Port:5436│  │
│  └─────────────────┘  └─────────────────┘  └──────────┘  │
│                                                         │
│  ┌─────────────────┐                                    │
│  │   Original      │  (Preserved during migration)      │
│  │   Database      │                                    │
│  │   Port: 5433    │                                    │
│  └─────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

### Service Responsibilities

| Database | Port | Purpose | Key Tables |
|----------|------|---------|------------|
| **Shared Auth** | 5434 | User authentication & shared services | shared_users, password_reset_tokens, user_service_mappings |
| **Cleaning** | 5435 | Cleaning service data | cleaning_users, cleaning_customers, cleaning_jobs, cleaning_contracts |
| **Maintenance** | 5436 | Maintenance service data | maintenance_users, maintenance_customers, maintenance_jobs, maintenance_contracts |
| **Original** | 5433 | Legacy unified database (preserved) | All existing tables |

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Existing RightFit Services setup
- Base `.env` file configured

### Step 1: Environment Setup

```bash
# Copy the separated environment configuration
cp .env.separated .env.local

# Edit the configuration as needed
nano .env.local
```

### Step 2: Start Separated Databases

```bash
# Start the original database (if not already running)
docker-compose up -d postgres

# Start the separated databases
docker-compose -f docker-compose.yml -f docker-compose.separated.yml up -d

# Verify all databases are running
docker-compose ps
```

### Step 3: Run Database Migration

```bash
# Dry run (safe, no changes)
MIGRATION_MODE=dry_run docker-compose -f docker-compose.yml -f docker-compose.separated.yml --profile migration up -d

# Check migration logs
docker-compose logs -f db-migration

# Execute migration (when ready)
MIGRATION_MODE=execute docker-compose -f docker-compose.yml -f docker-compose.separated.yml --profile migration up -d

# Stop migration container when complete
docker-compose stop db-migration
```

### Step 4: Update Application Configuration

```bash
# Enable separated services in your environment
export SERVICE_MODE=separated
export ENABLE_SEPARATED_SERVICES=true

# Or update .env.local:
echo "SERVICE_MODE=separated" >> .env.local
echo "ENABLE_SEPARATED_SERVICES=true" >> .env.local
```

### Step 5: Start Applications

```bash
# Start API services with separated databases
npm run dev:api

# Start web applications
npm run dev:cleaning
npm run dev:maintenance
npm run dev:customer
npm run dev:landlord
```

## Detailed Configuration

### Environment Variables

#### Database Connection Variables

```bash
# Shared Authentication Database
SHARED_AUTH_DATABASE_URL="postgresql://shared_user:shared_dev_password@localhost:5434/rightfit_shared_auth"

# Cleaning Service Database
CLEANING_DATABASE_URL="postgresql://cleaning_user:cleaning_dev_password@localhost:5435/rightfit_cleaning"

# Maintenance Service Database
MAINTENANCE_DATABASE_URL="postgresql://maintenance_user:maintenance_dev_password@localhost:5436/rightfit_maintenance"
```

#### Service Mode Configuration

```bash
# Service operation modes
SERVICE_MODE=unified          # Options: unified, separated, migration
ENABLE_SEPARATED_SERVICES=false  # Enable separated service features
DISABLE_UNIFIED_DATABASE=false   # Disable unified database access
```

#### Migration Configuration

```bash
# Migration settings
MIGRATION_MODE=dry_run         # Options: dry_run, validate, execute, rollback
ENABLE_MIGRATION_BACKUP=true   # Create backup before migration
ENABLE_MIGRATION_VALIDATION=true  # Run validation after migration
```

## Migration Process

### Phase 1: Preparation

1. **Backup Current Database**
   ```bash
   # Create manual backup
   pg_dump "$DATABASE_URL" > backup_before_migration.sql

   # Compress backup
   gzip backup_before_migration.sql
   ```

2. **Validate Environment**
   ```bash
   # Check Docker containers
   docker-compose ps

   # Test database connections
   psql "$DATABASE_URL" -c "SELECT version();"
   ```

### Phase 2: Dry Run Migration

```bash
# Set migration mode to dry run
export MIGRATION_MODE=dry_run

# Run migration container
docker-compose -f docker-compose.yml -f docker-compose.separated.yml --profile migration up -d

# Monitor logs
docker-compose logs -f db-migration
```

**Expected Output:**
```
=== Migration Validation Started ===
Timestamp: 2025-11-17 10:00:00
User counts:
  Source: 150
  Shared Auth: 150
  Cleaning: 90
  Maintenance: 75
✅ User counts are consistent
=== Migration Validation Completed ===
```

### Phase 3: Execute Migration

```bash
# Set migration mode to execute
export MIGRATION_MODE=execute

# Run migration
docker-compose -f docker-compose.yml -f docker-compose.separated.yml --profile migration up -d

# Monitor progress
docker-compose logs -f db-migration
```

### Phase 4: Validation

```bash
# Run validation script
docker-compose exec db-migration /migration-scripts/helpers/validate-migration.sh

# Check data consistency
docker-compose exec db-migration psql "$CLEANING_DATABASE_URL" -c "SELECT COUNT(*) FROM cleaning_users;"
```

## Development Workflow

### Local Development

#### Using Unified Database (Current)
```bash
# Load base environment only
source .env

# Start applications normally
npm run dev
```

#### Using Separated Databases (New)
```bash
# Load both environment files
source .env
source .env.separated

# Start separated databases
docker-compose -f docker-compose.yml -f docker-compose.separated.yml up -d

# Start applications
npm run dev
```

#### Switching Between Modes
```bash
# Switch to unified mode
export SERVICE_MODE=unified
export ENABLE_SEPARATED_SERVICES=false

# Switch to separated mode
export SERVICE_MODE=separated
export ENABLE_SEPARATED_SERVICES=true
```

### Testing

#### Database Connection Tests
```bash
# Test shared auth database
psql "$SHARED_AUTH_DATABASE_URL" -c "SELECT COUNT(*) FROM shared_users;"

# Test cleaning database
psql "$CLEANING_DATABASE_URL" -c "SELECT COUNT(*) FROM cleaning_jobs;"

# Test maintenance database
psql "$MAINTENANCE_DATABASE_URL" -c "SELECT COUNT(*) FROM maintenance_jobs;"
```

#### Application Integration Tests
```bash
# Test authentication across services
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Test service-specific endpoints
curl http://localhost:3010/cleaning/jobs
curl http://localhost:3020/maintenance/jobs
```

## Backup & Recovery

### Automated Backups

```bash
# Enable backup service
docker-compose -f docker-compose.yml -f docker-compose.separated.yml --profile backup up -d

# View backup schedules
grep "BACKUP_SCHEDULE" .env.separated
```

### Manual Backups

```bash
# Backup all databases
mkdir -p ./backups/manual-$(date +%Y%m%d_%H%M%S)

# Shared Auth
pg_dump "$SHARED_AUTH_DATABASE_URL" > ./backups/manual-$(date +%Y%m%d_%H%M%S)/shared_auth.sql

# Cleaning
pg_dump "$CLEANING_DATABASE_URL" > ./backups/manual-$(date +%Y%m%d_%H%M%S)/cleaning.sql

# Maintenance
pg_dump "$MAINTENANCE_DATABASE_URL" > ./backups/manual-$(date +%Y%m%d_%H%M%S)/maintenance.sql
```

### Recovery Procedures

```bash
# Stop applications
docker-compose down

# Restore database (example for cleaning)
psql "$CLEANING_DATABASE_URL" < ./backups/backup_date/cleaning.sql

# Restart applications
docker-compose up -d
```

## Monitoring & Troubleshooting

### Health Checks

```bash
# Check database connectivity
docker-compose exec rightfit-shared-auth pg_isready
docker-compose exec rightfit-cleaning pg_isready
docker-compose exec rightfit-maintenance pg_isready

# Check application health
curl http://localhost:3010/health
curl http://localhost:3020/health
```

### Common Issues

#### Database Connection Errors
```bash
# Symptom: Connection refused
# Solution: Check if databases are running
docker-compose ps

# Restart specific database
docker-compose restart rightfit-cleaning
```

#### Migration Failures
```bash
# Symptom: Migration container exits with error
# Solution: Check logs and validate environment
docker-compose logs db-migration

# Re-run with debug mode
export MIGRATION_DEBUG=true
export MIGRATION_VERBOSE=true
```

#### Data Inconsistency
```bash
# Symptom: Data counts don't match
# Solution: Run validation and repair
docker-compose exec db-migration /migration-scripts/helpers/validate-migration.sh

# Manual repair (if needed)
psql "$DATABASE_URL" -f ./GLM_DOCS/scripts/repair.sql
```

### Performance Monitoring

```bash
# Check database performance
docker-compose exec rightfit-cleaning psql -c "
  SELECT
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
  FROM pg_stat_user_tables
  ORDER BY n_live_tup DESC;
"

# Monitor connection pools
curl http://localhost:9090/metrics
```

## Production Deployment

### Environment Setup

```bash
# Production environment variables
export NODE_ENV=production
export SERVICE_MODE=separated
export ENABLE_SEPARATED_SERVICES=true

# Production database passwords (use secrets management)
export SHARED_AUTH_DB_PASSWORD=${SHARED_AUTH_DB_PASSWORD}
export CLEANING_DB_PASSWORD=${CLEANING_DB_PASSWORD}
export MAINTENANCE_DB_PASSWORD=${MAINTENANCE_DB_PASSWORD}
```

### Deployment Steps

1. **Pre-deployment Checklist**
   ```bash
   # [ ] Backup current database
   # [ ] Test migration in staging
   # [ ] Verify SSL certificates
   # [ ] Check resource limits
   # [ ] Prepare rollback plan
   ```

2. **Deploy Separated Databases**
   ```bash
   # Deploy to production
   docker-compose -f docker-compose.prod.yml -f docker-compose.separated.yml up -d

   # Verify deployment
   docker-compose ps
   ```

3. **Execute Production Migration**
   ```bash
   # Production migration (CAUTION!)
   export MIGRATION_MODE=execute
   export NODE_ENV=production

   docker-compose -f docker-compose.prod.yml -f docker-compose.separated.yml --profile migration up -d
   ```

4. **Post-deployment Validation**
   ```bash
   # Run smoke tests
   ./scripts/smoke-tests.sh

   # Monitor system health
   ./scripts/health-check.sh
   ```

## Security Considerations

### Database Security

```bash
# Enable SSL for production
export DB_SSL_MODE=require

# Use connection strings with SSL
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Network Security

```bash
# Database containers only accessible within Docker network
# No external ports exposed for production

# Use internal Docker networking
docker network create --driver bridge rightfit-internal
```

### Access Control

```bash
# Create read-only users for reporting
psql "$CLEANING_DATABASE_URL" -c "
  CREATE USER cleaning_readonly WITH PASSWORD 'secure_password';
  GRANT CONNECT ON DATABASE rightfit_cleaning TO cleaning_readonly;
  GRANT USAGE ON SCHEMA public TO cleaning_readonly;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO cleaning_readonly;
"
```

## Support & Documentation

### Getting Help

- **Technical Documentation**: See `GLM_DOCS/` directory
- **Migration Scripts**: `GLM_DOCS/migration-scripts.sql`
- **Database Analysis**: `GLM_DOCS/database-analysis.md`
- **Progress Tracking**: `GLM_DOCS/stories.md`

### Contributing

1. Follow the established patterns in existing code
2. Update documentation for any changes
3. Test across all database configurations
4. Ensure backward compatibility when possible

### Release Notes

Check `GLM_DOCS/sprint-1-progress.md` for the latest updates and progress information.

---

**Last Updated**: November 17, 2025
**Version**: 1.0
**Compatible With**: RightFit Services v2.0+
**Migration Status**: Sprint 1 Complete