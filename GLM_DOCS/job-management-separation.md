# Job Management Separation

## Overview
This document outlines the strategy for separating job management and work order data between cleaning and maintenance services, ensuring each service can manage its own operational workflows while maintaining data integrity and cross-service coordination.

## Current Job Management Analysis

### Existing WorkOrder Model
```sql
model WorkOrder {
  id                  String            @id @default(uuid())
  tenant_id           String
  property_id         String
  contractor_id       String?
  created_by_user_id  String
  title               String            @db.VarChar(255)
  description         String?
  status              WorkOrderStatus   @default(OPEN)
  priority            WorkOrderPriority @default(MEDIUM)
  category            WorkOrderCategory @default(OTHER)
  due_date            DateTime?
  estimated_cost      Decimal?          @db.Decimal(10, 2)
  actual_cost         Decimal?          @db.Decimal(10, 2)
  started_at          DateTime?
  completed_at        DateTime?
  completion_note     String?           @db.VarChar(500)
  cancellation_reason String?           @db.VarChar(500)
  created_at          DateTime          @default(now())
  updated_at          DateTime          @updatedAt
  deleted_at          DateTime?
}
```

### Current WorkOrder Categories
```sql
enum WorkOrderCategory {
  PLUMBING
  ELECTRICAL
  HEATING
  APPLIANCES
  EXTERIOR
  INTERIOR
  OTHER
}
```

