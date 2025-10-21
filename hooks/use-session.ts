"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { Role, User } from "@/lib/types";

type SessionResponse = {
  user: User | null;
};

const fetchSession = async (): Promise<SessionResponse> => {
  const res = await fetch("/api/auth/session", {
    credentials: "include"
  });
  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }
  return res.json();
};

export const useSession = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const query = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 1000 * 60 * 5
  });

  useEffect(() => {
    if (query.data?.user) {
      setUser(query.data.user);
    }
  }, [query.data, setUser]);

  return { user: user ?? null, ...query };
};

export const useHasRole = (roles: Role | Role[]) => {
  return useAuthStore((state) => state.hasRole(roles));
};
