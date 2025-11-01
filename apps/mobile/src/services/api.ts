import axios, { AxiosInstance, AxiosError } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import logger from './logger'

// API base URL - Using WSL IP for both emulator and physical devices
// WSL2 doesn't reliably route 10.0.2.2, so we use the actual WSL IP address
// This works for both Android emulator and physical devices on same network
const API_BASE_URL = 'http://192.168.0.17:3001'

// Storage keys
const ACCESS_TOKEN_KEY = '@rightfit_access_token'
const REFRESH_TOKEN_KEY = '@rightfit_refresh_token'

logger.info('API_CLIENT', `API client initialized with base URL: ${API_BASE_URL}`)

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

    // Request interceptor to add auth token and log requests
    this.client.interceptors.request.use(
      async (config) => {
        const startTime = Date.now()
        ;(config as any).metadata = { startTime }

        // Add auth token
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Log request
        logger.logRequest(
          config.method?.toUpperCase() || 'GET',
          `${config.baseURL}${config.url}`,
          config.data,
          {
            'Content-Type': config.headers['Content-Type'],
            hasAuth: !!token,
          }
        )

        return config
      },
      (error) => {
        logger.error('API_CLIENT', 'Request interceptor error', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor for logging and token refresh
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata?.startTime
        logger.logResponse(
          response.config.method?.toUpperCase() || 'GET',
          `${response.config.baseURL}${response.config.url}`,
          response.status,
          response.data,
          duration
        )
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config

        // Log the error
        if (originalRequest) {
          logger.logError(
            originalRequest.method?.toUpperCase() || 'GET',
            `${originalRequest.baseURL}${originalRequest.url}`,
            error
          )
        }

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          (originalRequest as any)._retry = true

          try {
            logger.info('API_CLIENT', 'Attempting token refresh due to 401 response')
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY)

            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refresh_token: refreshToken,
              })

              const { access_token } = response.data

              // Only set token if it's valid
              if (access_token && access_token.length > 0) {
                await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token)
                logger.info('API_CLIENT', 'Token refresh successful')

                // Retry original request with new token
                originalRequest.headers!.Authorization = `Bearer ${access_token}`
                return this.client(originalRequest)
              } else {
                throw new Error('Invalid access token received from refresh')
              }
            } else {
              logger.warn('API_CLIENT', 'No refresh token available for refresh')
            }
          } catch (refreshError: any) {
            // Refresh failed, clear tokens and redirect to login
            logger.error('API_CLIENT', 'Token refresh failed', refreshError)
            await this.clearTokens()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    logger.info('API_CLIENT', 'API client interceptors configured successfully')
  }

  /**
   * Format error message from Axios error
   */
  private formatError(error: any): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const message = error.response.data?.message || error.response.statusText

      switch (status) {
        case 400:
          return `Bad Request: ${message}`
        case 401:
          return `Unauthorized: ${message || 'Invalid credentials'}`
        case 403:
          return `Forbidden: ${message || 'Access denied'}`
        case 404:
          return `Not Found: ${message}`
        case 409:
          return `Conflict: ${message}`
        case 422:
          return `Validation Error: ${message}`
        case 500:
          return `Server Error: ${message || 'Internal server error'}`
        default:
          return `Error (${status}): ${message}`
      }
    } else if (error.request) {
      // Request made but no response received
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout - please check your connection'
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return `Network error - cannot reach API server at ${API_BASE_URL}. Please check:\n1. API server is running\n2. Device is on same network\n3. Firewall allows connections\n4. Correct IP address: ${API_BASE_URL}`
      } else {
        return `Connection failed - ${error.message}`
      }
    } else {
      // Something else happened
      return error.message || 'An unexpected error occurred'
    }
  }

  /**
   * Wrap API calls with error handling
   */
  private async wrapApiCall<T>(fn: () => Promise<T>, context: string): Promise<T> {
    try {
      return await fn()
    } catch (error: any) {
      const formattedError = this.formatError(error)
      logger.error('API_CLIENT', `${context} failed: ${formattedError}`, error)

      // Create a new error with formatted message
      const enhancedError: any = new Error(formattedError)
      enhancedError.originalError = error
      enhancedError.response = error.response
      enhancedError.request = error.request

      throw enhancedError
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.wrapApiCall(async () => {
      logger.info('API_CLIENT', `Attempting login for: ${email}`)
      const response = await this.client.post('/api/auth/login', { email, password })

      // API returns tokens nested in response.data.data
      const { access_token, refresh_token } = response.data.data

      if (!access_token || !refresh_token) {
        throw new Error('Invalid response from server: missing tokens')
      }

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token)
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)

      logger.info('API_CLIENT', `Login successful for: ${email}`)
      return response.data.data
    }, 'Login')
  }

  async register(email: string, password: string, full_name: string, company_name?: string) {
    return this.wrapApiCall(async () => {
      logger.info('API_CLIENT', `Attempting registration for: ${email}`)
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

      logger.info('API_CLIENT', `Registration successful for: ${email}`)
      return response.data.data
    }, 'Registration')
  }

  async logout() {
    logger.info('API_CLIENT', 'Logging out')
    await this.clearTokens()
  }

  async clearTokens() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY])
    logger.info('API_CLIENT', 'Tokens cleared')
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
      const isAuth = token !== null && token !== undefined && token.length > 0
      logger.debug('API_CLIENT', `Authentication check: ${isAuth}`)
      return isAuth
    } catch (error: any) {
      logger.error('API_CLIENT', 'Error checking authentication', error)
      return false
    }
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.wrapApiCall(async () => {
      logger.info('API_CLIENT', 'Attempting to change password')
      const response = await this.client.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      logger.info('API_CLIENT', 'Password changed successfully')
      return response.data
    }, 'Change Password')
  }

  // Properties API
  async getProperties(filters?: { property_id?: string }) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get('/api/properties', { params: filters })
      return response.data.data
    }, 'Get Properties')
  }

  async getProperty(id: string) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get(`/api/properties/${id}`)
      return response.data.data
    }, 'Get Property')
  }

  async createProperty(data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post('/api/properties', data)
      return response.data.data
    }, 'Create Property')
  }

  async updateProperty(id: string, data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.patch(`/api/properties/${id}`, data)
      return response.data.data
    }, 'Update Property')
  }

  async deleteProperty(id: string) {
    return this.wrapApiCall(async () => {
      await this.client.delete(`/api/properties/${id}`)
    }, 'Delete Property')
  }

  // Work Orders API
  async getWorkOrders(filters?: { property_id?: string; status?: string; priority?: string }) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get('/api/work-orders', { params: filters })
      return response.data.data
    }, 'Get Work Orders')
  }

  async getWorkOrder(id: string) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get(`/api/work-orders/${id}`)
      return response.data.data
    }, 'Get Work Order')
  }

  async createWorkOrder(data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post('/api/work-orders', data)
      return response.data.data
    }, 'Create Work Order')
  }

  async updateWorkOrder(id: string, data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.patch(`/api/work-orders/${id}`, data)
      return response.data.data
    }, 'Update Work Order')
  }

  async deleteWorkOrder(id: string) {
    return this.wrapApiCall(async () => {
      await this.client.delete(`/api/work-orders/${id}`)
    }, 'Delete Work Order')
  }

  async assignContractor(workOrderId: string, contractorId: string) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post(`/api/work-orders/${workOrderId}/assign`, {
        contractor_id: contractorId,
      })
      return response.data.data
    }, 'Assign Contractor')
  }

  async updateWorkOrderStatus(workOrderId: string, status: string, note?: string) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post(`/api/work-orders/${workOrderId}/status`, {
        status,
        note,
      })
      return response.data.data
    }, 'Update Work Order Status')
  }

  // Contractors API
  async getContractors(filters?: { specialty?: string }) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get('/api/contractors', { params: filters })
      return response.data.data
    }, 'Get Contractors')
  }

  async getContractor(id: string) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get(`/api/contractors/${id}`)
      return response.data.data
    }, 'Get Contractor')
  }

  async createContractor(data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post('/api/contractors', data)
      return response.data.data
    }, 'Create Contractor')
  }

  async updateContractor(id: string, data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.patch(`/api/contractors/${id}`, data)
      return response.data.data
    }, 'Update Contractor')
  }

  async deleteContractor(id: string) {
    return this.wrapApiCall(async () => {
      await this.client.delete(`/api/contractors/${id}`)
    }, 'Delete Contractor')
  }

  // Photos API
  async uploadPhoto(file: FormData) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post('/api/photos', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    }, 'Upload Photo')
  }

  async getPhotos(filters?: { property_id?: string; work_order_id?: string }) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get('/api/photos', { params: filters })
      return response.data.data
    }, 'Get Photos')
  }

  async deletePhoto(id: string) {
    return this.wrapApiCall(async () => {
      await this.client.delete(`/api/photos/${id}`)
    }, 'Delete Photo')
  }

  // Certificates API
  async getCertificates(filters?: { property_id?: string; certificate_type?: string }) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get('/api/certificates', { params: filters })
      return response.data.data
    }, 'Get Certificates')
  }

  async getCertificate(id: string) {
    return this.wrapApiCall(async () => {
      const response = await this.client.get(`/api/certificates/${id}`)
      return response.data.data
    }, 'Get Certificate')
  }

  async createCertificate(data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post('/api/certificates', data)
      return response.data.data
    }, 'Create Certificate')
  }

  async updateCertificate(id: string, data: any) {
    return this.wrapApiCall(async () => {
      const response = await this.client.patch(`/api/certificates/${id}`, data)
      return response.data.data
    }, 'Update Certificate')
  }

  async uploadCertificate(file: FormData) {
    return this.wrapApiCall(async () => {
      const response = await this.client.post('/api/certificates', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data
    }, 'Upload Certificate')
  }

  async deleteCertificate(id: string) {
    return this.wrapApiCall(async () => {
      await this.client.delete(`/api/certificates/${id}`)
    }, 'Delete Certificate')
  }
}

export default new ApiClient()
