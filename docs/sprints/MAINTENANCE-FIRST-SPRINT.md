# Maintenance-First Sprint: Complete End-to-End Workflow

**Sprint Goal**: Complete the maintenance workflow from quote to completion, then replicate for cleaning.

**Strategy**: Maintenance First → Use as Template for Cleaning

**Estimated Duration**: 3-4 days for maintenance, then 1-2 days to replicate for cleaning

**Status**: 📋 **READY TO START**

---

## 🎯 Why Maintenance First?

### Already Built for Maintenance ✅:
1. ✅ MaintenanceDashboard with tabs (New Issues | Submitted Quotes | Accepted Quotes)
2. ✅ MaintenanceJobDetails page
3. ✅ Quote submission form with parts/labor breakdown
4. ✅ Quote approval workflow (customer portal)
5. ✅ Guest issue reporting → maintenance job creation
6. ✅ End-to-end tested: Guest → Customer → Quote → Approval

### What's Missing for Maintenance:
1. ❌ Contractor assignment & scheduling
2. ❌ Job completion workflow
3. ❌ Photo upload during completion
4. ❌ Invoice generation
5. ❌ Customer rating after completion

### Cleaning Status (Minimal):
- ✅ CleaningDashboard (basic list)
- ✅ CleaningJobDetails (view only)
- ❌ Everything else missing

**Decision**: Finish maintenance completely, then copy the patterns to cleaning. This avoids building the same thing twice in parallel.

---

## 📊 Maintenance-First Sprint Breakdown

### **Epic 1: Maintenance Contractor Scheduling** (6 points)
Complete the contractor assignment and scheduling system for maintenance jobs.

| Story | Description | Points | Priority |
|-------|-------------|--------|----------|
| **M-201** | Contractor Assignment API | 3 pts | P0 |
| **M-202** | Contractor Scheduling UI | 3 pts | P0 |

---

### **Epic 2: Maintenance Job Completion** (9 points)
Build the job completion workflow with photos and notes.

| Story | Description | Points | Priority |
|-------|-------------|--------|----------|
| **M-301** | Job Completion Modal | 2 pts | P0 |
| **M-302** | Photo Upload Component | 1 pt | P0 |
| **M-303** | Invoice Generation | 4 pts | P0 |
| **M-304** | Customer Rating Widget | 2 pts | P1 |

---

### **Epic 3: Replicate to Cleaning** (3 points)
Once maintenance works, copy patterns to cleaning.

| Story | Description | Points | Priority |
|-------|-------------|--------|----------|
| **C-201** | Worker Assignment (copy from M-201/202) | 2 pts | P1 |
| **C-301** | Job Completion (copy from M-301/302) | 1 pt | P1 |

**Total**: 18 points (15 maintenance + 3 cleaning)

---

## 🔨 Detailed Stories - Maintenance First

### M-201: Maintenance Contractor Assignment API
**Priority**: P0 (Critical)
**Estimate**: 3 points
**Status**: ⏭️ Ready

**Goal**: Build API to assign contractors (internal + external) to maintenance jobs with conflict detection.

**Acceptance Criteria**:
- [ ] `PUT /api/maintenance-jobs/:id/assign` endpoint
- [ ] Support internal contractors (Worker with worker_type=MAINTENANCE + employment_type=CONTRACTOR)
- [ ] `PUT /api/maintenance-jobs/:id/assign-external` endpoint
- [ ] Support external contractors (ExternalContractor table)
- [ ] Check contractor availability (no overlapping jobs)
- [ ] Detect conflicts and return detailed error
- [ ] Update job with assigned_worker_id OR assigned_external_contractor_id
- [ ] Update scheduled_date, scheduled_start_time, scheduled_end_time
- [ ] Job status → SCHEDULED

**API Endpoints**:
```typescript
PUT /api/maintenance-jobs/:id/assign
Body: {
  worker_id: string,  // Internal contractor from Worker table
  scheduled_date: "2025-11-05",
  scheduled_start_time: "09:00",
  scheduled_end_time: "11:00",
  service_provider_id: string
}

PUT /api/maintenance-jobs/:id/assign-external
Body: {
  external_contractor_id: string,
  scheduled_date: "2025-11-05",
  scheduled_start_time: "09:00",
  scheduled_end_time: "11:00",
  service_provider_id: string
}

GET /api/maintenance-jobs/contractors/available
Query: ?date=2025-11-05&start_time=09:00&end_time=11:00&service_provider_id=xxx
Response: {
  internal: Worker[],  // With availability
  external: ExternalContractor[]  // No conflict checking for external
}
```

