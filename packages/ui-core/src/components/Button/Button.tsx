/**
 * Button Component
 * Core UI component for user actions
 *
 * @packageDocumentation
 */

import React from 'react';
import './Button.css';

/** Button visual variants */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

/** Button size variants */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component
 * @public
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Makes the button take full width of its container */
  fullWidth?: boolean;
  /** Shows loading spinner and disables interaction */
  loading?: boolean;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  /** Button label content */
  children: React.ReactNode;
}

/**
 * Button component for user interactions
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * <Button variant="danger" loading>
 *   Deleting...
 * </Button>
 * ```
 *
 * @public
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      'rf-btn',
      `rf-btn-${variant}`,
      `rf-btn-${size}`,
      fullWidth && 'rf-btn-full-width',
      loading && 'rf-btn-loading',
      disabled && 'rf-btn-disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="rf-btn-spinner" aria-hidden="true">
            <svg className="rf-btn-spinner-icon" viewBox="0 0 24 24">
              <circle
                className="rf-btn-spinner-circle"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="3"
              />
            </svg>
          </span>
        )}
        {!loading && leftIcon && (
          <span className="rf-btn-icon rf-btn-icon-left" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="rf-btn-content">{children}</span>
        {!loading && rightIcon && (
          <span className="rf-btn-icon rf-btn-icon-right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
