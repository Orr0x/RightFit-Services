# Documentation Map

**Quick Navigation for AI Agents & Developers**

Last Updated: 2025-10-30

---

## 🚀 START HERE (For AI Agents)

### New to this codebase?
1. **[README.md](README.md)** - Project overview, tech stack, status
2. **[HANDOVER.md](HANDOVER.md)** - Complete developer onboarding & architecture
3. **[SPRINT_STATUS.md](SPRINT_STATUS.md)** - Current sprint progress (82% complete)

### Need to make changes?
1. **[docs/architecture/coding-standards.md](docs/architecture/coding-standards.md)** - **CRITICAL** coding rules
2. **[docs/architecture.md](docs/architecture.md)** - System architecture
3. **[packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)** - Database schema

---

## 📁 Root Directory Files

### Essential Guides (Keep in Root)
| File | Purpose | When to Use |
|------|---------|-------------|
| **[README.md](README.md)** | Project overview, quick start, tech stack | First stop for anyone new |
| **[HANDOVER.md](HANDOVER.md)** | Complete developer onboarding | Comprehensive project understanding |
| **[QUICK_START.md](QUICK_START.md)** | Get running in 15 minutes | Setting up for the first time |
| **[DATABASE_SETUP.md](DATABASE_SETUP.md)** | Database setup instructions | Database configuration needed |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production deployment guide | Deploying to production (Sprint 6) |
| **[SPRINT_STATUS.md](SPRINT_STATUS.md)** | Current sprint tracking | Check current progress & next tasks |

### Configuration Files
| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `.eslintrc.js` | ESLint configuration |
| `.prettierrc` | Code formatting rules |
| `.gitignore` | Git ignore patterns |
| `.npmrc` | NPM configuration |
| `tsconfig.json` | TypeScript configuration |
| `turbo.json` | Turborepo configuration |
| `package.json` | Root package dependencies |
| `pnpm-workspace.yaml` | PNPM workspace config |
| `docker-compose.yml` | Docker setup (PostgreSQL) |

---

## 📚 docs/ Directory Structure

