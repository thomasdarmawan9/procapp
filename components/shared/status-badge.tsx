"use client";

import { Badge } from "@/components/ui/badge";
import type { POStatus, RequisitionStatus, RfqStatus } from "@/lib/types";

const statusColorMap: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  submitted: "default",
  approved: "default",
  rejected: "outline",
  converted: "default",
  sent: "default",
  received: "default",
  closed: "secondary",
  issued: "default",
  partially_received: "default",
  canceled: "outline"
};

const statusLabelMap: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Returned",
  converted: "Converted",
  sent: "Sent",
  received: "Quotes Received",
  closed: "Closed",
  issued: "Issued",
  partially_received: "Partially Received",
  canceled: "Canceled"
};

export function StatusBadge({ status }: { status: RequisitionStatus | RfqStatus | POStatus }) {
  const variant = statusColorMap[status] ?? "secondary";
  const label = statusLabelMap[status] ?? status;
  return <Badge variant={variant}>{label}</Badge>;
}
