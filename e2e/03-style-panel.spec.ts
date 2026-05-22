/**
 * Style panel tests — templates, accent colors, fonts, heading styles, spacing.
 * Auth state is pre-loaded by global setup.
 */

import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

async function openStylePanel(page: Page) {
  await page.goto(`${BASE}/dashboard`);
  const resumeLink = page.locator('a[href*="/resume/"]').first();
  if (await resumeLink.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await resumeLink.click();
  } else {
    await page.getByRole('button', { name: /new resume|create resume|build resume/i }).first().click();
  }
  await page.waitForURL('**/resume/**', { timeout: 20_000 });
  await expect(page.locator('#resume-page')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Style' }).click();
  await expect(page.getByText('Quick Start')).toBeVisible({ timeout: 5_000 });
}

test.describe('Style Panel', () => {

  test.beforeEach(async ({ page }) => {
    await openStylePanel(page);
  });

  // ── Quick Start presets ───────────────────────────────────────────────────

  test('6 Quick Start preset cards are rendered', async ({ page }) => {
    // Preset cards are flex/grid buttons with a colour swatch div + text block
    const presets = page.locator('.grid > button').filter({ hasText: /classic|modern|minimal|executive|technical|creative/i });
    await expect(presets).toHaveCount(6, { timeout: 5_000 });
  });

  test('clicking Classic preset keeps preview visible', async ({ page }) => {
    const presets = page.locator('.grid > button').filter({ hasText: /classic/i }).first();
    await presets.click();
    await expect(page.locator('#resume-page')).toBeVisible();
  });

  test('clicking Modern preset keeps preview visible', async ({ page }) => {
    const presets = page.locator('.grid > button').filter({ hasText: /modern/i }).first();
    await presets.click();
    await expect(page.locator('#resume-page')).toBeVisible();
  });

  // ── Layout template ───────────────────────────────────────────────────────

  test('three layout template buttons exist: Classic, Modern, Minimal', async ({ page }) => {
    // The Layout section contains exactly 3 flex-1 py-2 rounded-xl buttons
    // Those buttons have class `rounded-xl` (the preset cards use `rounded-xl` too,
    // but the Layout buttons also have `py-2` and no child div/img inside)
    const layoutButtons = page.locator('div').filter({ hasText: /^Layout$/ })
      .locator('..').locator('button.rounded-xl');
    await expect(layoutButtons).toHaveCount(3, { timeout: 5_000 });
  });

  test('switching layout templates keeps preview alive', async ({ page }) => {
    const layoutButtons = page.locator('div').filter({ hasText: /^Layout$/ })
      .locator('..').locator('button.rounded-xl');
    // modern
    await layoutButtons.nth(1).click();
    await expect(page.locator('#resume-page')).toBeVisible();
    // minimal
    await layoutButtons.nth(2).click();
    await expect(page.locator('#resume-page')).toBeVisible();
    // classic
    await layoutButtons.nth(0).click();
    await expect(page.locator('#resume-page')).toBeVisible();
  });

  // ── Accent colors ─────────────────────────────────────────────────────────

  test('12 accent colour swatches are rendered', async ({ page }) => {
    const swatches = page.locator('button.rounded-full[style*="background"]');
    await expect(swatches).toHaveCount(12, { timeout: 5_000 });
  });

  test('clicking a swatch updates accent; preview stays visible', async ({ page }) => {
    const swatches = page.locator('button.rounded-full[style*="background"]');
    // Click violet (#7c3aed, index 1)
    await swatches.nth(1).click();
    await expect(page.locator('#resume-page')).toBeVisible();
    // Click emerald (#059669, index 2)
    await swatches.nth(2).click();
    await expect(page.locator('#resume-page')).toBeVisible();
  });

  test('hex text input accepts a value and updates the colour picker', async ({ page }) => {
    const hexInput = page.locator('input[placeholder="#2563eb"]');
    await hexInput.fill('#e11d48');
    await hexInput.press('Enter');
    await expect(hexInput).toHaveValue('#e11d48');
  });

  // ── Font picker ───────────────────────────────────────────────────────────

  test('Sans / Serif / Mono tabs are all visible', async ({ page }) => {
    // Use exact: true to avoid matching font names that contain "Sans" / "Serif"
    await expect(page.getByRole('button', { name: 'Sans', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Serif', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mono', exact: true })).toBeVisible();
  });

  test('Serif tab shows serif font options', async ({ page }) => {
    await page.getByRole('button', { name: 'Serif', exact: true }).click();
    await expect(page.getByRole('button', { name: /lora|merriweather|playfair|georgia|garamond/i }).first()).toBeVisible();
  });

  test('Mono tab shows monospace font options', async ({ page }) => {
    await page.getByRole('button', { name: 'Mono', exact: true }).click();
    await expect(page.getByRole('button', { name: /jetbrains|fira code|ibm plex mono/i }).first()).toBeVisible();
  });

  test('selecting Lora font updates preview font-family to Lora', async ({ page }) => {
    await page.getByRole('button', { name: 'Serif', exact: true }).click();
    await page.getByRole('button', { name: /^lora$/i }).click();
    const fontFamily = await page.locator('#resume-page').evaluate(
      el => (el as HTMLElement).style.fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('lora');
  });

  test('selecting Inter restores sans-serif font in preview', async ({ page }) => {
    await page.getByRole('button', { name: 'Sans', exact: true }).click();
    await page.getByRole('button', { name: 'Inter', exact: true }).click();
    const fontFamily = await page.locator('#resume-page').evaluate(
      el => (el as HTMLElement).style.fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('inter');
  });

  // ── Spacing sliders ───────────────────────────────────────────────────────

  test('5 spacing sliders render with labels', async ({ page }) => {
    await expect(page.getByText('Font Size')).toBeVisible();
    await expect(page.getByText('Line Height')).toBeVisible();
    await expect(page.getByText('Left & Right Margin')).toBeVisible();
    await expect(page.getByText('Top & Bottom Margin')).toBeVisible();
    await expect(page.getByText('Space Between Entries')).toBeVisible();
  });

  test('each slider has + and − buttons (5 of each)', async ({ page }) => {
    await expect(page.locator('button', { hasText: '+' })).toHaveCount(5);
    await expect(page.locator('button', { hasText: '−' })).toHaveCount(5);
  });

  test('clicking + on Font Size increases the displayed value', async ({ page }) => {
    const valueLabel = page.locator('span.tabular-nums').first();
    const before = await valueLabel.textContent();
    await page.locator('button', { hasText: '+' }).first().click();
    const after = await valueLabel.textContent();
    expect(after).not.toBe(before);
  });

  test('clicking − on Font Size decreases the displayed value', async ({ page }) => {
    const valueLabel = page.locator('span.tabular-nums').first();
    const before = await valueLabel.textContent();
    await page.locator('button', { hasText: '−' }).first().click();
    const after = await valueLabel.textContent();
    expect(after).not.toBe(before);
  });

  // ── Section heading styles ────────────────────────────────────────────────

  test('8 heading style buttons are rendered in a grid', async ({ page }) => {
    // h-12 buttons are the style picker tiles
    await expect(page.locator('button.h-12')).toHaveCount(8, { timeout: 5_000 });
  });

  test('clicking each heading style keeps preview visible', async ({ page }) => {
    const tiles = page.locator('button.h-12');
    for (let i = 0; i < 8; i++) {
      await tiles.nth(i).click();
      await expect(page.locator('#resume-page')).toBeVisible();
    }
  });

  test('3 capitalization options are present: Normal / Capitalize / UPPERCASE', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Aa Normal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aa Capitalize' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AA UPPERCASE' })).toBeVisible();
  });

  test('heading size buttons XS / S / M / L all present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'XS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'S' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'M' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'L' })).toBeVisible();
  });

  test('selecting heading size L makes headings larger in preview', async ({ page }) => {
    const preview = page.locator('#resume-page');
    await page.getByRole('button', { name: 'S' }).click();
    const sizeS = await preview.locator('div[style*="font-weight: 800"]').first().evaluate(
      el => parseFloat(getComputedStyle(el).fontSize)
    );
    await page.getByRole('button', { name: 'L' }).click();
    const sizeL = await preview.locator('div[style*="font-weight: 800"]').first().evaluate(
      el => parseFloat(getComputedStyle(el).fontSize)
    );
    expect(sizeL).toBeGreaterThan(sizeS);
  });

  // ── Page size ─────────────────────────────────────────────────────────────

  test('A4 and US Letter page size buttons exist', async ({ page }) => {
    await expect(page.getByRole('button', { name: /a4/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /letter/i })).toBeVisible();
  });

  test('switching to US Letter changes the preview width', async ({ page }) => {
    const widthBefore = await page.locator('#resume-page').evaluate(el => el.getBoundingClientRect().width);
    await page.getByRole('button', { name: /us letter/i }).click();
    const widthAfter = await page.locator('#resume-page').evaluate(el => el.getBoundingClientRect().width);
    expect(widthAfter).not.toBe(widthBefore);
  });

});
