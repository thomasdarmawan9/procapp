import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { createPoDraft, listPurchaseOrders } from '@/lib/services/po-service';

export async function GET() {
  requireUser();
  return jsonOk({ pos: listPurchaseOrders() });
}

export async function POST(request: NextRequest) {
  try {
    requireUser(['procurement_admin', 'approver']);
    const body = await request.json();
    const po = createPoDraft(body);
    return jsonOk(po, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to create PO', 400);
  }
}
