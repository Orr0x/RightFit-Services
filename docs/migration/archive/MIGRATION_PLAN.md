# Tech Stack Migration Plan
## React 19 → React 18.3.1 | Node 24 → Node 20 LTS

**Document Version:** 1.0
**Created:** 2025-10-28
**Status:** 🟡 APPROVED - READY FOR EXECUTION
**Estimated Duration:** 6-8 hours
**Target Completion:** Week of 2025-10-28

---

## 📋 Executive Summary

**Migration Goal:** Downgrade from bleeding-edge stack to industry-standard stable versions to eliminate 150% development overhead and improve stability.

**From:**
- React 19.1.x (Release Candidate)
- Node.js 24.x (Non-LTS, unstable)
- Expo SDK 54
- MUI 7.x

**To:**
- React 18.3.1 (Stable, LTS)
- Node.js 20 LTS (Stable until 2026)
- Expo SDK 52/53
- MUI 5.x

**Business Impact:**
- ✅ Eliminates 156 lines of workaround code
- ✅ Removes 6 peer dependency conflicts
- ✅ Returns to normal development velocity
- ✅ Reduces production risk
- ✅ ROI: 900-1400%

---

## 🎯 Migration Phases

### Phase 0: Pre-Migration Preparation (30 minutes)
**Status:** ⬜ NOT STARTED

#### Checklist:
- [ ] **Create git branch:** `migration/react18-node20`
- [ ] **Backup current state:** Full git commit with message "Pre-migration checkpoint"
- [ ] **Document current versions:** Run `node -v`, `pnpm list react`, save output
- [ ] **Run existing tests:** Capture baseline test results
- [ ] **Verify current functionality:** Manual smoke test (login, properties, work orders)
- [ ] **Install Node 20 LTS:** Download from nodejs.org or use nvm
- [ ] **Verify Node 20:** `node -v` should show v20.x.x
- [ ] **Update global pnpm:** `npm install -g pnpm@latest`

#### Deliverables:
- [x] Git branch created
- [ ] Baseline test results documented
- [ ] Node 20 LTS installed
- [ ] Current state documented

---

### Phase 1: Root Package.json Updates (30 minutes)
**Status:** ⬜ NOT STARTED

#### Files to Modify:
1. **Root package.json**
   - [ ] Update engines: `"node": ">=20.0.0"`
   - [ ] Verify Turborepo version compatible with Node 20

#### Actions:
```bash
# Verify Node version
node -v  # Should show v20.x.x

# Clean workspace
rm -rf node_modules
rm pnpm-lock.yaml
```

#### Validation:
- [ ] Node version confirmed as 20.x
- [ ] Root package.json updated
- [ ] Clean workspace confirmed

---

### Phase 2: Mobile App Migration (apps/mobile) (1 hour)
**Status:** ⬜ NOT STARTED

#### package.json Updates:
```json
{
  "dependencies": {
    "react": "18.3.1",          // FROM: 19.1.0
    "react-native": "0.73.6",   // Keep current (compatible)
    "expo": "~52.0.0",          // FROM: ~54.0.0
    "react-dom": "18.3.1",      // FROM: 19.x (if present)

    "@nozbe/watermelondb": "0.28.0",        // Verify 18.x compat
    "@nozbe/with-observables": "1.6.0",     // Should work with 18.x
    "react-native-web": "0.19.13",          // Verify compatibility

    // Navigation - verify compatible
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/bottom-tabs": "^6.5.11"
  },
  "devDependencies": {
    "@types/react": "18.3.12",  // FROM: 19.1.17
    "typescript": "5.3.3"        // Keep current
  }
}
```

#### Code Changes Required:
1. **Remove WatermelonDB workarounds:**
   - [ ] `apps/mobile/src/database/index.ts` - Remove conditional init
   - [ ] `apps/mobile/src/database/DatabaseProvider.tsx` - Remove null checks
   - [ ] `apps/mobile/src/services/syncService.ts` - Simplify database access
   - [ ] `apps/mobile/src/services/offlineDataService.ts` - Remove fallbacks

2. **Estimated lines removed:** 156 lines

