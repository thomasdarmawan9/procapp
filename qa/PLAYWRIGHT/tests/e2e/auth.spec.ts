import { test, expect } from '../../fixtures/test-fixtures';

const routesByRole: Record<string, string[]> = {
  employee: ['/dashboard', '/requisitions', '/requisitions/new'],
  approver: ['/dashboard', '/approvals'],
  procurement_admin: ['/dashboard', '/vendors', '/settings/approval-rules'],
  finance: ['/dashboard', '/approvals', '/pos']
};

test.describe('Auth & RBAC', () => {
  test('login works for each role and shows expected nav', async ({ page, authAs }) => {
    for (const role of Object.keys(routesByRole) as Array<keyof typeof routesByRole>) {
      await authAs(role);
      await page.goto('/dashboard');
      await expect(page.getByText('Core Procurement Management')).toBeVisible();
      for (const route of routesByRole[role]) {
        await page.goto(route);
        await expect(page).toHaveURL(new RegExp(`${route}`));
      }
    }
  });

  test('employee is blocked from settings', async ({ page, authAs }) => {
    await authAs('employee');
    await page.goto('/settings/approval-rules');
    await expect(page).toHaveURL(/dashboard/);
  });
});
