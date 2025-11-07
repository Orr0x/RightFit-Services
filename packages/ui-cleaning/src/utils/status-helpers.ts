import type { CleaningJobStatus } from '../types/cleaning-job';
import type { BadgeVariant } from '@rightfit/ui-core';

export function formatJobStatus(status: CleaningJobStatus): string {
  const statusMap: Record<CleaningJobStatus, string> = {
    pending: 'Pending',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
}

export function getStatusVariant(status: CleaningJobStatus): BadgeVariant {
  const variantMap: Record<CleaningJobStatus, BadgeVariant> = {
    pending: 'warning',
    scheduled: 'primary',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error',
  };
  return variantMap[status] || 'default';
}
