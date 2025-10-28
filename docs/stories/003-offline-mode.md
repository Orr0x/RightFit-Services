# Story 003: Offline Mode (CRITICAL)

**Epic:** Offline Functionality
**Priority:** CRITICAL - KEY DIFFERENTIATOR
**Sprint:** Sprint 4 (Week 7-8)
**Story Points:** 21 (High complexity, high risk)
**Status:** To Do

---

## User Story

**As a** landlord in a remote location with unreliable mobile signal
**I want to** create work orders and upload photos while offline
**So that** poor mobile signal doesn't prevent me from capturing urgent maintenance issues

---

## 🚨 CRITICAL SUCCESS FACTORS

This is the **MOST IMPORTANT** feature of the MVP. It's the key differentiator from competitors.

**Risk Level:** HIGH
- Complex technical implementation (WatermelonDB + sync queue)
- Multiple edge cases to handle
- High impact on user experience if buggy

**Mitigation:**
- Allocate extra buffer time in Sprint 4
- Implement comprehensive testing (see Testing section)
- Have rollback plan if sync issues discovered post-launch

---

## Acceptance Criteria

### AC-3.1: Offline Detection
- **Given** app is running
- **When** network status changes
- **Then** use NetInfo module to detect online/offline state
- **And** display yellow banner when offline: "You're offline. Changes will sync automatically when connection is restored." (dismissible)
- **And** store network status in React Context for global access
- **And** listen for connection changes and trigger sync when transitioning from offline → online

### AC-3.2: WatermelonDB Setup
- **Given** app is first launched
- **Then** initialize WatermelonDB:
  - Database name: `rightfit.db`
  - Tables: properties, work_orders, contractors, certificates, photos
  - Fields: id (UUID), tenant_id, created_at, updated_at, deleted_at, is_synced (boolean)
- **And** fetch all user data from API and hydrate WatermelonDB
- **And** on subsequent launches, use WatermelonDB as single source of truth for UI rendering

### AC-3.3: Offline Create Operations
- **Given** user is offline
- **When** user creates property, work order, contractor, or certificate
- **Then**:
  - Generate UUID client-side for record id
  - Store record in WatermelonDB with `is_synced: false`
  - Add record to sync_queue table:
    - operation: CREATE
    - entity_type: PROPERTY | WORK_ORDER | CONTRACTOR | CERTIFICATE | PHOTO
    - entity_id: UUID of the record
    - payload: JSON of record data
    - attempts: 0
    - created_at: timestamp
  - Display "cloud-off" icon on created item
  - Show "Pending sync" badge
  - Display SnackBar: "Saved locally. Will sync when online."

### AC-3.4: Offline Update Operations
- **Given** user is offline
- **When** user updates existing record
- **Then**:
  - Update record in WatermelonDB immediately (optimistic update)
  - Check sync_queue for existing pending operation on this entity_id:
    - If operation=CREATE exists: Update payload in existing queue entry
    - If operation=UPDATE exists: Update payload with latest changes
    - If not exists: Add new UPDATE operation to sync_queue
  - Display SnackBar: "Saved locally. Will sync when online."

### AC-3.5: Offline Delete Operations
- **Given** user is offline
- **When** user deletes record
- **Then**:
  - Perform soft delete in WatermelonDB (set deleted_at)
  - Check sync_queue:
    - If operation=CREATE (not yet synced): Remove from sync_queue entirely
    - Otherwise: Add DELETE operation to sync_queue
  - Display SnackBar: "Deleted locally. Will sync when online."

### AC-3.6: Offline Photo Upload
- **Given** user is offline
- **When** user takes photo for work order
- **Then**:
  - Store photo in device: `${FileSystem.documentDirectory}/photos/${uuid}.jpg`
  - Compress to ≤1MB
  - Store metadata in WatermelonDB photos table:
    - file_path (local device path)
    - work_order_id
    - is_synced: false
    - uploaded_url: null
  - Display thumbnail from local file_path
  - Add PHOTO_UPLOAD operation to sync_queue
  - Show "Pending sync" badge on photo

