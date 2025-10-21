"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

async function postApproval(payload: { requisitionId: string; action: "approved" | "returned"; comment?: string }) {
  const response = await fetch("/api/approvals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Approval failed");
  }
  return response.json();
}

export function ApproverActions({ requisitionId }: { requisitionId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<"approved" | "returned">("approved");

  const mutation = useMutation({
    mutationFn: postApproval,
    onSuccess: () => {
      toast({ description: "Action recorded" });
      queryClient.invalidateQueries({ queryKey: ["requisition", requisitionId] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      setComment("");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    mutation.mutate({ requisitionId, action: actionType, comment });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => mutation.mutate({ requisitionId, action: "approved" })} disabled={mutation.isPending}>
        Approve
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setActionType("returned")}>Return</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return with Comment</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Provide a reason"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={mutation.isPending}>
              Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
