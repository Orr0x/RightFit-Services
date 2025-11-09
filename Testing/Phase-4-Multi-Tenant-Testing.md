# Phase 4: Multi-Tenant Testing & Validation

**Date:** 2025-11-08
**Status:** IN PROGRESS
**Related:** [Maintenance Portal Multi-Tenant Alignment Plan](../Planning/MAINTENANCE-PORTAL-MULTI-TENANT-ALIGNMENT.md)

---

## Overview

This document provides comprehensive testing scenarios to verify multi-tenant isolation is working correctly after implementing Phases 1-3 of the maintenance portal multi-tenant alignment.

**Objectives:**
- Verify service provider isolation (users can only see their own data)
- Test API security enforcement
- Validate localStorage isolation between portals
- Confirm worker detection for dual-role users
- Document any security vulnerabilities or data leakage

---

## Test Environment

### Service Providers Available

| Service Provider ID | Business Name | Tenant | Admin Account |
|---------------------|---------------|--------|---------------|
| `sp-cleaning-test` | CleanCo Services | tenant-cleaning-test | admin@cleaningco.test |
| `sp-maintenance-test` | FixIt Maintenance | tenant-maintenance-test | admin@maintenance.test |
| `8aeb5932-907c-41b3-a2bc-05b27ed0dc87` | RightFit Services | b3f0c957-0aa6-47d4-a104-e7da43897572 | test2@rightfit.com |

### Test Credentials

All test accounts use password: `TestPassword123!`

**Cleaning Portal (localhost:5174):**
- Admin: admin@cleaningco.test (Sarah Johnson)
- Manager: manager@cleaningco.test (Mike Thompson)
- Worker: worker1@cleaningco.test (Maria Garcia)
- Worker: worker2@cleaningco.test (John Smith)

**Maintenance Portal (localhost:5175):**
- Admin: admin@maintenance.test (Robert Davis)
- Contractor: contractor1@maintenance.test (Carlos Rodriguez)
- Contractor: contractor2@maintenance.test (Lisa Anderson)

**Worker Portal (localhost:5178):**
- Worker: worker1@cleaningco.test (Maria Garcia)
- Worker: worker2@cleaningco.test (John Smith)

---

## Test Scenario 1: Service Provider Isolation

**Objective:** Verify that users from different service providers cannot see each other's data.

### Test 1.1: CleanCo Services - Data Access

**Steps:**
1. Open cleaning portal: http://localhost:5174
2. Login with `admin@cleaningco.test` / `TestPassword123!`
3. Navigate to Dashboard
4. Check browser console for logged `service_provider_id` value
5. Navigate to various pages (Cleaning Jobs, Workers, Customers)

**Expected Results:**
- ✅ User successfully logs in
- ✅ Dashboard loads with service_provider_id: `sp-cleaning-test`
- ✅ All API calls include `service_provider_id=sp-cleaning-test`
- ✅ Only CleanCo Services data is visible
- ✅ No maintenance tenant data visible
- ✅ No error in console about missing service_provider_id

**Validation:**
- [ ] service_provider_id in localStorage: `cleaning_user` contains `"service_provider_id":"sp-cleaning-test"`
- [ ] API calls include correct parameter: Check Network tab for `?service_provider_id=sp-cleaning-test`
- [ ] No 403 errors in console
- [ ] Dashboard shows only CleanCo cleaning jobs

---

### Test 1.2: FixIt Maintenance - Data Access

**Steps:**
1. Open maintenance portal: http://localhost:5175
2. Login with `admin@maintenance.test` / `TestPassword123!`
3. Navigate to Maintenance Dashboard
4. Check browser console for logged `service_provider_id` value
5. Navigate to various pages (Maintenance Jobs, Workers, Contractors)

**Expected Results:**
- ✅ User successfully logs in
- ✅ Dashboard loads with service_provider_id: `sp-maintenance-test`
- ✅ All API calls include `service_provider_id=sp-maintenance-test`
- ✅ Only FixIt Maintenance data is visible
- ✅ No cleaning tenant data visible
- ✅ No error about missing service_provider_id

**Validation:**
- [ ] service_provider_id in localStorage: `maintenance_user` contains `"service_provider_id":"sp-maintenance-test"`
- [ ] API calls include correct parameter: Check Network tab for `?service_provider_id=sp-maintenance-test`
- [ ] No 403 errors in console
- [ ] Dashboard shows only FixIt maintenance jobs

