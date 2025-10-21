import { test } from '../../fixtures/test-fixtures';
import { axeScan } from '../utils/axe';

test.describe('Accessibility scans', () => {
  test.beforeEach(async ({ authAs }) => {
    await authAs('employee');
  });

  test('dashboard has no serious Axe violations', async ({ page }) => {
    await page.goto('/dashboard');
    await axeScan(page, 'Dashboard');
  });

  test('requisition create form passes Axe', async ({ page }) => {
    await page.goto('/requisitions/new');
    await axeScan(page, 'Requisition Create');
  });
});
