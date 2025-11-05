// Worker Types
export interface Worker {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  profile_photo_url: string | null
  worker_type: WorkerType
  employment_type: EmploymentType
  hourly_rate: number
  service_provider_id: string
  created_at: string
  updated_at: string
}

export type WorkerType = 'CLEANER' | 'MAINTENANCE' | 'GENERAL'
export type EmploymentType = 'EMPLOYEE' | 'CONTRACTOR' | 'PART_TIME' | 'FULL_TIME'

// Cleaning Job Types
export interface CleaningJob {
  id: string
  property_id: string
  property_name: string
  property_address: string
  customer_id: string
  customer_name: string
  assigned_worker_id: string | null
  assigned_worker_name: string | null
  scheduled_date: string
  scheduled_time_start: string
  scheduled_time_end: string
  status: JobStatus
  quoted_price: number
  actual_price: number | null
  special_requirements: string | null
  checklist: ChecklistItem[]
  created_at: string
  updated_at: string
}

export type JobStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface ChecklistItem {
  id: string
  task: string
  completed: boolean
  order_index: number
}

// Property Types
export interface Property {
  id: string
  name: string
  address: string
  postcode: string
  property_type: string
  bedrooms: number
  bathrooms: number
  access_instructions: string | null
  access_code: string | null
  wifi_ssid: string | null
  wifi_password: string | null
  parking_info: string | null
  pet_info: string | null
}

// Timesheet Types
export interface CleaningJobTimesheet {
  id: string
  cleaning_job_id: string
  worker_id: string
  start_time: string
  end_time: string | null
  hours_worked: number
  work_performed: string | null
  completion_notes: string | null
  photo_count: number
  created_at: string
  updated_at: string
}

export interface TimesheetPhoto {
  id: string
  timesheet_id: string
  photo_url: string
  category: PhotoCategory
  uploaded_at: string
}

export type PhotoCategory = 'BEFORE' | 'AFTER' | 'ISSUE'

// Availability Types
export interface WorkerAvailability {
  id: string
  worker_id: string
  start_date: string
  end_date: string
  reason: string | null
  status: 'BLOCKED' | 'AVAILABLE'
  created_at: string
  updated_at: string
}

// Stats Types
export interface WorkerStats {
  completedThisMonth: number
  hoursThisWeek: number
  upcomingJobs: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  has_more: boolean
}
