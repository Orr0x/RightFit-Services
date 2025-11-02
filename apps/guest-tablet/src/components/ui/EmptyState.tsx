import React from 'react'
import './EmptyState.css'

/**
 * Empty State Component
 * US-UX-6: Create Empty States
 */

export interface EmptyStateProps {
  /** Illustration or icon */
  illustration?: React.ReactNode
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Primary action button */
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  /** Secondary action button */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
  size = 'md',
}) => {
  return (
    <div className={`empty-state empty-state-${size}`}>
      {illustration && <div className="empty-state-illustration">{illustration}</div>}

      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-description">{description}</p>}

        {(primaryAction || secondaryAction) && (
          <div className="empty-state-actions">
            {primaryAction && (
              <button className="btn btn-primary btn-md" onClick={primaryAction.onClick}>
                {primaryAction.icon && <span className="btn-icon btn-icon-left">{primaryAction.icon}</span>}
                <span>{primaryAction.label}</span>
              </button>
            )}
            {secondaryAction && (
              <button className="btn btn-secondary btn-md" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

EmptyState.displayName = 'EmptyState'
