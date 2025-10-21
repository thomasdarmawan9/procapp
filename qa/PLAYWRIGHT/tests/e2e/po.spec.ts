import { test, expect } from '../../fixtures/test-fixtures';
import { assertToast } from '../../helpers/form-helpers';

async function getReceivedRfq(page: import('@playwright/test').Page) {
  const response = await page.request.get('/api/rfqs');
  const { rfqs } = await response.json();
  const received = rfqs.find((r: any) => r.status === 'received');
  if (!received) throw new Error('No RFQ with received status available.');
  return received;
}

async function vendorName(page: import('@playwright/test').Page, vendorId: string) {
  const res = await page.request.get('/api/vendors');
  const { vendors } = await res.json();
  const vendor = vendors.find((v: any) => v.id === vendorId);
  return vendor?.name ?? vendorId;
}

test.describe('Purchase Order management', () => {
  test.beforeEach(async ({ seedData, authAs }) => {
    await seedData();
    await authAs('procurement_admin');
  });

  test('select RFQ winner creates PO draft and status reflects issued after API update', async ({ page }) => {
    const rfq = await getReceivedRfq(page);
    await page.goto(`/rfqs/${rfq.id}`);
    await expect(page.getByRole('heading', { name: rfq.rfqNo })).toBeVisible();
    await page.getByRole('combobox').first().click();
    const firstVendor = await vendorName(page, rfq.vendorIds[0]);
    await page.getByRole('option', { name: firstVendor }).first().click();
    await page.getByRole('button', { name: 'Create PO Draft' }).click();
    await assertToast(page, 'PO draft created');

    await page.goto('/pos');
    await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible();
    const firstLink = await page.getByRole('link').first();
    const href = await firstLink.getAttribute('href');
    await firstLink.click();
    expect(href).toBeTruthy();
    if (href) {
      await page.request.put(`/api/pos/${href.split('/').pop()}`, { data: { status: 'issued' } });
      await page.reload();
      await expect(page.getByText('Status')).toContainText('issued', { ignoreCase: true });
    }
  });
});
