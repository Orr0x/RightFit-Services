export type IssueStatus = 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  category?: IssueCategory;
  property: {
    id: string;
    address: string;
  };
  reported_by?: {
    name: string;
    contact: string;
  };
  reported_date: string;
  photos?: string[];
  assigned_to?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}