---

### Test 1.3: Cross-Tenant Data Verification

**Steps:**
1. Login as `admin@cleaningco.test` to cleaning portal
2. Note the number of cleaning jobs visible
3. Logout and login as `admin@maintenance.test` to maintenance portal
4. Check if any CleanCo cleaning jobs are visible in maintenance portal
5. Navigate to Cleaning Jobs section in maintenance portal
6. Verify only maintenance-related cleaning jobs are shown

**Expected Results:**
- ✅ CleanCo admin sees only CleanCo jobs
- ✅ Maintenance admin sees only FixIt jobs
- ✅ No cross-tenant data leakage
- ✅ Each portal maintains separate data scope

**Validation:**
- [ ] Job counts differ between portals
- [ ] No jobs from CleanCo appear in FixIt portal
- [ ] No jobs from FixIt appear in CleanCo portal

---

## Test Scenario 2: API Security Enforcement

**Objective:** Verify that API middleware correctly enforces service provider isolation.

### Test 2.1: Direct API Call with Wrong Service Provider ID

**Setup:**
1. Login as `admin@cleaningco.test` to cleaning portal
2. Open browser DevTools > Console
3. Get the access token from localStorage: `localStorage.getItem('cleaning_access_token')`

**Test:**
Execute this in browser console:
```javascript
// Try to access FixIt Maintenance data using CleanCo token
const token = localStorage.getItem('cleaning_access_token');
const wrongProviderId = 'sp-maintenance-test'; // FixIt's ID

fetch(`/api/maintenance-jobs?service_provider_id=${wrongProviderId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

**Expected Results:**
- ✅ API returns 403 Forbidden error
- ✅ Error message: "Invalid service provider" or similar
- ✅ No maintenance job data returned
- ✅ Middleware blocks unauthorized access

**Validation:**
- [ ] Response status: 403
- [ ] Response body contains error message
- [ ] No sensitive data leaked in error response

---

### Test 2.2: API Call without Service Provider ID

**Test:**
Execute this in browser console:
```javascript
// Try to call API without service_provider_id parameter
const token = localStorage.getItem('cleaning_access_token');

fetch('/api/cleaning-jobs', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

**Expected Results:**
- ✅ API returns 400 Bad Request or 403 Forbidden
- ✅ Error message indicates missing service_provider_id
- ✅ No data returned without proper scoping

**Validation:**
- [ ] Response status: 400 or 403
- [ ] Clear error message returned
- [ ] API does not default to returning all data

---

### Test 2.3: Verify requireServiceProvider Middleware

**Steps:**
1. Check API server logs while making requests
2. Login as `admin@cleaningco.test`
3. Navigate to Cleaning Jobs page
4. Watch API server console for middleware logs

**Expected Results:**
- ✅ Middleware validates service_provider_id on every request
- ✅ Middleware checks service provider belongs to user's tenant
- ✅ Rejected requests logged with security warnings
- ✅ No requests bypass middleware

**Validation:**
- [ ] Server logs show service provider validation
- [ ] Invalid requests are logged as security events
- [ ] All protected routes use `requireServiceProvider` middleware

---

## Test Scenario 3: LocalStorage Isolation

**Objective:** Verify that each portal maintains separate authentication state.

### Test 3.1: Simultaneous Login to Multiple Portals

**Steps:**
1. Open cleaning portal (localhost:5174) in Tab 1
2. Login as `admin@cleaningco.test`
3. Open maintenance portal (localhost:5175) in Tab 2
4. Login as `admin@maintenance.test`
5. Open worker portal (localhost:5178) in Tab 3
6. Login as `worker1@cleaningco.test`
7. Switch between tabs and verify each maintains separate auth state

**Expected Results:**
- ✅ All three portals remain authenticated simultaneously
- ✅ Each portal shows correct user information
- ✅ No auth state conflicts between tabs
- ✅ Each portal maintains separate localStorage keys

**Validation:**
- [ ] Open DevTools > Application > LocalStorage
- [ ] Verify separate keys:
  - `cleaning_access_token`, `cleaning_refresh_token`, `cleaning_user`, `cleaning_is_worker`
  - `maintenance_access_token`, `maintenance_refresh_token`, `maintenance_user`, `maintenance_is_worker`
  - `worker_token`, `worker_id`
- [ ] No key collisions or overwrites
- [ ] Each portal operates independently

---

### Test 3.2: Logout from One Portal

**Steps:**
1. With all three portals logged in (from Test 3.1)
2. In cleaning portal tab, click Logout
3. Switch to maintenance portal tab
4. Verify maintenance portal still shows as logged in
5. Switch to worker portal tab
6. Verify worker portal still shows as logged in

**Expected Results:**
- ✅ Cleaning portal logs out successfully
- ✅ Maintenance portal remains authenticated
- ✅ Worker portal remains authenticated
- ✅ Logout in one portal does not affect others

**Validation:**
- [ ] After logout, `cleaning_*` keys removed from localStorage
- [ ] `maintenance_*` keys still present
- [ ] `worker_*` keys still present
- [ ] Each portal's auth state is independent

---

### Test 3.3: Token Expiration Handling

**Steps:**
1. Login to cleaning portal
2. Wait for token to expire (or manually remove token)
3. Try to navigate to a protected page
4. Verify portal handles expired token gracefully

**Expected Results:**
- ✅ Portal detects expired token
- ✅ User redirected to login page
- ✅ Appropriate error message shown
- ✅ No app crash or white screen

**Validation:**
- [ ] Expired token handled gracefully
- [ ] User experience is smooth
- [ ] Clear messaging about re-authentication

---

## Test Scenario 4: Worker Detection

**Objective:** Verify worker detection works for dual-role users.

### Test 4.1: Admin Without Worker Profile

**Steps:**
1. Login to maintenance portal as `admin@maintenance.test`
2. Open browser DevTools > Console
3. Check console for worker detection API call
4. Check console for any errors related to worker check
5. Verify `localStorage.getItem('maintenance_is_worker')`

**Expected Results:**
- ✅ API call to `/api/maintenance-workers/me` returns 404
- ✅ 404 is handled gracefully (no error shown to user)
- ✅ `isWorker` state set to false
- ✅ `maintenance_is_worker` NOT in localStorage
- ✅ Portal functions normally

**Validation:**
- [ ] Console shows: `GET /api/maintenance-workers/me 404 (Not Found)`
- [ ] No red error messages in UI
- [ ] Admin can access all admin features
- [ ] Dashboard loads successfully

---

### Test 4.2: Worker With Profile (if worker profile exists)

**Prerequisites:** Create a maintenance worker profile for admin@maintenance.test

**Steps:**
1. Login to maintenance portal as user with worker profile
2. Check console for worker detection API call
3. Verify `localStorage.getItem('maintenance_is_worker')`
4. Check if any worker-specific UI elements appear

**Expected Results:**
- ✅ API call to `/api/maintenance-workers/me` returns 200
- ✅ Worker data returned successfully
- ✅ `isWorker` state set to true
- ✅ `maintenance_is_worker` set to 'true' in localStorage
- ✅ User can access both admin and worker features

**Validation:**
- [ ] Console shows: `GET /api/maintenance-workers/me 200 (OK)`
- [ ] localStorage contains: `maintenance_is_worker: "true"`
- [ ] Worker profile data loaded correctly
- [ ] Dual-role functionality works

---

### Test 4.3: Worker Detection on Page Refresh

**Steps:**
1. Login as user with worker profile
2. Wait for worker detection to complete
3. Refresh the page
4. Verify worker status persists

**Expected Results:**
- ✅ Worker status loaded from localStorage immediately
- ✅ API re-checks worker status on mount
- ✅ No flicker or state reset
- ✅ Consistent user experience

**Validation:**
- [ ] Worker status available immediately on mount
- [ ] API call made to verify status is current
- [ ] No race conditions or state conflicts

---

## Test Scenario 5: Error Handling

**Objective:** Verify proper error handling for edge cases.

### Test 5.1: Missing service_provider_id on User Object

**Steps:**
1. Manually edit localStorage to remove service_provider_id
2. Refresh maintenance dashboard
3. Observe behavior

**Expected Results:**
- ✅ Dashboard shows error state (EmptyState component)
- ✅ Error message: "Service provider not found"
- ✅ Suggestion: "Please try logging out and logging back in"
- ✅ No app crash

**Validation:**
- [ ] EmptyState component renders
- [ ] User-friendly error message shown
- [ ] App remains functional (can logout)

---

### Test 5.2: API Server Down

**Steps:**
1. Stop API server
2. Try to load dashboard
3. Observe error handling

**Expected Results:**
- ✅ Network error caught gracefully
- ✅ Toast notification: "Failed to load jobs"
- ✅ No white screen or app crash
- ✅ User can retry or navigate away

**Validation:**
- [ ] Error boundary catches API failures
- [ ] User-friendly error messages
- [ ] App remains usable

---

## Test Scenario 6: Cross-Portal Workflows

**Objective:** Test cleaning → maintenance escalation workflow.

### Test 6.1: Create Maintenance Issue from Cleaning Job

**Steps:**
1. Login to worker portal as `worker1@cleaningco.test`
2. View a cleaning job
3. Report a maintenance issue
4. Logout and login to maintenance portal as `admin@maintenance.test`
5. Check if maintenance issue appears

**Expected Results:**
- ✅ Worker can create maintenance issue
- ✅ Issue includes service_provider_id
- ✅ Maintenance admin can see the issue
- ✅ Issue properly linked to cleaning job

**Validation:**
- [ ] Maintenance issue created successfully
- [ ] service_provider_id set correctly
- [ ] Cross-tenant workflow functions
- [ ] Data integrity maintained

---

## Summary Checklist

### Phase 1-3 Verification
- [x] AuthContext includes service_provider_id
- [x] Login extracts service_provider_id from API
- [x] Register extracts service_provider_id from API
- [x] 12 files updated to use dynamic service_provider_id
- [x] Worker detection implemented
- [x] No hardcoded service_provider_id values remain

### Phase 4 Testing
- [ ] Test Scenario 1: Service Provider Isolation (3 tests)
- [ ] Test Scenario 2: API Security Enforcement (3 tests)
- [ ] Test Scenario 3: LocalStorage Isolation (3 tests)
- [ ] Test Scenario 4: Worker Detection (3 tests)
- [ ] Test Scenario 5: Error Handling (2 tests)
- [ ] Test Scenario 6: Cross-Portal Workflows (1 test)

### Security Validation
- [ ] No cross-tenant data leakage observed
- [ ] API middleware blocks unauthorized access
- [ ] localStorage properly namespaced
- [ ] Error messages don't leak sensitive data
- [ ] All protected routes secured

---

## Known Issues

### Issue 1: Maintenance Worker Endpoint Returns 404 (Expected)
**Status:** Not a bug - working as designed
**Description:** The `/api/maintenance-workers/me` endpoint returns 404 for users without worker profiles. This is expected behavior and handled gracefully by the `checkIfWorker()` function.
**Impact:** None - error is silenced and `isWorker` set to false

---

## Test Results Log

**Date:** 2025-11-08
**Tester:** [To be filled in]
**Environment:** Development (localhost)

### Results Summary

| Test Scenario | Status | Notes |
|---------------|--------|-------|
| 1.1: CleanCo Data Access | ⏳ Pending | |
| 1.2: FixIt Data Access | ⏳ Pending | |
| 1.3: Cross-Tenant Verification | ⏳ Pending | |
| 2.1: Wrong Service Provider ID | ⏳ Pending | |
| 2.2: Missing Service Provider ID | ⏳ Pending | |
| 2.3: Middleware Verification | ⏳ Pending | |
| 3.1: Simultaneous Login | ⏳ Pending | |
| 3.2: Logout from One Portal | ⏳ Pending | |
| 3.3: Token Expiration | ⏳ Pending | |
| 4.1: Admin Without Worker | ✅ Passed | 404 handled gracefully |
| 4.2: Worker With Profile | ⏳ Pending | Requires worker profile setup |
| 4.3: Worker Detection Refresh | ⏳ Pending | |
| 5.1: Missing service_provider_id | ⏳ Pending | |
| 5.2: API Server Down | ⏳ Pending | |
| 6.1: Cleaning → Maintenance | ⏳ Pending | |

**Overall Status:** 1/15 tests completed

---

## Next Steps

1. **Execute manual testing** for all scenarios
2. **Document results** in the Test Results Log section
3. **Fix any identified issues** before deployment
4. **Update planning document** with Phase 4 completion status
5. **Create automated tests** for critical scenarios (optional)

---

**Last Updated:** 2025-11-08
**Related Documents:**
- [Maintenance Portal Multi-Tenant Alignment Plan](../Planning/MAINTENANCE-PORTAL-MULTI-TENANT-ALIGNMENT.md)
- [Test Users Documentation](Test-Users.md)
