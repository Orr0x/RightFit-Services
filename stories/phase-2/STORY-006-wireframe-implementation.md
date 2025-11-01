# STORY-006: Implement New Wireframes (Service Provider Dashboards)

**Story ID:** STORY-006
**Phase:** Phase 3 Transition
**Story Points:** 40 points
**Duration:** 10-14 days
**Status:** 📋 Ready to Start
**Git Branch:** `feature/story-006-wireframes`
**Dependencies:** STORY-001 through STORY-005 complete (full Phase 2 done)

---

## 🚨 CRITICAL: DO NOT REPLACE EXISTING SYSTEM

**⚠️ IMPORTANT FOR FUTURE DEVELOPERS:**

This story implements **NEW, ADDITIONAL** functionality alongside the existing landlord platform. The current landlord web app and mobile app are **FULLY FUNCTIONAL** and must remain operational.

**What to KEEP (Do NOT touch):**
- ✅ Existing landlord web dashboard (Properties, Work Orders, Contractors, Certificates, Financial, Tenants)
- ✅ Existing landlord mobile app (all 12 screens from STORY-003)
- ✅ All current API endpoints for landlord functionality
- ✅ Database tables: properties, work_orders, contractors, certificates, tenants, users
- ✅ Offline-first WatermelonDB sync system
- ✅ Design system and UI components (use these as reference!)

**What to ADD (New functionality):**
- ➕ NEW Cleaning Services dashboard (web + mobile)
- ➕ NEW Maintenance Services dashboard (web + mobile)
- ➕ NEW database tables (see schema section)
- ➕ NEW API endpoints for service provider workflows
- ➕ NEW worker mobile apps (cleaning workers, maintenance workers)
- ➕ NEW guest portal
- ➕ Dashboard switcher to toggle between landlord/cleaning/maintenance views

**Why Keep Both Systems:**
1. The landlord platform is production-ready and working perfectly
2. It serves as a **code reference** for patterns, components, and architecture
3. The service provider platform will be **integrated later** via dashboard switcher
4. Both systems will share the same design system and components

**Implementation Strategy:**
- Build service provider features in **new files/folders** alongside existing code
- Reuse existing components from `apps/web/src/components/ui/` and `apps/mobile/src/components/ui/`
- Follow the same patterns used in landlord features (see STORY-001 through STORY-005 for examples)
- Create new navigation routes without removing landlord routes

---

## 📖 Description

Implement the new two-dashboard service provider platform as defined in PRD_V2. Build Cleaning Services and Maintenance Services dashboards for web and mobile as **ADDITIONS** to the existing landlord platform.

**Business Context:** This is the strategic pivot from landlord SaaS to service provider platform targeting short-term let operators in rural UK.

**Reference:** [PRD_V2_TWO_DASHBOARD_PLATFORM.md](../../Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md)

---

## 🎯 Acceptance Criteria

**Web App:**
- [ ] Cleaning Services dashboard complete (**NEW** page, does not replace existing)
- [ ] Maintenance Services dashboard complete (**NEW** page, does not replace existing)
- [ ] Dashboard switcher implemented (toggle between Landlord/Cleaning/Maintenance)
- [ ] All workflows from PRD working
- [ ] **Existing landlord dashboard still fully functional**

**Mobile App:**
- [ ] Cleaning worker mobile view (**NEW** screens)
- [ ] Maintenance worker mobile view (**NEW** screens)
- [ ] Checklist system working
- [ ] Photo upload workflow
- [ ] **Existing landlord mobile app still fully functional**

**Both Platforms:**
- [ ] Database schema updated (**NEW** tables added, existing tables unchanged)
- [ ] API endpoints implemented (**NEW** routes added)
- [ ] AI photo analysis integrated
- [ ] Cross-sell workflow working
- [ ] Guest portal (basic version)

---

## ✅ Tasks (High-Level)

### Part 1: Database & API (10 pts, 3-4 days)

#### 1.1 Update Database Schema

