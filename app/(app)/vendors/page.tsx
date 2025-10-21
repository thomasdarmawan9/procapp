import { redirect } from 'next/navigation';
import { VendorManager } from '@/components/vendors/vendor-manager';
import { getCurrentUser } from '@/lib/auth';

export default function VendorsPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'procurement_admin') {
    redirect('/dashboard');
  }
  return <VendorManager />;
}
