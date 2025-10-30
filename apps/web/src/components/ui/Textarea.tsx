import React from 'react'
import './Textarea.css'

/**
 * Textarea Component
 * US-UX-2: Component Library
 *
 * Multi-line text input with auto-resize option and character counting
 */

export type TextareaSize = 'sm' | 'md' | 'lg'

export interface TextareaProps extends React.TextAreaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label text */
  label?: string
  /** Error message to display */
  error?: string
  /** Helper text below textarea */
  helperText?: string
  /** Size variant */
  size?: TextareaSize
  /** Full width */
  fullWidth?: boolean
  /** Show character count */
  showCount?: boolean
  /** Auto-resize height based on content */
  autoResize?: boolean
  /** Show required asterisk */
  showRequired?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth,
      showCount,
      autoResize,
      showRequired,
      disabled,
      className,
      id: providedId,
      maxLength,
      required,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    const [charCount, setCharCount] = React.useState(0)
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    // Handle ref forwarding
    React.useImperativeHandle(ref, () => textareaRef.current!)

    // Auto-resize logic
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [value, autoResize])

    // Character count
    React.useEffect(() => {
      if (showCount && value) {
        setCharCount(String(value).length)
      }
    }, [value, showCount])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) {
        setCharCount(e.target.value.length)
      }
      onChange?.(e)
    }

    const wrapperClasses = [
      'textarea-wrapper',
      fullWidth && 'textarea-wrapper-full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const textareaClasses = [
      'textarea',
      `textarea-${size}`,
      error && 'textarea-error',
      disabled && 'textarea-disabled',
      autoResize && 'textarea-auto-resize',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={wrapperClasses}>
        <div className="textarea-header">
          {label && (
            <label htmlFor={id} className="textarea-label">
              {label}
              {(showRequired || required) && (
                <span className="textarea-required" aria-label="required">
                  *
                </span>
              )}
            </label>
          )}

          {showCount && maxLength && (
            <span className="textarea-count">
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={textareaRef}
          id={id}
          className={textareaClasses}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            [error && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined
          }
          {...props}
        />

        {error && (
          <span id={errorId} className="textarea-error-text" role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className="textarea-helper-text">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
