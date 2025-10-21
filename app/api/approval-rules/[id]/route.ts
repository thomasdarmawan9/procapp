import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, jsonOk } from '@/lib/http';
import { deleteApprovalRule, updateApprovalRule } from '@/lib/services/approval-rule-service';

const findRule = (id: string) => getDb().approvalRules.find((rule) => rule.id === id);

export async function GET(
  _request: NextRequest,
  {
    params
  }: {
    params: { id: string };
  }
) {
  requireUser();
  const rule = findRule(params.id);
  if (!rule) {
    return jsonError('Approval rule not found', 404);
  }
  return jsonOk(rule);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser('procurement_admin');
    const rule = updateApprovalRule(params.id, await request.json());
    return jsonOk(rule);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to update approval rule', 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireUser('procurement_admin');
    const rule = deleteApprovalRule(params.id);
    return jsonOk(rule);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to delete approval rule', 400);
  }
}