**⚠️ IMPORTANT:** Add NEW tables alongside existing ones. Do NOT modify or remove:
- properties
- work_orders
- contractors
- certificates
- tenants
- users
- (All existing tables from landlord platform)

- [ ] Add new tables (per PRD schema):
  - ServiceProvider
  - Service
  - Customer
  - Worker
  - ExternalContractor
  - CleaningJob
  - MaintenanceJob
  - Quote
  - ChecklistTemplate
  - ChecklistItem
  - GuestIssueReport

- [ ] Run migrations (ensure backward compatibility)
- [ ] Seed test data

**Reference:** [PRD_V2](../../Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md) lines 1200-1350

**Commit:** `feat: add service provider database schema (STORY-006)`

#### 1.2 Create API Endpoints

**⚠️ IMPORTANT:** Add NEW endpoints alongside existing ones. Do NOT modify:
- /api/properties
- /api/work-orders
- /api/contractors
- /api/certificates
- /api/tenants
- (All existing landlord API routes)

- [ ] Cleaning jobs API (CRUD) - **NEW** `/api/cleaning-jobs`
- [ ] Maintenance jobs API (CRUD) - **NEW** `/api/maintenance-jobs`
- [ ] Workers API - **NEW** `/api/workers`
- [ ] Checklists API - **NEW** `/api/checklists`
- [ ] Quotes API - **NEW** `/api/quotes`
- [ ] Customer properties API - **NEW** `/api/customer-portal/properties`
- [ ] Guest issues API - **NEW** `/api/guest-issues`

**Commit:** `feat: add service provider API endpoints (STORY-006)`

---

### Part 2: Web - Cleaning Services Dashboard (8 pts, 3 days)

**⚠️ IMPORTANT:** Create NEW pages, do NOT modify existing landlord pages.

**Code Reference:** Use existing landlord pages as templates:
- `apps/web/src/pages/Properties.tsx` - for layout patterns
- `apps/web/src/pages/WorkOrders.tsx` - for CRUD operations
- `apps/web/src/components/ui/` - reuse all components

#### 2.1 Dashboard Overview

- [ ] Create **NEW** `apps/web/src/pages/dashboards/CleaningDashboard.tsx`
- [ ] Today's cleanings list
- [ ] Assigned vs unassigned jobs
- [ ] Worker status cards
- [ ] Quick actions (assign, schedule)

**Wireframe Reference:** PRD Section 4.1 and [wireframes/CLEANING_DASHBOARD_WIREFRAMES.md](../../wireframes/CLEANING_DASHBOARD_WIREFRAMES.md)

**Commit:** `feat: add cleaning services dashboard (STORY-006)`

#### 2.2 Cleaning Job Management

- [ ] Create **NEW** `apps/web/src/pages/cleaning/CleaningJobs.tsx`
- [ ] Create **NEW** `apps/web/src/pages/cleaning/CreateCleaningJob.tsx`
- [ ] Create **NEW** `apps/web/src/pages/cleaning/CleaningJobDetails.tsx`
- [ ] Assign to worker
- [ ] Checklist template selection
- [ ] Photo requirements setup

**Commit:** `feat: add cleaning job management (STORY-006)`

#### 2.3 Turnover Workflow

- [ ] Worker marks checklist items
- [ ] Photo upload for each room
- [ ] Issue reporting (triggers maintenance upsell)
- [ ] Completion workflow

**Commit:** `feat: add turnover cleaning workflow (STORY-006)`

---

### Part 3: Web - Maintenance Services Dashboard (8 pts, 3 days)

**⚠️ IMPORTANT:** Create NEW pages, do NOT modify existing landlord pages.

#### 3.1 Dashboard Overview

- [ ] Create **NEW** `apps/web/src/pages/dashboards/MaintenanceDashboard.tsx`
- [ ] Active jobs list
- [ ] Emergency vs scheduled
- [ ] Contractor availability
- [ ] Revenue/metrics

**Wireframe Reference:** [wireframes/MAINTENANCE_DASHBOARD_WIREFRAMES.md](../../wireframes/MAINTENANCE_DASHBOARD_WIREFRAMES.md)

