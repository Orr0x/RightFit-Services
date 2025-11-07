/**
 * @rightfit/ui-cleaning
 * Cleaning-specific UI components for RightFit Services
 *
 * @packageDocumentation
 */

// Components
export { PropertyCard } from './components/PropertyCard';
export type { PropertyCardProps } from './components/PropertyCard';

export { CleaningJobCard } from './components/CleaningJobCard';
export type { CleaningJobCardProps } from './components/CleaningJobCard';

export { CleaningChecklist } from './components/CleaningChecklist';
export type { CleaningChecklistProps, ChecklistItem } from './components/CleaningChecklist';

export { TimesheetCard } from './components/TimesheetCard';
export type { TimesheetCardProps, TimesheetEntry } from './components/TimesheetCard';

// Types
export type { Property } from './types/property';
export type { CleaningJob, CleaningJobStatus } from './types/cleaning-job';

// Utils
export { formatJobStatus, getStatusVariant } from './utils/status-helpers';

// Re-export all components in a namespace for convenience
export * as Components from './components';
