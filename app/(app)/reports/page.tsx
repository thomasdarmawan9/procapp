import type { Metadata } from 'next';
import { ProcurementReport } from '@/components/reports/procurement-report';
import { getProcurementReport } from '@/lib/services/report-service';

export const metadata: Metadata = {
  title: 'Reports · Procurement Success'
};

export default function ReportsPage() {
  const records = getProcurementReport();
  return (
    <div className="space-y-6">
      <ProcurementReport records={records} />
    </div>
  );
}
