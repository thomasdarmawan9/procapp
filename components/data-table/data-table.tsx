"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { DataTableToolbar } from "./data-table-toolbar";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  page: number;
  pageSize: number;
  total: number;
  isLoading?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSortChange?: (sorting: SortingState) => void;
  enableSelection?: boolean;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  hideSearch?: boolean;
};

export function DataTable<TData>({
  columns,
  data,
  page,
  pageSize,
  total,
  isLoading,
  onPaginationChange,
  onSortChange,
  enableSelection,
  toolbar,
  emptyMessage = "No data found",
  hideSearch
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(sorting)
          : updater;
      setSorting(next);
      onSortChange?.(next);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize)
  });

  React.useEffect(() => {
    table.setPageIndex(page - 1);
    table.setPageSize(pageSize);
  }, [page, pageSize, table]);

  const handleNext = () => {
    const nextPage = Math.min(page + 1, Math.ceil(total / pageSize));
    onPaginationChange?.(nextPage, pageSize);
  };

  const handlePrev = () => {
    const prevPage = Math.max(page - 1, 1);
    onPaginationChange?.(prevPage, pageSize);
  };

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} toolbar={toolbar} enableSelection={enableSelection} hideSearch={hideSearch} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex cursor-pointer select-none items-center gap-2"
                            : undefined
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="h-4 w-4" />}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · Showing {(page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DataTableSelectionHeader({
  table
}: {
  table: ReturnType<typeof useReactTable<any>>;
}) {
  if (!table.options.enableRowSelection) {
    return null;
  }
  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all rows"
    />
  );
}
