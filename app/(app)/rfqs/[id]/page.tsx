import { notFound } from 'next/navigation';
import { RfqDetail } from '@/components/rfqs/rfq-detail';
import { getRfqById } from '@/lib/services/rfq-service';
import { listRequisitions } from '@/lib/services/requisition-service';
import { listVendors } from '@/lib/services/vendor-service';

export default function RfqDetailPage({ params }: { params: { id: string } }) {
  const rfq = getRfqById(params.id);
  if (!rfq) {
    notFound();
  }
  const requisition = listRequisitions().find((req) => req.id === rfq.requisitionId) ?? null;
  const vendors = listVendors();
  return <RfqDetail rfq={rfq} requisition={requisition} vendors={vendors} />;
}
