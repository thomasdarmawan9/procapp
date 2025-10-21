import { notFound } from 'next/navigation';
import { RequisitionForm } from '@/components/requisitions/requisition-form';
import { getRequisition } from '@/lib/services/requisition-service';

export default function EditRequisitionPage({ params }: { params: { id: string } }) {
  const requisition = getRequisition(params.id);
  if (!requisition) {
    notFound();
  }

  const defaultValues = {
    department: requisition.department,
    costCenter: requisition.costCenter,
    neededBy: requisition.neededBy,
    notes: requisition.notes,
    attachments: requisition.attachments,
    items: requisition.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      uom: item.uom,
      unitPrice: item.unitPrice,
      currency: item.currency,
      category: item.category,
      vendorPreferenceId: item.vendorPreferenceId ?? ''
    }))
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Edit Requisition</h2>
        <p className="text-sm text-muted-foreground">Update line items and details before resubmitting.</p>
      </div>
      <RequisitionForm defaultValues={defaultValues} requisitionId={requisition.id} mode="edit" />
    </div>
  );
}
