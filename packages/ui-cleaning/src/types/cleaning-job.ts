import type { Property } from './property';

export type CleaningJobStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface CleaningJob {
  id: string;
  status: CleaningJobStatus;
  scheduled_date: string;
  cleaning_type?: string;
  estimated_hours?: number;
  actual_hours?: number;
  property: Property;
  assigned_worker?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  notes?: string;
}
