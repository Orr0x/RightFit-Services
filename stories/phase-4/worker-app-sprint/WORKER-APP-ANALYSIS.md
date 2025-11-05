# Worker App - Requirements Analysis

**Date**: 2025-11-05
**Sprint**: Phase 4 - Worker Web Application
**Status**: Planning Phase

---

## Executive Summary

The Worker Web Application is a dedicated interface for cleaning workers to manage their daily tasks, view their schedule, access property information, and complete jobs efficiently. This app bridges the gap between office management (cleaning dashboard) and field workers.

**Primary Goals**:
1. Enable workers to view and manage their job schedule
2. Provide easy access to property information and locations
3. Allow workers to start/complete jobs with photo documentation
4. Let workers manage their availability and personal information
5. Streamline the job completion workflow with integrated checklists

---

## User Research

### Target Users
**Primary User**: Cleaning Workers (Employees & Contractors)
- Age range: 20-60
- Tech proficiency: Low to Medium
- Device: Mobile phone or tablet (responsive web app)
- Usage context: On the go, at properties, limited time
- Key needs: Simple interface, clear instructions, offline capability

**Secondary User**: Cleaning Service Manager
- Monitors worker activity
- Assigns jobs
- Reviews completed work

### User Personas

**Persona 1: Sarah - Full-time Cleaner**
- 35 years old, employee for 3 years
- Uses smartphone daily but prefers simple apps
- Works 5-6 properties per day
- Needs: Quick access to today's schedule, property access codes, photo upload

**Persona 2: Mike - Part-time Contractor**
- 28 years old, works 2-3 days per week
- Tech-savvy, uses multiple apps
- Needs: Flexible availability management, clear rota, payment tracking

**Persona 3: Janet - New Worker**
- 42 years old, just started
- Low tech confidence, needs guidance
- Needs: Step-by-step job instructions, clear checklists, easy navigation

---

## Feature Requirements

### Must-Have Features (MVP)

#### 1. Authentication & Security
- Worker login with email/password
- Remember me functionality
- Password reset
- Session management
- Tenant isolation (service provider specific)

#### 2. Today's Jobs Dashboard
- **Priority**: CRITICAL
- List of today's scheduled jobs
- Job status indicators (upcoming, in-progress, completed)
- Quick actions: Start job, view details
- Time remaining until next job
- Property address and navigation link

#### 3. Schedule/Rota View
- **Priority**: CRITICAL
- Calendar view of assigned jobs
- Week view and month view
- Job details on click
- Color-coded by status
- Sync with timesheet data

#### 4. Job Details Page
- **Priority**: CRITICAL
- Property information:
  - Name, address, postcode
  - Property type, bedrooms, bathrooms
  - Access instructions and codes
  - WiFi credentials
  - Parking information
  - Pet information
- Customer information (name, contact)
- Job schedule (date, time window)
- Quoted price and pricing type
- Special requirements
- Navigation button (Google Maps integration)

#### 5. Job Checklist
- **Priority**: CRITICAL
- View checklist items for the job
- Check off completed items
- Progress indicator
- Mark all as complete
- Cannot complete job without finishing checklist

#### 6. Start/Complete Job Workflow
- **Priority**: CRITICAL
- **Start Job**:
  - Creates timesheet entry
  - Records start time automatically
  - Updates job status to IN_PROGRESS
  - Simple confirmation modal
- **Complete Job**:
  - Records end time automatically
  - Prompts for work performed description
  - Prompts for completion notes
  - Upload before/after photos
  - Cannot complete without photos (configurable)
  - Updates job status to COMPLETED

#### 7. Photo Upload
- **Priority**: CRITICAL
- Camera integration (mobile)
- File upload (desktop)
- Photo categories: Before, After, Issue
- Multiple photos per category
- Photo preview before upload
- Delete/retake option
- Progress indicator

#### 8. Personal Profile
- **Priority**: HIGH
- View/edit basic information:
  - First name, last name
  - Email, phone
  - Address (optional)
