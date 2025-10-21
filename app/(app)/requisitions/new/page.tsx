import { RequisitionForm } from '@/components/requisitions/requisition-form';

export default function NewRequisitionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">New Requisition</h2>
        <p className="text-sm text-muted-foreground">Provide details and line items to request a purchase.</p>
      </div>
      <RequisitionForm mode="create" />
    </div>
  );
}
