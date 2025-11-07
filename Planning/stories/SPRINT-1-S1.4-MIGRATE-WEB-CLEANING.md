# S1.4: Migrate web-cleaning to Shared Packages

**Sprint**: Sprint 1 - Component Library Refactor
**Story Points**: 2
**Priority**: HIGH
**Estimated Time**: 4-6 hours
**Status**: Ready for Development

---

## User Story

**As a** cleaning app maintainer
**I want** to replace all local components with shared package components
**So that** the cleaning app uses the component library and eliminates duplicated code

---

## Description

Migrate the `apps/web-cleaning` application to use the newly created shared component packages (`@rightfit/ui-core` and `@rightfit/ui-cleaning`).

This migration will:
- Remove 2,100+ lines of duplicated component code from web-cleaning
- Standardize UI components across all applications
- Make the codebase easier to maintain and update
- Ensure consistent UX

---

## Acceptance Criteria

### Functional Requirements

**Package Installation**:
- [ ] `@rightfit/ui-core` added to web-cleaning dependencies
- [ ] `@rightfit/ui-cleaning` added to web-cleaning dependencies
- [ ] Packages build correctly when running `pnpm install` at root

**Component Migration** (12 core + 8 cleaning components):

**Core Components**:
- [ ] Replace local Button with `@rightfit/ui-core`
- [ ] Replace local Card with `@rightfit/ui-core`
- [ ] Replace local Input with `@rightfit/ui-core`
- [ ] Replace local Select with `@rightfit/ui-core`
- [ ] Replace local Modal with `@rightfit/ui-core`
- [ ] Replace local Toast with `@rightfit/ui-core`
- [ ] Replace local Spinner with `@rightfit/ui-core`
- [ ] Replace local Badge with `@rightfit/ui-core`
- [ ] Replace local EmptyState with `@rightfit/ui-core`
- [ ] Replace local Checkbox with `@rightfit/ui-core`
- [ ] Replace local Radio with `@rightfit/ui-core`
- [ ] Replace local Textarea with `@rightfit/ui-core`

**Cleaning Components**:
- [ ] Replace local PropertyCard with `@rightfit/ui-cleaning`
- [ ] Replace local CleaningJobCard with `@rightfit/ui-cleaning`
- [ ] Replace local CleaningChecklist with `@rightfit/ui-cleaning`
- [ ] Replace local GuestIssueCard with `@rightfit/ui-cleaning`
- [ ] Replace local TimesheetCard with `@rightfit/ui-cleaning`
- [ ] Replace local CleaningScheduleCard with `@rightfit/ui-cleaning`
- [ ] Replace local WorkerAvailabilityCalendar with `@rightfit/ui-cleaning`
- [ ] Replace local PropertyDetailsPanel with `@rightfit/ui-cleaning`

**Code Cleanup**:
- [ ] Delete all replaced component files from `apps/web-cleaning/src/components/`
- [ ] Update all imports throughout the codebase
- [ ] Remove unused styles (if any)
- [ ] Update any component tests to use new imports

**Verification**:
- [ ] Application builds without errors (`pnpm build`)
- [ ] Application runs in dev mode without errors (`pnpm dev`)
- [ ] All pages render correctly
- [ ] All user flows work as before
- [ ] No console errors or warnings

### Non-Functional Requirements

**Testing**:
- [ ] All existing tests still pass
- [ ] Manual smoke test of all major features
- [ ] Visual regression check (components look the same)

**Documentation**:
- [ ] Update web-cleaning README with new dependencies
- [ ] Document any breaking changes or differences
- [ ] Add migration notes for future reference

**Performance**:
- [ ] Bundle size not significantly increased
- [ ] No performance degradation in dev mode
- [ ] Build time comparable or better

---

## Technical Specification

### Package Installation

Update `apps/web-cleaning/package.json`:

```json
{
  "name": "@rightfit/web-cleaning",
  "dependencies": {
    "@rightfit/ui-core": "workspace:*",
    "@rightfit/ui-cleaning": "workspace:*",
    // ... other dependencies
  }
}
```

Run installation:
```bash
cd apps/web-cleaning
pnpm install
```

### Import Migration Pattern

