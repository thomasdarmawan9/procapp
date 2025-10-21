import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, jsonOk } from '@/lib/http';
import { updateRequisition } from '@/lib/services/requisition-service';

const findRequisition = (id: string) => getDb().requisitions.find((req) => req.id === id);

export async function GET(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  requireUser();
  const requisition = findRequisition(params.id);
  if (!requisition) {
    return jsonError('Requisition not found', 404);
  }
  return jsonOk(requisition);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireUser();
    const requisition = updateRequisition(params.id, await request.json(), user);
    return jsonOk(requisition);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to update requisition', 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser('procurement_admin');
    const db = getDb();
    const index = db.requisitions.findIndex((req) => req.id === params.id);
    if (index === -1) {
      return jsonError('Requisition not found', 404);
    }
    const [removed] = db.requisitions.splice(index, 1);
    return jsonOk(removed);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to delete requisition', 400);
  }
}
