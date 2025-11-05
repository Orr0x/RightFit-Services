import React, { createContext, useContext, useState, useEffect } from 'react'
import { Worker } from '../types'

interface AuthContextType {
  worker: Worker | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('worker_token')
      const workerId = localStorage.getItem('worker_id')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      if (token && workerId && serviceProviderId) {
        try {
          const response = await fetch(`/api/workers/${workerId}?service_provider_id=${serviceProviderId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            setWorker(data.data)
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('worker_token')
            localStorage.removeItem('worker_id')
            localStorage.removeItem('service_provider_id')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('worker_token')
          localStorage.removeItem('worker_id')
          localStorage.removeItem('service_provider_id')
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Step 1: Authenticate with the main auth endpoint
      const authResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!authResponse.ok) {
        const error = await authResponse.json()
        throw new Error(error.error || error.message || 'Login failed')
      }

      const authData = await authResponse.json()
      const token = authData.data.access_token

      // Step 2: Fetch worker profile using /me endpoint
      const workerResponse = await fetch('/api/workers/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!workerResponse.ok) {
        throw new Error('No worker account found for this email. Please contact your manager.')
      }

      const workerData = await workerResponse.json()
      const workerRecord = workerData.data

      // Store auth data
      localStorage.setItem('worker_token', token)
      localStorage.setItem('worker_id', workerRecord.id)
      localStorage.setItem('service_provider_id', workerRecord.service_provider_id)

      // Set worker state
      setWorker(workerRecord)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('worker_token')
    localStorage.removeItem('worker_id')
    localStorage.removeItem('service_provider_id')
    setWorker(null)
  }

  const value = {
    worker,
    login,
    logout,
    isAuthenticated: !!worker,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
