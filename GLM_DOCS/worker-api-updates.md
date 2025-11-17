# Worker Management API Updates

## Overview
This document outlines the API endpoint updates required to support separated worker management for cleaning and maintenance services, including shared worker services and service-specific worker management.

## API Architecture Changes

### Base URLs
- **Shared Authentication Service**: `https://auth.rightfit.com/api`
- **Cleaning Service**: `https://cleaning.rightfit.com/api`
- **Maintenance Service**: `https://maintenance.rightfit.com/api`

## Shared Worker Service Endpoints

### Authentication Base: `https://auth.rightfit.com/api/workers`

#### Worker Profile Management
```typescript
// GET /workers/profiles
// Get all worker profiles with filtering options
interface GetWorkerProfilesQuery {
  page?: number
  limit?: number
  search?: string
  service_type?: 'CLEANING' | 'MAINTENANCE' | 'BOTH'
  trade?: string
  is_active?: boolean
}

interface GetWorkerProfilesResponse {
  profiles: WorkerProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// GET /workers/profiles/:id
// Get specific worker profile
interface WorkerProfileResponse {
  profile: WorkerProfile & {
    service_assignments: ServiceAssignment[]
    cross_service_permissions?: CrossServicePermissions
    skills: WorkerSkill[]
  }
}

// PUT /workers/profiles/:id
// Update shared worker profile
interface UpdateWorkerProfileRequest {
  name?: string
  phone?: string
  email?: string
  company_name?: string
  sms_opt_out?: boolean
}

// POST /workers/profiles
// Create new shared worker profile
interface CreateWorkerProfileRequest {
  name: string
  phone: string
  email?: string
  company_name?: string
  sms_opt_out?: boolean
  primary_service: 'CLEANING' | 'MAINTENANCE'
  secondary_service?: 'CLEANING' | 'MAINTENANCE'
}
```

#### Service Assignment Management
```typescript
// GET /workers/:profileId/service-assignments
interface GetServiceAssignmentsResponse {
  assignments: ServiceAssignment[]
}

// POST /workers/:profileId/service-assignments
interface CreateServiceAssignmentRequest {
  service_type: 'CLEANING' | 'MAINTENANCE'
  trade: string
  is_primary: boolean
}

// PUT /workers/:profileId/service-assignments/:assignmentId
interface UpdateServiceAssignmentRequest {
  trade?: string
  is_primary?: boolean
}

// DELETE /workers/:profileId/service-assignments/:assignmentId
// Remove service assignment
```

#### Cross-Service Permissions
```typescript
// GET /workers/:profileId/cross-service-permissions
interface GetCrossServicePermissionsResponse {
  permissions: CrossServicePermissions | null
}

// PUT /workers/:profileId/cross-service-permissions
interface UpdateCrossServicePermissionsRequest {
  primary_service: 'CLEANING' | 'MAINTENANCE'
  secondary_service?: 'CLEANING' | 'MAINTENANCE'
  can_accept_secondary: boolean
  max_weekly_hours_secondary?: number
  schedule_conflicts_prevented?: boolean
}
```

## Cleaning Service Worker Endpoints

### Cleaning Base: `https://cleaning.rightfit.com/api/contractors`

#### Cleaning Contractor Management
```typescript
// GET /contractors
interface GetCleaningContractorsQuery {
  page?: number
  limit?: number
  search?: string
  trade?: string
  certification_level?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SPECIALIST'
  experience_years_min?: number
  quality_score_min?: number
  available_now?: boolean
  preferred_property_types?: string[]
}

interface GetCleaningContractorsResponse {
  contractors: CleaningContractor[]
  pagination: PaginationInfo
}

// POST /contractors
interface CreateCleaningContractorRequest {
  contractor_profile_id: string
  trade: string
  skills?: string[]
  experience_years?: number
  certification_level?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SPECIALIST'
  availability_schedule?: AvailabilitySchedule
  preferred_property_types?: string[]
}

// GET /contractors/:id
interface GetCleaningContractorResponse {
  contractor: CleaningContractor & {
    certifications: CleaningCertification[]
    performance_metrics: CleaningPerformanceMetric[]
    availability: CleaningAvailability[]
  }
}

// PUT /contractors/:id
interface UpdateCleaningContractorRequest {
  trade?: string
  skills?: string[]
  experience_years?: number
  certification_level?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SPECIALIST'
  availability_schedule?: AvailabilitySchedule
  preferred_property_types?: string[]
  average_job_time_minutes?: number
}
```

