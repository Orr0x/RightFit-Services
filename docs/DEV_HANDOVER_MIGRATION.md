# Developer Handover: Tech Stack Migration

**Date:** 2025-10-28
**From:** Winston (Architect)
**To:** Development Team
**Priority:** 🔴 CRITICAL - BLOCKS SPRINT 5+
**Estimated Effort:** 6-8 hours

---

## 📋 Quick Summary

**What:** Migrate from React 19 + Node 24 to stable versions (React 18.3.1 + Node 20 LTS)

**Why:** Sprint 4 encountered 150% development overhead due to bleeding-edge tech stack. Migration saves 120+ hours over project lifecycle.

**When:** Before starting Sprint 5

**How:** Follow Story 011 checklist (see below) and detailed MIGRATION_PLAN.md

---

## 🎯 What You're Fixing

### Current Problems:
1. ❌ **React Hook Errors** - Multiple React instances in monorepo
2. ❌ **6 Peer Dependency Conflicts** - React Native ecosystem not compatible with React 19
3. ❌ **Node 24 Filesystem Bugs** - pnpm install failures on Windows
4. ❌ **156 Lines of Workaround Code** - WatermelonDB conditional initialization
5. ❌ **Development Velocity -60%** - Every feature takes 2.5x expected time

### After Migration:
1. ✅ **Zero React errors** - Single React 18.3.1 instance
2. ✅ **Zero peer warnings** - All packages compatible
3. ✅ **Stable pnpm installs** - Node 20 LTS reliability
4. ✅ **Clean codebase** - Remove all workarounds
5. ✅ **Normal velocity** - Back to expected development speed

---

## 📚 Required Reading (15 minutes)

