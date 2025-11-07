# RightFit Services - Testing Suite

This directory contains the comprehensive testing suite for RightFit Services platform.

## Overview

Our testing strategy follows the testing pyramid with emphasis on best-in-class quality:

```
              E2E Tests (10%)
           ╱───────────────╲
          ╱   Integration   ╲
         ╱     Tests (30%)   ╲
        ╱─────────────────────╲
       ╱      Unit Tests       ╲
      ╱        (60%)            ╲
     ╱───────────────────────────╲
```

## Coverage Targets

- **Unit Tests**: 70-80% code coverage
- **Integration Tests**: 100% critical paths
- **E2E Tests**: 100% user workflows
- **API Tests**: 100% endpoints
- **Accessibility**: 100% components WCAG 2.1 AA

## Test Types

### 1. Unit Tests

**Backend** (Jest):
```bash
# Run all backend unit tests
cd apps/api && npm test

# Run with coverage
cd apps/api && npm run test:coverage

# Run specific test file
cd apps/api && npm test -- CleaningJobsService.test.ts

# Watch mode
cd apps/api && npm run test:watch
```

**Frontend** (Vitest):
```bash
# Run all frontend tests
cd apps/web-cleaning && npm test

# Run with coverage
cd apps/web-cleaning && npm run test:coverage

# Watch mode
cd apps/web-cleaning && npm test -- --watch
```

### 2. Integration Tests

**API Integration** (Supertest + Jest):
```bash
# Run integration tests
cd apps/api && npm run test:integration

# Run with test database
DATABASE_URL=postgresql://localhost:5433/rightfit_test npm run test:integration
```

### 3. End-to-End Tests

**Playwright**:
```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test cleaning-workflow

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

### 4. Performance Tests

**K6 Load Testing**:
```bash
# Install K6 (macOS)
brew install k6

# Run load test
k6 run tests/performance/api-load.js

# Run with output to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 tests/performance/api-load.js
```

### 5. Security Tests

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Snyk scan
npx snyk test

# OWASP ZAP baseline scan
docker run -v $(pwd):/zap/wrk/:rw \
  owasp/zap2docker-stable \
  zap-baseline.py \
  -t http://host.docker.internal:5174 \
  -r baseline-report.html
```

### 6. Accessibility Tests

```bash
# Run accessibility tests
npm test -- --testNamePattern="Accessibility"

# Run Lighthouse
lighthouse http://localhost:5174/dashboard \
  --only-categories=accessibility \
  --output=json
```

## Directory Structure

```
tests/
├── README.md                     # This file
├── setup/                        # Global test setup
│   ├── test-database.ts         # Test database configuration
│   ├── test-data-factories.ts   # Test data factories
│   └── test-helpers.ts          # Shared test utilities
├── e2e/                         # End-to-end tests
│   ├── cleaning-workflow.spec.ts
│   ├── maintenance-workflow.spec.ts
│   ├── cross-app-workflow.spec.ts
│   └── fixtures/                # Test fixtures
├── performance/                  # Performance tests
│   ├── api-load.js              # API load testing
│   ├── frontend-perf.js         # Frontend performance
│   └── reports/                 # Performance reports
├── security/                     # Security tests
│   ├── dependency-audit.sh
│   └── zap-config.conf
└── postman/                      # API contract tests
    ├── RightFit-API.postman_collection.json
    └── environment.json
```

## App-Specific Tests

Each app has its own test directory:

```
apps/
├── api/
│   └── src/
│       ├── services/__tests__/     # Service unit tests
│       ├── routes/__tests__/       # Integration tests
│       ├── middleware/__tests__/   # Middleware tests
│       └── utils/__tests__/        # Utility tests
├── web-cleaning/
│   └── src/
│       ├── components/__tests__/   # Component tests
│       ├── hooks/__tests__/        # Hook tests
│       ├── pages/__tests__/        # Page integration tests
│       └── utils/__tests__/        # Utility tests
└── mobile/
    └── src/
        ├── screens/__tests__/      # Screen tests
        └── components/__tests__/   # Component tests
```

## Running All Tests

**Run all tests across the monorepo**:
```bash
npm test
```

**Run tests for specific app**:
```bash
npm test --filter=api
npm test --filter=web-cleaning
```

## CI/CD Integration

Tests are automatically run on:
- Every commit (unit tests)
- Every PR (unit + integration + E2E)
- Daily (security scans)
- Weekly (performance tests)

See `.github/workflows/tests.yml` for CI configuration.

## Test Data Management

### Factories

We use factory pattern with Faker.js for test data:

```typescript
import { createTestUser, createTestServiceProvider } from '../../tests/setup/test-data-factories'

const { user, token } = await createTestUser()
const serviceProvider = await createTestServiceProvider(user.tenant_id)
```

### Test Database

Integration tests use a separate PostgreSQL test database:

```bash
# Create test database
createdb rightfit_test

# Run migrations
DATABASE_URL="postgresql://localhost:5433/rightfit_test" npx prisma migrate deploy

# Seed test data
npm run db:seed:test
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data in `afterEach` hooks
3. **Naming**: Use descriptive test names that explain what is being tested
4. **AAA Pattern**: Arrange, Act, Assert structure
5. **Mocking**: Mock external dependencies (APIs, file systems, etc.)
6. **Coverage**: Aim for 70-80% coverage, but focus on critical paths
7. **Speed**: Keep unit tests fast (<100ms each)

## Writing New Tests

### Backend Service Test

```typescript
// apps/api/src/services/__tests__/MyService.test.ts
import { MyService } from '../MyService'
import { prismaMock } from '../../../__mocks__/prisma'

describe('MyService', () => {
  let service: MyService

  beforeEach(() => {
    service = new MyService()
  })

  it('should do something', async () => {
    // Arrange
    const mockData = { id: '123' }
    prismaMock.myModel.findFirst.mockResolvedValue(mockData)

    // Act
    const result = await service.doSomething()

    // Assert
    expect(result).toEqual(mockData)
  })
})
```

### Frontend Component Test

```typescript
// apps/web-cleaning/src/components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click event', () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Test

```typescript
// tests/e2e/my-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('My Workflow', () => {
  test('completes end-to-end flow', async ({ page }) => {
    await page.goto('http://localhost:5174/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
  })
})
```

## Troubleshooting

### Tests Failing Locally

1. **Database Connection**: Ensure PostgreSQL test database is running
2. **Environment Variables**: Check `.env.test` is configured
3. **Dependencies**: Run `npm install` in the failing app
4. **Ports**: Ensure required ports are available

### Slow Tests

1. **Database Cleanup**: Reduce number of `beforeEach` database calls
2. **Parallel Execution**: Use Jest's `--maxWorkers` flag
3. **Test Isolation**: Ensure tests aren't waiting on external services

### Flaky Tests

1. **Async Issues**: Ensure all promises are awaited
2. **Timing**: Use `waitFor` instead of arbitrary `sleep`
3. **Test Isolation**: Check for shared state between tests

## Resources

- [TESTING-PLAN.md](TESTING-PLAN.md) - Comprehensive testing strategy
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [K6 Documentation](https://k6.io/docs/)

## Metrics

Track these metrics in your dashboard:
- Test pass rate (target: >95%)
- Code coverage trend
- Test execution time
- Flaky test rate (target: <2%)
- Bug escape rate
- Mean time to detect (MTTD)
- Mean time to resolve (MTTR)

---

**Last Updated**: November 7, 2025
**Maintained By**: Development Team
