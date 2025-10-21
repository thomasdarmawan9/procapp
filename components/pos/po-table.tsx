"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { formatDate } from "@/lib/utils";
import type { PO } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

const statusOptions: PO["status"][] = ["draft", "issued", "partially_received", "closed", "canceled"];

type PoResponse = {
  pos: PO[];
};

async function fetchPos() {
  return apiFetch<PoResponse>("/api/pos");
}

export function PoTable() {
  const { toast } = useToast();
  const [filter, setFilter] = React.useState({ status: "all", search: "" });

  const query = useQuery({ queryKey: ["pos"], queryFn: fetchPos });

  React.useEffect(() => {
    if (query.error instanceof Error) {
      toast({ description: query.error.message, variant: "destructive" });
    }
  }, [query.error, toast]);

  const filtered = React.useMemo(() => {
    const list = query.data?.pos ?? [];
    return list
      .filter((po) => (filter.status !== "all" ? po.status === filter.status : true))
      .filter((po) =>
        filter.search
          ? po.poNo.toLowerCase().includes(filter.search.toLowerCase())
          : true
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [query.data?.pos, filter]);

  const columns = React.useMemo<ColumnDef<PO>[]>(
    () => [
      {
        accessorKey: "poNo",
        header: "PO Number",
        cell: ({ row }) => <Link href={`/pos/${row.original.id}`} className="text-primary">{row.original.poNo}</Link>,
        meta: { label: "PO Number" }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        meta: { label: "Status" }
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <Money value={row.original.total} />,
        meta: { label: "Total" }
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
        meta: { label: "Created" }
      }
    ],
    []
  );

  const pageSize = Math.max(filtered.length, 1);

  return (
    <DataTable
      columns={columns}
      data={filtered}
      page={1}
      pageSize={pageSize}
      total={filtered.length}
      isLoading={query.isLoading}
      toolbar={
        <div className="flex items-center gap-2">
          <Select value={filter.status} onValueChange={(value) => setFilter((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search PO"
            value={filter.search}
            onChange={(event) => setFilter((prev) => ({ ...prev, search: event.target.value }))}
            className="w-40"
          />
        </div>
      }
    />
  );
}
