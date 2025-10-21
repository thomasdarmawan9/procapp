import { getDb } from '../db';
import { getPendingApprovalStep } from './requisition-service';
import { User } from '../types';

export const listPendingApprovalsForUser = (user: User) => {
  const { requisitions } = getDb();
  return requisitions
    .filter((req) => req.status === 'submitted')
    .map((req) => {
      const pending = getPendingApprovalStep(req);
      if (!pending || pending.role !== user.role) {
        return null;
      }
      return {
        requisitionId: req.id,
        requisition: req,
        currentStep: pending
      };
    })
    .filter(Boolean);
};
