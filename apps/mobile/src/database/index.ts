import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import {
  Property,
  WorkOrder,
  Contractor,
  Photo,
  SyncQueue,
  PropertyTenant,
  RentPayment,
  FinancialTransaction,
  PropertyBudget
} from './models'

let database: Database | null = null
let initPromise: Promise<Database | null> | null = null

// Initialize database asynchronously to avoid blocking app startup
async function initDatabase(): Promise<Database | null> {
  if (database) return database

  try {
    console.log('[DATABASE] Starting initialization...')
    const adapter = new SQLiteAdapter({
      schema,
      // jsi: true, // Use JSI for better performance (requires new architecture)
    })

    database = new Database({
      adapter,
      modelClasses: [
        Property,
        WorkOrder,
        Contractor,
        Photo,
        SyncQueue,
        PropertyTenant,
        RentPayment,
        FinancialTransaction,
        PropertyBudget
      ],
    })
    console.log('[DATABASE] Initialization complete')
    return database
  } catch (error) {
    // WatermelonDB requires a development build and won't work in Expo Go
    // App will run in online-only mode
    console.log('[DATABASE] Not available (Expo Go). Running in online-only mode.')
    return null
  }
}

// Get database instance - initializes on first call
function getDatabase(): Promise<Database | null> {
  if (!initPromise) {
    initPromise = initDatabase()
  }
  return initPromise
}

export { database, getDatabase }
