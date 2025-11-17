# Database Architecture Analysis & Separation Strategy

## Executive Summary

This document provides a comprehensive analysis of the current shared database architecture and outlines the detailed separation strategy for cleaning and maintenance services.

## Current Database Overview

### Database Statistics
- **Total Tables**: 70+ tables in shared schema
- **Primary Entities**: Users, Customers, Properties, Workers, Jobs, Contracts
- **Shared Services**: Authentication, Notifications, File Upload, Financial Management
- **Multi-tenancy**: Tenant-based data isolation

### Key Shared Tables Analysis

#### 1. Authentication & User Management

**High Priority Tables** (require immediate separation):

1. **tenants** - Multi-tenancy foundation
   - Current: Single tenant for both services
   - Strategy: Split into service-specific tenants
   - Impact: High - affects all other tables

2. **users** - User accounts across both services
   - Current: Unified user table with role-based access
   - Strategy: Create service-specific user tables
   - Challenge: Handle users with access to both services

3. **password_reset_tokens** - Password management
   - Current: Shared across services
   - Strategy: Separate per service or create shared auth service

#### 2. Customer & Property Management

**Medium Priority Tables**:

4. **customers** - Customer accounts
   - Current: Unified customer management
   - Strategy: Separate by active service contracts
   - Challenge: Customers with both cleaning and maintenance contracts

5. **customer_properties** - Properties managed for customers
   - Current: Properties linked to customers
   - Strategy: Separate by service type
   - Challenge: Properties with both services

6. **properties** - Property information (legacy)
   - Current: Shared property database
   - Strategy: Migrate to customer_properties model
   - Impact: Medium - primarily legacy data

#### 3. Worker Management

**High Priority Tables**:

7. **workers** - Worker profiles
   - Current: Unified worker table with worker_type field
   - Strategy: Separate by worker_type (CLEANER vs MAINTENANCE)
   - Challenge: Handle workers with worker_type = BOTH

8. **worker_certificates** - Worker certifications
   - Current: Shared certification storage
   - Strategy: Separate with worker profile

9. **worker_availability** - Worker scheduling
   - Current: Shared availability management
   - Strategy: Separate per service

#### 4. Job Management

**Medium Priority Tables**:

10. **cleaning_jobs** - Cleaning job management
    - Current: Cleaning-specific table
    - Strategy: Keep in cleaning database
    - Impact: Low - already service-specific

11. **maintenance_jobs** - Maintenance job management
    - Current: Maintenance-specific table
    - Strategy: Move to maintenance database
    - Impact: Low - already service-specific

#### 5. Contract Management

**Medium Priority Tables**:

12. **cleaning_contracts** - Cleaning service contracts
    - Current: Cleaning-specific
    - Strategy: Keep in cleaning database
    - Impact: Low

13. **maintenance_contracts** - Maintenance service contracts
    - Current: Maintenance-specific
    - Strategy: Move to maintenance database
    - Impact: Low

#### 6. Financial Management

**High Priority Tables**:

14. **financial_transactions** - Financial records
    - Current: Shared across services
    - Strategy: Separate by service type
    - Challenge: Complex financial relationships

15. **invoices** - Invoicing system
    - Current: Mixed invoices for both services
    - Strategy: Separate by service type

16. **quotes** - Quote management
    - Current: Mixed quotes for both services
    - Strategy: Separate by service type

#### 7. Shared Infrastructure

**Low Priority Tables** (can be shared services):

17. **photos** - File and photo management
    - Current: Shared file storage
    - Strategy: Create shared file service
    - Impact: Low

18. **certificates** - Property certificates
    - Current: Shared certificate storage
    - Strategy: Separate by property service type
    - Impact: Medium

19. **notifications** - Notification system
    - Current: Shared notification management
    - Strategy: Create shared notification service
    - Impact: Low

## Detailed Separation Strategy

### Phase 1: High-Impact Table Separation

#### 1.1 Tenant Separation Strategy

**Current Schema**:
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  tenant_name VARCHAR(100),
  subscription_status VARCHAR(20),
  -- ... other fields
);
```

**Separated Schema**:
```sql
-- Cleaning Service
CREATE TABLE cleaning_tenants (
  id UUID PRIMARY KEY,
  tenant_name VARCHAR(100),
  subscription_status VARCHAR(20),
  -- ... cleaning-specific fields
);

