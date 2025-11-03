# STORY-202 ENHANCED: Work Scheduling & Assignment System

**Priority**: P0 (Critical)
**Estimate**: 5 points (increased from 3 to include scheduling)
**Effort**: ~5 hours
**Status**: ⏭️ Ready

---

## Overview

Build a comprehensive work scheduling and assignment system that:
1. Allows scheduling work in advance (not just immediate assignment)
2. Maintains existing "Start Work" button for mobile workers to clock in
3. Uses correct terminology per tenant: "Workers" (cleaning) vs "Contractors" (maintenance)
4. Supports both internal contractors (Worker table) and external contractors (ExternalContractor table)
5. Prevents double-booking with conflict detection

---

## User Stories

### US-1: Schedule Work in Advance
**As a** service provider
**I want** to schedule work for future dates and assign workers in advance
**So that** I can plan my team's workload and ensure jobs are covered

### US-2: Mobile Worker Check-In
**As a** mobile worker
**I want** to start work when I arrive at the job site
**So that** my time is tracked accurately

### US-3: Contractor Management (Maintenance)
**As a** maintenance service provider
**I want** to assign contractors (internal or external) to jobs
**So that** I can dispatch the right technician for each job

---

## Database Schema (Already Exists ✅)

**Worker Model:**
```prisma
model Worker {
  worker_type         WorkerType       // CLEANER | MAINTENANCE | BOTH
  employment_type     EmploymentType   // FULL_TIME | PART_TIME | CONTRACTOR
  ...
}

enum WorkerType {
  CLEANER
  MAINTENANCE
  BOTH
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACTOR
}
```

**ExternalContractor Model:**
```prisma
model ExternalContractor {
  company_name                String
  contact_name                String
  specialties                 String[]  // e.g., ["PLUMBING", "ELECTRICAL"]
  preferred_contractor        Boolean
  emergency_callout_available Boolean
  maintenance_jobs            MaintenanceJob[]
}
```

**Job Status Flow:**
```
SCHEDULED → IN_PROGRESS → COMPLETED
```

---

## Acceptance Criteria

### Scheduling & Assignment:
- [ ] Can schedule jobs for future dates
- [ ] Can assign worker/contractor when creating job
- [ ] Can assign worker/contractor to existing unassigned job
- [ ] Can reassign worker/contractor to different worker
- [ ] Shows worker availability (free, busy, conflict)
- [ ] Detects scheduling conflicts (overlapping time slots)
- [ ] Shows conflict details with job information
- [ ] Prevents double-booking (validation in API)

### Terminology by Tenant:
- [ ] **Cleaning Portal**: Shows "Workers", filters by worker_type = CLEANER or BOTH
- [ ] **Maintenance Portal**: Shows "Contractors", includes both:
  - Workers with worker_type = MAINTENANCE or BOTH + employment_type = CONTRACTOR
  - ExternalContractors

### Mobile Worker Flow:
- [ ] Keeps existing "Start Job" button in job details
- [ ] Worker can start job when status = SCHEDULED
- [ ] Starting job updates status to IN_PROGRESS and records actual_start_time
- [ ] Worker can complete job when status = IN_PROGRESS
- [ ] Completing job updates status to COMPLETED and records actual_end_time

### UI/UX:
- [ ] WorkerAssignment component with scheduling support
- [ ] Date/time picker for scheduled start
- [ ] Worker/contractor list with availability indicators
- [ ] Conflict warnings displayed prominently
- [ ] Mobile responsive design
- [ ] Loading states for all API calls

---

## Technical Implementation

### 1. API Endpoints (Enhanced)

