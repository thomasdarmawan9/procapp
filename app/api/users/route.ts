import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { createUser, listUsers } from '@/lib/services/user-service';

const ALLOWED_ROLES: Parameters<typeof requireUser>[0] = ['approver', 'procurement_admin'];

export async function GET() {
  requireUser(ALLOWED_ROLES);
  return jsonOk({ users: listUsers() });
}

export async function POST(request: NextRequest) {
  try {
    requireUser(ALLOWED_ROLES);
    const body = await request.json();
    const user = createUser(body);
    return jsonOk(user, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to create user', 400);
  }
}
