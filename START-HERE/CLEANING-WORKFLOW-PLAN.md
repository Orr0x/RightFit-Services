# Cleaning Workflow Plan: Contract-Based Model

**Created**: 2025-11-03
**Last Updated**: 2025-11-03
**Status**: IN PROGRESS - Phases 1-3 Complete ✅

---

## 🎉 Current Progress Summary

### ✅ Completed (Phases 1-3)

#### Phase 1: Contract Management ✅
- **Contract Management Backend**: Full CRUD API for cleaning contracts
  - Create contracts with both FLAT_MONTHLY and PER_PROPERTY pricing models
  - List, update, pause, resume, cancel contracts
  - Add/remove properties from contracts
  - Calculate total monthly fees for PER_PROPERTY contracts
  - Service provider ID lookup from tenant_id

- **Contract Management Frontend**: Complete UI in web-cleaning portal
  - Contract creation modal with customer dropdown
  - Contract list with status filtering (All/Active/Paused/Cancelled)
  - Contract details modal with property management
  - Pause/Resume/Cancel actions with toast notifications
  - Per-property fee management
  - Status badges and empty states

#### Phase 3: Timesheet & Completion ✅
- **Timesheet Backend**: CleaningJobTimesheetService with full CRUD
  - Create timesheet entries when workers start jobs
  - Automatic total hours calculation from start/end times
  - Update timesheet and mark jobs complete
  - Worker stats tracking (total hours, completed jobs)
  - Photo management (before/after/issue photos)
  - Automatic job status transitions (SCHEDULED → IN_PROGRESS → COMPLETED)

- **Timesheet API Routes**: Complete REST API
  - POST /api/cleaning-timesheets - Create timesheet
  - GET /api/cleaning-timesheets/:id - Get timesheet by ID
  - GET /api/cleaning-timesheets/job/:jobId - Get all timesheets for job
  - GET /api/cleaning-timesheets/worker/:workerId - Get worker's timesheets
  - POST /api/cleaning-timesheets/:id/complete - Complete timesheet
  - POST /api/cleaning-timesheets/:id/photos - Add photos
  - GET /api/cleaning-timesheets/worker/:workerId/stats - Worker performance

- **Timesheet Frontend**: Integrated into CleaningJobDetails page
  - StartJobModal - Workers can start jobs and create timesheet entries
  - CompleteJobModal - Workers can complete jobs with work description
  - Timesheet display on job details page with full history
  - Before/after/issue photo count tracking
  - Conditional action buttons based on job status
  - Worker information and duration display

### ⏭️ Next Up (Phase 2)
- Property calendar entry for tracking guest stays
- Manual cleaning job creation from contracts
- Worker assignment to cleaning jobs
- Cleaning calendar/schedule view

### 📊 Progress
- **Phase 1**: ✅ 100% Complete (Contract Foundation)
- **Phase 2**: ⏸️ Not Started (Scheduling & Assignment) - NEXT
- **Phase 3**: ✅ 100% Complete (Timesheet & Completion)
- **Phase 4**: ⏸️ Not Started (Customer Portal)
- **Phase 5**: ⏸️ Not Started (Monthly Invoicing)

---

## 🎯 Key Differences from Maintenance Workflow

### Business Model Differences

| Aspect | Maintenance (Reactive) | Cleaning (Proactive) |
|--------|----------------------|---------------------|
| **Trigger** | Guest reports issue OR customer submits request | Contract + property calendar |
| **Quote Model** | Per-job quotes with parts/labor | Monthly contract invoices |
| **Scheduling** | Reactive (after quote approval) | Proactive (week+ in advance) |
| **Workflow Start** | Guest issue or customer request | Contract schedule + guest checkout |
| **Customer Role** | Approve quotes, view progress | View contract, view clean history |
| **Invoice Frequency** | Per job (after completion) | Monthly (contract-based) |

---

## 📋 Cleaning Workflow Overview

### Contract-Based Flow
```
Customer Contract → Property Schedule → Worker Assignment → Clean Job → Photos/Timesheet → Monthly Invoice
       ↓                  ↓                    ↓              ↓              ↓                   ↓
Set up contract    Track guest stays   Assign cleaner   Do clean work   Record time    Bill monthly
Monthly fee        Between-guest       Week ahead      Take photos     Submit hours   All jobs
                   cleans scheduled    scheduling      Document work   Track labor    combined
```

