/**
 * Card Component
 * Container component for displaying grouped content
 *
 * @packageDocumentation
 */

import React from 'react';
import './Card.css';

/** Card visual variants */
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'ghost';

/** Card padding sizes */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Props for the Card component
 * @public
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Padding size inside the card */
  padding?: CardPadding;
  /** Makes the card interactive with hover effects */
  hoverable?: boolean;
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Makes the card take full width */
  fullWidth?: boolean;
}

/**
 * Card component for displaying grouped content
 *
 * @example
 * ```tsx
 * <Card variant="elevated" header="Title">
 *   Card content goes here
 * </Card>
 * ```
 *
 * @public
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      header,
      footer,
      children,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const cardClasses = [
      'rf-card',
      `rf-card-${variant}`,
      `rf-card-padding-${padding}`,
      hoverable && 'rf-card-hoverable',
      fullWidth && 'rf-card-full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {header && <div className="rf-card-header">{header}</div>}
        <div className="rf-card-body">{children}</div>
        {footer && <div className="rf-card-footer">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Props for the CardHeader component
 * @public
 */
export interface CardHeaderProps {
  /** Title text or element */
  title: React.ReactNode;
  /** Optional subtitle text */
  subtitle?: React.ReactNode;
  /** Optional action buttons or elements */
  actions?: React.ReactNode;
  /** Optional icon element */
  icon?: React.ReactNode;
}

/**
 * Pre-styled header component for cards
 *
 * @example
 * ```tsx
 * <Card header={<CardHeader title="Card Title" subtitle="Subtitle" />}>
 *   Content
 * </Card>
 * ```
 *
 * @public
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  actions,
  icon,
}) => {
  return (
    <div className="rf-card-header-content">
      <div className="rf-card-header-left">
        {icon && <div className="rf-card-header-icon">{icon}</div>}
        <div className="rf-card-header-text">
          <h3 className="rf-card-title">{title}</h3>
          {subtitle && <p className="rf-card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="rf-card-header-actions">{actions}</div>}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

/**
 * Props for the CardSection component
 * @public
 */
export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title?: string;
  /** Section content */
  children: React.ReactNode;
  /** Add divider line above section */
  divider?: boolean;
}

/**
 * Section component for organizing content within cards
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardSection title="Section 1">Content 1</CardSection>
 *   <CardSection title="Section 2" divider>Content 2</CardSection>
 * </Card>
 * ```
 *
 * @public
 */
export const CardSection: React.FC<CardSectionProps> = ({
  title,
  children,
  divider = false,
  className = '',
  ...props
}) => {
  const sectionClasses = [
    'rf-card-section',
    divider && 'rf-card-section-divider',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={sectionClasses} {...props}>
      {title && <h4 className="rf-card-section-title">{title}</h4>}
      <div className="rf-card-section-content">{children}</div>
    </div>
  );
};

CardSection.displayName = 'CardSection';
