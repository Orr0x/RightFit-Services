import React from 'react'
import './Input.css'

/**
 * Input Component
 * US-UX-2: Component Library
 *
 * A flexible input component with validation, error states, and accessibility features
 */

export type InputSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'default' | 'filled' | 'flushed'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label text */
  label?: string
  /** Error message to display */
  error?: string
  /** Helper text below input */
  helperText?: string
  /** Size variant */
  size?: InputSize
  /** Visual variant */
  variant?: InputVariant
  /** Icon to display on the left */
  leftIcon?: React.ReactNode
  /** Icon to display on the right */
  rightIcon?: React.ReactNode
  /** Full width */
  fullWidth?: boolean
  /** Optional suffix text (e.g., "USD", "%") */
  suffix?: string
  /** Optional prefix text (e.g., "$", "#") */
  prefix?: string
  /** Show required asterisk */
  showRequired?: boolean
}

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
      fullWidth,
      suffix,
      prefix,
      showRequired,
      disabled,
      className,
      id: providedId,
      required,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = React.useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    const wrapperClasses = [
      'input-wrapper',
      fullWidth && 'input-wrapper-full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const inputClasses = [
      'input',
      `input-${size}`,
      `input-${variant}`,
      error && 'input-error',
      disabled && 'input-disabled',
      leftIcon && 'input-has-left-icon',
      rightIcon && 'input-has-right-icon',
      prefix && 'input-has-prefix',
      suffix && 'input-has-suffix',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
            {(showRequired || required) && <span className="input-required" aria-label="required">*</span>}
          </label>
        )}

        <div className="input-container">
          {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
          {prefix && <span className="input-prefix">{prefix}</span>}

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

          {suffix && <span className="input-suffix">{suffix}</span>}
          {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
        </div>

        {error && (
          <span id={errorId} className="input-error-text" role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className="input-helper-text">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
