# Business Management Sprint - Complete Implementation Plan

**Created**: 2025-11-04
**Status**: READY FOR IMPLEMENTATION
**Priority**: P0 - CRITICAL
**Estimated Duration**: 10-12 days
**Total Story Points**: 45 points

---

## 🎯 Sprint Goal

Implement complete business management functionality for the cleaning service provider, including:
1. **Property Management**: Add/edit customer properties
2. **Customer Management**: Full customer CRUD and relationship tracking
3. **Contract Management**: Enhanced UX for cleaning contracts
4. **Invoice Management**: Comprehensive invoicing (cleaning + maintenance)
5. **Quote Management**: Quote creation, approval, and tracking
6. **Integration**: Seamless workflows connecting all components

---

## 📊 Business Model Overview

### Data Relationships

```
Customer (1) ──→ (Many) CustomerProperty
Customer (1) ──→ (Many) CleaningContract
Customer (1) ──→ (Many) CleaningInvoice
Customer (1) ──→ (Many) Invoice (maintenance)
Customer (1) ──→ (Many) Quote (maintenance)
Customer (1) ──→ (Many) CleaningQuote (one-off jobs)

CleaningContract (1) ──→ (Many) ContractProperty
CleaningContract (1) ──→ (Many) CleaningJob
CleaningContract (1) ──→ (Many) CleaningInvoice

CustomerProperty (1) ──→ (Many) CleaningJob
CustomerProperty (1) ──→ (Many) MaintenanceJob
CustomerProperty (1) ──→ (Many) PropertyCalendar

CleaningJob (1) ──→ (0..1) CleaningInvoice
MaintenanceJob (1) ──→ (0..1) Invoice
```

### Contract Types

**FLAT_MONTHLY**:
- Single monthly fee for all properties
- `CleaningContract.monthly_fee` = total monthly charge
- `ContractProperty.property_monthly_fee` = null

**PER_PROPERTY**:
- Individual fee per property
- `CleaningContract.monthly_fee` = sum of all property fees
- `ContractProperty.property_monthly_fee` = per-property charge

---

## 🗓️ Sprint Breakdown

### Phase 1: Property Management (Days 1-3) - 13 points

#### **PM-001: Add Property Form** (2 days, 5 points)
**Route**: `/properties/new`
**File**: [AddProperty.tsx](../apps/web-cleaning/src/pages/AddProperty.tsx)

**Features**:
- Multi-section form (Basic Info, Access Details, Amenities)
- Customer dropdown with search
- UK postcode validation
- WiFi credentials with show/hide toggle
- Pet information with conditional fields
- Parking and access instructions
- Real-time validation
- Save & Add Another workflow

**Acceptance Criteria**:
- [ ] All form sections render correctly
- [ ] Customer dropdown loads and filters
- [ ] Postcode validation (UK format)
- [ ] Conditional fields show/hide properly
- [ ] Form submits and creates property
- [ ] Success toast and navigation
- [ ] Error handling with clear messages

---

#### **PM-002: Edit Property Form** (1 day, 4 points)
**Route**: `/properties/:id/edit`
**File**: [EditProperty.tsx](../apps/web-cleaning/src/pages/EditProperty.tsx)

**Features**:
- Reuses PropertyForm component
- Pre-populates with existing data
- Customer change warning (affects contracts/jobs)
- Delete property with confirmation
- Dependency checking before deletion

**Acceptance Criteria**:
- [ ] Form pre-fills with property data
- [ ] All fields editable
- [ ] Customer change shows warning modal
- [ ] Delete shows dependencies
- [ ] Updates save correctly
- [ ] Navigation works properly

---

#### **PM-003: Property Calendar UI** (1.5 days, 4 points)
**Component**: [PropertyGuestCalendar.tsx](../apps/web-cleaning/src/components/calendar/PropertyGuestCalendar.tsx)

**Features**:
- Guest checkout/checkin tracking
- Add turnover entry with date/time pickers
- Edit/delete turnover entries
- Calculate cleaning window automatically
- Link to create cleaning job from turnover
- Color-coded calendar view

