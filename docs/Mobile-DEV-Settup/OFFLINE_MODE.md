# Offline Mode Implementation

## Overview

The RightFit Services mobile app now supports full offline functionality, allowing landlords and contractors to work without an internet connection. Changes made offline are automatically synced when connectivity is restored.

## ⚠️ Requirements

**IMPORTANT:** Offline mode requires a **development build** and **will NOT work in Expo Go**.

### Why?
WatermelonDB uses native modules (`WMDatabaseBridge`) that are not available in Expo Go. You must create a development build to use offline functionality.

### How to Enable Offline Mode

1. **Create a development build**:
   ```bash
   cd apps/mobile
   npx expo prebuild
   npx expo run:ios     # For iOS
   npx expo run:android # For Android
   ```

2. **Test on device or simulator**:
   - The app will automatically detect if WatermelonDB is available
   - If running in Expo Go, you'll see a warning in console
   - Offline features will be disabled, but the app will still work online

### Graceful Degradation

The app is designed to work with or without offline mode:

- **With development build**: Full offline functionality enabled
- **In Expo Go**: App works online-only, API calls go directly to server
- **No crashes**: Database unavailability is handled gracefully

## Architecture

### Core Components

1. **WatermelonDB**: SQLite-based local database for React Native
   - Fast, reactive database with observables
   - Automatic schema migrations
   - Optimized for mobile performance

2. **Sync Service**: Handles bidirectional sync between local and server
   - Pulls latest data from server
   - Queues local changes for upload
   - Implements retry logic with exponential backoff

3. **Offline Data Service**: Provides offline-aware API methods
   - Automatically detects connectivity
   - Saves changes locally when offline
   - Syncs immediately when online

4. **Network Context**: Monitors connectivity status
   - Real-time network state monitoring
   - Provides `isOnline` flag to components
   - Shows offline indicator banner

### Database Schema

#### Properties Table
- `server_id`: ID from server (null if not yet synced)
- `tenant_id`: Multi-tenancy identifier
- `name`, `address_line1`, `city`, etc.: Property details
- `synced`: Boolean flag indicating sync status
- `created_at`, `updated_at`: Timestamps

#### Work Orders Table
- `server_id`: ID from server (null if not yet synced)
- `property_id`: Link to local property record
- `contractor_id`: Link to local contractor record
- `title`, `description`, `status`, `priority`, `category`: Work order details
- `estimated_cost`, `actual_cost`: Financial tracking
- `due_date`, `completed_at`: Scheduling
- `synced`: Boolean flag indicating sync status

#### Photos Table
- `server_id`: ID from server (null if not yet synced)
- `work_order_id`: Optional link to work order
- `property_id`: Optional link to property
- `local_uri`: Local file path
- `s3_url`: S3 URL (null until synced)
- `thumbnail_url`: Thumbnail URL (null until synced)
- `label`, `caption`: Metadata
- `synced`: Boolean flag

#### Contractors Table
- `server_id`: ID from server
- `name`, `email`, `phone`, `company_name`, `trade`: Contractor details
- `synced`: Boolean flag

#### Sync Queue Table
- `entity_type`: Type of entity ('work_order', 'photo', etc.)
- `entity_id`: Local ID of the entity
- `action`: Operation type ('create', 'update', 'delete')
- `payload`: JSON string of data to sync
- `attempts`: Number of sync attempts
- `last_error`: Error message from last failed attempt

## Usage

### Using Offline-Aware Services

```typescript
import offlineDataService from '../services/offlineDataService'

// Create a work order (works online or offline)
const workOrder = await offlineDataService.createWorkOrder({
  tenant_id: 'tenant-123',
  property_id: 'prop-456',
  title: 'Fix leaky faucet',
  description: 'Kitchen sink is dripping',
  category: 'PLUMBING',
  priority: 'HIGH',
  status: 'OPEN',
})

// The work order is saved locally immediately
// If online, it's also created on the server
// If offline, it's added to the sync queue

// Update a work order
await offlineDataService.updateWorkOrder(workOrder.id, {
  status: 'IN_PROGRESS',
  contractor_id: 'contractor-789',
})

// Upload a photo
await offlineDataService.uploadPhoto(photoUri, {
  work_order_id: workOrder.id,
  label: 'DURING',
  caption: 'Fixed the faucet',
})
```

### Checking Network Status

```typescript
import { useNetwork } from '../contexts/NetworkContext'

function MyComponent() {
  const { isOnline, isChecking } = useNetwork()

  return (
    <View>
      {isOnline ? (
        <Text>Connected</Text>
      ) : (
        <Text>Offline - Changes will sync when online</Text>
      )}
    </View>
  )
}
```

