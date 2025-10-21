import { test, expect } from '../../fixtures/test-fixtures';
import { assertToast } from '../../helpers/form-helpers';

function futureRuleName() {
  return `QA Rule ${Date.now()}`;
}

test.describe('Approval rules management', () => {
  test.beforeEach(async ({ seedData, authAs }) => {
    await seedData();
    await authAs('procurement_admin');
  });

  test('create approval rule with amount threshold', async ({ page }) => {
    const ruleName = futureRuleName();
    await page.goto('/settings/approval-rules');
    await page.getByRole('button', { name: 'New Rule' }).click();
    const sheet = page.locator('[role=\"dialog\"]').first();
    await sheet.locator('input').first().fill(ruleName);
    await sheet.locator('input[type=\"number\"]').first().fill('100000000');
    await sheet.getByRole('button', { name: 'Add Step' }).click();
    await sheet.getByRole('button', { name: 'Save' }).click();
    await assertToast(page, 'Rule created');
    await expect(page.getByText(ruleName)).toBeVisible();
  });

  test('rule must specify at least one condition', async ({ page }) => {
    await page.goto('/settings/approval-rules');
    await page.getByRole('button', { name: 'New Rule' }).click();
    const sheet = page.locator('[role=\"dialog\"]').first();
    await sheet.locator('input').first().fill('Invalid Rule');
    await sheet.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Specify at least one condition')).toBeVisible();
  });
});
