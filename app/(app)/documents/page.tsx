import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { listDocuments, listAuditEvents } from '@/lib/services/document-service';
import { DocumentAuditView } from '@/components/documents/document-audit-view';

export default function DocumentsPage() {
  const user = getCurrentUser();
  if (!user || (user.role !== 'finance' && user.role !== 'procurement_admin')) {
    redirect('/dashboard');
  }

  const documents = listDocuments().map((item) => ({
    ...item,
    uploadedAt: item.uploadedAt.toISOString()
  }));

  const audits = listAuditEvents().map((item) => ({
    ...item,
    at: item.at.toISOString()
  }));

  return (
    <DocumentAuditView
      userRole={user.role}
      documents={documents}
      audits={audits}
    />
  );
}
