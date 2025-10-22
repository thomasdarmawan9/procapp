import { Page, expect } from '@playwright/test';
import { getAxeResults } from 'axe-playwright';

export async function axeScan(page: Page, context: string) {
  const results = await getAxeResults(page, undefined, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    }
  });
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious, `${context} should have 0 serious/critical Axe violations`).toHaveLength(0);
  return results;
}
