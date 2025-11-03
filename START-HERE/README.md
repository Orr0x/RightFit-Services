# START HERE - New Developer Onboarding

**Welcome to RightFit Services!** This folder contains everything you need to get started.

---

## 📚 Read These In Order

### 1. **[CURRENT_STATUS.md](../CURRENT_STATUS.md)** ⭐ START HERE
**What**: Current state of the project, what's built, what's next
**Why**: Understand where we are and what's already working
**Time**: 10 minutes

### 2. **[IMPLEMENTATION-ROADMAP.md](IMPLEMENTATION-ROADMAP.md)** 🗺️
**What**: Strategic roadmap (Web-First, Maintenance-First approach)
**Why**: Understand the implementation strategy and timeline
**Time**: 5 minutes

### 3. **[MAINTENANCE-FIRST-SPRINT.md](MAINTENANCE-FIRST-SPRINT.md)** 🎯
**What**: Detailed sprint plan with stories (M-201 through M-304)
**Why**: Your day-to-day work plan with code examples
**Time**: 15 minutes (reference as needed)

### 4. **[APP-SEPARATION.md](APP-SEPARATION.md)** 🏗️
**What**: Application architecture and separation of concerns
**Why**: Understand which app does what and how they interact
**Time**: 10 minutes

### 5. **[WORK-SCHEDULING-SYSTEM.md](WORK-SCHEDULING-SYSTEM.md)** ⏰
**What**: Technical specification for scheduling and assignment
**Why**: Understand the scheduling system architecture
**Time**: 10 minutes (reference as needed)

---

## 🚀 Quick Start (Day 1)

### Morning: Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Database setup
cd packages/database
npx prisma generate
npx prisma migrate dev
npm run db:seed

