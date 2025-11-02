# Property Sharing Architecture

## Overview

RightFit Services supports a multi-tenant property management system where different types of organizations can own and share properties:

- **Landlords**: Own residential/commercial properties for long-term rentals
- **Cleaning Services**: Own/manage short-term vacation rentals + service customer properties
- **Maintenance Services**: Service properties for various customers

## Database Schema Design

### Property Ownership Models

#### 1. `Property` Table (Tenant-Owned)
Used by **landlords** for their properties. Fields:
- `tenant_id` - Who owns it
- `owner_user_id` - User within tenant who manages it
- Standard property fields (address, type, bedrooms, etc.)
- **NEW**: `shares` relation → Properties can be shared with other tenants

#### 2. `CustomerProperty` Table (Customer-Owned)
Used by **service providers** (cleaning/maintenance) for customer properties. Fields:
- `customer_id` - Which customer owns this property
- `property_name`, `address`, `postcode`, etc.
- `cleaning_checklist_template_id` - Custom checklists per property
- `guest_portal_enabled` - For vacation rental guests
- Relations: `cleaning_jobs[]`, `maintenance_jobs[]`, `guest_issue_reports[]`

#### 3. `PropertyShare` Table (NEW - Sharing Mechanism)
Enables cross-tenant property sharing with granular permissions:

```prisma
model PropertyShare {
  id                    String    @id
  property_id           String    // Property being shared
  owner_tenant_id       String    // Landlord who owns it
  shared_with_tenant_id String    // Service provider receiving access
  share_type            ShareType // CLEANING_SERVICE | MAINTENANCE_SERVICE | GENERAL

  // Permissions
  can_view              Boolean   @default(true)
  can_edit              Boolean   @default(false)
  can_view_financial    Boolean   @default(false)
  can_view_certificates Boolean   @default(true)
  can_create_jobs       Boolean   @default(true)
  can_view_tenants      Boolean   @default(false)

  // Status
  is_active             Boolean   @default(true)
  shared_at             DateTime
  revoked_at            DateTime?
}
```

## Property Access Patterns

### Landlord App (localhost:5173)
**Can Access:**
- ✅ All properties where `tenant_id = landlord_tenant_id` AND `owner_type = TENANT_OWNED`
- ✅ Can share properties with cleaning/maintenance services via `PropertyShare`

**Cannot Access:**
- ❌ Properties owned by other landlords
- ❌ CustomerProperty table (customer-owned properties)

### Cleaning Service App (localhost:5174)
**Can Access:**
- ✅ Properties where `tenant_id = cleaning_service_tenant_id` (properties they own)
- ✅ CustomerProperty where `customer.service_provider_id = cleaning_provider_id` (customer properties)
- ✅ Properties shared with them via `PropertyShare` where `shared_with_tenant_id = cleaning_service_tenant_id`

**UI Sections:**
1. "Our Properties" - Properties owned by cleaning service
2. "Customer Properties" - Vacation rentals managed for customers
3. "Shared Properties" - Landlord properties shared with them (read-only or limited)

### Maintenance Service App (localhost:5175)
**Can Access:**
- ✅ Properties where `tenant_id = maintenance_service_tenant_id`
- ✅ CustomerProperty where `customer.service_provider_id = maintenance_provider_id`
- ✅ Properties shared via `PropertyShare`

**UI Sections:**
1. "Our Properties" - Properties owned by maintenance service
2. "Customer Properties" - Properties serviced for customers
3. "Shared Properties" - Landlord/cleaning properties shared with them

## Sharing Workflows

### Landlord → Cleaning Service
1. Landlord goes to Properties page
2. Clicks toggle: "Share with Cleaning Service"
3. Backend creates `PropertyShare` record with:
   - `share_type = CLEANING_SERVICE`
   - `can_create_jobs = true`
   - `can_view_certificates = true`
   - `can_view_financial = false`

### Landlord → Maintenance Service
1. Landlord clicks toggle: "Share with Maintenance Service"
2. Similar to above with `share_type = MAINTENANCE_SERVICE`

### Cleaning ↔ Maintenance (Cross-Service)
- Cleaning service finds maintenance issue during cleaning
- Can create maintenance job that references the CustomerProperty
- If needed, can share CustomerProperty between services

## Implementation Phases

### ✅ Phase 1: Database Schema (COMPLETE)
- ✅ Created `PropertyShare` table with permissions
- ✅ Added relations to `Tenant` and `Property` models
- ✅ Migration applied successfully

### ✅ Phase 2: API & Services (COMPLETE)
**Completed:**
1. ✅ Created `/api/property-shares` routes (CRUD operations) at [apps/api/src/routes/property-shares.ts](apps/api/src/routes/property-shares.ts)
2. ✅ Created `PropertySharesService` for business logic at [apps/api/src/services/PropertySharesService.ts](apps/api/src/services/PropertySharesService.ts)
3. ✅ Updated `/api/properties` to return:
   - Tenant's own properties (marked with `is_shared: false`)
   - Properties shared with tenant (marked with `is_shared: true`)
   - Share permissions included in response
   - Shared properties include `shared_by` tenant info

### ✅ Phase 2: Customer Property Management (COMPLETE)
**Backend:**
1. ✅ Added `tenant_id` to ServiceProvider model - Links service providers to their tenant accounts
2. ✅ Created `CustomersService` for managing service provider customers
3. ✅ Created `/api/customers` routes (CRUD operations)
4. ✅ Created `CustomerPropertiesService` for managing customer-owned properties
5. ✅ Created `/api/customer-properties` routes (CRUD operations)
6. ✅ All services use `tenant_id` from JWT to automatically get `service_provider_id`
7. ✅ Tenant isolation enforced - service providers only see their own customers/properties

