# Sprint 0 Security Verification - Manual Testing Guide

**Sprint**: Sprint 0 - Emergency Security Fixes
**Test Date**: ___________
**Tester**: ___________
**Environment**: Development (localhost)
**Estimated Time**: 2 hours

**Test Credentials**: All test users in this guide use password `TestPassword123!`
**Complete User List**: See [Test-Users.md](../Test-Users.md) for all available test accounts

---

## Prerequisites Checklist

Before starting, ensure:
- [ ] API server running on `http://localhost:3001`
- [ ] All web apps accessible (ports 5173-5178)
- [ ] Database has test data (at least 2 tenants with different service providers)
- [ ] You have `curl` and `jq` installed (or Postman as alternative)
- [ ] Browser developer tools open (for frontend testing)

---

## Test Environment Setup

### Step 1: Start All Services

```bash
# Terminal 1: Start API server
cd /home/orrox/projects/RightFit-Services
npm run dev:api

# Terminal 2: Start all web apps (or start individually)
npm run dev
```

**Verify services are running**:
- API: http://localhost:3001/health (should return 200 OK)
- web-landlord: http://localhost:5173
- web-cleaning: http://localhost:5174
- web-maintenance: http://localhost:5175
- web-customer: http://localhost:5176
- guest-tablet: http://localhost:5177
- web-worker: http://localhost:5178

---

## Test Suite 1: Cross-Tenant Authorization Testing

**Goal**: Verify that users cannot access data from other tenants
**Time**: 30 minutes

### Setup: Test Data

**Test tenants with different service providers are already set up:**

**Tenant A - CleanCo Services** (Cleaning Service Provider):
- **Email**: `admin@cleaningco.test`
- **Password**: `TestPassword123!`
- **Tenant ID**: `tenant-cleaning-test`
- **Service Provider ID**: `sp-cleaning-test`
- **Service Provider Name**: CleanCo Services
- **Purpose**: Testing cleaning service workflows

**Tenant B - FixIt Maintenance** (Maintenance Service Provider):
- **Email**: `admin@maintenance.test`
- **Password**: `TestPassword123!`
- **Tenant ID**: `tenant-maintenance-test`
- **Service Provider ID**: `sp-maintenance-test`
- **Service Provider Name**: FixIt Maintenance
- **Purpose**: Testing maintenance service workflows

**Note**: All test users use the password `TestPassword123!`

### Test 1.1: Login as Tenant A (CleanCo Services)

```bash
# Login and save token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cleaningco.test",
    "password": "TestPassword123!"
  }' | jq -r '.access_token'

# Copy the token and save it as TENANT_A_TOKEN
```

**User**: Sarah Johnson (Admin @ CleanCo Services)
**Token A**: `_______________________________________________`

### Test 1.2: Login as Tenant B (FixIt Maintenance)

```bash
# Login and save token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@maintenance.test",
    "password": "TestPassword123!"
  }' | jq -r '.access_token'

# Copy the token and save it as TENANT_B_TOKEN
```

**User**: Robert Davis (Admin @ FixIt Maintenance)
**Token B**: `_______________________________________________`

### Test 1.3: Tenant A Accessing Own Data (Should Succeed)

```bash
# CleanCo Services admin accessing their own cleaning jobs
curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id=sp-cleaning-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Expected**: ✅ 200 OK with jobs list (may be empty)

**Explanation**: CleanCo Services (sp-cleaning-test) admin should be able to access their own data

**Result**: [ ] PASS  [ ] FAIL

**Notes**: _________________________________________________

---

### Test 1.4: Tenant A Accessing Tenant B's Data (Should Fail)

```bash
# CleanCo Services trying to access FixIt Maintenance's data (cross-tenant attack)
curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id=sp-maintenance-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Expected**: ❌ 403 Forbidden with `{"error": "Invalid service provider"}`

**Explanation**: CleanCo admin should NOT be able to access FixIt Maintenance data

**Result**: [ ] PASS  [ ] FAIL