#### Cleaning Contractor Performance
```typescript
// GET /contractors/:id/performance
interface GetContractorPerformanceResponse {
  metrics: CleaningPerformanceMetric[]
  summary: {
    total_jobs: number
    average_quality_score: number
    average_customer_rating: number
    on_time_completion_rate: number
    average_completion_time: number
  }
}

// POST /contractors/:id/performance
interface CreatePerformanceMetricRequest {
  job_id: string
  property_id: string
  completion_time_minutes: number
  quality_score: number
  customer_rating: number
  adherence_to_schedule: boolean
  notes?: string
}
```

#### Cleaning Contractor Availability
```typescript
// GET /contractors/:id/availability
interface GetContractorAvailabilityResponse {
  availability: CleaningAvailability[]
  upcoming_jobs: ScheduledJob[]
}

// PUT /contractors/:id/availability
interface UpdateContractorAvailabilityRequest {
  day_of_week: number
  start_time?: string
  end_time?: string
  is_available?: boolean
  max_jobs_per_day?: number
  preferred_property_types?: string[]
}
```

#### Cleaning Contractor Certifications
```typescript
// GET /contractors/:id/certifications
interface GetContractorCertificationsResponse {
  certifications: CleaningCertification[]
}

// POST /contractors/:id/certifications
interface CreateCertificationRequest {
  certification_name: string
  certification_type: 'SAFETY' | 'TECHNIQUE' | 'EQUIPMENT' | 'CHEMICAL' | 'SPECIALIZED'
  issued_by?: string
  issue_date?: string
  expiry_date?: string
  certificate_url?: string
}

// PUT /contractors/:id/certifications/:certId
interface UpdateCertificationRequest {
  certification_name?: string
  expiry_date?: string
  certificate_url?: string
  verification_status?: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REJECTED'
}
```

## Maintenance Service Worker Endpoints

### Maintenance Base: `https://maintenance.rightfit.com/api/contractors`

#### Maintenance Contractor Management
```typescript
// GET /contractors
interface GetMaintenanceContractorsQuery {
  page?: number
  limit?: number
  search?: string
  trade?: string
  specializations?: string[]
  experience_years_min?: number
  hourly_rate_max?: number
  service_radius?: number
  available_emergency?: boolean
  license_type?: string
}

interface GetMaintenanceContractorsResponse {
  contractors: MaintenanceContractor[]
  pagination: PaginationInfo
}

// POST /contractors
interface CreateMaintenanceContractorRequest {
  contractor_profile_id: string
  trade: string
  specializations?: string[]
  license_number?: string
  license_type?: string
  license_expiry?: string
  insurance_provider?: string
  insurance_policy_number?: string
  insurance_expiry?: string
  experience_years?: number
  hourly_rate?: number
  is_available_emergency?: boolean
  service_radius_km?: number
}

// GET /contractors/:id
interface GetMaintenanceContractorResponse {
  contractor: MaintenanceContractor & {
    certifications: MaintenanceCertification[]
    skills: MaintenanceSkill[]
    performance_metrics: MaintenancePerformanceMetric[]
  }
}

// PUT /contractors/:id
interface UpdateMaintenanceContractorRequest {
  trade?: string
  specializations?: string[]
  license_number?: string
  license_expiry?: string
  insurance_provider?: string
  insurance_policy_number?: string
  insurance_expiry?: string
  experience_years?: number
  hourly_rate?: number
  is_available_emergency?: boolean
  service_radius_km?: number
}
```

