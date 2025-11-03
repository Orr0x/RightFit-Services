# Phase 3 Continuation Sprint: Job Management Completion

**Sprint Goal**: Complete the cleaning and maintenance job management workflows with details pages, worker assignment, and job completion functionality.

**Priority**: HIGH - Core job management features needed for production

**Estimated Duration**: 7-9 days (2-3 weeks part-time)

**Status**: 📋 **READY TO START**

---

## 🎯 Sprint Overview

**Sprint Objectives:**
1. Enable service providers to view and edit cleaning job details
2. Implement worker assignment system for both cleaning and maintenance
3. Complete the job lifecycle with completion workflow and invoicing
4. Enable photo upload and customer feedback

**Current State:**
- ✅ CleaningDashboard.tsx shows list of jobs
- ✅ MaintenanceDashboard.tsx shows jobs with tabs
- ✅ MaintenanceJobDetails.tsx shows job details with quote submission
- ✅ Quote approval workflow complete
- ❌ CleaningJobDetails.tsx doesn't exist yet
- ❌ Worker assignment not implemented
- ❌ Job completion workflow missing
- ❌ Photo upload not implemented
- ❌ Invoice generation not implemented

**Target State:**
- ✅ Cleaning jobs have full details page
- ✅ Workers can be assigned to jobs
- ✅ Jobs can be marked complete with photos
- ✅ Invoices auto-generated on completion
- ✅ Customers can rate completed jobs

---

## 📊 Sprint Breakdown

| Epic | Stories | Points | Priority | Duration |
|------|---------|--------|----------|----------|
| **Epic 1: Cleaning Job Details** | 3 stories | 8 pts | P0 | 2-3 days |
| **Epic 2: Worker Assignment** | 5 stories | 13 pts | P0 | 3-4 days |
| **Epic 3: Job Completion** | 4 stories | 10 pts | P0 | 2-3 days |
| **Total** | **12 stories** | **31 pts** | - | **7-10 days** |

**Note**: Epic 3 reduced from 12 to 10 points because STORY-302 leverages existing PhotosService infrastructure (2 pts instead of 4 pts).

---

## Epic 1: Cleaning Job Details & Management 🧹

**Goal**: Build the missing pieces of the cleaning workflow so service providers can view, edit, and manage cleaning job details.

**Why This Matters**: CleaningDashboard.tsx exists but users can't drill into job details or edit jobs yet. This epic brings cleaning jobs to parity with maintenance jobs.

---

### STORY-101: Create CleaningJobDetails.tsx Page
**Priority**: P0 (Critical)
**Estimate**: 5 points
**Effort**: ~5 hours
**Status**: ⏭️ Ready

**As a** cleaning service provider
**I want** to view full details of a cleaning job
**So that** I can see all job information, checklists, and history in one place

**Acceptance Criteria**:
- [ ] Create `apps/web-cleaning/src/pages/CleaningJobDetails.tsx`
- [ ] Display job header with status badge, property name, date
- [ ] Show customer information
- [ ] Display assigned cleaner (if assigned)
- [ ] Show job schedule details
- [ ] Display notes and special instructions
- [ ] Show job timeline (created, assigned, started, completed)
- [ ] Include checklist items with completion status
- [ ] Display before/after photos (if available)
- [ ] Show customer rating and feedback (if completed)
- [ ] Add "Edit Job" button (opens form)
- [ ] Add "Assign Worker" button (if not assigned)
- [ ] Add "Mark Complete" button (if in progress)
- [ ] Route accessible at `/jobs/:id`
- [ ] Mobile responsive layout
- [ ] Loading states for API calls
- [ ] Error handling for missing jobs (404)

**Technical Implementation**:
```typescript
// apps/web-cleaning/src/pages/CleaningJobDetails.tsx

interface CleaningJobDetailsProps {
  jobId: string; // from route params
}

const CleaningJobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState<CleaningJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    const data = await cleaningJobsAPI.getById(id);
    setJob(data);
  };

  return (
    <div className="job-details">
      {/* Job Header */}
      <div className="job-header">
        <h1>Cleaning Job #{job.id.slice(0, 8)}</h1>
        <Badge variant={job.status}>{job.status}</Badge>
      </div>

      {/* Job Info */}
      <Card>
        <h2>Job Information</h2>
        <div>Property: {job.property.address}</div>
        <div>Customer: {job.customer.name}</div>
        <div>Scheduled: {formatDate(job.scheduled_date)}</div>
        <div>Assigned to: {job.assigned_worker?.name || 'Unassigned'}</div>
      </Card>

      {/* Checklist */}
      <Card>
        <h2>Cleaning Checklist</h2>
        {job.checklist_items.map(item => (
          <ChecklistItem key={item.id} item={item} />
        ))}
      </Card>

      {/* Photos */}
      {job.before_photos && (
        <Card>
          <h2>Before Photos</h2>
          <PhotoGallery photos={job.before_photos} />
        </Card>
      )}

      {/* Actions */}
      <div className="actions">
        <Button onClick={() => navigate(`/jobs/${id}/edit`)}>Edit Job</Button>
        {!job.assigned_worker_id && (
          <Button onClick={() => setShowAssignModal(true)}>Assign Worker</Button>
        )}
        {job.status === 'in_progress' && (
          <Button onClick={() => setShowCompleteModal(true)}>Mark Complete</Button>
        )}
      </div>
    </div>
  );
};
```

**API Endpoint** (already exists):
```typescript
GET /api/cleaning-jobs/:id
```

**Dependencies**:
- CleaningJob type from database schema
- cleaningJobsAPI.getById() method
- Badge, Card, Button components (already exist)

**Testing**:
- [ ] Can view job details for existing job
- [ ] Displays all job information correctly
- [ ] Shows checklist items
- [ ] Action buttons appear based on job status
- [ ] 404 error for non-existent job
- [ ] Mobile responsive on phone/tablet

---

### STORY-102: Create CleaningJobForm.tsx (Create/Edit)
**Priority**: P0 (Critical)
**Estimate**: 3 points
**Effort**: ~3 hours
**Status**: ⏭️ Ready

**As a** cleaning service provider
**I want** to create and edit cleaning jobs
**So that** I can schedule cleanings for my customers

