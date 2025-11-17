# Property Management Separation Implementation

## Overview

This document outlines the implementation of property management separation between cleaning and maintenance services. While customer data and properties were migrated in User Story 2.2, this user story focuses specifically on property management workflows, access permissions, and service-specific property features.

## Current State Assessment

From the customer data separation (User Story 2.2), we have already:

1. **Migrated Property Data**: Properties are already separated into cleaning and maintenance databases
2. **Created Property Schemas**: Service-specific property tables with appropriate fields
3. **Established Relationships**: Properties linked to service-specific customers

### Property Distribution Analysis

Based on the previous migration, we now have:

```
Properties Distribution:
├── Cleaning Service Properties:  Properties associated with cleaning contracts
├── Maintenance Service Properties: Properties associated with maintenance contracts
├── Dual-Service Properties: Properties with both cleaning and maintenance services
└── Orphaned Properties: Properties without active service contracts
```

## Enhanced Property Management Features

### 1. Service-Specific Property Workflows

#### Cleaning Service Property Management

```sql
-- Enhanced cleaning property features
ALTER TABLE rightfit_cleaning.cleaning_customer_properties
ADD COLUMN IF NOT EXISTS cleaning_status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE rightfit_cleaning.cleaning_customer_properties
ADD COLUMN IF NOT EXISTS last_cleaned_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE rightfit_cleaning.cleaning_customer_properties
ADD COLUMN IF NOT EXISTS next_scheduled_date DATE;
ALTER TABLE rightfit_cleaning.cleaning_customer_properties
ADD COLUMN IF NOT EXISTS cleaning_score INTEGER DEFAULT 100; -- 0-100 quality score
ALTER TABLE rightfit_cleaning.cleaning_customer_properties
ADD COLUMN IF NOT EXISTS cleaner_feedback JSONB DEFAULT '{}';
ALTER TABLE rightfit_cleaning.cleaning_customer_properties
ADD COLUMN IF NOT EXISTS property_notes TEXT;
ALTER TABLE rightfit_cleaning.cleaning_customer_properties
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Cleaning-specific property indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_properties_status ON rightfit_cleaning.cleaning_customer_properties(cleaning_status);
CREATE INDEX IF NOT EXISTS idx_cleaning_properties_next_clean ON rightfit_cleaning.cleaning_customer_properties(next_scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_properties_score ON rightfit_cleaning.cleaning_customer_properties(cleaning_score);
```

#### Maintenance Service Property Management

```sql
-- Enhanced maintenance property features
ALTER TABLE rightfit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS maintenance_status VARCHAR(20) DEFAULT 'MONITORING';
ALTER TABLE rightfit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS last_inspection_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE rightfit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS next_inspection_date DATE;
ALTER TABLE rightFit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS property_condition JSONB DEFAULT '{}';
ALTER TABLE rightFit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS maintenance_priority VARCHAR(20) DEFAULT 'NORMAL';
ALTER TABLE rightFit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS asset_value DECIMAL(15,2);
ALTER TABLE rightFit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS insurance_details JSONB DEFAULT '{}';
ALTER TABLE rightFit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(20) DEFAULT 'COMPLIANT';
ALTER TABLE rightFit_maintenance.maintenance_customer_properties
ADD COLUMN IF NOT EXISTS maintenance_notes TEXT;

-- Maintenance-specific property indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_properties_status ON rightfit_maintenance.maintenance_customer_properties(maintenance_status);
CREATE INDEX IF NOT EXISTS idx_maintenance_properties_inspection ON rightfit_maintenance.maintenance_customer_properties(next_inspection_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_properties_priority ON rightfit_maintenance.maintenance_customer_properties(maintenance_priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_properties_condition ON rightfit_maintenance.maintenance_customer_properties(property_condition);
```

### 2. Property Service Assignment Logic

#### Property Service Assignment Algorithm

