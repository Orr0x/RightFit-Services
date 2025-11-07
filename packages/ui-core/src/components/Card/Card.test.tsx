import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardSection } from './Card';

describe('Card', () => {
  it('renders without crashing', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Card variant="default">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('rf-card-default');

    rerender(<Card variant="elevated">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('rf-card-elevated');
  });

  it('applies padding classes correctly', () => {
    const { rerender } = render(<Card padding="sm">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('rf-card-padding-sm');

    rerender(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('rf-card-padding-lg');
  });

  it('applies hoverable class when hoverable is true', () => {
    render(<Card hoverable>Hoverable content</Card>);
    expect(screen.getByText('Hoverable content').parentElement).toHaveClass('rf-card-hoverable');
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Card fullWidth>Full width content</Card>);
    expect(screen.getByText('Full width content').parentElement).toHaveClass('rf-card-full-width');
  });

  it('renders header when provided', () => {
    render(<Card header={<div>Header</div>}>Content</Card>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(<Card footer={<div>Footer</div>}>Content</Card>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<CardHeader title="Title" subtitle="Subtitle" />);
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<CardHeader title="Title" actions={<button>Action</button>} />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});

describe('CardSection', () => {
  it('renders children', () => {
    render(<CardSection>Section content</CardSection>);
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<CardSection title="Section Title">Content</CardSection>);
    expect(screen.getByText('Section Title')).toBeInTheDocument();
  });

  it('applies divider class when divider is true', () => {
    render(<CardSection divider>Content</CardSection>);
    expect(screen.getByText('Content').parentElement).toHaveClass('rf-card-section-divider');
  });
});
