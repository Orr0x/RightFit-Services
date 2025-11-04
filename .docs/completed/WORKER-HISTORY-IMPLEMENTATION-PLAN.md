# Worker History Implementation Plan

## 🎯 Goal
Create a comprehensive activity timeline for each worker showing:
- Worker profile changes (contact info, photo, rate changes)
- All assigned jobs (cleaning, maintenance)
- Job completions and performance
- Certificate uploads, renewals, and expirations
- Availability changes
- Performance milestones (e.g., "100th job completed!")
- Ratings and reviews received

---

## 📋 Why Worker History?

### Business Value
- **Performance Tracking** - Complete job history per worker
- **Training Needs** - Identify patterns (slow completions, recurring issues)
- **HR Compliance** - Audit trail for certificate renewals, rate changes
- **Worker Recognition** - Highlight milestones and achievements
- **Dispute Resolution** - Clear record of assignments and completions
- **Analytics** - Worker productivity trends over time

### User Stories
1. **Manager:** "I want to see all jobs a worker has completed this month"
2. **Manager:** "I need to know when a worker's certificate expires"
3. **Manager:** "Show me which worker has the best completion rate"
4. **Worker:** "I want to see my own performance history"
5. **Manager:** "Track when we changed worker rates for payroll"
6. **Manager:** "See which properties a worker has serviced"

---

## 🗄️ Database Schema

### WorkerHistory Table

```prisma
model WorkerHistory {
  id                 String                @id @default(uuid())
  worker_id          String
  changed_by_user_id String?               // Admin who made the change
  changed_at         DateTime              @default(now())
  change_type        WorkerHistoryChangeType
  field_name         String?               @db.VarChar(100)
  old_value          String?               @db.Text
  new_value          String?               @db.Text
  description        String?               @db.VarChar(500)
  metadata           Json?                 // Job IDs, property names, etc.

  worker Worker @relation(fields: [worker_id], references: [id], onDelete: Cascade)

  @@index([worker_id])
  @@index([changed_at])
  @@index([change_type])
  @@map("worker_history")
}

enum WorkerHistoryChangeType {
  // Profile events
  WORKER_CREATED          // Worker account created
  PROFILE_UPDATED         // Basic profile fields changed
  PHOTO_UPLOADED          // Profile photo added/changed
  CONTACT_INFO_UPDATED    // Phone, email changed
  RATE_CHANGED            // Hourly rate modified
  STATUS_CHANGED          // Active/inactive status

  // Job events
  JOB_ASSIGNED            // Assigned to a job (cleaning or maintenance)
  JOB_REASSIGNED          // Job reassigned to different worker
  JOB_UNASSIGNED          // Removed from a job
  JOB_STARTED             // Worker started a job
  JOB_COMPLETED           // Worker completed a job
  JOB_CANCELLED           // Assigned job was cancelled

  // Certificate events
  CERTIFICATE_UPLOADED    // New certificate added
  CERTIFICATE_RENEWED     // Certificate renewed
  CERTIFICATE_EXPIRING    // Certificate expiring soon (auto-generated)
  CERTIFICATE_EXPIRED     // Certificate expired (auto-generated)
  CERTIFICATE_REMOVED     // Certificate deleted

  // Availability events
  AVAILABILITY_UPDATED    // Working hours/days changed
  TIME_OFF_REQUESTED      // PTO/vacation requested
  TIME_OFF_APPROVED       // Time off approved
  TIME_OFF_DECLINED       // Time off declined

  // Performance events
  RATING_RECEIVED         // Customer rating received
  MILESTONE_REACHED       // 10th job, 50th job, 100th job, etc.
  COMPLAINT_FILED         // Customer complaint
  COMMENDATION_RECEIVED   // Positive feedback/commendation

  // Other
  NOTE_ADDED              // Admin note added to worker profile
  EMERGENCY_CONTACT_UPDATED
}
```

**Total:** 25 event types for comprehensive worker tracking

---

## ⚙️ Backend Service

### WorkerHistoryService.ts