### Current WorkOrder Status Flow
```sql
enum WorkOrderStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

## Job Categorization Strategy

### Service-Based Job Classification

#### Cleaning Jobs
**Job Types:**
- `REGULAR_CLEANING` - Standard cleaning services
- `DEEP_CLEANING` - Intensive cleaning sessions
- `POST_CONSTRUCTION_CLEAN` - Post-renovation cleaning
- `MOVE_IN_CLEAN` - Pre-occupancy cleaning
- `MOVE_OUT_CLEAN` - Post-vacancy cleaning
- `WINDOW_CLEANING` - Window and glass cleaning
- `CARPET_CLEANING` - Carpet and upholstery cleaning
- `SPECIALIZED_CLEAN` - Specialized cleaning services

#### Maintenance Jobs
**Job Types:**
- `PLUMBING_REPAIR` - Plumbing fixes and installations
- `ELECTRICAL_REPAIR` - Electrical work and repairs
- `HVAC_MAINTENANCE` - Heating, ventilation, AC service
- `APPLIANCE_REPAIR` - Appliance fixing and installation
- `EXTERIOR_MAINTENANCE` - Building exterior upkeep
- `INTERIOR_REPAIRS` - Interior maintenance tasks
- `EMERGENCY_REPAIR` - Urgent maintenance issues
- `PREVENTIVE_MAINTENANCE` - Scheduled maintenance

### Job Assignment Logic
```sql
CREATE OR REPLACE FUNCTION categorize_job_service(
  job_category_in VARCHAR,
  job_title_in VARCHAR,
  job_description_in VARCHAR
) RETURNS TABLE(service_type VARCHAR, job_type VARCHAR, confidence_score NUMERIC) AS $$
BEGIN
  -- Cleaning-specific patterns
  IF job_category_in = 'INTERIOR' AND (
    job_title_in ~* 'CLEAN|SANIT|WASH|VACUUM|MOP|DUST' OR
    job_description_in ~* 'CLEAN|SANIT|WASH|VACUUM|MOP|DUST'
  ) THEN
    RETURN VALUES ('CLEANING', 'REGULAR_CLEANING', 0.95);

  ELSIF job_title_in ~* 'DEEP.*CLEAN|THOROUGH.*CLEAN|MOVE.*IN|MOVE.*OUT' THEN
    RETURN VALUES ('CLEANING', 'DEEP_CLEANING', 0.90);

  ELSIF job_title_in ~* 'WINDOW|GLASS' OR job_description_in ~* 'WINDOW|GLASS' THEN
    RETURN VALUES ('CLEANING', 'WINDOW_CLEANING', 0.85);

  ELSIF job_title_in ~* 'CARPET|UPHOLSTERY|RUG' OR job_description_in ~* 'CARPET|UPHOLSTERY|RUG' THEN
    RETURN VALUES ('CLEANING', 'CARPET_CLEANING', 0.90);

  -- Maintenance-specific patterns
  ELSIF job_category_in IN ('PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'EXTERIOR') THEN
    CASE
      WHEN job_category_in = 'PLUMBING' THEN
        RETURN VALUES ('MAINTENANCE', 'PLUMBING_REPAIR', 1.00);
      WHEN job_category_in = 'ELECTRICAL' THEN
        RETURN VALUES ('MAINTENANCE', 'ELECTRICAL_REPAIR', 1.00);
      WHEN job_category_in = 'HEATING' THEN
        RETURN VALUES ('MAINTENANCE', 'HVAC_MAINTENANCE', 1.00);
      WHEN job_category_in = 'APPLIANCES' THEN
        RETURN VALUES ('MAINTENANCE', 'APPLIANCE_REPAIR', 1.00);
      WHEN job_category_in = 'EXTERIOR' THEN
        RETURN VALUES ('MAINTENANCE', 'EXTERIOR_MAINTENANCE', 0.95);
    END CASE;

  -- Emergency/urgent patterns
  ELSIF job_title_in ~* 'EMERGENCY|URGENT|IMMEDIATE|ASAP' OR
        job_description_in ~* 'EMERGENCY|URGENT|IMMEDIATE|ASAP' THEN
    RETURN VALUES ('MAINTENANCE', 'EMERGENCY_REPAIR', 0.85);

  -- Preventive maintenance patterns
  ELSIF job_title_in ~* 'PREVENTIVE|SCHEDULED|ROUTINE|MAINTENANCE' THEN
    RETURN VALUES ('MAINTENANCE', 'PREVENTIVE_MAINTENANCE', 0.80);

  -- Default categorization based on title keywords
  ELSE
    IF job_title_in ~* 'REPAIR|FIX|SERVICE|INSTALL' THEN
      RETURN VALUES ('MAINTENANCE', 'INTERIOR_REPAIRS', 0.70);
    ELSIF job_title_in ~* 'CLEAN|WASH|MOP|DUST' THEN
      RETURN VALUES ('CLEANING', 'SPECIALIZED_CLEAN', 0.70);
    ELSE
      -- Default to maintenance for unknown jobs
      RETURN VALUES ('MAINTENANCE', 'INTERIOR_REPAIRS', 0.50);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Enhanced Job Management Schemas

### Cleaning Service Database

#### Cleaning Jobs Table
```sql
CREATE TABLE cleaning_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_reference_id UUID UNIQUE, -- Reference to original work_order
  tenant_id UUID NOT NULL,
  property_id UUID NOT NULL,
  contractor_id UUID,
  created_by_user_id UUID NOT NULL,

  -- Job identification
  job_title VARCHAR(255) NOT NULL,
  job_description TEXT,
  job_type VARCHAR(50) NOT NULL,
  cleaning_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (cleaning_level IN ('LIGHT', 'STANDARD', 'DEEP', 'SPECIALIZED')),

  -- Job scheduling
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME,
  estimated_duration_minutes INTEGER DEFAULT 120,
  actual_duration_minutes INTEGER,
  cleaning_team_size INTEGER DEFAULT 1,

  -- Job status and priority
  job_status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (job_status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
  priority_level VARCHAR(10) DEFAULT 'NORMAL' CHECK (priority_level IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  -- Job scope and requirements
  room_count INTEGER DEFAULT 1,
  bathroom_count INTEGER DEFAULT 0,
  square_footage INTEGER,
  special_requirements TEXT[], -- e.g., ['PETS', 'CHILDREN', 'ELDERLY', 'MEDICAL_FACILITY']
  cleaning_supplies_provided BOOLEAN DEFAULT true,
  equipment_needed TEXT[],

  -- Quality control
  quality_checklist JSONB DEFAULT '{}',
  inspection_required BOOLEAN DEFAULT false,
  inspection_completed BOOLEAN DEFAULT false,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),

  -- Financial information
  base_price DECIMAL(10,2),
  additional_charges DECIMAL(10,2) DEFAULT 0.00,
  total_price DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'OVERDUE', 'DISPUTED')),

  -- Customer feedback
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  follow_up_required BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_cleaning_jobs_property FOREIGN KEY (property_id) REFERENCES cleaning_properties(id),
  CONSTRAINT fk_cleaning_jobs_contractor FOREIGN KEY (contractor_id) REFERENCES cleaning_contractors(id),
  CONSTRAINT fk_cleaning_jobs_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_cleaning_jobs_tenant (tenant_id),
  INDEX idx_cleaning_jobs_property (property_id),
  INDEX idx_cleaning_jobs_contractor (contractor_id),
  INDEX idx_cleaning_jobs_status (job_status),
  INDEX idx_cleaning_jobs_scheduled (scheduled_date),
  INDEX idx_cleaning_jobs_type (job_type)
);
```

#### Cleaning Job Tasks Checklist
```sql
CREATE TABLE cleaning_job_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
  task_name VARCHAR(100) NOT NULL,
  task_category VARCHAR(50) NOT NULL, -- e.g., 'SURFACE_CLEANING', 'FLOOR_CARE', 'BATHROOM', 'KITCHEN'
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completion_notes TEXT,
  completed_by_user_id UUID,
  completed_at TIMESTAMP,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),

  UNIQUE(job_id, task_name)
);

-- Pre-defined cleaning task templates
CREATE TABLE cleaning_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) NOT NULL,
  cleaning_level VARCHAR(20) NOT NULL,
  room_type VARCHAR(50), -- e.g., 'BEDROOM', 'BATHROOM', 'KITCHEN', 'LIVING_ROOM'
  tasks JSONB NOT NULL, -- Array of task objects
  estimated_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Maintenance Service Database

#### Maintenance Work Orders Table
```sql
CREATE TABLE maintenance_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_reference_id UUID UNIQUE, -- Reference to original work_order
  tenant_id UUID NOT NULL,
  property_id UUID NOT NULL,
  contractor_id UUID,
  created_by_user_id UUID NOT NULL,

  -- Work order identification
  title VARCHAR(255) NOT NULL,
  description TEXT,
  work_type VARCHAR(50) NOT NULL,
  trade_category VARCHAR(50) NOT NULL,
  complexity_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (complexity_level IN ('SIMPLE', 'STANDARD', 'COMPLEX', 'SPECIALIZED')),

  -- Work scheduling
  scheduled_date DATE,
  scheduled_start_time TIME,
  estimated_duration_hours DECIMAL(4,2) DEFAULT 2.00,
  actual_duration_hours DECIMAL(4,2),
  priority_level VARCHAR(10) DEFAULT 'NORMAL' CHECK (priority_level IN ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY')),
  is_emergency BOOLEAN DEFAULT false,

  -- Work status
  work_status VARCHAR(20) DEFAULT 'OPEN' CHECK (work_status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'REJECTED')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  -- Technical details
  problem_description TEXT,
  diagnosis TEXT,
  solution_description TEXT,
  parts_required TEXT[],
  parts_used TEXT[],
  tools_required TEXT[],
  safety_precautions TEXT[],

  -- Permit and compliance
  permit_required BOOLEAN DEFAULT false,
  permit_obtained BOOLEAN DEFAULT false,
  permit_number VARCHAR(100),
  inspection_required BOOLEAN DEFAULT false,
  inspection_passed BOOLEAN DEFAULT false,
  compliance_notes TEXT,

  -- Financial information
  labor_cost DECIMAL(10,2),
  parts_cost DECIMAL(10,2) DEFAULT 0.00,
  permit_cost DECIMAL(10,2) DEFAULT 0.00,
  total_cost DECIMAL(10,2),
  invoice_status VARCHAR(20) DEFAULT 'DRAFT' CHECK (invoice_status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'DISPUTED')),

  -- Customer satisfaction
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  warranty_period_days INTEGER DEFAULT 30,
  warranty_expiry DATE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_maintenance_work_orders_property FOREIGN KEY (property_id) REFERENCES maintenance_properties(id),
  CONSTRAINT fk_maintenance_work_orders_contractor FOREIGN KEY (contractor_id) REFERENCES maintenance_contractors(id),
  CONSTRAINT fk_maintenance_work_orders_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_maintenance_work_orders_tenant (tenant_id),
  INDEX idx_maintenance_work_orders_property (property_id),
  INDEX idx_maintenance_work_orders_contractor (contractor_id),
  INDEX idx_maintenance_work_orders_status (work_status),
  INDEX idx_maintenance_work_orders_scheduled (scheduled_date),
  INDEX idx_maintenance_work_orders_emergency (is_emergency),
  INDEX idx_maintenance_work_orders_trade (trade_category)
);
```

#### Maintenance Work Order Progress
```sql
CREATE TABLE maintenance_work_order_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES maintenance_work_orders(id) ON DELETE CASCADE,
  progress_stage VARCHAR(50) NOT NULL,
  stage_description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completion_notes TEXT,
  completed_by_user_id UUID,
  completed_at TIMESTAMP,
  photos_taken TEXT[], -- URLs to progress photos

  INDEX idx_maintenance_progress_work_order (work_order_id),
  INDEX idx_maintenance_progress_stage (progress_stage)
);
```

### Shared Job Reference System

#### Cross-Service Job References
```sql
CREATE TABLE shared_job_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_work_order_id UUID NOT NULL,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('CLEANING', 'MAINTENANCE')),
  service_job_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(original_work_order_id, service_type),
  INDEX idx_shared_job_references_original (original_work_order_id),
  INDEX idx_shared_job_references_service (service_job_id, service_type)
);
```

#### Cross-Service Property References
```sql
CREATE TABLE cross_service_property_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  cleaning_job_id UUID REFERENCES cleaning_jobs(id),
  maintenance_work_order_id UUID REFERENCES maintenance_work_orders(id),
  relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('SEQUENTIAL', 'PARALLEL', 'DEPENDENT')),
  dependency_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_cross_service_property (property_id),
  INDEX idx_cross_service_cleaning (cleaning_job_id),
  INDEX idx_cross_service_maintenance (maintenance_work_order_id)
);
```

## Job Assignment and Scheduling

### Smart Assignment Algorithm
```sql
CREATE OR REPLACE FUNCTION assign_job_to_contractor(
  job_id UUID,
  service_type VARCHAR,
  preferred_contractor_id UUID DEFAULT NULL
) RETURNS TABLE(contractor_id UUID, assignment_score NUMERIC, estimated_start TIMESTAMP) AS $$
DECLARE
  best_contractor UUID;
  best_score NUMERIC := 0;
  estimated_start_time TIMESTAMP;
