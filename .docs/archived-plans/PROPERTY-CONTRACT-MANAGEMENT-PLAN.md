# Property & Contract Management Implementation Plan

**Created**: 2025-11-04
**Status**: READY FOR IMPLEMENTATION
**Priority**: HIGH
**Estimated Duration**: 5-7 days

---

## 🎯 Overview

Implement complete property and contract management features for the cleaning service provider portal, including:
1. **Property Management**: Add/edit customer properties with full CRUD operations
2. **Contract Management**: Revamp existing contracts page with improved UX
3. **Property Calendar**: Guest turnover tracking for scheduling cleaning jobs
4. **Integration**: Connect properties, contracts, and cleaning jobs

---

## 📸 Current State Analysis

### Properties Page (Existing)
**Status**: READ-ONLY list view
**Current Features**:
- ✅ Grid/list view toggle
- ✅ Customer properties display
- ✅ Click to view property details
- ✅ Customer association shown

**Missing Features**:
- ❌ Add new property form
- ❌ Edit property form
- ❌ Property deletion
- ❌ Access codes/instructions
- ❌ Property-specific checklists

### Contracts Page (Existing)
**Status**: FUNCTIONAL but needs UX improvements
**Current Features**:
- ✅ Contract list with status filtering
- ✅ Create contract modal
- ✅ Contract details modal
- ✅ Property assignment to contracts
- ✅ Pause/Resume/Cancel actions
- ✅ Per-property and flat monthly pricing

**Needs Improvement**:
- ⚠️ Better visual hierarchy
- ⚠️ Improved property management UI
- ⚠️ Contract statistics/insights
- ⚠️ Better mobile responsiveness
- ⚠️ Quick actions on contract cards

---

## 🏗️ Implementation Plan

### Phase 1: Property Management (Days 1-3)

#### Story PM-001: Add Property Form (2 days)
**Priority**: HIGH
**Points**: 5

**Backend API** (Already exists but verify):
- ✅ POST /api/customer-properties
- ✅ Authentication and tenant isolation
- Need to verify all required fields are supported

**Frontend Implementation**:

1. **Create AddPropertyPage.tsx**
```typescript
Location: /apps/web-cleaning/src/pages/AddProperty.tsx

Features:
- Property name and address
- Customer assignment (dropdown from existing customers)
- Property type (House, Flat, etc.)
- Bedrooms and bathrooms count
- Access instructions
- Special requirements
- Emergency contacts
- WiFi/parking/pets information
- Form validation
- Loading states
- Success/error toast notifications
```

2. **Form Fields**:
```typescript
interface PropertyFormData {
  property_name: string           // Required
  address: string                  // Required
  postcode: string                // Required
  customer_id: string             // Required - dropdown
  property_type: string           // House, Flat, etc.
  bedrooms: number                // Optional
  bathrooms: number               // Optional
  access_instructions: string?    // New field
  special_requirements: string?   // New field
  emergency_contact: string?      // New field
  wifi_ssid: string?              // New field
  wifi_password: string?          // New field
  has_parking: boolean            // New field
  has_pets: boolean               // New field
  pet_details: string?            // New field
}
```

3. **UI/UX Requirements**:
- Multi-section form (Basic Info, Access Details, Amenities)
- Customer dropdown with search
- Real-time validation
- "Save & Add Another" button
- "Save & View Details" button
- Cancel button returns to properties list
- Responsive design (mobile-friendly)

4. **Integration**:
- Route: `/properties/new`
- Add navigation from Properties list page
- Add to sidebar navigation (optional)
- Redirect to property details after creation

**Acceptance Criteria**:
- [ ] Can create property with all fields
- [ ] Customer dropdown works correctly
- [ ] Form validation prevents invalid submissions
- [ ] Success toast shows after creation
- [ ] Redirects to property details or list
- [ ] Property appears in properties list immediately

---

#### Story PM-002: Edit Property Form (1.5 days)
**Priority**: HIGH
**Points**: 4

**Backend API** (Already exists):
- ✅ PATCH /api/customer-properties/:id
- ✅ GET /api/customer-properties/:id

**Frontend Implementation**:

1. **Create EditPropertyPage.tsx**
```typescript
Location: /apps/web-cleaning/src/pages/EditProperty.tsx

Features:
- Reuse AddProperty form structure
- Pre-populate fields from existing property
- Show "Edit Property" title
- Update button instead of Create
- Loading state while fetching property
- Can't change customer after creation (or add confirmation)
- Optimistic updates
```

