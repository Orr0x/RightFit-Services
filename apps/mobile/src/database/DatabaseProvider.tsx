import React, { createContext, useContext, ReactNode } from 'react'
import { Database } from '@nozbe/watermelondb'
import { database } from './index'

const DatabaseContext = createContext<Database | null>(null)

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
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  )
}
