import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardSection } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated', 'ghost'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    hoverable: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'This is a default card with some content.',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'This is an outlined card.',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'This is an elevated card with a shadow.',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'This is a ghost card with no background.',
  },
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: 'Hover over this card to see the effect.',
  },
};

export const WithHeader: Story = {
  args: {
    header: <CardHeader title="Card Title" />,
    children: 'Card content goes here.',
  },
};

export const WithHeaderAndSubtitle: Story = {
  args: {
    header: <CardHeader title="Card Title" subtitle="Card subtitle" />,
    children: 'Card content with a subtitle in the header.',
  },
};

export const WithHeaderAndActions: Story = {
  args: {
    header: (
      <CardHeader
        title="Card Title"
        actions={<button style={{ padding: '0.5rem 1rem' }}>Action</button>}
      />
    ),
    children: 'Card with header actions.',
  },
};

export const WithSections: Story = {
  args: {
    header: <CardHeader title="Multi-Section Card" />,
    children: (
      <>
        <CardSection title="Section 1">
          Content for section 1
        </CardSection>
        <CardSection title="Section 2" divider>
          Content for section 2
        </CardSection>
        <CardSection title="Section 3" divider>
          Content for section 3
        </CardSection>
      </>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    children: 'Card with a footer.',
    footer: <div style={{ textAlign: 'right' }}>Footer content</div>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      <Card variant="default">Default Card</Card>
      <Card variant="outlined">Outlined Card</Card>
      <Card variant="elevated">Elevated Card</Card>
      <Card variant="ghost">Ghost Card</Card>
    </div>
  ),
};
