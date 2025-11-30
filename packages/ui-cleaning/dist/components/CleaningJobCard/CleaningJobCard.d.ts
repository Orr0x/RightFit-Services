import React from 'react';
import type { CleaningJob } from '../../types/cleaning-job';
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
export declare const CleaningJobCard: React.ForwardRefExoticComponent<CleaningJobCardProps & React.RefAttributes<HTMLDivElement>>;
