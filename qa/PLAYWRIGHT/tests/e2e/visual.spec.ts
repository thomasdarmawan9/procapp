import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Visual baselines', () => {
  test.beforeEach(async ({ authAs }) => {
    await authAs('employee');
  });

  test('dashboard layout', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('requisition detail', async ({ page }) => {
    await page.goto('/requisitions');
    await page.getByRole('link').first().click();
    await expect(page).toHaveScreenshot('requisition-detail.png', { fullPage: true, maxDiffPixels: 5000 });
  });
});
