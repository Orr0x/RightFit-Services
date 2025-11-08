import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '../lib/api'

export interface User {
  id: string
  email: string
  tenant_id: string
  tenant_name: string
  service_provider_id: string | null
  role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  confirm_password: string
  full_name: string
  company_name?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isWorker: boolean // Track if user is a worker
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorker, setIsWorker] = useState(false)

  // Check if user is a worker (has worker profile)
  const checkIfWorker = async (token: string) => {
    try {
      const response = await fetch('/api/workers/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // If we get worker data, user is a worker
        setIsWorker(!!data.data)
        localStorage.setItem('is_worker', 'true')
        return true
      } else {
        setIsWorker(false)
        localStorage.removeItem('is_worker')
        return false
      }
    } catch (error) {
      // If endpoint fails or worker not found, user is not a worker
      setIsWorker(false)
      localStorage.removeItem('is_worker')
      return false
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    const storedIsWorker = localStorage.getItem('is_worker')

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsWorker(storedIsWorker === 'true')

        // Re-check worker status on mount to ensure it's current
        checkIfWorker(token)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('is_worker')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials)

      // API wraps response in { data: { user, tenant, service_provider_id, access_token, refresh_token } }
      const { access_token, refresh_token, user: userData, tenant, service_provider_id } = response.data

      // Add tenant_name and service_provider_id to user object
      const userWithTenant = {
        ...userData,
        tenant_name: tenant.tenant_name,
        service_provider_id: service_provider_id || null,
      }

      // Store tokens
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(userWithTenant))

      setUser(userWithTenant)

      // Check if user is a worker
      await checkIfWorker(access_token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data)

      // API wraps response in { data: { user, tenant, service_provider_id, access_token, refresh_token } }
      const { access_token, refresh_token, user: userData, tenant, service_provider_id } = response.data

      // Add tenant_name and service_provider_id to user object
      const userWithTenant = {
        ...userData,
        tenant_name: tenant.tenant_name,
        service_provider_id: service_provider_id || null,
      }

      // Store tokens
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(userWithTenant))

      setUser(userWithTenant)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('is_worker')
    setUser(null)
    setIsWorker(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isWorker,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
