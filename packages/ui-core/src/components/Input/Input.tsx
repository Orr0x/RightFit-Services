/**
 * Input Component
 * Form input with validation and accessibility features
 *
 * @packageDocumentation
 */

import React from 'react';
import './Input.css';

/** Input size variants */
export type InputSize = 'sm' | 'md' | 'lg';

/** Input visual variants */
export type InputVariant = 'default' | 'filled' | 'flushed';

/**
 * Props for the Input component
 * @public
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label text */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Size variant */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
  /** Optional suffix text (e.g., "USD", "%") */
  suffix?: string;
  /** Optional prefix text (e.g., "$", "#") */
  prefix?: string;
  /** Show required asterisk */
  showRequired?: boolean;
}

/**
 * Input component for form fields
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter email"
 *   required
 * />
 * ```
 *
 * @public
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      fullWidth = false,
      suffix,
      prefix,
      showRequired = false,
      disabled,
      className = '',
      id: providedId,
      required,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = React.useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const wrapperClasses = [
      'rf-input-wrapper',
      fullWidth && 'rf-input-wrapper-full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'rf-input',
      `rf-input-${size}`,
      `rf-input-${variant}`,
      error && 'rf-input-error',
      disabled && 'rf-input-disabled',
      leftIcon && 'rf-input-has-left-icon',
      rightIcon && 'rf-input-has-right-icon',
      prefix && 'rf-input-has-prefix',
      suffix && 'rf-input-has-suffix',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="rf-input-label">
            {label}
            {(showRequired || required) && (
              <span className="rf-input-required" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="rf-input-container">
          {leftIcon && <span className="rf-input-icon rf-input-icon-left">{leftIcon}</span>}
          {prefix && <span className="rf-input-prefix">{prefix}</span>}

          <input
            ref={ref}
            id={id}
            className={inputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [error && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />

          {suffix && <span className="rf-input-suffix">{suffix}</span>}
          {rightIcon && <span className="rf-input-icon rf-input-icon-right">{rightIcon}</span>}
        </div>

        {error && (
          <span id={errorId} className="rf-input-error-text" role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className="rf-input-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
