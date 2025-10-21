import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { createVendor, listVendors } from '@/lib/services/vendor-service';

export async function GET() {
  requireUser();
  return jsonOk({ vendors: listVendors() });
}

export async function POST(request: NextRequest) {
  try {
    requireUser('procurement_admin');
    const body = await request.json();
    const vendor = createVendor(body);
    return jsonOk(vendor, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to create vendor', 400);
  }
}
