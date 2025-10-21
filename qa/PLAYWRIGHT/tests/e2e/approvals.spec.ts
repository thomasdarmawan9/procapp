import { test, expect } from '../../fixtures/test-fixtures';
import { assertToast } from '../../helpers/form-helpers';

async function openFirstApproval(page: import('@playwright/test').Page) {
  await page.goto('/approvals');
  await expect(page.getByRole('heading', { name: 'Pending Approvals' })).toBeVisible();
}

test.describe('Approvals workflow', () => {
  test.beforeEach(async ({ seedData, authAs }) => {
    await seedData();
    await authAs('approver');
  });

  test('approver can approve requisition and timeline updates', async ({ page }) => {
    await openFirstApproval(page);
    const firstRow = page.getByRole('row').nth(1);
    await firstRow.getByRole('link').first().click();
    await expect(page).toHaveURL(/requisitions\//);
    await page.getByRole('button', { name: 'Approve' }).click();
    await assertToast(page, 'Action recorded');
    await expect(page.getByText('Status')).toContainText('approved', { ignoreCase: true });
  });

  test('approver can return with comment', async ({ page }) => {
    await openFirstApproval(page);
    const firstRow = page.getByRole('row').nth(1);
    await firstRow.getByRole('link').first().click();
    await page.getByRole('button', { name: 'Return' }).click();
    await page.getByPlaceholder('Provide a reason').fill('Need additional justification');
    await page.getByRole('button', { name: 'Return', exact: true }).click();
    await assertToast(page, 'Action recorded');
    await expect(page.getByText('Status')).toContainText('draft', { ignoreCase: true });
  });
});
