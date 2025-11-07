# Offline Mode Testing - Comprehensive Checklist

**Prerequisites:** EAS dev build installed and working (Story 012 complete)
**Story:** 003 - Offline Mode
**Estimated Time:** 2-3 hours
**Device Required:** Android device with dev build installed

---

## Pre-Testing Setup

### Verify Dev Build Working
- [ ] Dev build installed on device
- [ ] WatermelonDB initialized (no "Expo Go" warnings)
- [ ] Can navigate all screens
- [ ] API server running on `http://localhost:3001`
- [ ] Mobile app connected to API (test login)

### Prepare Testing Environment
- [ ] Clear existing test data (optional fresh start)
- [ ] Have notepad ready for bug tracking
- [ ] Screenshot app ready (document bugs)
- [ ] Console logs visible on computer
- [ ] API server logs visible

---

## Test Suite 1: Offline Detection (15 minutes)

### Test 1.1: Online → Offline Transition

**Steps:**
1. Ensure device is online (WiFi on)
2. Open RightFit app
3. Navigate to Properties screen
4. Enable Airplane Mode on device
5. Observe UI changes

**Expected Results:**
- [ ] Yellow banner appears: "You're offline. Changes will sync automatically when connection is restored."
- [ ] Banner is dismissible (tap X)
- [ ] No app crash
- [ ] Can still navigate screens
- [ ] Offline indicator visible (cloud-off icon)

**Console Logs:**
```
✅ Network status changed: offline
✅ Offline mode activated
```

---

### Test 1.2: Offline → Online Transition

**Steps:**
1. Device in Airplane Mode (offline)
2. Disable Airplane Mode
3. Observe UI changes

**Expected Results:**
- [ ] Yellow banner disappears
- [ ] Green toast: "Back online. Syncing changes..."
- [ ] Sync processor starts automatically
- [ ] Online indicator visible (cloud-on icon)
- [ ] Sync progress shown (if pending items)

**Console Logs:**
```
✅ Network status changed: online
✅ Starting sync processor...
✅ Syncing 0 items (or count if pending)
```

---

## Test Suite 2: Offline Create Operations (30 minutes)

### Test 2.1: Create Property While Offline

**Setup:**
- Device in Airplane Mode (offline)
- Navigate to Properties → Create Property

**Steps:**
1. Fill in property form:
   - Name: "Offline Test House"
   - Address: "456 Offline St"
   - Postcode: "OFF L1NE"
   - Type: "House"
   - Bedrooms: 3
   - Bathrooms: 2
2. Tap "Create Property"
3. Observe result

**Expected Results:**
- [ ] Form submits successfully
- [ ] Property appears in list immediately (optimistic UI)
- [ ] Property shows "cloud-off" icon (not synced)
- [ ] Yellow badge: "Pending sync"
- [ ] SnackBar: "Saved locally. Will sync when online."
- [ ] No errors in console

**Console Logs:**
```
✅ Property created offline: { id: 'uuid-123', name: 'Offline Test House' }
✅ Saved to WatermelonDB with is_synced: false
✅ Added to sync_queue: operation=CREATE, entity_type=PROPERTY
```

**Database Verification:**
- [ ] Property in WatermelonDB with `is_synced: false`
- [ ] Entry in `sync_queue` table
- [ ] UUID generated client-side

---

### Test 2.2: Create Work Order While Offline

**Setup:**
- Device offline
- Navigate to Work Orders → Create Work Order

**Steps:**
1. Fill in work order form:
   - Title: "Offline Repair"
   - Description: "Fix leak in kitchen"
   - Priority: "HIGH"
   - Property: Select "Offline Test House"
   - Type: "REPAIR"
2. Tap "Create Work Order"

**Expected Results:**
- [ ] Work order created successfully
- [ ] Appears in list with "cloud-off" icon
- [ ] Shows "Pending sync" badge
- [ ] SnackBar confirmation
- [ ] Links to offline property correctly

**Console Logs:**
```
✅ Work order created offline: { id: 'uuid-456', title: 'Offline Repair' }
✅ Added to sync_queue: operation=CREATE, entity_type=WORK_ORDER
```

---

### Test 2.3: Create Contractor While Offline

**Setup:**
- Device offline
- Navigate to Contractors → Add Contractor

**Steps:**
1. Fill in contractor form:
   - Name: "Offline Plumber"
   - Email: "offline@plumber.com"
   - Phone: "07700900000"
   - Type: "PLUMBER"
2. Tap "Add Contractor"

**Expected Results:**
- [ ] Contractor created successfully
- [ ] Shows offline indicator
- [ ] Added to sync queue