**Acceptance Criteria**:
- [ ] Create `apps/web-cleaning/src/pages/CleaningJobForm.tsx`
- [ ] Form works for both create and edit modes
- [ ] Select customer from dropdown (customerPropertiesAPI)
- [ ] Select property from customer's properties
- [ ] Select scheduled date/time (date picker)
- [ ] Add notes/special instructions (textarea)
- [ ] Select checklist template (dropdown)
- [ ] Form validation (all required fields)
- [ ] Submit button creates or updates job
- [ ] Cancel button returns to dashboard
- [ ] Show loading state during submit
- [ ] Show success toast on save
- [ ] Show error toast on failure
- [ ] Route accessible at `/jobs/new` (create) and `/jobs/:id/edit` (edit)
- [ ] Pre-populate form when editing

**Technical Implementation**:
```typescript
// apps/web-cleaning/src/pages/CleaningJobForm.tsx

interface CleaningJobFormData {
  customer_id: string;
  property_id: string;
  scheduled_date: Date;
  notes: string;
  checklist_template_id: string;
}

const CleaningJobForm = () => {
  const { id } = useParams(); // undefined for create, id for edit
  const isEditMode = !!id;
  const [formData, setFormData] = useState<CleaningJobFormData>({
    customer_id: '',
    property_id: '',
    scheduled_date: new Date(),
    notes: '',
    checklist_template_id: '',
  });
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchTemplates();
    if (isEditMode) {
      fetchJobData();
    }
  }, []);

  const fetchJobData = async () => {
    const job = await cleaningJobsAPI.getById(id);
    setFormData({
      customer_id: job.customer_id,
      property_id: job.property_id,
      scheduled_date: new Date(job.scheduled_date),
      notes: job.notes || '',
      checklist_template_id: job.checklist_template_id || '',
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      await cleaningJobsAPI.update(id, formData);
      toast.success('Job updated successfully');
    } else {
      await cleaningJobsAPI.create(formData);
      toast.success('Job created successfully');
    }
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>{isEditMode ? 'Edit' : 'Create'} Cleaning Job</h1>

      <Select
        label="Customer"
        value={formData.customer_id}
        onChange={(value) => {
          setFormData({ ...formData, customer_id: value });
          fetchPropertiesForCustomer(value);
        }}
        options={customers}
      />

      <Select
        label="Property"
        value={formData.property_id}
        onChange={(value) => setFormData({ ...formData, property_id: value })}
        options={properties}
        disabled={!formData.customer_id}
      />

      <Input
        type="datetime-local"
        label="Scheduled Date/Time"
        value={formData.scheduled_date}
        onChange={(value) => setFormData({ ...formData, scheduled_date: value })}
      />

      <Select
        label="Checklist Template"
        value={formData.checklist_template_id}
        onChange={(value) => setFormData({ ...formData, checklist_template_id: value })}
        options={templates}
      />

      <textarea
        label="Notes/Special Instructions"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={4}
      />

      <div className="form-actions">
        <Button type="submit">
          {isEditMode ? 'Update' : 'Create'} Job
        </Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

**API Endpoints** (already exist):
```typescript
POST /api/cleaning-jobs        // Create
PUT  /api/cleaning-jobs/:id    // Update
GET  /api/customer-portal/customers/:serviceProviderId
GET  /api/customer-properties?customer_id=:customerId
```

**Testing**:
- [ ] Can create new cleaning job
- [ ] Can edit existing cleaning job
- [ ] Form validation prevents empty required fields
- [ ] Customer selection loads their properties
- [ ] Date picker works correctly
- [ ] Cancel button navigates back
- [ ] Success toast appears on save

---

### STORY-103: Add Checklist Management to CleaningJobDetails
**Priority**: P1 (High)
**Estimate**: 2 points
**Effort**: ~2 hours
**Status**: ⏭️ Ready

**As a** cleaning service provider
**I want** to manage checklist items for a cleaning job
**So that** I can track what tasks need to be completed

**Acceptance Criteria**:
- [ ] Display checklist items in CleaningJobDetails.tsx
- [ ] Show item name, completion status, notes
- [ ] Toggle checkbox to mark item complete/incomplete (if job in progress)
- [ ] Add note to checklist item
- [ ] Upload photo for checklist item
- [ ] Calculate checklist completion percentage
- [ ] Show progress bar (e.g., "8/12 items complete")
- [ ] Disable editing if job is completed
- [ ] Auto-save when checkbox toggled
- [ ] Show loading state during save

**Technical Implementation**:
```typescript
// Add to CleaningJobDetails.tsx

