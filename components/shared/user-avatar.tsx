"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/types";

export function UserAvatar({ user, className }: { user: User; className?: string }) {
  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={className}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
