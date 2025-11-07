# @rightfit/ui-core

Core UI component library for RightFit Services applications.

## Installation

```bash
# In the RightFit Services monorepo
pnpm add @rightfit/ui-core --filter <your-app>
```

## Usage

```tsx
import { Button, Card, CardHeader } from '@rightfit/ui-core';
import '@rightfit/ui-core/styles'; // Import global styles

function App() {
  return (
    <Card
      variant="elevated"
      header={<CardHeader title="Welcome" subtitle="Get started" />}
    >
      <p>Card content goes here</p>
      <Button variant="primary" onClick={() => console.log('Clicked!')}>
        Click Me
      </Button>
    </Card>
  );
}
```

## Available Components

### Button

Interactive button component with multiple variants and states.

```tsx
import { Button } from '@rightfit/ui-core';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// With icons
<Button leftIcon={<Icon />}>With Icon</Button>
<Button rightIcon={<Icon />}>With Icon</Button>

// Full width
<Button fullWidth>Full Width</Button>
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'` - Visual style
- `size?: 'sm' | 'md' | 'lg'` - Size
- `loading?: boolean` - Show loading spinner
- `disabled?: boolean` - Disable interaction
- `fullWidth?: boolean` - Take full width
- `leftIcon?: ReactNode` - Left icon
- `rightIcon?: ReactNode` - Right icon

### Card

Container component for displaying grouped content.

```tsx
import { Card, CardHeader, CardSection } from '@rightfit/ui-core';

// Basic card
<Card>Content</Card>

// With header
<Card header={<CardHeader title="Title" subtitle="Subtitle" />}>
  Content
</Card>

// With sections
<Card>
  <CardSection title="Section 1">Content 1</CardSection>
  <CardSection title="Section 2" divider>Content 2</CardSection>
</Card>

// Variants
<Card variant="default">Default</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="ghost">Ghost</Card>

// Interactive
<Card hoverable onClick={() => {}}>Clickable</Card>
```

**Card Props:**
- `variant?: 'default' | 'outlined' | 'elevated' | 'ghost'` - Visual style
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Internal padding
- `hoverable?: boolean` - Add hover effects
- `header?: ReactNode` - Header content
- `footer?: ReactNode` - Footer content
- `fullWidth?: boolean` - Take full width

**CardHeader Props:**
- `title: ReactNode` - Title text
- `subtitle?: ReactNode` - Subtitle text
- `actions?: ReactNode` - Action buttons
- `icon?: ReactNode` - Icon element

**CardSection Props:**
- `title?: string` - Section title
- `divider?: boolean` - Add divider line above

## Development

### Run Storybook

```bash
cd packages/ui-core
pnpm storybook
```

Open http://localhost:6006 to view all components.

### Run Tests

```bash
cd packages/ui-core
pnpm test              # Run tests
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Run with coverage
```

### Build Package

```bash
cd packages/ui-core
pnpm build
```

## Accessibility

All components are built with accessibility in mind:

- ✅ Keyboard navigation support
- ✅ ARIA labels and attributes
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ WCAG 2.1 AA color contrast

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

See the main [RightFit Services documentation](../../README.md) for contribution guidelines.

## License

Proprietary - RightFit Services

---

**Version**: 0.1.0
**Last Updated**: November 7, 2025
