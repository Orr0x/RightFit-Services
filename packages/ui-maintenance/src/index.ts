/**
 * @rightfit/ui-maintenance
 * Maintenance-specific UI components for RightFit Services
 *
 * @packageDocumentation
 */

// Components
export { MaintenanceJobCard } from './components/MaintenanceJobCard';
export type { MaintenanceJobCardProps } from './components/MaintenanceJobCard';

export { WorkOrderCard } from './components/WorkOrderCard';
export type { WorkOrderCardProps } from './components/WorkOrderCard';

export { IssueCard } from './components/IssueCard';
export type { IssueCardProps } from './components/IssueCard';

// Types
export type {
  MaintenanceJob,
  MaintenanceStatus,
  MaintenancePriority,
} from './types/maintenance-job';
export type { WorkOrder, WorkOrderStatus } from './types/work-order';
export type {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueCategory,
} from './types/issue';

// Utils
export {
  formatMaintenanceStatus,
  getMaintenanceStatusVariant,
  getPriorityVariant,
  formatPriority,
  formatWorkOrderStatus,
  getWorkOrderStatusVariant,
  formatIssueStatus,
  getIssueStatusVariant,
} from './utils/status-helpers';

// Re-export all components in a namespace for convenience
export * as Components from './components';
