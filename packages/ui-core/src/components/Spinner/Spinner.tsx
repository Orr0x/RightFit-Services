/**
 * Spinner Component
 * Loading indicator
 */

import React from 'react';
import './Spinner.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  const classes = ['rf-spinner', `rf-spinner-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg className={classes} viewBox="0 0 50 50" role="status" aria-label={label}>
      <circle
        className="rf-spinner-circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
      />
    </svg>
  );
};

Spinner.displayName = 'Spinner';
