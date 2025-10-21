import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { getPurchaseOrder, updatePurchaseOrder } from '@/lib/services/po-service';

export async function GET(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  requireUser();
  const po = getPurchaseOrder(params.id);
  if (!po) {
    return jsonError('PO not found', 404);
  }
  return jsonOk(po);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser(['procurement_admin', 'finance']);
    const body = await request.json();
    const po = updatePurchaseOrder(params.id, {
      status: body.status,
      paymentProofs: body.paymentProofs
    });
    return jsonOk(po);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to update PO', 400);
  }
}
