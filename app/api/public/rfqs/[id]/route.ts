import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/http';
import { getRfqPublicView, submitVendorQuote } from '@/lib/services/rfq-service';
import { createCaptcha } from '@/lib/captcha';

export async function GET(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  try {
    const rfq = getRfqPublicView(params.id);
    if (!rfq) {
      return jsonError('RFQ not found', 404);
    }
    if (rfq.status === 'closed') {
      return jsonError('RFQ is closed', 400);
    }
    const captcha = createCaptcha();
    return jsonOk({ rfq, captcha });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to fetch RFQ', 400);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const quote = submitVendorQuote(params.id, body);
    return jsonOk({ success: true, quote }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to submit quote', 400);
  }
}