### Manual Sync

```typescript
import syncService from '../services/syncService'

// Trigger manual sync
const result = await syncService.syncAll()

if (result.success) {
  Alert.alert('Success', 'All changes synced!')
} else {
  Alert.alert('Sync Failed', result.error)
}

// Start automatic sync (every 5 minutes)
syncService.startAutoSync()

// Stop automatic sync
syncService.stopAutoSync()
```

### Using Local Database Directly

```typescript
import { database } from '../database'
import { WorkOrder } from '../database/models'

// Query work orders
const workOrdersCollection = database.get<WorkOrder>('work_orders')
const openWorkOrders = await workOrdersCollection
  .query(q => q.where('status', 'OPEN'))
  .fetch()

// Create a work order
await database.write(async () => {
  await workOrdersCollection.create(workOrder => {
    workOrder.title = 'New work order'
    workOrder.description = 'Description here'
    workOrder.status = 'OPEN'
    // ... set other fields
    workOrder.synced = false
  })
})

// Update a work order
await database.write(async () => {
  await workOrder.update(wo => {
    wo.status = 'COMPLETED'
    wo.synced = false
  })
})
```

## Sync Strategy

### Pull Phase (Server → Local)
1. Fetch all properties, work orders, and contractors from server
2. For each entity:
   - If exists locally (matched by `server_id`): Update
   - If new: Create locally
3. Mark all pulled entities as `synced: true`

### Push Phase (Local → Server)
1. Process sync queue in order
2. For each queued item:
   - Execute the action (create/update/delete)
   - On success: Remove from queue, update local record
   - On failure: Increment attempt counter, log error
   - After 5 failed attempts: Remove from queue

### Conflict Resolution
- **Last-write-wins**: Server timestamp is compared with local timestamp
- For now, server data always wins during pull phase
- Future enhancement: User-prompted conflict resolution

## UI Indicators

### Offline Banner
- Displayed at top of all screens when offline
- Orange background with "wifi-off" icon
- Message: "You're offline. Changes will be synced when you're back online."

### Synced Status
- Work orders and photos have `synced` field
- Can display visual indicator (e.g., cloud icon) in UI
- Unsynced items show different styling

## Testing Offline Mode

### In Development

1. **Disable network on device/emulator**:
   - iOS Simulator: Settings → Wi-Fi → Off
   - Android Emulator: Settings → Network & internet → Internet → Off
   - Physical device: Enable airplane mode

2. **Create/update work orders**:
   - They should save successfully
   - UI should show offline indicator
   - Changes stored in local database

3. **Re-enable network**:
   - Offline indicator should disappear
   - Sync should trigger automatically
   - Check server to verify changes uploaded

### Testing Sync Queue

```typescript
import { database } from '../database'
import { SyncQueue } from '../database/models'

// View pending sync items
const syncQueueCollection = database.get<SyncQueue>('sync_queue')
const pendingItems = await syncQueueCollection.query().fetch()

console.log('Pending sync items:', pendingItems.length)
pendingItems.forEach(item => {
  console.log(`${item.entityType} ${item.action} - ${item.attempts} attempts`)
})
```

## Limitations

1. **Photos**: Large photos may take time to upload when sync occurs
2. **Attachments**: Currently only photos are supported offline
3. **File Size**: Large sync queues may impact performance
4. **Conflicts**: Server data always wins (no manual resolution yet)

## Future Enhancements

- [ ] User-prompted conflict resolution
- [ ] Differential sync (only sync changed fields)
- [ ] Background sync with WorkManager/BackgroundFetch
- [ ] Photo compression before upload
- [ ] Periodic cleanup of old synced data
- [ ] Sync progress indicators
- [ ] Manual conflict resolution UI

## Troubleshooting

### Sync Not Working
1. Check network connectivity: `await syncService.isOnline()`
2. Check sync queue: Look for errors in sync_queue table
3. Check logs for API errors
4. Verify auth token is valid

### Data Not Appearing
1. Check if data exists locally: Query database directly
2. Verify `synced` flag
3. Check if sync queue has pending items
4. Manually trigger sync: `await syncService.syncAll()`

### Database Issues
1. Clear app data to reset database
2. Check schema version in database/schema/index.ts
3. Verify model decorators are correct

## Performance Considerations

- **Initial Sync**: First sync may take longer (downloading all data)
- **Background Processing**: Sync runs in background, doesn't block UI
- **Query Optimization**: Use indexed fields for queries
- **Batch Operations**: WatermelonDB automatically batches writes

## Security

- All data encrypted at rest (native SQLite encryption)
- Sync uses JWT authentication from AuthContext
- Multi-tenancy enforced at database level
- No sensitive data logged to console
