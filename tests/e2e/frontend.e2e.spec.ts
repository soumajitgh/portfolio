import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('renders the portfolio without exposing admin navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('Soumajit Ghosh – Fullstack Developer')
    await expect(page.locator('h1').first()).toContainText('Your request')
    await expect(
      page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', {
        name: './admin',
      }),
    ).toHaveCount(0)
  })

  test('shows a return-home link on missing and retired pages', async ({ page }) => {
    for (const path of ['/missing/page', '/blog/old-post', '/blogs', '/blogs/old-post', '/rss.xml']) {
      const response = await page.goto(path)

      expect(response?.status()).toBe(404)
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Return to home' })).toHaveAttribute('href', '/')
    }

    await page.getByRole('link', { name: 'Return to home' }).click()
    await expect(page).toHaveURL('/')
  })
})