**Notes**: _________________________________________________

---

### Test 1.5: Test All Endpoint Types

Repeat Test 1.4 (cross-tenant access) for each endpoint type. In all cases, CleanCo (Tenant A) attempts to access FixIt Maintenance (Tenant B) data:

#### Cleaning Jobs
```bash
# CleanCo trying to access FixIt Maintenance cleaning jobs
curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id=sp-maintenance-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```
**Expected**: ❌ 403 Forbidden
**Result**: [ ] PASS (403 Forbidden)  [ ] FAIL

#### Maintenance Jobs
```bash
# CleanCo trying to access FixIt Maintenance maintenance jobs
curl -X GET "http://localhost:3001/api/maintenance-jobs?service_provider_id=sp-maintenance-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```
**Expected**: ❌ 403 Forbidden
**Result**: [ ] PASS (403 Forbidden)  [ ] FAIL

#### Workers
```bash
# CleanCo trying to access FixIt Maintenance workers
curl -X GET "http://localhost:3001/api/workers?service_provider_id=sp-maintenance-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```
**Expected**: ❌ 403 Forbidden
**Result**: [ ] PASS (403 Forbidden)  [ ] FAIL

#### Customer Properties
```bash
# CleanCo trying to access FixIt Maintenance customer properties
curl -X GET "http://localhost:3001/api/customer-properties?service_provider_id=sp-maintenance-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```
**Expected**: ❌ 403 Forbidden
**Result**: [ ] PASS (403 Forbidden)  [ ] FAIL

---

### Test 1.6: Test POST Request (Cross-Tenant)

```bash
# CleanCo attempting to create a job for FixIt Maintenance (cross-tenant attack)
curl -X POST "http://localhost:3001/api/cleaning-jobs" \
  -H "Authorization: Bearer TENANT_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_provider_id": "sp-maintenance-test",
    "customer_id": "any-customer-id",
    "property_id": "any-property-id",
    "scheduled_date": "2025-11-15T10:00:00Z"
  }'
```

**Expected**: ❌ 403 Forbidden

**Explanation**: CleanCo should NOT be able to create jobs for FixIt Maintenance

**Result**: [ ] PASS  [ ] FAIL

---

### Test 1.7: Missing service_provider_id (Should Fail)

```bash
# Request without service_provider_id
curl -X GET "http://localhost:3001/api/cleaning-jobs" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Expected**: ❌ 400 Bad Request with `{"error": "service_provider_id is required"}`

**Result**: [ ] PASS  [ ] FAIL

---

### Test 1.8: Worker /me Endpoint (Should Work Without service_provider_id)

First, login as a worker (not a service provider admin):

```bash
# Login as worker Maria Garcia from CleanCo Services
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker1@cleaningco.test",
    "password": "TestPassword123!"
  }' | jq -r '.access_token'
```

**User**: Maria Garcia (Cleaner @ CleanCo Services)
**Worker ID**: worker-maria-garcia
**Worker Token**: `_______________________________________________`

```bash
# Test /me endpoint (should work without service_provider_id)
curl -X GET "http://localhost:3001/api/workers/me" \
  -H "Authorization: Bearer WORKER_TOKEN"
