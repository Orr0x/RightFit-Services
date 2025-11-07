import React from 'react';
import { Card, Badge } from '@rightfit/ui-core';
import type { Issue } from '../../types/issue';
import { formatIssueStatus, getIssueStatusVariant, getPriorityVariant, formatPriority } from '../../utils/status-helpers';
import './IssueCard.css';

export interface IssueCardProps {
  issue: Issue;
  onClick?: (issue: Issue) => void;
  showPhotos?: boolean;
  className?: string;
}

export const IssueCard = React.forwardRef<HTMLDivElement, IssueCardProps>(
  ({ issue, onClick, showPhotos = true, className = '' }, ref) => {
    const statusVariant = getIssueStatusVariant(issue.status);
    const priorityVariant = getPriorityVariant(issue.priority);

    return (
      <Card
        ref={ref}
        className={`rf-issue-card ${className}`}
        onClick={onClick ? () => onClick(issue) : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="rf-issue-card__header">
          <div className="rf-issue-card__title-section">
            <h3 className="rf-issue-card__title">{issue.title}</h3>
            <div className="rf-issue-card__badges">
              <Badge variant={statusVariant}>{formatIssueStatus(issue.status)}</Badge>
              <Badge variant={priorityVariant}>{formatPriority(issue.priority)}</Badge>
            </div>
          </div>
          <p className="rf-issue-card__property">{issue.property.address}</p>
        </div>

        <p className="rf-issue-card__description">{issue.description}</p>

        <div className="rf-issue-card__details">
          {issue.category && (
            <div className="rf-issue-card__detail">
              <span className="rf-issue-card__label">Category:</span>
              <span className="rf-issue-card__value">
                {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
              </span>
            </div>
          )}
          {issue.reported_by && (
            <div className="rf-issue-card__detail">
              <span className="rf-issue-card__label">Reported by:</span>
              <span className="rf-issue-card__value">{issue.reported_by.name}</span>
            </div>
          )}
          <div className="rf-issue-card__detail">
            <span className="rf-issue-card__label">Reported:</span>
            <span className="rf-issue-card__value">
              {new Date(issue.reported_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {showPhotos && issue.photos && issue.photos.length > 0 && (
          <div className="rf-issue-card__photos">
            <span className="rf-issue-card__photos-label">
              {issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''} attached
            </span>
          </div>
        )}
      </Card>
    );
  }
);

IssueCard.displayName = 'IssueCard';
