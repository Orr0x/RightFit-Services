import type { CleaningJobStatus } from '../types/cleaning-job';
import type { BadgeVariant } from '@rightfit/ui-core';
export declare function formatJobStatus(status: CleaningJobStatus): string;
export declare function getStatusVariant(status: CleaningJobStatus): BadgeVariant;
