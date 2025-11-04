# START HERE - Active Documentation

**Last Updated**: 2025-11-04
**Current Sprint**: Business Management Sprint

---

## 🎯 Quick Navigation

### New to the Project?
1. **[../PROJECT-MAP.md](../PROJECT-MAP.md)** ⭐ **START HERE** - Complete project navigation
2. **[../CURRENT_STATUS.md](../CURRENT_STATUS.md)** - Detailed project status
3. **[../README.md](../README.md)** - Project setup instructions

### Working on Current Sprint?
4. **[BUSINESS-MANAGEMENT-SPRINT-PLAN.md](BUSINESS-MANAGEMENT-SPRINT-PLAN.md)** 🎯 **ACTIVE SPRINT**
5. **[COMPLETE-WORKFLOW-GUIDE.md](COMPLETE-WORKFLOW-GUIDE.md)** - End-to-end workflows
6. **[TECHNICAL-PATTERNS.md](TECHNICAL-PATTERNS.md)** - Code patterns
7. **[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)** - QA checklist

---

## 📚 Documentation in This Folder

### Active Sprint Plan
**[BUSINESS-MANAGEMENT-SPRINT-PLAN.md](BUSINESS-MANAGEMENT-SPRINT-PLAN.md)** ← Current focus
- **Duration**: 10-12 days
- **Story Points**: 45 points
- **Scope**: Complete business management system
- **Phases**: Properties, Customers, Invoices, Quotes, Contracts, Integration

### Reference Guides
These documents provide essential reference information:

**[CLEANING-WORKFLOW-PLAN.md](CLEANING-WORKFLOW-PLAN.md)**
- Cleaning workflow phases and architecture
- Contract-based vs per-job cleaning
- Timesheet and completion flows

**[COMPLETE-WORKFLOW-GUIDE.md](COMPLETE-WORKFLOW-GUIDE.md)**
- End-to-end business workflows
- Guest issue → Customer → Quote → Job → Invoice
- Cross-tenant Kanban card system
- Step-by-step testing guides

**[TECHNICAL-PATTERNS.md](TECHNICAL-PATTERNS.md)**
- Code patterns and best practices
- Prisma Decimal handling
- Multi-tenant data access
- Error handling patterns
- Navigation best practices

**[DEVELOPMENT-GUIDELINES.md](DEVELOPMENT-GUIDELINES.md)**
- Coding standards
- Git workflow
- AI assistant rules
- Security guidelines

**[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)**
- Manual testing procedures
- Feature testing checklists
- Integration test scenarios
- Performance testing

### Helper Files
**[INDEX.md](INDEX.md)** - Old index (may be outdated)
**[00-START-HERE.md](00-START-HERE.md)** - Old start guide (may be outdated)
**[.docs-order.txt](.docs-order.txt)** - Documentation ordering

---

## 🗃️ Archived Documentation

Completed sprints and old plans have been moved to keep this folder clean.

### Where Things Are:
- **Session summaries**: `../.docs/sessions/`
- **Completed implementations**: `../.docs/completed/`
- **Old plans**: `../.docs/archived-plans/`

See [../PROJECT-MAP.md](../PROJECT-MAP.md) for the complete archive index.

---

## 🚀 Current Sprint Overview

**Sprint**: Business Management Sprint (16 stories, 45 points)

### What We're Building

**Phase 1: Property Management** (Days 1-3)
- Add/Edit property forms with multi-section layout
- Property calendar for guest turnover tracking
- Property details page with tabs

**Phase 2: Customers & Invoices** (Days 4-6)
- Customer management (list, details, add/edit)
- Invoice management (cleaning + maintenance)
- Payment recording and PDF generation

**Phase 3: Quotes & Contracts** (Days 7-9)
- Quote management (cleaning + maintenance)
- Quote creation wizard
- Contract UX improvements

**Phase 4: Integration** (Days 10-12)
- Cross-page navigation and workflows
- Data pre-filling
- Final polish and documentation

### Database Changes
- ✅ CleaningQuote table added to schema
- ⏳ Migration needed: `npx prisma migrate dev --name add_cleaning_quotes`

---

## 📖 How to Use This Folder

### For Daily Development
1. Check [../PROJECT-MAP.md](../PROJECT-MAP.md) for current status
2. Reference [BUSINESS-MANAGEMENT-SPRINT-PLAN.md](BUSINESS-MANAGEMENT-SPRINT-PLAN.md) for your current story
3. Use [TECHNICAL-PATTERNS.md](TECHNICAL-PATTERNS.md) for code patterns
4. Check [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md) when testing

### For Understanding Workflows
1. Read [COMPLETE-WORKFLOW-GUIDE.md](COMPLETE-WORKFLOW-GUIDE.md)
2. Check [CLEANING-WORKFLOW-PLAN.md](CLEANING-WORKFLOW-PLAN.md) for cleaning-specific flows

### For Code Standards
1. Read [DEVELOPMENT-GUIDELINES.md](DEVELOPMENT-GUIDELINES.md)
2. Reference [TECHNICAL-PATTERNS.md](TECHNICAL-PATTERNS.md)

---

## 🎯 Quick Links

**Main Documentation**:
- [Project Map](../PROJECT-MAP.md) - Single source of truth
- [Current Status](../CURRENT_STATUS.md) - Detailed status
- [Project README](../README.md) - Setup instructions

**Active Work**:
- [Business Management Sprint](BUSINESS-MANAGEMENT-SPRINT-PLAN.md) - Current sprint
- [Stories](../stories/phase-3/) - Detailed stories
- [Testing](TESTING-CHECKLIST.md) - QA checklist

**Archives**:
- [Sessions](../.docs/sessions/) - Session summaries
- [Completed](../.docs/completed/) - Finished implementations
- [Archived Plans](../.docs/archived-plans/) - Old planning docs

---

**This folder contains ONLY active, current documentation.**
**For historical context, see `../.docs/`**

*Last Updated: 2025-11-04*
