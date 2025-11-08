import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data
          localStorage.setItem('access_token', access_token)

          // Retry original request with new token
          if (!originalRequest.headers) {
            originalRequest.headers = {}
          }
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API types

export interface User {
  id: string
  email: string
  tenant_id: string
  tenant_name: string
  role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirm_password: string
  full_name: string
  company_name?: string
}

export interface Property {
  id: string
  name: string
  address_line1: string
  address_line2?: string
  city: string
  postcode: string
  property_type: 'HOUSE' | 'FLAT' | 'COTTAGE' | 'COMMERCIAL'
  bedrooms: number
  bathrooms: number
  access_instructions?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface CreatePropertyData {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  postcode: string
  property_type: 'HOUSE' | 'FLAT' | 'COTTAGE' | 'COMMERCIAL'
  bedrooms: number
  bathrooms: number
  access_instructions?: string
}

// Auth API calls
export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/api/auth/login', credentials)
    return response.data
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post('/api/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },
}

// Properties API calls
export const propertiesAPI = {
  list: async () => {
    const response = await api.get<{ data: Property[], pagination: any }>('/api/properties')
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get<{ data: Property }>(`/api/properties/${id}`)
    return response.data.data
  },

  create: async (data: CreatePropertyData) => {
    const response = await api.post<{ data: Property }>('/api/properties', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreatePropertyData>) => {
    const response = await api.patch<{ data: Property }>(`/api/properties/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/properties/${id}`)
  },

  getHistory: async (id: string, limit?: number) => {
    const response = await api.get<{ data: PropertyHistoryEntry[] }>(`/api/properties/${id}/history`, {
      params: { limit },
    })
    return response.data.data
  },
}

// Work Orders API calls
export const workOrdersAPI = {
  list: async (filters?: any) => {
    const response = await api.get('/api/work-orders', { params: filters })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get(`/api/work-orders/${id}`)
    return response.data.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/work-orders', data)
    return response.data.data
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/work-orders/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/work-orders/${id}`)
  },

  assignContractor: async (id: string, contractorId: string) => {
    const response = await api.post(`/api/work-orders/${id}/assign`, { contractor_id: contractorId })
    return response.data.data
  },

  updateStatus: async (id: string, status: string, note?: string) => {
    const response = await api.post(`/api/work-orders/${id}/status`, { status, note })
    return response.data.data
  },
}

// Contractors API calls
export const contractorsAPI = {
  list: async (filters?: any) => {
    const response = await api.get('/api/contractors', { params: filters })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get(`/api/contractors/${id}`)
    return response.data.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/contractors', data)
    return response.data.data
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/contractors/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/contractors/${id}`)
  },

  getByTrade: async (trade: string) => {
    const response = await api.get(`/api/contractors/by-trade/${trade}`)
    return response.data
  },
}

// Photo quality analysis data
export interface PhotoQualityData {
  isBlurry: boolean
  blurScore: number
  brightness: number
  hasGoodQuality: boolean
  warnings: string[]
}

export interface PhotoUploadResult {
  photo: any
  uploadSuccess: boolean
  error?: string
  quality?: PhotoQualityData
}

// Photos API calls
export const photosAPI = {
  list: async (filters?: { property_id?: string; work_order_id?: string }) => {
    const response = await api.get('/api/photos', { params: filters })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get(`/api/photos/${id}`)
    return response.data.data
  },

  upload: async (file: File, data: { property_id?: string; work_order_id?: string; label?: string; caption?: string }): Promise<PhotoUploadResult> => {
    const formData = new FormData()
    formData.append('photo', file)
    if (data.property_id) formData.append('property_id', data.property_id)
    if (data.work_order_id) formData.append('work_order_id', data.work_order_id)
    if (data.label) formData.append('label', data.label)
    if (data.caption) formData.append('caption', data.caption)

    const response = await api.post('/api/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/photos/${id}`)
  },
}

// Certificates API calls
export const certificatesAPI = {
  list: async (filters?: { property_id?: string; certificate_type?: string }) => {
    const response = await api.get('/api/certificates', { params: filters })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get(`/api/certificates/${id}`)
    return response.data.data
  },

  upload: async (
    file: File,
    data: {
      property_id: string
      certificate_type: string
      issue_date: string
      expiry_date: string
      certificate_number?: string
      issuer_name?: string
      notes?: string
    }
  ) => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('property_id', data.property_id)
    formData.append('certificate_type', data.certificate_type)
    formData.append('issue_date', data.issue_date)
    formData.append('expiry_date', data.expiry_date)
    if (data.certificate_number) formData.append('certificate_number', data.certificate_number)
    if (data.issuer_name) formData.append('issuer_name', data.issuer_name)
    if (data.notes) formData.append('notes', data.notes)

    const response = await api.post('/api/certificates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/certificates/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/certificates/${id}`)
  },

  getExpiringSoon: async (daysAhead?: number) => {
    const response = await api.get('/api/certificates/expiring-soon', {
      params: daysAhead ? { days_ahead: daysAhead } : {},
    })
    return response.data.data
  },

  getExpired: async () => {
    const response = await api.get('/api/certificates/expired')
    return response.data.data
  },
}

// Financial Management Types
export interface FinancialTransaction {
  id: string
  tenant_id: string
  property_id: string
  type: 'INCOME' | 'EXPENSE'
  category?: string
  amount: number
  date: string
  description: string
  receipt_url?: string
  notes?: string
  created_at: string
  updated_at: string
  property?: {
    id: string
    name: string
  }
}

export interface CreateTransactionData {
  propertyId: string
  type: 'INCOME' | 'EXPENSE'
  category?: string
  amount: number
  date: string
  description: string
  receiptUrl?: string
  notes?: string
}

export interface PropertyFinancialSummary {
  propertyId: string
  propertyName: string
  totalIncome: number
  totalExpenses: number
  netIncome: number
  expensesByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  transactions: number
}

export interface BudgetStatus {
  budget: {
    id: string
    propertyId: string
    propertyName: string
    monthlyBudget: number
    alertThreshold: number
  }
  currentMonth: {
    startDate: string
    endDate: string
    totalSpent: number
    remaining: number
    percentageUsed: number
  }
  alerts: {
    isOverBudget: boolean
    isNearThreshold: boolean
    message: string | null
  }
}

// Financial API calls
export const financialAPI = {
  listTransactions: async (filters?: {
    propertyId?: string
    type?: 'INCOME' | 'EXPENSE'
    category?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get<{ data: FinancialTransaction[]; pagination: any }>(
      '/api/financial/transactions',
      { params: filters }
    )
    return response.data
  },

  createTransaction: async (data: CreateTransactionData) => {
    const response = await api.post<{ data: FinancialTransaction }>(
      '/api/financial/transactions',
      data
    )
    return response.data.data
  },

  updateTransaction: async (id: string, data: Partial<CreateTransactionData>) => {
    const response = await api.patch<{ data: FinancialTransaction }>(
      `/api/financial/transactions/${id}`,
      data
    )
    return response.data.data
  },

  deleteTransaction: async (id: string) => {
    await api.delete(`/api/financial/transactions/${id}`)
  },

  getPropertySummary: async (propertyId: string, startDate?: string, endDate?: string) => {
    const response = await api.get<{ data: PropertyFinancialSummary }>(
      `/api/financial/reports/property/${propertyId}`,
      { params: { startDate, endDate } }
    )
    return response.data.data
  },

  setBudget: async (data: { propertyId: string; monthlyBudget: number; alertThreshold?: number }) => {
    const response = await api.post('/api/financial/budgets', data)
    return response.data.data
  },

  getBudgetStatus: async (propertyId: string) => {
    const response = await api.get<{ data: BudgetStatus | null }>(
      `/api/financial/budgets/${propertyId}`
    )
    return response.data.data
  },

  exportCSV: async (filters?: { propertyId?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get('/api/financial/export', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },
}

// Tenant Management Types
export interface PropertyTenant {
  id: string
  tenant_id: string
  property_id: string
  name: string
  email?: string
  phone?: string
  move_in_date: string
  lease_expiry_date?: string
  rent_amount: number
  rent_frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  rent_due_day?: number
  status: 'ACTIVE' | 'INACTIVE' | 'NOTICE_GIVEN'
  notes?: string
  created_at: string
  updated_at: string
  property?: {
    id: string
    name: string
  }
  rent_payments?: RentPayment[]
}

export interface CreatePropertyTenantData {
  propertyId: string
  name: string
  email?: string
  phone?: string
  moveInDate: string
  leaseExpiryDate?: string
  rentAmount: number
  rentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  rentDueDay?: number
  notes?: string
}

export interface RentPayment {
  id: string
  property_tenant_id: string
  amount: number
  payment_date: string
  expected_date?: string
  payment_method?: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'STANDING_ORDER' | 'OTHER'
  reference?: string
  notes?: string
  created_at: string
}

export interface RecordRentPaymentData {
  amount: number
  paymentDate: string
  expectedDate?: string
  paymentMethod?: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'STANDING_ORDER' | 'OTHER'
  reference?: string
  notes?: string
}

// Tenant Management API calls
export const tenantsAPI = {
  list: async (filters?: {
    propertyId?: string
    status?: 'ACTIVE' | 'INACTIVE' | 'NOTICE_GIVEN'
    page?: number
    limit?: number
  }) => {
    const response = await api.get<{ data: PropertyTenant[]; pagination: any }>('/api/tenants', {
      params: filters,
    })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get<{ data: PropertyTenant }>(`/api/tenants/${id}`)
    return response.data.data
  },

  create: async (data: CreatePropertyTenantData) => {
    const response = await api.post<{ data: PropertyTenant }>('/api/tenants', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreatePropertyTenantData>) => {
    const response = await api.patch<{ data: PropertyTenant }>(`/api/tenants/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/tenants/${id}`)
  },

  getRentPayments: async (tenantId: string, page?: number, limit?: number) => {
    const response = await api.get<{ data: RentPayment[]; pagination: any }>(
      `/api/tenants/${tenantId}/payments`,
      { params: { page, limit } }
    )
    return response.data
  },

  recordPayment: async (tenantId: string, data: RecordRentPaymentData) => {
    const response = await api.post<{ data: RentPayment }>(
      `/api/tenants/${tenantId}/payments`,
      data
    )
    return response.data.data
  },

  getExpiringLeases: async (days?: number) => {
    const response = await api.get('/api/tenants/alerts/expiring-leases', {
      params: { days },
    })
    return response.data.data
  },

  getOverdueRent: async () => {
    const response = await api.get('/api/tenants/alerts/overdue-rent')
    return response.data.data
  },
}

// ===== SERVICE PROVIDER PLATFORM (NEW) =====
// Two-dashboard system: Cleaning Services + Maintenance Services

// Cleaning Jobs Types
export interface CleaningJob {
  id: string
  service_id: string
  property_id: string
  customer_id: string
  contract_id?: string | null
  quote_id?: string | null
  assigned_worker_id?: string
  scheduled_date?: string | null
  scheduled_start_time?: string | null
  scheduled_end_time?: string | null
  actual_start_time?: string
  actual_end_time?: string
  checklist_template_id?: string
  checklist_items?: any
  checklist_completed_items: number
  checklist_total_items: number
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  completion_notes?: string
  before_photos: string[]
  after_photos: string[]
  issue_photos: string[]
  pricing_type: string
  quoted_price: number
  actual_price?: number
  maintenance_issues_found: number
  maintenance_quotes_generated: number
  created_at: string
  updated_at: string
  property?: {
    id: string
    property_name: string
    address: string
    postcode: string
  }
  customer?: {
    id: string
    business_name: string
    contact_name: string
  }
  assigned_worker?: {
    id: string
    first_name: string
    last_name: string
    phone: string
  }
}

export interface CreateCleaningJobData {
  service_id: string
  property_id: string
  customer_id: string
  contract_id?: string
  quote_id?: string
  assigned_worker_id?: string
  scheduled_date?: string
  scheduled_start_time?: string
  scheduled_end_time?: string
  checklist_template_id?: string
  checklist_total_items?: number
  pricing_type: string
  quoted_price: number
  service_provider_id: string
  status?: 'PENDING' | 'SCHEDULED'  // Allow setting initial status
}

export interface JobHistoryEntry {
  id: string
  cleaning_job_id: string
  changed_by_user_id?: string
  changed_at: string
  change_type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'WORKER_ASSIGNED' | 'WORKER_CHANGED' |
                'WORKER_UNASSIGNED' | 'TIME_CHANGED' | 'DATE_CHANGED' | 'CHECKLIST_UPDATED' |
                'PHOTO_ADDED' | 'NOTES_UPDATED' | 'PRICE_CHANGED' | 'MAINTENANCE_ISSUE_CREATED' | 'DELETED'
  field_name?: string
  old_value?: string
  new_value?: string
  description?: string
  metadata?: Record<string, any>
}

export interface PropertyHistoryEntry {
  id: string
  property_id: string
  changed_by_user_id?: string
  changed_at: string
  change_type: 'PROPERTY_CREATED' | 'PROPERTY_UPDATED' | 'ACCESS_INSTRUCTIONS_UPDATED' | 'STATUS_CHANGED' |
                'CLEANING_JOB_SCHEDULED' | 'CLEANING_JOB_STARTED' | 'CLEANING_JOB_COMPLETED' | 'CLEANING_JOB_CANCELLED' |
                'MAINTENANCE_JOB_CREATED' | 'MAINTENANCE_JOB_SCHEDULED' | 'MAINTENANCE_JOB_COMPLETED' | 'MAINTENANCE_JOB_CANCELLED' |
                'CONTRACT_CREATED' | 'CONTRACT_RENEWED' | 'CONTRACT_UPDATED' | 'CONTRACT_CANCELLED' |
                'CERTIFICATE_UPLOADED' | 'CERTIFICATE_EXPIRING_SOON' | 'CERTIFICATE_EXPIRED' | 'CERTIFICATE_RENEWED' |
                'PHOTO_UPLOADED' | 'TENANT_MOVED_IN' | 'TENANT_MOVED_OUT' | 'WORK_ORDER_CREATED' | 'WORK_ORDER_COMPLETED'
  field_name?: string
  old_value?: string
  new_value?: string
  description?: string
  metadata?: Record<string, any>
}

// Cleaning Jobs API calls
export const cleaningJobsAPI = {
  list: async (serviceProviderId: string, filters?: {
    status?: string
    worker_id?: string
    property_id?: string
    customer_id?: string
    from_date?: string
    to_date?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get<{ data: CleaningJob[]; pagination: any }>('/api/cleaning-jobs', {
      params: { service_provider_id: serviceProviderId, ...filters },
    })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get<{ data: CleaningJob }>(`/api/cleaning-jobs/${id}`)
    return response.data.data
  },

  create: async (data: CreateCleaningJobData) => {
    const response = await api.post<{ data: CleaningJob }>('/api/cleaning-jobs', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreateCleaningJobData> & { service_provider_id: string }) => {
    const response = await api.put<{ data: CleaningJob }>(`/api/cleaning-jobs/${id}`, data)
    return response.data.data
  },

  delete: async (id: string, serviceProviderId: string) => {
    await api.delete(`/api/cleaning-jobs/${id}`, {
      params: { service_provider_id: serviceProviderId },
    })
  },

  getHistory: async (id: string) => {
    const response = await api.get<{ data: JobHistoryEntry[] }>(`/api/cleaning-jobs/${id}/history`)
    return response.data.data
  },
}

// Maintenance Jobs Types
export interface MaintenanceJob {
  id: string
  service_id: string
  property_id: string
  customer_id: string
  assigned_worker_id?: string
  assigned_contractor_id?: string
  source: 'CUSTOMER_REQUEST' | 'CLEANER_REPORT' | 'GUEST_REPORT' | 'PREVENTIVE_MAINTENANCE' | 'EMERGENCY'
  source_cleaning_job_id?: string
  source_guest_report_id?: string
  category: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description?: string
  requested_date?: string
  scheduled_date?: string
  completed_date?: string
  status: 'QUOTE_PENDING' | 'QUOTE_SENT' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  quote_id?: string
  estimated_hours?: number
  estimated_parts_cost?: number
  estimated_labor_cost?: number
  estimated_total?: number
  actual_total?: number
  issue_photos: string[]
  work_in_progress_photos: string[]
  completion_photos: string[]
  completion_notes?: string
  customer_satisfaction_rating?: number
  created_at: string
  updated_at: string
  property?: {
    id: string
    property_name: string
    address: string
    postcode: string
  }
  customer?: {
    id: string
    business_name: string
    contact_name: string
  }
  assigned_worker?: {
    id: string
    first_name: string
    last_name: string
    phone: string
  }
  quote?: {
    id: string
    quote_number: string
    total: number
    status: string
  }
}

export interface CreateMaintenanceJobData {
  service_id: string
  property_id: string
  customer_id: string
  assigned_worker_id?: string
  assigned_contractor_id?: string
  source: 'CUSTOMER_REQUEST' | 'CLEANER_REPORT' | 'GUEST_REPORT' | 'PREVENTIVE_MAINTENANCE' | 'EMERGENCY'
  source_cleaning_job_id?: string
  source_guest_report_id?: string
  category: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description?: string
  requested_date?: string
  scheduled_date?: string
  service_provider_id: string
}

// Maintenance Jobs API calls
export const maintenanceJobsAPI = {
  list: async (serviceProviderId: string, filters?: {
    status?: string
    priority?: string
    worker_id?: string
    contractor_id?: string
    property_id?: string
    customer_id?: string
    from_date?: string
    to_date?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get<{ data: MaintenanceJob[]; pagination: any }>('/api/maintenance-jobs', {
      params: { service_provider_id: serviceProviderId, ...filters },
    })
    return response.data
  },

  get: async (id: string, serviceProviderId: string) => {
    const response = await api.get<{ data: MaintenanceJob }>(`/api/maintenance-jobs/${id}`, {
      params: { service_provider_id: serviceProviderId },
    })
    return response.data.data
  },

  create: async (data: CreateMaintenanceJobData) => {
    const response = await api.post<{ data: MaintenanceJob }>('/api/maintenance-jobs', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreateMaintenanceJobData> & { service_provider_id: string }) => {
    const response = await api.put<{ data: MaintenanceJob }>(`/api/maintenance-jobs/${id}`, data)
    return response.data.data
  },

  delete: async (id: string, serviceProviderId: string) => {
    await api.delete(`/api/maintenance-jobs/${id}`, {
      params: { service_provider_id: serviceProviderId },
    })
  },

  createFromCleaningIssue: async (cleaningJobId: string, issueData: {
    title: string
    description: string
    category: string
    priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
    issue_photos?: string[]
    service_provider_id: string
  }) => {
    const response = await api.post<{ data: MaintenanceJob }>('/api/maintenance-jobs/from-cleaning-issue', {
      cleaning_job_id: cleaningJobId,
      ...issueData,
    })
    return response.data.data
  },
}

// Workers API calls
export interface Worker {
  id: string
  service_provider_id: string
  user_id?: string
  first_name: string
  last_name: string
  email: string
  phone: string
  // Address fields
  address_street?: string
  address_city?: string
  address_postcode?: string
  address_country?: string
  // Employment fields
  worker_type: "CLEANER" | "MAINTENANCE" | "BOTH"
  employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACTOR"
  hourly_rate: number
  is_active: boolean
  max_weekly_hours?: number
  employment_start_date?: string
  // Legal/Compliance fields
  date_of_birth?: string
  ni_number?: string
  driving_licence_number?: string
  driving_licence_expiry?: string
  // Professional fields
  bio?: string
  skills?: string[]
  experience_years?: number
  // Emergency contact
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  // Performance metrics
  jobs_completed: number
  average_rating?: number
  // Media
  photo_url?: string
  // Timestamps
  created_at: string
  updated_at: string
}

export interface WorkerCertificate {
  id: string
  worker_id: string
  name: string
  file_url: string
  s3_key: string
  file_type: string
  file_size: number
  expiry_date?: string
  uploaded_at: string
  updated_at: string
}

export interface WorkerHistoryEntry {
  id: string
  worker_id: string
  changed_by_user_id?: string
  changed_at: string
  change_type:
    | 'WORKER_CREATED' | 'PROFILE_UPDATED' | 'PHOTO_UPLOADED' | 'CONTACT_INFO_UPDATED' | 'RATE_CHANGED' | 'STATUS_CHANGED'
    | 'JOB_ASSIGNED' | 'JOB_REASSIGNED' | 'JOB_UNASSIGNED' | 'JOB_STARTED' | 'JOB_COMPLETED' | 'JOB_CANCELLED'
    | 'CERTIFICATE_UPLOADED' | 'CERTIFICATE_RENEWED' | 'CERTIFICATE_EXPIRING' | 'CERTIFICATE_EXPIRED' | 'CERTIFICATE_REMOVED'
    | 'AVAILABILITY_UPDATED' | 'TIME_OFF_REQUESTED' | 'TIME_OFF_APPROVED' | 'TIME_OFF_DECLINED'
    | 'RATING_RECEIVED' | 'MILESTONE_REACHED' | 'COMPLAINT_FILED' | 'COMMENDATION_RECEIVED'
    | 'NOTE_ADDED' | 'EMERGENCY_CONTACT_UPDATED'
  field_name?: string
  old_value?: string
  new_value?: string
  description?: string
  metadata?: any
}

export const workersAPI = {
  list: async (serviceProviderId: string) => {
    const response = await api.get<{ data: Worker[] }>("/api/workers", {
      params: { service_provider_id: serviceProviderId },
    })
    return response.data.data
  },

  get: async (id: string, serviceProviderId: string) => {
    const response = await api.get<{ data: Worker }>(`/api/workers/${id}`, {
      params: { service_provider_id: serviceProviderId },
    })
    return response.data.data
  },

  create: async (data: Partial<Worker> & { service_provider_id: string }) => {
    const response = await api.post<{ data: Worker }>("/api/workers", data)
    return response.data.data
  },

  update: async (id: string, data: Partial<Worker> & { service_provider_id: string }) => {
    const response = await api.put<{ data: Worker }>(`/api/workers/${id}`, data)
    return response.data.data
  },

  delete: async (id: string, serviceProviderId: string) => {
    await api.delete(`/api/workers/${id}`, {
      params: { service_provider_id: serviceProviderId },
    })
  },

  // Photo operations
  uploadPhoto: async (workerId: string, file: File) => {
    const formData = new FormData()
    formData.append('photo', file)

    const response = await api.post<{ data: { photo_url: string } }>(`/api/workers/${workerId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  deletePhoto: async (workerId: string) => {
    await api.delete(`/api/workers/${workerId}/photo`)
  },

  // Certificate operations
  listCertificates: async (workerId: string) => {
    const response = await api.get<{ data: WorkerCertificate[] }>(`/api/workers/${workerId}/certificates`)
    return response.data.data
  },

  uploadCertificate: async (workerId: string, file: File, data: { name?: string; expiry_date?: string }) => {
    const formData = new FormData()
    formData.append('certificate', file)
    if (data.name) formData.append('name', data.name)
    if (data.expiry_date) formData.append('expiry_date', data.expiry_date)

    const response = await api.post<{ data: WorkerCertificate }>(`/api/workers/${workerId}/certificates`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  getCertificate: async (workerId: string, certificateId: string) => {
    const response = await api.get<{ data: WorkerCertificate }>(`/api/workers/${workerId}/certificates/${certificateId}`)
    return response.data.data
  },

  updateCertificate: async (workerId: string, certificateId: string, data: { name?: string; expiry_date?: string }) => {
    const response = await api.put<{ data: WorkerCertificate }>(`/api/workers/${workerId}/certificates/${certificateId}`, data)
    return response.data.data
  },

  deleteCertificate: async (workerId: string, certificateId: string) => {
    await api.delete(`/api/workers/${workerId}/certificates/${certificateId}`)
  },

  // History operations
  getHistory: async (workerId: string, serviceProviderId: string, limit?: number) => {
    const response = await api.get<{ data: WorkerHistoryEntry[] }>(`/api/workers/${workerId}/history`, {
      params: {
        service_provider_id: serviceProviderId,
        limit
      },
    })
    return response.data.data
  },

  getStats: async (workerId: string, serviceProviderId: string) => {
    const response = await api.get<{ data: { total_jobs: number; average_rating: number; completion_rate: number } }>(
      `/api/workers/${workerId}/history/stats`,
      {
        params: { service_provider_id: serviceProviderId },
      }
    )
    return response.data.data
  },
}

// Customers API - Service provider customers
export interface Customer {
  id: string
  customer_number?: string
  service_provider_id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  // Legacy address fields (deprecated)
  address?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postcode?: string
  country?: string
  // Business address
  business_address_line1?: string
  business_address_line2?: string
  business_city?: string
  business_postcode?: string
  business_country?: string
  // Contact address (if different)
  contact_address_different?: boolean
  contact_address_line1?: string
  contact_address_line2?: string
  contact_city?: string
  contact_postcode?: string
  contact_country?: string
  // Customer type
  customer_type: 'LANDLORD' | 'LETTING_AGENT' | 'PROPERTY_MANAGEMENT' | 'OFFICE_MANAGEMENT' | 'SHORT_LET_MANAGEMENT' | 'HOLIDAY_LETS' | 'COMMERCIAL' | 'PROPERTY_MANAGER' | 'OWNER' | 'LETTING_AGENCY' | 'INDIVIDUAL' | 'VACATION_RENTAL'
  has_cleaning_contract: boolean
  has_maintenance_contract: boolean
  bundled_discount_percentage: number
  payment_terms: 'NET_7' | 'NET_14' | 'NET_30' | 'NET_60' | 'DUE_ON_RECEIPT'
  payment_reliability_score: number
  satisfaction_score?: number
  cross_sell_potential: string
  created_at: string
  updated_at: string
  customer_properties?: CustomerProperty[]
  _count?: {
    customer_properties: number
    cleaning_jobs: number
    maintenance_jobs: number
    quotes: number
  }
}

export interface CreateCustomerData {
  business_name: string
  contact_name: string
  email: string
  phone: string
  // Legacy address fields (optional for backwards compatibility)
  address?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postcode?: string
  country?: string
  // Business address
  business_address_line1?: string
  business_address_line2?: string
  business_city?: string
  business_postcode?: string
  business_country?: string
  // Contact address (if different)
  contact_address_different?: boolean
  contact_address_line1?: string
  contact_address_line2?: string
  contact_city?: string
  contact_postcode?: string
  contact_country?: string
  // Customer type
  customer_type: 'LANDLORD' | 'LETTING_AGENT' | 'PROPERTY_MANAGEMENT' | 'OFFICE_MANAGEMENT' | 'SHORT_LET_MANAGEMENT' | 'HOLIDAY_LETS' | 'COMMERCIAL' | 'PROPERTY_MANAGER' | 'OWNER' | 'LETTING_AGENCY' | 'INDIVIDUAL' | 'VACATION_RENTAL'
  has_cleaning_contract?: boolean
  has_maintenance_contract?: boolean
  bundled_discount_percentage?: number
  payment_terms?: 'NET_7' | 'NET_14' | 'NET_30' | 'NET_60' | 'DUE_ON_RECEIPT'
}

export const customersAPI = {
  list: async (filters?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const response = await api.get<{ data: Customer[]; pagination: any }>('/api/customers', {
      params: filters,
    })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get<{ data: Customer }>(`/api/customers/${id}`)
    return response.data.data
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: Customer }>(`/api/customers/${id}`)
    return response.data.data
  },

  create: async (data: CreateCustomerData) => {
    const response = await api.post<{ data: Customer }>('/api/customers', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreateCustomerData>) => {
    const response = await api.patch<{ data: Customer }>(`/api/customers/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/customers/${id}`)
  },
}

// Customer Properties API - Properties owned by service provider customers
export interface CustomerProperty {
  id: string
  customer_id: string
  property_name: string
  address: string
  postcode: string
  property_type: string
  bedrooms: number
  bathrooms: number
  access_instructions?: string
  access_code?: string
  cleaning_checklist_template_id?: string
  guest_portal_enabled: boolean
  guest_portal_qr_code_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  customer?: {
    id: string
    business_name: string
    contact_name: string
    customer_type: string
  }
  _count?: {
    cleaning_jobs: number
    maintenance_jobs: number
    guest_issue_reports: number
  }
}

export interface CreateCustomerPropertyData {
  customer_id: string
  property_name: string
  address: string
  postcode: string
  property_type: string
  bedrooms?: number
  bathrooms?: number
  access_instructions?: string
  access_code?: string
  cleaning_checklist_template_id?: string
  guest_portal_enabled?: boolean
  // Enhanced property details
  photo_urls?: any // JSON array of {url, caption, type}
  utility_locations?: any // JSON object with utility locations
  emergency_contacts?: any // JSON array of emergency contacts
  cleaner_notes?: string
  wifi_ssid?: string
  wifi_password?: string
  parking_info?: string
  pet_info?: string
  special_requirements?: string
}

export const customerPropertiesAPI = {
  list: async (filters?: {
    page?: number
    limit?: number
    search?: string
    customer_id?: string
  }) => {
    const response = await api.get<{ data: CustomerProperty[]; pagination: any }>('/api/customer-properties', {
      params: filters,
    })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get<{ data: CustomerProperty }>(`/api/customer-properties/${id}`)
    return response.data.data
  },

  create: async (data: CreateCustomerPropertyData) => {
    const response = await api.post<{ data: CustomerProperty }>('/api/customer-properties', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreateCustomerPropertyData>) => {
    const response = await api.patch<{ data: CustomerProperty }>(`/api/customer-properties/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/customer-properties/${id}`)
  },

  getHistory: async (id: string, limit?: number) => {
    const response = await api.get<{ data: PropertyHistoryEntry[] }>(`/api/customer-properties/${id}/history`, {
      params: { limit },
    })
    return response.data.data
  },

  getChecklistTemplates: async (id: string) => {
    const response = await api.get<{ data: ChecklistTemplate[] }>(`/api/customer-properties/${id}/checklist-templates`)
    return response.data.data
  },

  linkChecklistTemplate: async (id: string, templateId: string) => {
    const response = await api.post<{ data: any }>(`/api/customer-properties/${id}/checklist-templates`, {
      checklist_template_id: templateId,
    })
    return response.data.data
  },

  unlinkChecklistTemplate: async (id: string, templateId: string) => {
    await api.delete(`/api/customer-properties/${id}/checklist-templates/${templateId}`)
  },
}

// Services API
export interface Service {
  id: string
  service_provider_id: string
  service_type: string
  name: string
  description?: string
  pricing_model: string
  default_rate: number
  is_active: boolean
}

export const servicesAPI = {
  list: async (serviceProviderId: string) => {
    const response = await api.get<{ data: Service[] }>('/api/services', {
      params: { service_provider_id: serviceProviderId },
    })
    return response.data.data
  },
}
// Global Activity API
export interface GlobalActivityEntry {
  id: string
  timestamp: string
  activity_type: 'PROPERTY' | 'JOB' | 'WORKER'
  event_type: string
  description: string
  metadata?: any
  property_id?: string
  property_name?: string
  job_id?: string
  worker_id?: string
  worker_name?: string
}

export interface GlobalActivityStats {
  total_events: number
  properties_active: number
  jobs_completed: number
  workers_active: number
  events_by_day: { date: string; count: number }[]
}

export const globalActivityAPI = {
  list: async (filters?: {
    limit?: number
    activity_type?: 'PROPERTY' | 'JOB' | 'WORKER'
    property_id?: string
    worker_id?: string
    from_date?: string
    to_date?: string
  }) => {
    const response = await api.get<{ data: GlobalActivityEntry[] }>('/api/global-activity', {
      params: filters,
    })
    return response.data.data
  },

  getStats: async (days?: number) => {
    const response = await api.get<{ data: GlobalActivityStats }>('/api/global-activity/stats', {
      params: { days },
    })
    return response.data.data
  },
}

// Property Calendar API
export interface PropertyCalendar {
  id: string
  property_id: string
  guest_checkout_datetime: string
  next_guest_checkin_datetime: string
  clean_window_start: string
  clean_window_end: string
  cleaning_job_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  property?: {
    id: string
    property_name: string
    address: string
    customer?: {
      id: string
      business_name: string
    }
  }
}

export interface CreatePropertyCalendarData {
  property_id: string
  guest_checkout_datetime: string
  next_guest_checkin_datetime: string
  notes?: string
}

export interface UpdatePropertyCalendarData {
  guest_checkout_datetime?: string
  next_guest_checkin_datetime?: string
  cleaning_job_id?: string | null
  notes?: string
}

export interface PropertyCalendarStats {
  total: number
  upcoming: number
  past: number
  needs_cleaning: number
  has_cleaning_job: number
}

export const propertyCalendarsAPI = {
  list: async (filters?: {
    property_id?: string
    include_completed?: boolean
    days_ahead?: number
    start_date?: string
    end_date?: string
  }) => {
    const response = await api.get<{ success: boolean; data: PropertyCalendar[] }>('/api/property-calendars', {
      params: filters,
    })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get<{ success: boolean; data: PropertyCalendar }>(`/api/property-calendars/${id}`)
    return response.data.data
  },

  create: async (data: CreatePropertyCalendarData) => {
    const response = await api.post<{ success: boolean; data: PropertyCalendar }>('/api/property-calendars', data)
    return response.data.data
  },

  update: async (id: string, data: UpdatePropertyCalendarData) => {
    const response = await api.put<{ success: boolean; data: PropertyCalendar }>(`/api/property-calendars/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/property-calendars/${id}`)
  },

  needsCleaning: async () => {
    const response = await api.get<{ success: boolean; data: PropertyCalendar[] }>('/api/property-calendars/needs-cleaning')
    return response.data.data
  },

  getPropertyStats: async (propertyId: string) => {
    const response = await api.get<{ success: boolean; data: PropertyCalendarStats }>(
      `/api/property-calendars/property/${propertyId}/stats`
    )
    return response.data.data
  },

  linkJob: async (id: string, cleaningJobId: string) => {
    const response = await api.put<{ success: boolean; data: PropertyCalendar }>(
      `/api/property-calendars/${id}/link-job`,
      { cleaning_job_id: cleaningJobId }
    )
    return response.data.data
  },
}

// Cleaning Contracts API
export interface CleaningContract {
  id: string
  customer_id: string
  service_provider_id: string
  contract_type: 'FLAT_MONTHLY' | 'PER_PROPERTY'
  contract_start_date: string
  contract_end_date?: string | null
  monthly_fee: number
  billing_day: number
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  notes?: string | null
  created_at: string
  updated_at: string
  customer?: {
    id: string
    business_name: string
    contact_name: string
  }
  property_contracts?: ContractProperty[]
}

export interface ContractProperty {
  id: string
  contract_id: string
  property_id: string
  property_monthly_fee?: number | null
  is_active: boolean
  property?: {
    id: string
    property_name: string
    address: string
    postcode: string
  }
}

export interface CreateCleaningContractData {
  customer_id: string
  service_provider_id: string
  contract_type: 'FLAT_MONTHLY' | 'PER_PROPERTY'
  contract_start_date: string
  contract_end_date?: string
  monthly_fee: number
  billing_day: number
  property_ids?: string[]
  property_fees?: Record<string, number>
  notes?: string
}

export const cleaningContractsAPI = {
  list: async (filters: {
    customer_id?: string
    service_provider_id?: string
    status?: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  }): Promise<CleaningContract[]> => {
    const params = new URLSearchParams()
    if (filters.customer_id) params.append('customer_id', filters.customer_id)
    if (filters.service_provider_id) params.append('service_provider_id', filters.service_provider_id)
    if (filters.status) params.append('status', filters.status)

    const response = await api.get<{ data: CleaningContract[] }>(`/api/cleaning-contracts?${params.toString()}`)
    return response.data.data
  },

  get: async (id: string): Promise<CleaningContract> => {
    const response = await api.get<CleaningContract>(`/api/cleaning-contracts/${id}`)
    return response.data
  },

  create: async (data: CreateCleaningContractData): Promise<CleaningContract> => {
    const response = await api.post<CleaningContract>('/api/cleaning-contracts', data)
    return response.data
  },

  update: async (id: string, data: Partial<CreateCleaningContractData>): Promise<CleaningContract> => {
    const response = await api.put<CleaningContract>(`/api/cleaning-contracts/${id}`, data)
    return response.data
  },

  pause: async (id: string): Promise<CleaningContract> => {
    const response = await api.put<CleaningContract>(`/api/cleaning-contracts/${id}/pause`)
    return response.data
  },

  resume: async (id: string): Promise<CleaningContract> => {
    const response = await api.put<CleaningContract>(`/api/cleaning-contracts/${id}/resume`)
    return response.data
  },

  cancel: async (id: string): Promise<CleaningContract> => {
    const response = await api.put<CleaningContract>(`/api/cleaning-contracts/${id}/cancel`)
    return response.data
  },

  getProperties: async (id: string): Promise<ContractProperty[]> => {
    const response = await api.get<ContractProperty[]>(`/api/cleaning-contracts/${id}/properties`)
    return response.data
  },

  linkProperty: async (
    id: string,
    data: { property_id: string; property_monthly_fee?: number }
  ): Promise<ContractProperty> => {
    const response = await api.post<ContractProperty>(`/api/cleaning-contracts/${id}/properties`, data)
    return response.data
  },

  unlinkProperty: async (id: string, propertyId: string): Promise<void> => {
    await api.delete(`/api/cleaning-contracts/${id}/properties/${propertyId}`)
  },

  updatePropertyFee: async (
    id: string,
    propertyId: string,
    fee: number
  ): Promise<ContractProperty> => {
    const response = await api.put<ContractProperty>(`/api/cleaning-contracts/${id}/properties/${propertyId}/fee`, {
      property_monthly_fee: fee,
    })
    return response.data
  },

  calculateMonthlyFee: async (id: string): Promise<number> => {
    const response = await api.get<{ data: { contract_id: string; monthly_fee: number } }>(`/api/cleaning-contracts/${id}/monthly-fee`)
    return response.data.data.monthly_fee
  },
}

// Cleaning Invoices API
export interface CleaningInvoice {
  id: string
  invoice_number: string
  customer_id: string
  contract_id?: string | null
  service_provider_id: string
  issue_date: string
  due_date: string
  billing_period_start: string
  billing_period_end: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  sent_date?: string | null
  paid_date?: string | null
  payment_method?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  customer?: {
    id: string
    business_name: string
    contact_name: string
    email: string
    payment_terms: string
  }
  invoice_line_items?: InvoiceLineItem[]
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface CreateInvoiceLineItemData {
  description: string
  quantity: number
  unit_price: number
}

export interface GenerateInvoiceFromContractData {
  contract_id: string
  billing_period_start: string
  billing_period_end: string
  service_provider_id: string
  line_items?: CreateInvoiceLineItemData[]
}

export interface CreateInvoiceData {
  customer_id: string
  service_provider_id: string
  issue_date: string
  billing_period_start: string
  billing_period_end: string
  line_items: CreateInvoiceLineItemData[]
  notes?: string
}

export interface CustomerInvoiceStats {
  total_invoices: number
  total_amount: number
  paid_amount: number
  outstanding_amount: number
  overdue_amount: number
}

export const cleaningInvoicesAPI = {
  list: async (filters?: {
    service_provider_id?: string
    customer_id?: string
    status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
    from_date?: string
    to_date?: string
  }) => {
    const response = await api.get<{ data: CleaningInvoice[]; pagination: any }>('/api/invoices', {
      params: filters,
    })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get<{ data: CleaningInvoice }>(`/api/invoices/${id}`)
    return response.data.data
  },

  create: async (data: CreateInvoiceData) => {
    // Handled directly in CreateInvoice component now
    const response = await api.post<{ data: CleaningInvoice }>('/api/invoices', data)
    return response.data.data
  },

  generateFromContract: async (data: GenerateInvoiceFromContractData) => {
    // This still uses cleaning-invoices for contract-based invoices
    const response = await api.post<{ data: CleaningInvoice }>('/api/cleaning-invoices/generate', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreateInvoiceData>) => {
    const response = await api.patch<{ data: CleaningInvoice }>(`/api/invoices/${id}`, data)
    return response.data.data
  },

  markAsPaid: async (id: string, data: { paid_date: string; payment_method?: string }) => {
    const response = await api.put<{ data: CleaningInvoice }>(`/api/invoices/${id}/mark-paid`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/invoices/${id}`)
  },

  getCustomerStats: async (customerId: string) => {
    // This may not exist for generic invoices, keeping for compatibility
    const response = await api.get<{ data: CustomerInvoiceStats }>(`/api/invoices/customer/${customerId}/stats`)
    return response.data.data
  },
}

// Cleaning Quotes API
export interface CleaningQuote {
  id: string
  quote_number: string
  customer_id: string
  service_provider_id: string
  quote_date: string
  valid_until: string
  property_id?: string | null
  service_description: string
  subtotal: number
  discount_percentage: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  total: number
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'DECLINED' | 'EXPIRED'
  sent_date?: string | null
  approved_date?: string | null
  declined_date?: string | null
  declined_reason?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  customer?: {
    id: string
    business_name: string
    contact_name: string
    email: string
  }
  property?: {
    id: string
    property_name: string
    address: string
  }
  quote_line_items?: QuoteLineItem[]
}

export interface QuoteLineItem {
  id: string
  quote_id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface CreateQuoteLineItemData {
  description: string
  quantity: number
  unit_price: number
}

export interface CreateQuoteData {
  customer_id: string
  service_provider_id: string
  property_id?: string
  service_description: string
  valid_until: string
  discount_percentage?: number
  line_items: CreateQuoteLineItemData[]
  notes?: string
}

export interface CustomerQuoteStats {
  total_quotes: number
  approved_quotes: number
  declined_quotes: number
  pending_quotes: number
  total_value: number
  approved_value: number
}

export const cleaningQuotesAPI = {
  list: async (filters?: {
    service_provider_id?: string
    customer_id?: string
    status?: 'DRAFT' | 'SENT' | 'APPROVED' | 'DECLINED' | 'EXPIRED'
    from_date?: string
    to_date?: string
  }) => {
    const response = await api.get<{ data: CleaningQuote[] }>('/api/cleaning-quotes', {
      params: filters,
    })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get<{ data: CleaningQuote }>(`/api/cleaning-quotes/${id}`)
    return response.data.data
  },

  create: async (data: CreateQuoteData) => {
    const response = await api.post<{ data: CleaningQuote }>('/api/cleaning-quotes', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreateQuoteData>) => {
    const response = await api.patch<{ data: CleaningQuote }>(`/api/cleaning-quotes/${id}`, data)
    return response.data.data
  },

  approve: async (id: string) => {
    const response = await api.post<{ data: CleaningQuote }>(`/api/cleaning-quotes/${id}/approve`)
    return response.data.data
  },

  decline: async (id: string, reason?: string) => {
    const response = await api.post<{ data: CleaningQuote }>(`/api/cleaning-quotes/${id}/decline`, { reason })
    return response.data.data
  },

  send: async (id: string) => {
    const response = await api.post<{ data: CleaningQuote }>(`/api/cleaning-quotes/${id}/send`)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/cleaning-quotes/${id}`)
  },

  getCustomerStats: async (customerId: string) => {
    const response = await api.get<{ data: CustomerQuoteStats }>(`/api/cleaning-quotes/customer/${customerId}/stats`)
    return response.data.data
  },
}

// Worker Availability types
export interface WorkerAvailability {
  id: string
  worker_id: string
  start_date: string
  end_date: string
  status: 'BLOCKED' | 'AVAILABLE'
  reason?: string
  created_at: string
  updated_at: string
}

// Worker Availability API
export const workerAvailabilityAPI = {
  list: async (workerId: string, filters?: {
    status?: 'BLOCKED' | 'AVAILABLE'
    from_date?: string
    to_date?: string
  }) => {
    const response = await api.get<{ data: WorkerAvailability[] }>('/api/worker-availability', {
      params: {
        worker_id: workerId,
        ...filters,
      },
    })
    return response.data.data
  },

  getBlockedDates: async (workerId: string, startDate: string, endDate: string) => {
    const response = await api.get<{ data: WorkerAvailability[] }>('/api/worker-availability/blocked-dates', {
      params: {
        worker_id: workerId,
        start_date: startDate,
        end_date: endDate,
      },
    })
    return response.data.data
  },
}

// Checklist Template types
export interface ChecklistSection {
  title: string
  items: string[]
  images?: string[] // URLs to uploaded images
}

export interface ChecklistTemplate {
  id: string
  service_provider_id: string
  customer_id?: string
  template_name: string
  property_type: string
  sections: ChecklistSection[]
  estimated_duration_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateChecklistTemplateData {
  service_provider_id: string
  customer_id?: string
  template_name: string
  property_type: string
  sections: ChecklistSection[]
  estimated_duration_minutes: number
  is_active?: boolean
}

export interface UpdateChecklistTemplateData {
  template_name?: string
  property_type?: string
  sections?: ChecklistSection[]
  estimated_duration_minutes?: number
  is_active?: boolean
  customer_id?: string
}

// Checklist Template API
export const checklistTemplatesAPI = {
  list: async (serviceProviderId: string, filters?: {
    property_type?: string
    customer_id?: string
    is_active?: boolean
  }) => {
    const response = await api.get<{ data: ChecklistTemplate[] }>('/api/checklist-templates', {
      params: {
        service_provider_id: serviceProviderId,
        ...filters,
      },
    })
    return response.data.data
  },

  get: async (id: string, serviceProviderId: string) => {
    const response = await api.get<{ data: ChecklistTemplate }>(`/api/checklist-templates/${id}`, {
      params: {
        service_provider_id: serviceProviderId,
      },
    })
    return response.data.data
  },

  create: async (data: CreateChecklistTemplateData) => {
    const response = await api.post<{ data: ChecklistTemplate }>('/api/checklist-templates', data)
    return response.data.data
  },

  update: async (id: string, data: UpdateChecklistTemplateData & { service_provider_id: string }) => {
    const response = await api.put<{ data: ChecklistTemplate }>(`/api/checklist-templates/${id}`, data)
    return response.data.data
  },

  delete: async (id: string, serviceProviderId: string) => {
    await api.delete(`/api/checklist-templates/${id}`, {
      params: {
        service_provider_id: serviceProviderId,
      },
    })
  },

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post<{ data: { filename: string; url: string } }>(
      '/api/uploads/checklist-template-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },

  deleteImage: async (filename: string) => {
    await api.delete(`/api/uploads/checklist-template-image/${filename}`)
  },
}