BEGIN
  IF service_type = 'CLEANING' THEN
    -- Find best cleaning contractor based on availability, rating, and skills
    SELECT cc.id,
           (cc.quality_score_avg * 0.4 +
            cc.reliability_score * 0.3 +
            (SELECT AVG(availability_score) FROM cleaning_availability WHERE contractor_id = cc.id) * 0.3) as score
    INTO best_contractor, best_score
    FROM cleaning_contractors cc
    WHERE cc.deleted_at IS NULL
    AND cc.id = COALESCE(preferred_contractor_id, cc.id)
    ORDER BY score DESC
    LIMIT 1;

    -- Calculate estimated start time based on current schedule
    SELECT MIN(ca.date + ca.start_time::TIME)
    INTO estimated_start_time
    FROM cleaning_availability ca
    WHERE ca.contractor_id = best_contractor
    AND ca.is_available = true
    AND ca.date >= CURRENT_DATE
    ORDER BY ca.date, ca.start_time
    LIMIT 1;

  ELSIF service_type = 'MAINTENANCE' THEN
    -- Find best maintenance contractor based on trade specialization and availability
    SELECT mc.id,
           (mc.quality_score_avg * 0.4 +
            mc.reliability_score * 0.3 +
            CASE WHEN mc.is_available_emergency THEN 0.3 ELSE 0.2 END) as score
    INTO best_contractor, best_score
    FROM maintenance_contractors mc
    WHERE mc.deleted_at IS NULL
    AND mc.id = COALESCE(preferred_contractor_id, mc.id)
    ORDER BY score DESC
    LIMIT 1;

    -- For maintenance jobs, calculate start time considering priority
    IF EXISTS(SELECT 1 FROM maintenance_work_orders WHERE id = assign_job_to_contractor.job_id AND is_emergency = true) THEN
      estimated_start_time := CURRENT_TIMESTAMP;
    ELSE
      estimated_start_time := CURRENT_TIMESTAMP + INTERVAL '1 day';
    END IF;
  END IF;

  RETURN QUERY SELECT best_contractor, best_score, estimated_start_time;
