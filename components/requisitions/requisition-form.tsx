"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vendorCategoryEnum, requisitionFormSchema } from "@/lib/schemas";
import { FileUploader } from "@/components/shared/file-uploader";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Vendor, Requisition } from "@/lib/types";

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

const defaultItem = {
  description: "",
  quantity: 1,
  uom: "unit",
  unitPrice: 0,
  currency: "IDR",
  category: "IT"
} as const;

type RequisitionFormValues = z.infer<typeof requisitionFormSchema>;

type Props = {
  defaultValues?: Partial<RequisitionFormValues>;
  requisitionId?: string;
  mode?: "create" | "edit";
};

const fetchVendors = async (): Promise<{ vendors: Vendor[] }> => apiFetch("/api/vendors");
const fetchBudgets = async (): Promise<{ budgets: BudgetSummary[] }> => apiFetch("/api/budgets");

export function RequisitionForm({ defaultValues, requisitionId, mode = "create" }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const vendorsQuery = useQuery({ queryKey: ["vendors"], queryFn: fetchVendors });
  const budgetsQuery = useQuery({ queryKey: ["budgets"], queryFn: fetchBudgets });

  const form = useForm<RequisitionFormValues>({
    resolver: zodResolver(requisitionFormSchema),
    defaultValues: {
      department: "",
      costCenter: "",
      neededBy: new Date(),
      notes: "",
      items: [{ ...defaultItem }],
      attachments: [],
      ...defaultValues
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const onSubmit = async (values: RequisitionFormValues) => {
    const payload = {
      ...values,
      items: values.items.map((item) => ({
        ...item,
        vendorPreferenceId: item.vendorPreferenceId || undefined
      }))
    } satisfies RequisitionFormValues;
    try {
      if (mode === "create") {
        const result = await apiFetch<Requisition>("/api/requisitions", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        toast({ description: "Requisition created" });
        router.push(`/requisitions/${result.id}`);
      } else if (requisitionId) {
        await apiFetch(`/api/requisitions/${requisitionId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        toast({ description: "Requisition updated" });
        router.push(`/requisitions/${requisitionId}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message, variant: "destructive" });
      }
    }
  };

  const costCenterValue = form.watch("costCenter");

  const budgetInfo = React.useMemo(() => {
    if (!costCenterValue?.trim() || !budgetsQuery.data?.budgets) {
      return null;
    }
    return budgetsQuery.data.budgets.find((budget) => budget.costCenter === costCenterValue.trim()) ?? null;
  }, [budgetsQuery.data, costCenterValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Center</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  {costCenterValue
                    ? budgetsQuery.isLoading
                      ? "Checking budget..."
                      : budgetsQuery.isError
                        ? "Budget information unavailable."
                        : budgetInfo
                          ? `Budget ${budgetInfo.period}: ${formatCurrency(budgetInfo.amount, budgetInfo.currency)} · Remaining ${formatCurrency(Math.max(budgetInfo.remaining, 0), budgetInfo.currency)}`
                          : "No budget configured for this cost center."
                    : "Enter the cost center code for this requisition."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="neededBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Needed By</FormLabel>
                <FormControl>
                  <Input type="date" value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""} onChange={(event) => field.onChange(new Date(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Line Items</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ ...defaultItem })}
            >
              Add Item
            </Button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-md border p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.category`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendorCategoryEnum.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                    name={`items.${index}.uom`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UoM</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.currency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.vendorPreferenceId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Vendor</FormLabel>
                        <Select
                          value={field.value ?? "none"}
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {vendorsQuery.data?.vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end">
                    <Button variant="ghost" type="button" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <FileUploader value={field.value ?? []} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
