"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { RFQ } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useHasRole } from "@/hooks/use-session";

const fetchRfqs = async (): Promise<{ rfqs: RFQ[] }> => apiFetch("/api/rfqs");

export function RfqTable() {
  const query = useQuery({ queryKey: ["rfqs"], queryFn: fetchRfqs });
  const rfqs = query.data?.rfqs ?? [];
  const canCreate = useHasRole(["procurement_admin", "approver"]);

  const columns: ColumnDef<RFQ>[] = [
    {
      accessorKey: "rfqNo",
      header: "RFQ",
      cell: ({ row }) => <Link href={`/rfqs/${row.original.id}`} className="text-primary">{row.original.rfqNo}</Link>,
      meta: { label: "RFQ" }
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
  ];

  return (
    <DataTable
      columns={columns}
      data={rfqs}
      page={1}
      pageSize={Math.max(rfqs.length, 1)}
      total={rfqs.length}
      isLoading={query.isLoading}
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
