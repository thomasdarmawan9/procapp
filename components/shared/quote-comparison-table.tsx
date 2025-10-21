"use client";

import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export function QuoteComparisonTable({ quotes, getVendorName }: { quotes: Quote[]; getVendorName?: (vendorId: string) => string }) {
  if (!quotes.length) {
    return <p className="text-sm text-muted-foreground">No quotes received yet.</p>;
  }

  const bestPrice = Math.min(...quotes.map((quote) => quote.total));
  const bestLeadTime = Math.min(...quotes.map((quote) => quote.leadTimeDays));

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Lead Time (Days)</TableHead>
            <TableHead>Payment Terms</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => {
            const highlightPrice = quote.total === bestPrice;
            const highlightLead = quote.leadTimeDays === bestLeadTime;
            const displayName = quote.vendorName ?? (getVendorName ? getVendorName(quote.vendorId) : quote.vendorId);
            return (
              <TableRow key={quote.vendorId} className="text-sm">
                <TableCell className="font-medium">
                  <div>{displayName}</div>
                  {quote.vendorCompany ? <div className="text-xs text-muted-foreground">{quote.vendorCompany}</div> : null}
                  {quote.vendorEmail ? <div className="text-xs text-muted-foreground">{quote.vendorEmail}</div> : null}
                </TableCell>
                <TableCell className={cn(highlightPrice && "font-semibold text-emerald-600")}>{formatCurrency(quote.total)}</TableCell>
                <TableCell className={cn(highlightLead && "font-semibold text-emerald-600")}>{quote.leadTimeDays}</TableCell>
                <TableCell>{quote.paymentTerms}</TableCell>
                <TableCell>{quote.notes ?? "-"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
