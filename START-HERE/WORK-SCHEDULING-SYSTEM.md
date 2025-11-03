# Work Scheduling & Assignment System

**Feature**: Comprehensive work scheduling with tenant-specific terminology
**Status**: Ready to build
**Priority**: P0 (Critical for Phase 3)

---

## 🎯 Overview

This document describes the work scheduling and assignment system that allows service providers to:

1. **Schedule work in advance** - Assign workers/contractors to future jobs with specific time slots
2. **Prevent double-booking** - Detect scheduling conflicts automatically
3. **Support mobile check-in** - Keep existing "Start Work" button for workers to clock in on-site
4. **Use correct terminology** - "Workers" for cleaning, "Contractors" for maintenance

---

## 📊 System Architecture

### Database Schema (Already Exists ✅)

```
Worker Table:
├── worker_type: CLEANER | MAINTENANCE | BOTH
├── employment_type: FULL_TIME | PART_TIME | CONTRACTOR
├── hourly_rate: Decimal
├── average_rating: Decimal
├── jobs_completed: Int
└── is_active: Boolean

ExternalContractor Table (Maintenance Only):
├── company_name: String
├── contact_name: String
├── specialties: String[] (e.g., PLUMBING, ELECTRICAL)
├── preferred_contractor: Boolean
├── emergency_callout_available: Boolean
└── average_rating: Decimal

CleaningJob / MaintenanceJob:
├── assigned_worker_id: String? (links to Worker)
├── assigned_external_contractor_id: String? (MaintenanceJob only)
├── scheduled_date: Date
├── scheduled_start_time: String (e.g., "09:00")
├── scheduled_end_time: String (e.g., "11:00")
├── actual_start_time: DateTime?
├── actual_end_time: DateTime?
└── status: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
```

---

## 🎭 Terminology by Tenant

### Cleaning Portal (web-cleaning)
- **Label**: "Workers"
- **Filter**: `worker_type IN ['CLEANER', 'BOTH']`
- **Source**: Worker table only
- **Typical employment_type**: FULL_TIME, PART_TIME

### Maintenance Portal (web-maintenance)
- **Label**: "Contractors"
- **Filter**:
  - Worker table: `worker_type IN ['MAINTENANCE', 'BOTH']` AND `employment_type = 'CONTRACTOR'`
  - ExternalContractor table: All records
- **Source**: Both Worker and ExternalContractor tables
- **Badge**: "External" badge shown for ExternalContractor records

---

## 🔄 User Flows

### Flow 1: Schedule Work in Advance

```
Service Provider Workflow:
1. Navigate to job details (unassigned job)
2. Click "Schedule & Assign Worker/Contractor"
3. Select date (future date required)
4. Select start time (e.g., 09:00)
5. Select end time (e.g., 11:00)
6. View list of available workers/contractors
   - Green badge = Available
   - Red badge = Busy (with conflict details)
7. Select worker/contractor
8. Click "Schedule Contractor"
9. System validates no conflicts
10. Job assigned, status → SCHEDULED
11. Notification sent to worker (future)

Result:
- Job status: SCHEDULED
- Worker assigned: ✅
- Schedule set: ✅
- Worker notified: ✅ (future)
```

### Flow 2: Mobile Worker Starts Job (Keep Existing)

```
Mobile Worker Workflow:
1. Worker arrives at job site
2. Opens mobile app / job details page
3. Sees "Start Job" button (only for SCHEDULED jobs assigned to them)
4. Clicks "Start Job"
5. System records actual_start_time
6. Status → IN_PROGRESS
7. Worker performs checklist
8. Worker uploads photos
9. Worker clicks "Complete Job"
10. System shows completion modal
11. Worker adds notes
12. System records actual_end_time
13. Status → COMPLETED
14. Invoice auto-generated

Result:
- Accurate time tracking (actual vs scheduled)
- Job completed with documentation
- Customer billed automatically
```

### Flow 3: Reassign Worker

```
Service Provider Workflow:
1. Navigate to scheduled job details
2. Click "Reassign Contractor"
3. Same scheduling modal appears
4. Pre-populated with current schedule
5. Select different worker/contractor
6. System validates new worker availability
7. Job reassigned
8. Both workers notified (future)

Result:
- Job reassigned to new worker
- Original worker freed up
- New worker scheduled
```

---

## 🚦 Conflict Detection

### What Counts as a Conflict?

A conflict occurs when:
- Same worker assigned to multiple jobs
- Time slots overlap on the same date
- Job status is SCHEDULED or IN_PROGRESS (not COMPLETED or CANCELLED)

### Overlap Logic

```typescript
function timeSlotsOverlap(
  start1: string,  // "09:00"
  end1: string,    // "11:00"
  start2: string,  // "10:00"
  end2: string     // "12:00"
): boolean {
  const s1 = toMinutes(start1);  // 540
  const e1 = toMinutes(end1);    // 660
  const s2 = toMinutes(start2);  // 600
  const e2 = toMinutes(end2);    // 720

  return s1 < e2 && s2 < e1;  // true (conflict!)
}
```

