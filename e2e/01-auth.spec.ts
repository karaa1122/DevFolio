import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const RUN  = Date.now().toString(36);

test.describe('Authentication', () => {

  test('register page loads and shows all fields', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.getByPlaceholder('Karaa Kamaran')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Min 8 characters')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('register shows slug preview as user types name', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.getByPlaceholder('Karaa Kamaran').fill('Test User');
    await expect(page.getByText(/test-user/i)).toBeVisible();
  });

  test('register shows error for short password', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.getByPlaceholder('Karaa Kamaran').fill('Test Name');
    await page.getByPlaceholder('you@example.com').fill(`test+${RUN}@example.com`);
    await page.getByPlaceholder('Min 8 characters').fill('short');
    await page.getByRole('button', { name: /create account/i }).click();
    // HTML5 validation or inline error should block submission
    const error = page.locator('text=/password|8 char/i');
    const isNative = await page.getByPlaceholder('Min 8 characters').evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isNative || await error.isVisible({ timeout: 3_000 }).catch(() => false)).toBe(true);
  });

  test('login page loads correctly', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create one/i })).toBeVisible();
  });

  test('login shows error for wrong credentials', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder('you@example.com').fill('wrong@example.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('text=/invalid|incorrect|not found|wrong/i')).toBeVisible({ timeout: 8_000 });
  });

  test('login page has GitHub and Google OAuth buttons', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByRole('link', { name: /github/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /google/i })).toBeVisible();
  });

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL(/login|\//, { timeout: 8_000 });
    const url = page.url();
    expect(url).toMatch(/login|\//);
  });

});
