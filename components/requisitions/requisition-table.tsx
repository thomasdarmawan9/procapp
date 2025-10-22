"use client";

import * as React from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { formatDate } from "@/lib/utils";
import type { Requisition } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

const statusOptions: Requisition["status"][] = ["draft", "submitted", "approved", "rejected", "converted"];

type RequisitionResponse = {
  requisitions: Requisition[];
  page: number;
  pageSize: number;
  total: number;
};

async function fetchRequisitions(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return apiFetch<RequisitionResponse>(`/api/requisitions?${query}`);
}

export function RequisitionTable({ initialData }: { initialData: RequisitionResponse }) {
  const { toast } = useToast();
  const [page, setPage] = React.useState(initialData.page);
  const [pageSize] = React.useState(initialData.pageSize);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [filters, setFilters] = React.useState({ status: "all", search: "" });

  const query = useQuery({
    queryKey: ["requisitions", page, pageSize, sorting, filters],
    queryFn: () =>
      fetchRequisitions({
        page: String(page),
        pageSize: String(pageSize),
        sortBy: sorting[0]?.id ?? "createdAt",
        sortDir: sorting[0]?.desc ? "desc" : "asc",
        status: filters.status === "all" ? "" : filters.status,
        search: filters.search
      }),
    initialData,
    placeholderData: (previousData) => previousData
  });

  React.useEffect(() => {
    if (query.error instanceof Error) {
      toast({ description: query.error.message, variant: "destructive" });
    }
  }, [query.error, toast]);

  const columns = React.useMemo<ColumnDef<Requisition>[]>(
    () => [
      {
        accessorKey: "reqNo",
        header: "Req No",
        cell: ({ row }) => <Link href={`/requisitions/${row.original.id}`} className="font-medium text-primary">{row.original.reqNo}</Link>,
        meta: { label: "Req No" }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        meta: { label: "Status" }
      },
      {
        accessorKey: "department",
        header: "Department",
        meta: { label: "Department" }
      },
      {
        accessorKey: "costCenter",
        header: "Cost Center",
        meta: { label: "Cost Center" }
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

  return (
    <DataTable
      columns={columns}
      data={query.data?.requisitions ?? []}
      page={page}
      pageSize={pageSize}
      total={query.data?.total ?? 0}
      isLoading={query.isFetching}
      onPaginationChange={(nextPage) => setPage(nextPage)}
      onSortChange={(nextSorting) => setSorting(nextSorting)}
      toolbar={
        <div className="flex items-center gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) => {
              setFilters((prev) => ({ ...prev, status: value }));
              setPage(1);
            }}
          >
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
            placeholder="Search..."
            value={filters.search}
            onChange={(event) => { setFilters((prev) => ({ ...prev, search: event.target.value })); setPage(1); }}
            className="w-40"
          />
          <Button asChild variant="outline">
            <Link href="/requisitions/new">New Requisition</Link>
          </Button>
        </div>
      }
      hideSearch
    />
  );
}
