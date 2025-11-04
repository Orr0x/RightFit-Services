# 🗺️ RightFit Services - Project Navigation Map

**Last Updated**: 2025-11-04 (After Code Review)
**Current Phase**: Business Management Sprint - Implementation Starting

---

## 📍 Where Are We?

**Current Status**: [CURRENT_STATUS.md](CURRENT_STATUS.md)

**Phase**: Phase 3 (85% complete) + **Business Management Sprint** (Code Review Complete, Starting Implementation)

**What's Working**:
✅ Cleaning job timesheet & completion workflow
✅ Maintenance job quote workflow (end-to-end tested)
✅ Worker profile management (frontend complete)
✅ Job & Property history tracking (live and functional)
✅ Global activity feed
✅ Customer portal with guest AI dashboard
✅ **Property guest turnover calendar** (FULLY IMPLEMENTED)
✅ **Property details page** (FULLY FUNCTIONAL)
✅ **Cleaning contracts page** (FUNCTIONAL, needs minor polish)

**Next Up**: Business Management Sprint Implementation (10-11 days, 42 story points)

---

## 🎯 Active Sprint: Business Management (REVISED)

**Sprint Plan**: [START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md](START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md)
**Code Review**: [START-HERE/CODE-REVIEW-FINDINGS.md](START-HERE/CODE-REVIEW-FINDINGS.md)

### Code Review Results ✅
**Completed Code Review on 2025-11-04**
- Discovered PM-003 (Property Calendar) is **FULLY IMPLEMENTED**
- Discovered INT-002 (Property Details) is **FULLY FUNCTIONAL**
- Discovered CON-001 (Contracts) is **90% COMPLETE**
- Identified missing backend services for CleaningInvoice and CleaningQuote
- Revised sprint from 45 points to **42 points** (more accurate scope)

### Revised Sprint Plan (14 Stories, 42 Points)

**Phase 1: Property Forms** (Days 1-2, 9 pts)
- ❌ PM-001: Add Property Form (5 pts) - Full implementation needed
- ❌ PM-002: Edit Property Form (4 pts) - Full implementation needed
- ~~✅ PM-003: Property Calendar (REMOVED - already done)~~
- ~~✅ INT-002: Property Details (REMOVED - already done)~~

**Phase 2: Cleaning Business Backend** (Days 3-4, 8 pts)
- ❌ Create CleaningInvoiceService (2 pts)
- ❌ Create cleaning-invoices routes (2 pts)
- ❌ Create CleaningQuoteService (2 pts)
- ❌ Create cleaning-quotes routes (2 pts)

**Phase 3: Customer Management** (Days 5-6, 9 pts)
- ❌ CM-001: Customers Page (3 pts)
- ❌ CM-002: Customer Details Page (4 pts)
- ❌ CM-003: Add/Edit Customer Forms (2 pts)

**Phase 4: Invoices & Quotes** (Days 7-9, 14 pts)
- ❌ INV-001: Invoices Page (5 pts ↑) - Combined view + API integration
- ❌ INV-002: Invoice Details Page (3 pts)
- ❌ QT-001: Quotes Page (5 pts ↑) - Combined view + API integration
- ❌ QT-002: Quote Details Page (3 pts)
- ❌ QT-003: Create Quote Wizard (3 pts)

**Phase 5: Polish & Integration** (Days 10-11, 2 pts)
- 🔧 CON-001: Contract UX Polish (1 pt ↓) - Just polish
- ❌ INT-003: Documentation & Testing (1 pt)

### Key Changes from Original Plan
- **Points Saved**: 6 points (PM-003, INT-002, partial CON-001/CON-002)
- **Points Added**: 4 points (INV-001 +2, QT-001 +2 for backend work)
- **Net Change**: -3 points, better scoped to actual work needed
- **Duration**: 10-11 days (reduced from 10-12 days)

### Database Changes
✅ **CleaningQuote table added** to schema
⏳ **Migration needed**: `cd packages/database && npx prisma migrate dev --name add_cleaning_quotes`

---

## 📚 Essential Documentation

### Start Here
1. **[PROJECT-MAP.md](PROJECT-MAP.md)** ← You are here
2. **[CURRENT_STATUS.md](CURRENT_STATUS.md)** - Detailed project status
3. **[README.md](README.md)** - Project setup and overview

### Active Plans & Guides
Location: [START-HERE/](START-HERE/)

**Current Sprint**:
- 🎯 [BUSINESS-MANAGEMENT-SPRINT-PLAN.md](START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md) - **ACTIVE PLAN**

**Reference Guides**:
- [CLEANING-WORKFLOW-PLAN.md](START-HERE/CLEANING-WORKFLOW-PLAN.md) - Cleaning workflow phases
- [COMPLETE-WORKFLOW-GUIDE.md](START-HERE/COMPLETE-WORKFLOW-GUIDE.md) - End-to-end workflows
- [TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md) - Code patterns & best practices
- [DEVELOPMENT-GUIDELINES.md](START-HERE/DEVELOPMENT-GUIDELINES.md) - Coding standards
- [TESTING-CHECKLIST.md](START-HERE/TESTING-CHECKLIST.md) - QA checklist

### Stories
Location: [stories/](stories/)

**Phase 2**: Customer Portal & Guest AI Dashboard
**Phase 3**: Job Management & Business Operations
- [STORY-PM-001-property-management.md](stories/phase-3/STORY-PM-001-property-management.md) - Property Add/Edit forms (detailed)
- [STORY-WM-001-worker-profile-management.md](stories/phase-3/STORY-WM-001-worker-profile-management.md) - Worker profiles

