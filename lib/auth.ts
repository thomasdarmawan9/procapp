'use server';

import { cookies } from 'next/headers';
import { getDb } from './db';
import { Role, User } from './types';

const SESSION_COOKIE = 'proc-session';

export const getCurrentUser = (): User | null => {
  const cookieStore = cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionValue) {
    return null;
  }
  const { users } = getDb();
  return users.find((user) => user.id === sessionValue) ?? null;
};

export const requireUser = (allowed?: Role | Role[]): User => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  if (allowed) {
    const roles = Array.isArray(allowed) ? allowed : [allowed];
    if (!roles.includes(user.role)) {
      throw new Error('Forbidden');
    }
  }
  return user;
};

export const setSessionUser = (user: User) => {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });
  return user;
};

export const clearSession = () => {
  cookies().delete(SESSION_COOKIE);
};
