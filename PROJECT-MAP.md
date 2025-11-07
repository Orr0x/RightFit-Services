# RightFit Services - Project Map & Navigation Guide

**Last Updated**: November 7, 2025
**Purpose**: Quick reference for navigating the RightFit Services project

---

## 🚀 Quick Start for New Developers

**Total Onboarding Time**: 2-4 hours reading + 1 day setup

### 1. Read These Documents (In Order)

**⚠️ CRITICAL**: Read [PHILOSOPHY.md](PHILOSOPHY.md) FIRST to understand our quality-first approach.

| Document | Time | Why You Need It |
|----------|------|-----------------|
| **[PHILOSOPHY.md](PHILOSOPHY.md)** | 15 min | **START HERE** - Development philosophy: RightFit, not QuickFix |
| **[README.md](README.md)** | 15 min | Setup instructions and quick start |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 60 min | Complete system architecture (15,000+ words) |
| **[CURRENT-STATE.md](CURRENT-STATE.md)** | 20 min | Current development status and priorities |
| **[PROJECT-PLAN.md](PROJECT-PLAN.md)** | 30 min | Roadmap and sprint plans |
| **[PROJECT-MAP.md](PROJECT-MAP.md)** | 10 min | You are here - navigation guide |
| **[CLAUDE-RULES.md](CLAUDE-RULES.md)** | 10 min | AI assistant and development guidelines |

**Total Reading Time**: ~3 hours

### 2. Set Up Your Environment

```bash
# Clone repository
git clone https://github.com/yourusername/RightFit-Services.git
cd RightFit-Services

# Install dependencies
pnpm install

# Start database
docker compose up -d

# Run migrations
cd packages/database && npx prisma migrate dev && cd ../..

# Start all apps
npm run dev
```

**Setup Time**: ~30 minutes

### 3. Explore the Applications

Visit all running applications:
- API: http://localhost:3001
- Cleaning Portal: http://localhost:5174
- Maintenance Portal: http://localhost:5175
- Customer Portal: http://localhost:5176
- Landlord Portal: http://localhost:5173
- Guest Tablet: http://localhost:5177
- Worker App: http://localhost:5178

**Exploration Time**: ~1 hour

---

## 📁 Project Structure

```
RightFit-Services/
├── 📄 README.md                    ⭐ START HERE - Setup guide
├── 📄 ARCHITECTURE.md              ⭐ Complete system architecture
├── 📄 CURRENT-STATE.md             ⭐ Current development status
├── 📄 PROJECT-PLAN.md              ⭐ Roadmap and sprint plans
├── 📄 PROJECT-MAP.md               ⭐ YOU ARE HERE
├── 📄 CLAUDE-RULES.md              Development guidelines
│
├── 📂 apps/                        🚀 8 Applications
│   ├── api/                        Backend API (Express.js, Prisma)
│   ├── web-landlord/               Landlord portal (React + Vite)
│   ├── web-cleaning/               Cleaning service portal
│   ├── web-maintenance/            Maintenance service portal
│   ├── web-customer/               Customer portal (short-let businesses)
│   ├── guest-tablet/               Guest issue reporting app
│   ├── web-worker/                 Worker app (shared, needs completion)
│   └── mobile/                     React Native mobile app (Expo)
│
├── 📂 packages/                    🔧 Shared Packages
│   ├── database/                   Prisma schema (1,701 lines, 40+ tables)
│   └── shared/                     Shared types, constants, utilities
│
├── 📂 docs/                        📚 Documentation
│   ├── archive/                    Historical docs & session summaries
│   ├── architecture/               Additional architecture specs
│   ├── sprints/                    Sprint plans and completed stories
│   └── analysis/                   Code analysis reports
│
├── 📂 stories/                     📖 User Stories
│   ├── phase-2/                    Customer portal stories
│   ├── phase-3/                    Job management stories
│   └── phase-4/                    Worker app stories
│
├── 📄 docker-compose.yml           PostgreSQL database setup
├── 📄 package.json                 Root workspace config
├── 📄 pnpm-workspace.yaml          Monorepo workspace definition
└── 📄 turbo.json                   Turborepo build config
```

---

## 🗺️ Where Am I? What Do I Need?

### I'm a New Developer

**Goal**: Get oriented and start contributing

