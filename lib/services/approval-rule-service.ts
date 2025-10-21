import { z } from 'zod';
import { getDb } from '../db';
import { approvalRuleFormSchema } from '../schemas';
import { uuid } from '../utils';
import { ApprovalRule } from '../types';

type ApprovalRuleFormInput = z.infer<typeof approvalRuleFormSchema>;

export const listApprovalRules = () => getDb().approvalRules;

export const createApprovalRule = (input: ApprovalRuleFormInput) => {
  const parsed = approvalRuleFormSchema.parse(input);
  const db = getDb();
  const rule: ApprovalRule = {
    id: uuid(),
    name: parsed.name,
    conditions: parsed.conditions,
    steps: parsed.steps.map((step, index) => ({
      order: index + 1,
      role: step.role
    }))
  };
  db.approvalRules.unshift(rule);
  return rule;
};

export const updateApprovalRule = (id: string, input: ApprovalRuleFormInput) => {
  const parsed = approvalRuleFormSchema.parse(input);
  const db = getDb();
  const rule = db.approvalRules.find((item) => item.id === id);
  if (!rule) {
    throw new Error('Approval rule not found');
  }
  rule.name = parsed.name;
  rule.conditions = parsed.conditions;
  rule.steps = parsed.steps.map((step, index) => ({
    order: index + 1,
    role: step.role
  }));
  return rule;
};

export const deleteApprovalRule = (id: string) => {
  const db = getDb();
  const index = db.approvalRules.findIndex((rule) => rule.id === id);
  if (index === -1) {
    throw new Error('Approval rule not found');
  }
  const [removed] = db.approvalRules.splice(index, 1);
  return removed;
};