**Before** (local components):
```typescript
// apps/web-cleaning/src/pages/Properties.tsx
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PropertyCard } from '../components/PropertyCard';
import { EmptyState } from '../components/EmptyState';
```

**After** (shared packages):
```typescript
// apps/web-cleaning/src/pages/Properties.tsx
import { Button, Card, EmptyState } from '@rightfit/ui-core';
import { PropertyCard } from '@rightfit/ui-cleaning';
```

### Files to Update

**Pages** (estimate 20-30 files):
- `src/pages/Properties.tsx`
- `src/pages/PropertyDetails.tsx`
- `src/pages/CleaningJobs.tsx`
- `src/pages/CleaningJobDetails.tsx`
- `src/pages/Schedule.tsx`
- `src/pages/Workers.tsx`
- `src/pages/Timesheets.tsx`
- `src/pages/GuestIssues.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Login.tsx`
- ... (all other page files)

**Layouts**:
- `src/layouts/MainLayout.tsx`
- `src/layouts/AuthLayout.tsx`

**Forms**:
- `src/forms/PropertyForm.tsx`
- `src/forms/CleaningJobForm.tsx`
- `src/forms/WorkerForm.tsx`
- ... (all form files)

**Components** (non-shared components that USE shared components):
- `src/components/Navigation.tsx`
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- ... (any remaining app-specific components)

### Files to Delete

After migration, delete replaced component directories:

```bash
# Core components to delete
rm -rf apps/web-cleaning/src/components/Button
rm -rf apps/web-cleaning/src/components/Card
rm -rf apps/web-cleaning/src/components/Input
rm -rf apps/web-cleaning/src/components/Select
rm -rf apps/web-cleaning/src/components/Modal
rm -rf apps/web-cleaning/src/components/Toast
rm -rf apps/web-cleaning/src/components/Spinner
rm -rf apps/web-cleaning/src/components/Badge
rm -rf apps/web-cleaning/src/components/EmptyState
rm -rf apps/web-cleaning/src/components/Checkbox
rm -rf apps/web-cleaning/src/components/Radio
rm -rf apps/web-cleaning/src/components/Textarea

# Cleaning components to delete
rm -rf apps/web-cleaning/src/components/PropertyCard
rm -rf apps/web-cleaning/src/components/CleaningJobCard
rm -rf apps/web-cleaning/src/components/CleaningChecklist
rm -rf apps/web-cleaning/src/components/GuestIssueCard
rm -rf apps/web-cleaning/src/components/TimesheetCard
rm -rf apps/web-cleaning/src/components/CleaningScheduleCard
rm -rf apps/web-cleaning/src/components/WorkerAvailabilityCalendar
rm -rf apps/web-cleaning/src/components/PropertyDetailsPanel
```

### Example Migration: Properties Page

**Before**:
```typescript
// apps/web-cleaning/src/pages/Properties.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PropertyCard } from '../components/PropertyCard';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { api } from '../lib/api';
import { PropertyForm } from '../forms/PropertyForm';

export function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ... component logic

  return (
    <div className="properties-page">
      <div className="properties-page__header">
        <h1>Properties</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Add Property
        </Button>
      </div>

      <Card className="properties-page__filters">
        <Input
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <Spinner size="lg" />
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Add your first property to get started"
          action={
            <Button onClick={() => setShowAddModal(true)}>
              Add Property
            </Button>
          }
        />
      ) : (
        <div className="properties-page__grid">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Property"
      >
        <PropertyForm
          onSuccess={() => {
            setShowAddModal(false);
            loadProperties();
          }}
        />
      </Modal>
    </div>
  );
}
```

**After**:
```typescript
// apps/web-cleaning/src/pages/Properties.tsx
import React, { useState, useEffect } from 'react';
import { Button, Card, EmptyState, Spinner, Input, Modal } from '@rightfit/ui-core';
import { PropertyCard } from '@rightfit/ui-cleaning';
import { api } from '../lib/api';
import { PropertyForm } from '../forms/PropertyForm';

export function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ... component logic (UNCHANGED)

  return (
    <div className="properties-page">
      <div className="properties-page__header">
        <h1>Properties</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Add Property
        </Button>
      </div>

      <Card className="properties-page__filters">
        <Input
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <Spinner size="lg" />
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Add your first property to get started"
          action={
            <Button onClick={() => setShowAddModal(true)}>
              Add Property
            </Button>
          }
        />
      ) : (
        <div className="properties-page__grid">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Property"
      >
        <PropertyForm
          onSuccess={() => {
            setShowAddModal(false);
            loadProperties();
          }}
        />
      </Modal>
    </div>
  );
}
```