```sql
-- Analyze property-service relationships
WITH property_service_analysis AS (
    SELECT
        ccp.id as cleaning_property_id,
        ccp.property_name,
        ccp.address,
        ccp.postcode,
        mcp.id as maintenance_property_id,

        -- Service assignment logic
        CASE
            -- Property has active cleaning service
            WHEN EXISTS(
                SELECT 1 FROM rightfit_cleaning.cleaning_jobs cj
                WHERE cj.property_id = ccp.id
                AND cj.status NOT IN ('CANCELLED', 'COMPLETED')
                AND cj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
            ) AND EXISTS(
                SELECT 1 FROM rightfit_maintenance.maintenance_jobs mj
                WHERE mj.property_id = mcp.id
                AND mj.status NOT IN ('CANCELLED', 'COMPLETED')
                AND mj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
            ) THEN 'DUAL_SERVICE_ACTIVE'

            -- Property has recent cleaning activity only
            WHEN EXISTS(
                SELECT 1 FROM rightfit_cleaning.cleaning_jobs cj
                WHERE cj.property_id = ccp.id
                AND cj.scheduled_date >= CURRENT_DATE - INTERVAL '60 days'
            ) AND NOT EXISTS(
                SELECT 1 FROM rightfit_maintenance.maintenance_jobs mj
                WHERE mj.property_id = mcp.id
                AND mj.scheduled_date >= CURRENT_DATE - INTERVAL '60 days'
            ) THEN 'CLEANING_PRIMARY'

            -- Property has recent maintenance activity only
            WHEN EXISTS(
                SELECT 1 FROM rightfit_maintenance.maintenance_jobs mj
                WHERE mj.property_id = mcp.id
                AND mj.scheduled_date >= CURRENT_DATE - INTERVAL '60 days'
            ) AND NOT EXISTS(
                SELECT 1 FROM rightfit_cleaning.cleaning_jobs cj
                WHERE cj.property_id = ccp.id
                AND cj.scheduled_date >= CURRENT_DATE - INTERVAL '60 days'
            ) THEN 'MAINTENANCE_PRIMARY'

            -- Property based on customer service type
            WHEN EXISTS(
                SELECT 1 FROM rightfit_cleaning.cleaning_customers cc
                JOIN rightfit_cleaning.cleaning_customer_properties ccp2 ON cc.id = ccp2.customer_id
                WHERE ccp2.id = ccp.id
            ) AND EXISTS(
                SELECT 1 FROM rightfit_maintenance.maintenance_customers mc
                JOIN rightfit_maintenance.maintenance_customer_properties mcp2 ON mc.id = mcp2.customer_id
                WHERE mcp2.id = mcp.id
            ) THEN 'DUAL_SERVICE_CONTRACT'

            -- Property assigned to cleaning customer
            WHEN EXISTS(
                SELECT 1 FROM rightfit_cleaning.cleaning_customers cc
                JOIN rightfit_cleaning.cleaning_customer_properties ccp2 ON cc.id = ccp2.customer_id
                WHERE ccp2.id = ccp.id
            ) THEN 'CLEANING_ASSIGNED'

            -- Property assigned to maintenance customer
            WHEN EXISTS(
                SELECT 1 FROM rightfit_maintenance.maintenance_customers mc
                JOIN rightfit_maintenance.maintenance_customer_properties mcp2 ON mc.id = mcp2.customer_id
                WHERE mcp2.id = mcp.id
            ) THEN 'MAINTENANCE_ASSIGNED'

            ELSE 'UNASSIGNED'
        END as service_assignment,

        -- Activity metrics
        (SELECT COUNT(*) FROM rightfit_cleaning.cleaning_jobs cj WHERE cj.property_id = ccp.id) as cleaning_job_count,
        (SELECT COUNT(*) FROM rightfit_maintenance.maintenance_jobs mj WHERE mj.property_id = mcp.id) as maintenance_job_count,
        (SELECT MAX(cj.scheduled_date) FROM rightfit_cleaning.cleaning_jobs cj WHERE cj.property_id = ccp.id) as last_cleaning_date,
        (SELECT MAX(mj.scheduled_date) FROM rightfit_maintenance.maintenance_jobs mj WHERE mj.property_id = mcp.id) as last_maintenance_date

    FROM rightfit_cleaning.cleaning_customer_properties ccp
    LEFT JOIN rightfit_maintenance.maintenance_customer_properties mcp ON mcp.shared_property_id = ccp.shared_property_id
)
SELECT
    service_assignment,
    COUNT(*) as property_count,
    COUNT(CASE WHEN cleaning_job_count > 0 THEN 1 END) as properties_with_cleaning_jobs,
    COUNT(CASE WHEN maintenance_job_count > 0 THEN 1 END) as properties_with_maintenance_jobs,
    AVG(cleaning_job_count) as avg_cleaning_jobs,
    AVG(maintenance_job_count) as avg_maintenance_jobs
FROM property_service_analysis
GROUP BY service_assignment
ORDER BY property_count DESC;
```

