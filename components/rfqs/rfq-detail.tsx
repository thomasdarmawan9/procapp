"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteComparisonTable } from "@/components/shared/quote-comparison-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { RFQ, Requisition, Vendor } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RfqDetail({ rfq, requisition, vendors }: { rfq: RFQ; requisition: Requisition | null; vendors: Vendor[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [winner, setWinner] = React.useState<string>(rfq.quotes[0]?.vendorId ?? "");

  const sendMutation = useMutation({
    mutationFn: () => apiFetch(`/api/rfqs/${rfq.id}/send`, { method: "POST" }),
    onSuccess: () => {
      toast({ description: "RFQ sent" });
      queryClient.invalidateQueries({ queryKey: ["rfq", rfq.id] });
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const closeMutation = useMutation({
    mutationFn: () => apiFetch(`/api/rfqs/${rfq.id}/close`, { method: "POST", body: JSON.stringify({ winnerVendorId: winner }) }),
    onSuccess: () => {
      toast({ description: "RFQ closed and PO draft created" });
      queryClient.invalidateQueries({ queryKey: ["rfq", rfq.id] });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const createPoMutation = useMutation({
    mutationFn: () => apiFetch(`/api/rfqs/${rfq.id}/create-po`, { method: "POST", body: JSON.stringify({ vendorId: winner }) }),
    onSuccess: () => {
      toast({ description: "PO draft created" });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const vendorDisplayName = (id: string) => {
    const quoteVendor = rfq.quotes.find((quote) => quote.vendorId === id);
    if (quoteVendor?.vendorName) {
      return quoteVendor.vendorName;
    }
    return vendors.find((vendor) => vendor.id === id)?.name ?? id;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">{rfq.rfqNo}</h2>
          <p className="text-sm text-muted-foreground">Due {formatDate(rfq.dueDate)}</p>
        </div>
        <StatusBadge status={rfq.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Requisition</span>
            <span>{requisition ? requisition.reqNo : rfq.requisitionId}</span>
          </div>
          <div className="flex justify-between"><span>Vendors invited</span><span>{rfq.vendorIds.map(vendorDisplayName).join(", ")}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteComparisonTable quotes={rfq.quotes} getVendorName={vendorDisplayName} />
          {rfq.status === "received" || rfq.status === "sent" ? (
            <div className="mt-4 flex items-center gap-3">
              <Select value={winner} onValueChange={setWinner}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select winner" />
                </SelectTrigger>
                <SelectContent>
                  {rfq.quotes.map((quote) => (
                    <SelectItem key={quote.vendorId} value={quote.vendorId}>
                      {quote.vendorName ?? vendorDisplayName(quote.vendorId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => closeMutation.mutate()} disabled={!winner || closeMutation.isPending}>
                Close RFQ &amp; Create PO
              </Button>
              <Button variant="outline" onClick={() => createPoMutation.mutate()} disabled={!winner || createPoMutation.isPending}>
                Create PO Draft
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {rfq.status === "draft" ? (
          <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
            Send RFQ
          </Button>
        ) : null}
      </div>
    </div>
  );
}