### Getting Started
| File | Purpose | Audience |
|------|---------|----------|
| **[docs/GETTING_BACK_TO_WORK.md](docs/GETTING_BACK_TO_WORK.md)** | 🔥 Quick restart after break | Anyone returning to project |
| **[docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md)** | Complete WSL2 Android setup | Android developers (Windows) |
| **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** | Daily command reference | Active developers |
| **[docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** | Complete doc index | Finding specific docs |

### Architecture & Design
| File | Purpose |
|------|---------|
| **[docs/architecture.md](docs/architecture.md)** | Complete fullstack architecture |
| **[docs/architecture/tech-stack.md](docs/architecture/tech-stack.md)** | Technology decisions & rationale |
| **[docs/architecture/coding-standards.md](docs/architecture/coding-standards.md)** | **CRITICAL** coding rules |
| **[docs/OFFLINE_MODE.md](docs/OFFLINE_MODE.md)** | Offline-first implementation |

### Product & Planning
| File | Purpose |
|------|---------|
| **[docs/prd.md](docs/prd.md)** | Product requirements document |
| **[docs/project-plan/sprint-plans.md](docs/project-plan/sprint-plans.md)** | 6-sprint MVP plan |
| **[docs/stories/](docs/stories/)** | User stories with acceptance criteria |
| **[docs/GAPS_AND_PRIORITIES.md](docs/GAPS_AND_PRIORITIES.md)** | Feature gaps & priorities |
| **[docs/MVP_READINESS.md](docs/MVP_READINESS.md)** | MVP readiness checklist |
| **[docs/NEXT_STEPS.md](docs/NEXT_STEPS.md)** | Next development steps |
| **[docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md](docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md)** | Production deployment checklist |

### Technical Guides
| File | Purpose |
|------|---------|
| **[docs/ANDROID_BUILD_FIX_SUMMARY.md](docs/ANDROID_BUILD_FIX_SUMMARY.md)** | Android build troubleshooting |
| **[docs/MOBILE_APP_BUILD_TROUBLESHOOTING.md](docs/MOBILE_APP_BUILD_TROUBLESHOOTING.md)** | Mobile build issues |
| **[docs/SPRINT_5_COMPLETION_GUIDE.md](docs/SPRINT_5_COMPLETION_GUIDE.md)** | Sprint 5 notifications guide |

### Migration Documentation
| File | Purpose |
|------|---------|
| **[docs/migration/README.md](docs/migration/README.md)** | Tech stack migration summary |
| **[docs/migration/MIGRATION_RESULTS.md](docs/migration/MIGRATION_RESULTS.md)** | Migration results (2025-10-28) |
| **[docs/ARCHITECTURE_VALIDATION_REPORT.md](docs/ARCHITECTURE_VALIDATION_REPORT.md)** | Post-migration validation |

### Testing & Quality
| File | Purpose |
|------|---------|
| **[docs/testing/api-manual-testing.md](docs/testing/api-manual-testing.md)** | API testing guide |
| **[docs/testing/unit-testing-plan.md](docs/testing/unit-testing-plan.md)** | Unit testing strategy |

### Historical Archive
| Location | Contents |
|----------|----------|
| **[docs/archive/](docs/archive/)** | Historical documents, old iterations, session reports |
| **[docs/logs/](docs/logs/)** | Log files |

---

## 🏗️ Project Structure

```
RightFit-Services/
├── apps/
│   ├── api/              # Node.js + Express REST API
│   │   ├── src/
│   │   ├── logs/
│   │   └── README.md
│   ├── web/              # React web app (Vite)
│   │   └── src/
│   └── mobile/           # React Native mobile app (Expo)
│       ├── src/
│       ├── android/      # Android native code
│       └── README.md     # Mobile-specific guide
├── packages/
│   ├── database/         # Prisma schema & client
│   │   └── prisma/
│   │       └── schema.prisma  # **Database schema**
│   └── shared/           # Shared TypeScript types
├── docs/                 # All documentation
│   ├── architecture/     # Architecture docs
│   ├── project-plan/     # Sprint plans
│   ├── stories/          # User stories
│   ├── testing/          # Testing guides
│   ├── migration/        # Migration docs
│   ├── archive/          # Historical docs
│   └── logs/             # Log files
├── README.md             # **Start here**
├── DOCS_MAP.md           # **This file**
├── HANDOVER.md           # Developer onboarding
├── QUICK_START.md        # Quick setup guide
├── DATABASE_SETUP.md     # Database setup
├── DEPLOYMENT.md         # Deployment guide
└── SPRINT_STATUS.md      # Current progress
```

---

## 🤖 For AI Agents: Common Tasks

### Task: "Fix a bug in the API"
1. Read **[docs/architecture.md](docs/architecture.md)** - Understand system
2. Read **[docs/architecture/coding-standards.md](docs/architecture/coding-standards.md)** - Follow coding rules
3. Check **[packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)** - Database schema
4. Review **[apps/api/src/](apps/api/src/)** - API source code
5. Check **[docs/testing/api-manual-testing.md](docs/testing/api-manual-testing.md)** - Test the fix

### Task: "Add a new feature"
1. Read **[SPRINT_STATUS.md](SPRINT_STATUS.md)** - Check if already planned
2. Read **[docs/prd.md](docs/prd.md)** - Product requirements
3. Read **[docs/architecture/coding-standards.md](docs/architecture/coding-standards.md)** - Coding standards
4. Check **[docs/project-plan/sprint-plans.md](docs/project-plan/sprint-plans.md)** - Sprint planning
5. Update **[SPRINT_STATUS.md](SPRINT_STATUS.md)** - Track progress

### Task: "Set up development environment"
1. Read **[QUICK_START.md](QUICK_START.md)** - Quick setup (15 min)
2. Read **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database setup
3. For Android: **[docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md)** - WSL2 setup
4. Bookmark **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Daily commands

### Task: "Deploy to production"
1. Read **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
2. Check **[docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md](docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md)** - Checklist
3. Review **[docs/MVP_READINESS.md](docs/MVP_READINESS.md)** - MVP readiness

### Task: "Understand offline mode"
1. Read **[docs/OFFLINE_MODE.md](docs/OFFLINE_MODE.md)** - Implementation details
2. Check **[apps/mobile/src/services/syncService.ts](apps/mobile/src/services/syncService.ts)** - Sync logic
3. Review **[apps/mobile/src/database/](apps/mobile/src/database/)** - WatermelonDB setup

### Task: "Debug mobile app"
1. Read **[apps/mobile/README.md](apps/mobile/README.md)** - Mobile setup
2. Check **[docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md)** - Android environment
3. Use **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Debug commands
4. If needed: **[docs/GETTING_BACK_TO_WORK.md](docs/GETTING_BACK_TO_WORK.md)** - Quick restart

---

## 📊 Project Status Quick Reference

| Metric | Value |
|--------|-------|
| **Status** | Active Development |
| **Tech Stack** | ✅ Stable (React 18.3.1 + Node 20 LTS) |
| **Progress** | 251/304 story points (82%) |
| **Test Coverage** | 14.94% |
| **Current Sprint** | Sprint 5 Complete → Sprint 6 Next |
| **Android Dev** | ✅ WSL2 + Local Builds Working |
| **Offline Mode** | ✅ Fully Operational |
| **Last Updated** | 2025-10-30 |

---

## 🔗 Key External Resources

- **GitHub Repository:** https://github.com/Orr0x/RightFit-Services
- **React Native Docs:** https://reactnative.dev/
- **Expo Docs:** https://docs.expo.dev/
- **Prisma Docs:** https://www.prisma.io/docs
- **WatermelonDB Docs:** https://nozbe.github.io/WatermelonDB/

---

## 💡 Tips for AI Agents

1. **Always read coding-standards.md first** - Contains critical rules
2. **Check SPRINT_STATUS.md** - Know what's already done
3. **Follow the monorepo structure** - apps/ and packages/
4. **Multi-tenancy is critical** - All queries must filter by tenant_id
5. **Offline-first mobile app** - WatermelonDB + sync service
6. **Use pnpm, not npm** - This is a pnpm workspace
7. **WSL2 for Android** - Windows users need WSL2 setup

---

## 📞 Need Help?

1. Check **[DOCS_MAP.md](DOCS_MAP.md)** (this file) - Find the right doc
2. Check **[docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** - Complete index
3. Check **[HANDOVER.md](HANDOVER.md)** - Comprehensive guide
4. Check **[docs/GETTING_BACK_TO_WORK.md](docs/GETTING_BACK_TO_WORK.md)** - Quick restart

---

**Navigation Shortcut:**
- 🆕 New Developer → [QUICK_START.md](QUICK_START.md)
- 🔥 Returning → [docs/GETTING_BACK_TO_WORK.md](docs/GETTING_BACK_TO_WORK.md)
- 📱 Android Dev → [docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md)
- 🏗️ Architecture → [docs/architecture.md](docs/architecture.md)
- 📋 Current Work → [SPRINT_STATUS.md](SPRINT_STATUS.md)
- 🤖 AI Agent → Read this file + [docs/architecture/coding-standards.md](docs/architecture/coding-standards.md)
