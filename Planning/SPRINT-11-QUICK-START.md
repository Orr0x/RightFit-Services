# Sprint 11 - Quick Start Guide

## ✅ Approved & Ready to Start

**Timeline**: 22 days (~4.5 weeks) ✅ APPROVED
**Priority**: Follow plan as-is (no specific modules prioritized first)
**Database**: Dev environment ready for migrations ✅
**Strategy**: Build v2 alongside existing portal ✅

---

## Your Mission

Build Maintenance Portal V2 by copying and adapting the Cleaning Portal.

**Template**: `apps/web-cleaning` → `apps/web-maintenance`
**Method**: COPY → ADAPT → TEST → COMMIT

---

## Start Here

### Step 1: Read the Plans
1. **Main Plan**: [SPRINT-11-MAINTENANCE-PORTAL-V2.md](./SPRINT-11-MAINTENANCE-PORTAL-V2.md) - Full details
2. **Dev Instructions**: [SPRINT-11-DEV-AGENT-PROMPT.md](./SPRINT-11-DEV-AGENT-PROMPT.md) - How to execute
3. **Executive Summary**: [SPRINT-11-EXECUTIVE-SUMMARY.md](./SPRINT-11-EXECUTIVE-SUMMARY.md) - Quick overview

### Step 2: Set Up Your Environment
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Create new branch for Sprint 11
git checkout -b feature/sprint-11-maintenance-portal-v2

# Verify dev server is running
# API should be running on configured port
# Cleaning portal should be accessible for reference
```

### Step 3: Begin Phase 1, Task 1.1
```bash
# Your first task:
# Copy API client from cleaning portal and adapt for maintenance

# 1. Read cleaning API client
cat apps/web-cleaning/src/lib/api.ts

# 2. Copy to maintenance
cp apps/web-cleaning/src/lib/api.ts apps/web-maintenance/src/lib/api.ts

# 3. Open and start adapting:
# - Replace 'cleaning' with 'maintenance'
# - Update service types
# - Add contractor endpoints
# - Add maintenance-specific fields
```

---

## Key Reference Paths

### Source (Copy From):
- **Cleaning Portal**: `apps/web-cleaning/`
- **Cleaning API**: `apps/api/src/routes/cleaning-*.ts`
- **Cleaning Types**: `packages/shared/types/cleaning.ts`

### Destination (Copy To):
- **Maintenance Portal**: `apps/web-maintenance/`
- **Maintenance API**: `apps/api/src/routes/maintenance-*.ts`
- **Maintenance Types**: Create `apps/web-maintenance/src/types/`

### Shared (Reuse):
- **UI Components**: `apps/web-cleaning/src/components/ui/` (copy if not in maintenance)
- **Layout Components**: `apps/web-cleaning/src/components/layout/` (adapt Sidebar)
- **Database**: `packages/database/prisma/schema.prisma` (will add new models)

---

## The COPY → ADAPT → TEST → COMMIT Workflow

### For Every Page/Component:

```bash
# 1. COPY from cleaning
cp apps/web-cleaning/src/pages/SomePage.tsx \
   apps/web-maintenance/src/pages/SomePage.tsx

# 2. ADAPT for maintenance
# Open in editor and:
# - Replace 'cleaning' → 'maintenance'
# - Replace 'Cleaning' → 'Maintenance'
# - Update service types
# - Add priority field (if job-related)
# - Add contractor assignment (if job-related)
# - Add parts tracking (if job-related)

# 3. TEST
# - Run dev server
# - Navigate to page
# - Verify no errors
# - Test functionality

# 4. COMMIT
git add .
git commit -m "feat(maintenance): add SomePage adapted from cleaning portal

- Copied from cleaning portal
- Adapted for maintenance service types
- Added priority and contractor fields
- Updated navigation

Refs: Sprint 11, Phase X, Task X.X"
```

---

## Maintenance-Specific Adaptations

### Service Types (Replace Everywhere)
```typescript
// OLD (Cleaning):
'ONE_OFF' | 'REGULAR' | 'DEEP_CLEAN' | 'TURNOVER' | 'CHECK_IN' | 'CHECK_OUT'

// NEW (Maintenance):
'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'CARPENTRY' | 'PAINTING' | 'ROOFING' |
'APPLIANCE_REPAIR' | 'PEST_CONTROL' | 'LANDSCAPING' | 'GENERAL' | 'EMERGENCY'
```

### Priority Levels (Add to Jobs)
```typescript
// NEW field - doesn't exist in cleaning:
priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

// Visual indicators:
URGENT: 🔴 Red badge
HIGH: 🟠 Orange badge
MEDIUM: 🟡 Yellow badge
LOW: 🟢 Green badge
```

### Job Status Flow
```typescript
// NEW statuses for maintenance:
'QUOTE_PENDING' → 'QUOTE_SENT' → 'QUOTE_APPROVED' →
'SCHEDULED' → 'IN_PROGRESS' → 'COMPLETED'

