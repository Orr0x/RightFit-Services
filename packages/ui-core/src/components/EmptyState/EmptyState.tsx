import React from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`rf-empty-state ${className}`}>
      {icon && <div className="rf-empty-state-icon">{icon}</div>}
      <h3 className="rf-empty-state-title">{title}</h3>
      {description && <p className="rf-empty-state-description">{description}</p>}
      {action && <div className="rf-empty-state-action">{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