**Database**: Uses existing `PropertyCalendar` table

**Acceptance Criteria**:
- [ ] Calendar displays turnover entries
- [ ] Add turnover modal works
- [ ] Edit/delete turnovers
- [ ] Cleaning window calculated correctly
- [ ] "Create Job" button links to job form with pre-filled data
- [ ] Mobile responsive

---

### Phase 2: Customer & Business Data (Days 4-6) - 15 points

#### **CM-001: Customers Page** (2 days, 6 points)
**Route**: `/customers`
**File**: [Customers.tsx](../apps/web-cleaning/src/pages/Customers.tsx)

**Features**:
- Grid/list view toggle
- Customer cards with key stats
- Search by name, email, phone
- Filter by customer type, has contracts, payment reliability
- Stats header:
  - Total customers
  - Active contracts
  - Monthly recurring revenue
  - Overdue invoices count
- "Add Customer" button → `/customers/new`
- Edit/delete actions on cards
- Click card → `/customers/:id` details

**Customer Card Shows**:
- Business name and contact name
- Customer type badge
- Properties count
- Active contracts count
- Current balance (invoices due)
- Payment reliability score indicator
- Quick actions: View, Edit, Create Contract, Create Quote

**Acceptance Criteria**:
- [ ] Customer list loads with pagination
- [ ] Grid/list view toggle works
- [ ] Search filters customers
- [ ] Stats calculate correctly
- [ ] Add customer navigation
- [ ] Edit customer modal/page
- [ ] Delete with confirmation
- [ ] Mobile responsive

---

#### **CM-002: Customer Details Page** (1.5 days, 5 points)
**Route**: `/customers/:id`
**File**: [CustomerDetails.tsx](../apps/web-cleaning/src/pages/CustomerDetails.tsx)

**Features**:
- 5-tab interface:
  1. **Overview**: Customer info, stats, recent activity
  2. **Properties**: List of customer properties
  3. **Contracts**: Active and past contracts
  4. **Invoices**: All invoices (cleaning + maintenance)
  5. **Quotes**: All quotes (cleaning + maintenance)
- Edit customer button
- Quick actions: Create Property, Create Contract, Create Quote
- Activity timeline (last 10 events)

**Acceptance Criteria**:
- [ ] All tabs load data correctly
- [ ] Tab state persists on navigation
- [ ] Stats calculate correctly
- [ ] Quick actions work
- [ ] Activity timeline shows events
- [ ] Mobile responsive

---

#### **CM-003: Add/Edit Customer Forms** (0.5 days, 2 points)
**Routes**: `/customers/new`, `/customers/:id/edit`
**Files**: [AddCustomer.tsx](../apps/web-cleaning/src/pages/AddCustomer.tsx), [EditCustomer.tsx](../apps/web-cleaning/src/pages/EditCustomer.tsx)

**Form Fields**:
- Business name (required)
- Contact name (required)
- Email (required, validated)
- Phone (required, UK format)
- Address
- Customer type (PROPERTY_MANAGER, OWNER, LETTING_AGENCY)
- Payment terms (NET_7, NET_14, NET_30)
- Bundled discount percentage

**Acceptance Criteria**:
- [ ] Form validates required fields
- [ ] Email format validation
- [ ] Phone format validation (UK)
- [ ] Customer type dropdown
- [ ] Payment terms dropdown
- [ ] Save creates/updates customer
- [ ] Success toast and navigation

---

#### **INV-001: Invoices Page** (1.5 days, 5 points)
**Route**: `/invoices`
**File**: [Invoices.tsx](../apps/web-cleaning/src/pages/Invoices.tsx)

**Features**:
- Combined view: CleaningInvoice + Invoice (maintenance)
- Filter by type (Cleaning | Maintenance | All)
- Filter by status (Pending | Sent | Paid | Overdue | Cancelled)
- Search by customer name or invoice number
- Date range filter
- Stats header:
  - Total revenue (YTD)
  - Outstanding balance
  - Overdue count
  - Paid this month
