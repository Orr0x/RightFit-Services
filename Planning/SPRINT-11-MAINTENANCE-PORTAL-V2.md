# Sprint 11 - Maintenance Portal V2: Complete Rebuild

**Priority**: 🔴 PRIORITY 1
**Template Source**: Cleaning Portal (`apps/web-cleaning`)
**Target**: Maintenance Portal V2 (`apps/web-maintenance`)
**Strategy**: Build alongside existing portal for reference during debugging

---

## Executive Summary

Build a complete Maintenance Portal V2 by replicating the proven architecture and workflows from the Cleaning Portal. The new portal will support comprehensive maintenance job management including quotes, invoices, contractors, workers, properties, and customers - all adapted for maintenance-specific workflows.

### Key Differentiators from Cleaning Portal

1. **Contractors Page** - Separate from workers (already exists, needs enhancement)
2. **Maintenance-Specific Service Types** - Plumbing, Electrical, HVAC, etc. (vs. cleaning types)
3. **Different Customer Types** - Potentially landlord-specific vs. property-specific
4. **Priority-Based Workflow** - URGENT/HIGH/MEDIUM/LOW priorities
5. **Quote Approval Process** - More formal approval required before scheduling
6. **Parts & Materials Tracking** - Track parts needed and used

---

## Current State Analysis

### ✅ Already Exists in Maintenance Portal
- Basic routing structure
- MaintenanceDashboard
- MaintenanceJobs (list)
- CreateMaintenanceJob
- MaintenanceJobDetails
- Workers page
- Contractors page
- Properties page (basic)
- Financial page
- Certificates page
- Basic components (CalendarView, KanbanView, PhotoUpload)

### ❌ Missing from Maintenance Portal (Available in Cleaning)

**Property Management:**
- PropertyDetails page
- AddProperty page
- EditProperty page

**Customer Management:**
- Customers page (list)
- CustomerDetails page
- AddCustomer page
- EditCustomer page

**Financial Management:**
- Invoices page (list)
- InvoiceDetails page
- CreateInvoice page
- EditInvoice page
- Quotes page (list)
- QuoteDetails page
- CreateQuote page
- EditQuote page

**Worker/Contractor Management:**
- WorkerDetails page
- ContractorDetails page (need to add)
- WorkerReports page

**Job Management:**
- EditMaintenanceJob page
- Worker access denied page

**Planning & Organization:**
- PropertyCalendar page
- Enhanced dashboard with maintenance-specific metrics

**Components:**
- Complete timesheet components
- Quote/invoice modals
- Worker scheduling modals
- Customer selection components
- Property picker components

---

## Sprint Breakdown

### **Phase 1: Foundation & Core Infrastructure** (Days 1-2)

#### Task 1.1: API Client Setup
**File**: `apps/web-maintenance/src/lib/api.ts`
**Template**: `apps/web-cleaning/src/lib/api.ts`

**Actions:**
- [ ] Copy complete API client structure from cleaning portal
- [ ] Replace all `cleaning` references with `maintenance`
- [ ] Replace all `CleaningJob` types with `MaintenanceJob`
- [ ] Update endpoints:
  - `/cleaning-jobs` → `/maintenance-jobs`
  - `/cleaning-timesheets` → `/maintenance-timesheets`
  - `/cleaning-contracts` → `/maintenance-contracts` (if applicable)
- [ ] Add contractor-specific endpoints:
  - `GET /contractors` - List all contractors
  - `GET /contractors/:id` - Get contractor details
  - `POST /contractors` - Create contractor
  - `PUT /contractors/:id` - Update contractor
  - `DELETE /contractors/:id` - Delete contractor
  - `GET /contractors/:id/jobs` - Get contractor's maintenance jobs
  - `GET /contractors/:id/availability` - Get contractor availability
- [ ] Adapt service types:
  - Remove: `ONE_OFF`, `REGULAR`, `DEEP_CLEAN`, `TURNOVER`, `CHECK_IN`, `CHECK_OUT`
  - Add: `PLUMBING`, `ELECTRICAL`, `HVAC`, `CARPENTRY`, `PAINTING`, `ROOFING`, `GENERAL`, `EMERGENCY`
- [ ] Update priority levels:
  - Add: `URGENT`, `HIGH`, `MEDIUM`, `LOW`
- [ ] Add maintenance-specific fields:
  - `workDescription` - Detailed work description
  - `partsNeeded` - Parts required for job
  - `partsUsed` - Parts actually used
  - `estimatedCost` - Estimated cost
  - `actualCost` - Actual cost
  - `quoteRequired` - Whether quote needed
  - `quoteApproved` - Quote approval status

**Dependencies**: None
**Testing**: Verify all endpoints return correct data structure

---

#### Task 1.2: TypeScript Types & Interfaces
**Files**:
- `apps/web-maintenance/src/types/maintenance.ts` (new)
- `packages/shared/types/maintenance.ts` (new)

**Template**: `packages/shared/types/cleaning.ts`

**Actions:**
- [ ] Create maintenance-specific types:
```typescript
export type MaintenanceServiceType =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'CARPENTRY'
  | 'PAINTING'
  | 'ROOFING'
  | 'APPLIANCE_REPAIR'
  | 'PEST_CONTROL'
  | 'LANDSCAPING'
  | 'GENERAL'
  | 'EMERGENCY'

export type MaintenancePriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

export type MaintenanceJobStatus =
  | 'QUOTE_PENDING'
  | 'QUOTE_SENT'
  | 'QUOTE_APPROVED'
  | 'QUOTE_REJECTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'AWAITING_PARTS'
  | 'COMPLETED'
  | 'CANCELLED'

export interface MaintenanceJob {
  id: string
  propertyId: string
  customerId: string
  serviceType: MaintenanceServiceType
  priority: MaintenancePriority
  status: MaintenanceJobStatus
  workDescription: string
  issueCategory?: string
  partsNeeded?: string[]
  partsUsed?: string[]
  estimatedCost?: number
  actualCost?: number
  quoteRequired: boolean
  quoteApproved?: boolean
  assignedWorkerId?: string
  assignedContractorId?: string
  scheduledDate?: Date
  completedDate?: Date
  // ... inherit common fields from base Job type
}

export interface Contractor {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  company?: string
  specialties: MaintenanceServiceType[]
  rating?: number
  certifications?: string[]
  insuranceExpiry?: Date
  availability?: ContractorAvailability[]
  hourlyRate?: number
  createdAt: Date
  updatedAt: Date
}

export interface ContractorAvailability {
  contractorId: string
  dayOfWeek: number // 0-6
  startTime: string // HH:mm
  endTime: string // HH:mm
  isAvailable: boolean
}
```

**Dependencies**: None
**Testing**: Build check for type safety

---

#### Task 1.3: Shared Components Migration
**Directory**: `apps/web-maintenance/src/components/`
**Template**: `apps/web-cleaning/src/components/`