**MUST READ:**
1. [ARCHITECT_HANDOVER.md](../ARCHITECT_HANDOVER.md) - Executive summary (5 min)
2. [docs/MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - Phase 8 Testing section (10 min)

**OPTIONAL (for deep dive):**
3. [docs/TECH_STACK_EVALUATION.md](./TECH_STACK_EVALUATION.md) - Root cause analysis
4. [docs/architecture.md](./architecture.md) - ADR-005

---

## 🚀 Quick Start Guide

### Prerequisites
```bash
# 1. Install Node 20 LTS
# Download from: https://nodejs.org/en/download/
# Or use nvm:
nvm install 20
nvm use 20

# 2. Verify Node version
node -v  # Should show v20.x.x

# 3. Update pnpm
npm install -g pnpm@latest
```

### Execution Path
```bash
# 1. Create migration branch
git checkout -b migration/react18-node20

# 2. Follow Story 011 checklist
# See: docs/stories/011-tech-stack-migration.md

# 3. For detailed steps, reference:
# docs/MIGRATION_PLAN.md (Phases 0-10)
```

---

## 🎯 Success Criteria

**Migration is successful when:**

### Automated Checks:
- [ ] `pnpm install` - Zero peer dependency warnings
- [ ] `pnpm typecheck` - Zero TypeScript errors
- [ ] `pnpm test` - All 38 tests passing
- [ ] `pnpm build` - All packages build successfully

### Manual Validation:
- [ ] **Web app loads** - No React hook errors in console
- [ ] **Mobile app runs in Expo Go** - No crashes
- [ ] **Login works** - Auth flow functional
- [ ] **CRUD operations work** - Properties + Work Orders
- [ ] **Offline mode works** - WatermelonDB initializes (dev build)

### Code Quality:
- [ ] **Workaround code removed** - 156 lines deleted
- [ ] `.npmrc` simplified - React 19 hacks removed
- [ ] Version specifications updated - All package.json files

---

## 📦 Package Version Changes

### Mobile (apps/mobile/package.json)
```json
{
  "react": "18.3.1",           // FROM: 19.1.0
  "expo": "~52.0.0",           // FROM: ~54.0.0
  "@types/react": "18.3.12"    // FROM: 19.1.17
}
```

### Web (apps/web/package.json)
```json
{
  "react": "18.3.1",           // FROM: 19.1.1
  "react-dom": "18.3.1",       // FROM: 19.1.1
  "@mui/material": "5.16.9",   // FROM: 7.x
  "@types/react": "18.3.12"    // FROM: 19.1.17
}
```

### API (apps/api/package.json)
```json
{
  "engines": {
    "node": ">=20.0.0"         // FROM: >=24.0.0
  },
  "@types/node": "20.17.10"    // FROM: 24.x
}
```

---

## 🗑️ Code to Delete (156 lines)

### Files to Simplify:
1. **apps/mobile/src/database/index.ts**
   - Remove conditional WatermelonDB initialization
   - Remove graceful degradation for Expo Go

2. **apps/mobile/src/database/DatabaseProvider.tsx**
   - Remove null checks for database
   - Simplify context provider

3. **apps/mobile/src/services/syncService.ts**
   - Remove database availability checks
   - Remove fallback logic

4. **apps/mobile/src/services/offlineDataService.ts**
   - Remove graceful fallbacks
   - Simplify service initialization

### Configuration to Simplify:
5. **.npmrc (root)**
   ```diff
   - hoist=false
   - public-hoist-pattern[]=react
   + # Workarounds removed - React 18 compatible
   ```

---

## 🧪 Testing Checklist (Quick Reference)

### Unit Tests
```bash
pnpm test
# Expected: 38/38 passing
```

### Web App Manual Test
```bash
cd apps/web
pnpm dev
```
- [ ] Navigate to http://localhost:3001
- [ ] Login with test account
- [ ] Open browser DevTools → Console
- [ ] Check: No "Invalid hook call" errors
- [ ] Check: No "multiple React" warnings
- [ ] Create a property
- [ ] Create a work order

### Mobile App Manual Test
```bash
cd apps/mobile
pnpm start
```
- [ ] Scan QR code in Expo Go
- [ ] App loads without crash
- [ ] Login works
- [ ] Create property/work order
- [ ] **For offline mode:** Build dev version and test WatermelonDB

---

## ⚠️ Common Issues & Solutions

### Issue 1: pnpm install still shows warnings
```bash
# Solution: Full clean
rm -rf node_modules pnpm-lock.yaml
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm store prune
pnpm install
```

### Issue 2: TypeScript errors after downgrade
```bash
# Solution: Regenerate type definitions
pnpm --filter @rightfit/database prisma generate
pnpm typecheck
```

### Issue 3: Web app still shows React hook error
```bash
# Solution: Clear Vite cache
rm -rf apps/web/node_modules/.vite
pnpm --filter @rightfit/web dev
```

### Issue 4: Expo build fails
```bash
# Solution: Clear Metro cache
cd apps/mobile
npx expo start -c
```

---

## 🚨 Rollback Plan

If migration fails critically:

```bash
# 1. Abandon migration branch
git checkout main
git branch -D migration/react18-node20

# 2. Switch back to Node 24
nvm use 24

# 3. Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 4. Report blockers to architect
```

**Rollback Triggers:**
- More than 10 failing tests
- Critical auth/database functionality broken
- Migration exceeds 12 hours effort

---

## 📞 Support

**Questions during migration?**
- Check MIGRATION_PLAN.md for detailed phase instructions
- Document blockers in GitHub Issues (label: `migration`)
- If stuck >30 minutes on single issue, pause and escalate

**After migration:**
- Update [SPRINT_STATUS.md](../SPRINT_STATUS.md) with actual time taken
- Document lessons learned
- Celebrate returning to normal velocity! 🎉

---

## ✅ Final Checklist Before Marking Complete

- [ ] All tests passing (38/38)
- [ ] Zero peer dependency warnings
- [ ] Zero TypeScript errors
- [ ] Web app functional (login, CRUD)
- [ ] Mobile app functional (Expo Go + dev build)
- [ ] 156 lines workaround code deleted
- [ ] `.npmrc` simplified
- [ ] All package.json files updated
- [ ] Documentation updated (README, architecture)
- [ ] PR created and reviewed
- [ ] Deployed to staging
- [ ] Smoke tests on staging passed

---

## 🎯 Expected Timeline

| Phase | Time | Your Actual Time |
|-------|------|------------------|
| Setup (Node 20, branch) | 30 min | ___ |
| Package updates | 2 hours | ___ |
| Code cleanup | 1 hour | ___ |
| Testing | 2-3 hours | ___ |
| Documentation | 1 hour | ___ |
| PR & deploy | 30 min | ___ |
| **TOTAL** | **6-8 hours** | **___** |

---

## 📊 Impact Metrics to Track

**Before Migration (Baseline):**
- Development overhead: +150%
- Peer warnings: 6
- Workaround code: 156 lines
- Node version: 24 (non-LTS)
- React version: 19.0.0-rc

**After Migration (Target):**
- Development overhead: 0%
- Peer warnings: 0
- Workaround code: 0 lines
- Node version: 20 LTS
- React version: 18.3.1

**ROI:** 900-1400% (6hr investment → 120hr savings)

---

**Ready to start? Open Story 011 and begin!**

📄 [docs/stories/011-tech-stack-migration.md](./stories/011-tech-stack-migration.md)
