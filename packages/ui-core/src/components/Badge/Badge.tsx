import React from 'react';
import './Badge.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  return (
    <span className={`rf-badge rf-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
