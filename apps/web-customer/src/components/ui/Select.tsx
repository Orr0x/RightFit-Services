import React from 'react'
import './Select.css'

/**
 * Select Component
 * US-UX-2: Component Library
 *
 * Accessible dropdown select with custom styling
 */

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select label text */
  label?: string
  /** Error message to display */
  error?: string
  /** Helper text below select */
  helperText?: string
  /** Size variant */
  size?: SelectSize
  /** Full width */
  fullWidth?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Options array */
  options: SelectOption[]
  /** Show required asterisk */
  showRequired?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth,
      placeholder = 'Select an option...',
      options,
      showRequired,
      disabled,
      className,
      id: providedId,
      required,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    const wrapperClasses = [
      'select-wrapper',
      fullWidth && 'select-wrapper-full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const selectClasses = [
      'select',
      `select-${size}`,
      error && 'select-error',
      disabled && 'select-disabled',
      !value && 'select-placeholder',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="select-label">
            {label}
            {(showRequired || required) && (
              <span className="select-required" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="select-container">
          <select
            ref={ref}
            id={id}
            className={selectClasses}
            disabled={disabled}
            required={required}
            value={value}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [error && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom chevron icon */}
          <span className="select-icon" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {error && (
          <span id={errorId} className="select-error-text" role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className="select-helper-text">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
