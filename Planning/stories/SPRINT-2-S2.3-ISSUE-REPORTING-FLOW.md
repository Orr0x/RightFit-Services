# S2.3: Issue Reporting Flow

**Sprint**: Sprint 2 - Worker App Completion
**Story Points**: 4
**Priority**: HIGH
**Estimated Time**: 1.5 days
**Status**: ✅ COMPLETED (Pre-existing implementation)

---

## User Story

**As a** worker (cleaner)
**I want** to report maintenance issues found during cleaning jobs
**So that** customers are informed and repairs can be scheduled

---

## Description

Create a comprehensive issue reporting workflow that allows workers to:
- Report maintenance issues discovered while cleaning (e.g., broken appliance, leaky faucet)
- Attach photos to document the issue
- Categorize issues by type (plumbing, electrical, appliances, etc.)
- Submit issues that route to:
  1. Customer portal (for customer awareness/approval)
  2. Maintenance provider (if customer has maintenance module enabled)

This is a **critical cross-product workflow** that connects Cleaning SaaS → Maintenance SaaS.

---

## Acceptance Criteria

### Functional Requirements

**Issue Reporting Modal**:
- [ ] "Report Issue" button visible during job completion workflow
- [ ] Modal opens with issue reporting form
- [ ] Form fields:
  - Issue title (required, max 100 chars)
  - Issue description (required, max 500 chars)
  - Issue category (dropdown: Plumbing, Electrical, Appliances, Structural, Other)
  - Priority (dropdown: Low, Medium, High, Urgent)
  - Location/Room (text input, optional)
  - Photos (0-5 photos, uses PhotoUpload component from S2.2)
- [ ] Submit button (disabled until title and description filled)

**Issue Submission**:
- [ ] Call `POST /api/worker-issue-reports`
- [ ] Include:
  - cleaning_job_id
  - worker_id (from auth)
  - property_id (from job)
  - customer_id (from job)
  - issue details (title, description, category, priority, room)
  - photo URLs (after upload)
- [ ] Show loading spinner during submission
- [ ] On success:
  - Show success toast: "Issue reported successfully. Customer will be notified."
  - Close modal
  - Optionally refresh job details to show issue badge

**Customer Notification Workflow**:
- [ ] Issue appears in web-customer portal under "Pending Issues"
- [ ] Customer can:
  - View issue details and photos
  - Approve (escalate to maintenance provider)
  - Dismiss (mark as minor/resolved)
  - Add notes
- [ ] Email notification sent to customer (optional for MVP)

**Maintenance Provider Routing** (if enabled):
- [ ] If customer has `has_maintenance_module: true`:
  - Issue auto-creates MaintenanceQuoteRequest
  - Maintenance provider receives notification
  - Maintenance provider can generate quote
- [ ] If customer has no maintenance module:
  - Issue stays in customer portal only
  - Customer handles externally

**Issue List View (Worker App)**:
- [ ] Worker can view their reported issues
- [ ] Navigate to "My Issues" from sidebar
- [ ] List shows:
  - Issue title
  - Property address
  - Status (Pending, Approved, Dismissed, Completed)
  - Date reported
- [ ] Click issue to view details (read-only)

### Non-Functional Requirements

**Data Validation**:
- [ ] Title: Required, 1-100 chars
- [ ] Description: Required, 10-500 chars
- [ ] Category: Required, from enum
- [ ] Priority: Required, from enum
- [ ] Photos: Optional, max 5, each <2MB

**Performance**:
- [ ] Issue submission completes in <2 seconds
- [ ] Photos upload before issue submission
- [ ] Form responsive (no lag when typing)

**Mobile Optimization**:
- [ ] Modal fits mobile screen (scrollable)
- [ ] Camera integration works for photos
- [ ] Form inputs large enough for touch (44x44px)
- [ ] Tested on iOS Safari and Android Chrome

