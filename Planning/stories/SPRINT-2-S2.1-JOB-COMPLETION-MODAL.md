# S2.1: Job Completion Modal

**Sprint**: Sprint 2 - Worker App Completion
**Story Points**: 3
**Priority**: CRITICAL
**Estimated Time**: 1 day
**Status**: ✅ COMPLETED (Pre-existing implementation)

---

## User Story

**As a** worker (cleaner)
**I want** to complete jobs with a structured checklist workflow
**So that** I can mark jobs as done and record what tasks were completed

---

## Description

Create a comprehensive job completion modal that allows workers to complete cleaning jobs with checklist verification. This is a **critical missing feature** - workers currently cannot complete jobs in the web-worker app.

The modal must:
- Display the job's checklist items with checkboxes
- Require all items to be checked before completion
- Record completion timestamp
- Update job status to COMPLETED
- Create CleaningJobTimesheet record automatically
- Handle both CLEANER and MAINTENANCE worker types (foundation for future)

---

## Acceptance Criteria

### Functional Requirements

**Modal Display**:
- [ ] Modal opens when worker clicks "Complete Job" button on job details page
- [ ] Modal title shows job name/property address
- [ ] Modal displays all checklist items from the job
- [ ] Each checklist item has a checkbox
- [ ] Checklist items grouped by room (if applicable)
- [ ] "Complete Job" button at bottom (initially disabled)

**Checklist Interaction**:
- [ ] Worker can check/uncheck each item
- [ ] Visual indicator when item is checked (checkmark, strikethrough, color change)
- [ ] Progress indicator showing "X of Y items completed"
- [ ] "Complete Job" button enables ONLY when all items checked
- [ ] Warning message if trying to close modal with unchecked items

**Job Completion**:
- [ ] When "Complete Job" clicked, call `PUT /api/cleaning-jobs/:id/complete`
- [ ] Show loading spinner during API call
- [ ] Record completion timestamp (completed_at)
- [ ] Update job status to COMPLETED
- [ ] Auto-create CleaningJobTimesheet record with start/end times
- [ ] Show success toast: "Job completed successfully!"
- [ ] Redirect to dashboard or job list after completion

**Error Handling**:
- [ ] If API call fails, show error toast: "Failed to complete job. Please try again."
- [ ] Keep modal open on error
- [ ] Allow retry

**Worker Type Support**:
- [ ] Works for CLEANER worker type (primary)
- [ ] Foundation in place for MAINTENANCE worker type (tested with feature flag)

### Non-Functional Requirements

**Performance**:
- [ ] Modal renders in <500ms
- [ ] Checklist with 50+ items renders smoothly
- [ ] API call completes in <1 second

**Accessibility**:
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces checklist items and completion status
- [ ] Focus trapped within modal when open
- [ ] Escape key closes modal (with confirmation if items unchecked)

**Mobile Responsive**:
- [ ] Modal fills screen on mobile devices
- [ ] Checklist scrollable on small screens
- [ ] Touch targets minimum 44x44px
- [ ] Tested on iOS Safari and Android Chrome

---

## Technical Specification

### Component Structure

