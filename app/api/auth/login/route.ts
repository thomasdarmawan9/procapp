import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { loginSchema } from '@/lib/schemas';
import { clearSession, sanitizeUser, setSessionUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const { users } = getDb();
    const user = users.find((item) => item.email.toLowerCase() === parsed.email.toLowerCase());
    if (!user || user.password !== parsed.password) {
      return jsonError('Invalid email or password', 401);
    }
    const publicUser = sanitizeUser(user);
    setSessionUser(publicUser);
    return jsonOk(publicUser);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request', 400);
  }
}

export async function DELETE() {
  clearSession();
  return jsonOk({ success: true });
}
