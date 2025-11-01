import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Database } from '@nozbe/watermelondb'
import { getDatabase } from './index'
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
  const [db, setDb] = useState<Database | null>(null)

  useEffect(() => {
    let mounted = true

    // Initialize database asynchronously (won't block UI)
    getDatabase().then(database => {
      if (mounted && database) {
        setDb(database)
        console.log('[DATABASE_PROVIDER] Initializing sync service')
        syncService.initialize()
      }
    })

    // Cleanup on unmount
    return () => {
      mounted = false
      if (db) {
        console.log('[DATABASE_PROVIDER] Cleaning up sync service')
        syncService.cleanup()
      }
    }
  }, [])

  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  )
}