- Upload profile photo
- View employment details (read-only):
  - Worker type
  - Employment type
  - Hourly rate
  - Jobs completed
- View certificates (uploaded by manager)

#### 9. Availability Management
- **Priority**: HIGH
- Calendar view of availability
- Block out unavailable dates
- Mark specific date ranges as unavailable
- Reason for unavailability (optional)
- View existing blocked dates
- Delete blocked dates
- Manager notification when dates are blocked

### Should-Have Features (Phase 2)

#### 10. Work History
- View past completed jobs
- Filter by date range
- Total hours worked
- Total earnings (estimated)
- Photos from past jobs

#### 11. Notifications
- New job assigned
- Job reminder (1 hour before)
- Schedule changes
- Messages from manager

#### 12. Report Issue
- Report maintenance issues found during cleaning
- Photo upload for issues
- Priority selection
- Category selection
- Auto-creates maintenance job

#### 13. Offline Mode
- View today's jobs offline
- View property information offline
- Queue photos for upload when online
- Sync when connection restored

### Nice-to-Have Features (Future)

#### 14. Earnings Dashboard
- Total earnings this week/month
- Hours worked
- Average hourly rate
- Payment history

#### 15. Training Materials
- Video tutorials
- Property-specific guides
- Cleaning tips and tricks

#### 16. Chat with Manager
- Direct messaging
- Photo sharing
- Quick questions

#### 17. GPS Check-in
- Verify worker is at property
- Automatic check-in on arrival
- Track time spent at property

---

## Technical Requirements

### Frontend Architecture
**Technology**: React + TypeScript (matches existing web-cleaning app)
**Port**: 5178 (web-worker)
**Base URL**: http://localhost:5178

### Existing Backend Integration
The Worker App uses EXISTING APIs from the cleaning dashboard:

#### Authentication
- POST /api/auth/login (worker credentials)
- Uses Worker model from database

#### Jobs API
- GET /api/cleaning-jobs (filter by assigned_worker_id)
- GET /api/cleaning-jobs/:id
- PATCH /api/cleaning-jobs/:id (update checklist)

#### Timesheet API (Exists)
- POST /api/cleaning-timesheets (start job)
- PUT /api/cleaning-timesheets/:id (update)
- POST /api/cleaning-timesheets/:id/complete (complete job)
- POST /api/cleaning-timesheets/:id/photos (upload photos)

#### Worker API
- GET /api/workers/:id (get worker profile)
- PATCH /api/workers/:id (update profile)
- POST /api/workers/:id/photo (upload photo)

#### Worker Availability API (NEW - Need to create)
- GET /api/workers/:id/availability
- POST /api/workers/:id/availability (block dates)
- DELETE /api/workers/:id/availability/:availabilityId

### New Database Tables Needed

#### WorkerAvailability
```prisma
model WorkerAvailability {
  id            String   @id @default(uuid())
  worker_id     String
  start_date    DateTime
  end_date      DateTime
  reason        String?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  worker        Worker   @relation(fields: [worker_id], references: [id], onDelete: Cascade)
}
```

### Responsive Design Requirements
- Mobile-first design (320px minimum width)
- Tablet optimized (768px)
- Desktop support (1024px+)
- Touch-friendly buttons (44px minimum tap target)
- Large, readable fonts (16px minimum)
- High contrast for outdoor visibility

### Performance Requirements
- Initial load: < 3 seconds
- Page transitions: < 500ms
- Photo upload: Progress indicator required
- Offline data: Cache today's jobs and property info

---

## User Workflows

### Workflow 1: Daily Job Routine
1. Worker logs in
2. Sees today's jobs dashboard
3. Clicks on first job
4. Views property details and access codes
5. Taps "Navigate" to open Google Maps
6. Arrives at property
7. Taps "Start Job"
8. Completes checklist items as they work
9. Takes before photos (optional)
10. Completes cleaning tasks
11. Takes after photos
12. Taps "Complete Job"
13. Enters work performed notes
14. Uploads photos
15. Confirms completion
16. Moves to next job

