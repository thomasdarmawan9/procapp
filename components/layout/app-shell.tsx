"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { useSession } from "@/hooks/use-session";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useTranslation } from "@/hooks/use-translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function AppShell({ children, initialUser }: React.PropsWithChildren<{ initialUser: User }>) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = React.useState(false);
  useSession();
  const router = useRouter();
  const locale = usePreferencesStore((state) => state.locale);
  const setLocale = usePreferencesStore((state) => state.setLocale);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
    } catch (error) {
      console.error("Failed to clear session", error);
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="hidden lg:block" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="m-2 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar className="block" />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">{t('app.title')}</h1>
            {user ? <p className="text-sm text-muted-foreground">Logged in as {user.name}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {user ? <UserAvatar user={user} /> : null}
            <Select value={locale} onValueChange={(value) => setLocale(value as 'en' | 'id')}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="id">ID</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Toggle Theme
            </Button>
            {user ? (
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
            ) : null}
          </div>
        </header>
        <main className={cn("flex-1 bg-muted/10 p-4")}>{children}</main>
      </div>
    </div>
  );
}
