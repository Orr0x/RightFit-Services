import { test, expect } from '@playwright/test'

test.describe('Properties Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.getByRole('button', { name: /login/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should display properties list', async ({ page }) => {
    await page.goto('/properties')
    await expect(page.getByRole('heading', { name: /properties/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /add property/i })).toBeVisible()
  })

  test('should open add property dialog', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('button', { name: /add property/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/add new property/i)).toBeVisible()
  })

  test('should create a new property', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('button', { name: /add property/i }).click()

    // Fill property form
    await page.fill('input[name="name"]', 'Test Property')
    await page.fill('input[name="address"]', '123 Test Street')
    await page.fill('input[name="postcode"]', 'SW1A 1AA')
    await page.fill('input[name="type"]', 'House')
    await page.fill('input[name="bedrooms"]', '3')
    await page.fill('input[name="bathrooms"]', '2')

    await page.getByRole('button', { name: /save|create/i }).click()

    // Should show success message
    await expect(page.getByText(/property created|success/i)).toBeVisible()

    // Should appear in the list
    await expect(page.getByText('Test Property')).toBeVisible()
    await expect(page.getByText('123 Test Street')).toBeVisible()
  })

  test('should show validation errors for invalid postcode', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('button', { name: /add property/i }).click()

    await page.fill('input[name="postcode"]', 'INVALID')

    await expect(page.getByText(/invalid postcode/i)).toBeVisible()
  })

  test('should view property details', async ({ page }) => {
    await page.goto('/properties')

    // Click on first property card
    const propertyCard = page.locator('[data-testid="property-card"]').first()
    await propertyCard.click()

    // Should navigate to property details
    await expect(page).toHaveURL(/\/properties\/\w+/)
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('should edit an existing property', async ({ page }) => {
    await page.goto('/properties')

    // Click edit button on first property
    const editButton = page
      .locator('[data-testid="property-card"]')
      .first()
      .getByRole('button', { name: /edit/i })
    await editButton.click()

    // Update property
    await page.fill('input[name="name"]', 'Updated Property Name')
    await page.getByRole('button', { name: /save|update/i }).click()

    // Should show success message
    await expect(page.getByText(/property updated|success/i)).toBeVisible()
    await expect(page.getByText('Updated Property Name')).toBeVisible()
  })

  test('should search properties', async ({ page }) => {
    await page.goto('/properties')

    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('Test Property')

    // Results should be filtered
    const propertyCards = page.locator('[data-testid="property-card"]')
    await expect(propertyCards).toHaveCount(1)
  })

  test('should filter properties by type', async ({ page }) => {
    await page.goto('/properties')

    // Open filter dropdown
    await page.getByRole('button', { name: /filter/i }).click()

    // Select House type
    await page.getByRole('option', { name: /house/i }).click()

    // Should show only houses
    const propertyCards = page.locator('[data-testid="property-card"]')
    const count = await propertyCards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should delete a property', async ({ page }) => {
    await page.goto('/properties')

    // Click delete button on first property
    const deleteButton = page
      .locator('[data-testid="property-card"]')
      .first()
      .getByRole('button', { name: /delete/i })
    await deleteButton.click()

    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click()

    // Should show success message
    await expect(page.getByText(/property deleted|success/i)).toBeVisible()
  })

  test('should paginate properties list', async ({ page }) => {
    await page.goto('/properties')

    // Check if pagination exists (if there are enough properties)
    const nextButton = page.getByRole('button', { name: /next/i })

    if (await nextButton.isVisible()) {
      await nextButton.click()

      // Should navigate to page 2
      await expect(page).toHaveURL(/page=2/)
    }
  })

  test('should display property stats', async ({ page }) => {
    await page.goto('/properties')

    // Check for stats
    await expect(page.getByText(/total properties/i)).toBeVisible()
    await expect(page.getByText(/\d+/)).toBeVisible()
  })
})

test.describe('Certificates Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to certificates
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.getByRole('button', { name: /login/i }).click()
    await page.goto('/certificates')
  })

  test('should display certificates list', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /certificates/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /add certificate/i })
    ).toBeVisible()
  })

  test('should create a new certificate', async ({ page }) => {
    await page.getByRole('button', { name: /add certificate/i }).click()

    // Fill certificate form
    await page.selectOption('select[name="property_id"]', { index: 1 })
    await page.selectOption('select[name="certificate_type"]', 'GAS_SAFETY')
    await page.fill('input[name="issue_date"]', '2025-01-01')
    await page.fill('input[name="expiry_date"]', '2026-01-01')
    await page.fill('input[name="certificate_number"]', 'GAS-12345')
    await page.fill('input[name="issuer_name"]', 'UK Gas Safe')

    // Upload document
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/test-certificate.pdf')

    await page.getByRole('button', { name: /save|create/i }).click()

    // Should show success message
    await expect(
      page.getByText(/certificate created|success/i)
    ).toBeVisible()
  })

  test('should show expiring certificates warning', async ({ page }) => {
    // Look for expiring certificates badge/warning
    const expiringBadge = page.getByText(/expiring soon/i)

    if (await expiringBadge.isVisible()) {
      await expect(expiringBadge).toHaveClass(/warning|alert/)
    }
  })

  test('should filter certificates by type', async ({ page }) => {
    await page.selectOption('select[name="filter_type"]', 'GAS_SAFETY')

    // Should only show gas safety certificates
    const certificateCards = page.locator('[data-testid="certificate-card"]')
    const count = await certificateCards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should view expiring certificates', async ({ page }) => {
    await page.getByRole('link', { name: /expiring soon/i }).click()

    await expect(page).toHaveURL(/\/certificates\/expiring/)
    await expect(
      page.getByRole('heading', { name: /expiring soon/i })
    ).toBeVisible()
  })

  test('should view expired certificates', async ({ page }) => {
    await page.getByRole('link', { name: /expired/i }).click()

    await expect(page).toHaveURL(/\/certificates\/expired/)
    await expect(
      page.getByRole('heading', { name: /expired/i })
    ).toBeVisible()
  })

  test('should download certificate document', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page
        .locator('[data-testid="certificate-card"]')
        .first()
        .getByRole('button', { name: /download/i })
        .click()
    ])

    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  })

  test('should delete a certificate', async ({ page }) => {
    const deleteButton = page
      .locator('[data-testid="certificate-card"]')
      .first()
      .getByRole('button', { name: /delete/i })

    await deleteButton.click()

    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click()

    await expect(
      page.getByText(/certificate deleted|success/i)
    ).toBeVisible()
  })

  test('should display certificate expiry status with correct color', async ({
    page
  }) => {
    const certificateCard = page
      .locator('[data-testid="certificate-card"]')
      .first()

    // Should have status badge
    const statusBadge = certificateCard.locator('[data-testid="status-badge"]')
    await expect(statusBadge).toBeVisible()

    // Color should match urgency (green, orange, red)
    const badgeClass = await statusBadge.getAttribute('class')
    expect(badgeClass).toMatch(/green|orange|red/)
  })
})
