import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProcurementReportDetail } from '@/components/reports/procurement-report-detail';
import { getProcurementReport, getProcurementReportById } from '@/lib/services/report-service';
import { Button } from '@/components/ui/button';

type ReportDetailPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: ReportDetailPageProps): Promise<Metadata> {
  const record = getProcurementReportById(params.id);
  if (!record) {
    return {
      title: 'Report not found'
    };
  }
  return {
    title: `Report · ${record.po.poNo}`
  };
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const record = getProcurementReportById(params.id);
  if (!record) {
    notFound();
  }

  const records = getProcurementReport();
  const previousIndex = records.findIndex((item) => item.id === record.id);
  const previousId = previousIndex > 0 ? records[previousIndex - 1].id : null;
  const nextId = previousIndex >= 0 && previousIndex < records.length - 1 ? records[previousIndex + 1].id : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">← Back to reports</Link>
        </Button>
        <div className="flex items-center gap-2">
          {previousId ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/reports/${previousId}`}>Previous</Link>
            </Button>
          ) : null}
          {nextId ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/reports/${nextId}`}>Next</Link>
            </Button>
          ) : null}
        </div>
      </div>
      <ProcurementReportDetail record={record} />
    </div>
  );
}
