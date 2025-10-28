# Story 005: Contractor Database

**Epic:** Contractor Management
**Priority:** MEDIUM
**Sprint:** Sprint 2 (Week 3-4)
**Story Points:** 8
**Status:** To Do

---

## User Story

**As a** landlord
**I want to** maintain a database of contractors with contact details and trade specialties
**So that** I can quickly assign the right person to work orders and contact them easily

---

## Acceptance Criteria

### AC-5.1: Create Contractor
- **Given** user is on Contractors screen OR assigning contractor to work order
- **When** user taps "Add Contractor" button
- **Then** display Create Contractor form with fields:
  - `name` (TextInput, required, max 100 chars)
  - `trade` (Dropdown/Autocomplete: Plumber, Electrician, Gas Engineer, Carpenter, Cleaner, Gardener, General Handyman, Other - allow custom entry)
  - `company_name` (TextInput, optional, max 100 chars)
  - `phone` (TextInput, required, UK format: `^(\+44|0)\d{10}$`)
  - `email` (TextInput, optional, email validation)
  - `notes` (TextInput, multiline: 3 rows, optional, max 500 chars, placeholder: "e.g., Available weekends only, £40/hour")
- **And** submit to `POST /api/contractors`
- **And** display SnackBar: "Contractor added successfully"
- **And** if triggered from work order flow, auto-select newly created contractor

### AC-5.2: List Contractors
- **Given** user is on Contractors screen
- **When** screen loads
- **Then** display FlatList of ContractorCard:
  - Shows: name, trade badge, company name, phone, active work orders count
  - Sort by name ASC (alphabetical)
- **And** enable SearchBar (searches: name, trade, company_name)
- **And** enable filter by trade (BottomSheet with checkboxes)
- **And** enable pull-to-refresh
- **And** implement pagination (20 items per page)

### AC-5.3: View Contractor Details
- **Given** user taps ContractorCard
- **Then** display:
  - name (H1 typography)
  - trade badge with icon
  - company_name (if provided)
  - phone (tappable, opens device phone app or SMS)
  - email (if provided, tappable, opens email client)
  - notes (full content)
  - Work Orders section: FlatList of all work orders assigned to contractor (sorted by status, then due_date)
  - Stats: Total work orders, Completed work orders, Average completion time (if data available)
- **And** show Edit/Delete IconButtons
- **And** show "Call Contractor" button (phone icon, large Button at bottom)
- **And** show "Send SMS" button (message icon, large Button at bottom)

### AC-5.4: Edit Contractor
- **Given** user taps "Edit Contractor" button
- **Then** pre-populate all fields with existing data
- **And** allow modification of any field
- **And** submit to `PATCH /api/contractors/:id`
- **And** display SnackBar: "Contractor updated successfully"

### AC-5.5: Delete Contractor
- **Given** user taps "Delete Contractor" button
- **When** contractor has active (non-completed) work orders
- **Then** display warning: "This contractor has [N] active work orders. Deleting will unassign them from these work orders. Continue?"
- **On** confirm:
  - Submit to `DELETE /api/contractors/:id`
  - API soft-deletes (set deleted_at)
  - API unassigns from all work orders (set contractor_id = null)
  - Display SnackBar: "Contractor deleted successfully"
  - Navigate back to Contractors List

### AC-5.6: Call Contractor
- **Given** user taps "Call Contractor" OR phone number
- **When** device supports phone calls
- **Then** open native phone app with pre-filled number: `Linking.openURL('tel:+44...')`
- **And** log action to analytics

### AC-5.7: Send SMS to Contractor
- **Given** user taps "Send SMS" button
- **Then** display Dialog with TextInput for custom message
- **And** pre-fill: "Hi [name], I've assigned you to a new work order: [work_order_title]. Please check the app for details."
- **On** confirm, submit to `POST /api/notifications/sms`
- **And** display SnackBar: "SMS sent successfully"

---

## Edge Cases

- **User deletes contractor with 50 completed work orders**
  - Expected: Allow (soft delete preserves historical data)

- **User searches by partial phone number**
  - Expected: Include in search results

- **User adds contractor with existing phone number**
  - Expected: Allow (multiple contractors can share phone, e.g., company number)

- **User taps "Call" on device without phone capability (tablet)**
  - Expected: Show error: "This device cannot make phone calls"

---

## Technical Implementation Notes

### API Endpoints
```javascript
POST /api/contractors
GET /api/contractors?search=plumber&trade=PLUMBER&page=1
GET /api/contractors/:id
PATCH /api/contractors/:id
DELETE /api/contractors/:id
```

### Database Model
```prisma
model Contractor {
  id                String    @id @default(uuid())
  tenant_id         String
  name              String    @db.VarChar(100)
  trade             String    @db.VarChar(50)
  company_name      String?   @db.VarChar(100)
  phone             String    @db.VarChar(20)
  email             String?   @db.VarChar(255)
  notes             String?   @db.VarChar(500)
  sms_opt_out       Boolean   @default(false)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])
  work_orders       WorkOrder[]

  @@index([tenant_id])
  @@index([tenant_id, trade])
}
```

### UI Components
```jsx
// ContractorCard
<Card>
  <Card.Content>
    <Text style={{ fontSize: 18, fontWeight: '500' }}>{name}</Text>
    <Chip icon="wrench">{trade}</Chip>
    {company_name && <Text>{company_name}</Text>}
    <Text style={{ color: '#2563EB' }}>{phone}</Text>
    <Chip icon="clipboard-check">{activeWorkOrderCount} active jobs</Chip>
  </Card.Content>
</Card>
```

### Validation
- phone: UK format `^(\+44|0)\d{10}$`
- email: Standard email regex (if provided)
- name: Required, max 100 chars
- trade: From predefined list OR custom if "Other"

---

## Testing Checklist

- [ ] Create contractor with valid UK phone (e.g., 07123456789)
- [ ] Create contractor with invalid phone → Validation error
- [ ] Create contractor with email → Email validated
- [ ] List contractors sorted alphabetically
- [ ] Search contractors by name → Results filtered
- [ ] Search by partial phone number → Results include match
- [ ] Filter by trade → Only matching contractors shown
- [ ] View contractor details → All fields displayed
- [ ] Work orders section shows assigned work orders
- [ ] Stats calculated correctly (total, completed)
- [ ] Edit contractor → Fields updated
- [ ] Delete contractor with active work orders → Warning shown
- [ ] Delete confirmed → Contractor soft-deleted, work orders unassigned
- [ ] Tap "Call" → Phone app opens with number
- [ ] Tap "Send SMS" → SMS dialog appears with pre-filled message
- [ ] Send SMS → SMS sent via Twilio (see Story 009)

---

## Dependencies

- **Related:** Work Order Management (Story 002) - for work order assignment
- **Related:** SMS Notifications (Story 009) - for SMS functionality

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] API endpoints implemented with tenant filtering
- [ ] Contractor CRUD operations working
- [ ] Search and filter functionality
- [ ] Call and SMS integration (using Linking API)
- [ ] Soft delete implemented
- [ ] Work order unassignment on delete
- [ ] Unit tests written (>70% coverage)
- [ ] Integration tests for API endpoints
- [ ] Code reviewed and merged
- [ ] Deployed to dev environment
