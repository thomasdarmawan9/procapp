import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { getRfqById, updateRfq } from '@/lib/services/rfq-service';

export async function GET(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  requireUser();
  const rfq = getRfqById(params.id);
  if (!rfq) {
    return jsonError('RFQ not found', 404);
  }
  return jsonOk(rfq);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser(['procurement_admin', 'approver']);
    const rfq = updateRfq(params.id, await request.json());
    return jsonOk(rfq);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to update RFQ', 400);
  }
}