```

**Expected**: ✅ 200 OK with worker profile (no service_provider_id required)

**Explanation**: Workers should be able to access their own profile without specifying service_provider_id

**Result**: [ ] PASS  [ ] FAIL

---

## Test Suite 1 Summary

| Test | Expected | Result | Pass/Fail |
|------|----------|--------|-----------|
| 1.3 - Own data access | 200 OK | | [ ] |
| 1.4 - Cross-tenant access | 403 Forbidden | | [ ] |
| 1.5a - Cleaning jobs | 403 Forbidden | | [ ] |
| 1.5b - Maintenance jobs | 403 Forbidden | | [ ] |
| 1.5c - Workers | 403 Forbidden | | [ ] |
| 1.5d - Customer properties | 403 Forbidden | | [ ] |
| 1.6 - POST cross-tenant | 403 Forbidden | | [ ] |
| 1.7 - Missing provider_id | 400 Bad Request | | [ ] |
| 1.8 - Worker /me | 200 OK | | [ ] |

**Test Suite 1 Overall**: [ ] PASS  [ ] FAIL

**Issues Found**: _______________________________________________

---

## Test Suite 2: Frontend Regression Testing

**Goal**: Verify all frontend apps still function correctly after security changes
**Time**: 30 minutes

### Test 2.1: web-cleaning (Port 5174)

**Navigate to**: http://localhost:5174

**Test User**: Sarah Johnson (Admin @ CleanCo Services)

#### Step 1: Login
- [ ] Login page loads
- [ ] Can enter email and password
- [ ] Login succeeds (redirects to dashboard)

**Login Credentials**:
- **Email**: `admin@cleaningco.test`
- **Password**: `TestPassword123!`
- **Tenant**: CleanCo Services (Test)
- **Service Provider ID**: sp-cleaning-test

**Result**: [ ] PASS  [ ] FAIL

#### Step 2: Dashboard
- [ ] Dashboard loads without errors
- [ ] Stats cards display (jobs today, active workers, etc.)
- [ ] Recent activity feed visible

**Result**: [ ] PASS  [ ] FAIL

#### Step 3: Jobs List
- [ ] Navigate to "Jobs" page
- [ ] Jobs list loads (or shows empty state)
- [ ] Can filter jobs by status

**Result**: [ ] PASS  [ ] FAIL

#### Step 4: Create Job
- [ ] Click "Create Job" or "Schedule Job"
- [ ] Form loads with all fields
- [ ] Can select customer, property, date
- [ ] Can submit form (or see validation errors if data missing)

**Result**: [ ] PASS  [ ] FAIL

#### Step 5: View Job Details
- [ ] Click on an existing job (if available)
- [ ] Job details page loads
- [ ] Can see property info, checklist, status

**Result**: [ ] PASS  [ ] FAIL

#### Step 6: Workers List
- [ ] Navigate to "Workers" page
- [ ] Workers list loads (or shows empty state)
- [ ] Can view worker details

**Result**: [ ] PASS  [ ] FAIL

**web-cleaning Overall**: [ ] PASS  [ ] FAIL

---

### Test 2.2: web-maintenance (Port 5175)

**Navigate to**: http://localhost:5175

**Test User**: Robert Davis (Admin @ FixIt Maintenance)

#### Step 1: Login
- [ ] Login page loads
- [ ] Can enter email and password
- [ ] Login succeeds (redirects to dashboard)

**Login Credentials**:
- **Email**: `admin@maintenance.test`
- **Password**: `TestPassword123!`
- **Tenant**: FixIt Maintenance (Test)
- **Service Provider ID**: sp-maintenance-test

**Result**: [ ] PASS  [ ] FAIL

#### Step 2: Dashboard
- [ ] Dashboard loads without errors
- [ ] Stats cards display
- [ ] Recent activity visible

**Result**: [ ] PASS  [ ] FAIL

#### Step 3: Maintenance Jobs List
- [ ] Navigate to "Jobs" or "Maintenance" page
- [ ] Jobs list loads
- [ ] Can filter by status (quote pending, scheduled, etc.)

**Result**: [ ] PASS  [ ] FAIL

#### Step 4: Create Quote
- [ ] Click "Create Job" or similar
- [ ] Form loads
- [ ] Can enter job details
- [ ] Can submit

**Result**: [ ] PASS  [ ] FAIL

**web-maintenance Overall**: [ ] PASS  [ ] FAIL

---

### Test 2.3: web-customer (Port 5176)

**Navigate to**: http://localhost:5176

**Test User**: David Williams (Property Owner @ ABC Properties LLC)

#### Step 1: Login
- [ ] Login page loads
- [ ] Can enter email and password
- [ ] Login succeeds

**Login Credentials**:
- **Email**: `owner@business.test`
- **Password**: `TestPassword123!`
- **Tenant**: ABC Properties LLC (Test)
- **Customer Number**: CUST-TEST-001
- **Customer Type**: LANDLORD

**Result**: [ ] PASS  [ ] FAIL

#### Step 2: Properties List
- [ ] Dashboard or Properties page loads
- [ ] Can view properties (or see empty state)

**Result**: [ ] PASS  [ ] FAIL

#### Step 3: View Quotes (if available)
- [ ] Navigate to quotes or maintenance section
- [ ] Can view pending quotes (or empty state)

**Result**: [ ] PASS  [ ] FAIL

**web-customer Overall**: [ ] PASS  [ ] FAIL

---

### Test 2.4: web-worker (Port 5178)

**Navigate to**: http://localhost:5178

**Test User**: Maria Garcia (Cleaner @ CleanCo Services)

#### Step 1: Login
- [ ] Login page loads
- [ ] Can enter worker email and password
- [ ] Login succeeds

**Login Credentials**:
- **Email**: `worker1@cleaningco.test`
- **Password**: `TestPassword123!`
- **Tenant**: CleanCo Services (Test)
- **Worker ID**: worker-maria-garcia
- **Worker Type**: CLEANER (Full-time)
- **Service Provider**: CleanCo Services

**Result**: [ ] PASS  [ ] FAIL

#### Step 2: Dashboard
- [ ] Dashboard loads
- [ ] Today's jobs section visible
- [ ] Stats display (if any)

**Result**: [ ] PASS  [ ] FAIL

#### Step 3: Today's Jobs
- [ ] Can see list of today's jobs (or empty state)
- [ ] Job cards display property info

**Result**: [ ] PASS  [ ] FAIL

**web-worker Overall**: [ ] PASS  [ ] FAIL

---

## Test Suite 2 Summary

| Application | Login | Dashboard | Key Features | Overall |
|-------------|-------|-----------|--------------|---------|
| web-cleaning | [ ] | [ ] | [ ] | [ ] |
| web-maintenance | [ ] | [ ] | [ ] | [ ] |
| web-customer | [ ] | [ ] | [ ] | [ ] |
| web-worker | [ ] | [ ] | [ ] | [ ] |

**Test Suite 2 Overall**: [ ] PASS  [ ] FAIL

**Issues Found**: _______________________________________________

---

## Test Suite 3: API Performance Testing

**Goal**: Measure API response times with database indexes
**Time**: 30 minutes

### Test 3.1: Jobs List Query (with status filter)

```bash
# Use `time` to measure response time for CleanCo Services
time curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id=sp-cleaning-test&status=SCHEDULED" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Service Provider**: CleanCo Services (sp-cleaning-test)
**Response Time**: __________ ms
**Target**: <100ms

