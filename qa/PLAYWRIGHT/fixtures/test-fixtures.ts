import { test as base, expect, APIRequestContext, Page } from '@playwright/test';

type Role = 'employee' | 'approver' | 'procurement_admin' | 'finance';

type TestFixtures = {
  authAs: (role: Role) => Promise<void>;
  seedData: () => Promise<void>;
  mockApi: (handler: (route: import('@playwright/test').Route) => Promise<void>) => Promise<void>;
};

const roleEmailMap: Record<Role, string> = {
  employee: 'employee@example.com',
  approver: 'approver@example.com',
  procurement_admin: 'procurement@example.com',
  finance: 'finance@example.com'
};

async function login(request: APIRequestContext, role: Role) {
  const response = await request.post('/api/auth/login', {
    data: {
      email: roleEmailMap[role],
      role
    }
  });
  expect(response.ok()).toBeTruthy();
}

export const test = base.extend<TestFixtures>({
  authAs: async ({ page, request }, use) => {
    await use(async (role: Role) => {
      await login(request, role);
      await page.context().addCookies([
        {
          name: 'proc-session',
          value: role === 'employee' ? 'user-employee' : role === 'approver' ? 'user-approver' : role === 'finance' ? 'user-finance' : 'user-procurement',
          url: page.context()._options.baseURL || 'http://localhost:3000'
        }
      ]);
    });
  },
  seedData: async ({ request }, use) => {
    await use(async () => {
      await request.get('/api/requisitions');
      await request.get('/api/vendors');
      await request.get('/api/rfqs');
      await request.get('/api/pos');
    });
  },
  mockApi: async ({ page }, use) => {
    await use(async (handler) => {
      await page.route('**/api/**', handler);
    });
  }
});

export const expectExt = expect;