---

### Test 2.4: Upload Photo While Offline

**Setup:**
- Device offline
- Open "Offline Repair" work order
- Tap "Add Photos"

**Steps:**
1. Take 3 photos with camera
2. Observe photo upload behavior

**Expected Results:**
- [ ] Photos captured successfully
- [ ] Photos compressed to ≤1MB each
- [ ] Photos stored locally: `/photos/uuid-1.jpg`, `/photos/uuid-2.jpg`, `/photos/uuid-3.jpg`
- [ ] Thumbnails display from local storage
- [ ] Each photo shows "cloud-off" icon
- [ ] Photos show "Pending sync" badge
- [ ] 3 PHOTO_UPLOAD operations added to sync queue

**Console Logs:**
```
✅ Photo saved locally: /photos/uuid-photo-1.jpg (size: 842KB)
✅ Photo metadata saved to WatermelonDB
✅ Added to sync_queue: operation=PHOTO_UPLOAD
```

---

## Test Suite 3: Offline Update Operations (30 minutes)

### Test 3.1: Edit Existing Property While Offline

**Setup:**
- Device offline
- Property "Offline Test House" exists (created offline)
- Navigate to property details

**Steps:**
1. Tap "Edit"
2. Change:
   - Name: "Offline Test House EDITED"
   - Bedrooms: 4 (was 3)
3. Save changes

**Expected Results:**
- [ ] Changes save successfully
- [ ] UI updates immediately (optimistic)
- [ ] Still shows offline indicator
- [ ] SnackBar: "Saved locally. Will sync when online."

**Console Logs:**
```
✅ Property updated offline
✅ Checking sync_queue for existing operations...
✅ Found CREATE operation, updating payload (not creating new UPDATE)
```

**Verification:**
- [ ] Only ONE entry in sync_queue (CREATE with updated data)
- [ ] NOT two entries (CREATE + UPDATE)

---

### Test 3.2: Edit Multiple Times While Offline

**Setup:**
- Device offline
- Edit same work order 5 times

**Steps:**
1. Edit work order: Priority → "MEDIUM"
2. Save
3. Edit again: Priority → "LOW"
4. Save
5. Edit again: Description → "Updated description"
6. Save
7. Edit again: Status → "IN_PROGRESS"
8. Save
9. Edit again: Priority → "HIGH"
10. Save

**Expected Results:**
- [ ] All edits save successfully
- [ ] UI updates after each edit
- [ ] Only ONE entry in sync_queue
- [ ] Queue entry has LATEST changes (Priority: HIGH, Status: IN_PROGRESS)

**Console Logs:**
```
✅ Work order updated offline (edit 1)
✅ Updating existing sync_queue entry with latest changes
✅ Work order updated offline (edit 2)
✅ Updating existing sync_queue entry with latest changes
...
```

**Verification:**
- [ ] `sync_queue` has 1 entry for work order
- [ ] Entry has all latest changes
- [ ] No duplicate entries

---

### Test 3.3: Edit Work Order + Upload Photos Offline

**Setup:**
- Device offline
- Work order "Offline Repair" exists

**Steps:**
1. Edit work order: Add notes "Added more details"
2. Save
3. Add 2 more photos
4. Check sync queue

**Expected Results:**
- [ ] Work order update queued
- [ ] 2 PHOTO_UPLOAD operations queued
- [ ] Total: 3 operations in queue (1 UPDATE + 2 PHOTO_UPLOAD)
- [ ] Work order shows offline indicator
- [ ] Photos show offline indicator

---

## Test Suite 4: Offline Delete Operations (20 minutes)

### Test 4.1: Delete Synced Item While Offline

**Setup:**
- Create property online (synced)
- Go offline
- Delete the property

**Steps:**
1. Device online, create property "Delete Test"
2. Verify property synced (no offline indicator)
3. Go offline (Airplane Mode)
4. Delete "Delete Test" property
5. Confirm deletion

**Expected Results:**
- [ ] Property soft-deleted (not removed from database)
- [ ] Property hidden from UI
- [ ] DELETE operation added to sync_queue
- [ ] SnackBar: "Deleted locally. Will sync when online."

**Console Logs:**
```
✅ Property soft-deleted: deleted_at set to [timestamp]
✅ Added to sync_queue: operation=DELETE
```

---

### Test 4.2: Delete Offline-Created Item Before Sync

**Setup:**
- Device offline
- Create property "Delete Offline Test"
- Immediately delete it (before going online)

**Steps:**
1. Device offline
2. Create property "Delete Offline Test"
3. Property appears in list with offline indicator
4. Delete property immediately
5. Confirm deletion