**Commit:** `feat: add maintenance services dashboard (STORY-006)`

#### 3.2 Job Management

- [ ] Create **NEW** `apps/web/src/pages/maintenance/MaintenanceJobs.tsx`
- [ ] Create **NEW** `apps/web/src/pages/maintenance/CreateMaintenanceJob.tsx`
- [ ] Create **NEW** `apps/web/src/pages/maintenance/MaintenanceJobDetails.tsx`
- [ ] Assign to internal worker or external contractor
- [ ] Quote creation
- [ ] Customer approval workflow

**Commit:** `feat: add maintenance job management (STORY-006)`

#### 3.3 Cross-Sell Integration

- [ ] Cleaner reports issue → creates maintenance job
- [ ] Quote generation
- [ ] Customer notification
- [ ] Upsell tracking

**Commit:** `feat: add cross-sell workflow (STORY-006)`

---

### Part 4: Mobile - Worker Apps (8 pts, 3 days)

**⚠️ IMPORTANT:** Create NEW screens, do NOT modify existing landlord mobile screens.

**Code Reference:** Use existing landlord mobile screens as templates:
- `apps/mobile/src/screens/properties/PropertiesListScreen.tsx`
- `apps/mobile/src/screens/workOrders/WorkOrdersListScreen.tsx`
- `apps/mobile/src/components/ui/` - reuse all components
- Offline-first patterns from existing screens

#### 4.1 Cleaning Worker App

- [ ] Create **NEW** `apps/mobile/src/screens/cleaning/CleaningJobsListScreen.tsx`
- [ ] Create **NEW** `apps/mobile/src/screens/cleaning/CleaningJobDetailsScreen.tsx`
- [ ] Create **NEW** `apps/mobile/src/screens/cleaning/ChecklistScreen.tsx`
- [ ] Today's jobs list
- [ ] Job details with checklist
- [ ] Photo upload per room
- [ ] Issue reporting
- [ ] Job completion

**Commit:** `feat: add cleaning worker mobile app (STORY-006)`

#### 4.2 Maintenance Worker App

- [ ] Create **NEW** `apps/mobile/src/screens/maintenance/MaintenanceJobsListScreen.tsx`
- [ ] Create **NEW** `apps/mobile/src/screens/maintenance/MaintenanceJobDetailsScreen.tsx`
- [ ] Assigned jobs list
- [ ] Job details
- [ ] Parts/materials tracking
- [ ] Before/after photos
- [ ] Time tracking

**Commit:** `feat: add maintenance worker mobile app (STORY-006)`

---

### Part 5: Guest Portal & AI (6 pts, 2-3 days)

#### 5.1 Guest Self-Service Dashboard (Basic)

- [ ] Create **NEW** `apps/web/src/pages/guest/GuestPortal.tsx`
- [ ] Report issue form
- [ ] AI-powered Q&A (basic)
- [ ] Issue status tracking
- [ ] Simple FAQ

**Wireframe Reference:** [wireframes/GUEST_AI_DASHBOARD_WIREFRAMES.md](../../wireframes/GUEST_AI_DASHBOARD_WIREFRAMES.md)

**Commit:** `feat: add guest self-service portal (STORY-006)`

#### 5.2 AI Photo Analysis (Optional/Basic)

- [ ] Integrate Vision API (or placeholder)
- [ ] Photo quality check
- [ ] Before/after comparison
- [ ] Issue detection (basic)

**Commit:** `feat: add AI photo analysis (STORY-006)`

---

### Part 6: Dashboard Switcher Integration (FINAL STEP)

**⚠️ This is how the two systems connect:**

- [ ] Create **NEW** `apps/web/src/pages/dashboards/DashboardSwitcher.tsx`
- [ ] Dropdown/tabs to switch between:
  - Landlord Dashboard (existing pages)
  - Cleaning Dashboard (new pages)
  - Maintenance Dashboard (new pages)
