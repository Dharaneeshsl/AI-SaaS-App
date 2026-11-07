import { test, expect } from '@playwright/test'

test('generate, download, publish, like, unpublish and delete a saved result', async ({ page }) => {
  await page.goto('/ai/blogtitle')
  await expect(page.getByRole('heading', { name: 'Blog Title Generator' })).toBeVisible()
  await page.getByLabel('Keyword').fill('Browser regression keyword')
  await page.getByRole('button', { name: 'Generate titles' }).click()
  await expect(page.locator('pre')).toContainText('Browser regression keyword')
  await expect(page.getByText('Demo sample', { exact: true })).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download result' }).click()
  expect((await download).suggestedFilename()).toBe('title.txt')
  await page.getByRole('button', { name: 'Publish to community' }).click()
  await expect(page.getByText('Published to the community')).toBeVisible()
  await page.goto('/ai/community')
  await page.getByRole('button', { name: '0 likes' }).click()
  await expect(page.getByRole('button', { name: '1 likes' })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/ai')
  await page.getByText('View full result').click()
  await expect(page.locator('pre')).toContainText('Browser regression keyword')
  await page.getByRole('button', { name: 'Unpublish', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Publish to community' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm delete' }).click()
  await expect(page.getByText('Ready for your next creation')).toBeVisible()
})

test('unknown pages offer a working home link', async ({ page }) => {
  await page.goto('/missing-page')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  await page.getByRole('link', { name: 'Return home' }).click()
  await expect(page.getByRole('button', { name: 'Start creating now' })).toBeVisible()
})

test('navigation, sidebar links, landing pricing plans, and redirects work seamlessly', async ({ page }) => {
  // Check landing page pricing
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Choose Your Plan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Free Plan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pro Plan' })).toBeVisible()

  // Test redirect from /dashboard to /ai
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Use sidebar navigation to go to Community
  await page.getByText('Community', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible()

  // Use sidebar navigation to go to AI Article Writer
  await page.getByText('AI Article Writer', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'AI Article Writer' })).toBeVisible()

  // Use Top Navbar "Home" button
  await page.getByRole('button', { name: 'Home' }).click()
  await expect(page.getByRole('button', { name: 'Start creating now' })).toBeVisible()
})
