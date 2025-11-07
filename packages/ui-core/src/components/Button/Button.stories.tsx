import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost', 'success'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes the button take full width',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Primary button - main call-to-action
 */
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

/**
 * Secondary button - alternative actions
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

/**
 * Danger button - destructive actions
 */
export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
};

/**
 * Success button - positive confirmation actions
 */
export const Success: Story = {
  args: {
    children: 'Confirm',
    variant: 'success',
  },
};

/**
 * Ghost button - low emphasis actions
 */
export const Ghost: Story = {
  args: {
    children: 'Cancel',
    variant: 'ghost',
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

/**
 * Medium size button (default)
 */
export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

/**
 * Loading state - shows spinner
 */
export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};

/**
 * Button with left icon
 */
export const WithLeftIcon: Story = {
  args: {
    children: 'Save',
    leftIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
};

/**
 * Button with right icon
 */
export const WithRightIcon: Story = {
  args: {
    children: 'Next',
    rightIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    ),
  },
};

/**
 * All variants side by side
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

/**
 * All sizes side by side
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
