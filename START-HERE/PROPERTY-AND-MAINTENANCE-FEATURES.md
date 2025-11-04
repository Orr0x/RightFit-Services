# Property Management, Customer Maintenance & Portal Enhancements

**Last Updated**: 2025-11-03 (Updated with Maintenance Portal stories)
**Status**: Planning Phase - Ready for Implementation
**Priority**: High

## Overview

This document tracks the implementation of critical features across the RightFit Services platform:

1. **Add Property Feature** - Enable property creation across all portal types (Landlord, Cleaning Company, Customer)
2. **Customer-Initiated Maintenance Jobs** - Allow customers to raise maintenance requests directly from their portal
3. **Cleaning Portal Bug Fixes** - Fix critical routing and functionality bugs preventing portal use
4. **Maintenance Portal Enhancements** - Quotes/invoices pages, contractor management, and certificate system improvements

---

## Feature 1: Add Property Across All Portals

### Current State Analysis

| Portal | Status | Notes |
|--------|--------|-------|
| **Landlord Portal** | ✅ Working | Full property creation functionality exists and is operational |
| **Cleaning Company Portal** | ⚠️ Broken | Has "Add Property" button but functionality doesn't work |
| **Customer Portal** | ❌ Missing | No property creation capability exists |

### Business Context

Properties are the foundation of the multi-tenant platform. Each tenant type needs the ability to add properties they manage or own:
- **Landlords**: Add properties they own and manage
- **Cleaning Companies**: Add properties of clients they service (with customer association)
- **Customers**: Add properties they own (for direct service access)

---

## STORY-001: Fix "Add Property" Button in Cleaning Company Portal

### User Story
**As a** cleaning company administrator
**I want to** add new properties to manage
**So that** I can schedule cleaning jobs for client properties

### Acceptance Criteria
- [ ] Clicking "Add Property" button opens a functional form
- [ ] Form includes all required property fields:
  - Property name
  - Full address (street, city, postcode)
  - Property type (House, Flat, Cottage, etc.)
  - Number of bedrooms
  - Number of bathrooms
  - Customer/owner association
  - Access instructions
- [ ] Form validation works correctly:
  - Required fields are enforced
  - Postcode format validation
  - Number fields accept only positive integers
- [ ] Successful submission creates property in database
- [ ] Property appears in cleaning company's property list immediately
- [ ] Property is associated with the correct customer
- [ ] Error handling displays appropriate messages
- [ ] Success toast notification appears after creation

### Technical Implementation

**Files to Check/Fix:**
```
apps/web-cleaning/src/pages/Properties.tsx - Check button implementation
apps/web-cleaning/src/components/forms/AddPropertyForm.tsx - May need creation
```

**API Endpoint:**
- POST `/api/cleaning/properties`
- Requires authentication token
- Body should include all property fields + customer_id

**Database:**
- Insert into `properties` table
- Create association in `property_access` table linking cleaning company to property
- Link to customer if provided

**Investigation Needed:**
1. Does the button exist but has no onClick handler?
2. Is there a form component that's broken?
3. Are API routes missing or misconfigured?
4. Check console for any JavaScript errors when button is clicked

### Testing Checklist
- [ ] Button is visible and enabled for cleaning company users
- [ ] Form opens when button is clicked
- [ ] All fields are editable and validate correctly
- [ ] Property creation succeeds and returns 201 status
- [ ] New property appears in list with correct details
- [ ] Property is accessible for cleaning job creation
- [ ] Customer association works correctly
- [ ] Error scenarios handled gracefully (network errors, validation errors)

### Dependencies
- Authentication system (for tenant context)
- Customer lookup/selection component
- Property API endpoints
- Property access control logic

---

## STORY-002: Implement "Add Property" Feature in Customer Portal

### User Story
**As a** property owner (customer)
**I want to** add my properties to the platform
**So that** I can request maintenance and cleaning services for them

### Acceptance Criteria
- [ ] "Add Property" button is visible on Properties page
- [ ] Button opens a property creation form/modal
- [ ] Form captures essential property information:
  - Property name
  - Full address (street, city, postcode)
  - Property type (dropdown: House, Flat, Apartment, Cottage, Commercial, etc.)
  - Number of bedrooms
  - Number of bathrooms
  - Access instructions (optional but recommended)
  - Special notes (optional)
- [ ] Form validation enforces:
  - Required fields (name, address, postcode, type)
  - Valid postcode format (UK format)
  - Positive integers for bedrooms/bathrooms
- [ ] Property is created with customer automatically as owner
- [ ] Property appears immediately in customer's property list
- [ ] Guest tablet link is generated automatically
- [ ] Success message shows with confirmation
- [ ] Form can be cancelled without saving
- [ ] Form clears after successful submission

### Technical Implementation

**Files to Create/Modify:**
```
apps/web-customer/src/pages/Properties.tsx - Add button and handler
apps/web-customer/src/components/forms/AddPropertyForm.tsx - NEW
apps/api/src/routes/customer-portal.ts - Add POST endpoint
apps/api/src/services/CustomerPortalService.ts - Add createProperty method
```

**UI Components Needed:**
1. **AddPropertyButton** - Prominent button on Properties page
2. **AddPropertyModal** - Modal wrapper for form
3. **AddPropertyForm** - Form with fields and validation

**API Endpoint Design:**
```typescript
POST /api/customer-portal/properties?customer_id={id}
Authorization: Bearer {token}

Request Body:
{
  "property_name": string,
  "address": string,
  "city": string,
  "postcode": string,
  "property_type": string,
  "bedrooms": number,
  "bathrooms": number,
  "access_instructions"?: string,
  "special_notes"?: string
}

Response 201:
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": string,
    "property_name": string,
    "guest_tablet_code": string,
    // ... other fields
  }
}
```

**Database Operations:**
1. Insert into `properties` table with owner_id = customer.id
2. Generate unique guest_tablet_code (8-character alphanumeric)
3. Create property_access record for customer
4. Set default property settings

**Form Field Specifications:**
```typescript
interface PropertyFormData {
  property_name: string          // Required, max 100 chars
  address: string                // Required, max 200 chars
  city: string                   // Required, max 100 chars
  postcode: string               // Required, UK format validation
  property_type: PropertyType    // Required, dropdown enum
  bedrooms: number               // Required, min 0, max 50
  bathrooms: number              // Required, min 0, max 20
  access_instructions?: string   // Optional, max 1000 chars
  special_notes?: string         // Optional, max 500 chars
}

enum PropertyType {
  HOUSE = 'House',
  FLAT = 'Flat',
  APARTMENT = 'Apartment',
  COTTAGE = 'Cottage',
  BUNGALOW = 'Bungalow',
  TERRACED = 'Terraced',
  SEMI_DETACHED = 'Semi-Detached',
  DETACHED = 'Detached',
  COMMERCIAL = 'Commercial',
  OTHER = 'Other'
}
```

### UI/UX Design Notes

**Button Placement:**
- Top right of Properties page header
- Primary button style (blue/prominent)
- Icon: `<AddIcon />` or house/plus icon
- Text: "+ Add Property"

**Modal Design:**
- Title: "Add New Property"
- Full-width modal on mobile, centered dialog on desktop
- Two-column layout for larger screens
- Clear section headers (Property Details, Location, Specifications)
- Cancel and Save buttons at bottom
- Form validates on blur and on submit

**Success Flow:**
1. Form submits → Loading state on Save button
2. Success → Toast notification "Property added successfully!"
3. Modal closes automatically
4. Property list refreshes showing new property
5. Optional: Scroll to or highlight new property card

**Error Handling:**
- Network errors: "Unable to connect. Please check your connection."
- Validation errors: Field-specific messages below each field
- Server errors: General message with retry option
- Duplicate property names: Warning but allow (add property ID to disambiguate)

### Testing Checklist
- [ ] Button appears on Properties page for customer users
- [ ] Button click opens modal with empty form
- [ ] All fields render correctly with proper labels
- [ ] Property type dropdown has all options
- [ ] Required field validation works (red borders, error messages)
- [ ] Postcode validation accepts UK formats
- [ ] Number fields reject negative/decimal values
- [ ] Cancel button closes modal without saving
- [ ] Save button disabled until form is valid
- [ ] Successful save creates property in database
- [ ] Guest tablet code is generated and stored
- [ ] New property appears in list immediately
- [ ] Property can be clicked to view details
- [ ] Form clears when reopened after successful save
- [ ] Error messages display for failed submissions
- [ ] Works on mobile, tablet, and desktop viewports

### Dependencies
- Material-UI Dialog/Modal component
- Form validation library (react-hook-form or similar)
- UK postcode validation regex
- Customer authentication context
- Property refresh/refetch logic

