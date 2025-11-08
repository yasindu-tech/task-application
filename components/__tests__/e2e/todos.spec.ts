import { test, expect } from '@playwright/test'

// Playwright E2E: login -> add todo -> complete todo
// Notes / assumptions:
// - The app is running (dev server) and Playwright baseURL is configured, or run with the full URL.
// - Test credentials exist: replace EMAIL/PASSWORD below with a working test account for your environment.
// - Selectors used are intentionally generic (role-based). Update them to match the real app if needed.

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'password123'

test.beforeEach(async ({ page }) => {
  // Visit the login page before each test
  await page.goto('/login')
})

test('user logs in, creates a todo and marks it complete', async ({ page }) => {
  // 1) Fill login form
  await page.fill('input[name="email"]', TEST_EMAIL)
  await page.fill('input[name="password"]', TEST_PASSWORD)

  // Submit and wait for redirect to /task or /tasks
  await Promise.all([
    page.waitForURL(/\/task(s)?/),
    page.click('button[type="submit"]')
  ])

  // Be tolerant of /task or /tasks
  await expect(page).toHaveURL(/\/task(s)?/)

  // 2) Add a new todo named "Buy milk"
  // Use a role-based selector for the text box (robust across markup variations)
  const textbox = page.getByRole('textbox')
  await textbox.fill('Buy milk')

  // Click an Add/Create button (match common button text)
  await page.getByRole('button', { name: /add|create|new task/i }).click()

  // 3) Verify the new task appears in the list
  const taskLocator = page.getByText('Buy milk')
  await expect(taskLocator).toBeVisible()

  // 4) Mark the todo as done: locate the task's checkbox and check it
  // We walk to the task's parent and then find a checkbox inside it.
  const taskParent = taskLocator.locator('..')
  const checkbox = taskParent.getByRole('checkbox')
  await checkbox.check()

  // Verify the checkbox is checked (task visually completed)
  await expect(checkbox).toBeChecked()

  // Optionally: assert the task text shows a completion style (app-specific).
  // If your app toggles a class like "completed" you can assert it here, e.g.:
  // await expect(taskParent).toHaveClass(/completed|done/)
})