# 3. Start all services
cd ../..
npm run dev:api          # Terminal 1 - Port 3001
npm run dev:maintenance  # Terminal 2 - Port 5175
npm run dev:customer     # Terminal 3 - Port 5176
```

### Afternoon: Start Building M-201

**Task**: Contractor Assignment API (3 points)

**Files to edit**:
- `apps/api/src/services/MaintenanceJobsService.ts`
- `apps/api/src/routes/maintenance-jobs.ts`

**Reference**: See MAINTENANCE-FIRST-SPRINT.md → M-201 for full code examples

---

## 📁 Project Structure

```
RightFit-Services/
├── START-HERE/              ← You are here!
│   ├── README.md            ← This file
│   ├── IMPLEMENTATION-ROADMAP.md
│   ├── MAINTENANCE-FIRST-SPRINT.md
│   ├── APP-SEPARATION.md
│   └── WORK-SCHEDULING-SYSTEM.md
│
├── apps/
│   ├── api/                 ← Backend (Express) - Port 3001
│   ├── web-landlord/        ← Property management - Port 5173
│   ├── web-cleaning/        ← Cleaning provider - Port 5174
│   ├── web-maintenance/     ← Maintenance provider - Port 5175 ⭐ CURRENT FOCUS
│   ├── web-customer/        ← Customer portal - Port 5176
│   └── guest-tablet/        ← Guest tablet - Port 5177
│
├── packages/
│   └── database/            ← Prisma schema, migrations, seed
│
├── docs/
│   ├── sprints/             ← Sprint planning documents
│   ├── architecture/        ← Architecture documentation
│   └── archive/             ← Old/outdated documentation
│
├── CURRENT_STATUS.md        ← ⭐ Project status overview
└── README.md                ← ⭐ Project README
```

---

## 🎯 Current Focus: Phase 3A - Maintenance Web

**Goal**: Complete maintenance workflow in web-maintenance app

**Timeline**: 3-4 days (Day 1-4)

**Stories**:
1. **Day 1**: M-201 (Contractor Assignment API) - 3 pts
2. **Day 2**: M-202 (Contractor Scheduling UI) - 3 pts
3. **Day 3**: M-302 (Photo Upload) + M-301 (Job Completion) - 3 pts
4. **Day 4**: M-303 (Invoice Generation) + M-304 (Customer Rating) - 6 pts

**After Maintenance**: Replicate to cleaning (1-2 days)

---

## 🔑 Key Concepts

### Multi-Tenant Architecture
- Each service provider has their own tenant
- Data isolation at database level
- ServiceProvider → Customer → Properties → Jobs

### Job Workflow (Maintenance)
```
1. Guest reports issue (guest-tablet)
2. Customer submits to provider (web-customer)
3. Provider creates quote (web-maintenance)
4. Customer approves quote (web-customer)
5. Provider schedules contractor (web-maintenance) ← BUILDING NOW
6. Contractor completes job (web-maintenance)      ← BUILDING NOW
7. Invoice auto-generated                          ← BUILDING NOW
8. Customer pays and rates                         ← BUILDING NOW
```

### Terminology
- **Maintenance Portal**: "Contractors" (internal + external)
- **Cleaning Portal**: "Workers" (internal only)

---

## 🛠️ Development Commands

### API Development
```bash
cd apps/api
npm run dev              # Start API server with hot reload
npm run db:studio        # Open Prisma Studio (database GUI)
curl http://localhost:3001/health  # Test API is running
```

### Frontend Development
```bash
cd apps/web-maintenance
npm run dev              # Start dev server
npm run build            # Production build
npm run type-check       # TypeScript check
```

### Database Commands
```bash
cd packages/database
npx prisma migrate dev           # Create new migration
npx prisma generate              # Generate Prisma Client
npx prisma db push               # Push schema changes
npx prisma studio                # Open database GUI
npm run db:seed                  # Seed test data
```

---

## 📊 What's Already Built ✅

### Backend (API)
- ✅ Multi-tenant architecture
- ✅ User authentication
- ✅ Property management
- ✅ Customer management
- ✅ Maintenance job CRUD
- ✅ Quote submission & approval
- ✅ PhotosService (local + S3)
- ✅ Guest issue reporting

### Frontend (Web Apps)
- ✅ web-landlord (property management)
- ✅ web-customer (customer portal)
- ✅ guest-tablet (guest AI dashboard)
- ✅ web-maintenance (dashboard + job details)
- ✅ web-cleaning (dashboard + job details)

### Database
- ✅ 20+ tables with full schema
- ✅ Migrations
- ✅ Seed data
- ✅ Multi-tenant isolation

---

## 📝 Coding Standards

### TypeScript
- Use strict mode
- Define interfaces for all data types
- No `any` types (use `unknown` if needed)

### API
- RESTful endpoints
- Tenant isolation required
- Error handling middleware
- Input validation

### React
- Functional components only
- Custom hooks for logic
- Component library for UI

### Testing
- Test with real data via Prisma Studio
- Manual testing in browser
- API testing with curl/Postman

---

## ❓ Common Questions

### Q: Where do I start?
**A**: Read CURRENT_STATUS.md, then start with M-201 in MAINTENANCE-FIRST-SPRINT.md

### Q: Which app am I working in?
**A**: web-maintenance (port 5175) for the next 3-4 days

### Q: Do I need to set up S3 for photos?
**A**: No! PhotosService automatically uses local storage (./uploads/) in development

### Q: What about mobile apps?
**A**: Deferred to Phase 4. Focus on web apps first.

### Q: How do I test my changes?
**A**: Use Prisma Studio to view/edit database, test in browser, check Network tab

---

## 🆘 Need Help?

### Documentation Issues
- Check docs/sprints/ for sprint plans
- Check docs/architecture/ for technical specs
- Check docs/archive/ for historical context

### Code Issues
- Check existing implementations in other apps
- Look for similar components/services
- Use TypeScript autocomplete for API discovery

### Database Issues
- Use Prisma Studio: `npx prisma studio`
- Check schema: `packages/database/prisma/schema.prisma`
- Reseed if needed: `npm run db:seed`

---

## 🎉 You're Ready!

1. ✅ Read this README
2. ✅ Read CURRENT_STATUS.md
3. ✅ Read IMPLEMENTATION-ROADMAP.md
4. ✅ Skim MAINTENANCE-FIRST-SPRINT.md
5. 🚀 Start building M-201!

**Good luck! You've got everything you need to succeed.** 💪

---

*Last Updated: 2025-11-02*
*Current Phase: 3A - Maintenance Web Workflow*

---

## 🤖 Important: AI Assistant Rules

**If you're an AI assistant working on this project:**

⚠️ **READ THIS FIRST**: [DEVELOPMENT-GUIDELINES.md](DEVELOPMENT-GUIDELINES.md)

**Critical Rules:**
1. ⚠️ **During active work**: Let human manage servers/infrastructure
2. ✅ **When human is away**: Can manage servers autonomously
3. ❌ **NEVER** install packages without approval
4. ❌ **NEVER** run database migrations without approval
5. ✅ **ALWAYS** document what you did when working autonomously

**During collaboration: Human runs commands. When alone: AI can run commands.**

See DEVELOPMENT-GUIDELINES.md for details.

