"use client";

import { formatCurrency } from "@/lib/utils";

export function Money({ value, currency = "IDR" }: { value: number; currency?: string }) {
  return <span>{formatCurrency(value, currency)}</span>;
}