#### Maintenance Contractor Skills
```typescript
// GET /contractors/:id/skills
interface GetContractorSkillsResponse {
  skills: MaintenanceSkill[]
}

// POST /contractors/:id/skills
interface CreateSkillRequest {
  skill_name: string
  skill_category: 'TECHNICAL' | 'SAFETY' | 'SOFTWARE' | 'EQUIPMENT' | 'SOFT_SKILLS'
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  years_experience?: number
}

// PUT /contractors/:id/skills/:skillId
interface UpdateSkillRequest {
  skill_name?: string
  proficiency_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  years_experience?: number
  verified?: boolean
}
```

#### Maintenance Contractor Performance
```typescript
// GET /contractors/:id/performance
interface GetMaintenanceContractorPerformanceResponse {
  metrics: MaintenancePerformanceMetric[]
  summary: {
    total_work_orders: number
    average_quality_score: number
    average_customer_rating: number
    on_time_completion_rate: number
    first_time_fix_rate: number
    cost_efficiency_score: number
    average_completion_time: number
  }
}

// POST /contractors/:id/performance
interface CreateMaintenancePerformanceMetricRequest {
  work_order_id: string
  completion_time_hours: number
  quality_score: number
  on_time_completion: boolean
  customer_rating: number
  cost_efficiency_score: number
  first_time_fix: boolean
  notes?: string
}
```

## Data Models

### Shared Worker Models
```typescript
interface WorkerProfile {
  id: string
  original_contractor_id: string
  name: string
  phone: string
  email?: string
  company_name?: string
  sms_opt_out: boolean
  created_at: string
  updated_at: string
}

interface ServiceAssignment {
  id: string
  contractor_profile_id: string
  service_type: 'CLEANING' | 'MAINTENANCE'
  trade: string
  is_primary: boolean
  created_at: string
}

interface CrossServicePermissions {
  id: string
  contractor_profile_id: string
  primary_service: 'CLEANING' | 'MAINTENANCE'
  secondary_service?: 'CLEANING' | 'MAINTENANCE'
  can_accept_secondary: boolean
  max_weekly_hours_secondary: number
  schedule_conflicts_prevented: boolean
  created_at: string
  updated_at: string
}

interface WorkerSkill {
  id: string
  contractor_profile_id: string
  skill_name: string
  applicable_services: ('CLEANING' | 'MAINTENANCE')[]
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  years_experience: number
  verified: boolean
  verification_source?: string
  created_at: string
}
```

### Cleaning Service Models
```typescript
interface CleaningContractor {
  id: string
  contractor_profile_id: string
  tenant_id: string
  user_id?: string
  trade: string
  skills: string[]
  experience_years: number
  certification_level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SPECIALIST'
  availability_schedule: AvailabilitySchedule
  preferred_property_types: string[]
  average_job_time_minutes: number
  quality_score_avg: number
  reliability_score: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface CleaningCertification {
  id: string
  contractor_id: string
  certification_name: string
  certification_type: 'SAFETY' | 'TECHNIQUE' | 'EQUIPMENT' | 'CHEMICAL' | 'SPECIALIZED'
  issued_by?: string
  issue_date?: string
  expiry_date?: string
  certificate_url?: string
  is_active: boolean
  verification_status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REJECTED'
  created_at: string
}

interface CleaningPerformanceMetric {
  id: string
  contractor_id: string
  job_id: string
  property_id: string
  completion_time_minutes: number
  quality_score: number
  customer_rating: number
  adherence_to_schedule: boolean
  notes?: string
  completed_at: string
}
```

### Maintenance Service Models
```typescript
interface MaintenanceContractor {
  id: string
  contractor_profile_id: string
  tenant_id: string
  user_id?: string
  trade: string
  specializations: string[]
  license_number?: string
  license_expiry?: string
  license_type?: string
  insurance_provider?: string
  insurance_policy_number?: string
  insurance_expiry?: string
  experience_years: number
  hourly_rate: number
  is_available_emergency: boolean
  service_radius_km: number
  average_job_time_hours: number
  quality_score_avg: number
  reliability_score: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface MaintenanceCertification {
  id: string
  contractor_id: string
  certification_name: string
  certification_type: 'LICENSE' | 'CERTIFICATION' | 'TRAINING' | 'SPECIALIZATION'
  license_number?: string
  issued_by?: string
  issue_date?: string
  expiry_date?: string
  certificate_url?: string
  is_active: boolean
  verification_status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REJECTED'
  created_at: string
}

interface MaintenanceSkill {
  id: string
  contractor_id: string
  skill_name: string
  skill_category: 'TECHNICAL' | 'SAFETY' | 'SOFTWARE' | 'EQUIPMENT' | 'SOFT_SKILLS'
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  years_experience: number
  verified: boolean
  verification_date?: string
  verification_source?: string
  created_at: string
}
```