**Backend Implementation**:
```typescript
// apps/api/src/services/MaintenanceJobsService.ts

async assignInternalContractor(
  jobId: string,
  workerId: string,
  scheduledDate: Date,
  scheduledStartTime: string,
  scheduledEndTime: string,
  serviceProviderId: string
): Promise<MaintenanceJob> {
  // 1. Verify job exists
  const job = await this.getById(jobId, serviceProviderId);

  // Must have approved quote before assignment
  if (job.status !== 'QUOTE_APPROVED' && job.status !== 'QUOTE_REQUESTED') {
    throw new ValidationError('Job must have approved quote before assignment');
  }

  // 2. Verify internal contractor exists
  const contractor = await prisma.worker.findFirst({
    where: {
      id: workerId,
      service_provider_id: serviceProviderId,
      is_active: true,
      worker_type: { in: ['MAINTENANCE', 'BOTH'] },
      employment_type: 'CONTRACTOR',
    },
  });

  if (!contractor) {
    throw new ValidationError('Internal contractor not found or not authorized');
  }

  // 3. Check for conflicts
  const conflicts = await this.checkContractorAvailability(
    workerId,
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime
  );

  if (conflicts.length > 0) {
    throw new ValidationError('Contractor has conflicting job(s)', { conflicts });
  }

  // 4. Assign contractor
  const updatedJob = await prisma.maintenanceJob.update({
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
      quote: true,
    },
  });

  return updatedJob;
}

async assignExternalContractor(
  jobId: string,
  contractorId: string,
  scheduledDate: Date,
  scheduledStartTime: string,
  scheduledEndTime: string,
  serviceProviderId: string
): Promise<MaintenanceJob> {
  const job = await this.getById(jobId, serviceProviderId);

  const contractor = await prisma.externalContractor.findFirst({
    where: {
      id: contractorId,
      service_provider_id: serviceProviderId,
    },
  });

  if (!contractor) {
    throw new ValidationError('External contractor not found');
  }

  // Note: We don't check conflicts for external contractors
  // They manage their own schedules

  return prisma.maintenanceJob.update({
    where: { id: jobId },
    data: {
      assigned_external_contractor_id: contractorId,
      scheduled_date: scheduledDate,
      scheduled_start_time: scheduledStartTime,
      scheduled_end_time: scheduledEndTime,
      status: 'SCHEDULED',
      updated_at: new Date(),
    },
    include: {
      property: true,
      customer: true,
      assigned_external_contractor: true,
      quote: true,
    },
  });
}

async checkContractorAvailability(
  workerId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<MaintenanceJob[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const overlappingJobs = await prisma.maintenanceJob.findMany({
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

  // Check for time slot overlaps
  return overlappingJobs.filter(job => {
    return this.timeSlotsOverlap(
      startTime,
      endTime,
      job.scheduled_start_time,
      job.scheduled_end_time
    );
  });
}

private timeSlotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
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

**Testing**:
- [ ] Can assign internal contractor to maintenance job
- [ ] Can assign external contractor to maintenance job
- [ ] Validates contractor exists and is MAINTENANCE type
- [ ] Detects conflicts for internal contractors
- [ ] Allows back-to-back jobs (no conflict)
- [ ] Returns 400 with conflict details
- [ ] Updates job status to SCHEDULED
- [ ] External contractors don't check conflicts

---

### M-202: Contractor Scheduling UI Component
**Priority**: P0 (Critical)
**Estimate**: 3 points
**Status**: ⏭️ Ready

**Goal**: Build UI to schedule and assign contractors to maintenance jobs.

**Acceptance Criteria**:
- [ ] `ContractorSchedulingModal.tsx` component
- [ ] Date picker for scheduling (future dates only)
- [ ] Time pickers (start & end)
- [ ] List internal contractors (Worker where worker_type=MAINTENANCE + employment_type=CONTRACTOR)
- [ ] List external contractors (ExternalContractor table)
- [ ] Show "External" badge for external contractors
- [ ] Show availability indicator for internal contractors
- [ ] Show conflict details for busy contractors
- [ ] Allow selecting contractor (even if busy, with warning)
- [ ] Call PUT /api/maintenance-jobs/:id/assign or assign-external
- [ ] Integrate with MaintenanceJobDetails page
- [ ] Mobile responsive

**Component Structure**:
```typescript
// apps/web-maintenance/src/components/ContractorSchedulingModal.tsx