**Error Handling**:
- [ ] If submission fails: "Failed to report issue. Please try again."
- [ ] If photo upload fails: "Photo upload failed. Remove photo and try again."
- [ ] If validation fails: Field-level error messages
- [ ] Network timeout: Retry mechanism

---

## Technical Specification

### Component Structure

```typescript
// apps/web-worker/src/components/ReportIssueModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Input, Textarea, Select } from '@rightfit/ui-core';
import { PhotoUpload } from './PhotoUpload';
import { api } from '../lib/api';

interface ReportIssueModalProps {
  job: CleaningJob;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const ISSUE_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'structural', label: 'Structural' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low - Can wait weeks' },
  { value: 'medium', label: 'Medium - Should fix soon' },
  { value: 'high', label: 'High - Fix this week' },
  { value: 'urgent', label: 'Urgent - Fix immediately' },
];

export function ReportIssueModal({ job, isOpen, onClose, onSubmit }: ReportIssueModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    room: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be under 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be under 500 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/worker-issue-reports', {
        cleaning_job_id: job.id,
        property_id: job.property.id,
        customer_id: job.customer.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        room: formData.room || null,
        photo_urls: photos,
      });

      Toast.success('Issue reported successfully. Customer will be notified.');
      onSubmit();
      onClose();

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        room: '',
      });
      setPhotos([]);
    } catch (error) {
      console.error('Failed to report issue:', error);
      Toast.error('Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (uploadedPhotos: Array<{ url?: string }>) => {
    const photoUrls = uploadedPhotos
      .filter((p) => p.url)
      .map((p) => p.url!);
    setPhotos(photoUrls);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Maintenance Issue"
      size="large"
    >
      <div className="report-issue-form">
        {/* Issue Title */}
        <Input
          label="Issue Title"
          placeholder="e.g., Leaking kitchen faucet"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          required
        />

        {/* Issue Category */}
        <Select
          label="Category"
          options={ISSUE_CATEGORIES}
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          error={errors.category}
          required
        />

        {/* Priority */}
        <Select
          label="Priority"
          options={PRIORITIES}
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value })}
        />

        {/* Room/Location */}
        <Input
          label="Room / Location (Optional)"
          placeholder="e.g., Master Bathroom"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe the issue in detail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
          rows={4}
          required
        />

        {/* Photo Upload */}
        <div className="photo-section">
          <label className="form-label">Photos (Optional)</label>
          <PhotoUpload
            jobId={job.id}
            onPhotosChange={handlePhotoChange}
            maxPhotos={5}
            requireBefore={false}
          />
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.description || !formData.category || loading}
            loading={loading}
          >
            Report Issue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### API Endpoint

```typescript
// apps/api/src/routes/worker-issue-reports.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /api/worker-issue-reports
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      cleaning_job_id,
      property_id,
      customer_id,
      title,
      description,
      category,
      priority,
      room,
      photo_urls,
    } = req.body;

    const workerId = req.user.worker_id;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create issue report
    const issue = await prisma.workerIssueReport.create({
      data: {
        cleaning_job_id,
        property_id,
        customer_id,
        reported_by_worker_id: workerId,
        title,
        description,
        category,
        priority: priority || 'medium',
        room,
        status: 'PENDING',
        reported_at: new Date(),
      },
    });

    // Link photos to issue
    if (photo_urls && photo_urls.length > 0) {
      await Promise.all(
        photo_urls.map((url: string) =>
          prisma.photo.create({
            data: {
              url,
              filename: url.split('/').pop() || 'photo.jpg',
              worker_issue_report_id: issue.id,
              uploaded_by_user_id: req.user.id,
            },
          })
        )
      );
    }

    // Check if customer has maintenance module
    const customer = await prisma.customer.findUnique({
      where: { id: customer_id },
      include: {
        service_provider: {
          include: {
            tenant: true,
          },
        },
      },
    });

    // If customer has maintenance module, create quote request
    if (customer?.service_provider.tenant.has_maintenance_module) {
      await prisma.maintenanceQuoteRequest.create({
        data: {
          customer_id,
          property_id,
          worker_issue_report_id: issue.id,
          title,
          description,
          priority,
          status: 'PENDING',
          requested_at: new Date(),
        },
      });
    }

    // TODO: Send email notification to customer (optional for MVP)

    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue report:', error);
    res.status(500).json({ error: 'Failed to create issue report' });
  }
});