**Expected Results:**
- [ ] Property removed from list
- [ ] Property removed from WatermelonDB
- [ ] CREATE operation REMOVED from sync_queue
- [ ] NO DELETE operation added
- [ ] SnackBar: "Deleted locally."

**Console Logs:**
```
✅ Property created offline (not yet synced)
✅ Property deleted offline before sync
✅ Removing CREATE operation from sync_queue (no server sync needed)
```

**Verification:**
- [ ] `sync_queue` has 0 entries for this property
- [ ] Property not in WatermelonDB
- [ ] No API call will be made when online

---

## Test Suite 5: Sync Process (45 minutes)

### Test 5.1: Basic Sync - Single Property

**Setup:**
- Device offline
- Created property "Sync Test 1" offline
- 1 item in sync queue

**Steps:**
1. Verify property shows offline indicator
2. Disable Airplane Mode (go online)
3. Observe sync process

**Expected Results:**
- [ ] Sync starts automatically within 5 seconds
- [ ] Toast: "Syncing 1 of 1 items..."
- [ ] Progress indicator visible
- [ ] Property offline indicator removed when synced
- [ ] Toast: "All changes synced successfully"
- [ ] `sync_queue` empty after sync

**Console Logs:**
```
✅ Network online, starting sync...
✅ Processing sync_queue: 1 items
✅ Syncing property: POST /api/properties
✅ Success (201): Property synced to server
✅ Updating WatermelonDB: is_synced=true
✅ Removing from sync_queue
✅ Sync complete: 1/1 successful
```

**Web App Verification:**
- [ ] Open web app (different browser)
- [ ] Navigate to Properties
- [ ] "Sync Test 1" property appears
- [ ] All fields match mobile app

---

### Test 5.2: Batch Sync - Multiple Items

**Setup:**
- Device offline
- Create:
  - 3 properties
  - 2 work orders
  - 1 contractor
  - Upload 5 photos
- Total: 11 items in sync queue

**Steps:**
1. Verify all items show offline indicator
2. Go online
3. Observe sync progress

**Expected Results:**
- [ ] Sync starts automatically
- [ ] Progress indicator: "Syncing 1 of 11 items..."
- [ ] Progress updates: 2 of 11, 3 of 11, etc.
- [ ] All items sync in FIFO order (First In, First Out)
- [ ] Properties sync before work orders (dependencies)
- [ ] Work orders sync before photos (dependencies)
- [ ] All offline indicators removed
- [ ] Toast: "All changes synced successfully"

**Console Logs:**
```
✅ Sync queue: 11 items
✅ [1/11] Syncing property...
✅ [2/11] Syncing property...
✅ [3/11] Syncing property...
✅ [4/11] Syncing work order...
✅ [5/11] Syncing work order...
✅ [6/11] Syncing contractor...
✅ [7/11] Uploading photo...
...
✅ Sync complete: 11/11 successful
```

---

### Test 5.3: Sync Photos with Work Order

**Setup:**
- Device offline
- Create work order "Photo Test"
- Add 3 photos to work order
- Go online

**Steps:**
1. Verify work order and photos offline
2. Go online
3. Watch sync order

**Expected Results:**
- [ ] Work order syncs FIRST
- [ ] Work order gets server ID
- [ ] Photos sync AFTER work order
- [ ] Photos link to correct work order ID
- [ ] All photos upload to S3
- [ ] Thumbnails update to S3 URLs

**Console Logs:**
```
✅ [1/4] Syncing work order... (must sync first)
✅ Work order created: { id: 'server-uuid-123' }
✅ [2/4] Uploading photo 1... (links to work order)
✅ [3/4] Uploading photo 2...
✅ [4/4] Uploading photo 3...
```

---

### Test 5.4: Network Drop Mid-Sync

**Setup:**
- Device offline
- Create 10 properties
- Go online to start sync
- Enable Airplane Mode after 3 items sync

**Steps:**
1. Device offline, create 10 properties
2. Go online
3. Watch sync: "Syncing 1 of 10..."
4. After 3 items synced, enable Airplane Mode
5. Wait 10 seconds
6. Disable Airplane Mode

**Expected Results:**
- [ ] Sync starts successfully
- [ ] First 3 items sync: "Syncing 3 of 10..."
- [ ] Network drop detected
- [ ] Sync pauses gracefully (no crash)
- [ ] Toast: "Sync paused - connection lost"
- [ ] When back online: Sync resumes from item 4
- [ ] Toast: "Syncing 4 of 10..."
- [ ] All 10 items eventually sync

