# @rightfit/ui-cleaning

Cleaning-specific UI components for RightFit Services, built on top of `@rightfit/ui-core`.

## Installation

```bash
npm install @rightfit/ui-cleaning @rightfit/ui-core
```

## Usage

```tsx
import { PropertyCard, CleaningJobCard } from '@rightfit/ui-cleaning';

function MyComponent() {
  const property = {
    id: '1',
    address: '123 Main St',
    property_type: 'Apartment',
    is_active: true,
  };

  return <PropertyCard property={property} />;
}
```

## Components

### PropertyCard
Displays property information with address, type, and status.

### CleaningJobCard
Displays cleaning job information with status, date, and actions.

### CleaningChecklist
Interactive checklist for tracking cleaning tasks by room.

### TimesheetCard
Worker timesheet entry card with clock in/out times.

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
