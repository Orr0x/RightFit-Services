# S1.3: Create packages/ui-maintenance Package

**Sprint**: Sprint 1 - Component Library Refactor
**Story Points**: 3
**Priority**: HIGH
**Estimated Time**: 1 day
**Status**: Ready for Development

---

## User Story

**As a** maintenance app developer
**I want** a shared maintenance-specific component library
**So that** maintenance features use consistent, reusable components across web and mobile apps

---

## Description

Create the `packages/ui-maintenance` package containing maintenance business-specific UI components used across the maintenance web application and potentially the mobile app.

This package builds on top of `@rightfit/ui-core` and eliminates 1,800+ lines of duplicated maintenance-specific component code.

---

## Acceptance Criteria

### Functional Requirements

**Package Setup**:
- [ ] Package created at `packages/ui-maintenance/`
- [ ] Package.json configured with correct name: `@rightfit/ui-maintenance`
- [ ] TypeScript configured (tsconfig.json)
- [ ] Vite configured for library mode (vite.config.ts)
- [ ] Package exports configured (barrel file: index.ts)
- [ ] Build script produces CommonJS and ES modules
- [ ] Depends on `@rightfit/ui-core` as peer dependency

**Components to Migrate** (8 maintenance-specific components):
- [ ] MaintenanceRequestCard (Request card with priority, type, status)
- [ ] MaintenanceJobCard (Job card with technician, equipment, status)
- [ ] TechnicianCard (Technician profile card with skills, availability)
- [ ] EquipmentCard (Equipment card with specs, maintenance history)
- [ ] PartInventoryCard (Parts inventory card with stock levels)
- [ ] WorkOrderChecklist (Interactive work order task checklist)
- [ ] TechnicianScheduleCalendar (Technician availability calendar)
- [ ] PropertyMaintenancePanel (Property maintenance history panel)

**Component Quality Standards**:
- [ ] All components TypeScript strict mode compliant (zero `any` types)
- [ ] All components have proper prop types and interfaces
- [ ] All components support className prop for custom styling
- [ ] All components use `@rightfit/ui-core` components internally
- [ ] All components have JSDoc documentation
- [ ] All components export types for consumer apps

### Non-Functional Requirements

**Documentation**:
- [ ] Storybook configured and running (`npm run storybook`)
- [ ] Each component has Storybook story with all variants
- [ ] README.md with installation and usage examples
- [ ] CHANGELOG.md initialized

**Accessibility**:
- [ ] All interactive components keyboard accessible
- [ ] All components have proper ARIA labels
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Focus indicators visible

**Testing**:
- [ ] Vitest configured for unit testing
- [ ] Each component has basic unit test (renders without crashing)
- [ ] Test coverage >50% (aiming for 80% in future iterations)

**Build & Packaging**:
- [ ] `pnpm build` produces dist/ folder with types
- [ ] Package size <100KB (uncompressed)
- [ ] No peer dependency warnings

---

## Technical Specification

### Package Structure