---

## 🔄 Proposed Cleaning Workflow (Detailed)

### Step 1: Customer Contract Setup
**Who**: Customer + Cleaning Business
**What**: Establish ongoing cleaning contract

**Contract Fields**:
- Customer ID (same as maintenance)
- Contract start/end dates
- Properties included in contract
- Cleaning frequency (between-guest, weekly, etc.)
- Monthly contract fee
- Special requirements/notes

**New Database Table**: `cleaning_contracts`
```typescript
{
  id: string
  customer_id: string (SAME customer as maintenance)
  service_provider_id: string (cleaning business)
  contract_start_date: Date
  contract_end_date: Date?
  monthly_fee: Decimal
  billing_day: number (1-31)
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  notes: string
}
```

### Step 2: Property & Work Information Sharing ⭐ KEY FEATURE
**Who**: Cleaning Business, Workers, Customer (3-way sharing)
**What**: Share property details, work instructions, and job information between all parties

**Information Flow**:
```
Customer → Business → Workers
   ↓          ↓          ↓
Property    Schedule   View work
details     workers    assignments
notes       assign     property info
special     jobs       checklists
requests               access codes

Workers → Business → Customer
   ↓          ↓          ↓
Timesheets  Monitor    View progress
Photos      progress   See photos
Issues      Track      See completion
Notes       hours      Worker notes
```

**Shared Property Information**:
- Property address & details (already exists)
- Access codes/instructions
- Cleaning checklist specific to property
- Special requirements (allergies, pets, etc.)
- Photos of property layout
- Emergency contacts

**Shared Work Information**:
- Job schedule and assignments
- Worker assigned to each property
- Timesheet data (hours worked)
- Before/after photos
- Issues found during cleaning
- Completion status
- Customer feedback/ratings

**Visibility** (Role-Based Access):
- ✅ **Customer**: View their properties, add notes, see all work done, view photos, rate jobs
- ✅ **Cleaning Business**: View all contract properties, manage schedules, assign workers, monitor all work
- ✅ **Workers**: View assigned properties only, see job details, submit timesheets, upload photos

### Step 3: Scheduled Clean Creation
**Who**: Cleaning Business (automated or manual)
**What**: Create scheduled cleans based on contract + property calendar

**Triggers**:
- Guest checkout detected (integration with property calendar)
- Manual schedule creation (week+ in advance)
- Recurring schedule (weekly, bi-weekly, etc.)

**Clean Job Fields**:
```typescript
{
  id: string
  contract_id: string (links to contract, not quote)
  property_id: string
  scheduled_date: Date
  scheduled_time: string
  estimated_duration_hours: Decimal
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  special_instructions: string
  assigned_worker_id: string?
}
```

### Step 4: Worker Assignment
**Who**: Cleaning Business
**What**: Assign worker to scheduled clean (week in advance)

**Requirements**:
- ✅ Can assign internal worker (from workers table)
- ✅ Check worker availability (conflict detection)
- ✅ Worker sees assigned cleans in their schedule
- ✅ Can reassign if worker unavailable

**Reuse from Maintenance**:
- Worker assignment logic
- Conflict detection
- Scheduling modal (adapt for cleaning)

### Step 5: Worker Performs Clean
**Who**: Assigned Worker
**What**: Complete clean, record timesheet, take photos

**Required Actions**:
1. **Start Clean**: Worker marks job as "IN_PROGRESS"
2. **Timesheet Entry**: Worker records actual hours worked
3. **Photo Documentation**: Worker takes before/after photos
4. **Completion**: Worker marks job as "COMPLETED"

**New Requirements**:

**Timesheet Tracking**:
```typescript
{
  cleaning_job_id: string
  worker_id: string
  start_time: DateTime
  end_time: DateTime
  total_hours: Decimal (calculated)
  notes: string
  photos: string[] (photo URLs)
}
```

**Photo Categories**:
- Before photos (document state before clean)
- After photos (show completed work)
- Issue photos (document problems found)

### Step 6: Customer Views Progress
**Who**: Customer
**What**: View scheduled cleans, completed work, photos

**Customer Portal Features**:
- ✅ View upcoming scheduled cleans (calendar view)
- ✅ View completed clean history
- ✅ View before/after photos
- ✅ Add comments/feedback on cleans
- ✅ Rate completed cleans

