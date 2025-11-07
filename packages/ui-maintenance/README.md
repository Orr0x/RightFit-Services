# @rightfit/ui-maintenance

Maintenance-specific UI components for RightFit Services, built on top of `@rightfit/ui-core`.

## Installation

```bash
npm install @rightfit/ui-maintenance @rightfit/ui-core
```

## Usage

```tsx
import { MaintenanceJobCard, WorkOrderCard } from '@rightfit/ui-maintenance';

function MyComponent() {
  const job = {
    id: '1',
    title: 'Fix Leaky Faucet',
    status: 'pending',
    priority: 'high',
    property: {
      address: '123 Main St',
    },
  };

  return <MaintenanceJobCard job={job} />;
}
```

## Components

### MaintenanceJobCard
Displays maintenance job information with status, priority, and actions.

### WorkOrderCard
Displays work order details with assigned technician and completion tracking.

### IssueCard
Displays maintenance issue with priority, status, and photo attachments.

## Development

```bash
# Build the package
npm run build

# Run tests
npm test

# Start Storybook
npm run storybook
```

## License

Proprietary
