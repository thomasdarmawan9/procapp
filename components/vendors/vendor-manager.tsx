"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { VendorForm, type VendorFormValues } from "./vendor-form";
import { apiFetch } from "@/lib/api-client";
import type { Vendor } from "@/lib/types";

const fetchVendors = async (): Promise<{ vendors: Vendor[] }> => apiFetch("/api/vendors");

export function VendorManager() {
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vendorsQuery = useQuery({ queryKey: ["vendors"], queryFn: fetchVendors });

  const createMutation = useMutation({
    mutationFn: (values: VendorFormValues) =>
      apiFetch<Vendor>("/api/vendors", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: () => {
      toast({ description: "Vendor created" });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setOpen(false);
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const updateMutation = useMutation({
    mutationFn: (values: VendorFormValues) =>
      apiFetch<Vendor>(`/api/vendors/${editingVendor?.id}`, {
        method: "PUT",
        body: JSON.stringify(values)
      }),
    onSuccess: () => {
      toast({ description: "Vendor updated" });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setOpen(false);
      setEditingVendor(null);
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: (vendor: Vendor) => apiFetch(`/api/vendors/${vendor.id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ description: "Vendor deleted" });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const handleSubmit = async (values: VendorFormValues) => {
    if (editingVendor) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const vendors = vendorsQuery.data?.vendors ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Vendors</h2>
        <Sheet open={open} onOpenChange={(value) => { setOpen(value); if (!value) setEditingVendor(null); }}>
          <SheetTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Vendor
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingVendor ? "Edit Vendor" : "New Vendor"}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <VendorForm
                onSubmit={handleSubmit}
                initialValues={editingVendor ?? undefined}
                onCancel={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>{vendor.rating}/5</TableCell>
                  <TableCell>{vendor.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingVendor(vendor); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(vendor)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!vendors.length ? <p className="pt-4 text-center text-sm text-muted-foreground">No vendors yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