**Changes**:
- ✅ Import statements updated to use shared packages
- ✅ Component logic completely unchanged
- ✅ Props remain the same (API compatibility maintained)

---

## Implementation Steps

### Step 1: Install Packages (10 minutes)

```bash
# From root directory
cd apps/web-cleaning

# Add dependencies
pnpm add @rightfit/ui-core@workspace:* @rightfit/ui-cleaning@workspace:*

# Install from root
cd ../..
pnpm install
```

Verify packages are linked correctly:
```bash
ls -la apps/web-cleaning/node_modules/@rightfit/
# Should see symlinks to packages/ui-core and packages/ui-cleaning
```

### Step 2: Create Import Map (30 minutes)

Create a tracking document to map old imports to new ones:

```markdown
# Component Migration Map

## Core Components (@rightfit/ui-core)
- [x] Button: 42 usages
- [x] Card: 38 usages
- [x] Input: 56 usages
- [x] Select: 23 usages
- [x] Modal: 15 usages
- [x] Toast: 8 usages
- [x] Spinner: 31 usages
- [x] Badge: 27 usages
- [x] EmptyState: 12 usages
- [x] Checkbox: 18 usages
- [x] Radio: 9 usages
- [x] Textarea: 14 usages

## Cleaning Components (@rightfit/ui-cleaning)
- [x] PropertyCard: 8 usages
- [x] CleaningJobCard: 12 usages
- [x] CleaningChecklist: 3 usages
- [x] GuestIssueCard: 5 usages
- [x] TimesheetCard: 4 usages
- [x] CleaningScheduleCard: 6 usages
- [x] WorkerAvailabilityCalendar: 2 usages
- [x] PropertyDetailsPanel: 1 usage
```

Use grep to find all usages:
```bash
cd apps/web-cleaning/src
grep -r "from '../components/Button'" . | wc -l
grep -r "from '../../components/Button'" . | wc -l
```

### Step 3: Migrate Imports (2-3 hours)

Use find-and-replace systematically:

**Find**: `from '../components/Button'`
**Replace**: `from '@rightfit/ui-core'`

**Find**: `from '../../components/Button'`
**Replace**: `from '@rightfit/ui-core'`

**Find**: `from '../../../components/Button'`
**Replace**: `from '@rightfit/ui-core'`

Repeat for all components. Consider using VS Code's multi-cursor or batch replace.

**Pro Tip**: Use a script to automate this:

```bash
#!/bin/bash
# migrate-imports.sh

# Core components
for component in Button Card Input Select Modal Toast Spinner Badge EmptyState Checkbox Radio Textarea; do
  find apps/web-cleaning/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from ['\"]\.\.\/components\/$component['\"]|from '@rightfit/ui-core'|g"
  find apps/web-cleaning/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from ['\"]\.\.\/\.\.\/components\/$component['\"]|from '@rightfit/ui-core'|g"
  find apps/web-cleaning/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from ['\"]\.\.\/\.\.\/\.\.\/components\/$component['\"]|from '@rightfit/ui-core'|g"
done

# Cleaning components
for component in PropertyCard CleaningJobCard CleaningChecklist GuestIssueCard TimesheetCard CleaningScheduleCard WorkerAvailabilityCalendar PropertyDetailsPanel; do
  find apps/web-cleaning/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from ['\"]\.\.\/components\/$component['\"]|from '@rightfit/ui-cleaning'|g"
  find apps/web-cleaning/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from ['\"]\.\.\/\.\.\/components\/$component['\"]|from '@rightfit/ui-cleaning'|g"
  find apps/web-cleaning/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from ['\"]\.\.\/\.\.\/\.\.\/components\/$component['\"]|from '@rightfit/ui-cleaning'|g"
done

echo "Import migration complete!"
```

### Step 4: Delete Old Components (15 minutes)

