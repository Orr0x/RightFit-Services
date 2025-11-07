import React from 'react';
import './Textarea.css';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextareaSize;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      resize = 'vertical',
      className = '',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;

    const wrapperClasses = [
      'rf-textarea-wrapper',
      fullWidth && 'rf-textarea-wrapper-full-width',
    ].filter(Boolean).join(' ');

    const textareaClasses = [
      'rf-textarea',
      `rf-textarea-${size}`,
      `rf-textarea-resize-${resize}`,
      error && 'rf-textarea-error',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="rf-textarea-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <span id={`${id}-error`} className="rf-textarea-error-text" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${id}-helper`} className="rf-textarea-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
