# RightFit Services - Comprehensive Testing Guide

**Last Updated:** 2025-10-29
**Test Coverage Goal:** 80%+
**Current Coverage:** ~12% (needs improvement)

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Coverage Reports](#coverage-reports)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /____\     - Critical user flows
     /      \    Integration Tests (30%)
    /________\   - API endpoints
   /          \  Unit Tests (60%)
  /__________\   - Services, utilities
```

### Test Coverage Targets

| Component | Current | Target | Priority |
|-----------|---------|--------|----------|
| Services | 15% | 90% | HIGH |
| API Routes | 0% | 80% | HIGH |
| Utilities | 66% | 95% | MEDIUM |
| Web Components | 0% | 70% | HIGH |
| Mobile Components | 0% | 60% | MEDIUM |

---

## Test Types

### 1. Unit Tests

**Location:** `apps/api/src/services/__tests__/`

**Framework:** Jest + TypeScript

**What to Test:**
- Individual service methods
- Business logic functions
- Utility functions
- Data transformations
- Error handling

**Example Tests Created:**
- ✅ `EmailService.test.ts` - Resend email integration
- ✅ `PushNotificationService.test.ts` - Expo push notifications
- ✅ `CertificatesService.test.ts` - Certificate management
- ✅ `AuthService.test.ts` - Authentication flows
- ✅ `WorkOrdersService.test.ts` - Work order CRUD
- ✅ `PropertiesService.test.ts` - Property management

**To Be Created:**
- `ContractorsService.test.ts`
- `PhotosService.test.ts`
- `VisionService.test.ts`
- `NotificationService.test.ts`
- `CronService.test.ts`

### 2. Integration Tests

**Location:** `apps/api/src/routes/__tests__/`

**Framework:** Jest + Supertest

**What to Test:**
- API endpoint responses
- Request validation
- Authentication middleware
- Database operations
- Error responses
- Multi-tenancy isolation

**Example Tests Created:**
- ✅ `certificates.integration.test.ts` - Full certificate API

**To Be Created:**
- `auth.integration.test.ts`
- `properties.integration.test.ts`
- `work-orders.integration.test.ts`
- `contractors.integration.test.ts`
- `photos.integration.test.ts`
- `devices.integration.test.ts`
- `notifications.integration.test.ts`

### 3. E2E Tests (Web)

**Location:** `apps/web/tests/e2e/`

**Framework:** Playwright

**What to Test:**
- Complete user journeys
- Cross-browser compatibility
- Authentication flows
- CRUD operations
- Form validations
- Navigation

**Example Tests Created:**
- ✅ `auth.spec.ts` - Login, registration, logout
- ✅ `properties.spec.ts` - Property management flows
- ✅ `certificates.spec.ts` (in properties.spec.ts) - Certificate management

**To Be Created:**
- `work-orders.spec.ts`
- `contractors.spec.ts`
- `dashboard.spec.ts`
- `photos.spec.ts`

### 4. Mobile Tests

**Location:** `apps/mobile/__tests__/`

**Framework:** Jest + React Native Testing Library

**Status:** Not yet implemented

**To Be Created:**
- Screen component tests
- Navigation tests
- Offline functionality tests
- Sync service tests

---

## Running Tests

### API (Backend) Tests

```bash
# Run all tests
cd apps/api
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run verbose
pnpm test:verbose
```

### Web (Frontend) Tests

```bash
# Run unit/component tests
cd apps/web
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E with browser visible
pnpm test:e2e:headed

# Debug E2E tests
pnpm test:e2e:debug

# E2E test UI
pnpm test:e2e:ui
```

### Mobile Tests

```bash
cd apps/mobile
pnpm test

# Watch mode
pnpm test:watch
```

### Run All Tests (from root)

```bash
# Run all project tests
pnpm test

# Coverage for all
pnpm test:coverage
```

---

## Test Structure

### Unit Test Template

```typescript
import ServiceName from '../ServiceName'
import { PrismaClient } from '@rightfit/database'

// Mock dependencies
jest.mock('@rightfit/database')
const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>

describe('ServiceName', () => {
  let service: ServiceName
  const tenantId = 'tenant-123'
  const userId = 'user-123'

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ServiceName(mockPrisma)
  })

  describe('methodName', () => {
    it('should do something successfully', async () => {
      // Arrange
      mockPrisma.model.method.mockResolvedValue({})

      // Act
      const result = await service.methodName(params)

      // Assert
      expect(result).toBeDefined()
      expect(mockPrisma.model.method).toHaveBeenCalledWith(params)
    })

    it('should handle errors gracefully', async () => {
      // Arrange
      mockPrisma.model.method.mockRejectedValue(new Error('Test error'))

      // Act & Assert
      await expect(service.methodName(params)).rejects.toThrow('Test error')
    })
  })
})
```

### Integration Test Template

```typescript
import request from 'supertest'
import express from 'express'
import router from '../routeName'

