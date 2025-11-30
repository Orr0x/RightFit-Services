import React from 'react';
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
export declare const CleaningChecklist: React.FC<CleaningChecklistProps>;