---

## 🗃️ Archived Documentation

### Completed Sessions
Location: [.docs/sessions/](.docs/sessions/)
- Session summaries (2025-11-03, 2025-11-04)
- Sprint completion reports
- Portal fixes and outstanding work logs

### Completed Implementations
Location: [.docs/completed/](.docs/completed/)
- Job History Implementation
- Property History Implementation
- Worker History Implementation
- Drag & Drop Calendar
- Quick Edit Calendar
- Cleaning Job Form Improvements
- Maintenance Issue Tracking

### Archived Plans
Location: [.docs/archived-plans/](.docs/archived-plans/)
- Maintenance-First Sprint (completed)
- Property-Contract Management Plan (superseded)
- Implementation Roadmap (outdated)
- Work Scheduling System (future)
- Worker App Plan (future)
- Property & Maintenance Features (reference)
- App Separation (completed)

---

## 🏗️ Application Architecture

### Running Applications
```bash
# API Server
npm run dev:api          # Port 3001

# Landlord Platform
npm run dev:landlord     # Port 5173

# Service Dashboards
npm run dev:cleaning     # Port 5174 ← Current focus
npm run dev:maintenance  # Port 5175

# Customer Portal
npm run dev:customer     # Port 5176

# Guest Tablet
npm run dev:guest        # Port 5177
```

### Tech Stack
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom component library
- **UI Components**: Material-UI icons, custom components

---

## 🔄 Data Model Overview

### Customer Relationships
```
Customer (1) → (Many) CustomerProperty
Customer (1) → (Many) CleaningContract
Customer (1) → (Many) CleaningInvoice
Customer (1) → (Many) Invoice (maintenance)
Customer (1) → (Many) Quote (maintenance)
Customer (1) → (Many) CleaningQuote ← NEW

CleaningContract (1) → (Many) ContractProperty
CleaningContract (1) → (Many) CleaningJob
CleaningContract (1) → (Many) CleaningInvoice

CustomerProperty (1) → (Many) CleaningJob
CustomerProperty (1) → (Many) MaintenanceJob
CustomerProperty (1) → (Many) PropertyCalendar ← For turnover tracking
```

### Contract Types
- **FLAT_MONTHLY**: Single monthly fee for all properties
- **PER_PROPERTY**: Individual fee per property (sum = total)

---

## 📋 Quick Actions

### For Development
1. **Check current status**: Read [CURRENT_STATUS.md](CURRENT_STATUS.md)
2. **View active plan**: Read [START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md](START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md)
3. **Find a story**: Browse [stories/phase-3/](stories/phase-3/)
4. **Check patterns**: Reference [START-HERE/TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md)

### For Testing
1. **Run apps**: Use npm scripts above
2. **Check tests**: Review [START-HERE/TESTING-CHECKLIST.md](START-HERE/TESTING-CHECKLIST.md)
3. **Test workflows**: Follow [START-HERE/COMPLETE-WORKFLOW-GUIDE.md](START-HERE/COMPLETE-WORKFLOW-GUIDE.md)

### For Planning
1. **Review roadmap**: Check [CURRENT_STATUS.md](CURRENT_STATUS.md) → "What's Next?"
2. **Check backlog**: Review archived plans in [.docs/archived-plans/](.docs/archived-plans/)
3. **See history**: Browse [.docs/sessions/](.docs/sessions/) and [.docs/completed/](.docs/completed/)

---

## 🎯 Current Sprint Progress

### Phase 1: Property Management (Days 1-3)
- [ ] PM-001: Add Property Form (2 days, 5 points)
- [ ] PM-002: Edit Property Form (1 day, 4 points)
- [ ] PM-003: Property Calendar UI (1.5 days, 4 points)

**Status**: Planning complete, ready to start implementation

**Next Action**: Run database migration for CleaningQuote table

---

## 💡 Tips for Navigation

**Looking for...**
- **Current work?** → [CURRENT_STATUS.md](CURRENT_STATUS.md)
- **Active plan?** → [START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md](START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md)
- **How to code?** → [START-HERE/TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md)
- **Testing?** → [START-HERE/TESTING-CHECKLIST.md](START-HERE/TESTING-CHECKLIST.md)
- **Workflows?** → [START-HERE/COMPLETE-WORKFLOW-GUIDE.md](START-HERE/COMPLETE-WORKFLOW-GUIDE.md)
- **Old docs?** → [.docs/](.docs/) (sessions, completed, archived)
- **Stories?** → [stories/phase-3/](stories/phase-3/)

---

## 📊 Project Stats

**Overall Completion**: ~90%
- Phase 1: Foundation ✅ 100%
- Phase 2: Customer Portal ✅ 100%
- Phase 2.5: Guest AI Dashboard ✅ 100%
- Phase 3: Job Management 🔨 85%
- **NEW: Business Management Sprint** 🎯 0% (Planning complete)
- Phase 4: Mobile Apps ❌ 0%

**Lines of Code**: ~50,000+
**Database Tables**: 40+ tables
**API Endpoints**: 100+ endpoints
**Frontend Pages**: 30+ pages
**Stories Completed**: 50+ stories

---

*This is your single source of truth for navigating the RightFit Services project.*
*Bookmark this page!*

**Last Updated**: 2025-11-04
