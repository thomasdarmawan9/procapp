import { z } from 'zod';
import { getDb } from '../db';
import { uuid } from '../utils';
import type { StoredUser, User } from '../types';
import { userCreateSchema } from '../schemas';

const toPublicUser = (user: StoredUser): User => {
  const { password: _password, ...rest } = user;
  void _password;
  return rest;
};

export const listUsers = (): User[] => {
  return getDb().users.map(toPublicUser);
};

type CreateUserInput = z.infer<typeof userCreateSchema>;

export const createUser = (rawInput: CreateUserInput): User => {
  const db = getDb();
  const input = userCreateSchema.parse(rawInput);
  const existing = db.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (existing) {
    throw new Error('Email is already registered');
  }
  const user: StoredUser = {
    id: uuid(),
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    department: input.department,
    password: input.password
  };
  db.users.push(user);
  return toPublicUser(user);
};
