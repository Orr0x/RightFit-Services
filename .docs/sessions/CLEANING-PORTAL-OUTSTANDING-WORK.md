# Cleaning Portal - Outstanding Work & Features

**Last Updated:** 2025-11-04
**Current Phase:** Phase 1 Complete ✅ | Phase 2 Priorities 1-2 Complete ✅
**Next Priority:** Worker Assignment & Scheduling (Priority 3)

---

## 📊 Current Status Summary

### ✅ Completed Features

#### Phase 1: Contract Foundation (100% Complete)
- **Contract Management Backend**:
  - Full CRUD API for cleaning contracts
  - FLAT_MONTHLY and PER_PROPERTY pricing models
  - Add/remove properties from contracts
  - Pause/Resume/Cancel contract actions
  - Monthly fee calculation for PER_PROPERTY contracts
  - Service provider ID lookup from tenant_id

- **Contract Management Frontend**:
  - Contract creation modal with customer dropdown
  - Contract list with status filtering
  - Contract details modal with property management
  - Per-property fee management
  - Status badges and visual indicators

#### Phase 3: Timesheet & Completion (100% Complete)
- **Timesheet Backend**:
  - CleaningJobTimesheetService with full CRUD
  - Automatic time calculation (start/end)
  - Worker stats tracking
  - Photo management (before/after/issue)
  - Status transitions (SCHEDULED → IN_PROGRESS → COMPLETED)

- **Timesheet Frontend**:
  - StartJobModal for workers to start jobs
  - CompleteJobModal for job completion
  - Timesheet display on job details page
  - Photo count tracking
  - Worker info and duration display

#### History & Audit Trail (100% Complete)
- **Job History**: Complete audit trail for cleaning jobs
- **Property History**: Timeline of all property events
- **Worker History**: Worker activity tracking with backfilled data
- **Global Activity Feed**: Unified timeline combining all three history types

---

## 🚧 Phase 2: Scheduling & Assignment (IN PROGRESS)

### Priority 1: Property Calendar System ✅ COMPLETE
**Status:** 100% Complete ✅
**Dependencies:** None

**Backend Requirements:** ✅ COMPLETE
- ✅ **Model:** `PropertyCalendar` (exists in schema with all fields including clean_window_start/end)
- ✅ **Service:** `PropertyCalendarService` (full CRUD + helper methods)
  - createCalendarEntry, updateCalendarEntry, deleteCalendarEntry
  - getCalendarEntriesByProperty, getUpcomingCalendarEntries
  - getEntriesNeedingCleaning, hasEnoughCleaningTime
  - getPropertyCalendarStats
- ✅ **API Routes:** `/api/property-calendars` (all endpoints registered)
  - `POST /api/property-calendars` - Create calendar entry ✅
  - `GET /api/property-calendars` - List entries by property/date range ✅
  - `GET /api/property-calendars/:id` - Get single entry ✅
  - `GET /api/property-calendars/needs-cleaning` - Entries needing jobs ✅
  - `GET /api/property-calendars/property/:id/stats` - Property stats ✅
  - `PUT /api/property-calendars/:id` - Update entry ✅
  - `PUT /api/property-calendars/:id/link-job` - Link cleaning job ✅
  - `DELETE /api/property-calendars/:id` - Delete entry ✅

**Frontend Requirements:** ✅ COMPLETE
- ✅ **API Client:** `propertyCalendarsAPI` in `web-cleaning/lib/api.ts`
- ✅ **UI Component:** `PropertyGuestCalendar.tsx` - Fully functional guest turnover management
  - Form to add/edit guest checkout/checkin times
  - Automatic cleaning window calculation (checkout → checkin - 2hr buffer)
  - Visual indicators showing hours available for cleaning
  - "Same day turnover" badge for tight schedules
  - "Job Scheduled" badge when linked to cleaning job
  - Edit and delete functionality
  - Date/time validation
  - Notes field for special instructions
- ✅ **Integration:** Added to PropertyDetails page as new section

**Files Created:**
- `apps/web-cleaning/src/components/PropertyGuestCalendar.tsx`
- API client in `apps/web-cleaning/src/lib/api.ts` (lines 1302-1399)

**Note:** PropertyCalendar.tsx is a separate file for the CLEANING JOBS calendar view (drag-drop scheduling).

**Use Cases:**
1. User enters guest checkout: 11 AM on Friday
2. User enters next guest checkin: 3 PM on Saturday
3. System calculates: 28-hour cleaning window
4. Generates potential cleaning job for that window

---

### Priority 2: Manual Cleaning Job Creation ✅ COMPLETE
**Status:** 100% Complete ✅
**Dependencies:** Property Calendar ✅, Contracts ✅

