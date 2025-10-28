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
  address: string
  city: string
  state: string
  zip_code: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface CreatePropertyData {
  name: string
  address: string
  city: string
  state: string
  zip_code: string
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
