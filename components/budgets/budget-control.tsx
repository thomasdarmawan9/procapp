"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { TrendingDown, TrendingUp, Settings, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type BudgetSummary = {
  id: string;
  name: string;
  costCenter: string;
  amount: number;
  currency: string;
  period: string;
  usage: number;
  remaining: number;
};

type EnrichedBudget = BudgetSummary & {
  utilization: number;
  status: "healthy" | "at_risk" | "over" | "inactive";
};

const PAGE_SIZE = 8;

const fetchBudgets = async (): Promise<{ budgets: BudgetSummary[] }> => apiFetch("/api/budgets");

const statusConfig: Record<EnrichedBudget["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  healthy: { label: "On Track", variant: "secondary" },
  at_risk: { label: "At Risk", variant: "default" },
  over: { label: "Over Budget", variant: "destructive" },
  inactive: { label: "Not In Use", variant: "outline" }
};

export function BudgetControl() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<EnrichedBudget["status"] | "all">("all");
  const [page, setPage] = React.useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "remaining", desc: true }]);

  const { data, isLoading, isError, error } = useQuery({ queryKey: ["budgets"], queryFn: fetchBudgets });

  React.useEffect(() => {
    if (isError && error instanceof Error) {
      toast({ description: error.message, variant: "destructive" });
    }
  }, [isError, error, toast]);

  const budgets: EnrichedBudget[] = React.useMemo(() => {
    return (data?.budgets ?? []).map((budget) => {
      const utilization = budget.amount > 0 ? budget.usage / budget.amount : 0;
      let status: EnrichedBudget["status"] = "healthy";
      if (budget.amount === 0 || (budget.amount > 0 && budget.usage === 0)) {
        status = "inactive";
      } else if (budget.remaining < 0) {
        status = "over";
      } else if (utilization >= 0.8) {
        status = "at_risk";
      }
      return {
        ...budget,
        utilization,
        status
      };
    });
  }, [data?.budgets]);

  const totals = React.useMemo(() => {
    const totalAmount = budgets.reduce((acc, item) => acc + item.amount, 0);
    const totalUsage = budgets.reduce((acc, item) => acc + item.usage, 0);
    const totalRemaining = budgets.reduce((acc, item) => acc + item.remaining, 0);
    const activeBudgets = budgets.filter((item) => item.status !== "inactive").length;
    return { totalAmount, totalUsage, totalRemaining, activeBudgets, count: budgets.length };
  }, [budgets]);

  const filteredBudgets = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return budgets.filter((budget) => {
      if (statusFilter !== "all" && budget.status !== statusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        budget.name.toLowerCase().includes(term) ||
        budget.costCenter.toLowerCase().includes(term) ||
        budget.period.toLowerCase().includes(term)
      );
    });
  }, [budgets, search, statusFilter]);

  const sortedBudgets = React.useMemo(() => {
    if (!sorting.length) {
      return filteredBudgets;
    }
    const [{ id, desc }] = sorting;
    const direction = desc ? -1 : 1;
    const compare = (a: EnrichedBudget, b: EnrichedBudget) => {
      switch (id) {
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "costCenter":
          return direction * a.costCenter.localeCompare(b.costCenter);
        case "amount":
          return direction * (a.amount - b.amount);
        case "usage":
          return direction * (a.usage - b.usage);
        case "remaining":
          return direction * (a.remaining - b.remaining);
        case "utilization":
          return direction * (a.utilization - b.utilization);
        default:
          return 0;
      }
    };
    return [...filteredBudgets].sort(compare);
  }, [filteredBudgets, sorting]);

  const maxPage = Math.max(1, Math.ceil(sortedBudgets.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  React.useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const pagedBudgets = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedBudgets.slice(start, start + PAGE_SIZE);
  }, [sortedBudgets, page]);

  const columns = React.useMemo<ColumnDef<EnrichedBudget>[]>(
    () => [
      {
        id: "name",
        header: "Cost Center",
        accessorFn: (budget) => budget.name,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.costCenter}</p>
          </div>
        ),
        meta: { label: "Cost Center" }
      },
      {
        id: "period",
        header: "Period",
        accessorFn: (budget) => budget.period,
        cell: ({ row }) => row.original.period,
        meta: { label: "Budget Period" }
      },
      {
        id: "amount",
        header: "Budget",
        accessorFn: (budget) => budget.amount,
        cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
        meta: { label: "Total Budget" }
      },
      {
        id: "usage",
        header: "Committed",
        accessorFn: (budget) => budget.usage,
        cell: ({ row }) => formatCurrency(row.original.usage, row.original.currency),
        meta: { label: "Committed Amount" }
      },
      {
        id: "remaining",
        header: "Remaining",
        accessorFn: (budget) => budget.remaining,
        cell: ({ row }) => (
          <span className={row.original.remaining < 0 ? "font-medium text-destructive" : undefined}>
            {formatCurrency(row.original.remaining, row.original.currency)}
          </span>
        ),
        meta: { label: "Remaining Budget" }
      },
      {
        id: "utilization",
        header: "Utilisation",
        accessorFn: (budget) => budget.utilization,
        cell: ({ row }) => (
          <span>{(row.original.utilization * 100).toFixed(0)}%</span>
        ),
        meta: { label: "Utilisation Percentage" }
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (budget) => budget.status,
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status];
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
        meta: { label: "Status" }
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button asChild variant="link" size="sm" className="px-0">
            <Link href={`/settings/approval-rules?costCenter=${encodeURIComponent(row.original.costCenter)}`}>
              Adjust rules
            </Link>
          </Button>
        )
      }
    ],
    []
  );

  const toolbar = (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Input
        placeholder="Search cost center or period..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="md:w-56"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          type="button"
          variant={statusFilter === "healthy" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("healthy")}
        >
          On Track
        </Button>
        <Button
          type="button"
          variant={statusFilter === "at_risk" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("at_risk")}
        >
          At Risk
        </Button>
        <Button
          type="button"
          variant={statusFilter === "over" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("over")}
        >
          Over Budget
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading budget data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(totals.totalAmount)}</p>
            <p className="text-sm text-muted-foreground">
              {totals.count} cost centres · {formatCurrency(totals.totalUsage)} committed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Remaining Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${totals.totalRemaining < 0 ? "text-destructive" : ""}`}>
              {formatCurrency(totals.totalRemaining)}
            </p>
            <p className="text-sm text-muted-foreground">
              {totals.activeBudgets} active centres monitoring spend
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-slate-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/approval-rules">Manage approval rules</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/requisitions/new">Create new requisition</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Adjust approval thresholds or start a requisition against a monitored cost centre.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Budget Control</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track active cost centres, utilisation, and remaining capacity. Filter to focus on at-risk budgets.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {sortedBudgets.length} results · page {page} of {maxPage}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={pagedBudgets}
            page={page}
            pageSize={PAGE_SIZE}
            total={sortedBudgets.length}
            onPaginationChange={(nextPage) => setPage(nextPage)}
            onSortChange={setSorting}
            toolbar={toolbar}
            hideSearch
            emptyMessage="No budgets found for the selected filters."
          />
        </CardContent>
      </Card>
    </div>
  );
}
