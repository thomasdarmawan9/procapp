import { getDb } from '../db';
import type { FileMeta } from '../types';

export type DocumentRecord = {
  id: string;
  name: string;
  source: 'requisition' | 'purchase_order';
  reference: string;
  costCenter?: string;
  uploadedAt: Date;
  url: string;
  mime?: string;
  size?: number;
};

export type AuditEventRecord = {
  id: string;
  entity: 'requisition' | 'purchase_order';
  reference: string;
  action: string;
  actor: string;
  role?: string;
  at: Date;
  notes?: string;
};

const mapFile = (
  file: FileMeta,
  context: {
    source: DocumentRecord['source'];
    reference: string;
    costCenter?: string;
    uploadedAt: Date;
  }
): DocumentRecord => ({
  id: file.id,
  name: file.name,
  url: file.url,
  mime: file.mime,
  size: file.size,
  source: context.source,
  reference: context.reference,
  costCenter: context.costCenter,
  uploadedAt: context.uploadedAt
});

export const listDocuments = (): DocumentRecord[] => {
  const db = getDb();
  const requisitionDocs = db.requisitions.flatMap((req) =>
    req.attachments.map((file) =>
      mapFile(file, {
        source: 'requisition',
        reference: req.reqNo,
        costCenter: req.costCenter,
        uploadedAt: req.updatedAt ?? req.createdAt
      })
    )
  );

  const poDocs = db.pos.flatMap((po) =>
    (po.paymentProofs ?? []).map((file) =>
      mapFile(file, {
        source: 'purchase_order',
        reference: po.poNo,
        costCenter:
          db.requisitions.find((req) => po.linkedRequisitionIds.includes(req.id))?.costCenter ??
          undefined,
        uploadedAt: po.createdAt
      })
    )
  );

  const combined = [...requisitionDocs, ...poDocs];

  return combined.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
};

export const listAuditEvents = (): AuditEventRecord[] => {
  const db = getDb();

  const userIndex = new Map(db.users.map((user) => [user.id, user]));

  const requisitionEvents = db.requisitions.flatMap((req) =>
    req.approvalTrail.map((event) => {
      const user = event.userId ? userIndex.get(event.userId) : undefined;
      return {
        id: `${req.id}-${event.step}-${event.role}-${event.action}-${event.at.getTime()}`,
        entity: 'requisition' as const,
        reference: req.reqNo,
        action: event.action,
        actor: user?.name ?? 'System',
        role: event.role,
        at: event.at,
        notes: event.comment
      };
    })
  );

  const poEvents = db.pos.map((po) => ({
    id: `${po.id}-created`,
    entity: 'purchase_order' as const,
    reference: po.poNo,
    action: `status:${po.status}`,
    actor: 'System',
    at: po.createdAt
  }));

  return [...requisitionEvents, ...poEvents].sort((a, b) => b.at.getTime() - a.at.getTime());
};
