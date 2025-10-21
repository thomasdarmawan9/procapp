import { describe, expect, it } from 'vitest';
import { vendorFormSchema, requisitionFormSchema, rfqFormSchema } from '@/lib/schemas';

describe('vendorFormSchema', () => {
  it('accepts valid vendor data', () => {
    const parsed = vendorFormSchema.parse({
      name: 'Acme Supplies',
      email: 'sales@acme.com',
      phone: '+62-21-222-111',
      category: 'IT',
      rating: 4,
      address: 'Jakarta',
      taxId: '123',
      isActive: true
    });
    expect(parsed.name).toBe('Acme Supplies');
  });

  it('rejects rating outside range', () => {
    expect(() =>
      vendorFormSchema.parse({
        name: 'Bad Vendor',
        email: 'bad@example.com',
        phone: '12345',
        category: 'IT',
        rating: 7,
        address: 'Jakarta',
        taxId: '123',
        isActive: true
      })
    ).toThrowError();
  });
});

describe('requisitionFormSchema', () => {
  it('requires at least one item', () => {
    expect(() =>
      requisitionFormSchema.parse({
        department: 'IT',
        costCenter: 'IT-001',
        neededBy: new Date(),
        notes: 'Test',
        items: [],
        attachments: []
      })
    ).toThrowError();
  });

  it('accepts valid requisition', () => {
    const result = requisitionFormSchema.parse({
      department: 'IT',
      costCenter: 'IT-001',
      neededBy: new Date(),
      notes: 'Urgent',
      attachments: [],
      items: [
        {
          description: 'Laptop',
          quantity: 5,
          uom: 'unit',
          unitPrice: 1000,
          currency: 'IDR',
          category: 'IT'
        }
      ]
    });
    expect(result.items).toHaveLength(1);
  });
});

describe('rfqFormSchema', () => {
  it('requires future due date', () => {
    expect(() =>
      rfqFormSchema.parse({
        requisitionId: '1',
        vendorIds: ['2'],
        dueDate: new Date(Date.now() - 60 * 1000)
      })
    ).toThrowError();
  });
});