**Actions:**
- [ ] Copy and adapt layout components:
  - `layout/AppLayout.tsx` ✅ (exists, verify)
  - `layout/Sidebar.tsx`
  - `layout/Header.tsx`
  - `layout/MobileNav.tsx`
- [ ] Copy and adapt navigation components:
  - `navigation/Breadcrumbs.tsx`
  - `navigation/TabNavigation.tsx`
- [ ] Copy and adapt UI components (if not already in shared):
  - `ui/Button.tsx`
  - `ui/Card.tsx`
  - `ui/Modal.tsx`
  - `ui/Badge.tsx`
  - `ui/Toast.tsx`
  - `ui/Dropdown.tsx`
  - `ui/Table.tsx`
  - `ui/Tabs.tsx`
  - `ui/EmptyState.tsx`
  - `ui/LoadingSpinner.tsx`
- [ ] Update all component imports
- [ ] Update Sidebar navigation items for maintenance-specific routes
- [ ] Verify responsive design

**Dependencies**: Task 1.2 (types)
**Testing**: Visual check of layout, navigation works

---

### **Phase 2: Customer & Property Management** (Days 3-4)

#### Task 2.1: Properties Module
**Files**:
- `apps/web-maintenance/src/pages/PropertyDetails.tsx` (new)
- `apps/web-maintenance/src/pages/AddProperty.tsx` (new)
- `apps/web-maintenance/src/pages/EditProperty.tsx` (new)
- Update `apps/web-maintenance/src/pages/Properties.tsx`

**Template**: `apps/web-cleaning/src/pages/Property*.tsx`

**Actions:**
- [ ] **Properties.tsx** - Enhance existing page:
  - Add grid/list view toggle
  - Add search and filters (by customer, property type, location)
  - Add "Add Property" button
  - Add property cards with:
    - Address
    - Customer name
    - Active maintenance jobs count
    - Last maintenance date
    - Property image/thumbnail
  - Add pagination
- [ ] **PropertyDetails.tsx** - Create detailed view:
  - Property information (address, type, size, year built)
  - Customer information section
  - Maintenance history timeline
  - Active maintenance jobs list
  - Upcoming scheduled maintenance
  - Documents/certificates section
  - Photos gallery
  - Map view with GPS location
  - Edit and delete actions
- [ ] **AddProperty.tsx** - Create form:
  - Customer selection dropdown
  - Address fields (with autocomplete if possible)
  - Property type (HOUSE, APARTMENT, COMMERCIAL, etc.)
  - Property details (bedrooms, bathrooms, sqft)
  - GPS coordinates (optional, with map picker)
  - Access instructions
  - Special notes
  - Photo upload
  - Form validation
- [ ] **EditProperty.tsx** - Edit form:
  - Same as AddProperty but pre-populated
  - Track edit history
- [ ] Add routing:
  ```typescript
  <Route path="/properties" />
  <Route path="/properties/new" />
  <Route path="/properties/:id" />
  <Route path="/properties/:id/edit" />
  ```

**Dependencies**: Task 1.1 (API), Task 1.2 (types), Task 1.3 (components)
**Testing**: CRUD operations work, navigation flows correctly

---

#### Task 2.2: Customers Module
**Files**:
- `apps/web-maintenance/src/pages/Customers.tsx` (new)
- `apps/web-maintenance/src/pages/CustomerDetails.tsx` (new)
- `apps/web-maintenance/src/pages/AddCustomer.tsx` (new)
- `apps/web-maintenance/src/pages/EditCustomer.tsx` (new)

**Template**: `apps/web-cleaning/src/pages/Customer*.tsx`

**Actions:**
- [ ] **Customers.tsx** - Create list view:
  - Customer cards/table with:
    - Name, email, phone
    - Number of properties
    - Active jobs count
    - Total spend (YTD)
    - Customer type badge
  - Search by name, email, phone
  - Filter by customer type, status
  - Sort by name, properties, spend, created date
  - "Add Customer" button
  - Export to CSV
- [ ] **CustomerDetails.tsx** - Create detailed view:
  - Customer contact information
  - Customer type (LANDLORD, PROPERTY_MANAGER, HOMEOWNER, TENANT)
  - Properties list (with links)
  - Maintenance jobs history
  - Quotes history
  - Invoices history
  - Notes section
  - Communication history
  - Edit and delete actions
- [ ] **AddCustomer.tsx** - Create form:
  - Name, email, phone (required)
  - Customer type selection
  - Address
  - Company name (optional)
  - Billing address
  - Payment terms
  - Notes
  - Form validation (email format, phone format)
- [ ] **EditCustomer.tsx** - Edit form:
  - Same as AddCustomer but pre-populated
  - Track edit history
- [ ] Add routing:
  ```typescript
  <Route path="/customers" />
  <Route path="/customers/new" />
  <Route path="/customers/:id" />
  <Route path="/customers/:id/edit" />
  ```

**Dependencies**: Task 1.1 (API), Task 1.2 (types), Task 1.3 (components)
**Testing**: CRUD operations work, customer-property relationships display correctly

---

### **Phase 3: Job Management Enhancement** (Days 5-7)

#### Task 3.1: Enhanced Job Creation & Editing
**Files**:
- Update `apps/web-maintenance/src/pages/maintenance/CreateMaintenanceJob.tsx`
- `apps/web-maintenance/src/pages/maintenance/EditMaintenanceJob.tsx` (new)

**Template**: `apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx`

**Actions:**
- [ ] **CreateMaintenanceJob.tsx** - Enhance form:
  - Tab-based layout:
    - **Job Details Tab:**
      - Service type dropdown (PLUMBING, ELECTRICAL, etc.)
      - Priority selector (URGENT/HIGH/MEDIUM/LOW with color codes)
      - Property selection (searchable dropdown)
      - Customer auto-populated from property
      - Work description (rich text)
      - Issue category/tags
      - Estimated hours
      - Parts needed (dynamic list)
    - **Scheduling Tab:**
      - Assign to worker OR contractor
      - Scheduled date/time picker
      - Duration estimate
      - Recurring maintenance setup (optional)
      - Calendar availability view
    - **Financial Tab:**
      - Quote required checkbox
      - Estimated cost input
      - Quote details (if required)
      - Billing notes
      - Payment terms
    - **Attachments Tab:**
      - Photo upload (before/issue photos)
      - Document upload (quotes, permits)
      - Reference links
  - Form validation
  - Save as draft functionality
  - Create and notify assignee
- [ ] **EditMaintenanceJob.tsx** - Create edit page:
  - Same layout as create
  - Pre-populate with existing data
  - Track change history
  - Prevent editing if job is IN_PROGRESS or COMPLETED (unless admin)
  - Show "edited by" metadata
- [ ] Add routing:
  ```typescript
  <Route path="/jobs/:id/edit" />
  ```

**Dependencies**: Task 1.1 (API), Task 1.2 (types), Task 2.1 (properties), Task 2.2 (customers)
**Testing**: Create job, edit job, validation works, draft saving works

---