**Reuse from Maintenance**:
- Cross-tenant Kanban card system (adapt for cleaning)
- Job details page with photos
- Comment system
- Rating system

### Step 7: Monthly Invoicing
**Who**: Cleaning Business
**What**: Generate monthly invoice for all cleans under contract

**Invoice Generation**:
- Triggered: On contract billing day (e.g., 1st of month)
- Includes: All completed cleans from previous month
- Line items: Each clean listed OR just monthly contract fee
- Photos: Attach summary of work done

**New Table**: `cleaning_invoices`
```typescript
{
  id: string
  contract_id: string
  customer_id: string
  invoice_number: string (CLEAN-INV-2025-XXXXX)
  billing_period_start: Date
  billing_period_end: Date
  total_cleans: number
  contract_fee: Decimal
  additional_charges: Decimal? (overtime, special requests)
  total_amount: Decimal
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  due_date: Date
  paid_date: Date?
}
```

---

## 🔧 Components to Build/Adapt

### NEW Components Needed

#### 1. Contract Management
**New Files**:
- `apps/api/src/routes/cleaning-contracts.ts`
- `apps/api/src/services/CleaningContractService.ts`
- `apps/web-cleaning/src/pages/Contracts.tsx`
- `apps/web-customer/src/pages/CleaningContracts.tsx`

**Features**:
- Create/edit contracts
- Link properties to contracts
- Set monthly fees and billing dates
- Pause/cancel contracts

#### 2. Property & Work Information Sharing ⭐ KEY FEATURE
**New Files**:
- `apps/web-cleaning/src/components/PropertyDetailsSharing.tsx`
- `apps/web-cleaning/src/components/WorkInformationPanel.tsx`
- `apps/api/src/routes/shared-property-info.ts`
- `apps/api/src/routes/work-information.ts`

**Features**:
- Display property access codes (visible to workers)
- Property-specific cleaning checklists
- Special instructions
- Emergency contacts
- **Real-time work updates visible to all parties**
- **Cross-tenant work information view** (same pattern as maintenance Kanban cards)
- Worker notes visible to customer and business
- Customer requests visible to workers and business
- Timesheet data shared appropriately

#### 3. Timesheet Entry
**New Files**:
- `apps/web-cleaning/src/components/TimesheetEntry.tsx`
- `apps/api/src/routes/timesheets.ts`
- `apps/api/src/services/TimesheetService.ts`

**Features**:
- Clock in/out functionality
- Manual time entry
- Total hours calculation
- Attach to cleaning job
- Worker performance tracking

#### 4. Scheduled Clean Calendar
**New Files**:
- `apps/web-cleaning/src/components/CleaningCalendar.tsx`
- `apps/web-customer/src/pages/CleaningSchedule.tsx`

**Features**:
- Week/month view of scheduled cleans
- Drag-and-drop rescheduling
- Worker availability overlay
- Property checkout calendar integration

#### 5. Monthly Invoice Generator
**New Files**:
- `apps/api/src/services/CleaningInvoiceService.ts`
- `apps/api/src/routes/cleaning-invoices.ts`
- `apps/web-cleaning/src/pages/MonthlyInvoices.tsx`
- `apps/web-customer/src/pages/CleaningInvoices.tsx`

**Features**:
- Auto-generate on billing day
- List all cleans for period
- Attach photo summaries
- Email to customer

### REUSABLE Components from Maintenance

#### 1. Worker Assignment & Scheduling ✅
**Existing Files**:
- `apps/web-maintenance/src/components/ContractorSchedulingModal.tsx`

**Adaptations**:
- Rename "Contractor" → "Worker"
- Use for cleaning job assignment
- Same conflict detection logic

#### 2. Photo Upload ✅
**Existing Files**:
- `apps/web-maintenance/src/components/PhotoUpload.tsx`

**Adaptations**:
- Reuse as-is for cleaning photos
- Same before/after/in-progress categories

#### 3. Job Completion Flow ✅
**Existing Files**:
- `apps/web-maintenance/src/components/MaintenanceJobCompletionModal.tsx`

**Adaptations**:
- Simplify for cleaning (no parts/costs)
- Add timesheet integration
- Keep photo upload
- Remove invoice generation (monthly instead)

#### 4. Customer Job Details Page ✅
**Existing Files**:
- `apps/web-customer/src/pages/MaintenanceJobDetails.tsx`

