# STORY PM-001: Property Management - Add & Edit Forms

**Epic:** Properties & Contracts Sprint
**Story Points:** 9 (PM-001: 5 pts, PM-002: 4 pts)
**Priority:** P0 - Critical
**Status:** Planning
**Sprint:** Properties & Contracts (Days 1-3)

---

## User Story

**As a** cleaning service provider
**I want to** add and edit customer properties with detailed information
**So that** I can properly manage property details, access instructions, and amenities for my cleaning teams

---

## Background

Currently, the Properties page ([Properties.tsx](../../apps/web-cleaning/src/pages/Properties.tsx)) only displays a READ-ONLY list of customer properties. The routes `/properties/new` and `/properties/:id/edit` exist but show "Coming Soon" placeholders.

The backend APIs are already fully implemented at [customer-properties.ts](../../apps/api/src/routes/customer-properties.ts) with all CRUD operations. This story focuses on building the frontend forms to create and edit properties.

---

## Acceptance Criteria

### PM-001: Add Property Form ✅

#### Navigation
- [ ] "Add Property" button added to Properties.tsx header
- [ ] Button navigates to `/properties/new` route
- [ ] Route renders AddProperty.tsx component
- [ ] Back button returns to `/properties` list

#### Form Structure
- [ ] Multi-section form layout with clear visual separation
- [ ] Three main sections: Basic Info, Access Details, Amenities
- [ ] Responsive layout (single column mobile, two columns desktop)
- [ ] Proper spacing and padding following design system

#### Section 1: Basic Property Information
**Required Fields:**
- [ ] Property Name (text input, required, max 100 chars)
- [ ] Address (text input, required, max 200 chars)
- [ ] Postcode (text input, required, UK postcode validation)
- [ ] Customer (dropdown select, required, loads from customers API)

**Optional Fields:**
- [ ] Property Type (dropdown: House, Flat, Apartment, Studio, Cottage, etc.)
- [ ] Bedrooms (number input, min 0, max 20)
- [ ] Bathrooms (number input, min 0, max 10)
- [ ] Square Footage (number input, optional)

#### Section 2: Access & Instructions
**Optional Fields:**
- [ ] Access Instructions (textarea, placeholder: "How to enter the property...")
- [ ] Key Location (text input, e.g., "Lockbox code: 1234")
- [ ] Emergency Contact Name (text input)
- [ ] Emergency Contact Phone (text input, phone validation)
- [ ] Special Requirements (textarea, e.g., "Remove shoes", "Allergies", etc.)

#### Section 3: Amenities & Features
**Checkboxes:**
- [ ] Has Parking (boolean)
- [ ] Has Pets (boolean)
- [ ] Has Alarm System (boolean)
- [ ] Has CCTV (boolean)

**Conditional Fields:**
- [ ] If "Has Pets" checked: Pet Details (textarea - breed, temperament, special handling)
- [ ] If "Has Alarm System" checked: Alarm Code (text input, optional)

**WiFi Details:**
- [ ] WiFi SSID (text input, optional)
- [ ] WiFi Password (text input, optional, password field with show/hide toggle)

#### Form Validation
- [ ] Real-time validation for required fields (on blur)
- [ ] UK postcode format validation (e.g., SW1A 1AA)
- [ ] Phone number validation (UK format)
- [ ] Clear error messages below invalid fields
- [ ] Form submission disabled until all required fields valid
- [ ] Character count indicators for text fields with limits

#### Form Actions
- [ ] "Save Property" button (primary)
  - Validates all fields
  - Shows loading spinner during save
  - POSTs to `/api/customer-properties` with service_provider_id
  - On success: Shows success toast and navigates to property details
  - On error: Shows error toast with specific error message

- [ ] "Save & Add Another" button (secondary)
  - Same validation and save logic
  - On success: Shows success toast and clears form for new entry
  - Useful for bulk property addition

- [ ] "Cancel" button (tertiary)
  - Prompts confirmation if form has unsaved changes
  - Navigates back to `/properties` list

#### Customer Dropdown
- [ ] Loads customers from `customersAPI.list(SERVICE_PROVIDER_ID)`
- [ ] Shows loading spinner while fetching
- [ ] Displays customer business_name
- [ ] Search/filter functionality for long customer lists
- [ ] Clear error message if customer load fails
- [ ] "Add Customer" link to create new customer (future enhancement)

#### UX & Error Handling
- [ ] Loading skeleton while page initializes
- [ ] Autofocus on Property Name field on mount
- [ ] Tab navigation follows logical field order
- [ ] Unsaved changes warning if user tries to navigate away
- [ ] Clear success message after save
- [ ] Specific error messages for validation failures
- [ ] Network error handling with retry option