**Implementation Details:**
- **Two-Tab System** in `CreateCleaningJob.tsx`:
  - **Tab 1: From Contract** - Create contract-based jobs
    - Select active cleaning contract
    - Select property from contract (filtered list)
    - View and select guest turnovers (optional)
    - Auto-fill pricing from contract
    - Auto-fill customer from contract
    - Links job to property calendar turnover
  - **Tab 2: One-Off Job** - Create standalone jobs
    - Direct property selection
    - Manual pricing
    - Independent of contracts

**Features Implemented:**
- ✅ Contract selection dropdown (ACTIVE contracts only)
- ✅ Property filtering by selected contract
- ✅ Guest turnover integration with visual selection
- ✅ Auto-fill scheduling from turnover (date/time)
- ✅ Auto-fill pricing from contract
- ✅ Auto-fill customer from contract
- ✅ Link job to turnover upon creation
- ✅ Support for both contract-based and one-off jobs
- ✅ Progressive disclosure (fields appear after selection)
- ✅ Visual badges (Same-Day Turnover, Job Already Scheduled)
- ✅ Edit mode detects job type and selects correct tab

**Files Modified:**
- `apps/web-cleaning/src/lib/api.ts` (added cleaningContractsAPI)
- `apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx` (complete refactor)

---

### Priority 3: Worker Assignment & Scheduling (2 days)
**Status:** Design Complete (reuse from maintenance)
**Dependencies:** Manual job creation

**Components to Adapt:**
- Reuse: `ContractorSchedulingModal.tsx` → Rename to `WorkerSchedulingModal.tsx`
- Adapt for cleaning jobs (simpler than maintenance)
- Same conflict detection logic
- Same availability checking

**Features:**
- Assign worker to cleaning job
- Check worker availability
- Detect scheduling conflicts
- Week-ahead view
- Worker capacity planning

**Estimated Time:** 1-2 days (most code exists from maintenance)

---

### Priority 4: Cleaning Calendar View (3 days)
**Status:** Concept Designed
**Dependencies:** Jobs created, workers assigned

**New Component:** `CleaningCalendar.tsx`

**Features:**
- **Week View:**
  - Show scheduled cleans by day
  - Color-coded by status
  - Show worker assignments

- **Month View:**
  - Calendar grid with job counts
  - Click day to see jobs

- **Drag-and-Drop Rescheduling:**
  - Drag job to new day/time
  - Conflict detection on drop
  - Confirm reschedule

- **Worker Overlay:**
  - Toggle worker availability view
  - See which workers are free
  - Assign from calendar view

**Technical Notes:**
- Consider using FullCalendar or similar library
- Or build custom with date-fns and CSS Grid
- Mobile-responsive design

**Estimated Time:** 3 days

---

## 🎯 Phase 4: Customer Portal Integration (2-3 days)

### Feature 1: Customer Contract View
**Status:** Not Started
**Priority:** Medium

**Requirements:**
- View active cleaning contracts
- List properties in contract
- See monthly fee
- View billing schedule
- Contract status (Active/Paused/Cancelled)

**New Page:** `apps/web-customer/src/pages/CleaningContracts.tsx`

---

### Feature 2: Customer Clean Schedule
**Status:** Not Started
**Priority:** Medium

**Requirements:**
- Calendar view of upcoming cleans
- See completed clean history
- Filter by property
- View photos from completed cleans
- See worker assigned

**New Page:** `apps/web-customer/src/pages/CleaningSchedule.tsx`

---

### Feature 3: Customer Clean Details Page
**Status:** Design Complete (pattern from maintenance)
**Priority:** High

**Requirements:**
- Adapt `MaintenanceJobDetails.tsx` pattern for cleaning
- View job details: property, worker, schedule
- View before/after photos
- View timesheet data
- Add comments (cross-tenant Kanban card pattern)
- Rate completed cleans (1-5 stars)

**New Page:** `apps/web-customer/src/pages/CleaningJobDetails.tsx`

**Reuse Pattern:**
- Same comment system as maintenance jobs
- Same rating API endpoint pattern
- Same photo display component
- Customer and cleaning business both see same job card

**Estimated Time:** 2 days

---

## 💰 Phase 5: Monthly Invoicing (3-4 days)

### Feature 1: Monthly Invoice Generation
**Status:** Not Started
**Priority:** Low (can invoice manually for now)