const ChecklistSection = ({ job }: { job: CleaningJob }) => {
  const [items, setItems] = useState(job.checklist_items);
  const completedCount = items.filter(i => i.completed).length;
  const percentage = (completedCount / items.length) * 100;

  const toggleItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    const updated = { ...item, completed: !item.completed };

    await cleaningJobsAPI.updateChecklistItem(job.id, itemId, updated);
    setItems(items.map(i => i.id === itemId ? updated : i));
    toast.success('Checklist updated');
  };

  return (
    <Card>
      <div className="checklist-header">
        <h2>Cleaning Checklist</h2>
        <div className="progress">
          {completedCount}/{items.length} items complete ({Math.round(percentage)}%)
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      <div className="checklist-items">
        {items.map(item => (
          <div key={item.id} className="checklist-item">
            <Checkbox
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
              disabled={job.status === 'completed'}
            />
            <span className={item.completed ? 'completed' : ''}>
              {item.item_name}
            </span>
            {item.notes && (
              <div className="item-note">{item.notes}</div>
            )}
            {item.photo_url && (
              <img src={item.photo_url} alt={item.item_name} />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
```

**API Endpoint** (needs to be added):
```typescript
PUT /api/cleaning-jobs/:id/checklist/:itemId
```

**Testing**:
- [ ] Checklist items display correctly
- [ ] Can toggle item completion
- [ ] Progress bar updates when item toggled
- [ ] Cannot edit checklist after job completed
- [ ] Notes display if present
- [ ] Photos display if present

---

## Epic 2: Worker Assignment System 👷

**Goal**: Build a worker assignment system that works for both cleaning and maintenance jobs, with availability calendar and conflict detection.

**Why This Matters**: Jobs can be created and quoted, but can't be assigned to workers yet. This is critical for dispatching work.

---

### STORY-201: Create Worker Assignment API Endpoints
**Priority**: P0 (Critical)
**Estimate**: 3 points
**Effort**: ~3 hours
**Status**: ⏭️ Ready

**As a** backend developer
**I want** to create API endpoints for worker assignment
**So that** frontend can assign workers to jobs and check availability

**Acceptance Criteria**:
- [ ] Create `PUT /api/cleaning-jobs/:id/assign` endpoint
- [ ] Create `PUT /api/maintenance-jobs/:id/assign` endpoint
- [ ] Create `GET /api/workers/availability` endpoint
- [ ] Validate worker exists and belongs to service provider
- [ ] Validate job exists and belongs to service provider
- [ ] Check for worker availability (no double-booking)
- [ ] Update job's `assigned_worker_id` field
- [ ] Update job status to 'assigned' if currently 'scheduled'
- [ ] Return conflict error if worker already has job at that time
- [ ] Support unassigning worker (pass null worker_id)
- [ ] Add audit log entry for assignment changes
- [ ] Return updated job with worker details

**Technical Implementation**:
```typescript
// apps/api/src/routes/cleaning-jobs.ts

router.put('/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { worker_id } = req.body;
  const serviceProviderId = req.user.service_provider_id;

  try {
    // Validate job exists and belongs to this service provider
    const job = await prisma.cleaningJob.findFirst({
      where: { id, service_provider_id: serviceProviderId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // If assigning a worker (not unassigning)
    if (worker_id) {
      // Validate worker exists and belongs to this service provider
      const worker = await prisma.worker.findFirst({
        where: { id: worker_id, service_provider_id: serviceProviderId },
      });

      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      // Check for conflicts (worker already has job at this time)
      const conflict = await prisma.cleaningJob.findFirst({
        where: {
          assigned_worker_id: worker_id,
          scheduled_date: job.scheduled_date,
          status: { in: ['scheduled', 'assigned', 'in_progress'] },
          id: { not: id }, // Exclude current job
        },
      });

      if (conflict) {
        return res.status(409).json({
          error: 'Worker already has a job scheduled at this time',
          conflicting_job_id: conflict.id,
        });
      }
    }

    // Update job
    const updatedJob = await prisma.cleaningJob.update({
      where: { id },
      data: {
        assigned_worker_id: worker_id,
        status: worker_id && job.status === 'scheduled' ? 'assigned' : job.status,
      },
      include: {
        assigned_worker: true,
        property: true,
        customer: true,
      },
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Error assigning worker:', error);
    res.status(500).json({ error: 'Failed to assign worker' });
  }
});

// GET /api/workers/availability?date=2025-11-02&duration=2
router.get('/availability', async (req, res) => {
  const { date, duration } = req.query;
  const serviceProviderId = req.user.service_provider_id;

  try {
    const workers = await prisma.worker.findMany({
      where: { service_provider_id: serviceProviderId },
      include: {
        cleaning_jobs: {
          where: {
            scheduled_date: new Date(date as string),
            status: { in: ['scheduled', 'assigned', 'in_progress'] },
          },
        },
        maintenance_jobs: {
          where: {
            scheduled_date: new Date(date as string),
            status: { in: ['scheduled', 'assigned', 'in_progress'] },
          },
        },
      },
    });

    const availability = workers.map(worker => ({
      id: worker.id,
      name: worker.name,
      available: worker.cleaning_jobs.length === 0 && worker.maintenance_jobs.length === 0,
      conflicting_jobs: [...worker.cleaning_jobs, ...worker.maintenance_jobs],
    }));

    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});
```

**Same for Maintenance Jobs**:
```typescript
// apps/api/src/routes/maintenance-jobs.ts
// (Same logic as above, just for MaintenanceJob model)
```

**Database Changes**:
- ✅ No schema changes needed (Worker table already exists)
- ✅ CleaningJob.assigned_worker_id already exists
- ✅ MaintenanceJob.assigned_worker_id already exists

**Testing**:
- [ ] Can assign worker to cleaning job
- [ ] Can assign worker to maintenance job
- [ ] Can unassign worker (pass null)
- [ ] Returns 409 conflict if worker already booked
- [ ] Returns 404 if job not found
- [ ] Returns 404 if worker not found
- [ ] Multi-tenant isolation works (can't assign other provider's workers)

---

### STORY-202: Create WorkerAssignment.tsx Shared Component
**Priority**: P0 (Critical)
**Estimate**: 5 points
**Effort**: ~5 hours
**Status**: ⏭️ Ready

**As a** cleaning/maintenance service provider
**I want** to assign workers to jobs easily
**So that** I can dispatch work efficiently

**Acceptance Criteria**:
- [ ] Create `apps/web-cleaning/src/components/WorkerAssignment.tsx`
- [ ] Component works for both cleaning and maintenance jobs
- [ ] Display list of available workers
- [ ] Show worker name, photo, specialty
- [ ] Indicate if worker is already booked (conflict)
- [ ] Highlight currently assigned worker
- [ ] Click worker to assign
- [ ] Show confirmation dialog before assigning
- [ ] Display success toast after assignment
- [ ] Display error toast if conflict
- [ ] Show "Unassign Worker" button if worker assigned
- [ ] Auto-refresh job details after assignment
- [ ] Loading state during API call
- [ ] Works as modal or inline component

**Technical Implementation**:
```typescript
// apps/web-cleaning/src/components/WorkerAssignment.tsx

interface WorkerAssignmentProps {
  jobId: string;
  jobType: 'cleaning' | 'maintenance';
  scheduledDate: Date;
  currentWorkerId?: string;
  onAssigned: () => void; // Callback to refresh parent
}

const WorkerAssignment = ({
  jobId,
  jobType,
  scheduledDate,
  currentWorkerId,
  onAssigned
}: WorkerAssignmentProps) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [availability, setAvailability] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkersAndAvailability();
  }, [scheduledDate]);

  const fetchWorkersAndAvailability = async () => {
    setLoading(true);
    try {
      // Fetch all workers
      const workersData = await workersAPI.list();
      setWorkers(workersData);

      // Fetch availability for this date
      const availabilityData = await workersAPI.getAvailability({
        date: scheduledDate,
        duration: 2, // hours
      });

      const availabilityMap = new Map();
      availabilityData.forEach(w => {
        availabilityMap.set(w.id, w.available);
      });
      setAvailability(availabilityMap);
    } catch (error) {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    const isAvailable = availability.get(workerId);

    if (!isAvailable) {
      const confirm = window.confirm(
        `${worker.name} is already booked at this time. Assign anyway?`
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const api = jobType === 'cleaning' ? cleaningJobsAPI : maintenanceJobsAPI;
      await api.assign(jobId, workerId);
      toast.success(`Assigned ${worker.name} to job`);
      onAssigned(); // Refresh parent component
    } catch (error) {
      if (error.status === 409) {
        toast.error('Worker is already booked at this time');
      } else {
        toast.error('Failed to assign worker');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      const api = jobType === 'cleaning' ? cleaningJobsAPI : maintenanceJobsAPI;
      await api.assign(jobId, null);
      toast.success('Worker unassigned');
      onAssigned();
    } catch (error) {
      toast.error('Failed to unassign worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-assignment">
      <h3>Assign Worker</h3>

      {loading && <Spinner />}

      <div className="worker-list">
        {workers.map(worker => {
          const isAssigned = worker.id === currentWorkerId;
          const isAvailable = availability.get(worker.id);

          return (
            <div
              key={worker.id}
              className={`worker-card ${isAssigned ? 'assigned' : ''} ${!isAvailable ? 'conflict' : ''}`}
              onClick={() => handleAssign(worker.id)}
            >
              <img src={worker.photo_url} alt={worker.name} />
              <div className="worker-info">
                <div className="worker-name">{worker.name}</div>
                <div className="worker-specialty">{worker.specialty}</div>
              </div>
              {isAssigned && <Badge variant="success">Assigned</Badge>}
              {!isAvailable && <Badge variant="warning">Busy</Badge>}
            </div>
          );
        })}
      </div>

      {currentWorkerId && (
        <Button variant="danger" onClick={handleUnassign}>
          Unassign Worker
        </Button>
      )}
    </div>
  );
};

export default WorkerAssignment;
```

**API Integration**:
```typescript
// apps/web-cleaning/src/lib/api.ts

export const cleaningJobsAPI = {
  // ... existing methods ...

  assign: async (jobId: string, workerId: string | null) => {
    const response = await apiClient.put(`/cleaning-jobs/${jobId}/assign`, {
      worker_id: workerId,
    });
    return response.data;
  },
};

export const workersAPI = {
  list: async () => {
    const response = await apiClient.get('/workers');
    return response.data;
  },

  getAvailability: async ({ date, duration }: { date: Date; duration: number }) => {
    const response = await apiClient.get('/workers/availability', {
      params: { date: date.toISOString(), duration },
    });
    return response.data;
  },
};
```

**Usage in CleaningJobDetails.tsx**:
```typescript
const CleaningJobDetails = () => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [job, setJob] = useState<CleaningJob | null>(null);

  const handleWorkerAssigned = () => {
    setShowAssignModal(false);
    fetchJobDetails(); // Refresh job data
  };

  return (
    <div>
      {/* ... job details ... */}

      <Button onClick={() => setShowAssignModal(true)}>
        {job.assigned_worker_id ? 'Reassign Worker' : 'Assign Worker'}
      </Button>

      {showAssignModal && (
        <Modal onClose={() => setShowAssignModal(false)}>
          <WorkerAssignment
            jobId={job.id}
            jobType="cleaning"
            scheduledDate={job.scheduled_date}
            currentWorkerId={job.assigned_worker_id}
            onAssigned={handleWorkerAssigned}
          />
        </Modal>
      )}
    </div>
  );
};
```

**Testing**:
- [ ] Component displays list of workers
- [ ] Shows availability status correctly
- [ ] Can assign worker to job
- [ ] Can unassign worker from job
- [ ] Shows conflict warning if worker busy
- [ ] Highlights currently assigned worker
- [ ] Callback triggers parent refresh
- [ ] Works in both cleaning and maintenance apps

---

### STORY-203: Add Worker Assignment to CleaningJobDetails
**Priority**: P0 (Critical)
**Estimate**: 2 points
**Effort**: ~2 hours
**Status**: ⏭️ Ready (depends on STORY-202)

**As a** cleaning service provider
**I want** to assign workers from the job details page
**So that** I can quickly dispatch cleaning jobs

**Acceptance Criteria**:
- [ ] Add "Assign Worker" button to CleaningJobDetails.tsx
- [ ] Button opens WorkerAssignment modal
- [ ] Modal shows list of available workers
- [ ] Can assign worker from modal
- [ ] Job details refresh after assignment
- [ ] Show assigned worker's name and photo in job header
- [ ] Show "Reassign Worker" button if already assigned
- [ ] Show "Unassign Worker" option in modal

**Implementation**:
```typescript
// Already shown in STORY-202 example above
```

**Testing**:
- [ ] "Assign Worker" button appears for unassigned jobs
- [ ] Modal opens when button clicked
- [ ] Can assign worker successfully
- [ ] Job details update after assignment
- [ ] "Reassign Worker" button appears after assignment

---

### STORY-204: Add Worker Assignment to MaintenanceJobDetails
**Priority**: P0 (Critical)
**Estimate**: 2 points
**Effort**: ~2 hours
**Status**: ⏭️ Ready (depends on STORY-202)

**As a** maintenance service provider
**I want** to assign technicians from the job details page
**So that** I can quickly dispatch maintenance jobs after quote approval

**Acceptance Criteria**:
- [ ] Add "Assign Technician" button to MaintenanceJobDetails.tsx
- [ ] Button appears after quote is approved
- [ ] Button opens WorkerAssignment modal
- [ ] Modal shows list of available technicians
- [ ] Can assign technician from modal
- [ ] Job details refresh after assignment
- [ ] Job status updates to 'assigned' or 'scheduled'
- [ ] Show assigned technician's name and photo in job header
- [ ] Show "Reassign Technician" button if already assigned

**Implementation**:
```typescript
// apps/web-maintenance/src/pages/MaintenanceJobDetails.tsx

const MaintenanceJobDetails = () => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [job, setJob] = useState<MaintenanceJob | null>(null);

  const canAssignWorker = job.quote?.status === 'approved' || job.status === 'approved';

  return (
    <div>
      {/* ... existing job details ... */}

      {canAssignWorker && (
        <Button onClick={() => setShowAssignModal(true)}>
          {job.assigned_worker_id ? 'Reassign Technician' : 'Assign Technician'}
        </Button>
      )}

      {showAssignModal && (
        <Modal onClose={() => setShowAssignModal(false)}>
          <WorkerAssignment
            jobId={job.id}
            jobType="maintenance"
            scheduledDate={job.scheduled_date || new Date()}
            currentWorkerId={job.assigned_worker_id}
            onAssigned={() => {
              setShowAssignModal(false);
              fetchJobDetails();
            }}
          />
        </Modal>
      )}
    </div>
  );
};
```

**Testing**:
- [ ] "Assign Technician" button appears after quote approved
- [ ] Modal opens when button clicked
- [ ] Can assign technician successfully
- [ ] Job details update after assignment
- [ ] Job status updates correctly

---

### STORY-205: Add Worker Availability Calendar View
**Priority**: P2 (Nice to Have)
**Estimate**: 3 points
**Effort**: ~3 hours
**Status**: 📋 Future Enhancement

**As a** service provider
**I want** to see a calendar view of worker availability
**So that** I can schedule jobs more efficiently

**Acceptance Criteria**:
- [ ] Create WorkerCalendar.tsx component
- [ ] Display week or month view
- [ ] Show all workers on Y-axis, dates on X-axis
- [ ] Color-code cells: green (available), red (busy), yellow (partial)
- [ ] Click cell to see worker's schedule for that day
- [ ] Click cell to assign job to that worker/date
- [ ] Show job count in each cell
- [ ] Drag-and-drop to reschedule jobs (optional)
- [ ] Filter by worker specialty
- [ ] Export schedule to PDF

**Note**: This story is marked as P2 (nice to have) and can be deferred to a later sprint if time is limited.

---

## Epic 3: Job Completion Workflow ✅

**Goal**: Complete the job lifecycle by enabling service providers to mark jobs as complete, upload photos, generate invoices, and collect customer feedback.

**Why This Matters**: Jobs can be created and assigned, but need completion workflow to close the loop and generate invoices.

---

### STORY-301: Add Job Completion Modal
**Priority**: P0 (Critical)
**Estimate**: 3 points
**Effort**: ~3 hours
**Status**: ⏭️ Ready

**As a** service provider
**I want** to mark jobs as complete
**So that** I can finalize the job and bill the customer

**Acceptance Criteria**:
- [ ] Create JobCompletionModal.tsx component
- [ ] Modal appears when "Mark Complete" button clicked
- [ ] Works for both cleaning and maintenance jobs
- [ ] Upload before photos (if not already uploaded)
- [ ] Upload after photos (required)
- [ ] Add completion notes (textarea)
- [ ] Confirm all checklist items completed (cleaning jobs)
- [ ] Confirm work performed (maintenance jobs)
- [ ] Show summary of job before completion
- [ ] Show "Generate Invoice" checkbox (checked by default)
- [ ] Submit button calls completion API
- [ ] Show loading state during submit
- [ ] Show success toast on completion
- [ ] Redirect to invoice page if invoice generated
- [ ] Update job status to 'completed'
- [ ] Set completed_at timestamp

**Technical Implementation**:
```typescript
// apps/web-cleaning/src/components/JobCompletionModal.tsx

interface JobCompletionModalProps {
  jobId: string;
  jobType: 'cleaning' | 'maintenance';
  job: CleaningJob | MaintenanceJob;
  onCompleted: () => void;
  onClose: () => void;
}

const JobCompletionModal = ({
  jobId,
  jobType,
  job,
  onCompleted,
  onClose
}: JobCompletionModalProps) => {
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [generateInvoice, setGenerateInvoice] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (afterPhotos.length === 0) {
      toast.error('Please upload at least one after photo');
      return;
    }

    setLoading(true);
    try {
      // Upload photos first
      const beforeUrls = await uploadPhotos(beforePhotos);
      const afterUrls = await uploadPhotos(afterPhotos);

      // Mark job complete
      const api = jobType === 'cleaning' ? cleaningJobsAPI : maintenanceJobsAPI;
      const result = await api.complete(jobId, {
        before_photos: beforeUrls,
        after_photos: afterUrls,
        notes,
        generate_invoice: generateInvoice,
      });

      toast.success('Job completed successfully');

      if (result.invoice_id) {
        navigate(`/invoices/${result.invoice_id}`);
      } else {
        onCompleted();
      }
    } catch (error) {
      toast.error('Failed to complete job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Complete Job</h2>

      <div className="job-summary">
        <p>Property: {job.property.address}</p>
        <p>Customer: {job.customer.name}</p>
        <p>Date: {formatDate(job.scheduled_date)}</p>
        <p>Worker: {job.assigned_worker?.name}</p>
      </div>

      {jobType === 'cleaning' && (
        <div className="checklist-check">
          <p>All checklist items completed: {checklistCompletionStatus()}</p>
        </div>
      )}

      <div className="photo-upload">
        <h3>Before Photos</h3>
        <PhotoUpload
          value={beforePhotos}
          onChange={setBeforePhotos}
          maxPhotos={5}
        />
      </div>

      <div className="photo-upload">
        <h3>After Photos *</h3>
        <PhotoUpload
          value={afterPhotos}
          onChange={setAfterPhotos}
          maxPhotos={5}
          required
        />
      </div>

      <textarea
        label="Completion Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any additional notes about the work completed..."
        rows={4}
      />

      <Checkbox
        label="Generate invoice for customer"
        checked={generateInvoice}
        onChange={setGenerateInvoice}
      />

      <div className="modal-actions">
        <Button onClick={handleSubmit} loading={loading}>
          Complete Job
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
```

**API Endpoint** (needs to be created):
```typescript
PUT /api/cleaning-jobs/:id/complete
PUT /api/maintenance-jobs/:id/complete

Request Body:
{
  before_photos: string[], // S3 URLs
  after_photos: string[],  // S3 URLs
  notes: string,
  generate_invoice: boolean
}

Response:
{
  job: CleaningJob | MaintenanceJob,
  invoice_id?: string  // If invoice was generated
}
```

**Testing**:
- [ ] Modal opens when "Mark Complete" clicked
- [ ] Can upload before photos
- [ ] Can upload after photos
- [ ] Validates that after photos are uploaded
- [ ] Can add completion notes
- [ ] Can toggle invoice generation
- [ ] Submit button completes job
- [ ] Job status updates to 'completed'
- [ ] Redirects to invoice if generated

---

### STORY-302: Integrate Existing Photo Upload System
**Priority**: P0 (Critical)
**Estimate**: 2 points (reduced from 4 - infrastructure already exists!)
**Effort**: ~2 hours
**Status**: ⏭️ Ready

**As a** service provider
**I want** to upload photos when completing jobs
**So that** customers can see before/after photos of completed work

**Context**: Photo upload infrastructure already exists! We just need to integrate it with job completion.

**Existing Infrastructure** ✅:
- ✅ `POST /api/photos` endpoint already implemented
- ✅ PhotosService handles local storage (dev) and S3 (prod) automatically
- ✅ Automatic thumbnail generation (400x400)
- ✅ Image optimization (max 1920x1920, 85% quality)
- ✅ Photo quality analysis with Google Vision API
- ✅ Supports jpg, png, gif, webp (max 10MB)
- ✅ Photo model in database with metadata

**Acceptance Criteria**:
- [ ] Frontend PhotoUpload component accepts multiple files
- [ ] Component uploads via existing `POST /api/photos` endpoint
- [ ] Returns array of photo URLs from PhotosService
- [ ] Job completion stores photo URLs in `before_photos` and `after_photos` arrays
- [ ] Display uploaded photos in job details pages
- [ ] Works in both local storage mode (dev) and S3 mode (prod)
- [ ] No need for S3 setup in development (uses ./uploads/)
- [ ] Production deployment can optionally configure S3 via env vars

**Technical Implementation**:

**Backend (Already Exists - No Changes Needed)** ✅:
```typescript
// apps/api/src/routes/photos.ts (ALREADY IMPLEMENTED)
POST /api/photos
- Accepts: multipart/form-data with 'photo' field
- Body params: property_id, work_order_id, label, caption
- Returns: { data: Photo } with s3_url and thumbnail_url
- Automatically uses local storage if AWS not configured
- Automatically uses S3 if AWS credentials provided
```

**Job Completion Integration** (NEW):
```typescript
// Modify job completion endpoints to accept photo metadata
PUT /api/cleaning-jobs/:id/complete
PUT /api/maintenance-jobs/:id/complete

Request Body:
{
  before_photo_ids: string[],  // Photo IDs from /api/photos
  after_photo_ids: string[],   // Photo IDs from /api/photos
  notes: string,
  generate_invoice: boolean
}

// Service resolves photo IDs to URLs:
const beforePhotos = await prisma.photo.findMany({
  where: { id: { in: before_photo_ids } },
  select: { s3_url: true }
});

job.before_photos = beforePhotos.map(p => p.s3_url);
```

**Environment Variables** (Optional - for production S3):
```bash
# .env (OPTIONAL - for production only)
# If not set, uses local ./uploads/ directory

AWS_REGION=eu-west-2           # Optional
AWS_ACCESS_KEY_ID=xxx          # Optional
AWS_SECRET_ACCESS_KEY=xxx      # Optional
S3_BUCKET_NAME=rightfit-photos # Optional

# Development defaults (no config needed):
# USE_LOCAL_STORAGE=true (automatic if AWS not configured)
# LOCAL_STORAGE_PATH=./uploads
```

**Frontend PhotoUpload Component** (NEW):
```typescript
// apps/web-cleaning/src/components/PhotoUpload.tsx

interface PhotoUploadProps {
  propertyId?: string;
  workOrderId?: string;
  onUploadComplete: (photoId: string, photoUrl: string) => void;
  maxPhotos?: number;
}

const PhotoUpload = ({ propertyId, workOrderId, onUploadComplete, maxPhotos = 10 }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string }>>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (uploadedPhotos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);

    try {
      // Upload each file using existing /api/photos endpoint
      for (const file of files) {
        const formData = new FormData();
        formData.append('photo', file); // singular 'photo' per existing API
        if (propertyId) formData.append('property_id', propertyId);
        if (workOrderId) formData.append('work_order_id', workOrderId);

        const response = await apiClient.post('/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const photo = response.data.data; // { id, s3_url, thumbnail_url }
        setUploadedPhotos(prev => [...prev, { id: photo.id, url: photo.s3_url }]);
        onUploadComplete(photo.id, photo.s3_url);
      }

      toast.success(`${files.length} photo(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload">
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileSelect}
        disabled={uploading}
        id="photo-upload-input"
      />

      <label htmlFor="photo-upload-input">
        <Button disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </Button>
      </label>

      <div className="photo-previews">
        {uploadedPhotos.map((photo, index) => (
          <div key={photo.id} className="photo-preview">
            <img src={photo.url} alt={`Photo ${index + 1}`} />
          </div>
        ))}
      </div>

      <div className="photo-count">
        {uploadedPhotos.length} / {maxPhotos} photos
      </div>
    </div>
  );
};
```

**Usage in Job Completion Modal**:
```typescript
const JobCompletionModal = ({ jobId, jobType }) => {
  const [beforePhotoIds, setBeforePhotoIds] = useState<string[]>([]);
  const [afterPhotoIds, setAfterPhotoIds] = useState<string[]>([]);

  const handlePhotoUpload = (type: 'before' | 'after') => (photoId: string) => {
    if (type === 'before') {
      setBeforePhotoIds(prev => [...prev, photoId]);
    } else {
      setAfterPhotoIds(prev => [...prev, photoId]);
    }
  };

  const handleComplete = async () => {
    await cleaningJobsAPI.complete(jobId, {
      before_photo_ids: beforePhotoIds,
      after_photo_ids: afterPhotoIds,
      notes: '...',
      generate_invoice: true,
    });
  };

  return (
    <Modal>
      <h3>Before Photos</h3>
      <PhotoUpload
        propertyId={job.property_id}
        onUploadComplete={handlePhotoUpload('before')}
      />

      <h3>After Photos *</h3>
      <PhotoUpload
        propertyId={job.property_id}
        onUploadComplete={handlePhotoUpload('after')}
      />
    </Modal>
  );
};
```

**Testing**:
- [ ] Can upload single photo via PhotoUpload component
- [ ] Can upload multiple photos
- [ ] Photos upload to existing `/api/photos` endpoint
- [ ] Photo IDs returned correctly
- [ ] Job completion saves photo IDs and resolves to URLs
- [ ] Photos display in job details page
- [ ] Works in local storage mode (dev) without S3 setup
- [ ] Photo quality analysis warnings appear (if applicable)
- [ ] Thumbnails generated automatically

---

### STORY-303: Add Invoice Generation After Job Completion
**Priority**: P0 (Critical)
**Estimate**: 4 points
**Effort**: ~4 hours
**Status**: ⏭️ Ready

**As a** service provider
**I want** invoices to be automatically generated when jobs are completed
**So that** I can bill customers for completed work

**Acceptance Criteria**:
- [ ] Create invoice when job marked complete (if generate_invoice = true)
- [ ] Invoice includes line items from quote (maintenance jobs)
- [ ] Invoice includes standard rate (cleaning jobs)
- [ ] Calculate subtotal, tax (20% VAT), and total
- [ ] Set invoice status to 'pending'
- [ ] Set due date to 30 days from completion
- [ ] Link invoice to job (maintenance_job_id or cleaning_job_id)
- [ ] Link invoice to customer
- [ ] Send email notification to customer
- [ ] Return invoice_id in completion API response
- [ ] Create InvoiceService.ts for business logic
- [ ] Add invoice routes to API

**Technical Implementation**:
```typescript
// apps/api/src/services/InvoiceService.ts

export class InvoiceService {
  static async createFromCleaningJob(jobId: string): Promise<Invoice> {
    const job = await prisma.cleaningJob.findUnique({
      where: { id: jobId },
      include: { customer: true, property: true },
    });

    if (!job) throw new Error('Job not found');

    // Get standard cleaning rate (from service provider settings or default)
    const rate = 150; // £150 standard cleaning rate
    const subtotal = rate;
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        cleaning_job_id: jobId,
        customer_id: job.customer_id,
        line_items: [
          {
            description: `Cleaning Service - ${job.property.address}`,
            quantity: 1,
            unit_price: rate,
          },
        ],
        subtotal,
        tax,
        total,
        status: 'pending',
        issued_at: new Date(),
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Send email notification
    await this.sendInvoiceEmail(invoice.id);

    return invoice;
  }

  static async createFromMaintenanceJob(jobId: string): Promise<Invoice> {
    const job = await prisma.maintenanceJob.findUnique({
      where: { id: jobId },
      include: { customer: true, property: true, quote: true },
    });

    if (!job) throw new Error('Job not found');
    if (!job.quote) throw new Error('No quote found for job');

    // Use quote line items
    const subtotal = job.quote.subtotal;
    const tax = job.quote.tax;
    const total = job.quote.total;

    const invoice = await prisma.invoice.create({
      data: {
        maintenance_job_id: jobId,
        customer_id: job.customer_id,
        line_items: job.quote.line_items, // Copy from quote
        subtotal,
        tax,
        total,
        status: 'pending',
        issued_at: new Date(),
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await this.sendInvoiceEmail(invoice.id);

    return invoice;
  }

  static async sendInvoiceEmail(invoiceId: string): Promise<void> {
    // TODO: Implement email sending via SendGrid/AWS SES
    console.log(`Email notification sent for invoice ${invoiceId}`);
  }
}
```

**Update Job Completion Endpoints**:
```typescript
// apps/api/src/routes/cleaning-jobs.ts

router.put('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { before_photos, after_photos, notes, generate_invoice } = req.body;

  try {
    // Update job
    const job = await prisma.cleaningJob.update({
      where: { id },
      data: {
        status: 'completed',
        completed_at: new Date(),
        before_photos,
        after_photos,
        notes,
      },
    });

    let invoice = null;
    if (generate_invoice) {
      invoice = await InvoiceService.createFromCleaningJob(id);
    }

    res.json({
      job,
      invoice_id: invoice?.id,
    });
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ error: 'Failed to complete job' });
  }
});
```

**Same for Maintenance Jobs**:
```typescript
// apps/api/src/routes/maintenance-jobs.ts
// (Same logic, but uses InvoiceService.createFromMaintenanceJob)
```

**Testing**:
- [ ] Invoice created when cleaning job completed
- [ ] Invoice created when maintenance job completed
- [ ] Invoice has correct line items
- [ ] Invoice totals calculated correctly (subtotal + tax)
- [ ] Invoice linked to job and customer
- [ ] Invoice status is 'pending'
- [ ] Invoice due date is 30 days from now
- [ ] Can complete job without generating invoice

---

### STORY-304: Add Customer Rating and Feedback
**Priority**: P1 (High)
**Estimate**: 3 points
**Effort**: ~3 hours
**Status**: ⏭️ Ready

**As a** customer
**I want** to rate completed jobs and leave feedback
**So that** service providers know how they're doing

**Acceptance Criteria**:
- [ ] Add rating modal to customer portal after job completion
- [ ] 5-star rating system (1-5 stars)
- [ ] Text feedback (optional, max 500 chars)
- [ ] Show rating prompt in customer dashboard
- [ ] Prompt appears 24 hours after job completion
- [ ] Store rating in job record (customer_rating, customer_feedback)
- [ ] Display rating on job details page (service provider view)
- [ ] Calculate average rating per worker
- [ ] Show worker ratings in WorkerAssignment component
- [ ] Ratings are public to service provider only

**Technical Implementation**:
```typescript
// apps/web-customer/src/components/RatingModal.tsx

interface RatingModalProps {
  jobId: string;
  jobType: 'cleaning' | 'maintenance';
  propertyAddress: string;
  completedDate: Date;
  onSubmit: () => void;
  onClose: () => void;
}

const RatingModal = ({ jobId, jobType, propertyAddress, completedDate, onSubmit, onClose }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await customerPortalAPI.submitRating(jobId, jobType, {
        rating,
        feedback,
      });
      toast.success('Thank you for your feedback!');
      onSubmit();
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Rate Your Service</h2>
      <p>How was the {jobType} service at {propertyAddress}?</p>
      <p className="date">Completed {formatDate(completedDate)}</p>

      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`star ${rating >= star ? 'filled' : ''}`}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="Tell us about your experience (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        maxLength={500}
        rows={4}
      />

      <div className="modal-actions">
        <Button onClick={handleSubmit} loading={loading}>
          Submit Rating
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Skip
        </Button>
      </div>
    </Modal>
  );
};
```

**API Endpoint**:
```typescript
// apps/api/src/routes/customer-portal.ts

router.post('/jobs/:id/rate', async (req, res) => {
  const { id } = req.params;
  const { job_type, rating, feedback } = req.body;
  const customerId = req.user.customer_id;

  try {
    const model = job_type === 'cleaning' ? prisma.cleaningJob : prisma.maintenanceJob;

    // Verify job belongs to this customer
    const job = await model.findFirst({
      where: { id, customer_id: customerId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Job not completed yet' });
    }

    // Update rating
    const updated = await model.update({
      where: { id },
      data: {
        customer_rating: rating,
        customer_feedback: feedback,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});
```

**Show Rating Prompts in Customer Dashboard**:
```typescript
// apps/web-customer/src/pages/CustomerDashboard.tsx

const CustomerDashboard = () => {
  const [unratedJobs, setUnratedJobs] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchUnratedJobs();
  }, []);

  const fetchUnratedJobs = async () => {
    const jobs = await customerPortalAPI.getUnratedJobs();
    setUnratedJobs(jobs);
  };

  return (
    <div>
      {/* Rating Prompts */}
      {unratedJobs.length > 0 && (
        <Card className="rating-prompts">
          <h2>Rate Your Recent Services</h2>
          {unratedJobs.map(job => (
            <div key={job.id} className="rating-prompt">
              <div>
                {job.job_type} at {job.property.address}
                <br />
                Completed {formatDate(job.completed_at)}
              </div>
              <Button onClick={() => {
                setSelectedJob(job);
                setShowRatingModal(true);
              }}>
                Rate Service
              </Button>
            </div>
          ))}
        </Card>
      )}

      {/* ... rest of dashboard ... */}

      {showRatingModal && selectedJob && (
        <RatingModal
          jobId={selectedJob.id}
          jobType={selectedJob.job_type}
          propertyAddress={selectedJob.property.address}
          completedDate={selectedJob.completed_at}
          onSubmit={() => {
            setShowRatingModal(false);
            fetchUnratedJobs();
          }}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};
```

**Display Ratings on Job Details**:
```typescript
// Add to CleaningJobDetails.tsx and MaintenanceJobDetails.tsx

{job.customer_rating && (
  <Card>
    <h2>Customer Rating</h2>
    <div className="rating">
      {'★'.repeat(job.customer_rating)}{'☆'.repeat(5 - job.customer_rating)}
      <span>{job.customer_rating}/5</span>
    </div>
    {job.customer_feedback && (
      <p className="feedback">"{job.customer_feedback}"</p>
    )}
  </Card>
)}
```

**Testing**:
- [ ] Rating modal appears for completed jobs
- [ ] Can select 1-5 star rating
- [ ] Can submit rating without feedback
- [ ] Can submit rating with feedback
- [ ] Rating saves to database
- [ ] Rating displays on job details page
- [ ] Cannot rate job twice
- [ ] Cannot rate incomplete job

---

## 📋 Definition of Done

Sprint is complete when:

### Epic 1: Cleaning Job Details
- [ ] CleaningJobDetails.tsx displays all job information
- [ ] CleaningJobForm.tsx creates and edits jobs
- [ ] Checklist items can be managed and toggled
- [ ] All pages responsive on mobile/tablet

### Epic 2: Worker Assignment
- [ ] Worker assignment API endpoints working
- [ ] WorkerAssignment.tsx component functional
- [ ] Can assign workers to cleaning jobs
- [ ] Can assign workers to maintenance jobs
- [ ] Conflict detection prevents double-booking
- [ ] Worker availability checked before assignment

### Epic 3: Job Completion
- [ ] Job completion modal functional
- [ ] Photos upload to S3 successfully
- [ ] Invoices generate automatically
- [ ] Customers can rate completed jobs
- [ ] Ratings display on job details

### Testing & Quality
- [ ] All API endpoints tested with Postman/Insomnia
- [ ] All frontend pages work on desktop
- [ ] All frontend pages work on mobile
- [ ] No console errors in browser
- [ ] No TypeScript errors in build
- [ ] All user stories tested manually

### Documentation
- [ ] API endpoints documented
- [ ] Component props documented
- [ ] S3 bucket setup documented
- [ ] Environment variables documented

---

## 🚧 Dependencies & Prerequisites

**Before Starting**:
- [ ] Phase 3 Quote Workflow complete ✅
- [ ] Cleanup Sprint 1 complete ✅
- [ ] AWS S3 bucket created (for photo uploads)
- [ ] AWS credentials configured
- [ ] Database schema up-to-date

**External Services Needed**:
- AWS S3 for photo storage
- SendGrid or AWS SES for invoice emails (optional for MVP)
- Stripe for payment processing (Phase 4)

**Database Changes**:
- ✅ No schema changes needed (all tables exist)
- ✅ CleaningJob already has before_photos, after_photos, customer_rating, customer_feedback
- ✅ MaintenanceJob already has same fields
- ✅ Invoice table already exists

---

## 📊 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Job Details Load Time** | <500ms | API response time |
| **Worker Assignment Speed** | <3 clicks | User workflow tracking |
| **Photo Upload Success Rate** | >95% | Upload success vs failures |
| **Invoice Generation Rate** | 100% | Jobs with invoices / completed jobs |
| **Customer Rating Participation** | >50% | Rated jobs / completed jobs |

---

## 🎯 Sprint Priorities

If time is limited, prioritize in this order:

**Must Have (P0)**:
1. STORY-101: CleaningJobDetails.tsx ✅
2. STORY-201: Worker Assignment API ✅
3. STORY-202: WorkerAssignment.tsx Component ✅
4. STORY-301: Job Completion Modal ✅
5. STORY-302: Photo Upload to S3 ✅

**Should Have (P1)**:
6. STORY-102: CleaningJobForm.tsx
7. STORY-203: Worker Assignment in CleaningJobDetails
8. STORY-204: Worker Assignment in MaintenanceJobDetails
9. STORY-303: Invoice Generation
10. STORY-304: Customer Rating

**Nice to Have (P2)**:
11. STORY-103: Checklist Management
12. STORY-205: Worker Calendar View (defer to Phase 4)

---

## 🔄 Next Steps After This Sprint

Once this sprint is complete, you'll have:
- ✅ Complete cleaning job management
- ✅ Complete maintenance job management
- ✅ Worker assignment for both job types
- ✅ Job completion workflow
- ✅ Photo uploads
- ✅ Invoice generation
- ✅ Customer ratings

**Then move to Phase 3B (Feature Completeness) or Phase 4 (Mobile Apps)**

---

**Sprint Status**: 📋 **READY TO START**
**Created**: 2025-11-02
**Estimated Completion**: 2025-11-15 (2 weeks)

---

*Let's complete the core job management workflows! 🚀*