```typescript
export class WorkerHistoryService {
  // Core recording method
  async recordChange(input: RecordWorkerHistoryInput): Promise<WorkerHistory>

  // Query methods
  async getWorkerHistory(workerId: string, limit?: number): Promise<WorkerHistory[]>
  async getWorkerHistoryByType(workerId: string, changeType: WorkerHistoryChangeType): Promise<WorkerHistory[]>
  async getWorkerHistoryDateRange(workerId: string, startDate: Date, endDate: Date): Promise<WorkerHistory[]>

  // Profile event methods
  async recordWorkerCreated(workerId: string, workerName: string, userId?: string)
  async recordProfileUpdated(workerId: string, fieldName: string, oldValue: string, newValue: string, userId?: string)
  async recordPhotoUploaded(workerId: string, userId?: string)
  async recordContactInfoUpdated(workerId: string, fieldName: string, oldValue: string, newValue: string, userId?: string)
  async recordRateChanged(workerId: string, oldRate: string, newRate: string, userId?: string)
  async recordStatusChanged(workerId: string, oldStatus: string, newStatus: string, userId?: string)

  // Job event methods
  async recordJobAssigned(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', propertyName?: string, userId?: string)
  async recordJobReassigned(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', oldWorkerName: string, newWorkerName: string, userId?: string)
  async recordJobUnassigned(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', reason?: string, userId?: string)
  async recordJobStarted(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', propertyName?: string)
  async recordJobCompleted(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', propertyName?: string, duration?: number)
  async recordJobCancelled(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', reason?: string)

  // Certificate event methods
  async recordCertificateUploaded(workerId: string, certId: string, certName: string, expiryDate?: Date, userId?: string)
  async recordCertificateRenewed(workerId: string, certId: string, certName: string, newExpiryDate: Date, userId?: string)
  async recordCertificateExpiring(workerId: string, certId: string, certName: string, expiryDate: Date, daysUntilExpiry: number)
  async recordCertificateExpired(workerId: string, certId: string, certName: string, expiryDate: Date)
  async recordCertificateRemoved(workerId: string, certId: string, certName: string, userId?: string)

  // Performance event methods
  async recordRatingReceived(workerId: string, jobId: string, rating: number, propertyName?: string)
  async recordMilestoneReached(workerId: string, milestoneType: string, count: number)
  async recordComplaintFiled(workerId: string, complaintDetails: string, jobId?: string)
  async recordCommendationReceived(workerId: string, commendation: string, jobId?: string)

  // Availability event methods
  async recordAvailabilityUpdated(workerId: string, oldAvailability: string, newAvailability: string, userId?: string)
  async recordTimeOffRequested(workerId: string, startDate: Date, endDate: Date, reason?: string)
  async recordTimeOffApproved(workerId: string, startDate: Date, endDate: Date, approvedBy?: string)
  async recordTimeOffDeclined(workerId: string, startDate: Date, endDate: Date, reason?: string)

  // Other methods
  async recordNoteAdded(workerId: string, note: string, userId?: string)
  async recordEmergencyContactUpdated(workerId: string, oldContact: string, newContact: string, userId?: string)

  // Analytics methods
  async getWorkerJobCount(workerId: string): Promise<number>
  async getWorkerAverageRating(workerId: string): Promise<number>
  async getWorkerCompletionRate(workerId: string): Promise<number>
}
```

---

## 🔌 API Routes

### GET /api/workers/:id/history

