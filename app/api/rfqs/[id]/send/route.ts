import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { sendRfq } from '@/lib/services/rfq-service';

export async function POST(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  try {
    requireUser(['procurement_admin', 'approver']);
    const rfq = sendRfq(params.id);
    return jsonOk(rfq);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to send RFQ', 400);
  }
}