- Invoice cards show:
  - Invoice number
  - Customer name
  - Invoice type badge
  - Amount
  - Status badge with color
  - Due date
  - Quick actions: View, Send, Record Payment, Download PDF

**Acceptance Criteria**:
- [ ] Both invoice types load
- [ ] Filters work correctly
- [ ] Search finds invoices
- [ ] Stats calculate correctly
- [ ] Status badges color-coded
- [ ] Click invoice → details page
- [ ] Mobile responsive

---

#### **INV-002: Invoice Details Page** (1 day, 3 points)
**Route**: `/invoices/:id`
**File**: [InvoiceDetails.tsx](../apps/web-cleaning/src/pages/InvoiceDetails.tsx)

**Features**:
- Invoice header (number, date, due date, status)
- Customer information
- Line items breakdown
- Subtotal, tax, total calculation
- Payment information (if paid)
- Related job/contract link
- Actions:
  - Record Payment (modal with date, amount, method, reference)
  - Send Invoice (email to customer)
  - Download PDF
  - Mark as Cancelled
- Payment history (if multiple payments)

**Acceptance Criteria**:
- [ ] Invoice data displays correctly
- [ ] Line items formatted properly
- [ ] Calculations accurate
- [ ] Record payment modal works
- [ ] Payment updates status
- [ ] Send invoice triggers email
- [ ] PDF download works
- [ ] Mobile responsive

---

### Phase 3: Quotes & Contract UX (Days 7-9) - 12 points

#### **QT-001: Quotes Page** (1.5 days, 5 points)
**Route**: `/quotes`
**File**: [Quotes.tsx](../apps/web-cleaning/src/pages/Quotes.tsx)

**Features**:
- Combined view: Quote (maintenance) + CleaningQuote (one-off)
- Filter by type (Cleaning | Maintenance | All)
- Filter by status (Draft | Sent | Approved | Declined | Expired)
- Search by customer name or quote number
- Date range filter
- Stats header:
  - Total quoted value
  - Pending approval count
  - Approval rate (%)
  - Average quote value
- Quote cards show:
  - Quote number
  - Customer name
  - Quote type badge
  - Amount
  - Status badge with color
  - Valid until date
  - Quick actions: View, Edit (draft only), Send, Convert to Job

**Acceptance Criteria**:
- [ ] Both quote types load
- [ ] Filters work correctly
- [ ] Search finds quotes
- [ ] Stats calculate correctly
- [ ] Expired quotes auto-update status
- [ ] Click quote → details page
- [ ] Mobile responsive

---

#### **QT-002: Quote Details Page** (1 day, 4 points)
**Route**: `/quotes/:id`
**File**: [QuoteDetails.tsx](../apps/web-cleaning/src/pages/QuoteDetails.tsx)

**Features**:
- Quote header (number, date, valid until, status)
- Customer information
- Property information (if applicable)
- Line items breakdown with descriptions
- Subtotal, discount, total calculation
- Status timeline (created → sent → approved/declined)
- Actions (based on status):
  - **Draft**: Edit, Send, Delete
  - **Sent**: Resend, Mark Approved/Declined, Expire
  - **Approved**: Create Job/Contract
  - **Declined**: View reason, Archive
  - **Expired**: Renew (creates new quote)
- Customer response notes (if declined)

**Acceptance Criteria**:
- [ ] Quote data displays correctly
- [ ] Line items formatted properly
- [ ] Calculations accurate
- [ ] Status timeline shows history
- [ ] Actions work for each status
- [ ] Approve creates job/contract option
- [ ] Mobile responsive

---

#### **QT-003: Create Quote Wizard** (1 day, 3 points)
**Route**: `/quotes/new`
**File**: [CreateQuote.tsx](../apps/web-cleaning/src/pages/CreateQuote.tsx)

**Features**:
- 3-step wizard:
  1. **Quote Type & Customer**: Select cleaning vs maintenance, select customer, select property
  2. **Line Items**: Add services/tasks with descriptions, quantities, rates
  3. **Review & Send**: Review quote, set valid until date, add notes, send or save as draft
- Line item builder:
  - Service dropdown (from Service table)
  - Description (editable)
  - Quantity
  - Rate
  - Amount (auto-calculated)
  - Add/remove line items