#### Task 3.2: Enhanced Job Details View
**Files**:
- Update `apps/web-maintenance/src/pages/MaintenanceJobDetails.tsx`

**Template**: `apps/web-cleaning/src/pages/cleaning/CleaningJobDetails.tsx`

**Actions:**
- [ ] Enhance job details page with tabs:
  - **Overview Tab:**
    - Job status badge with color coding
    - Priority indicator
    - Service type and description
    - Property details card (with link)
    - Customer details card (with link)
    - Assigned worker/contractor card
    - Scheduled date/time
    - Quick actions (Edit, Cancel, Reassign, Complete)
  - **Timeline Tab:**
    - Visual timeline of job progression
    - Status changes (QUOTE_PENDING → QUOTE_SENT → APPROVED → SCHEDULED → IN_PROGRESS → COMPLETED)
    - Notes and updates
    - Communication log
    - Photos added at each stage
  - **Financial Tab:**
    - Quote details (if applicable)
    - Quote approval status
    - Estimated vs actual costs
    - Parts needed vs parts used
    - Invoice details (if invoiced)
    - Payment status
  - **Photos Tab:**
    - Before photos
    - In-progress photos
    - After/completion photos
    - Issue photos
    - Photo upload capability
    - Photo comments/annotations
  - **Documents Tab:**
    - Quotes
    - Invoices
    - Permits
    - Completion certificates
    - Upload capability
  - **History Tab:**
    - Audit trail of all changes
    - Who made changes and when
    - Status changes
    - Reassignments
    - Cost updates
- [ ] Add action buttons:
  - Start Job (if SCHEDULED)
  - Complete Job (with modal)
  - Request Quote
  - Approve/Reject Quote
  - Create Invoice
  - Reassign Worker/Contractor
  - Cancel Job
  - Generate Report
- [ ] Add modals:
  - Complete job modal (with photos, notes, parts used, actual cost)
  - Quote request modal
  - Quote approval modal
  - Reassignment modal
  - Cancellation modal

**Dependencies**: Task 1.1 (API), Task 3.1 (enhanced job creation)
**Testing**: All tabs display correctly, modals work, actions update job status

---

#### Task 3.3: Enhanced Job List View
**Files**:
- Update `apps/web-maintenance/src/pages/maintenance/MaintenanceJobs.tsx`

**Template**: `apps/web-cleaning/src/pages/cleaning/CleaningJobs.tsx`

**Actions:**
- [ ] Add view toggles:
  - List view
  - Grid view
  - Kanban board (by status)
  - Calendar view
- [ ] Enhance list/grid view:
  - Job cards showing:
    - Priority badge
    - Service type
    - Property address
    - Customer name
    - Assigned worker/contractor
    - Status badge
    - Scheduled date
    - Quick action buttons
  - Sorting options (priority, date, status, service type)
  - Filters:
    - By status
    - By priority
    - By service type
    - By assigned worker/contractor
    - By property
    - By customer
    - By date range
  - Search by job ID, property address, customer name
- [ ] Add Kanban board:
  - Columns: QUOTE_PENDING, QUOTE_SENT, SCHEDULED, IN_PROGRESS, COMPLETED
  - Drag-and-drop to change status
  - Card counts per column
  - Filter options
- [ ] Add Calendar view:
  - Monthly calendar with scheduled jobs
  - Color-coded by priority
  - Click to view details
  - Filter by worker/contractor
- [ ] Add bulk actions:
  - Bulk reassign
  - Bulk status update
  - Bulk export

**Dependencies**: Task 1.1 (API), Task 1.3 (KanbanView, CalendarView components)
**Testing**: All views work, filters apply correctly, drag-drop updates status

---

### **Phase 4: Quotes & Invoices** (Days 8-10)

#### Task 4.1: Quotes Module
**Files**:
- `apps/web-maintenance/src/pages/Quotes.tsx` (new)
- `apps/web-maintenance/src/pages/QuoteDetails.tsx` (new)
- `apps/web-maintenance/src/pages/CreateQuote.tsx` (new)
- `apps/web-maintenance/src/pages/EditQuote.tsx` (new)

**Template**: `apps/web-cleaning/src/pages/Quote*.tsx`

**Actions:**
- [ ] **Quotes.tsx** - Create list view:
  - Quote table/cards with:
    - Quote number
    - Customer name
    - Property address
    - Service type
    - Amount
    - Status (DRAFT, SENT, APPROVED, REJECTED, EXPIRED)
    - Created date
    - Expiry date
  - Search and filters (by status, customer, date range)
  - "Create Quote" button
  - Export to PDF/CSV
  - Send quote action
- [ ] **QuoteDetails.tsx** - Create detailed view:
  - Quote header (number, date, expiry)
  - Customer and property information
  - Related job details (if from job)
  - Line items:
    - Service description
    - Quantity
    - Unit price
    - Total
  - Parts/materials breakdown
  - Labor costs
  - Subtotal, tax, total
  - Terms and conditions
  - Notes
  - Status and approval information
  - Actions:
    - Edit (if DRAFT)
    - Send to customer
    - Mark as approved/rejected
    - Convert to job
    - Convert to invoice
    - Download PDF
    - Duplicate quote
- [ ] **CreateQuote.tsx** - Create form:
  - Customer selection
  - Property selection
  - Link to existing job (optional)
  - Service type
  - Quote expiry date
  - Line items builder:
    - Add/remove line items
    - Description, quantity, unit price
  - Parts/materials section
  - Labor hours and rates
  - Tax settings
  - Terms and conditions editor
  - Notes
  - Save as draft or send immediately
  - PDF preview
- [ ] **EditQuote.tsx** - Edit form:
  - Same as CreateQuote but pre-populated
  - Can only edit if status is DRAFT
  - Version history tracking
- [ ] Add routing:
  ```typescript
  <Route path="/quotes" />
  <Route path="/quotes/new" />
  <Route path="/quotes/:id" />
  <Route path="/quotes/:id/edit" />
  ```
- [ ] Add quote PDF generation functionality
- [ ] Add email quote functionality

**Dependencies**: Task 1.1 (API), Task 2.2 (customers), Task 3.1 (jobs)
**Testing**: CRUD works, PDF generation works, email sending works, quote approval flow works

---

#### Task 4.2: Invoices Module
**Files**:
- `apps/web-maintenance/src/pages/Invoices.tsx` (new)
- `apps/web-maintenance/src/pages/InvoiceDetails.tsx` (new)
- `apps/web-maintenance/src/pages/CreateInvoice.tsx` (new)
- `apps/web-maintenance/src/pages/EditInvoice.tsx` (new)

**Template**: `apps/web-cleaning/src/pages/Invoice*.tsx`

**Actions:**
- [ ] **Invoices.tsx** - Create list view:
  - Invoice table/cards with:
    - Invoice number
    - Customer name
    - Property address
    - Amount
    - Status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
    - Issue date
    - Due date
    - Payment date
  - Search and filters (by status, customer, date range)
  - Financial summary (total outstanding, overdue, paid this month)
  - "Create Invoice" button
  - Export to PDF/CSV
  - Send invoice action
  - Record payment action
