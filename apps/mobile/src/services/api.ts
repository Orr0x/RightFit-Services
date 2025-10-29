import axios, { AxiosInstance, AxiosError } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// API base URL - change to your local IP or production URL
const API_BASE_URL = 'http://192.168.0.17:3001'

// Storage keys
const ACCESS_TOKEN_KEY = '@rightfit_access_token'
const REFRESH_TOKEN_KEY = '@rightfit_refresh_token'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          (originalRequest as any)._retry = true

          try {
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY)
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refresh_token: refreshToken,
              })

              const { access_token } = response.data

              // Only set token if it's valid
              if (access_token && access_token.length > 0) {
                await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token)

                // Retry original request with new token
                originalRequest.headers!.Authorization = `Bearer ${access_token}`
                return this.client(originalRequest)
              } else {
                throw new Error('Invalid access token received from refresh')
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await this.clearTokens()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password })
    // API returns tokens nested in response.data.data
    const { access_token, refresh_token } = response.data.data

    if (!access_token || !refresh_token) {
      throw new Error('Invalid response from server: missing tokens')
    }

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token)
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)

    return response.data.data
  }

  async register(email: string, password: string, full_name: string, company_name?: string) {
    const response = await this.client.post('/api/auth/register', {
      email,
      password,
      confirm_password: password,
      full_name,
      company_name,
    })
    // API returns tokens nested in response.data.data
    const { access_token, refresh_token } = response.data.data

    if (!access_token || !refresh_token) {
      throw new Error('Invalid response from server: missing tokens')
    }

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token)
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)

    return response.data.data
  }

  async logout() {
    await this.clearTokens()
  }

  async clearTokens() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY])
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
      return token !== null && token !== undefined && token.length > 0
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  // Properties API
  async getProperties(filters?: { property_id?: string }) {
    const response = await this.client.get('/api/properties', { params: filters })
    return response.data.data
  }

  async getProperty(id: string) {
    const response = await this.client.get(`/api/properties/${id}`)
    return response.data.data
  }

  async createProperty(data: any) {
    const response = await this.client.post('/api/properties', data)
    return response.data.data
  }

  async updateProperty(id: string, data: any) {
    const response = await this.client.patch(`/api/properties/${id}`, data)
    return response.data.data
  }

  async deleteProperty(id: string) {
    await this.client.delete(`/api/properties/${id}`)
  }

  // Work Orders API
  async getWorkOrders(filters?: { property_id?: string; status?: string; priority?: string }) {
    const response = await this.client.get('/api/work-orders', { params: filters })
    return response.data.data
  }

  async getWorkOrder(id: string) {
    const response = await this.client.get(`/api/work-orders/${id}`)
    return response.data.data
  }

  async createWorkOrder(data: any) {
    const response = await this.client.post('/api/work-orders', data)
    return response.data.data
  }

  async updateWorkOrder(id: string, data: any) {
    const response = await this.client.patch(`/api/work-orders/${id}`, data)
    return response.data.data
  }

  async deleteWorkOrder(id: string) {
    await this.client.delete(`/api/work-orders/${id}`)
  }

  async assignContractor(workOrderId: string, contractorId: string) {
    const response = await this.client.post(`/api/work-orders/${workOrderId}/assign`, {
      contractor_id: contractorId,
    })
    return response.data.data
  }

  async updateWorkOrderStatus(workOrderId: string, status: string, note?: string) {
    const response = await this.client.post(`/api/work-orders/${workOrderId}/status`, {
      status,
      note,
    })
    return response.data.data
  }

  // Contractors API
  async getContractors(filters?: { specialty?: string }) {
    const response = await this.client.get('/api/contractors', { params: filters })
    return response.data.data
  }

  async getContractor(id: string) {
    const response = await this.client.get(`/api/contractors/${id}`)
    return response.data.data
  }

  async createContractor(data: any) {
    const response = await this.client.post('/api/contractors', data)
    return response.data.data
  }

  async updateContractor(id: string, data: any) {
    const response = await this.client.patch(`/api/contractors/${id}`, data)
    return response.data.data
  }

  async deleteContractor(id: string) {
    await this.client.delete(`/api/contractors/${id}`)
  }

  // Photos API
  async uploadPhoto(file: FormData) {
    const response = await this.client.post('/api/photos', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getPhotos(filters?: { property_id?: string; work_order_id?: string }) {
    const response = await this.client.get('/api/photos', { params: filters })
    return response.data.data
  }

  async deletePhoto(id: string) {
    await this.client.delete(`/api/photos/${id}`)
  }

  // Certificates API
  async getCertificates(filters?: { property_id?: string; certificate_type?: string }) {
    const response = await this.client.get('/api/certificates', { params: filters })
    return response.data.data
  }

  async uploadCertificate(file: FormData) {
    const response = await this.client.post('/api/certificates', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  }

  async deleteCertificate(id: string) {
    await this.client.delete(`/api/certificates/${id}`)
  }
}

export default new ApiClient()