**Query Parameters:**
- `limit` - Number of entries to return (default 50)
- `change_type` - Filter by specific change type
- `from_date` - Start date for date range
- `to_date` - End date for date range

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "worker_id": "uuid",
      "changed_by_user_id": "uuid",
      "changed_at": "2025-11-04T10:30:00Z",
      "change_type": "JOB_COMPLETED",
      "description": "Completed cleaning job at Loch View Cabin (2.5 hours)",
      "metadata": {
        "job_id": "job-uuid",
        "job_type": "CLEANING",
        "property_name": "Loch View Cabin",
        "duration_hours": 2.5
      }
    },
    {
      "id": "uuid",
      "worker_id": "uuid",
      "changed_by_user_id": "admin-uuid",
      "changed_at": "2025-11-01T14:20:00Z",
      "change_type": "RATE_CHANGED",
      "field_name": "hourly_rate",
      "old_value": "£15.00",
      "new_value": "£16.50",
      "description": "Hourly rate increased from £15.00 to £16.50",
      "metadata": {
        "reason": "Performance review increase"
      }
    }
  ]
}
```

### Additional Endpoints
```
GET  /api/workers/:id/history/stats       # Get worker performance stats
GET  /api/workers/:id/history/milestones  # Get milestone events only
GET  /api/workers/:id/history/ratings     # Get all ratings received
GET  /api/workers/:id/history/jobs        # Get all job-related events
```

---

## 🎨 Frontend Component

### WorkerHistoryTimeline.tsx

Similar to `PropertyHistoryTimeline` and `JobHistoryTimeline`, but with worker-specific events.

**Features:**
- Timeline layout with vertical line
- Color-coded icons per event type
- Relative timestamps
- Expandable view (show 10, expand to all)
- Filterable by event category:
  - All
  - Jobs Only
  - Certificates Only
  - Performance Only
  - Profile Changes Only
- Click job events to navigate to job details
- Click property names to navigate to property details

**Icon System:**
```typescript
const getChangeIcon = (changeType: WorkerHistoryEntry['change_type']) => {
  switch (changeType) {
    // Profile events
    case 'WORKER_CREATED': return '👤'
    case 'PROFILE_UPDATED': return '✏️'
    case 'PHOTO_UPLOADED': return '📷'
    case 'CONTACT_INFO_UPDATED': return '📞'
    case 'RATE_CHANGED': return '💰'
    case 'STATUS_CHANGED': return '🔄'

    // Job events
    case 'JOB_ASSIGNED': return '📋'
    case 'JOB_STARTED': return '▶️'
    case 'JOB_COMPLETED': return '✅'
    case 'JOB_CANCELLED': return '❌'

    // Certificate events
    case 'CERTIFICATE_UPLOADED': return '📜'
    case 'CERTIFICATE_RENEWED': return '🔄'
    case 'CERTIFICATE_EXPIRING': return '⚠️'
    case 'CERTIFICATE_EXPIRED': return '❌'

    // Performance events
    case 'RATING_RECEIVED': return '⭐'
    case 'MILESTONE_REACHED': return '🏆'
    case 'COMPLAINT_FILED': return '⚠️'
    case 'COMMENDATION_RECEIVED': return '🌟'

    // Availability events
    case 'AVAILABILITY_UPDATED': return '📅'
    case 'TIME_OFF_REQUESTED': return '🏖️'
    case 'TIME_OFF_APPROVED': return '✅'

    default: return '📝'
  }
}
```

**Color System:**
```typescript
const getChangeColor = (changeType: WorkerHistoryEntry['change_type']) => {
  // Profile events - Blue
  // Job events - Green (completed), Red (cancelled), Purple (assigned)
  // Certificate events - Amber (expiring), Red (expired), Blue (uploaded)
  // Performance events - Gold (positive), Red (negative)
  // Availability events - Cyan
}
```

---

## 🔗 Integration Points

### 1. Worker Details Page
**File:** `apps/web-cleaning/src/pages/WorkerDetails.tsx`

Add new tab: "History"
```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <Tab value="overview">Overview</Tab>
  <Tab value="schedule">Schedule</Tab>
  <Tab value="certificates">Certificates</Tab>
  <Tab value="history">History</Tab>    {/* NEW */}
  <Tab value="availability">Availability</Tab>
</Tabs>

{activeTab === 'history' && (
  <WorkerHistoryTimeline workerId={worker.id} />
)}
```

### 2. CleaningJobsService Integration
**File:** `apps/api/src/services/CleaningJobsService.ts`

Track job assignments to workers:
```typescript
async update(id: string, input: UpdateCleaningJobInput, ...) {
  const oldJob = await prisma.cleaningJob.findUnique({ where: { id } })

  // ... update job

  // Track worker assignment changes
  if (oldJob.assigned_worker_id !== input.assigned_worker_id) {
    if (!oldJob.assigned_worker_id && input.assigned_worker_id) {
      // Worker assigned
      await workerHistoryService.recordJobAssigned(
        input.assigned_worker_id,
        job.id,
        'CLEANING',
        property.name
      )
    } else if (oldJob.assigned_worker_id && input.assigned_worker_id) {
      // Worker changed
      await workerHistoryService.recordJobReassigned(
        oldJob.assigned_worker_id,
        job.id,
        'CLEANING',
        oldWorker.name,
        newWorker.name
      )
    }
  }
}

async startJob(id: string, workerId: string) {
  // ... start job logic

  await workerHistoryService.recordJobStarted(
    workerId,
    job.id,
    'CLEANING',
    property.name
  )
}

async completeJob(id: string) {
  // ... complete job logic

  await workerHistoryService.recordJobCompleted(
    job.assigned_worker_id,
    job.id,
    'CLEANING',
    property.name,
    durationHours
  )
}
```

### 3. MaintenanceJobsService Integration
Same pattern as CleaningJobsService, but with `'MAINTENANCE'` job type.

### 4. WorkersService Integration
**File:** `apps/api/src/services/WorkersService.ts` (may need to create)

Track profile changes:
```typescript
async create(input: CreateWorkerInput, userId?: string) {
  const worker = await prisma.worker.create({ data: input })

  await workerHistoryService.recordWorkerCreated(
    worker.id,
    `${worker.first_name} ${worker.last_name}`,
    userId
  )

  return worker
}