#### Actions:
```bash
# From root directory
cd apps/mobile

# Update package.json (manual edit)
# Then reinstall
pnpm install
```

#### Validation Checklist:
- [ ] Package.json updated with React 18.3.1
- [ ] Package.json updated with Expo SDK 52
- [ ] @types/react downgraded to 18.3.x
- [ ] WatermelonDB workarounds removed (156 lines)
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] App builds: `pnpm run android` or `pnpm run ios`
- [ ] No peer dependency warnings in pnpm install output

---

### Phase 3: Web App Migration (apps/web) (1 hour)
**Status:** ⬜ NOT STARTED

#### package.json Updates:
```json
{
  "dependencies": {
    "react": "18.3.1",          // FROM: 19.1.1
    "react-dom": "18.3.1",      // FROM: 19.1.1

    "@mui/material": "5.16.9",  // FROM: 7.x (downgrade)
    "@mui/icons-material": "5.16.9",
    "@emotion/react": "11.13.5",
    "@emotion/styled": "11.13.5",

    // Verify compatibility
    "@tanstack/react-query": "^5.17.0",
    "react-router-dom": "^6.21.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4"
  },
  "devDependencies": {
    "@types/react": "18.3.12",  // FROM: 19.1.17
    "@types/react-dom": "18.3.5",
    "vite": "^5.0.0",            // Verify React 18 compat
    "typescript": "5.3.3"
  }
}
```

#### Code Changes Required:
1. **MUI v7 → v5 Breaking Changes:**
   - [ ] Check for `sx` prop changes
   - [ ] Verify theme structure (ThemeProvider)
   - [ ] Check for deprecated components
   - [ ] Review color palette changes

2. **Remove React 19 specific code:**
   - [ ] Search for `use()` hook (React 19 only)
   - [ ] Check for Server Components usage
   - [ ] Verify no React 19-only APIs used

#### Actions:
```bash
cd apps/web

# Update package.json (manual edit)
# Clean install
rm -rf node_modules
pnpm install

# Typecheck
pnpm typecheck

# Build
pnpm build
```

#### Validation Checklist:
- [ ] Package.json updated with React 18.3.1
- [ ] MUI downgraded to v5.x
- [ ] @types/react downgraded to 18.3.x
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] App builds successfully: `pnpm build`
- [ ] Dev server runs: `pnpm dev`
- [ ] No React hook errors in console
- [ ] No "multiple React instances" warnings

---

### Phase 4: API Migration (apps/api) (30 minutes)
**Status:** ⬜ NOT STARTED

#### package.json Updates:
```json
{
  "dependencies": {
    "express": "^4.18.2",        // No change needed
    "prisma": "^5.22.0",          // Verify Node 20 compat
    "@prisma/client": "^5.22.0",  // Match Prisma version

    // All backend deps should be Node 20 compatible
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "@types/node": "20.17.10",   // Update to Node 20 types
    "@types/express": "^4.17.21"
  },
  "engines": {
    "node": ">=20.0.0"            // Update Node requirement
  }
}
```

#### Actions:
```bash
cd apps/api

# Update package.json
# Clean install
rm -rf node_modules
pnpm install

# Generate Prisma client with Node 20
pnpm prisma generate

# Typecheck
pnpm typecheck

# Run tests
pnpm test
```

#### Validation Checklist:
- [ ] @types/node updated to 20.x
- [ ] engines.node updated to >=20.0.0
- [ ] Prisma client regenerated
- [ ] No TypeScript errors
- [ ] All tests pass: `pnpm test`
- [ ] API server starts: `pnpm dev`
- [ ] Database connection works

---

### Phase 5: Shared Packages Migration (packages/*) (30 minutes)
**Status:** ⬜ NOT STARTED

#### packages/shared/package.json:
```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "@types/node": "20.17.10",
    "typescript": "5.3.3"
  },
  "peerDependencies": {
    "react": "^18.3.1"          // Update peer dep
  }
}
```

#### packages/ui/package.json:
```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-native": "0.73.6"
  },
  "devDependencies": {
    "@types/react": "18.3.12",
    "typescript": "5.3.3"
  }
}
```

