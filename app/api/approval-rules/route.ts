import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { createApprovalRule, listApprovalRules } from '@/lib/services/approval-rule-service';

export async function GET() {
  requireUser(['procurement_admin', 'finance', 'approver', 'employee']);
  return jsonOk({ rules: listApprovalRules() });
}

export async function POST(request: NextRequest) {
  try {
    requireUser('procurement_admin');
    const rule = createApprovalRule(await request.json());
    return jsonOk(rule, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to create approval rule', 400);
  }
}
