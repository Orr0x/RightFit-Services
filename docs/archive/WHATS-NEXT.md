# What's Next: Phase 3 Roadmap

**Status:** Phase 2 Complete ✅ | Phase 3 Ready to Start 🚀
**Last Updated:** 2025-11-02

---

## 🎉 Phase 2 Achievement Summary

You've successfully completed **Phase 2: UX Excellence** with:

✅ **Customer Property Management**
- Multi-tenant architecture with ServiceProvider, Customer, and CustomerProperty tables
- Full CRUD API endpoints with tenant isolation
- Three-tab property interface (Our Properties | Customer Properties | Shared Properties)
- Customer business info and job statistics displayed

✅ **Complete Component Library**
- 15+ reusable components (Tabs, Skeleton, ThemeToggle, etc.)
- TypeScript types throughout
- Dark mode support
- Cross-platform (web + mobile)

✅ **Mobile Excellence**
- 12 fully functional screens
- Offline-first with WatermelonDB
- Loading states and skeletons

---

## 🚀 Phase 3: Next Steps (STORY-006 Continuation)

You're now ready to build the **Service Provider Dashboards** - the core business features for cleaning and maintenance services.

### Immediate Next Task: Part 2 - Cleaning Services Dashboard

**Estimated Duration:** 3 days
**Story Points:** 8 points

#### What You'll Build:

1. **Cleaning Dashboard Overview Page**
   - File: `apps/web-cleaning/src/pages/dashboards/CleaningDashboard.tsx`
   - Today's cleanings list
   - Assigned vs unassigned jobs
   - Worker status cards
   - Quick actions (assign, schedule)

2. **Cleaning Job Management**
   - File: `apps/web-cleaning/src/pages/cleaning/CleaningJobs.tsx`
   - File: `apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx`
   - File: `apps/web-cleaning/src/pages/cleaning/CleaningJobDetails.tsx`
   - CRUD operations for cleaning jobs
   - Assign jobs to workers
   - Checklist template selection
   - Photo requirements setup

3. **Turnover Workflow**
   - Worker marks checklist items
   - Photo upload for each room
   - Issue reporting (triggers maintenance upsell)
   - Completion workflow

#### Database Tables Needed:
- [ ] CleaningJob table
- [ ] Worker table
- [ ] ChecklistTemplate table
- [ ] ChecklistItem table

#### API Endpoints Needed:
- [ ] `/api/cleaning-jobs` (CRUD)
- [ ] `/api/workers` (CRUD)
- [ ] `/api/checklists` (CRUD)

#### Code References (Use as Templates):
- **Existing web pages:** `apps/web-landlord/src/pages/Properties.tsx`, `WorkOrders.tsx`
- **Existing components:** Reuse all components from `apps/web-cleaning/src/components/ui/`
- **Pattern to follow:** Look at how Properties.tsx uses tabs - apply same pattern to cleaning dashboard

---

## 📋 Full Phase 3 Breakdown

### Part 2: Cleaning Dashboard (8 pts, 3 days) - **START HERE**
- [ ] CleaningDashboard.tsx
- [ ] CleaningJobs CRUD pages
- [ ] Turnover workflow
- [ ] Worker assignment

### Part 3: Maintenance Dashboard (8 pts, 3 days)
- [ ] MaintenanceDashboard.tsx
- [ ] MaintenanceJobs CRUD pages
- [ ] Quote generation
- [ ] Cross-sell workflow (cleaner reports issue → maintenance job)

### Part 4: Mobile Worker Apps (8 pts, 3 days)
- [ ] Cleaning worker screens (job list, checklist, photo upload)
- [ ] Maintenance worker screens (job list, parts tracking)
- [ ] Offline-first worker app

### Part 5: Guest Portal & AI (6 pts, 2-3 days)
- [ ] Guest self-service portal
- [ ] AI-powered Q&A (basic)
- [ ] Issue status tracking
- [ ] AI photo analysis (optional)

### Part 6: Dashboard Switcher (Final Integration)
- [ ] Toggle between Landlord/Cleaning/Maintenance views
- [ ] Role-based access
- [ ] Integration complete

**Total Remaining:** 30 story points (~4-5 weeks)

---

## 🎯 Getting Started with Part 2

### Step 1: Review Requirements
```bash
# Read the PRD for cleaning services
cat Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md | grep -A 50 "Cleaning Services"

# Review wireframes (if they exist)
ls wireframes/CLEANING_*
```

### Step 2: Create Database Tables
```bash
# Edit Prisma schema
vim packages/database/prisma/schema.prisma

# Add:
# - CleaningJob table
# - Worker table
# - ChecklistTemplate table
# - ChecklistItem table

# Run migration
cd packages/database
npx prisma migrate dev --name add-cleaning-jobs

# Generate Prisma client
npx prisma generate
```

### Step 3: Create API Services
```bash
# Create services
touch apps/api/src/services/CleaningJobsService.ts
touch apps/api/src/services/WorkersService.ts
touch apps/api/src/services/ChecklistsService.ts

# Create routes
touch apps/api/src/routes/cleaning-jobs.ts
touch apps/api/src/routes/workers.ts
touch apps/api/src/routes/checklists.ts

# Register routes in index.ts
vim apps/api/src/index.ts
```

