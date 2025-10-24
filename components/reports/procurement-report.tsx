"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Printer } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProcurementReportRecord } from "@/lib/services/report-service";

type ProcurementReportProps = {
  records: ProcurementReportRecord[];
};

const PAGE_SIZE = 10;

export function ProcurementReport({ records }: ProcurementReportProps) {
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<{ from: string; to: string }>({ from: "", to: "" });
  const [page, setPage] = React.useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const totalValue = React.useMemo(
    () => records.reduce((acc, record) => acc + record.po.total, 0),
    [records]
  );

  const totalRecords = records.length;

  const filteredRecords = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    return records.filter((record) => {
      const createdAt = new Date(record.po.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }
      if (fromDate && createdAt < fromDate) {
        return false;
      }
      if (toDate && createdAt > toDate) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        record.po.poNo,
        record.vendor?.name,
        record.vendor?.category,
        ...record.requisitions.map((req) => req.reqNo),
        ...record.rfqs.map((rfq) => rfq.rfqNo)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [records, search, dateFilter.from, dateFilter.to]);

  const sortedRecords = React.useMemo(() => {
    if (!sorting.length) {
      return filteredRecords;
    }
    const [{ id, desc }] = sorting;
    const direction = desc ? -1 : 1;
    const compare = (a: ProcurementReportRecord, b: ProcurementReportRecord) => {
      switch (id) {
        case "poNo":
          return direction * a.po.poNo.localeCompare(b.po.poNo);
        case "vendor":
          return direction * (a.vendor?.name ?? "").localeCompare(b.vendor?.name ?? "");
        case "status":
          return direction * a.po.status.localeCompare(b.po.status);
        case "total":
          return direction * (a.po.total - b.po.total);
        case "createdAt":
          return direction * (new Date(a.po.createdAt).getTime() - new Date(b.po.createdAt).getTime());
        case "requisitions":
          return direction * (a.requisitions.length - b.requisitions.length);
        default:
          return 0;
      }
    };
    return [...filteredRecords].sort(compare);
  }, [filteredRecords, sorting]);

  const maxPage = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage(1);
  }, [search, dateFilter.from, dateFilter.to]);

  React.useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const pagedRecords = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedRecords.slice(start, start + PAGE_SIZE);
  }, [sortedRecords, page]);

  const handleResetFilters = () => {
    setSearch("");
    setDateFilter({ from: "", to: "" });
  };

  const handleExport = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const columns = React.useMemo<ColumnDef<ProcurementReportRecord>[]>(
    () => [
      {
        id: "poNo",
        header: "PO Number",
        accessorFn: (record) => record.po.poNo,
        cell: ({ row }) => (
          <Link href={`/reports/${row.original.id}`} className="text-primary hover:underline">
            {row.original.po.poNo}
          </Link>
        ),
        meta: { label: "PO Number" }
      },
      {
        id: "vendor",
        header: "Vendor",
        accessorFn: (record) => record.vendor?.name ?? "—",
        cell: ({ row }) => <span>{row.original.vendor?.name ?? "—"}</span>,
        meta: { label: "Vendor" }
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (record) => record.po.status,
        cell: ({ row }) => <StatusBadge status={row.original.po.status} />,
        meta: { label: "Status" }
      },
      {
        id: "total",
        header: "Total",
        accessorFn: (record) => record.po.total,
        cell: ({ row }) => <Money value={row.original.po.total} currency={row.original.po.currency} />,
        meta: { label: "Total Value" }
      },
      {
        id: "createdAt",
        header: "Created",
        accessorFn: (record) => record.po.createdAt,
        cell: ({ row }) => formatDate(row.original.po.createdAt),
        meta: { label: "Created At" }
      },
      {
        id: "requisitions",
        header: "Requisitions",
        accessorFn: (record) => record.requisitions.length,
        cell: ({ row }) => row.original.requisitions.length,
        meta: { label: "Requisition Count" }
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button asChild variant="link" size="sm" className="px-0">
            <Link href={`/reports/${row.original.id}`}>View detail</Link>
          </Button>
        )
      }
    ],
    []
  );

  const toolbar = (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Input
        placeholder="Search by PO, vendor, requisition, RFQ..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="md:w-60"
      />
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateFilter.from}
          onChange={(event) => setDateFilter((prev) => ({ ...prev, from: event.target.value }))}
          className="md:w-40"
        />
        <Input
          type="date"
          value={dateFilter.to}
          onChange={(event) => setDateFilter((prev) => ({ ...prev, to: event.target.value }))}
          className="md:w-40"
        />
      </div>
      <Button variant="outline" size="sm" onClick={handleResetFilters}>
        Reset
      </Button>
      <Button variant="secondary" size="sm" onClick={handleExport} className="print:hidden">
        <Printer className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
        <h1 className="text-lg font-semibold">Procurement Success Report</h1>
        <p className="text-sm text-muted-foreground">
          {filteredRecords.length} of {totalRecords} procurements · {formatCurrency(totalValue)} total spend captured.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={pagedRecords}
        page={page}
        pageSize={PAGE_SIZE}
        total={sortedRecords.length}
        onPaginationChange={(nextPage) => setPage(nextPage)}
        onSortChange={setSorting}
        hideSearch
        toolbar={toolbar}
        emptyMessage="No procurement records match your filters."
      />
    </div>
  );
}
