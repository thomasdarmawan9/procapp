import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { createPoFromRfq } from '@/lib/services/rfq-service';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser(['procurement_admin', 'approver']);
    const body = await request.json();
    const po = createPoFromRfq(params.id, body.vendorId);
    return jsonOk(po, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to create PO', 400);
  }
}