---

### PM-002: Edit Property Form ✅

#### Navigation
- [ ] Properties list cards have "Edit" button
- [ ] Button navigates to `/properties/:id/edit`
- [ ] Route renders EditProperty.tsx component
- [ ] Back button returns to property details or list

#### Form Pre-population
- [ ] Fetches existing property data on mount using `customerPropertiesAPI.getById(id)`
- [ ] Shows loading spinner while fetching
- [ ] Pre-fills all form fields with existing values
- [ ] Checkboxes reflect boolean field states
- [ ] Conditional fields show/hide based on checkbox states
- [ ] Customer dropdown pre-selects current customer

#### Edit-Specific Features
- [ ] Form title shows "Edit Property: [Property Name]"
- [ ] "Last Updated" timestamp displayed (if available)
- [ ] Warning when changing customer:
  - Shows confirmation modal
  - Lists implications (contract changes, job assignments, etc.)
  - User must confirm to proceed
- [ ] Delete button (danger variant)
  - Shows confirmation modal: "Are you sure you want to delete [Property Name]?"
  - Lists dependencies (contracts, jobs, history)
  - Requires typing property name to confirm
  - On confirm: Calls `customerPropertiesAPI.delete(id)`
  - On success: Shows success toast and navigates to properties list

#### Form Reusability
- [ ] Reuses AddProperty form component (PropertyForm.tsx)
- [ ] Accepts `mode` prop: 'create' | 'edit'
- [ ] Accepts optional `propertyId` prop for edit mode
- [ ] Shared validation logic
- [ ] Different submit behavior based on mode:
  - Create: POST `/api/customer-properties`
  - Edit: PATCH `/api/customer-properties/:id`

#### Update Validation
- [ ] Same validation rules as Add form
- [ ] Additional check: Prevent removing required fields that have dependencies
- [ ] Warning if customer change affects active contracts or jobs

---

## Technical Implementation

### File Structure
```
apps/web-cleaning/src/
├── pages/
│   ├── AddProperty.tsx          # NEW - Create property page
│   ├── EditProperty.tsx         # NEW - Edit property page
│   └── Properties.tsx           # UPDATE - Add "Add Property" button
├── components/
│   └── forms/
│       └── PropertyForm.tsx     # NEW - Shared form component
└── lib/
    └── api.ts                   # VERIFY - customerPropertiesAPI exists
```

### Component Structure

#### PropertyForm.tsx (Shared Form Component)
```typescript
interface PropertyFormProps {
  mode: 'create' | 'edit'
  propertyId?: string
  initialData?: CustomerProperty
  onSuccess?: (property: CustomerProperty) => void
  onCancel?: () => void
}

interface PropertyFormData {
  // Basic Info
  property_name: string           // Required
  address: string                 // Required
  postcode: string               // Required
  customer_id: string            // Required
  property_type?: string
  bedrooms?: number
  bathrooms?: number
  square_footage?: number

  // Access Details
  access_instructions?: string
  key_location?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  special_requirements?: string

  // Amenities
  has_parking: boolean
  has_pets: boolean
  pet_details?: string
  has_alarm_system: boolean
  alarm_code?: string
  has_cctv: boolean
  wifi_ssid?: string
  wifi_password?: string
}
```

#### AddProperty.tsx (Create Page)
```typescript
export default function AddProperty() {
  const navigate = useNavigate()

  const handleSuccess = (property: CustomerProperty) => {
    toast.success(`Property "${property.property_name}" created`)
    navigate(`/properties/${property.id}`)
  }

  const handleCancel = () => {
    navigate('/properties')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="secondary" onClick={handleCancel}>
          ← Back to Properties
        </Button>
      </div>

      <Card padding="lg">
        <h1 className="text-3xl font-bold mb-6">Add Property</h1>
        <PropertyForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  )
}
```