**Adaptations**:
- Create `CleaningJobDetails.tsx`
- Same cross-tenant Kanban card pattern
- Show photos, timesheet, worker info
- Customer comments work same way

#### 5. Rating System ✅
**Existing Code**:
- Customer portal rating API already exists

**Reuse**:
- Same rating endpoint pattern
- Apply to cleaning jobs

---

## 📊 Database Schema Changes

### New Tables

```prisma
model CleaningContract {
  id                    String   @id @default(uuid())
  customer_id           String
  service_provider_id   String
  contract_start_date   DateTime
  contract_end_date     DateTime?
  monthly_fee           Decimal
  billing_day           Int      // 1-31
  status                ContractStatus @default(ACTIVE)
  notes                 String?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  customer              Customer @relation(fields: [customer_id], references: [id])
  service_provider      ServiceProvider @relation(fields: [service_provider_id], references: [id])
  cleaning_jobs         CleaningJob[]
  cleaning_invoices     CleaningInvoice[]
}

enum ContractStatus {
  ACTIVE
  PAUSED
  CANCELLED
}

model CleaningJobTimesheet {
  id                String   @id @default(uuid())
  cleaning_job_id   String
  worker_id         String
  start_time        DateTime
  end_time          DateTime?
  total_hours       Decimal?
  notes             String?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  cleaning_job      CleaningJob @relation(fields: [cleaning_job_id], references: [id])
  worker            Worker @relation(fields: [worker_id], references: [id])
}

model CleaningInvoice {
  id                      String   @id @default(uuid())
  contract_id             String
  customer_id             String
  invoice_number          String   @unique
  billing_period_start    DateTime
  billing_period_end      DateTime
  total_cleans            Int
  contract_fee            Decimal
  additional_charges      Decimal  @default(0)
  total_amount            Decimal
  status                  InvoiceStatus @default(PENDING)
  due_date                DateTime
  paid_date               DateTime?
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt

  contract                CleaningContract @relation(fields: [contract_id], references: [id])
  customer                Customer @relation(fields: [customer_id], references: [id])
}

// Update CleaningJob to link to contract instead of quote
model CleaningJob {
  // ... existing fields ...
  contract_id             String? // NEW: Link to contract
  quote_id                String? // KEEP for backward compatibility

  contract                CleaningContract? @relation(fields: [contract_id], references: [id])
  timesheets              CleaningJobTimesheet[]
}
```

---

## 🎯 Implementation Stories for Cleaning

### Phase 1: Contract Foundation (3-4 days) ✅ COMPLETE

**CLEAN-101: Contract Management API** ✅ COMPLETE (3 pts)
- ✅ Created CleaningContract model in database schema
- ✅ Created ContractProperty model for property assignments
- ✅ API endpoints implemented:
  - POST /api/cleaning-contracts (create with tenant_id lookup)
  - GET /api/cleaning-contracts (list by service provider)
  - GET /api/cleaning-contracts/:id (get single contract)
  - PUT /api/cleaning-contracts/:id (update contract)
  - PUT /api/cleaning-contracts/:id/pause (pause contract)
  - PUT /api/cleaning-contracts/:id/resume (resume contract)
  - PUT /api/cleaning-contracts/:id/cancel (cancel contract)
  - POST /api/cleaning-contracts/:id/properties (add property)
  - DELETE /api/cleaning-contracts/:id/properties/:property_id (remove property)
  - PUT /api/cleaning-contracts/:id/properties/:property_id/fee (update per-property fee)
  - GET /api/cleaning-contracts/:id/monthly-fee (calculate total monthly fee)
- ✅ CleaningContractService with full CRUD operations
- ✅ Support for both FLAT_MONTHLY and PER_PROPERTY pricing models
- ✅ Service provider ID lookup from tenant_id

**CLEAN-102: Contract Management UI** ✅ COMPLETE (3 pts)
- ✅ Contract creation modal with customer selection
- ✅ Contract list view with status filtering (All/Active/Paused/Cancelled)
- ✅ Contract details modal showing:
  - Contract information (type, dates, billing day)
  - Monthly fee calculation
  - Property assignments with add/remove functionality
  - Per-property fee management for PER_PROPERTY contracts
- ✅ Pause/Resume/Cancel contract actions
- ✅ Status badges and visual indicators
- ✅ Empty states with call-to-actions
- ✅ Toast notifications for all operations
- ✅ Fixed Select component to use options prop
- ✅ Fixed response format to match frontend expectations

