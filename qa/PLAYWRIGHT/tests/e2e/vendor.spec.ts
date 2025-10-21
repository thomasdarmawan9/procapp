import { test, expect } from '../../fixtures/test-fixtures';
import { assertToast } from '../../helpers/form-helpers';

test.describe('Vendor management', () => {
  test.beforeEach(async ({ seedData, authAs }) => {
    await seedData();
    await authAs('procurement_admin');
  });

  test('create vendor with valid data', async ({ page }) => {
    await page.goto('/vendors');
    await page.getByRole('button', { name: 'Add Vendor' }).click();
    await page.fill('input[name="name"]', 'QA Supplies');
    await page.fill('input[name="email"]', 'qa@supplies.id');
    await page.fill('input[name="phone"]', '+62-21-1234567');
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'IT' }).click();
    await page.fill('input[name="rating"]', '4');
    await page.fill('input[name="address"]', 'Jakarta');
    await page.fill('input[name="taxId"]', '12.345.678');
    await page.getByRole('button', { name: 'Save' }).click();
    await assertToast(page, 'Vendor created');
    await expect(page.getByText('QA Supplies')).toBeVisible();
  });

  test('duplicate vendor name is rejected', async ({ page }) => {
    await page.goto('/vendors');
    await page.getByRole('button', { name: 'Add Vendor' }).click();
    await page.fill('input[name="name"]', 'Nusantara Tech Supplies');
    await page.fill('input[name="email"]', 'dup@vendor.id');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('already exists', { exact: false })).toBeVisible();
  });
});
