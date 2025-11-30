import React from 'react';
import type { MaintenanceJob } from '../../types/maintenance-job';
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
export declare const MaintenanceJobCard: React.ForwardRefExoticComponent<MaintenanceJobCardProps & React.RefAttributes<HTMLDivElement>>;
