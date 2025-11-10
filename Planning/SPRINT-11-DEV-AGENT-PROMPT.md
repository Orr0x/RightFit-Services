# Sprint 11 - Maintenance Portal V2: Development Agent Instructions

## Mission Overview

You are tasked with building a complete Maintenance Portal V2 by replicating and adapting the proven architecture from the Cleaning Portal (`apps/web-cleaning`) to create a comprehensive maintenance management system (`apps/web-maintenance`).

**Your Role**: Senior Full-Stack Developer
**Timeline**: 22 working days across 10 phases
**Reference Plan**: [SPRINT-11-MAINTENANCE-PORTAL-V2.md](./SPRINT-11-MAINTENANCE-PORTAL-V2.md)
**Priority**: 🔴 PRIORITY 1

---

## Core Principles

### 1. **Template-Based Development**
- **ALWAYS** use the cleaning portal as your template
- **COPY** working code from `apps/web-cleaning` and **ADAPT** for maintenance
- **NEVER** reinvent solutions that already exist in the cleaning portal
- **MAINTAIN** the same architecture, patterns, and file structure

### 2. **Systematic Approach**
- **WORK PHASE-BY-PHASE** - Complete one phase before starting the next
- **TEST AFTER EACH TASK** - Verify functionality before moving on
- **COMMIT FREQUENTLY** - Commit after completing each major task
- **DOCUMENT AS YOU GO** - Add comments and update docs continuously

### 3. **Code Quality Standards**
- **TypeScript strict mode** - No `any` types unless absolutely necessary
- **Consistent naming** - Follow cleaning portal naming conventions
- **Error handling** - Try-catch blocks, user-friendly error messages
- **Loading states** - Show spinners/skeletons during async operations
- **Empty states** - Provide helpful messages when no data exists
- **Responsive design** - Mobile-first approach, test on all breakpoints

### 4. **Pattern Consistency**
- **API Client Pattern**: Same structure as cleaning portal (`list`, `get`, `create`, `update`, `delete`)
- **Modal Pattern**: Controlled components with `isOpen`, `onClose`, `onSave` props
- **Form Pattern**: React Hook Form with validation, error display, submit handling
- **Table Pattern**: Sortable, filterable, searchable with pagination
- **Navigation**: Breadcrumbs, back buttons, context preservation

---

## Phase-by-Phase Execution Guide

### **PHASE 1: Foundation & Core Infrastructure (Days 1-2)**

#### Task 1.1: API Client Setup

**Objective**: Create complete API client for maintenance portal

**Steps**:
1. **Read** the cleaning API client:
   ```bash
   Read: apps/web-cleaning/src/lib/api.ts
   ```

2. **Copy** to maintenance portal:
   ```bash
   Copy: apps/web-cleaning/src/lib/api.ts
   To: apps/web-maintenance/src/lib/api.ts
   ```

3. **Search and replace** all references:
   - `cleaning` → `maintenance`
   - `Cleaning` → `Maintenance`
   - `CLEANING` → `MAINTENANCE`
   - `CleaningJob` → `MaintenanceJob`
   - `CleaningServiceType` → `MaintenanceServiceType`
   - `/cleaning-jobs` → `/maintenance-jobs`
   - `/cleaning-timesheets` → `/maintenance-timesheets`
   - `/cleaning-quotes` → `/maintenance-quotes`
   - `/cleaning-invoices` → `/maintenance-invoices`

4. **Update** service types enum:
   ```typescript
   // Remove cleaning types:
   // ONE_OFF, REGULAR, DEEP_CLEAN, TURNOVER, CHECK_IN, CHECK_OUT

   // Add maintenance types:
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
   ```

5. **Add** contractor endpoints:
   ```typescript
   // Add to api.ts
   export const contractorsApi = {
     list: (filters?: ContractorFilters) =>
       api.get<Contractor[]>('/contractors', { params: filters }),

     get: (id: string) =>
       api.get<Contractor>(`/contractors/${id}`),

     create: (data: CreateContractorDto) =>
       api.post<Contractor>('/contractors', data),

     update: (id: string, data: UpdateContractorDto) =>
       api.put<Contractor>(`/contractors/${id}`, data),

     delete: (id: string) =>
       api.delete(`/contractors/${id}`),

     getJobs: (id: string) =>
       api.get<MaintenanceJob[]>(`/contractors/${id}/jobs`),

     getAvailability: (id: string) =>
       api.get<ContractorAvailability[]>(`/contractors/${id}/availability`),

     setAvailability: (id: string, data: ContractorAvailability[]) =>
       api.post(`/contractors/${id}/availability`, data),
   }
   ```