```typescript
// apps/web-worker/src/components/CompleteJobModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Checkbox, Toast } from '@rightfit/ui-core';
import { api } from '../lib/api';

interface CompleteJobModalProps {
  job: CleaningJob;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function CompleteJobModal({ job, isOpen, onClose, onComplete }: CompleteJobModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const totalItems = job.checklist?.items?.length || 0;
  const completedItems = checkedItems.size;
  const allItemsChecked = completedItems === totalItems && totalItems > 0;

  const handleItemToggle = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const handleComplete = async () => {
    if (!allItemsChecked) return;

    setLoading(true);
    try {
      await api.put(`/cleaning-jobs/${job.id}/complete`, {
        completed_checklist_items: Array.from(checkedItems),
        completed_at: new Date().toISOString(),
      });

      Toast.success('Job completed successfully!');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to complete job:', error);
      Toast.error('Failed to complete job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complete: ${job.property.address}`}>
      <div className="complete-job-modal">
        {/* Progress Indicator */}
        <div className="progress-section">
          <p className="progress-text">
            {completedItems} of {totalItems} items completed
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(completedItems / totalItems) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="checklist-section">
          {job.checklist?.items?.map((item) => (
            <div key={item.id} className="checklist-item">
              <Checkbox
                checked={checkedItems.has(item.id)}
                onChange={() => handleItemToggle(item.id)}
                label={item.description}
              />
              {item.room && <span className="room-label">{item.room}</span>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={!allItemsChecked || loading}
            loading={loading}
          >
            Complete Job
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### API Endpoint

```typescript
// apps/api/src/routes/cleaning-jobs.ts

// PUT /api/cleaning-jobs/:id/complete
router.put('/:id/complete', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { completed_checklist_items, completed_at } = req.body;
  const workerId = req.user.worker_id;

  try {
    // Verify worker is assigned to this job
    const job = await prisma.cleaningJob.findFirst({
      where: {
        id,
        assigned_worker_id: workerId,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or not assigned to you' });
    }

    // Update job status
    const updatedJob = await prisma.cleaningJob.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completed_at: new Date(completed_at),
        checklist_completed_items: completed_checklist_items,
      },
    });

    // Create timesheet record (auto-calculate hours from scheduled time)
    const scheduledStartTime = new Date(job.scheduled_date);
    const completedTime = new Date(completed_at);
    const hoursWorked = (completedTime.getTime() - scheduledStartTime.getTime()) / (1000 * 60 * 60);

    await prisma.cleaningJobTimesheet.create({
      data: {
        cleaning_job_id: id,
        worker_id: workerId,
        start_time: scheduledStartTime,
        end_time: completedTime,
        hours_worked: Math.max(0.5, Math.round(hoursWorked * 2) / 2), // Round to nearest 0.5 hour, minimum 0.5
        status: 'APPROVED', // Auto-approve for MVP
      },
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ error: 'Failed to complete job' });
  }
});
```

### Type Definitions

```typescript
// apps/web-worker/src/types/cleaning-job.ts

export interface CleaningJob {
  id: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduled_date: string;
  completed_at?: string;
  property: {
    id: string;
    address: string;
  };
  customer: {
    id: string;
    first_name: string;
    last_name: string;
  };
  assigned_worker?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  checklist?: {
    id: string;
    name: string;
    items: ChecklistItem[];
  };
  checklist_completed_items?: string[];
}

export interface ChecklistItem {
  id: string;
  description: string;
  room?: string;
  order: number;
}

export interface CleaningJobTimesheet {
  id: string;
  cleaning_job_id: string;
  worker_id: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

---

## Implementation Steps

### Step 1: Create CompleteJobModal Component (2 hours)

```bash
# Create component file
touch apps/web-worker/src/components/CompleteJobModal.tsx

# Create styles
touch apps/web-worker/src/components/CompleteJobModal.css
```

**Component Implementation**:
1. Create modal structure with checklist
2. Add state management for checked items
3. Implement progress tracking
4. Add completion button logic
5. Style with gradient styling to match component library

### Step 2: Implement API Endpoint (1.5 hours)

**Backend Changes**:
1. Add `PUT /api/cleaning-jobs/:id/complete` route
2. Verify worker authorization (only assigned worker can complete)
3. Update job status to COMPLETED
4. Save completed_at timestamp
5. Auto-create CleaningJobTimesheet record
6. Calculate hours_worked from scheduled time to completion time

**Database Updates** (if needed):
```prisma
model CleaningJob {
  // ... existing fields
  completed_at              DateTime?
  checklist_completed_items String[]  @default([])
}
```

### Step 3: Integrate Modal into Job Details Page (1.5 hours)

**Update JobDetails.tsx**:
```typescript
import { CompleteJobModal } from '../components/CompleteJobModal';

export function JobDetails() {
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // ... existing code

  return (
    <div className="job-details-page">
      {/* Job details */}

      {job.status === 'SCHEDULED' && (
        <Button onClick={() => setShowCompleteModal(true)}>
          Complete Job
        </Button>
      )}

      <CompleteJobModal
        job={job}
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onComplete={() => {
          // Refresh job data or redirect to dashboard
          navigate('/dashboard');
        }}
      />
    </div>
  );
}
```

### Step 4: Testing (2 hours)

**Manual Testing**:
1. Create test job with checklist (5-10 items)
2. Assign to test worker
3. Login as worker in web-worker app
4. Navigate to job details
5. Click "Complete Job"
6. Test checklist interaction:
   - Check/uncheck items
   - Verify progress indicator updates
   - Verify button disabled until all items checked
7. Complete job
8. Verify job status updated to COMPLETED
9. Verify CleaningJobTimesheet created
10. Test on mobile device (iOS/Android)

**Edge Cases**:
- Job with no checklist (should show error or different UI)
- Job already completed (button should not show)
- API failure (error handling)
- Slow network (loading state)
- Modal close with unchecked items (confirmation dialog)

### Step 5: Bug Fixes & Polish (1 hour)

- Fix any issues found during testing
- Improve loading states
- Add micro-interactions (animations)
- Optimize performance

---

## Definition of Done

- [ ] CompleteJobModal component created and styled
- [ ] API endpoint implemented and tested
- [ ] Modal integrated into job details page
- [ ] All checklist items can be checked/unchecked
- [ ] Progress indicator updates correctly
- [ ] Job status updates to COMPLETED
- [ ] CleaningJobTimesheet auto-created with calculated hours
- [ ] Success/error toasts displayed
- [ ] Works on mobile devices (tested on 2+ devices)
- [ ] Keyboard navigation works
- [ ] All acceptance criteria met
- [ ] Code reviewed
- [ ] Committed to Git with message: "feat(web-worker): implement job completion modal with checklist"

---

## Testing Instructions

### Setup Test Data

```bash
# Create test cleaning job with checklist
curl -X POST http://localhost:3001/api/cleaning-jobs \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_provider_id": "sp-cleaning-test",
    "property_id": "prop-test-1",
    "customer_id": "cust-test-1",
    "scheduled_date": "2025-11-10T10:00:00Z",
    "assigned_worker_id": "worker-maria-garcia",
    "checklist": {
      "name": "Standard Clean",
      "items": [
        { "id": "item-1", "description": "Vacuum all rooms", "room": "Living Room" },
        { "id": "item-2", "description": "Dust surfaces", "room": "Living Room" },
        { "id": "item-3", "description": "Clean kitchen counters", "room": "Kitchen" },
        { "id": "item-4", "description": "Scrub toilet and sink", "room": "Bathroom" },
        { "id": "item-5", "description": "Make bed", "room": "Bedroom" }
      ]
    }
  }'
```

### Manual Test Steps

**Test 1: Complete Job Happy Path**
1. Login as worker: `worker1@cleaningco.test` / `TestPassword123!`
2. Navigate to "My Jobs"
3. Click test job
4. Click "Complete Job" button
5. Modal opens with 5 checklist items
6. Progress shows "0 of 5 items completed"
7. Check item 1 → Progress updates to "1 of 5"
8. Check items 2-4
9. "Complete Job" button still disabled
10. Check item 5
11. "Complete Job" button enabled
12. Click "Complete Job"
13. Loading spinner shows
14. Success toast: "Job completed successfully!"
15. Redirected to dashboard
16. Job status COMPLETED

**Expected**: ✅ All steps pass

**Test 2: Incomplete Checklist**
1. Open modal
2. Check 4 of 5 items
3. Try clicking "Complete Job"
4. Button is disabled
5. Try closing modal
6. Warning: "You have unchecked items. Are you sure you want to close?"

**Expected**: ✅ Cannot complete with unchecked items

**Test 3: Mobile Responsive**
1. Open on mobile device (iPhone)
2. Modal fills screen
3. Checklist scrollable
4. Checkboxes easy to tap (44x44px minimum)
5. Complete job successfully

**Expected**: ✅ Works on mobile

---

## Dependencies

**Depends On**:
- Sprint 1 (component library - @rightfit/ui-core)
- Existing CleaningJob model and API
- User authentication (JWT)

**Blocks**:
- S2.2 (Photo Upload) - Cannot complete without this story
- S2.5 (Testing & Polish) - Needs complete workflow

---

## Notes

- This is the **most critical story** in Sprint 2 - worker app is unusable without it
- Focus on reliability and error handling - network failures common on mobile
- Keep modal simple for MVP - advanced features (partial completion, notes) deferred
- CleaningJobTimesheet auto-creation simplifies workflow (no separate timesheet entry)
- Calculated hours from scheduled time (not actual start time) - acceptable for MVP, can improve later with actual time tracking

---

## Resources

- [Modal Component Docs](../../packages/ui-core/src/components/Modal/README.md)
- [Checkbox Component Docs](../../packages/ui-core/src/components/Checkbox/README.md)
- [Worker App Figma](https://figma.com/...) (if exists)
- [CleaningJob API Docs](http://localhost:3001/api/docs#/CleaningJobs)

---

**Created**: November 8, 2025
**Last Updated**: November 8, 2025
**Assigned To**: Frontend Developer
**Sprint**: Sprint 2 - Worker App Completion
