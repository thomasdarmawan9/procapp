import { describe, expect, it, beforeEach } from 'vitest';
import { resetDb, getDb } from '@/lib/db';
import { createRequisition, evaluateApprovalSteps, submitRequisition, processApproval, getPendingApprovalStep } from '@/lib/services/requisition-service';

beforeEach(() => {
  resetDb();
});

describe('approval workflow', () => {
  it('builds steps based on amount threshold', () => {
    const db = getDb();
    const requisition = createRequisition(
      {
        department: 'IT',
        costCenter: 'IT-OPS-001',
        neededBy: new Date(),
        notes: '',
        attachments: [],
        items: [
          {
            description: 'Servers',
            quantity: 10,
            uom: 'unit',
            unitPrice: 15000000,
            currency: 'IDR',
            category: 'IT'
          }
        ]
      },
      db.users[0]
    );

    const steps = evaluateApprovalSteps(requisition);
    expect(steps).toEqual([
      { order: 1, role: 'approver' },
      { order: 2, role: 'finance' }
    ]);
  });

  it('transitions to approved after all steps pass', () => {
    const db = getDb();
    const requisition = createRequisition(
      {
        department: 'IT',
        costCenter: 'IT-OPS-001',
        neededBy: new Date(),
        notes: '',
        attachments: [],
        items: [
          {
            description: 'Laptops',
            quantity: 5,
            uom: 'unit',
            unitPrice: 25000000,
            currency: 'IDR',
            category: 'IT'
          }
        ]
      },
      db.users[0]
    );

    submitRequisition(requisition.id, db.users[0]);
    const firstStep = getPendingApprovalStep(requisition);
    expect(firstStep?.role).toBe('approver');

    processApproval(requisition.id, db.users.find((user) => user.role === 'approver')!, 'approved');
    const secondStep = getPendingApprovalStep(requisition);
    expect(secondStep?.role).toBe('finance');

    processApproval(requisition.id, db.users.find((user) => user.role === 'finance')!, 'approved');
    expect(requisition.status).toBe('approved');
  });
});
