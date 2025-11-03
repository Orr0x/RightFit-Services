# 🚀 START HERE - Quick Start Guide

**Welcome to RightFit Services!**

This is your 5-minute quick start guide.

---

## ⚡ Super Quick Start

### **Step 1: Read This** (2 minutes)
You're building the maintenance workflow in the web-maintenance app.

### **Step 2: Environment Setup** (5 minutes)
```bash
npm install
cd packages/database
npx prisma generate && npx prisma migrate dev && npm run db:seed
cd ../..
npm run dev:api          # Terminal 1 - Port 3001
npm run dev:maintenance  # Terminal 2 - Port 5175
```

### **Step 3: Read the Plan** (10 minutes)
👉 **[README.md](README.md)** - Full onboarding guide
👉 **[MAINTENANCE-FIRST-SPRINT.md](MAINTENANCE-FIRST-SPRINT.md)** - Your day-by-day work plan

### **Step 4: Start Building** (Day 1)
**Task**: M-201 - Contractor Assignment API (3 points)
**File**: `apps/api/src/services/MaintenanceJobsService.ts`
**Reference**: See MAINTENANCE-FIRST-SPRINT.md → M-201 for full code

---

## 📊 What You're Building

### **Current Sprint: Maintenance Web Workflow**
**Duration**: 3-4 days (15 story points)

```
Day 1: Contractor Scheduling Backend (3 pts)
Day 2: Contractor Scheduling Frontend (3 pts)
Day 3: Job Completion Workflow (3 pts)
Day 4: Invoice & Customer Rating (6 pts)
```

### **End Goal**
Complete maintenance workflow from quote to invoice:
```
Quote Approved → Schedule Contractor → Complete Job → Generate Invoice → Customer Rates
```

---

## 🎯 Your Focus

**App**: `apps/web-maintenance` (port 5175)
**Backend**: `apps/api/src/services/MaintenanceJobsService.ts`
**Database**: Already setup ✅ (no changes needed)

---

## 📚 Essential Reading (30 minutes total)

1. **[README.md](README.md)** - Complete onboarding (10 min)
2. **[../CURRENT_STATUS.md](../CURRENT_STATUS.md)** - Project status (10 min)
3. **[MAINTENANCE-FIRST-SPRINT.md](MAINTENANCE-FIRST-SPRINT.md)** - Sprint plan (10 min)

**Reference as Needed**:
- **[APP-SEPARATION.md](APP-SEPARATION.md)** - Architecture
- **[WORK-SCHEDULING-SYSTEM.md](WORK-SCHEDULING-SYSTEM.md)** - Scheduling spec

---

## 🚦 Ready to Code?

### ✅ Prerequisites
- Node.js installed
- PostgreSQL running
- Code editor ready

### ✅ Environment Running
```bash
# Check these are running:
curl http://localhost:3001/health  # API
curl http://localhost:5175          # web-maintenance
```

### ✅ Understanding
- Read README.md ✅
- Read CURRENT_STATUS.md ✅
- Reviewed M-201 in MAINTENANCE-FIRST-SPRINT.md ✅

---

## 🎉 You're Ready!

Start building **M-201: Contractor Assignment API**

Open: `apps/api/src/services/MaintenanceJobsService.ts`

Full code examples in: **MAINTENANCE-FIRST-SPRINT.md** → M-201

**Good luck!** 💪

---

*Quick start guide - Read this first!*
*Then proceed to README.md for full onboarding*