```typescript
// New scheduling-specific endpoints

// Assign with scheduling
PUT /api/cleaning-jobs/:id/assign
PUT /api/maintenance-jobs/:id/assign
Body: {
  worker_id: string,
  scheduled_date: Date,
  scheduled_start_time: string,  // "09:00"
  scheduled_end_time: string,    // "11:00"
  service_provider_id: string
}

// Or assign external contractor (maintenance only)
PUT /api/maintenance-jobs/:id/assign-external
Body: {
  external_contractor_id: string,
  scheduled_date: Date,
  scheduled_start_time: string,
  scheduled_end_time: string,
  service_provider_id: string
}

// Get available workers for time slot
GET /api/workers/available?date=2025-11-05&start_time=09:00&end_time=11:00&worker_type=CLEANER
Response: {
  data: Worker[],  // Only workers without conflicts
}

// Get worker schedule
GET /api/workers/:id/schedule?from_date=2025-11-01&to_date=2025-11-30
Response: {
  data: {
    worker: Worker,
    scheduled_jobs: Array<{
      job_id: string,
      date: Date,
      start_time: string,
      end_time: string,
      property_name: string,
      job_type: 'cleaning' | 'maintenance'
    }>
  }
}

// Keep existing mobile worker endpoints
POST /api/cleaning-jobs/:id/start    // Worker starts job on-site
POST /api/cleaning-jobs/:id/complete // Worker completes job on-site
```

### 2. Backend Service Updates

```typescript
// apps/api/src/services/CleaningJobsService.ts

async assignWorker(
  jobId: string,
  workerId: string,
  scheduledDate: Date,
  scheduledStartTime: string,
  scheduledEndTime: string,
  serviceProviderId: string
): Promise<CleaningJob> {
  // 1. Verify job exists
  const job = await this.getById(jobId, serviceProviderId);

  // 2. Verify worker exists and is appropriate type
  const worker = await prisma.worker.findFirst({
    where: {
      id: workerId,
      service_provider_id: serviceProviderId,
      is_active: true,
      worker_type: { in: ['CLEANER', 'BOTH'] },  // For cleaning jobs
    },
  });

  if (!worker) {
    throw new ValidationError('Worker not found or not authorized for cleaning jobs');
  }

  // 3. Check for conflicts
  const conflicts = await this.checkWorkerAvailability(
    workerId,
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime
  );

  if (conflicts.length > 0) {
    throw new ValidationError('Worker has conflicting job(s)', { conflicts });
  }

  // 4. Assign worker and update schedule
  const updatedJob = await prisma.cleaningJob.update({
    where: { id: jobId },
    data: {
      assigned_worker_id: workerId,
      scheduled_date: scheduledDate,
      scheduled_start_time: scheduledStartTime,
      scheduled_end_time: scheduledEndTime,
      status: 'SCHEDULED',
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

// Keep existing startJob() for mobile workers
async startJob(jobId: string, workerId: string): Promise<CleaningJob> {
  const job = await prisma.cleaningJob.findFirst({
    where: {
      id: jobId,
      assigned_worker_id: workerId,
      status: 'SCHEDULED',
    },
  });

  if (!job) {
    throw new ValidationError('Job not found or not assigned to this worker');
  }

  return prisma.cleaningJob.update({
    where: { id: jobId },
    data: {
      status: 'IN_PROGRESS',
      actual_start_time: new Date(),
    },
    include: {
      property: true,
      customer: true,
      assigned_worker: true,
    },
  });
}
```

```typescript
// apps/api/src/services/MaintenanceJobsService.ts

async assignContractor(
  jobId: string,
  contractorId: string,
  contractorType: 'internal' | 'external',
  scheduledDate: Date,
  scheduledStartTime: string,
  scheduledEndTime: string,
  serviceProviderId: string
): Promise<MaintenanceJob> {
  const job = await this.getById(jobId, serviceProviderId);

  if (contractorType === 'internal') {
    // Assign from Worker table (must be MAINTENANCE type and CONTRACTOR employment)
    const worker = await prisma.worker.findFirst({
      where: {
        id: contractorId,
        service_provider_id: serviceProviderId,
        is_active: true,
        worker_type: { in: ['MAINTENANCE', 'BOTH'] },
        employment_type: 'CONTRACTOR',
      },
    });

    if (!worker) {
      throw new ValidationError('Internal contractor not found');
    }

    // Check conflicts
    const conflicts = await this.checkWorkerAvailability(
      contractorId,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime
    );

    if (conflicts.length > 0) {
      throw new ValidationError('Contractor has conflicting job(s)', { conflicts });
    }

    return prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        assigned_worker_id: contractorId,
        scheduled_date: scheduledDate,
        scheduled_start_time: scheduledStartTime,
        scheduled_end_time: scheduledEndTime,
        status: 'SCHEDULED',
      },
      include: {
        property: true,
        customer: true,
        assigned_worker: true,
      },
    });
  } else {
    // Assign from ExternalContractor table
    const contractor = await prisma.externalContractor.findFirst({
      where: {
        id: contractorId,
        service_provider_id: serviceProviderId,
      },
    });

    if (!contractor) {
      throw new ValidationError('External contractor not found');
    }

    return prisma.maintenanceJob.update({
      where: { id: jobId },
      data: {
        assigned_external_contractor_id: contractorId,
        scheduled_date: scheduledDate,
        scheduled_start_time: scheduledStartTime,
        scheduled_end_time: scheduledEndTime,
        status: 'SCHEDULED',
      },
      include: {
        property: true,
        customer: true,
        assigned_external_contractor: true,
      },
    });
  }
}
```