- [ ] User role determines available dashboards
- [ ] State persists in localStorage

**Commit:** `feat: add dashboard switcher (STORY-006)`

---

## 📁 Files to Create/Modify

### NEW Files (Create these)

```
apps/web/src/
├── pages/
│   ├── dashboards/
│   │   ├── CleaningDashboard.tsx           # NEW
│   │   ├── MaintenanceDashboard.tsx        # NEW
│   │   └── DashboardSwitcher.tsx           # NEW
│   ├── cleaning/
│   │   ├── CleaningJobs.tsx                # NEW
│   │   ├── CreateCleaningJob.tsx           # NEW
│   │   └── CleaningJobDetails.tsx          # NEW
│   ├── maintenance/
│   │   ├── MaintenanceJobs.tsx             # NEW
│   │   ├── CreateMaintenanceJob.tsx        # NEW
│   │   └── MaintenanceJobDetails.tsx       # NEW
│   └── guest/
│       └── GuestPortal.tsx                 # NEW

apps/mobile/src/
├── screens/
│   ├── cleaning/
│   │   ├── CleaningJobsListScreen.tsx      # NEW
│   │   ├── CleaningJobDetailsScreen.tsx    # NEW
│   │   └── ChecklistScreen.tsx             # NEW
│   └── maintenance/
│       ├── MaintenanceJobsListScreen.tsx   # NEW
│       └── MaintenanceJobDetailsScreen.tsx # NEW

apps/api/src/
├── routes/
│   ├── cleaning-jobs.ts                    # NEW
│   ├── maintenance-jobs.ts                 # NEW
│   ├── workers.ts                          # NEW
│   ├── checklists.ts                       # NEW
│   └── guest-issues.ts                     # NEW
└── services/
    ├── CleaningJobsService.ts              # NEW
    ├── MaintenanceJobsService.ts           # NEW
    └── AIPhotoService.ts                   # NEW (optional)
```

### EXISTING Files (KEEP - Use as Reference)

```
apps/web/src/pages/
├── Properties.tsx                          # ✅ KEEP - Use as reference
├── WorkOrders.tsx                          # ✅ KEEP - Use as reference
├── Contractors.tsx                         # ✅ KEEP - Use as reference
├── Certificates.tsx                        # ✅ KEEP - Use as reference
├── Financial.tsx                           # ✅ KEEP - Use as reference
└── Tenants.tsx                             # ✅ KEEP - Use as reference

apps/mobile/src/screens/
├── properties/
│   ├── PropertiesListScreen.tsx            # ✅ KEEP - Use as reference
│   ├── PropertyDetailsScreen.tsx           # ✅ KEEP - Use as reference
│   └── CreatePropertyScreen.tsx            # ✅ KEEP - Use as reference
├── workOrders/
│   ├── WorkOrdersListScreen.tsx            # ✅ KEEP - Use as reference
│   ├── WorkOrderDetailsScreen.tsx          # ✅ KEEP - Use as reference
│   └── CreateWorkOrderScreen.tsx           # ✅ KEEP - Use as reference
└── (all other existing screens)            # ✅ KEEP - Working perfectly

apps/web/src/components/ui/                 # ✅ REUSE - All components
apps/mobile/src/components/ui/              # ✅ REUSE - All components
```

---

## 🧪 Testing

### Web Testing
- [ ] Cleaning dashboard loads
- [ ] Can create cleaning job
- [ ] Can assign to worker
- [ ] Maintenance dashboard loads
- [ ] Can create maintenance job
- [ ] Cross-sell workflow works
- [ ] **Landlord dashboard still works (Properties, Work Orders, etc.)**

### Mobile Testing
- [ ] Cleaning worker can see jobs
- [ ] Checklist works
- [ ] Photo upload works
- [ ] Issue reporting works
- [ ] Maintenance worker app works
- [ ] **Landlord mobile app still works (all 12 screens)**

### Integration Testing
- [ ] Cleaner reports issue → creates maintenance job
- [ ] Quote generated → customer notified
- [ ] Job completed → data syncs
- [ ] **Both landlord and service provider systems work together**

