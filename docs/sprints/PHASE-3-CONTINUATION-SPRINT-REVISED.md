# Phase 3 Continuation Sprint: Job Management Completion (REVISED)

**Sprint Goal**: Complete worker assignment, job completion workflow, and invoice generation.

**Priority**: HIGH - Core job management features needed for production

**Estimated Duration**: 3-4 days

**Status**: 📋 **READY TO START** (After Verification 2025-11-02)

**Revision Notes**:
- Original sprint: 31 points, 7-10 days
- After verification: 16 points, 3-4 days
- Removed 11 points of already-implemented features
- Deferred 4 points to future sprints (nice-to-have features)

---

## 🎯 Sprint Overview

**Sprint Objectives:**
1. ✅ ~~Enable service providers to view and edit cleaning job details~~ **ALREADY EXISTS**
2. ✅ Implement worker assignment system for both cleaning and maintenance
3. ✅ Complete the job lifecycle with completion workflow and invoicing
4. ✅ Enable photo upload and customer feedback

**Current State (After Verification):**
- ✅ CleaningDashboard.tsx shows list of jobs
- ✅ MaintenanceDashboard.tsx shows jobs with tabs
- ✅ MaintenanceJobDetails.tsx shows job details with quote submission
- ✅ Quote approval workflow complete
- ✅ **CleaningJobDetails.tsx EXISTS** (2 copies, production-ready)
- ✅ **CreateCleaningJob.tsx EXISTS** (create form ready, edit mode missing)
- ✅ **PhotosService EXISTS** (dual-mode local/S3 storage ready)
- ❌ Worker assignment not implemented
- ❌ Job completion modal missing
- ❌ Photo upload React component missing
- ❌ Invoice generation not implemented

**Target State:**
- ✅ Cleaning jobs have full details page **DONE**
- ✅ Workers can be assigned to jobs **TO BUILD**
- ✅ Jobs can be marked complete with photos **TO BUILD**
- ✅ Invoices auto-generated on completion **TO BUILD**
- ✅ Customers can rate completed jobs **TO BUILD**

---

## 📊 Sprint Breakdown (REVISED)

| Epic | Stories | Original | Revised | Status | Duration |
|------|---------|----------|---------|--------|----------|
| **Epic 1: Cleaning Job Details** | 1 story | 8 pts | 1 pt | ⚠️ Mostly Done | 0.5 days |
| **Epic 2: Worker Assignment** | 2 stories | 13 pts | 6 pts | ❌ To Build | 1-2 days |
| **Epic 3: Job Completion** | 4 stories | 10 pts | 9 pts | ❌ To Build | 2-3 days |
| **Total** | **7 stories** | **31 pts** | **16 pts** | - | **3-4 days** |

**Key Changes:**
- ✅ Removed STORY-101 (CleaningJobDetails.tsx already exists)
- ✅ Reduced STORY-102 to 1 pt (only edit mode needed)
- ⏭️ Deferred STORY-103 (checklist management to mobile app)
- ⏭️ Deferred STORY-203, 204, 205 (calendar, conflict UI to future sprint)

---

## Epic 1: Cleaning Job Details & Management 🧹

**Status**: ⚠️ **95% COMPLETE** (Only edit mode missing)

**What Already Exists:**
- ✅ `/apps/web-cleaning/src/pages/CleaningJobDetails.tsx` (511 lines, fully functional)
- ✅ `/apps/web-cleaning/src/pages/cleaning/CleaningJobDetails.tsx` (349 lines, fully functional)
- ✅ `/apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx` (create form)
- ✅ All UI components: property info, customer info, worker assignment, checklist progress, photos, actions
- ✅ Maintenance issue reporting form (cross-sell)
- ✅ Status update buttons (Start, Complete, Cancel)
- ✅ Navigation to edit and assign pages

**What's Missing:**
- ❌ Edit mode for CreateCleaningJob form (pre-populate with existing data)

---

### ~~STORY-101: Create CleaningJobDetails.tsx Page~~
**Status**: ✅ **ALREADY EXISTS** - REMOVED FROM SPRINT

This story is complete. CleaningJobDetails.tsx exists with all required features.

---

### STORY-102: Add Edit Mode to Cleaning Job Form
**Priority**: P2 (Low)
**Estimate**: 1 point (reduced from 3)
**Effort**: ~1 hour
**Status**: ⏭️ Ready

**As a** cleaning service provider
**I want** to edit existing cleaning jobs
**So that** I can update schedule, worker assignment, or pricing

**Acceptance Criteria**:
- [ ] Update `CreateCleaningJob.tsx` to support edit mode
- [ ] Load existing job data when `?edit=true&jobId=xxx` in URL
- [ ] Pre-populate all form fields with existing job data
- [ ] Change page title to "Edit Cleaning Job"
- [ ] Change submit button to "Update Job"
- [ ] API call to PUT /api/cleaning-jobs/:id instead of POST
- [ ] Navigate back to job details after successful update

