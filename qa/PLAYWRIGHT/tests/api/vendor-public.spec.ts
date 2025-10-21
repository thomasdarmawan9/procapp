import { test, expect } from '@playwright/test';

const parseCaptcha = (question: string) => {
  const match = question.match(/(\d+)\s*\+\s*(\d+)/);
  if (!match) {
    throw new Error('Unable to parse captcha question');
  }
  return Number(match[1]) + Number(match[2]);
};

test.describe('Public vendor quote submission', () => {
  test('allows vendor to submit quote without authentication', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: { email: 'procurement@example.com', role: 'procurement_admin' }
    });
    const rfqsRes = await request.get('/api/rfqs');
    const { rfqs } = await rfqsRes.json();
    const target = rfqs.find((rfq: any) => rfq.rfqNo === 'RFQ-2024-010');
    expect(target, 'Seeded RFQ should exist').toBeTruthy();

    const publicRes = await request.get(`/api/public/rfqs/${target.id}`);
    expect(publicRes.ok()).toBeTruthy();
    const publicData = await publicRes.json();
    const answer = parseCaptcha(publicData.captcha.question);

    const payload = {
      vendorName: 'Automation Vendor',
      vendorEmail: 'automation@example.com',
      vendorCompany: 'Automation Inc.',
      paymentTerms: '45 days',
      shipping: 250000,
      taxes: 550000,
      notes: 'Automation test quote',
      captchaId: publicData.captcha.id,
      captchaAnswer: answer,
      items: publicData.rfq.requisition.items.map((item: any, index: number) => ({
        requisitionItemId: item.id,
        unitPrice: 1500000 + index * 250000,
        currency: item.currency,
        leadTimeDays: 10 + index,
        notes: 'Automation submission'
      }))
    };

    const submitRes = await request.post(`/api/public/rfqs/${target.id}`, {
      data: payload
    });
    expect(submitRes.status()).toBe(201);
    const submitJson = await submitRes.json();
    expect(submitJson.success).toBeTruthy();
    expect(submitJson.quote.vendorEmail).toBe('automation@example.com');
  });
});
