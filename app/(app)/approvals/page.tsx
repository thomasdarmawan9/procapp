import { redirect } from 'next/navigation';
import { ApprovalInbox } from '@/components/approvals/approval-inbox';
import { getCurrentUser } from '@/lib/auth';

export default function ApprovalsPage() {
  const user = getCurrentUser();
  if (!user || (user.role !== 'approver' && user.role !== 'finance' && user.role !== 'procurement_admin')) {
    redirect('/dashboard');
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Approval Inbox</h2>
        <p className="text-sm text-muted-foreground">Review and action requisitions assigned to your role.</p>
      </div>
      <ApprovalInbox />
    </div>
  );
}
