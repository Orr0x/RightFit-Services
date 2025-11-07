import React from 'react';
import { Card, Checkbox } from '@rightfit/ui-core';
import './CleaningChecklist.css';

export interface ChecklistItem {
  id: string;
  room: string;
  task: string;
  completed: boolean;
}

export interface CleaningChecklistProps {
  /** Checklist items grouped by room */
  items: ChecklistItem[];
  /** Handler when item is toggled */
  onToggle?: (itemId: string, completed: boolean) => void;
  /** Show room headers */
  showRooms?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * CleaningChecklist displays an interactive checklist for tracking cleaning tasks.
 * Tasks can be grouped by room with completion tracking.
 */
export const CleaningChecklist: React.FC<CleaningChecklistProps> = ({
  items,
  onToggle,
  showRooms = true,
  className = '',
}) => {
  // Group items by room
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.room]) {
      acc[item.room] = [];
    }
    acc[item.room].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const handleToggle = (itemId: string, completed: boolean) => {
    if (onToggle) {
      onToggle(itemId, completed);
    }
  };

  // Calculate completion percentage
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className={`rf-cleaning-checklist ${className}`}>
      <div className="rf-cleaning-checklist__header">
        <h3 className="rf-cleaning-checklist__title">Cleaning Checklist</h3>
        <div className="rf-cleaning-checklist__progress">
          <span className="rf-cleaning-checklist__progress-text">
            {completedCount} of {totalCount} tasks
          </span>
          <div className="rf-cleaning-checklist__progress-bar">
            <div
              className="rf-cleaning-checklist__progress-fill"
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <div className="rf-cleaning-checklist__items">
        {showRooms ? (
          Object.entries(groupedItems).map(([room, roomItems]) => (
            <div key={room} className="rf-cleaning-checklist__room">
              <h4 className="rf-cleaning-checklist__room-title">{room}</h4>
              <div className="rf-cleaning-checklist__room-items">
                {roomItems.map(item => (
                  <div key={item.id} className="rf-cleaning-checklist__item">
                    <Checkbox
                      checked={item.completed}
                      onChange={(e) => handleToggle(item.id, e.target.checked)}
                      label={item.task}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          items.map(item => (
            <div key={item.id} className="rf-cleaning-checklist__item">
              <Checkbox
                checked={item.completed}
                onChange={(e) => handleToggle(item.id, e.target.checked)}
                label={`${item.room}: ${item.task}`}
              />
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

CleaningChecklist.displayName = 'CleaningChecklist';