**Technical Implementation**:
```typescript
// apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx

export default function CreateCleaningJob() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const isEditMode = searchParams.get('edit') === 'true';

  useEffect(() => {
    if (isEditMode && jobId) {
      loadExistingJob(jobId);
    }
  }, [isEditMode, jobId]);

  const loadExistingJob = async (id: string) => {
    const job = await cleaningJobsAPI.get(id, SERVICE_PROVIDER_ID);
    setFormData({
      service_id: job.service_id,
      property_id: job.property_id,
      customer_id: job.customer_id,
      assigned_worker_id: job.assigned_worker_id || '',
      scheduled_date: new Date(job.scheduled_date).toISOString().split('T')[0],
      scheduled_start_time: job.scheduled_start_time,
      scheduled_end_time: job.scheduled_end_time,
      pricing_type: job.pricing_type,
      quoted_price: job.quoted_price,
      service_provider_id: SERVICE_PROVIDER_ID,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && jobId) {
      const updatedJob = await cleaningJobsAPI.update(jobId, formData);
      toast.success('Cleaning job updated successfully');
      navigate(`/cleaning/jobs/${jobId}`);
    } else {
      const newJob = await cleaningJobsAPI.create(formData);
      toast.success('Cleaning job created successfully');
      navigate(`/cleaning/jobs/${newJob.id}`);
    }
  };

  return (
    <div>
      <h1>{isEditMode ? 'Edit Cleaning Job' : 'Schedule Cleaning Job'}</h1>
      <form onSubmit={handleSubmit}>
        {/* Existing form fields */}
        <Button type="submit">
          {isEditMode ? 'Update Job' : 'Create Job'}
        </Button>
      </form>
    </div>
  );
}
```

**Testing Checklist**:
- [ ] Can load existing job data
- [ ] Form pre-populates correctly
- [ ] Can update all fields
- [ ] Update API call succeeds
- [ ] Navigates back to job details after update
- [ ] Toast notification shows success
- [ ] Error handling for failed updates

---

### ~~STORY-103: Checklist Management~~
**Status**: ⏭️ **DEFERRED TO MOBILE WORKER APP**

Checklist display exists. Full management should be built in mobile worker app where cleaners actually use it.

---

## Epic 2: Worker Assignment System 👷

**Status**: ❌ **NOT IMPLEMENTED**

**What Exists:**
- ✅ Worker model in database
- ✅ CleaningJobsService.update() accepts assigned_worker_id
- ✅ PUT /api/cleaning-jobs/:id can update worker assignment
- ✅ "Assign Worker" button in CleaningJobDetails

**What's Missing:**
- ❌ Dedicated assign endpoints
- ❌ Availability checking
- ❌ Conflict detection
- ❌ WorkerAssignment UI component

---

### STORY-201: Worker Assignment API Endpoints
**Priority**: P0 (Critical)
**Estimate**: 3 points
**Effort**: ~3 hours
**Status**: ⏭️ Ready

**As a** service provider
**I want** a dedicated API to assign workers to jobs
**So that** I can ensure workers aren't double-booked and are available

**Acceptance Criteria**:
- [ ] Create `PUT /api/cleaning-jobs/:id/assign` endpoint
- [ ] Create `PUT /api/maintenance-jobs/:id/assign` endpoint
- [ ] Validate worker exists and belongs to service provider
- [ ] Check worker availability (not assigned to overlapping job)
- [ ] Detect scheduling conflicts (overlapping time slots)
- [ ] Return conflict details if worker is unavailable
- [ ] Send notification to worker (future: email/SMS)
- [ ] Log assignment in job history

**Technical Implementation**:

