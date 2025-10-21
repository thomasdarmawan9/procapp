import { getDb } from '../db';
import { evaluateApprovalSteps, getPendingApprovalStep } from './requisition-service';
import { listBudgetSummaries } from './budget-service';
import { listAuditEvents } from './document-service';

export const getDashboardMetrics = () => {
  const db = getDb();
  const openRequisitions = db.requisitions.filter((req) => req.status === 'draft' || req.status === 'submitted');
  const pendingApprovals = db.requisitions.filter((req) => req.status === 'submitted');
  const rfqsInProgress = db.rfqs.filter((rfq) => rfq.status !== 'closed');

  const spendByCategory = db.requisitions.reduce<Record<string, number>>((acc, req) => {
    req.items.forEach((item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.quantity * item.unitPrice;
    });
    return acc;
  }, {});

  const approvalsByRole = pendingApprovals.reduce<Record<string, number>>((acc, req) => {
    const pending = getPendingApprovalStep(req) ?? evaluateApprovalSteps(req)[0];
    if (pending) {
      acc[pending.role] = (acc[pending.role] ?? 0) + 1;
    }
    return acc;
  }, {});

  const poStatus = db.pos.reduce<Record<string, number>>((acc, po) => {
    acc[po.status] = (acc[po.status] ?? 0) + 1;
    return acc;
  }, {});

  const budgets = listBudgetSummaries();
  const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
  const usedBudget = budgets.reduce((acc, budget) => acc + budget.usage, 0);
  const remainingBudget = totalBudget - usedBudget;
  const topBudgets = budgets
    .slice()
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 3);

  const poTrendMap = new Map<string, number>();
  db.pos.forEach((po) => {
    const createdAt = new Date(po.createdAt);
    const key = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
    poTrendMap.set(key, (poTrendMap.get(key) ?? 0) + po.total);
  });
  const poTrend = Array.from(poTrendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  const auditEvents = listAuditEvents()
    .slice(0, 6)
    .map((event) => ({
      ...event,
      at: event.at.toISOString()
    }));

  const recentRequisitions = db.requisitions
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((req) => ({
      id: req.id,
      reqNo: req.reqNo,
      department: req.department,
      status: req.status,
      total: req.total,
      createdAt: req.createdAt.toISOString()
    }));

  const recentPos = db.pos
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((po) => ({
      id: po.id,
      poNo: po.poNo,
      status: po.status,
      total: po.total,
      createdAt: po.createdAt.toISOString()
    }));

  const approvalsDurations = db.requisitions
    .filter((req) => req.approvalTrail.some((event) => event.action === 'submitted'))
    .map((req) => {
      const submitted = req.approvalTrail.find((event) => event.action === 'submitted');
      const lastApproval = [...req.approvalTrail]
        .filter((event) => event.action === 'approved')
        .sort((a, b) => b.at.getTime() - a.at.getTime())[0];
      if (submitted && lastApproval) {
        const diffMs = lastApproval.at.getTime() - submitted.at.getTime();
        return diffMs / (1000 * 60 * 60 * 24);
      }
      return null;
    })
    .filter((value): value is number => value !== null && Number.isFinite(value));

  const averageApprovalDays =
    approvalsDurations.length === 0
      ? 0
      : Math.round((approvalsDurations.reduce((acc, value) => acc + value, 0) / approvalsDurations.length) * 10) / 10;

  const vendorSpend = db.pos.reduce<Record<string, number>>((acc, po) => {
    acc[po.vendorId] = (acc[po.vendorId] ?? 0) + po.total;
    return acc;
  }, {});

  const vendors = db.vendors;
  const topVendors = Object.entries(vendorSpend)
    .map(([vendorId, total]) => {
      const vendor = vendors.find((item) => item.id === vendorId);
      return {
        id: vendorId,
        name: vendor?.name ?? 'Unknown Vendor',
        total
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const totalSpend = Object.values(spendByCategory).reduce((acc, value) => acc + value, 0);
  const totalPOValue = db.pos.reduce((acc, po) => acc + po.total, 0);

  return {
    requisitions: {
      total: db.requisitions.length,
      open: openRequisitions.length,
      pendingApprovals: pendingApprovals.length,
      averageApprovalDays
    },
    approvals: approvalsByRole,
    rfqs: {
      total: db.rfqs.length,
      inProgress: rfqsInProgress.length
    },
    pos: {
      total: db.pos.length,
      status: poStatus,
      totalValue: totalPOValue,
      trend: poTrend
    },
    spendByCategory,
    spendTotal: totalSpend,
    budget: {
      total: totalBudget,
      used: usedBudget,
      remaining: remainingBudget,
      summaries: topBudgets
    },
    activity: {
      audits: auditEvents
    },
    recent: {
      requisitions: recentRequisitions,
      pos: recentPos
    },
    vendors: {
      top: topVendors
    }
  };
};
