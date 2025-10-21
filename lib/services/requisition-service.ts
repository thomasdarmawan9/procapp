import { z } from 'zod';
import { getDb } from '../db';
import { requisitionFormSchema } from '../schemas';
import { uuid } from '../utils';
import { ApprovalRuleStep, ApprovalRule, Requisition, User } from '../types';
import { ensureBudgetAvailable } from './budget-service';

export const listRequisitions = () => getDb().requisitions;

export const getRequisition = (id: string) => getDb().requisitions.find((req) => req.id === id) ?? null;

type RequisitionFormInput = z.infer<typeof requisitionFormSchema>;

const generateNumber = (prefix: string, existing: string[]) => {
  const numbers = existing
    .map((value) => {
      const match = value.match(/(\d+)$/);
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((number) => !Number.isNaN(number));

  const latest = numbers.length ? Math.max(...numbers) : 0;
  return `${prefix}${(latest + 1).toString().padStart(4, '0')}`;
};

const matchesRule = (rule: ApprovalRule, requisition: Requisition) => {
  const { amountGte, category, costCenter } = rule.conditions;
  if (amountGte !== undefined && requisition.total < amountGte) {
    return false;
  }
  if (category && !requisition.items.some((item) => item.category === category)) {
    return false;
  }
  if (costCenter && requisition.costCenter !== costCenter) {
    return false;
  }
  return true;
};

const conditionWeight = (rule: ApprovalRule) => {
  const { amountGte, category, costCenter } = rule.conditions;
  let weight = 0;
  if (amountGte !== undefined) weight += 1;
  if (category !== undefined) weight += 1;
  if (costCenter !== undefined) weight += 1;
  return weight;
};

const normalizeSteps = (steps: ApprovalRuleStep[]): ApprovalRuleStep[] => {
  const uniqueRoles = new Map<ApprovalRuleStep, ApprovalRuleStep>();

  steps
    .slice()
    .sort((a, b) => a.order - b.order || a.role.localeCompare(b.role))
    .forEach((step) => {
      if (!uniqueRoles.has(step.role)) {
        uniqueRoles.set(step.role, step);
      }
    });

  const ordered = Array.from(uniqueRoles.values()).map((step, index) => ({
    order: index + 1,
    role: step.role
  }));

  return ordered.length ? ordered : [{ order: 1, role: 'approver' }];
};

export const evaluateApprovalSteps = (requisition: Requisition): ApprovalRuleStep[] => {
  const { approvalRules } = getDb();
  const matchedRules = approvalRules.filter((rule) => matchesRule(rule, requisition));
  if (!matchedRules.length) {
    return [{ order: 1, role: 'approver' }];
  }
  const maxWeight = Math.max(...matchedRules.map(conditionWeight));
  const prioritized = matchedRules.filter((rule) => conditionWeight(rule) === maxWeight);
  const merged = prioritized.flatMap((rule) => rule.steps);
  return normalizeSteps(merged);
};

export const getPendingApprovalStep = (requisition: Requisition) => {
  if (!requisition.approvalSteps.length) {
    return null;
  }
  const approvedSteps = requisition.approvalTrail
    .filter((event) => event.action === 'approved')
    .map((event) => `${event.step}-${event.role}`);

  return (
    requisition.approvalSteps.find((step) => !approvedSteps.includes(`${step.order}-${step.role}`)) ?? null
  );
};

export const canUserApprove = (user: User | null, requisition: Requisition) => {
  if (!user) return false;
  const pending = getPendingApprovalStep(requisition);
  if (!pending) return false;
  return pending.role === user.role;
};

export const createRequisition = (input: RequisitionFormInput, requester: User) => {
  const parsed = requisitionFormSchema.parse(input);
  const db = getDb();

  const reqNo = generateNumber(
    'PR-2024-',
    db.requisitions.map((req) => req.reqNo.replace('PR-2024-', ''))
  );

  const items = parsed.items.map((item) => ({
    ...item,
    id: item.id ?? uuid()
  }));

  const total = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const requisition: Requisition = {
    id: uuid(),
    reqNo,
    requesterId: requester.id,
    department: parsed.department,
    costCenter: parsed.costCenter,
    neededBy: parsed.neededBy,
    status: 'draft',
    items,
    attachments: parsed.attachments ?? [],
    notes: parsed.notes,
    total,
    createdAt: new Date(),
    updatedAt: new Date(),
    approvalTrail: [],
    approvalSteps: []
  };

  db.requisitions.unshift(requisition);
  return requisition;
};

export const updateRequisition = (id: string, input: RequisitionFormInput, user: User) => {
  const parsed = requisitionFormSchema.parse(input);
  const db = getDb();
  const existing = db.requisitions.find((req) => req.id === id);
  if (!existing) {
    throw new Error('Requisition not found');
  }
  if (existing.status !== 'draft') {
    throw new Error('Only draft requisitions can be edited');
  }
  if (existing.requesterId !== user.id && user.role !== 'procurement_admin') {
    throw new Error('Not allowed to edit this requisition');
  }
  const items = parsed.items.map((item) => ({
    ...item,
    id: item.id ?? uuid()
  }));
  existing.department = parsed.department;
  existing.costCenter = parsed.costCenter;
  existing.neededBy = parsed.neededBy;
  existing.notes = parsed.notes;
  existing.attachments = parsed.attachments ?? [];
  existing.items = items;
  existing.total = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  existing.updatedAt = new Date();
  existing.approvalSteps = [];
  existing.approvalTrail = [];
  return existing;
};

export const submitRequisition = (id: string, user: User) => {
  const db = getDb();
  const requisition = db.requisitions.find((req) => req.id === id);
  if (!requisition) {
    throw new Error('Requisition not found');
  }
  if (requisition.status !== 'draft') {
    throw new Error('Only draft requisitions can be submitted');
  }
  if (requisition.requesterId !== user.id && user.role !== 'procurement_admin') {
    throw new Error('Not allowed to submit this requisition');
  }

  ensureBudgetAvailable(requisition.costCenter, requisition.total, {
    excludeRequisitionIds: [requisition.id]
  });

  const steps = evaluateApprovalSteps(requisition);
  requisition.approvalSteps = steps;
  requisition.status = 'submitted';
  requisition.approvalTrail = [
    ...requisition.approvalTrail,
    {
      step: 0,
      role: 'employee',
      userId: user.id,
      action: 'submitted',
      at: new Date()
    }
  ];
  requisition.updatedAt = new Date();
  return requisition;
};

export const processApproval = (id: string, user: User, action: 'approved' | 'returned', comment?: string) => {
  const db = getDb();
  const requisition = db.requisitions.find((req) => req.id === id);
  if (!requisition) {
    throw new Error('Requisition not found');
  }
  if (requisition.status !== 'submitted') {
    throw new Error('Only submitted requisitions can be processed');
  }
  const pendingStep = getPendingApprovalStep(requisition);
  if (!pendingStep) {
    throw new Error('No pending approval step');
  }
  if (pendingStep.role !== user.role) {
    throw new Error('You are not authorized for this step');
  }
  requisition.approvalTrail = [
    ...requisition.approvalTrail,
    {
      step: pendingStep.order,
      role: pendingStep.role,
      userId: user.id,
      action,
      comment,
      at: new Date()
    }
  ];
  requisition.updatedAt = new Date();

  if (action === 'returned') {
    requisition.status = 'draft';
    return requisition;
  }
  const nextStep = getPendingApprovalStep(requisition);
  if (!nextStep) {
    requisition.status = 'approved';
  }
  return requisition;
};