## Frontend Integration

### API Client Updates

#### Shared Worker Service Client
```typescript
// lib/sharedWorkerApi.ts
class SharedWorkerApi {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getWorkerProfiles(params?: GetWorkerProfilesQuery) {
    const response = await fetch(`${this.baseUrl}/workers/profiles?${new URLSearchParams(params as any)}`)
    return response.json()
  }

  async getWorkerProfile(id: string) {
    const response = await fetch(`${this.baseUrl}/workers/profiles/${id}`)
    return response.json()
  }

  async updateWorkerProfile(id: string, data: UpdateWorkerProfileRequest) {
    const response = await fetch(`${this.baseUrl}/workers/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async createServiceAssignment(profileId: string, data: CreateServiceAssignmentRequest) {
    const response = await fetch(`${this.baseUrl}/workers/${profileId}/service-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}
```

#### Cleaning Service Client
```typescript
// lib/cleaningApi.ts
class CleaningApi {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getContractors(params?: GetCleaningContractorsQuery) {
    const token = localStorage.getItem('cleaning_access_token')
    const response = await fetch(`${this.baseUrl}/contractors?${new URLSearchParams(params as any)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  }

  async createContractor(data: CreateCleaningContractorRequest) {
    const token = localStorage.getItem('cleaning_access_token')
    const response = await fetch(`${this.baseUrl}/contractors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async getContractorPerformance(id: string) {
    const token = localStorage.getItem('cleaning_access_token')
    const response = await fetch(`${this.baseUrl}/contractors/${id}/performance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  }
}
```

## Migration Strategy

### Phase 1: Backend API Development
1. Implement shared authentication worker endpoints
2. Create cleaning service contractor endpoints
3. Create maintenance service contractor endpoints
4. Set up database connections and models

### Phase 2: Frontend Integration
1. Update existing contractor management pages
2. Implement new worker-specific features
3. Add cross-service worker management
4. Update authentication to use shared service

### Phase 3: Testing and Validation
1. Test worker CRUD operations in both services
2. Validate cross-service permissions
3. Test worker performance tracking
4. Verify data consistency across services

### Phase 4: Gradual Migration
1. Migrate existing contractors to new system
2. Enable dual-service worker support
3. Retire legacy contractor endpoints
4. Monitor performance and issues

## Error Handling

### Common Error Responses
```typescript
interface ErrorResponse {
  error: string
  message: string
  details?: any
  timestamp: string
}

// 404 - Worker not found
{
  error: 'WORKER_NOT_FOUND',
  message: 'Worker profile not found',
  timestamp: '2025-01-17T10:30:00Z'
}

// 409 - Conflict - Worker already assigned to service
{
  error: 'SERVICE_ASSIGNMENT_CONFLICT',
  message: 'Worker already assigned to this service',
  details: {
    contractor_profile_id: 'uuid',
    service_type: 'CLEANING'
  },
  timestamp: '2025-01-17T10:30:00Z'
}

// 422 - Validation error
{
  error: 'VALIDATION_ERROR',
  message: 'Invalid data provided',
  details: {
    field: 'hourly_rate',
    message: 'Hourly rate must be positive'
  },
  timestamp: '2025-01-17T10:30:00Z'
}
```

## Security Considerations

### Authentication and Authorization
- All endpoints require valid JWT tokens
- Role-based access control for different operations
- Tenant isolation for multi-tenant support
- Rate limiting to prevent abuse

### Data Protection
- PII encryption in database
- Audit logging for all worker data changes
- Secure file upload for certificates and documents
- GDPR compliance for worker data

### Network Security
- HTTPS required for all API calls
- CORS configuration for cross-origin requests
- Request validation and sanitization
- SQL injection prevention