# STORY-006: Implement New Wireframes (Service Provider Dashboards)

**Story ID:** STORY-006
**Phase:** Phase 3 Transition
**Story Points:** 40 points
**Duration:** 10-14 days
**Status:** 📋 Ready to Start
**Git Branch:** `feature/story-006-wireframes`
**Dependencies:** STORY-001 through STORY-005 complete (full Phase 2 done)

---

## 📖 Description

Implement the new two-dashboard service provider platform as defined in PRD_V2. Build Cleaning Services and Maintenance Services dashboards for web and mobile, replacing the current landlord dashboard.

**Business Context:** This is the strategic pivot from landlord SaaS to service provider platform targeting short-term let operators in rural UK.

**Reference:** [PRD_V2_TWO_DASHBOARD_PLATFORM.md](../../Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md)

---

## 🎯 Acceptance Criteria

**Web App:**
- [ ] Cleaning Services dashboard complete
- [ ] Maintenance Services dashboard complete
- [ ] Dashboard switcher implemented
- [ ] All workflows from PRD working

**Mobile App:**
- [ ] Cleaning worker mobile view
- [ ] Maintenance worker mobile view
- [ ] Checklist system working
- [ ] Photo upload workflow

**Both Platforms:**
- [ ] Database schema updated
- [ ] API endpoints implemented
- [ ] AI photo analysis integrated
- [ ] Cross-sell workflow working
- [ ] Guest portal (basic version)

---

## ✅ Tasks (High-Level)

### Part 1: Database & API (10 pts, 3-4 days)

#### 1.1 Update Database Schema
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

- [ ] Run migrations
- [ ] Seed test data

**Reference:** [PRD_V2](../../Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md) lines 1200-1350

**Commit:** `feat: add service provider database schema (STORY-006)`

#### 1.2 Create API Endpoints
- [ ] Cleaning jobs API (CRUD)
- [ ] Maintenance jobs API (CRUD)
- [ ] Workers API
- [ ] Checklists API
- [ ] Quotes API
- [ ] Customer properties API
- [ ] Guest issues API

**Commit:** `feat: add service provider API endpoints (STORY-006)`

---

### Part 2: Web - Cleaning Services Dashboard (8 pts, 3 days)

#### 2.1 Dashboard Overview
- [ ] Today's cleanings list
- [ ] Assigned vs unassigned jobs
- [ ] Worker status cards
- [ ] Quick actions (assign, schedule)

**Wireframe Reference:** PRD Section 4.1

**Commit:** `feat: add cleaning services dashboard (STORY-006)`

#### 2.2 Cleaning Job Management
- [ ] Create cleaning job
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

#### 3.1 Dashboard Overview
- [ ] Active jobs list
- [ ] Emergency vs scheduled
- [ ] Contractor availability
- [ ] Revenue/metrics

**Commit:** `feat: add maintenance services dashboard (STORY-006)`

#### 3.2 Job Management
- [ ] Create maintenance job
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

#### 4.1 Cleaning Worker App
- [ ] Today's jobs list
- [ ] Job details with checklist
- [ ] Photo upload per room
- [ ] Issue reporting
- [ ] Job completion

**Commit:** `feat: add cleaning worker mobile app (STORY-006)`

#### 4.2 Maintenance Worker App
- [ ] Assigned jobs list
- [ ] Job details
- [ ] Parts/materials tracking
- [ ] Before/after photos
- [ ] Time tracking

**Commit:** `feat: add maintenance worker mobile app (STORY-006)`

---

### Part 5: Guest Portal & AI (6 pts, 2-3 days)

#### 5.1 Guest Self-Service Dashboard (Basic)
- [ ] Report issue form
- [ ] AI-powered Q&A (basic)
- [ ] Issue status tracking
- [ ] Simple FAQ

**Commit:** `feat: add guest self-service portal (STORY-006)`

#### 5.2 AI Photo Analysis (Optional/Basic)
- [ ] Integrate Vision API (or placeholder)
- [ ] Photo quality check
- [ ] Before/after comparison
- [ ] Issue detection (basic)

**Commit:** `feat: add AI photo analysis (STORY-006)`

---

## 📁 Files to Create/Modify

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

---

## 🧪 Testing

### Web Testing
- [ ] Cleaning dashboard loads
- [ ] Can create cleaning job
- [ ] Can assign to worker
- [ ] Maintenance dashboard loads
- [ ] Can create maintenance job
- [ ] Cross-sell workflow works

### Mobile Testing
- [ ] Cleaning worker can see jobs
- [ ] Checklist works
- [ ] Photo upload works
- [ ] Issue reporting works
- [ ] Maintenance worker app works

### Integration Testing
- [ ] Cleaner reports issue → creates maintenance job
- [ ] Quote generated → customer notified
- [ ] Job completed → data syncs

---

## 📚 References

**Primary:**
- [PRD_V2_TWO_DASHBOARD_PLATFORM.md](../../Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md) - Complete PRD

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

---

## 🎯 Definition of Done

1. ✅ Database schema migrated
2. ✅ API endpoints working
3. ✅ Cleaning dashboard complete (web)
4. ✅ Maintenance dashboard complete (web)
5. ✅ Cleaning worker app complete (mobile)
6. ✅ Maintenance worker app complete (mobile)
7. ✅ Cross-sell workflow working
8. ✅ Guest portal basic version working
9. ✅ All tested on web and mobile
10. ✅ Phase 2 COMPLETE

---

## 🚀 Getting Started

```bash
# Ensure all previous stories complete (STORY-001 through STORY-005)
git checkout main
git pull origin main
git checkout -b feature/story-006-wireframes

# Start with Part 1: Database & API
# Review PRD_V2 thoroughly first
# Open Project-Plan/PRD_V2_TWO_DASHBOARD_PLATFORM.md
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
- Consider breaking into smaller sub-stories if needed
- AI photo analysis can be basic/placeholder initially
- Focus on core workflows first, polish later