- Discount option (percentage or fixed amount)
- Auto-calculate subtotal and total
- Save as draft or send immediately

**Acceptance Criteria**:
- [ ] Wizard steps navigate correctly
- [ ] Customer dropdown loads
- [ ] Property dropdown filters by customer
- [ ] Service dropdown loads
- [ ] Line items add/remove dynamically
- [ ] Calculations auto-update
- [ ] Discount applies correctly
- [ ] Save as draft works
- [ ] Send quote works
- [ ] Mobile responsive

---

#### **CON-001: Contract List UX Improvements** (1.5 days, 4 points)
**Route**: `/contracts` (existing page enhancement)
**File**: [CleaningContracts.tsx](../apps/web-cleaning/src/pages/CleaningContracts.tsx) (update)

**Features**:
- Enhanced visual design with cards
- Stats dashboard:
  - Active contracts count
  - Total MRR (Monthly Recurring Revenue)
  - Contracts expiring soon (next 30 days)
  - Average contract value
- Filter improvements:
  - Customer search
  - Contract type (Flat Monthly | Per Property)
  - Status (Active | Paused | Cancelled)
  - Expiring soon toggle
- Contract card enhancements:
  - Customer name prominent
  - Contract type badge
  - Monthly fee prominent (large, green)
  - Properties count
  - Start date and duration
  - Status badge
  - Quick actions: View, Edit, Pause/Resume, Cancel
- Grid/list view toggle

**Acceptance Criteria**:
- [ ] Stats calculate correctly
- [ ] Filters work
- [ ] Cards visually improved
- [ ] Quick actions work
- [ ] Grid/list toggle works
- [ ] Mobile responsive

---

#### **CON-002: Contract Property Management** (1 day, 3 points)
**Modal/Section**: Contract Details → Properties Tab

**Features**:
- Visual property cards in contract
- Show property name, address, photo
- For PER_PROPERTY contracts:
  - Inline fee editing per property
  - Total contract fee auto-updates
- Add property to contract:
  - Search modal with property list
  - Filter properties by customer
  - Show which properties already in contract
  - Add multiple properties at once
- Remove property from contract (with confirmation)
- Property card quick actions:
  - View property details
  - Create cleaning job for this property
  - Edit property fee (per-property contracts only)

**Acceptance Criteria**:
- [ ] Property cards display correctly
- [ ] Add property modal works
- [ ] Property search/filter works
- [ ] Inline fee editing works (per-property)
- [ ] Total updates automatically
- [ ] Remove property works
- [ ] Quick actions work
- [ ] Mobile responsive

---

### Phase 4: Integration & Polish (Days 10-12) - 5 points

#### **INT-001: Cross-page Integration** (1.5 days, 3 points)

**Customer Details → Property Details**:
- Property cards on customer details link to property details
- "Create Property" on customer details pre-fills customer

**Property Details → Contract/Job Creation**:
- Property details page has "Create Contract" button
- Pre-fills property and customer when creating job
- Shows related contracts and jobs

**Contract Details → Job Creation**:
- "Create Job" button on contract
- Pre-fills contract, customer, and property dropdown (filtered to contract properties)

**Quote Approval → Job/Contract Creation**:
- Approved cleaning quote → Create CleaningJob (pre-filled)
- Approved maintenance quote → Create MaintenanceJob (pre-filled)

**Invoice → Job/Contract Links**:
- Invoice details links to related job or contract
- Job details links to related invoice (if exists)

**Acceptance Criteria**:
- [ ] All navigation links work
- [ ] Data pre-fills correctly
- [ ] No broken links
- [ ] Breadcrumbs work
- [ ] Back buttons navigate correctly

---

#### **INT-002: Property Details Tabs** (1 day, 2 points)
**Route**: `/properties/:id`
**File**: [PropertyDetails.tsx](../apps/web-cleaning/src/pages/PropertyDetails.tsx)

