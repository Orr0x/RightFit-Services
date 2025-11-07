# Worker App Enhancement Plan

## Current Status
✅ Basic functionality working:
- Worker authentication and dashboard
- Schedule view (week/month) with job indicators
- Blocked date visualization
- Job history with earnings
- Navigation between pages
- Photo upload (BEFORE/AFTER/ISSUE categories)
- Checklist functionality

## Enhancement Requirements

### 1. Maintenance Issue Creation from Cleaning Jobs
**User Story**: As a worker, I want to report maintenance issues discovered during cleaning so the maintenance team can address them.

**Implementation**:
- Add "Report Maintenance Issue" button in JobDetails page
- Create `CreateMaintenanceIssueModal` component
- Link to existing maintenance job system
- Pre-populate with:
  - Property details from cleaning job
  - Customer information
  - Photos from ISSUE category
  - Worker notes

**Data Flow**:
```
Cleaning Job (Worker App)
  → Create Maintenance Job (API)
    → Links to property_id, customer_id
    → Creates maintenance_job record
    → Updates cleaning_job.maintenance_issues_found count
    → Visible in Cleaning Portal & Maintenance Portal
```

**API Endpoints Needed**:
- `POST /api/maintenance-jobs` - Create maintenance job from cleaning worker
- Link uses existing property and customer data
- Maintenance job shows in both cleaning and maintenance tenants

### 2. Enhanced Job Cards with Photos
**Implementation**:
- Display before/after photos in job cards
- Show job progress (checklist completion %)
- Add quick actions (navigate, call customer)
- Visual status indicators

**Components to Update**:
- `JobCard.tsx` - Add photo thumbnails
- `JobDetails.tsx` - Enhance property information display
- Show property access codes, Wi-Fi, parking instructions

### 3. Data Flow Integration

#### Property Data
```
Source: property table (shared across tenants)
Used in:
  - Worker App: Property details in job cards
  - Cleaning Portal: Property management
  - Maintenance Portal: Maintenance jobs
```

#### Job Data
```
Source: cleaning_jobs table
Used in:
  - Worker App: My schedule, job details, history
  - Cleaning Portal: Job assignment, scheduling

Worker updates flow back to:
  - Cleaning Portal: Job status, photos, completion
  - Property history: Service records
```

#### Blocked Days Calendar Integration
```
Worker blocks dates
  → worker_availability table (status: BLOCKED)
    → Cleaning Portal calendar shows unavailable days
    → Prevents job assignment to blocked dates
    → Visible in worker management
```

**Implementation**:
- Worker availability already updates database
- Need to integrate with Cleaning Portal calendar view
- Add visual indicator in job assignment UI

### 4. Maintenance Issue Workflow

**Complete Flow**:
1. **Worker discovers issue during cleaning**
   - Takes photos (ISSUE category)
   - Notes issue details

2. **Worker creates maintenance job**
   - From JobDetails page
   - Modal with form:
     - Issue title/description
     - Category (PLUMBING, ELECTRICAL, etc.)
     - Priority (LOW, MEDIUM, HIGH, URGENT)
     - Photos from cleaning job
     - Property/customer auto-filled

3. **Maintenance job created**
   - Appears in Maintenance Portal
   - Linked to cleaning job
   - Customer notification sent
   - Property history updated

4. **Tracking & Visibility**
   - Cleaning job shows "Maintenance Issues: 1"
   - Click to see related maintenance jobs
   - Maintenance portal can generate quotes
   - Full lifecycle tracking

## Implementation Tasks

### Phase 1: Maintenance Issue Creation
- [ ] Create `CreateMaintenanceIssueModal` component
- [ ] Add "Report Issue" button to JobDetails
- [ ] Build form with category, priority, description
- [ ] Integrate with existing maintenance job API
- [ ] Link ISSUE photos to maintenance job
- [ ] Update cleaning job to track issues raised
- [ ] Test cross-tenant visibility