#### Actions:
```bash
# Update each package
cd packages/shared && pnpm install
cd ../ui && pnpm install
cd ../database && pnpm install

# From root, rebuild all packages
cd ../..
pnpm build
```

#### Validation Checklist:
- [ ] All shared packages updated
- [ ] Peer dependencies specify React 18.x
- [ ] All packages typecheck successfully
- [ ] Turborepo build succeeds: `pnpm build`

---

### Phase 6: Configuration Cleanup (30 minutes)
**Status:** ⬜ NOT STARTED

#### Files to Update:

1. **.npmrc (ROOT):**
   ```ini
   # Simplify - remove React 19 workarounds
   public-hoist-pattern[]=*eslint*
   public-hoist-pattern[]=*prettier*
   shamefully-hoist=false

   # Remove these React 19-specific workarounds:
   # hoist=false  <-- REMOVE
   # public-hoist-pattern[]=react  <-- REMOVE
   ```

2. **tsconfig.json files:**
   - [ ] Verify `lib` includes ESNext features
   - [ ] Confirm `moduleResolution` is correct
   - [ ] No React 19-specific compiler options

3. **.github/workflows/ci.yml:**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '20'  # Update from 24
   ```

#### Actions:
```bash
# Simplify .npmrc
# Update CI/CD workflows
# Commit configuration changes
```

#### Validation Checklist:
- [ ] .npmrc simplified (workarounds removed)
- [ ] CI/CD updated to Node 20
- [ ] tsconfig files verified
- [ ] No outdated configuration files

---

### Phase 7: Full Clean Install (30 minutes)
**Status:** ⬜ NOT STARTED

#### Complete Workspace Reset:
```bash
# From root directory

# Remove all node_modules and lock files
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm pnpm-lock.yaml

# Clear pnpm cache (optional but recommended)
pnpm store prune

# Fresh install from root
pnpm install

# Verify no peer dependency warnings
# Should see clean install output
```

#### Expected Output:
```
✓ All dependencies installed successfully
✓ No peer dependency conflicts
✓ Lockfile generated
```

#### Validation Checklist:
- [ ] All node_modules deleted
- [ ] pnpm-lock.yaml regenerated
- [ ] Zero peer dependency warnings
- [ ] Install completes without errors
- [ ] Total install time reasonable (<5 minutes)

---

### Phase 8: Testing & Validation (2-3 hours)
**Status:** ⬜ NOT STARTED

#### Automated Tests:
```bash
# From root directory

# Run all unit tests
pnpm test

# Run type checking across all packages
pnpm typecheck

# Lint all code
pnpm lint

# Build all packages
pnpm build
```

#### Test Results Tracking:
- [ ] **Unit Tests:** ___/38 passing (baseline: 38)
- [ ] **TypeScript:** Zero errors
- [ ] **Linting:** Zero critical errors
- [ ] **Build:** All packages build successfully

#### Manual Testing - Web App:
- [ ] **Auth Flow:**
  - [ ] Login with test credentials
  - [ ] Logout
  - [ ] Token refresh works

- [ ] **Properties Page:**
  - [ ] Load properties list
  - [ ] Create new property
  - [ ] Edit existing property
  - [ ] Delete property

- [ ] **Work Orders Page:**
  - [ ] Load work orders list
  - [ ] Create new work order
  - [ ] Assign contractor
  - [ ] Upload photo
  - [ ] Change status

- [ ] **No Console Errors:**
  - [ ] No React hook errors
  - [ ] No "multiple React" warnings
  - [ ] No dependency warnings

#### Manual Testing - Mobile App (Expo Go):
- [ ] **App Launches:** Expo Go loads app without crashes
- [ ] **Auth Flow:** Login/logout works
- [ ] **Properties:** CRUD operations work
- [ ] **Work Orders:** Create and edit work orders
- [ ] **Camera:** Photo capture works
- [ ] **Offline Mode (if dev build):**
  - [ ] WatermelonDB initializes without errors
  - [ ] Offline create/edit works
  - [ ] Sync queue processes correctly

#### Mobile Development Build Testing:
```bash
# Build development version with native modules
cd apps/mobile
npx expo prebuild
npx expo run:android  # or run:ios