### 3. Property Access Permission System

#### Access Control Implementation

```sql
-- Property access permissions for cleaning service
CREATE TABLE IF NOT EXISTS rightfit_cleaning.property_access_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    property_id UUID NOT NULL REFERENCES rightfit_cleaning.cleaning_customer_properties(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('VIEW', 'EDIT', 'MANAGE', 'ADMIN')),
    granted_by_user_id UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Constraints
    CONSTRAINT property_access_permissions_unique UNIQUE (user_id, property_id, permission_level)
);

-- Property access permissions for maintenance service
CREATE TABLE IF NOT EXISTS rightfit_maintenance.property_access_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    property_id UUID NOT NULL REFERENCES rightfit_maintenance.maintenance_customer_properties(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('VIEW', 'EDIT', 'MANAGE', 'ADMIN')),
    granted_by_user_id UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Constraints
    CONSTRAINT property_access_permissions_unique UNIQUE (user_id, property_id, permission_level)
);

-- Property access indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_property_access_user ON rightfit_cleaning.property_access_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_property_access_property ON rightfit_cleaning.property_access_permissions(property_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_property_access_level ON rightfit_cleaning.property_access_permissions(permission_level);
CREATE INDEX IF NOT EXISTS idx_cleaning_property_access_active ON rightfit_cleaning.property_access_permissions(is_active);

CREATE INDEX IF NOT EXISTS idx_maintenance_property_access_user ON rightfit_maintenance.property_access_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_access_property ON rightfit_maintenance.property_access_permissions(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_access_level ON rightfit_maintenance.property_access_permissions(permission_level);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_access_active ON rightfit_maintenance.property_access_permissions(is_active);
```

#### Permission Assignment Logic

```sql
-- Assign property access based on customer relationships and user roles
WITH property_permission_assignment AS (
    -- Get users and their service relationships
    SELECT
        cu.id as user_id,
        cu.role as user_role,
        cu.tenant_id,
        ccp.id as property_id,
        cu.customer_id,
        CASE
            -- Property managers get admin access to their customers' properties
            WHEN cu.role = 'ADMIN' THEN 'ADMIN'

            -- Standard users get edit access to their assigned properties
            WHEN cu.role = 'MEMBER' THEN 'EDIT'

            -- Contractors get manage access to assigned properties
            WHEN cu.role = 'CONTRACTOR' THEN 'MANAGE'

            ELSE 'VIEW'
        END as permission_level,
        NOW() as granted_at,
        NULL as expires_at,
        'Auto-assigned based on role' as notes
    FROM rightfit_cleaning.cleaning_users cu
    JOIN rightfit_cleaning.cleaning_customer_properties ccp ON ccp.customer_id = (
        SELECT cc.customer_id FROM rightfit_cleaning.cleaning_customers cc
        WHERE cc.id = cu.id
    )
)
INSERT INTO rightfit_cleaning.property_access_permissions (
    user_id, property_id, permission_level, granted_at, expires_at, notes
)
SELECT DISTINCT ON (user_id, property_id)
    user_id, property_id, permission_level, granted_at, expires_at, notes
FROM property_permission_assignment
ON CONFLICT (user_id, property_id, permission_level) DO UPDATE SET
    is_active = true,
    granted_at = EXCLUDED.granted_at,
    notes = EXCLUDED.notes;
```

### 4. Property Management Interface Updates

#### Enhanced Property Management API

