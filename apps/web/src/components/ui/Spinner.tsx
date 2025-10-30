import React from 'react'
import './Spinner.css'

/**
 * Spinner Component
 * US-UX-2: Component Library
 *
 * Loading spinner for indicating loading states
 */

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'default' | 'primary' | 'white'

export interface SpinnerProps {
  /** Size variant */
  size?: SpinnerSize
  /** Color variant */
  variant?: SpinnerVariant
  /** Optional label for accessibility */
  label?: string
  /** Show with text */
  text?: string
  /** Center in container */
  centered?: boolean
  /** Additional CSS classes */
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  label = 'Loading...',
  text,
  centered,
  className,
}) => {
  const spinnerClasses = [
    'spinner',
    `spinner-${size}`,
    `spinner-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const wrapperClasses = ['spinner-wrapper', centered && 'spinner-centered']
    .filter(Boolean)
    .join(' ')

  const spinner = (
    <svg
      className={spinnerClasses}
      viewBox="0 0 50 50"
      role="status"
      aria-label={label}
    >
      <circle
        className="spinner-track"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
      />
      <circle
        className="spinner-circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
      />
    </svg>
  )

  if (text) {
    return (
      <div className={wrapperClasses}>
        {spinner}
        <span className="spinner-text">{text}</span>
      </div>
    )
  }

  if (centered) {
    return <div className={wrapperClasses}>{spinner}</div>
  }

  return spinner
}

Spinner.displayName = 'Spinner'

/**
 * LoadingOverlay Component
 * Full-screen or container overlay with spinner
 */

export interface LoadingOverlayProps {
  /** Show the overlay */
  visible: boolean
  /** Loading text */
  text?: string
  /** Blur background */
  blur?: boolean
  /** Spinner size */
  spinnerSize?: SpinnerSize
  /** Full screen or relative to parent */
  fullScreen?: boolean
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  blur = true,
  spinnerSize = 'lg',
  fullScreen = false,
}) => {
  if (!visible) return null

  const overlayClasses = [
    'loading-overlay',
    blur && 'loading-overlay-blur',
    fullScreen && 'loading-overlay-fullscreen',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={overlayClasses}>
      <div className="loading-overlay-content">
        <Spinner size={spinnerSize} variant="primary" />
        {text && <p className="loading-overlay-text">{text}</p>}
      </div>
    </div>
  )
}

LoadingOverlay.displayName = 'LoadingOverlay'
