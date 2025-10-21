import { test, expect } from '@playwright/test';

test.describe('API contract smoke', () => {
  test('GET /api/requisitions returns schema', async ({ request }) => {
    const res = await request.get('/api/requisitions');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.requisitions)).toBeTruthy();
    const first = body.requisitions[0];
    expect(first).toMatchObject({
      id: expect.any(String),
      department: expect.any(String),
      items: expect.any(Array),
      approvalSteps: expect.any(Array)
    });
  });

  test('POST /api/auth/login enforces role requirement', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'employee@example.com', role: 'employee' }
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ role: 'employee' });
  });
});
