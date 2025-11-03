# Complete Workflow Guide: Guest Issue to Invoice

**Last Updated**: 2025-11-03
**Status**: ✅ **FULLY IMPLEMENTED AND TESTED**

---

## 🎯 Overview

This document describes the complete end-to-end workflow from a guest reporting an issue through to invoice generation and payment. The system features **cross-tenant communication** via a shared Kanban card system that allows customers and service providers to collaborate throughout the job lifecycle.

---

## 📊 Workflow Diagram

```
┌─────────────┐
│   GUEST     │  Guest reports issue via tablet
│   TABLET    │  (e.g., "Leaky tap in bathroom")
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  GUEST AI DASHBOARD                                 │
│  • AI analyzes issue (DIY vs Professional)         │
│  • Creates maintenance job if professional needed   │
│  • Status: GUEST_REPORTED                          │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  CUSTOMER PORTAL - Issues Tab                       │
│  • Customer reviews guest-reported issue            │
│  • Can SUBMIT (approve) or DISMISS                  │
│  • If SUBMIT → creates maintenance request          │
│  • Status: QUOTE_REQUESTED                          │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  MAINTENANCE PROVIDER DASHBOARD                     │
│  • New Issues tab shows QUOTE_REQUESTED jobs        │
│  • Provider creates quote with parts/labor breakdown│
│  • Submits quote to customer                        │
│  • Status: QUOTE_PENDING                            │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  CUSTOMER PORTAL - Dashboard                        │
│  • Notification appears at top                      │
│  • "Pending Quotes" tab shows new quote             │
│  • Customer can APPROVE or DECLINE                  │
│  • If APPROVE → moves to "Scheduled" tab            │
│  • Status: APPROVED                                 │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  MAINTENANCE PROVIDER - Scheduling                  │
│  • Accepted Quotes tab shows approved jobs          │
│  • Provider assigns worker & schedules job          │
│  • System checks for scheduling conflicts           │
│  • Status: SCHEDULED                                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  SHARED KANBAN CARD - Cross-Tenant Communication    │
│  • Job visible in both customer & maintenance apps  │
│  • Customer can view job details & add comments     │
│  • Provider can view job details & see comments     │
│  • Bidirectional communication throughout lifecycle │
│  • Status: SCHEDULED → IN_PROGRESS → COMPLETED      │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  MAINTENANCE PROVIDER - Job Completion              │
│  • Worker marks job complete                        │
│  • Uploads photos (before/after/in-progress)        │
│  • Records actual hours & parts cost                │
│  • Invoice auto-generated from quote data           │
│  • Status: COMPLETED                                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  CUSTOMER PORTAL - Invoices                         │
│  • Invoice appears in "Invoices" tab                │
│  • Customer can view & download invoice             │
│  • Customer can rate completed job                  │
│  • Invoice marked as PAID when payment received     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Step-by-Step Workflow

### Step 1: Guest Reports Issue

**Location**: Guest Tablet App (port 5177)
**User**: Property Guest
**Page**: AI Chat / Report Issue

**Actions**:
1. Guest opens tablet app
2. Navigates to "Report Issue" or uses AI chat
3. Describes problem (e.g., "Bathroom tap is dripping")
4. May upload photo of issue
5. Submits report

**Backend**:
```typescript
// POST /api/guest/issues
{
  property_id: "uuid",
  category: "PLUMBING",
  description: "Bathroom tap is dripping",
  urgency: "NORMAL"
}
```

**Database Changes**:
- Creates `MaintenanceJob` record
- Status: `GUEST_REPORTED`
- Links to property and auto-detects customer

**AI Processing**:
- GuestAIService analyzes issue
- Determines if DIY (provides instructions) or professional needed
- If professional → changes status to `QUOTE_REQUESTED`

---

### Step 2: Customer Reviews Issue

**Location**: Customer Portal (port 5176)
**User**: Property Owner/Landlord
**Page**: `/issues` (Guest Issues)

**Actions**:
1. Customer logs in to portal
2. Sees notification of new guest issue
3. Views issue details in "Guest Issues" tab
4. Reviews AI recommendation
5. Clicks "Submit to Maintenance" to approve

**Backend**:
```typescript
// POST /api/customer-portal/guest-issues/:id/submit
{
  customer_id: "uuid"
}
```

**Database Changes**:
- Updates `MaintenanceJob` status: `QUOTE_REQUESTED`
- Records customer approval timestamp
- Triggers notification to maintenance provider

**Alternative Path**:
- Customer can click "Dismiss" if they'll handle it themselves
- Status changes to `DISMISSED`

---

### Step 3: Maintenance Provider Creates Quote

**Location**: Maintenance Provider App (port 5175)
**User**: Maintenance Service Provider
**Page**: `/dashboard` → New Issues Tab → Job Details

**Actions**:
1. Provider views "New Issues" tab showing `QUOTE_REQUESTED` jobs
2. Clicks job to view details
3. Reviews issue description and photos
4. Clicks "Submit Quote"
5. Fills out quote form:
   - Labor hours × hourly rate
   - Parts cost breakdown
   - Total calculation
6. Submits quote to customer

**Backend**:
```typescript
// POST /api/maintenance-jobs/:id/quote
{
  service_provider_id: "uuid",
  quote_date: "2025-11-03",
  valid_until_date: "2025-11-10",
  line_items: [
    {
      item_type: "LABOR",
      description: "Plumber labor - 1 hour",
      quantity: 1,
      unit_price: 45.00,
      total: 45.00
    },
    {
      item_type: "PARTS",
      description: "Replacement tap washer",
      quantity: 1,
      unit_price: 5.00,
      total: 5.00
    }
  ],
  subtotal: 50.00,
  tax_amount: 10.00,
  total: 60.00
}
```

**Database Changes**:
- Creates `MaintenanceQuote` record
- Creates `MaintenanceQuoteLineItem` records
- Updates job status: `QUOTE_PENDING`
- Triggers customer notification

---

### Step 4: Customer Approves Quote

**Location**: Customer Portal (port 5176)
**User**: Property Owner
**Page**: `/dashboard` → Pending Quotes Tab

**Actions**:
1. Customer receives notification
2. Notification appears at top of dashboard
3. "Pending Quotes" tab shows new quote with badge count
4. Customer reviews quote details:
   - Quote number
   - Line items breakdown
   - Total cost
   - Valid until date
5. Clicks "Approve" button (green)

**Backend**:
```typescript
// PUT /api/customer-portal/quotes/:id/approve
{
  customer_id: "uuid"
}
```

**Database Changes**:
- Updates `MaintenanceQuote` status: `APPROVED`
- Updates `MaintenanceJob` status: `APPROVED`
- Quote approval timestamp recorded

**UI Changes**:
- Quote disappears from "Pending Quotes" tab
- Job appears in "Scheduled" tab
- Tab automatically switches to "Scheduled"

**Alternative Path**:
- Customer clicks "Decline" (red button)
- Can provide reason for decline
- Status changes to `DECLINED`

---

### Step 5: Maintenance Provider Schedules Worker

**Location**: Maintenance Provider App (port 5175)
**User**: Maintenance Service Provider
**Page**: `/dashboard` → Accepted Quotes Tab → Job Details → Assign Worker

**Actions**:
1. Provider views "Accepted Quotes" tab
2. Clicks on approved job
3. Clicks "Assign Worker" button
4. Scheduling modal opens showing:
   - Date picker (future dates only)
   - Start time picker
   - End time picker
   - List of available contractors/workers
5. System shows availability status for each worker
6. Provider selects worker and time slot
7. Clicks "Schedule Contractor"

**Conflict Detection**:
- System checks for overlapping jobs
- Shows warning if worker has conflicting appointment
- Provider can override if necessary

**Backend**:
```typescript
// PUT /api/maintenance-jobs/:id/assign
{
  worker_id: "uuid",
  scheduled_date: "2025-11-05",
  scheduled_start_time: "09:00",
  scheduled_end_time: "11:00",
  service_provider_id: "uuid"
}
```

**Database Changes**:
- Updates `MaintenanceJob`:
  - `assigned_worker_id`: worker UUID
  - `scheduled_date`: date
  - `scheduled_start_time`: time
  - `scheduled_end_time`: time
  - `status`: `SCHEDULED`
- Triggers customer notification

---

### Step 6: Cross-Tenant Kanban Card System

**This is a NEW FEATURE beyond the original sprint stories!**

**Location**: Both Customer Portal AND Maintenance Provider App
**Users**: Both Customer and Service Provider
**Pages**:
- Customer: `/jobs/:id` (MaintenanceJobDetails)
- Maintenance: `/dashboard` → Job Cards (clickable)

#### Customer View:

**Access**:
1. Customer dashboard → "Scheduled" or "In Progress" tab
2. Job cards now clickable with hover effects
3. Clicking card navigates to `/jobs/:id`

**Job Details Page Shows**:
- Job title and description
- Property information
- Status badge
- Priority and category
- Scheduled date/time
- Assigned worker information
- Quote details (quote number, total)
- Estimated vs actual costs

**Customer Can**:
- View complete job details
- Read all job updates
- Add comments to job
- Comments appear with timestamp
- View worker assignment
- See progress updates

**Comment Feature**:
```typescript
// Customer adds comment
const [comment, setComment] = useState('')

