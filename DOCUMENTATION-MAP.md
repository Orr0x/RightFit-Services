# 📚 Documentation Map

**Quick Navigation Guide**

---

## 🆕 New to the Project?

### **START HERE** 👉 [START-HERE/README.md](START-HERE/README.md)

This is your onboarding guide. Read it first, then follow the links in order.

---

## 📊 Project Status

**Current Phase**: Phase 3.5 COMPLETE ✅
**Sprint**: MAINTENANCE-FIRST SPRINT - **COMPLETE** (2025-11-03)
**Status**: All original stories + 8 additional features ✅

👉 **[CURRENT_STATUS.md](CURRENT_STATUS.md)** - What's built, what's next

---

## 🗺️ Completed Sprint: Maintenance-First

**Sprint**: Maintenance-First ✅ **COMPLETE**

**Original Stories** (ALL DONE):
1. ✅ M-201: Contractor Assignment API (3 pts)
2. ✅ M-202: Contractor Scheduling UI (3 pts)
3. ✅ M-301: Job Completion Modal (2 pts)
4. ✅ M-302: Photo Upload Component (1 pt)
5. ✅ M-303: Invoice Generation (4 pts)
6. ✅ M-304: Customer Rating (2 pts)

**Additional Features** (Beyond Scope):
7. ✅ Customer Dashboard Tabbed Interface
8. ✅ Notification System
9. ✅ **Cross-Tenant Kanban Card System** ⭐ (Key Innovation)
10. ✅ Clickable Job Cards with Hover Effects
11. ✅ Prisma Decimal Handling Pattern
12. ✅ View Toggle System Fix
13. ✅ Navigation Improvements
14. ✅ Complete Workflow Documentation

👉 **[START-HERE/MAINTENANCE-FIRST-SPRINT.md](START-HERE/MAINTENANCE-FIRST-SPRINT.md)**

---

## 🏗️ Architecture

**Application Structure**:
- 6 web applications (landlord, cleaning, maintenance, customer, guest)
- 1 API backend (Express + Prisma)
- Multi-tenant architecture
- PostgreSQL database

👉 **[START-HERE/APP-SEPARATION.md](START-HERE/APP-SEPARATION.md)**

---

## 📁 File Structure

```
RightFit-Services/
│
├── START-HERE/                  ⭐ START HERE FOR NEW DEVELOPERS
│   ├── README.md                   New developer onboarding
│   ├── IMPLEMENTATION-ROADMAP.md   Strategic roadmap
│   ├── MAINTENANCE-FIRST-SPRINT.md Current sprint with stories
│   ├── APP-SEPARATION.md           Application architecture
│   └── WORK-SCHEDULING-SYSTEM.md   Scheduling system spec
│
├── CURRENT_STATUS.md            ⭐ CURRENT PROJECT STATUS
├── README.md                    ⭐ PROJECT OVERVIEW
├── DOCUMENTATION-MAP.md         ⭐ YOU ARE HERE
│
├── apps/                        🚀 APPLICATION CODE
│   ├── api/                     Backend (port 3001)
│   ├── web-landlord/            Landlord app (port 5173)
│   ├── web-cleaning/            Cleaning provider (port 5174)
│   ├── web-maintenance/         Maintenance provider (port 5175) ← CURRENT FOCUS
│   ├── web-customer/            Customer portal (port 5176)
│   └── guest-tablet/            Guest tablet (port 5177)
│
├── packages/
│   └── database/                📊 PRISMA SCHEMA & MIGRATIONS
│
└── docs/                        📚 ADDITIONAL DOCUMENTATION
    ├── README.md                Documentation index
    ├── sprints/                 Sprint plans & stories
    ├── architecture/            Technical specs
    ├── analysis/                Code analysis
    └── archive/                 Historical docs
```

---

## 🎯 Quick Links by Task

### **Day 1: Backend Development**
- Read: [MAINTENANCE-FIRST-SPRINT.md](START-HERE/MAINTENANCE-FIRST-SPRINT.md) → M-201
- Edit: `apps/api/src/services/MaintenanceJobsService.ts`
- Edit: `apps/api/src/routes/maintenance-jobs.ts`

### **Day 2: Frontend Development**
- Read: [MAINTENANCE-FIRST-SPRINT.md](START-HERE/MAINTENANCE-FIRST-SPRINT.md) → M-202
- Create: `apps/web-maintenance/src/components/ContractorSchedulingModal.tsx`
- Edit: `apps/web-maintenance/src/pages/MaintenanceJobDetails.tsx`