### AC-3.7: Background Sync Processor
- **Given** app detects online connection
- **When** sync processor runs (triggers: offline→online, app resume, manual pull-to-refresh)
- **Then** execute algorithm:
  1. Query sync_queue ordered by created_at ASC (FIFO)
  2. For each queue entry:
     - Validate operation is still needed
     - Execute API call (POST/PATCH/DELETE based on operation)
     - **On SUCCESS (2xx):**
       - Update WatermelonDB with server response
       - Set is_synced: true
       - Remove from sync_queue
     - **On FAILURE (4xx/5xx or network error):**
       - Increment attempts counter
       - Set last_attempt_at timestamp
       - If attempts ≥ 5: Move to sync_errors table
       - Apply exponential backoff: wait 2^attempts seconds
  3. Display progress: "Syncing 3 of 10 items..." (SnackBar)
  4. On completion: "All changes synced successfully" OR "Some items failed. View errors."

### AC-3.8: Conflict Resolution
- **Given** same record edited on mobile (offline) and web (online)
- **When** sync attempts to update with older timestamp
- **Then** use LAST-WRITE-WINS strategy:
  - If server updated_at > client updated_at: Server wins
  - Display warning: "Your changes to [entity] were overwritten by a more recent update"
  - Log conflict to analytics

### AC-3.9: Sync Errors UI
- **Given** sync_errors table has entries
- **When** user taps "Sync Errors" in Settings
- **Then** display BottomSheet with:
  - List of failed operations (entity_type, operation, error message, attempts)
  - Actions: "Retry Now" | "View Details" | "Discard"
  - Bulk actions: "Retry All" | "Discard All"

---

## Performance Requirements

- **Sync Speed:** ≥10 operations/second when online
- **WatermelonDB Queries:** <50ms for ≤1000 records per table
- **Offline Create:** <100ms UI update (instant feel)
- **Photo Compression:** ≤1MB per photo

---

## Edge Cases

### Critical Edge Cases

1. **Create then delete offline**
   - **Action:** User creates work order, then deletes it before going online
   - **Expected:** Remove CREATE from sync_queue, no API calls made

2. **Edit 10 times offline**
   - **Action:** User edits work order 10 times while offline
   - **Expected:** Single UPDATE in sync_queue with latest payload (not 10 operations)

3. **Create work order + 5 photos offline**
   - **Action:** User creates work order with 5 photos while offline
   - **Expected:** 6 operations in queue (1 CREATE + 5 PHOTO_UPLOAD). Work order must sync first, then photos link to work_order_id

4. **Network drops mid-sync**
   - **Action:** User is syncing 10 items, network drops after 3 items
   - **Expected:** 3 items synced successfully (removed from queue), 7 remain in queue for retry

5. **401 Unauthorized during sync**
   - **Action:** Access token expires during sync
   - **Expected:** Trigger re-authentication flow, pause sync, retry after new token obtained

6. **Conflicting changes (mobile offline + web online)**
   - **Action:** Edit work order status to IN_PROGRESS on mobile (offline), edit priority to HIGH on web (online)
   - **Expected:** Last-write-wins. Server changes win (priority=HIGH), mobile changes lost (status remains OPEN). Warn user.

---

## Technical Implementation Notes

### WatermelonDB Schema
```typescript
// apps/mobile/src/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'properties',
      columns: [
        { name: 'tenant_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'postcode', type: 'string' },
        { name: 'property_type', type: 'string' },
        { name: 'bedrooms', type: 'number' },
        { name: 'bathrooms', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true }
      ]
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'operation', type: 'string' }, // CREATE, UPDATE, DELETE, PHOTO_UPLOAD
        { name: 'entity_type', type: 'string' },
        { name: 'entity_id', type: 'string' },
        { name: 'payload', type: 'string' }, // JSON stringified
        { name: 'attempts', type: 'number' },
        { name: 'last_attempt_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' }
      ]
    })
    // ... more tables
  ]
})
```

