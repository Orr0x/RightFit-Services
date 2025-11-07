import type { MaintenanceStatus, MaintenancePriority } from '../types/maintenance-job';
import type { WorkOrderStatus } from '../types/work-order';
import type { IssueStatus, IssuePriority } from '../types/issue';
import type { BadgeVariant } from '@rightfit/ui-core';

export function formatMaintenanceStatus(status: MaintenanceStatus): string {
  const statusMap: Record<MaintenanceStatus, string> = {
    pending: 'Pending',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
}

export function getMaintenanceStatusVariant(status: MaintenanceStatus): BadgeVariant {
  const variantMap: Record<MaintenanceStatus, BadgeVariant> = {
    pending: 'warning',
    scheduled: 'primary',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error',
  };
  return variantMap[status] || 'default';
}

export function getPriorityVariant(priority: MaintenancePriority | IssuePriority): BadgeVariant {
  const variantMap: Record<string, BadgeVariant> = {
    low: 'default',
    medium: 'warning',
    high: 'error',
    urgent: 'error',
    critical: 'error',
  };
  return variantMap[priority] || 'default';
}

export function formatPriority(priority: MaintenancePriority | IssuePriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function formatWorkOrderStatus(status: WorkOrderStatus): string {
  const statusMap: Record<WorkOrderStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return statusMap[status] || status;
}

export function getWorkOrderStatusVariant(status: WorkOrderStatus): BadgeVariant {
  const variantMap: Record<WorkOrderStatus, BadgeVariant> = {
    draft: 'default',
    submitted: 'warning',
    approved: 'primary',
    in_progress: 'primary',
    completed: 'success',
    rejected: 'error',
  };
  return variantMap[status] || 'default';
}

export function formatIssueStatus(status: IssueStatus): string {
  const statusMap: Record<IssueStatus, string> = {
    reported: 'Reported',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return statusMap[status] || status;
}

export function getIssueStatusVariant(status: IssueStatus): BadgeVariant {
  const variantMap: Record<IssueStatus, BadgeVariant> = {
    reported: 'warning',
    acknowledged: 'primary',
    in_progress: 'primary',
    resolved: 'success',
    closed: 'default',
  };
  return variantMap[status] || 'default';
}
