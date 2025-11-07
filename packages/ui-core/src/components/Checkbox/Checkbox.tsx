import React from 'react';
import './Checkbox.css';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: CheckboxSize;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      indeterminate = false,
      className = '',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;
    const internalRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => internalRef.current!);

    // Handle indeterminate state
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const wrapperClasses = [
      'rf-checkbox-wrapper',
      error && 'rf-checkbox-wrapper-error',
    ].filter(Boolean).join(' ');

    const containerClasses = [
      'rf-checkbox-container',
      `rf-checkbox-${size}`,
      props.disabled && 'rf-checkbox-disabled',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        <div className={containerClasses}>
          <input
            ref={internalRef}
            type="checkbox"
            id={id}
            className="rf-checkbox"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
          {label && (
            <label htmlFor={id} className="rf-checkbox-label">
              {label}
            </label>
          )}
        </div>
        {error && (
          <span id={`${id}-error`} className="rf-checkbox-error-text" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${id}-helper`} className="rf-checkbox-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
