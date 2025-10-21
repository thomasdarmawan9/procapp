import { Page, expect } from '@playwright/test';

export async function fillSelect(page: Page, triggerLabel: string, optionText: string) {
  await page.getByRole('button', { name: triggerLabel }).click();
  await page.getByRole('option', { name: optionText }).click();
}

export async function addLineItem(page: Page, index: number, data: { description: string; quantity: number; unitPrice: number; uom?: string; currency?: string; category?: string }) {
  const item = page.locator('[data-testid="line-item"]').nth(index);
  await item.getByLabel('Description').fill(data.description);
  await item.getByLabel('Quantity').fill(String(data.quantity));
  await item.getByLabel('Unit Price').fill(String(data.unitPrice));
  if (data.uom) await item.getByLabel('UoM').fill(data.uom);
  if (data.currency) await item.getByLabel('Currency').fill(data.currency);
  if (data.category) {
    await item.getByLabel('Category').click();
    await page.getByRole('option', { name: data.category }).click();
  }
}

export async function assertToast(page: Page, message: string) {
  await expect(page.getByRole('status').filter({ hasText: message })).toBeVisible();
}
