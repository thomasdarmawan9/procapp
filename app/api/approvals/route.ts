import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { approvalActionSchema } from '@/lib/schemas';
import { listPendingApprovalsForUser } from '@/lib/services/approval-inbox-service';
import { processApproval } from '@/lib/services/requisition-service';

export async function GET() {
  const user = requireUser();
  const approvals = listPendingApprovalsForUser(user);
  return jsonOk({ approvals });
}

export async function POST(request: NextRequest) {
  try {
    const user = requireUser();
    const body = await request.json();
    const parsed = approvalActionSchema.parse(body);
    const requisition = processApproval(parsed.requisitionId, user, parsed.action, parsed.comment);
    return jsonOk(requisition);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to process approval', 400);
  }
}
