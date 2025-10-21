import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { closeRfq } from '@/lib/services/rfq-service';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser(['procurement_admin', 'approver']);
    const body = await request.json();
    const rfq = closeRfq(params.id, { winnerVendorId: body.winnerVendorId });
    return jsonOk(rfq);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to close RFQ', 400);
  }
}