- [ ] **InvoiceDetails.tsx** - Create detailed view:
  - Invoice header (number, dates, payment terms)
  - Customer billing information
  - Property information
  - Related job(s) details
  - Related quote (if converted from quote)
  - Line items breakdown
  - Subtotal, tax, total
  - Amount paid
  - Balance due
  - Payment history
  - Terms and conditions
  - Notes
  - Status indicator
  - Actions:
    - Edit (if DRAFT)
    - Send to customer
    - Record payment
    - Mark as paid
    - Mark as void
    - Download PDF
    - Email invoice
    - Create credit note
- [ ] **CreateInvoice.tsx** - Create form:
  - Customer selection
  - Property selection (optional)
  - Link to completed job(s)
  - Link to approved quote (optional)
  - Invoice date
  - Due date
  - Payment terms
  - Line items builder (similar to quotes)
  - Can import from quote
  - Can import from job actual costs
  - Tax settings
  - Terms and conditions
  - Notes
  - Save as draft or send immediately
  - PDF preview
- [ ] **EditInvoice.tsx** - Edit form:
  - Same as CreateInvoice but pre-populated
  - Can only edit if status is DRAFT
  - Version history tracking
- [ ] Add routing:
  ```typescript
  <Route path="/invoices" />
  <Route path="/invoices/new" />
  <Route path="/invoices/:id" />
  <Route path="/invoices/:id/edit" />
  ```
- [ ] Add invoice PDF generation
- [ ] Add payment recording modal
- [ ] Add payment gateway integration (future)

**Dependencies**: Task 1.1 (API), Task 2.2 (customers), Task 3.1 (jobs), Task 4.1 (quotes)
**Testing**: CRUD works, PDF generation works, payment recording works, status updates correctly

---

### **Phase 5: Worker & Contractor Management** (Days 11-12)

#### Task 5.1: Workers Module Enhancement
**Files**:
- Update `apps/web-maintenance/src/pages/Workers.tsx`
- `apps/web-maintenance/src/pages/WorkerDetails.tsx` (new)

**Template**: `apps/web-cleaning/src/pages/Workers.tsx` and `WorkerDetails.tsx`

**Actions:**
- [ ] **Workers.tsx** - Enhance list view:
  - Worker cards with:
    - Name, photo
    - Contact info
    - Specialties (service types)
    - Current job status
    - Jobs completed this month
    - Rating/performance
    - Availability indicator
  - Search by name, email, phone
  - Filter by specialty, availability, status
  - "Add Worker" button (if applicable)
  - Schedule view option
- [ ] **WorkerDetails.tsx** - Create detailed view:
  - Worker profile:
    - Contact information
    - Employment details
    - Specialties/skills
    - Certifications
    - Hourly rate
  - Performance metrics:
    - Jobs completed
    - Average rating
    - On-time completion rate
    - Customer satisfaction
  - Current and upcoming jobs
  - Job history
  - Availability calendar
  - Documents (certifications, insurance)
  - Notes
  - Edit profile action
- [ ] Add routing:
  ```typescript
  <Route path="/workers/:id" />
  ```

**Dependencies**: Task 1.1 (API), Task 3.2 (job details)
**Testing**: Worker list displays, details page shows complete info, navigation works

---

#### Task 5.2: Contractors Module Enhancement
**Files**:
- Update `apps/web-maintenance/src/pages/Contractors.tsx`
- `apps/web-maintenance/src/pages/ContractorDetails.tsx` (new)
- `apps/web-maintenance/src/pages/AddContractor.tsx` (new)
- `apps/web-maintenance/src/pages/EditContractor.tsx` (new)

**Template**: Similar to Workers module but adapted for external contractors

**Actions:**
- [ ] **Contractors.tsx** - Enhance list view:
  - Contractor cards with:
    - Company name, contact person
    - Contact info
    - Specialties (service types)
    - Current job status
    - Jobs completed
    - Rating/performance
    - Insurance expiry date
    - Availability indicator
  - Search by name, company, specialty
  - Filter by specialty, availability, insurance status
  - "Add Contractor" button
  - Schedule view option
- [ ] **ContractorDetails.tsx** - Create detailed view:
  - Contractor profile:
    - Company information
    - Contact person details
    - Specialties/services offered
    - Certifications and licenses
    - Insurance details and expiry
    - Hourly/project rates
    - Payment terms
  - Performance metrics:
    - Jobs completed
    - Average rating
    - On-time completion rate
    - Customer satisfaction
  - Current and upcoming jobs
  - Job history
  - Availability calendar
  - Documents (insurance, licenses, certifications)
  - Contract/agreement documents
  - Notes
  - Edit and delete actions
- [ ] **AddContractor.tsx** - Create form:
  - Company name
  - Contact person (name, email, phone)
  - Business address
  - Specialties selection (multi-select)
  - Hourly rate / project rate
  - Payment terms
  - Insurance details (policy number, expiry)
  - Certifications
  - License numbers
  - Availability settings
  - Document upload (insurance cert, licenses)
  - Notes
  - Form validation
- [ ] **EditContractor.tsx** - Edit form:
  - Same as AddContractor but pre-populated
  - Track edit history
- [ ] Add contractor scheduling modal:
  - Show contractor availability
  - Show conflicting jobs
  - Allow direct assignment to jobs
- [ ] Add routing:
  ```typescript
  <Route path="/contractors/:id" />
  <Route path="/contractors/new" />
  <Route path="/contractors/:id/edit" />
  ```

**Dependencies**: Task 1.1 (API with contractor endpoints), Task 1.2 (Contractor types), Task 3.2 (job details)
**Testing**: CRUD operations work, contractor assignment to jobs works, availability tracking works

---

### **Phase 6: Planning & Organization** (Days 13-14)

#### Task 6.1: Property Calendar
**Files**:
- `apps/web-maintenance/src/pages/PropertyCalendar.tsx` (new)

**Template**: `apps/web-cleaning/src/pages/PropertyCalendar.tsx`

**Actions:**
- [ ] Create calendar view:
  - Monthly calendar view
  - Weekly view option
  - Daily view option
  - Show scheduled maintenance jobs
  - Color-coded by:
    - Priority (URGENT = red, HIGH = orange, etc.)
    - Service type
    - Status
  - Click job to view details
  - Drag-and-drop to reschedule (with confirmation)
  - Filter by:
    - Property
    - Service type
    - Worker/contractor
    - Priority
  - Add new job directly from calendar
  - Show contractor/worker availability
  - Show conflicting schedules
  - Export calendar view
- [ ] Add recurring maintenance scheduling:
  - Set up recurring jobs (weekly, monthly, quarterly, yearly)
  - Auto-generate future jobs
  - Manage recurring job templates
- [ ] Add routing:
  ```typescript
  <Route path="/calendar" />
  ```

