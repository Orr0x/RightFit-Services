# S1.2: Create packages/ui-cleaning Package

**Sprint**: Sprint 1 - Component Library Refactor
**Story Points**: 3
**Priority**: HIGH
**Estimated Time**: 1 day
**Status**: COMPLETED

---

## User Story

**As a** cleaning app developer
**I want** a shared cleaning-specific component library
**So that** cleaning features use consistent, reusable components across web and mobile apps

---

## Description

Create the `packages/ui-cleaning` package containing cleaning business-specific UI components used across the cleaning web application and potentially the mobile app.

This package builds on top of `@rightfit/ui-core` and eliminates 2,100+ lines of duplicated cleaning-specific component code.

---

## Acceptance Criteria

### Functional Requirements

**Package Setup**:
- [ ] Package created at `packages/ui-cleaning/`
- [ ] Package.json configured with correct name: `@rightfit/ui-cleaning`
- [ ] TypeScript configured (tsconfig.json)
- [ ] Vite configured for library mode (vite.config.ts)
- [ ] Package exports configured (barrel file: index.ts)
- [ ] Build script produces CommonJS and ES modules
- [ ] Depends on `@rightfit/ui-core` as peer dependency

**Components to Migrate** (8 cleaning-specific components):
- [ ] PropertyCard (Property display with address, type, owner)
- [ ] CleaningJobCard (Job card with status, date, property)
- [ ] CleaningChecklist (Interactive checklist with room tasks)
- [ ] GuestIssueCard (Issue card with priority, status, images)
- [ ] TimesheetCard (Worker timesheet entry card)
- [ ] CleaningScheduleCard (Recurring schedule display)
- [ ] WorkerAvailabilityCalendar (Worker schedule calendar)
- [ ] PropertyDetailsPanel (Full property information panel)

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
packages/ui-cleaning/
├── src/
│   ├── components/
│   │   ├── PropertyCard/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyCard.stories.tsx
│   │   │   ├── PropertyCard.test.tsx
│   │   │   └── index.ts
│   │   ├── CleaningJobCard/
│   │   ├── CleaningChecklist/
│   │   ├── GuestIssueCard/
│   │   ├── TimesheetCard/
│   │   ├── CleaningScheduleCard/
│   │   ├── WorkerAvailabilityCalendar/
│   │   └── PropertyDetailsPanel/
│   ├── types/
│   │   ├── property.ts
│   │   ├── cleaning-job.ts
│   │   ├── guest-issue.ts
│   │   └── worker.ts
│   ├── utils/
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
  "name": "@rightfit/ui-cleaning",
  "version": "0.1.0",
  "description": "Cleaning-specific UI components for RightFit Services",
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
    "storybook": "storybook dev -p 6007",
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

### Example Component: PropertyCard

```typescript
// packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx
import React from 'react';
import { Card, Badge } from '@rightfit/ui-core';
import type { Property } from '../../types/property';
import './PropertyCard.css';

export interface PropertyCardProps {
  /** Property data */
  property: Property;
  /** Click handler */
  onClick?: (property: Property) => void;
  /** Show owner information */
  showOwner?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * PropertyCard displays property information including address, type, and status.
 * Uses the core Card component with cleaning-specific styling.
 */
export const PropertyCard = React.forwardRef<HTMLDivElement, PropertyCardProps>(
  ({ property, onClick, showOwner = true, className = '' }, ref) => {
    const handleClick = () => {
      if (onClick) {
        onClick(property);
      }
    };

    return (
      <Card
        ref={ref}
        className={`rf-property-card ${className}`}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Property at ${property.address}`}
      >
        <div className="rf-property-card__header">
          <h3 className="rf-property-card__address">{property.address}</h3>
          <Badge variant={property.is_active ? 'success' : 'default'}>
            {property.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="rf-property-card__details">
          <div className="rf-property-card__detail">
            <span className="rf-property-card__label">Type:</span>
            <span className="rf-property-card__value">{property.property_type}</span>
          </div>

          {property.bedrooms && (
            <div className="rf-property-card__detail">
              <span className="rf-property-card__label">Bedrooms:</span>
              <span className="rf-property-card__value">{property.bedrooms}</span>
            </div>
          )}

          {property.bathrooms && (
            <div className="rf-property-card__detail">
              <span className="rf-property-card__label">Bathrooms:</span>
              <span className="rf-property-card__value">{property.bathrooms}</span>
            </div>
          )}

          {showOwner && property.landlord && (
            <div className="rf-property-card__detail">
              <span className="rf-property-card__label">Owner:</span>
              <span className="rf-property-card__value">
                {property.landlord.first_name} {property.landlord.last_name}
              </span>
            </div>
          )}
        </div>

        {property.special_instructions && (
          <div className="rf-property-card__instructions">
            <span className="rf-property-card__label">Instructions:</span>
            <p className="rf-property-card__instructions-text">
              {property.special_instructions}
            </p>
          </div>
        )}
      </Card>
    );
  }
);

