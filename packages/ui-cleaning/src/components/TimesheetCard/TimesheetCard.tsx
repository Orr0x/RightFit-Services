import React from 'react';
import { Card, Badge } from '@rightfit/ui-core';
import './TimesheetCard.css';

export interface TimesheetEntry {
  id: string;
  worker: {
    first_name: string;
    last_name: string;
  };
  job: {
    property_address: string;
  };
  clock_in: string;
  clock_out?: string;
  total_hours?: number;
  notes?: string;
}

export interface TimesheetCardProps {
  /** Timesheet entry data */
  entry: TimesheetEntry;
  /** Click handler */
  onClick?: (entry: TimesheetEntry) => void;
  /** Show worker name */
  showWorker?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * TimesheetCard displays worker timesheet entry with clock in/out times.
 */
export const TimesheetCard = React.forwardRef<HTMLDivElement, TimesheetCardProps>(
  ({ entry, onClick, showWorker = true, className = '' }, ref) => {
    const isActive = !entry.clock_out;

    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const handleClick = () => {
      if (onClick) {
        onClick(entry);
      }
    };

    return (
      <Card
        ref={ref}
        className={`rf-timesheet-card ${className}`}
        onClick={onClick ? handleClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="rf-timesheet-card__header">
          <div className="rf-timesheet-card__title-section">
            <h3 className="rf-timesheet-card__property">
              {entry.job.property_address}
            </h3>
            <Badge variant={isActive ? 'primary' : 'success'}>
              {isActive ? 'Active' : 'Completed'}
            </Badge>
          </div>
          {showWorker && (
            <p className="rf-timesheet-card__worker">
              {entry.worker.first_name} {entry.worker.last_name}
            </p>
          )}
        </div>

        <div className="rf-timesheet-card__times">
          <div className="rf-timesheet-card__time">
            <span className="rf-timesheet-card__time-label">Clock In</span>
            <span className="rf-timesheet-card__time-value">
              {formatTime(entry.clock_in)}
            </span>
            <span className="rf-timesheet-card__time-date">
              {formatDate(entry.clock_in)}
            </span>
          </div>

          {entry.clock_out && (
            <div className="rf-timesheet-card__time">
              <span className="rf-timesheet-card__time-label">Clock Out</span>
              <span className="rf-timesheet-card__time-value">
                {formatTime(entry.clock_out)}
              </span>
              <span className="rf-timesheet-card__time-date">
                {formatDate(entry.clock_out)}
              </span>
            </div>
          )}

          {entry.total_hours !== undefined && (
            <div className="rf-timesheet-card__total">
              <span className="rf-timesheet-card__total-label">Total Hours</span>
              <span className="rf-timesheet-card__total-value">
                {entry.total_hours.toFixed(2)}h
              </span>
            </div>
          )}
        </div>

        {entry.notes && (
          <div className="rf-timesheet-card__notes">
            <span className="rf-timesheet-card__notes-label">Notes:</span>
            <p className="rf-timesheet-card__notes-text">{entry.notes}</p>
          </div>
        )}
      </Card>
    );
  }
);

TimesheetCard.displayName = 'TimesheetCard';
