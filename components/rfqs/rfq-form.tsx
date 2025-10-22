"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { rfqFormSchema } from "@/lib/schemas";
import type { Requisition, Vendor } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

const fetchRequisitions = async (): Promise<{ requisitions: Requisition[] }> => apiFetch("/api/requisitions");
const fetchVendors = async (): Promise<{ vendors: Vendor[] }> => apiFetch("/api/vendors");

export function RfqForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requisitionsQuery = useQuery({ queryKey: ["requisitions"], queryFn: fetchRequisitions });
  const vendorsQuery = useQuery({ queryKey: ["vendors"], queryFn: fetchVendors });

  const form = useForm<z.infer<typeof rfqFormSchema>>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      requisitionId: searchParams?.get("fromReqId") ?? "",
      vendorIds: [],
      dueDate: new Date()
    }
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof rfqFormSchema>) =>
      apiFetch<{ id: string }>("/api/rfqs", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: (rfq: { id: string }) => {
      toast({ description: "RFQ created" });
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      router.push(`/rfqs/${rfq.id}`);
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const approvedRequisitions = requisitionsQuery.data?.requisitions.filter((req) => req.status === "approved" || req.status === "converted") ?? [];
  const vendors = vendorsQuery.data?.vendors ?? [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
        <FormField
          control={form.control}
          name="requisitionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requisition</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select requisition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {approvedRequisitions.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.reqNo} · {req.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vendorIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Vendors</FormLabel>
              <div className="grid gap-2">
                {vendors.map((vendor) => (
                  <label key={vendor.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox
                      checked={field.value?.includes(vendor.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value ?? []), vendor.id]);
                        } else {
                          field.onChange((field.value ?? []).filter((id: string) => id !== vendor.id));
                        }
                      }}
                    />
                    <span>{vendor.name}</span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""} onChange={(event) => field.onChange(new Date(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            Create RFQ
          </Button>
        </div>
      </form>
    </Form>
  );
}