async update(id: string, input: UpdateWorkerInput, userId?: string) {
  const oldWorker = await prisma.worker.findUnique({ where: { id } })
  const worker = await prisma.worker.update({ where: { id }, data: input })

  // Track rate changes
  if (oldWorker.hourly_rate !== input.hourly_rate) {
    await workerHistoryService.recordRateChanged(
      worker.id,
      oldWorker.hourly_rate.toString(),
      input.hourly_rate.toString(),
      userId
    )
  }

  // Track status changes
  if (oldWorker.is_active !== input.is_active) {
    await workerHistoryService.recordStatusChanged(
      worker.id,
      oldWorker.is_active ? 'Active' : 'Inactive',
      input.is_active ? 'Active' : 'Inactive',
      userId
    )
  }

  return worker
}
```

### 5. Certificate Upload Integration
When certificates are uploaded/deleted:
```typescript
async uploadCertificate(workerId: string, certData: CertificateInput, userId?: string) {
  const cert = await prisma.workerCertificate.create({ data: certData })

  await workerHistoryService.recordCertificateUploaded(
    workerId,
    cert.id,
    cert.name,
    cert.expiry_date,
    userId
  )

  return cert
}

async deleteCertificate(certId: string, userId?: string) {
  const cert = await prisma.workerCertificate.findUnique({ where: { id: certId } })
  await prisma.workerCertificate.delete({ where: { id: certId } })

  await workerHistoryService.recordCertificateRemoved(
    cert.worker_id,
    cert.id,
    cert.name,
    userId
  )
}
```

### 6. Automated Certificate Expiry Warnings
**Cron Job or Scheduled Task:**
```typescript
// Run daily
async function checkCertificateExpiry() {
  const certificates = await prisma.workerCertificate.findMany({
    where: {
      expiry_date: {
        gte: new Date(),
        lte: addDays(new Date(), 30)  // Expiring in next 30 days
      }
    }
  })

  for (const cert of certificates) {
    const daysUntilExpiry = differenceInDays(cert.expiry_date, new Date())

    await workerHistoryService.recordCertificateExpiring(
      cert.worker_id,
      cert.id,
      cert.name,
      cert.expiry_date,
      daysUntilExpiry
    )
  }
}
```

### 7. Milestone Tracking
**After job completion:**
```typescript
async completeJob(id: string) {
  // ... complete job logic

  const jobCount = await prisma.cleaningJob.count({
    where: {
      assigned_worker_id: worker.id,
      status: 'COMPLETED'
    }
  })

  // Check for milestones
  if ([10, 25, 50, 100, 250, 500, 1000].includes(jobCount)) {
    await workerHistoryService.recordMilestoneReached(
      worker.id,
      'JOBS_COMPLETED',
      jobCount
    )
  }
}
```

---

## 📊 Timeline Example

```
👤 Worker "Sarah Smith" created
   6 months ago

💰 Hourly rate increased from £15.00 to £16.50
   3 months ago

📜 Gas Safety certificate uploaded (expires Jun 2026)
   3 months ago

📋 Assigned to cleaning job at Loch View Cabin →
   4 days ago

▶️ Started cleaning job at Loch View Cabin →
   3 days ago

✅ Completed cleaning job at Loch View Cabin (2.5 hours) →
   3 days ago

⭐ Received 5-star rating from customer
   3 days ago

🏆 Milestone: 50th job completed!
   3 days ago

📋 Assigned to cleaning job at Lodge 7 →
   Today

⚠️ Gas Safety certificate expiring in 30 days
   Today