**Dependencies**: Task 1.1 (API), Task 3.1 (jobs), Task 5.1 (workers), Task 5.2 (contractors)
**Testing**: Calendar displays correctly, drag-drop reschedules jobs, filters work

---

#### Task 6.2: Enhanced Dashboard
**Files**:
- Update `apps/web-maintenance/src/pages/dashboards/MaintenanceDashboard.tsx`

**Template**: `apps/web-cleaning/src/pages/dashboards/CleaningDashboard.tsx`

**Actions:**
- [ ] Add dashboard widgets:
  - **Overview Cards:**
    - Active jobs count (with trend)
    - Pending quotes count
    - Overdue invoices amount
    - Revenue this month
  - **Priority Jobs:**
    - List of urgent jobs
    - List of high-priority jobs
    - Overdue jobs
  - **Calendar Widget:**
    - Today's scheduled jobs
    - This week's jobs
    - Quick view calendar
  - **Financial Summary:**
    - Revenue chart (monthly)
    - Expenses vs revenue
    - Outstanding invoices
    - Quote conversion rate
  - **Worker/Contractor Activity:**
    - Active workers/contractors
    - Availability overview
    - Performance summary
  - **Recent Activity:**
    - Recent job completions
    - Recent quotes sent
    - Recent payments received
    - Recent job requests
  - **Alerts/Notifications:**
    - Expired insurance (contractors)
    - Upcoming renewals
    - Overdue jobs
    - Customer communications needed
- [ ] Add quick actions:
  - Create new job
  - Create quote
  - Create invoice
  - View calendar
- [ ] Add date range selector
- [ ] Add export dashboard data
- [ ] Make widgets draggable/customizable

**Dependencies**: All previous tasks (dashboard pulls data from all modules)
**Testing**: All widgets display correct data, quick actions work, date range filtering works

---

#### Task 6.3: Worker Reports
**Files**:
- `apps/web-maintenance/src/pages/WorkerReports.tsx` (new)

**Template**: `apps/web-cleaning/src/pages/WorkerReports.tsx`

**Actions:**
- [ ] Create reporting page:
  - **Worker Performance Reports:**
    - Jobs completed per worker
    - Average completion time
    - Customer ratings
    - On-time percentage
    - Revenue generated
  - **Contractor Performance Reports:**
    - Same metrics as workers
    - Cost comparison
    - Quality metrics
  - **Service Type Reports:**
    - Jobs by service type
    - Average cost per service type
    - Frequency analysis
    - Seasonal trends
  - **Financial Reports:**
    - Revenue by period
    - Expenses breakdown
    - Profit margins
    - Outstanding payments
  - **Customer Reports:**
    - Top customers by revenue
    - Customer satisfaction scores
    - Repeat customers
  - Report filters:
    - Date range
    - Worker/contractor
    - Service type
    - Customer
    - Property
  - Export options (PDF, CSV, Excel)
  - Visualizations (charts, graphs)
- [ ] Add routing:
  ```typescript
  <Route path="/reports" />
  ```

**Dependencies**: Task 1.1 (API), all modules for report data
**Testing**: Reports generate correctly, filters work, exports work

---

### **Phase 7: Modals & Interactions** (Days 15-16)

#### Task 7.1: Job Workflow Modals
**Files**:
- `apps/web-maintenance/src/components/modals/StartJobModal.tsx` (new)
- `apps/web-maintenance/src/components/modals/CompleteJobModal.tsx` (new)
- `apps/web-maintenance/src/components/modals/QuoteRequestModal.tsx` (new)
- `apps/web-maintenance/src/components/modals/QuoteApprovalModal.tsx` (new)
- `apps/web-maintenance/src/components/modals/ReassignJobModal.tsx` (new)
- `apps/web-maintenance/src/components/modals/CancelJobModal.tsx` (new)

**Template**: `apps/web-cleaning/src/components/timesheet/` and modals

**Actions:**
- [ ] **StartJobModal.tsx:**
  - Confirm job start
  - Add starting notes
  - Upload initial photos
  - Record start time
  - Update job status to IN_PROGRESS
- [ ] **CompleteJobModal.tsx:**
  - Completion checklist
  - Work performed summary
  - Parts used (with quantities)
  - Actual hours worked
  - Actual cost
  - Upload completion photos
  - Customer signature (optional)
  - Completion notes
  - Update job status to COMPLETED
- [ ] **QuoteRequestModal.tsx:**
  - Service type
  - Work description
  - Estimated costs
  - Estimated time
  - Parts needed
  - Quote expiry date
  - Special notes
  - Generate quote or create draft
- [ ] **QuoteApprovalModal.tsx:**
  - Show quote details
  - Approve/reject decision
  - Approval notes
  - Schedule job (if approved)
  - Send notification
- [ ] **ReassignJobModal.tsx:**
  - Select new worker/contractor
  - Show availability
  - Reason for reassignment
  - Notify old and new assignee
- [ ] **CancelJobModal.tsx:**
  - Cancellation reason
  - Refund processing (if applicable)
  - Notification to customer
  - Update job status to CANCELLED

**Dependencies**: Task 1.1 (API), Task 3.2 (job details)
**Testing**: All modals open/close, form validation, API calls update job correctly

---

#### Task 7.2: Selection & Picker Components
**Files**:
- `apps/web-maintenance/src/components/pickers/CustomerPicker.tsx` (new)
- `apps/web-maintenance/src/components/pickers/PropertyPicker.tsx` (new)
- `apps/web-maintenance/src/components/pickers/WorkerPicker.tsx` (new)
- `apps/web-maintenance/src/components/pickers/ContractorPicker.tsx` (new)
- `apps/web-maintenance/src/components/pickers/ServiceTypePicker.tsx` (new)

**Template**: Similar components from cleaning portal

**Actions:**
- [ ] **CustomerPicker.tsx:**
  - Searchable dropdown
  - Shows customer name, email, properties count
  - Option to create new customer inline
  - Recent customers list
- [ ] **PropertyPicker.tsx:**
  - Searchable dropdown
  - Filter by customer
  - Shows property address, customer, type
  - Option to create new property inline
  - Recent properties list
- [ ] **WorkerPicker.tsx:**
  - Searchable dropdown
  - Filter by specialty
  - Shows availability indicator
  - Shows current job count
  - Option to view worker details
- [ ] **ContractorPicker.tsx:**
  - Searchable dropdown
  - Filter by specialty
  - Shows availability indicator
  - Shows rating
  - Shows insurance status
  - Option to view contractor details
- [ ] **ServiceTypePicker.tsx:**
  - Dropdown with icons
  - Color-coded by category
  - Search/filter
  - Grouped by category (emergency, routine, etc.)

**Dependencies**: Task 1.2 (types), Task 2.1 (properties), Task 2.2 (customers), Task 5.1 (workers), Task 5.2 (contractors)
**Testing**: All pickers load data, search works, selection updates parent component

---

### **Phase 8: Backend API Implementation** (Days 17-19)

