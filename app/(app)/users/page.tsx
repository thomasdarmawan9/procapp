import { redirect } from 'next/navigation';
import { UserManagement } from '@/components/users/user-management';
import { getCurrentUser } from '@/lib/auth';

export default function UsersPage() {
  const user = getCurrentUser();
  if (!user || (user.role !== 'approver' && user.role !== 'procurement_admin')) {
    redirect('/dashboard');
  }
  return <UserManagement />;
}
