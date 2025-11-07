export type MaintenanceStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceJob {
  id: string;
  title: string;
  description?: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  scheduled_date?: string;
  completed_date?: string;
  property: {
    id: string;
    address: string;
  };
  assigned_worker?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
}
