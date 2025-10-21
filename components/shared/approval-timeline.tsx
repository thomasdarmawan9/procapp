"use client";

import { CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ApprovalEvent, ApprovalRuleStep } from "@/lib/types";

function getStepStatus(step: ApprovalRuleStep, events: ApprovalEvent[]) {
  const event = events.find((item) => item.step === step.order && item.role === step.role);
  if (!event) {
    return { status: "pending" as const };
  }
  if (event.action === "approved") {
    return { status: "approved" as const, event };
  }
  if (event.action === "returned" || event.action === "rejected") {
    return { status: "returned" as const, event };
  }
  return { status: "pending" as const, event };
}

export function ApprovalTimeline({
  title = "Approval Timeline",
  steps,
  events
}: {
  title?: string;
  steps: ApprovalRuleStep[];
  events: ApprovalEvent[];
}) {
  if (!steps.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => {
          const { status, event } = getStepStatus(step, events);
          const icon =
            status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : status === "returned" ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Clock3 className="h-5 w-5 text-muted-foreground" />
            );

          return (
            <div key={`${step.order}-${step.role}`} className="flex items-start gap-3">
              <div className="mt-1">{icon}</div>
              <div>
                <p className="text-sm font-medium capitalize">
                  Step {step.order}: {step.role.replace("_", " ")}
                </p>
                {event ? (
                  <div className="text-sm text-muted-foreground">
                    <p>Action: {event.action}</p>
                    {event.comment ? <p>Comment: {event.comment}</p> : null}
                    {event.at ? <p>{formatDate(event.at)}</p> : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Pending</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
