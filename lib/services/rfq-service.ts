import { z } from 'zod';
import { getDb } from '../db';
import { rfqFormSchema, quoteSchema, vendorQuoteSubmissionSchema } from '../schemas';
import { uuid } from '../utils';
import { RFQ, User } from '../types';
import { createPoDraft } from './po-service';
import { validateCaptcha } from '../captcha';

type RfqFormInput = z.infer<typeof rfqFormSchema>;
type VendorQuoteInput = z.infer<typeof vendorQuoteSubmissionSchema>;

const generateRfqNumber = (existing: string[]) => {
  const numbers = existing
    .map((value) => {
      const match = value.match(/(\d+)$/);
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((value) => !Number.isNaN(value));
  const latest = numbers.length ? Math.max(...numbers) : 0;
  return `RFQ-2024-${(latest + 1).toString().padStart(3, '0')}`;
};

export const listRfqs = () => getDb().rfqs;

export const getRfqById = (id: string) => getDb().rfqs.find((rfq) => rfq.id === id) ?? null;

const findRfqByIdentifier = (identifier: string) => {
  const normalized = identifier.toLowerCase();
  return (
    getDb().rfqs.find(
      (rfq) => rfq.id.toLowerCase() === normalized || rfq.rfqNo.toLowerCase() === normalized
    ) ?? null
  );
};

export const createRfq = (input: RfqFormInput, user: User) => {
  const parsed = rfqFormSchema.parse(input);
  if (!['procurement_admin', 'approver'].includes(user.role)) {
    throw new Error('Only approver or procurement admin can create RFQ');
  }
  const db = getDb();
  const requisition = db.requisitions.find((req) => req.id === parsed.requisitionId);
  if (!requisition) {
    throw new Error('Requisition not found');
  }
  if (requisition.status !== 'approved' && requisition.status !== 'converted') {
    throw new Error('Only approved requisitions can be converted to RFQ');
  }
  const rfqNo = generateRfqNumber(db.rfqs.map((item) => item.rfqNo));
  const rfq: RFQ = {
    id: uuid(),
    rfqNo,
    requisitionId: parsed.requisitionId,
    vendorIds: parsed.vendorIds,
    status: 'draft',
    quotes: [],
    dueDate: parsed.dueDate,
    createdAt: new Date()
  };
  db.rfqs.unshift(rfq);
  return rfq;
};

export const updateRfq = (id: string, data: Partial<RFQ>) => {
  const db = getDb();
  const rfq = db.rfqs.find((item) => item.id === id);
  if (!rfq) {
    throw new Error('RFQ not found');
  }
  if (data.quotes) {
    rfq.quotes = data.quotes.map((quote) => quoteSchema.parse(quote));
  }
  if (data.status) {
    rfq.status = data.status;
  }
  if (data.dueDate) {
    rfq.dueDate = data.dueDate;
  }
  return rfq;
};

export const sendRfq = (id: string) => {
  const db = getDb();
  const rfq = db.rfqs.find((item) => item.id === id);
  if (!rfq) {
    throw new Error('RFQ not found');
  }
  rfq.status = 'sent';
  return rfq;
};

type CloseParams = {
  winnerVendorId: string;
};

export const closeRfq = (id: string, params: CloseParams) => {
  const db = getDb();
  const rfq = db.rfqs.find((item) => item.id === id);
  if (!rfq) {
    throw new Error('RFQ not found');
  }
  if (!rfq.vendorIds.includes(params.winnerVendorId)) {
    throw new Error('Winner must be part of RFQ vendors');
  }
  const quote = rfq.quotes.find((item) => item.vendorId === params.winnerVendorId);
  const requisition = db.requisitions.find((req) => req.id === rfq.requisitionId);
  rfq.status = 'closed';
  if (requisition) {
    createPoDraft({
      requisitionId: requisition.id,
      vendorId: params.winnerVendorId,
      quoteTotal: quote?.total ?? requisition.total,
      currency: quote?.items[0]?.currency ?? 'IDR',
      terms: quote?.paymentTerms
    });
  }
  return rfq;
};

export const createPoFromRfq = (id: string, vendorId: string) => {
  const rfq = getRfqById(id);
  if (!rfq) {
    throw new Error('RFQ not found');
  }
  const quote = rfq.quotes.find((item) => item.vendorId === vendorId);
  return createPoDraft({
    requisitionId: rfq.requisitionId,
    vendorId,
    quoteTotal: quote?.total,
    currency: quote?.items[0]?.currency,
    terms: quote?.paymentTerms
  });
};

export const getRfqPublicView = (identifier: string) => {
  const db = getDb();
  const rfq = findRfqByIdentifier(identifier);
  if (!rfq) {
    return null;
  }
  const requisition = db.requisitions.find((req) => req.id === rfq.requisitionId);
  if (!requisition) {
    return null;
  }
  return {
    id: rfq.id,
    rfqNo: rfq.rfqNo,
    status: rfq.status,
    dueDate: rfq.dueDate,
    requisition: {
      id: requisition.id,
      department: requisition.department,
      neededBy: requisition.neededBy,
      items: requisition.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        uom: item.uom,
        currency: item.currency,
        category: item.category
      }))
    }
  };
};

