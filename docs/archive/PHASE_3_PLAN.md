# Phase 3: Cleaning & Maintenance Job Management

**Status:** Quote Workflow Complete ✅ | Cleanup Sprint Complete ✅ | Worker Assignment Next 🚀
**Started:** 2025-11-02
**Last Updated:** 2025-11-02 (After Cleanup Sprint 1)

---

## 🎯 Phase 3 Objectives

Build the core job management systems for both Cleaning and Maintenance services, enabling service providers to:
1. ✅ Create, track, and complete cleaning jobs (CRUD complete)
2. ✅ Create, track, and complete maintenance jobs (CRUD complete)
3. ⏭️ Assign workers to jobs (next priority)
4. ✅ Generate quotes for maintenance work (COMPLETE & TESTED)
5. ⏭️ Track job history and performance (partial)

---

## 📋 Phase 3 Parts

### Part 1: Database Schema (Jobs & Quotes) ✅ COMPLETE
**Status:** Complete

Tables created:
- [x] CleaningJob
- [x] CleaningChecklistItem
- [x] MaintenanceJob
- [x] Quote
- [x] Invoice (schema ready, not yet used)
- [x] Worker
- [x] ExternalContractor
- [x] Service

### Part 2: Cleaning Services Dashboard ✅ PARTIAL
**Status:** Dashboard Built, Job Details Pending