---

## STORY-003: Standardize Property Creation Across All Portals

### User Story
**As a** platform developer
**I want to** ensure property creation is consistent across all portals
**So that** the user experience is uniform and maintainable

### Acceptance Criteria
- [ ] All three portals use the same property data structure
- [ ] Property type options are consistent across portals
- [ ] Validation rules are identical for all portals
- [ ] Success/error messages use the same wording
- [ ] Guest tablet code generation is consistent
- [ ] Property access permissions are set correctly for each tenant type

### Technical Implementation

**Create Shared Components:**
```
packages/ui/src/forms/PropertyForm.tsx - Shared form component
packages/ui/src/validation/propertySchema.ts - Shared validation
packages/types/src/property.ts - Shared TypeScript types
```

**Validation Schema (Zod/Yup):**
```typescript
const propertySchema = z.object({
  property_name: z.string().min(1, "Required").max(100),
  address: z.string().min(1, "Required").max(200),
  city: z.string().min(1, "Required").max(100),
  postcode: z.string().regex(UK_POSTCODE_REGEX, "Invalid UK postcode"),
  property_type: z.enum(PROPERTY_TYPES),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(20),
  access_instructions: z.string().max(1000).optional(),
  special_notes: z.string().max(500).optional(),
})
```

**API Consolidation:**
- Landlord: `/api/landlord/properties` (POST)
- Cleaning: `/api/cleaning/properties` (POST)
- Customer: `/api/customer-portal/properties` (POST)

All should accept same request body structure and return same response format.

### Testing Checklist
- [ ] Landlord portal property creation still works after refactor
- [ ] Cleaning portal property creation works with shared components
- [ ] Customer portal property creation works with shared components
- [ ] All portals validate identically
- [ ] Database records created are identical in structure (except tenant associations)
- [ ] Guest tablet codes work regardless of which portal created property
- [ ] No regressions in existing functionality

---

## Feature 2: Customer-Initiated Maintenance Jobs

### Business Context

Currently, maintenance jobs are created by landlords or service providers. Customers (property owners) should be able to directly request maintenance services, streamlining communication and reducing response time.

**Workflow:**
1. Customer identifies maintenance issue at their property
2. Customer creates maintenance job request in portal
3. System creates job with status "PENDING_APPROVAL"
4. Landlord/maintenance coordinator receives notification
5. Coordinator can approve, reject, or modify job request
6. If approved, job enters standard maintenance workflow

---

## STORY-004: Customer Maintenance Job Creation - UI & Form

### User Story
**As a** property owner (customer)
**I want to** submit maintenance requests for my properties
**So that** issues can be addressed quickly without phone calls or emails