#### Task 8.1: Maintenance Jobs API Routes
**Files**:
- Update `apps/api/src/routes/maintenance-jobs.ts`
- Update `apps/api/src/services/maintenance-jobs.service.ts`

**Template**: `apps/api/src/routes/cleaning-jobs.ts`

**Actions:**
- [ ] Implement/enhance endpoints:
  - `GET /maintenance-jobs` - List with filters (status, priority, service type, worker, contractor, property, customer)
  - `GET /maintenance-jobs/:id` - Get single job with all relations
  - `POST /maintenance-jobs` - Create job
  - `PUT /maintenance-jobs/:id` - Update job
  - `DELETE /maintenance-jobs/:id` - Delete job (soft delete)
  - `PATCH /maintenance-jobs/:id/status` - Update status
  - `PATCH /maintenance-jobs/:id/assign-worker` - Assign worker
  - `PATCH /maintenance-jobs/:id/assign-contractor` - Assign contractor
  - `PATCH /maintenance-jobs/:id/start` - Start job
  - `PATCH /maintenance-jobs/:id/complete` - Complete job
  - `GET /maintenance-jobs/:id/history` - Get job history
  - `POST /maintenance-jobs/:id/notes` - Add note
  - `POST /maintenance-jobs/:id/photos` - Upload photos
  - `GET /maintenance-jobs/:id/timeline` - Get timeline
- [ ] Add validation middleware
- [ ] Add authorization checks
- [ ] Add notification triggers

**Dependencies**: Database schema for MaintenanceJob
**Testing**: All endpoints return correct data, validation works, authorization works

---

#### Task 8.2: Contractors API Routes
**Files**:
- `apps/api/src/routes/contractors.ts` (new or update)
- `apps/api/src/services/contractors.service.ts` (new or update)

**Actions:**
- [ ] Implement endpoints:
  - `GET /contractors` - List with filters
  - `GET /contractors/:id` - Get contractor details
  - `POST /contractors` - Create contractor
  - `PUT /contractors/:id` - Update contractor
  - `DELETE /contractors/:id` - Delete contractor
  - `GET /contractors/:id/jobs` - Get contractor's jobs
  - `GET /contractors/:id/availability` - Get availability
  - `POST /contractors/:id/availability` - Set availability
  - `GET /contractors/:id/performance` - Get performance metrics
  - `POST /contractors/:id/documents` - Upload documents
- [ ] Add validation middleware
- [ ] Add authorization checks
- [ ] Add insurance expiry alerts

**Dependencies**: Database schema for Contractor
**Testing**: CRUD operations work, availability tracking works

---

#### Task 8.3: Quotes API Routes
**Files**:
- `apps/api/src/routes/maintenance-quotes.ts` (new or update)
- `apps/api/src/services/maintenance-quotes.service.ts` (new or update)

**Template**: `apps/api/src/routes/cleaning-quotes.ts`

**Actions:**
- [ ] Implement endpoints:
  - `GET /maintenance-quotes` - List with filters
  - `GET /maintenance-quotes/:id` - Get quote details
  - `POST /maintenance-quotes` - Create quote
  - `PUT /maintenance-quotes/:id` - Update quote
  - `DELETE /maintenance-quotes/:id` - Delete quote
  - `PATCH /maintenance-quotes/:id/send` - Send quote to customer
  - `PATCH /maintenance-quotes/:id/approve` - Approve quote
  - `PATCH /maintenance-quotes/:id/reject` - Reject quote
  - `POST /maintenance-quotes/:id/convert-to-job` - Convert to job
  - `POST /maintenance-quotes/:id/convert-to-invoice` - Convert to invoice
  - `GET /maintenance-quotes/:id/pdf` - Generate PDF
- [ ] Add quote number generation
- [ ] Add validation middleware
- [ ] Add email sending for quotes
- [ ] Add PDF generation service

**Dependencies**: Database schema for MaintenanceQuote
**Testing**: CRUD works, PDF generation works, email works, conversions work

---

#### Task 8.4: Invoices API Routes
**Files**:
- `apps/api/src/routes/maintenance-invoices.ts` (new or update)
- `apps/api/src/services/maintenance-invoices.service.ts` (new or update)

**Template**: `apps/api/src/routes/cleaning-invoices.ts`

**Actions:**
- [ ] Implement endpoints:
  - `GET /maintenance-invoices` - List with filters
  - `GET /maintenance-invoices/:id` - Get invoice details
  - `POST /maintenance-invoices` - Create invoice
  - `PUT /maintenance-invoices/:id` - Update invoice
  - `DELETE /maintenance-invoices/:id` - Delete invoice (void)
  - `PATCH /maintenance-invoices/:id/send` - Send invoice to customer
  - `POST /maintenance-invoices/:id/payments` - Record payment
  - `GET /maintenance-invoices/:id/pdf` - Generate PDF
  - `GET /maintenance-invoices/stats` - Get financial stats
- [ ] Add invoice number generation
- [ ] Add validation middleware
- [ ] Add payment processing
- [ ] Add PDF generation service
- [ ] Add email sending for invoices

**Dependencies**: Database schema for MaintenanceInvoice
**Testing**: CRUD works, PDF generation works, payment recording works, email works

---

### **Phase 9: Database Schema & Migrations** (Day 20)

#### Task 9.1: Database Schema Updates
**Files**:
- `packages/database/prisma/schema.prisma`

**Actions:**
- [ ] Verify/update MaintenanceJob model:
```prisma
model MaintenanceJob {
  id                   String                @id @default(cuid())
  tenantId             String
  propertyId           String
  customerId           String
  serviceType          MaintenanceServiceType
  priority             MaintenancePriority   @default(MEDIUM)
  status               MaintenanceJobStatus  @default(QUOTE_PENDING)
  workDescription      String                @db.Text
  issueCategory        String?
  partsNeeded          Json?                 // Array of parts
  partsUsed            Json?                 // Array of parts used
  estimatedCost        Decimal?              @db.Decimal(10, 2)
  actualCost           Decimal?              @db.Decimal(10, 2)
  estimatedHours       Decimal?              @db.Decimal(5, 2)
  actualHours          Decimal?              @db.Decimal(5, 2)
  quoteRequired        Boolean               @default(false)
  quoteApproved        Boolean?
  quoteId              String?
  invoiceId            String?
  assignedWorkerId     String?
  assignedContractorId String?
  scheduledDate        DateTime?
  completedDate        DateTime?
  sourceType           String?               // 'CLEANING_ISSUE', 'GUEST_REPORT', 'INSPECTION', 'SCHEDULED'
  sourceId             String?
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt

  // Relations
  tenant               Tenant                @relation(fields: [tenantId], references: [id])
  property             Property              @relation(fields: [propertyId], references: [id])
  customer             Customer              @relation(fields: [customerId], references: [id])
  assignedWorker       User?                 @relation("MaintenanceWorker", fields: [assignedWorkerId], references: [id])
  assignedContractor   Contractor?           @relation(fields: [assignedContractorId], references: [id])
  quote                MaintenanceQuote?     @relation(fields: [quoteId], references: [id])
  invoice              MaintenanceInvoice?   @relation(fields: [invoiceId], references: [id])
  timesheets           MaintenanceTimesheet[]
  photos               MaintenancePhoto[]
  history              MaintenanceJobHistory[]
  documents            MaintenanceDocument[]

  @@index([tenantId, status])
  @@index([tenantId, priority])
  @@index([tenantId, serviceType])
  @@index([tenantId, propertyId])
  @@index([tenantId, customerId])
  @@index([assignedWorkerId])
  @@index([assignedContractorId])
}

enum MaintenanceServiceType {
  PLUMBING
  ELECTRICAL
  HVAC
  CARPENTRY
  PAINTING
  ROOFING
  APPLIANCE_REPAIR
  PEST_CONTROL
  LANDSCAPING
  GENERAL
  EMERGENCY
}

enum MaintenancePriority {
  URGENT
  HIGH
  MEDIUM
  LOW
}

enum MaintenanceJobStatus {
  QUOTE_PENDING
  QUOTE_SENT
  QUOTE_APPROVED
  QUOTE_REJECTED
  SCHEDULED
  IN_PROGRESS
  AWAITING_PARTS
  COMPLETED
  CANCELLED
}
```