```typescript
// apps/api/src/services/CleaningJobsService.ts

async assignWorker(
  jobId: string,
  workerId: string,
  serviceProviderId: string
): Promise<CleaningJob> {
  // 1. Verify job exists and belongs to provider
  const job = await this.getById(jobId, serviceProviderId);

  // 2. Verify worker exists and belongs to provider
  const worker = await prisma.worker.findFirst({
    where: {
      id: workerId,
      service_provider_id: serviceProviderId,
      is_active: true,
    },
  });

  if (!worker) {
    throw new ValidationError('Worker not found or inactive');
  }

  // 3. Check for scheduling conflicts
  const conflicts = await this.checkWorkerAvailability(
    workerId,
    job.scheduled_date,
    job.scheduled_start_time,
    job.scheduled_end_time
  );

  if (conflicts.length > 0) {
    throw new ValidationError('Worker has conflicting job(s)', { conflicts });
  }

  // 4. Assign worker
  const updatedJob = await prisma.cleaningJob.update({
    where: { id: jobId },
    data: {
      assigned_worker_id: workerId,
      updated_at: new Date(),
    },
    include: {
      property: true,
      customer: true,
      assigned_worker: true,
    },
  });

  // 5. TODO: Send notification to worker
  // await notificationService.notifyWorkerAssignment(worker, updatedJob);

  return updatedJob;
}

async checkWorkerAvailability(
  workerId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<CleaningJob[]> {
  // Find overlapping jobs
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const overlappingJobs = await prisma.cleaningJob.findMany({
    where: {
      assigned_worker_id: workerId,
      scheduled_date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS'],
      },
    },
    include: {
      property: true,
    },
  });

  // Check if any jobs have overlapping time
  const conflicts = overlappingJobs.filter(job => {
    return this.timeSlotsOverlap(
      startTime,
      endTime,
      job.scheduled_start_time,
      job.scheduled_end_time
    );
  });

  return conflicts;
}

private timeSlotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert "HH:MM" to minutes since midnight
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return s1 < e2 && s2 < e1;
}
```

**API Routes**:
```typescript
// apps/api/src/routes/cleaning-jobs.ts

// PUT /api/cleaning-jobs/:id/assign
router.put('/:id/assign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    const workerId = req.body.worker_id;

    if (!serviceProviderId || !workerId) {
      return res.status(400).json({
        error: 'service_provider_id and worker_id are required'
      });
    }

    const job = await cleaningJobsService.assignWorker(
      req.params.id,
      workerId,
      serviceProviderId
    );

    res.json({ data: job });
  } catch (error) {
    next(error);
  }
});
```

**Testing Checklist**:
- [ ] Can assign worker to cleaning job
- [ ] Can assign worker to maintenance job
- [ ] Validates worker exists
- [ ] Detects conflicts (overlapping times)
- [ ] Returns 400 with conflict details
- [ ] Allows same worker for different time slots
- [ ] Handles cancelled/completed jobs in conflict check

---

### STORY-202: WorkerAssignment.tsx Component
**Priority**: P0 (Critical)
**Estimate**: 3 points (reduced from 5)
**Effort**: ~3 hours
**Status**: ⏭️ Ready

**As a** service provider
**I want** a UI to select and assign workers
**So that** I can see which workers are available before assigning

**Acceptance Criteria**:
- [ ] Create `apps/web-cleaning/src/components/WorkerAssignment.tsx`
- [ ] Show list of active workers
- [ ] Display worker info (name, phone, rating, jobs completed)
- [ ] Show availability indicator (available, busy, conflict)
- [ ] Highlight conflicting jobs with red indicator
- [ ] Show conflict details on hover (job time, location)
- [ ] Confirm assignment with modal
- [ ] Call PUT /api/cleaning-jobs/:id/assign
- [ ] Show error if conflict exists
- [ ] Refresh job details after successful assignment
- [ ] Mobile responsive

**Technical Implementation**:

```typescript
// apps/web-cleaning/src/components/WorkerAssignment.tsx

interface WorkerAssignmentProps {
  jobId: string;
  jobDate: Date;
  jobStartTime: string;
  jobEndTime: string;
  onAssigned: () => void;
  onCancel: () => void;
}

interface WorkerAvailability {
  worker: Worker;
  isAvailable: boolean;
  conflicts: CleaningJob[];
}

export default function WorkerAssignment({
  jobId,
  jobDate,
  jobStartTime,
  jobEndTime,
  onAssigned,
  onCancel,
}: WorkerAssignmentProps) {
  const [workers, setWorkers] = useState<WorkerAvailability[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    // 1. Fetch all active workers
    const allWorkers = await workersAPI.list(SERVICE_PROVIDER_ID);

    // 2. Check availability for each worker
    const workersWithAvailability = await Promise.all(
      allWorkers.map(async (worker) => {
        const conflicts = await checkWorkerConflicts(
          worker.id,
          jobDate,
          jobStartTime,
          jobEndTime
        );

        return {
          worker,
          isAvailable: conflicts.length === 0,
          conflicts,
        };
      })
    );

    setWorkers(workersWithAvailability);
  };

  const checkWorkerConflicts = async (
    workerId: string,
    date: Date,
    start: string,
    end: string
  ): Promise<CleaningJob[]> => {
    const response = await fetch(
      `/api/cleaning-jobs?worker_id=${workerId}&from_date=${date.toISOString()}&to_date=${date.toISOString()}`
    );
    const { data: jobs } = await response.json();

    // Filter to only jobs with overlapping times
    return jobs.filter((job: CleaningJob) => {
      return timeSlotsOverlap(start, end, job.scheduled_start_time, job.scheduled_end_time);
    });
  };

  const handleAssign = async () => {
    if (!selectedWorker) return;

    setIsAssigning(true);
    try {
      await cleaningJobsAPI.assign(jobId, selectedWorker, SERVICE_PROVIDER_ID);
      toast.success('Worker assigned successfully');
      onAssigned();
    } catch (err: any) {
      if (err.response?.data?.conflicts) {
        toast.error(`Worker has ${err.response.data.conflicts.length} conflicting job(s)`);
      } else {
        toast.error('Failed to assign worker');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Assign Worker</h2>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="text-sm text-gray-600">Job Schedule</div>
        <div className="font-medium">
          {jobDate.toLocaleDateString()} {jobStartTime} - {jobEndTime}
        </div>
      </div>

      <div className="space-y-3">
        {workers.map(({ worker, isAvailable, conflicts }) => (
          <div
            key={worker.id}
            className={`
              p-4 border-2 rounded-lg cursor-pointer transition-all
              ${selectedWorker === worker.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${!isAvailable ? 'opacity-60' : ''}
            `}
            onClick={() => setSelectedWorker(worker.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {worker.first_name} {worker.last_name}
                  </h3>
                  {isAvailable ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="error">Busy</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{worker.phone}</p>
                <div className="flex gap-3 mt-1 text-sm text-gray-600">
                  <span>⭐ {worker.average_rating || 'N/A'}</span>
                  <span>📋 {worker.jobs_completed} jobs</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  £{worker.hourly_rate}/hr
                </div>
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                <div className="font-medium text-red-800">Conflicts:</div>
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="text-red-700">
                    • {conflict.scheduled_start_time} - {conflict.scheduled_end_time} at{' '}
                    {conflict.property?.property_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={handleAssign}
          disabled={!selectedWorker || isAssigning}
          className="flex-1"
        >
          {isAssigning ? 'Assigning...' : 'Assign Worker'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
```

**Usage in CleaningJobDetails**:
```typescript
// apps/web-cleaning/src/pages/CleaningJobDetails.tsx

const [showAssignModal, setShowAssignModal] = useState(false);

{/* In the Actions card */}
{!job.assigned_worker && (
  <Button
    onClick={() => setShowAssignModal(true)}
    variant="primary"
    className="w-full"
  >
    Assign Worker
  </Button>
)}

{/* Modal */}
{showAssignModal && (
  <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)}>
    <WorkerAssignment
      jobId={job.id}
      jobDate={new Date(job.scheduled_date)}
      jobStartTime={job.scheduled_start_time}
      jobEndTime={job.scheduled_end_time}
      onAssigned={() => {
        setShowAssignModal(false);
        loadJob(); // Refresh job details
      }}
      onCancel={() => setShowAssignModal(false)}
    />
  </Modal>
)}
```

**Testing Checklist**:
- [ ] Lists all active workers
- [ ] Shows availability indicator
- [ ] Highlights conflicts in red
- [ ] Can select a worker
- [ ] Assign button works
- [ ] Handles conflicts gracefully
- [ ] Refreshes job details after assignment
- [ ] Mobile responsive

---

### ~~STORY-203: Worker Availability Calendar~~
**Status**: ⏭️ **DEFERRED TO FUTURE SPRINT**

List view with conflict detection is sufficient for MVP. Calendar can come later.

---

### ~~STORY-204: Conflict Detection UI~~
**Status**: ⏭️ **DEFERRED** - Conflict detection in API (STORY-201) + display in worker list (STORY-202) is sufficient.

---

### ~~STORY-205: Assign Worker to Maintenance Job~~
**Status**: ⏭️ **DEFERRED** - Can reuse WorkerAssignment component once built.

---

## Epic 3: Job Completion Workflow ✅

**Status**: ❌ **NOT IMPLEMENTED**

**What Exists:**
- ✅ API: POST /api/cleaning-jobs/:id/complete
- ✅ CleaningJobsService.completeJob() method
- ✅ PhotosService with dual-mode storage
- ✅ "Complete Job" button in CleaningJobDetails

**What's Missing:**
- ❌ Job completion modal UI
- ❌ Photo upload React component
- ❌ Invoice generation service
- ❌ Customer rating interface

---

### STORY-301: Job Completion Modal
**Priority**: P0 (Critical)
**Estimate**: 2 points (reduced from 3)
**Effort**: ~2 hours
**Status**: ⏭️ Ready

**As a** cleaning service provider
**I want** a modal to mark jobs complete
**So that** I can add notes, photos, and generate invoices

**Acceptance Criteria**:
- [ ] Create `apps/web-cleaning/src/components/JobCompletionModal.tsx`
- [ ] Show job summary (property, date, worker)
- [ ] Add completion notes textarea
- [ ] Integrate PhotoUpload component (STORY-302)
- [ ] Add actual price input (if different from quote)
- [ ] Add "Generate Invoice" checkbox (default: true)
- [ ] Call POST /api/cleaning-jobs/:id/complete
- [ ] Show success message
- [ ] Close modal and refresh job details
- [ ] Handle errors gracefully

**Technical Implementation**:

```typescript
// apps/web-cleaning/src/components/JobCompletionModal.tsx

interface JobCompletionModalProps {
  job: CleaningJob;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function JobCompletionModal({
  job,
  isOpen,
  onClose,
  onComplete,
}: JobCompletionModalProps) {
  const [completionNotes, setCompletionNotes] = useState('');
  const [actualPrice, setActualPrice] = useState(job.quoted_price);
  const [beforePhotoIds, setBeforePhotoIds] = useState<string[]>([]);
  const [afterPhotoIds, setAfterPhotoIds] = useState<string[]>([]);
  const [issuePhotoIds, setIssuePhotoIds] = useState<string[]>([]);
  const [generateInvoice, setGenerateInvoice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await cleaningJobsAPI.complete(job.id, {
        worker_id: job.assigned_worker_id!,
        completion_notes: completionNotes,
        actual_price: actualPrice,
        before_photo_ids: beforePhotoIds,
        after_photo_ids: afterPhotoIds,
        issue_photo_ids: issuePhotoIds,
        generate_invoice: generateInvoice,
      });

      toast.success('Job marked as complete!');
      onComplete();
      onClose();
    } catch (err: any) {
      toast.error('Failed to complete job');
      console.error('Complete job error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Complete Cleaning Job</h2>

        {/* Job Summary */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="font-semibold">{job.property?.property_name}</div>
          <div className="text-sm text-gray-600">
            {new Date(job.scheduled_date).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">
            Worker: {job.assigned_worker?.first_name} {job.assigned_worker?.last_name}
          </div>
        </div>

        {/* Completion Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Completion Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes about the cleaning job..."
          />
        </div>

        {/* Before Photos */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Before Photos</label>
          <PhotoUpload
            propertyId={job.property_id}
            onUploadComplete={(photoId, url) => {
              setBeforePhotoIds([...beforePhotoIds, photoId]);
            }}
            maxPhotos={5}
          />
        </div>

        {/* After Photos */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">After Photos</label>
          <PhotoUpload
            propertyId={job.property_id}
            onUploadComplete={(photoId, url) => {
              setAfterPhotoIds([...afterPhotoIds, photoId]);
            }}
            maxPhotos={5}
          />
        </div>

        {/* Issue Photos (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Issue Photos (if any)
          </label>
          <PhotoUpload
            propertyId={job.property_id}
            onUploadComplete={(photoId, url) => {
              setIssuePhotoIds([...issuePhotoIds, photoId]);
            }}
            maxPhotos={5}
          />
        </div>

        {/* Actual Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Actual Price
          </label>
          <div className="flex gap-2 items-center">
            <span className="text-gray-500">£</span>
            <input
              type="number"
              step="0.01"
              className="w-32 px-3 py-2 border rounded-md"
              value={actualPrice}
              onChange={(e) => setActualPrice(parseFloat(e.target.value))}
            />
            {actualPrice !== job.quoted_price && (
              <span className="text-sm text-orange-600">
                (Quoted: £{job.quoted_price.toFixed(2)})
              </span>
            )}
          </div>
        </div>

        {/* Generate Invoice Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={generateInvoice}
              onChange={(e) => setGenerateInvoice(e.target.checked)}
            />
            <span className="text-sm font-medium">
              Generate invoice automatically
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Completing...' : 'Complete Job'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

**Testing Checklist**:
- [ ] Modal opens when Complete Job clicked
- [ ] Job summary displays correctly
- [ ] Can enter completion notes
- [ ] Can upload before/after/issue photos
- [ ] Can adjust actual price
- [ ] Generate invoice checkbox works
- [ ] Complete button calls API
- [ ] Success toast shows
- [ ] Modal closes on success
- [ ] Job details refresh

---

### STORY-302: Photo Upload React Component
**Priority**: P0 (Critical)
**Estimate**: 1 point (reduced from 2)
**Effort**: ~1 hour
**Status**: ⏭️ Ready

**As a** cleaning service provider
**I want** to upload photos during job completion
**So that** I can document the work performed

**Acceptance Criteria**:
- [ ] Create `apps/web-cleaning/src/components/PhotoUpload.tsx`
- [ ] Support drag-and-drop file upload
- [ ] Support click to browse file selection
- [ ] Show upload progress indicator
- [ ] Display thumbnail after upload
- [ ] Allow removing uploaded photos
- [ ] Validate file type (jpg, png, webp)
- [ ] Validate file size (max 10MB)
- [ ] Use existing POST /api/photos endpoint
- [ ] Return photo ID and URL to parent
- [ ] Show error messages for invalid files

**Technical Implementation**:

```typescript
// apps/web-cleaning/src/components/PhotoUpload.tsx

interface PhotoUploadProps {
  propertyId?: string;
  onUploadComplete: (photoId: string, url: string) => void;
  maxPhotos?: number;
}

interface UploadedPhoto {
  id: string;
  url: string;
  thumbnail_url: string;
}

export default function PhotoUpload({
  propertyId,
  onUploadComplete,
  maxPhotos = 10,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    await uploadFiles(Array.from(files));
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);

    for (const file of files) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        continue;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 10MB)`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('photo', file);
        if (propertyId) {
          formData.append('property_id', propertyId);
        }

        const response = await apiClient.post('/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const photo = response.data.data;
        setPhotos([...photos, photo]);
        onUploadComplete(photo.id, photo.s3_url);

        toast.success(`${file.name} uploaded`);
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}`);
        console.error('Upload error:', err);
      }
    }

    setUploading(false);
  };

  const handleRemove = (photoId: string) => {
    setPhotos(photos.filter(p => p.id !== photoId));
  };

  return (
    <div>
      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {uploading ? (
          <div>
            <Spinner size="lg" />
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop photos here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG, WEBP up to 10MB (max {maxPhotos} photos)
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Photos Grid */}
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.thumbnail_url}
                alt="Uploaded"
                className="w-full h-24 object-cover rounded"
              />
              <button
                onClick={() => handleRemove(photo.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        {photos.length} / {maxPhotos} photos uploaded
      </p>
    </div>
  );
}
```

**Notes:**
- ✅ PhotosService already handles local storage automatically (./uploads/)
- ✅ No S3 configuration needed for development
- ✅ POST /api/photos endpoint already exists
- ✅ Thumbnails generated automatically by PhotosService

**Testing Checklist**:
- [ ] Can click to browse files
- [ ] Can drag and drop files
- [ ] Shows upload progress
- [ ] Displays thumbnails after upload
- [ ] Can remove photos
- [ ] Validates file type
- [ ] Validates file size
- [ ] Shows error for invalid files
- [ ] Calls onUploadComplete with correct data
- [ ] Respects maxPhotos limit

---

### STORY-303: Invoice Generation
**Priority**: P1 (High)
**Estimate**: 4 points
**Effort**: ~4 hours
**Status**: ⏭️ Ready

**As a** service provider
**I want** invoices automatically generated when jobs complete
**So that** I can bill customers without manual data entry

**Acceptance Criteria**:
- [ ] Create `apps/api/src/services/InvoiceService.ts`
- [ ] Add `generateFromCleaningJob()` method
- [ ] Add `generateFromMaintenanceJob()` method
- [ ] Calculate line items from job data
- [ ] Calculate tax (20% VAT for UK)
- [ ] Generate unique invoice number
- [ ] Set due date (default: 30 days from issue)
- [ ] Link invoice to job
- [ ] Create POST /api/invoices endpoint
- [ ] Integrate with job completion workflow

**Technical Implementation**:

```typescript
// apps/api/src/services/InvoiceService.ts

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export class InvoiceService {
  async generateFromCleaningJob(
    jobId: string,
    serviceProviderId: string
  ): Promise<Invoice> {
    // 1. Get completed job
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id: jobId,
        service: {
          service_provider_id: serviceProviderId,
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
        property: true,
        customer: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Completed cleaning job not found');
    }

    // 2. Check if invoice already exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: { cleaning_job_id: jobId },
    });

    if (existingInvoice) {
      throw new ValidationError('Invoice already exists for this job');
    }

    // 3. Build line items
    const lineItems: InvoiceLineItem[] = [
      {
        description: `Cleaning Service - ${job.property.property_name}`,
        quantity: 1,
        unit_price: Number(job.actual_price || job.quoted_price),
        total: Number(job.actual_price || job.quoted_price),
      },
    ];

    // 4. Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.20; // 20% VAT
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // 5. Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(serviceProviderId);

    // 6. Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoice_number: invoiceNumber,
        cleaning_job_id: jobId,
        customer_id: job.customer_id,
        line_items: lineItems,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        issued_at: new Date(),
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return invoice;
  }

  async generateFromMaintenanceJob(
    jobId: string,
    serviceProviderId: string
  ): Promise<Invoice> {
    // Similar to generateFromCleaningJob, but uses quote line items
    const job = await prisma.maintenanceJob.findFirst({
      where: {
        id: jobId,
        service_provider_id: serviceProviderId,
        status: 'COMPLETED',
      },
      include: {
        property: true,
        customer: true,
        quote: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Completed maintenance job not found');
    }

    if (!job.quote) {
      throw new ValidationError('No quote found for this maintenance job');
    }

    // Use quote line items directly
    const lineItems = job.quote.line_items as InvoiceLineItem[];
    const subtotal = Number(job.quote.subtotal);
    const tax = Number(job.quote.tax);
    const total = Number(job.quote.total);

    const invoiceNumber = await this.generateInvoiceNumber(serviceProviderId);

    const invoice = await prisma.invoice.create({
      data: {
        invoice_number: invoiceNumber,
        maintenance_job_id: jobId,
        customer_id: job.customer_id,
        line_items: lineItems,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        issued_at: new Date(),
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return invoice;
  }

  private async generateInvoiceNumber(serviceProviderId: string): Promise<string> {
    // Format: INV-YYYY-XXXXX
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        customer: {
          service_providers: {
            some: {
              id: serviceProviderId,
            },
          },
        },
        invoice_number: {
          startsWith: `INV-${year}-`,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(5, '0');
    return `INV-${year}-${sequence}`;
  }

  async list(
    serviceProviderId: string,
    customerId?: string,
    status?: string
  ): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: {
        customer: {
          service_providers: {
            some: {
              id: serviceProviderId,
            },
          },
        },
        customer_id: customerId,
        status,
      },
      include: {
        customer: true,
        cleaning_job: {
          include: { property: true },
        },
        maintenance_job: {
          include: { property: true },
        },
      },
      orderBy: { issued_at: 'desc' },
    });
  }

  async markPaid(invoiceId: string, serviceProviderId: string): Promise<Invoice> {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        customer: {
          service_providers: {
            some: {
              id: serviceProviderId,
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paid_at: new Date(),
      },
    });
  }
}
```

**API Routes**:
```typescript
// apps/api/src/routes/invoices.ts

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { job_type, job_id, service_provider_id } = req.body;

    let invoice;
    if (job_type === 'cleaning') {
      invoice = await invoiceService.generateFromCleaningJob(job_id, service_provider_id);
    } else if (job_type === 'maintenance') {
      invoice = await invoiceService.generateFromMaintenanceJob(job_id, service_provider_id);
    } else {
      return res.status(400).json({ error: 'Invalid job_type' });
    }

    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.query.service_provider_id as string;
    const customerId = req.query.customer_id as string;
    const status = req.query.status as string;

    const invoices = await invoiceService.list(serviceProviderId, customerId, status);
    res.json({ data: invoices });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/mark-paid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceProviderId = req.body.service_provider_id;
    const invoice = await invoiceService.markPaid(req.params.id, serviceProviderId);
    res.json({ data: invoice });
  } catch (error) {
    next(error);
  }
});
```

**Integration with Job Completion**:
```typescript
// apps/api/src/services/CleaningJobsService.ts