#### EditProperty.tsx (Edit Page)
```typescript
export default function EditProperty() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<CustomerProperty | null>(null)
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => {
    loadProperty()
  }, [id])

  const loadProperty = () => {
    withLoading(async () => {
      const result = await customerPropertiesAPI.getById(id!)
      setProperty(result.data)
    })
  }

  const handleSuccess = (property: CustomerProperty) => {
    toast.success(`Property "${property.property_name}" updated`)
    navigate(`/properties/${property.id}`)
  }

  const handleDelete = async () => {
    // Show confirmation modal with property name typing
    if (!confirm(`Are you sure you want to delete "${property?.property_name}"?`)) return

    withLoading(async () => {
      await customerPropertiesAPI.delete(id!)
      toast.success('Property deleted')
      navigate('/properties')
    })
  }

  if (isLoading) return <LoadingSkeleton />
  if (!property) return <EmptyState title="Property not found" />

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/properties')}>
          ← Back to Properties
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete Property
        </Button>
      </div>

      <Card padding="lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Property</h1>
          <p className="text-gray-600 mt-1">{property.property_name}</p>
        </div>
        <PropertyForm
          mode="edit"
          propertyId={id}
          initialData={property}
          onSuccess={handleSuccess}
          onCancel={() => navigate('/properties')}
        />
      </Card>
    </div>
  )
}
```

### API Integration

**Endpoints Used:**
```typescript
// List customers for dropdown
GET /api/customers?service_provider_id={id}

// Create property
POST /api/customer-properties
Body: PropertyFormData + { service_provider_id: string }

// Get property by ID
GET /api/customer-properties/:id?service_provider_id={id}

// Update property
PATCH /api/customer-properties/:id
Body: Partial<PropertyFormData> + { service_provider_id: string }

// Delete property
DELETE /api/customer-properties/:id?service_provider_id={id}
```

### Validation Rules

**Postcode Validation:**
```typescript
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i

function validatePostcode(postcode: string): boolean {
  return UK_POSTCODE_REGEX.test(postcode.trim())
}
```

**Phone Validation:**
```typescript
const UK_PHONE_REGEX = /^(?:(?:\+44\s?|0)(?:\d\s?){9,10})$/

function validatePhone(phone: string): boolean {
  if (!phone) return true // Optional field
  return UK_PHONE_REGEX.test(phone.replace(/\s/g, ''))
}
```

---

## Design Patterns

### Form Layout Pattern
```typescript
<form onSubmit={handleSubmit} className="space-y-8">
  {/* Section 1 */}
  <div className="border-b pb-6">
    <h2 className="text-xl font-semibold mb-4">Property Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Property Name" required />
      <Select label="Customer" required />
      <Input label="Address" required className="md:col-span-2" />
      {/* ... */}
    </div>
  </div>

  {/* Section 2 */}
  <div className="border-b pb-6">
    <h2 className="text-xl font-semibold mb-4">Access & Instructions</h2>
    <div className="space-y-4">
      <Textarea label="Access Instructions" rows={4} />
      {/* ... */}
    </div>
  </div>

  {/* Section 3 */}
  <div className="pb-6">
    <h2 className="text-xl font-semibold mb-4">Amenities</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Checkbox label="Has Parking" />
      <Checkbox label="Has Pets" />
      {/* ... */}
      {hasPets && (
        <Textarea label="Pet Details" className="md:col-span-2" />
      )}
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-3 justify-end">
    <Button type="button" variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
    {mode === 'create' && (
      <Button type="button" variant="secondary" onClick={handleSaveAndAddAnother}>
        Save & Add Another
      </Button>
    )}
    <Button type="submit" disabled={!isValid || isLoading}>
      {isLoading && <Spinner size="sm" />}
      {mode === 'create' ? 'Create Property' : 'Update Property'}
    </Button>
  </div>
</form>
```

### Conditional Field Pattern
```typescript
const [hasPets, setHasPets] = useState(false)

// In form
<Checkbox
  label="Has Pets"
  checked={hasPets}
  onChange={(e) => {
    setHasPets(e.target.checked)
    if (!e.target.checked) {
      // Clear pet details when unchecked
      setValue('pet_details', '')
    }
  }}
/>

{hasPets && (
  <Textarea
    label="Pet Details"
    placeholder="Breed, temperament, special handling instructions..."
    value={formData.pet_details}
    onChange={(e) => setValue('pet_details', e.target.value)}
  />
)}
```

---

## Dependencies

**Existing Components (Reuse):**
- Button ([Button.tsx](../../apps/web-cleaning/src/components/ui/Button.tsx))
- Card ([Card.tsx](../../apps/web-cleaning/src/components/ui/Card.tsx))
- Input ([Input.tsx](../../apps/web-cleaning/src/components/ui/Input.tsx))
- Select ([Select.tsx](../../apps/web-cleaning/src/components/ui/Select.tsx))
- Checkbox ([Checkbox.tsx](../../apps/web-cleaning/src/components/ui/Checkbox.tsx))
- Textarea (needs verification or creation)
- Spinner ([Spinner.tsx](../../apps/web-cleaning/src/components/ui/Spinner.tsx))
- Toast (useToast hook)
- LoadingSkeleton ([LoadingSkeleton.tsx](../../apps/web-cleaning/src/components/ui/LoadingSkeleton.tsx))