2. **UI Requirements**:
- Same form fields as Add Property
- Pre-filled with current values
- "Update Property" button
- "Cancel" returns to property details
- Confirmation dialog if customer is changed
- Show last updated timestamp

3. **Integration**:
- Route: `/properties/:id/edit`
- Add "Edit" button to Property Details page
- Add "Edit" button to Properties list (quick action)
- Redirect back to property details after update

**Acceptance Criteria**:
- [ ] Can load existing property data
- [ ] Can update all property fields
- [ ] Customer change requires confirmation
- [ ] Success toast on update
- [ ] Property details reflect changes immediately
- [ ] Loading and error states handled

---

#### Story PM-003: Property Calendar UI (1.5 days)
**Priority**: MEDIUM
**Points**: 4

**New Feature**: Guest turnover tracking for scheduling

**Database**: Already exists
- ✅ PropertyCalendar table
- ✅ guest_checkout_datetime, next_guest_checkin_datetime
- ✅ Linked to customer properties

**Backend API**: Verify or create
```typescript
GET    /api/property-calendars?property_id=xxx
POST   /api/property-calendars
PUT    /api/property-calendars/:id
DELETE /api/property-calendars/:id
```

**Frontend Component**:

1. **Create PropertyGuestCalendar.tsx**
```typescript
Location: /apps/web-cleaning/src/components/PropertyGuestCalendar.tsx

Features:
- Display list of upcoming guest turnovers
- Add new turnover entry (checkout + checkin datetimes)
- Edit existing entries
- Delete entries
- Calculate cleaning window (between checkout and checkin)
- Visual timeline/calendar view
- Filter by date range
- Quick actions: "Add Turnover", "Create Cleaning Job"
```

2. **Turnover Entry Form**:
```typescript
interface TurnoverEntry {
  property_id: string
  guest_checkout_datetime: DateTime
  next_guest_checkin_datetime: DateTime
  notes?: string
  cleaning_job_id?: string  // Link to created cleaning job
}
```

3. **Integration**:
- Add to Property Details page (new tab or section)
- Auto-calculate cleaning window duration
- Highlight urgent turnovers (same-day)
- Link to create cleaning job from turnover
- Show if cleaning job already scheduled for turnover

**Acceptance Criteria**:
- [ ] Can view property turnovers
- [ ] Can add new turnover with datetime pickers
- [ ] Can edit/delete turnovers
- [ ] Shows cleaning window clearly
- [ ] Validates checkin is after checkout
- [ ] Integration with PropertyDetails page

---

### Phase 2: Contract Management Revamp (Days 4-5)

#### Story CM-001: Contract List UX Improvements (1 day)
**Priority**: MEDIUM
**Points**: 3

**Improvements Needed**:

1. **Better Visual Design**:
- Larger, more prominent contract cards
- Status badges with icons
- Property count badges
- Monthly fee prominently displayed
- Customer info with avatar/icon
- Next billing date highlighted

2. **Enhanced Filtering**:
- Status filter (existing - keep)
- Customer search/filter
- Contract type filter
- Expiring soon filter
- Date range filter

3. **Quick Actions on Cards**:
- "View Details" (primary action)
- "Create Job" (if active)
- "Pause/Resume/Cancel" menu
- "Edit Contract" (coming soon)
- "View Jobs" (future)

4. **Statistics Section**:
```typescript
Contract Statistics:
- Total Active Contracts: X
- Total Monthly Revenue: £X,XXX
- Properties Under Contract: XX
- Upcoming Renewals: X
- Paused Contracts: X
```

5. **Responsive Design**:
- Stack cards on mobile
- Hide less important info on small screens
- Touch-friendly buttons
- Swipe actions (optional)

**Acceptance Criteria**:
- [ ] Contract cards are visually appealing
- [ ] Quick actions are easy to access
- [ ] Statistics section provides insights
- [ ] Filtering works smoothly
- [ ] Mobile-responsive layout
- [ ] Loading states are clear

---

#### Story CM-002: Contract Property Management Improvements (1 day)
**Priority**: MEDIUM
**Points**: 3

**Current Issues**:
- Property list in modal is basic
- Hard to see which properties are assigned
- Per-property fees not prominently shown
- No quick way to change fees

**Improvements**:

