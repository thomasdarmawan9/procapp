"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/schemas";
import type { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const DEMO_PASSWORD = "welcome123";
  const demoAccounts = [
    { label: "Employee", email: "employee@example.com" },
    { label: "Approver", email: "approver@example.com" },
    { label: "Procurement Admin", email: "procurement@example.com" },
    { label: "Finance", email: "finance@example.com" }
  ] as const;
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "employee@example.com", password: DEMO_PASSWORD }
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const user = await apiFetch<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
      });
      setUser(user);
      queryClient.setQueryData<{ user: User | null }>(["session"], { user });
      queryClient.invalidateQueries({ queryKey: ["session"] }).catch(() => {});
      toast({ description: "Welcome back" });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          Sign In
        </Button>

        <div className="pt-4">
          <p className="mb-2 text-xs text-muted-foreground">Demo accounts (password: {DEMO_PASSWORD})</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {demoAccounts.map((acc) => (
              <Button
                key={acc.email}
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => {
                  form.setValue("email", acc.email, { shouldValidate: true });
                  form.setValue("password", DEMO_PASSWORD, { shouldValidate: true });
                }}
              >
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{acc.label}</span>
                  <span className="text-xs text-muted-foreground">{acc.email}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </form>
    </Form>
  );
}
