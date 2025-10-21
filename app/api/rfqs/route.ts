import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { createRfq, listRfqs } from '@/lib/services/rfq-service';

export async function GET() {
  requireUser();
  return jsonOk({ rfqs: listRfqs() });
}

export async function POST(request: NextRequest) {
  try {
    const user = requireUser();
    const rfq = createRfq(await request.json(), user);
    return jsonOk(rfq, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to create RFQ', 400);
  }
}
