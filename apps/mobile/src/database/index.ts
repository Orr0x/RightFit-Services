import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import { Property, WorkOrder, Contractor, Photo, SyncQueue } from './models'

// Create the SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  // Uncomment for debugging:
  // jsi: true, // Use JSI for better performance (requires new architecture)
  // onSetUpError: error => {
  //   console.error('Database setup error:', error)
  // }
})

// Create the database
export const database = new Database({
  adapter,
  modelClasses: [Property, WorkOrder, Contractor, Photo, SyncQueue],
})