// Additional statuses:
'QUOTE_REJECTED' | 'AWAITING_PARTS' | 'CANCELLED'
```

### Assignment Types (Add Contractor Option)
```typescript
// Cleaning has only workers:
assignedWorkerId?: string

// Maintenance has BOTH workers AND contractors:
assignedWorkerId?: string
assignedContractorId?: string
```

### Parts Tracking (Add to Jobs)
```typescript
// NEW fields - don't exist in cleaning:
partsNeeded?: string[]
partsUsed?: string[]
estimatedCost?: number
actualCost?: number
```

---

## Phase 1 Checklist (Start Here)

### Task 1.1: API Client Setup
- [ ] Copy `apps/web-cleaning/src/lib/api.ts` to maintenance
- [ ] Replace all cleaning → maintenance references
- [ ] Update service types enum
- [ ] Add contractor API endpoints
- [ ] Add maintenance-specific job fields
- [ ] Test imports and TypeScript compilation

### Task 1.2: TypeScript Types
- [ ] Create `apps/web-maintenance/src/types/` directory
- [ ] Create `maintenance.ts` with MaintenanceJob, enums
- [ ] Create `contractor.ts` with Contractor types
- [ ] Create `quote.ts` with Quote types
- [ ] Create `invoice.ts` with Invoice types
- [ ] Create `index.ts` to export all types

### Task 1.3: Shared Components
- [ ] Copy layout components if not present
- [ ] Copy navigation components if not present
- [ ] Copy UI components if not present
- [ ] Update Sidebar with maintenance navigation items
- [ ] Add Contractors menu item
- [ ] Test layout renders correctly

---

## Common Patterns to Follow

### Component Structure
```typescript
import { useState } from 'react'
import type { MaintenanceJob } from '../types'

interface Props {
  job: MaintenanceJob
  onSave: (job: MaintenanceJob) => void
}

export function MyComponent({ job, onSave }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return <div>...</div>
}
```

### API Route Pattern
```typescript
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.user
    const data = await service.list(tenantId, req.query)
    res.json(data)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to...' })
  }
})
```

### Form Pattern
```typescript
import { useForm } from 'react-hook-form'

const { register, handleSubmit, formState: { errors } } = useForm()

const onSubmit = async (data) => {
  try {
    await api.create(data)
    navigate('/success')
  } catch (error) {
    setError(error.message)
  }
}

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('field', { required: true })} />
    {errors.field && <span>Required</span>}
  </form>
)
```

---

## Testing Checklist (After Each Task)

- [ ] TypeScript compiles (no errors)
- [ ] Page/component renders
- [ ] No console errors
- [ ] API calls work
- [ ] Data displays correctly
- [ ] Forms validate
- [ ] Navigation works
- [ ] Loading states show
- [ ] Error messages display

---

## Progress Tracking

Use TodoWrite to track your tasks:

```typescript
// Start of Phase 1
TodoWrite([
  { content: "API Client Setup", status: "in_progress", activeForm: "Setting up API client" },
  { content: "TypeScript Types", status: "pending", activeForm: "Creating TypeScript types" },
  { content: "Shared Components", status: "pending", activeForm: "Migrating shared components" },
])

// After completing API Client
TodoWrite([
  { content: "API Client Setup", status: "completed", activeForm: "Setting up API client" },
  { content: "TypeScript Types", status: "in_progress", activeForm: "Creating TypeScript types" },
  { content: "Shared Components", status: "pending", activeForm: "Migrating shared components" },
])
```

---

## Need Help?

1. **Check the cleaning portal** - It's your template!
2. **Check the sprint plan** - Detailed guidance in main plan
3. **Search the codebase** - Similar problems solved elsewhere
4. **Check dev prompt** - Step-by-step instructions
5. **Ask the user** - If truly stuck

---

## First Action

**Right now, execute this command:**

```bash
# Start with Phase 1, Task 1.1
cat apps/web-cleaning/src/lib/api.ts
```

Read the cleaning API client, understand its structure, then copy and adapt it for maintenance.

**You've got this! 🚀**

---

**All planning documents:**
- ✅ [SPRINT-11-MAINTENANCE-PORTAL-V2.md](./SPRINT-11-MAINTENANCE-PORTAL-V2.md) - Full plan
- ✅ [SPRINT-11-EXECUTIVE-SUMMARY.md](./SPRINT-11-EXECUTIVE-SUMMARY.md) - Overview
- ✅ [SPRINT-11-DEV-AGENT-PROMPT.md](./SPRINT-11-DEV-AGENT-PROMPT.md) - How to execute
- ✅ [SPRINT-11-QUICK-START.md](./SPRINT-11-QUICK-START.md) - This file

**Status**: 📋 APPROVED & READY
**Next**: Begin Phase 1, Task 1.1