// GET /api/worker-issue-reports (worker's issues)
router.get('/', requireAuth, async (req, res) => {
  try {
    const workerId = req.user.worker_id;

    const issues = await prisma.workerIssueReport.findMany({
      where: {
        reported_by_worker_id: workerId,
      },
      include: {
        property: {
          select: {
            address: true,
          },
        },
        photos: true,
      },
      orderBy: {
        reported_at: 'desc',
      },
    });

    res.json(issues);
  } catch (error) {
    console.error('Error fetching issue reports:', error);
    res.status(500).json({ error: 'Failed to fetch issue reports' });
  }
});

// GET /api/worker-issue-reports/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const workerId = req.user.worker_id;

    const issue = await prisma.workerIssueReport.findFirst({
      where: {
        id,
        reported_by_worker_id: workerId,
      },
      include: {
        property: true,
        customer: true,
        photos: true,
        cleaning_job: {
          select: {
            scheduled_date: true,
          },
        },
      },
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

export default router;
```

### Database Schema Updates

```prisma
// packages/database/prisma/schema.prisma

model WorkerIssueReport {
  id                    String   @id @default(uuid())
  cleaning_job_id       String?
  maintenance_job_id    String?
  property_id           String
  customer_id           String
  reported_by_worker_id String

  title                 String
  description           String
  category              String   // plumbing, electrical, appliances, structural, hvac, other
  priority              String   // low, medium, high, urgent
  room                  String?
  status                String   // PENDING, APPROVED, DISMISSED, IN_PROGRESS, COMPLETED

  reported_at           DateTime @default(now())
  resolved_at           DateTime?

  cleaning_job          CleaningJob?      @relation(fields: [cleaning_job_id], references: [id])
  maintenance_job       MaintenanceJob?   @relation(fields: [maintenance_job_id], references: [id])
  property              CustomerProperty  @relation(fields: [property_id], references: [id])
  customer              Customer          @relation(fields: [customer_id], references: [id])
  reported_by           Worker            @relation(fields: [reported_by_worker_id], references: [id])

  photos                Photo[]
  maintenance_quote     MaintenanceQuoteRequest?

  @@index([cleaning_job_id])
  @@index([property_id])
  @@index([customer_id])
  @@index([reported_by_worker_id])
  @@index([status])
}

model MaintenanceQuoteRequest {
  id                     String   @id @default(uuid())
  customer_id            String
  property_id            String
  worker_issue_report_id String?  @unique

  title                  String
  description            String
  priority               String
  status                 String   // PENDING, QUOTED, APPROVED, DECLINED

  requested_at           DateTime @default(now())
  quoted_at              DateTime?
  approved_at            DateTime?

  customer               Customer          @relation(fields: [customer_id], references: [id])
  property               CustomerProperty  @relation(fields: [property_id], references: [id])
  worker_issue_report    WorkerIssueReport? @relation(fields: [worker_issue_report_id], references: [id])

  @@index([customer_id])
  @@index([property_id])
  @@index([status])
}
```

---

## Implementation Steps

### Step 1: Create ReportIssueModal Component (2 hours)

1. Create modal component structure
2. Add form fields with validation
3. Integrate PhotoUpload component (from S2.2)
4. Implement form submission
5. Add error handling
6. Style component

### Step 2: Implement API Endpoints (2 hours)

1. Create `/api/worker-issue-reports` route file
2. Implement POST endpoint (create issue)
3. Implement GET endpoints (list, detail)
4. Add photo linking logic
5. Add maintenance module check and quote request creation
6. Add validation

### Step 3: Database Migration (30 minutes)

```bash
cd packages/database
npx prisma migrate dev --name add_worker_issue_reports
npx prisma generate
```

### Step 4: Integrate into Job Completion Flow (1 hour)

**Update CompleteJobModal** (from S2.1):
```typescript
export function CompleteJobModal({ job, isOpen, onClose, onComplete }) {
  const [showIssueModal, setShowIssueModal] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Complete Job">
        {/* Existing checklist */}

        {/* Add "Report Issue" button */}
        <Button
          variant="secondary"
          onClick={() => setShowIssueModal(true)}
          icon="⚠️"
        >
          Report Maintenance Issue
        </Button>

        {/* Complete button */}
      </Modal>

      <ReportIssueModal
        job={job}
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSubmit={() => {
          Toast.success('Issue reported');
          setShowIssueModal(false);
        }}
      />
    </>
  );
}
```

### Step 5: Create Issue List View (1.5 hours)

```typescript
// apps/web-worker/src/pages/MyIssues.tsx
export function MyIssues() {
  const [issues, setIssues] = useState<WorkerIssueReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const response = await api.get('/worker-issue-reports');
      setIssues(response.data);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="my-issues-page">
      <h1>My Reported Issues</h1>
      {issues.length === 0 ? (
        <EmptyState title="No issues reported" description="Report issues found during cleaning jobs" />
      ) : (
        <div className="issues-grid">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={() => navigate(`/issues/${issue.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 6: Testing (2 hours)

**Test End-to-End Workflow**:
1. Worker completes job
2. Clicks "Report Issue"
3. Fills form with title, description, category
4. Uploads 2 photos
5. Submits issue
6. Issue appears in customer portal
7. Customer approves issue
8. Maintenance provider receives quote request (if module enabled)

**Test Edge Cases**:
- Submit without required fields (validation)
- Submit with 10-char description (min length validation)
- Upload 6 photos (max 5 validation)
- Network failure during submission (retry)

---

## Definition of Done

- [ ] ReportIssueModal component created and styled
- [ ] Form validation works correctly
- [ ] Photo upload integrated (reuses S2.2 component)
- [ ] API endpoints implemented (POST, GET list, GET detail)
- [ ] Database migration applied
- [ ] Issue appears in customer portal after submission
- [ ] Maintenance quote request created (if module enabled)
- [ ] Issue list view shows worker's reported issues
- [ ] Tested end-to-end workflow
- [ ] Tested on mobile devices
- [ ] All acceptance criteria met
- [ ] Code reviewed
- [ ] Committed to Git with message: "feat(web-worker): implement issue reporting workflow with customer routing"

---

## Dependencies

**Depends On**:
- S2.2 (Photo Upload Component) - Reuses PhotoUpload
- Sprint 1 (component library)
- Existing WorkerIssueReport model (partially implemented)

**Blocks**:
- Customer portal issue approval workflow (deferred to Sprint 6)
- Maintenance provider quote workflow (deferred to Sprint 5)

---

## Notes

- This is a **critical cross-product workflow** - connects Cleaning → Customer → Maintenance
- For MVP, email notification optional (can be added later)
- Customer portal must display pending issues (basic implementation sufficient for MVP)
- Maintenance module flag (`has_maintenance_module`) determines routing
- Issue categories should match maintenance job categories for consistency
- Priority field helps customers triage issues

---

## Resources

- [WorkerIssueReport Schema](../../packages/database/prisma/schema.prisma)
- [Customer Portal Issue View](../../apps/web-customer/src/pages/Issues.tsx)
- [Maintenance Quote Request Flow](../../docs/workflows/maintenance-quotes.md)

---

**Created**: November 8, 2025
**Last Updated**: November 8, 2025
**Assigned To**: Full-stack Developer
**Sprint**: Sprint 2 - Worker App Completion