### Step 4: Create Frontend Pages
```bash
# Create dashboard folders
mkdir -p apps/web-cleaning/src/pages/dashboards
mkdir -p apps/web-cleaning/src/pages/cleaning

# Create pages (use Properties.tsx as template)
touch apps/web-cleaning/src/pages/dashboards/CleaningDashboard.tsx
touch apps/web-cleaning/src/pages/cleaning/CleaningJobs.tsx
touch apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx
touch apps/web-cleaning/src/pages/cleaning/CleaningJobDetails.tsx

# Add CSS
touch apps/web-cleaning/src/pages/dashboards/CleaningDashboard.css
touch apps/web-cleaning/src/pages/cleaning/CleaningJobs.css
```

### Step 5: Add TypeScript Types
```bash
# Add types to API client
vim apps/web-cleaning/src/lib/api.ts

# Add:
# - CleaningJob interface
# - Worker interface
# - ChecklistTemplate interface
# - API functions (cleaningJobsAPI, workersAPI, checklistsAPI)
```

---

## 💡 Key Patterns to Follow

### 1. Tenant Isolation (CRITICAL)
Every service must filter by tenant/service_provider:

```typescript
// In CleaningJobsService.ts
async list(tenantId: string) {
  const serviceProviderId = await this.getServiceProviderId(tenantId);

  const jobs = await prisma.cleaningJob.findMany({
    where: {
      customer: { service_provider_id: serviceProviderId }
    }
  });
}
```

### 2. Reuse Existing Components
```typescript
// In CleaningJobs.tsx
import { Button, Card, Modal, Tabs, TabPanel } from '../components/ui'
import { useToast } from '../components/ui'
```

### 3. Follow Properties.tsx Pattern
Look at how `Properties.tsx` implements:
- Loading states with `useLoading` hook
- CRUD modals
- Grid/list view toggle
- Three-tab interface
- Error handling with toasts

### 4. API Client Pattern
```typescript
// In apps/web-cleaning/src/lib/api.ts
export const cleaningJobsAPI = {
  list: async () => {
    const response = await api.get<{ data: CleaningJob[] }>('/api/cleaning-jobs')
    return response.data
  },
  create: async (data: CreateCleaningJobData) => {
    const response = await api.post<CleaningJob>('/api/cleaning-jobs', data)
    return response.data
  },
  // ... etc
}
```

---

## 📚 Reference Documents

**Primary References:**
- [PRD_V2_TWO_DASHBOARD_PLATFORM.md](Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md) - Complete requirements
- [STORY-006-wireframe-implementation.md](stories/phase-2/STORY-006-wireframe-implementation.md) - Detailed tasks
- [PHASE-2-PROGRESS.md](stories/phase-2/PHASE-2-PROGRESS.md) - What's been completed

**Code References:**
- `apps/web-cleaning/src/pages/Properties.tsx` - Layout pattern
- `apps/web-cleaning/src/components/ui/Tabs.tsx` - Tab component usage
- `apps/api/src/services/CustomersService.ts` - Service pattern
- `apps/api/src/routes/customers.ts` - Route pattern

**Wireframes (if they exist):**
- `wireframes/CLEANING_DASHBOARD_WIREFRAMES.md`
- `wireframes/MAINTENANCE_DASHBOARD_WIREFRAMES.md`

---

## ⚠️ Important Reminders

### DO NOT Touch These Files:
- ✅ `apps/web-landlord/*` - Landlord platform (keep as-is)
- ✅ Existing API routes for landlord features
- ✅ Existing database tables (properties, work_orders, etc.)

### Create NEW Files:
- ➕ New pages in `apps/web-cleaning/src/pages/cleaning/`
- ➕ New services in `apps/api/src/services/`
- ➕ New routes in `apps/api/src/routes/`
- ➕ New database tables (don't modify existing ones)

### Best Practices:
1. **Commit frequently** with clear messages referencing STORY-006
2. **Test tenant isolation** - ensure no data leaks between tenants
3. **Reuse components** - don't recreate what already exists
4. **Follow TypeScript strictly** - use Prisma-generated types
5. **Keep API server running** - restart if it crashes

---

## 🎯 Success Criteria for Part 2

When Part 2 is complete, you should have:

- [x] CleaningJob, Worker, ChecklistTemplate tables in database
- [x] API endpoints working with proper tenant isolation
- [x] Cleaning dashboard showing today's jobs
- [x] Can create/edit/delete cleaning jobs
- [x] Can assign jobs to workers
- [x] Checklist templates can be selected
- [x] All three web apps still working (landlord, cleaning, maintenance)

---

## 🚀 Ready to Start?

**Recommended First Command:**
```bash
# Review the PRD for cleaning services section
code Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md

# Then start with database schema
code packages/database/prisma/schema.prisma
```

**Questions to Answer Before Starting:**
1. What fields does a CleaningJob need?
2. What information do we need about Workers?
3. How should checklist templates be structured?
4. What's the relationship between Customer, CustomerProperty, and CleaningJob?

**Good luck building the Cleaning Services Dashboard! 🧹✨**

---

*Last Updated: 2025-11-02*
*Current Phase: Entering Phase 3 - Part 2*
*Project: RightFit Services - Multi-Tenant Service Provider Platform*