1. **Property Assignment UI**:
```typescript
Features:
- Visual property cards in contract details
- Show property photo/icon
- Display property address
- Show current fee (if per-property)
- Quick edit fee button
- Remove property button (with confirmation)
- Add property - better search/filter
```

2. **Add Property Modal**:
- Search properties by name or address
- Filter by customer (if applicable)
- Show already assigned properties (disabled)
- Multi-select to add multiple at once
- Set individual fees during add (per-property contracts)

3. **Property Fee Management**:
- Inline editing for per-property fees
- Validation (must be > 0)
- Auto-update total monthly fee
- Show fee history (optional)

4. **Bulk Operations** (Nice to have):
- Select multiple properties
- Update fees in bulk
- Remove multiple properties
- Export property list

**Acceptance Criteria**:
- [ ] Can easily add properties to contract
- [ ] Property list is visually clear
- [ ] Can edit fees inline
- [ ] Total updates automatically
- [ ] Can remove properties with confirmation
- [ ] Search/filter works well

---

### Phase 3: Integration & Polish (Days 6-7)

#### Story INT-001: Property-Contract-Job Integration (1 day)
**Priority**: HIGH
**Points**: 4

**Connect the workflow**:

1. **From Property to Contract**:
- Property details page: Show which contracts include this property
- Link to view contract details
- Quick action: "Add to Contract"

2. **From Contract to Jobs**:
- Contract details: Show cleaning jobs created from this contract
- Button: "Create Cleaning Job" from contract
- Job creation pre-fills property and customer from contract

3. **From Property Calendar to Jobs**:
- Turnover entry: Button "Create Cleaning Job"
- Pre-fill job with:
  - Property from turnover
  - Customer from property
  - Scheduled date from checkout datetime
  - Contract from property (if exists)

4. **Property Details Page Enhancements**:
- Add tabs: Overview | Calendar | History | Contracts | Jobs
- Overview: Property info, access details, amenities
- Calendar: Guest turnovers (new component)
- History: Existing PropertyHistoryTimeline
- Contracts: List contracts that include this property
- Jobs: List all cleaning jobs for this property

**Acceptance Criteria**:
- [ ] Can navigate from property to contracts
- [ ] Can create job from contract
- [ ] Can create job from turnover
- [ ] Property details has all tabs
- [ ] Data flows correctly between features

---

#### Story INT-002: Polish & Documentation (1 day)
**Priority**: MEDIUM
**Points**: 2

**Tasks**:

1. **Error Handling**:
- Consistent error messages
- Retry mechanisms
- Offline indicators
- Validation feedback

2. **Loading States**:
- Skeleton loaders for lists
- Button loading spinners
- Progressive loading for large lists
- Optimistic updates where appropriate

3. **Documentation**:
- Update CURRENT_STATUS.md
- Add user guide comments
- API documentation
- Component prop documentation

4. **Testing Checklist**:
- Property CRUD operations
- Contract property management
- Calendar turnover tracking
- Integration flows
- Error scenarios
- Mobile responsiveness

**Acceptance Criteria**:
- [ ] All error scenarios handled
- [ ] Loading states are smooth
- [ ] Documentation updated
- [ ] Testing checklist complete
- [ ] No critical bugs

---

## 📋 Technical Implementation Details

### API Endpoints Inventory

**Properties (Existing)**:
```
GET    /api/customer-properties              ✅
GET    /api/customer-properties/:id          ✅
POST   /api/customer-properties              ✅
PATCH  /api/customer-properties/:id          ✅
DELETE /api/customer-properties/:id          ✅
GET    /api/customer-properties/:id/history  ✅
```

**Contracts (Existing)**:
```
GET    /api/cleaning-contracts                           ✅
GET    /api/cleaning-contracts/:id                       ✅
POST   /api/cleaning-contracts                           ✅
PUT    /api/cleaning-contracts/:id                       ✅
PUT    /api/cleaning-contracts/:id/pause                 ✅
PUT    /api/cleaning-contracts/:id/resume                ✅
PUT    /api/cleaning-contracts/:id/cancel                ✅
POST   /api/cleaning-contracts/:id/properties            ✅
DELETE /api/cleaning-contracts/:id/properties/:propId    ✅
PUT    /api/cleaning-contracts/:id/properties/:propId/fee ✅
GET    /api/cleaning-contracts/:id/monthly-fee           ✅
```

