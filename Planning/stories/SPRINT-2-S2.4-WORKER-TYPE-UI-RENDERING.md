# S2.4: Worker Type UI Rendering

**Sprint**: Sprint 2 - Worker App Completion
**Story Points**: 3
**Priority**: MEDIUM
**Estimated Time**: 1 day
**Status**: ✅ COMPLETED (Implemented November 8, 2025)

---

## User Story

**As a** worker (cleaner OR maintenance technician)
**I want** to see only the jobs and features relevant to my worker type
**So that** I'm not confused by irrelevant content and can focus on my work

---

## Description

Implement conditional UI rendering in the web-worker app based on `worker_type` field:
- **CLEANER**: See only cleaning jobs, cleaning-specific features
- **MAINTENANCE**: See only maintenance jobs, maintenance-specific features
- **BOTH**: See both cleaning and maintenance jobs with clear labels

This prepares the worker app for **dual-use** (cleaning AND maintenance workers) and establishes patterns for future Sprint 7 (Maintenance Worker App).

---

## Acceptance Criteria

### Functional Requirements

**Worker Type Detection**:
- [ ] On login, fetch worker profile with `worker_type` field
- [ ] Store `worker_type` in auth context
- [ ] All components have access to worker type via context/hook

**Dashboard Rendering**:
- [ ] CLEANER workers see:
  - "Today's Cleaning Jobs" section
  - Stats: Cleaning jobs completed, hours worked
  - No maintenance content
- [ ] MAINTENANCE workers see:
  - "Today's Maintenance Jobs" section
  - Stats: Maintenance jobs completed, parts used
  - No cleaning content
- [ ] BOTH workers see:
  - "Today's Cleaning Jobs" section
  - "Today's Maintenance Jobs" section
  - Combined stats with clear labels

**Job List Rendering**:
- [ ] CLEANER workers:
  - `GET /api/cleaning-jobs/assigned-to-me` only
  - Job cards show CleaningJobCard component
  - Filter by cleaning statuses (Scheduled, In Progress, Completed)
- [ ] MAINTENANCE workers:
  - `GET /api/maintenance-jobs/assigned-to-me` only
  - Job cards show MaintenanceJobCard component
  - Filter by maintenance statuses (Pending, Quoted, Approved, In Progress, Completed)
- [ ] BOTH workers:
  - Fetch both cleaning and maintenance jobs
  - Tabs: "Cleaning Jobs" | "Maintenance Jobs"
  - Job type badge on each card

**Navigation Menu**:
- [ ] CLEANER workers see:
  - Dashboard
  - My Jobs (Cleaning)
  - Schedule
  - My Issues
  - Profile
- [ ] MAINTENANCE workers see:
  - Dashboard
  - My Jobs (Maintenance)
  - Schedule
  - My Issues
  - Parts & Tools (future)
  - Profile
- [ ] BOTH workers see:
  - Dashboard
  - Cleaning Jobs
  - Maintenance Jobs
  - Schedule
  - My Issues
  - Profile

**Job Details Page**:
- [ ] CleaningJob details show:
  - Cleaning checklist
  - Before/After photo upload
  - Complete button → CompleteJobModal
- [ ] MaintenanceJob details show:
  - Work order checklist
  - Parts used section
  - Complete button → Maintenance completion flow (simplified for now)
- [ ] Header badge shows job type (Cleaning | Maintenance)

**Empty States**:
- [ ] CLEANER with no jobs: "No cleaning jobs scheduled today"
- [ ] MAINTENANCE with no jobs: "No maintenance jobs scheduled today"
- [ ] BOTH with no cleaning jobs: "No cleaning jobs scheduled" (but maintenance jobs may exist)

### Non-Functional Requirements

**Type Safety**:
- [ ] worker_type is TypeScript enum: `'CLEANER' | 'MAINTENANCE' | 'BOTH'`
- [ ] All conditional rendering uses type guards
- [ ] No `any` types in worker type logic

**Performance**:
- [ ] No duplicate API calls (fetch worker type once on login)
- [ ] Conditional rendering does not cause re-renders
- [ ] Job list filtering happens on backend (not client-side)

