"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function RootProviders({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