```

---

## 🎯 Implementation Steps

### Step 1: Database Schema (1 hour)
1. Add `WorkerHistory` model to schema.prisma
2. Add `WorkerHistoryChangeType` enum with all 25 types
3. Add `history` relation to `Worker` model
4. Run `prisma db push`

### Step 2: Backend Service (3 hours)
1. Create `WorkerHistoryService.ts`
2. Implement all recording methods
3. Implement query methods
4. Add unit tests

### Step 3: API Routes (1 hour)
1. Add `GET /api/workers/:id/history` endpoint
2. Add query parameter support (limit, change_type, dates)
3. Add stats endpoints
4. Test with Postman/Thunder Client

### Step 4: Service Integration (3 hours)
1. Integrate into CleaningJobsService
2. Integrate into MaintenanceJobsService
3. Integrate into WorkersService (create if needed)
4. Add certificate tracking
5. Test all integrations

### Step 5: Frontend Component (4 hours)
1. Create `WorkerHistoryTimeline.tsx`
2. Implement icon/color system
3. Add filtering by category
4. Add clickable navigation
5. Style and polish

### Step 6: Worker Details Integration (1 hour)
1. Add "History" tab to WorkerDetails page
2. Integrate WorkerHistoryTimeline component
3. Test navigation and display

### Step 7: Backfill Script (2 hours)
1. Create `backfill-worker-history.ts`
2. Backfill worker creation events
3. Backfill job assignments/completions
4. Run on production data

### Step 8: Milestone & Automation (2 hours)
1. Add milestone detection logic
2. Create certificate expiry checker
3. Set up cron job/scheduled task
4. Test automated events

**Total Estimated Time:** ~17 hours (2-3 days)

---

## 📋 Testing Checklist

### Backend
- [ ] Worker history table created
- [ ] WorkerHistoryService created
- [ ] Worker creation records history
- [ ] Job assignments record history
- [ ] Job completions record history
- [ ] Certificate uploads record history
- [ ] Rate changes record history
- [ ] API endpoint returns data
- [ ] Filtering works (by type, date range)

### Frontend
- [ ] WorkerHistoryTimeline component created
- [ ] Displays all event types correctly
- [ ] Icons and colors match spec
- [ ] Clickable links work
- [ ] Timestamps format correctly
- [ ] Filters work
- [ ] Loading states work
- [ ] Error states work

### Integration
- [ ] Create worker → see "Worker created"
- [ ] Assign job → see "Job assigned"
- [ ] Start job → see "Job started"
- [ ] Complete job → see "Job completed"
- [ ] Upload certificate → see "Certificate uploaded"
- [ ] Change rate → see "Rate changed"
- [ ] Milestone reached → see "Milestone" event

---

## 🎁 Benefits

### For Managers
- **Complete Worker Visibility** - Full history of worker activity
- **Performance Analytics** - Job completion rates, average duration
- **Certificate Compliance** - Never miss a certificate renewal
- **HR Documentation** - Audit trail for rate changes, status changes
- **Dispute Resolution** - Clear record of assignments and completions

### For Workers
- **Personal Dashboard** - View their own performance history
- **Achievement Tracking** - See milestones and commendations
- **Certificate Reminders** - Know when renewals are due
- **Job History** - Portfolio of completed work

### For Business
- **Retention Analytics** - Track worker tenure and performance
- **Training Needs** - Identify patterns requiring training
- **Payroll Accuracy** - Audit trail for rate changes
- **Quality Control** - Track ratings and complaints

---

## 🚀 Future Enhancements

### Phase 1: Advanced Analytics
- Worker performance dashboard
- Comparison charts (worker vs worker)
- Trend analysis (improving/declining performance)
- Predictive analytics (churn risk)

### Phase 2: Worker Self-Service
- Worker mobile app with own history
- Achievement badges
- Personal goal setting
- Performance insights

### Phase 3: Automated Actions
- Auto-send certificate renewal reminders
- Auto-flag underperforming workers
- Auto-reward milestone achievements
- Auto-generate performance reports

### Phase 4: Integration
- Export to payroll systems
- Integration with HR software
- Integration with scheduling systems
- Real-time notifications

---

## 📝 Files to Create

### Backend
1. `apps/api/src/services/WorkerHistoryService.ts` - Core service
2. `apps/api/src/routes/workers.ts` - API routes (or extend existing)
3. `apps/api/scripts/backfill-worker-history.ts` - Backfill script
4. `packages/database/prisma/schema.prisma` - Update with WorkerHistory model

### Frontend
1. `apps/web-cleaning/src/components/WorkerHistoryTimeline.tsx` - Timeline component
2. `apps/web-cleaning/src/lib/api.ts` - Add WorkerHistoryEntry type and API methods
3. `apps/web-cleaning/src/pages/WorkerDetails.tsx` - Update with History tab

---

## ✅ Success Criteria

- ✅ All 25 event types tracked
- ✅ Timeline displays on worker details page
- ✅ Clickable links to jobs/properties work
- ✅ Historical data backfilled
- ✅ Automated certificate warnings working
- ✅ Milestone detection working
- ✅ Performance stats calculated correctly

---

## 🎯 Ready to Implement

This plan provides a complete roadmap for implementing worker history tracking. The pattern follows the successful implementations of:
- ✅ Job History (cleaning jobs)
- ✅ Property History (properties)

The service can be built incrementally:
1. Start with basic events (created, profile updates)
2. Add job tracking
3. Add certificate tracking
4. Add performance/milestone tracking
5. Add automation

**Estimated Timeline:** 2-3 days for full implementation
**Dependencies:** None (can start immediately)

---

*Ready to implement: 2025-11-04*
