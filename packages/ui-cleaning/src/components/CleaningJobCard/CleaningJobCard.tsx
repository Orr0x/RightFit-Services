import React from 'react';
import { Card, Badge, Button } from '@rightfit/ui-core';
import type { CleaningJob } from '../../types/cleaning-job';
import { formatJobStatus, getStatusVariant } from '../../utils/status-helpers';
import './CleaningJobCard.css';

export interface CleaningJobCardProps {
  /** Cleaning job data */
  job: CleaningJob;
  /** Click handler for the entire card */
  onClick?: (job: CleaningJob) => void;
  /** Handler for start button */
  onStart?: (job: CleaningJob) => void;
  /** Handler for complete button */
  onComplete?: (job: CleaningJob) => void;
  /** Show action buttons */
  showActions?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * CleaningJobCard displays cleaning job information with status and actions.
 * Uses core components with cleaning-specific business logic.
 */
export const CleaningJobCard = React.forwardRef<HTMLDivElement, CleaningJobCardProps>(
  ({ job, onClick, onStart, onComplete, showActions = true, className = '' }, ref) => {
    const statusVariant = getStatusVariant(job.status);
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
        className={`rf-cleaning-job-card ${className}`}
        onClick={onClick ? handleCardClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Cleaning job at ${job.property.address}`}
      >
        <div className="rf-cleaning-job-card__header">
          <div className="rf-cleaning-job-card__title-section">
            <h3 className="rf-cleaning-job-card__property">
              {job.property.address}
            </h3>
            <Badge variant={statusVariant}>
              {formatJobStatus(job.status)}
            </Badge>
          </div>
          <p className="rf-cleaning-job-card__date">
            {new Date(job.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="rf-cleaning-job-card__details">
          {job.cleaning_type && (
            <div className="rf-cleaning-job-card__detail">
              <span className="rf-cleaning-job-card__label">Type:</span>
              <span className="rf-cleaning-job-card__value">
                {job.cleaning_type}
              </span>
            </div>
          )}

          {job.assigned_worker && (
            <div className="rf-cleaning-job-card__detail">
              <span className="rf-cleaning-job-card__label">Worker:</span>
              <span className="rf-cleaning-job-card__value">
                {job.assigned_worker.first_name} {job.assigned_worker.last_name}
              </span>
            </div>
          )}

          {job.estimated_hours && (
            <div className="rf-cleaning-job-card__detail">
              <span className="rf-cleaning-job-card__label">Duration:</span>
              <span className="rf-cleaning-job-card__value">
                {job.estimated_hours}h
              </span>
            </div>
          )}
        </div>

        {showActions && (canStart || canComplete) && (
          <div className="rf-cleaning-job-card__actions">
            {canStart && onStart && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStart}
                aria-label="Start cleaning job"
              >
                Start Job
              </Button>
            )}
            {canComplete && onComplete && (
              <Button
                variant="success"
                size="sm"
                onClick={handleComplete}
                aria-label="Complete cleaning job"
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

CleaningJobCard.displayName = 'CleaningJobCard';
