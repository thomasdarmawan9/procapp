import { test, expect } from '../../fixtures/test-fixtures';
import { assertToast } from '../../helpers/form-helpers';

async function getApprovedRequisition(page: import('@playwright/test').Page) {
  const response = await page.request.get('/api/requisitions');
  const { requisitions } = await response.json();
  const approved = requisitions.find((req: any) => req.status === 'approved');
  if (!approved) throw new Error('No approved requisition found. Seed data missing.');
  return approved;
}

test.describe('RFQ flow', () => {
  test.beforeEach(async ({ seedData, authAs }) => {
    await seedData();
    await authAs('procurement_admin');
  });

  test('create RFQ from approved requisition and send', async ({ page }) => {
    const approved = await getApprovedRequisition(page);
    await page.goto(`/rfqs/new?fromReqId=${approved.id}`);
    await expect(page).toHaveURL(/rfqs\/new/);
    await page.getByRole('checkbox').first().check();
    await page.fill('input[name="dueDate"]', approved.neededBy.split('T')[0]);
    await page.fill('input[name="dueDate"]', new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
    await page.getByRole('button', { name: 'Create RFQ' }).click();
    await assertToast(page, 'RFQ created');
    await expect(page).toHaveURL(/rfqs\//);
    await page.getByRole('button', { name: 'Send RFQ' }).click();
    await assertToast(page, 'RFQ sent');
  });

  test('must select at least one vendor', async ({ page }) => {
    const approved = await getApprovedRequisition(page);
    await page.goto(`/rfqs/new?fromReqId=${approved.id}`);
    for (const checkbox of await page.getByRole('checkbox').all()) {
      await checkbox.uncheck();
    }
    await page.getByRole('button', { name: 'Create RFQ' }).click();
    await expect(page.getByText('Select at least one vendor')).toBeVisible();
  });
});