**APIs:**
- customerPropertiesAPI (already exists)
- customersAPI (verify exists)

**Hooks:**
- useLoading (already exists)
- useToast (already exists)
- useNavigate (react-router-dom)
- useState, useEffect (react)

---

## Testing Checklist

### Manual Testing

**Add Property Form:**
- [ ] Navigate to `/properties` and click "Add Property"
- [ ] Verify all form fields render correctly
- [ ] Test required field validation (leave fields empty and submit)
- [ ] Test postcode validation (invalid format)
- [ ] Test phone validation (invalid format)
- [ ] Test customer dropdown loads customers
- [ ] Test "Has Pets" checkbox shows/hides pet details field
- [ ] Test "Has Alarm System" checkbox shows/hides alarm code field
- [ ] Test "Save Property" creates property and navigates
- [ ] Test "Save & Add Another" creates property and clears form
- [ ] Test "Cancel" navigates back without saving
- [ ] Test unsaved changes warning on navigation
- [ ] Test form with all fields filled (max data)
- [ ] Test form with only required fields (min data)
- [ ] Test error handling (network failure, API error)

**Edit Property Form:**
- [ ] Navigate to `/properties/:id/edit` from properties list
- [ ] Verify form pre-fills with existing property data
- [ ] Test updating property name
- [ ] Test updating customer (with confirmation warning)
- [ ] Test updating optional fields (add/remove data)
- [ ] Test checkbox state persistence
- [ ] Test "Update Property" saves changes
- [ ] Test "Cancel" discards changes
- [ ] Test "Delete Property" with confirmation
- [ ] Test delete property that has dependencies (should warn)
- [ ] Test loading state while fetching property
- [ ] Test 404 handling (property not found)

**Integration:**
- [ ] Verify property appears in list after creation
- [ ] Verify property updates reflect in list and details
- [ ] Verify property deletion removes from list
- [ ] Test creating property, then immediately editing
- [ ] Test navigation flow: List → Add → Details → Edit → List

---

## Success Metrics

**Completion Criteria:**
- [ ] Can create properties with all required fields
- [ ] Can create properties with all optional fields
- [ ] Can edit existing properties
- [ ] Can delete properties (with confirmation)
- [ ] Form validation prevents invalid data
- [ ] Error messages are clear and actionable
- [ ] Loading states provide feedback
- [ ] Success/error toasts confirm actions
- [ ] Navigation works correctly throughout flow
- [ ] Mobile responsive (tested on 375px width)
- [ ] No console errors or warnings
- [ ] No TypeScript errors

**Definition of Done:**
- All acceptance criteria met
- Manual testing checklist completed
- Code reviewed and approved
- No critical bugs
- Documentation updated (this file)
- Ready for PM-003 (Property Calendar) implementation

---

## Related Stories

**Prerequisites:**
- None (backend APIs already complete)

**Dependent Stories:**
- PM-003: Property Calendar UI (uses PropertyDetails page structure)
- INT-001: Property-Contract-Job Integration (adds tabs to property details)

**Related Documentation:**
- [PROPERTY-CONTRACT-MANAGEMENT-PLAN.md](../../START-HERE/PROPERTY-CONTRACT-MANAGEMENT-PLAN.md)
- [CURRENT_STATUS.md](../../CURRENT_STATUS.md)
- [customer-properties.ts](../../apps/api/src/routes/customer-properties.ts) - API reference

---

## Notes

**Design Decisions:**
1. **Shared Form Component**: PropertyForm.tsx reused for both Add and Edit to reduce duplication
2. **Multi-section Layout**: Improves UX by grouping related fields
3. **Conditional Fields**: Pet details and alarm code only show when relevant
4. **Save & Add Another**: Useful for bulk property setup (new service providers)
5. **Customer Dropdown**: Required field ensures property always has owner
6. **Postcode Validation**: UK-specific format to match expected data quality

**Future Enhancements:**
- Address autocomplete using UK postcode API
- Google Maps integration for property location
- Photo upload for property images
- Custom amenities (user-defined checkboxes)
- Property templates for faster creation
- Bulk import via CSV
- Property categories/tags for organization

---

**Story Created:** 2025-11-04
**Last Updated:** 2025-11-04
**Estimated Completion:** Day 3 of Properties & Contracts Sprint
