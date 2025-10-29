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

try {
  const adapter = new SQLiteAdapter({
    schema,
    // Uncomment for debugging:
    // jsi: true, // Use JSI for better performance (requires new architecture)
    // onSetUpError: error => {
    //   console.error('Database setup error:', error)
    // }
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
} catch (error) {
  // WatermelonDB requires a development build and won't work in Expo Go
  // App will run in online-only mode
  console.log('WatermelonDB not available (Expo Go). Running in online-only mode.')
}

export { database }