**Backend Requirements:**
- **New Service:** `CleaningInvoiceService`
- **Trigger:** Scheduled job on billing day (e.g., 1st of month)
- **Process:**
  1. Find all active contracts with billing day = today
  2. Get all completed cleans from previous month
  3. Calculate total: contract fee + additional charges
  4. Generate invoice with summary (not itemized)
  5. Store in `cleaning_invoices` table
  6. Trigger customer notification

**Invoice Fields:**
```typescript
{
  id: string
  contract_id: string
  customer_id: string
  invoice_number: string (CLEAN-INV-2025-XXXXX)
  billing_period_start: Date
  billing_period_end: Date
  total_cleans_completed: number
  contract_monthly_fee: Decimal
  additional_charges: Decimal
  total_amount: Decimal
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  due_date: Date
  paid_date: Date?
}
```

**Estimated Time:** 2-3 days

---

### Feature 2: Invoice Management UI
**Status:** Not Started
**Priority:** Low

**Requirements:**
- List all cleaning invoices
- Filter by customer, date, status
- Manual invoice generation
- Mark invoice as paid
- Resend invoice email
- Download/print invoice

**New Page:** `apps/web-cleaning/src/pages/CleaningInvoices.tsx`

**Estimated Time:** 1-2 days

---

### Feature 3: Customer Invoice View
**Status:** Not Started
**Priority:** Low

**Requirements:**
- View cleaning invoices in customer portal
- Separate from maintenance invoices
- Download/print invoice PDF
- Payment history
- See photo summary of month's work

**New Page:** `apps/web-customer/src/pages/CleaningInvoices.tsx`

**Integration:**
- Add "Cleaning" tab to existing Invoices page
- Or separate page for cleaning invoices
- Combined financial view showing both maintenance + cleaning

**Estimated Time:** 1-2 days

---

## 🔗 Cross-Cutting Features

### Feature: Work Information Sharing (3-way communication)
**Status:** Design Complete (pattern from maintenance)
**Priority:** High
**Phase:** Throughout all phases

**Pattern:** Same as Maintenance Cross-Tenant Kanban Cards

**Information Flow:**
```
Customer ↔ Cleaning Business ↔ Workers
   ↓              ↓              ↓
Property      Schedule       View work
details       workers        assignments
notes         assign         property info
special       jobs           checklists
requests                     access codes

Workers → Business → Customer
   ↓          ↓          ↓
Timesheets  Monitor    View progress
Photos      progress   See photos
Issues      Track      See completion
Notes       hours      Worker notes
```

**Shared Property Information:**
- Property address & access codes (workers see)
- Cleaning checklist specific to property
- Special requirements (allergies, pets)
- Emergency contacts

**Shared Work Information:**
- Job schedule and assignments
- Timesheet data (hours worked)
- Before/after photos (all parties see)
- Issues found during cleaning
- Completion status
- Customer feedback/ratings

**Implementation:**
- Same comment/note system as maintenance
- Cleaning job accessible by all three parties (filtered by role)
- Real-time updates
- Audit trail
- Photos visible to all

**Benefits:**
- Transparency: Customer sees exactly what work was done
- Accountability: Workers document with photos
- Communication: All parties can add notes
- Quality: Before/after photos prove quality

**Estimated Time:** Built into each phase as features are developed

---

## 📋 Implementation Roadmap

### Week 1: Property Calendar & Job Creation (Priority 1-2) ✅ COMPLETE
- [x] Day 1-2: Property Calendar backend + frontend ✅
- [x] Day 3-4: Manual cleaning job creation (2-tab system) ✅
- [x] Day 5: Testing & integration ✅

**Deliverables:** ✅ ALL COMPLETE
- ✅ Users can enter guest checkout/checkin times
- ✅ Users can create cleaning jobs from contracts
- ✅ Jobs linked to contracts (not quotes)
- ✅ Users can create one-off jobs without contracts
- ✅ Guest turnover integration with auto-fill

---

### Week 2: Worker Assignment & Calendar View (Priority 3-4)
- [ ] Day 1-2: Adapt worker scheduling modal for cleaning
- [ ] Day 3-5: Build cleaning calendar view (week/month)

**Deliverables:**
- Workers can be assigned to cleaning jobs
- Calendar view shows all scheduled cleans
- Conflict detection working

---

### Week 3: Customer Portal (Phase 4)
- [ ] Day 1-2: Customer contract view
- [ ] Day 2-3: Customer clean schedule
- [ ] Day 4-5: Customer clean details page (with comments)

**Deliverables:**
- Customers can view contracts
- Customers can see scheduled/completed cleans
- Customers can view photos and add comments
- Customers can rate completed cleans

---

### Week 4: Monthly Invoicing (Phase 5) - OPTIONAL
- [ ] Day 1-2: Invoice generation service (automated)
- [ ] Day 3: Invoice management UI (cleaning business)
- [ ] Day 4-5: Customer invoice view