export const submitVendorQuote = (rfqId: string, rawInput: VendorQuoteInput) => {
  const parsed = vendorQuoteSubmissionSchema.parse(rawInput);
  if (!validateCaptcha(parsed.captchaId, parsed.captchaAnswer)) {
    throw new Error('Invalid captcha response');
  }
  const db = getDb();
  const rfq = findRfqByIdentifier(rfqId);
  if (!rfq) {
    throw new Error('RFQ not found');
  }
  if (rfq.status === 'closed') {
    throw new Error('RFQ already closed');
  }
  const requisition = db.requisitions.find((req) => req.id === rfq.requisitionId);
  if (!requisition) {
    throw new Error('Linked requisition not found');
  }

  const normalizedVendorEmail = parsed.vendorEmail.toLowerCase();
  const vendorRecord = db.vendors.find((vendor) => vendor.email.toLowerCase() === normalizedVendorEmail);
  const vendorId = vendorRecord?.id ?? normalizedVendorEmail;
  const vendorName = vendorRecord?.name ?? parsed.vendorName;

  const quoteItems = parsed.items.map((item) => {
    const requisitionItem = requisition.items.find((reqItem) => reqItem.id === item.requisitionItemId);
    if (!requisitionItem) {
      throw new Error('Invalid requisition item in quote');
    }
    return {
      requisitionItemId: requisitionItem.id,
      unitPrice: item.unitPrice,
      currency: requisitionItem.currency,
      leadTimeDays: item.leadTimeDays,
      notes: item.notes
    };
  });

  const subtotal = quoteItems.reduce((acc, item) => {
    const requisitionItem = requisition.items.find((reqItem) => reqItem.id === item.requisitionItemId);
    if (!requisitionItem) {
      return acc;
    }
    return acc + requisitionItem.quantity * item.unitPrice;
  }, 0);

  const total = subtotal + parsed.taxes + parsed.shipping;
  const leadTimeDays = quoteItems.reduce((max, item) => Math.max(max, item.leadTimeDays), 0);

  const quote = {
    vendorId,
    vendorName,
    vendorEmail: normalizedVendorEmail,
    vendorCompany: parsed.vendorCompany,
    items: quoteItems,
    subtotal,
    taxes: parsed.taxes,
    shipping: parsed.shipping,
    total,
    leadTimeDays,
    paymentTerms: parsed.paymentTerms,
    notes: parsed.notes,
    submittedAt: new Date(),
    source: 'vendor'
  };

  const existingIndex = rfq.quotes.findIndex((item) => item.vendorId === vendorId);
  if (existingIndex >= 0) {
    rfq.quotes[existingIndex] = quoteSchema.parse(quote);
  } else {
    rfq.quotes.push(quoteSchema.parse(quote));
  }

  if (rfq.status === 'draft' || rfq.status === 'sent') {
    rfq.status = 'received';
  }

  if (vendorRecord && !rfq.vendorIds.includes(vendorRecord.id)) {
    rfq.vendorIds.push(vendorRecord.id);
  }
  if (!rfq.vendorIds.includes(vendorId)) {
    rfq.vendorIds.push(vendorId);
  }

  return quote;
};
