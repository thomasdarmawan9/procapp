import { PoTable } from '@/components/pos/po-table';

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Purchase Orders</h2>
        <p className="text-sm text-muted-foreground">Monitor purchase orders and linked requisitions.</p>
      </div>
      <PoTable />
    </div>
  );
}
