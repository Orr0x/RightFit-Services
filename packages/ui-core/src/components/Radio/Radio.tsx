import React from 'react';
import './Radio.css';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: RadioSize;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      className = '',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;

    const wrapperClasses = [
      'rf-radio-wrapper',
      error && 'rf-radio-wrapper-error',
    ].filter(Boolean).join(' ');

    const containerClasses = [
      'rf-radio-container',
      `rf-radio-${size}`,
      props.disabled && 'rf-radio-disabled',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        <div className={containerClasses}>
          <input
            ref={ref}
            type="radio"
            id={id}
            className="rf-radio"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
          {label && (
            <label htmlFor={id} className="rf-radio-label">
              {label}
            </label>
          )}
        </div>
        {error && (
          <span id={`${id}-error`} className="rf-radio-error-text" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${id}-helper`} className="rf-radio-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