- [ ] Add Contractor model:
```prisma
model Contractor {
  id                String                   @id @default(cuid())
  tenantId          String
  name              String
  email             String
  phone             String
  company           String?
  specialties       Json                      // Array of MaintenanceServiceType
  rating            Decimal?                  @db.Decimal(3, 2)
  hourlyRate        Decimal?                  @db.Decimal(10, 2)
  certifications    Json?                     // Array of certifications
  insuranceExpiry   DateTime?
  insurancePolicy   String?
  licenseNumbers    Json?                     // Array of license numbers
  paymentTerms      String?
  isActive          Boolean                   @default(true)
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt

  // Relations
  tenant            Tenant                    @relation(fields: [tenantId], references: [id])
  maintenanceJobs   MaintenanceJob[]
  availability      ContractorAvailability[]
  documents         ContractorDocument[]

  @@unique([tenantId, email])
  @@index([tenantId, isActive])
}

model ContractorAvailability {
  id            String     @id @default(cuid())
  contractorId  String
  dayOfWeek     Int        // 0-6 (Sunday-Saturday)
  startTime     String     // HH:mm format
  endTime       String     // HH:mm format
  isAvailable   Boolean    @default(true)

  contractor    Contractor @relation(fields: [contractorId], references: [id])

  @@unique([contractorId, dayOfWeek])
}
```

- [ ] Add MaintenanceQuote model:
```prisma
model MaintenanceQuote {
  id            String                @id @default(cuid())
  tenantId      String
  quoteNumber   String                @unique
  customerId    String
  propertyId    String
  jobId         String?
  serviceType   MaintenanceServiceType
  status        QuoteStatus           @default(DRAFT)
  lineItems     Json                  // Array of {description, quantity, unitPrice, total}
  subtotal      Decimal               @db.Decimal(10, 2)
  tax           Decimal               @db.Decimal(10, 2)
  total         Decimal               @db.Decimal(10, 2)
  validUntil    DateTime
  terms         String?               @db.Text
  notes         String?               @db.Text
  sentAt        DateTime?
  approvedAt    DateTime?
  rejectedAt    DateTime?
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  tenant        Tenant                @relation(fields: [tenantId], references: [id])
  customer      Customer              @relation(fields: [customerId], references: [id])
  property      Property              @relation(fields: [propertyId], references: [id])
  jobs          MaintenanceJob[]

  @@index([tenantId, status])
  @@index([tenantId, customerId])
}

enum QuoteStatus {
  DRAFT
  SENT
  APPROVED
  REJECTED
  EXPIRED
}
```

- [ ] Add MaintenanceInvoice model:
```prisma
model MaintenanceInvoice {
  id             String                 @id @default(cuid())
  tenantId       String
  invoiceNumber  String                 @unique
  customerId     String
  propertyId     String?
  quoteId        String?
  jobIds         Json?                  // Array of job IDs
  status         InvoiceStatus          @default(DRAFT)
  lineItems      Json                   // Array of {description, quantity, unitPrice, total}
  subtotal       Decimal                @db.Decimal(10, 2)
  tax            Decimal                @db.Decimal(10, 2)
  total          Decimal                @db.Decimal(10, 2)
  amountPaid     Decimal                @default(0) @db.Decimal(10, 2)
  balanceDue     Decimal                @db.Decimal(10, 2)
  issueDate      DateTime               @default(now())
  dueDate        DateTime
  paidDate       DateTime?
  terms          String?                @db.Text
  notes          String?                @db.Text
  sentAt         DateTime?
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt

  tenant         Tenant                 @relation(fields: [tenantId], references: [id])
  customer       Customer               @relation(fields: [customerId], references: [id])
  property       Property?              @relation(fields: [propertyId], references: [id])
  quote          MaintenanceQuote?      @relation(fields: [quoteId], references: [id])
  jobs           MaintenanceJob[]
  payments       InvoicePayment[]

  @@index([tenantId, status])
  @@index([tenantId, customerId])
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

model InvoicePayment {
  id           String             @id @default(cuid())
  invoiceId    String
  amount       Decimal            @db.Decimal(10, 2)
  paymentDate  DateTime           @default(now())
  paymentMethod String?
  reference    String?
  notes        String?
  createdAt    DateTime           @default(now())

  invoice      MaintenanceInvoice @relation(fields: [invoiceId], references: [id])

  @@index([invoiceId])
}
```

- [ ] Add supporting models (MaintenanceTimesheet, MaintenancePhoto, MaintenanceJobHistory, MaintenanceDocument, ContractorDocument)
- [ ] Run migration:
  ```bash
  npx prisma migrate dev --name add_maintenance_models
  npx prisma generate
  ```

**Dependencies**: None (but blocks all backend tasks)
**Testing**: Migration runs successfully, Prisma Client regenerates, no data loss

---

### **Phase 10: Testing, Bug Fixes & Documentation** (Days 21-22)

#### Task 10.1: Integration Testing
**Actions:**
- [ ] Test complete job workflows:
  - Create job → Get quote → Approve quote → Schedule → Assign worker/contractor → Start job → Complete job → Create invoice → Record payment
  - Emergency job (skip quote) → Assign → Start → Complete → Invoice
- [ ] Test all CRUD operations:
  - Jobs, Properties, Customers, Quotes, Invoices, Workers, Contractors
- [ ] Test navigation flows:
  - All routes accessible
  - Breadcrumbs work
  - Back navigation works
- [ ] Test filters and search:
  - All list pages
  - Date range filters
  - Multi-select filters
- [ ] Test modals:
  - All modals open/close
  - Form validation
  - API calls succeed
- [ ] Test permission/authorization:
  - Admin vs user access
  - Worker portal restrictions
