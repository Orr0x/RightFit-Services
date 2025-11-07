import React from 'react';
import { Card, Badge, Button } from '@rightfit/ui-core';
import type { MaintenanceJob } from '../../types/maintenance-job';
import { formatMaintenanceStatus, getMaintenanceStatusVariant, getPriorityVariant, formatPriority } from '../../utils/status-helpers';
import './MaintenanceJobCard.css';

export interface MaintenanceJobCardProps {
  /** Maintenance job data */
  job: MaintenanceJob;
  /** Click handler for the entire card */
  onClick?: (job: MaintenanceJob) => void;
  /** Handler for start button */
  onStart?: (job: MaintenanceJob) => void;
  /** Handler for complete button */
  onComplete?: (job: MaintenanceJob) => void;
  /** Show action buttons */
  showActions?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * MaintenanceJobCard displays maintenance job information with status, priority, and actions.
 */
export const MaintenanceJobCard = React.forwardRef<HTMLDivElement, MaintenanceJobCardProps>(
  ({ job, onClick, onStart, onComplete, showActions = true, className = '' }, ref) => {
    const statusVariant = getMaintenanceStatusVariant(job.status);
    const priorityVariant = getPriorityVariant(job.priority);
    const canStart = job.status === 'scheduled' || job.status === 'pending';
    const canComplete = job.status === 'in_progress';

    const handleCardClick = () => {
      if (onClick) {
        onClick(job);
      }
    };

    const handleStart = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onStart) {
        onStart(job);
      }
    };

    const handleComplete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onComplete) {
        onComplete(job);
      }
    };

    return (
      <Card
        ref={ref}
        className={`rf-maintenance-job-card ${className}`}
        onClick={onClick ? handleCardClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Maintenance job: ${job.title}`}
      >
        <div className="rf-maintenance-job-card__header">
          <div className="rf-maintenance-job-card__title-section">
            <h3 className="rf-maintenance-job-card__title">{job.title}</h3>
            <div className="rf-maintenance-job-card__badges">
              <Badge variant={statusVariant}>
                {formatMaintenanceStatus(job.status)}
              </Badge>
              <Badge variant={priorityVariant}>
                {formatPriority(job.priority)}
              </Badge>
            </div>
          </div>
          <p className="rf-maintenance-job-card__property">
            {job.property.address}
          </p>
        </div>

        {job.description && (
          <p className="rf-maintenance-job-card__description">
            {job.description}
          </p>
        )}

        <div className="rf-maintenance-job-card__details">
          {job.scheduled_date && (
            <div className="rf-maintenance-job-card__detail">
              <span className="rf-maintenance-job-card__label">Scheduled:</span>
              <span className="rf-maintenance-job-card__value">
                {new Date(job.scheduled_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {job.assigned_worker && (
            <div className="rf-maintenance-job-card__detail">
              <span className="rf-maintenance-job-card__label">Assigned:</span>
              <span className="rf-maintenance-job-card__value">
                {job.assigned_worker.first_name} {job.assigned_worker.last_name}
              </span>
            </div>
          )}

          {job.estimated_cost !== undefined && (
            <div className="rf-maintenance-job-card__detail">
              <span className="rf-maintenance-job-card__label">Est. Cost:</span>
              <span className="rf-maintenance-job-card__value">
                ${job.estimated_cost.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {showActions && (canStart || canComplete) && (
          <div className="rf-maintenance-job-card__actions">
            {canStart && onStart && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStart}
                aria-label="Start maintenance job"
              >
                Start Job
              </Button>
            )}
            {canComplete && onComplete && (
              <Button
                variant="success"
                size="sm"
                onClick={handleComplete}
                aria-label="Complete maintenance job"
              >
                Complete Job
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }
);

MaintenanceJobCard.displayName = 'MaintenanceJobCard';
