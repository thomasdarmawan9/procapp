"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Download, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  toolbar?: React.ReactNode;
  enableSelection?: boolean;
  hideSearch?: boolean;
};

export function DataTableToolbar<TData>({ table, toolbar, hideSearch }: DataTableToolbarProps<TData>) {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!hideSearch) {
      table.getColumn("search")?.setFilterValue(search);
    }
  }, [search, table, hideSearch]);

  const exportCsv = () => {
    const rows = table.getCoreRowModel().rows;
    if (!rows.length) {
      toast({ description: "No data to export" });
      return;
    }
    const headers = table
      .getAllLeafColumns()
      .filter((column) => column.getIsVisible())
      .map((column) => column.columnDef.meta?.label ?? column.id);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .getVisibleCells()
          .map((cell) => {
            const value = cell.getValue();
            if (typeof value === "string") {
              return `"${value.replace(/"/g, '""')}"`;
            }
            if (value === null || value === undefined) {
              return "";
            }
            return value;
          })
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {!hideSearch ? (
          <Input
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:max-w-xs"
          />
        ) : null}
        {toolbar}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.meta?.label ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