// POST /api/customer-portal/maintenance-jobs/:id/comment
{
  customer_id: "uuid",
  comment: "Could you also check the sink while you're there?"
}
```

#### Maintenance Provider View:

**Access**:
- Same job details page they already use
- Shows all job information
- Can see customer comments in description field

**Comment Display**:
- Customer comments appended to job description
- Timestamped format:
```
Original job description

--- Customer Comment (11/3/2025, 2:45:30 PM) ---
Could you also check the sink while you're there?
```

**Bidirectional Communication**:
- ✅ Customer writes comment → Visible in maintenance portal
- ✅ Maintenance updates description → Visible to customer
- ✅ Real-time shared view of job status
- ✅ Both parties see same job card throughout lifecycle

**Benefits**:
- Eliminates phone tag
- Provides audit trail
- Keeps all communication in one place
- Maintains context throughout job lifecycle

---

### Step 7: Worker Completes Job

**Location**: Maintenance Provider App (port 5175)
**User**: Maintenance Worker/Provider
**Page**: Job Details → Complete Job Button

**Actions**:
1. Worker arrives and completes work
2. Provider opens job details
3. Clicks "Complete Job" button
4. Completion modal opens with form:
   - Work performed (required textarea)
   - Diagnosis/technical notes (optional)
   - Photo upload:
     * Before photos
     * Work in progress photos
     * After photos (required)
   - Actual hours worked
   - Actual parts cost (if different from quote)
   - "Generate Invoice" checkbox (checked by default)
5. Worker fills out form and uploads photos
6. Clicks "Complete Job"

**Backend**:
```typescript
// POST /api/maintenance-jobs/:id/complete
{
  worker_id: "uuid",
  work_performed: "Replaced worn tap washer and tested for leaks",
  diagnosis: "Main washer was worn out, causing drip",
  before_photo_ids: ["uuid1"],
  after_photo_ids: ["uuid2", "uuid3"],
  work_in_progress_photo_ids: [],
  actual_hours_worked: 0.5,
  actual_parts_cost: 5.00,
  generate_invoice: true
}
```

**Database Changes**:
- Updates `MaintenanceJob`:
  - `status`: `COMPLETED`
  - `completion_date`: current timestamp
  - `work_performed`: text
  - `diagnosis`: text
  - `actual_hours_worked`: hours
  - `actual_total`: calculated from actual hours + parts
- Links photos to job
- Triggers invoice generation if checkbox selected

**Invoice Auto-Generation**:
- Uses quote line items as template
- Adjusts quantities if actual differs from quoted
- Calculates final total with tax
- Generates unique invoice number (e.g., INV-2025-00123)
- Links invoice to customer
- Status: `UNPAID`

---

### Step 8: Customer Views Invoice & Rates Job

**Location**: Customer Portal (port 5176)
**User**: Property Owner
**Page**: `/dashboard` → Invoices Tab → `/invoices`

**Actions**:
1. Customer receives notification of completed job
2. Clicks "Invoices" tab on dashboard
3. Views list of all invoices
4. Clicks specific invoice to view details:
   - Invoice number
   - Date issued
   - Line items with quantities and costs
   - Subtotal, tax, total
   - Payment status
   - Job details and photos
5. Can download/print invoice
6. Can rate completed job (1-5 stars)

**Rating Feature**:
```typescript
// POST /api/customer-portal/jobs/:jobId/rate
{
  customerId: "uuid",
  rating: 5
}
```

**Database Changes**:
- Updates `MaintenanceJob`:
  - `customer_rating`: 1-5
  - `rating_date`: timestamp
- Used for worker performance metrics
- Can affect future pricing/prioritization

**Payment**:
- When customer pays invoice:
```typescript
// PUT /api/invoices/:id/mark-paid
{
  payment_method: "BANK_TRANSFER",
  payment_reference: "REF123",
  paid_date: "2025-11-06"
}
```

- Invoice status: `PAID`
- Workflow complete! ✅

---

## 🎨 User Interface Features

### Customer Portal Features

#### Dashboard Tabs:
1. **Pending Quotes** (count badge)
   - Shows quotes awaiting approval
   - Approve/Decline buttons
   - Quote details and line items
   - Valid until date

2. **Scheduled** (count badge)
   - Shows approved jobs waiting to start
   - Scheduled date/time
   - Assigned worker info
   - **Clickable cards** → Job details page

3. **In Progress** (count badge)
   - Shows jobs currently being worked on
   - Worker information
   - **Clickable cards** → Job details page

4. **Invoices**
   - Link to full invoices page
   - Shows completed jobs and invoices

#### Notifications System:
- Alert box at top of dashboard
- Shows unread notifications (max 3 preview)
- Notification types:
  - New quote available
  - Job scheduled
  - Job in progress
  - Job completed
  - Invoice ready
- Click to mark as read

#### Job Details Page (NEW):
- Comprehensive job view
- Property and customer info
- Status badge with color coding
- Quote details
- Worker assignment
- Schedule information
- **Comment section** for customer feedback
- Real-time updates

### Maintenance Provider Features

#### Dashboard Views:
- **List View**: Table format with sorting
- **Kanban View**: Drag-and-drop columns by status
- **Calendar View**: Calendar grid with scheduled jobs

#### Dashboard Tabs:
1. **New Issues**: Jobs needing quotes
2. **Submitted Quotes**: Quotes waiting for customer
3. **Accepted Quotes**: Approved jobs needing scheduling

#### Job Cards:
- Color-coded by priority
- Status badges
- Property name
- Customer name
- Estimated cost
- Scheduled date/time
- Assigned worker

---

## 🔧 Technical Implementation Details

### Multi-Tenant Architecture

**Tenant Isolation**:
- All queries filtered by `service_provider_id`
- Customer portal filtered by `customer_id`
- Middleware validates tenant access

**Shared Data Model**:
- `MaintenanceJob` record shared between tenants
- Customer sees via `customer_id`
- Provider sees via `service_provider_id`
- Same job, different views

**Example**:
```typescript
// Customer Portal: Get job by customer_id
const job = await prisma.maintenanceJob.findFirst({
  where: {
    id: jobId,
    customer_id: customerId  // Customer tenant filter
  }
});

