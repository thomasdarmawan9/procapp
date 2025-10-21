"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApprovalRoleStep } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vendorCategoryEnum } from "@/lib/schemas";

const roleOptions: ApprovalRoleStep[] = ["approver", "finance", "procurement_admin"];

export type RuleBuilderValue = {
  amountGte?: number;
  category?: string;
  costCenter?: string;
  steps: { order: number; role: ApprovalRoleStep }[];
};

export function RuleBuilder({ value, onChange }: { value: RuleBuilderValue; onChange: (value: RuleBuilderValue) => void }) {
  const updateSteps = (steps: RuleBuilderValue["steps"]) => onChange({ ...value, steps });

  const addStep = () => {
    const role = roleOptions.find((option) => !value.steps.some((step) => step.role === option)) ?? "approver";
    updateSteps([...value.steps, { order: value.steps.length + 1, role }]);
  };

  const updateCondition = (key: keyof RuleBuilderValue, val: string | number | undefined) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Conditions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ≥</Label>
            <Input id="amount" type="number" value={value.amountGte ?? ""} onChange={(event) => updateCondition("amountGte", event.target.value ? Number(event.target.value) : undefined)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={value.category ?? ""} onValueChange={(item) => updateCondition("category", item)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {vendorCategoryEnum.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="costCenter">Cost Center</Label>
            <Input id="costCenter" value={value.costCenter ?? ""} onChange={(event) => updateCondition("costCenter", event.target.value || undefined)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Approval Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.steps.map((step, index) => (
            <div key={step.order} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center">
              <div className="text-sm font-semibold">Step {index + 1}</div>
              <Select
                value={step.role}
                onValueChange={(role) => {
                  const next = value.steps.map((item, idx) =>
                    idx === index ? { ...item, role: role as ApprovalRoleStep } : item
                  );
                  updateSteps(next);
                }}
              >
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                type="button"
                onClick={() => updateSteps(value.steps.filter((_, idx) => idx !== index))}
                disabled={value.steps.length <= 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" type="button" onClick={addStep}>
            Add Step
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