async completeJob(
  jobId: string,
  workerId: string,
  data: {
    completion_notes?: string;
    actual_price?: number;
    generate_invoice?: boolean;
  }
): Promise<CleaningJob> {
  const job = await prisma.cleaningJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      completion_notes: data.completion_notes,
      actual_price: data.actual_price,
      actual_end_time: new Date(),
      completed_at: new Date(),
    },
  });

  // Generate invoice if requested
  if (data.generate_invoice !== false) {
    const invoiceService = new InvoiceService();
    await invoiceService.generateFromCleaningJob(jobId, job.service_provider_id);
  }

  return job;
}
```

**Testing Checklist**:
- [ ] Can generate invoice from cleaning job
- [ ] Can generate invoice from maintenance job
- [ ] Invoice number is unique and sequential
- [ ] Line items calculated correctly
- [ ] Tax calculated correctly (20%)
- [ ] Total calculated correctly
- [ ] Due date set to 30 days
- [ ] Prevents duplicate invoices
- [ ] Can list invoices
- [ ] Can mark invoice as paid

---

### STORY-304: Customer Rating & Feedback
**Priority**: P2 (Medium)
**Estimate**: 2 points (reduced from 3)
**Effort**: ~2 hours
**Status**: ⏭️ Ready

**As a** customer
**I want** to rate completed jobs
**So that** I can provide feedback on service quality

**Acceptance Criteria**:
- [ ] Add rating widget to customer portal job history
- [ ] Show star rating (1-5 stars)
- [ ] Add feedback textarea
- [ ] Only show for completed jobs
- [ ] Only allow rating once per job
- [ ] Call PUT /api/cleaning-jobs/:id endpoint
- [ ] Display average rating on worker profiles
- [ ] Show thank you message after submission

**Technical Implementation**:

```typescript
// apps/web-customer/src/components/JobRatingWidget.tsx

