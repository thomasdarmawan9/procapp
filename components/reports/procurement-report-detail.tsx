"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { ProcurementReportRecord } from "@/lib/services/report-service";

type ProcurementReportDetailProps = {
  record: ProcurementReportRecord;
  onExport?: () => void;
};

export function ProcurementReportDetail({ record, onExport }: ProcurementReportDetailProps) {
  const handleExport = React.useCallback(() => {
    if (onExport) {
      onExport();
      return;
    }
    if (typeof window !== "undefined") {
      window.print();
    }
  }, [onExport]);

  return (
    <div className="space-y-6 print:bg-white">
      <div
        className={cn(
          "flex flex-col gap-3 p-4",
          "rounded-md border border-primary/20 bg-primary/5",
          "md:flex-row md:items-center md:justify-between"
        )}
      >
        <div>
          <h1 className="text-xl font-semibold">
            {record.po.poNo} · {formatCurrency(record.po.total, record.po.currency)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Purchase order issued {formatDate(record.po.createdAt)} to {record.vendor?.name ?? "Unknown vendor"}.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Linked requisitions: {record.requisitions.map((req) => req.reqNo).join(", ") || "None"}
          </p>
        </div>
        <Button className="w-full md:w-auto print:hidden" onClick={handleExport}>
          Export to PDF
        </Button>
      </div>

      <Card className="print:border print:shadow-none">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Purchase Order Overview</CardTitle>
            <p className="text-xs text-muted-foreground">Key information for procurement audit and finance.</p>
          </div>
          <StatusBadge status={record.po.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase text-muted-foreground">Purchase Order</h2>
              <dl className="grid grid-cols-3 gap-2 text-sm">
                <dt className="col-span-1 text-muted-foreground">PO Number</dt>
                <dd className="col-span-2 font-medium">{record.po.poNo}</dd>
                <dt className="col-span-1 text-muted-foreground">Status</dt>
                <dd className="col-span-2 capitalize">{record.po.status.replace(/_/g, " ")}</dd>
                <dt className="col-span-1 text-muted-foreground">Total Value</dt>
                <dd className="col-span-2 font-medium">
                  <Money value={record.po.total} currency={record.po.currency} />
                </dd>
                <dt className="col-span-1 text-muted-foreground">Terms</dt>
                <dd className="col-span-2">{record.po.terms}</dd>
                <dt className="col-span-1 text-muted-foreground">Created</dt>
                <dd className="col-span-2">{formatDate(record.po.createdAt)}</dd>
              </dl>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase text-muted-foreground">Vendor</h2>
              {record.vendor ? (
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  <dt className="col-span-1 text-muted-foreground">Name</dt>
                  <dd className="col-span-2 font-medium">{record.vendor.name}</dd>
                  <dt className="col-span-1 text-muted-foreground">Category</dt>
                  <dd className="col-span-2 capitalize">{record.vendor.category.toLowerCase()}</dd>
                  <dt className="col-span-1 text-muted-foreground">Email</dt>
                  <dd className="col-span-2">{record.vendor.email}</dd>
                  <dt className="col-span-1 text-muted-foreground">Phone</dt>
                  <dd className="col-span-2">{record.vendor.phone}</dd>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Vendor information not available.</p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">Line Items</h2>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Item</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 text-right font-medium">Quantity</th>
                    <th className="px-3 py-2 text-right font-medium">Unit Price</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {record.lineItems.map((line) => (
                    <tr key={line.requisitionItemId} className="border-t last:border-b">
                      <td className="px-3 py-2">
                        <div className="font-medium">{line.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Ref #{line.requisitionItemId}
                          {line.uom ? ` · ${line.uom}` : ""}
                        </div>
                      </td>
                      <td className="px-3 py-2 capitalize text-muted-foreground">
                        {line.category ? line.category.toLowerCase() : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">{line.quantity}</td>
                      <td className="px-3 py-2 text-right">
                        <Money value={line.unitPrice} currency={record.po.currency} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Money value={line.total} currency={record.po.currency} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase text-muted-foreground">Requisitions</h2>
              {record.requisitions.map((req) => (
                <div key={req.id} className="rounded-md border border-dashed p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">{req.reqNo}</div>
                    <StatusBadge status={req.status} />
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <dt className="text-muted-foreground">Department</dt>
                    <dd>{req.department}</dd>
                    <dt className="text-muted-foreground">Cost Center</dt>
                    <dd>{req.costCenter}</dd>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{formatDate(req.createdAt)}</dd>
                    <dt className="text-muted-foreground">Total</dt>
                    <dd>
                      <Money value={req.total} />
                    </dd>
                  </dl>
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Approval Trail</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      {req.approvalTrail.map((event) => (
                        <li key={`${event.step}-${event.at}`} className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-medium capitalize">{event.action.replace(/_/g, " ")}</span>
                          <span className="text-muted-foreground">
                            {event.role.replace(/_/g, " ")} · {formatDate(event.at)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase text-muted-foreground">RFQs</h2>
              {record.rfqs.length ? (
                <ul className="space-y-3 text-sm">
                  {record.rfqs.map((rfq) => (
                    <li key={rfq.id} className="rounded-md border border-dashed p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rfq.rfqNo}</span>
                        <StatusBadge status={rfq.status} />
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <dt>Vendors</dt>
                        <dd className="text-foreground">{rfq.vendorCount}</dd>
                        <dt>Quotes</dt>
                        <dd className="text-foreground">{rfq.quoteCount}</dd>
                        <dt>Created</dt>
                        <dd className="text-foreground">{formatDate(rfq.createdAt)}</dd>
                        <dt>Due</dt>
                        <dd className="text-foreground">{formatDate(rfq.dueDate)}</dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No RFQs associated with these procurements.</p>
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
