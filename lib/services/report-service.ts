import { getDb } from '../db';
import type { POStatus, RequisitionStatus, ApprovalEvent, VendorCategory, RfqStatus } from '../types';

const SUCCESS_PO_STATUSES: Set<POStatus> = new Set(['issued', 'partially_received', 'closed']);

type SerializableApprovalEvent = Omit<ApprovalEvent, 'at'> & { at: string };

export type ProcurementReportLineItem = {
  requisitionItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  uom?: string;
  category?: VendorCategory;
};

export type ProcurementReportRequisition = {
  id: string;
  reqNo: string;
  department: string;
  costCenter: string;
  total: number;
  status: RequisitionStatus;
  createdAt: string;
  approvalTrail: SerializableApprovalEvent[];
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    total: number;
  }>;
};

export type ProcurementReportRfq = {
  id: string;
  rfqNo: string;
  status: RfqStatus;
  dueDate: string;
  createdAt: string;
  vendorCount: number;
  quoteCount: number;
};

export type ProcurementReportVendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: VendorCategory;
};

export type ProcurementReportRecord = {
  id: string;
  po: {
    id: string;
    poNo: string;
    status: POStatus;
    total: number;
    currency: string;
    terms: string;
    createdAt: string;
  };
  vendor: ProcurementReportVendor | null;
  requisitions: ProcurementReportRequisition[];
  rfqs: ProcurementReportRfq[];
  lineItems: ProcurementReportLineItem[];
};

export const getProcurementReport = (): ProcurementReportRecord[] => {
  const db = getDb();
  const requisitionIndex = new Map(db.requisitions.map((req) => [req.id, req]));

  const records = db.pos
    .filter((po) => SUCCESS_PO_STATUSES.has(po.status))
    .map<ProcurementReportRecord>((po) => {
      const linkedRequisitions = po.linkedRequisitionIds
        .map((id) => requisitionIndex.get(id))
        .filter((req): req is typeof db.requisitions[number] => Boolean(req));

      const rfqs = db.rfqs.filter((rfq) => linkedRequisitions.some((req) => req.id === rfq.requisitionId));
      const vendor = db.vendors.find((item) => item.id === po.vendorId) ?? null;

      const requisitionItems = linkedRequisitions.flatMap((req) => req.items);

      const lineItems: ProcurementReportLineItem[] = po.lines.map((line) => {
        const match = requisitionItems.find((item) => item.id === line.requisitionItemId);
        return {
          requisitionItemId: line.requisitionItemId,
          description: match?.description ?? 'Item',
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          total: line.total,
          uom: match?.uom,
          category: match?.category
        };
      });

      const requisitions: ProcurementReportRequisition[] = linkedRequisitions.map((req) => ({
        id: req.id,
        reqNo: req.reqNo,
        department: req.department,
        costCenter: req.costCenter,
        total: req.total,
        status: req.status,
        createdAt: req.createdAt.toISOString(),
        approvalTrail: req.approvalTrail.map<SerializableApprovalEvent>((event) => ({
          ...event,
          at: event.at.toISOString()
        })),
        items: req.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      }));

      const rfqSummaries: ProcurementReportRfq[] = rfqs.map((rfq) => ({
        id: rfq.id,
        rfqNo: rfq.rfqNo,
        status: rfq.status,
        dueDate: rfq.dueDate.toISOString(),
        createdAt: rfq.createdAt.toISOString(),
        vendorCount: rfq.vendorIds.length,
        quoteCount: rfq.quotes.length
      }));

      return {
        id: po.id,
        po: {
          id: po.id,
          poNo: po.poNo,
          status: po.status,
          total: po.total,
          currency: po.currency,
          terms: po.terms,
          createdAt: po.createdAt.toISOString()
        },
        vendor: vendor
          ? {
              id: vendor.id,
              name: vendor.name,
              email: vendor.email,
              phone: vendor.phone,
              category: vendor.category
            }
          : null,
        requisitions,
        rfqs: rfqSummaries,
        lineItems
      };
    })
    .sort((a, b) => new Date(b.po.createdAt).getTime() - new Date(a.po.createdAt).getTime());

  return records;
};

export const getProcurementReportById = (id: string): ProcurementReportRecord | null => {
  return getProcurementReport().find((record) => record.id === id) ?? null;
};
