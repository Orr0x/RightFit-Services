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
