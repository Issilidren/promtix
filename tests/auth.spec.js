import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows the Promtix title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Promtix');
  });

  test('shows the GitHub login button', async ({ page }) => {
    await page.goto('/');
    const loginBtn = page.getByText('Initiate GitHub Auth');
    await expect(loginBtn).toBeVisible();
  });

  test('login button points to GitHub auth endpoint', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.locator('a[href*="/auth/github"]');
    await expect(loginLink).toBeVisible();
  });

  test('shows boot sequence terminal lines', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.font-mono').first()).toBeVisible();
  });
});

test.describe('Protected routes', () => {
  test('redirects /dashboard to landing when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });

  test('redirects /solo to landing when not logged in', async ({ page }) => {
    await page.goto('/solo');
    await expect(page).toHaveURL('/');
  });

  test('redirects /pvp to landing when not logged in', async ({ page }) => {
    await page.goto('/pvp');
    await expect(page).toHaveURL('/');
  });

  test('redirects /leaderboard to landing when not logged in', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page).toHaveURL('/');
  });

  test('redirects /shop to landing when not logged in', async ({ page }) => {
    await page.goto('/shop');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Auth callback', () => {
  test('redirects to landing on missing token', async ({ page }) => {
    await page.goto('/auth/callback');
    await expect(page).toHaveURL('/?error=auth_failed');
  });
});
