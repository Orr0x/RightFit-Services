# Story 001: Property Management

**Epic:** Core Property Features
**Priority:** CRITICAL
**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 8
**Status:** To Do

---

## User Story

**As a** landlord
**I want to** create and manage properties with full details (address, type, tenants)
**So that** I can organize my portfolio and track maintenance per property

---

## Acceptance Criteria

### AC-1.1: Create Property
- **Given** user is authenticated
- **When** user taps "Add Property" FAB (React Native Paper, bottom-right, backgroundColor: #2563EB)
- **Then** display Create Property form with fields:
  - `name` (TextInput, required, max 100 chars)
  - `address` (TextInput, required, max 255 chars, multiline: 3 rows)
  - `postcode` (TextInput, required, UK validation: `^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$`)
  - `property_type` (Dropdown: HOUSE, FLAT, COTTAGE, COMMERCIAL)
  - `bedrooms` (NumberInput, min: 0, max: 50)
  - `bathrooms` (NumberInput, min: 0, max: 20)
- **And** submit to `POST /api/properties`
- **And** display SnackBar: "Property created successfully"
- **And** navigate to Property Detail screen

### AC-1.2: List Properties
- **Given** user has properties
- **When** user views Properties screen
- **Then** display FlatList of PropertyCard:
  - Shows: name, address, property_type badge, work order count
  - Sort by created_at DESC
- **And** enable pull-to-refresh (RefreshControl)
- **And** implement pagination (20 items per page)

### AC-1.3: View Property Details
- **Given** user taps PropertyCard
- **Then** display:
  - Property details (name, address, type, bedrooms, bathrooms)
  - Tabbed interface: Work Orders | Compliance | Photos
- **And** show Edit/Delete IconButtons

### AC-1.4: Edit Property
- **Given** user taps "Edit Property" button
- **When** Edit Property form loads
- **Then** pre-populate all fields with existing data
- **And** allow user to modify any field
- **And** submit to `PATCH /api/properties/:id`
- **And** display SnackBar: "Property updated successfully"

### AC-1.5: Soft Delete Property
- **Given** user confirms deletion
- **Then** submit to `DELETE /api/properties/:id`
- **And** API sets `deleted_at` timestamp (soft delete, preserves data)
- **And** display SnackBar: "Property deleted successfully"
- **And** navigate back to Properties List

---

## Edge Cases

- **Edge Case 1:** User deletes property with active work orders
  - **Expected:** Show warning with work order count, require explicit confirmation

- **Edge Case 2:** User accesses property from different tenant
  - **Expected:** API returns 404 (not 403, to avoid revealing existence)

- **Edge Case 3:** User creates property with duplicate address
  - **Expected:** Allow (legitimate use case: multiple flats in same building)

- **Edge Case 4:** User tries to create property with invalid UK postcode
  - **Expected:** Display validation error: "Invalid UK postcode format"

---

## Technical Implementation Notes

### API Endpoints
```javascript
POST /api/properties
GET /api/properties?page=1&limit=20&search=cottage
GET /api/properties/:id
PATCH /api/properties/:id
DELETE /api/properties/:id
```

### Database Model (Prisma)
```prisma
model Property {
  id                String    @id @default(uuid())
  tenant_id         String
  name              String    @db.VarChar(100)
  address           String    @db.VarChar(255)
  postcode          String    @db.VarChar(10)
  property_type     PropertyType
  bedrooms          Int       @default(0)
  bathrooms         Int       @default(0)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])
  work_orders       WorkOrder[]
  certificates      Certificate[]

  @@index([tenant_id])
  @@index([tenant_id, deleted_at])
}

enum PropertyType {
  HOUSE
  FLAT
  COTTAGE
  COMMERCIAL
}
```

### UI Components
- **PropertyCard** (React Native Paper Card)
- **FAB** (Floating Action Button, #2563EB primary color)
- **TextInput** (React Native Paper, outlined mode)
- **Dropdown** (React Native Paper Menu/Select)
- **SnackBar** (React Native Paper Snackbar)

### Validation Rules
- UK postcode regex: `^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$`
- name: Required, max 100 chars
- address: Required, max 255 chars
- property_type: Required, enum validation
- bedrooms: Min 0, max 50
- bathrooms: Min 0, max 20

---

## Testing Checklist

- [ ] Create property with valid UK postcode (e.g., GL54 1AB)
- [ ] Create property with invalid postcode → Validation error
- [ ] List properties shows only current tenant's properties
- [ ] Property card displays work order count correctly
- [ ] Edit property updates all fields
- [ ] Delete property sets deleted_at (soft delete)
- [ ] Deleted properties don't appear in list
- [ ] Multi-tenancy: Tenant A cannot access Tenant B's properties
- [ ] Pull-to-refresh updates property list
- [ ] Pagination loads next 20 items on scroll

---

## Dependencies

- **Blocked By:** Authentication & Multi-Tenancy (Story 007) must be complete
- **Blocks:** Work Order Management (Story 002) - requires properties to exist

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] API endpoints implemented and tested
- [ ] Mobile UI implemented with React Native Paper
- [ ] Unit tests written (>70% coverage)
- [ ] Integration tests for API endpoints
- [ ] Multi-tenancy filtering verified
- [ ] Soft delete functionality tested
- [ ] Code reviewed and merged
- [ ] Deployed to dev environment