**Files Created/Modified**:
- Backend:
  - `/apps/api/src/routes/cleaning-contracts.ts` ✅
  - `/apps/api/src/services/CleaningContractService.ts` ✅
  - Schema updates in Prisma ✅
- Frontend:
  - `/apps/web-cleaning/src/pages/CleaningContracts.tsx` ✅
  - `/apps/web-cleaning/src/components/contracts/CreateContractModal.tsx` ✅
  - `/apps/web-cleaning/src/components/contracts/ContractDetailsModal.tsx` ✅
  - Route added to App.tsx ✅
  - Sidebar navigation updated ✅

**CLEAN-103: Adapt Job Creation for Contracts** ⏳ IN PROGRESS (2 pts)
- ✅ CleaningJob model already supports `contract_id`
- ⏳ Need to build job creation flow from contracts
- ⏳ Need to integrate with property calendar
- ⏳ Need to build scheduling interface

**CLEAN-104: Work Information Sharing System** ⭐ ⏸️ NOT STARTED (4 pts)
- ⏸️ API endpoints for sharing work information across tenants
- ⏸️ Property details visible to workers
- ⏸️ Work updates visible to customers
- ⏸️ Three-way communication system (customer ↔ business ↔ workers)
- ⏸️ Role-based access control for information visibility
- ⏸️ Real-time updates when any party adds information

### Phase 2: Scheduling & Assignment (2-3 days)

**CLEAN-201: Worker Assignment** (2 pts)
- Reuse ContractorSchedulingModal (rename to WorkerSchedulingModal)
- Adapt for cleaning jobs
- Conflict detection for workers

**CLEAN-202: Cleaning Calendar View** (3 pts)
- Week/month calendar view
- Show scheduled cleans
- Worker assignment overlay
- Drag-and-drop rescheduling

### Phase 3: Timesheet & Completion ✅ COMPLETE (3-4 days)

**CLEAN-301: Timesheet API Service** ✅ COMPLETE (3 pts)
- ✅ CleaningJobTimesheetService with full CRUD operations
- ✅ Create/update/complete timesheet entries
- ✅ Automatic total hours calculation (end_time - start_time)
- ✅ Worker performance statistics (total hours, jobs completed, avg hours per job)
- ✅ Photo management for before/after/issue photos
- ✅ Automatic job status updates (SCHEDULED → IN_PROGRESS → COMPLETED)
- ✅ Worker ownership validation

**CLEAN-302: Timesheet API Routes** ✅ COMPLETE (2 pts)
- ✅ POST /api/cleaning-timesheets - Create timesheet
- ✅ GET /api/cleaning-timesheets/:id - Get by ID
- ✅ GET /api/cleaning-timesheets/job/:jobId - Get all for job
- ✅ GET /api/cleaning-timesheets/worker/:workerId - Get worker timesheets
- ✅ PUT /api/cleaning-timesheets/:id - Update timesheet
- ✅ POST /api/cleaning-timesheets/:id/complete - Complete job
- ✅ POST /api/cleaning-timesheets/:id/photos - Add photos
- ✅ GET /api/cleaning-timesheets/worker/:workerId/stats - Worker stats
- ✅ DELETE /api/cleaning-timesheets/:id - Delete timesheet

**CLEAN-303: Timesheet Frontend Components** ✅ COMPLETE (2 pts)
- ✅ StartJobModal - Modal for starting jobs
- ✅ CompleteJobModal - Modal for completing jobs with work description
- ✅ Integrated into CleaningJobDetails page
- ✅ Timesheet display with full history
- ✅ Photo count tracking (before/after/issue)
- ✅ Conditional action buttons based on job status
- ✅ Worker info and duration display
- ✅ Real-time job status updates

**Files Created**:
- Backend:
  - `/apps/api/src/services/CleaningJobTimesheetService.ts` ✅
  - `/apps/api/src/routes/cleaning-timesheets.ts` ✅
  - Route registered in `index.ts` ✅
- Frontend:
  - `/apps/web-cleaning/src/components/timesheet/StartJobModal.tsx` ✅
  - `/apps/web-cleaning/src/components/timesheet/CompleteJobModal.tsx` ✅
  - Updated `/apps/web-cleaning/src/pages/cleaning/CleaningJobDetails.tsx` ✅

