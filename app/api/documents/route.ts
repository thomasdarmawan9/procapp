import { requireUser } from '@/lib/auth';
import { jsonOk } from '@/lib/http';
import { listDocuments, listAuditEvents } from '@/lib/services/document-service';

export async function GET() {
  requireUser(['finance', 'procurement_admin']);
  const documents = listDocuments();
  const audits = listAuditEvents();
  return jsonOk({ documents, audits });
}