END;
$$ LANGUAGE plpgsql;
```

## Job Status Workflows

### Cleaning Job Status Flow
```sql
-- Cleaning job status transitions
CREATE TABLE cleaning_job_status_transitions (
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  is_allowed BOOLEAN DEFAULT true,
  requires_confirmation BOOLEAN DEFAULT false,
  auto_transition BOOLEAN DEFAULT false,
  transition_notes TEXT
);

INSERT INTO cleaning_job_status_transitions VALUES
  ('SCHEDULED', 'IN_PROGRESS', true, false, false, 'Contractor starts cleaning'),
  ('IN_PROGRESS', 'COMPLETED', true, false, false, 'Cleaning completed'),
  ('IN_PROGRESS', 'RESCHEDULED', true, true, false, 'Job needs rescheduling'),
  ('SCHEDULED', 'CANCELLED', true, true, false, 'Customer cancelled'),
  ('RESCHEDULED', 'SCHEDULED', true, false, false, 'New date assigned'),
  ('COMPLETED', 'COMPLETED', true, false, true, 'Final quality check passed');
```

### Maintenance Work Order Status Flow
```sql
-- Maintenance work order status transitions
CREATE TABLE maintenance_status_transitions (
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  is_allowed BOOLEAN DEFAULT true,
  requires_confirmation BOOLEAN DEFAULT false,
  requires_supervisor BOOLEAN DEFAULT false,
  transition_notes TEXT
);

