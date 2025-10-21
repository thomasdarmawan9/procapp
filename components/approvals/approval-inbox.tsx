"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApproverActions } from "@/components/shared/approver-actions";
import { formatDate } from "@/lib/utils";
import type { ApprovalInboxItem } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { StatusBadge } from "@/components/shared/status-badge";

const fetchApprovals = async (): Promise<{ approvals: ApprovalInboxItem[] }> => apiFetch("/api/approvals");

export function ApprovalInbox() {
  const query = useQuery({ queryKey: ["approvals"], queryFn: fetchApprovals });
  const approvals = query.data?.approvals ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requisition</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Needed By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((item) => (
              <TableRow key={item.requisitionId}>
                <TableCell>
                  <Link href={`/requisitions/${item.requisitionId}`} className="font-medium text-primary">
                    {item.requisition.reqNo}
                  </Link>
                </TableCell>
                <TableCell>{item.requisition.requesterId}</TableCell>
                <TableCell><StatusBadge status={item.requisition.status} /></TableCell>
                <TableCell>{formatDate(item.requisition.neededBy)}</TableCell>
                <TableCell className="flex justify-end">
                  <ApproverActions requisitionId={item.requisitionId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!approvals.length ? <p className="pt-4 text-center text-sm text-muted-foreground">No pending approvals.</p> : null}
      </CardContent>
    </Card>
  );
}