### Examples

**Conflict:**
- Job A: 09:00 - 11:00
- Job B: 10:00 - 12:00
- ❌ Overlap: 10:00 - 11:00

**No Conflict:**
- Job A: 09:00 - 11:00
- Job B: 11:00 - 13:00
- ✅ No overlap (back-to-back jobs OK)

**No Conflict:**
- Job A: 09:00 - 11:00 (COMPLETED)
- Job B: 10:00 - 12:00 (SCHEDULED)
- ✅ No conflict (completed jobs don't count)

---

## 🎨 UI Components

### 1. WorkerSchedulingModal

**Purpose**: Schedule work and assign worker/contractor

**Features**:
- Date picker (future dates only)
- Time pickers (start & end)
- Real-time availability checking
- Worker/contractor list with availability indicators
- Conflict details display
- Validation before assignment

**States**:
- Loading: Checking availability...
- Available: Green badge, clickable
- Busy: Red badge, shows conflicts, still clickable (with warning)
- Selected: Blue border, highlighted

### 2. Job Details Page Updates

**New Buttons**:
- "Schedule & Assign Worker" (for unassigned jobs)
- "Reassign Worker" (for assigned jobs)

**Existing Buttons** (Keep Intact):
- "Start Job" (mobile worker check-in)
- "Complete Job" (job completion modal)

**Worker/Contractor Info Card**:
- Shows assigned worker/contractor details
- Shows schedule (date, start time, end time)
- Shows actual times (if started/completed)
- Shows "Reassign" button

### 3. Workers/Contractors List Page

**Purpose**: View and manage all workers/contractors

**Features**:
- Grid or list view
- Filter by availability, rating, specialties
- Search by name
- "View Schedule" button per worker
- Quick stats: rating, jobs completed, hourly rate

**Terminology**:
- Cleaning: "Workers"
- Maintenance: "Contractors" (with "External" badge for ExternalContractor records)

### 4. Worker Schedule View (Future)

**Purpose**: See all jobs assigned to a specific worker

**Features**:
- Calendar view by week/month
- List of upcoming jobs
- Past jobs history
- Availability visualization

---

## 📡 API Endpoints

### Assignment with Scheduling

```http
PUT /api/cleaning-jobs/:id/assign
PUT /api/maintenance-jobs/:id/assign

Headers:
  Content-Type: application/json

Body:
{
  "worker_id": "uuid",
  "scheduled_date": "2025-11-05",
  "scheduled_start_time": "09:00",
  "scheduled_end_time": "11:00",
  "service_provider_id": "uuid"
}

Response 200:
{
  "data": {
    "id": "uuid",
    "assigned_worker": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe"
    },
    "scheduled_date": "2025-11-05T00:00:00Z",
    "scheduled_start_time": "09:00",
    "scheduled_end_time": "11:00",
    "status": "SCHEDULED"
  }
}

Response 400 (Conflict):
{
  "error": "Worker has conflicting job(s)",
  "conflicts": [
    {
      "job_id": "uuid",
      "scheduled_start_time": "10:00",
      "scheduled_end_time": "12:00",
      "property_name": "Maple House"
    }
  ]
}
```

### External Contractor Assignment (Maintenance Only)

```http
PUT /api/maintenance-jobs/:id/assign-external

Body:
{
  "external_contractor_id": "uuid",
  "scheduled_date": "2025-11-05",
  "scheduled_start_time": "09:00",
  "scheduled_end_time": "11:00",
  "service_provider_id": "uuid"
}

Response: Same as internal assignment
```

### Check Availability

```http
GET /api/workers/available?date=2025-11-05&start_time=09:00&end_time=11:00&worker_type=CLEANER&service_provider_id=uuid

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "worker_type": "CLEANER",
      "employment_type": "FULL_TIME",
      "hourly_rate": 15.00,
      "average_rating": 4.8,
      "jobs_completed": 45,
      "is_available": true,
      "conflicts": []
    },
    {
      "id": "uuid2",
      "first_name": "Jane",
      "last_name": "Smith",
      "worker_type": "CLEANER",
      "employment_type": "PART_TIME",
      "hourly_rate": 14.00,
      "average_rating": 4.9,
      "jobs_completed": 32,
      "is_available": false,
      "conflicts": [
        {
          "job_id": "uuid",
          "scheduled_start_time": "10:00",
          "scheduled_end_time": "12:00",
          "property_name": "Oak Villa"
        }
      ]
    }
  ]
}
```

### Mobile Worker Endpoints (Keep Existing)

```http
POST /api/cleaning-jobs/:id/start
Body: { "worker_id": "uuid" }

POST /api/cleaning-jobs/:id/complete
Body: {
  "worker_id": "uuid",
  "completion_notes": "All tasks completed",
  "actual_price": 45.00,
  "before_photo_ids": ["uuid1", "uuid2"],
  "after_photo_ids": ["uuid3", "uuid4"],
  "generate_invoice": true
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Happy Path - Schedule Worker

```
GIVEN a cleaning service provider
  AND an unassigned cleaning job for 2025-11-05
WHEN they schedule the job for 09:00-11:00
  AND assign Worker "John Doe"
  AND Worker "John Doe" has no conflicts
THEN the job is assigned successfully
  AND job status is SCHEDULED
  AND job shows assigned_worker_id = John's ID
  AND job shows scheduled_start_time = "09:00"
```

### Scenario 2: Conflict Detection

```
GIVEN Worker "John Doe"
  AND John has Job A: 2025-11-05 10:00-12:00
WHEN assigning John to Job B: 2025-11-05 09:00-11:00
THEN system detects conflict (09:00-11:00 overlaps 10:00-12:00)
  AND system shows conflict warning
  AND system prevents assignment
  AND returns 400 error with conflict details
```

### Scenario 3: Back-to-Back Jobs (No Conflict)

```
GIVEN Worker "John Doe"
  AND John has Job A: 2025-11-05 09:00-11:00
WHEN assigning John to Job B: 2025-11-05 11:00-13:00
THEN no conflict detected (end time = start time OK)
  AND system allows assignment
  AND John has 2 jobs scheduled back-to-back
```

### Scenario 4: Mobile Worker Starts Job

```
GIVEN Worker "John Doe" assigned to Job A
  AND Job A status is SCHEDULED
  AND Job A scheduled for 2025-11-05 09:00-11:00
WHEN John clicks "Start Job" at 09:05
THEN job status changes to IN_PROGRESS
  AND actual_start_time recorded as 2025-11-05 09:05:00
  AND John can now complete the job
```

### Scenario 5: Reassign Worker

```
GIVEN Job A assigned to Worker "John Doe"
  AND Job A scheduled for 2025-11-05 09:00-11:00
WHEN service provider reassigns to Worker "Jane Smith"
  AND Jane has no conflicts
THEN job assigned to Jane
  AND assigned_worker_id updated to Jane's ID
  AND John is freed up for that time slot
  AND (future) both workers notified
```

### Scenario 6: Maintenance Contractor Terminology

```
GIVEN maintenance service provider
WHEN they view the workers list
THEN page title shows "Contractors"
  AND button shows "Add Contractor"
  AND list includes Workers where worker_type = MAINTENANCE + employment_type = CONTRACTOR
  AND list includes all ExternalContractors
  AND External contractors show "External" badge
```

---

## 🚀 Implementation Priority

### Phase 1 (Current Sprint): Core Scheduling
- [x] Database schema verification (already exists!)
- [ ] API: assignWorker() with scheduling
- [ ] API: Conflict detection logic
- [ ] Frontend: WorkerSchedulingModal component
- [ ] Frontend: Integration with job details pages
- [ ] Frontend: Terminology per tenant

### Phase 2 (Future Sprint): Enhanced Features
- [ ] Workers/Contractors list page with filtering
- [ ] Worker schedule view (calendar)
- [ ] Reassignment workflow
- [ ] Batch scheduling
- [ ] Notifications (email/SMS)

### Phase 3 (Mobile App): Worker Mobile Experience
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Offline mode
- [ ] GPS tracking
- [ ] Mobile checklist

---

## 📈 Success Metrics

**Key Metrics:**
- Worker utilization rate (% of time scheduled)
- Double-booking incidents (target: 0)
- Average response time (job creation → assignment)
- Customer satisfaction with service timing
- Worker satisfaction with schedule predictability

**After Implementation:**
- Service providers can schedule work 1-4 weeks in advance
- Zero double-booking conflicts
- Workers see their weekly schedule
- Customers see scheduled arrival times
- Actual vs scheduled time variance tracked

---

## 🔗 Related Stories

**Depends On:**
- STORY-201: Worker Assignment API Endpoints (conflict detection)

**Enables:**
- STORY-301: Job Completion Modal (uses scheduled vs actual times)
- STORY-303: Invoice Generation (uses actual times for billing)
- Future: Calendar view of schedules
- Future: Mobile worker app
- Future: Automated scheduling optimization

---

## 💡 Future Enhancements

1. **Smart Scheduling**
   - AI-powered optimal worker selection
   - Travel time between jobs
   - Worker skill matching
   - Customer preference matching

2. **Advanced Calendar**
   - Drag-and-drop job reassignment
   - Multi-week view
   - Team view (all workers)
   - Export to Google Calendar

3. **Recurring Jobs**
   - Schedule cleaning every Monday
   - Auto-assign same worker
   - Exception handling (holidays, worker unavailable)

4. **Mobile Notifications**
   - Push notifications for assignments
   - SMS reminders 1 hour before job
   - Customer arrival notifications
   - Job completion alerts

5. **Analytics**
   - Worker productivity reports
   - Schedule adherence (on-time arrival %)
   - Overtime tracking
   - Revenue per worker

---

*Document created: 2025-11-02*
*Ready to implement in Phase 3 Sprint!* 🚀