-- Maintenance Service
CREATE TABLE maintenance_tenants (
  id UUID PRIMARY KEY,
  tenant_name VARCHAR(100),
  subscription_status VARCHAR(20),
  -- ... maintenance-specific fields
);
```

**Migration Strategy**:
1. Analyze current tenant usage by service
2. Create new tenant tables
3. Migrate data based on primary service type
4. Handle dual-service tenants

#### 1.2 User Separation Strategy

**Current Schema**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20),
  -- ... other fields
);
```

**Separated Schema**:
```sql
-- Shared Authentication Service
CREATE TABLE shared_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP,
  -- ... authentication fields only
);

-- Cleaning Service Users
CREATE TABLE cleaning_users (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES shared_users(id),
  tenant_id UUID REFERENCES cleaning_tenants(id),
  role VARCHAR(20),
  full_name VARCHAR(100),
  -- ... cleaning-specific fields
);

-- Maintenance Service Users
CREATE TABLE maintenance_users (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES shared_users(id),
  tenant_id UUID REFERENCES maintenance_tenants(id),
  role VARCHAR(20),
  full_name VARCHAR(100),
  -- ... maintenance-specific fields
);
```

**Migration Strategy**:
1. Extract authentication data to shared_users
2. Create service-specific user profiles
3. Migrate user permissions and roles
4. Handle users with access to both services

#### 1.3 Customer Separation Strategy

**Customer Categorization Logic**:

```sql
-- Migration Query to Categorize Customers
WITH customer_services AS (
  SELECT
    c.id,
    c.business_name,
    CASE
      WHEN c.has_cleaning_contract = true AND c.has_maintenance_contract = false THEN 'CLEANING_ONLY'
      WHEN c.has_cleaning_contract = false AND c.has_maintenance_contract = true THEN 'MAINTENANCE_ONLY'
      WHEN c.has_cleaning_contract = true AND c.has_maintenance_contract = true THEN 'DUAL_SERVICE'
      ELSE 'UNKNOWN'
    END as service_category
  FROM customers c
)
SELECT * FROM customer_services;
```

**Separated Schema**:
```sql
-- Cleaning Customers
CREATE TABLE cleaning_customers (
  id UUID PRIMARY KEY,
  business_name VARCHAR(100),
  contact_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  -- ... cleaning-specific fields
);

-- Maintenance Customers
CREATE TABLE maintenance_customers (
  id UUID PRIMARY KEY,
  business_name VARCHAR(100),
  contact_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  -- ... maintenance-specific fields
);

-- Dual Service Customers (reference table)
CREATE TABLE dual_service_customers (
  id UUID PRIMARY KEY,
  cleaning_customer_id UUID REFERENCES cleaning_customers(id),
  maintenance_customer_id UUID REFERENCES maintenance_customers(id),
  -- ... relationship fields
);
```

#### 1.4 Worker Separation Strategy

**Worker Type Analysis**:

```sql
-- Worker Distribution Analysis
SELECT
  worker_type,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM workers
GROUP BY worker_type;

-- Expected Results:
-- CLEANER: ~60%
-- MAINTENANCE: ~30%
-- BOTH: ~10%
```

**Separated Schema**:
```sql
-- Cleaning Workers
CREATE TABLE cleaning_workers (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  -- ... cleaning-specific fields
);

-- Maintenance Workers
CREATE TABLE maintenance_workers (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  -- ... maintenance-specific fields
);

-- Dual Service Workers
CREATE TABLE dual_service_workers (
  id UUID PRIMARY KEY,
  cleaning_worker_id UUID REFERENCES cleaning_workers(id),
  maintenance_worker_id UUID REFERENCES maintenance_workers(id),
  -- ... synchronization fields
);
```

### Phase 2: Medium-Impact Table Separation

#### 2.1 Property Separation Strategy

