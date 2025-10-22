"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loginSchema } from "@/lib/schemas";
import type { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/lib/types";

const roleOptions = [
  { label: "Employee", value: "employee" },
  { label: "Approver", value: "approver" },
  { label: "Procurement Admin", value: "procurement_admin" },
  { label: "Finance", value: "finance" }
] as const;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "employee@example.com", role: "employee" }
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const user = await apiFetch<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
      });
      setUser(user);
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          Sign In
        </Button>
      </form>
    </Form>
  );
}
