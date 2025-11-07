import React from 'react';
import './Select.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: SelectSize;
  fullWidth?: boolean;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      options = [],
      className = '',
      id: providedId,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;

    const wrapperClasses = [
      'rf-select-wrapper',
      fullWidth && 'rf-select-wrapper-full-width',
    ].filter(Boolean).join(' ');

    const selectClasses = [
      'rf-select',
      `rf-select-${size}`,
      error && 'rf-select-error',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="rf-select-label">
            {label}
          </label>
        )}
        <div className="rf-select-container">
          <select
            ref={ref}
            id={id}
            className={selectClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          >
            {children || options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="rf-select-icon" aria-hidden="true">
            ▼
          </span>
        </div>
        {error && (
          <span id={`${id}-error`} className="rf-select-error-text" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${id}-helper`} className="rf-select-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