interface ContractorSchedulingModalProps {
  jobId: string;
  currentSchedule?: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  onScheduled: () => void;
  onCancel: () => void;
}

interface ContractorWithAvailability {
  id: string;
  name: string;
  type: 'internal' | 'external';
  isAvailable?: boolean;  // Only for internal
  conflicts?: MaintenanceJob[];  // Only for internal
  hourlyRate?: number;
  averageRating?: number;
  specialties?: string[];
  isPreferred?: boolean;  // External contractors
}

export default function ContractorSchedulingModal({
  jobId,
  currentSchedule,
  onScheduled,
  onCancel,
}: ContractorSchedulingModalProps) {
  const [selectedDate, setSelectedDate] = useState(currentSchedule?.date || new Date());
  const [startTime, setStartTime] = useState(currentSchedule?.startTime || '09:00');
  const [endTime, setEndTime] = useState(currentSchedule?.endTime || '11:00');
  const [contractors, setContractors] = useState<ContractorWithAvailability[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<ContractorWithAvailability | null>(null);

  useEffect(() => {
    loadContractors();
  }, [selectedDate, startTime, endTime]);

  const loadContractors = async () => {
    // Fetch internal contractors (Worker table)
    const internalContractors = await workersAPI.list(SERVICE_PROVIDER_ID, {
      worker_type: ['MAINTENANCE', 'BOTH'],
      employment_type: 'CONTRACTOR',
      is_active: true,
    });

    // Check availability for each internal contractor
    const internalWithAvailability = await Promise.all(
      internalContractors.map(async (contractor) => {
        const conflicts = await checkContractorConflicts(
          contractor.id,
          selectedDate,
          startTime,
          endTime
        );

        return {
          id: contractor.id,
          name: `${contractor.first_name} ${contractor.last_name}`,
          type: 'internal' as const,
          isAvailable: conflicts.length === 0,
          conflicts,
          hourlyRate: contractor.hourly_rate,
          averageRating: contractor.average_rating,
        };
      })
    );

    // Fetch external contractors
    const externalContractors = await externalContractorsAPI.list(SERVICE_PROVIDER_ID);

    const externalFormatted = externalContractors.map(contractor => ({
      id: contractor.id,
      name: contractor.company_name,
      type: 'external' as const,
      specialties: contractor.specialties,
      averageRating: contractor.average_rating,
      isPreferred: contractor.preferred_contractor,
    }));

    // Combine and sort (internal first, then preferred external)
    const allContractors = [
      ...internalWithAvailability.sort((a, b) =>
        (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0)
      ),
      ...externalFormatted.sort((a, b) =>
        (b.isPreferred ? 1 : 0) - (a.isPreferred ? 1 : 0)
      ),
    ];

    setContractors(allContractors);
  };

  const handleSchedule = async () => {
    if (!selectedContractor) {
      toast.error('Please select a contractor');
      return;
    }

    try {
      const endpoint = selectedContractor.type === 'internal'
        ? `/api/maintenance-jobs/${jobId}/assign`
        : `/api/maintenance-jobs/${jobId}/assign-external`;

      const body = {
        ...(selectedContractor.type === 'internal'
          ? { worker_id: selectedContractor.id }
          : { external_contractor_id: selectedContractor.id }
        ),
        scheduled_date: selectedDate,
        scheduled_start_time: startTime,
        scheduled_end_time: endTime,
        service_provider_id: SERVICE_PROVIDER_ID,
      };

      await apiClient.put(endpoint, body);

      toast.success('Contractor scheduled successfully');
      onScheduled();
    } catch (err: any) {
      if (err.response?.data?.conflicts) {
        toast.error(`Contractor has ${err.response.data.conflicts.length} conflicting job(s)`);
      } else {
        toast.error('Failed to schedule contractor');
      }
    }
  };

  return (
    <Modal isOpen onClose={onCancel} size="lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Schedule & Assign Contractor</h2>

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

        {/* Contractor Selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">
            Available Contractors ({contractors.length})
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contractors.map((contractor) => (
              <div
                key={contractor.id}
                className={`
                  p-3 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedContractor?.id === contractor.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${contractor.type === 'internal' && !contractor.isAvailable
                    ? 'opacity-60'
                    : ''
                  }
                `}
                onClick={() => setSelectedContractor(contractor)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{contractor.name}</h4>

                      {contractor.type === 'external' ? (
                        <Badge variant="info">External</Badge>
                      ) : contractor.isAvailable ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="error">Busy</Badge>
                      )}

                      {contractor.isPreferred && (
                        <Badge variant="warning">⭐ Preferred</Badge>
                      )}
                    </div>

                    <div className="flex gap-3 mt-1 text-sm text-gray-600">
                      {contractor.averageRating && (
                        <span>⭐ {contractor.averageRating.toFixed(1)}</span>
                      )}
                      {contractor.hourlyRate && (
                        <span>💷 £{contractor.hourlyRate}/hr</span>
                      )}
                      {contractor.specialties && contractor.specialties.length > 0 && (
                        <span>🔧 {contractor.specialties.join(', ')}</span>
                      )}
                    </div>

                    {/* Show conflicts for internal contractors */}
                    {contractor.type === 'internal' &&
                     contractor.conflicts &&
                     contractor.conflicts.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <div className="font-medium text-red-800">⚠️ Conflicts:</div>
                        {contractor.conflicts.map((conflict, idx) => (
                          <div key={idx} className="text-red-700 ml-4">
                            • {conflict.scheduled_start_time} - {conflict.scheduled_end_time} at{' '}
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
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSchedule}
            disabled={!selectedContractor}
            className="flex-1"
          >
            Schedule Contractor
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

**Integration with MaintenanceJobDetails**:
```typescript
// apps/web-maintenance/src/pages/MaintenanceJobDetails.tsx

const [showSchedulingModal, setShowSchedulingModal] = useState(false);

{/* In Actions card */}
{job.status === 'QUOTE_APPROVED' && !job.assigned_worker_id && (
  <Button
    onClick={() => setShowSchedulingModal(true)}
    variant="primary"
    className="w-full"
  >
    Schedule & Assign Contractor
  </Button>
)}

{/* If already assigned, show reassign option */}
{job.assigned_worker_id && job.status === 'SCHEDULED' && (
  <Button
    onClick={() => setShowSchedulingModal(true)}
    variant="secondary"
    className="w-full"
  >
    Reassign Contractor
  </Button>
)}

{/* Modal */}
{showSchedulingModal && (
  <ContractorSchedulingModal
    jobId={job.id}
    currentSchedule={
      job.scheduled_date
        ? {
            date: new Date(job.scheduled_date),
            startTime: job.scheduled_start_time,
            endTime: job.scheduled_end_time,
          }
        : undefined
    }
    onScheduled={() => {
      setShowSchedulingModal(false);
      loadJob();
    }}
    onCancel={() => setShowSchedulingModal(false)}
  />
)}
```

**Testing**:
- [ ] Modal opens from job details
- [ ] Date picker works (future dates only)
- [ ] Time pickers work
- [ ] Shows internal contractors with availability
- [ ] Shows external contractors with "External" badge
- [ ] Shows conflicts for busy internal contractors
- [ ] Can select any contractor
- [ ] Schedule button calls correct endpoint
- [ ] Success toast shows
- [ ] Modal closes and job refreshes
- [ ] Mobile responsive

---

### M-301: Maintenance Job Completion Modal
**Priority**: P0 (Critical)
**Estimate**: 2 points
**Status**: ⏭️ Ready

**Goal**: Build modal for contractors to mark maintenance jobs as complete.

**Acceptance Criteria**:
- [ ] `MaintenanceJobCompletionModal.tsx` component
- [ ] Show job summary (property, customer, quote)
- [ ] Work performed textarea
- [ ] Diagnosis notes textarea
- [ ] Before/after/in-progress photo upload
- [ ] Actual hours worked input
- [ ] Actual parts cost input (if different from quote)
- [ ] "Generate Invoice" checkbox (default: true)
- [ ] Call POST /api/maintenance-jobs/:id/complete
- [ ] Show success message
- [ ] Close modal and navigate to invoice (if generated)

**Component**:
```typescript
// apps/web-maintenance/src/components/MaintenanceJobCompletionModal.tsx

interface MaintenanceJobCompletionModalProps {
  job: MaintenanceJob;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function MaintenanceJobCompletionModal({
  job,
  isOpen,
  onClose,
  onComplete,
}: MaintenanceJobCompletionModalProps) {
  const [workPerformed, setWorkPerformed] = useState('');
  const [diagnosis, setDiagnosis] = useState(job.diagnosis || '');
  const [beforePhotoIds, setBeforePhotoIds] = useState<string[]>([]);
  const [afterPhotoIds, setAfterPhotoIds] = useState<string[]>([]);
  const [inProgressPhotoIds, setInProgressPhotoIds] = useState<string[]>([]);
  const [actualHoursWorked, setActualHoursWorked] = useState(0);
  const [actualPartsCost, setActualPartsCost] = useState(
    job.quote?.line_items.find(item => item.description.includes('Parts'))?.total || 0
  );
  const [generateInvoice, setGenerateInvoice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!workPerformed.trim()) {
      toast.error('Please describe the work performed');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await maintenanceJobsAPI.complete(job.id, {
        worker_id: job.assigned_worker_id!,
        work_performed: workPerformed,
        diagnosis,
        before_photo_ids: beforePhotoIds,
        after_photo_ids: afterPhotoIds,
        work_in_progress_photo_ids: inProgressPhotoIds,
        actual_hours_worked: actualHoursWorked,
        actual_parts_cost: actualPartsCost,
        generate_invoice: generateInvoice,
      });

      toast.success('Job marked as complete!');

      if (generateInvoice && response.invoice_id) {
        navigate(`/invoices/${response.invoice_id}`);
      } else {
        onComplete();
        onClose();
      }
    } catch (err: any) {
      toast.error('Failed to complete job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Complete Maintenance Job</h2>

        {/* Job Summary */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="font-semibold">{job.property?.property_name}</div>
          <div className="text-sm text-gray-600">{job.title}</div>
          <div className="text-sm text-gray-600">
            Quote Total: £{job.quote?.total.toFixed(2)}
          </div>
        </div>

        {/* Work Performed */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Work Performed *
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            value={workPerformed}
            onChange={(e) => setWorkPerformed(e.target.value)}
            placeholder="Describe the work completed..."
            required
          />
        </div>

        {/* Diagnosis/Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Diagnosis / Technical Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Any technical findings or recommendations..."
          />
        </div>

        {/* Photos */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Before Photos</label>
            <PhotoUpload
              propertyId={job.property_id}
              onUploadComplete={(photoId) => {
                setBeforePhotoIds([...beforePhotoIds, photoId]);
              }}
              maxPhotos={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Work in Progress
            </label>
            <PhotoUpload
              propertyId={job.property_id}
              onUploadComplete={(photoId) => {
                setInProgressPhotoIds([...inProgressPhotoIds, photoId]);
              }}
              maxPhotos={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">After Photos *</label>
            <PhotoUpload
              propertyId={job.property_id}
              onUploadComplete={(photoId) => {
                setAfterPhotoIds([...afterPhotoIds, photoId]);
              }}
              maxPhotos={5}
            />
          </div>
        </div>

        {/* Actual Costs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Actual Hours Worked
            </label>
            <input
              type="number"
              step="0.5"
              className="w-full px-3 py-2 border rounded-md"
              value={actualHoursWorked}
              onChange={(e) => setActualHoursWorked(parseFloat(e.target.value))}
            />
            <div className="text-xs text-gray-500 mt-1">
              Quoted: {job.quote?.line_items.find(item =>
                item.description.includes('Labor')
              )?.quantity || 0} hours
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Actual Parts Cost
            </label>
            <div className="flex gap-2 items-center">
              <span className="text-gray-500">£</span>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
                value={actualPartsCost}
                onChange={(e) => setActualPartsCost(parseFloat(e.target.value))}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Quoted: £{job.quote?.line_items.find(item =>
                item.description.includes('Parts')
              )?.total.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>

        {/* Generate Invoice */}
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
            disabled={isSubmitting || !workPerformed.trim()}
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

**Testing**:
- [ ] Modal opens from job details
- [ ] Job summary displays
- [ ] Work performed textarea required
- [ ] Can upload before/after/in-progress photos
- [ ] Actual hours/costs track variance from quote
- [ ] Generate invoice checkbox works
- [ ] Complete button validates work performed
- [ ] Success and navigates to invoice if generated
- [ ] Job status updates to COMPLETED

---

### M-302: Photo Upload Component
**Priority**: P0 (Critical)
**Estimate**: 1 point
**Status**: ⏭️ Ready

**Goal**: Build reusable photo upload component that uses existing PhotosService.

**(See STORY-302 in original plan - already detailed)**

---

### M-303: Invoice Generation from Maintenance Jobs
**Priority**: P0 (Critical)
**Estimate**: 4 points
**Status**: ⏭️ Ready

**Goal**: Auto-generate invoices from completed maintenance jobs using quote data.

**Acceptance Criteria**:
- [ ] `InvoiceService.generateFromMaintenanceJob()` method
- [ ] Use quote line items for invoice
- [ ] Adjust line items if actual costs differ from quote
- [ ] Calculate tax (20% VAT)
- [ ] Generate unique invoice number (INV-YYYY-XXXXX)
- [ ] Link invoice to maintenance job
- [ ] POST /api/invoices endpoint
- [ ] GET /api/invoices list endpoint
- [ ] PUT /api/invoices/:id/mark-paid endpoint
- [ ] Integrate with job completion

**(See STORY-303 in original plan for full implementation)**

---

### M-304: Customer Rating for Maintenance Jobs
**Priority**: P1 (Medium)
**Estimate**: 2 points
**Status**: ⏭️ Ready

**Goal**: Allow customers to rate completed maintenance jobs.

**(See STORY-304 in original plan for full implementation)**

---

## 🎯 Sprint Execution Order (Maintenance First)

### **Day 1: Contractor Scheduling Backend**
1. M-201: Contractor Assignment API (3 pts)
   - assignInternalContractor() method
   - assignExternalContractor() method
   - checkContractorAvailability() with conflict detection
   - PUT /api/maintenance-jobs/:id/assign
   - PUT /api/maintenance-jobs/:id/assign-external

### **Day 2: Contractor Scheduling Frontend**
2. M-202: Contractor Scheduling UI (3 pts)
   - ContractorSchedulingModal component
   - Date/time pickers
   - Contractor list (internal + external)
   - Availability indicators
   - Integration with MaintenanceJobDetails

### **Day 3: Job Completion**
3. M-302: Photo Upload Component (1 pt)
   - PhotoUpload.tsx with drag-and-drop
   - Uses existing /api/photos endpoint

4. M-301: Job Completion Modal (2 pts)
   - MaintenanceJobCompletionModal
   - Work performed, diagnosis, photos
   - Actual vs quoted cost tracking

### **Day 4: Invoice & Rating**
5. M-303: Invoice Generation (4 pts)
   - InvoiceService backend
   - generateFromMaintenanceJob()
   - API routes
   - Integration with job completion

6. M-304: Customer Rating (2 pts)
   - JobRatingWidget component
   - Customer portal integration

**Maintenance Complete!** ✅

---

## 🔄 Then Replicate to Cleaning (Days 5-6)

### **C-201: Worker Assignment for Cleaning** (2 pts)
Copy M-201 + M-202 patterns:
- Change "Contractor" → "Worker" terminology
- Filter: worker_type = CLEANER or BOTH
- No external contractors (internal only)
- Same scheduling modal (reuse component with props)
- Same conflict detection logic

### **C-301: Cleaning Job Completion** (1 pt)
Copy M-301 + M-302 patterns:
- Simpler form (no diagnosis, no parts cost)
- Same photo upload component
- Same invoice generation
- Same customer rating

---

## ✅ Definition of Done (Maintenance)

**For Maintenance Workflow:**
- [ ] Can create maintenance job from guest issue or customer request
- [ ] Can submit quote with parts/labor breakdown
- [ ] Customer can approve/decline quote
- [ ] Can schedule and assign contractor (internal or external)
- [ ] System prevents double-booking internal contractors
- [ ] Contractor can mark job complete with photos and notes
- [ ] Invoice auto-generated from quote
- [ ] Customer can rate completed job
- [ ] End-to-end flow tested: Issue → Quote → Approve → Schedule → Complete → Invoice → Rate

**Then Clean Code for Replication:**
- [ ] Identify reusable components (scheduling modal, photo upload, completion modal)
- [ ] Extract shared logic to utilities
- [ ] Document patterns for cleaning replication

---

## 🎉 Success Metrics

**After Maintenance Completion:**
- Complete end-to-end maintenance workflow functional
- Zero double-booking for internal contractors
- External contractors can be assigned
- Invoices auto-generated from completed jobs
- Customers can provide feedback
- Ready to replicate patterns to cleaning

**After Cleaning Replication:**
- Both maintenance and cleaning workflows complete
- Shared components reused (75% code reuse target)
- Consistent UX across both job types
- Both workflows production-ready

---

*Sprint plan created: 2025-11-02*
*Strategy: Maintenance First → Replicate to Cleaning* 🚀
