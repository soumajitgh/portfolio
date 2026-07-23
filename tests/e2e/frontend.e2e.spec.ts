import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('renders the portfolio without exposing admin navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('soumajit ghosh')
    await expect(page.locator('h1').first()).toContainText('Your request')
    await expect(
      page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', {
        name: './admin',
      }),
    ).toHaveCount(0)
  })
})