### Phase 4: Customer Portal Integration (2-3 days)

**CLEAN-401: Customer Contract View** (2 pts)
- View active contracts
- List properties in contract
- View monthly fee

**CLEAN-402: Customer Clean Schedule** (2 pts)
- Calendar view of upcoming cleans
- View completed clean history
- Filter by property

**CLEAN-403: Customer Clean Details** (2 pts)
- Adapt MaintenanceJobDetails for cleaning
- View photos, timesheet, worker
- Add comments (same Kanban card pattern)
- Rate completed cleans

### Phase 5: Monthly Invoicing (3-4 days)

**CLEAN-501: Monthly Invoice Generation** (4 pts)
- CleaningInvoiceService
- Auto-generate on billing day
- Include all cleans from period
- Calculate totals

**CLEAN-502: Invoice Management UI** (2 pts)
- Cleaning business invoice list
- Manual invoice generation
- Mark as paid
- Resend invoice

**CLEAN-503: Customer Invoice View** (2 pts)
- View cleaning invoices
- Download/print invoice
- Payment history
- Photo summary attachment

---

## 🔄 Shared Customer Experience

### Same Customer, Two Services

The customer (e.g., "ABC Property Management") has:
- ✅ **Maintenance Contract**: Reactive, per-job quotes, pay per job
- ✅ **Cleaning Contract**: Proactive, monthly fee, scheduled cleans

**Customer Portal Tabs**:
```
Dashboard | Properties | Maintenance | Cleaning | Financial | Settings
                           ↓               ↓
                    Jobs & Quotes    Contract & Schedule
                    Issue Reports    Clean History
                    Invoices         Monthly Invoices
```

**Unified Financial View**:
- Maintenance invoices (per job)
- Cleaning invoices (monthly)
- Combined payment history
- Total spend analytics

---

## 📸 Key Requirements Coverage

### ✅ Scheduling
- **Week+ advance scheduling**: Calendar view, drag-and-drop
- **Worker assignment**: Reuse maintenance scheduling modal
- **Conflict detection**: Same logic as maintenance

### ✅ Timesheets
- **Clock in/out**: TimesheetEntry component
- **Manual entry**: Text input for hours
- **Total calculation**: Automatic
- **Link to job**: CleaningJobTimesheet table
- **Worker performance**: Track hours per worker

### ✅ Photos
- **Reuse PhotoUpload**: Same component as maintenance
- **Before/after**: Document work quality
- **Issue photos**: Document problems found
- **Customer access**: View in customer portal

### ✅ Property Information Sharing
- **Workers see**: Access codes, checklists, property details
- **Cleaning business sees**: All contract properties
- **Customer sees**: Their properties, add notes
- **Security**: Role-based access control

### ✅ Work Information Sharing (Cross-Tenant) ⭐
**Pattern**: Same as Maintenance Cross-Tenant Kanban Cards

**Three-Way Information Flow**:

1. **Customer → Workers** (via cleaning business):
   - Property access codes and instructions
   - Special cleaning requirements
   - Areas needing attention
   - Feedback on previous cleans

2. **Workers → Customer** (via cleaning business):
   - Before/after photos
   - Timesheet data (hours worked)
   - Issues found during cleaning
   - Completion notes

3. **Business → All**:
   - Schedules and assignments
   - Contract details
   - Quality standards
   - Communication hub

**Implementation**:
- Same comment/note system as maintenance
- Cleaning job accessible by all three parties (filtered by role)
- Real-time updates when any party adds information
- Audit trail of all communications
- Photos visible to all parties

**Benefits**:
- Transparency: Customer sees exactly what work was done
- Accountability: Workers document their work with photos
- Communication: All parties can add notes/requests
- Quality: Before/after photos prove work quality
- Efficiency: No duplicate data entry

---

## 🎯 Next Steps

### 1. Requirements Gathering ✅ COMPLETE

**Answers Received**:
1. ✅ **Monthly invoicing**: Summary/totals only (app shows detail)
2. ✅ **Property calendar**: Manual entry - checkout time + checkin time for next guest (same day to days apart)
3. ✅ **Timesheet**: Focus on recording work + checklist completion + before/after photos (manual entry focused)
4. ✅ **Contract pricing**: Build for both flexible and flat rate
5. ✅ **Auto-scheduling**: Manual creation to start, automation later
6. ✅ **Customer rescheduling**: Yes, but build to easily remove later

