import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '../lib/api'

export interface User {
  id: string
  email: string
  tenant_id: string
  tenant_name: string
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

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials)

      // Customer Portal API returns { data: { user, customer } }
      const { user: userData, customer } = response.data

      // Add customer info to user object for display
      const userWithCustomer = {
        ...userData,
        customer_name: customer.business_name,
        customer_id: customer.id,
      }

      // Store user data (customer portal doesn't use JWT tokens)
      localStorage.setItem('user', JSON.stringify(userWithCustomer))
      localStorage.setItem('customer', JSON.stringify(customer))

      setUser(userWithCustomer)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data)

      // API wraps response in { data: { user, tenant, access_token, refresh_token } }
      const { access_token, refresh_token, user: userData, tenant } = response.data

      // Add tenant_name to user object for display
      const userWithTenant = {
        ...userData,
        tenant_name: tenant.tenant_name,
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
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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