interface JobRatingWidgetProps {
  job: CleaningJob | MaintenanceJob;
  onRated: () => void;
}

export default function JobRatingWidget({ job, onRated }: JobRatingWidgetProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(!!job.customer_rating);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.put(`/cleaning-jobs/${job.id}`, {
        customer_rating: rating,
        customer_feedback: feedback,
        service_provider_id: job.service_provider_id,
      });

      toast.success('Thank you for your feedback!');
      setHasRated(true);
      onRated();
    } catch (err: any) {
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRated) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <div className="flex items-center gap-2">
          <span className="text-green-800 font-medium">You rated this job:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-yellow-400 text-xl">
                {star <= (job.customer_rating || 0) ? '★' : '☆'}
              </span>
            ))}
          </div>
        </div>
        {job.customer_feedback && (
          <p className="text-sm text-gray-600 mt-2">{job.customer_feedback}</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded">
      <h3 className="font-semibold mb-3">Rate this job</h3>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="text-3xl transition-colors"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <span
              className={
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <textarea
        className="w-full px-3 py-2 border rounded-md mb-3"
        rows={3}
        placeholder="Share your feedback (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </div>
  );
}
```

**Integration in Customer Portal**:
```typescript
// apps/web-customer/src/pages/dashboards/CustomerDashboard.tsx

{completedJobs.map((job) => (
  <Card key={job.id}>
    {/* Job details */}

    <JobRatingWidget
      job={job}
      onRated={() => loadJobs()} // Refresh jobs
    />
  </Card>
))}
```

**Testing Checklist**:
- [ ] Star rating works (click to select)
- [ ] Hover preview works
- [ ] Can add feedback text
- [ ] Submit button validates rating
- [ ] API call updates job
- [ ] Success message shows
- [ ] Can't rate same job twice
- [ ] Shows existing rating if already rated

---

## 📋 Sprint Implementation Order

**Day 1: Worker Assignment Backend**
1. STORY-201: Worker Assignment API (3 pts)
   - assignWorker() method
   - checkWorkerAvailability() method
   - timeSlotsOverlap() logic
   - PUT /api/cleaning-jobs/:id/assign
   - PUT /api/maintenance-jobs/:id/assign

**Day 2: Worker Assignment Frontend**
2. STORY-202: WorkerAssignment Component (3 pts)
   - WorkerAssignment.tsx component
   - Worker list with availability
   - Conflict detection UI
   - Modal integration

**Day 3: Job Completion**
3. STORY-302: Photo Upload Component (1 pt)
   - PhotoUpload.tsx component
   - Drag-and-drop support
   - Thumbnail display

4. STORY-301: Job Completion Modal (2 pts)
   - JobCompletionModal.tsx
   - Completion notes
   - Photo upload integration
   - Actual price input

**Day 4: Invoice & Rating**
5. STORY-303: Invoice Generation (4 pts)
   - InvoiceService backend
   - generateFromCleaningJob()
   - generateFromMaintenanceJob()
   - API routes

6. STORY-304: Customer Rating (2 pts)
   - JobRatingWidget component
   - Star rating UI
   - Customer portal integration

**Day 4-5: Polish & Testing**
7. STORY-102: Edit Job Form (1 pt)
   - Add edit mode to CreateCleaningJob
   - Pre-populate form

---

## ✅ Definition of Done

**For Each Story:**
- [ ] Code written and tested locally
- [ ] All acceptance criteria met
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsive
- [ ] API endpoints tested with Postman/curl
- [ ] Frontend tested in browser
- [ ] No console errors
- [ ] Code reviewed (self or peer)

**For Sprint:**
- [ ] All 7 stories complete
- [ ] Integration tested end-to-end
- [ ] Worker can be assigned to job
- [ ] Job can be completed with photos
- [ ] Invoice auto-generated
- [ ] Customer can rate job
- [ ] All apps compile with no errors
- [ ] Git commits pushed to feature branch

---

## 🎯 Success Metrics

**Sprint Goals:**
- 16 story points completed in 3-4 days
- Worker assignment functional
- Job completion workflow functional
- Invoice generation automated
- Customer rating system working

**Post-Sprint State:**
- Service providers can assign workers safely (no double-booking)
- Jobs can be completed with documentation (photos + notes)
- Invoices auto-generated for billing
- Customers can provide feedback
- End-to-end job lifecycle complete

---

## 🚀 Next Steps After Sprint

**Immediate Follow-ups:**
1. Deploy to staging environment
2. User acceptance testing with service providers
3. Fix any bugs found in testing

**Future Sprints:**
1. Worker availability calendar view (STORY-203)
2. Conflict detection UI enhancements (STORY-204)
3. Checklist management (STORY-103)
4. Mobile worker apps (React Native)
5. Real-time notifications (Pusher/Socket.io)
6. Payment processing (Stripe integration)

---

*Sprint plan revised: 2025-11-02*
*Ready to start implementation!* 🚀