### 2. Database Migration
- [x] Create CleaningContract table ✅
- [x] Create ContractProperty table for property assignments ✅
- [x] Add contract_id to CleaningJob ✅
- [ ] Create CleaningJobTimesheet table
- [ ] Create CleaningInvoice table
- [ ] Migrate existing cleaning jobs if needed

### 3. Implementation Sprint
- [x] Start with Phase 1 (Contract Foundation) ✅ COMPLETE
- [x] Built contract management API with full CRUD ✅
- [x] Built contract management UI with property assignments ✅
- [ ] Move to Phase 2 (Scheduling & Assignment) ⏭️ NEXT
- [ ] Reuse as much as possible from maintenance
- [ ] Test with same customer as maintenance
- [ ] Document cleaning-specific patterns

---

## 🔧 Implementation Refinements Based on Requirements

### Monthly Invoice Summary View
```typescript
// Invoice shows contract totals, not itemized cleans
{
  invoice_number: "CLEAN-INV-2025-00001"
  billing_period: "January 2025"
  total_cleans_completed: 12
  contract_monthly_fee: 1500.00
  additional_charges: 250.00  // Optional extras
  total_amount: 1750.00
  status: "PENDING"
}
// Detailed clean history accessible in app separately
```

### Property Calendar Entry (Manual)
**Fields Needed**:
```typescript
{
  property_id: string
  guest_checkout_datetime: DateTime
  next_guest_checkin_datetime: DateTime
  clean_window_start: DateTime (calculated from checkout)
  clean_window_end: DateTime (calculated from checkin)
  notes: string  // "Same day turnover" or "2 day gap"
}
```

### Timesheet + Checklist Focused
**Primary Focus**: Work documentation, not just hours
```typescript
{
  cleaning_job_id: string
  worker_id: string
  work_performed: string  // Descriptive notes
  checklist_items_completed: string[]  // ["Kitchen cleaned", "Bathrooms sanitized"]
  before_photos: string[]
  after_photos: string[]
  issue_photos: string[]  // Problems found
  start_time: DateTime
  end_time: DateTime
  total_hours: Decimal (calculated)
}
```

### Contract Pricing Flexibility
**Support Both Models**:
```typescript
// Model 1: Flat monthly fee
contract_type: "FLAT_MONTHLY"
monthly_fee: 1500.00

// Model 2: Per-property pricing
contract_type: "PER_PROPERTY"
properties: [
  { property_id: "abc", monthly_fee: 500.00 },
  { property_id: "def", monthly_fee: 700.00 }
]
```

### Customer Reschedule Requests (Removable)
**Design Pattern**:
```typescript
// Add optional reschedule_request field to CleaningJob
reschedule_request?: {
  requested_by: "CUSTOMER" | "BUSINESS"
  requested_datetime: DateTime
  new_requested_datetime: DateTime
  reason: string
  status: "PENDING" | "APPROVED" | "DENIED"
}
// Easy to remove by simply not showing UI for customer requests
```

---

## 📊 Updated Implementation Priority

**Phase 1: Core Foundation** ✅ COMPLETE (Week 1)
- ✅ Contract management (both pricing models implemented)
  - FLAT_MONTHLY: Single monthly fee for all properties
  - PER_PROPERTY: Individual fees per property with automatic total calculation
- ✅ Contract CRUD operations (create, read, update, pause, resume, cancel)
- ✅ Property assignment to contracts with add/remove functionality
- ⏳ Property calendar entry (manual) - NEXT UP
- ⏳ Manual job creation - NEXT UP

**Phase 2: Worker Experience** (Week 2)
- Worker assignment & scheduling
- Checklist-based completion form
- Photo upload (before/after/issues)
- Timesheet entry

**Phase 3: Customer Portal** (Week 3)
- Contract view
- Clean schedule view
- Job details with photos
- Reschedule requests (optional feature)

**Phase 4: Invoicing** (Week 4)
- Monthly invoice generation (summary)
- Detailed clean history view
- Payment tracking

**Phase 5: Information Sharing** (Throughout)
- Cross-tenant job cards
- Three-way communication
- Photo visibility to all parties

---

**Status**: ✅ **REQUIREMENTS CONFIRMED - READY FOR IMPLEMENTATION**

*Plan created: 2025-11-03*
*Requirements confirmed: 2025-11-03*
*Ready to begin development*
