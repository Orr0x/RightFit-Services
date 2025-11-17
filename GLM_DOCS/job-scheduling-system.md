# Job Scheduling and Assignment System

## Overview
This document outlines the comprehensive job scheduling and assignment system for separated cleaning and maintenance services, including intelligent contractor assignment, conflict detection, and cross-service coordination.

## Scheduling Architecture

### Service-Specific Scheduling

#### Cleaning Service Scheduling
```typescript
interface CleaningJobScheduling {
  jobType: 'REGULAR_CLEANING' | 'DEEP_CLEANING' | 'SPECIALIZED_CLEAN'
  cleaningLevel: 'LIGHT' | 'STANDARD' | 'DEEP' | 'SPECIALIZED'
  estimatedDuration: number // minutes
  teamSize: number
  equipmentRequirements: string[]
  preferredTimeSlots: TimeSlot[]
  propertyConstraints: PropertyConstraints
}

interface TimeSlot {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // "09:00"
  endTime: string // "17:00"
  maxJobsPerDay: number
}

interface PropertyConstraints {
  pets: boolean
  children: boolean
  elderly: boolean
  medicalFacility: boolean
  accessRestrictions: string[]
  parkingAvailability: boolean
}
```

#### Maintenance Service Scheduling
```typescript
interface MaintenanceWorkOrderScheduling {
  workType: 'PLUMBING_REPAIR' | 'ELECTRICAL_REPAIR' | 'HVAC_MAINTENANCE' | 'EMERGENCY_REPAIR'
  tradeCategory: string
  complexityLevel: 'SIMPLE' | 'STANDARD' | 'COMPLEX' | 'SPECIALIZED'
  estimatedDuration: number // hours
  priorityLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY'
  isEmergency: boolean
  permitRequirements: PermitRequirements
  partsAvailability: PartsAvailability
}

interface PermitRequirements {
  permitRequired: boolean
  permitType?: string
  estimatedProcessingTime: number // days
  cityInspectionRequired: boolean
}

interface PartsAvailability {
  partsRequired: string[]
  partsInStock: boolean
  specialOrderRequired: boolean
  estimatedDeliveryTime: number // days
}
```

## Intelligent Assignment Algorithm

### Contractor Matching System