# Test native features:
```
- [ ] **WatermelonDB:** Database initializes correctly
- [ ] **Offline Sync:** Create work order offline
- [ ] **Network Toggle:** Airplane mode → sync when restored
- [ ] **Camera:** Native camera access works

#### Performance Validation:
- [ ] **Web Build Size:** Check bundle size hasn't increased
- [ ] **API Response Times:** No regression in response times
- [ ] **Mobile App Size:** Similar to pre-migration

---

### Phase 9: Documentation Updates (1 hour)
**Status:** ⬜ NOT STARTED

#### Documents to Update:

1. **README.md:**
   - [ ] Update tech stack section (React 18.3.1, Node 20 LTS)
   - [ ] Remove "Known Issues" section
   - [ ] Update getting started guide
   - [ ] Add "Recent Changes" note about migration

2. **docs/architecture.md:**
   - [ ] Update Tech Stack table (versions)
   - [ ] Add ADR for migration decision
   - [ ] Update troubleshooting section

3. **docs/architecture/tech-stack.md:**
   - [ ] Update all package versions
   - [ ] Remove workaround code examples
   - [ ] Update "Key Technology Trade-offs" section

4. **SPRINT_STATUS.md:**
   - [ ] Mark migration complete
   - [ ] Document migration results
   - [ ] Update timeline

5. **Create MIGRATION_RESULTS.md:**
   - [ ] Document migration process
   - [ ] Record before/after metrics
   - [ ] List lessons learned
   - [ ] Archive for future reference

#### Actions:
```bash
# Update all documentation files
# Commit changes
git add docs/
git commit -m "docs: update architecture docs post-migration"
```

#### Validation Checklist:
- [ ] README.md updated
- [ ] Architecture docs updated
- [ ] Migration results documented
- [ ] All references to React 19 removed

---

### Phase 10: Finalization & Deployment (30 minutes)
**Status:** ⬜ NOT STARTED

#### Git Workflow:
```bash
# Ensure all changes committed
git status

# Create comprehensive commit
git add .
git commit -m "chore: migrate to React 18.3.1 and Node 20 LTS

- Downgrade React 19.x → 18.3.1 for stability
- Downgrade Node 24 → Node 20 LTS
- Downgrade MUI 7.x → 5.x for compatibility
- Downgrade Expo SDK 54 → 52
- Remove 156 lines of React 19 workaround code
- Simplify .npmrc configuration
- Eliminate all peer dependency warnings
- Update CI/CD to Node 20

BREAKING: Requires Node 20 LTS minimum
MIGRATION: See docs/MIGRATION_PLAN.md

Fixes: React hook errors, pnpm install failures
Closes: #[ticket-number]"

# Push to remote
git push origin migration/react18-node20

# Create PR
gh pr create --title "chore: Migrate to stable tech stack (React 18 + Node 20)" \
  --body "$(cat <<'EOF'
## Summary
Migrate from bleeding-edge to stable tech stack to eliminate development overhead.

## Changes
- ✅ React 19.x → 18.3.1
- ✅ Node 24 → Node 20 LTS
- ✅ MUI 7.x → 5.x
- ✅ Expo SDK 54 → 52
- ✅ Remove 156 lines workaround code
- ✅ Zero peer dependency warnings

## Testing
- All 38 unit tests passing
- Manual testing complete (web + mobile)
- Performance validated
- Documentation updated

## Impact
- Eliminates 150% development overhead
- Returns to normal velocity
- Production stability improved
- Developer confidence restored

## Migration Time
Total: 6.5 hours (as estimated)

