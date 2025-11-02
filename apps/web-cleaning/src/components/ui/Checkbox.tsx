import React from 'react'
import './Checkbox.css'

/**
 * Checkbox Component
 * US-UX-2: Component Library
 *
 * Accessible checkbox with label and description support
 */

export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Label text */
  label?: React.ReactNode
  /** Optional description below label */
  description?: string
  /** Size variant */
  size?: CheckboxSize
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Indeterminate state (partially checked) */
  indeterminate?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      size = 'md',
      error,
      errorMessage,
      indeterminate,
      disabled,
      className,
      id: providedId,
      checked,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const descriptionId = `${id}-description`

    const checkboxRef = React.useRef<HTMLInputElement | null>(null)

    // Handle ref forwarding
    React.useImperativeHandle(ref, () => checkboxRef.current!)

    // Handle indeterminate state
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate || false
      }
    }, [indeterminate])

    const wrapperClasses = [
      'checkbox-wrapper',
      `checkbox-${size}`,
      error && 'checkbox-wrapper-error',
      disabled && 'checkbox-wrapper-disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const checkboxClasses = [
      'checkbox',
      error && 'checkbox-error',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={wrapperClasses}>
        <div className="checkbox-container">
          <input
            ref={checkboxRef}
            type="checkbox"
            id={id}
            className={checkboxClasses}
            disabled={disabled}
            checked={checked}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [description && descriptionId, error && errorMessage && errorId]
                .filter(Boolean)
                .join(' ') || undefined
            }
            {...props}
          />

          <span className="checkbox-icon" aria-hidden="true">
            {/* Checkmark icon */}
            <svg
              className="checkbox-check"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 4L6 11.5L2.5 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Indeterminate icon */}
            <svg
              className="checkbox-indeterminate"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>

          {label && (
            <div className="checkbox-label-wrapper">
              <label htmlFor={id} className="checkbox-label">
                {label}
              </label>
              {description && (
                <span id={descriptionId} className="checkbox-description">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>

        {error && errorMessage && (
          <span id={errorId} className="checkbox-error-text" role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