PropertyCard.displayName = 'PropertyCard';
```

### Example Component: CleaningJobCard

```typescript
// packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx
import React from 'react';
import { Card, Badge, Button } from '@rightfit/ui-core';
import type { CleaningJob } from '../../types/cleaning-job';
import { formatJobStatus, getStatusVariant } from '../../utils/status-helpers';
import './CleaningJobCard.css';

export interface CleaningJobCardProps {
  /** Cleaning job data */
  job: CleaningJob;
  /** Click handler for the entire card */
  onClick?: (job: CleaningJob) => void;
  /** Handler for start button */
  onStart?: (job: CleaningJob) => void;
  /** Handler for complete button */
  onComplete?: (job: CleaningJob) => void;
  /** Show action buttons */
  showActions?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * CleaningJobCard displays cleaning job information with status and actions.
 * Uses core components with cleaning-specific business logic.
 */
export const CleaningJobCard = React.forwardRef<HTMLDivElement, CleaningJobCardProps>(
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
        className={`rf-cleaning-job-card ${className}`}
        onClick={onClick ? handleCardClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Cleaning job at ${job.property.address}`}
      >
        <div className="rf-cleaning-job-card__header">
          <div className="rf-cleaning-job-card__title-section">
            <h3 className="rf-cleaning-job-card__property">
              {job.property.address}
            </h3>
            <Badge variant={statusVariant}>
              {formatJobStatus(job.status)}
            </Badge>
          </div>
          <p className="rf-cleaning-job-card__date">
            {new Date(job.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="rf-cleaning-job-card__details">
          {job.cleaning_type && (
            <div className="rf-cleaning-job-card__detail">
              <span className="rf-cleaning-job-card__label">Type:</span>
              <span className="rf-cleaning-job-card__value">
                {job.cleaning_type}
              </span>
            </div>
          )}

          {job.assigned_worker && (
            <div className="rf-cleaning-job-card__detail">
              <span className="rf-cleaning-job-card__label">Worker:</span>
              <span className="rf-cleaning-job-card__value">
                {job.assigned_worker.first_name} {job.assigned_worker.last_name}
              </span>
            </div>
          )}

          {job.estimated_hours && (
            <div className="rf-cleaning-job-card__detail">
              <span className="rf-cleaning-job-card__label">Duration:</span>
              <span className="rf-cleaning-job-card__value">
                {job.estimated_hours}h
              </span>
            </div>
          )}
        </div>

        {showActions && (canStart || canComplete) && (
          <div className="rf-cleaning-job-card__actions">
            {canStart && onStart && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStart}
                aria-label="Start cleaning job"
              >
                Start Job
              </Button>
            )}
            {canComplete && onComplete && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleComplete}
                aria-label="Complete cleaning job"
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

CleaningJobCard.displayName = 'CleaningJobCard';
```

### Type Definitions

```typescript
// packages/ui-cleaning/src/types/property.ts
export interface Property {
  id: string;
  address: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  is_active: boolean;
  special_instructions?: string;
  landlord?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}
```

```typescript
// packages/ui-cleaning/src/types/cleaning-job.ts
export type CleaningJobStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface CleaningJob {
  id: string;
  status: CleaningJobStatus;
  scheduled_date: string;
  cleaning_type?: string;
  estimated_hours?: number;
  property: Property;
  assigned_worker?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}
```

### Utility Functions

```typescript
// packages/ui-cleaning/src/utils/status-helpers.ts
import type { CleaningJobStatus } from '../types/cleaning-job';

export function formatJobStatus(status: CleaningJobStatus): string {
  const statusMap: Record<CleaningJobStatus, string> = {
    pending: 'Pending',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
}

export function getStatusVariant(
  status: CleaningJobStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const variantMap: Record<CleaningJobStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
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
// packages/ui-cleaning/src/components/PropertyCard/PropertyCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PropertyCard } from './PropertyCard';
import type { Property } from '../../types/property';

const meta: Meta<typeof PropertyCard> = {
  title: 'Cleaning/PropertyCard',
  component: PropertyCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PropertyCard>;

const mockProperty: Property = {
  id: 'prop-1',
  address: '123 Main St, Apt 4B',
  property_type: 'Apartment',
  bedrooms: 2,
  bathrooms: 1,
  square_footage: 850,
  is_active: true,
  special_instructions: 'Key in lockbox. Code: 1234',
  landlord: {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@example.com',
  },
};

export const Active: Story = {
  args: {
    property: mockProperty,
  },
};

export const Inactive: Story = {
  args: {
    property: {
      ...mockProperty,
      is_active: false,
    },
  },
};

export const WithoutOwner: Story = {
  args: {
    property: mockProperty,
    showOwner: false,
  },
};

export const Clickable: Story = {
  args: {
    property: mockProperty,
    onClick: (property) => alert(`Clicked: ${property.address}`),
  },
};
```

```typescript
// packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CleaningJobCard } from './CleaningJobCard';
import type { CleaningJob } from '../../types/cleaning-job';

const meta: Meta<typeof CleaningJobCard> = {
  title: 'Cleaning/CleaningJobCard',
  component: CleaningJobCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CleaningJobCard>;

const mockJob: CleaningJob = {
  id: 'job-1',
  status: 'scheduled',
  scheduled_date: '2025-11-10T10:00:00Z',
  cleaning_type: 'Deep Clean',
  estimated_hours: 3,
  property: {
    id: 'prop-1',
    address: '123 Main St, Apt 4B',
    property_type: 'Apartment',
    is_active: true,
  },
  assigned_worker: {
    id: 'worker-1',
    first_name: 'Jane',
    last_name: 'Doe',
  },
};

export const Scheduled: Story = {
  args: {
    job: mockJob,
  },
};

export const InProgress: Story = {
  args: {
    job: {
      ...mockJob,
      status: 'in_progress',
    },
  },
};

export const Completed: Story = {
  args: {
    job: {
      ...mockJob,
      status: 'completed',
    },
  },
};

export const WithActions: Story = {
  args: {
    job: mockJob,
    onStart: (job) => alert(`Starting job: ${job.id}`),
    onComplete: (job) => alert(`Completing job: ${job.id}`),
  },
};

export const Clickable: Story = {
  args: {
    job: mockJob,
    onClick: (job) => alert(`Clicked job: ${job.id}`),
  },
};
```

---

## Implementation Steps

### Step 1: Package Setup (30 minutes)

```bash
# Create package directory
mkdir -p packages/ui-cleaning/src/components
cd packages/ui-cleaning

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
1. `property.ts` - Property interface
2. `cleaning-job.ts` - CleaningJob and status types
3. `guest-issue.ts` - GuestIssue types
4. `worker.ts` - Worker and timesheet types

### Step 3: Create Utility Functions (30 minutes)

Create utility files in `src/utils/`:
1. `status-helpers.ts` - Status formatting and color mapping
2. `date-helpers.ts` - Date formatting utilities

### Step 4: Migrate Components (3-4 hours)

**Order of Migration** (start with most used):
1. PropertyCard (used everywhere)
2. CleaningJobCard (most complex, used in multiple views)
3. CleaningChecklist (used in job details)
4. GuestIssueCard (used in issues list)
5. TimesheetCard (used in worker timesheet)
6. CleaningScheduleCard (used in schedule view)
7. WorkerAvailabilityCalendar (complex, used in scheduling)
8. PropertyDetailsPanel (used in property details)

For each component:
1. Copy from `apps/web-cleaning/src/components/`
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
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: 'prop-1',
    address: '123 Main St',
    property_type: 'Apartment',
    is_active: true,
  };

  it('renders without crashing', () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('displays property type', () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('Apartment')).toBeInTheDocument();
  });

  it('shows active badge', () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<PropertyCard property={mockProperty} onClick={handleClick} />);
    screen.getByLabelText(`Property at ${mockProperty.address}`).click();
    expect(handleClick).toHaveBeenCalledWith(mockProperty);
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

- [ ] All 8 cleaning-specific components migrated
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
- [ ] Committed to Git with message: "feat(ui-cleaning): create cleaning component library"

---

## Testing Instructions

### Manual Testing

1. **Build Test**:
   ```bash
   cd packages/ui-cleaning
   pnpm build
   # Should complete without errors
   ```

2. **Storybook Test**:
   ```bash
   pnpm storybook
   # Open http://localhost:6007
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
   - Verify PropertyCard uses Card from @rightfit/ui-core
   - Verify CleaningJobCard uses Button and Badge from @rightfit/ui-core
   - Verify all core components render with correct styling

2. **Props and Events**:
   - Test onClick handlers on all interactive components
   - Test disabled states
   - Test loading states where applicable

---

## Dependencies

**Blocks**:
- S1.4 (Migrate web-cleaning to use shared packages)

**Depends On**:
- S1.1 (Create ui-core package) - MUST be completed first

---

## Notes

- This package depends on `@rightfit/ui-core` being available
- Focus on PropertyCard, CleaningJobCard, and CleaningChecklist first
- Other components can be placeholders if time runs short
- Ensure all cleaning business logic is abstracted to utility functions
- Document any assumptions about data structure (may need API adjustments)

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
