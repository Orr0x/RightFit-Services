/**
 * K6 Load Testing Script for RightFit Services API
 *
 * Tests API performance under various load scenarios
 */

import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const loginDuration = new Trend('login_duration')
const jobsFetchDuration = new Trend('jobs_fetch_duration')
const jobCreateDuration = new Trend('job_create_duration')
const successfulLogins = new Counter('successful_logins')
const failedLogins = new Counter('failed_logins')

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 },   // Stay at 50 users for 5 minutes
    { duration: '2m', target: 100 },  // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 },  // Spike to 200 users over 2 minutes
    { duration: '3m', target: 200 },  // Stay at 200 users for 3 minutes
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],     // 95% of requests should be below 500ms
    http_req_duration: ['p(99)<1000'],    // 99% of requests should be below 1s
    errors: ['rate<0.1'],                  // Error rate should be less than 10%
    http_req_failed: ['rate<0.05'],        // Less than 5% requests should fail
    login_duration: ['p(95)<1000'],        // 95% of logins should be under 1s
    jobs_fetch_duration: ['p(95)<500'],    // 95% of job fetches should be under 500ms
    job_create_duration: ['p(95)<1000'],   // 95% of job creates should be under 1s
  },
}

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

// Test data
const TEST_USERS = [
  { email: 'admin1@test.com', password: 'TestPassword123!' },
  { email: 'admin2@test.com', password: 'TestPassword123!' },
  { email: 'worker1@test.com', password: 'TestPassword123!' },
  { email: 'worker2@test.com', password: 'TestPassword123!' },
]

/**
 * Setup function - runs once per VU at the beginning
 */
export function setup() {
  console.log('Starting load test...')
  console.log(`Base URL: ${BASE_URL}`)
  return { startTime: new Date().toISOString() }
}

/**
 * Main test function - runs for each VU iteration
 */
export default function (data) {
  // Select a random test user
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)]
  let authToken = null

  // Group: Authentication
  group('Authentication', function () {
    const loginStart = Date.now()

    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const loginSuccess = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login has access_token': (r) => r.json('access_token') !== undefined,
      'login response time < 1s': (r) => r.timings.duration < 1000,
    })

    if (loginSuccess) {
      successfulLogins.add(1)
      authToken = loginRes.json('access_token')
      loginDuration.add(Date.now() - loginStart)
    } else {
      failedLogins.add(1)
      errorRate.add(1)
      console.error(`Login failed for ${user.email}: ${loginRes.status}`)
      return // Exit early if login fails
    }
  })

  if (!authToken) {
    return
  }

  const params = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  }

  // Group: Fetch Cleaning Jobs
  group('Fetch Cleaning Jobs', function () {
    const fetchStart = Date.now()

    const jobsRes = http.get(
      `${BASE_URL}/api/cleaning-jobs?page=1&limit=20&status=PENDING`,
      params
    )

    const fetchSuccess = check(jobsRes, {
      'jobs fetch status is 200': (r) => r.status === 200,
      'jobs fetch has data array': (r) => r.json('data') !== undefined,
      'jobs fetch has pagination': (r) => r.json('pagination') !== undefined,
      'jobs fetch response time < 500ms': (r) => r.timings.duration < 500,
    })

    if (fetchSuccess) {
      jobsFetchDuration.add(Date.now() - fetchStart)
    } else {
      errorRate.add(1)
    }
  })

  // Group: Fetch Properties
  group('Fetch Properties', function () {
    const propertiesRes = http.get(`${BASE_URL}/api/properties?page=1&limit=20`, params)

    check(propertiesRes, {
      'properties status is 200': (r) => r.status === 200,
      'properties response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1)
  })

  // Group: Fetch Customers
  group('Fetch Customers', function () {
    const customersRes = http.get(`${BASE_URL}/api/customers?page=1&limit=20`, params)

    check(customersRes, {
      'customers status is 200': (r) => r.status === 200,
      'customers response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1)
  })

  // Group: Create Cleaning Job (20% of iterations)
  if (Math.random() < 0.2) {
    group('Create Cleaning Job', function () {
      const createStart = Date.now()

      // First, fetch a property and service to use
      const propertiesRes = http.get(`${BASE_URL}/api/properties?limit=1`, params)
      const servicesRes = http.get(`${BASE_URL}/api/cleaning-services?limit=1`, params)

      if (
        propertiesRes.status === 200 &&
        servicesRes.status === 200 &&
        propertiesRes.json('data').length > 0 &&
        servicesRes.json('data').length > 0
      ) {
        const property = propertiesRes.json('data')[0]
        const service = servicesRes.json('data')[0]

        const createJobRes = http.post(
          `${BASE_URL}/api/cleaning-jobs`,
          JSON.stringify({
            property_id: property.id,
            customer_id: property.customer_id,
            service_id: service.id,
            scheduled_date: '2025-02-15',
            scheduled_start_time: '09:00:00',
            scheduled_end_time: '11:00:00',
          }),
          params
        )

        const createSuccess = check(createJobRes, {
          'job create status is 201': (r) => r.status === 201,
          'job create has id': (r) => r.json('data.id') !== undefined,
          'job create response time < 1s': (r) => r.timings.duration < 1000,
        })

        if (createSuccess) {
          jobCreateDuration.add(Date.now() - createStart)
        } else {
          errorRate.add(1)
        }
      }
    })
  }

  // Group: Update Job Status (10% of iterations)
  if (Math.random() < 0.1) {
    group('Update Job Status', function () {
      // Fetch a job first
      const jobsRes = http.get(`${BASE_URL}/api/cleaning-jobs?limit=1&status=PENDING`, params)

      if (jobsRes.status === 200 && jobsRes.json('data').length > 0) {
        const job = jobsRes.json('data')[0]

        const updateRes = http.put(
          `${BASE_URL}/api/cleaning-jobs/${job.id}`,
          JSON.stringify({
            status: 'IN_PROGRESS',
            actual_start_time: '09:05:00',
          }),
          params
        )

        check(updateRes, {
          'job update status is 200': (r) => r.status === 200,
          'job update response time < 500ms': (r) => r.timings.duration < 500,
        }) || errorRate.add(1)
      }
    })
  }

  // Realistic user behavior - pause between requests
  sleep(Math.random() * 2 + 1) // Sleep for 1-3 seconds
}

/**
 * Teardown function - runs once at the end
 */
export function teardown(data) {
  console.log('Load test completed!')
  console.log(`Started at: ${data.startTime}`)
  console.log(`Ended at: ${new Date().toISOString()}`)
}

/**
 * Handle summary - customize test results output
 */
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

// Helper function for text summary (basic implementation)
function textSummary(data, options = {}) {
  const indent = options.indent || ''
  const lines = []

  lines.push(`\n${indent}Load Test Summary:`)
  lines.push(`${indent}==================`)

  // Metrics
  if (data.metrics) {
    lines.push(`\n${indent}Metrics:`)
    Object.keys(data.metrics).forEach((metric) => {
      const values = data.metrics[metric].values
      if (values) {
        lines.push(`${indent}  ${metric}:`)
        if (values.avg) lines.push(`${indent}    avg: ${values.avg.toFixed(2)}`)
        if (values.min) lines.push(`${indent}    min: ${values.min.toFixed(2)}`)
        if (values.max) lines.push(`${indent}    max: ${values.max.toFixed(2)}`)
        if (values.p95) lines.push(`${indent}    p95: ${values.p95.toFixed(2)}`)
        if (values.p99) lines.push(`${indent}    p99: ${values.p99.toFixed(2)}`)
      }
    })
  }

  return lines.join('\n')
}