---

## 📚 References

**Primary:**
- [PRD_V2_TWO_DASHBOARD_PLATFORM.md](../../Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md) - Complete PRD

**Wireframes:**
- [CLEANING_DASHBOARD_WIREFRAMES.md](../../wireframes/CLEANING_DASHBOARD_WIREFRAMES.md)
- [MAINTENANCE_DASHBOARD_WIREFRAMES.md](../../wireframes/MAINTENANCE_DASHBOARD_WIREFRAMES.md)
- [CUSTOMER_PORTAL_WIREFRAMES.md](../../wireframes/CUSTOMER_PORTAL_WIREFRAMES.md)
- [GUEST_AI_DASHBOARD_WIREFRAMES.md](../../wireframes/GUEST_AI_DASHBOARD_WIREFRAMES.md)

**User Personas:**
- Alex (Platform Owner) - lines 52-77
- Sarah (Cleaner) - lines 79-101
- Mike (Maintenance Worker) - lines 103-125
- John (External Contractor) - lines 127-149

**Workflows:**
- Cleaning Turnover - lines 151-255
- Emergency Maintenance - lines 257-361
- Cross-Sell - lines 363-459
- Guest Issue Reporting - lines 461-540

**Database Schema:**
- Tables - lines 1200-1350

**API Endpoints:**
- REST structure - lines 1352-1450

**Code References (Use these as templates):**
- Completed Stories: STORY-001 through STORY-005
- Web patterns: `apps/web/src/pages/*.tsx`
- Mobile patterns: `apps/mobile/src/screens/*/*.tsx`
- Components: `apps/web/src/components/ui/` and `apps/mobile/src/components/ui/`
- Offline-first patterns: Existing mobile screens using WatermelonDB

---

## 🎯 Definition of Done

1. ✅ Database schema migrated (**NEW** tables added)
2. ✅ API endpoints working (**NEW** routes added)
3. ✅ Cleaning dashboard complete (web) (**NEW** pages)
4. ✅ Maintenance dashboard complete (web) (**NEW** pages)
5. ✅ Cleaning worker app complete (mobile) (**NEW** screens)
6. ✅ Maintenance worker app complete (mobile) (**NEW** screens)
7. ✅ Cross-sell workflow working
8. ✅ Guest portal basic version working
9. ✅ Dashboard switcher functional
10. ✅ **All existing landlord features still work (web + mobile)**
11. ✅ All tested on web and mobile
12. ✅ Phase 2 COMPLETE

---

## 🚀 Getting Started

```bash
# Ensure all previous stories complete (STORY-001 through STORY-005)
git checkout main
git pull origin main
git checkout -b feature/story-006-wireframes

# Review existing landlord platform first!
# Open and study these files as references:
# - apps/web/src/pages/Properties.tsx
# - apps/web/src/pages/WorkOrders.tsx
# - apps/mobile/src/screens/properties/PropertiesListScreen.tsx
# - apps/mobile/src/screens/workOrders/WorkOrdersListScreen.tsx

# Review PRD_V2 thoroughly
# Open Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md

# Start with Part 1: Database & API
# Add NEW tables alongside existing ones
```

**When complete:**

```bash
git add .
git commit -m "feat: complete service provider wireframes (STORY-006)"
git push origin feature/story-006-wireframes

# PHASE 2 COMPLETE! 🎉
# Move to Phase 3: Feature Completeness
```

---

**Story Created:** 2025-10-31
**Status:** 📋 Ready
**Estimated Duration:** 10-14 days

**Important Notes:**
- This is the largest and most complex story
- Requires thorough PRD_V2 review before starting
- **Study existing landlord platform code before writing new code**
- Reuse components and patterns from STORY-001 through STORY-005
- Consider breaking into smaller sub-stories if needed
- AI photo analysis can be basic/placeholder initially
- Focus on core workflows first, polish later
- **Keep both systems fully functional - they will be integrated via dashboard switcher**
