import { getDb } from '../db';
import type { Budget } from '../types';

const ACTIVE_REQUISITION_STATUSES = new Set(['submitted', 'approved']);
const ACTIVE_PO_STATUSES = new Set(['draft', 'in_progress', 'issued', 'partially_received', 'closed']);

type BudgetUsageOptions = {
  excludeRequisitionIds?: string[];
};

export type BudgetUsageSummary = {
  budget: Budget;
  usage: number;
  remaining: number;
};

export type BudgetSummary = Budget & {
  usage: number;
  remaining: number;
};

export const listBudgets = (): Budget[] => {
  return getDb().budgets;
};

export const getBudgetByCostCenter = (costCenter: string): Budget | null => {
  return listBudgets().find((item) => item.costCenter === costCenter) ?? null;
};

export const calculateBudgetUsage = (
  costCenter: string,
  options?: BudgetUsageOptions
): BudgetUsageSummary | null => {
  const budget = getBudgetByCostCenter(costCenter);
  if (!budget) {
    return null;
  }

  const db = getDb();
  const excludeIds = new Set(options?.excludeRequisitionIds ?? []);
  const requisitionCommitment = db.requisitions
    .filter((req) => req.costCenter === costCenter && !excludeIds.has(req.id))
    .filter((req) => ACTIVE_REQUISITION_STATUSES.has(req.status))
    .reduce((acc, req) => acc + req.total, 0);

  const requisitionIndex = new Map(db.requisitions.map((req) => [req.id, req]));

  const poCommitment = db.pos
    .filter((po) => ACTIVE_PO_STATUSES.has(po.status))
    .filter((po) =>
      po.linkedRequisitionIds.some((id) => {
        const linked = requisitionIndex.get(id);
        return linked ? linked.costCenter === costCenter : false;
      })
    )
    .reduce((acc, po) => acc + po.total, 0);

  const usage = requisitionCommitment + poCommitment;
  const remaining = budget.amount - usage;

  return {
    budget,
    usage,
    remaining
  };
};

export const ensureBudgetAvailable = (
  costCenter: string,
  amount: number,
  options?: BudgetUsageOptions
): (BudgetUsageSummary & { remainingAfter: number }) | null => {
  const summary = calculateBudgetUsage(costCenter, options);
  if (!summary) {
    return null;
  }

  if (amount > summary.remaining) {
    const formatter = new Intl.NumberFormat('en-ID', {
      style: 'currency',
      currency: summary.budget.currency,
      maximumFractionDigits: 0
    });
    const remainingFormatted = formatter.format(Math.max(summary.remaining, 0));
    const amountFormatted = formatter.format(amount);
    throw new Error(
      `Budget ${summary.budget.name} (${summary.budget.costCenter}) exceeded. Remaining ${remainingFormatted}, requested ${amountFormatted}.`
    );
  }

  return {
    ...summary,
    remainingAfter: summary.remaining - amount
  };
};

export const listBudgetSummaries = (): BudgetSummary[] => {
  return listBudgets().map((budget) => {
    const usage = calculateBudgetUsage(budget.costCenter);
    if (!usage) {
      return {
        ...budget,
        usage: 0,
        remaining: budget.amount
      };
    }

    return {
      ...budget,
      usage: usage.usage,
      remaining: usage.remaining
    };
  });
};
