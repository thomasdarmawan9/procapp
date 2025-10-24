"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Money } from "@/components/shared/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { FileUploader } from "@/components/shared/file-uploader";
import { useToast } from "@/components/ui/use-toast";
import { useHasRole } from "@/hooks/use-session";
import { ApiError, apiFetch } from "@/lib/api-client";
import type { FileMeta, PO, POStatus, Requisition } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PoDetail({ po, requisitions }: { po: PO; requisitions: Requisition[] }) {
  const { toast } = useToast();
  const canManage = useHasRole(["procurement_admin", "finance"]);
  const [currentPo, setCurrentPo] = React.useState(po);
  const [status, setStatus] = React.useState<POStatus>(po.status);
  const [proofs, setProofs] = React.useState<FileMeta[]>(() => [...(po.paymentProofs ?? [])]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const statusOptions: POStatus[] = ["draft", "in_progress", "issued", "partially_received", "closed", "canceled"];
  const isLocked = currentPo.status === "closed" || currentPo.status === "canceled";
  const canEdit = isHydrated ? canManage && !isLocked : false;

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    setCurrentPo(po);
    setStatus(po.status);
    setProofs([...(po.paymentProofs ?? [])]);
  }, [po]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiFetch<PO>(`/api/pos/${po.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          paymentProofs: proofs
        })
      });
      setCurrentPo(updated);
      setStatus(updated.status);
      setProofs(updated.paymentProofs ? [...updated.paymentProofs] : []);
      toast({ description: "Purchase order updated" });
    } catch (error) {
      toast({
        description: error instanceof ApiError ? error.message : "Failed to update purchase order",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderProofList = (files?: FileMeta[]) =>
    files && files.length ? (
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <a href={file.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {file.name}
            </a>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">No proof uploaded.</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">{currentPo.poNo}</h2>
          <p className="text-sm text-muted-foreground">Created {formatDate(currentPo.createdAt)} · Terms {currentPo.terms}</p>
        </div>
        <StatusBadge status={currentPo.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status &amp; Payment</CardTitle>
          <CardDescription>
            {canEdit
              ? "Only procurement admin and finance can make updates."
              : isLocked
                ? "This purchase order is closed or canceled and cannot be edited."
                : "View current status and payment proof."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="po-status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as POStatus)}>
                  <SelectTrigger id="po-status" className="w-56">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proof of Payment</Label>
                <FileUploader value={proofs} onChange={(next) => setProofs(next)} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                <div className="mt-2">
                  <StatusBadge status={currentPo.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proof of Payment</p>
                <div className="mt-2">{renderProofList(currentPo.paymentProofs)}</div>
              </div>
              {isHydrated && canManage && isLocked ? (
                <p className="text-xs text-muted-foreground">Further changes are disabled once a PO is closed or canceled.</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPo.lines.map((line) => (
                <TableRow key={line.requisitionItemId}>
                  <TableCell>{line.requisitionItemId}</TableCell>
                  <TableCell>{line.quantity}</TableCell>
                  <TableCell>
                    <Money value={line.unitPrice} />
                  </TableCell>
                  <TableCell>
                    <Money value={line.total} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Requisitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {requisitions.length ? (
            requisitions.map((req) => (
              <div key={req.id} className="flex justify-between">
                <span>{req.reqNo}</span>
                <span>{formatDate(req.createdAt)}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No linked requisitions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