**Result**: [ ] PASS  [ ] FAIL

---

### Test 3.2: Workers List Query (with is_active filter)

```bash
# Query active workers for CleanCo Services
time curl -X GET "http://localhost:3001/api/workers?service_provider_id=sp-cleaning-test&is_active=true" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Service Provider**: CleanCo Services (sp-cleaning-test)
**Response Time**: __________ ms
**Target**: <100ms

**Result**: [ ] PASS  [ ] FAIL

---

### Test 3.3: Maintenance Jobs List Query

```bash
# Query maintenance jobs for FixIt Maintenance (using Tenant B token)
time curl -X GET "http://localhost:3001/api/maintenance-jobs?service_provider_id=sp-maintenance-test&status=QUOTE_PENDING" \
  -H "Authorization: Bearer TENANT_B_TOKEN"
```

**Service Provider**: FixIt Maintenance (sp-maintenance-test)
**Response Time**: __________ ms
**Target**: <100ms

**Result**: [ ] PASS  [ ] FAIL

---

### Test 3.4: Customer Properties List Query

```bash
# Query customer properties for CleanCo Services
time curl -X GET "http://localhost:3001/api/customer-properties?service_provider_id=sp-cleaning-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Service Provider**: CleanCo Services (sp-cleaning-test)
**Response Time**: __________ ms
**Target**: <100ms

