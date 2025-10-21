import { notFound } from 'next/navigation';
import { PoDetail } from '@/components/pos/po-detail';
import { getPurchaseOrder } from '@/lib/services/po-service';
import { listRequisitions } from '@/lib/services/requisition-service';

export default function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const po = getPurchaseOrder(params.id);
  if (!po) {
    notFound();
  }
  const requisitions = listRequisitions().filter((req) => po.linkedRequisitionIds.includes(req.id));
  return <PoDetail po={po} requisitions={requisitions} />;
}
