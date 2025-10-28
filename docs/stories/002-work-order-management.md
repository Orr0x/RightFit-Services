# Story 002: Work Order Management

**Epic:** Core Maintenance Features
**Priority:** CRITICAL
**Sprint:** Sprint 2 (Week 3-4)
**Story Points:** 13
**Status:** To Do

---

## User Story

**As a** landlord
**I want to** create work orders with priority levels, assign contractors, and track status
**So that** I efficiently manage maintenance tasks and ensure timely repairs

---

## Acceptance Criteria

### AC-2.1: Create Work Order (Mobile)
- **Given** user is on Property Detail screen
- **When** user taps "Create Work Order" FAB
- **Then** display form with:
  - `title` (TextInput, required, max 255 chars)
  - `description` (TextInput, multiline: 5 rows, max 2000 chars)
  - `priority` ButtonGroup (3 buttons, 60x60px, borderRadius: 8):
    - LOW (green #16A34A)
    - MEDIUM (orange #F59E0B)
    - HIGH (red #DC2626)
  - `contractor_id` (Autocomplete, searchable, optional)
  - `due_date` (DatePicker, optional, minDate: today)
  - Photo upload section
- **And** submit to `POST /api/work-orders` with property_id
- **And** display SnackBar: "Work order created successfully"
- **And** navigate to Work Order Detail screen

### AC-2.2: List Work Orders
- **Then** display FlatList of WorkOrderCard:
  - Card has left border (4px, priority color)
  - Shows: title, status badge, priority, property name, contractor, due date, photo count
  - Sort by priority DESC, created_at DESC
- **And** enable filtering (BottomSheet): status, priority, property, contractor
- **And** implement pagination (20 items per page)

### AC-2.3: Update Work Order Status
- **When** user taps Status badge
- **Then** show BottomSheet with Radio buttons: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
- **If** status = COMPLETED: Show Dialog for completion note, set completed_at
- **If** status = CANCELLED: Require cancellation reason
- **And** submit to `PATCH /api/work-orders/:id`
- **And** display SnackBar: "Status updated to [newStatus]"

### AC-2.4: Assign Contractor
- **When** user assigns contractor AND contractor has phone
- **Then** show Dialog: "Send SMS notification?"
- **On** Yes, trigger `POST /api/notifications/sms`
- **And** display SnackBar: "Contractor assigned successfully"

### AC-2.5: Edit Work Order
- **Given** user taps "Edit Work Order" button
- **Then** pre-populate all fields
- **And** allow modification of: title, description, priority, contractor, due_date
- **And** allow adding more photos
- **And** submit to `PATCH /api/work-orders/:id`

### AC-2.6: Delete Work Order
- **Given** user taps "Delete Work Order" button
- **When** confirmation Dialog displays
- **Then** submit to `DELETE /api/work-orders/:id`
- **And** API performs soft delete (set deleted_at)

---

## Edge Cases

- **Edge Case 1:** Contractor has 10+ active work orders
  - **Expected:** Show warning: "This contractor has [N] active work orders. Assign anyway?"

- **Edge Case 2:** Work order overdue 7+ days
  - **Expected:** Display red "OVERDUE" badge prominently on card

- **Edge Case 3:** Create while offline
  - **Expected:** Queue in WatermelonDB sync (see Story 003)

- **Edge Case 4:** User tries to set due_date in past during edit
  - **Expected:** Show validation error: "Due date cannot be in the past"

---

## Technical Implementation Notes

### API Endpoints
```javascript
POST /api/work-orders
GET /api/work-orders?status=OPEN&priority=HIGH&page=1&limit=20
GET /api/work-orders/:id
PATCH /api/work-orders/:id
DELETE /api/work-orders/:id
```

### Database Model (Prisma)
```prisma
model WorkOrder {
  id                String    @id @default(uuid())
  tenant_id         String
  property_id       String
  contractor_id     String?
  title             String    @db.VarChar(255)
  description       String?   @db.Text
  priority          Priority  @default(MEDIUM)
  status            WorkOrderStatus @default(OPEN)
  due_date          DateTime?
  completed_at      DateTime?
  completion_note   String?   @db.VarChar(500)
  cancellation_reason String? @db.VarChar(500)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  property          Property  @relation(fields: [property_id], references: [id])
  contractor        Contractor? @relation(fields: [contractor_id], references: [id])
  photos            Photo[]

  @@index([tenant_id])
  @@index([tenant_id, status])
  @@index([property_id])
  @@index([contractor_id])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum WorkOrderStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### UI Components
```jsx
// WorkOrderCard with priority-colored left border
<Card style={{
  borderLeftWidth: 4,
  borderLeftColor: priorityColor
}}>
  <StatusBadge status={status} />
  <PriorityChip priority={priority} />
</Card>

// Priority Button Group (60x60px buttons)
<PriorityButtonGroup
  value={priority}
  onChange={setPriority}
  options={['LOW', 'MEDIUM', 'HIGH']}
/>
```

### Business Logic
- **Status Change to COMPLETED:**
  - Set completed_at = NOW()
  - Optional completion_note
  - Cannot revert to OPEN without clearing completed_at

- **Status Change to CANCELLED:**
  - Require cancellation_reason (mandatory)
  - completed_at remains null

- **Contractor Assignment:**
  - If contractor has phone + SMS permission: Prompt to send SMS
  - Log assignment in work order history (post-MVP)

---

## Testing Checklist

- [ ] Create work order with all priority levels (LOW, MEDIUM, HIGH)
- [ ] Work order card displays correct left border color
- [ ] Assign contractor to work order
- [ ] Update status to IN_PROGRESS, COMPLETED, CANCELLED
- [ ] Completing work order sets completed_at timestamp
- [ ] Cancelling requires cancellation_reason
- [ ] Filter work orders by status, priority, property, contractor
- [ ] Overdue work orders show red OVERDUE badge
- [ ] Edit work order updates all fields
- [ ] Delete work order soft-deletes (sets deleted_at)
- [ ] SMS prompt appears when assigning contractor with phone

---

## Dependencies

- **Blocked By:** Property Management (Story 001)
- **Related:** Contractor Database (Story 005) - for contractor assignment
- **Related:** SMS Notifications (Story 009) - for contractor notifications

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] API endpoints implemented with tenant filtering
- [ ] Priority button group UI implemented (60x60px Material Design)
- [ ] Status change workflows implemented
- [ ] Filtering and search working
- [ ] Unit tests written (>70% coverage)
- [ ] Integration tests for status changes
- [ ] Soft delete verified
- [ ] Code reviewed and merged
- [ ] Deployed to dev environment
