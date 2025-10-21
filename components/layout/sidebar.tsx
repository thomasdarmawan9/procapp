"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-config";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";

export function Sidebar({ className }: { className?: string } = {}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  const items = NAV_ITEMS.filter((item) => {
    if (!item.roles || !user) return !item.roles;
    return item.roles.includes(user.role);
  });

  return (
    <aside className={cn("w-64 flex-shrink-0 border-r bg-muted/20 p-4", className)}>
      <div className="mb-6 text-lg font-semibold">Procurement</div>
      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {t(item.labelKey as any)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
