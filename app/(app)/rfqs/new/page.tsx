import { redirect } from 'next/navigation';
import { RfqForm } from '@/components/rfqs/rfq-form';
import { getCurrentUser } from '@/lib/auth';

export default function NewRfqPage() {
  const user = getCurrentUser();
  if (!user || (user.role !== 'procurement_admin' && user.role !== 'approver')) {
    redirect('/rfqs');
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Create RFQ</h2>
        <p className="text-sm text-muted-foreground">Select an approved requisition and invite vendors.</p>
      </div>
      <RfqForm />
    </div>
  );
}