**Property Calendar (Verify/Create)**:
```
GET    /api/property-calendars?property_id=xxx  ⚠️ Verify
POST   /api/property-calendars                  ⚠️ Verify
PUT    /api/property-calendars/:id              ⚠️ Verify
DELETE /api/property-calendars/:id              ⚠️ Verify
```

**New Endpoints Needed**: None (all exist or need verification only)

---

### Database Schema Review

**CustomerProperty** (Existing):
```prisma
model CustomerProperty {
  id                    String   @id @default(uuid())
  property_name         String
  address               String
  postcode              String
  customer_id           String
  service_provider_id   String
  property_type         String?
  bedrooms              Int?
  bathrooms             Int?
  // New fields to add (optional - can use JSON or separate fields):
  access_instructions   String?  @db.Text
  special_requirements  String?  @db.Text
  emergency_contact     String?
  wifi_ssid             String?
  wifi_password         String?
  has_parking           Boolean  @default(false)
  has_pets              Boolean  @default(false)
  pet_details           String?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
}
```

**PropertyCalendar** (Existing):
```prisma
model PropertyCalendar {
  id                          String   @id @default(uuid())
  property_id                 String   // Can be Property or CustomerProperty
  guest_checkout_datetime     DateTime
  next_guest_checkin_datetime DateTime
  clean_window_start          DateTime
  clean_window_end            DateTime
  notes                       String?  @db.Text
  cleaning_job_id             String?
  created_at                  DateTime @default(now())
  updated_at                  DateTime @updatedAt
}
```

**CleaningContract** (Existing):
```prisma
model CleaningContract {
  id                    String   @id @default(uuid())
  customer_id           String
  service_provider_id   String
  contract_type         String   // FLAT_MONTHLY | PER_PROPERTY
  contract_start_date   DateTime
  contract_end_date     DateTime?
  monthly_fee           Decimal
  billing_day           Int
  status                String   // ACTIVE | PAUSED | CANCELLED
  notes                 String?  @db.Text
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  property_contracts    ContractProperty[]
  cleaning_jobs         CleaningJob[]
}
```

---

## 🎨 UI/UX Patterns

### Form Layout Pattern
```typescript
<div className="max-w-3xl mx-auto">
  <div className="mb-6">
    <Button variant="secondary" onClick={goBack}>← Back</Button>
    <h1>Add/Edit Property</h1>
  </div>

  <Card>
    <form>
      {/* Section 1: Basic Info */}
      <div className="mb-8">
        <h2>Property Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Property Name" required />
          <Select label="Customer" required />
          {/* ... */}
        </div>
      </div>

      {/* Section 2: Access Details */}
      <div className="mb-8">
        <h2>Access & Instructions</h2>
        {/* ... */}
      </div>

      {/* Section 3: Amenities */}
      <div className="mb-8">
        <h2>Amenities</h2>
        {/* ... */}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit">Save Property</Button>
        <Button variant="secondary">Cancel</Button>
      </div>
    </form>
  </Card>
</div>
```

### Contract Card Pattern
```typescript
<Card className="p-6 hover:shadow-lg transition-shadow">
  <div className="flex justify-between items-start mb-4">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <h3>{contract.customer.business_name}</h3>
        <Badge color={getStatusColor(status)}>{status}</Badge>
      </div>
      <p className="text-sm text-gray-600">
        {getContractTypeLabel(type)} • {propertyCount} properties
      </p>
    </div>
    <div className="text-right">
      <div className="text-2xl font-bold text-green-600">
        £{monthlyFee.toFixed(2)}
      </div>
      <div className="text-xs text-gray-500">
        Next billing: {billingDate}
      </div>
    </div>
  </div>

  <div className="flex gap-2">
    <Button size="sm" onClick={viewDetails}>Details</Button>
    <Button size="sm" onClick={createJob}>Create Job</Button>
    <DropdownMenu>
      {/* Pause/Resume/Cancel */}
    </DropdownMenu>
  </div>
</Card>
```

---

## 📊 Success Metrics

### Property Management
- ✅ Can add property in < 2 minutes
- ✅ Form validation prevents errors
- ✅ Property appears in list immediately
- ✅ Edit flow is intuitive
- ✅ All property data is captured correctly

### Contract Management
- ✅ Contract cards are visually clear
- ✅ Quick actions reduce clicks
- ✅ Property management is smooth
- ✅ Statistics provide insights
- ✅ Mobile experience is good

