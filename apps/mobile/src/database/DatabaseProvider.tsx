import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { Database } from '@nozbe/watermelondb'
import { database } from './index'
import syncService from '../services/syncService'

const DatabaseContext = createContext<Database | null>(null)

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  // context can be null if WatermelonDB is not available (Expo Go)
  return context
}

interface DatabaseProviderProps {
  children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  useEffect(() => {
    // Initialize sync service when database is available
    if (database) {
      console.log('[DATABASE_PROVIDER] Initializing sync service')
      syncService.initialize()
    }

    // Cleanup on unmount
    return () => {
      if (database) {
        console.log('[DATABASE_PROVIDER] Cleaning up sync service')
        syncService.cleanup()
      }
    }
  }, [])

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  )
}