**What exists:**
- web-cleaning app (port 5174) with full structure
- [x] CleaningDashboard.tsx - Overview of all cleaning jobs
- [x] API: CleaningJobsService.ts - Full CRUD
- [x] API routes: /api/cleaning-jobs/*

**What needs to be built:**
- [ ] CleaningJobDetails.tsx - View job details page
- [ ] WorkerAssignment.tsx - Assign cleaners to jobs
- [ ] ChecklistTemplates.tsx - Manage cleaning checklists
- [ ] Job completion workflow

### Part 3: Maintenance Services Dashboard ✅ QUOTE WORKFLOW COMPLETE
**Status:** Quote Workflow Complete & Tested

**What exists:**
- web-maintenance app (port 5175) with full structure
- [x] MaintenanceDashboard.tsx - Overview of all maintenance jobs with tabs
- [x] MaintenanceJobDetails.tsx - View job details with quote submission form
- [x] Quote submission - Parts cost + labor cost breakdown
- [x] Job decline functionality
- [x] API: MaintenanceJobsService.ts - Full CRUD + quote submission
- [x] API routes: /api/maintenance-jobs/* - Including submit-quote and decline
- [x] Customer Portal: QuoteApproval.tsx - Approve/decline quotes
- [x] End-to-end workflow tested: Guest issue → Customer submit → Quote → Approval

**What needs to be built:**
- [ ] WorkerAssignment.tsx - Assign technicians to jobs
- [ ] Job scheduling after quote approval
- [ ] Job completion workflow with photos
- [ ] CrossSellWorkflow.tsx - Upsell maintenance when creating cleaning jobs

### Part 4: Mobile Worker Apps
**Status:** Future (not in scope for initial Phase 3)

This will be built later as a React Native app for cleaning/maintenance workers in the field.

---

## 🗄️ Database Schema Design

### CleaningJob Table
```prisma
model CleaningJob {
  id                  String   @id @default(uuid())
  service_provider_id String
  customer_id         String
  property_id         String
  scheduled_date      DateTime
  status              String   // 'scheduled', 'in_progress', 'completed', 'cancelled'
  assigned_worker_id  String?
  checklist_template_id String?
  notes               String?
  before_photos       Json?
  after_photos        Json?
  customer_rating     Int?
  customer_feedback   String?
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  completed_at        DateTime?

  service_provider    ServiceProvider @relation(fields: [service_provider_id], references: [id])
  customer            Customer        @relation(fields: [customer_id], references: [id])
  property            CustomerProperty @relation(fields: [property_id], references: [id])
  checklist_items     CleaningChecklistItem[]
}

model CleaningChecklistItem {
  id             String   @id @default(uuid())
  cleaning_job_id String
  item_name      String
  completed      Boolean  @default(false)
  notes          String?
  photo_url      String?

  cleaning_job   CleaningJob @relation(fields: [cleaning_job_id], references: [id])
}
```

### MaintenanceJob Table
```prisma
model MaintenanceJob {
  id                  String   @id @default(uuid())
  service_provider_id String
  customer_id         String
  property_id         String
  issue_category      String   // 'plumbing', 'electrical', 'hvac', etc.
  priority            String   // 'low', 'medium', 'high', 'critical'
  scheduled_date      DateTime?
  status              String   // 'quote_requested', 'quoted', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled'
  assigned_worker_id  String?
  description         String
  diagnosis           String?
  work_performed      String?
  before_photos       Json?
  after_photos        Json?
  customer_rating     Int?
  customer_feedback   String?
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  completed_at        DateTime?
  guest_issue_id      String?  // Link to GuestIssue if created from tablet

  service_provider    ServiceProvider @relation(fields: [service_provider_id], references: [id])
  customer            Customer        @relation(fields: [customer_id], references: [id])
  property            CustomerProperty @relation(fields: [property_id], references: [id])
  quote               Quote?
  invoice             Invoice?
}

model Quote {
  id                  String   @id @default(uuid())
  maintenance_job_id  String   @unique
  line_items          Json     // Array of { description, quantity, unit_price }
  subtotal            Float
  tax                 Float
  total               Float
  status              String   // 'pending', 'approved', 'declined', 'expired'
  valid_until         DateTime
  approved_at         DateTime?
  created_at          DateTime @default(now())

  maintenance_job     MaintenanceJob @relation(fields: [maintenance_job_id], references: [id])
}

model Invoice {
  id                  String   @id @default(uuid())
  maintenance_job_id  String?  @unique
  cleaning_job_id     String?  @unique
  customer_id         String
  line_items          Json     // Array of { description, quantity, unit_price }
  subtotal            Float
  tax                 Float
  total               Float
  status              String   // 'pending', 'paid', 'overdue', 'cancelled'
  issued_at           DateTime @default(now())
  due_at              DateTime
  paid_at             DateTime?

  customer            Customer @relation(fields: [customer_id], references: [id])
}
```

---

## 🎯 Implementation Order

### Week 1: Database & Cleaning Jobs
**Day 1:** ✅ COMPLETE
- [x] Create database schema (CleaningJob, MaintenanceJob, Quote, Invoice)
- [x] Run migration
- [x] Create CleaningJobService.ts
- [x] Create cleaning job API routes

**Day 2:** ✅ COMPLETE
- [x] CleaningDashboard.tsx (overview with stats)
- [x] CleaningJobList.tsx (table with filters - integrated into dashboard)

**Day 3:** ⏭️ NEXT PRIORITY
- [ ] CleaningJobForm.tsx (create/edit jobs)
- [ ] CleaningJobDetails.tsx (view details)

**Day 4:** ⏭️ NEXT PRIORITY
- [ ] WorkerAssignment component
- [ ] Checklist templates management

### Week 2: Maintenance Jobs & Quotes ✅ COMPLETE
**Day 5:** ✅ COMPLETE
- [x] Create MaintenanceJobService.ts
- [x] Create maintenance job API routes
- [x] MaintenanceDashboard.tsx (overview with stats)

**Day 6:** ✅ COMPLETE
- [x] MaintenanceJobList.tsx (table with filters - integrated into dashboard tabs)
- [x] MaintenanceJobForm.tsx (create/edit jobs - integrated into dashboard)

**Day 7:** ✅ COMPLETE
- [x] MaintenanceJobDetails.tsx (view details)
- [x] QuoteGenerator.tsx (generate quotes - integrated into job details)

**Day 8:** ✅ QUOTE WORKFLOW COMPLETE, INVOICE PENDING
- [x] Quote approval workflow (tested end-to-end)
- [ ] Invoice generation (schema ready, not implemented)
- [ ] Cross-sell workflow

### Week 3: Polish & Integration
**Day 9-10:** ✅ PARTIAL
- [x] Integration with Customer Portal (show jobs in history)
- [x] Integration with Guest Tablet (auto-create maintenance jobs from issues)
- [x] Testing across all apps (quote workflow tested end-to-end)
- [ ] Photo upload functionality
- [x] Mobile responsiveness (all apps responsive)

---

## 🎨 UI/UX Patterns to Follow

### Dashboard Pattern (Both Cleaning & Maintenance)
- Top stats cards (Today's Jobs, This Week, This Month, Total Revenue)
- Quick actions (Create Job, View Schedule, Assign Worker)
- Recent jobs table
- Calendar view of scheduled jobs
- Performance metrics (completion rate, average rating)

### Job Management Pattern
- List view with filters (status, date range, property, customer)
- Kanban board view (drag-drop between statuses)
- Calendar view
- Detail view with timeline of events
- Photo gallery (before/after)

### Worker Assignment Pattern
- Available workers list with calendar
- Drag-drop assignment
- Conflict detection
- Notification system

---

## 🔌 API Endpoints to Create

### Cleaning Jobs
```typescript
POST   /api/cleaning-jobs              // Create job
GET    /api/cleaning-jobs              // List jobs (with filters)
GET    /api/cleaning-jobs/:id          // Get job details
PUT    /api/cleaning-jobs/:id          // Update job
DELETE /api/cleaning-jobs/:id          // Delete job
PUT    /api/cleaning-jobs/:id/assign   // Assign worker
PUT    /api/cleaning-jobs/:id/complete // Mark complete
POST   /api/cleaning-jobs/:id/photos   // Upload photos
```

### Maintenance Jobs
```typescript
POST   /api/maintenance-jobs              // Create job
GET    /api/maintenance-jobs              // List jobs (with filters)
GET    /api/maintenance-jobs/:id          // Get job details
PUT    /api/maintenance-jobs/:id          // Update job
DELETE /api/maintenance-jobs/:id          // Delete job
PUT    /api/maintenance-jobs/:id/assign   // Assign worker
PUT    /api/maintenance-jobs/:id/complete // Mark complete
POST   /api/maintenance-jobs/:id/photos   // Upload photos
```

### Quotes ✅ COMPLETE
```typescript
POST   /api/maintenance-jobs/:id/submit-quote  // ✅ Generate quote for maintenance job
GET    /api/customer-portal/dashboard          // ✅ Get pending quotes
PUT    /api/customer-portal/quotes/:id/approve // ✅ Customer approves quote
PUT    /api/customer-portal/quotes/:id/decline // ✅ Customer declines quote
```

### Invoices
```typescript
POST   /api/invoices                  // Create invoice from job
GET    /api/invoices                  // List invoices
GET    /api/invoices/:id              // Get invoice details
PUT    /api/invoices/:id/mark-paid    // Mark as paid
```

---

## ✅ Success Criteria

### Cleaning Dashboard
- [x] Service provider can create cleaning jobs
- [ ] Jobs can be assigned to workers
- [ ] Jobs have checklist templates
- [ ] Before/after photos can be uploaded
- [ ] Customers can rate completed jobs
- [x] Dashboard shows stats and recent jobs

### Maintenance Dashboard ✅ QUOTE WORKFLOW COMPLETE
- [x] Service provider can create maintenance jobs
- [x] Quotes can be generated for jobs with parts/labor breakdown
- [x] Customers can approve/decline quotes from portal
- [x] Jobs move between tabs based on status (New Issues | Submitted Quotes | Accepted Quotes)
- [ ] Jobs can be assigned to technicians (next priority)
- [ ] Before/after photos can be uploaded
- [x] Integration with Guest Tablet issue reporting

### Integration
- [x] Customer Portal shows service history (cleaning + maintenance)
- [x] Guest Tablet issues auto-create maintenance jobs
- [x] Customer can submit guest issues to maintenance
- [ ] Cross-sell: Suggest maintenance during cleaning job creation
- [x] Quote workflow tested end-to-end

---

## 🚀 What's Next? (Updated 2025-11-02)

**Current Progress:**
- ✅ Database schema complete (8 tables created and migrated)
- ✅ Maintenance quote workflow complete and tested end-to-end
- ✅ CleaningDashboard.tsx built with stats and job list
- ✅ MaintenanceDashboard.tsx built with tabs and quote submission
- ✅ Customer Portal quote approval workflow working
- ✅ Guest Tablet integration working
- ✅ Cleanup Sprint 1 complete (17/18 stories, 94%)

**Immediate Next Priorities:**

### Priority 1: Cleaning Job Details & Management (2-3 days)
Build the missing pieces of the cleaning workflow:
- CleaningJobDetails.tsx - View job details page
- CleaningJobForm.tsx - Create/edit cleaning jobs
- Job checklist management
- Basic photo upload

### Priority 2: Worker Assignment System (3-4 days)
Build worker assignment for both cleaning and maintenance:
- WorkerAssignment.tsx - Shared component for both job types
- Worker availability calendar
- API: PUT /api/cleaning-jobs/:id/assign
- API: PUT /api/maintenance-jobs/:id/assign
- Conflict detection

### Priority 3: Job Completion Workflow (2-3 days)
Complete the job lifecycle:
- Mark jobs complete with photos
- Before/after photo upload to S3
- Customer rating/feedback
- Automatic invoice generation

### Priority 4: Cross-sell & Advanced Features (2-3 days)
- CrossSellWorkflow.tsx - Suggest maintenance during cleaning
- Invoice generation after job completion
- Calendar view of scheduled jobs

**Estimated Time:** 9-13 days (~2-3 weeks)
**Story Points:** ~25 points remaining (out of 40 total)

---

**Alternative Direction: Phase 3B (Feature Completeness)**
If you prefer to tackle horizontal features instead:
- Week 8: Search & filtering (30 pts)
- Week 9: Batch operations & reporting (30 pts)
- Week 10: Notifications & mobile enhancements (30 pts)

See: [Project-Plan/PHASE_3_SPRINT_PLAN.md](PHASE_3_SPRINT_PLAN.md)

---

*Phase 3 is 62% complete! 🏗️*