### Acceptance Criteria
- [ ] "Request Maintenance" button visible on customer dashboard
- [ ] Button also available on each property card
- [ ] Clicking button opens maintenance request form
- [ ] Form includes:
  - Property selection (dropdown of customer's properties)
  - Issue category (dropdown: Plumbing, Electrical, Structural, Appliance, etc.)
  - Issue title/summary (text input, max 100 chars)
  - Detailed description (textarea, max 2000 chars)
  - Priority/urgency selector (Low, Medium, High, Urgent)
  - Photo upload (up to 5 images, max 5MB each)
  - Preferred access times (optional text field)
  - Customer contact preference (phone/email)
- [ ] Form validation enforces required fields
- [ ] Image upload shows preview thumbnails
- [ ] Images are compressed/resized before upload
- [ ] Submit button disabled during upload
- [ ] Success confirmation after submission
- [ ] Customer can view submitted request in new "My Requests" page

### Technical Implementation

**Files to Create:**
```
apps/web-customer/src/pages/MaintenanceRequests.tsx - NEW (list view)
apps/web-customer/src/pages/CreateMaintenanceRequest.tsx - NEW (form)
apps/web-customer/src/components/forms/MaintenanceRequestForm.tsx - NEW
```

**Files to Modify:**
```
apps/web-customer/src/pages/dashboards/CustomerDashboard.tsx - Add button
apps/web-customer/src/pages/Properties.tsx - Add button to property cards
apps/web-customer/src/App.tsx - Add routes
apps/web-customer/src/components/layout/AppLayout.tsx - Add nav item
```

**API Endpoints:**
```typescript
// Create maintenance request
POST /api/customer-portal/maintenance-requests?customer_id={id}
Authorization: Bearer {token}

Request Body:
{
  "property_id": string,
  "category": string,
  "title": string,
  "description": string,
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "photos": string[],  // Array of uploaded image URLs
  "preferred_access_times": string?,
  "contact_preference": "PHONE" | "EMAIL" | "EITHER"
}

Response 201:
{
  "success": true,
  "message": "Maintenance request submitted successfully",
  "data": {
    "id": string,
    "request_number": string,  // e.g., "MR-2025-00001"
    "status": "PENDING_APPROVAL",
    "created_at": string,
    // ... other fields
  }
}

// Get customer's maintenance requests
GET /api/customer-portal/maintenance-requests?customer_id={id}
GET /api/customer-portal/maintenance-requests/{id}?customer_id={customer_id}
```

**Database Schema:**
```sql
-- New table for customer-initiated maintenance requests
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  category VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL,
  photos JSONB DEFAULT '[]',
  preferred_access_times TEXT,
  contact_preference VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  maintenance_job_id UUID REFERENCES maintenance_jobs(id),
  CONSTRAINT maintenance_requests_customer_fk FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT maintenance_requests_property_fk FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE INDEX idx_maintenance_requests_customer ON maintenance_requests(customer_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_created_at ON maintenance_requests(created_at DESC);
```

**Form Component Structure:**
```typescript
interface MaintenanceRequestFormData {
  property_id: string
  category: MaintenanceCategory
  title: string
  description: string
  urgency: UrgencyLevel
  photos: File[]
  preferred_access_times?: string
  contact_preference: ContactPreference
}

enum MaintenanceCategory {
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
  HEATING = 'Heating/HVAC',
  STRUCTURAL = 'Structural',
  APPLIANCE = 'Appliance',
  ROOFING = 'Roofing',
  WINDOWS_DOORS = 'Windows & Doors',
  PEST_CONTROL = 'Pest Control',
  LANDSCAPING = 'Landscaping',
  SECURITY = 'Security Systems',
  OTHER = 'Other'
}

enum UrgencyLevel {
  LOW = 'Low - Can wait 1-2 weeks',
  MEDIUM = 'Medium - Within 3-5 days',
  HIGH = 'High - Within 24-48 hours',
  URGENT = 'Urgent - Immediate attention needed'
}

enum ContactPreference {
  PHONE = 'Phone',
  EMAIL = 'Email',
  EITHER = 'Either'
}
```

### UI/UX Design Notes

**Button Placement:**
1. **Dashboard**: Prominent card/button in main content area
   - Title: "Request Maintenance"
   - Description: "Report an issue at your property"
   - Icon: Wrench or tools icon

2. **Property Cards**: Secondary button next to "Copy Guest Tablet Link"
   - Text: "Request Maintenance"
   - Only shows for properties customer owns

**Form Design:**
- Multi-step form OR single-page with sections
- Recommendation: Single page with clear sections
- Sections:
  1. Property & Category (required)
  2. Issue Details (required)
  3. Photos (optional but recommended)
  4. Access & Contact Preferences (optional)
- Progress indicator if multi-step
- Save draft functionality (nice-to-have)

**Photo Upload:**
- Drag-and-drop area with click-to-browse fallback
- Show thumbnail grid of uploaded images
- X button to remove each image
- Image compression on client-side before upload
- Target max: 800px width, 70% quality JPEG
- Upload to S3 or image storage service

**Success Page:**
- Confirmation message: "Your maintenance request has been submitted"
- Display request number: "Request #MR-2025-00001"
- Next steps information:
  - "Our maintenance team will review your request within 24 hours"
  - "You'll receive an email/SMS when your request is approved"
  - "You can track the status in 'My Requests'"
- Action buttons:
  - "View My Requests"
  - "Submit Another Request"
  - "Back to Dashboard"

### Testing Checklist
- [ ] Button visible on dashboard for customers
- [ ] Button visible on each property card
- [ ] Form opens correctly from both locations
- [ ] Property dropdown shows only customer's properties
- [ ] If opened from property card, property is pre-selected
- [ ] All category options are available
- [ ] Title and description fields accept text correctly
- [ ] Urgency selector has all options
- [ ] Photo upload accepts common image formats (JPEG, PNG, HEIC)
- [ ] Photo upload rejects files over 5MB
- [ ] Photo upload shows error for more than 5 images
- [ ] Photo thumbnails display correctly
- [ ] Remove photo button works
- [ ] Form validates on submit
- [ ] Submit button shows loading state during upload
- [ ] Success message displays after submission
- [ ] Request appears in "My Requests" page
- [ ] Request has correct status (PENDING_APPROVAL)
- [ ] Photos are stored and accessible
- [ ] Form clears after successful submission
- [ ] Mobile responsive design works correctly

### Dependencies
- Image upload service (S3/Cloudinary/similar)
- Image compression library (browser-image-compression)
- File upload component
- Property selection component
- Customer authentication & property access
- Email/SMS notification system (for confirmations)

---

## STORY-005: Maintenance Request Approval Workflow

### User Story
**As a** landlord or maintenance coordinator
**I want to** review and approve customer maintenance requests
**So that** I can manage service costs and work orders effectively

### Acceptance Criteria
- [ ] Pending maintenance requests appear in landlord/maintenance portal
- [ ] New badge/notification shows count of pending requests
- [ ] Clicking request shows full details including photos
- [ ] Coordinator can approve request with options:
  - Approve as-is (creates maintenance job automatically)
  - Approve with modifications (edit priority, add notes)
  - Request more information (sends message to customer)
  - Reject with reason (notifies customer)
- [ ] Approved requests create maintenance_jobs automatically
- [ ] Customer receives notification of approval/rejection
- [ ] Request status updates in customer portal
- [ ] Approved job appears in maintenance job list
- [ ] Link between maintenance_request and maintenance_job is maintained

### Technical Implementation

**Files to Create:**
```
apps/web-landlord/src/pages/MaintenanceRequests.tsx - NEW
apps/web-maintenance/src/pages/MaintenanceRequests.tsx - NEW
```

**API Endpoints:**
```typescript
// Get pending requests for landlord
GET /api/landlord/maintenance-requests?status=PENDING_APPROVAL

// Approve request
POST /api/landlord/maintenance-requests/{id}/approve
Body: {
  "priority"?: string,  // Override urgency mapping
  "notes"?: string,     // Additional coordinator notes
  "schedule_date"?: string  // Optional scheduled start date
}

// Reject request
POST /api/landlord/maintenance-requests/{id}/reject
Body: {
  "reason": string  // Required rejection reason
}

// Request more info
POST /api/landlord/maintenance-requests/{id}/request-info
Body: {
  "message": string  // Question/request for customer
}
```

**Service Logic (CustomerPortalService or MaintenanceService):**
```typescript
async approveMaintenanceRequest(requestId: string, approvalData: ApprovalData) {
  // 1. Update maintenance_request status to APPROVED
  // 2. Create maintenance_job from request data
  // 3. Link maintenance_job_id to maintenance_request
  // 4. Map urgency to priority (URGENT → URGENT, HIGH → HIGH, etc.)
  // 5. Copy photos to maintenance_job
  // 6. Send notification to customer
  // 7. Create activity log entry
  // 8. Return created maintenance_job
}

async rejectMaintenanceRequest(requestId: string, reason: string) {
  // 1. Update maintenance_request status to REJECTED
  // 2. Store rejection_reason
  // 3. Send notification to customer with reason
  // 4. Create activity log entry
}
```

**Status Flow:**
```
PENDING_APPROVAL (initial)
  → APPROVED → maintenance_job created → follows normal job workflow
  → REJECTED → ends here, customer notified
  → INFO_REQUESTED → customer responds → back to PENDING_APPROVAL
```

**Notification Templates:**
```
Approval Email:
Subject: Your Maintenance Request #MR-2025-00001 has been Approved
Body:
  "Good news! Your maintenance request for [Property Name] has been approved.

  Request Details:
  - Issue: [Title]
  - Category: [Category]
  - Priority: [Priority]

  Next Steps:
  - Our maintenance team will contact you to schedule the work
  - You can track progress in your customer portal

  View Details: [Link to request/job]"

Rejection Email:
Subject: Update on Your Maintenance Request #MR-2025-00001
Body:
  "Thank you for submitting your maintenance request for [Property Name].

  After review, we're unable to proceed with this request at this time.

  Reason: [Rejection Reason]

  If you have questions or would like to discuss this further, please contact us.

  Contact: [Support Email/Phone]"
```

### Testing Checklist
- [ ] Pending requests appear in landlord portal
- [ ] Badge shows correct count of pending requests
- [ ] Request details page shows all information
- [ ] Photos display correctly in details view
- [ ] Approve button creates maintenance job
- [ ] Approved job has correct data from request
- [ ] Job priority matches request urgency
- [ ] Photos are copied to maintenance job
- [ ] Reject button updates status and notifies customer
- [ ] Customer sees updated status in their portal
- [ ] Approved job appears in maintenance job list
- [ ] Job can be assigned and completed normally
- [ ] Activity logs are created for approve/reject actions
- [ ] Email notifications sent successfully
- [ ] Request-to-job link is maintained in database

---

## STORY-006: My Requests Page in Customer Portal

### User Story
**As a** property owner (customer)
**I want to** view all my maintenance requests and their status
**So that** I can track progress and stay informed

### Acceptance Criteria
- [ ] "My Requests" navigation item in customer portal sidebar
- [ ] Page shows all maintenance requests (newest first)
- [ ] Each request card displays:
  - Request number and date
  - Property name
  - Issue title and category
  - Current status badge
  - Urgency indicator
- [ ] Status badges color-coded:
  - Pending: Yellow/orange
  - Approved: Green
  - Rejected: Red
  - In Progress: Blue (if linked job is active)
  - Completed: Grey (if linked job is completed)
- [ ] Click request card to view full details
- [ ] Details page shows:
  - All request information
  - Submitted photos
  - Status history/timeline
  - Linked maintenance job (if approved)
  - Rejection reason (if rejected)
- [ ] Filter options: All, Pending, Approved, Rejected
- [ ] Search by property or issue title

### Technical Implementation

**Files to Create:**
```
apps/web-customer/src/pages/MaintenanceRequests.tsx - List view
apps/web-customer/src/pages/MaintenanceRequestDetails.tsx - Detail view
```

**Files to Modify:**
```
apps/web-customer/src/components/layout/AppLayout.tsx - Add nav item
apps/web-customer/src/App.tsx - Add routes
```

**Routes:**
```typescript
<Route path="/maintenance-requests" element={<ProtectedRoute><AppLayout><MaintenanceRequests /></AppLayout></ProtectedRoute>} />
<Route path="/maintenance-requests/:id" element={<ProtectedRoute><AppLayout><MaintenanceRequestDetails /></AppLayout></ProtectedRoute>} />
```

**Component Structure:**
```typescript
// MaintenanceRequests.tsx
const MaintenanceRequests = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter buttons: All | Pending | Approved | Rejected
  // Search bar for property/issue
  // Request cards grid
  // Click card to navigate to details
}

// MaintenanceRequestDetails.tsx
const MaintenanceRequestDetails = () => {
  const { id } = useParams()
  const [request, setRequest] = useState<MaintenanceRequest | null>(null)

  // Display full request details
  // Status timeline
  // Photos gallery
  // Link to maintenance job if approved
  // Rejection reason if rejected
}
```

**Status Badge Component:**
```typescript
const getStatusInfo = (request: MaintenanceRequest) => {
  if (request.status === 'REJECTED') {
    return { color: 'error', label: 'Rejected' }
  }

  if (request.status === 'PENDING_APPROVAL') {
    return { color: 'warning', label: 'Pending Review' }
  }

  if (request.status === 'APPROVED' && request.maintenance_job) {
    const jobStatus = request.maintenance_job.status

    if (jobStatus === 'COMPLETED') {
      return { color: 'success', label: 'Completed' }
    }
    if (jobStatus === 'IN_PROGRESS') {
      return { color: 'info', label: 'In Progress' }
    }
    return { color: 'success', label: 'Approved' }
  }

  return { color: 'default', label: 'Unknown' }
}
```

### Testing Checklist
- [ ] "My Requests" nav item appears in sidebar
- [ ] Page loads all customer's requests
- [ ] Requests sorted by newest first
- [ ] Status badges display correct colors
- [ ] Filter buttons work correctly
- [ ] Search filters by property name and title
- [ ] Click card navigates to details page
- [ ] Details page shows all request information
- [ ] Photos display in gallery format
- [ ] Status timeline shows submission and approval/rejection
- [ ] Link to maintenance job works (if approved)
- [ ] Rejection reason displays (if rejected)
- [ ] Back button returns to list
- [ ] Empty state shows if no requests
- [ ] Loading states display correctly
- [ ] Mobile responsive design works

---

## Feature 3: Cleaning Portal Bug Fixes

### Current State Analysis

Based on user testing, the cleaning portal has several critical routing and functionality bugs:

| Issue | Status | URL | Impact |
|-------|--------|-----|--------|
| **Schedule Cleaning Job** | 🔴 Broken | `/cleaning/jobs` | Back button from schedule form goes to blank page |
| **Dashboard Data** | ⚠️ Static | `/cleaning/dashboard` | Not showing live actual data |
| **New Cleaning Job** | 🔴 Broken | `/cleaning/jobs/new` | Schedule new job button opens blank page |
| **Edit Cleaning Job** | 🔴 Broken | `/cleaning/jobs/{id}/edit` | Edit button opens blank page |
| **Property Management** | 🔴 Broken | `/cleaning/properties` | Edit and Add Property buttons crash |
| **Recent Cleaning Jobs** | 🔴 Broken | Various links | Recent job links open blank pages |

### Business Context

The cleaning portal is currently unusable for core workflows. Cleaning companies cannot:
- Schedule new cleaning jobs
- Edit existing jobs
- Add or edit properties
- Navigate between job-related pages
- See real-time dashboard data

These are blocking issues that prevent the cleaning portal from being operational.

---

## STORY-012: Fix Cleaning Portal Critical Routing & Functionality Bugs

### User Story
**As a** cleaning company administrator
**I want** all navigation and core functionality to work correctly
**So that** I can manage cleaning jobs and properties without encountering blank pages or crashes

### Acceptance Criteria

**Routing Fixes:**
- [ ] Back button from "Schedule Cleaning Job" navigates to correct page (dashboard, not blank `/cleaning/jobs`)
- [ ] "Schedule New Job" button from cleaning jobs page opens functional form at `/cleaning/jobs/new`
- [ ] "Edit" button from cleaning jobs list opens functional edit form at `/cleaning/jobs/{id}/edit`
- [ ] Recent cleaning job links navigate to correct job detail pages
- [ ] All property-related links work correctly

**Property Management:**
- [ ] "Add Property" button opens functional form (not crash)
- [ ] "Edit" button on property cards opens functional edit form (not crash)
- [ ] Property form submissions work correctly
- [ ] Properties are clickable and navigate to detail page

**Dashboard Data:**
- [ ] Dashboard displays real-time data from database
- [ ] Job counts are accurate (scheduled, in progress, completed)
- [ ] Today's schedule shows actual jobs for current date
- [ ] Revenue figures pull from actual completed jobs
- [ ] Quick action buttons all functional

**Navigation Consistency:**
- [ ] All sidebar navigation items lead to valid pages
- [ ] Breadcrumbs work correctly on all pages
- [ ] Back buttons always return to logical previous page
- [ ] No 404 or blank page errors anywhere in cleaning portal

### Technical Implementation

**Files to Check/Fix:**

```
apps/web-cleaning/src/App.tsx - Verify all routes defined
apps/web-cleaning/src/pages/dashboards/CleaningDashboard.tsx - Fix navigation links
apps/web-cleaning/src/pages/CleaningJobs.tsx - Fix new job button
apps/web-cleaning/src/pages/CleaningJobDetails.tsx - May need creation
apps/web-cleaning/src/pages/CreateCleaningJob.tsx - Fix routing
apps/web-cleaning/src/pages/EditCleaningJob.tsx - May need creation or fix
apps/web-cleaning/src/pages/Properties.tsx - Fix add/edit buttons
```

**Route Audit:**
```typescript
// apps/web-cleaning/src/App.tsx
// Ensure these routes exist:

<Route path="/dashboard" element={<CleaningDashboard />} />
<Route path="/jobs" element={<CleaningJobs />} />
<Route path="/jobs/new" element={<CreateCleaningJob />} />
<Route path="/jobs/:id" element={<CleaningJobDetails />} />
<Route path="/jobs/:id/edit" element={<EditCleaningJob />} />
<Route path="/properties" element={<Properties />} />
<Route path="/properties/new" element={<AddProperty />} />
<Route path="/properties/:id" element={<PropertyDetails />} />
<Route path="/properties/:id/edit" element={<EditProperty />} />
```

**Dashboard Data Fix:**
```typescript
// apps/web-cleaning/src/pages/dashboards/CleaningDashboard.tsx

// Replace static/mock data with API calls
const fetchDashboardData = async () => {
  const response = await fetch(`/api/cleaning/dashboard?tenant_id=${tenantId}`)
  const data = await response.json()

  setStats({
    totalJobsToday: data.stats.totalJobsToday,
    scheduled: data.stats.scheduled,
    inProgress: data.stats.inProgress,
    completed: data.stats.completed
  })

  setTodaysJobs(data.todaysSchedule)
  setWeeklyStats({
    jobsScheduled: data.weeklyStats.jobsScheduled,
    revenue: data.weeklyStats.revenue
  })
}
```

**Navigation Fix Examples:**
```typescript
// Fix back button from schedule cleaning form
// WRONG:
navigate('/cleaning/jobs') // Blank page

// RIGHT:
navigate('/dashboard') // Or wherever it should go
// OR
navigate(-1) // Browser back

// Fix "Schedule New Job" button
// WRONG:
<Button onClick={() => navigate('/cleaning/jobs/new')}>Schedule New Job</Button>
// If route doesn't exist, this is the issue

// RIGHT:
// First ensure route exists in App.tsx:
<Route path="/jobs/new" element={<CreateCleaningJob />} />
// Then button works

// Fix Edit button
// WRONG:
<Button onClick={() => navigate(`/cleaning/jobs/${id}/edit`)}>Edit</Button>
// If EditCleaningJob component doesn't exist

// RIGHT:
// Create component or reuse CreateCleaningJob in edit mode
<Route path="/jobs/:id/edit" element={<CreateCleaningJob editMode={true} />} />
```

**Property Button Crash Fix:**
```typescript
// apps/web-cleaning/src/pages/Properties.tsx

// Likely issue: onClick handlers not defined or causing errors
const handleAddProperty = () => {
  try {
    navigate('/properties/new')
  } catch (error) {
    console.error('Navigation error:', error)
    toast.error('Unable to open add property form')
  }
}

const handleEditProperty = (propertyId: string) => {
  try {
    navigate(`/properties/${propertyId}/edit`)
  } catch (error) {
    console.error('Navigation error:', error)
    toast.error('Unable to open edit property form')
  }
}

// Ensure buttons have handlers:
<Button onClick={handleAddProperty}>Add Property</Button>
<Button onClick={() => handleEditProperty(property.id)}>Edit</Button>
```

**API Endpoints Needed:**
```typescript
// Dashboard data
GET /api/cleaning/dashboard?tenant_id={id}
Response: {
  stats: {
    totalJobsToday: number,
    scheduled: number,
    inProgress: number,
    completed: number
  },
  todaysSchedule: CleaningJob[],
  weeklyStats: {
    jobsScheduled: number,
    revenue: number
  }
}

// Cleaning jobs
GET /api/cleaning/jobs?tenant_id={id}
POST /api/cleaning/jobs
GET /api/cleaning/jobs/{id}
PUT /api/cleaning/jobs/{id}
DELETE /api/cleaning/jobs/{id}
```

### Testing Checklist

**Routing Tests:**
- [ ] Navigate to cleaning dashboard - loads correctly
- [ ] Click "Schedule Cleaning" - opens form
- [ ] Submit form - redirects correctly (not to blank page)
- [ ] Click "Back" from schedule form - returns to dashboard
- [ ] Navigate to "Cleaning Jobs" page - loads job list
- [ ] Click "Schedule New Job" - opens form (not blank page)
- [ ] Click "Edit" on existing job - opens edit form (not blank page)
- [ ] Click recent job link from dashboard - opens job detail page
- [ ] All property navigation works without crashes

**Dashboard Data Tests:**
- [ ] Dashboard shows correct job counts from database
- [ ] Today's schedule displays actual jobs for today
- [ ] Completed count matches database
- [ ] Revenue figures are accurate
- [ ] Data refreshes when jobs are added/completed
- [ ] No hardcoded or mock data displayed

**Property Management Tests:**
- [ ] "Add Property" button opens form
- [ ] Property form can be filled out
- [ ] Property form submits successfully
- [ ] New property appears in list
- [ ] "Edit" button on property card opens edit form
- [ ] Edit form pre-populates with property data
- [ ] Edit form saves changes correctly
- [ ] Property cards are clickable to view details

**Error Handling Tests:**
- [ ] No console errors on any page
- [ ] No 404 errors
- [ ] No blank pages
- [ ] Failed API calls show user-friendly messages
- [ ] Form validation errors display correctly

### Dependencies
- All cleaning portal routes must be defined in App.tsx
- CleaningJobDetails component (may need creation)
- EditCleaningJob component (may need creation)
- AddProperty/EditProperty forms (may need fix)
- Cleaning dashboard API endpoint with real data
- Navigation guards/error boundaries

### Priority
**CRITICAL** - Portal is currently non-functional for core workflows

---

## Feature 4: Maintenance Portal Enhancements

### Current State Analysis

Based on user feedback and screenshots, the maintenance portal is missing several critical features:

| Feature | Status | Issue |
|---------|--------|-------|
| **Quotes Page** | ❌ Missing | Dashboard has "Manage Quotes" button but no quotes page exists |
| **Invoices Page** | ❌ Missing | No way to view/manage invoices in maintenance portal |
| **Contractor Details** | ⚠️ Limited | Contractor cards exist but aren't clickable |
| **Internal Contractors** | ⚠️ Limited | Can only add external contractors, not internal staff |
| **Certificate Management** | ⚠️ Limited | Certificates only related to properties, need multi-entity support |

### Business Context

The maintenance portal is the primary workspace for maintenance coordinators and contractors. They need:
- **Quote Management**: View, track, and manage quotes for maintenance jobs
- **Invoice Management**: Track invoices, payments, and financial records
- **Contractor Details**: Deep dive into contractor info, jobs, performance
- **Internal Staff**: Add and manage internal maintenance staff as contractors
- **Flexible Certificates**: Associate certificates with various entity types (workers, contractors, companies, etc.)

---

## STORY-007: Quotes Page in Maintenance Portal

### User Story
**As a** maintenance coordinator
**I want to** view and manage all quotes in a dedicated quotes page
**So that** I can track quote status, approvals, and follow up on pending quotes

### Acceptance Criteria
- [ ] "Quotes" navigation item in maintenance portal sidebar
- [ ] Quotes page displays all quotes for maintenance jobs
- [ ] Filter options:
  - All Quotes
  - Draft
  - Sent (pending customer approval)
  - Approved
  - Declined
- [ ] Each quote card shows:
  - Quote number and date
  - Customer name and property
  - Job title and category
  - Total amount
  - Status badge
  - Days until expiry (if sent)
- [ ] Click quote card to view full details
- [ ] Search functionality (by quote number, customer, property)
- [ ] Sort options (newest first, oldest first, amount high-low, amount low-high)
- [ ] "Create Quote" button (if not tied to existing job)
- [ ] Export quotes to CSV/Excel

### Technical Implementation

**Files to Create:**
```
apps/web-maintenance/src/pages/Quotes.tsx - List view
apps/web-maintenance/src/pages/QuoteDetails.tsx - Detail view
```

**Files to Modify:**
```
apps/web-maintenance/src/components/layout/AppLayout.tsx - Add nav item
apps/web-maintenance/src/App.tsx - Add routes
apps/web-maintenance/src/pages/dashboards/MaintenanceDashboard.tsx - Fix "Manage Quotes" button link
```

**API Endpoints:**
```typescript
// Get all quotes for maintenance tenant
GET /api/maintenance/quotes?status={status}&sort={sort}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "quotes": Quote[],
    "statistics": {
      "total": number,
      "draft": number,
      "sent": number,
      "approved": number,
      "declined": number,
      "totalValue": number,
      "approvalRate": number
    }
  }
}

// Get single quote details
GET /api/maintenance/quotes/{id}
```

**Component Structure:**
```typescript
// Quotes.tsx
const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [allQuotes, setAllQuotes] = useState<Quote[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')

  // Statistics cards at top (total quotes, pending approval, approved this month, total value)
  // Filter buttons
  // Search bar
  // Sort dropdown
  // Quotes grid/list
  // Click to navigate to details
}

// QuoteDetails.tsx - Similar to customer portal quote details
```

### Testing Checklist
- [ ] Navigation item appears in sidebar
- [ ] Page loads all quotes for maintenance tenant
- [ ] Filters work correctly for each status
- [ ] Search finds quotes by number, customer, property
- [ ] Sort options reorder quotes correctly
- [ ] Click card navigates to details page
- [ ] Details page shows complete quote information
- [ ] "Manage Quotes" button on dashboard links to this page
- [ ] Statistics cards show accurate counts
- [ ] Export functionality works
- [ ] Mobile responsive design

### Dependencies
- Quote API endpoints
- Shared Quote components (if standardized)
- Dashboard update for button link

---

## STORY-008: Invoices Page in Maintenance Portal

### User Story
**As a** maintenance coordinator
**I want to** view and manage all invoices in a dedicated invoices page
**So that** I can track payments, outstanding invoices, and financial records

### Acceptance Criteria
- [ ] "Invoices" navigation item in maintenance portal sidebar
- [ ] Invoices page displays all invoices for completed jobs
- [ ] Filter options:
  - All Invoices
  - Paid
  - Pending Payment
  - Overdue
- [ ] Each invoice row/card shows:
  - Invoice number and date
  - Customer name and property
  - Service/job description
  - Amount
  - Status badge
  - Days overdue (if applicable)
- [ ] Click invoice to view full details
- [ ] Search functionality (by invoice number, customer, property)
- [ ] Date range filter
- [ ] Export invoices to CSV/Excel
- [ ] Summary statistics cards:
  - Total invoiced this month
  - Outstanding amount
  - Paid this month
  - Overdue amount

### Technical Implementation

**Files to Create:**
```
apps/web-maintenance/src/pages/Invoices.tsx - List view
apps/web-maintenance/src/pages/InvoiceDetails.tsx - Detail view
```

**Files to Modify:**
```
apps/web-maintenance/src/components/layout/AppLayout.tsx - Add nav item
apps/web-maintenance/src/App.tsx - Add routes
```

**API Endpoints:**
```typescript
// Get all invoices for maintenance tenant
GET /api/maintenance/invoices?status={status}&date_from={date}&date_to={date}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "invoices": Invoice[],
    "statistics": {
      "total_invoiced_month": number,
      "outstanding_amount": number,
      "paid_month": number,
      "overdue_amount": number,
      "overdue_count": number
    }
  }
}

// Get single invoice details
GET /api/maintenance/invoices/{id}
```

**Component Structure:**
```typescript
// Invoices.tsx
const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [stats, setStats] = useState<InvoiceStats | null>(null)

  // Statistics cards at top
  // Filter buttons (All, Paid, Pending, Overdue)
  // Date range picker
  // Search bar
  // Export button
  // Invoices table/grid
  // Click row to navigate to details
}

// InvoiceDetails.tsx - Similar to customer portal invoice details
```

### Testing Checklist
- [ ] Navigation item appears in sidebar
- [ ] Page loads all invoices for maintenance tenant
- [ ] Status filters work correctly
- [ ] Date range filter limits results appropriately
- [ ] Search finds invoices correctly
- [ ] Click invoice navigates to details page
- [ ] Details page shows complete invoice information
- [ ] Statistics cards show accurate financial data
- [ ] Export functionality works
- [ ] Overdue invoices highlighted appropriately
- [ ] Mobile responsive design

### Dependencies
- Invoice API endpoints
- Shared Invoice components (if standardized)
- Date picker component

---

## STORY-009: Contractor Details Page - Clickable Contractor Cards

### User Story
**As a** maintenance coordinator
**I want to** click on contractor cards to view detailed contractor information
**So that** I can see their full profile, job history, performance, and contact details

### Acceptance Criteria
- [ ] Contractor cards on Contractors page are clickable
- [ ] Hover effect indicates cards are interactive
- [ ] Clicking card navigates to contractor details page
- [ ] Details page shows:
  - Contractor name and company
  - Contact information (email, phone)
  - Contractor type (Internal/External)
  - Preferred/featured badge (if applicable)
  - Services/skills offered
  - Referral fee percentage (if external)
  - Active/inactive status
- [ ] Job history section:
  - List of all jobs assigned to contractor
  - Job status, date, property
  - Customer ratings (if available)
- [ ] Performance metrics:
  - Total jobs completed
  - Average completion time
  - Customer satisfaction rating
  - On-time completion rate
- [ ] Certificates section:
  - List of contractor's valid certificates
  - Expiry dates with warnings for soon-to-expire
- [ ] Action buttons:
  - Edit contractor information
  - Assign to new job
  - Mark as preferred/featured
  - Deactivate/activate contractor
  - View certificates

### Technical Implementation

**Files to Create:**
```
apps/web-maintenance/src/pages/ContractorDetails.tsx - NEW
```

**Files to Modify:**
```
apps/web-maintenance/src/pages/Contractors.tsx - Make cards clickable
apps/web-maintenance/src/App.tsx - Add route
```

**API Endpoint:**
```typescript
// Get contractor details with job history and performance
GET /api/maintenance/contractors/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "contractor": {
      "id": string,
      "company_name": string,
      "contact_name": string,
      "email": string,
      "phone": string,
      "is_internal": boolean,
      "is_preferred": boolean,
      "referral_fee_percentage": number,
      "services": string[],
      "active": boolean,
      "created_at": string
    },
    "job_history": MaintenanceJob[],
    "performance": {
      "total_jobs": number,
      "completed_jobs": number,
      "avg_completion_days": number,
      "avg_rating": number,
      "on_time_rate": number
    },
    "certificates": Certificate[]
  }
}
```

**Component Structure:**
```typescript
// ContractorDetails.tsx
const ContractorDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [jobHistory, setJobHistory] = useState<MaintenanceJob[]>([])
  const [performance, setPerformance] = useState<Performance | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  // Header with contractor info and action buttons
  // Performance metrics cards
  // Job history table
  // Certificates section with expiry warnings
}

// Contractors.tsx - Add click handler
<Card
  onClick={() => navigate(`/contractors/${contractor.id}`)}
  style={{ cursor: 'pointer' }}
>
  {/* Existing card content */}
</Card>
```

### Testing Checklist
- [ ] Contractor cards show hover effect
- [ ] Clicking card navigates to details page
- [ ] Details page loads correct contractor data
- [ ] All contractor information displays correctly
- [ ] Job history shows all assigned jobs
- [ ] Performance metrics calculate correctly
- [ ] Certificates display with expiry warnings
- [ ] Edit button opens edit form
- [ ] Assign to job button works
- [ ] Toggle preferred status works
- [ ] Activate/deactivate functionality works
- [ ] Back button returns to contractors list
- [ ] Mobile responsive design

### Dependencies
- Contractor details API endpoint
- Job history data
- Performance calculation logic
- Certificate associations

---

## STORY-010: Add Internal Contractors

### User Story
**As a** maintenance coordinator
**I want to** add internal maintenance staff as contractors
**So that** I can assign jobs to in-house employees as well as external contractors

### Acceptance Criteria
- [ ] "Add Internal Contractor" option on Contractors page
- [ ] Separate button or tab to distinguish internal vs external
- [ ] Form includes:
  - Employee/contractor name
  - Email address
  - Phone number
  - Employment type selector: **Internal** vs External
  - Services/skills (multi-select)
  - Hourly rate (for internal costing)
  - Start date
  - Employee ID (optional, for internal only)
  - Certifications (optional, can add later)
- [ ] Internal contractors don't have referral fee field
- [ ] Internal contractors marked clearly in contractors list
- [ ] Internal contractors available for job assignment
- [ ] Can filter contractors by Internal/External/All

### Technical Implementation

**Files to Modify:**
```
apps/web-maintenance/src/pages/Contractors.tsx - Add "Add Internal Contractor" button and filter
apps/web-maintenance/src/components/forms/AddContractorForm.tsx - Add employment type field
```

**API Endpoint:**
```typescript
// Create internal contractor
POST /api/maintenance/contractors
Authorization: Bearer {token}

Request Body:
{
  "company_name": string,         // For internal, can be "In-House" or employee name
  "contact_name": string,
  "email": string,
  "phone": string,
  "is_internal": true,            // KEY FIELD
  "services": string[],
  "hourly_rate": number,          // For internal costing
  "employee_id": string,          // Optional
  "start_date": string
}

// Note: referral_fee_percentage not applicable for internal contractors

// Filter contractors
GET /api/maintenance/contractors?type={INTERNAL|EXTERNAL|ALL}
```

**Form Logic:**
```typescript
const AddContractorForm = () => {
  const [employmentType, setEmploymentType] = useState<'INTERNAL' | 'EXTERNAL'>('EXTERNAL')

  // When employmentType is INTERNAL:
  // - Hide referral_fee_percentage field
  // - Show employee_id field
  // - Show hourly_rate field
  // - Adjust labels (e.g., "Company Name" → "Employee Name")

  // When employmentType is EXTERNAL:
  // - Show referral_fee_percentage field
  // - Hide employee_id field
  // - Hide hourly_rate (or make optional)
}
```

**Database:**
```sql
-- Add column to contractors table if not exists
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_contractors_is_internal ON contractors(is_internal);
```

### UI/UX Design Notes

**Contractors Page:**
- Two buttons at top:
  - "+ Add External Contractor" (primary button)
  - "+ Add Internal Contractor" (secondary button)
- Filter tabs/buttons:
  - All Contractors (count)
  - Internal (count)
  - External (count)
- Internal contractors have badge: "Internal" or "In-House"
- External contractors can have badge: "External" or "Preferred"

**Form Design:**
- Radio buttons or toggle at top: ○ External ● Internal
- Form fields adjust based on selection
- Clear visual indication of which fields are required
- Validation: internal contractors don't need referral fee

### Testing Checklist
- [ ] "Add Internal Contractor" button visible
- [ ] Form opens with correct fields for internal type
- [ ] Employment type toggle works
- [ ] Form fields show/hide based on employment type
- [ ] Validation works correctly for each type
- [ ] Internal contractor created successfully
- [ ] Internal contractor appears in list with badge
- [ ] Filter shows only internal contractors when selected
- [ ] Internal contractors available for job assignment
- [ ] Job assignment doesn't apply referral fee for internal
- [ ] Edit form respects employment type
- [ ] Can't change external to internal (or requires confirmation)

### Dependencies
- Database schema update
- Contractor API endpoints update
- Job assignment logic (cost calculation)
- Invoice generation (exclude referral fee for internal)

---

## STORY-011: Enhanced Certificate Management - Multi-Entity Associations

### User Story
**As a** system administrator/coordinator
**I want to** associate certificates with various entity types (properties, workers, contractors, companies, customers, landlords)
**So that** I can track all compliance and certification requirements across the entire platform

### Acceptance Criteria
- [ ] Certificate creation form has "Related To" selector with options:
  - Property
  - Worker
  - Contractor
  - Maintenance Company
  - Cleaning Company
  - Customer
  - Landlord
- [ ] After selecting entity type, dropdown shows entities of that type
- [ ] One certificate can be related to one entity
- [ ] Certificate displays show entity type and name
- [ ] Certificates page has filter by entity type
- [ ] Each entity's detail page shows their certificates:
  - Property details → shows property certificates
  - Worker details → shows worker certificates
  - Contractor details → shows contractor certificates
  - Company settings → shows company certificates
  - Customer portal → shows customer certificates
  - Landlord portal → shows landlord certificates
- [ ] Expiry warnings work across all entity types
- [ ] Notifications sent to relevant parties when certificates expire
- [ ] Bulk upload certificates with entity associations

### Technical Implementation

**Database Schema:**
```sql
-- Modify certificates table to support multiple entity types
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_property_fk;

-- Add polymorphic association columns
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS entity_id UUID;

-- Update existing records (properties)
UPDATE certificates SET entity_type = 'PROPERTY', entity_id = property_id WHERE property_id IS NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_certificates_entity ON certificates(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry_entity ON certificates(expiry_date, entity_type);

-- Keep property_id for backward compatibility, mark as deprecated
-- New code should use entity_type + entity_id

-- Enum for entity types
CREATE TYPE certificate_entity_type AS ENUM (
  'PROPERTY',
  'WORKER',
  'CONTRACTOR',
  'MAINTENANCE_COMPANY',
  'CLEANING_COMPANY',
  'CUSTOMER',
  'LANDLORD'
);
```

**API Endpoints:**
```typescript
// Create certificate with entity association
POST /api/certificates
Authorization: Bearer {token}

Request Body:
{
  "certificate_type": string,
  "certificate_number": string,
  "issue_date": string,
  "expiry_date": string,
  "issuing_authority": string,
  "entity_type": "PROPERTY" | "WORKER" | "CONTRACTOR" | "MAINTENANCE_COMPANY" | "CLEANING_COMPANY" | "CUSTOMER" | "LANDLORD",
  "entity_id": string,
  "document_url": string
}

// Get certificates for specific entity
GET /api/certificates?entity_type={type}&entity_id={id}

// Get all certificates with filtering
GET /api/certificates?entity_type={type}&expiring_soon={boolean}
```

**Component Structure:**
```typescript
// AddCertificateForm.tsx
const AddCertificateForm = () => {
  const [entityType, setEntityType] = useState<CertificateEntityType>('PROPERTY')
  const [entities, setEntities] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState('')

  // When entityType changes, fetch entities of that type
  useEffect(() => {
    const fetchEntities = async () => {
      switch (entityType) {
        case 'PROPERTY':
          const props = await fetchProperties()
          setEntities(props)
          break
        case 'WORKER':
          const workers = await fetchWorkers()
          setEntities(workers)
          break
        case 'CONTRACTOR':
          const contractors = await fetchContractors()
          setEntities(contractors)
          break
        // ... other cases
      }
    }
    fetchEntities()
  }, [entityType])

  // Form fields
}

// CertificatesList.tsx - Enhanced with entity type display
const CertificatesList = () => {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('ALL')

  // Show entity type badge and name on each certificate card
}
```

**Entity Detail Pages - Certificate Sections:**
```typescript
// PropertyDetails.tsx
<CertificatesSection entityType="PROPERTY" entityId={propertyId} />

// ContractorDetails.tsx
<CertificatesSection entityType="CONTRACTOR" entityId={contractorId} />

// WorkerDetails.tsx (if exists)
<CertificatesSection entityType="WORKER" entityId={workerId} />

// CompanySettings.tsx
<CertificatesSection entityType="MAINTENANCE_COMPANY" entityId={companyId} />

// Shared component
const CertificatesSection = ({ entityType, entityId }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    fetchCertificates(entityType, entityId).then(setCertificates)
  }, [entityType, entityId])

  // Display certificates with expiry warnings
  // "Add Certificate" button
}
```

**Notification Logic:**
```typescript
// Certificate expiry notifications
const sendExpiryNotifications = async () => {
  const expiringCertificates = await db.certificates.findMany({
    where: {
      expiry_date: {
        gte: new Date(),
        lte: addDays(new Date(), 30) // 30 days warning
      }
    },
    include: { entity: true }
  })

  for (const cert of expiringCertificates) {
    // Determine who to notify based on entity_type
    switch (cert.entity_type) {
      case 'PROPERTY':
        // Notify property owner/landlord
        await notifyPropertyOwner(cert)
        break
      case 'CONTRACTOR':
        // Notify contractor and maintenance coordinator
        await notifyContractor(cert)
        await notifyCoordinator(cert)
        break
      case 'WORKER':
        // Notify worker and HR/admin
        await notifyWorker(cert)
        await notifyHR(cert)
        break
      // ... other cases
    }
  }
}
```

### Testing Checklist
- [ ] Certificate form shows entity type selector
- [ ] Entity dropdown populates correctly for each type
- [ ] Certificate created with correct entity association
- [ ] Certificate appears on entity's detail page
- [ ] Filter by entity type works on certificates page
- [ ] Expiry warnings show for all entity types
- [ ] Notifications sent to correct parties
- [ ] Property detail page shows property certificates
- [ ] Contractor detail page shows contractor certificates
- [ ] Worker detail page shows worker certificates
- [ ] Company settings show company certificates
- [ ] Customer portal shows customer certificates
- [ ] Landlord portal shows landlord certificates
- [ ] Migration of existing property certificates successful
- [ ] Bulk upload works with entity associations
- [ ] Can edit entity association on existing certificates
- [ ] Search/filter certificates by entity name

### Dependencies
- Database migration (critical - test thoroughly)
- All entity detail pages need certificate sections
- Notification system needs entity-aware logic
- Certificate API endpoints need updates
- Backward compatibility with existing property certificates

---

## Implementation Order

### Phase 0: Cleaning Portal Bug Fixes (Priority: CRITICAL)
**Estimated Time: 2-3 days**

**Why CRITICAL**: The cleaning portal is currently non-functional. Core workflows are broken:
- Cannot schedule new cleaning jobs
- Cannot edit existing jobs
- Cannot manage properties
- Dashboard shows no real data
- All major navigation is broken

**Day 1: Routing & Navigation Fixes**
- Audit all routes in [apps/web-cleaning/src/App.tsx](apps/web-cleaning/src/App.tsx)
- Create missing route components:
  - [CleaningJobDetails.tsx](apps/web-cleaning/src/pages/CleaningJobDetails.tsx) (if missing)
  - [EditCleaningJob.tsx](apps/web-cleaning/src/pages/EditCleaningJob.tsx) (if missing)
- Fix navigation in [CleaningDashboard.tsx](apps/web-cleaning/src/pages/dashboards/CleaningDashboard.tsx)
  - Back button from schedule form
  - Recent job links
- Fix "Schedule New Job" button in CleaningJobs page
- Fix "Edit" buttons to navigate to correct routes

**Day 2: Property Management & Dashboard Data**
- Fix Add/Edit Property buttons in [Properties.tsx](apps/web-cleaning/src/pages/Properties.tsx)
- Add proper error handling to property actions
- Replace static dashboard data with API calls
- Implement `/api/cleaning/dashboard` endpoint (or verify it exists)
- Test all property operations end-to-end

**Day 3: Testing & Polish**
- End-to-end testing of all fixed workflows
- Verify no console errors
- Test all navigation paths
- Ensure data displays correctly
- Quick fixes for any remaining issues

**Success Criteria:**
- [ ] All pages load without blank screens
- [ ] Can schedule new cleaning job
- [ ] Can edit existing cleaning job
- [ ] Can add/edit properties
- [ ] Dashboard shows real data
- [ ] All navigation works correctly

---

### Phase 3: Maintenance Portal Enhancements (Priority: High)
**Estimated Time: 5-7 days**

1. **Day 1**: STORY-007 & STORY-008 - Quotes and Invoices Pages
   - Create Quotes page with filtering
   - Create Invoices page with filtering
   - Add navigation items
   - Fix dashboard "Manage Quotes" button
   - Test financial data display

2. **Day 2**: STORY-009 - Clickable Contractor Cards
   - Make contractor cards clickable
   - Create ContractorDetails page
   - Implement job history display
   - Add performance metrics

3. **Day 3**: STORY-010 - Add Internal Contractors
   - Update contractor form for internal type
   - Add filter for internal/external
   - Update API endpoints
   - Database migration

4. **Days 4-5**: STORY-011 - Enhanced Certificate Management
   - Database schema changes (CAREFUL - TEST THOROUGHLY)
   - Update certificate form for entity types
   - Add certificate sections to all entity pages
   - Update notification logic
   - Data migration for existing certificates

5. **Days 6-7**: Integration testing
   - End-to-end testing of all maintenance portal features
   - Cross-portal testing (certificates, contractors across portals)
   - Performance testing
   - User acceptance testing

### Phase 1: Property Creation (Priority: High)
**Estimated Time: 3-5 days**

1. **Day 1**: STORY-001 - Fix cleaning company portal
   - Investigate broken button
   - Fix or create form component
   - Test end-to-end

2. **Day 2**: STORY-002 - Implement customer portal
   - Create form component
   - Add API endpoint
   - Add route and navigation

3. **Day 3**: STORY-003 - Standardization
   - Extract shared components
   - Refactor all portals to use shared code
   - Regression testing

4. **Days 4-5**: Testing and polish
   - Cross-browser testing
   - Mobile responsiveness
   - User acceptance testing

### Phase 2: Customer Maintenance Requests (Priority: High)
**Estimated Time: 5-7 days**

1. **Days 1-2**: STORY-004 - Customer request form
   - Create form UI components
   - Implement photo upload
   - API endpoint creation
   - Database migration

2. **Days 3-4**: STORY-005 - Approval workflow
   - Landlord/maintenance portal UI
   - Approval/rejection logic
   - Notification system
   - Job creation automation

3. **Day 5**: STORY-006 - My Requests page
   - List view implementation
   - Details page
   - Status tracking

4. **Days 6-7**: Integration testing
   - End-to-end workflow testing
   - Notification delivery testing
   - Performance testing
   - User acceptance testing

---

## Technical Debt & Considerations

### Security
- [ ] Ensure customers can only create requests for their own properties
- [ ] Validate property ownership on API endpoints
- [ ] Sanitize file uploads (image validation, malware scanning)
- [ ] Rate limiting on request creation (prevent spam)
- [ ] Image storage security (private buckets, signed URLs)

### Performance
- [ ] Image compression on client-side before upload
- [ ] Lazy loading for photo galleries
- [ ] Pagination for request lists (if >50 requests)
- [ ] Database indexes on frequently queried fields
- [ ] Caching for property lists in forms

### Future Enhancements
- [ ] In-app messaging between customer and coordinator
- [ ] Request draft saving (auto-save)
- [ ] Recurring maintenance requests (e.g., annual inspections)
- [ ] Customer satisfaction ratings after job completion
- [ ] Service provider selection (customer chooses preferred contractor)
- [ ] Cost estimates before approval
- [ ] Payment integration for customer-paid maintenance
- [ ] Calendar integration for access scheduling
- [ ] SMS notifications in addition to email
- [ ] Push notifications (PWA)
- [ ] Contractor mobile app for job management
- [ ] Automated quote generation based on job type
- [ ] Invoice batch processing and bulk send
- [ ] Certificate auto-renewal reminders
- [ ] Performance-based contractor ranking algorithm
- [ ] Multi-currency support for international properties

### Maintenance Portal Specific Considerations

**Quotes Management:**
- [ ] Ensure quote numbers are unique across all tenants
- [ ] Quote PDF generation with company branding
- [ ] Quote versioning (if customer requests changes)
- [ ] Quote expiry automation (auto-mark as expired after valid_until_date)

**Invoices Management:**
- [ ] Invoice PDF generation matching company branding
- [ ] Automated payment reminders for overdue invoices
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Support for partial payments
- [ ] Tax calculation per region/country

**Contractor Management:**
- [ ] Background check status tracking for contractors
- [ ] Insurance certificate validation for external contractors
- [ ] Contractor availability calendar
- [ ] Job assignment algorithm (auto-assign based on availability, location, specialty)
- [ ] Contractor dispute resolution workflow

**Certificate Management:**
- [ ] Document storage integration (S3, Google Drive, etc.)
- [ ] OCR for automatic certificate detail extraction
- [ ] Certificate authenticity verification
- [ ] Bulk expiry notifications
- [ ] Certificate requirement templates by job type

---

## Testing Strategy

### Unit Tests
- Form validation logic
- Status badge color mapping
- Date formatting utilities
- Image compression functions

### Integration Tests
- API endpoint functionality
- Database transactions (request → job creation)
- Notification delivery
- File upload to storage service

### E2E Tests (Cypress/Playwright)

**Customer Maintenance Request Flow:**
1. Customer creates maintenance request
2. Landlord approves request
3. Maintenance job is created
4. Customer sees updated status
5. Job can be completed normally

**Property Creation Flow:**
1. Customer adds property in customer portal
2. Property appears in landlord portal
3. Guest tablet link works for property
4. Cleaning company can see property
5. Maintenance job can be created for property

**Quote to Invoice Flow:**
1. Maintenance coordinator creates quote
2. Quote sent to customer
3. Customer approves quote in customer portal
4. Job automatically created from approved quote
5. Job completed and invoice generated
6. Invoice appears in customer portal and maintenance portal
7. Customer marks invoice as paid
8. Payment status updates across portals

**Contractor Management Flow:**
1. Add internal contractor
2. Add certificate to contractor
3. Assign contractor to maintenance job
4. Complete job
5. Verify contractor appears in job history
6. Check performance metrics updated
7. Certificate expiry warning appears

**Certificate Multi-Entity Flow:**
1. Add certificate to property
2. Add certificate to contractor
3. Add certificate to company
4. Verify all appear on certificates page
5. Filter by entity type works
6. Expiry notifications sent correctly

### User Acceptance Testing
- [ ] Walkthrough with actual customers
- [ ] Gather feedback on form usability
- [ ] Verify notification clarity
- [ ] Test on multiple devices
- [ ] Accessibility testing (screen readers, keyboard navigation)

---

## Success Metrics

### Property Creation Feature
- **Adoption Rate**: % of customers/cleaning companies who add at least 1 property within 30 days
- **Completion Rate**: % of users who start form and successfully complete it
- **Time to Complete**: Average time to fill out and submit form
- **Error Rate**: % of submissions that fail validation or server errors

### Customer Maintenance Requests
- **Usage Rate**: # of requests created per month
- **Approval Rate**: % of requests approved vs rejected
- **Time to Approval**: Average time from submission to approval/rejection
- **Customer Satisfaction**: Survey rating after job completion
- **Support Ticket Reduction**: Decrease in phone/email requests for maintenance

### Maintenance Portal Enhancements
- **Quote Conversion Rate**: % of quotes that get approved by customers
- **Average Quote Response Time**: Time from quote sent to customer response
- **Invoice Collection Time**: Average days to payment after invoice sent
- **Overdue Invoice Rate**: % of invoices that become overdue
- **Contractor Utilization**: % of internal contractors actively assigned to jobs
- **Certificate Compliance**: % of entities with all required certificates valid
- **Expiry Prevention**: % of certificates renewed before expiration
- **Page Usage**: Views/interactions on quotes and invoices pages (measure adoption)

---

## Questions for Product Owner

1. **Property Creation**:
   - Should customers be limited to a maximum number of properties?
   - Do we need approval workflow for customer-added properties?
   - Should cleaning companies be able to add properties without customer association?

2. **Maintenance Requests**:
   - What's the expected SLA for request approval (24h, 48h, 72h)?
   - Should customers be able to cancel requests after submission?
   - Do we need emergency/after-hours request handling?
   - Should customers see cost estimates before approval?
   - Can customers attach documents (not just photos)?

3. **Notifications**:
   - Email only or SMS also?
   - Push notifications for PWA?
   - Notification preferences per customer?

4. **Access Control**:
   - Can property managers (if they exist) approve requests on behalf of landlords?
   - Multi-level approval for high-cost requests?

5. **Maintenance Portal - Quotes & Invoices**:
   - Should quotes be editable after being sent to customers?
   - Can maintenance coordinators create standalone quotes (not tied to a job)?
   - What payment methods should be tracked on invoices?
   - Should there be invoice approval workflow before sending to customers?
   - Do we need payment gateway integration?

6. **Contractors**:
   - Should internal contractors have different permissions/access than external?
   - Can contractors view their own performance metrics?
   - Should referral fees be adjustable per job or fixed per contractor?
   - Do we need contractor tiers (bronze/silver/gold with different fee structures)?
   - Can contractors be assigned to multiple specialties?

7. **Certificates**:
   - Who can add certificates for different entity types?
   - Should certificates require approval before being marked as valid?
   - How many days before expiry should warnings be sent? (Currently 30 days)
   - Can one certificate cover multiple entities (e.g., company-wide insurance)?
   - Should expired certificates prevent job assignments?

---

## Definition of Done

A story is considered complete when:
- [ ] Code is written and peer-reviewed
- [ ] Unit tests pass (>80% coverage for new code)
- [ ] Integration tests pass
- [ ] E2E test scenario created and passing
- [ ] Manual testing completed on dev environment
- [ ] User documentation updated (if needed)
- [ ] API documentation updated
- [ ] Database migrations run successfully
- [ ] Feature deployed to staging environment
- [ ] Product owner acceptance received
- [ ] Feature deployed to production
- [ ] Monitoring/alerts configured (if applicable)

---

## Summary

This document contains **12 user stories** across **4 major features**:

### Feature 1: Property Management (3 stories)
- STORY-001: Fix "Add Property" in Cleaning Company Portal
- STORY-002: Implement "Add Property" in Customer Portal
- STORY-003: Standardize Property Creation Across All Portals

### Feature 2: Customer-Initiated Maintenance (3 stories)
- STORY-004: Customer Maintenance Job Creation - UI & Form
- STORY-005: Maintenance Request Approval Workflow
- STORY-006: "My Requests" Page in Customer Portal

### Feature 3: Cleaning Portal Bug Fixes (1 story - CRITICAL)
- STORY-012: Fix Cleaning Portal Critical Routing & Functionality Bugs
  - 🔴 **Priority: CRITICAL** - Portal currently unusable
  - Fix 6 blocking issues preventing basic operations
  - Est. Time: 2-3 days

### Feature 4: Maintenance Portal Enhancements (5 stories)
- STORY-007: Quotes Page in Maintenance Portal
- STORY-008: Invoices Page in Maintenance Portal
- STORY-009: Contractor Details Page - Clickable Contractor Cards
- STORY-010: Add Internal Contractors
- STORY-011: Enhanced Certificate Management - Multi-Entity Associations

**Total Estimated Time**: 17-22 days (4 weeks sprint)
- **Phase 0 (Cleaning Bugs - CRITICAL)**: 2-3 days
- Phase 1 (Property): 3-5 days
- Phase 2 (Customer Requests): 5-7 days
- Phase 3 (Maintenance Portal): 5-7 days
- Buffer: 2 days for integration and polish

**Recommended Implementation Order**:
1. **Start with STORY-012** (Cleaning Portal Bugs) - CRITICAL priority
2. Then proceed with Property features (STORY-001, STORY-002, STORY-003)
3. Customer Maintenance features (STORY-004, STORY-005, STORY-006)
4. Maintenance Portal enhancements (STORY-007 through STORY-011)

---

**Document Status**: Ready for Review & Implementation
**Next Steps**:
1. Review stories with product owner
2. Prioritize features (current order or adjust based on business needs)
3. Assign stories to developers
4. Create tickets in project management system (Jira, Linear, etc.)
5. Set up sprint planning meetings
6. Begin implementation with Phase 1 or highest priority features