**Maintainability**:
- [ ] Conditional rendering logic centralized in hooks
- [ ] Easy to add new worker types in future
- [ ] Component composition (not large if/else blocks)

---

## Technical Specification

### Worker Type Enum

```typescript
// apps/web-worker/src/types/worker.ts

export enum WorkerType {
  CLEANER = 'CLEANER',
  MAINTENANCE = 'MAINTENANCE',
  BOTH = 'BOTH',
}

export interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  worker_type: WorkerType;
  is_active: boolean;
  service_provider_id: string;
}
```

### Auth Context with Worker Type

```typescript
// apps/web-worker/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Worker, WorkerType } from '../types/worker';

interface AuthContextValue {
  user: Worker | null;
  workerType: WorkerType | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user on mount (if token exists)
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get('/workers/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', response.data.access_token);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerType: user?.worker_type || null,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Conditional Rendering Hook

```typescript
// apps/web-worker/src/hooks/useWorkerTypeFeatures.ts
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WorkerType } from '../types/worker';

export function useWorkerTypeFeatures() {
  const { workerType } = useAuth();

  return useMemo(() => {
    const isCleanerOnly = workerType === WorkerType.CLEANER;
    const isMaintenanceOnly = workerType === WorkerType.MAINTENANCE;
    const isBoth = workerType === WorkerType.BOTH;

    return {
      // Feature flags
      showCleaningJobs: isCleanerOnly || isBoth,
      showMaintenanceJobs: isMaintenanceOnly || isBoth,
      showCombinedView: isBoth,

      // Navigation items
      navigationItems: [
        { label: 'Dashboard', path: '/', icon: '🏠' },
        ...(isCleanerOnly
          ? [{ label: 'My Jobs', path: '/cleaning-jobs', icon: '🧹' }]
          : []),
        ...(isMaintenanceOnly
          ? [{ label: 'My Jobs', path: '/maintenance-jobs', icon: '🔧' }]
          : []),
        ...(isBoth
          ? [
              { label: 'Cleaning Jobs', path: '/cleaning-jobs', icon: '🧹' },
              { label: 'Maintenance Jobs', path: '/maintenance-jobs', icon: '🔧' },
            ]
          : []),
        { label: 'Schedule', path: '/schedule', icon: '📅' },
        { label: 'My Issues', path: '/issues', icon: '⚠️' },
        { label: 'Profile', path: '/profile', icon: '👤' },
      ],

      // Job type labels
      getJobTypeLabel: () => {
        if (isCleanerOnly) return 'Cleaning';
        if (isMaintenanceOnly) return 'Maintenance';
        return 'All Jobs';
      },
    };
  }, [workerType]);
}
```

### Dashboard with Conditional Rendering

```typescript
// apps/web-worker/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Spinner, EmptyState } from '@rightfit/ui-core';
import { CleaningJobCard } from '@rightfit/ui-cleaning';
import { MaintenanceJobCard } from '@rightfit/ui-maintenance';
import { useAuth } from '../contexts/AuthContext';
import { useWorkerTypeFeatures } from '../hooks/useWorkerTypeFeatures';
import { api } from '../lib/api';