**Result**: [ ] PASS  [ ] FAIL

---

### Test 3.5: Database Index Verification

Connect to PostgreSQL and verify indexes exist:

```bash
psql -U rightfit_user -d rightfit_dev
```

```sql
-- List all indexes
\di

-- Check specific indexes (you should see these)
-- CleaningJob_status_idx
-- CleaningJob_status_scheduled_date_idx
-- MaintenanceJob_status_idx
-- Worker_service_provider_id_is_active_idx
-- Worker_email_idx
-- Customer_service_provider_id_idx
-- CustomerProperty_service_provider_id_idx
-- CustomerProperty_customer_id_idx
```

**Indexes Found**: [ ] All present  [ ] Some missing  [ ] None found

**Missing Indexes** (if any): _______________________________________________

---

### Test 3.6: Query Plan Analysis (Advanced)

```sql
-- Check that indexes are being used
EXPLAIN ANALYZE SELECT * FROM "CleaningJob" WHERE status = 'SCHEDULED';
```

**Result**:
- [ ] Shows "Index Scan using CleaningJob_status_idx" ✅
- [ ] Shows "Seq Scan" (table scan) ❌ - Indexes not being used

**Notes**: _______________________________________________

---

## Test Suite 3 Summary

| Query | Response Time | Target | Pass/Fail |
|-------|---------------|--------|-----------|
| Jobs list (status filter) | _____ ms | <100ms | [ ] |
| Workers list (active filter) | _____ ms | <100ms | [ ] |
| Maintenance jobs list | _____ ms | <100ms | [ ] |
| Customer properties list | _____ ms | <100ms | [ ] |

**Indexes Present**: [ ] Yes  [ ] No

**Test Suite 3 Overall**: [ ] PASS  [ ] FAIL

**Issues Found**: _______________________________________________

---

## Test Suite 4: Error Message Security Review

**Goal**: Verify error messages don't leak sensitive information
**Time**: 15 minutes

### Test 4.1: Invalid service_provider_id

```bash
# CleanCo trying to use a non-existent provider ID
curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id=non-existent-id-12345" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Expected Response**:
```json
{
  "error": "Invalid service provider"
}
```

**Actual Response**: _______________________________________________

**Check**:
- [ ] Error message is generic ("Invalid service provider")
- [ ] Error message does NOT say "Service provider 'non-existent-id-12345' not found"
- [ ] Error message does NOT leak database details
- [ ] HTTP status code is 403 Forbidden

**Result**: [ ] PASS  [ ] FAIL

---

### Test 4.2: Missing Authorization Header

```bash
# Request without token (using CleanCo provider ID)
curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id=sp-cleaning-test"
```

**Expected**: 401 Unauthorized with generic message

**Actual Response**: _______________________________________________

**Result**: [ ] PASS  [ ] FAIL

---

### Test 4.3: Malformed service_provider_id

```bash
# Send SQL injection attempt or weird characters
curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id='; DROP TABLE CleaningJob;--" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Expected**: 403 Forbidden (should be handled safely by Prisma)

**Explanation**: System should safely reject malformed IDs without exposing database structure

**Actual Response**: _______________________________________________

**Result**: [ ] PASS  [ ] FAIL

---

## Test Suite 4 Summary

| Test | Expected | Actual | Pass/Fail |
|------|----------|--------|-----------|
| Invalid provider_id | 403, generic message | | [ ] |
| Missing auth header | 401, generic message | | [ ] |
| Malformed provider_id | 403, safe handling | | [ ] |

**Test Suite 4 Overall**: [ ] PASS  [ ] FAIL

**Issues Found**: _______________________________________________

---

## Test Suite 5: Security Audit Log Review

**Goal**: Verify failed authorization attempts are logged
**Time**: 15 minutes

### Test 5.1: Generate Failed Authorization Attempt