**Property Service Assignment**:
```sql
-- Property Service Assignment Logic
WITH property_services AS (
  SELECT
    cp.id,
    cp.property_name,
    cp.customer_id,
    CASE
      WHEN EXISTS(SELECT 1 FROM cleaning_jobs cj WHERE cj.property_id = cp.id)
       AND EXISTS(SELECT 1 FROM maintenance_jobs mj WHERE mj.property_id = cp.id)
      THEN 'DUAL_SERVICE'
      WHEN EXISTS(SELECT 1 FROM cleaning_jobs cj WHERE cj.property_id = cp.id)
      THEN 'CLEANING_ONLY'
      WHEN EXISTS(SELECT 1 FROM maintenance_jobs mj WHERE mj.property_id = cp.id)
      THEN 'MAINTENANCE_ONLY'
      ELSE 'NO_SERVICE'
    END as service_category
  FROM customer_properties cp
)
SELECT * FROM property_services;
```

#### 2.2 Financial Data Separation

**Transaction Categorization**:
```sql
-- Financial Transaction Service Assignment
SELECT
  ft.id,
  ft.amount,
  ft.description,
  ft.category,
  CASE
    WHEN ft.category IN ('CLEANING', 'CLEANING_SUPPLIES') THEN 'CLEANING'
    WHEN ft.category IN ('MAINTENANCE', 'REPAIRS') THEN 'MAINTENANCE'
    WHEN EXISTS(SELECT 1 FROM cleaning_jobs cj WHERE cj.property_id = ft.property_id) THEN 'CLEANING'
    WHEN EXISTS(SELECT 1 FROM maintenance_jobs mj WHERE mj.property_id = ft.property_id) THEN 'MAINTENANCE'
    ELSE 'SHARED'
  END as service_type
FROM financial_transactions ft;
```

## Migration Implementation Plan

### Pre-Migration Checklist
- [ ] Database backup completed
- [ ] Migration environment set up
- [ ] Rollback procedures documented
- [ ] Performance impact analysis completed
- [ ] Stakeholder communication plan in place

### Migration Execution Steps

#### Step 1: Schema Creation
1. Create new database instances for cleaning and maintenance
2. Create shared authentication database
3. Implement new schemas in target databases
4. Set up database users and permissions

#### Step 2: Data Extraction
1. Extract and categorize data from source database
2. Transform data according to new schemas
3. Validate data integrity and relationships
4. Create data mapping documentation

#### Step 3: Data Loading
1. Load data into target databases
2. Verify referential integrity
3. Run data validation scripts
4. Performance testing on new schemas

#### Step 4: Application Updates
1. Update API endpoints for new databases
2. Modify database connection configurations
3. Test application functionality
4. Update monitoring and logging

#### Step 5: Cutover
1. Final data synchronization
2. Application cutover to new databases
3. Monitor system performance
4. Validate end-to-end functionality

## Risk Assessment & Mitigation

### High Risks
1. **Data Loss During Migration**
   - Mitigation: Multiple backup strategies, dry-run migrations
   - Contingency: Rollback procedures documented and tested

2. **Performance Degradation**
   - Mitigation: Performance testing, query optimization
   - Contingency: Database tuning, hardware scaling

3. **Application Downtime**
   - Mitigation: Blue-green deployment, feature flags
   - Contingency: Rollback to previous version

### Medium Risks
1. **Data Integrity Issues**
   - Mitigation: Comprehensive validation scripts
   - Contingency: Data repair procedures

2. **Feature Regression**
   - Mitigation: Comprehensive testing suite
   - Contingency: Hotfix procedures

## Success Criteria

### Technical Success Metrics
- [ ] 100% data integrity maintained
- [ ] <10% performance degradation
- [ ] Zero data loss
- [ ] All existing functionality preserved

### Business Success Metrics
- [ ] No user-facing disruptions
- [ ] Independent scaling capabilities achieved
- [ ] Improved service performance
- [ ] Clear service separation maintained

## Next Steps

1. **Immediate Actions**:
   - Review and approve this separation strategy
   - Set up migration development environment
   - Begin migration script development

2. **Short-term Goals** (Next 2 weeks):
   - Complete database schema design
   - Develop initial migration scripts
   - Set up testing infrastructure

3. **Long-term Goals** (Next 2 months):
   - Complete database migration
   - Update application architecture
   - Deploy separated services

---

**Document Version**: 1.0
**Last Updated**: November 17, 2025
**Status**: Draft for Review
**Next Review**: Architecture team approval