6. **Add** maintenance-specific fields to job API:
   ```typescript
   export interface MaintenanceJob {
     // ... existing fields ...
     priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
     workDescription: string
     partsNeeded?: string[]
     partsUsed?: string[]
     estimatedCost?: number
     actualCost?: number
     quoteRequired: boolean
     quoteApproved?: boolean
     assignedContractorId?: string
   }
   ```

7. **Test** the API client:
   - Import in a test page
   - Verify TypeScript compilation
   - No errors

**Validation Checklist**:
- [ ] All cleaning references replaced with maintenance
- [ ] Service types updated to maintenance types
- [ ] Contractor API endpoints added
- [ ] Priority field added to job types
- [ ] Parts tracking fields added
- [ ] TypeScript compiles without errors
- [ ] No console errors when importing

---

#### Task 1.2: TypeScript Types & Interfaces

**Objective**: Create comprehensive type definitions for maintenance domain

**Steps**:
1. **Create** types directory:
   ```bash
   mkdir -p apps/web-maintenance/src/types
   ```

2. **Create** `apps/web-maintenance/src/types/maintenance.ts`:
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
     tenantId: string
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
     estimatedHours?: number
     actualHours?: number
     quoteRequired: boolean
     quoteApproved?: boolean
     quoteId?: string
     invoiceId?: string
     assignedWorkerId?: string
     assignedContractorId?: string
     scheduledDate?: Date
     completedDate?: Date
     sourceType?: 'CLEANING_ISSUE' | 'GUEST_REPORT' | 'INSPECTION' | 'SCHEDULED'
     sourceId?: string
     createdAt: Date
     updatedAt: Date

     // Relations
     property?: Property
     customer?: Customer
     assignedWorker?: User
     assignedContractor?: Contractor
     quote?: MaintenanceQuote
     invoice?: MaintenanceInvoice
     photos?: MaintenancePhoto[]
     history?: MaintenanceJobHistory[]
   }
   ```

3. **Create** `apps/web-maintenance/src/types/contractor.ts`:
   ```typescript
   import { MaintenanceServiceType } from './maintenance'

   export interface Contractor {
     id: string
     tenantId: string
     name: string
     email: string
     phone: string
     company?: string
     specialties: MaintenanceServiceType[]
     rating?: number
     hourlyRate?: number
     certifications?: string[]
     insuranceExpiry?: Date
     insurancePolicy?: string
     licenseNumbers?: string[]
     paymentTerms?: string
     isActive: boolean
     createdAt: Date
     updatedAt: Date

     // Relations
     availability?: ContractorAvailability[]
     maintenanceJobs?: MaintenanceJob[]
   }

   export interface ContractorAvailability {
     id: string
     contractorId: string
     dayOfWeek: number // 0-6 (Sunday-Saturday)
     startTime: string // HH:mm format
     endTime: string // HH:mm format
     isAvailable: boolean
   }

   export interface CreateContractorDto {
     name: string
     email: string
     phone: string
     company?: string
     specialties: MaintenanceServiceType[]
     hourlyRate?: number
     certifications?: string[]
     insuranceExpiry?: Date
     licenseNumbers?: string[]
     paymentTerms?: string
   }

   export interface UpdateContractorDto extends Partial<CreateContractorDto> {
     isActive?: boolean
   }

   export interface ContractorFilters {
     search?: string
     specialty?: MaintenanceServiceType
     isActive?: boolean
     hasInsurance?: boolean
   }
   ```

4. **Create** `apps/web-maintenance/src/types/quote.ts` and `invoice.ts` (similar pattern)

5. **Export** all types from index:
   ```typescript
   // apps/web-maintenance/src/types/index.ts
   export * from './maintenance'
   export * from './contractor'
   export * from './quote'
   export * from './invoice'
   ```

**Validation Checklist**:
- [ ] All type files created
- [ ] No TypeScript errors
- [ ] Types match database schema (from sprint plan)
- [ ] Enums properly defined
- [ ] DTOs include validation-friendly structure

---

#### Task 1.3: Shared Components Migration

**Objective**: Copy and adapt layout/UI components from cleaning portal

**Steps**:
1. **Identify** components to copy from cleaning:
   ```bash
   ls apps/web-cleaning/src/components/
   # Note: layout/, navigation/, ui/
   ```

2. **Copy** layout components:
   ```bash
   # If not already present, copy:
   cp -r apps/web-cleaning/src/components/layout apps/web-maintenance/src/components/
   cp -r apps/web-cleaning/src/components/navigation apps/web-maintenance/src/components/
   cp -r apps/web-cleaning/src/components/ui apps/web-maintenance/src/components/
   ```

3. **Update** Sidebar navigation in `apps/web-maintenance/src/components/layout/Sidebar.tsx`:
   ```typescript
   const navigation = [
     { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
     { name: 'Jobs', href: '/jobs', icon: WrenchIcon },
     { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
     { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon },
     { name: 'Customers', href: '/customers', icon: UsersIcon },
     { name: 'Workers', href: '/workers', icon: UserGroupIcon },
     { name: 'Contractors', href: '/contractors', icon: BriefcaseIcon }, // NEW
     { name: 'Quotes', href: '/quotes', icon: DocumentTextIcon },
     { name: 'Invoices', href: '/invoices', icon: CurrencyDollarIcon },
     { name: 'Reports', href: '/reports', icon: ChartBarIcon },
     { name: 'Financial', href: '/financial', icon: BanknotesIcon },
     { name: 'Certificates', href: '/certificates', icon: AcademicCapIcon },
   ]
   ```

4. **Update** branding/colors if needed (maintenance theme vs cleaning theme)

5. **Test** layout:
   - Run dev server
   - Navigate to any route
   - Verify sidebar displays
   - Verify navigation works

**Validation Checklist**:
- [ ] Layout components copied
- [ ] Sidebar navigation updated with maintenance routes
- [ ] Contractors menu item added
- [ ] All imports resolve correctly
- [ ] Visual check: layout renders correctly

---

### **PHASE 2: Customer & Property Management (Days 3-4)**

#### Task 2.1: Properties Module - COPY & ADAPT Pattern

**Objective**: Create full CRUD for properties with maintenance-specific features

**Steps**:

1. **Copy** properties pages:
   ```bash
   # Copy all property-related pages from cleaning
   cp apps/web-cleaning/src/pages/Properties.tsx apps/web-maintenance/src/pages/
   cp apps/web-cleaning/src/pages/PropertyDetails.tsx apps/web-maintenance/src/pages/
   cp apps/web-cleaning/src/pages/AddProperty.tsx apps/web-maintenance/src/pages/
   cp apps/web-cleaning/src/pages/EditProperty.tsx apps/web-maintenance/src/pages/
   ```

2. **Update** imports in each file:
   ```typescript
   // Change API imports
   import { propertiesApi } from '../lib/api' // Verify this path

   // Update types
   import type { Property } from '../types'
   ```

3. **Adapt** PropertyDetails.tsx for maintenance:
   - Find the section showing "Cleaning Jobs"
   - Replace with "Maintenance Jobs"
   - Update API call: `cleaningJobsApi.list()` → `maintenanceJobsApi.list()`
   - Update job card to show priority badge
   - Add service type icon/badge

4. **Add** maintenance-specific features to PropertyDetails:
   ```typescript
   // Add tab for maintenance history
   const tabs = [
     { name: 'Overview', value: 'overview' },
     { name: 'Maintenance History', value: 'maintenance' }, // NEW
     { name: 'Documents', value: 'documents' },
     { name: 'Photos', value: 'photos' },
   ]

   // In maintenance history tab, show:
   {activeTab === 'maintenance' && (
     <div>
       <h3>Maintenance History</h3>
       {maintenanceJobs.map(job => (
         <MaintenanceJobCard
           key={job.id}
           job={job}
           showPriority
           showServiceType
         />
       ))}
     </div>
   )}
   ```

5. **Update** routing in App.tsx:
   ```typescript
   <Route path="/properties" element={<Properties />} />
   <Route path="/properties/new" element={<AddProperty />} />
   <Route path="/properties/:id" element={<PropertyDetails />} />
   <Route path="/properties/:id/edit" element={<EditProperty />} />
   ```

6. **Test**:
   - Navigate to /properties
   - List should load
   - Click "Add Property" → form displays
   - Fill form and submit → property created
   - Click property → details page displays
   - Click edit → edit form displays
   - Save changes → property updated

**Validation Checklist**:
- [ ] All 4 property pages exist and work
- [ ] CRUD operations functional
- [ ] Maintenance jobs show on property details
- [ ] Navigation between pages works
- [ ] No console errors

---

#### Task 2.2: Customers Module - COPY & ADAPT Pattern

**Objective**: Create full CRUD for customers

**Steps**:

1. **Copy** customer pages:
   ```bash
   cp apps/web-cleaning/src/pages/Customers.tsx apps/web-maintenance/src/pages/
   cp apps/web-cleaning/src/pages/CustomerDetails.tsx apps/web-maintenance/src/pages/
   cp apps/web-cleaning/src/pages/AddCustomer.tsx apps/web-maintenance/src/pages/
   cp apps/web-cleaning/src/pages/EditCustomer.tsx apps/web-maintenance/src/pages/
   ```

2. **Update** CustomerDetails to show maintenance data:
   - Replace cleaning jobs with maintenance jobs
   - Update quotes to maintenance quotes
   - Update invoices to maintenance invoices

3. **Add** customer type badge if not present:
   ```typescript
   <Badge color={customerTypeBadgeColor(customer.type)}>
     {customer.type}
   </Badge>
   ```

4. **Update** routing:
   ```typescript
   <Route path="/customers" element={<Customers />} />
   <Route path="/customers/new" element={<AddCustomer />} />
   <Route path="/customers/:id" element={<CustomerDetails />} />
   <Route path="/customers/:id/edit" element={<EditCustomer />} />
   ```

5. **Test** complete CRUD workflow

**Validation Checklist**:
- [ ] All 4 customer pages work
- [ ] Customer list shows correctly
- [ ] Can create/edit/delete customers
- [ ] Customer details show maintenance jobs
- [ ] Navigation works

---

### **PHASE 3: Job Management Enhancement (Days 5-7)**

#### Task 3.1: Enhanced Job Creation

**Objective**: Create multi-tab job creation form with maintenance-specific fields

**Steps**:

1. **Read** the cleaning job creation page:
   ```bash
   Read: apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx
   ```

2. **Copy** to maintenance:
   ```bash
   cp apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx \
      apps/web-maintenance/src/pages/maintenance/CreateMaintenanceJob.tsx
   ```

3. **Update** the form to use tabs:
   ```typescript
   const [activeTab, setActiveTab] = useState<'details' | 'scheduling' | 'financial' | 'attachments'>('details')

   const tabs = [
     { id: 'details', name: 'Job Details' },
     { id: 'scheduling', name: 'Scheduling' },
     { id: 'financial', name: 'Financial' },
     { id: 'attachments', name: 'Attachments' },
   ]
   ```

4. **Add** priority selector in Details tab:
   ```typescript
   <div>
     <label>Priority</label>
     <select {...register('priority', { required: true })}>
       <option value="URGENT">🔴 Urgent - Immediate Response</option>
       <option value="HIGH">🟠 High - 24-48 hours</option>
       <option value="MEDIUM">🟡 Medium - 3-7 days</option>
       <option value="LOW">🟢 Low - Scheduled</option>
     </select>
   </div>
   ```

5. **Add** service type selector:
   ```typescript
   <div>
     <label>Service Type</label>
     <select {...register('serviceType', { required: true })}>
       <option value="PLUMBING">🔧 Plumbing</option>
       <option value="ELECTRICAL">⚡ Electrical</option>
       <option value="HVAC">❄️ HVAC</option>
       <option value="CARPENTRY">🔨 Carpentry</option>
       <option value="PAINTING">🎨 Painting</option>
       <option value="ROOFING">🏠 Roofing</option>
       <option value="APPLIANCE_REPAIR">🔌 Appliance Repair</option>
       <option value="PEST_CONTROL">🐛 Pest Control</option>
       <option value="LANDSCAPING">🌳 Landscaping</option>
       <option value="GENERAL">🛠️ General Maintenance</option>
       <option value="EMERGENCY">🚨 Emergency</option>
     </select>
   </div>
   ```

6. **Add** work description (rich text or textarea):
   ```typescript
   <div>
     <label>Work Description</label>
     <textarea
       {...register('workDescription', { required: true })}
       rows={5}
       placeholder="Detailed description of the work needed..."
     />
   </div>
   ```

7. **Add** parts needed section:
   ```typescript
   <div>
     <label>Parts Needed</label>
     <PartsListInput
       value={partsNeeded}
       onChange={setPartsNeeded}
     />
   </div>

   // Create PartsListInput component:
   function PartsListInput({ value, onChange }) {
     const [parts, setParts] = useState(value || [])

     const addPart = () => {
       setParts([...parts, ''])
       onChange([...parts, ''])
     }

     const removePart = (index) => {
       const newParts = parts.filter((_, i) => i !== index)
       setParts(newParts)
       onChange(newParts)
     }

     const updatePart = (index, value) => {
       const newParts = [...parts]
       newParts[index] = value
       setParts(newParts)
       onChange(newParts)
     }

     return (
       <div className="space-y-2">
         {parts.map((part, index) => (
           <div key={index} className="flex gap-2">
             <input
               type="text"
               value={part}
               onChange={(e) => updatePart(index, e.target.value)}
               placeholder="Part name or description"
             />
             <button type="button" onClick={() => removePart(index)}>
               Remove
             </button>
           </div>
         ))}
         <button type="button" onClick={addPart}>
           + Add Part
         </button>
       </div>
     )
   }
   ```

8. **Add** Scheduling tab:
   ```typescript
   {activeTab === 'scheduling' && (
     <div className="space-y-4">
       <div>
         <label>Assign To</label>
         <RadioGroup value={assignType} onChange={setAssignType}>
           <Radio value="worker">Worker (Internal)</Radio>
           <Radio value="contractor">Contractor (External)</Radio>
         </RadioGroup>
       </div>

       {assignType === 'worker' && (
         <WorkerPicker
           value={selectedWorker}
           onChange={setSelectedWorker}
           filterBySpecialty={formData.serviceType}
         />
       )}

       {assignType === 'contractor' && (
         <ContractorPicker
           value={selectedContractor}
           onChange={setSelectedContractor}
           filterBySpecialty={formData.serviceType}
         />
       )}

       <div>
         <label>Scheduled Date & Time</label>
         <DateTimePicker
           value={scheduledDate}
           onChange={setScheduledDate}
           minDate={new Date()}
         />
       </div>
     </div>
   )}
   ```

9. **Add** Financial tab:
   ```typescript
   {activeTab === 'financial' && (
     <div className="space-y-4">
       <div>
         <label>
           <input type="checkbox" {...register('quoteRequired')} />
           Quote Required
         </label>
       </div>

       {quoteRequired && (
         <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
           <p className="text-sm text-yellow-800">
             A quote will be created and sent to the customer for approval before scheduling.
           </p>
         </div>
       )}

       <div>
         <label>Estimated Cost</label>
         <input
           type="number"
           step="0.01"
           {...register('estimatedCost')}
           placeholder="0.00"
         />
       </div>

       <div>
         <label>Estimated Hours</label>
         <input
           type="number"
           step="0.5"
           {...register('estimatedHours')}
           placeholder="0.0"
         />
       </div>
     </div>
   )}
   ```

10. **Add** Attachments tab:
    ```typescript
    {activeTab === 'attachments' && (
      <div className="space-y-4">
        <PhotoUpload
          value={photos}
          onChange={setPhotos}
          maxFiles={10}
          label="Issue Photos"
        />

        <DocumentUpload
          value={documents}
          onChange={setDocuments}
          acceptedTypes={['.pdf', '.doc', '.docx']}
          label="Documents (quotes, permits, etc.)"
        />
      </div>
    )}
    ```

11. **Test** the complete form:
    - All tabs render
    - Form validation works
    - Can submit with all fields
    - Job creates successfully

**Validation Checklist**:
- [ ] Multi-tab layout works
- [ ] All maintenance-specific fields present
- [ ] Priority selector with visual indicators
- [ ] Service type selector with icons
- [ ] Parts needed input works
- [ ] Worker/Contractor assignment works
- [ ] Financial fields present
- [ ] Photo/document upload works
- [ ] Form validates correctly
- [ ] Can create job successfully

---

#### Task 3.2: Enhanced Job Details Page

**Objective**: Create comprehensive job details view with tabs and actions

**Follow similar COPY & ADAPT pattern**:
1. Copy from cleaning job details
2. Add tabs (Overview, Timeline, Financial, Photos, Documents, History)
3. Add priority badge
4. Add service type badge
5. Add contractor info (if assigned to contractor)
6. Add parts needed/used sections
7. Add action buttons (Start, Complete, Request Quote, etc.)
8. Test all tabs and actions

---

#### Task 3.3: Enhanced Job List with Multiple Views

**Follow COPY & ADAPT pattern**:
1. Copy cleaning jobs list
2. Add view toggles (List, Grid, Kanban, Calendar)
3. Add filters (priority, service type, status, worker/contractor)
4. Implement Kanban board with drag-drop
5. Test all views and filters

---

### **PHASE 4-10: Continue Similar Pattern**

For all remaining phases, follow the same systematic approach:

1. **READ** the cleaning portal equivalent (if exists)
2. **COPY** to maintenance portal
3. **SEARCH & REPLACE** cleaning → maintenance references
4. **ADAPT** for maintenance-specific needs (priority, service types, contractors, parts, etc.)
5. **TEST** functionality
6. **COMMIT** with descriptive message
7. **DOCUMENT** any deviations or decisions made

---

## Key Implementation Guidelines

### When Creating New Components

```typescript
// 1. Check if component exists in cleaning portal
// 2. If yes, copy and adapt
// 3. If no, create following this pattern:

import { useState } from 'react'
import type { MaintenanceJob } from '../types'

interface ComponentNameProps {
  // Define props with TypeScript types
  job: MaintenanceJob
  onSave: (job: MaintenanceJob) => void
  onCancel: () => void
}

export function ComponentName({ job, onSave, onCancel }: ComponentNameProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // ... implementation
      onSave(updatedJob)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### When Creating API Routes (Backend)

```typescript
// 1. Reference cleaning route equivalent
// 2. Copy structure
// 3. Adapt for maintenance

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { maintenanceJobsService } from '../services/maintenance-jobs.service'

const router = Router()

// List with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.user
    const filters = req.query

    const jobs = await maintenanceJobsService.list(tenantId, filters)
    res.json(jobs)
  } catch (error) {
    console.error('Error listing maintenance jobs:', error)
    res.status(500).json({ error: 'Failed to list jobs' })
  }
})

// Get single job
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.user
    const { id } = req.params

    const job = await maintenanceJobsService.get(tenantId, id)

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json(job)
  } catch (error) {
    console.error('Error getting job:', error)
    res.status(500).json({ error: 'Failed to get job' })
  }
})

// Create job
router.post('/', authenticateToken, validateRequest(createJobSchema), async (req, res) => {
  try {
    const { tenantId } = req.user
    const data = req.body

    const job = await maintenanceJobsService.create(tenantId, data)
    res.status(201).json(job)
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({ error: 'Failed to create job' })
  }
})

// ... continue pattern for update, delete, etc.

export default router
```

### When Writing Database Migrations

```bash
# 1. Update schema.prisma with new models
# 2. Generate migration
npx prisma migrate dev --name add_maintenance_models

# 3. Review migration SQL
# 4. Test on dev database first
# 5. Generate Prisma Client
npx prisma generate

# 6. Verify types are available
# 7. Commit schema and migration files together
```

---

## Testing Requirements

### After Each Task
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] Page/component renders correctly
- [ ] API calls succeed
- [ ] Data displays correctly
- [ ] Forms validate correctly
- [ ] Navigation works
- [ ] Loading states show
- [ ] Error states display user-friendly messages

### After Each Phase
- [ ] All tasks in phase completed
- [ ] Integration between components works
- [ ] User workflow is smooth
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Code committed with descriptive message
- [ ] Documentation updated

### Before Sprint Completion
- [ ] Complete user workflow testing (create job → quote → approval → schedule → start → complete → invoice → payment)
- [ ] All CRUD operations work
- [ ] All filters and search work
- [ ] All modals work
- [ ] PDF generation works
- [ ] Email sending works (if implemented)
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Documentation complete

---

## Commit Message Format

Use conventional commits:

```
feat(maintenance): add property details page with maintenance history

- Copied PropertyDetails from cleaning portal
- Adapted to show maintenance jobs instead of cleaning jobs
- Added priority badges and service type indicators
- Added maintenance history timeline tab
- Updated navigation and routing

Refs: Sprint 11, Phase 2, Task 2.1
```

```
fix(maintenance): correct contractor assignment in job creation

- Fixed contractor picker not filtering by specialty
- Added availability check before assignment
- Improved error messaging when contractor unavailable

Refs: Sprint 11, Phase 3, Task 3.1
```

---

## Decision-Making Framework

### When You Encounter Issues:

1. **Check cleaning portal first** - Does it solve this problem? Copy the solution.
2. **Check documentation** - Is there guidance in the sprint plan?
3. **Search codebase** - Has this been solved elsewhere?
4. **Use proven patterns** - Follow existing patterns in the codebase
5. **Simplify** - Choose the simplest solution that works
6. **Document** - Add comments explaining any non-obvious decisions

### When You Need to Deviate from Plan:

1. **Document the reason** - Add comment in code and commit message
2. **Ensure consistency** - Follow existing patterns
3. **Test thoroughly** - Deviations need extra testing
4. **Update documentation** - Note the change in sprint completion summary

---

## Success Criteria Review

Before marking any phase complete, verify:

### Functional Requirements
- [ ] All pages from cleaning portal replicated and adapted
- [ ] Contractors page fully functional with CRUD
- [ ] Complete job workflow works (creation → invoice payment)
- [ ] Quote approval process works
- [ ] Worker and contractor assignment works
- [ ] Calendar scheduling works
- [ ] All reports generate correctly
- [ ] PDF generation works
- [ ] All filters and search work
- [ ] All modals work correctly
- [ ] Responsive design works

### Technical Requirements
- [ ] TypeScript type safety maintained
- [ ] All API endpoints secured
- [ ] Database migrations successful
- [ ] No console errors or warnings
- [ ] Performance acceptable (page load < 2s)
- [ ] Code follows cleaning portal patterns
- [ ] Error handling throughout
- [ ] Loading states implemented
- [ ] Empty states implemented

### Quality Requirements
- [ ] Code reviewed (self-review)
- [ ] User testing completed (manual testing)
- [ ] Documentation complete
- [ ] No critical bugs
- [ ] Accessibility standards met

---

## Progress Tracking

Use the TodoWrite tool to track your progress:

```typescript
// At start of each phase
TodoWrite([
  { content: "Phase X: Task 1 description", status: "pending", activeForm: "..." },
  { content: "Phase X: Task 2 description", status: "pending", activeForm: "..." },
  // ...
])

// When starting a task
TodoWrite([
  { content: "Phase X: Task 1 description", status: "in_progress", activeForm: "..." },
  // ...
])

// When completing a task
TodoWrite([
  { content: "Phase X: Task 1 description", status: "completed", activeForm: "..." },
  { content: "Phase X: Task 2 description", status: "in_progress", activeForm: "..." },
  // ...
])
```

---

## Questions & Support

If you encounter issues or need clarification:

1. **Check the sprint plan** - Detailed guidance in SPRINT-11-MAINTENANCE-PORTAL-V2.md
2. **Check the cleaning portal** - It's your template and reference
3. **Search the codebase** - Similar problems likely solved elsewhere
4. **Ask the user** - If truly blocked or unclear, ask specific questions

---

## Final Deliverable Checklist

Before marking Sprint 11 complete:

- [ ] All 60+ files created as specified
- [ ] All phases completed
- [ ] All tests passing
- [ ] Documentation complete:
  - [ ] MAINTENANCE-PORTAL-V2-USER-GUIDE.md
  - [ ] MAINTENANCE-PORTAL-V2-API-DOCS.md
  - [ ] SPRINT-11-COMPLETION-SUMMARY.md
- [ ] Database migrations applied
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Code committed and pushed
- [ ] Ready for user review

---

**Now begin with Phase 1, Task 1.1: API Client Setup**

Good luck! Follow the plan systematically, test thoroughly, and maintain the proven patterns from the cleaning portal. You've got this! 🚀