Ref: docs/TECH_STACK_EVALUATION.md
Ref: docs/MIGRATION_PLAN.md
EOF
)"
```

#### Merge & Deploy:
- [ ] PR created and linked
- [ ] Code review requested
- [ ] CI/CD passes all checks
- [ ] PR approved
- [ ] Merge to main
- [ ] Deployment to staging
- [ ] Smoke tests on staging
- [ ] Deployment to production (if applicable)

#### Final Validation:
- [ ] Staging environment running React 18
- [ ] No errors in production logs
- [ ] Monitoring shows stable metrics
- [ ] Team notified of completion

---

## 📊 Migration Tracking Dashboard

### Timeline Tracking:

| Phase | Est. Time | Start | End | Actual Time | Status |
|-------|-----------|-------|-----|-------------|--------|
| 0. Pre-Migration | 30 min | ___ | ___ | ___ | ⬜ |
| 1. Root Updates | 30 min | ___ | ___ | ___ | ⬜ |
| 2. Mobile App | 1 hour | ___ | ___ | ___ | ⬜ |
| 3. Web App | 1 hour | ___ | ___ | ___ | ⬜ |
| 4. API | 30 min | ___ | ___ | ___ | ⬜ |
| 5. Shared Packages | 30 min | ___ | ___ | ___ | ⬜ |
| 6. Configuration | 30 min | ___ | ___ | ___ | ⬜ |
| 7. Clean Install | 30 min | ___ | ___ | ___ | ⬜ |
| 8. Testing | 2-3 hours | ___ | ___ | ___ | ⬜ |
| 9. Documentation | 1 hour | ___ | ___ | ___ | ⬜ |
| 10. Finalization | 30 min | ___ | ___ | ___ | ⬜ |
| **TOTAL** | **8 hours** | ___ | ___ | ___ | ⬜ |

### Success Metrics:

| Metric | Before | Target | Actual | Status |
|--------|--------|--------|--------|--------|
| React Hook Errors | Present | 0 | ___ | ⬜ |
| Peer Dependency Warnings | 6 | 0 | ___ | ⬜ |
| Workaround Code Lines | 156 | 0 | ___ | ⬜ |
| Unit Tests Passing | 38 | 38 | ___ | ⬜ |
| TypeScript Errors | ___ | 0 | ___ | ⬜ |
| Development Overhead | +150% | 0% | ___ | ⬜ |
| pnpm Install Failures | 3/session | 0 | ___ | ⬜ |

---

## 🚨 Rollback Plan

If migration fails or critical issues discovered:

### Rollback Steps:
```bash
# Revert to pre-migration state
git checkout main
git branch -D migration/react18-node20

# Or if already merged:
git revert [migration-commit-hash]

# Reinstall old dependencies
rm -rf node_modules pnpm-lock.yaml
nvm use 24  # Switch back to Node 24
pnpm install

# Verify rollback successful
pnpm dev
pnpm test
```

### Rollback Triggers:
- [ ] More than 10 failing tests after migration
- [ ] Critical functionality broken (auth, data access)
- [ ] Performance degradation >20%
- [ ] Production deployment failures
- [ ] Migration exceeds 12 hours

---

## 📞 Support & Escalation

### During Migration:
- **Blocker:** Any issue preventing progress >30 minutes
- **Escalation:** Document issue, seek team input
- **Timeout:** If Phase exceeds 2x estimated time, pause & reassess

### Post-Migration:
- **Bug Reports:** Document in GitHub Issues with `migration` label
- **Performance Issues:** Check CloudWatch metrics
- **Developer Issues:** Update migration docs with solutions

---

## ✅ Sign-Off

### Pre-Migration Approval:
- [ ] **Technical Architect:** Reviewed & Approved
- [ ] **Product Owner:** Impact Understood & Approved
- [ ] **Engineering Lead:** Timeline Approved

### Post-Migration Sign-Off:
- [ ] **Technical Architect:** _______________  Date: _______
- [ ] **QA Lead:** _______________  Date: _______
- [ ] **Product Owner:** _______________  Date: _______

---

## 📚 References

- [TECH_STACK_EVALUATION.md](./TECH_STACK_EVALUATION.md) - Root cause analysis
- [ARCHITECT_HANDOVER.md](../ARCHITECT_HANDOVER.md) - Decision rationale
- [architecture.md](./architecture.md) - Architecture overview
- [React 18.3 Docs](https://react.dev/blog/2024/04/25/react-19) - Migration guide
- [Node 20 LTS Release Notes](https://nodejs.org/en/blog/release/v20.0.0)

---

**Document Status:** ✅ READY FOR EXECUTION
**Next Action:** Begin Phase 0 - Pre-Migration Preparation
**Owner:** Development Team
**Last Updated:** 2025-10-28