### Phase 2: Enhanced Job Cards
- [ ] Add photo thumbnails to job cards
- [ ] Show checklist completion percentage
- [ ] Add property access information section
- [ ] Implement quick action buttons
- [ ] Add customer contact integration
- [ ] Improve loading states

### Phase 3: Calendar Integration
- [ ] Test worker availability updates
- [ ] Verify Cleaning Portal calendar integration
- [ ] Add blocked date indicators in job assignment
- [ ] Test date conflict prevention
- [ ] Document calendar sync workflow

### Phase 4: Photo & Checklist Enhancements
- [ ] Add photo gallery view (lightbox)
- [ ] Allow photo annotation
- [ ] Enhanced checklist templates
- [ ] Photo quality validation
- [ ] Offline photo queue (PWA feature)

## API Endpoints Required

### Existing (Already Implemented)
- `GET /api/cleaning-jobs` - List jobs
- `GET /api/cleaning-jobs/:id` - Job details
- `PUT /api/cleaning-jobs/:id` - Update job
- `POST /api/cleaning-jobs/:id/timesheets/:timesheetId/photos` - Upload photos
- `POST /api/worker-availability` - Block dates
- `PUT /api/cleaning-jobs/:id/checklist/:itemId` - Update checklist

### New Endpoints Needed
- `POST /api/maintenance-jobs` (with worker authentication)
  - Create from cleaning job context
  - Link to property, customer, cleaning job
  - Accept photos from cleaning timesheet

- `GET /api/cleaning-jobs/:id/maintenance-issues`
  - List maintenance jobs raised from this cleaning job
  - Shows status, assigned contractor, etc.

## Database Schema Considerations

### Existing Tables
- `cleaning_jobs` - Has maintenance_issues_found counter ✅
- `maintenance_jobs` - Can link to cleaning_jobs ✅
- `property` - Shared across tenants ✅
- `worker_availability` - Updates calendar ✅
- `cleaning_job_photos` - Categorized photos ✅

### Potential New Fields
- `maintenance_jobs.raised_by_worker_id` - Track which worker reported
- `maintenance_jobs.cleaning_job_id` - Link to originating cleaning job
- `cleaning_jobs.last_maintenance_check` - Track when issues were reviewed

## Testing Checklist

### Data Flow Tests
- [ ] Worker creates maintenance job → appears in Maintenance Portal
- [ ] Worker blocks dates → shows in Cleaning Portal calendar
- [ ] Job completion → updates property history
- [ ] Photos uploaded → visible in Cleaning Portal
- [ ] Checklist completion → syncs with Cleaning Portal

### Integration Tests
- [ ] Property data consistency across tenants
- [ ] Customer data visibility
- [ ] Photo access across portals
- [ ] Calendar synchronization
- [ ] Multi-tenant data isolation

### User Acceptance
- [ ] Worker can complete full job workflow
- [ ] Maintenance issues are actionable
- [ ] Photos are high quality and categorized
- [ ] Checklists improve work quality
- [ ] Calendar blocks prevent conflicts

## Success Metrics

### Worker Efficiency
- Time to complete job workflow
- Photo upload success rate
- Checklist completion rate
- Maintenance issue reporting rate

### Data Quality
- Complete job records (all fields filled)
- Photo quality and categorization
- Accurate time tracking
- Proper issue documentation

### Business Impact
- Faster maintenance issue resolution
- Better customer communication
- Improved property maintenance
- Reduced scheduling conflicts
- Higher job completion quality

## Next Steps

1. **Immediate**: Implement maintenance issue creation modal
2. **Next**: Enhance job cards with photos and property info
3. **Then**: Test and verify calendar integration
4. **Finally**: Add advanced features (photo gallery, offline support)

## Documentation Needs
- Worker training guide for maintenance reporting
- API documentation for maintenance job creation
- Calendar integration guide for cleaning portal
- Photo upload best practices
- Cross-tenant data flow diagrams