**Features**:
- 5-tab interface:
  1. **Overview**: Property info, access details, amenities
  2. **Calendar**: Guest turnover calendar (PropertyGuestCalendar component)
  3. **History**: Property activity timeline
  4. **Contracts**: Contracts that include this property
  5. **Jobs**: Cleaning and maintenance jobs for this property

**Acceptance Criteria**:
- [ ] All tabs load data correctly
- [ ] Tab state persists
- [ ] Calendar component integrated
- [ ] History timeline shows events
- [ ] Contracts and jobs link correctly
- [ ] Mobile responsive

---

#### **INT-003: Documentation & Testing** (0.5 days, 1 point)

**Tasks**:
- Update CURRENT_STATUS.md
- Create testing checklist
- Document API endpoints used
- Document business workflows
- Add inline code comments
- Create user guide (optional)

---

## 🗄️ Database Changes Required

### New Table: CleaningQuote

```prisma
model CleaningQuote {
  id                  String        @id @default(uuid())
  customer_id         String
  property_id         String?
  cleaning_job_id     String?
  quote_number        String        @unique @db.VarChar(50)
  quote_date          DateTime      @db.Date
  valid_until_date    DateTime      @db.Date
  line_items          Json
  subtotal            Decimal       @db.Decimal(10, 2)
  discount_percentage Decimal       @default(0) @db.Decimal(5, 2)
  discount_amount     Decimal       @default(0) @db.Decimal(10, 2)
  total               Decimal       @db.Decimal(10, 2)
  status              QuoteStatus   @default(DRAFT)
  customer_response   String?
  approved_at         DateTime?
  notes               String?
  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt

  customer Customer          @relation(fields: [customer_id], references: [id])
  property CustomerProperty? @relation(fields: [property_id], references: [id])

  @@index([customer_id])
  @@index([property_id])
  @@index([status])
  @@map("cleaning_quotes")
}
```

### Migration File

Location: `packages/database/prisma/migrations/YYYYMMDDHHMMSS_add_cleaning_quotes/migration.sql`

```sql
-- CreateTable
CREATE TABLE "cleaning_quotes" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "property_id" TEXT,
    "cleaning_job_id" TEXT,
    "quote_number" VARCHAR(50) NOT NULL,
    "quote_date" DATE NOT NULL,
    "valid_until_date" DATE NOT NULL,
    "line_items" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "customer_response" TEXT,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cleaning_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_quotes_quote_number_key" ON "cleaning_quotes"("quote_number");

-- CreateIndex
CREATE INDEX "cleaning_quotes_customer_id_idx" ON "cleaning_quotes"("customer_id");

-- CreateIndex
CREATE INDEX "cleaning_quotes_property_id_idx" ON "cleaning_quotes"("property_id");

-- CreateIndex
CREATE INDEX "cleaning_quotes_status_idx" ON "cleaning_quotes"("status");

-- AddForeignKey
ALTER TABLE "cleaning_quotes" ADD CONSTRAINT "cleaning_quotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_quotes" ADD CONSTRAINT "cleaning_quotes_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "customer_properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## 📁 File Structure

```
apps/web-cleaning/src/
├── pages/
│   ├── Properties.tsx                    # EXISTS - add "Add Property" button
│   ├── AddProperty.tsx                   # NEW
│   ├── EditProperty.tsx                  # NEW
│   ├── PropertyDetails.tsx               # NEW
│   │
│   ├── Customers.tsx                     # NEW
│   ├── AddCustomer.tsx                   # NEW
│   ├── EditCustomer.tsx                  # NEW
│   ├── CustomerDetails.tsx               # NEW
│   │
│   ├── CleaningContracts.tsx             # EXISTS - enhance UX
│   ├── ContractDetails.tsx               # NEW (or enhance modal)
│   │
│   ├── Invoices.tsx                      # NEW
│   ├── InvoiceDetails.tsx                # NEW
│   │
│   ├── Quotes.tsx                        # NEW
│   ├── QuoteDetails.tsx                  # NEW
│   └── CreateQuote.tsx                   # NEW
│
├── components/
│   ├── calendar/
│   │   └── PropertyGuestCalendar.tsx     # NEW
│   │
│   ├── contracts/
│   │   ├── ContractCard.tsx              # NEW
│   │   ├── ContractPropertyManager.tsx   # NEW
│   │   └── ContractStats.tsx             # NEW
│   │
│   ├── customers/
│   │   ├── CustomerCard.tsx              # NEW
│   │   ├── CustomerForm.tsx              # NEW (shared add/edit)
│   │   └── CustomerStats.tsx             # NEW
│   │
│   ├── invoices/
│   │   ├── InvoiceCard.tsx               # NEW
│   │   ├── RecordPaymentModal.tsx        # NEW
│   │   └── InvoiceStats.tsx              # NEW
│   │
│   └── quotes/
│       ├── QuoteCard.tsx                 # NEW
│       ├── LineItemEditor.tsx            # NEW
│       ├── QuoteWizard.tsx               # NEW
│       └── QuoteStats.tsx                # NEW
│
└── lib/
    └── api.ts                            # UPDATE - add new API functions