**Console Logs:**
```
✅ [1/10] Property synced
✅ [2/10] Property synced
✅ [3/10] Property synced
❌ Network error: Failed to sync property 4
⏸️ Sync paused - will retry when online
...
✅ Network restored, resuming sync
✅ [4/10] Property synced (retry)
...
```

---

## Test Suite 6: Conflict Resolution (30 minutes)

### Test 6.1: Edit Same Property on Web and Mobile (Offline)

**Setup:**
- Property "Conflict Test" exists (synced)
- Edit on web app
- Edit on mobile (offline)
- Go online to sync

**Steps:**
1. Create property "Conflict Test" online (synced)
2. On web app: Edit property name → "Conflict Test WEB"
3. On mobile (offline): Edit property name → "Conflict Test MOBILE"
4. Mobile goes online, sync starts

**Expected Results:**
- [ ] Sync detects conflict (different updated_at timestamps)
- [ ] LAST-WRITE-WINS: Server wins (web edit more recent)
- [ ] Mobile data overwritten with server data
- [ ] Property name becomes "Conflict Test WEB"
- [ ] Warning toast: "Your changes to 'Conflict Test' were overwritten by a more recent update"
- [ ] No data loss (logged for review)

**Console Logs:**
```
⚠️ Conflict detected: Property updated on server since last sync
⚠️ Server updated_at: 2025-10-29T14:32:10
⚠️ Client updated_at: 2025-10-29T14:30:05
✅ Applying last-write-wins: Server version wins
⚠️ User notified: Changes overwritten
```

---

### Test 6.2: Delete on Web, Edit on Mobile (Offline)

**Setup:**
- Work order "Delete Test WO" exists
- Delete on web app
- Edit on mobile (offline)
- Go online

**Steps:**
1. Create work order online (synced)
2. On web app: Delete work order
3. On mobile (offline): Edit work order description
4. Mobile goes online

**Expected Results:**
- [ ] Sync detects work order deleted on server
- [ ] Mobile UPDATE fails (404 Not Found)
- [ ] Work order removed from mobile
- [ ] Toast: "Work order was deleted on another device"
- [ ] Sync continues with other items

**Console Logs:**
```
❌ Failed to sync work order: 404 Not Found (deleted on server)
✅ Removing from local database
⚠️ User notified: Item deleted elsewhere
```

---

## Test Suite 7: Error Handling (30 minutes)

### Test 7.1: Sync Failure - 401 Unauthorized

**Setup:**
- Device offline
- Create property "Auth Test"
- Log out on web app (invalidate token)
- Go online

**Steps:**
1. Create property offline
2. On web app, log out (invalidates JWT)
3. Mobile goes online, sync starts

**Expected Results:**
- [ ] Sync attempts to create property
- [ ] Gets 401 Unauthorized
- [ ] Sync pauses
- [ ] Re-authentication triggered
- [ ] User prompted to log in again
- [ ] After login, sync retries automatically

**Console Logs:**
```
❌ Sync failed: 401 Unauthorized
🔑 Token expired, triggering re-authentication...
⏸️ Pausing sync until new token obtained
✅ User logged in, new token obtained
✅ Retrying sync...
```

---

### Test 7.2: Sync Failure - 500 Server Error

**Setup:**
- Device offline
- Create property
- Stop API server
- Go online

**Steps:**
1. Create property offline
2. Stop API server (`Ctrl+C` on API terminal)
3. Go online, sync starts

**Expected Results:**
- [ ] Sync attempts to create property
- [ ] Gets network error (connection refused)
- [ ] Retry with exponential backoff
- [ ] Attempt 1: Wait 2 seconds, retry
- [ ] Attempt 2: Wait 4 seconds, retry
- [ ] Attempt 3: Wait 8 seconds, retry
- [ ] Attempt 4: Wait 16 seconds, retry
- [ ] Attempt 5: Wait 32 seconds, retry
- [ ] After 5 failures: Move to `sync_errors` table
- [ ] Toast: "Some items failed to sync. View errors in Settings."

**Console Logs:**
```
❌ Sync failed: Network error
⏳ Retry 1 in 2 seconds...
❌ Sync failed: Network error
⏳ Retry 2 in 4 seconds...
...
❌ Max retries reached (5 attempts)
📋 Moving to sync_errors table
```

---

### Test 7.3: View and Retry Sync Errors

**Setup:**
- Items in `sync_errors` table (from Test 7.2)
- Navigate to Settings → Sync Errors

**Steps:**
1. Open Settings
2. Tap "Sync Errors" (shows badge if errors)
3. View error list
4. Start API server
5. Tap "Retry All"

