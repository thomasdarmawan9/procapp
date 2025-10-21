import { Page, expect } from '@playwright/test';
import AxeBuilder from 'axe-playwright';

export async function axeScan(page: Page, context: string) {
  const axe = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
  const results = await axe.analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious, `${context} should have 0 serious/critical Axe violations`).toHaveLength(0);
  return results;
}
