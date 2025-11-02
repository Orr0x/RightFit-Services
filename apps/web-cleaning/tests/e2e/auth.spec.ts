import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/RightFit/)
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /login/i })
    await loginButton.click()

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.getByRole('button', { name: /login/i }).click()

    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.getByRole('button', { name: /login/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL(/\/register/)
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible()
  })

  test('should register a new user', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'Password123!')
    await page.fill('input[name="confirmPassword"]', 'Password123!')
    await page.fill('input[name="tenantName"]', 'Test Company')

    await page.getByRole('button', { name: /register/i }).click()

    // Should redirect to dashboard or show success message
    await expect(
      page.getByText(/registration successful|welcome/i)
    ).toBeVisible()
  })

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[name="password"]', 'Password123!')
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!')

    await expect(page.getByText(/passwords must match/i)).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.getByRole('button', { name: /login/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)

    // Logout
    await page.getByRole('button', { name: /logout/i }).click()

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should persist authentication after page reload', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.getByRole('button', { name: /login/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)

    // Reload page
    await page.reload()

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })
})
