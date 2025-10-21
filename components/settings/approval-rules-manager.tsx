"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { RuleBuilder, type RuleBuilderValue } from "@/components/shared/rule-builder";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api-client";
import type { ApprovalRule } from "@/lib/types";

const fetchRules = async (): Promise<{ rules: ApprovalRule[] }> => apiFetch("/api/approval-rules");

const emptyRule: RuleBuilderValue = {
  amountGte: undefined,
  category: undefined,
  costCenter: undefined,
  steps: [{ order: 1, role: "approver" }]
};

export function ApprovalRulesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<ApprovalRule | null>(null);
  const [name, setName] = React.useState("");
  const [builder, setBuilder] = React.useState<RuleBuilderValue>(emptyRule);

  const { data } = useQuery({ queryKey: ["approval-rules"], queryFn: fetchRules });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<ApprovalRule>("/api/approval-rules", {
        method: "POST",
        body: JSON.stringify({
          name,
          conditions: {
            amountGte: builder.amountGte,
            category: builder.category || undefined,
            costCenter: builder.costCenter || undefined
          },
          steps: builder.steps
        })
      }),
    onSuccess: () => {
      toast({ description: "Rule created" });
      queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch<ApprovalRule>(`/api/approval-rules/${editingRule?.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          conditions: {
            amountGte: builder.amountGte,
            category: builder.category || undefined,
            costCenter: builder.costCenter || undefined
          },
          steps: builder.steps
        })
      }),
    onSuccess: () => {
      toast({ description: "Rule updated" });
      queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/approval-rules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ description: "Rule removed" });
      queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
    },
    onError: (error: Error) => toast({ description: error.message, variant: "destructive" })
  });

  const rules = data?.rules ?? [];

  const resetForm = () => {
    setEditingRule(null);
    setBuilder(emptyRule);
    setName("");
  };

  const handleOpen = (rule?: ApprovalRule) => {
    if (rule) {
      setEditingRule(rule);
      setName(rule.name);
      setBuilder({
        amountGte: rule.conditions.amountGte,
        category: rule.conditions.category,
        costCenter: rule.conditions.costCenter,
        steps: rule.steps
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Approval Rules</h2>
        <Sheet open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm(); }}>
          <SheetTrigger asChild>
            <Button onClick={() => handleOpen()}>
              <Plus className="mr-2 h-4 w-4" /> New Rule
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingRule ? "Edit Rule" : "New Rule"}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <RuleBuilder value={builder} onChange={setBuilder} />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => (editingRule ? updateMutation.mutate() : createMutation.mutate())} disabled={!name.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Rules</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.name}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {rule.conditions.amountGte ? <div>Amount ≥ {rule.conditions.amountGte.toLocaleString()}</div> : null}
                      {rule.conditions.category ? <div>Category: {rule.conditions.category}</div> : null}
                      {rule.conditions.costCenter ? <div>Cost Center: {rule.conditions.costCenter}</div> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {rule.steps.map((step) => (
                        <div key={step.order}>
                          Step {step.order}: {step.role.replace("_", " ")}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(rule)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!rules.length ? <p className="pt-4 text-center text-sm text-muted-foreground">No approval rules defined.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
