import { RfqTable } from '@/components/rfqs/rfq-table';

export default function RfqsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Request for Quotation</h2>
        <p className="text-sm text-muted-foreground">Manage vendor outreach and compare responses.</p>
      </div>
      <RfqTable />
    </div>
  );
}
