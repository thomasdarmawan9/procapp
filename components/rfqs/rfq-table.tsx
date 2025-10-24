"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { RFQ, Requisition } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useHasRole } from "@/hooks/use-session";
import { useToast } from "@/components/ui/use-toast";

const fetchRfqs = async (): Promise<{ rfqs: RFQ[] }> => apiFetch("/api/rfqs");

type RequisitionResponse = {
  requisitions: Requisition[];
  page: number;
  pageSize: number;
  total: number;
};

const fetchRequisitions = async (): Promise<RequisitionResponse> =>
  apiFetch(`/api/requisitions?pageSize=1000`);

export function RfqTable() {
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["rfqs"], queryFn: fetchRfqs });
  const requisitionQuery = useQuery({ queryKey: ["requisitions", "rfq-table"], queryFn: fetchRequisitions });
  const rfqs = query.data?.rfqs ?? [];
  const canCreate = useHasRole(["procurement_admin", "approver"]);

  React.useEffect(() => {
    if (query.error instanceof Error) {
      toast({ description: query.error.message, variant: "destructive" });
    }
  }, [query.error, toast]);

  React.useEffect(() => {
    if (requisitionQuery.error instanceof Error) {
      toast({ description: requisitionQuery.error.message, variant: "destructive" });
    }
  }, [requisitionQuery.error, toast]);

  const requisitionsById = React.useMemo(() => {
    const map = new Map<string, Requisition>();
    const requisitions = requisitionQuery.data?.requisitions ?? [];
    for (const requisition of requisitions) {
      map.set(requisition.id, requisition);
    }
    return map;
  }, [requisitionQuery.data?.requisitions]);

  const columns = React.useMemo<ColumnDef<RFQ>[]>(
    () => [
      {
        accessorKey: "rfqNo",
        header: "RFQ",
        cell: ({ row }) => <Link href={`/rfqs/${row.original.id}`} className="text-primary">{row.original.rfqNo}</Link>,
        meta: { label: "RFQ" }
      },
      {
        id: "requisition",
        header: "Requisition",
        cell: ({ row }) => {
          const requisition = requisitionsById.get(row.original.requisitionId);
          if (!requisition) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <Link href={`/requisitions/${requisition.id}`} className="text-primary underline">
              {requisition.reqNo}
            </Link>
          );
        },
        meta: { label: "Requisition" }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        meta: { label: "Status" }
      },
      {
        accessorKey: "dueDate",
        header: "Due",
        cell: ({ row }) => formatDate(row.original.dueDate),
        meta: { label: "Due" }
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
        meta: { label: "Created" }
      }
    ],
    [requisitionsById]
  );

  return (
    <DataTable
      columns={columns}
      data={rfqs}
      page={1}
      pageSize={Math.max(rfqs.length, 1)}
      total={rfqs.length}
      isLoading={query.isLoading || requisitionQuery.isLoading}
      toolbar={
        canCreate ? (
          <Button asChild>
            <Link href="/rfqs/new">New RFQ</Link>
          </Button>
        ) : null
      }
    />
  );
}