#### Cleaning Contractor Matching
```sql
CREATE OR REPLACE FUNCTION find_best_cleaning_contractor(
    job_id UUID,
    property_location_lat DECIMAL,
    property_location_lng DECIMAL,
    required_skills TEXT[] DEFAULT NULL,
    preferred_date DATE DEFAULT CURRENT_DATE,
    preferred_time TIME DEFAULT '09:00'::TIME
) RETURNS TABLE(
    contractor_id UUID,
    match_score DECIMAL(5,2),
    estimated_arrival TIMESTAMP,
    available_slots JSONB,
    match_reasons TEXT[]
) AS $$
DECLARE
    job_details RECORD;
BEGIN
    -- Get job details
    SELECT * INTO job_details
    FROM cleaning_jobs
    WHERE id = find_best_cleaning_contractor.job_id;

    RETURN QUERY
    WITH contractor_rankings AS (
        SELECT
            cc.id as contractor_id,
            -- Quality score (40% weight)
            (cc.quality_score_avg * 0.40) as quality_score,
            -- Reliability score (30% weight)
            (cc.reliability_score * 0.30) as reliability_score,
            -- Skills match (20% weight)
            CASE
                WHEN required_skills IS NULL THEN 1.0
                ELSE (
                    SELECT COUNT(*)::DECIMAL / array_length(required_skills, 1)
                    FROM unnest(required_skills) required_skill
                    JOIN unnest(cc.skills) contractor_skill ON required_skill = contractor_skill
                ) * 0.20
            END as skills_score,
            -- Location proximity (10% weight)
            CASE
                WHEN property_location_lat IS NOT NULL AND property_location_lng IS NOT NULL THEN
                    -- Simple distance calculation (in reality, use proper geospatial functions)
                    CASE
                        WHEN ABS(property_location_lat - 40.7128) < 0.1 AND
                             ABS(property_location_lng - -74.0060) < 0.1 THEN 0.10
                        ELSE 0.05
                    END
                ELSE 0.05
            END as location_score,
            -- Experience bonus
            CASE
                WHEN cc.experience_years >= 5 THEN 0.05
                WHEN cc.experience_years >= 2 THEN 0.03
                ELSE 0.00
            END as experience_bonus
        FROM cleaning_contractors cc
        WHERE cc.deleted_at IS NULL
        AND (required_skills IS NULL OR cc.skills && required_skills)
    ),
    availability_check AS (
        SELECT
            cr.contractor_id,
            cr.quality_score + cr.reliability_score + cr.skills_score + cr.location_score + cr.experience_bonus as match_score,
            ca.is_available,
            ca.max_jobs_per_day,
            ca.start_time,
            ca.end_time,
            -- Count existing jobs for the day
            (SELECT COUNT(*)
             FROM cleaning_jobs existing_job
             WHERE existing_job.contractor_id = cr.contractor_id
             AND existing_job.scheduled_date = preferred_date
             AND existing_job.job_status IN ('SCHEDULED', 'IN_PROGRESS')) as existing_jobs_count
        FROM contractor_rankings cr
        LEFT JOIN cleaning_availability ca ON ca.contractor_id = cr.contractor_id
            AND ca.day_of_week = EXTRACT(DOW FROM preferred_date)
    )
    SELECT
        ac.contractor_id,
        ac.match_score,
        preferred_date || ' ' || COALESCE(ac.start_time, preferred_time) as estimated_arrival,
        jsonb_build_object(
            'available', ac.is_available,
            'max_jobs_per_day', ac.max_jobs_per_day,
            'existing_jobs', ac.existing_jobs_count,
            'can_take_more', ac.existing_jobs_count < COALESCE(ac.max_jobs_per_day, 8)
        ) as available_slots,
        ARRAY[
            CASE WHEN ac.match_score >= 4.0 THEN 'High quality rating' END,
            CASE WHEN ac.existing_jobs_count = 0 THEN 'Fully available day' END,
            CASE WHEN ac.is_available = true THEN 'Marked as available' END,
            CASE WHEN required_skills IS NOT NULL THEN 'Skills match confirmed' END
        ] FILTER (WHERE element IS NOT NULL) as match_reasons
    FROM availability_check ac
    WHERE ac.is_available = true
    AND ac.existing_jobs_count < COALESCE(ac.max_jobs_per_day, 8)
    ORDER BY ac.match_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

#### Maintenance Contractor Matching
```sql
CREATE OR REPLACE FUNCTION find_best_maintenance_contractor(
    work_order_id UUID,
    property_location_lat DECIMAL,
    property_location_lng DECIMAL,
    required_trade VARCHAR,
    required_specializations TEXT[] DEFAULT NULL,
    is_emergency BOOLEAN DEFAULT false
) RETURNS TABLE(
    contractor_id UUID,
    match_score DECIMAL(5,2),
    estimated_arrival TIMESTAMP,
    emergency_response BOOLEAN,
    match_reasons TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH contractor_rankings AS (
        SELECT
            mc.id as contractor_id,
            -- Quality score (35% weight)
            (mc.quality_score_avg * 0.35) as quality_score,
            -- Reliability score (25% weight)
            (mc.reliability_score * 0.25) as reliability_score,
            -- Trade specialization match (20% weight)
            CASE
                WHEN UPPER(mc.trade) = UPPER(required_trade) THEN 0.20
                WHEN mc.specializations @> ARRAY[UPPER(required_trade)] THEN 0.15
                ELSE 0.00
            END as trade_score,
            -- Specialization match (15% weight)
            CASE
                WHEN required_specializations IS NULL THEN 0.15
                ELSE (
                    SELECT COUNT(*)::DECIMAL / array_length(required_specializations, 1)
                    FROM unnest(required_specializations) required_spec
                    JOIN unnest(mc.specializations) contractor_spec
                        ON UPPER(required_spec) = UPPER(contractor_spec)
                ) * 0.15
            END as specialization_score,
            -- Emergency availability (5% weight)
            CASE
                WHEN is_emergency AND mc.is_available_emergency THEN 0.05
                WHEN is_emergency THEN 0.00
                ELSE 0.05
            END as emergency_score,
            -- Experience bonus
            CASE
                WHEN mc.experience_years >= 10 THEN 0.05
                WHEN mc.experience_years >= 5 THEN 0.03
                ELSE 0.00
            END as experience_bonus,
            mc.service_radius_km,
            mc.hourly_rate
        FROM maintenance_contractors mc
        WHERE mc.deleted_at IS NULL
        AND (UPPER(mc.trade) = UPPER(required_trade) OR mc.specializations @> ARRAY[UPPER(required_trade)])
    ),
    availability_check AS (
        SELECT
            cr.contractor_id,
            cr.quality_score + cr.reliability_score + cr.trade_score +
            cr.specialization_score + cr.emergency_score + cr.experience_bonus as match_score,
            cr.emergency_score > 0 as emergency_response,
            cr.service_radius_km,
            cr.hourly_rate,
            -- Check for existing work orders
            (SELECT COUNT(*)
             FROM maintenance_work_orders existing_wo
             WHERE existing_wo.contractor_id = cr.contractor_id
             AND existing_wo.scheduled_date = CURRENT_DATE
             AND existing_wo.work_status IN ('ASSIGNED', 'IN_PROGRESS')) as existing_orders_count
        FROM contractor_rankings cr
    )
    SELECT
        ac.contractor_id,
        ac.match_score,
        CASE
            WHEN is_emergency AND ac.emergency_response THEN CURRENT_TIMESTAMP
            ELSE CURRENT_TIMESTAMP + INTERVAL '1 day'
        END as estimated_arrival,
        ac.emergency_response,
        ARRAY[
            CASE WHEN ac.match_score >= 4.0 THEN 'High quality rating' END,
            CASE WHEN ac.emergency_response AND is_emergency THEN 'Emergency available' END,
            CASE WHEN ac.existing_orders_count = 0 THEN 'No existing work orders' END,
            CASE WHEN required_specializations IS NOT NULL THEN 'Specializations match' END,
            CASE WHEN ac.hourly_rate <= 75 THEN 'Competitive hourly rate' END
        ] FILTER (WHERE element IS NOT NULL) as match_reasons
    FROM availability_check ac
    WHERE (is_emergency = false OR ac.emergency_response = true)
    ORDER BY
        CASE WHEN is_emergency THEN ac.emergency_response DESC ELSE 0 END,
        ac.match_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

## Conflict Detection System

### Cross-Service Job Conflicts
```sql
CREATE OR REPLACE FUNCTION detect_cross_service_conflicts(
    property_id UUID,
    proposed_date DATE,
    proposed_start_time TIME,
    proposed_duration_minutes INTEGER,
    service_type VARCHAR,
    job_id UUID DEFAULT NULL -- Exclude current job from conflict check
) RETURNS TABLE(
    conflict_type VARCHAR,
    conflict_severity VARCHAR,
    conflicting_job_id UUID,
    conflicting_service VARCHAR,
    conflict_description TEXT,
    resolution_suggestions TEXT[]
) AS $$
BEGIN
    RETURN QUERY

    -- Check for cleaning conflicts
    SELECT
        'CLEANING_CONFLICT' as conflict_type,
        'HIGH' as conflict_severity,
        cj.id as conflicting_job_id,
        'CLEANING' as conflicting_service,
        'Cleaning job scheduled during same time period' as conflict_description,
        ARRAY['Reschedule cleaning job', 'Adjust proposed start time', 'Split cleaning into multiple sessions'] as resolution_suggestions
    FROM cleaning_jobs cj
    WHERE cj.property_id = detect_cross_service_conflicts.property_id
    AND cj.scheduled_date = detect_cross_service_conflicts.proposed_date
    AND cj.job_status IN ('SCHEDULED', 'IN_PROGRESS')
    AND (job_id IS NULL OR cj.id != job_id)
    AND (
        (cj.scheduled_start_time <= detect_cross_service_conflicts.proposed_start_time
         AND cj.scheduled_start_time + INTERVAL '1 minute' * cj.estimated_duration_minutes > detect_cross_service_conflicts.proposed_start_time)
        OR (detect_cross_service_conflicts.proposed_start_time <= cj.scheduled_start_time
         AND detect_cross_service_conflicts.proposed_start_time + INTERVAL '1 minute' * detect_cross_service_conflicts.proposed_duration_minutes > cj.scheduled_start_time)
    )

    UNION ALL

    -- Check for maintenance conflicts
    SELECT
        'MAINTENANCE_CONFLICT' as conflict_type,
        CASE
            WHEN mwo.is_emergency THEN 'CRITICAL'
            WHEN mwo.priority_level IN ('HIGH', 'URGENT') THEN 'HIGH'
            ELSE 'MEDIUM'
        END as conflict_severity,
        mwo.id as conflicting_job_id,
        'MAINTENANCE' as conflicting_service,
        CASE
            WHEN mwo.is_emergency THEN 'Emergency maintenance work in progress'
            WHEN mwo.priority_level IN ('HIGH', 'URGENT') THEN 'High-priority maintenance work scheduled'
            ELSE 'Maintenance work scheduled during same time period'
        END as conflict_description,
        CASE
            WHEN mwo.is_emergency THEN ARRAY['Postpone cleaning until emergency resolved', 'Clean unaffected areas only']
            WHEN mwo.priority_level IN ('HIGH', 'URGENT') THEN ARRAY['Schedule cleaning for different day', 'Coordinate with maintenance team']
            ELSE ARRAY['Adjust start times to avoid overlap', 'Sequential scheduling (cleaning after maintenance)']
        END as resolution_suggestions
    FROM maintenance_work_orders mwo
    WHERE mwo.property_id = detect_cross_service_conflicts.property_id
    AND mwo.scheduled_date = detect_cross_service_conflicts.proposed_date
    AND mwo.work_status IN ('ASSIGNED', 'IN_PROGRESS')
    AND (job_id IS NULL OR mwo.id != job_id)
    AND mwo.scheduled_start_time IS NOT NULL
    AND (
        (mwo.scheduled_start_time <= detect_cross_service_conflicts.proposed_start_time
         AND mwo.scheduled_start_time + INTERVAL '1 hour' * mwo.estimated_duration_hours > detect_cross_service_conflicts.proposed_start_time)
        OR (detect_cross_service_conflicts.proposed_start_time <= mwo.scheduled_start_time
         AND detect_cross_service_conflicts.proposed_start_time + INTERVAL '1 minute' * detect_cross_service_conflicts.proposed_duration_minutes > mwo.scheduled_start_time)
    )

    UNION ALL

    -- Check for contractor availability conflicts (dual-service contractors)
    SELECT
        'CONTRACTOR_DOUBLE_BOOKING' as conflict_type,
        'MEDIUM' as conflict_severity,
        COALESCE(cj.id, mwo.id) as conflicting_job_id,
        CASE WHEN cj.id IS NOT NULL THEN 'CLEANING' ELSE 'MAINTENANCE' END as conflicting_service,
        'Same contractor assigned to multiple jobs at same time' as conflict_description,
        ARRAY['Assign different contractor', 'Adjust job timing', 'Prioritize based on job urgency'] as resolution_suggestions
    FROM shared_auth_db.cross_service_permissions csp
    LEFT JOIN cleaning_jobs cj ON cj.contractor_id IN (
        SELECT cc.id FROM cleaning_db.cleaning_contractors cc
        WHERE cc.contractor_profile_id = csp.contractor_profile_id
    )
    LEFT JOIN maintenance_work_orders mwo ON mwo.contractor_id IN (
        SELECT mc.id FROM maintenance_db.maintenance_contractors mc
        WHERE mc.contractor_profile_id = csp.contractor_profile_id
    )
    WHERE csp.can_accept_secondary = true
    AND detect_cross_service_conflicts.proposed_date = COALESCE(cj.scheduled_date, mwo.scheduled_date)
    AND (
        (cj.scheduled_start_time IS NOT NULL AND
         cj.scheduled_start_time <= detect_cross_service_conflicts.proposed_start_time
         AND cj.scheduled_start_time + INTERVAL '1 minute' * cj.estimated_duration_minutes > detect_cross_service_conflicts.proposed_start_time)
        OR (mwo.scheduled_start_time IS NOT NULL AND
         mwo.scheduled_start_time <= detect_cross_service_conflicts.proposed_start_time
         AND mwo.scheduled_start_time + INTERVAL '1 hour' * mwo.estimated_duration_hours > detect_cross_service_conflicts.proposed_start_time)
    )
    AND (job_id IS NULL OR (cj.id != job_id AND mwo.id != job_id));
END;
$$ LANGUAGE plpgsql;
```

## Automated Scheduling System

### Smart Scheduling Algorithm
```sql
CREATE OR REPLACE FUNCTION auto_schedule_job(
    job_id UUID,
    service_type VARCHAR,
    scheduling_preferences JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE(
    scheduled BOOLEAN,
    scheduled_date DATE,
    scheduled_time TIME,
    assigned_contractor_id UUID,
    scheduling_conflicts JSONB,
    scheduling_reasons TEXT[]
) AS $$
DECLARE
    job_details RECORD;
    best_candidate RECORD;
    conflicts JSONB;
    reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get job details based on service type
    IF service_type = 'CLEANING' THEN
        SELECT * INTO job_details
        FROM cleaning_jobs
        WHERE id = auto_schedule_job.job_id;

        -- Find best cleaning contractor
        SELECT * INTO best_candidate
        FROM find_best_cleaning_contractor(
            job_id,
            NULL, -- Will be enhanced with actual property coordinates
            job_details.equipment_needed,
            CURRENT_DATE + INTERVAL '1 day',
            '09:00'::TIME
        )
        LIMIT 1;

    ELSIF service_type = 'MAINTENANCE' THEN
        SELECT * INTO job_details
        FROM maintenance_work_orders
        WHERE id = auto_schedule_job.job_id;

        -- Find best maintenance contractor
        SELECT * INTO best_candidate
        FROM find_best_maintenance_contractor(
            job_id,
            NULL, -- Will be enhanced with actual property coordinates
            job_details.trade_category,
            job_details.specializations,
            job_details.is_emergency
        )
        LIMIT 1;
    END IF;

    -- Check for conflicts
    SELECT jsonb_agg(
        jsonb_build_object(
            'conflict_type', ct.conflict_type,
            'severity', ct.conflict_severity,
            'description', ct.conflict_description,
            'suggestions', ct.resolution_suggestions
        )
    ) INTO conflicts
    FROM detect_cross_service_conflicts(
        job_details.property_id,
        CURRENT_DATE + INTERVAL '1 day',
        COALESCE(best_candidate.estimated_arrival::TIME, '09:00'::TIME),
        COALESCE(job_details.estimated_duration_minutes, 120),
        service_type,
        job_id
    ) ct;

    -- Build scheduling reasons
    reasons := reasons || ARRAY[
        CASE WHEN best_candidate.match_score >= 4.0 THEN 'High-quality contractor matched' END,
        CASE WHEN conflicts IS NULL THEN 'No scheduling conflicts detected' END,
        CASE WHEN service_type = 'MAINTENANCE' AND job_details.is_emergency THEN 'Emergency priority scheduling' END,
        CASE WHEN best_candidate.match_reasons IS NOT NULL THEN unnest(best_candidate.match_reasons) END
    ];

    -- Return scheduling results
    RETURN QUERY
    SELECT
        CASE WHEN best_candidate.contractor_id IS NOT NULL AND conflicts IS NULL THEN true ELSE false END as scheduled,
        CASE WHEN service_type = 'MAINTENANCE' AND job_details.is_emergency THEN CURRENT_DATE ELSE CURRENT_DATE + INTERVAL '1 day' END as scheduled_date,
        COALESCE(best_candidate.estimated_arrival::TIME, '09:00'::TIME) as scheduled_time,
        best_candidate.contractor_id,
        COALESCE(conflicts, '[]'::jsonb) as scheduling_conflicts,
        reasons FILTER (WHERE element IS NOT NULL) as scheduling_reasons;

    -- Auto-assign if no conflicts and suitable contractor found
    IF best_candidate.contractor_id IS NOT NULL AND conflicts IS NULL THEN
        IF service_type = 'CLEANING' THEN
            UPDATE cleaning_jobs
            SET contractor_id = best_candidate.contractor_id,
                job_status = 'SCHEDULED',
                scheduled_date = CURRENT_DATE + INTERVAL '1 day',
                scheduled_start_time = COALESCE(best_candidate.estimated_arrival::TIME, '09:00'::TIME),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = job_id;

        ELSIF service_type = 'MAINTENANCE' THEN
            UPDATE maintenance_work_orders
            SET contractor_id = best_candidate.contractor_id,
                work_status = 'ASSIGNED',
                scheduled_date = CASE WHEN job_details.is_emergency THEN CURRENT_DATE ELSE CURRENT_DATE + INTERVAL '1 day' END,
                scheduled_start_time = COALESCE(best_candidate.estimated_arrival::TIME, '09:00'::TIME),
                assigned_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = job_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## Schedule Optimization

### Route Optimization for Cleaning Teams
```sql
CREATE OR REPLACE FUNCTION optimize_cleaning_route(
    contractor_id UUID,
    target_date DATE,
    max_jobs_per_route INTEGER DEFAULT 8
) RETURNS TABLE(
    optimized_route JSONB,
    total_travel_distance DECIMAL,
    total_estimated_time INTEGER,
    efficiency_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH contractor_jobs AS (
        SELECT
            cj.id,
            cj.property_id,
            cj.scheduled_start_time,
            cj.estimated_duration_minutes,
            p.latitude,
            p.longitude,
            p.address_line1,
            p.city,
            p.postcode
        FROM cleaning_jobs cj
        JOIN cleaning_db.cleaning_properties p ON cj.property_id = p.id
        WHERE cj.contractor_id = optimize_cleaning_route.contractor_id
        AND cj.scheduled_date = optimize_cleaning_route.target_date
        AND cj.job_status = 'SCHEDULED'
        ORDER BY cj.scheduled_start_time
    ),
    route_calculation AS (
        SELECT
            jsonb_agg(
                jsonb_build_object(
                    'job_id', id,
                    'property_id', property_id,
                    'address', jsonb_build_object(
                        'line1', address_line1,
                        'city', city,
                        'postcode', postcode,
                        'coordinates', jsonb_build_object(
                            'lat', latitude,
                            'lng', longitude
                        )
                    ),
                    'scheduled_time', scheduled_start_time,
                    'estimated_duration', estimated_duration_minutes,
                    'sequence_number', ROW_NUMBER() OVER (ORDER BY scheduled_start_time)
                )
            ORDER BY scheduled_start_time
            ) as route_jobs,
            -- Simple distance calculation (in reality, use proper routing API)
            SUM(
                CASE
                    WHEN LAG(latitude) OVER (ORDER BY scheduled_start_time) IS NOT NULL THEN
                        ABS(latitude - LAG(latitude) OVER (ORDER BY scheduled_start_time)) * 111 +
                        ABS(longitude - LAG(longitude) OVER (ORDER BY scheduled_start_time)) * 111
                    ELSE 0
                END
            ) as total_distance,
            SUM(estimated_duration_minutes) as total_time,
            COUNT(*) as job_count
        FROM contractor_jobs
    )
    SELECT
        rc.route_jobs as optimized_route,
        COALESCE(rc.total_distance, 0) as total_travel_distance,
        COALESCE(rc.total_time, 0) as total_estimated_time,
        CASE
            WHEN rc.job_count <= 4 THEN 1.0
            WHEN rc.job_count <= 6 THEN 0.9
            WHEN rc.job_count <= max_jobs_per_route THEN 0.8
            ELSE 0.6
        END as efficiency_score
    FROM route_calculation rc;
END;
$$ LANGUAGE plpgsql;
```

## Real-time Scheduling Dashboard

### Scheduling Analytics Views
```sql
-- Real-time contractor availability dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS contractor_availability_dashboard AS
WITH cleaning_availability AS (
    SELECT
        'CLEANING' as service_type,
        cc.id as contractor_id,
        cc.name,
        COUNT(*) FILTER (WHERE cj.job_status = 'SCHEDULED' AND cj.scheduled_date = CURRENT_DATE) as today_jobs,
        COUNT(*) FILTER (WHERE cj.job_status = 'IN_PROGRESS') as active_jobs,
        ca.is_available,
        ca.max_jobs_per_day,
        AVG(cj.estimated_duration_minutes) FILTER (WHERE cj.job_status IN ('COMPLETED') AND cj.completed_at >= CURRENT_DATE - INTERVAL '30 days') as avg_job_duration
    FROM cleaning_db.cleaning_contractors cc
    LEFT JOIN cleaning_jobs cj ON cc.id = cj.contractor_id
    LEFT JOIN cleaning_db.cleaning_availability ca ON cc.id = ca.contractor_id
        AND ca.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
    WHERE cc.deleted_at IS NULL
    GROUP BY cc.id, cc.name, ca.is_available, ca.max_jobs_per_day
),
maintenance_availability AS (
    SELECT
        'MAINTENANCE' as service_type,
        mc.id as contractor_id,
        mc.name,
        COUNT(*) FILTER (WHERE mwo.work_status = 'ASSIGNED' AND mwo.scheduled_date = CURRENT_DATE) as today_jobs,
        COUNT(*) FILTER (WHERE mwo.work_status = 'IN_PROGRESS') as active_jobs,
        mc.is_available_emergency as is_available,
        NULL as max_jobs_per_day,
        AVG(mwo.estimated_duration_hours) FILTER (WHERE mwo.work_status IN ('COMPLETED') AND mwo.completed_at >= CURRENT_DATE - INTERVAL '30 days') as avg_job_duration
    FROM maintenance_db.maintenance_contractors mc
    LEFT JOIN maintenance_work_orders mwo ON mc.id = mwo.contractor_id
    WHERE mc.deleted_at IS NULL
    GROUP BY mc.id, mc.name, mc.is_available_emergency
)
SELECT * FROM cleaning_availability
UNION ALL
SELECT * FROM maintenance_availability;

-- Refresh schedule for real-time dashboard
CREATE OR REPLACE FUNCTION refresh_scheduling_dashboard() RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY contractor_availability_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Schedule to refresh every 5 minutes
-- This would be implemented as a cron job or database scheduler
```

## Performance Monitoring

### Scheduling Efficiency Metrics
```sql
CREATE OR REPLACE FUNCTION calculate_scheduling_efficiency(
    date_range_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    date_range_end DATE DEFAULT CURRENT_DATE
) RETURNS TABLE(
    service_type VARCHAR,
    efficiency_metric VARCHAR,
    metric_value DECIMAL,
    target_value DECIMAL,
    performance_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY

    -- Cleaning service efficiency metrics
    SELECT
        'CLEANING' as service_type,
        'On-Time Completion Rate' as efficiency_metric,
        ROUND(
            (COUNT(*) FILTER (WHERE cj.completed_at <= cj.due_date OR cj.due_date IS NULL)::DECIMAL /
             NULLIF(COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED'), 0)) * 100, 2
        ) as metric_value,
        95.0 as target_value,
        CASE
            WHEN (COUNT(*) FILTER (WHERE cj.completed_at <= cj.due_date OR cj.due_date IS NULL)::DECIMAL /
                  NULLIF(COUNT(*) FILTER (WHERE cj.job_status = 'COMPLETED'), 0)) * 100 >= 95 THEN 'EXCELLENT'
            WHEN >= 90 THEN 'GOOD'
            WHEN >= 80 THEN 'NEEDS_IMPROVEMENT'
            ELSE 'POOR'
        END as performance_status
    FROM cleaning_jobs cj
    WHERE cj.completed_at BETWEEN date_range_start AND date_range_end

    UNION ALL

    SELECT
        'CLEANING' as service_type,
        'Job Fill Rate' as efficiency_metric,
        ROUND(
            (COUNT(*) FILTER (WHERE cj.contractor_id IS NOT NULL)::DECIMAL /
             NULLIF(COUNT(*), 0)) * 100, 2
        ) as metric_value,
        98.0 as target_value,
        CASE
            WHEN (COUNT(*) FILTER (WHERE cj.contractor_id IS NOT NULL)::DECIMAL /
                  NULLIF(COUNT(*), 0)) * 100 >= 98 THEN 'EXCELLENT'
            WHEN >= 95 THEN 'GOOD'
            WHEN >= 90 THEN 'NEEDS_IMPROVEMENT'
            ELSE 'POOR'
        END as performance_status
    FROM cleaning_jobs cj
    WHERE cj.created_at BETWEEN date_range_start AND date_range_end

    UNION ALL

    SELECT
        'MAINTENANCE' as service_type,
        'Emergency Response Time' as efficiency_metric,
        ROUND(
            AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600), 2
        ) as metric_value,
        2.0 as target_value,
        CASE
            WHEN AVG(EXTRACT(EPOCH FROM (mwo.started_at - mwo.created_at)) / 3600) <= 2 THEN 'EXCELLENT'
            WHEN <= 4 THEN 'GOOD'
            WHEN <= 8 THEN 'NEEDS_IMPROVEMENT'
            ELSE 'POOR'
        END as performance_status
    FROM maintenance_work_orders mwo
    WHERE mwo.is_emergency = true
    AND mwo.created_at BETWEEN date_range_start AND date_range_end
    AND mwo.started_at IS NOT NULL

    UNION ALL

    SELECT
        'MAINTENANCE' as service_type,
        'Contractor Utilization Rate' as efficiency_metric,
        ROUND(
            (COUNT(DISTINCT mwo.contractor_id)::DECIMAL /
             NULLIF((SELECT COUNT(*) FROM maintenance_db.maintenance_contractors WHERE deleted_at IS NULL), 0)) * 100, 2
        ) as metric_value,
        80.0 as target_value,
        CASE
            WHEN (COUNT(DISTINCT mwo.contractor_id)::DECIMAL /
                  NULLIF((SELECT COUNT(*) FROM maintenance_db.maintenance_contractors WHERE deleted_at IS NULL), 0)) * 100 >= 80 THEN 'EXCELLENT'
            WHEN >= 70 THEN 'GOOD'
            WHEN >= 60 THEN 'NEEDS_IMPROVEMENT'
            ELSE 'POOR'
        END as performance_status
    FROM maintenance_work_orders mwo
    WHERE mwo.scheduled_date BETWEEN date_range_start AND date_range_end
    AND mwo.contractor_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
```

## Benefits

### For Cleaning Service
- Intelligent contractor matching based on skills and availability
- Route optimization for efficient cleaning schedules
- Quality-focused assignment considering customer feedback
- Automated task generation based on job type

### For Maintenance Service
- Trade-specialized contractor matching
- Emergency prioritization and rapid response
- Permit and parts availability consideration
- Complex job complexity assessment

### For Cross-Service Coordination
- Conflict detection between cleaning and maintenance jobs
- Dual-service contractor availability management
- Sequential job scheduling (cleaning after maintenance)
- Shared property access coordination

## Risk Mitigation

### Scheduling Conflicts
- Real-time conflict detection and resolution suggestions
- Automatic rescheduling options
- Manual override capabilities for urgent situations

### Contractor Availability
- Live availability tracking
- Overbooking prevention
- Emergency availability management
- Cross-service load balancing

### Data Integrity
- Audit trail for all scheduling changes
- Rollback capabilities for scheduling errors
- Backup scheduling options
- Integration testing for scheduling algorithms

## Next Steps

1. **Implement Scheduling API**: Create REST endpoints for scheduling operations
2. **Build Scheduling Dashboard**: Develop real-time scheduling interface
3. **Integrate Mapping Services**: Add geospatial routing capabilities
4. **Test Algorithm Performance**: Validate assignment algorithm effectiveness
5. **Train Users**: Train staff on new scheduling system and conflict resolution