```

---

## 🔌 API Endpoints Needed

### Customers API (Verify/Create)
```typescript
GET    /api/customers                    // List all customers
GET    /api/customers/:id                // Get customer details
POST   /api/customers                    // Create customer
PATCH  /api/customers/:id                // Update customer
DELETE /api/customers/:id                // Delete customer
GET    /api/customers/:id/stats          // Get customer statistics
```

### CleaningQuotes API (Create)
```typescript
GET    /api/cleaning-quotes               // List all cleaning quotes
GET    /api/cleaning-quotes/:id           // Get quote details
POST   /api/cleaning-quotes                // Create quote
PATCH  /api/cleaning-quotes/:id           // Update quote
DELETE /api/cleaning-quotes/:id           // Delete quote
POST   /api/cleaning-quotes/:id/send      // Send quote to customer
POST   /api/cleaning-quotes/:id/approve   // Approve quote
POST   /api/cleaning-quotes/:id/decline   // Decline quote
POST   /api/cleaning-quotes/:id/expire    // Mark quote as expired
```

### Invoices API (Enhance)
```typescript
GET    /api/invoices                     // List all invoices (cleaning + maintenance)
GET    /api/invoices/:id                 // Get invoice details
POST   /api/invoices/:id/payment         // Record payment
POST   /api/invoices/:id/send            // Send invoice via email
GET    /api/invoices/:id/pdf             // Generate PDF
POST   /api/invoices/:id/cancel          // Cancel invoice
```

### Property Calendar API (Create)
```typescript
GET    /api/property-calendars/:propertyId    // Get turnovers for property
POST   /api/property-calendars                // Create turnover entry
PATCH  /api/property-calendars/:id            // Update turnover entry
DELETE /api/property-calendars/:id            // Delete turnover entry
```

---

## 🎨 Design Patterns

### Card Component Pattern
```typescript
<Card
  hoverable
  onClick={() => navigate(`/customers/${customer.id}`)}
  className="p-6"
>
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-xl font-semibold">{customer.business_name}</h3>
      <p className="text-gray-600">{customer.contact_name}</p>
    </div>
    <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'warning'}>
      {customer.status}
    </Badge>
  </div>

  <div className="grid grid-cols-3 gap-4 mb-4">
    <StatItem label="Properties" value={customer.properties_count} />
    <StatItem label="Contracts" value={customer.contracts_count} />
    <StatItem label="Balance" value={`£${customer.balance}`} />
  </div>

  <div className="flex gap-2">
    <Button size="sm" onClick={(e) => { e.stopPropagation(); handleEdit() }}>
      Edit
    </Button>
    <Button size="sm" variant="secondary">
      View Details
    </Button>
  </div>
</Card>
```

### Stats Dashboard Pattern
```typescript
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <StatCard
    icon={<UsersIcon />}
    label="Total Customers"
    value={stats.total_customers}
    trend="+12% this month"
    trendUp={true}
  />
  <StatCard
    icon={<ContractIcon />}
    label="Active Contracts"
    value={stats.active_contracts}
    subtitle={`£${stats.mrr} MRR`}
  />
  <StatCard
    icon={<InvoiceIcon />}
    label="Outstanding"
    value={`£${stats.outstanding}`}
    subtitle={`${stats.overdue_count} overdue`}
  />
  <StatCard
    icon={<QuoteIcon />}
    label="Pending Quotes"
    value={stats.pending_quotes}
    subtitle={`£${stats.quoted_value} total`}
  />