```
packages/ui-maintenance/
├── src/
│   ├── components/
│   │   ├── MaintenanceRequestCard/
│   │   │   ├── MaintenanceRequestCard.tsx
│   │   │   ├── MaintenanceRequestCard.stories.tsx
│   │   │   ├── MaintenanceRequestCard.test.tsx
│   │   │   └── index.ts
│   │   ├── MaintenanceJobCard/
│   │   ├── TechnicianCard/
│   │   ├── EquipmentCard/
│   │   ├── PartInventoryCard/
│   │   ├── WorkOrderChecklist/
│   │   ├── TechnicianScheduleCalendar/
│   │   └── PropertyMaintenancePanel/
│   ├── types/
│   │   ├── maintenance-request.ts
│   │   ├── maintenance-job.ts
│   │   ├── technician.ts
│   │   ├── equipment.ts
│   │   └── part.ts
│   ├── utils/
│   │   ├── priority-helpers.ts
│   │   ├── status-helpers.ts
│   │   └── date-helpers.ts
│   └── index.ts (barrel export)
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

### package.json

```json
{
  "name": "@rightfit/ui-maintenance",
  "version": "0.1.0",
  "description": "Maintenance-specific UI components for RightFit Services",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/styles.css"
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc --emitDeclarationOnly",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "storybook": "storybook dev -p 6008",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@rightfit/ui-core": "^0.1.0"
  },
  "devDependencies": {
    "@rightfit/ui-core": "workspace:*",
    "@storybook/react": "^7.6.0",
    "@storybook/react-vite": "^7.6.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Example Component: MaintenanceRequestCard

```typescript
// packages/ui-maintenance/src/components/MaintenanceRequestCard/MaintenanceRequestCard.tsx
import React from 'react';
import { Card, Badge } from '@rightfit/ui-core';
import type { MaintenanceRequest } from '../../types/maintenance-request';
import { formatPriority, getPriorityVariant } from '../../utils/priority-helpers';
import './MaintenanceRequestCard.css';

export interface MaintenanceRequestCardProps {
  /** Maintenance request data */
  request: MaintenanceRequest;
  /** Click handler */
  onClick?: (request: MaintenanceRequest) => void;
  /** Show customer information */
  showCustomer?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * MaintenanceRequestCard displays maintenance request information including priority, type, and status.
 * Uses the core Card component with maintenance-specific styling.
 */
export const MaintenanceRequestCard = React.forwardRef<HTMLDivElement, MaintenanceRequestCardProps>(
  ({ request, onClick, showCustomer = true, className = '' }, ref) => {
    const priorityVariant = getPriorityVariant(request.priority);

    const handleClick = () => {
      if (onClick) {
        onClick(request);
      }
    };

    return (
      <Card
        ref={ref}
        className={`rf-maintenance-request-card ${className}`}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Maintenance request for ${request.property.address}`}
      >
        <div className="rf-maintenance-request-card__header">
          <div className="rf-maintenance-request-card__title-section">
            <h3 className="rf-maintenance-request-card__property">
              {request.property.address}
            </h3>
            <div className="rf-maintenance-request-card__badges">
              <Badge variant={priorityVariant}>
                {formatPriority(request.priority)}
              </Badge>
              <Badge variant="info">
                {request.request_type}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rf-maintenance-request-card__description">
          <p className="rf-maintenance-request-card__issue">
            {request.issue_description}
          </p>
        </div>

        <div className="rf-maintenance-request-card__details">
          <div className="rf-maintenance-request-card__detail">
            <span className="rf-maintenance-request-card__label">Status:</span>
            <span className="rf-maintenance-request-card__value">
              {request.status}
            </span>
          </div>

          <div className="rf-maintenance-request-card__detail">
            <span className="rf-maintenance-request-card__label">Requested:</span>
            <span className="rf-maintenance-request-card__value">
              {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>

          {showCustomer && request.customer && (
            <div className="rf-maintenance-request-card__detail">
              <span className="rf-maintenance-request-card__label">Customer:</span>
              <span className="rf-maintenance-request-card__value">
                {request.customer.first_name} {request.customer.last_name}
              </span>
            </div>
          )}

          {request.estimated_cost && (
            <div className="rf-maintenance-request-card__detail">
              <span className="rf-maintenance-request-card__label">Est. Cost:</span>
              <span className="rf-maintenance-request-card__value">
                ${request.estimated_cost.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  }
);

MaintenanceRequestCard.displayName = 'MaintenanceRequestCard';
```

### Example Component: MaintenanceJobCard

```typescript
// packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx
import React from 'react';
import { Card, Badge, Button } from '@rightfit/ui-core';
import type { MaintenanceJob } from '../../types/maintenance-job';
import { formatJobStatus, getStatusVariant } from '../../utils/status-helpers';
import './MaintenanceJobCard.css';

export interface MaintenanceJobCardProps {
  /** Maintenance job data */
  job: MaintenanceJob;
  /** Click handler for the entire card */
  onClick?: (job: MaintenanceJob) => void;
  /** Handler for start button */
  onStart?: (job: MaintenanceJob) => void;
  /** Handler for complete button */
  onComplete?: (job: MaintenanceJob) => void;
  /** Show action buttons */
  showActions?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * MaintenanceJobCard displays maintenance job information with status and actions.
 * Uses core components with maintenance-specific business logic.
 */
export const MaintenanceJobCard = React.forwardRef<HTMLDivElement, MaintenanceJobCardProps>(
  ({ job, onClick, onStart, onComplete, showActions = true, className = '' }, ref) => {
    const statusVariant = getStatusVariant(job.status);
    const canStart = job.status === 'scheduled' || job.status === 'pending';
    const canComplete = job.status === 'in_progress';

    const handleCardClick = () => {
      if (onClick) {
        onClick(job);
      }
    };

    const handleStart = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onStart) {
        onStart(job);
      }
    };

    const handleComplete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onComplete) {
        onComplete(job);
      }
    };

    return (
      <Card
        ref={ref}
        className={`rf-maintenance-job-card ${className}`}
        onClick={onClick ? handleCardClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Maintenance job at ${job.property.address}`}
      >
        <div className="rf-maintenance-job-card__header">
          <div className="rf-maintenance-job-card__title-section">
            <h3 className="rf-maintenance-job-card__property">
              {job.property.address}
            </h3>
            <Badge variant={statusVariant}>
              {formatJobStatus(job.status)}
            </Badge>
          </div>
          <p className="rf-maintenance-job-card__date">
            {new Date(job.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="rf-maintenance-job-card__details">
          {job.job_type && (
            <div className="rf-maintenance-job-card__detail">
              <span className="rf-maintenance-job-card__label">Type:</span>
              <span className="rf-maintenance-job-card__value">
                {job.job_type}
              </span>
            </div>
          )}

          {job.assigned_technician && (
            <div className="rf-maintenance-job-card__detail">
              <span className="rf-maintenance-job-card__label">Technician:</span>
              <span className="rf-maintenance-job-card__value">
                {job.assigned_technician.first_name} {job.assigned_technician.last_name}
              </span>
            </div>
          )}

          {job.estimated_hours && (
            <div className="rf-maintenance-job-card__detail">
              <span className="rf-maintenance-job-card__label">Duration:</span>
              <span className="rf-maintenance-job-card__value">
                {job.estimated_hours}h
              </span>
            </div>
          )}

          {job.parts_required && job.parts_required.length > 0 && (
            <div className="rf-maintenance-job-card__detail">
              <span className="rf-maintenance-job-card__label">Parts:</span>
              <span className="rf-maintenance-job-card__value">
                {job.parts_required.length} item(s)
              </span>
            </div>
          )}
        </div>

        {showActions && (canStart || canComplete) && (
          <div className="rf-maintenance-job-card__actions">
            {canStart && onStart && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStart}
                aria-label="Start maintenance job"
              >
                Start Job
              </Button>
            )}
            {canComplete && onComplete && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleComplete}
                aria-label="Complete maintenance job"
              >
                Complete Job
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }
);

MaintenanceJobCard.displayName = 'MaintenanceJobCard';
```

### Type Definitions

```typescript
// packages/ui-maintenance/src/types/maintenance-request.ts
export type MaintenanceRequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceRequestStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRequest {
  id: string;
  priority: MaintenanceRequestPriority;
  request_type: string;
  issue_description: string;
  status: MaintenanceRequestStatus;
  created_at: string;
  estimated_cost?: number;
  property: {
    id: string;
    address: string;
  };
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}
```

```typescript
// packages/ui-maintenance/src/types/maintenance-job.ts
export type MaintenanceJobStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface MaintenanceJob {
  id: string;
  status: MaintenanceJobStatus;
  scheduled_date: string;
  job_type?: string;
  estimated_hours?: number;
  property: {
    id: string;
    address: string;
  };
  assigned_technician?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  parts_required?: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}
```

```typescript
// packages/ui-maintenance/src/types/technician.ts
export interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills: string[];
  is_active: boolean;
  hourly_rate?: number;
}
```

### Utility Functions

```typescript
// packages/ui-maintenance/src/utils/priority-helpers.ts
import type { MaintenanceRequestPriority } from '../types/maintenance-request';

export function formatPriority(priority: MaintenanceRequestPriority): string {
  const priorityMap: Record<MaintenanceRequestPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };
  return priorityMap[priority] || priority;
}

export function getPriorityVariant(
  priority: MaintenanceRequestPriority
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const variantMap: Record<MaintenanceRequestPriority, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'error',
  };
  return variantMap[priority] || 'default';
}
```

```typescript
// packages/ui-maintenance/src/utils/status-helpers.ts
import type { MaintenanceJobStatus } from '../types/maintenance-job';

export function formatJobStatus(status: MaintenanceJobStatus): string {
  const statusMap: Record<MaintenanceJobStatus, string> = {
    pending: 'Pending',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
}

export function getStatusVariant(
  status: MaintenanceJobStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const variantMap: Record<MaintenanceJobStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    pending: 'warning',
    scheduled: 'info',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
  };
  return variantMap[status] || 'default';
}
```

---

## Example Storybook Stories

```typescript
// packages/ui-maintenance/src/components/MaintenanceRequestCard/MaintenanceRequestCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MaintenanceRequestCard } from './MaintenanceRequestCard';
import type { MaintenanceRequest } from '../../types/maintenance-request';

const meta: Meta<typeof MaintenanceRequestCard> = {
  title: 'Maintenance/MaintenanceRequestCard',
  component: MaintenanceRequestCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MaintenanceRequestCard>;

const mockRequest: MaintenanceRequest = {
  id: 'req-1',
  priority: 'high',
  request_type: 'Plumbing',
  issue_description: 'Leaking kitchen sink faucet',
  status: 'pending',
  created_at: '2025-11-07T10:00:00Z',
  estimated_cost: 150.00,
  property: {
    id: 'prop-1',
    address: '123 Main St, Apt 4B',
  },
  customer: {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@example.com',
  },
};

export const HighPriority: Story = {
  args: {
    request: mockRequest,
  },
};

export const UrgentPriority: Story = {
  args: {
    request: {
      ...mockRequest,
      priority: 'urgent',
      issue_description: 'Burst pipe in bathroom - flooding!',
    },
  },
};

export const LowPriority: Story = {
  args: {
    request: {
      ...mockRequest,
      priority: 'low',
      issue_description: 'Replace air filter in HVAC system',
    },
  },
};

export const WithoutCustomer: Story = {
  args: {
    request: mockRequest,
    showCustomer: false,
  },
};

export const Clickable: Story = {
  args: {
    request: mockRequest,
    onClick: (request) => alert(`Clicked: ${request.id}`),
  },
};
```

---

## Implementation Steps

### Step 1: Package Setup (30 minutes)

```bash
# Create package directory
mkdir -p packages/ui-maintenance/src/components
cd packages/ui-maintenance

# Initialize package
pnpm init

# Install dependencies
pnpm add -D react react-dom @types/react @types/react-dom
pnpm add -D vite @vitejs/plugin-react typescript
pnpm add -D vitest @vitest/ui
pnpm add -D @storybook/react @storybook/react-vite storybook
pnpm add @rightfit/ui-core@workspace:*
```

**Create configuration files**:
- `tsconfig.json` (TypeScript config, extends ui-core config)
- `vite.config.ts` (Vite library mode, externalize @rightfit/ui-core)
- `vitest.config.ts` (Vitest config)
- `.storybook/main.ts` (Storybook config)
- `.storybook/preview.ts` (Storybook preview with ui-core styles)

### Step 2: Create Type Definitions (30 minutes)

Create type files in `src/types/`:
1. `maintenance-request.ts` - MaintenanceRequest and priority types
2. `maintenance-job.ts` - MaintenanceJob and status types
3. `technician.ts` - Technician types
4. `equipment.ts` - Equipment types
5. `part.ts` - Part inventory types

### Step 3: Create Utility Functions (30 minutes)

Create utility files in `src/utils/`:
1. `priority-helpers.ts` - Priority formatting and color mapping
2. `status-helpers.ts` - Status formatting and color mapping
3. `date-helpers.ts` - Date formatting utilities

### Step 4: Migrate Components (3-4 hours)

**Order of Migration** (start with most used):
1. MaintenanceRequestCard (used everywhere)
2. MaintenanceJobCard (most complex, used in multiple views)
3. TechnicianCard (used in technician list)
4. WorkOrderChecklist (used in job details)
5. EquipmentCard (used in equipment list)
6. PartInventoryCard (used in parts inventory)
7. TechnicianScheduleCalendar (complex, used in scheduling)
8. PropertyMaintenancePanel (used in property details)

For each component:
1. Copy from `apps/web-maintenance/src/components/`
2. Replace primitive components with `@rightfit/ui-core` imports
3. Extract business logic to utility functions
4. Add TypeScript types
5. Add Storybook story with all variants
6. Add basic unit test
7. Export from component's `index.ts`
8. Add to main `index.ts`

### Step 5: Configure Storybook (30 minutes)

```bash
# Initialize Storybook
npx storybook@latest init --type react

# Update .storybook/preview.ts to include ui-core styles
# Start Storybook
pnpm storybook
```

Verify all components render correctly in Storybook.

### Step 6: Write Tests (1 hour)

Basic test template for each component:
```typescript
import { render, screen } from '@testing-library/react';
import { MaintenanceRequestCard } from './MaintenanceRequestCard';

describe('MaintenanceRequestCard', () => {
  const mockRequest = {
    id: 'req-1',
    priority: 'high',
    request_type: 'Plumbing',
    issue_description: 'Leaking sink',
    status: 'pending',
    created_at: '2025-11-07T10:00:00Z',
    property: {
      id: 'prop-1',
      address: '123 Main St',
    },
  };

  it('renders without crashing', () => {
    render(<MaintenanceRequestCard request={mockRequest} />);
    expect(screen.getByText('Leaking sink')).toBeInTheDocument();
  });

  it('displays priority badge', () => {
    render(<MaintenanceRequestCard request={mockRequest} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('displays request type', () => {
    render(<MaintenanceRequestCard request={mockRequest} />);
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<MaintenanceRequestCard request={mockRequest} onClick={handleClick} />);
    screen.getByLabelText(`Maintenance request for ${mockRequest.property.address}`).click();
    expect(handleClick).toHaveBeenCalledWith(mockRequest);
  });
});
```

### Step 7: Build & Verify (30 minutes)

```bash
# Build package
pnpm build

# Verify output
ls -la dist/
# Should see: index.js, index.cjs, index.d.ts, styles.css

# Run tests
pnpm test

# Build Storybook
pnpm build-storybook
```

---

## Definition of Done

- [ ] All 8 maintenance-specific components migrated
- [ ] Package builds successfully (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] Storybook runs and displays all components (`pnpm storybook`)
- [ ] All components have TypeScript types (zero `any`)
- [ ] All components use `@rightfit/ui-core` components internally
- [ ] All components have Storybook stories
- [ ] All components have basic unit tests
- [ ] README.md documents installation and usage
- [ ] Package exports correctly configured
- [ ] Type definitions exported for consumers
- [ ] Utility functions documented and tested
- [ ] Code reviewed
- [ ] Committed to Git with message: "feat(ui-maintenance): create maintenance component library"

---

## Testing Instructions

### Manual Testing

1. **Build Test**:
   ```bash
   cd packages/ui-maintenance
   pnpm build
   # Should complete without errors
   ```

2. **Storybook Test**:
   ```bash
   pnpm storybook
   # Open http://localhost:6008
   # Click through all components
   # Test all variants and interactions
   # Verify core components (Button, Card, Badge) render correctly
   ```

3. **Unit Test**:
   ```bash
   pnpm test
   # All tests should pass
   ```

4. **Type Check**:
   ```bash
   pnpm tsc --noEmit
   # Should have zero type errors
   ```

### Integration Testing

1. **Component Composition**:
   - Verify MaintenanceRequestCard uses Card from @rightfit/ui-core
   - Verify MaintenanceJobCard uses Button and Badge from @rightfit/ui-core
   - Verify all core components render with correct styling

2. **Props and Events**:
   - Test onClick handlers on all interactive components
   - Test priority and status variants render correctly
   - Test loading states where applicable

---

## Dependencies

**Blocks**:
- S1.5 (Migrate remaining apps to use shared packages)

**Depends On**:
- S1.1 (Create ui-core package) - MUST be completed first

---

## Notes

- This package depends on `@rightfit/ui-core` being available
- Focus on MaintenanceRequestCard, MaintenanceJobCard, and TechnicianCard first
- Other components can be placeholders if time runs short
- Ensure all maintenance business logic is abstracted to utility functions
- Document any assumptions about data structure (may need API adjustments)
- Priority system (low/medium/high/urgent) is central to maintenance workflow

---

## Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Created**: November 7, 2025
**Last Updated**: November 7, 2025
**Assigned To**: Frontend Developer
**Sprint**: Sprint 1 - Component Library Refactor
