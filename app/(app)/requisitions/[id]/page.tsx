import { notFound } from 'next/navigation';
import { RequisitionDetail } from '@/components/requisitions/requisition-detail';
import { getRequisition } from '@/lib/services/requisition-service';
import { getCurrentUser } from '@/lib/auth';

export default function RequisitionDetailPage({ params }: { params: { id: string } }) {
  const requisition = getRequisition(params.id);
  const user = getCurrentUser();

  if (!requisition || !user) {
    notFound();
  }

  return <RequisitionDetail requisition={requisition} user={user} />;
}
