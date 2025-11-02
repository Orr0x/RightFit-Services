import React from 'react'
import './Radio.css'

/**
 * Radio Component
 * US-UX-2: Component Library
 *
 * Accessible radio button for mutually exclusive selections
 */

export type RadioSize = 'sm' | 'md' | 'lg'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Label text */
  label?: React.ReactNode
  /** Optional description below label */
  description?: string
  /** Size variant */
  size?: RadioSize
  /** Error state */
  error?: boolean
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      size = 'md',
      error,
      disabled,
      className,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = providedId || generatedId
    const descriptionId = `${id}-description`

    const wrapperClasses = [
      'radio-wrapper',
      `radio-${size}`,
      error && 'radio-wrapper-error',
      disabled && 'radio-wrapper-disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const radioClasses = [
      'radio',
      error && 'radio-error',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={wrapperClasses}>
        <div className="radio-container">
          <input
            ref={ref}
            type="radio"
            id={id}
            className={radioClasses}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={description ? descriptionId : undefined}
            {...props}
          />

          <span className="radio-icon" aria-hidden="true">
            <span className="radio-dot" />
          </span>

          {label && (
            <div className="radio-label-wrapper">
              <label htmlFor={id} className="radio-label">
                {label}
              </label>
              {description && (
                <span id={descriptionId} className="radio-description">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Radio.displayName = 'Radio'

/**
 * RadioGroup Component
 * Container for grouping radio buttons
 */

export interface RadioGroupProps {
  /** Group label */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Group name (for radio button grouping) */
  name: string
  /** Currently selected value */
  value?: string
  /** onChange handler */
  onChange?: (value: string) => void
  /** Child Radio components */
  children: React.ReactNode
  /** Show required asterisk */
  showRequired?: boolean
  /** Disabled state for entire group */
  disabled?: boolean
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  error,
  helperText,
  name,
  value,
  onChange,
  children,
  showRequired,
  disabled,
}) => {
  const generatedId = React.useId()
  const errorId = `${generatedId}-error`
  const helperId = `${generatedId}-helper`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="radio-group">
      {label && (
        <div className="radio-group-label">
          {label}
          {showRequired && (
            <span className="radio-group-required" aria-label="required">
              *
            </span>
          )}
        </div>
      )}

      <div
        className="radio-group-items"
        role="radiogroup"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          [error && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined
        }
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Radio) {
            return React.cloneElement(child as React.ReactElement<RadioProps>, {
              name,
              checked: value === child.props.value,
              onChange: handleChange,
              disabled: disabled || child.props.disabled,
              error: !!error,
            })
          }
          return child
        })}
      </div>

      {error && (
        <span id={errorId} className="radio-group-error-text" role="alert">
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={helperId} className="radio-group-helper-text">
          {helperText}
        </span>
      )}
    </div>
  )
}

RadioGroup.displayName = 'RadioGroup'
