# RightFit Services - Comprehensive Testing Plan

**Date**: November 7, 2025
**Version**: 1.0
**Philosophy**: **RightFit, not QuickFix** - Comprehensive testing for best-in-class quality

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Strategy Overview](#testing-strategy-overview)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [API Testing](#api-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [Mobile Testing](#mobile-testing)
11. [Cross-Browser Testing](#cross-browser-testing)
12. [Testing Infrastructure](#testing-infrastructure)
13. [CI/CD Integration](#cicd-integration)
14. [Testing Metrics & KPIs](#testing-metrics--kpis)
15. [Implementation Roadmap](#implementation-roadmap)

---

## Testing Philosophy

### Core Principles

**Best-in-Class Quality Standards**:
- If it's not tested, it's broken (we just don't know it yet)
- Tests are documentation that never goes out of date
- Testing accelerates development (catches bugs early)
- Comprehensive testing enables confident refactoring
- Quality is everyone's responsibility

**Testing Pyramid**:
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

**Coverage Targets**:
- Unit Tests: 70-80% code coverage
- Integration Tests: 100% critical paths
- E2E Tests: 100% user workflows
- API Tests: 100% endpoints
- Accessibility: 100% components WCAG 2.1 AA

---

## Testing Strategy Overview

### Test Types and Purpose

| Test Type | Purpose | Frequency | Automated | Owner |
|-----------|---------|-----------|-----------|-------|
| **Unit** | Function/Component isolation | Every commit | Yes | Developers |
| **Integration** | Service/API integration | Every commit | Yes | Developers |
| **E2E** | Full user workflows | Every PR | Yes | QA/Developers |
| **API** | Endpoint functionality | Every commit | Yes | Developers |
| **Performance** | Load & speed benchmarks | Weekly | Yes | DevOps |
| **Security** | Vulnerability scanning | Daily | Yes | Security/DevOps |
| **Accessibility** | WCAG compliance | Every PR | Yes | Developers |
| **Mobile** | Device compatibility | Every release | Partial | QA |
| **Cross-Browser** | Browser compatibility | Every release | Partial | QA |
| **Manual** | Exploratory testing | Every sprint | No | QA |

### Testing Environments

1. **Local Development**
   - Developers run tests before commit
   - Fast feedback loop
   - SQLite for speed (or Docker PostgreSQL)

2. **CI/CD Pipeline**
   - All automated tests on every PR
   - PostgreSQL database (matches production)
   - Parallel test execution

3. **Staging**
   - Production-like environment
   - Full E2E test suite
   - Performance testing
   - Security scanning

4. **Production**
   - Smoke tests after deployment
   - Synthetic monitoring
   - Real user monitoring (RUM)

---

## Unit Testing

### 1.1 Backend Unit Testing (Node.js/Express)

**Framework**: Jest
**Coverage Target**: 70-80%

**What to Test**:
- Service layer logic (CleaningJobsService, WorkersService, etc.)
- Utility functions (formatters, validators, date helpers)
- Middleware (auth, rate limiting, error handling)
- Business logic validation

**Example Test Structure**:
```typescript
// apps/api/src/services/__tests__/CleaningJobsService.test.ts

import { CleaningJobsService } from '../CleaningJobsService';
import { prismaMock } from '../../../test/prismaMock';

describe('CleaningJobsService', () => {
  let service: CleaningJobsService;

  beforeEach(() => {
    service = new CleaningJobsService();
  });

  describe('create', () => {
    it('should create a cleaning job with valid data', async () => {
      const mockJob = {
        id: '123',
        property_id: 'prop-123',
        customer_id: 'cust-123',
        status: 'PENDING'
      };

      prismaMock.cleaningJob.create.mockResolvedValue(mockJob);

      const result = await service.create({
        property_id: 'prop-123',
        customer_id: 'cust-123'
      });

      expect(result).toEqual(mockJob);
      expect(prismaMock.cleaningJob.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          property_id: 'prop-123'
        })
      });
    });

    it('should throw ValidationError for missing required fields', async () => {
      await expect(service.create({} as any)).rejects.toThrow('property_id is required');
    });

    it('should enforce tenant isolation', async () => {
      prismaMock.serviceProvider.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          property_id: 'prop-123',
          customer_id: 'cust-123',
          service_provider_id: 'other-tenant'
        })
      ).rejects.toThrow('Invalid service provider');
    });
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      const mockJobs = [{ id: '1' }, { id: '2' }];
      prismaMock.cleaningJob.findMany.mockResolvedValue(mockJobs);
      prismaMock.cleaningJob.count.mockResolvedValue(2);

      const result = await service.list('sp-123', 1, 20, {});

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by date range', async () => {
      await service.list('sp-123', 1, 20, {
        from_date: new Date('2024-01-01'),
        to_date: new Date('2024-12-31')
      });

      expect(prismaMock.cleaningJob.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          scheduled_date: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          }
        })
      });
    });
  });
});
```

**Test Files to Create**:
```
apps/api/src/
├── services/__tests__/
│   ├── CleaningJobsService.test.ts
│   ├── MaintenanceJobsService.test.ts
│   ├── WorkersService.test.ts
│   ├── CustomersService.test.ts
│   ├── AuthService.test.ts
│   └── ... (all services)
├── middleware/__tests__/
│   ├── auth.test.ts
│   ├── errorHandler.test.ts
│   └── rateLimiter.test.ts
└── utils/__tests__/
    ├── validators.test.ts
    ├── formatters.test.ts
    └── dateHelpers.test.ts
```

**Commands**:
```bash
# Run all backend tests
cd apps/api && npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- CleaningJobsService.test.ts

# Watch mode for TDD
npm test -- --watch
```

---

### 1.2 Frontend Unit Testing (React)

**Framework**: Vitest + React Testing Library
**Coverage Target**: 60-70%

**What to Test**:
- Component rendering
- User interactions (clicks, form inputs)
- Conditional rendering
- Props handling
- Custom hooks
- Context providers

**Example Test Structure**:
```typescript
// packages/ui-core/src/Button/__tests__/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('renders with correct variant styles', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    expect(container.firstChild).toHaveClass('bg-blue-600');
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

**Component Test Checklist**:
- [ ] Renders without crashing
- [ ] Renders with all prop variations
- [ ] Handles user interactions
- [ ] Conditional rendering logic
- [ ] Error states
- [ ] Loading states
- [ ] Empty states
- [ ] Accessibility attributes (ARIA)
- [ ] Keyboard navigation

**Custom Hook Testing**:
```typescript
// apps/web-cleaning/src/hooks/__tests__/useAuth.test.ts

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('logs in successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('handles login error', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(
        result.current.login('invalid@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

**Commands**:
```bash
# Run frontend tests for all apps
npm test

# Run tests for specific app
cd apps/web-cleaning && npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Integration Testing

### 2.1 API Integration Tests

**Purpose**: Test API endpoints with real database

**Framework**: Supertest + Jest
**Database**: PostgreSQL test database

**What to Test**:
- Complete request/response cycle
- Database operations (CRUD)
- Multi-tenant isolation
- Authentication/authorization
- Error responses
- Data validation

**Example Test Structure**:
```typescript
// apps/api/src/routes/__tests__/cleaning-jobs.integration.test.ts

import request from 'supertest';
import { app } from '../../index';
import { prisma } from '@rightfit/database';
import { createTestUser, createTestServiceProvider } from '../../../test/helpers';

describe('Cleaning Jobs API', () => {
  let authToken: string;
  let serviceProviderId: string;
  let propertyId: string;

  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Create test data
    const { user, token } = await createTestUser();
    authToken = token;
    const serviceProvider = await createTestServiceProvider(user.tenant_id);
    serviceProviderId = serviceProvider.id;

    const property = await prisma.customerProperty.create({
      data: {
        customer_id: 'test-customer',
        property_name: 'Test Property'
      }
    });
    propertyId = property.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.cleaningJob.deleteMany();
    await prisma.customerProperty.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/cleaning-jobs', () => {
    it('creates a cleaning job with valid data', async () => {
      const response = await request(app)
        .post('/api/cleaning-jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          property_id: propertyId,
          customer_id: 'test-customer',
          service_provider_id: serviceProviderId,
          scheduled_date: '2025-01-15'
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        property_id: propertyId,
        status: 'PENDING'
      });

      // Verify in database
      const job = await prisma.cleaningJob.findUnique({
        where: { id: response.body.data.id }
      });
      expect(job).toBeDefined();
    });

    it('returns 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/cleaning-jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toContain('property_id');
    });

    it('returns 403 when accessing other tenant data', async () => {
      const otherServiceProviderId = 'other-tenant-provider';

      await request(app)
        .post('/api/cleaning-jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          property_id: propertyId,
          customer_id: 'test-customer',
          service_provider_id: otherServiceProviderId
        })
        .expect(403);
    });
  });

  describe('GET /api/cleaning-jobs', () => {
    beforeEach(async () => {
      // Create test jobs
      await prisma.cleaningJob.createMany({
        data: [
          {
            property_id: propertyId,
            customer_id: 'test-customer',
            service_id: 'service-1',
            status: 'PENDING'
          },
          {
            property_id: propertyId,
            customer_id: 'test-customer',
            service_id: 'service-1',
            status: 'COMPLETED'
          }
        ]
      });
    });

    it('returns paginated list of jobs', async () => {
      const response = await request(app)
        .get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        total: 2
      });
    });

    it('filters by status', async () => {
      const response = await request(app)
        .get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}&status=PENDING`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('PENDING');
    });
  });
});
```

**Test Database Setup**:
```typescript
// test/setup.ts

import { execSync } from 'child_process';

beforeAll(async () => {
  // Create test database
  process.env.DATABASE_URL = 'postgresql://test_user:test_pass@localhost:5432/rightfit_test';

  // Run migrations
  execSync('npx prisma migrate deploy', { env: process.env });
});

afterAll(async () => {
  // Optionally drop test database
  execSync('npx prisma migrate reset --force', { env: process.env });
});
```

**Commands**:
```bash
# Run integration tests
cd apps/api && npm run test:integration

# Run with test database
DATABASE_URL=postgresql://localhost:5432/rightfit_test npm run test:integration
```

---

### 2.2 Frontend Integration Tests

**Purpose**: Test component integration with API and state

**Framework**: React Testing Library + MSW (Mock Service Worker)

**Example**:
```typescript
// apps/web-cleaning/src/pages/__tests__/CleaningJobs.integration.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { CleaningJobs } from '../CleaningJobs';
import { AuthProvider } from '../../contexts/AuthContext';

const server = setupServer(
  rest.get('/api/cleaning-jobs', (req, res, ctx) => {
    return res(ctx.json({
      data: [
        { id: '1', property_name: 'Property 1', status: 'PENDING' },
        { id: '2', property_name: 'Property 2', status: 'COMPLETED' }
      ],
      pagination: { page: 1, total: 2 }
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CleaningJobs Page Integration', () => {
  it('fetches and displays cleaning jobs', async () => {
    render(
      <AuthProvider>
        <CleaningJobs />
      </AuthProvider>
    );

    // Shows loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Then shows jobs
    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
      expect(screen.getByText('Property 2')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    server.use(
      rest.get('/api/cleaning-jobs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    render(
      <AuthProvider>
        <CleaningJobs />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading jobs/i)).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Testing

### 3.1 E2E Framework: Playwright

**Why Playwright**:
- Fast and reliable
- Cross-browser support (Chrome, Firefox, Safari)
- Mobile emulation
- Screenshot and video recording
- Auto-wait for elements

**What to Test**:
- Complete user workflows
- Cross-app workflows
- Multi-tenant isolation
- Authentication flows
- Critical business processes

**Test Structure**:
```typescript
// tests/e2e/cleaning-workflow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cleaning Job Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as cleaning company admin
    await page.goto('http://localhost:5174/login');
    await page.fill('input[name="email"]', 'admin@cleaningco.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('create and assign cleaning job end-to-end', async ({ page }) => {
    // Navigate to create job
    await page.click('text=Jobs');
    await page.click('text=Create Job');

    // Fill job form
    await page.selectOption('select[name="property"]', 'Property 1');
    await page.fill('input[name="scheduled_date"]', '2025-01-15');
    await page.fill('input[name="scheduled_start_time"]', '09:00');
    await page.click('button:has-text("Create Job")');

    // Verify job created
    await expect(page).toHaveURL(/\/jobs\/[a-z0-9-]+/);
    await expect(page.locator('text=Job Created')).toBeVisible();

    // Assign worker
    await page.click('button:has-text("Assign Worker")');
    await page.selectOption('select[name="worker"]', 'John Cleaner');
    await page.click('button:has-text("Assign")');

    // Verify assignment
    await expect(page.locator('text=John Cleaner')).toBeVisible();
    await expect(page.locator('[data-testid="job-status"]')).toHaveText('SCHEDULED');
  });

  test('worker completes job', async ({ page }) => {
    // Logout and login as worker
    await page.click('[data-testid="profile-menu"]');
    await page.click('text=Logout');

    await page.goto('http://localhost:5178/login');
    await page.fill('input[name="email"]', 'john@cleaningco.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Find assigned job
    await page.click('text=Today\'s Jobs');
    await page.click('[data-testid="job-card"]:first-child');

    // Start job
    await page.click('button:has-text("Start Job")');
    await expect(page.locator('[data-testid="job-status"]')).toHaveText('IN_PROGRESS');

    // Complete checklist
    await page.check('input[name="checklist-item-1"]');
    await page.check('input[name="checklist-item-2"]');
    await page.check('input[name="checklist-item-3"]');

    // Upload photos
    await page.setInputFiles('input[type="file"]', 'test/fixtures/after-photo.jpg');
    await expect(page.locator('img[alt="After photo"]')).toBeVisible();

    // Complete job
    await page.click('button:has-text("Complete Job")');
    await page.fill('textarea[name="notes"]', 'Job completed successfully');
    await page.click('button:has-text("Confirm")');

    // Verify completion
    await expect(page.locator('[data-testid="job-status"]')).toHaveText('COMPLETED');
  });

  test('cross-app workflow: worker reports issue', async ({ page }) => {
    // Login as worker and report issue
    await page.goto('http://localhost:5178/login');
    await page.fill('input[name="email"]', 'john@cleaningco.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.click('text=Report Issue');
    await page.fill('input[name="title"]', 'Broken faucet');
    await page.fill('textarea[name="description"]', 'Kitchen faucet is leaking');
    await page.selectOption('select[name="category"]', 'PLUMBING');
    await page.selectOption('select[name="priority"]', 'HIGH');
    await page.setInputFiles('input[type="file"]', 'test/fixtures/issue-photo.jpg');
    await page.click('button:has-text("Submit Issue")');

    await expect(page.locator('text=Issue Reported')).toBeVisible();

    // Logout and login as customer to approve
    await page.click('[data-testid="profile-menu"]');
    await page.click('text=Logout');

    await page.goto('http://localhost:5176/login'); // Customer portal
    await page.fill('input[name="email"]', 'customer@business.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.click('text=Issues');
    await page.click('text=Broken faucet');
    await page.click('button:has-text("Approve")');

    await expect(page.locator('text=Issue Approved')).toBeVisible();

    // Verify maintenance job created
    await page.goto('http://localhost:5175/login'); // Maintenance portal
    await page.fill('input[name="email"]', 'admin@maintenance.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.click('text=Jobs');
    await expect(page.locator('text=Broken faucet')).toBeVisible();
  });
});
```

**Commands**:
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

**CI Configuration**:
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Start services
        run: |
          docker-compose up -d
          npm run dev:api &
          npm run dev:cleaning &
          npm run dev:maintenance &
          npm run dev:customer &
          npm run dev:worker &
          sleep 30
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## API Testing

### 4.1 API Contract Testing

**Framework**: Postman/Newman or Pact

**Purpose**: Ensure API contracts are maintained

**Postman Collection Structure**:
```json
{
  "info": {
    "name": "RightFit Services API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", () => {",
                  "  pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has access_token\", () => {",
                  "  const json = pm.response.json();",
                  "  pm.expect(json).to.have.property('access_token');",
                  "  pm.collectionVariables.set('authToken', json.access_token);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Cleaning Jobs",
      "item": [
        {
          "name": "Create Cleaning Job",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/cleaning-jobs",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"property_id\":\"{{propertyId}}\",\"customer_id\":\"{{customerId}}\"}"
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 201\", () => {",
                  "  pm.response.to.have.status(201);",
                  "});",
                  "",
                  "pm.test(\"Response has job ID\", () => {",
                  "  const json = pm.response.json();",
                  "  pm.expect(json.data).to.have.property('id');",
                  "  pm.collectionVariables.set('jobId', json.data.id);",
                  "});",
                  "",
                  "pm.test(\"Job has correct status\", () => {",
                  "  const json = pm.response.json();",
                  "  pm.expect(json.data.status).to.equal('PENDING');",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Run with Newman**:
```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman_collection.json -e environment.json

# Run in CI
newman run postman_collection.json \
  --environment environment.json \
  --reporters cli,junit \
  --reporter-junit-export results.xml
```

---

## Performance Testing

### 5.1 Load Testing

**Framework**: K6

**What to Test**:
- API endpoint throughput
- Database query performance
- Concurrent user capacity
- Response time under load

**Example K6 Script**:
```javascript
// tests/performance/api-load.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    errors: ['rate<0.1'],              // Error rate < 10%
  },
};

export default function () {
  // Login
  const loginRes = http.post('http://localhost:3001/api/auth/login', JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const authToken = loginRes.json('access_token');
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  };

  // List cleaning jobs
  const jobsRes = http.get('http://localhost:3001/api/cleaning-jobs?service_provider_id=test-sp', params);

  check(jobsRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);
}
```

**Run Load Test**:
```bash
# Install K6
brew install k6  # macOS
# or download from https://k6.io/

# Run test
k6 run tests/performance/api-load.js

# Run with output to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 tests/performance/api-load.js
```

**Performance Targets**:
- API response time (p95): < 500ms
- Database query time (p95): < 100ms
- Concurrent users: 500+ without degradation
- Error rate: < 0.1%

---

### 5.2 Frontend Performance Testing

**Framework**: Lighthouse CI

**What to Measure**:
- Page load time
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)
- Bundle size

**Lighthouse CI Configuration**:
```javascript
// lighthouserc.js

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5174/login',
        'http://localhost:5174/dashboard',
        'http://localhost:5174/jobs',
        'http://localhost:5174/properties'
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Run Lighthouse**:
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun

# Or run individual audit
lighthouse http://localhost:5174/dashboard \
  --output=json \
  --output-path=./lighthouse-results.json
```

---

## Security Testing

### 6.1 Automated Security Scanning

**Tools**:
- **npm audit**: Dependency vulnerabilities
- **Snyk**: Continuous security monitoring
- **OWASP ZAP**: Dynamic application security testing

**Commands**:
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Generate audit report
npm audit --json > audit-report.json

# Snyk scan
npx snyk test

# Monitor project
npx snyk monitor
```

**OWASP ZAP Automation**:
```bash
# Run baseline scan
docker run -v $(pwd):/zap/wrk/:rw \
  owasp/zap2docker-stable \
  zap-baseline.py \
  -t http://host.docker.internal:5174 \
  -r baseline-report.html
```

---

### 6.2 Manual Security Testing Checklist

**Authentication & Authorization**:
- [ ] Cannot access other tenant's data
- [ ] Session expires appropriately
- [ ] Password requirements enforced
- [ ] Rate limiting prevents brute force
- [ ] JWT tokens properly validated
- [ ] Refresh token rotation works

**Input Validation**:
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] XSS prevented (React auto-escaping)
- [ ] CSRF tokens on state-changing operations
- [ ] File upload validation (type, size, content)
- [ ] Email and phone validation

**Data Protection**:
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced in production
- [ ] Security headers configured (Helmet)
- [ ] CORS properly configured
- [ ] API keys not exposed

---

## Accessibility Testing

### 7.1 Automated Accessibility Testing

**Framework**: axe-core + jest-axe

**Example**:
```typescript
// packages/ui-core/src/Button/__tests__/Button.a11y.test.tsx

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled button has proper ARIA attributes', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Run Accessibility Tests**:
```bash
# Run all a11y tests
npm test -- --testNamePattern="Accessibility"

# Run with Lighthouse
lighthouse http://localhost:5174/dashboard \
  --only-categories=accessibility \
  --output=json
```

---

### 7.2 Manual Accessibility Testing

**Keyboard Navigation Checklist**:
- [ ] All interactive elements reachable by Tab
- [ ] Tab order is logical
- [ ] Focus visible on all elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate menus

**Screen Reader Testing**:
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Error messages announced
- [ ] Dynamic content changes announced (aria-live)
- [ ] Landmark regions properly labeled

**Visual Testing**:
- [ ] Color contrast ratio ≥ 4.5:1 (text)
- [ ] Color contrast ratio ≥ 3:1 (UI components)
- [ ] Text resizable to 200% without loss of content
- [ ] No information conveyed by color alone

---

## Mobile Testing

### 8.1 React Native Testing

**Framework**: Jest + React Native Testing Library

**Example**:
```typescript
// apps/mobile/src/screens/__tests__/PropertiesScreen.test.tsx

import { render, fireEvent } from '@testing-library/react-native';
import { PropertiesScreen } from '../PropertiesScreen';

describe('PropertiesScreen', () => {
  it('renders property list', () => {
    const { getByText } = render(<PropertiesScreen />);
    expect(getByText('Properties')).toBeTruthy();
  });

  it('navigates to property details on tap', () => {
    const navigation = { navigate: jest.fn() };
    const { getByTestId } = render(<PropertiesScreen navigation={navigation} />);

    fireEvent.press(getByTestID('property-card-1'));
    expect(navigation.navigate).toHaveBeenCalledWith('PropertyDetails', { id: '1' });
  });
});
```

---

### 8.2 Device Testing

**Physical Devices** (Priority):
- iPhone 14 Pro (iOS 17)
- Samsung Galaxy S23 (Android 14)
- iPad Pro (iOS 17)
- Budget Android phone (Android 12)

**Emulator/Simulator Testing**:
```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Run tests on device
npx jest --testPathPattern=mobile
```

**What to Test**:
- [ ] App launches successfully
- [ ] Offline sync works
- [ ] Camera permissions granted
- [ ] Photo upload with compression
- [ ] Push notifications received
- [ ] Biometric authentication (if applicable)
- [ ] App resume from background
- [ ] Deep links work

---

## Cross-Browser Testing

### 9.1 Supported Browsers

**Desktop**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Mobile**:
- Safari iOS (latest 2 versions)
- Chrome Android (latest 2 versions)

---

### 9.2 BrowserStack Integration

```javascript
// playwright.config.ts

import { devices } from '@playwright/test';

export default {
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
};
```

---

## Testing Infrastructure

### 10.1 Test Database

**Setup**:
```bash
# Create test database
createdb rightfit_test

# Set environment variable
export DATABASE_URL="postgresql://localhost:5432/rightfit_test"

# Run migrations
npx prisma migrate deploy

# Seed test data
npm run db:seed:test
```

**Docker Compose for Tests**:
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: rightfit_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"
```

---

### 10.2 Test Data Management

**Strategy**: Factory pattern with Faker.js

```typescript
// test/factories/userFactory.ts

import { faker } from '@faker-js/faker';
import { prisma } from '@rightfit/database';

export async function createTestUser(overrides = {}) {
  const user = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      password_hash: await bcrypt.hash('password123', 10),
      full_name: faker.person.fullName(),
      tenant_id: faker.string.uuid(),
      ...overrides
    }
  });

  const token = jwt.sign(
    { user_id: user.id, tenant_id: user.tenant_id },
    process.env.JWT_SECRET!
  );

  return { user, token };
}

export async function createTestServiceProvider(tenantId: string) {
  return prisma.serviceProvider.create({
    data: {
      tenant_id: tenantId,
      business_name: faker.company.name(),
      owner_name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number()
    }
  });
}
```

---

## CI/CD Integration

### 11.1 GitHub Actions Workflow

```yaml
# .github/workflows/tests.yml

name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: rightfit_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/rightfit_test
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/rightfit_test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Start services
        run: |
          docker-compose up -d
          npm run dev:api &
          npm run dev:cleaning &
          npm run dev:maintenance &
          npm run dev:customer &
          npm run dev:worker &
          sleep 30
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## Testing Metrics & KPIs

### 12.1 Code Coverage Targets

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| Backend Unit Tests | 70-80% | 0% | ❌ Not started |
| Frontend Unit Tests | 60-70% | 0% | ❌ Not started |
| Integration Tests | 100% critical paths | 0% | ❌ Not started |
| E2E Tests | 100% user workflows | 0% | ❌ Not started |

---

### 12.2 Quality Metrics

**Track in Dashboard**:
- Test pass rate (target: >95%)
- Code coverage trend
- Test execution time
- Flaky test rate (target: <2%)
- Bug escape rate (bugs found in production)
- Mean time to detect (MTTD)
- Mean time to resolve (MTTR)

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goals**: Set up testing infrastructure

- [ ] Install testing frameworks (Jest, Vitest, Playwright)
- [ ] Configure test databases
- [ ] Create test helpers and factories
- [ ] Set up CI/CD pipelines
- [ ] Write first 10 unit tests (proof of concept)

**Deliverables**:
- Testing frameworks configured
- CI/CD running tests on every PR
- Test coverage reporting enabled

---

### Phase 2: Backend Testing (Weeks 3-5)

**Goals**: Achieve 70% backend coverage

- [ ] Unit tests for all service classes
- [ ] Integration tests for critical API endpoints
- [ ] API contract tests (Postman collections)
- [ ] Security tests automated

**Deliverables**:
- 200+ backend unit tests
- 50+ integration tests
- 100% critical endpoints tested

---

### Phase 3: Frontend Testing (Weeks 6-8)

**Goals**: Achieve 60% frontend coverage

- [ ] Unit tests for all shared components
- [ ] Integration tests for pages
- [ ] Accessibility tests for all components
- [ ] Visual regression tests

**Deliverables**:
- 150+ frontend unit tests
- All UI components tested
- Accessibility validated

---

### Phase 4: E2E Testing (Weeks 9-10)

**Goals**: Complete user workflow coverage

- [ ] E2E tests for cleaning workflow
- [ ] E2E tests for maintenance workflow
- [ ] Cross-app workflow tests
- [ ] Mobile app E2E tests

**Deliverables**:
- 20+ E2E test scenarios
- Critical workflows automated

---

### Phase 5: Performance & Security (Weeks 11-12)

**Goals**: Validate performance and security

- [ ] Load testing with K6
- [ ] Frontend performance testing
- [ ] Security scanning automated
- [ ] Penetration testing (external)

**Deliverables**:
- Performance baselines established
- Security vulnerabilities identified and fixed

---

## Conclusion

This comprehensive testing plan provides a roadmap to achieve best-in-class quality for RightFit Services. The investment in testing infrastructure will:

- **Reduce bugs** by 80-90%
- **Accelerate development** (confident refactoring)
- **Improve reliability** (catch regressions early)
- **Enable faster releases** (automated quality gates)
- **Build customer confidence** (fewer production issues)

**Next Steps**:
1. Review and approve testing plan
2. Assign testing champions for each area
3. Begin Phase 1 implementation
4. Track progress weekly against roadmap

---

**Last Updated**: November 7, 2025
**Review Cycle**: Monthly
**Ownership**: Development Team + QA
