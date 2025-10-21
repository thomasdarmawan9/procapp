import { redirect } from 'next/navigation';
import { ApprovalRulesManager } from '@/components/settings/approval-rules-manager';
import { getCurrentUser } from '@/lib/auth';

export default function ApprovalRulesPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'procurement_admin') {
    redirect('/dashboard');
  }
  return <ApprovalRulesManager />;
}
