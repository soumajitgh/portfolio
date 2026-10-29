import { expect, test } from '@playwright/test'

test.describe('Portfolio navigation', () => {
  test('connects the preserved hero to both areas and supports browser history', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toHaveText('Soumajit Ghosh')
    await page.locator('.identity-technical h2 a').click()
    await expect(page).toHaveURL(/\/technical$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Systems.')
    await page.locator('.portfolio-footer').getByRole('link', { name: 'Explore Creative' }).click()
    await expect(page).toHaveURL(/\/creative$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Images.')
    await page.goBack()
    await expect(page).toHaveURL(/\/technical$/)
    await page.goForward()
    await expect(page).toHaveURL(/\/creative$/)
    await expect(page.getByRole('link', { name: /admin/i })).toHaveCount(0)
  })
  test('renders direct mobile routes with reduced motion and no stock collections', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const route of ['/technical', '/creative']) {
      await page.goto(route)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }
    await expect(page.locator('img[src*="development-forest"]')).toHaveCount(0)
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    await expect(
      page.locator('#mobile-navigation').getByRole('link', { name: 'Creative', exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused()
    await page.goto('/creative/not-a-published-collection')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Collection not found')
  })
})