### Integration
- ✅ Property → Contract → Job flow works
- ✅ Calendar → Job creation works
- ✅ Data flows correctly
- ✅ No data loss or errors
- ✅ Navigation is intuitive

---

## 🚀 Development Sprint Plan

### Sprint Schedule

**Day 1**: PM-001 (Add Property) - Backend verification + Form structure
**Day 2**: PM-001 (Add Property) - Complete form + Integration
**Day 3**: PM-002 (Edit Property) + PM-003 (Calendar) start
**Day 4**: PM-003 (Calendar) complete + CM-001 (Contract UX) start
**Day 5**: CM-001 (Contract UX) + CM-002 (Property Management)
**Day 6**: INT-001 (Integration) - Connect all features
**Day 7**: INT-002 (Polish) - Testing + Documentation

### Daily Goals

**Day 1**:
- [ ] Verify/update backend API for property fields
- [ ] Create AddProperty.tsx component
- [ ] Build form structure with validation
- [ ] Test basic property creation

**Day 2**:
- [ ] Complete all form sections
- [ ] Add customer dropdown integration
- [ ] Implement success/error handling
- [ ] Test full property creation flow
- [ ] Add navigation integration

**Day 3**:
- [ ] Create EditProperty.tsx (reuse Add form)
- [ ] Test property editing
- [ ] Start PropertyGuestCalendar component
- [ ] Build turnover entry form

**Day 4**:
- [ ] Complete calendar UI
- [ ] Test turnover CRUD operations
- [ ] Start contract list improvements
- [ ] Design contract card layout

**Day 5**:
- [ ] Complete contract UI updates
- [ ] Improve property management in contracts
- [ ] Add quick actions
- [ ] Build statistics section

**Day 6**:
- [ ] Add tabs to Property Details
- [ ] Connect property → contracts
- [ ] Connect contract → jobs
- [ ] Connect calendar → jobs
- [ ] Test all integration flows

**Day 7**:
- [ ] Polish error handling
- [ ] Improve loading states
- [ ] Update documentation
- [ ] Complete testing checklist
- [ ] Fix any bugs found

---

## 📁 Files to Create/Modify

### New Files
```
/apps/web-cleaning/src/pages/
  AddProperty.tsx                    ⭐ NEW
  EditProperty.tsx                   ⭐ NEW

/apps/web-cleaning/src/components/
  PropertyGuestCalendar.tsx          ⭐ NEW
  PropertyFormFields.tsx             ⭐ NEW (shared form)

/apps/api/src/routes/
  property-calendars.ts              ⚠️ Verify exists

/apps/api/src/services/
  PropertyCalendarService.ts         ⚠️ Verify exists
```

### Files to Modify
```
/apps/web-cleaning/src/pages/
  CleaningContracts.tsx              🔄 UX improvements
  Properties.tsx                     🔄 Add "Add Property" button
  PropertyDetails.tsx                🔄 Add tabs, integrate calendar

/apps/web-cleaning/src/components/contracts/
  ContractDetailsModal.tsx           🔄 Improve property management

/apps/web-cleaning/src/
  App.tsx                            🔄 Add routes for Add/Edit property
```

---

## ✅ Acceptance Criteria Summary

### Must Have (MVP)
- [ ] Can add new properties with all fields
- [ ] Can edit existing properties
- [ ] Can view property turnover calendar
- [ ] Can add/edit turnover entries
- [ ] Contract list has better UX
- [ ] Can manage properties in contracts easily
- [ ] Property → Contract → Job flow works
- [ ] Calendar → Job flow works

### Nice to Have (Post-MVP)
- [ ] Bulk property operations
- [ ] Property photos upload
- [ ] Contract analytics dashboard
- [ ] Advanced filtering options
- [ ] Export functionality
- [ ] Property templates

---

## 🔗 Related Documentation

- [CLEANING-WORKFLOW-PLAN.md](./CLEANING-WORKFLOW-PLAN.md) - Overall cleaning workflow
- [CURRENT_STATUS.md](../CURRENT_STATUS.md) - Project status
- [COMPLETE-WORKFLOW-GUIDE.md](./COMPLETE-WORKFLOW-GUIDE.md) - User workflows

---

**Status**: ✅ PLAN READY FOR IMPLEMENTATION
**Next Step**: Begin Day 1 - Property Add Form
**Estimated Completion**: 7 days from start