- [ ] Test responsive design:
  - Mobile view
  - Tablet view
  - Desktop view

**Dependencies**: All previous tasks
**Testing**: Create comprehensive test cases, document bugs

---

#### Task 10.2: Bug Fixes
**Actions:**
- [ ] Fix any bugs discovered during testing
- [ ] Address UI/UX issues
- [ ] Fix performance issues
- [ ] Optimize database queries
- [ ] Fix validation errors
- [ ] Fix navigation issues

**Dependencies**: Task 10.1
**Testing**: Regression testing after each fix

---

#### Task 10.3: Documentation
**Files**:
- `Planning/MAINTENANCE-PORTAL-V2-USER-GUIDE.md` (new)
- `Planning/MAINTENANCE-PORTAL-V2-API-DOCS.md` (new)
- `Planning/SPRINT-11-COMPLETION-SUMMARY.md` (new)

**Actions:**
- [ ] Create user guide:
  - How to create maintenance jobs
  - How to manage quotes and invoices
  - How to manage contractors
  - How to use the calendar
  - How to generate reports
- [ ] Create API documentation:
  - All endpoints
  - Request/response formats
  - Authentication
  - Error codes
- [ ] Create sprint completion summary:
  - Features delivered
  - Files created/modified
  - Known issues
  - Future enhancements
- [ ] Update README files
- [ ] Add inline code comments
- [ ] Create component documentation (Storybook if applicable)

**Dependencies**: All previous tasks
**Testing**: Documentation review for accuracy

---

## File Structure Summary

### New Files to Create (Estimated 60+ files)

**Pages (30 files):**
- PropertyDetails.tsx, AddProperty.tsx, EditProperty.tsx
- Customers.tsx, CustomerDetails.tsx, AddCustomer.tsx, EditCustomer.tsx
- Quotes.tsx, QuoteDetails.tsx, CreateQuote.tsx, EditQuote.tsx
- Invoices.tsx, InvoiceDetails.tsx, CreateInvoice.tsx, EditInvoice.tsx
- WorkerDetails.tsx, WorkerReports.tsx
- ContractorDetails.tsx, AddContractor.tsx, EditContractor.tsx
- EditMaintenanceJob.tsx
- PropertyCalendar.tsx
- And more...

**Components (25+ files):**
- Modals: StartJobModal, CompleteJobModal, QuoteRequestModal, QuoteApprovalModal, ReassignJobModal, CancelJobModal
- Pickers: CustomerPicker, PropertyPicker, WorkerPicker, ContractorPicker, ServiceTypePicker
- Layout: Sidebar, Header, MobileNav (if not exist)
- UI: Various reusable UI components
- Timesheet components
- Calendar components
- Financial components

**API/Backend (5+ files):**
- contractors.ts (routes)
- contractors.service.ts
- maintenance-quotes.ts (routes)
- maintenance-quotes.service.ts
- maintenance-invoices.ts (routes)
- maintenance-invoices.service.ts

**Types (3 files):**
- types/maintenance.ts
- types/contractor.ts
- types/quote.ts
- types/invoice.ts

**Documentation (3 files):**
- MAINTENANCE-PORTAL-V2-USER-GUIDE.md
- MAINTENANCE-PORTAL-V2-API-DOCS.md
- SPRINT-11-COMPLETION-SUMMARY.md

---

## Success Criteria

### Functional Requirements
- [ ] All pages from cleaning portal replicated and adapted for maintenance
- [ ] Contractors page fully functional with CRUD operations
- [ ] Complete job workflow from creation to invoice payment works
- [ ] Quote approval process works
- [ ] Worker and contractor assignment works
- [ ] Calendar scheduling works
- [ ] All reports generate correctly
- [ ] PDF generation for quotes and invoices works
- [ ] Email sending for quotes and invoices works
- [ ] Photo upload and display works
- [ ] All filters and search work
- [ ] All modals work correctly
- [ ] Responsive design works on all devices

### Technical Requirements
- [ ] TypeScript type safety maintained
- [ ] All API endpoints secured with authentication
- [ ] Database migrations run successfully
- [ ] No console errors or warnings
- [ ] Performance acceptable (page load < 2s)
- [ ] Code follows existing patterns from cleaning portal
- [ ] Proper error handling throughout
- [ ] Loading states implemented
- [ ] Empty states implemented

### Quality Requirements
- [ ] Code reviewed
- [ ] User testing completed
- [ ] Documentation complete
- [ ] No critical bugs
- [ ] Accessibility standards met (WCAG 2.1 AA)

---

## Risk Assessment

### High Risk
1. **Database Schema Changes** - Could affect existing data
   - Mitigation: Test migrations on dev environment first, backup production before migration

2. **API Breaking Changes** - Could break existing integrations
   - Mitigation: Version APIs, maintain backward compatibility

3. **Complex Workflows** - Quote → Job → Invoice workflow is complex
   - Mitigation: Thorough testing, clear documentation

### Medium Risk
1. **Contractor Module** - New functionality not in cleaning portal
   - Mitigation: Design carefully, get user feedback early

2. **PDF Generation** - Can be resource-intensive
   - Mitigation: Use existing libraries, implement caching

3. **Performance** - Large amounts of data could slow down lists
   - Mitigation: Implement pagination, lazy loading, database indexing

### Low Risk
1. **UI/UX Changes** - Following proven cleaning portal patterns
   - Mitigation: Minimal risk, patterns already validated

---

## Timeline Summary

- **Phase 1** (Days 1-2): Foundation & Core Infrastructure
- **Phase 2** (Days 3-4): Customer & Property Management
- **Phase 3** (Days 5-7): Job Management Enhancement
- **Phase 4** (Days 8-10): Quotes & Invoices
- **Phase 5** (Days 11-12): Worker & Contractor Management
- **Phase 6** (Days 13-14): Planning & Organization
- **Phase 7** (Days 15-16): Modals & Interactions
- **Phase 8** (Days 17-19): Backend API Implementation
- **Phase 9** (Day 20): Database Schema & Migrations
- **Phase 10** (Days 21-22): Testing, Bug Fixes & Documentation

**Total Estimated Duration**: 22 working days (~4.5 weeks)

---

## Next Steps After Sprint 11

1. **Worker Portal Integration** - Allow contractors to access jobs via mobile
2. **Customer Portal** - Allow customers to request maintenance, approve quotes
3. **SMS/Email Notifications** - Automated notifications for job updates
4. **Payment Gateway Integration** - Online payment for invoices
5. **Preventive Maintenance Scheduling** - Automated recurring maintenance
6. **Inventory Management** - Track parts and materials
7. **Integration with Property Management Systems** - Two-way sync
8. **Advanced Reporting** - Business intelligence dashboards
9. **Mobile App** - Native iOS/Android apps for workers/contractors

---

**Created**: 2025-01-10
**Status**: 📋 READY FOR REVIEW
**Priority**: 🔴 PRIORITY 1