**Expected Results:**
- [ ] Bottom sheet opens with error list
- [ ] Shows failed operations:
  - Entity type (PROPERTY, WORK_ORDER)
  - Operation (CREATE, UPDATE, DELETE)
  - Error message
  - Number of attempts
- [ ] Buttons: "Retry Now" | "Discard"
- [ ] "Retry All" button at bottom
- [ ] After tapping "Retry All":
  - Items moved back to sync_queue
  - Sync processor runs
  - Successful syncs remove from errors
  - Toast: "Retried 3 items successfully"

---

## Test Suite 8: Edge Cases (30 minutes)

### Test 8.1: App Restart During Offline Mode

**Setup:**
- Device offline
- Create 5 properties
- Force close app
- Reopen app (still offline)

**Steps:**
1. Create 5 properties offline
2. Verify in sync queue (5 items)
3. Force close app (swipe away from recent apps)
4. Reopen app
5. Check properties and sync queue

**Expected Results:**
- [ ] All 5 properties still visible
- [ ] All show offline indicator
- [ ] Sync queue still has 5 items
- [ ] No data loss
- [ ] When go online, all sync successfully

---

### Test 8.2: Create → Delete → Create Same Entity

**Setup:**
- Device offline

**Steps:**
1. Create property "Recreate Test"
2. Delete "Recreate Test"
3. Create property "Recreate Test" again (same name)
4. Go online

**Expected Results:**
- [ ] First CREATE added to queue
- [ ] DELETE removes first CREATE from queue
- [ ] Second CREATE added to queue
- [ ] When online: Only 1 API call (second CREATE)
- [ ] No DELETE call (never existed on server)

---

### Test 8.3: Large Batch - 100 Items

**Setup:**
- Device offline
- Create script to generate 100 properties

**Steps:**
1. Device offline
2. Create 100 properties (automate or manual)
3. Go online
4. Monitor sync performance

**Expected Results:**
- [ ] All 100 items queue successfully
- [ ] Sync processes at ≥10 items/second
- [ ] Total sync time < 15 seconds
- [ ] No timeout errors
- [ ] All items sync successfully
- [ ] Performance acceptable

---

### Test 8.4: Slow Network - Sync Resilience

**Setup:**
- Device online
- Enable network throttling (Developer Options → Limit network speed)
- Create items offline
- Go online with slow network

**Steps:**
1. Device offline
2. Create 10 properties
3. Enable slow network (2G speed)
4. Go online
5. Watch sync progress

**Expected Results:**
- [ ] Sync starts successfully
- [ ] Progress slower but stable
- [ ] No timeouts
- [ ] All items eventually sync
- [ ] User sees progress: "Syncing X of 10..."

---

## Final Verification (15 minutes)

### Smoke Test: Full Offline Workflow

**Complete workflow:**
1. [ ] Go offline
2. [ ] Create 2 properties
3. [ ] Create 3 work orders (link to properties)
4. [ ] Upload 6 photos (2 photos per work order)
5. [ ] Edit 1 property
6. [ ] Edit 2 work orders
7. [ ] Delete 1 work order
8. [ ] Check sync queue (should have ~12 operations)
9. [ ] Go online
10. [ ] Verify sync completes
11. [ ] Check web app - all data present
12. [ ] All offline indicators gone
13. [ ] No errors

---

## Bug Tracking Template

**For each bug found:**

```
Bug #X: [Short Title]
Severity: Critical | High | Medium | Low
Test: [Test number where found]
Steps to Reproduce:
1. ...
2. ...
Expected: ...
Actual: ...
Console Logs: [Paste logs]
Screenshots: [Attach]
Device: [Android version, phone model]
```

---

## Test Results Summary

```
Total Tests: 25
Passed: ___
Failed: ___
Blocked: ___

Critical Failures: ___
High Priority Bugs: ___
Medium Priority Bugs: ___
Low Priority Bugs: ___

Overall Status: ✅ PASS | ⚠️ PASS WITH ISSUES | ❌ FAIL

Ready for Production: YES | NO

Notes:
...
```

---

## Sign-Off

**Tested By:** _________________
**Date:** _________________
**Build Version:** _________________
**Device:** _________________

**Offline Mode Status:**
- [ ] All critical tests pass
- [ ] No showstopper bugs
- [ ] Performance acceptable
- [ ] Ready for production

**Recommendation:**
- [ ] Approve for production
- [ ] Requires bug fixes before production
- [ ] Needs significant rework

---

**Last Updated:** 2025-10-29
**Next Review:** After bug fixes
