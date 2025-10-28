import React, { createContext, useContext, ReactNode } from 'react'
import { Database } from '@nozbe/watermelondb'
import { database } from './index'

interface DatabaseContextValue {
  database: Database | null
  isAvailable: boolean
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null)

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}

interface DatabaseProviderProps {
  children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <DatabaseContext.Provider value={{ database, isAvailable: database !== null }}>
      {children}
    </DatabaseContext.Provider>
  )
}
