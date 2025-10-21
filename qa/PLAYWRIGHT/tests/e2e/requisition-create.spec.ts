import { test, expect } from '../../fixtures/test-fixtures';
import { assertToast } from '../../helpers/form-helpers';

function futureDate(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

test.describe('Requisition creation and submission', () => {
  test.beforeEach(async ({ authAs, seedData }) => {
    await seedData();
    await authAs('employee');
  });

  test('create valid requisition and submit for approval', async ({ page }) => {
    await page.goto('/requisitions/new');
    await page.fill('input[name="department"]', 'Technology');
    await page.fill('input[name="costCenter"]', 'IT-OPS-001');
    await page.fill('input[name="neededBy"]', futureDate(5));
    await page.fill('textarea[name="notes"]', 'Laptop refresh batch');
    await page.fill('input[name="items.0.description"]', 'Developer Laptop');
    await page.fill('input[name="items.0.quantity"]', '5');
    await page.fill('input[name="items.0.unitPrice"]', '25000000');
    await page.fill('input[name="items.0.uom"]', 'unit');

    await page.getByRole('button', { name: 'Create' }).click();
    await assertToast(page, 'Requisition created');
    await expect(page).toHaveURL(/requisitions\//);

    await page.getByRole('button', { name: 'Submit' }).click();
    await assertToast(page, 'Requisition submitted');
    await expect(page.getByText('Status')).toContainText('submitted', { ignoreCase: true });
  });

  test('quantity validation prevents zero item', async ({ page }) => {
    await page.goto('/requisitions/new');
    await page.fill('input[name="department"]', 'Finance');
    await page.fill('input[name="costCenter"]', 'FIN-100');
    await page.fill('input[name="neededBy"]', futureDate(3));
    await page.fill('input[name="items.0.description"]', 'Calculator');
    await page.fill('input[name="items.0.quantity"]', '0');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Quantity must be greater than 0')).toBeVisible();
  });
});
