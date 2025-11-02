import React from 'react'
import './Card.css'

/**
 * Card Component
 * US-UX-2: Component Library
 *
 * Flexible card container for displaying content with optional header, footer, and interactive states
 */

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'ghost'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant
  /** Padding size */
  padding?: CardPadding
  /** Make card clickable/hoverable */
  hoverable?: boolean
  /** Optional header content */
  header?: React.ReactNode
  /** Optional footer content */
  footer?: React.ReactNode
  /** Main content */
  children: React.ReactNode
  /** Full width */
  fullWidth?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable,
      header,
      footer,
      children,
      fullWidth,
      className,
      ...props
    },
    ref
  ) => {
    const cardClasses = [
      'card',
      `card-${variant}`,
      `card-padding-${padding}`,
      hoverable && 'card-hoverable',
      fullWidth && 'card-full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {header && <div className="card-header">{header}</div>}
        <div className="card-body">{children}</div>
        {footer && <div className="card-footer">{footer}</div>}
      </div>
    )
  }
)

Card.displayName = 'Card'

/**
 * CardHeader Component
 * Pre-styled header for cards with title and optional actions
 */

export interface CardHeaderProps {
  /** Title text */
  title: React.ReactNode
  /** Optional subtitle */
  subtitle?: React.ReactNode
  /** Optional action buttons/elements */
  actions?: React.ReactNode
  /** Optional icon */
  icon?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, actions, icon }) => {
  return (
    <div className="card-header-content">
      <div className="card-header-left">
        {icon && <div className="card-header-icon">{icon}</div>}
        <div className="card-header-text">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="card-header-actions">{actions}</div>}
    </div>
  )
}

CardHeader.displayName = 'CardHeader'

/**
 * CardSection Component
 * Divider section within card body
 */

export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title?: string
  /** Section content */
  children: React.ReactNode
  /** Add divider line above section */
  divider?: boolean
}

export const CardSection: React.FC<CardSectionProps> = ({
  title,
  children,
  divider,
  className,
  ...props
}) => {
  const sectionClasses = ['card-section', divider && 'card-section-divider', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={sectionClasses} {...props}>
      {title && <h4 className="card-section-title">{title}</h4>}
      <div className="card-section-content">{children}</div>
    </div>
  )
}

CardSection.displayName = 'CardSection'