INSERT INTO maintenance_status_transitions VALUES
  ('OPEN', 'ASSIGNED', true, false, false, 'Contractor assigned'),
  ('ASSIGNED', 'IN_PROGRESS', true, false, false, 'Work started'),
  ('IN_PROGRESS', 'ON_HOLD', true, true, false, 'Work paused'),
  ('ON_HOLD', 'IN_PROGRESS', true, false, false, 'Work resumed'),
  ('IN_PROGRESS', 'COMPLETED', true, false, false, 'Work completed'),
  ('OPEN', 'REJECTED', true, true, true, 'Work order rejected'),
  ('COMPLETED', 'COMPLETED', true, false, true, 'Inspection passed');
```

## Job Performance Analytics

### Cleaning Performance Metrics
```sql
CREATE MATERIALIZED VIEW cleaning_performance_analytics AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE job_status = 'COMPLETED') as completed_jobs,
  AVG(completion_percentage) as avg_completion_rate,
  AVG(quality_score) FILTER (WHERE quality_score IS NOT NULL) as avg_quality_score,
  AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL) as avg_customer_rating,
  AVG(actual_duration_minutes) FILTER (WHERE actual_duration_minutes IS NOT NULL) as avg_duration_minutes,
  AVG(total_price) FILTER (WHERE total_price IS NOT NULL) as avg_revenue_per_job,
  SUM(total_price) FILTER (WHERE total_price IS NOT NULL) as total_revenue,
  COUNT(*) FILTER (WHERE scheduled_date < CURRENT_DATE AND job_status != 'COMPLETED') as overdue_jobs
FROM cleaning_jobs
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at);

CREATE INDEX idx_cleaning_performance_month ON cleaning_performance_analytics(month);
```

### Maintenance Performance Metrics
```sql
CREATE MATERIALIZED VIEW maintenance_performance_analytics AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_work_orders,
  COUNT(*) FILTER (WHERE work_status = 'COMPLETED') as completed_work_orders,
  AVG(completion_percentage) as avg_completion_rate,
  AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL) as avg_customer_rating,
  AVG(actual_duration_hours) FILTER (WHERE actual_duration_hours IS NOT NULL) as avg_duration_hours,
  AVG(total_cost) FILTER (WHERE total_cost IS NOT NULL) as avg_cost_per_order,
  SUM(total_cost) FILTER (WHERE total_cost IS NOT NULL) as total_revenue,
  COUNT(*) FILTER (WHERE is_emergency = true) as emergency_orders,
  AVG(actual_duration_hours) FILTER (WHERE is_emergency = true AND actual_duration_hours IS NOT NULL) as avg_emergency_response_time