```bash
cd apps/web-cleaning/src/components

# Delete core components
rm -rf Button Card Input Select Modal Toast Spinner Badge EmptyState Checkbox Radio Textarea

# Delete cleaning components
rm -rf PropertyCard CleaningJobCard CleaningChecklist GuestIssueCard TimesheetCard CleaningScheduleCard WorkerAvailabilityCalendar PropertyDetailsPanel

# Verify deletion
ls -la
# Should only see app-specific components (Navigation, Header, Sidebar, etc.)
```

### Step 5: Build & Test (1 hour)

```bash
cd apps/web-cleaning

# Type check
pnpm tsc --noEmit
# Fix any type errors

# Build
pnpm build
# Should build successfully

# Run in dev mode
pnpm dev
# Visit http://localhost:5173
# Test all pages manually
```

### Step 6: Run Tests (30 minutes)

```bash
# Run unit tests
pnpm test

# If tests fail, update test imports
# Example:
# Before: import { Button } from '../components/Button';
# After: import { Button } from '@rightfit/ui-core';
```

### Step 7: Visual Regression Check (30 minutes)

Manually test all major user flows:

1. **Properties**:
   - [ ] View properties list
   - [ ] Add new property
   - [ ] Edit property
   - [ ] View property details

2. **Cleaning Jobs**:
   - [ ] View jobs list
   - [ ] Create new job
   - [ ] Start job
   - [ ] Complete job
   - [ ] View job checklist

3. **Workers**:
   - [ ] View workers list
   - [ ] Add worker
   - [ ] View worker schedule
   - [ ] Submit timesheet

4. **Guest Issues**:
   - [ ] View issues list
   - [ ] Create issue
   - [ ] Update issue status

5. **Schedule**:
   - [ ] View calendar
   - [ ] Create recurring schedule

---

## Definition of Done

- [ ] All component imports migrated to shared packages
- [ ] All old component files deleted
- [ ] Application builds without errors
- [ ] Application runs in dev mode without errors
- [ ] All existing tests pass
- [ ] Manual smoke test complete (all features work)
- [ ] No console errors or warnings
- [ ] Visual appearance unchanged (no regressions)
- [ ] README updated with new dependencies
- [ ] Code reviewed
- [ ] Committed to Git with message: "refactor(web-cleaning): migrate to shared component packages"

---

## Testing Instructions

### Build Testing

```bash
cd apps/web-cleaning

# Clean build
rm -rf dist node_modules/.vite
pnpm build

# Verify build output
ls -la dist/
# Should see index.html, assets/ folder with JS/CSS bundles
```

### Dev Mode Testing

```bash
pnpm dev
# Open http://localhost:5173
# Check browser console for errors
```

### Manual Testing Checklist

- [ ] Login page renders
- [ ] Dashboard loads
- [ ] Properties list displays
- [ ] Property cards clickable
- [ ] Add property modal opens
- [ ] Property form works
- [ ] Cleaning jobs list displays
- [ ] Job cards show correct status badges
- [ ] Job actions (start/complete) work
- [ ] Workers list displays
- [ ] Worker calendar renders
- [ ] Timesheet submission works
- [ ] Guest issues list displays
- [ ] Issue cards show correct priority
- [ ] Schedule calendar displays
- [ ] All buttons clickable
- [ ] All forms submittable
- [ ] All modals open/close correctly

---

## Dependencies

**Depends On**:
- S1.1 (Create ui-core package) - MUST be completed
- S1.2 (Create ui-cleaning package) - MUST be completed

**Blocks**:
- S1.5 (Migrate remaining apps)

---

## Notes

- This is a refactoring story - functionality should not change
- Take a systematic approach: migrate one component type at a time
- Test frequently during migration to catch issues early
- If any component doesn't work exactly the same, fix the shared package (don't work around it)
- Document any API differences between old and new components
- This story proves the component library strategy works

---

## Rollback Plan

If migration causes critical issues:

1. Revert commit: `git revert HEAD`
2. Or restore old components from git history
3. Remove package dependencies from package.json
4. Run `pnpm install`

---

## Resources

- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [Vite Dependency Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

**Created**: November 7, 2025
**Last Updated**: November 7, 2025
**Assigned To**: Frontend Developer
**Sprint**: Sprint 1 - Component Library Refactor
