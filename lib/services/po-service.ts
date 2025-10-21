import { getDb } from '../db';
import { uuid } from '../utils';
import { PO } from '../types';
import { ensureBudgetAvailable } from './budget-service';

const generatePoNumber = (existing: string[]) => {
  const numbers = existing
    .map((poNo) => {
      const match = poNo.match(/(\d+)$/);
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((value) => !Number.isNaN(value));
  const latest = numbers.length ? Math.max(...numbers) : 0;
  return `PO-2024-${(latest + 1).toString().padStart(4, '0')}`;
};

export const listPurchaseOrders = () => {
  return getDb().pos;
};

export const getPurchaseOrder = (id: string) => {
  return getDb().pos.find((po) => po.id === id) ?? null;
};

type CreatePoParams = {
  requisitionId: string;
  vendorId: string;
  quoteTotal?: number;
  currency?: string;
  terms?: string;
};

export const createPoDraft = ({ requisitionId, vendorId, quoteTotal, currency = 'IDR', terms }: CreatePoParams) => {
  const db = getDb();
  const requisition = db.requisitions.find((req) => req.id === requisitionId);
  if (!requisition) {
    throw new Error('Requisition not found');
  }

  const poNo = generatePoNumber(db.pos.map((po) => po.poNo));
  const lines = requisition.items.map((item) => ({
    requisitionItemId: item.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice
  }));

  const total = quoteTotal ?? requisition.total;

  ensureBudgetAvailable(requisition.costCenter, total, {
    excludeRequisitionIds: [requisitionId]
  });

  const po: PO = {
    id: uuid(),
    poNo,
    vendorId,
    status: 'draft',
    lines,
    total,
    currency,
    terms: terms ?? 'Standard terms',
    linkedRequisitionIds: [requisitionId],
    createdAt: new Date(),
    paymentProofs: []
  };

  db.pos.unshift(po);
  requisition.status = 'converted';
  requisition.updatedAt = new Date();

  return po;
};

export const updatePurchaseOrder = (
  id: string,
  data: {
    status?: PO['status'];
    paymentProofs?: PO['paymentProofs'];
  }
) => {
  const db = getDb();
  const po = db.pos.find((item) => item.id === id);
  if (!po) {
    throw new Error('PO not found');
  }
  if (po.status === 'closed' || po.status === 'canceled') {
    throw new Error('Closed or canceled purchase orders cannot be edited');
  }
  if (data.status) {
    po.status = data.status;
  }
  if (data.paymentProofs !== undefined) {
    po.paymentProofs = data.paymentProofs;
  }
  return po;
};