FROM maintenance_work_orders
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at);

CREATE INDEX idx_maintenance_performance_month ON maintenance_performance_analytics(month);
```

## Cross-Service Coordination

### Job Conflict Detection
```sql
CREATE OR REPLACE FUNCTION detect_job_conflicts(
  property_id UUID,
  proposed_date DATE,
  proposed_start_time TIME,
  proposed_duration_minutes INTEGER,
  service_type VARCHAR
) RETURNS TABLE(conflict_type VARCHAR, conflicting_job_id UUID, conflict_details TEXT) AS $$
BEGIN
  RETURN QUERY
  -- Check for cleaning conflicts
  SELECT 'CLEANING_CONFLICT' as conflict_type,
         cj.id as conflicting_job_id,
         'Cleaning job scheduled at same time' as conflict_details
  FROM cleaning_jobs cj
  WHERE cj.property_id = detect_job_conflicts.property_id
  AND cj.scheduled_date = detect_job_conflicts.proposed_date
  AND cj.job_status IN ('SCHEDULED', 'IN_PROGRESS')
  AND (
    (cj.scheduled_start_time <= detect_job_conflicts.proposed_start_time
     AND cj.scheduled_start_time + INTERVAL '1 minute' * cj.estimated_duration_minutes > detect_job_conflicts.proposed_start_time)
    OR (detect_job_conflicts.proposed_start_time <= cj.scheduled_start_time
     AND detect_job_conflicts.proposed_start_time + INTERVAL '1 minute' * detect_job_conflicts.proposed_duration_minutes > cj.scheduled_start_time)
  )

  UNION ALL

  -- Check for maintenance conflicts
  SELECT 'MAINTENANCE_CONFLICT' as conflict_type,
         mwo.id as conflicting_job_id,
         'Maintenance work scheduled at same time' as conflict_details
  FROM maintenance_work_orders mwo
  WHERE mwo.property_id = detect_job_conflicts.property_id
  AND mwo.scheduled_date = detect_job_conflicts.proposed_date
  AND mwo.work_status IN ('ASSIGNED', 'IN_PROGRESS')
  AND (
    (mwo.scheduled_start_time <= detect_job_conflicts.proposed_start_time
     AND mwo.scheduled_start_time + INTERVAL '1 hour' * mwo.estimated_duration_hours > detect_job_conflicts.proposed_start_time)
    OR (detect_job_conflicts.proposed_start_time <= mwo.scheduled_start_time
     AND detect_job_conflicts.proposed_start_time + INTERVAL '1 minute' * detect_job_conflicts.proposed_duration_minutes > mwo.scheduled_start_time)
  );
END;
$$ LANGUAGE plpgsql;
```

## Benefits

### For Cleaning Service
- Specialized job management with cleaning-specific workflows
- Quality control with detailed task checklists
- Performance tracking for cleaning quality metrics
- Efficient scheduling based on cleaning team availability

### For Maintenance Service
- Trade-specific work order management
- Technical progress tracking with stages and photos
- Permit and compliance management
- Emergency work order prioritization

### For Cross-Service Coordination
- Conflict detection for property access
- Sequential job scheduling (cleaning after maintenance or vice versa)
- Shared property history across services
- Unified customer experience

## Risk Mitigation

### Data Integrity
- Comprehensive validation before migration
- Reference mapping between old and new job systems
- Audit trails for all job status changes

### Service Continuity
- Gradual migration with fallback to legacy system
- Cross-service job reference mapping
- Training for staff on new workflows

### Performance Optimization
- Materialized views for analytics
- Efficient indexing for job scheduling
- Caching for frequently accessed job data

## Next Steps

1. **Execute Migration Scripts**: Run job management separation migration
2. **Update Scheduling Systems**: Implement new job assignment algorithms
3. **Update Frontend Interfaces**: Modify job management UIs for both services
4. **Testing**: Comprehensive testing of job workflows and cross-service coordination
5. **Training**: Train staff on separated job management systems