1. **[PHILOSOPHY.md](PHILOSOPHY.md)** - **READ FIRST** - Understand our quality-first approach
2. [README.md](README.md) - Setup instructions and quick start
3. [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture
4. [CURRENT-STATE.md](CURRENT-STATE.md) - Current status and priorities
5. [PROJECT-PLAN.md](PROJECT-PLAN.md) - Roadmap and sprint plans
6. [CLAUDE-RULES.md](CLAUDE-RULES.md) - Development guidelines

**Then**: Pick a task from [PROJECT-PLAN.md](PROJECT-PLAN.md) Current Sprint section

**Remember**: Quality over speed. Build it right the first time.

---

### I Need to Fix a Bug

**Steps**:
1. Identify which app has the bug (cleaning, maintenance, customer, etc.)
2. Check [ARCHITECTURE.md](ARCHITECTURE.md) Section 5 for frontend patterns
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) Section 6 for API patterns
4. Look at similar working features for reference
5. Fix, test, and verify

**Common File Locations**:
- Frontend components: `apps/web-*/src/components/`
- Frontend pages: `apps/web-*/src/pages/`
- API routes: `apps/api/src/routes/`
- API services: `apps/api/src/services/`
- Database schema: `packages/database/prisma/schema.prisma`

---

### I Need to Add a New Feature

**Steps**:
1. Check [PROJECT-PLAN.md](PROJECT-PLAN.md) to ensure it's prioritized
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for patterns to follow
3. Check if database changes needed → Update `packages/database/prisma/schema.prisma`
4. Create migration: `cd packages/database && npx prisma migrate dev --name feature_name`
5. Implement backend API (routes + services)
6. Implement frontend components
7. Test end-to-end workflow
8. Update [CURRENT-STATE.md](CURRENT-STATE.md) if significant

**Pattern to Follow**:
```
Feature: User Management
├── 1. Database schema (packages/database/prisma/schema.prisma)
├── 2. API service (apps/api/src/services/UserService.ts)
├── 3. API routes (apps/api/src/routes/users.ts)
├── 4. Frontend API client (apps/web-*/src/lib/api.ts)
├── 5. Frontend components (apps/web-*/src/components/UserCard.tsx)
└── 6. Frontend pages (apps/web-*/src/pages/Users.tsx)
```

---

### I Need to Understand How Something Works

**System Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- Section 1: Introduction and product architecture
- Section 2: Existing project analysis
- Section 3: Technology stack
- Section 4: Data models and schema
- Section 5: Component architecture (frontend patterns)
- Section 6: API design (backend patterns)
- Section 7: Cross-app workflow integrations
- Section 8: Security architecture
- Section 9: Deployment and infrastructure
- Section 10: Next steps and recommendations

**Specific Topics**:
- **Authentication**: [ARCHITECTURE.md](ARCHITECTURE.md) Section 8.1
- **Multi-tenancy**: [ARCHITECTURE.md](ARCHITECTURE.md) Section 8.2
- **Database Models**: [ARCHITECTURE.md](ARCHITECTURE.md) Section 4
- **API Patterns**: [ARCHITECTURE.md](ARCHITECTURE.md) Section 6
- **Frontend Patterns**: [ARCHITECTURE.md](ARCHITECTURE.md) Section 5
- **Deployment**: [ARCHITECTURE.md](ARCHITECTURE.md) Section 9.2

---

### I Need to Run Tests

**Web Applications**:
```bash
cd apps/web-cleaning  # or any web app
pnpm test              # Run unit tests
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Run with coverage
```

**API**:
```bash
cd apps/api
pnpm test              # Run tests
pnpm test:coverage     # Run with coverage
```

**Mobile**:
```bash
cd apps/mobile
pnpm test              # Run Jest tests
```

---

### I Need to Deploy

**Development**:
```bash
npm run dev            # Start all apps locally
```

**Production**:
See [ARCHITECTURE.md](ARCHITECTURE.md) Section 9.2 for complete deployment guide including:
- Nginx subdomain routing configuration
- Docker Compose setup
- SSL certificate configuration
- CI/CD pipeline setup

**Quick Production Setup**:
```bash
# Build all apps
pnpm build

# Deploy with Docker
docker compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Common Tasks

### Task: Add a New Database Table

1. Edit `packages/database/prisma/schema.prisma`
2. Add your model:
   ```prisma
   model MyModel {
     id         String   @id @default(uuid())
     name       String
     created_at DateTime @default(now())
   }
   ```
3. Create migration: `cd packages/database && npx prisma migrate dev --name add_my_model`
4. Regenerate client: `npx prisma generate`

### Task: Add a New API Endpoint

1. Create service: `apps/api/src/services/MyService.ts`
2. Create route: `apps/api/src/routes/my-route.ts`
3. Register route in `apps/api/src/index.ts`:
   ```typescript
   app.use('/api/my-route', myRouteRouter)
   ```
4. Test with Postman or curl

### Task: Add a New Frontend Page

1. Create page component: `apps/web-cleaning/src/pages/MyPage.tsx`
2. Add route in `apps/web-cleaning/src/App.tsx`:
   ```typescript
   <Route path="/my-page" element={<MyPage />} />
   ```
3. Add navigation link in layout
4. Test in browser

### Task: Debug Database Issues

```bash
# View database in GUI
cd packages/database && npx prisma studio