// Maintenance Provider: Get same job by service_provider_id
const job = await prisma.maintenanceJob.findFirst({
  where: {
    id: jobId,
    service_provider_id: providerId  // Provider tenant filter
  }
});
```

### API Endpoints

**Customer Portal Routes** (`/api/customer-portal/*`):
```
GET    /dashboard?customer_id=xxx
GET    /properties?customer_id=xxx
GET    /guest-issues?customer_id=xxx
POST   /guest-issues/:id/submit
POST   /guest-issues/:id/dismiss
GET    /notifications?customer_id=xxx
PUT    /notifications/:id/mark-read
PUT    /quotes/:id/approve
PUT    /quotes/:id/decline
GET    /maintenance-jobs/:id?customer_id=xxx        ← NEW
POST   /maintenance-jobs/:id/comment                 ← NEW
POST   /jobs/:jobId/rate
```

**Maintenance Provider Routes** (`/api/maintenance-jobs/*`):
```
GET    /?service_provider_id=xxx
GET    /:id?service_provider_id=xxx
POST   /
POST   /:id/quote
PUT    /:id/assign
PUT    /:id/assign-external
POST   /:id/complete
GET    /contractors/available
```

### Database Schema

**Key Tables**:

**MaintenanceJob**:
```sql
id                              UUID PRIMARY KEY
property_id                     UUID REFERENCES Property
customer_id                     UUID REFERENCES Customer
service_provider_id             UUID (tenant isolation)
status                          TEXT (GUEST_REPORTED, QUOTE_REQUESTED, etc.)
title                           TEXT
description                     TEXT (includes customer comments)
category                        TEXT
priority                        TEXT
scheduled_date                  DATE
scheduled_start_time            TEXT
scheduled_end_time              TEXT
assigned_worker_id              UUID REFERENCES Worker
estimated_total                 DECIMAL
actual_total                    DECIMAL
customer_rating                 INTEGER
created_at                      TIMESTAMP
```

**MaintenanceQuote**:
```sql
id                              UUID PRIMARY KEY
maintenance_job_id              UUID REFERENCES MaintenanceJob
quote_number                    TEXT UNIQUE
quote_date                      DATE
valid_until_date                DATE
subtotal                        DECIMAL
tax_amount                      DECIMAL
total                           DECIMAL
status                          TEXT (PENDING, APPROVED, DECLINED)
```

**CustomerNotification**:
```sql
id                              UUID PRIMARY KEY
customer_portal_user_id         UUID REFERENCES CustomerPortalUser
title                           TEXT
body                            TEXT
notification_type               TEXT
sent_at                         TIMESTAMP
read_at                         TIMESTAMP (nullable)
```

### Prisma Decimal Type Handling

**IMPORTANT PATTERN** - All decimal database fields return as Prisma `Decimal` objects, not JavaScript numbers!

**Problem**:
```typescript
// ❌ This will crash!
<div>£{quote.total.toFixed(2)}</div>
// TypeError: quote.total.toFixed is not a function
```

**Solution**:
```typescript
// ✅ Wrap in Number() first
<div>£{Number(quote.total).toFixed(2)}</div>
```

**Common Locations**:
- `quote.total`
- `quote.subtotal`
- `quote.tax_amount`
- `job.estimated_total`
- `job.actual_total`
- `lineItem.unit_price`
- `lineItem.total`

**In Reduce Operations**:
```typescript
// ✅ Convert during reduce
const total = jobs.reduce((sum, job) =>
  sum + Number(job.estimated_total || 0),
  0
).toFixed(2)
```

**This pattern must be applied everywhere Decimal values are displayed!**

---

## 🎯 Key Features Implemented

### ✅ Core Workflow Features
- [x] Guest issue reporting with AI analysis
- [x] Customer issue review and approval
- [x] Maintenance provider quote creation
- [x] Customer quote approval/decline with notifications
- [x] Worker scheduling with conflict detection
- [x] Job completion with photos
- [x] Invoice auto-generation
- [x] Customer rating system

### ✅ Additional Features (Beyond Original Stories)
- [x] **Customer Dashboard Tabbed Interface**
  - Pending Quotes tab
  - Scheduled tab
  - In Progress tab
  - Invoices tab
  - Tab switching on quote approval

- [x] **Notification System**
  - Customer notifications API
  - Dashboard notification display
  - Unread notification count
  - Mark as read functionality

- [x] **Shared Kanban Card System** ⭐ NEW
  - Customer job details page
  - Clickable job cards with hover effects
  - Customer comment functionality
  - Cross-tenant communication
  - Bidirectional visibility

- [x] **View Toggle System**
  - List view
  - Kanban view
  - Calendar view
  - Fixed SERVICE_PROVIDER_ID

- [x] **Navigation Improvements**
  - Fixed all back buttons
  - Removed non-functional buttons
  - Proper routing throughout

- [x] **Type Safety Fixes**
  - Prisma Decimal handling pattern
  - Fixed all .toFixed() errors
  - Fixed reduce operations

---

## 📝 Testing Checklist

### End-to-End Workflow Test

- [x] Guest can report issue via tablet
- [x] Issue appears in customer portal
- [x] Customer can submit issue to maintenance
- [x] Maintenance provider receives issue
- [x] Provider can create and submit quote
- [x] Customer receives notification
- [x] Quote appears in "Pending Quotes" tab with count badge
- [x] Customer can approve quote
- [x] Quote moves to "Scheduled" tab automatically
- [x] Provider can schedule worker
- [x] System detects scheduling conflicts
- [x] Customer can view job details (new page)
- [x] Customer can add comments to job
- [x] Comments visible in maintenance portal
- [x] Provider can mark job complete
- [x] Invoice auto-generated
- [x] Invoice appears in customer portal
- [x] Customer can rate job
- [x] All Decimal values display correctly
- [x] All navigation works correctly

### Cross-Tenant Communication Test

- [x] Customer writes comment on job
- [x] Comment appears in maintenance portal description
- [x] Timestamp format correct
- [x] Multiple comments append correctly
- [x] Job updates visible to both tenants
- [x] Same job accessible from both apps

---

## 🚀 Future Enhancements

### Potential Improvements:
1. **Real-time Updates**: WebSocket notifications
2. **Rich Comments**: Separate comments table with attachments
3. **Email Notifications**: Send emails on status changes
4. **SMS Notifications**: Text alerts for urgent updates
5. **Mobile App**: Native iOS/Android apps
6. **Payment Integration**: Stripe/PayPal for online payment
7. **Recurring Jobs**: Scheduled maintenance contracts
8. **Job Templates**: Pre-configured quotes for common jobs
9. **Analytics Dashboard**: Performance metrics and reporting
10. **Customer Portal Mobile**: Responsive mobile-first design

---

## 📊 Success Metrics

**User Feedback**:
> "cool i wrote a message in the customer portal and it was visible in the maintenance portal"
>
> "its like a kanban card passed between tenants"

**Completed Features**:
- ✅ Full workflow functional from guest issue to invoice
- ✅ Cross-tenant Kanban card communication working
- ✅ Notification system operational
- ✅ Quote approval workflow with tab progression
- ✅ All type errors fixed (Decimal handling)
- ✅ All navigation issues resolved
- ✅ View toggles (List/Kanban/Calendar) working

**Production Ready**: This workflow is now complete and tested! 🎉

---

*Documentation created: 2025-11-03*
*Reflects implementation beyond original MAINTENANCE-FIRST-SPRINT stories*
