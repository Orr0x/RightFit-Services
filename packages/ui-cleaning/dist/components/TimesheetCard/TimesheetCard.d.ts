import React from 'react';
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
export declare const TimesheetCard: React.ForwardRefExoticComponent<TimesheetCardProps & React.RefAttributes<HTMLDivElement>>;
