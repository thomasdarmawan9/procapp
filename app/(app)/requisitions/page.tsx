import { RequisitionTable } from '@/components/requisitions/requisition-table';
import { listRequisitions } from '@/lib/services/requisition-service';

const PAGE_SIZE = 10;

export default function RequisitionsPage() {
  const requisitions = listRequisitions()
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const initialData = {
    requisitions: requisitions.slice(0, PAGE_SIZE),
    page: 1,
    pageSize: PAGE_SIZE,
    total: requisitions.length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Requisitions</h2>
        <p className="text-sm text-muted-foreground">Track and manage purchase requisitions across teams.</p>
      </div>
      <RequisitionTable initialData={initialData} />
    </div>
  );
}