export function Dashboard() {
  const { user } = useAuth();
  const { showCleaningJobs, showMaintenanceJobs, showCombinedView } = useWorkerTypeFeatures();

  const [cleaningJobs, setCleaningJobs] = useState([]);
  const [maintenanceJobs, setMaintenanceJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [showCleaningJobs, showMaintenanceJobs]);

  const loadJobs = async () => {
    try {
      const promises = [];

      if (showCleaningJobs) {
        promises.push(api.get('/cleaning-jobs/assigned-to-me?status=SCHEDULED'));
      }

      if (showMaintenanceJobs) {
        promises.push(api.get('/maintenance-jobs/assigned-to-me?status=PENDING,APPROVED'));
      }

      const results = await Promise.all(promises);

      if (showCleaningJobs) setCleaningJobs(results[0].data);
      if (showMaintenanceJobs) {
        const maintenanceIndex = showCleaningJobs ? 1 : 0;
        setMaintenanceJobs(results[maintenanceIndex].data);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.first_name}!</h1>

      {/* Cleaning Jobs Section */}
      {showCleaningJobs && (
        <section className="dashboard-section">
          <h2>Today's Cleaning Jobs</h2>
          {cleaningJobs.length === 0 ? (
            <EmptyState
              title="No cleaning jobs scheduled today"
              description="Check back later for new assignments"
            />
          ) : (
            <div className="jobs-grid">
              {cleaningJobs.map((job) => (
                <CleaningJobCard
                  key={job.id}
                  job={job}
                  onClick={() => navigate(`/cleaning-jobs/${job.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Maintenance Jobs Section */}
      {showMaintenanceJobs && (
        <section className="dashboard-section">
          <h2>Today's Maintenance Jobs</h2>
          {maintenanceJobs.length === 0 ? (
            <EmptyState
              title="No maintenance jobs scheduled today"
              description="Check back later for new assignments"
            />
          ) : (
            <div className="jobs-grid">
              {maintenanceJobs.map((job) => (
                <MaintenanceJobCard
                  key={job.id}
                  job={job}
                  onClick={() => navigate(`/maintenance-jobs/${job.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Stats Section */}
      <section className="dashboard-stats">
        {showCleaningJobs && (
          <Card className="stat-card">
            <h3>Cleaning Stats</h3>
            <p className="stat-value">12</p>
            <p className="stat-label">Jobs Completed This Week</p>
          </Card>
        )}

        {showMaintenanceJobs && (
          <Card className="stat-card">
            <h3>Maintenance Stats</h3>
            <p className="stat-value">5</p>
            <p className="stat-label">Jobs Completed This Week</p>
          </Card>
        )}
      </section>
    </div>
  );
}
```

### Navigation Component

```typescript
// apps/web-worker/src/components/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWorkerTypeFeatures } from '../hooks/useWorkerTypeFeatures';

export function Navigation() {
  const location = useLocation();
  const { navigationItems } = useWorkerTypeFeatures();

  return (
    <nav className="sidebar-navigation">
      {navigationItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

### API Endpoints

```typescript
// apps/api/src/routes/cleaning-jobs.ts

// GET /api/cleaning-jobs/assigned-to-me
router.get('/assigned-to-me', requireAuth, async (req, res) => {
  try {
    const workerId = req.user.worker_id;
    const { status } = req.query;

    const where: any = {
      assigned_worker_id: workerId,
    };

    if (status) {
      const statuses = (status as string).split(',');
      where.status = { in: statuses };
    }

    const jobs = await prisma.cleaningJob.findMany({
      where,
      include: {
        property: {
          select: {
            address: true,
          },
        },
        customer: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        scheduled_date: 'asc',
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching assigned jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});
```

---

## Implementation Steps

### Step 1: Update Worker Model (30 minutes)

**Database Migration**:
```bash
cd packages/database

# Add worker_type field if not exists
npx prisma migrate dev --name add_worker_type_enum
npx prisma generate
```

**Update schema.prisma**:
```prisma
model Worker {
  // ... existing fields
  worker_type String @default("CLEANER") // CLEANER | MAINTENANCE | BOTH
}
```

### Step 2: Create Auth Context (1.5 hours)

1. Create `AuthContext.tsx` with worker type support
2. Add `useAuth()` hook
3. Wrap app in `<AuthProvider>`
4. Test login flow fetches worker type

### Step 3: Create useWorkerTypeFeatures Hook (1 hour)

1. Create hook with feature flags
2. Add navigation items logic
3. Add job type label logic
4. Export for use in components

### Step 4: Update Dashboard (2 hours)

1. Use `useWorkerTypeFeatures()` hook
2. Conditionally fetch cleaning/maintenance jobs
3. Render appropriate job cards
4. Add empty states
5. Add stats section

### Step 5: Update Navigation (1 hour)

1. Use navigation items from hook
2. Render dynamic menu
3. Highlight active route
4. Test all worker types

### Step 6: Add API Endpoints (1.5 hours)

1. Add `GET /api/cleaning-jobs/assigned-to-me`
2. Add `GET /api/maintenance-jobs/assigned-to-me`
3. Support status filtering
4. Return only jobs assigned to authenticated worker

### Step 7: Testing (1.5 hours)

**Test CLEANER Worker**:
1. Login as CLEANER
2. Dashboard shows only cleaning jobs
3. Navigation shows "My Jobs" (cleaning)
4. Job list filters correctly

**Test MAINTENANCE Worker**:
1. Login as MAINTENANCE
2. Dashboard shows only maintenance jobs
3. Navigation shows "My Jobs" (maintenance)
4. Job list filters correctly

**Test BOTH Worker**:
1. Login as BOTH
2. Dashboard shows cleaning AND maintenance sections
3. Navigation shows separate "Cleaning Jobs" and "Maintenance Jobs"
4. Both job lists filter correctly

---

## Definition of Done

- [ ] Auth context includes worker_type
- [ ] useWorkerTypeFeatures hook created and tested
- [ ] Dashboard renders conditionally based on worker type
- [ ] Navigation renders correct menu items per worker type
- [ ] API endpoints filter jobs by assigned worker
- [ ] Empty states show correct messages
- [ ] Tested with CLEANER, MAINTENANCE, and BOTH worker types
- [ ] Type safety enforced (no `any` types)
- [ ] All acceptance criteria met
- [ ] Code reviewed
- [ ] Committed to Git with message: "feat(web-worker): implement conditional UI rendering based on worker type"

---

## Testing Instructions

### Setup Test Data

```sql
-- Create test workers with different types
UPDATE workers SET worker_type = 'CLEANER' WHERE email = 'worker1@cleaningco.test';
UPDATE workers SET worker_type = 'MAINTENANCE' WHERE email = 'tech1@maintenance.test';
UPDATE workers SET worker_type = 'BOTH' WHERE email = 'worker2@cleaningco.test';
```

### Manual Test Steps

**Test 1: CLEANER Worker**
1. Login as `worker1@cleaningco.test`
2. Dashboard shows "Today's Cleaning Jobs"
3. Navigation shows "My Jobs" (singular)
4. Click "My Jobs" → Shows cleaning jobs only
5. No maintenance content visible

**Expected**: ✅ Only cleaning features visible

**Test 2: MAINTENANCE Worker**
1. Login as `tech1@maintenance.test`
2. Dashboard shows "Today's Maintenance Jobs"
3. Navigation shows "My Jobs" (singular)
4. Click "My Jobs" → Shows maintenance jobs only
5. No cleaning content visible

**Expected**: ✅ Only maintenance features visible

**Test 3: BOTH Worker**
1. Login as `worker2@cleaningco.test`
2. Dashboard shows:
   - "Today's Cleaning Jobs" section
   - "Today's Maintenance Jobs" section
3. Navigation shows:
   - "Cleaning Jobs"
   - "Maintenance Jobs" (separate items)
4. Click each → Shows correct job type
5. Stats show combined view

**Expected**: ✅ Both features visible with clear separation

---

## Dependencies

**Depends On**:
- Sprint 1 (component library)
- S2.1 (Job Completion Modal) - Uses in cleaning flow
- Worker model with worker_type field

**Blocks**:
- Sprint 7 (Maintenance Worker App) - Establishes patterns

---

## Notes

- This story prepares for **dual-use worker app** (cleaning + maintenance)
- Pattern established here will be replicated in maintenance features (Sprint 7)
- Keep worker type logic centralized in hooks for maintainability
- Consider worker type when designing future features
- BOTH worker type is less common but must be supported
- Navigation should scale gracefully (don't overcrowd sidebar)

---

## Resources

- [Worker Type Enum](../../packages/database/prisma/schema.prisma)
- [React Context API](https://react.dev/reference/react/useContext)
- [Conditional Rendering Patterns](https://react.dev/learn/conditional-rendering)

---

**Created**: November 8, 2025
**Last Updated**: November 8, 2025
**Assigned To**: Frontend Developer
**Sprint**: Sprint 2 - Worker App Completion