### Workflow 2: Block Out Availability
1. Worker opens Profile
2. Taps "Manage Availability"
3. Sees calendar view
4. Taps date range to block
5. Selects start and end date
6. Enters reason (optional): "Holiday"
7. Confirms blocking
8. Manager receives notification
9. Manager won't schedule jobs on those dates

### Workflow 3: Report Maintenance Issue
1. Worker is completing a job
2. Notices broken shower head
3. Taps "Report Issue" button
4. Enters issue title: "Broken shower head"
5. Enters description
6. Selects category: "Plumbing"
7. Selects priority: "Medium"
8. Takes photo of issue
9. Submits issue
10. Maintenance job auto-created
11. Manager notified

---

## Success Criteria

### User Acceptance Criteria
- Workers can complete a full job workflow in < 5 minutes
- 90% of workers successfully upload photos on first try
- Workers can find property access codes within 10 seconds
- Availability blocking works without manager intervention
- Photo upload success rate > 95%

### Business Metrics
- Reduced phone calls to office (workers have all info in app)
- Faster job completion (integrated workflow)
- Better photo documentation (easier to upload)
- Improved schedule compliance (workers see their rota)
- Fewer scheduling conflicts (availability management)

### Technical Metrics
- App uptime > 99%
- Photo upload success rate > 95%
- Page load time < 3 seconds
- Mobile responsive on all devices
- Works on iOS Safari and Android Chrome

---

## Constraints & Limitations

### Technical Constraints
- Must use existing backend APIs (no major backend changes)
- Must integrate with existing Worker and CleaningJob models
- Must maintain tenant isolation
- Photo storage limited to 10MB per photo
- Limited offline functionality (not a PWA initially)

### Business Constraints
- Workers may have limited data plans (optimize photo compression)
- Workers may have older phones (must work on 3-year-old devices)
- Some workers may have limited tech literacy (must be extremely simple)
- Multiple workers may share devices (logout must be obvious)

### Design Constraints
- Must match RightFit Services branding
- Must be consistent with cleaning dashboard UI
- Must work in bright sunlight (high contrast mode)
- Must work with gloves on (large touch targets)

---

## Risk Analysis

### High Risk
1. **Photo Upload Failures**
   - Mitigation: Robust retry logic, queue failed uploads, show clear error messages

2. **Workers Not Logging In**
   - Mitigation: Remember me functionality, simple password reset

3. **Confusion About Job Workflow**
   - Mitigation: Clear visual indicators, step-by-step process, tooltips

### Medium Risk
1. **Availability Blocking Conflicts**
   - Mitigation: Validate dates, show warnings, allow manager override

2. **Checklist Not Completed**
   - Mitigation: Block job completion until checklist done, visual progress

3. **Poor Network at Properties**
   - Mitigation: Offline mode for viewing, queue uploads

### Low Risk
1. **Profile Updates Not Saving**
   - Mitigation: Clear success/error messages, validation

2. **Calendar View Confusing**
   - Mitigation: Simple month view, clear selected dates

---

## Dependencies

### Existing Systems
- Cleaning Dashboard (manager side)
- Backend API (existing endpoints)
- CleaningJobTimesheetService (job start/complete)
- Worker model and database

### New Systems Required
- WorkerAvailabilityService (backend)
- Worker availability routes (backend)
- WorkerAvailability database table

### External Dependencies
- Google Maps (for navigation)
- Camera/file upload APIs (browser)
- Image compression library (reduce photo sizes)

---

## Next Steps

1. Create Technical Specification document
2. Create Sprint Plan with story breakdown
3. Design wireframes and mockups
4. Create database migration for WorkerAvailability
5. Begin Sprint Day 1 implementation

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
**Author**: Claude Code Analysis