### **Day 3: Job Completion**
- Read: [MAINTENANCE-FIRST-SPRINT.md](START-HERE/MAINTENANCE-FIRST-SPRINT.md) → M-301, M-302
- Create: `apps/web-maintenance/src/components/MaintenanceJobCompletionModal.tsx`
- Create: `apps/web-maintenance/src/components/PhotoUpload.tsx`

### **Day 4: Invoice & Rating**
- Read: [MAINTENANCE-FIRST-SPRINT.md](START-HERE/MAINTENANCE-FIRST-SPRINT.md) → M-303, M-304
- Create: `apps/api/src/services/InvoiceService.ts`
- Create: `apps/web-customer/src/components/JobRatingWidget.tsx`

---

## 🔍 Find What You Need

### **Understanding the Project**
- [README.md](README.md) - Project overview
- [CURRENT_STATUS.md](CURRENT_STATUS.md) - Current state
- [START-HERE/APP-SEPARATION.md](START-HERE/APP-SEPARATION.md) - Architecture

### **Building Features**
- [START-HERE/MAINTENANCE-FIRST-SPRINT.md](START-HERE/MAINTENANCE-FIRST-SPRINT.md) - ✅ COMPLETE with code examples
- [START-HERE/WORK-SCHEDULING-SYSTEM.md](START-HERE/WORK-SCHEDULING-SYSTEM.md) - Scheduling system spec
- [START-HERE/COMPLETE-WORKFLOW-GUIDE.md](START-HERE/COMPLETE-WORKFLOW-GUIDE.md) - ⭐ NEW: Full end-to-end workflow
- [START-HERE/TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md) - ⭐ NEW: Essential patterns & best practices

### **Strategy & Planning**
- [START-HERE/IMPLEMENTATION-ROADMAP.md](START-HERE/IMPLEMENTATION-ROADMAP.md) - Web-first, maintenance-first strategy

### **Historical Context**
- [docs/archive/](docs/archive/) - Old plans and completed phases

---

## 💡 Documentation Rules

### ✅ Always Current
- `CURRENT_STATUS.md` - Updated after each sprint
- `START-HERE/*` - Essential onboarding docs
- `docs/sprints/` - Current sprint plans only

### 🗄️ Archive When Done
- Completed sprint plans → `docs/archive/`
- Old phase plans → `docs/archive/`
- Superseded docs → `docs/archive/`

### 🚫 Never Delete
- Keep all historical docs in `docs/archive/`
- Useful for understanding past decisions

---

## 🎓 Learning Path

**For New Developers**:
1. Read [START-HERE/README.md](START-HERE/README.md) (10 min)
2. Read [CURRENT_STATUS.md](CURRENT_STATUS.md) (10 min) - See what's been completed
3. Read [START-HERE/COMPLETE-WORKFLOW-GUIDE.md](START-HERE/COMPLETE-WORKFLOW-GUIDE.md) (20 min) - Understand the full workflow
4. Read [START-HERE/TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md) (15 min) - **CRITICAL** patterns to follow
5. Read [START-HERE/IMPLEMENTATION-ROADMAP.md](START-HERE/IMPLEMENTATION-ROADMAP.md) (5 min) - Strategy context
6. Start building next feature! 🚀

**For Experienced Developers**:
1. Read [CURRENT_STATUS.md](CURRENT_STATUS.md) (5 min) - See sprint completion
2. Skim [START-HERE/COMPLETE-WORKFLOW-GUIDE.md](START-HERE/COMPLETE-WORKFLOW-GUIDE.md) (10 min) - Understand workflow
3. Read [START-HERE/TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md) (10 min) - **Must read** for Decimal handling
4. Start building 🚀

---

## 📞 Need Help?

- **Where am I?** → Read [CURRENT_STATUS.md](CURRENT_STATUS.md)
- **What do I build?** → Read [START-HERE/MAINTENANCE-FIRST-SPRINT.md](START-HERE/MAINTENANCE-FIRST-SPRINT.md)
- **How does it work?** → Read [START-HERE/APP-SEPARATION.md](START-HERE/APP-SEPARATION.md)
- **Still confused?** → Read [START-HERE/README.md](START-HERE/README.md) from the beginning

---

**You're all set!** Everything you need is in this project. 🎉

*Documentation organized: 2025-11-02*
*Clean, focused, no unnecessary context* ✨