describe('Route Integration Tests', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/route', router)
  })

  describe('POST /api/route', () => {
    it('should create resource successfully', async () => {
      const response = await request(app)
        .post('/api/route')
        .set('Authorization', `Bearer ${token}`)
        .send(data)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
    })

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/route')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })
})
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
  })

  test('should perform action', async ({ page }) => {
    // Navigate
    await page.goto('/feature')

    // Interact
    await page.click('button.action')

    // Assert
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

---

## Writing Tests

### Best Practices

#### 1. Test Organization
- ✅ One test file per source file
- ✅ Group related tests with `describe` blocks
- ✅ Use descriptive test names with `it('should...')`
- ✅ Follow AAA pattern (Arrange, Act, Assert)

#### 2. Mocking
- ✅ Mock external dependencies (database, APIs, services)
- ✅ Use `jest.mock()` for module mocking
- ✅ Clear mocks between tests with `jest.clearAllMocks()`
- ❌ Don't mock the code you're testing

#### 3. Test Data
- ✅ Use realistic test data
- ✅ Create test fixtures for reusable data
- ✅ Generate unique data when needed (timestamps, UUIDs)
- ❌ Don't use production data in tests

#### 4. Assertions
- ✅ Test one thing per test
- ✅ Use specific matchers (`toBe`, `toEqual`, `toContain`)
- ✅ Assert on important properties
- ✅ Test both success and error cases

#### 5. Async Tests
- ✅ Always use `async/await` or return promises
- ✅ Use `expect(promise).resolves` for success cases
- ✅ Use `expect(promise).rejects` for error cases
- ❌ Don't forget to await async operations

### Testing Sprint 5 Features

#### Email Service (Resend)

```typescript
describe('EmailService - Resend Integration', () => {
  it('should send certificate expiry email', async () => {
    // Test email sending with different urgency levels
    await emailService.sendCertificateExpiryEmail({
      to: 'landlord@example.com',
      landlordName: 'John Doe',
      certificateType: 'Gas Safety Certificate',
      propertyAddress: '123 Main St',
      expiryDate: new Date('2026-01-01'),
      daysUntilExpiry: 30,
      certificateNumber: 'GAS-12345'
    })

    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'onboarding@resend.dev',
        to: 'landlord@example.com',
        subject: expect.stringContaining('Certificate Expiry')
      })
    )
  })

  it('should use correct urgency colors', async () => {
    // Test 60 days (green), 30 days (orange), 7 days (red)
  })
})
```

#### Push Notifications (Expo)

```typescript
describe('PushNotificationService - Expo Integration', () => {
  it('should send push notification to all user devices', async () => {
    mockPrisma.device.findMany.mockResolvedValue([device1, device2])

    await pushService.sendPushNotification({
      userId: 'user-123',
      title: 'Certificate Expiring',
      body: 'Gas Safety Certificate expires in 30 days',
      data: { certificateId: 'cert-123' }
    })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://exp.host/--/api/v2/push/send',
      expect.arrayContaining([
        expect.objectContaining({
          to: 'ExponentPushToken[abc123]',
          title: 'Certificate Expiring'
        })
      ])
    )
  })

  it('should handle invalid tokens', async () => {
    // Test token cleanup on errors
  })
})
```

#### Certificate Management

```typescript
describe('CertificatesService', () => {
  it('should calculate days until expiry correctly', async () => {
    const result = await certificatesService.getCertificates(tenantId, {})

    expect(result[0]).toHaveProperty('days_until_expiry')
    expect(result[0]).toHaveProperty('is_expired')
    expect(result[0].days_until_expiry).toBeGreaterThan(0)
  })

  it('should enforce multi-tenancy', async () => {
    // Test that certificates from other tenants are not visible
  })
})
```

---

## Coverage Reports

### Viewing Coverage

#### API Coverage

```bash
cd apps/api
pnpm test:coverage

# Open HTML report
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html  # Windows
xdg-open coverage/lcov-report/index.html  # Linux
```

#### Web Coverage

```bash
cd apps/web
pnpm test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Metrics

- **Statements:** % of executable statements tested
- **Branches:** % of conditional branches tested
- **Functions:** % of functions called
- **Lines:** % of lines executed

### Target Thresholds

```json
{
  "coverageThreshold": {
    "global": {
      "statements": 70,
      "branches": 70,
      "functions": 70,
      "lines": 70
    }
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: cd apps/api && pnpm test:coverage
      - uses: codecov/codecov-action@v3

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: cd apps/web && pnpm test:coverage
      - run: cd apps/web && pnpm test:e2e
```

---

## Troubleshooting

### Common Issues

#### 1. Import Errors

**Problem:** `Cannot find module` or export errors

**Solution:**
```typescript
// Use default import for services
import EmailService from '../EmailService'  // ✅ Correct
import { EmailService } from '../EmailService'  // ❌ Wrong
```

#### 2. Async Timeout

**Problem:** Tests timeout waiting for promises

**Solution:**
```typescript
// Always await async operations
await expect(service.method()).resolves.toBe(result)

// Or increase timeout
jest.setTimeout(10000)
```

#### 3. Mock Not Working

**Problem:** Mock function not being called

**Solution:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Verify mock is set up correctly
expect(mockFunction).toHaveBeenCalled()
console.log(mockFunction.mock.calls)
```

#### 4. Database Connection

**Problem:** Tests trying to connect to real database

**Solution:**
```typescript
// Always mock Prisma Client
jest.mock('@rightfit/database')

// Don't let tests hit real DB
process.env.DATABASE_URL = 'postgresql://mock'
```

#### 5. E2E Test Flakiness

**Problem:** E2E tests fail intermittently

**Solution:**
```typescript
// Use proper waits
await page.waitForSelector('[data-testid="element"]')

// Don't use fixed timeouts
await page.waitForTimeout(1000)  // ❌ Bad

// Use assertions with retries
await expect(element).toBeVisible()  // ✅ Good
```

---

## Test Fixtures

Create reusable test data:

```typescript
// apps/api/tests/fixtures/certificates.ts
export const mockCertificate = {
  id: 'cert-123',
  tenant_id: 'tenant-123',
  property_id: 'property-123',
  certificate_type: 'GAS_SAFETY',
  issue_date: new Date('2025-01-01'),
  expiry_date: new Date('2026-01-01'),
  document_url: 'https://s3.amazonaws.com/cert.pdf',
  certificate_number: 'GAS-12345',
  issuer_name: 'UK Gas Safe',
  notes: 'Test certificate',
  created_at: new Date(),
  updated_at: new Date()
}

export const mockExpiredCertificate = {
  ...mockCertificate,
  expiry_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
}
```

---

## Next Steps

### Immediate (High Priority)

1. **Fix Test Import Errors**
   - Update test files to use default imports
   - Fix TypeScript errors in test files

2. **Complete Service Tests**
   - ContractorsService
   - PhotosService
   - VisionService
   - NotificationService

3. **Add Integration Tests**
   - All API routes need integration tests
   - Target: 80% route coverage

4. **Mobile Testing Setup**
   - Configure Jest for React Native
   - Create component tests
   - Test offline functionality

### Short Term

1. **Increase Coverage to 50%**
   - Focus on critical paths
   - Test all Sprint 5 features

2. **E2E Test Suite**
   - Complete web app flows
   - Cross-browser testing

3. **Performance Tests**
   - Load testing for API
   - Database query optimization

### Long Term

1. **Visual Regression Testing**
   - Percy or Chromatic integration
   - Screenshot comparison

2. **Contract Testing**
   - API contract tests with Pact
   - Mobile API contract validation

3. **Security Testing**
   - Dependency scanning
   - Penetration testing
   - OWASP compliance

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated:** 2025-10-29
**Maintained By:** Development Team
**Review Frequency:** After each sprint
