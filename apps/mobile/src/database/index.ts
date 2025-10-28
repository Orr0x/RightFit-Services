import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Platform, NativeModules } from 'react-native'
import { schema } from './schema'
import { Property, WorkOrder, Contractor, Photo, SyncQueue } from './models'

// Check if WatermelonDB native module is available
// It requires a development build and won't work in Expo Go
const isWatermelonDBAvailable = () => {
  try {
    return Platform.OS !== 'web' && NativeModules.WMDatabaseBridge !== undefined
  } catch {
    return false
  }
}

// Create database only if native modules are available
let database: Database | null = null

if (isWatermelonDBAvailable()) {
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
      modelClasses: [Property, WorkOrder, Contractor, Photo, SyncQueue],
    })

    console.log('✅ WatermelonDB initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize WatermelonDB:', error)
  }
} else {
  console.warn('⚠️  WatermelonDB not available. Running in Expo Go or on web platform.')
  console.warn('⚠️  To enable offline mode, create a development build:')
  console.warn('    1. Run: npx expo prebuild')
  console.warn('    2. Build: npx expo run:ios or npx expo run:android')
}

export { database }
