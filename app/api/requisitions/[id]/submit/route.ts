import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { submitRequisition } from '@/lib/services/requisition-service';

export async function POST(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  try {
    const user = requireUser();
    const requisition = submitRequisition(params.id, user);
    return jsonOk(requisition);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to submit requisition', 400);
  }
}