</div>
```

### Tab Interface Pattern
```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="overview">
      Overview
      {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
    </TabsTrigger>
    <TabsTrigger value="properties">
      Properties ({customer.properties_count})
    </TabsTrigger>
    <TabsTrigger value="contracts">Contracts</TabsTrigger>
    <TabsTrigger value="invoices">Invoices</TabsTrigger>
    <TabsTrigger value="quotes">Quotes</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    <CustomerOverview customer={customer} />
  </TabsContent>

  {/* Other tabs... */}
</Tabs>
```

---

## ✅ Testing Checklist

### Property Management
- [ ] Create property with all fields
- [ ] Create property with only required fields
- [ ] Edit property and save changes
- [ ] Delete property (with and without dependencies)
- [ ] Property calendar add/edit/delete turnovers
- [ ] Create cleaning job from calendar turnover
- [ ] Property details tabs all load correctly

### Customer Management
- [ ] Create customer with all fields
- [ ] Edit customer information
- [ ] Delete customer (with warning if has data)
- [ ] Customer list filters work
- [ ] Customer search works
- [ ] Customer stats calculate correctly
- [ ] Customer details tabs load correctly

### Contract Management
- [ ] Create FLAT_MONTHLY contract
- [ ] Create PER_PROPERTY contract
- [ ] Add properties to contract
- [ ] Edit per-property fees (auto-updates total)
- [ ] Remove property from contract
- [ ] Pause/resume contract
- [ ] Cancel contract
- [ ] Contract stats calculate correctly

### Invoice Management
- [ ] Invoice list shows both types
- [ ] Invoice filters work
- [ ] Invoice search works
- [ ] Invoice details display correctly
- [ ] Record payment updates status
- [ ] Send invoice via email
- [ ] Download invoice PDF
- [ ] Cancel invoice

### Quote Management
- [ ] Create cleaning quote
- [ ] Create maintenance quote
- [ ] Edit quote (draft only)
- [ ] Send quote to customer
- [ ] Approve quote
- [ ] Decline quote with reason
- [ ] Expire quote
- [ ] Create job from approved quote

### Integration
- [ ] Navigate customer → properties → details
- [ ] Navigate property → create contract
- [ ] Navigate contract → create job
- [ ] Navigate quote → create job
- [ ] Navigate invoice → related job
- [ ] All breadcrumbs work
- [ ] All back buttons work

---

## 📊 Success Metrics

**Completion Criteria**:
- All 13 stories implemented
- All acceptance criteria met
- All testing checklist items passed
- No critical bugs
- Mobile responsive on all pages
- Documentation updated

**User Can**:
- Manage complete customer lifecycle
- Create and manage properties
- Set up and manage contracts
- Generate and track quotes
- Issue and track invoices
- See complete business overview
- Navigate seamlessly between related data

---

## 🚀 Implementation Order

**Week 1 (Days 1-5)**:
1. PM-001: Add Property Form
2. PM-002: Edit Property Form
3. PM-003: Property Calendar
4. CM-001: Customers Page
5. CM-002: Customer Details

**Week 2 (Days 6-10)**:
6. CM-003: Customer Forms
7. INV-001: Invoices Page
8. INV-002: Invoice Details
9. QT-001: Quotes Page
10. QT-002: Quote Details

**Week 3 (Days 11-12)**:
11. QT-003: Create Quote Wizard
12. CON-001: Contract UX Improvements
13. CON-002: Contract Property Management
14. INT-001: Cross-page Integration
15. INT-002: Property Details Tabs
16. INT-003: Documentation

---

**Total Duration**: 10-12 days
**Total Story Points**: 45 points
**Team Velocity Required**: ~4 points/day

---

*Created: 2025-11-04*
*Ready for implementation!*