**Deliverables:**
- Automated monthly invoice generation
- Cleaning business can manage invoices
- Customers can view/pay cleaning invoices

---

## 🎯 Quick Wins (Can Do Now)

### 1. Property Calendar Entry (1 day)
**Impact:** Enables scheduling workflow
**Dependencies:** None
**Files:**
- New: `PropertyCalendarService.ts`
- New: `property-calendars.ts` (routes)
- New: Calendar UI component

---

### 2. Adapt Job Creation Form (0.5 days)
**Impact:** Create jobs from contracts
**Dependencies:** Contracts exist (✅ done)
**Files:**
- Update: `CreateCleaningJob.tsx`
- Minor update: `CleaningJobsService.ts`

---

### 3. Worker Scheduling Modal (0.5 days)
**Impact:** Assign workers to jobs
**Dependencies:** Jobs created
**Files:**
- Copy: `ContractorSchedulingModal.tsx` → `WorkerSchedulingModal.tsx`
- Adapt for cleaning jobs

---

## 📝 Technical Notes

### Reusable Components from Maintenance
- ✅ Worker scheduling modal (minor adaptations)
- ✅ Photo upload component (use as-is)
- ✅ Job completion flow (simplify for cleaning)
- ✅ Customer job details page (adapt pattern)
- ✅ Rating system (reuse API pattern)
- ✅ Cross-tenant Kanban card system (reuse pattern)

### Key Differences from Maintenance
| Aspect | Maintenance | Cleaning |
|--------|------------|----------|
| **Trigger** | Reactive (guest issue) | Proactive (contract schedule) |
| **Quote** | Per-job with parts/labor | Monthly contract fee |
| **Scheduling** | After quote approval | Week+ in advance |
| **Invoice** | Per job (after completion) | Monthly (all jobs combined) |
| **Customer Role** | Approve quotes | View progress |

### Database Schema Status
- ✅ `CleaningContract` - Exists
- ✅ `ContractProperty` - Exists
- ✅ `CleaningJob` - Has `contract_id` field
- ✅ `CleaningJobTimesheet` - Exists
- ❌ `PropertyCalendar` - Need to create
- ❌ `CleaningInvoice` - Need to create (Phase 5)

---

## 🚀 Recommended Next Steps

### Immediate Priority (This Week)
1. **Implement Property Calendar** (1-2 days)
   - Backend: PropertyCalendarService + routes
   - Frontend: Calendar entry UI
   - Integration: Link to properties

2. **Adapt Job Creation for Contracts** (0.5-1 day)
   - Update CreateCleaningJob form
   - Remove quote dependency
   - Add contract selection

3. **Worker Assignment** (0.5-1 day)
   - Copy scheduling modal from maintenance
   - Adapt for cleaning jobs
   - Test conflict detection

### Next Week
4. **Cleaning Calendar View** (2-3 days)
   - Build calendar component
   - Week/month toggle
   - Job display and click-through

5. **Customer Portal Integration** (2-3 days)
   - Contract view
   - Clean schedule view
   - Clean details page

### Future (When Ready)
6. **Monthly Invoicing** (3-4 days)
   - Automated invoice generation
   - Invoice management UI
   - Customer invoice view

---

## ✅ Success Criteria

### Phase 2 Complete When:
- [x] Property calendar entry working ✅
- [x] Cleaning jobs can be created from contracts ✅
- [x] One-off jobs can be created without contracts ✅
- [ ] Workers can be assigned to jobs (Priority 3)
- [ ] Calendar view shows all scheduled cleans (Priority 4)
- [x] No broken functionality from existing features ✅

### Phase 4 Complete When:
- [ ] Customers can view their contracts
- [ ] Customers can see scheduled/completed cleans
- [ ] Customers can view photos from cleans
- [ ] Customers can add comments to jobs
- [ ] Customers can rate completed cleans
- [ ] Cross-tenant communication working

### Phase 5 Complete When:
- [ ] Monthly invoices auto-generate on billing day
- [ ] Cleaning business can manage invoices
- [ ] Customers can view/download invoices
- [ ] Payment tracking working
- [ ] Invoice includes summary of month's work

---

## 🔍 Known Issues / Technical Debt

### None Currently Identified ✅

All current features are working correctly:
- Contract management fully functional
- Timesheet system complete and tested
- History tracking working across all three types
- Global activity feed displaying correctly

---

**Document Status:** Up to date as of 2025-11-04
**Next Review:** After Phase 2 Priority 1-2 completion
**Owner:** Cleaning Portal Development Team
