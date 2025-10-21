import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { deleteVendor, listVendors, updateVendor } from '@/lib/services/vendor-service';

const findVendor = (id: string) => listVendors().find((vendor) => vendor.id === id);

export async function GET(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  requireUser();
  const vendor = findVendor(params.id);
  if (!vendor) {
    return jsonError('Vendor not found', 404);
  }
  return jsonOk(vendor);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser('procurement_admin');
    const body = await request.json();
    const vendor = updateVendor(params.id, body);
    return jsonOk(vendor);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to update vendor', 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser('procurement_admin');
    const vendor = deleteVendor(params.id);
    return jsonOk(vendor);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to delete vendor', 400);
  }
}
