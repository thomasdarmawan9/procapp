"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { ApprovalTimeline } from "@/components/shared/approval-timeline";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Requisition, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ApproverActions } from "@/components/shared/approver-actions";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api-client";

async function submitRequisitionApi(id: string) {
  return apiFetch(`/api/requisitions/${id}/submit`, { method: "POST" });
}

export function RequisitionDetail({ requisition, user }: { requisition: Requisition; user: User }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: submitRequisitionApi,
    onSuccess: () => {
      toast({ description: "Requisition submitted" });
      queryClient.invalidateQueries({ queryKey: ["requisition", requisition.id] });
      router.refresh();
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const canEdit = requisition.status === "draft" && (user.role === "procurement_admin" || user.id === requisition.requesterId);
  const canSubmit = requisition.status === "draft" && (user.id === requisition.requesterId || user.role === "procurement_admin");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">{requisition.reqNo}</h2>
          <p className="text-sm text-muted-foreground">Department {requisition.department} · Needed by {formatDate(requisition.neededBy)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={requisition.status} />
          {canEdit ? (
            <Button asChild variant="outline">
              <Link href={`/requisitions/${requisition.id}/edit`}>Edit</Link>
            </Button>
          ) : null}
          {canSubmit ? (
            <Button onClick={() => submitMutation.mutate(requisition.id)} disabled={submitMutation.isPending}>
              Submit
            </Button>
          ) : null}
        </div>
      </div>

      {requisition.status === "submitted" && user.role !== "employee" ? (
        <ApproverActions requisitionId={requisition.id} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Department</span><span>{requisition.department}</span></div>
            <div className="flex justify-between"><span>Cost Center</span><span>{requisition.costCenter}</span></div>
            <div className="flex justify-between"><span>Needed By</span><span>{formatDate(requisition.neededBy)}</span></div>
            <div className="flex justify-between"><span>Total</span><Money value={requisition.total} /></div>
            {requisition.notes ? <p className="pt-2 text-muted-foreground">Notes: {requisition.notes}</p> : null}
          </CardContent>
        </Card>
        <ApprovalTimeline steps={requisition.approvalSteps} events={requisition.approvalTrail} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisition.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell><Money value={item.unitPrice} /></TableCell>
                  <TableCell><Money value={item.unitPrice * item.quantity} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          {requisition.attachments.length ? (
            <ul className="space-y-2">
              {requisition.attachments.map((file) => (
                <li key={file.id}>
                  <a href={file.url} className="text-sm text-primary" target="_blank" rel="noreferrer">
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No attachments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