```bash
# CleanCo attempting to access FixIt Maintenance data (should be logged)
curl -X GET "http://localhost:3001/api/cleaning-jobs?service_provider_id=sp-maintenance-test" \
  -H "Authorization: Bearer TENANT_A_TOKEN"
```

**Expected**: 403 Forbidden (and logged)

**Details**:
- **Attacker**: admin@cleaningco.test (CleanCo Services)
- **Target**: sp-maintenance-test (FixIt Maintenance)

---

### Test 5.2: Check API Logs

```bash
# Check console output or log files
# Look for [SECURITY] warnings

# If using console.warn, check terminal output where API is running
# Expected log format:
# [SECURITY] User user-abc-123 attempted to access service_provider provider-b-123 (unauthorized)
```

**Log Entry Found**: [ ] Yes  [ ] No

**Log Content**: _______________________________________________

---

### Test 5.3: Verify Log Format

Check that logs include:
- [ ] Timestamp
- [ ] User ID attempting access
- [ ] service_provider_id they tried to access
- [ ] Clear "unauthorized" or "security" indicator

**Result**: [ ] PASS  [ ] FAIL

---

## Test Suite 5 Summary

| Check | Present | Pass/Fail |
|-------|---------|-----------|
| Failed attempts logged | [ ] | [ ] |
| Log includes user ID | [ ] | [ ] |
| Log includes provider ID | [ ] | [ ] |
| Log format clear | [ ] | [ ] |

**Test Suite 5 Overall**: [ ] PASS  [ ] FAIL

**Issues Found**: _______________________________________________

---

## Overall Test Results

### Summary Table

| Test Suite | Time Spent | Pass/Fail | Critical Issues |
|------------|------------|-----------|-----------------|
| Suite 1: Cross-Tenant Authorization | _____ min | [ ] | _____ |
| Suite 2: Frontend Regression | _____ min | [ ] | _____ |
| Suite 3: API Performance | _____ min | [ ] | _____ |
| Suite 4: Error Messages | _____ min | [ ] | _____ |
| Suite 5: Audit Logs | _____ min | [ ] | _____ |

**Total Time**: __________ minutes

### Overall Sprint 0 Verification Result

- [ ] ✅ **PASS** - All tests passed, platform secure and ready for Sprint 1
- [ ] ⚠️ **PASS WITH NOTES** - Minor issues found, documented below
- [ ] ❌ **FAIL** - Critical issues found, must fix before proceeding

---

## Critical Issues Found

| Issue # | Test Suite | Description | Severity | Status |
|---------|------------|-------------|----------|--------|
| 1 | | | | [ ] Open [ ] Fixed |
| 2 | | | | [ ] Open [ ] Fixed |
| 3 | | | | [ ] Open [ ] Fixed |

---

## Non-Critical Issues / Notes

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Recommendations

Based on testing results:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Sign-Off

**Tester Signature**: _______________________________________________

**Date**: _______________________________________________

**Approved for Sprint 1**: [ ] Yes  [ ] No

**Notes**: _______________________________________________

---

## Appendix: Troubleshooting

### Issue: Can't login with test credentials

**Solution**: Create test users in database:
```bash
cd packages/database
npx prisma studio
# Create users in User table with hashed passwords
```

### Issue: No data to test with

**Solution**: Run database seed:
```bash
npm run db:seed
```

### Issue: API returns 500 errors

**Solution**: Check API logs for errors:
```bash
# Check terminal where API is running
# Look for error stack traces
```

### Issue: Frontend shows "Network Error"

**Solution**: Verify CORS and API URL:
```bash
# Check API is running: http://localhost:3001/health
# Check browser console for CORS errors
# Verify frontend is using correct API URL
```

### Issue: curl commands not working

**Alternative**: Use Postman or browser dev tools
- Import requests into Postman
- Use browser Network tab to inspect requests
- Copy as cURL from browser dev tools

---

**Document Version**: 1.0
**Last Updated**: November 7, 2025
**Sprint**: Sprint 0 - Emergency Security Fixes