### 3. Frontend Components

#### A. WorkerSchedulingModal Component (NEW)

```typescript
// apps/web-cleaning/src/components/WorkerSchedulingModal.tsx
// apps/web-maintenance/src/components/ContractorSchedulingModal.tsx

interface WorkerSchedulingModalProps {
  jobId: string;
  jobType: 'cleaning' | 'maintenance';
  currentSchedule?: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  onScheduled: () => void;
  onCancel: () => void;
}

export default function WorkerSchedulingModal({
  jobId,
  jobType,
  currentSchedule,
  onScheduled,
  onCancel,
}: WorkerSchedulingModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    currentSchedule?.date || new Date()
  );
  const [startTime, setStartTime] = useState(currentSchedule?.startTime || '09:00');
  const [endTime, setEndTime] = useState(currentSchedule?.endTime || '11:00');
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const terminology = jobType === 'maintenance' ? 'Contractor' : 'Worker';

  useEffect(() => {
    loadAvailableWorkers();
  }, [selectedDate, startTime, endTime]);

  const loadAvailableWorkers = async () => {
    setIsLoading(true);
    try {
      // Fetch workers/contractors based on job type
      const workerType = jobType === 'cleaning' ? 'CLEANER' : 'MAINTENANCE';

      const allWorkers = await workersAPI.list(SERVICE_PROVIDER_ID, {
        worker_type: workerType,
        is_active: true,
      });

      // Check availability for each
      const workersWithAvailability = await Promise.all(
        allWorkers.map(async (worker) => {
          const conflicts = await checkWorkerConflicts(
            worker.id,
            selectedDate,
            startTime,
            endTime
          );

          return {
            ...worker,
            isAvailable: conflicts.length === 0,
            conflicts,
          };
        })
      );

      setWorkers(workersWithAvailability);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedWorker) {
      toast.error(`Please select a ${terminology.toLowerCase()}`);
      return;
    }

    try {
      const endpoint = jobType === 'cleaning'
        ? `/api/cleaning-jobs/${jobId}/assign`
        : `/api/maintenance-jobs/${jobId}/assign`;

      await apiClient.put(endpoint, {
        worker_id: selectedWorker,
        scheduled_date: selectedDate,
        scheduled_start_time: startTime,
        scheduled_end_time: endTime,
        service_provider_id: SERVICE_PROVIDER_ID,
      });

      toast.success(`${terminology} scheduled successfully`);
      onScheduled();
    } catch (err: any) {
      if (err.response?.data?.conflicts) {
        toast.error(
          `${terminology} has ${err.response.data.conflicts.length} conflicting job(s)`
        );
      } else {
        toast.error(`Failed to schedule ${terminology.toLowerCase()}`);
      }
    }
  };

  return (
    <Modal isOpen onClose={onCancel} size="lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          Schedule & Assign {terminology}
        </h2>

        {/* Date & Time Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-3">Schedule</h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-md"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-md"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Worker/Contractor Selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">
            Available {terminology}s ({workers.filter(w => w.isAvailable).length})
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <Spinner size="lg" />
              <p className="text-sm text-gray-600 mt-2">
                Checking availability...
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedWorker === worker.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${!worker.isAvailable ? 'opacity-60' : ''}
                  `}
                  onClick={() => setSelectedWorker(worker.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {worker.first_name} {worker.last_name}
                        </h4>
                        {worker.isAvailable ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="error">Busy</Badge>
                        )}
                      </div>

                      <div className="flex gap-3 mt-1 text-sm text-gray-600">
                        <span>⭐ {worker.average_rating || 'N/A'}</span>
                        <span>📋 {worker.jobs_completed} jobs</span>
                        <span>💷 £{worker.hourly_rate}/hr</span>
                      </div>

                      {/* Show conflicts if any */}
                      {worker.conflicts && worker.conflicts.length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                          <div className="font-medium text-red-800">
                            ⚠️ Conflicts:
                          </div>
                          {worker.conflicts.map((conflict, idx) => (
                            <div key={idx} className="text-red-700 ml-4">
                              • {conflict.scheduled_start_time} -{' '}
                              {conflict.scheduled_end_time} at{' '}
                              {conflict.property?.property_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSchedule}
            disabled={!selectedWorker || isLoading}
            className="flex-1"
          >
            Schedule {terminology}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

#### B. Update Job Details Pages

```typescript
// apps/web-cleaning/src/pages/CleaningJobDetails.tsx
// apps/web-maintenance/src/pages/MaintenanceJobDetails.tsx

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);

  const terminology = jobType === 'maintenance' ? 'Contractor' : 'Worker';

  return (
    <div>
      {/* ... existing job details ... */}

      {/* Actions Card */}
      <Card>
        <Card.Header>
          <h2>Actions</h2>
        </Card.Header>
        <Card.Content>
          <div className="space-y-2">
            {/* Schedule/Assign Button (for unassigned or reassignment) */}
            {job.status === 'SCHEDULED' && (
              <Button
                onClick={() => setShowSchedulingModal(true)}
                variant="primary"
                className="w-full"
              >
                {job.assigned_worker
                  ? `Reassign ${terminology}`
                  : `Schedule & Assign ${terminology}`}
              </Button>
            )}

            {/* Mobile Worker Start Button (KEEP EXISTING) */}
            {job.status === 'SCHEDULED' && job.assigned_worker && (
              <Button
                onClick={() => handleStartJob()}
                variant="success"
                className="w-full"
              >
                Start Job
              </Button>
            )}

            {/* Complete Button (KEEP EXISTING) */}
            {job.status === 'IN_PROGRESS' && (
              <Button
                onClick={() => setShowCompletionModal(true)}
                variant="success"
                className="w-full"
              >
                Complete Job
              </Button>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Scheduling Modal */}
      {showSchedulingModal && (
        <WorkerSchedulingModal
          jobId={job.id}
          jobType={jobType}
          currentSchedule={{
            date: new Date(job.scheduled_date),
            startTime: job.scheduled_start_time,
            endTime: job.scheduled_end_time,
          }}
          onScheduled={() => {
            setShowSchedulingModal(false);
            loadJob(); // Refresh
          }}
          onCancel={() => setShowSchedulingModal(false)}
        />
      )}
    </div>
  );
}
```

#### C. Workers/Contractors List Page

```typescript
// apps/web-cleaning/src/pages/Workers.tsx
// apps/web-maintenance/src/pages/Contractors.tsx

export default function WorkersOrContractorsPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const terminology = appType === 'maintenance' ? 'Contractor' : 'Worker';
  const workerType = appType === 'maintenance' ? 'MAINTENANCE' : 'CLEANER';

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    const data = await workersAPI.list(SERVICE_PROVIDER_ID, {
      worker_type: workerType,
      is_active: true,
    });

    // For maintenance, also fetch external contractors
    if (appType === 'maintenance') {
      const externalContractors = await externalContractorsAPI.list(
        SERVICE_PROVIDER_ID
      );
      // Merge both lists
      setWorkers([...data, ...externalContractors.map(c => ({
        ...c,
        isExternal: true,
      }))]);
    } else {
      setWorkers(data);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{terminology}s</h1>
        <Button onClick={() => navigate('/workers/create')}>
          Add {terminology}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((worker) => (
          <Card key={worker.id} className="hover:shadow-lg transition-shadow">
            <Card.Content>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {worker.first_name} {worker.last_name}
                    {worker.isExternal && (
                      <Badge variant="info" className="ml-2">External</Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{worker.phone}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    £{worker.hourly_rate}/hr
                  </div>
                </div>
              </div>

              <div className="flex gap-3 text-sm text-gray-600 mb-3">
                <span>⭐ {worker.average_rating || 'N/A'}</span>
                <span>📋 {worker.jobs_completed} jobs</span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedWorker(worker);
                    setShowSchedule(true);
                  }}
                  className="flex-1"
                >
                  View Schedule
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/workers/${worker.id}`)}
                >
                  Details
                </Button>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Worker Schedule Modal */}
      {showSchedule && selectedWorker && (
        <WorkerScheduleModal
          worker={selectedWorker}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}
```

---

## Testing Checklist

### Scheduling:
- [ ] Can schedule job for future date
- [ ] Can select date, start time, end time
- [ ] Date picker doesn't allow past dates
- [ ] Time slots validate (end > start)
- [ ] Schedule updates when date/time changed

### Worker/Contractor Assignment:
- [ ] **Cleaning Portal**: Shows workers with worker_type = CLEANER or BOTH
- [ ] **Maintenance Portal**: Shows "Contractors" label everywhere
- [ ] **Maintenance Portal**: Includes Worker records with worker_type = MAINTENANCE + employment_type = CONTRACTOR
- [ ] **Maintenance Portal**: Includes ExternalContractor records
- [ ] Can filter available vs busy workers/contractors
- [ ] Shows availability indicator correctly
- [ ] Displays conflict details when worker is busy
- [ ] Can still select busy worker (with warning)

### Conflict Detection:
- [ ] Detects overlapping time slots correctly
- [ ] Shows all conflicting jobs
- [ ] Includes property names in conflict display
- [ ] API prevents assignment if conflicts exist
- [ ] Returns detailed conflict information

### Mobile Worker Flow:
- [ ] "Start Job" button shows for SCHEDULED jobs with assigned worker
- [ ] Starting job updates status to IN_PROGRESS
- [ ] Starting job records actual_start_time
- [ ] "Complete Job" button shows for IN_PROGRESS jobs
- [ ] Completing job updates status to COMPLETED
- [ ] Completing job records actual_end_time

### Integration:
- [ ] Job details page shows correct terminology per tenant
- [ ] Workers/Contractors list page filters correctly
- [ ] Schedule & Assign modal works from job details
- [ ] Reassign functionality works
- [ ] Notifications sent to worker (future)

---

## Data Flow

### Scheduling Flow:
```
1. User opens "Schedule & Assign Worker" modal
2. Selects date, start time, end time
3. System fetches available workers for that time slot
4. System checks each worker for conflicts
5. User sees list with availability indicators
6. User selects worker
7. System validates no conflicts
8. System assigns worker and updates schedule
9. Job status → SCHEDULED
10. Worker receives notification (future)
```

### Mobile Worker Flow (Existing - Keep Intact):
```
1. Worker views their assigned jobs
2. Worker clicks "Start Job" when they arrive
3. System validates worker is assigned
4. System updates status → IN_PROGRESS
5. System records actual_start_time
6. Worker completes checklist
7. Worker clicks "Complete Job"
8. System shows completion modal
9. Worker adds photos and notes
10. System updates status → COMPLETED
11. System records actual_end_time
12. Invoice generated automatically
```

---

## Migration Notes

**No database changes needed!** ✅

The schema already supports:
- WorkerType enum (CLEANER, MAINTENANCE, BOTH)
- EmploymentType enum (FULL_TIME, PART_TIME, CONTRACTOR)
- ExternalContractor table
- scheduled_date, scheduled_start_time, scheduled_end_time fields
- actual_start_time, actual_end_time fields
- JobStatus enum (SCHEDULED, IN_PROGRESS, COMPLETED)

---

## Dependencies

**Requires:**
- STORY-201 API endpoints complete (conflict detection logic)

**Enables:**
- STORY-301 Job completion workflow
- Future: Calendar view of schedules
- Future: Mobile worker app with job list
- Future: Real-time notifications

---

## Future Enhancements (Out of Scope)

- Calendar view of worker schedules
- Drag-and-drop job reassignment
- Recurring job scheduling
- Team scheduling (multiple workers per job)
- Automatic optimal worker selection
- Integration with Google Calendar
- Push notifications to mobile workers
- SMS notifications for job assignments

---

*Story enhanced to include work scheduling: 2025-11-02*
