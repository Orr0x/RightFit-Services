/**
 * Cleaning Job Workflow E2E Tests
 *
 * Tests the complete cleaning job workflow from creation to completion
 */

import { test, expect } from '@playwright/test'

test.describe('Cleaning Job Workflow', () => {
  // Test user credentials
  const adminEmail = 'admin@cleaningco.test'
  const adminPassword = 'TestPassword123!'
  const workerEmail = 'worker@cleaningco.test'
  const workerPassword = 'TestPassword123!'

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5174/login')
  })

  test('admin can login successfully', async ({ page }) => {
    // Fill in login form
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Verify dashboard elements
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('create and assign cleaning job end-to-end', async ({ page }) => {
    // Login as admin
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)

    // Navigate to jobs page
    await page.click('text=Jobs')
    await expect(page).toHaveURL(/\/cleaning-jobs/)

    // Click create job button
    await page.click('button:has-text("Create Job")')
    await expect(page).toHaveURL(/\/cleaning-jobs\/create/)

    // Fill job form
    await page.selectOption('select[name="property"]', { index: 1 })
    await page.fill('input[name="scheduled_date"]', '2025-01-15')
    await page.fill('input[name="scheduled_start_time"]', '09:00')
    await page.fill('input[name="scheduled_end_time"]', '11:00')
    await page.selectOption('select[name="service"]', { index: 1 })

    // Submit form
    await page.click('button:has-text("Create Job")')

    // Verify job created
    await expect(page).toHaveURL(/\/cleaning-jobs\/[a-z0-9-]+/)
    await expect(page.getByText('Job created successfully')).toBeVisible()

    // Verify job details
    await expect(page.getByText('PENDING')).toBeVisible()
    await expect(page.getByText('2025-01-15')).toBeVisible()

    // Assign worker
    await page.click('button:has-text("Assign Worker")')
    await page.selectOption('select[name="worker"]', { index: 1 })
    await page.click('button:has-text("Assign")')

    // Verify assignment
    await expect(page.getByTestId('job-status')).toHaveText('SCHEDULED')
    await expect(page.getByText(/assigned to/i)).toBeVisible()
  })

  test('worker completes cleaning job', async ({ page }) => {
    // Login as worker
    await page.goto('http://localhost:5178/login')
    await page.fill('input[name="email"]', workerEmail)
    await page.fill('input[name="password"]', workerPassword)
    await page.click('button[type="submit"]')

    // Navigate to today's jobs
    await page.click('text=Today\'s Jobs')

    // Select first job
    await page.click('[data-testid="job-card"]:first-child')

    // Start job
    await page.click('button:has-text("Start Job")')
    await expect(page.getByTestId('job-status')).toHaveText('IN_PROGRESS')

    // Complete checklist
    const checklistItems = page.locator('input[type="checkbox"]')
    const count = await checklistItems.count()
    for (let i = 0; i < count; i++) {
      await checklistItems.nth(i).check()
    }

    // Upload photos
    await page.setInputFiles('input[type="file"][name="before_photos"]', 'tests/e2e/fixtures/before-photo.jpg')
    await page.setInputFiles('input[type="file"][name="after_photos"]', 'tests/e2e/fixtures/after-photo.jpg')

    // Verify photos uploaded
    await expect(page.locator('img[alt*="Before"]')).toBeVisible()
    await expect(page.locator('img[alt*="After"]')).toBeVisible()

    // Complete job
    await page.click('button:has-text("Complete Job")')

    // Fill completion notes
    await page.fill('textarea[name="notes"]', 'Job completed successfully. All areas cleaned.')

    // Confirm completion
    await page.click('button:has-text("Confirm Completion")')

    // Verify completion
    await expect(page.getByTestId('job-status')).toHaveText('COMPLETED')
    await expect(page.getByText('Job completed successfully')).toBeVisible()
  })

  test('worker reports issue during cleaning', async ({ page }) => {
    // Login as worker
    await page.goto('http://localhost:5178/login')
    await page.fill('input[name="email"]', workerEmail)
    await page.fill('input[name="password"]', workerPassword)
    await page.click('button[type="submit"]')

    // Navigate to job
    await page.click('text=Today\'s Jobs')
    await page.click('[data-testid="job-card"]:first-child')

    // Start job
    await page.click('button:has-text("Start Job")')

    // Report issue
    await page.click('button:has-text("Report Issue")')

    // Fill issue form
    await page.fill('input[name="title"]', 'Broken faucet in bathroom')
    await page.fill('textarea[name="description"]', 'Kitchen faucet is leaking heavily')
    await page.selectOption('select[name="category"]', 'PLUMBING')
    await page.selectOption('select[name="priority"]', 'HIGH')

    // Upload photo
    await page.setInputFiles('input[type="file"][name="photos"]', 'tests/e2e/fixtures/issue-photo.jpg')

    // Submit issue
    await page.click('button:has-text("Submit Issue")')

    // Verify issue reported
    await expect(page.getByText('Issue reported successfully')).toBeVisible()

    // Continue with job
    await page.click('button:has-text("Continue Cleaning")')

    // Complete job normally
    const checklistItems = page.locator('input[type="checkbox"]')
    const count = await checklistItems.count()
    for (let i = 0; i < count; i++) {
      await checklistItems.nth(i).check()
    }

    await page.click('button:has-text("Complete Job")')
    await page.fill('textarea[name="notes"]', 'Completed. Reported plumbing issue.')
    await page.click('button:has-text("Confirm Completion")')

    await expect(page.getByText(/completed.*issue reported/i)).toBeVisible()
  })

  test('cross-app workflow: issue escalation', async ({ page, context }) => {
    // Login as worker and report issue
    await page.goto('http://localhost:5178/login')
    await page.fill('input[name="email"]', workerEmail)
    await page.fill('input[name="password"]', workerPassword)
    await page.click('button[type="submit"]')

    await page.click('text=Report Issue')
    await page.fill('input[name="title"]', 'Damaged property')
    await page.fill('textarea[name="description"]', 'Found water damage in ceiling')
    await page.selectOption('select[name="category"]', 'STRUCTURAL')
    await page.selectOption('select[name="priority"]', 'HIGH')
    await page.click('button:has-text("Submit Issue")')

    await expect(page.getByText('Issue reported successfully')).toBeVisible()

    // Switch to customer portal in new page
    const customerPage = await context.newPage()
    await customerPage.goto('http://localhost:5176/login')
    await customerPage.fill('input[name="email"]', 'customer@business.test')
    await customerPage.fill('input[name="password"]', 'TestPassword123!')
    await customerPage.click('button[type="submit"]')

    // Navigate to issues
    await customerPage.click('text=Issues')
    await expect(customerPage.getByText('Damaged property')).toBeVisible()

    // Approve issue for maintenance
    await customerPage.click('text=Damaged property')
    await customerPage.click('button:has-text("Approve for Maintenance")')
    await expect(customerPage.getByText('Issue approved')).toBeVisible()

    // Switch to maintenance portal
    const maintenancePage = await context.newPage()
    await maintenancePage.goto('http://localhost:5175/login')
    await maintenancePage.fill('input[name="email"]', 'admin@maintenance.test')
    await maintenancePage.fill('input[name="password"]', 'TestPassword123!')
    await maintenancePage.click('button[type="submit"]')

    // Verify maintenance job created
    await maintenancePage.click('text=Jobs')
    await expect(maintenancePage.getByText('Damaged property')).toBeVisible()
    await expect(maintenancePage.getByText('PENDING')).toBeVisible()
  })

  test('handles offline mode gracefully', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', workerEmail)
    await page.fill('input[name="password"]', workerPassword)
    await page.click('button[type="submit"]')

    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"]')

    // Go offline
    await page.context().setOffline(true)

    // Try to interact
    await page.click('[data-testid="job-card"]:first-child')

    // Should show offline message
    await expect(page.getByText(/offline/i)).toBeVisible()

    // Should still allow viewing cached data
    await expect(page.getByTestId('job-status')).toBeVisible()
  })

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Login
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]')

    // Navigate to jobs
    await page.click('text=Jobs')

    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-job-card"]')).toBeVisible()

    // Swipe to filter
    await page.locator('[data-testid="filter-panel"]').swipe({ dx: -100, dy: 0 })

    // Filter by status
    await page.click('text=PENDING')

    // Verify filtered results
    await expect(page.locator('[data-status="PENDING"]')).toBeVisible()
  })
})
