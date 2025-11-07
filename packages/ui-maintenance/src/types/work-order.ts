export type WorkOrderStatus = 'draft' | 'submitted' | 'approved' | 'in_progress' | 'completed' | 'rejected';

export interface WorkOrder {
  id: string;
  order_number: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  property: {
    id: string;
    address: string;
  };
  created_date: string;
  due_date?: string;
  assigned_technician?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  estimated_hours?: number;
  actual_hours?: number;
  parts_cost?: number;
  labor_cost?: number;
  total_cost?: number;
}