**Key Implementation Details:**
- Services automatically resolve `tenant_id` → `service_provider_id` via database lookup
- No need for clients to pass `service_provider_id` manually
- All queries filtered by service provider to ensure data isolation
- Customer properties include counts for cleaning jobs, maintenance jobs, and guest issues

### 📋 Phase 3: Frontend UI (PENDING)
**Landlord App:**
- Add toggle switches to Properties page: "Share with Cleaning" / "Share with Maintenance"
- Show sharing status badges on property cards

**Cleaning/Maintenance Apps:**
- Update Properties page with tabs:
  - "Our Properties" (properties owned by the service provider tenant)
  - "Customer Properties" (from CustomerProperty table)
  - "Shared Properties" (landlord properties shared via PropertyShare)
- Add badges showing "Shared from [Landlord Name]"
- Enforce permission restrictions (read-only vs editable)

## API Endpoints (✅ IMPLEMENTED)

### Customer Management Endpoints
```
GET    /api/customers                          # List all customers for service provider
       ?page=1&limit=20&search=<term>          # Pagination and search support

POST   /api/customers                          # Create a new customer
       Body: {
         business_name: string,
         contact_name: string,
         email: string,
         phone: string,
         address?: string,
         customer_type: 'INDIVIDUAL' | 'PROPERTY_MANAGER' | 'VACATION_RENTAL',
         has_cleaning_contract?: boolean,
         has_maintenance_contract?: boolean,
         bundled_discount_percentage?: number,
         payment_terms?: 'NET_7' | 'NET_14' | 'NET_30' | 'NET_60' | 'DUE_ON_RECEIPT'
       }

GET    /api/customers/:id                      # Get customer details with properties

PATCH  /api/customers/:id                      # Update customer
       Body: { ...fields to update }

DELETE /api/customers/:id                      # Delete customer (soft delete)
```

### Customer Properties Endpoints
```
GET    /api/customer-properties                # List all customer properties
       ?page=1&limit=20&search=<term>          # Pagination and search support
       ?customer_id=<id>                       # Filter by customer

POST   /api/customer-properties                # Create a new customer property
       Body: {
         customer_id: string,
         property_name: string,
         address: string,
         postcode: string,
         property_type: string,
         bedrooms?: number,
         bathrooms?: number,
         access_instructions?: string,
         access_code?: string,
         cleaning_checklist_template_id?: string,
         guest_portal_enabled?: boolean
       }

GET    /api/customer-properties/:id            # Get property details

PATCH  /api/customer-properties/:id            # Update property
       Body: { ...fields to update }

DELETE /api/customer-properties/:id            # Delete property (soft delete)
```

### Property Sharing Endpoints
```
GET    /api/property-shares                    # List all shares for current tenant
       ?type=given|received|all                 # Filter by share direction (default: all)

POST   /api/property-shares                    # Share a property with another tenant
       Body: {
         property_id: string,
         shared_with_tenant_id: string,
         share_type: ShareType,
         can_view?: boolean,
         can_edit?: boolean,
         can_view_financial?: boolean,
         can_view_certificates?: boolean,
         can_create_jobs?: boolean,
         can_view_tenants?: boolean,
         notes?: string
       }

GET    /api/property-shares/:id                # Get share details

PATCH  /api/property-shares/:id                # Update permissions
       Body: {
         can_view?: boolean,
         can_edit?: boolean,
         can_view_financial?: boolean,
         can_view_certificates?: boolean,
         can_create_jobs?: boolean,
         can_view_tenants?: boolean,
         is_active?: boolean,
         notes?: string
       }

DELETE /api/property-shares/:id                # Revoke sharing (soft delete)

GET    /api/properties/:propertyId/shares      # See who property is shared with

GET    /api/properties/:propertyId/check-access # Check if current tenant has access
```

### Enhanced Properties Endpoints
```
GET    /api/properties?include_shared=true     # Get properties including shared ones
       # Default: returns both owned and shared properties
       # Set include_shared=false to only get owned properties

       # Response includes:
       - is_shared: boolean
       - share_permissions: { can_view, can_edit, ... } (if shared)
       - shared_by: { id, tenant_name } (if shared)
```

## Security Considerations

1. **Tenant Isolation**: Always filter by `tenant_id` to prevent cross-tenant data leaks
2. **Permission Enforcement**: Check `PropertyShare.can_*` flags before allowing operations
3. **Cascading Deletes**: Deleting a property auto-revokes all shares (`onDelete: Cascade`)
4. **Audit Trail**: Track `shared_at`, `revoked_at` for compliance

## Future Enhancements

1. **Time-Limited Sharing**: Add `expires_at` field to PropertyShare
2. **Share Requests**: Service provider requests access, landlord approves
3. **Activity Logs**: Track who accessed shared properties and what they did
4. **Bulk Sharing**: Share multiple properties at once
5. **Share Templates**: Save permission presets (e.g., "Cleaning Package", "Full Access")

## Testing Strategy

### Phase 1 Testing (Current):
- ✅ Migration applied successfully
- ⬜ Create test properties in each tenant
- ⬜ Verify no cross-tenant leakage

### Phase 2 Testing:
- ⬜ Test sharing property from landlord to cleaning service
- ⬜ Verify cleaning service can view but not edit financial data
- ⬜ Test permission boundaries

### Phase 3 Testing:
- ⬜ User acceptance testing with toggle switches
- ⬜ Test shared properties appear in correct sections
- ⬜ Verify read-only enforcement on shared properties

## Notes

- **CustomerProperty** remains separate from **Property** - they serve different purposes
- Each service provider can have their own customers AND access shared properties from landlords
- The system supports multi-directional sharing (landlord→service, service↔service)
- All sharing is explicit and auditable