# Check migration status
npx prisma migrate status

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Task: Fix Port Conflicts

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 PID

# Or change port in apps/api/.env
PORT=3002
```

---

## 📚 Documentation Index

### Root Level (Essential Reading)
- **[PHILOSOPHY.md](PHILOSOPHY.md)** - **START HERE** - Development philosophy: RightFit, not QuickFix
- [README.md](README.md) - Setup and quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture (15,000+ words)
- [CURRENT-STATE.md](CURRENT-STATE.md) - Current status and priorities
- [PROJECT-PLAN.md](PROJECT-PLAN.md) - Roadmap and sprint plans with quality gates
- [PROJECT-MAP.md](PROJECT-MAP.md) - YOU ARE HERE - Navigation guide
- [CLAUDE-RULES.md](CLAUDE-RULES.md) - AI assistant and development guidelines
- [REVIEW-GUIDE.md](REVIEW-GUIDE.md) - Review checklist for team validation

### Archived Documentation
- `docs/archive/AGENT-HANDOFF.md` - Previous session handoff (Nov 4, 2025)
- `docs/archive/BUSINESS-MANAGEMENT-IMPLEMENTATION-SUMMARY.md` - Business sprint summary (Nov 4, 2025)
- `docs/archive/CURRENT_STATUS.md` - Old status (Nov 5, 2025)
- `docs/archive/SESSION-SUMMARY-GRADIENT-CARD-GRID-2025-11-05.md` - UI/UX session (Nov 5, 2025)

### Additional Architecture Docs
- `docs/architecture/APP-SEPARATION.md` - Application separation strategy
- `docs/architecture/PROPERTY_SHARING_ARCHITECTURE.md` - Property sharing between tenants

### Sprint Plans
- `docs/sprints/IMPLEMENTATION-ROADMAP.md` - Overall implementation strategy
- `docs/sprints/MAINTENANCE-FIRST-SPRINT.md` - Maintenance sprint (completed)
- `docs/sprints/CLEANUP-SPRINT-1.md` - Code cleanup sprint

### User Stories
- `stories/phase-2/` - Customer portal stories
- `stories/phase-3/` - Job management stories
- `stories/phase-4/worker-app-sprint/` - Worker app stories (15 stories, 52 points)

---

## 🔍 Find Specific Information

### "Where is the authentication logic?"
- Backend: `apps/api/src/middleware/auth.ts`
- Frontend pattern: [ARCHITECTURE.md](ARCHITECTURE.md) Section 5.3 (API Client Pattern)
- JWT setup: `apps/api/src/index.ts` (JWT secrets in .env)

### "Where are the database models?"
- Schema: `packages/database/prisma/schema.prisma` (1,701 lines)
- Documentation: [ARCHITECTURE.md](ARCHITECTURE.md) Section 4 (Data Models & Schema)

### "How do I add a new tenant?"
- API endpoint: `POST /api/tenants` (in `apps/api/src/routes/tenants.ts`)
- See multi-tenant architecture: [ARCHITECTURE.md](ARCHITECTURE.md) Section 8.2

### "Where is the API documentation?"
- ⚠️ **Currently missing** - See [CURRENT-STATE.md](CURRENT-STATE.md) Priority #4
- **Planned**: OpenAPI/Swagger docs at `api.rightfit.com/docs`

### "How do cross-product workflows work?"
- See [ARCHITECTURE.md](ARCHITECTURE.md) Section 7 (Cross-App Workflow Integrations)
- Example: Cleaning worker reports maintenance issue → Customer approves → Maintenance receives

### "What's the deployment strategy?"
- See [ARCHITECTURE.md](ARCHITECTURE.md) Section 9.2 (Unified Deployment Strategy)
- Summary: Single platform with branded subdomains (cleaning.rightfit.com, maintenance.rightfit.com, etc.)

---

## 🎓 Learning Paths

**⚠️ ALL PATHS START WITH [PHILOSOPHY.md](PHILOSOPHY.md)** - Understand our quality-first approach before diving in.

### Path 1: Frontend Developer
1. Read [PHILOSOPHY.md](PHILOSOPHY.md) - Quality-first approach (15 min)
2. Read [README.md](README.md) for setup (15 min)
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) Section 5 (Component Architecture) (30 min)
4. Read [ARCHITECTURE.md](ARCHITECTURE.md) Section 7 (Cross-App Workflows) (20 min)
5. Explore `apps/web-cleaning/` codebase (60 min)
6. Build a sample component following patterns (2 hours)

**Total**: ~4.5 hours

### Path 2: Backend Developer
1. Read [PHILOSOPHY.md](PHILOSOPHY.md) - Quality-first approach (15 min)
2. Read [README.md](README.md) for setup (15 min)
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) Section 4 (Data Models) (30 min)
4. Read [ARCHITECTURE.md](ARCHITECTURE.md) Section 6 (API Design) (30 min)
5. Read [ARCHITECTURE.md](ARCHITECTURE.md) Section 8 (Security) (20 min)
6. Explore `apps/api/` codebase (60 min)
7. Build a sample API endpoint (2 hours)

**Total**: ~4.5 hours

### Path 3: Full-Stack Developer
1. Read [PHILOSOPHY.md](PHILOSOPHY.md) - Quality-first approach (15 min)
2. Read [README.md](README.md) (15 min)
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) completely (90 min)
4. Read [CURRENT-STATE.md](CURRENT-STATE.md) (20 min)
5. Read [PROJECT-PLAN.md](PROJECT-PLAN.md) (30 min)
6. Explore all codebases (90 min)
7. Build a full-stack feature (4 hours)

**Total**: ~7.5 hours

### Path 4: DevOps/Deployment
1. Read [PHILOSOPHY.md](PHILOSOPHY.md) - Quality-first approach (15 min)
2. Read [README.md](README.md) for setup (15 min)
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) Section 9 (Deployment) (45 min)
4. Review `docker-compose.yml` and infrastructure files (30 min)
5. Set up local deployment with Docker (2 hours)
6. Plan production deployment (2 hours)

**Total**: ~5.5 hours

---

## 💡 Pro Tips

### For Efficient Development

1. **Use Prisma Studio** for database exploration: `cd packages/database && npx prisma studio`
2. **Check patterns first** before writing new code - see [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Reference similar features** - most patterns are already implemented somewhere
4. **Update docs as you go** - especially [CURRENT-STATE.md](CURRENT-STATE.md) for significant changes
5. **Follow CLAUDE-RULES.md** - especially for AI-assisted development

### For Debugging

1. **Check the API logs** - API server logs show all requests and errors
2. **Use browser DevTools** - Network tab shows API calls and responses
3. **Check database with Prisma Studio** - Visual database browser
4. **Read error messages carefully** - Prisma errors are detailed and helpful
5. **Search the codebase** - Likely similar code exists that works

### For Collaboration

1. **Read CURRENT-STATE.md weekly** - Stay updated on progress
2. **Update PROJECT-PLAN.md** - Keep sprint plans current
3. **Document blockers** - Add to CURRENT-STATE.md Dependencies section
4. **Follow patterns** - Consistency > personal preference
5. **Ask questions** - Reference specific docs (e.g., "See ARCHITECTURE.md Section 5.2")

---

## 🚨 Common Gotchas

### "Database connection failed"
- **Check**: Is PostgreSQL running? `docker ps | grep rightfit-postgres`
- **Fix**: `docker compose up -d`

### "Port already in use"
- **Check**: `lsof -i :3001`
- **Fix**: Kill the process or change port in `.env`

### "Prisma Client out of sync"
- **Fix**: `cd packages/database && npx prisma generate`

### "Module not found"
- **Fix**: `pnpm install` in the specific app directory

### "Migration failed"
- **Check**: Database state with `npx prisma migrate status`
- **Fix**: `npx prisma migrate reset` (⚠️ deletes data)

---

## 📞 Need Help?

### Still Can't Find What You Need?

1. **Search the codebase**: Use VSCode search or `grep -r "search term" apps/`
2. **Check docs/archive**: Historical context and session summaries
3. **Read ARCHITECTURE.md completely**: 15,000+ words of detailed documentation
4. **Review git history**: `git log` shows what changed and why
5. **Ask the team**: Reference specific docs when asking questions

### Documentation Coverage

- **Development Philosophy**: [PHILOSOPHY.md](PHILOSOPHY.md) - **START HERE**
- **Setup & Installation**: [README.md](README.md)
- **System Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Current Status**: [CURRENT-STATE.md](CURRENT-STATE.md)
- **Roadmap & Plans**: [PROJECT-PLAN.md](PROJECT-PLAN.md)
- **Navigation**: [PROJECT-MAP.md](PROJECT-MAP.md) (you are here)
- **Development Guidelines**: [CLAUDE-RULES.md](CLAUDE-RULES.md)
- **Review Checklist**: [REVIEW-GUIDE.md](REVIEW-GUIDE.md)

---

**Last Updated**: November 7, 2025
**Maintained By**: Development Team
**Review Frequency**: Weekly or after major changes

**You're all set!** Everything you need to navigate the project is here. 🎉