```typescript
// src/services/PropertyService.ts (Cleaning Service)
export class PropertyService {
    async getPropertyDashboard(userId: string): Promise<PropertyDashboard> {
        const query = `
            SELECT
                COUNT(*) as total_properties,
                COUNT(CASE WHEN cleaning_status = 'ACTIVE' THEN 1 END) as active_properties,
                COUNT(CASE WHEN next_scheduled_date <= CURRENT_DATE THEN 1 END) as scheduled_today,
                AVG(cleaning_score) as avg_cleaning_score,
                COUNT(CASE WHEN last_cleaned_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as cleaned_this_week,
                COUNT(CASE WHEN cleaner_feedback IS NOT NULL AND jsonb_array_length(cleaner_feedback) > 0 THEN 1 END) as properties_with_feedback
            FROM cleaning_customer_properties ccp
            WHERE ccp.id IN (
                SELECT property_id FROM property_access_permissions
                WHERE user_id = $1 AND is_active = true
            )
        `;

        const result = await this.db.query(query, [userId]);
        return result.rows[0];
    }

    async getPropertyMaintenanceAlerts(userId: string): Promise<PropertyAlert[]> {
        const query = `
            SELECT
                ccp.id,
                ccp.property_name,
                ccp.address,
                ccp.cleaning_status,
                CASE
                    WHEN EXISTS(
                        SELECT 1 FROM cleaning_jobs cj
                        WHERE cj.property_id = ccp.id
                        AND cj.status = 'COMPLETED'
                        AND EXISTS(
                            SELECT 1 FROM worker_issue_reports wir
                            WHERE wir.cleaning_job_id = cj.id
                            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                        )
                    ) THEN 'MAINTENANCE_ISSUES_FOUND'
                    WHEN next_scheduled_date IS NULL OR next_scheduled_date < CURRENT_DATE THEN 'SCHEDULING_NEEDED'
                    WHEN cleaning_score < 70 THEN 'LOW_CLEANING_SCORE'
                    ELSE 'NORMAL'
                END as alert_type,
                CASE
                    WHEN EXISTS(
                        SELECT 1 FROM cleaning_jobs cj
                        WHERE cj.property_id = ccp.id
                        AND cj.status = 'COMPLETED'
                        AND EXISTS(
                            SELECT 1 FROM worker_issue_reports wir
                            WHERE wir.cleaning_job_id = cj.id
                            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                        )
                    ) THEN (SELECT jsonb_agg(wir.title) FROM worker_issue_reports wir JOIN cleaning_jobs cj ON wir.cleaning_job_id = cj.id WHERE cj.property_id = ccp.id AND wir.created_at >= CURRENT_DATE - INTERVAL '7 days')
                    ELSE NULL
                END as alert_details
            FROM cleaning_customer_properties ccp
            WHERE ccp.id IN (
                SELECT property_id FROM property_access_permissions
                WHERE user_id = $1 AND is_active = true
            )
            AND (next_scheduled_date IS NULL OR next_scheduled_date < CURRENT_DATE OR cleaning_score < 70 OR EXISTS(
                SELECT 1 FROM cleaning_jobs cj
                WHERE cj.property_id = ccp.id
                AND cj.status = 'COMPLETED'
                AND EXISTS(
                    SELECT 1 FROM worker_issue_reports wir
                    WHERE wir.cleaning_job_id = cj.id
                    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                )
            ))
        `;

        const result = await this.db.query(query, [userId]);
        return result.rows;
    }

    async getPropertyServiceAssignment(propertyId: string): Promise<ServiceAssignment> {
        const query = `
            SELECT
                ccp.id,
                ccp.property_name,
                ccp.address,
                ccp.postcode,
                CASE
                    WHEN EXISTS(
                        SELECT 1 FROM cleaning_jobs cj
                        WHERE cj.property_id = ccp.id
                        AND cj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
                    ) AND EXISTS(
                        SELECT 1 FROM maintenance_jobs mj
                        WHERE mj.property_id = mcp.id AND mcp.shared_property_id = ccp.shared_property_id
                        AND mj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
                    ) THEN 'DUAL_SERVICE'
                    WHEN EXISTS(
                        SELECT 1 FROM cleaning_jobs cj
                        WHERE cj.property_id = ccp.id
                        AND cj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
                    ) THEN 'CLEANING_ONLY'
                    WHEN EXISTS(
                        SELECT 1 FROM maintenance_jobs mj
                        WHERE mj.property_id = mcp.id AND mcp.shared_property_id = ccp.shared_property_id
                        AND mj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
                    ) THEN 'MAINTENANCE_ONLY'
                    ELSE 'NO_SERVICE'
                END as service_assignment,
                (SELECT COUNT(*) FROM cleaning_jobs cj WHERE cj.property_id = ccp.id AND cj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days') as cleaning_job_count,
                (SELECT COUNT(*) FROM maintenance_jobs mj WHERE mj.property_id = mcp.id AND mcp.shared_property_id = ccp.shared_property_id AND mj.scheduled_date >= CURRENT_DATE - INTERVAL '30 days') as maintenance_job_count
            FROM cleaning_customer_properties ccp
            LEFT JOIN maintenance_customer_properties mcp ON mcp.shared_property_id = ccp.shared_property_id
            WHERE ccp.id = $1
        `;

        const result = await this.db.query(query, [propertyId]);
        return result.rows[0];
    }
}
```

### 5. Property Data Synchronization

#### Shared Property Updates

```sql
-- Create shared property updates trigger
CREATE OR REPLACE FUNCTION sync_property_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync property status changes to shared reference
    IF TG_OP = 'UPDATE' THEN
        -- Update shared property reference (if exists)
        UPDATE rightfit_shared_auth.shared_property_links spl
        SET
            updated_at = NOW(),
            service_combination = CASE
                WHEN EXISTS(SELECT 1 FROM rightfit_cleaning.cleaning_customer_properties ccp WHERE ccp.shared_property_id = spl.shared_property_id AND ccp.is_active = true)
                AND EXISTS(SELECT 1 FROM rightfit_maintenance.maintenance_customer_properties mcp WHERE mcp.shared_property_id = spl.shared_property_id AND mcp.is_active = true)
                THEN 'DUAL_SERVICE'
                WHEN EXISTS(SELECT 1 FROM rightfit_cleaning.cleaning_customer_properties ccp WHERE ccp.shared_property_id = spl.shared_property_id AND ccp.is_active = true)
                THEN 'CLEANING_ONLY'
                WHEN EXISTS(SELECT 1 FROM rightfit_maintenance.maintenance_customer_properties mcp WHERE mcp.shared_property_id = spl.shared_property_id AND mcp.is_active = true)
                THEN 'MAINTENANCE_ONLY'
                ELSE 'INACTIVE'
            END
        WHERE spl.shared_property_id = COALESCE(NEW.shared_property_id, OLD.shared_property_id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (if shared reference tables exist)
-- CREATE TRIGGER trigger_sync_cleaning_property_updates
--     AFTER UPDATE ON rightfit_cleaning.cleaning_customer_properties
--     FOR EACH ROW EXECUTE FUNCTION sync_property_updates();

-- CREATE TRIGGER trigger_sync_maintenance_property_updates
--     AFTER UPDATE ON rightfit_maintenance.maintenance_customer_properties
--     FOR EACH ROW EXECUTE FUNCTION sync_property_updates();
```

### 6. Property Management Workflows

#### Cleaning Property Workflow

```typescript
// src/services/CleaningPropertyWorkflow.ts
export class CleaningPropertyWorkflow {
    async schedulePropertyCleaning(propertyId: string, scheduledDate: Date, cleanerId: string): Promise<CleaningJob> {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            // Create cleaning job
            const jobQuery = `
                INSERT INTO cleaning_jobs (
                    property_id, customer_id, scheduled_date, assigned_worker_id,
                    status, checklist_template_id, created_at, updated_at
                )
                SELECT
                    $1, customer_id, $2, $3,
                    'SCHEDULED', checklist_template_id, NOW(), NOW()
                FROM cleaning_customer_properties
                WHERE id = $1
                RETURNING *
            `;

            const result = await client.query(jobQuery, [propertyId, scheduledDate, cleanerId]);
            const job = result.rows[0];

            // Update property next scheduled date
            await client.query(`
                UPDATE cleaning_customer_properties
                SET
                    next_scheduled_date = $1,
                    cleaning_status = 'SCHEDULED',
                    updated_at = NOW()
                WHERE id = $2
            `, [scheduledDate, propertyId]);

            // Create property access for cleaner if not exists
            await client.query(`
                INSERT INTO property_access_permissions (user_id, property_id, permission_level, granted_at, notes)
                VALUES ($1, $2, 'MANAGE', NOW(), 'Auto-assigned for scheduled cleaning')
                ON CONFLICT (user_id, property_id, permission_level) DO UPDATE SET
                    is_active = true,
                    granted_at = EXCLUDED.granted_at
            `, [cleanerId, propertyId]);

            await client.query('COMMIT');
            return job;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async recordCleaningFeedback(propertyId: string, cleanerId: string, feedback: CleaningFeedback): Promise<void> {
        const query = `
            UPDATE cleaning_customer_properties
            SET
                cleaner_feedback = jsonb_set(
                    COALESCE(cleaner_feedback, '[]'::jsonb),
                    array_length(cleaner_feedback),
                    $2::jsonb
                ),
                cleaning_score = CASE
                    WHEN $3 IS NOT NULL THEN
                        GREATEST(0, LEAST(100,
                            (SELECT AVG(CAST(jsonb_extract_path_text(cleaner_feedback, '$.rating') AS INTEGER))
                             FROM cleaning_customer_properties
                             WHERE cleaning_feedback IS NOT NULL AND id = $1
                            )
                        ))
                    ELSE cleaning_score
                END,
                updated_at = NOW()
            WHERE id = $1
        `;

        await this.db.query(query, [propertyId, JSON.stringify(feedback), feedback.rating]);

        // Log maintenance issues if found
        if (feedback.maintenanceIssues && feedback.maintenanceIssues.length > 0) {
            await this.logMaintenanceIssues(propertyId, cleanerId, feedback.maintenanceIssues);
        }
    }

    async logMaintenanceIssues(propertyId: string, cleanerId: string, issues: MaintenanceIssue[]): Promise<void> {
        for (const issue of issues) {
            // Create maintenance work order
            await this.createMaintenanceWorkOrder(propertyId, cleanerId, issue);

            // Update property maintenance alert status
            await this.db.query(`
                UPDATE cleaning_customer_properties
                SET cleaning_status = 'MAINTENANCE_REQUIRED',
                    updated_at = NOW()
                WHERE id = $1
            `, [propertyId]);
        }
    }

    private async createMaintenanceWorkOrder(propertyId: string, cleanerId: string, issue: MaintenanceIssue): Promise<void> {
        // This would integrate with the maintenance service API
        // For now, we'll log it in a staging table
        const query = `
            INSERT INTO maintenance_issue_queue (
                property_id, reported_by_user_id, issue_type, issue_description,
                severity, priority, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', NOW())
        `;

        await this.db.query(query, [
            propertyId,
            cleanerId,
            issue.type,
            issue.description,
            issue.severity || 'MEDIUM',
            issue.priority || 'NORMAL'
        ]);
    }
}
```

### 7. Property Management Dashboard

#### Dashboard Metrics and Analytics

```sql
-- Property management dashboard metrics
WITH property_dashboard AS (
    -- Cleaning service metrics
    SELECT
        'CLEANING' as service_type,
        COUNT(*) as total_properties,
        COUNT(CASE WHEN cleaning_status = 'ACTIVE' THEN 1 END) as active_properties,
        COUNT(CASE WHEN next_scheduled_date <= CURRENT_DATE THEN 1 END) as scheduled_today,
        COUNT(CASE WHEN last_cleaned_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as cleaned_this_week,
        AVG(cleaning_score) as avg_cleaning_score,
        COUNT(CASE WHEN cleaning_score < 70 THEN 1 END) as low_score_properties
    FROM cleaning_customer_properties

    UNION ALL

    -- Maintenance service metrics
    SELECT
        'MAINTENANCE' as service_type,
        COUNT(*) as total_properties,
        COUNT(CASE WHEN maintenance_status = 'ACTIVE' THEN 1 END) as active_properties,
        COUNT(CASE WHEN next_inspection_date <= CURRENT_DATE THEN 1 END) as inspection_today,
        COUNT(CASE WHEN last_inspection_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as inspected_this_week,
        AVG(CAST(jsonb_extract_path_text(maintenance_condition, '$.overall') AS INTEGER)) as avg_condition_score,
        COUNT(CASE WHEN maintenance_priority = 'URGENT' THEN 1 END) as urgent_properties
    FROM maintenance_customer_properties
)
SELECT * FROM property_dashboard;

-- Property activity trends
SELECT
    date_trunc('day', created_at) as activity_date,
    'properties_created' as activity_type,
    COUNT(*) as activity_count
FROM (
    SELECT created_at FROM cleaning_customer_properties
    UNION ALL
    SELECT created_at FROM maintenance_customer_properties
) all_properties
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date_trunc('day', created_at)
ORDER BY activity_date DESC;
```

---

**Implementation Status**: Ready for development
**Dependencies**: Customer data separation (User Story 2.2) must be completed
**Estimated Timeline**: 2-3 days for implementation
**Testing**: Comprehensive integration testing required

**Key Features Implemented**:
- Enhanced property schemas with service-specific fields
- Property service assignment logic and algorithms
- Access permission system with role-based controls
- Property management workflows and automation
- Data synchronization between services
- Comprehensive dashboard metrics and analytics