### Sync Processor Implementation
```typescript
// apps/mobile/src/services/syncProcessor.ts
export class SyncProcessor {
  async processQueue() {
    const queue = await database.collections
      .get('sync_queue')
      .query(Q.sortBy('created_at', Q.asc))
      .fetch()

    for (const item of queue) {
      try {
        const response = await this.executeOperation(item)
        await this.handleSuccess(item, response)
      } catch (error) {
        await this.handleFailure(item, error)
      }
    }
  }

  async executeOperation(item) {
    switch (item.operation) {
      case 'CREATE':
        return api.post(`/api/${item.entity_type}`, JSON.parse(item.payload))
      case 'UPDATE':
        return api.patch(`/api/${item.entity_type}/${item.entity_id}`, JSON.parse(item.payload))
      case 'DELETE':
        return api.delete(`/api/${item.entity_type}/${item.entity_id}`)
      case 'PHOTO_UPLOAD':
        return this.uploadPhoto(item)
    }
  }

  async handleSuccess(item, response) {
    // Update WatermelonDB with server data
    await database.write(async () => {
      const record = await database.collections
        .get(item.entity_type)
        .find(item.entity_id)
      await record.update(rec => {
        rec.is_synced = true
        // Merge server response
      })
      // Remove from sync_queue
      await item.destroyPermanently()
    })
  }

  async handleFailure(item, error) {
    await database.write(async () => {
      await item.update(rec => {
        rec.attempts += 1
        rec.last_attempt_at = Date.now()
      })

      if (item.attempts >= 5) {
        // Move to sync_errors
        await database.collections.get('sync_errors').create(rec => {
          rec.operation = item.operation
          rec.entity_type = item.entity_type
          rec.error_message = error.message
          // ... copy other fields
        })
        await item.destroyPermanently()
      }
    })

    // Exponential backoff
    await this.delay(Math.pow(2, item.attempts) * 1000)
  }
}
```

### Network Status Detection
```typescript
// apps/mobile/src/hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline
      const nowOnline = state.isConnected

      setIsOnline(nowOnline)

      // Trigger sync on offline → online transition
      if (wasOffline && nowOnline) {
        syncProcessor.processQueue()
      }
    })

    return () => unsubscribe()
  }, [isOnline])

  return { isOnline }
}
```

---

## Testing Strategy

### Unit Tests
- [ ] Sync queue CRUD operations
- [ ] Conflict resolution logic (last-write-wins)
- [ ] Exponential backoff calculation
- [ ] Photo compression and storage

### Integration Tests
- [ ] Create property offline → Sync online → Verify in API database
- [ ] Create work order + 3 photos offline → Sync → Verify photos uploaded to S3
- [ ] Edit work order 5 times offline → Verify single UPDATE in queue
- [ ] Delete work order offline (not yet synced) → Verify no API call
- [ ] Network drop mid-sync → Verify partial sync success, remaining items in queue

### Manual Testing Checklist
- [ ] Enable airplane mode → Create work order → Verify saved locally
- [ ] Add 2 photos while offline → Verify thumbnails display from local storage
- [ ] Disable airplane mode → Verify sync starts automatically
- [ ] Watch sync progress indicator display correct count
- [ ] Verify "All synced" message appears on completion
- [ ] Open web app → Verify work order + photos appear
- [ ] Edit same work order on mobile (offline) and web (online) → Verify conflict handled
- [ ] Force sync failure (invalid token) → Verify moved to sync_errors after 5 attempts
- [ ] Test with poor/intermittent network → Verify resilient sync

---

## Dependencies

- **Blocked By:** Work Order Management (Story 002), Property Management (Story 001)
- **Requires:** `@nozbe/watermelondb`, `@react-native-community/netinfo`, `expo-file-system`

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] WatermelonDB configured with all tables
- [ ] Sync processor implemented with FIFO queue
- [ ] Network status detection working
- [ ] Offline create/update/delete operations work
- [ ] Photo storage in local file system
- [ ] Background sync triggers correctly
- [ ] Conflict resolution implemented (last-write-wins)
- [ ] Sync errors UI complete
- [ ] Performance targets met (10 ops/sec, <50ms queries)
- [ ] Unit tests written (>80% coverage for sync logic)
- [ ] Integration tests pass (all edge cases)
- [ ] Manual testing checklist completed
- [ ] Code reviewed by senior developer (if available)
- [ ] Deployed to dev and staging for QA
- [ ] Sign-off from Product Owner

---

## Rollback Plan

If critical bugs discovered after Sprint 4:
1. Feature flag to disable offline mode
2. Revert to online-only mode
3. Display message: "Offline mode temporarily disabled for improvements"
4. Fix issues in Sprint 5
5. Re-enable with phased rollout (10% → 50% → 100%)
